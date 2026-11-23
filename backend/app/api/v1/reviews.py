from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user, require_role
from app.models.entities import User, Document, ExtractedField, FieldCorrection, DocumentReview
from app.schemas.review import FieldCorrectionRequest, DocumentActionRequest

router = APIRouter(prefix="/reviews", tags=["Human-in-the-Loop Review"])

@router.get("/pending", response_model=List[Dict[str, Any]])
def get_pending_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    docs = db.query(Document).filter(
        Document.organization_id == current_user.organization_id,
        Document.status.in_(["review_required", "ocr_completed", "extracting"])
    ).order_by(Document.created_at.desc()).all()

    return [
        {
            "id": d.id,
            "original_name": d.original_name,
            "category": d.category,
            "status": d.status,
            "confidence": d.classification_confidence,
            "created_at": d.created_at,
            "total_pages": d.total_pages
        } for d in docs
    ]

@router.patch("/{document_id}/fields/{field_id}")
def update_field_value(
    document_id: str,
    field_id: str,
    req: FieldCorrectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    field = db.query(ExtractedField).filter(
        ExtractedField.id == field_id,
        ExtractedField.document_id == document_id
    ).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found.")

    original_val = field.current_value or field.extracted_value

    # Record correction in immutable audit log
    correction = FieldCorrection(
        field_id=field.id,
        user_id=current_user.id,
        original_value=original_val,
        corrected_value=str(req.corrected_value),
        reason=req.reason or "Manual user review adjustment"
    )
    db.add(correction)

    # Update field record
    field.current_value = str(req.corrected_value)
    field.is_corrected = True
    field.review_required = False
    field.validation_status = "valid"

    db.commit()
    return {
        "status": "success",
        "field_id": field.id,
        "new_value": field.current_value,
        "is_corrected": True
    }

@router.post("/{document_id}/approve")
def approve_document(
    document_id: str,
    req: DocumentActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.organization_id == current_user.organization_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc.status = "approved"
    rev = DocumentReview(
        document_id=doc.id,
        user_id=current_user.id,
        action="approved",
        comments=req.comments or "Approved via Review Center"
    )
    db.add(rev)
    db.commit()
    return {"status": "success", "document_id": doc.id, "document_status": "approved"}

@router.post("/{document_id}/reject")
def reject_document(
    document_id: str,
    req: DocumentActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.organization_id == current_user.organization_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc.status = "rejected"
    rev = DocumentReview(
        document_id=doc.id,
        user_id=current_user.id,
        action="rejected",
        comments=req.comments or "Rejected by reviewer"
    )
    db.add(rev)
    db.commit()
    return {"status": "success", "document_id": doc.id, "document_status": "rejected"}
