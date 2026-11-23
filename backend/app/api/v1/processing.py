import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.entities import User, Document, DocumentPage, OCRResult, ExtractedField, ExtractionRun, ValidationResult
from app.services.ocr.ocr_service import ocr_service
from app.services.classification.classifier_service import classifier_service
from app.services.extraction.groq_service import groq_extraction_service
from app.services.confidence.confidence_service import confidence_service
from app.services.validation.validation_service import validation_service

router = APIRouter(prefix="/documents", tags=["Processing"])

@router.post("/{document_id}/process")
async def process_document_pipeline(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Executes the complete End-to-End AI Document Intelligence Pipeline:
    1. Status: processing -> OCR extraction (PyMuPDF / hybrid)
    2. Status: ocr_completed -> Multi-signal classification
    3. Status: extracting -> Groq AI extraction + Schema validation
    4. Field-level confidence scoring & Evidence mapping
    5. Business rule validation
    6. Review status assignment (review_required vs approved)
    """
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.organization_id == current_user.organization_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    pipeline_start = time.time()
    doc.status = "processing"
    db.commit()

    try:
        # Step 1: OCR Extraction
        full_text, tokens, total_pages, avg_conf, ocr_duration = ocr_service.process_document(
            doc.file_path, doc.mime_type
        )
        doc.total_pages = total_pages
        
        # Clear prior runs if re-processing
        db.query(OCRResult).filter(OCRResult.document_id == doc.id).delete()
        db.query(ExtractedField).filter(ExtractedField.document_id == doc.id).delete()
        db.query(ValidationResult).filter(ValidationResult.document_id == doc.id).delete()

        ocr_rec = OCRResult(
            document_id=doc.id,
            page_number=1,
            full_text=full_text,
            tokens_json=tokens,
            ocr_engine="hybrid-pymupdf",
            avg_confidence=avg_conf,
            duration_seconds=ocr_duration
        )
        db.add(ocr_rec)
        doc.status = "ocr_completed"
        db.commit()

        # Step 2: Classification
        cat, cat_conf, cat_exp = classifier_service.classify(full_text, doc.original_name)
        doc.category = cat
        doc.classification_confidence = cat_conf
        doc.classification_explanation = cat_exp
        doc.status = "extracting"
        db.commit()

        # Step 3: Groq LLM Extraction
        extracted_dict, raw_llm_resp, extract_duration = await groq_extraction_service.extract(full_text, cat)
        
        ext_run = ExtractionRun(
            document_id=doc.id,
            model_name="groq-llama-3.3-70b",
            raw_response=raw_llm_resp,
            structured_json=extracted_dict,
            duration_seconds=extract_duration
        )
        db.add(ext_run)

        # Step 4: Confidence Scoring & Field Persistence
        needs_review_count = 0
        for f_name, f_data in extracted_dict.items():
            if not isinstance(f_data, dict):
                continue
            
            val_status, req_review = confidence_service.evaluate_field(f_name, f_data)
            if req_review:
                needs_review_count += 1

            field_obj = ExtractedField(
                document_id=doc.id,
                field_name=f_name,
                field_label=f_name.replace("_", " ").title(),
                extracted_value=str(f_data.get("value", "")),
                current_value=str(f_data.get("value", "")),
                confidence=float(f_data.get("confidence", 0.0)),
                page=int(f_data.get("page", 1)),
                source_text=f_data.get("source_text"),
                bounding_box=f_data.get("bounding_box"),
                validation_status=val_status,
                review_required=req_review
            )
            db.add(field_obj)

        # Step 5: Business Rule Validation
        val_checks = validation_service.validate_document(cat, extracted_dict)
        for check in val_checks:
            v_res = ValidationResult(
                document_id=doc.id,
                rule_name=check["rule_name"],
                severity=check["severity"],
                message=check["message"],
                passed=check["passed"]
            )
            db.add(v_res)

        # Step 6: Final Workflow Status
        if needs_review_count > 0 or cat_conf < 0.70 or any(not c["passed"] and c["severity"] == "error" for c in val_checks):
            doc.status = "review_required"
        else:
            doc.status = "approved"

        doc.processing_duration = round(time.time() - pipeline_start, 3)
        doc.processing_error = None
        db.commit()

        return {
            "status": "success",
            "document_id": doc.id,
            "category": doc.category,
            "document_status": doc.status,
            "processing_duration": doc.processing_duration,
            "needs_review_fields": needs_review_count
        }

    except Exception as e:
        doc.status = "failed"
        doc.processing_error = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")
