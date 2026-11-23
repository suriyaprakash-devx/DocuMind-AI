import pytest
from app.services.validation.validation_service import validation_service

def test_invoice_arithmetic_valid():
    fields = {
        "subtotal": {"value": 1000.0},
        "tax_amount": {"value": 180.0},
        "discount_amount": {"value": 0.0},
        "total_amount": {"value": 1180.0},
        "invoice_number": {"value": "INV-001"},
        "invoice_date": {"value": "2026-10-15"},
        "seller_name": {"value": "Apex Inc."}
    }
    results = validation_service.validate_document("Invoice", fields)
    arithmetic_res = next(r for r in results if "Arithmetic" in r["rule_name"])
    assert arithmetic_res["passed"] is True

def test_invoice_arithmetic_mismatch():
    fields = {
        "subtotal": {"value": 1000.0},
        "tax_amount": {"value": 180.0},
        "discount_amount": {"value": 0.0},
        "total_amount": {"value": 1500.0},  # discrepancy
        "invoice_number": {"value": "INV-001"}
    }
    results = validation_service.validate_document("Invoice", fields)
    arithmetic_res = next(r for r in results if "Discrepancy" in r["rule_name"])
    assert arithmetic_res["passed"] is False

def test_resume_email_validation():
    valid_resume = {"email": {"value": "candidate@techtalent.io"}}
    results = validation_service.validate_document("Resume", valid_resume)
    assert any(r["passed"] for r in results if "Email" in r["rule_name"])

    invalid_resume = {"email": {"value": "not-an-email"}}
    results2 = validation_service.validate_document("Resume", invalid_resume)
    assert any(not r["passed"] for r in results2 if "Email" in r["rule_name"])
