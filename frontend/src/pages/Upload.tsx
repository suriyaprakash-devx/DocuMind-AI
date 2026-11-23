import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { documentApi } from "../api";

export const Upload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [autoProcess, setAutoProcess] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (incoming: File[]) => {
    setError(null);
    const valid = incoming.filter((f) => {
      const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
      return [".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".docx", ".xlsx", ".txt"].includes(ext);
    });

    if (valid.length < incoming.length) {
      setError("Some files were skipped: supported formats are PDF, PNG, JPG, JPEG, TIFF, DOCX, XLSX, and TXT.");
    }
    setFiles((prev) => [...prev, ...valid]);
  };

  const startUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);

    const uploaded = [];
    try {
      for (const file of files) {
        const res = await documentApi.upload(file);
        const doc = res.data;
        uploaded.push(doc);

        if (autoProcess) {
          // Trigger the AI processing pipeline immediately
          await documentApi.process(doc.id);
        }
      }
      setUploadedDocs(uploaded);
      setFiles([]);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Upload or processing failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Upload Documents</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Supported file formats: PDF (Vector & Scanned), PNG, JPG, JPEG, TIFF, DOCX, XLSX, and TXT.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`glass-panel p-12 rounded-2xl border-2 border-dashed transition-all text-center relative overflow-hidden ${
          dragActive
            ? "border-indigo-500 bg-indigo-50/50 scale-[1.01]"
            : "border-slate-300 hover:border-indigo-400 bg-white"
        }`}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.tiff,.docx,.xlsx,.txt"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Drag & Drop invoices, contracts, receipts, or resumes here
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              or{" "}
              <label htmlFor="file-upload" className="text-indigo-600 hover:underline cursor-pointer font-bold">
                browse from your computer
              </label>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {["PDF (Vector & Scanned)", "PNG / JPG", "TIFF", "DOCX", "Excel XLSX", "TXT"].map((fmt) => (
              <span key={fmt} className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Staged Files List */}
      {files.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Selected Files ({files.length})
            </h3>
            <button
              onClick={() => setFiles([])}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold"
            >
              Clear All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {files.map((f, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-slate-800">{f.name}</span>
                  <span className="text-slate-500 font-mono">
                    ({(f.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                  className="text-slate-400 hover:text-rose-600 font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={autoProcess}
                onChange={(e) => setAutoProcess(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Trigger instant OCR & AI Extraction pipeline on upload</span>
            </label>

            <button
              onClick={startUpload}
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>{uploading ? "Ingesting & Processing..." : "Start Upload Pipeline"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Completed Uploads Result */}
      {uploadedDocs.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl space-y-4 border-emerald-200 bg-emerald-50/20">
          <div className="flex items-center space-x-2 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold">
              Successfully Ingested & Processed ({uploadedDocs.length}) Document(s)
            </h3>
          </div>

          <div className="space-y-2">
            {uploadedDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-2xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{doc.original_name}</span>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Category: <span className="text-indigo-600 font-semibold">{doc.category}</span> • Status: <span className="capitalize">{doc.status.replace("_", " ")}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold flex items-center space-x-1"
                >
                  <span>Inspect Extraction</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
