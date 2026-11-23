import json
import csv
import io
from typing import List, Dict, Any
from openpyxl import Workbook

class ExportService:
    def export_json(self, document_dict: Dict[str, Any]) -> bytes:
        return json.dumps(document_dict, indent=2, default=str).encode("utf-8")

    def export_csv(self, fields_list: List[Dict[str, Any]]) -> bytes:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Field Name", "Extracted Value", "Confidence", "Source Page", "Validation Status"])
        for f in fields_list:
            writer.writerow([
                f.get("field_name", ""),
                f.get("current_value") or f.get("extracted_value", ""),
                f.get("confidence", 0.0),
                f.get("page", 1),
                f.get("validation_status", "valid")
            ])
        return output.getvalue().encode("utf-8")

    def export_excel(self, document_dict: Dict[str, Any], fields_list: List[Dict[str, Any]]) -> bytes:
        wb = Workbook()
        ws_summary = wb.active
        ws_summary.title = "Document Overview"

        ws_summary.append(["Document ID", document_dict.get("id")])
        ws_summary.append(["Original File", document_dict.get("original_name")])
        ws_summary.append(["Category", document_dict.get("category")])
        ws_summary.append(["Status", document_dict.get("status")])
        ws_summary.append(["Classification Confidence", document_dict.get("classification_confidence")])
        ws_summary.append([])

        ws_fields = wb.create_sheet(title="Extracted Intelligence")
        ws_fields.append(["Field Name", "Extracted Value", "Confidence", "Page", "Status", "Reviewed"])
        for f in fields_list:
            ws_fields.append([
                f.get("field_name"),
                f.get("current_value") or f.get("extracted_value"),
                f.get("confidence"),
                f.get("page"),
                f.get("validation_status"),
                "Yes" if f.get("is_corrected") else "No"
            ])

        output = io.BytesIO()
        wb.save(output)
        return output.getvalue()

export_service = ExportService()
