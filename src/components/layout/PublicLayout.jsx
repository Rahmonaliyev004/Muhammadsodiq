import React from "react";
import { Package, User, Phone, ShoppingBag, Home, Droplets } from "lucide-react";
import { SITE } from "../../lib/data";

const navBtn = (active) =>
  `rounded-full px-4 py-2 text-sm font-bold transition-all ${
    active
      ? "bg-white text-[#173b78] shadow-sm ring-1 ring-slate-200/80"
      : "text-slate-500 hover:text-[#173b78]"
  }`;

const mobileBtn = (active, extra = "") =>
  `flex-1 flex flex-col items-center py-2.5 rounded-xl transition-colors ${
    active ? extra || "text-[#e32636]" : "text-slate-400 hover:text-slate-600"
  }`;

export default function PublicLayout({ children, activeTab, setActiveTab, cartCount, siteInfo }) {
  const site = siteInfo || SITE;
  return (
    <div className="min-h-screen bg-white flex flex-col text-ink font-sans">
      <header className="sticky top-0 z-50 border-b border-white/70 glass-header shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <button type="button" className="flex items-center gap-3" onClick={() => setActiveTab("home")}>
            <div className="w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-[#315da7] to-[#173b78] rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-900/20 ring-1 ring-white/20">
              <Droplets size={20} strokeWidth={2.4} />
            </div>
            <span className="text-left">
              <span className="block font-extrabold text-lg md:text-xl text-[#173b78] leading-tight tracking-tight">
                {site.name}
              </span>
              <span className="hidden sm:block text-[11px] font-semibold text-slate-400 tracking-wide">
                Santexnika markazi
              </span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1 rounded-full bg-slate-50 p-1.5 ring-1 ring-slate-200/70">
            <button onClick={() => setActiveTab("home")} className={navBtn(activeTab === "home")}>
              Bosh sahifa
            </button>
            <button onClick={() => setActiveTab("catalog")} className={navBtn(activeTab === "catalog")}>
              Mahsulotlar
            </button>
            <button onClick={() => setActiveTab("admin")} className={navBtn(activeTab === "admin")}>
              Admin
            </button>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <a
              href={site.phoneHref}
              className="hidden sm:flex items-center gap-2 rounded-full bg-[#e32636] px-4 py-2.5 text-white font-extrabold text-sm md:text-base transition-colors hover:bg-[#ca1f2e]"
            >
              <Phone size={16} strokeWidth={2.5} /> <span>{site.phone}</span>
            </a>

            <button
              onClick={() => setActiveTab("calculator")}
              aria-label="Savatni ochish"
              className="relative btn-primary text-white w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-0.5"
            >
              <ShoppingBag size={20} strokeWidth={2.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#ef4444] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div
        className="md:hidden fixed bottom-2 left-3 right-3 bg-white/95 border border-slate-200/80 rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.16)] flex justify-between items-center z-50 px-2 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <button onClick={() => setActiveTab("home")} className={mobileBtn(activeTab === "home")}>
          <Home size={22} />
          <span className="text-[10px] font-bold mt-1">Asosiy</span>
        </button>
        <button onClick={() => setActiveTab("catalog")} className={mobileBtn(activeTab === "catalog")}>
          <Package size={22} />
          <span className="text-[10px] font-bold mt-1">Katalog</span>
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          className={`flex-1 flex flex-col items-center py-2.5 relative ${activeTab === "calculator" ? "text-orange-500" : "text-slate-400 hover:text-slate-600"}`}
        >
          <ShoppingBag size={22} />
          <span className="text-[10px] font-bold mt-1">Savat</span>
          {cartCount > 0 && (
            <span className="absolute top-1.5 right-[25%] bg-[#ef4444] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
              {cartCount}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab("admin")} className={mobileBtn(activeTab === "admin")}>
          <User size={22} />
          <span className="text-[10px] font-bold mt-1">Admin</span>
        </button>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:py-10 pb-28 md:pb-10">{children}</main>

      <footer className="mt-auto border-t border-slate-100 bg-white pb-24 pt-12 text-[#173b78] md:pb-8 md:pt-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-9 sm:grid-cols-2 md:grid-cols-3 md:gap-12">
            <div>
              <div className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
                <Droplets size={19} className="shrink-0 text-[#e32636]" />
                <span>{site.fullName}</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                Uyingiz uchun quvur, kran, nasos va boshqa santexnika mahsulotlari.
              </p>
            </div>

            <div>
              <h2 className="text-base font-extrabold">Sahifalar</h2>
              <nav className="mt-4 flex flex-col items-start gap-3 text-sm text-slate-600">
                <button onClick={() => setActiveTab("home")} className="transition hover:text-[#e32636]">
                  Bosh sahifa
                </button>
                <button onClick={() => setActiveTab("catalog")} className="transition hover:text-[#e32636]">
                  Mahsulotlar
                </button>
                <button onClick={() => setActiveTab("calculator")} className="transition hover:text-[#e32636]">
                  Savat / buyurtma
                </button>
              </nav>
            </div>

            <div>
              <h2 className="text-base font-extrabold">Aloqa</h2>
              <div className="mt-4 flex flex-col items-start gap-3 text-sm text-slate-600">
                <a href={site.phoneHref} className="transition hover:text-[#e32636]">
                  {site.phone}
                </a>
                {site.telegram && (
                  <a
                    href={site.telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-[#e32636]"
                  >
                    Telegramda yozish
                  </a>
                )}
                <p>{site.address}</p>
                {site.storeHours ? <p>{site.storeHours}</p> : null}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-5 text-sm text-slate-500">
            © {new Date().getFullYear()} {site.fullName}. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>
    </div>
  );
}
