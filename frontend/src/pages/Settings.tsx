import React, { useState } from "react";
import { Settings as SettingsIcon, Shield, Server, Sliders, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [groqModel, setGroqModel] = useState("llama-3.3-70b-versatile");
  const [ocrEngine, setOcrEngine] = useState("hybrid-pymupdf");
  const [autoApproveThreshold, setAutoApproveThreshold] = useState("0.90");
  const [manualReviewThreshold, setManualReviewThreshold] = useState("0.70");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-slate-600" />
          <span>Platform Settings & Governance</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Configure model inference providers, OCR threshold policies, and organization parameters.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* User & Organization Profile */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>Organization Profile & Access Level</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Authenticated User</span>
            <div className="font-bold text-slate-900 mt-1">{user?.full_name}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Email Address</span>
            <div className="font-bold text-slate-900 mt-1">{user?.email}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Assigned Role</span>
            <div className="font-bold text-indigo-600 mt-1 capitalize">{user?.role}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Organization Tenant</span>
            <div className="font-bold text-slate-900 mt-1">{user?.organization_name}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Tenant Isolation ID</span>
            <div className="font-mono text-slate-700 font-medium mt-1">{user?.organization_id}</div>
          </div>
        </div>
      </div>

      {/* AI Extraction & OCR Configuration */}
      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl space-y-5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Server className="w-4 h-4 text-indigo-600" />
          <span>Inference & OCR Threshold Governance</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Groq LLM Model Provider
            </label>
            <select
              value={groqModel}
              onChange={(e) => setGroqModel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium"
            >
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
              <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
              <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              OCR Engine Subsystem
            </label>
            <select
              value={ocrEngine}
              onChange={(e) => setOcrEngine(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium"
            >
              <option value="hybrid-pymupdf">Hybrid PyMuPDF + Image Parser</option>
              <option value="paddleocr">PaddleOCR Enterprise Pipeline</option>
              <option value="tesseract">Tesseract OCR Fallback</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Auto-Approval Threshold (Confidence)
            </label>
            <input
              type="number"
              step="0.05"
              min="0.5"
              max="1.0"
              value={autoApproveThreshold}
              onChange={(e) => setAutoApproveThreshold(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono font-medium"
            />
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Documents exceeding this threshold bypass manual review.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Manual Review Trigger Threshold
            </label>
            <input
              type="number"
              step="0.05"
              min="0.3"
              max="0.9"
              value={manualReviewThreshold}
              onChange={(e) => setManualReviewThreshold(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono font-medium"
            />
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Fields below this score are automatically flagged in the HITL Review Center.
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-200">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
