import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { analyticsApi, documentApi } from "../api";
import { AnalyticsData, DocumentItem } from "../types";
import { Badge } from "../components/Badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";

const COLORS = ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"];

export const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentDocs, setRecentDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, dRes] = await Promise.all([
          analyticsApi.getOverview(),
          documentApi.list({}),
        ]);
        setAnalytics(aRes.data);
        setRecentDocs(dRes.data.slice(0, 5));
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryPieData = analytics?.category_distribution
    ? Object.entries(analytics.category_distribution).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center space-x-2">
            <span>Enterprise Intelligence Dashboard</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Real-time telemetry, model extraction accuracy, and human-in-the-loop review pipeline.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/upload"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Documents</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Documents
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">
                {analytics?.total_documents ?? 0}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-700 font-semibold space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{analytics?.uploaded_today ?? 0} uploaded today</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Review Required (HITL)
              </div>
              <div className="text-3xl font-extrabold text-amber-600 mt-2">
                {analytics?.review_required_count ?? 0}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500 font-medium space-x-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending manual verification</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Approved & Verified
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-2">
                {analytics?.approved_count ?? 0}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-700 font-semibold space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Passed business rules & audit</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pipeline Latency
              </div>
              <div className="text-3xl font-extrabold text-indigo-600 mt-2">
                {analytics?.avg_processing_duration ?? 0}s
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-indigo-600 font-semibold space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Groq Llama 3.3 70B inference</span>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Processing Volume Trend */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Ingestion & Processing Volume</h3>
              <p className="text-xs text-slate-500 font-medium">Extracted document throughput over the last 7 days</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.daily_volume || []}>
                <defs>
                  <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    color: "#0F172A",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.07)"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="documents"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#volumeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Document Classification Distribution */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Document Categories</h3>
            <p className="text-xs text-slate-500 font-medium">Multi-signal classification breakdown</p>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            {categoryPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "12px",
                      color: "#0F172A",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No category data yet</div>
            )}
          </div>
          <div className="mt-2 space-y-1.5">
            {categoryPieData.map((cat, i) => (
              <div key={cat.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  ></span>
                  <span className="text-slate-700 font-medium">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-900">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Processing Stream */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Documents</h3>
            <p className="text-xs text-slate-500 font-medium">Latest pipeline executions and validation status</p>
          </div>
          <Link
            to="/documents"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                <th className="py-3 px-3 font-bold">Document Name</th>
                <th className="py-3 px-3 font-bold">Category</th>
                <th className="py-3 px-3 font-bold">Status</th>
                <th className="py-3 px-3 font-bold">Confidence</th>
                <th className="py-3 px-3 font-bold">Pages</th>
                <th className="py-3 px-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentDocs.length > 0 ? (
                recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{doc.original_name}</td>
                    <td className="py-3 px-3">
                      <span className="text-slate-700 font-medium">{doc.category}</span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          doc.status === "approved"
                            ? "success"
                            : doc.status === "review_required"
                            ? "warning"
                            : doc.status === "failed"
                            ? "danger"
                            : "info"
                        }
                      >
                        {doc.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full ${
                              doc.classification_confidence >= 0.9
                                ? "bg-emerald-500"
                                : doc.classification_confidence >= 0.7
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${doc.classification_confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-slate-600 font-mono font-medium">
                          {Math.round(doc.classification_confidence * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{doc.total_pages}</td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No documents processed yet. Click "Upload New Documents" to begin.
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
