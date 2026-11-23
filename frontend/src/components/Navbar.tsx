import React from "react";
import { useAuth } from "../context/AuthContext";
import { Sparkles, LogOut, CheckCircle2 } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 p-[1px] shadow-sm flex items-center justify-center">
          <div className="h-full w-full bg-indigo-600 rounded-[11px] flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              DocuMind <span className="text-indigo-600">AI</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Enterprise v1.0
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Status Pill */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Groq AI Pipeline Active</span>
        </div>

        {/* User profile & Role */}
        {user && (
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800">{user.full_name}</div>
              <div className="text-[11px] text-slate-500 flex items-center justify-end space-x-1 font-medium">
                <span className="capitalize">{user.role}</span>
                <span>•</span>
                <span className="text-indigo-600 font-semibold">{user.organization_name}</span>
              </div>
            </div>
            
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user.full_name.charAt(0)}
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
