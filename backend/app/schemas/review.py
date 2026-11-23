from typing import Optional, Any
from pydantic import BaseModel

class FieldCorrectionRequest(BaseModel):
    corrected_value: Any
    reason: Optional[str] = None

class DocumentActionRequest(BaseModel):
    comments: Optional[str] = None

class DocumentStatusUpdate(BaseModel):
    status: str
