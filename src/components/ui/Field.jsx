import React from "react";

export const inputClass =
  "w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-brand-light focus:ring-2 focus:ring-brand-lighter text-sm transition-all";

// Yorliq + kiritish maydoni + xato matni
export default function Field({ label, error, required, hint, children, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[11px] md:text-xs font-bold text-slate-500 mb-1.5">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
      {error && (
        <p className="text-[11px] md:text-xs text-red-600 font-medium mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const borderFor = (error) => (error ? "border-red-400" : "border-slate-200");
