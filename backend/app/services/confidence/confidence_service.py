from typing import Dict, Any, Tuple
from app.core.config import settings

class ConfidenceService:
    def evaluate_field(self, field_name: str, field_data: Dict[str, Any]) -> Tuple[str, bool]:
        """
        Evaluates extraction confidence against enterprise review thresholds.
        Thresholds:
          - High (>= 0.90): Auto-approved / valid
          - Medium (0.70 - 0.89): Valid or review suggested
          - Low (< 0.70): Needs human review
        Returns: (validation_status, review_required)
        """
        value = field_data.get("value")
        confidence = float(field_data.get("confidence", 0.0))

        # Empty or null values require review
        if value is None or str(value).strip() == "" or str(value).lower() in ["none", "null", "n/a"]:
            return "needs_review", True

        if confidence >= settings.AUTO_APPROVE_THRESHOLD:
            return "valid", False
        elif confidence >= settings.MANUAL_REVIEW_THRESHOLD:
            return "valid", False
        else:
            return "needs_review", True

confidence_service = ConfidenceService()
