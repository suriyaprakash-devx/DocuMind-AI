export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "manager" | "reviewer" | "standard";
  organization_id: string;
  organization_name: string;
  is_active: boolean;
}

export interface DocumentItem {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  status: "uploaded" | "queued" | "processing" | "ocr_completed" | "extracting" | "review_required" | "approved" | "rejected" | "failed";
  category: "Invoice" | "Receipt" | "Contract" | "Resume" | "Purchase Order" | "Bank Statement" | "Other";
  classification_confidence: number;
  classification_explanation?: string;
  total_pages: number;
  processing_duration: number;
  processing_error?: string;
  created_at: string;
  updated_at: string;
}

export interface ExtractedFieldItem {
  id: string;
  field_name: string;
  field_label: string;
  extracted_value: string;
  current_value: string;
  confidence: number;
  page: number;
  source_text?: string;
  bounding_box?: number[];
  validation_status: "valid" | "warning" | "invalid" | "needs_review";
  review_required: boolean;
  is_corrected: boolean;
}

export interface ValidationRuleItem {
  rule_name: string;
  severity: "info" | "warning" | "error";
  message: string;
  passed: boolean;
}

export interface DocumentDetail extends DocumentItem {
  ocr_results: Array<{
    id: string;
    page_number: number;
    full_text: string;
    tokens: Array<{
      text: string;
      bbox: number[];
      confidence: number;
      page: number;
    }>;
    avg_confidence: number;
    duration: number;
  }>;
  extracted_fields: ExtractedFieldItem[];
  validation_results: ValidationRuleItem[];
  reviews: Array<{
    id: string;
    action: string;
    comments?: string;
    created_at: string;
  }>;
}

export interface AnalyticsData {
  total_documents: number;
  uploaded_today: number;
  processing_count: number;
  approved_count: number;
  review_required_count: number;
  failed_count: number;
  avg_processing_duration: number;
  overall_accuracy_rate: number;
  category_distribution: Record<string, number>;
  daily_volume: Array<{ date: string; documents: number }>;
  confidence_distribution: Record<string, number>;
}
