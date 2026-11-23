# DocuMind AI REST API Documentation

Base URL: `http://localhost:8000/api` (or `/api` in production)
Interactive Swagger UI: `http://localhost:8000/docs`
OpenAPI Specification: `http://localhost:8000/openapi.json`

---

## 1. Authentication Endpoints

### Register User
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "email": "user@company.com",
    "password": "StrongPassword123!",
    "full_name": "Alex Mercer",
    "organization_name": "Apex Finance",
    "role": "standard"
  }
  ```
- **Response:** `200 OK` with JWT bearer token and user metadata.

### Login User
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "admin@documind.ai",
    "password": "AdminPass123!"
  }
  ```
- **Response:** `200 OK` with JWT token.

### Current User Profile
- **GET** `/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Current authenticated user and tenant organization.

---

## 2. Document Management Endpoints

### Upload Document
- **POST** `/documents/upload`
- **Headers:** `Authorization: Bearer <token>`
- **Multipart Form:** `file: <binary>`
- **Formats:** PDF, PNG, JPG, JPEG, TIFF, DOCX, XLSX (max 25MB).

### List Documents
- **GET** `/documents`
- **Query Params:** `search`, `category`, `status`, `skip`, `limit`.

### Get Document Detail
- **GET** `/documents/{document_id}`
- **Response:** Complete hierarchy including OCR results, token bounding boxes, extracted fields, validation results, and review history.

### Delete Document
- **DELETE** `/documents/{document_id}`
- **Permissions:** Admin or Manager role required.

---

## 3. AI Processing Pipeline Endpoints

### Run Pipeline
- **POST** `/documents/{document_id}/process`
- **Stages:**
  1. Status -> `processing`: PyMuPDF / Hybrid OCR.
  2. Status -> `ocr_completed`: Multi-signal heuristic classification.
  3. Status -> `extracting`: Groq LLM inference (Llama 3.3 70B).
  4. Confidence evaluation: Field-level evidence checks.
  5. Business rule verification: Arithmetic equations, date ranges.
  6. Final status: `review_required` or `approved`.

---

## 4. Human-in-the-Loop Review Endpoints

### Get Pending Queue
- **GET** `/reviews/pending`
- **Response:** Documents awaiting manual review.

### Update Field (Inline Correction)
- **PATCH** `/reviews/{document_id}/fields/{field_id}`
- **Body:**
  ```json
  {
    "corrected_value": "INV-2026-999",
    "reason": "Corrected leading prefix"
  }
  ```
- **Audit:** Records original value, corrected value, user ID, and timestamp in immutable `field_corrections` table.

### Approve Document
- **POST** `/reviews/{document_id}/approve`
- **Body:** `{"comments": "Verified line items"}`

### Reject Document
- **POST** `/reviews/{document_id}/reject`
- **Body:** `{"comments": "Illegible receipt"}`

---

## 5. Export Endpoints

### Download Structured Export
- **GET** `/exports/{document_id}/download?format=json|csv|xlsx`
- **Response:** Attachment stream formatted as JSON, CSV, or Microsoft Excel workbook.
