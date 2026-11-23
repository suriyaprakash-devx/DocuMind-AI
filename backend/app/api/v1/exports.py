from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.entities import User, Document, ExtractedField
from app.services.export.export_service import export_service

router = APIRouter(prefix="/exports", tags=["Export"])

@router.get("/{document_id}/download")
def download_export(
    document_id: str,
    format: str = "json",  # json, csv, xlsx
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.organization_id == current_user.organization_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    fields = db.query(ExtractedField).filter(ExtractedField.document_id == doc.id).all()
    fields_list = [
        {
            "field_name": f.field_name,
            "extracted_value": f.extracted_value,
            "current_value": f.current_value,
            "confidence": f.confidence,
            "page": f.page,
            "validation_status": f.validation_status,
            "is_corrected": f.is_corrected
        } for f in fields
    ]

    doc_dict = {
        "id": doc.id,
        "original_name": doc.original_name,
        "category": doc.category,
        "status": doc.status,
        "classification_confidence": doc.classification_confidence,
        "total_pages": doc.total_pages,
        "created_at": str(doc.created_at),
        "fields": fields_list
    }

    fmt = format.lower()
    if fmt == "csv":
        content = export_service.export_csv(fields_list)
        media_type = "text/csv"
        filename = f"{doc.original_name}_extracted.csv"
    elif fmt in ["xlsx", "excel"]:
        content = export_service.export_excel(doc_dict, fields_list)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = f"{doc.original_name}_extracted.xlsx"
    else:
        content = export_service.export_json(doc_dict)
        media_type = "application/json"
        filename = f"{doc.original_name}_extracted.json"

    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
