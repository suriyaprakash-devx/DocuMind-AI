import React, { useEffect, useState } from "react";
import { Download, FileJson, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";
import { documentApi, exportApi } from "../api";
import { DocumentItem } from "../types";

export const Exports: React.FC = () => {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await documentApi.list({});
        setDocs(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center space-x-2">
          <Download className="w-6 h-6 text-indigo-600" />
          <span>Structured Data Export Center</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Export verified document entities, line items, and audit metadata into enterprise JSON, CSV, and Excel spreadsheets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 w-fit mb-3">
            <FileJson className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Full JSON Payload</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Complete document schema including OCR token coordinates, confidence scores, and audit corrections.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 w-fit mb-3">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Microsoft Excel (.xlsx)</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Multi-tab workbook containing high-level metadata and a dedicated tab for extracted field values.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 w-fit mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Tabular CSV</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Lightweight delimiter format optimized for immediate ingestion into ERP, CRM, or ETL pipelines.
          </p>
        </div>
      </div>

      {/* Documents Export Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-bold text-slate-900">Available Verified Documents</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                <th className="py-3 px-4 font-bold">Document Name</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Download Formats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.length > 0 ? (
                docs.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{d.original_name}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{d.category}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-bold text-indigo-700 capitalize bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        {d.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a
                          href={exportApi.getDownloadUrl(d.id, "json")}
                          download
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold transition-colors"
                        >
                          JSON
                        </a>
                        <a
                          href={exportApi.getDownloadUrl(d.id, "xlsx")}
                          download
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-colors"
                        >
                          Excel (.xlsx)
                        </a>
                        <a
                          href={exportApi.getDownloadUrl(d.id, "csv")}
                          download
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-colors"
                        >
                          CSV
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                    No documents uploaded yet. Upload documents to enable structured export.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
