import React from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "purple" | "neutral";
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "neutral", children, className = "" }) => {
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    purple: "bg-indigo-50 text-indigo-700 border-indigo-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full border shadow-xs ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
