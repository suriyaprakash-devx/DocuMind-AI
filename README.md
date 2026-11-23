# DocuMind AI — AI Document Intelligence Platform

> **Transform Business Documents into Structured Intelligence.**  
> *Enterprise-Grade Document Processing SaaS with Hybrid OCR, Groq LLM Extraction, Field-Level Confidence Scoring, and Human-in-the-Loop Review.*

---

## 📌 Executive Summary

**DocuMind AI** is an advanced, production-grade AI Document Intelligence Platform engineered to ingest, understand, classify, extract, and audit multi-format business documents (Invoices, Receipts, Contracts, Resumes, Purchase Orders, and Reports).

By combining **PyMuPDF / Hybrid OCR**, **Groq-accelerated Llama 3.3 70B inference**, deterministic **confidence scoring**, and a **Human-in-the-Loop (HITL) Review Center**, DocuMind AI achieves **100% classification accuracy** and sub-second processing latency while ensuring data integrity.

---

## 🌟 Key Features

1. **Role-Based Access Control & Multi-Tenancy**: Organization-level data isolation with four role tiers (`Admin`, `Manager`, `Reviewer`, `Standard`).
2. **Multi-Format Ingestion**: Ingests PDFs (both vector & scanned), Images (PNG, JPG, TIFF), DOCX Word documents, and XLSX spreadsheets with strict MIME validation.
3. **Multi-Signal Document Classification**: Heuristic keywords, filename tokens, and LLM classification fallback with explainability logs.
4. **Hybrid OCR Engine**: High-fidelity token-level extraction preserving word bounding boxes, coordinates, page references, and character confidence.
5. **Groq Llama 3.3 70B Structured Extraction**: Formulates document-specific Pydantic schemas (Invoices, Receipts, Contracts, Resumes, Purchase Orders) with fallback heuristic rules for offline zero-config operation.
6. **Field-Level Confidence Scoring**: Every extracted field carries confidence score, source page, source text snippet, bounding box coords, and validation status (`valid`, `warning`, `needs_review`).
7. **Human-in-the-Loop (HITL) Split Review Screen**: Side-by-side interactive document preview alongside editable extraction fields.
8. **Immutable Audit Trail**: Never overwrites raw extraction runs; records all corrections (`original_value`, `corrected_value`, reviewer ID, timestamp, reason).
9. **Automated Business Rule Validator**: Verifies arithmetic equations (`subtotal + tax - discount == total`), date consistency, email/phone formats, and required field existence.
10. **Multi-Format Structured Export**: One-click export to JSON, CSV, and multi-tab Microsoft Excel (`.xlsx`).
11. **Telemetry & Real Analytics**: Recharts dashboard visualizing ingestion volume, confidence distributions, and processing durations.
12. **Bespoke Glassmorphism UI**: High-contrast, dark navy enterprise aesthetics with frosted glass blur, glowing accents, and micro-interactions.

---

## 🏗️ Technology Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS | High-performance SPA with custom Glassmorphism system |
| **Icons & Charts** | Lucide React, Recharts | Interactive visual telemetry and iconography |
| **Backend API** | Python 3.13, FastAPI, Uvicorn | High-throughput async REST API |
| **Database** | SQLAlchemy 2.0, SQLite (dev) / PostgreSQL (prod) | Normalized multi-tenant relational schema |
| **Authentication** | Direct Bcrypt & PyJWT | Robust password hashing & stateless JWT auth |
| **Document Processing** | PyMuPDF (fitz), python-docx, openpyxl, Pillow | Multi-format layout & text decomposition |
| **AI Extraction** | Groq API (Llama 3.3 70B) & Rule Fallback Engine | Structured JSON extraction conforming to Pydantic v2 |
| **Testing & CI** | Pytest, Automated Benchmark Suite | 70+ synthetic ground-truth test evaluation |

---

## 🚀 Quick Start Guide

### 1. Start the FastAPI Backend

```bash
# From workspace root
uvicorn backend.app.main:app --reload --port 8000
```
- Interactive API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Start the Frontend Development Client

```bash
cd frontend
npm run dev
```
- Access application: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Pre-Configured Demo Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@documind.ai` | `AdminPass123!` | Full organization management, deletion & governance |
| **Reviewer** | `reviewer@documind.ai` | `ReviewerPass123!` | Access to Review Center, audit adjustments, approvals |
| **Standard** | `charan@documind.ai` | `password123` | Document uploads, viewing, and personal exports |

---

## 🧪 Benchmark & Automated Evaluation

The platform includes a dedicated synthetic dataset generator and evaluation suite located at `data/generate_synthetic_docs.py` and `backend/tests/run_benchmark.py`:

```bash
# Run unit tests
python -m pytest

# Run quantitative benchmark on 70 documents
python ./backend/tests/run_benchmark.py
```

### Benchmark Summary (from `docs/evaluation_report.md`):
- **Total Evaluated Documents:** 70
- **Document Classification Accuracy:** 100.00%
- **Average Pipeline Latency:** < 0.05s / document
- **Arithmetic & Validation Rules:** 100% automated enforcement
