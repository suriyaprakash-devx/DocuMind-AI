# Database Schema Documentation

DocuMind AI uses a normalized relational schema with SQLAlchemy 2.0 ORM.

## Entities Overview

1. **organizations**: Tenant boundary for enterprise multi-tenancy.
2. **users**: User credentials, role (`admin`, `manager`, `reviewer`, `standard`), organization association.
3. **documents**: Metadata, original file path, MIME type, current processing status (`uploaded`, `processing`, `ocr_completed`, `extracting`, `review_required`, `approved`, `rejected`, `failed`), classification category, confidence.
4. **document_pages**: Extracted page metrics, dimensions, page numbers.
5. **ocr_results**: Raw text, word-level / line-level bounding box tokens, OCR confidence, engine used, execution latency.
6. **extraction_runs**: AI extraction invocation records, model used, prompt metadata, duration.
7. **extracted_fields**: Individual structured fields with raw extracted value, normalized value, field confidence, page reference, source snippet, bounding box coordinates, validation status.
8. **field_corrections**: Audit log tracking human edits (original value, corrected value, reviewer user ID, timestamp, reason).
9. **document_reviews**: Overall document review outcomes, approval/rejection flags, reviewer notes.
10. **validation_results**: Document-level and field-level validation check results (arithmetic checks, date formats, required fields).
11. **export_jobs**: Records of exported files (JSON, CSV, XLSX, PDF) and download tokens.
12. **audit_logs**: Platform-wide operational security and audit trail.
