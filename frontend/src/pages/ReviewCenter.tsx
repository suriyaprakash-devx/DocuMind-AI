import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Save,
  AlertTriangle,
  FileText,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import confetti from "canvas-confetti";
import { documentApi, reviewApi } from "../api";
import { DocumentDetail, ExtractedFieldItem } from "../types";
import { Badge } from "../components/Badge";

export const ReviewCenter: React.FC = () => {
  const [searchParams] = useSearchParams();
  const docIdParam = searchParams.get("doc");
  const navigate = useNavigate();

  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(docIdParam);
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [savingField, setSavingField] = useState<string | null>(null);
  const [actionComments, setActionComments] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Load pending reviews queue
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await reviewApi.getPending();
        setPendingDocs(res.data);
        if (!selectedDocId && res.data.length > 0) {
          setSelectedDocId(res.data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchPending();
  }, []);

  // Fetch selected document details
  useEffect(() => {
    if (!selectedDocId) {
      setLoading(false);
      return;
    }
    const fetchDoc = async () => {
      setLoading(true);
      try {
        const res = await documentApi.get(selectedDocId);
        setDoc(res.data);
        const map: Record<string, string> = {};
        res.data.extracted_fields.forEach((f) => {
          map[f.id] = f.current_value || f.extracted_value || "";
        });
        setFieldValues(map);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [selectedDocId]);

  const handleFieldChange = (fieldId: string, val: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleSaveField = async (field: ExtractedFieldItem) => {
    if (!doc) return;
    setSavingField(field.id);
    try {
      await reviewApi.updateField(doc.id, field.id, {
        corrected_value: fieldValues[field.id],
        reason: "User verification adjustment in Review Center",
      });
      setNotification(`Field '${field.field_label || field.field_name}' updated successfully.`);
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingField(null);
    }
  };

  const handleApprove = async () => {
    if (!doc) return;
    try {
      await reviewApi.approve(doc.id, actionComments);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      // Remove from pending list
      setPendingDocs((prev) => prev.filter((p) => p.id !== doc.id));
      setDoc((prev) => (prev ? { ...prev, status: "approved" } : null));
      setNotification("Document successfully approved and verified.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async () => {
    if (!doc) return;
    try {
      await reviewApi.reject(doc.id, actionComments);
      setPendingDocs((prev) => prev.filter((p) => p.id !== doc.id));
      setDoc((prev) => (prev ? { ...prev, status: "rejected" } : null));
      setNotification("Document rejected.");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center space-x-2">
            <span>Human-in-the-Loop Review Center</span>
            <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              HITL Gate
            </span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Audit extracted intelligence side-by-side with document evidence. Ensure 100% data integrity before export.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Pending Queue & Document Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Pending Queue Selector */}
          <div className="glass-panel p-4 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Pending Review Queue ({pendingDocs.length})
            </h3>
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {pendingDocs.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedDocId(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedDocId === p.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {p.original_name}
                </button>
              ))}
            </div>
          </div>

          {/* Document Preview & OCR Text Pane */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Document Evidence View</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono font-medium">
                {doc?.category} • {doc?.total_pages} page(s)
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-[520px] overflow-y-auto space-y-3 font-mono text-xs text-slate-800">
              <div className="text-[11px] text-indigo-700 font-bold mb-2">
                === Extracted OCR Text Layout ===
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">
                {doc?.ocr_results[0]?.full_text || "No OCR evidence available for this document."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Editable Structured Fields & Approval Bar (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Extracted Fields & Verification</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Edit values directly. Every adjustment is recorded in the permanent audit trail.
                </p>
              </div>
              <Badge
                variant={
                  doc?.status === "approved"
                    ? "success"
                    : doc?.status === "rejected"
                    ? "danger"
                    : "warning"
                }
              >
                {doc?.status?.replace("_", " ")}
              </Badge>
            </div>

            {/* Field Inputs */}
            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
              {doc?.extracted_fields?.map((field) => {
                const confPercent = Math.round(field.confidence * 100);
                const isUncertain = field.confidence < 0.85 || field.review_required;

                return (
                  <div
                    key={field.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isUncertain
                        ? "bg-amber-50/60 border-amber-300"
                        : "bg-white border-slate-200 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <label className="text-xs font-bold text-slate-800">
                          {field.field_label || field.field_name}
                        </label>
                        {isUncertain && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                            Low Confidence
                          </span>
                        )}
                        {field.is_corrected && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Edited
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-mono text-xs font-bold ${
                            confPercent >= 90
                              ? "text-emerald-700"
                              : confPercent >= 70
                              ? "text-amber-700"
                              : "text-rose-700"
                          }`}
                        >
                          {confPercent}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">P.{field.page}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={fieldValues[field.id] || ""}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono font-medium text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveField(field)}
                        disabled={savingField === field.id}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center space-x-1 shrink-0 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>

                    {field.source_text && (
                      <div className="text-[11px] text-slate-500 mt-1 truncate">
                        Evidence: <span className="italic text-slate-700 font-mono font-medium">"{field.source_text}"</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Approval / Rejection Action Controls */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <input
                type="text"
                placeholder="Reviewer notes / audit remarks (optional)..."
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-medium"
              />

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Document</span>
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Validate Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
