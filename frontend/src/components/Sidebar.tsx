import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UploadCloud,
  Files,
  CheckSquare,
  ShieldCheck,
  Download,
  BarChart3,
  Settings,
  Sparkles
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/upload", label: "Upload Documents", icon: UploadCloud },
    { to: "/documents", label: "All Documents", icon: Files },
    { to: "/review", label: "Review Center", icon: CheckSquare, badge: "HITL" },
    { to: "/validation", label: "Validation Engine", icon: ShieldCheck },
    { to: "/exports", label: "Data Export", icon: Download },
    { to: "/analytics", label: "Analytics & Metrics", icon: BarChart3 },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white/90 backdrop-blur-md flex flex-col justify-between py-5 shrink-0 shadow-xs">
      <div className="px-4 space-y-1">
        <div className="px-3 pb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Core Intelligence
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Enterprise Architecture Footer */}
      <div className="px-4 pt-4 border-t border-slate-100">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Hybrid OCR + Groq</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
            Sub-second Llama 3.3 extraction with deterministic confidence scoring.
          </p>
        </div>
      </div>
    </aside>
  );
};
