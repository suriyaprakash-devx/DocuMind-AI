import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

# Frontend SPA Static Serving
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if not FRONTEND_DIST.exists():
    FRONTEND_DIST = Path("/app/frontend/dist")

if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/", tags=["Frontend"])
    def serve_root():
        return FileResponse(str(FRONTEND_DIST / "index.html"))

    @app.get("/{full_path:path}", tags=["Frontend"])
    def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(FRONTEND_DIST / "index.html"))
else:
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
