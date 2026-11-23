import os
import shutil
import uuid
from pathlib import Path
from typing import Optional
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.base_dir = Path(settings.STORAGE_LOCAL_DIR)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, file_bytes: bytes, original_filename: str) -> tuple[str, str]:
        """Saves a file to persistent local storage and returns (stored_filename, absolute_path)"""
        ext = Path(original_filename).suffix.lower()
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        target_path = self.base_dir / unique_filename
        
        with open(target_path, "wb") as f:
            f.write(file_bytes)
            
        return unique_filename, str(target_path.resolve())

    def get_file_path(self, filename: str) -> Optional[str]:
        target = self.base_dir / filename
        if target.exists():
            return str(target.resolve())
        return None

    def read_file_bytes(self, filename: str) -> Optional[bytes]:
        target = self.base_dir / filename
        if target.exists():
            with open(target, "rb") as f:
                return f.read()
        return None

    def delete_file(self, filename: str) -> bool:
        target = self.base_dir / filename
        if target.exists():
            try:
                target.unlink()
                return True
            except Exception:
                return False
        return False

storage_service = StorageService()
