from typing import Dict, List, Any
from pydantic import BaseModel

class AnalyticsOverview(BaseModel):
    total_documents: int
    uploaded_today: int
    processing_count: int
    approved_count: int
    review_required_count: int
    failed_count: int
    avg_processing_duration: float
    overall_accuracy_rate: float
    category_distribution: Dict[str, int]
    daily_volume: List[Dict[str, Any]]
    confidence_distribution: Dict[str, int]
