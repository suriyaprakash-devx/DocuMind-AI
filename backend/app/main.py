import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.models.entities import Organization, User, Document, DocumentPage, OCRResult, ExtractedField, DocumentReview, ValidationResult
from app.core.security import get_password_hash
from app.api.v1 import auth, documents, processing, reviews, exports, analytics

# Initialize database schemas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise-grade AI Document Intelligence Platform with OCR, Groq LLM Extraction, and Human-in-the-Loop Review."
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(processing.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(exports.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/", tags=["System"])
def root():
    return {
        "message": "DocuMind AI Platform API is online.",
        "docs_url": "/docs",
        "health_url": "/health"
    }

@app.on_event("startup")
def startup_seed():
    """Seeds default enterprise demo accounts and initial dataset"""
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            print("[DocuMind Startup] Initializing demo organization and accounts...")
            org = Organization(name="Global Financial Systems", slug="global-financial-systems")
            db.add(org)
            db.flush()

            admin = User(
                email="admin@documind.ai",
                hashed_password=get_password_hash("AdminPass123!"),
                full_name="Alex Mercer (Admin)",
                role="admin",
                organization_id=org.id
            )
            reviewer = User(
                email="reviewer@documind.ai",
                hashed_password=get_password_hash("ReviewerPass123!"),
                full_name="Sarah Chen (Reviewer)",
                role="reviewer",
                organization_id=org.id
            )
            standard = User(
                email="charan@documind.ai",
                hashed_password=get_password_hash("password123"),
                full_name="Charan D (Enterprise User)",
                role="standard",
                organization_id=org.id
            )
            db.add_all([admin, reviewer, standard])
            db.commit()
            print("[DocuMind Startup] Seeded default accounts successfully.")
    finally:
        db.close()
