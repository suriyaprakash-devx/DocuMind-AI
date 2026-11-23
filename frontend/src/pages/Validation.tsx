import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, AlertTriangle, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { documentApi } from "../api";
import { DocumentDetail } from "../types";

export const Validation: React.FC = () => {
  const [docs, setDocs] = useState<DocumentDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const listRes = await documentApi.list({});
        // Fetch detailed results for first 8
        const detailed = await Promise.all(
          listRes.data.slice(0, 8).map((d) => documentApi.get(d.id).then((r) => r.data))
        );
        setDocs(detailed);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <span>Automated Business Rule Validation Engine</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Algorithmic consistency checks, invoice arithmetic equations, date format verification, and mandatory fields.
        </p>
      </div>

      <div className="space-y-4">
        {docs.map((doc) => {
          const passCount = doc.validation_results.filter((v) => v.passed).length;
          const totalCount = doc.validation_results.length;

          return (
            <div key={doc.id} className="glass-panel p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{doc.original_name}</h3>
                    <span className="text-xs text-slate-500 font-medium">
                      Category: <span className="text-indigo-600 font-bold">{doc.category}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {passCount}/{totalCount} Rules Passed
                  </span>
                  <Link
                    to={`/documents/${doc.id}`}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {doc.validation_results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {doc.validation_results.map((r, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border flex items-start space-x-2.5 text-xs ${
                        r.passed
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-amber-50 border-amber-200 text-amber-800"
                      }`}
                    >
                      {r.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold">{r.rule_name}</div>
                        <div className="text-[11px] mt-0.5 opacity-90 font-medium">{r.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-2 font-medium">
                  No automated validation rules triggered for this document.
                </div>
              )}
            </div>
          );
        })}

        {docs.length === 0 && !loading && (
          <div className="glass-panel p-8 text-center text-slate-400 text-xs font-medium">
            No documents available for validation. Upload documents to inspect validation results.
          </div>
        )}
      </div>
    </div>
  );
};
