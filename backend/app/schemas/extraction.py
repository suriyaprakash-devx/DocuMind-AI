from typing import Optional, List, Any
from pydantic import BaseModel, Field

class FieldItem(BaseModel):
    value: Any = None
    confidence: float = 0.0
    page: int = 1
    source_text: Optional[str] = None
    bounding_box: Optional[List[float]] = None
    validation_status: str = "valid"  # valid, warning, invalid, needs_review
    review_required: bool = False

# A. Invoice Extraction Schema
class InvoiceLineItem(BaseModel):
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    line_total: Optional[float] = None

class InvoiceSchema(BaseModel):
    invoice_number: FieldItem = Field(default_factory=FieldItem)
    invoice_date: FieldItem = Field(default_factory=FieldItem)
    due_date: FieldItem = Field(default_factory=FieldItem)
    seller_name: FieldItem = Field(default_factory=FieldItem)
    seller_address: FieldItem = Field(default_factory=FieldItem)
    seller_tax_id: FieldItem = Field(default_factory=FieldItem)
    buyer_name: FieldItem = Field(default_factory=FieldItem)
    buyer_address: FieldItem = Field(default_factory=FieldItem)
    buyer_tax_id: FieldItem = Field(default_factory=FieldItem)
    currency: FieldItem = Field(default_factory=FieldItem)
    subtotal: FieldItem = Field(default_factory=FieldItem)
    tax_amount: FieldItem = Field(default_factory=FieldItem)
    discount_amount: FieldItem = Field(default_factory=FieldItem)
    total_amount: FieldItem = Field(default_factory=FieldItem)
    payment_terms: FieldItem = Field(default_factory=FieldItem)
    line_items: List[InvoiceLineItem] = []

# B. Receipt Extraction Schema
class ReceiptItem(BaseModel):
    item_name: Optional[str] = None
    quantity: Optional[float] = 1.0
    price: Optional[float] = None

class ReceiptSchema(BaseModel):
    merchant_name: FieldItem = Field(default_factory=FieldItem)
    merchant_address: FieldItem = Field(default_factory=FieldItem)
    transaction_date: FieldItem = Field(default_factory=FieldItem)
    transaction_time: FieldItem = Field(default_factory=FieldItem)
    receipt_number: FieldItem = Field(default_factory=FieldItem)
    payment_method: FieldItem = Field(default_factory=FieldItem)
    currency: FieldItem = Field(default_factory=FieldItem)
    tax_amount: FieldItem = Field(default_factory=FieldItem)
    total_amount: FieldItem = Field(default_factory=FieldItem)
    items: List[ReceiptItem] = []

# C. Contract Extraction Schema
class ContractSchema(BaseModel):
    contract_title: FieldItem = Field(default_factory=FieldItem)
    agreement_number: FieldItem = Field(default_factory=FieldItem)
    parties_involved: FieldItem = Field(default_factory=FieldItem)
    effective_date: FieldItem = Field(default_factory=FieldItem)
    expiration_date: FieldItem = Field(default_factory=FieldItem)
    contract_value: FieldItem = Field(default_factory=FieldItem)
    payment_terms: FieldItem = Field(default_factory=FieldItem)
    renewal_conditions: FieldItem = Field(default_factory=FieldItem)
    termination_clauses: FieldItem = Field(default_factory=FieldItem)
    important_obligations: FieldItem = Field(default_factory=FieldItem)
    penalty_clauses: FieldItem = Field(default_factory=FieldItem)
    governing_law: FieldItem = Field(default_factory=FieldItem)

# D. Resume Extraction Schema
class EducationItem(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    graduation_date: Optional[str] = None

class ExperienceItem(BaseModel):
    job_title: Optional[str] = None
    employer: Optional[str] = None
    employment_dates: Optional[str] = None
    description: Optional[str] = None

class ResumeSchema(BaseModel):
    candidate_name: FieldItem = Field(default_factory=FieldItem)
    email: FieldItem = Field(default_factory=FieldItem)
    phone_number: FieldItem = Field(default_factory=FieldItem)
    location: FieldItem = Field(default_factory=FieldItem)
    professional_summary: FieldItem = Field(default_factory=FieldItem)
    skills: FieldItem = Field(default_factory=FieldItem)
    certifications: FieldItem = Field(default_factory=FieldItem)
    languages: FieldItem = Field(default_factory=FieldItem)
    education: List[EducationItem] = []
    experience: List[ExperienceItem] = []

# E. Purchase Order Extraction Schema
class PurchaseOrderSchema(BaseModel):
    po_number: FieldItem = Field(default_factory=FieldItem)
    purchase_date: FieldItem = Field(default_factory=FieldItem)
    buyer_details: FieldItem = Field(default_factory=FieldItem)
    supplier_details: FieldItem = Field(default_factory=FieldItem)
    delivery_address: FieldItem = Field(default_factory=FieldItem)
    expected_delivery_date: FieldItem = Field(default_factory=FieldItem)
    tax_amount: FieldItem = Field(default_factory=FieldItem)
    total_amount: FieldItem = Field(default_factory=FieldItem)
    payment_conditions: FieldItem = Field(default_factory=FieldItem)
    items: List[InvoiceLineItem] = []
