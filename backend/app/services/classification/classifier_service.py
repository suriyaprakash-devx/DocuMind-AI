import re
from typing import Tuple, Dict, Any
from app.core.config import settings

CATEGORIES = [
    "Invoice",
    "Receipt",
    "Contract",
    "Resume",
    "Purchase Order",
    "Bank Statement",
    "Other"
]

class ClassifierService:
    def classify(self, text: str, filename: str) -> Tuple[str, float, str]:
        """
        Classifies document based on content signals and file naming patterns.
        Returns: (category, confidence, explanation)
        """
        normalized_text = text.lower()
        fn = filename.lower()

        # Score containers
        scores = {cat: 0.0 for cat in CATEGORIES}

        # 1. Filename heuristic boost
        if any(w in fn for w in ["invoice", "inv-", "bill-"]):
            scores["Invoice"] += 0.35
        if any(w in fn for w in ["receipt", "rcpt-", "ticket"]):
            scores["Receipt"] += 0.35
        if any(w in fn for w in ["contract", "agreement", "nda", "sla"]):
            scores["Contract"] += 0.35
        if any(w in fn for w in ["resume", "cv", "curriculum_vitae", "biodata"]):
            scores["Resume"] += 0.40
        if any(w in fn for w in ["po-", "po_", "purchase_order", "purchase-order"]):
            scores["Purchase Order"] += 0.40
        if any(w in fn for w in ["statement", "bank", "account_stmt"]):
            scores["Bank Statement"] += 0.35

        # 2. Key phrase & layout signal matching
        # Invoice signals
        inv_matches = re.findall(r"\b(invoice|subtotal|tax\s+id|amount\s+due|due\s+date|vat\s+reg|bill\s+to|remit\s+to|gstin)\b", normalized_text)
        scores["Invoice"] += min(len(inv_matches) * 0.12, 0.65)

        # Receipt signals
        rcpt_matches = re.findall(r"\b(receipt|cashier|pos|change\s+due|subtotal|terminal|store\s+#|card\s+tender|visa\s+\*+|mastercard\s+\*+)\b", normalized_text)
        scores["Receipt"] += min(len(rcpt_matches) * 0.12, 0.65)

        # Contract signals
        contract_matches = re.findall(r"\b(agreement|parties|whereas|governing\s+law|jurisdiction|indemnification|severability|confidentiality|in\s+witness\s+whereof)\b", normalized_text)
        scores["Contract"] += min(len(contract_matches) * 0.15, 0.70)

        # Resume signals
        resume_matches = re.findall(r"\b(experience|education|skills|certifications|curriculum\s+vitae|bachelor|master|university|phone|email|linkedin|work\s+history)\b", normalized_text)
        scores["Resume"] += min(len(resume_matches) * 0.15, 0.70)

        # Purchase order signals
        po_matches = re.findall(r"\b(purchase\s+order|p\.o\.\s+number|vendor|ship\s+to|order\s+date|requisition|delivery\s+date)\b", normalized_text)
        scores["Purchase Order"] += min(len(po_matches) * 0.14, 0.65)

        # Bank statement signals
        bank_matches = re.findall(r"\b(statement\s+period|opening\s+balance|closing\s+balance|withdrawals|deposits|account\s+number|transaction\s+history)\b", normalized_text)
        scores["Bank Statement"] += min(len(bank_matches) * 0.15, 0.65)

        best_category = max(scores, key=scores.get)
        confidence = min(round(scores[best_category], 2), 0.98)

        if confidence < 0.40:
            return "Other", 0.35, "Document contains insufficient distinct terminology to classify with high confidence."

        explanation = f"Classified as {best_category} with confidence {confidence * 100:.1f}% based on layout keywords and lexical signals."
        return best_category, confidence, explanation

classifier_service = ClassifierService()
