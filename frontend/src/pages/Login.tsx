import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api";
import { Sparkles, ArrowRight, Lock, Mail, Building, ShieldCheck } from "lucide-react";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await authApi.register({
          email,
          password,
          full_name: fullName,
          organization_name: orgName,
        });
        login(res.data.access_token);
      } else {
        const res = await authApi.login({ email, password });
        login(res.data.access_token);
      }
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-indigo-50/30 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-200/40 via-sky-100/30 to-transparent blur-3xl pointer-events-none rounded-full"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-3">
            <div className="h-11 w-11 rounded-2xl bg-indigo-600 shadow-md shadow-indigo-600/20 flex items-center justify-center text-white">
              <Sparkles className="w-6 h-6 text-indigo-100" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              DocuMind <span className="text-indigo-600">AI</span>
            </h1>
          </div>
          <p className="text-sm text-slate-600 font-medium">
            Transform Unstructured Business Documents into Verified Intelligence
          </p>
        </div>

        {/* Clean Card */}
        <div className="glass-panel-elevated p-8 rounded-2xl relative shadow-lg">
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            {isRegister ? "Create Enterprise Account" : "Sign In to Platform"}
          </h2>
          <p className="text-xs text-slate-500 mb-6 font-medium">
            {isRegister
              ? "Access full-stack AI document extraction & audit pipelines"
              : "Welcome back. Enter your organization credentials to proceed."}
          </p>

          {error && (
            <div className="p-3 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 font-medium">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Organization</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Acme Financial Ltd."
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : isRegister ? "Create Account" : "Access Workspace"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts */}
          {!isRegister && (
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
                Instant Demo Credentials
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin@documind.ai", "AdminPass123!")}
                  className="px-2 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-colors shadow-2xs"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("reviewer@documind.ai", "ReviewerPass123!")}
                  className="px-2 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold transition-colors shadow-2xs"
                >
                  Reviewer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("charan@documind.ai", "password123")}
                  className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-colors shadow-2xs"
                >
                  Standard
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
            >
              {isRegister
                ? "Already have an account? Sign in"
                : "Need an account? Register your organization"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
