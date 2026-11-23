import pytest
from app.services.classification.classifier_service import classifier_service

def test_classify_invoice():
    text = "TAX INVOICE Apex Systems Subtotal: $10,000 Total Amount: $11,800 Due Date: 2026-11-15"
    cat, conf, exp = classifier_service.classify(text, "invoice_001.pdf")
    assert cat == "Invoice"
    assert conf >= 0.70

def test_classify_receipt():
    text = "RECEIPT Blue Bottle Coffee POS Terminal Cashier: Sarah Total: $28.50 Visa Contactless"
    cat, conf, exp = classifier_service.classify(text, "receipt_883.png")
    assert cat == "Receipt"
    assert conf >= 0.70

def test_classify_contract():
    text = "MASTER SERVICES AGREEMENT between Parties Effective Date: 2026-01-01 Governing Law: State of Delaware"
    cat, conf, exp = classifier_service.classify(text, "msa_agreement.docx")
    assert cat == "Contract"
    assert conf >= 0.70

def test_classify_resume():
    text = "Curriculum Vitae Candidate Experience Education Skills: Python FastAPI Docker University of Technology"
    cat, conf, exp = classifier_service.classify(text, "candidate_cv.pdf")
    assert cat == "Resume"
    assert conf >= 0.70

def test_classify_purchase_order():
    text = "PURCHASE ORDER P.O. Number: PO-99401 Vendor: Dell Requisition Ship To: Austin, TX"
    cat, conf, exp = classifier_service.classify(text, "po_requisition.xlsx")
    assert cat == "Purchase Order"
    assert conf >= 0.70
