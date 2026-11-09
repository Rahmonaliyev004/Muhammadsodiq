import React from "react";
import { ChevronRight, Wrench } from "lucide-react";

export default function AdminLogin({ handleLogin, loginError, loggingIn }) {
  return (
    <div className="max-w-md mx-auto mt-6 md:mt-16 px-1 w-full">
      <div className="surface-card rounded-3xl p-6 md:p-10 text-center">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-brand text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand/20">
          <Wrench size={28} className="md:w-8 md:h-8" />
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 mb-2">
          Tizimga kirish
        </h2>
        <p className="text-slate-500 mb-8 text-xs md:text-sm">
          Admin boshqaruv paneliga xush kelibsiz
        </p>
        {loginError && (
          <div className="mb-4 text-left bg-red-50 border border-red-100 text-red-600 text-xs md:text-sm font-semibold px-4 py-3 rounded-xl">
            {loginError}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-left">
            <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Login
            </label>
            <input
              required
              name="login"
              type="text"
              placeholder="admin"
              autoComplete="username"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-lighter transition-all text-sm"
            />
          </div>
          <div className="text-left">
            <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Parol
            </label>
            <input
              required
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-lighter transition-all text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full bg-brand hover:bg-brand-light text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-brand/15 flex items-center justify-center gap-2 mt-4 text-sm md:text-base disabled:opacity-60"
          >
            {loggingIn ? "Tekshirilmoqda..." : "Kirish"}{" "}
            {!loggingIn && <ChevronRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
