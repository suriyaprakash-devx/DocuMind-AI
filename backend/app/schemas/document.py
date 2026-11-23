from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class DocumentResponse(BaseModel):
    id: str
    filename: str
    original_name: str
    file_size: int
    mime_type: str
    status: str
    category: str
    classification_confidence: float
    classification_explanation: Optional[str] = None
    total_pages: int
    processing_duration: float
    processing_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentDetailResponse(DocumentResponse):
    ocr_results: List[Dict[str, Any]] = []
    extracted_fields: List[Dict[str, Any]] = []
    validation_results: List[Dict[str, Any]] = []
    reviews: List[Dict[str, Any]] = []

class DocumentClassifyRequest(BaseModel):
    category: str  # manual override
