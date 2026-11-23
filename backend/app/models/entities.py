import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

def gen_uuid():
    return str(uuid.uuid4())

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="organization")
    documents = relationship("Document", back_populates="organization")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="standard")  # admin, manager, reviewer, standard
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")
    corrections = relationship("FieldCorrection", back_populates="user")
    reviews = relationship("DocumentReview", back_populates="user")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    
    # Status: uploaded, queued, processing, ocr_completed, extracting, review_required, approved, rejected, failed
    status = Column(String(50), default="uploaded", index=True)
    
    # Classification: Invoice, Receipt, Contract, Resume, Purchase Order, Bank Statement, Other
    category = Column(String(50), default="Other", index=True)
    classification_confidence = Column(Float, default=0.0)
    classification_explanation = Column(Text, nullable=True)
    
    total_pages = Column(Integer, default=1)
    processing_error = Column(Text, nullable=True)
    processing_duration = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="documents")
    pages = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")
    ocr_results = relationship("OCRResult", back_populates="document", cascade="all, delete-orphan")
    extraction_runs = relationship("ExtractionRun", back_populates="document", cascade="all, delete-orphan")
    fields = relationship("ExtractedField", back_populates="document", cascade="all, delete-orphan")
    reviews = relationship("DocumentReview", back_populates="document", cascade="all, delete-orphan")
    validation_results = relationship("ValidationResult", back_populates="document", cascade="all, delete-orphan")


class DocumentPage(Base):
    __tablename__ = "document_pages"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    image_path = Column(String(512), nullable=True)
    width = Column(Float, default=0.0)
    height = Column(Float, default=0.0)

    document = relationship("Document", back_populates="pages")


class OCRResult(Base):
    __tablename__ = "ocr_results"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, default=1)
    
    full_text = Column(Text, nullable=False)
    tokens_json = Column(JSON, nullable=True)  # words, bounding boxes, confidences
    ocr_engine = Column(String(50), default="hybrid")
    avg_confidence = Column(Float, default=0.0)
    duration_seconds = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="ocr_results")


class ExtractionRun(Base):
    __tablename__ = "extraction_runs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    model_name = Column(String(100), default="groq-llama-3.3-70b")
    raw_prompt = Column(Text, nullable=True)
    raw_response = Column(Text, nullable=True)
    structured_json = Column(JSON, nullable=True)
    duration_seconds = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="extraction_runs")


class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    
    field_name = Column(String(100), nullable=False, index=True)
    field_label = Column(String(100), nullable=True)
    extracted_value = Column(Text, nullable=True)
    normalized_value = Column(Text, nullable=True)
    
    confidence = Column(Float, default=0.0)
    page = Column(Integer, default=1)
    source_text = Column(Text, nullable=True)
    bounding_box = Column(JSON, nullable=True)  # [x0, y0, x1, y1] or normalized coords
    
    validation_status = Column(String(50), default="valid")  # valid, warning, invalid, needs_review
    review_required = Column(Boolean, default=False)
    
    # Audit reference
    is_corrected = Column(Boolean, default=False)
    current_value = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="fields")
    corrections = relationship("FieldCorrection", back_populates="field", cascade="all, delete-orphan")


class FieldCorrection(Base):
    __tablename__ = "field_corrections"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    field_id = Column(String(36), ForeignKey("extracted_fields.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    original_value = Column(Text, nullable=True)
    corrected_value = Column(Text, nullable=True)
    reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    field = relationship("ExtractedField", back_populates="corrections")
    user = relationship("User", back_populates="corrections")


class DocumentReview(Base):
    __tablename__ = "document_reviews"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    action = Column(String(50), nullable=False)  # approved, rejected, draft_saved, mark_review
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="reviews")
    user = relationship("User", back_populates="reviews")


class ValidationResult(Base):
    __tablename__ = "validation_results"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    
    rule_name = Column(String(100), nullable=False)
    severity = Column(String(20), default="info")  # info, warning, error
    message = Column(Text, nullable=False)
    passed = Column(Boolean, default=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="validation_results")


class ExportJob(Base):
    __tablename__ = "export_jobs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), nullable=False)
    user_id = Column(String(36), nullable=False)
    
    export_format = Column(String(20), nullable=False)  # json, csv, xlsx, pdf
    file_path = Column(String(512), nullable=True)
    filters_used = Column(JSON, nullable=True)
    status = Column(String(50), default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), nullable=True)
    user_id = Column(String(36), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(50), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
