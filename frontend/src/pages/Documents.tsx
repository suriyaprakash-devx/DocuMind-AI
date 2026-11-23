import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  Filter,
  Play,
  CheckSquare,
  Trash2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { documentApi } from "../api";
import { DocumentItem } from "../types";
import { Badge } from "../components/Badge";

export const Documents: React.FC = () => {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await documentApi.list({ search, category, status });
      setDocs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [category, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocs();
  };

  const handleProcess = async (id: string) => {
    setProcessingId(id);
    try {
      await documentApi.process(id);
      await fetchDocs();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await documentApi.delete(id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">All Documents</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Enterprise document repository with multi-signal classification & extraction status.
          </p>
        </div>
        <Link
          to="/upload"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
        >
          Upload New Document
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by file name or keyword..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs font-medium"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs text-slate-600 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Invoice">Invoice</option>
              <option value="Receipt">Receipt</option>
              <option value="Contract">Contract</option>
              <option value="Resume">Resume</option>
              <option value="Purchase Order">Purchase Order</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-600 font-semibold">
            <span>Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="uploaded">Uploaded</option>
              <option value="processing">Processing</option>
              <option value="review_required">Review Required</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button
            onClick={fetchDocs}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="py-3.5 px-4 font-bold">Document</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Confidence</th>
                <th className="py-3.5 px-4 font-bold">Pages</th>
                <th className="py-3.5 px-4 font-bold">Upload Date</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.length > 0 ? (
                docs.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="truncate max-w-[200px]" title={d.original_name}>
                        {d.original_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{d.category}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          d.status === "approved"
                            ? "success"
                            : d.status === "review_required"
                            ? "warning"
                            : d.status === "rejected"
                            ? "danger"
                            : "info"
                        }
                      >
                        {d.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-700">
                        {Math.round(d.classification_confidence * 100)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{d.total_pages}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleProcess(d.id)}
                          disabled={processingId === d.id}
                          title="Run / Re-run AI Pipeline"
                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                        >
                          <Play className={`w-3.5 h-3.5 ${processingId === d.id ? "animate-spin" : ""}`} />
                        </button>
                        <Link
                          to={`/documents/${d.id}`}
                          title="View Details"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        {d.status === "review_required" && (
                          <Link
                            to={`/review?doc=${d.id}`}
                            title="Open in Review Center"
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 transition-colors"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleDelete(d.id)}
                          title="Delete Document"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                    {loading ? "Loading documents..." : "No documents match the current filter criteria."}
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
