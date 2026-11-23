import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FileText,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Download,
  CheckSquare,
  Sparkles,
  Layers,
  Code,
  ShieldCheck,
} from "lucide-react";
import { documentApi, exportApi } from "../api";
import { DocumentDetail } from "../types";
import { Badge } from "../components/Badge";

export const DocumentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"fields" | "ocr" | "validation" | "json">("fields");
  const [processing, setProcessing] = useState(false);

  const fetchDoc = async () => {
    if (!id) return;
    try {
      const res = await documentApi.get(id);
      setDoc(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoc();
  }, [id]);

  const handleProcess = async () => {
    if (!id) return;
    setProcessing(true);
    try {
      await documentApi.process(id);
      await fetchDoc();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading document details...</div>;
  }

  if (!doc) {
    return <div className="p-8 text-center text-slate-500 font-medium">Document not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to="/documents"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center space-x-2">
              <span>{doc.original_name}</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              ID: <span className="font-mono text-slate-700">{doc.id}</span> • Ingested:{" "}
              {new Date(doc.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleProcess}
            disabled={processing}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${processing ? "animate-spin" : ""}`} />
            <span>{processing ? "Extracting..." : "Re-run AI Pipeline"}</span>
          </button>

          <Link
            to={`/review?doc=${doc.id}`}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs transition-colors flex items-center space-x-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Review Center</span>
          </Link>

          <a
            href={exportApi.getDownloadUrl(doc.id, "json")}
            download
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Download JSON Export"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Meta Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category</span>
          <div className="text-base font-extrabold text-slate-900 mt-1">{doc.category}</div>
          <span className="text-[11px] text-indigo-600 font-mono font-semibold">
            {Math.round(doc.classification_confidence * 100)}% Confidence
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
          <div className="mt-1">
            <Badge
              variant={
                doc.status === "approved"
                  ? "success"
                  : doc.status === "review_required"
                  ? "warning"
                  : "info"
              }
            >
              {doc.status.replace("_", " ")}
            </Badge>
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            {doc.status === "review_required" ? "Action required" : "Pipeline complete"}
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pages / Tokens</span>
          <div className="text-base font-extrabold text-slate-900 mt-1">{doc.total_pages} Page(s)</div>
          <span className="text-[11px] text-slate-500 font-medium">
            {doc.ocr_results[0]?.tokens?.length ?? 0} OCR tokens detected
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Latency</span>
          <div className="text-base font-extrabold text-indigo-600 mt-1">{doc.processing_duration}s</div>
          <span className="text-[11px] text-slate-500 font-medium">Total pipeline execution</span>
        </div>
      </div>

      {/* View Tabs */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          {[
            { id: "fields", label: "Structured Fields", icon: Layers },
            { id: "ocr", label: "Raw OCR Text", icon: FileText },
            { id: "validation", label: "Business Rules", icon: ShieldCheck },
            { id: "json", label: "Extracted JSON", icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-700 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* TAB 1: Structured Fields */}
          {activeTab === "fields" && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                      <th className="py-2.5 px-3 font-bold">Field Name</th>
                      <th className="py-2.5 px-3 font-bold">Value</th>
                      <th className="py-2.5 px-3 font-bold">Confidence</th>
                      <th className="py-2.5 px-3 font-bold">Source Text / Evidence</th>
                      <th className="py-2.5 px-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doc.extracted_fields.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {f.field_label || f.field_name}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                          {f.current_value || f.extracted_value || (
                            <span className="text-slate-400 italic">null</span>
                          )}
                          {f.is_corrected && (
                            <span className="ml-2 text-[10px] text-amber-700 font-sans font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Edited
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-mono text-xs font-bold ${
                              f.confidence >= 0.9
                                ? "text-emerald-700"
                                : f.confidence >= 0.7
                                ? "text-amber-700"
                                : "text-rose-700"
                            }`}
                          >
                            {Math.round(f.confidence * 100)}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 truncate max-w-[280px]">
                          {f.source_text || "—"}
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant={
                              f.validation_status === "valid"
                                ? "success"
                                : f.validation_status === "warning"
                                ? "warning"
                                : "danger"
                            }
                          >
                            {f.validation_status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Raw OCR */}
          {activeTab === "ocr" && (
            <div className="space-y-4">
              <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed">
                {doc.ocr_results[0]?.full_text || "No OCR text extracted."}
              </pre>
            </div>
          )}

          {/* TAB 3: Business Rules & Validation */}
          {activeTab === "validation" && (
            <div className="space-y-3">
              {doc.validation_results.length > 0 ? (
                doc.validation_results.map((v, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs ${
                      v.passed
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : v.severity === "error"
                        ? "bg-rose-50 border-rose-200 text-rose-800"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}
                  >
                    {v.passed ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">{v.rule_name}</div>
                      <div className="text-[11px] mt-0.5 opacity-90 font-medium">{v.message}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-xs text-center py-6 font-medium">
                  No automated validation rules triggered for this document.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Extracted JSON */}
          {activeTab === "json" && (
            <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-sky-300 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
              {JSON.stringify(doc, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
