from typing import List, Dict, Any

class ValidationService:
    def validate_document(self, category: str, fields: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Executes business rule validations.
        Never alters values; flags discrepancies for human review.
        """
        results = []
        cat = category.lower()

        if "invoice" in cat:
            results.extend(self._validate_invoice(fields))
        elif "receipt" in cat:
            results.extend(self._validate_receipt(fields))
        elif "contract" in cat:
            results.extend(self._validate_contract(fields))
        elif "resume" in cat:
            results.extend(self._validate_resume(fields))
        elif "purchase" in cat:
            results.extend(self._validate_po(fields))

        return results

    def _validate_invoice(self, fields: Dict[str, Any]) -> List[Dict[str, Any]]:
        results = []
        # 1. Total Arithmetic Check: subtotal + tax - discount == total
        try:
            subtotal = float(fields.get("subtotal", {}).get("value") or 0.0)
            tax = float(fields.get("tax_amount", {}).get("value") or 0.0)
            discount = float(fields.get("discount_amount", {}).get("value") or 0.0)
            total = float(fields.get("total_amount", {}).get("value") or 0.0)

            expected_total = round(subtotal + tax - discount, 2)
            actual_total = round(total, 2)

            if abs(expected_total - actual_total) < 0.05:
                results.append({
                    "rule_name": "Invoice Arithmetic Equation",
                    "severity": "info",
                    "message": f"Arithmetic validated: {subtotal} + {tax} - {discount} == {total}",
                    "passed": True
                })
            else:
                results.append({
                    "rule_name": "Invoice Arithmetic Discrepancy",
                    "severity": "warning",
                    "message": f"Calculated total ({expected_total}) differs from stated total ({actual_total}) by {round(abs(expected_total - actual_total), 2)}",
                    "passed": False
                })
        except Exception as e:
            results.append({
                "rule_name": "Arithmetic Calculation Error",
                "severity": "warning",
                "message": f"Could not compute arithmetic: {str(e)}",
                "passed": False
            })

        # 2. Required Fields Check
        for req in ["invoice_number", "invoice_date", "total_amount", "seller_name"]:
            val = fields.get(req, {}).get("value")
            if not val:
                results.append({
                    "rule_name": f"Mandatory Field: {req}",
                    "severity": "error",
                    "message": f"Required invoice field '{req}' is missing or empty.",
                    "passed": False
                })

        return results

    def _validate_receipt(self, fields: Dict[str, Any]) -> List[Dict[str, Any]]:
        results = []
        total = fields.get("total_amount", {}).get("value")
        if total is None or float(total) <= 0:
            results.append({
                "rule_name": "Receipt Stated Total",
                "severity": "error",
                "message": "Total amount is missing or invalid on receipt.",
                "passed": False
            })
        else:
            results.append({
                "rule_name": "Receipt Stated Total",
                "severity": "info",
                "message": f"Total amount of {total} verified.",
                "passed": True
            })
        return results

    def _validate_contract(self, fields: Dict[str, Any]) -> List[Dict[str, Any]]:
        results = []
        eff = fields.get("effective_date", {}).get("value")
        exp = fields.get("expiration_date", {}).get("value")
        if eff and exp:
            results.append({
                "rule_name": "Contract Term Period",
                "severity": "info",
                "message": f"Effective term defined: {eff} through {exp}",
                "passed": True
            })
        else:
            results.append({
                "rule_name": "Contract Expiration Warning",
                "severity": "warning",
                "message": "Contract lacks an explicit expiration or effective date.",
                "passed": False
            })
        return results

    def _validate_resume(self, fields: Dict[str, Any]) -> List[Dict[str, Any]]:
        results = []
        email = str(fields.get("email", {}).get("value") or "")
        if "@" in email and "." in email:
            results.append({
                "rule_name": "Candidate Email Format",
                "severity": "info",
                "message": f"Valid email address detected: {email}",
                "passed": True
            })
        else:
            results.append({
                "rule_name": "Candidate Email Format",
                "severity": "warning",
                "message": "Candidate email missing or improperly formatted.",
                "passed": False
            })
        return results

    def _validate_po(self, fields: Dict[str, Any]) -> List[Dict[str, Any]]:
        results = []
        po_num = fields.get("po_number", {}).get("value")
        if po_num:
            results.append({
                "rule_name": "PO Reference Verification",
                "severity": "info",
                "message": f"Purchase Order reference '{po_num}' verified.",
                "passed": True
            })
        return results

validation_service = ValidationService()
