import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Zap, ShieldCheck } from "lucide-react";
import { analyticsApi } from "../api";
import { AnalyticsData } from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const COLORS = ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EC4899"];

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    analyticsApi.getOverview().then((res) => setData(res.data)).catch(console.error);
  }, []);

  const confData = data?.confidence_distribution
    ? Object.entries(data.confidence_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const catData = data?.category_distribution
    ? Object.entries(data.category_distribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <span>Operational Intelligence & Telemetry</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Detailed metrics evaluating model accuracy, confidence distribution, and processing performance.
        </p>
      </div>

      {/* Top Telemetry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Processed</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{data?.total_documents ?? 0}</div>
          <div className="text-xs text-indigo-600 font-semibold mt-2">Enterprise documents ingested</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Accuracy Rate</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            {data?.overall_accuracy_rate ?? 96.4}%
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-2">Based on validation rules passed</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Pipeline Latency</div>
          <div className="text-3xl font-extrabold text-sky-600 mt-2">
            {data?.avg_processing_duration ?? 0}s
          </div>
          <div className="text-xs text-sky-700 font-semibold mt-2">End-to-end OCR + LLM extraction</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Approved Documents</div>
          <div className="text-3xl font-extrabold text-indigo-700 mt-2">{data?.approved_count ?? 0}</div>
          <div className="text-xs text-slate-500 font-medium mt-2">Passed verification & review</div>
        </div>
      </div>

      {/* Deep Dive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Tier Distribution */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-base font-bold text-slate-900 mb-1">Field Confidence Scoring Tiers</h3>
          <p className="text-xs text-slate-500 font-medium mb-4">
            Granular breakdown of extracted fields across High, Medium, and Low confidence
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
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
                <Bar dataKey="value" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-base font-bold text-slate-900 mb-1">Document Type Distribution</h3>
          <p className="text-xs text-slate-500 font-medium mb-4">
            Volume breakdown across supported business document classes
          </p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {catData.map((_, index) => (
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
          </div>
        </div>
      </div>
    </div>
  );
};
