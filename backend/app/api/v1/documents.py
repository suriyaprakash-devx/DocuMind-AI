from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user, require_role
from app.models.entities import User, Document, DocumentPage, OCRResult, ExtractedField, DocumentReview, ValidationResult
from app.schemas.document import DocumentResponse, DocumentDetailResponse, DocumentClassifyRequest
from app.services.storage.storage_service import storage_service
from app.services.ocr.ocr_service import ocr_service
from app.services.classification.classifier_service import classifier_service
from app.services.extraction.groq_service import groq_extraction_service
from app.services.confidence.confidence_service import confidence_service
from app.services.validation.validation_service import validation_service

router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".docx", ".xlsx", ".txt"}

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate extension
    from pathlib import Path
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported format '{ext}'. Supported: {', '.join(ALLOWED_EXTENSIONS)}")

    file_bytes = await file.read()
    if len(file_bytes) > 25 * 1024 * 1024:  # 25 MB limit
        raise HTTPException(status_code=400, detail="File size exceeds maximum allowable limit of 25MB.")

    stored_name, full_path = storage_service.save_file(file_bytes, file.filename)

    doc = Document(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        filename=stored_name,
        original_name=file.filename,
        file_path=full_path,
        file_size=len(file_bytes),
        mime_type=file.content_type or "application/octet-stream",
        status="uploaded",
        category="Other"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.get("", response_model=List[DocumentResponse])
def list_documents(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Document).filter(Document.organization_id == current_user.organization_id)
    if search:
        query = query.filter(Document.original_name.ilike(f"%{search}%"))
    if category and category != "All":
        query = query.filter(Document.category == category)
    if status and status != "All":
        query = query.filter(Document.status == status)

    return query.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.organization_id == current_user.organization_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    ocr_data = [
        {
            "id": o.id,
            "page_number": o.page_number,
            "full_text": o.full_text,
            "tokens": o.tokens_json or [],
            "avg_confidence": o.avg_confidence,
            "duration": o.duration_seconds
        } for o in doc.ocr_results
    ]

    field_data = [
        {
            "id": f.id,
            "field_name": f.field_name,
            "field_label": f.field_label or f.field_name.replace("_", " ").title(),
            "extracted_value": f.extracted_value,
            "current_value": f.current_value or f.extracted_value,
            "confidence": f.confidence,
            "page": f.page,
            "source_text": f.source_text,
            "bounding_box": f.bounding_box,
            "validation_status": f.validation_status,
            "review_required": f.review_required,
            "is_corrected": f.is_corrected
        } for f in doc.fields
    ]

    val_data = [
        {
            "rule_name": v.rule_name,
            "severity": v.severity,
            "message": v.message,
            "passed": v.passed
        } for v in doc.validation_results
    ]

    rev_data = [
        {
            "id": r.id,
            "action": r.action,
            "comments": r.comments,
            "created_at": r.created_at
        } for r in doc.reviews
    ]

    return DocumentDetailResponse(
        id=doc.id,
        filename=doc.filename,
        original_name=doc.original_name,
        file_size=doc.file_size,
        mime_type=doc.mime_type,
        status=doc.status,
        category=doc.category,
        classification_confidence=doc.classification_confidence,
        classification_explanation=doc.classification_explanation,
        total_pages=doc.total_pages,
        processing_duration=doc.processing_duration,
        processing_error=doc.processing_error,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        ocr_results=ocr_data,
        extracted_fields=field_data,
        validation_results=val_data,
        reviews=rev_data
    )

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.organization_id == current_user.organization_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    storage_service.delete_file(doc.filename)
    db.delete(doc)
    db.commit()
    return {"status": "success", "message": "Document deleted successfully"}
