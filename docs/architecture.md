# DocuMind AI: System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 18 + TS + Tailwind + Glassmorphism)"]
        UI["Glassmorphic Enterprise UI"]
        UploadComp["Drag & Drop Upload"]
        ReviewComp["Human-in-the-Loop Review Center"]
        AnalyticsComp["Real-Time Dashboard & Charts"]
    end

    subgraph API ["FastAPI Backend (REST API)"]
        AuthM["JWT & RBAC Auth Middleware"]
        DocRouter["Document & Storage Manager"]
        ExtractRouter["Processing & Extraction Router"]
        ReviewRouter["Review & Audit Controller"]
        ExportRouter["Multi-Format Export Engine"]
    end

    subgraph Pipeline ["AI Document Intelligence Pipeline"]
        Ingest["File Ingestion & Content MIME Validation"]
        Preprocess["PDF Decomposition & Image Normalization"]
        OCR["PaddleOCR / PyMuPDF Hybrid OCR"]
        Classifier["Multi-Signal Document Classifier"]
        GroqLLM["Groq LLM Engine (Llama 3 / Mixtral / Structured JSON)"]
        Confidence["Field-Level Confidence Scoring"]
        Validator["Business Rule & Arithmetic Validator"]
    end

    subgraph Storage ["Data & Persistence Layer"]
        DB[(PostgreSQL / SQLite 3.0)]
        ObjStore[S3 Compatible / Local Object Storage]
        AuditLog[(Audit Trail & Field Revisions)]
    end

    UI --> AuthM
    UploadComp --> DocRouter
    ReviewComp --> ReviewRouter
    AnalyticsComp --> ExtractRouter

    DocRouter --> Ingest
    Ingest --> ObjStore
    Ingest --> Preprocess
    Preprocess --> OCR
    OCR --> Classifier
    Classifier --> GroqLLM
    GroqLLM --> Confidence
    Confidence --> Validator
    Validator --> DB
    ReviewRouter --> AuditLog
    AuditLog --> DB
    ExportRouter --> DB
```

## Architecture Principles
1. **Modular AI Decoupling**: OCR engines (PaddleOCR, PyMuPDF, OCR fallback) and LLM inference engines (Groq API, Ollama, OpenAI-compatible) are decoupled behind abstract interfaces (`BaseOCREngine`, `BaseExtractionEngine`).
2. **Deterministic Evidence & Grounding**: Every extracted entity preserves source page, source text snippet, bounding box coordinates (where available), and granular confidence metrics.
3. **Immutability of Raw Extraction**: Human edits never overwrite raw extraction runs; edits are recorded in `field_corrections` with user attribution and timestamp.
4. **Resilient Local & Cloud Portability**: Automatically runs locally using SQLite and disk storage, while seamlessly scaling to PostgreSQL and S3 on cloud deployments.
