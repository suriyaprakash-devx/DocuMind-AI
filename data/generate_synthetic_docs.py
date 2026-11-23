"""
Synthetic Document Generator & Ground Truth Benchmark Suite for DocuMind AI
Generates realistic Invoices, Receipts, Contracts, Resumes, and Purchase Orders
with deterministic ground-truth labels for rigorous accuracy & F1 evaluation.
"""
import os
import json
from pathlib import Path

DATA_DIR = Path("./data/synthetic_samples")
DATA_DIR.mkdir(parents=True, exist_ok=True)

# 1. Invoices (20 samples)
INVOICES = [
    {
        "filename": f"inv_acme_{i+1:03d}.txt",
        "category": "Invoice",
        "ground_truth": {
            "invoice_number": f"INV-2026-{100+i}",
            "invoice_date": f"2026-10-{(i%28)+1:02d}",
            "due_date": f"2026-11-{(i%28)+1:02d}",
            "seller_name": "Apex Cloud Systems Inc.",
            "seller_tax_id": "US-EIN-9481920",
            "buyer_name": "Quantum Enterprises Ltd.",
            "subtotal": 10000.0 + (i * 250.0),
            "tax_amount": (10000.0 + (i * 250.0)) * 0.18,
            "total_amount": round((10000.0 + (i * 250.0)) * 1.18, 2),
            "currency": "USD"
        },
        "content": f"""TAX INVOICE
Apex Cloud Systems Inc.
100 Silicon Blvd, Suite 400, San Jose, CA
Tax ID: US-EIN-9481920

Bill To:
Quantum Enterprises Ltd.
500 Tech Parkway, Austin, TX

Invoice No: INV-2026-{100+i}
Date: 2026-10-{(i%28)+1:02d}
Due Date: 2026-11-{(i%28)+1:02d}
Payment Terms: Net 30 Days

Description                     Qty    Unit Price     Total
------------------------------------------------------------
Enterprise Cloud License Tier A   1    ${10000.0 + (i * 250.0):.2f}    ${10000.0 + (i * 250.0):.2f}

Subtotal:     ${10000.0 + (i * 250.0):.2f}
Tax (18%):    ${(10000.0 + (i * 250.0)) * 0.18:.2f}
Grand Total:  ${(10000.0 + (i * 250.0)) * 1.18:.2f}
Currency:     USD
"""
    }
    for i in range(20)
]

# 2. Receipts (15 samples)
RECEIPTS = [
    {
        "filename": f"rcpt_store_{i+1:03d}.txt",
        "category": "Receipt",
        "ground_truth": {
            "merchant_name": "Blue Bottle Coffee & Bakery",
            "receipt_number": f"RCP-{88000+i}",
            "transaction_date": f"2026-10-{(i%28)+1:02d}",
            "total_amount": round(15.50 + (i * 1.75), 2),
            "currency": "USD"
        },
        "content": f"""BLUE BOTTLE COFFEE & BAKERY
315 Linden St, San Francisco, CA
Terminal POS #04

Receipt #{88000+i}
Date: 2026-10-{(i%28)+1:02d}
Time: 08:35 AM
Cashier: Sarah M.

1x Single Origin Espresso        $4.50
1x Avocado Sourdough Toast       ${11.00 + (i * 1.75):.2f}

Subtotal:     ${15.50 + (i * 1.75):.2f}
Sales Tax:    $1.35
Total Amount: ${15.50 + (i * 1.75) + 1.35:.2f}
Payment: Visa Contactless *4129
Thank you for visiting!
"""
    }
    for i in range(15)
]

# 3. Contracts (10 samples)
CONTRACTS = [
    {
        "filename": f"contract_msa_{i+1:03d}.txt",
        "category": "Contract",
        "ground_truth": {
            "contract_title": "Master Software Services Agreement",
            "agreement_number": f"MSA-2026-{i+1:02d}",
            "parties_involved": "DocuMind Solutions Inc. & Global Logistics Corp",
            "effective_date": "2026-01-01",
            "expiration_date": "2028-12-31",
            "governing_law": "State of Delaware"
        },
        "content": f"""MASTER SOFTWARE SERVICES & LICENSING AGREEMENT
Agreement Reference No: MSA-2026-{i+1:02d}

This Master Services Agreement is entered into as of January 1, 2026 (the "Effective Date"),
by and between DocuMind Solutions Inc., a Delaware corporation, and Global Logistics Corp.

1. SCOPE AND SERVICES
Provider will deliver AI Document Intelligence platform services as described in Statement of Work #{i+1}.

2. TERM AND TERMINATION
This Agreement shall commence on the Effective Date (2026-01-01) and continue until December 31, 2028.
Either party may terminate for material breach with thirty (30) days prior written notice.

3. GOVERNING LAW
This Agreement shall be governed and construed in accordance with the laws of the State of Delaware.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement.
"""
    }
    for i in range(10)
]

# 4. Resumes (15 samples)
RESUMES = [
    {
        "filename": f"resume_candidate_{i+1:03d}.txt",
        "category": "Resume",
        "ground_truth": {
            "candidate_name": f"Candidate {chr(65+i)} Developer",
            "email": f"candidate.{chr(97+i)}@techtalent.io",
            "phone_number": f"+1 (555) 019-{1000+i}",
            "skills": "Python, FastAPI, React, TypeScript, PyMuPDF, Docker, PostgreSQL"
        },
        "content": f"""Candidate {chr(65+i)} Developer
Email: candidate.{chr(97+i)}@techtalent.io | Phone: +1 (555) 019-{1000+i}
Location: San Francisco, CA | LinkedIn: linkedin.com/in/candidate-{chr(97+i)}

PROFESSIONAL SUMMARY
Senior Full-Stack AI Engineer with 6+ years of production experience architecting OCR pipelines,
LLM orchestration platforms, and high-performance React frontends.

CORE SKILLS
Python, FastAPI, React, TypeScript, PyMuPDF, Docker, PostgreSQL, Redis, Groq API, AWS.

EXPERIENCE
Lead Document Intelligence Engineer | CloudScale Inc. (2023 - Present)
- Engineered enterprise OCR pipeline processing 1.5M pages monthly.
- Reduced manual data entry latency by 85% via automated confidence scoring.

EDUCATION
B.S. in Computer Science & Engineering | University of Technology (2018 - 2022)
"""
    }
    for i in range(15)
]

# 5. Purchase Orders (10 samples)
PURCHASE_ORDERS = [
    {
        "filename": f"po_requisition_{i+1:03d}.txt",
        "category": "Purchase Order",
        "ground_truth": {
            "po_number": f"PO-900{i+1:02d}",
            "purchase_date": f"2026-10-{(i%28)+1:02d}",
            "buyer_details": "Nexus Technologies - Procurement",
            "supplier_details": "Dell Enterprise Server Supplies",
            "total_amount": 45000.0 + (i * 1200.0)
        },
        "content": f"""PURCHASE ORDER
P.O. Number: PO-900{i+1:02d}
Order Date: 2026-10-{(i%28)+1:02d}
Requisition ID: REQ-39210

Buyer:
Nexus Technologies - Procurement
100 Innovation Way, Austin, TX

Vendor / Supplier:
Dell Enterprise Server Supplies
Round Rock, TX

Ship To:
Nexus Data Center East, Suite 200

Item No    Description                    Qty    Unit Cost     Line Total
-------------------------------------------------------------------------
1          PowerEdge R750 Rack Server      2     ${(45000.0 + (i * 1200.0))/2:.2f}    ${45000.0 + (i * 1200.0):.2f}

Order Subtotal:  ${45000.0 + (i * 1200.0):.2f}
Total P.O. Val:  ${45000.0 + (i * 1200.0):.2f}
Payment Terms:   Net 45 Days upon delivery
"""
    }
    for i in range(10)
]

ALL_DATA = INVOICES + RECEIPTS + CONTRACTS + RESUMES + PURCHASE_ORDERS

def generate_samples():
    print(f"Generating {len(ALL_DATA)} synthetic ground-truth test documents...")
    manifest = []
    for item in ALL_DATA:
        filepath = DATA_DIR / item["filename"]
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(item["content"])
        manifest.append({
            "filename": item["filename"],
            "category": item["category"],
            "ground_truth": item["ground_truth"]
        })

    with open(DATA_DIR / "ground_truth_manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"Generated {len(manifest)} documents in {DATA_DIR} successfully.")

if __name__ == "__main__":
    generate_samples()
