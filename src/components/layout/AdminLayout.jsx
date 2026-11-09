import React from "react";
import {
  Droplets,
  TrendingUp,
  ClipboardList,
  Wallet,
  Archive,
  Settings,
  LogOut,
  Truck,
  Bike,
} from "lucide-react";
import { tashkentDate } from "../../lib/dates";

const NAV = [
  { id: "dashboard", icon: TrendingUp,    title: "Boshqaruv paneli", label: "Analitika",     sub: "Holat paneli",          short: "Asosiy"   },
  { id: "orders",    icon: ClipboardList, title: "Buyurtmalar",      label: "Buyurtmalar",   sub: "Mijozlar oqimi",        short: "Buyurtma", badge: true },
  { id: "products",  icon: Archive,       title: "Mahsulotlar",      label: "Mahsulotlar",   sub: "Barcha mahsulotlar",    short: "Mahsulot" },
  { id: "delivery",  icon: Truck,         title: "Dostavka",         label: "Dostavka",      sub: "Hududlar va tariflar",  short: "Dostavka" },
  { id: "couriers",  icon: Bike,          title: "Kuryerlar",        label: "Kuryerlar",     sub: "Yetkazuvchilar",        short: "Kuryer"   },
  { id: "finance",   icon: Wallet,        title: "Kassa tarixi",     label: "Kassa tarixi",  sub: "Kirim / Chiqim",        short: "Kassa"    },
  { id: "settings",  icon: Settings,      title: "Sozlamalar",       label: "Sozlamalar",    sub: "Do'kon va aloqa",       short: "Sozlama"  },
];

export default function AdminLayout({
  children,
  adminTab,
  setAdminTab,
  onLogout,
  ordersLength,
  siteInfo,
}) {
  const current = NAV.find((n) => n.id === adminTab) || NAV[0];

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#f5f7fb] font-sans text-slate-800">

      {/* ══════ SIDEBAR (desktop) ══════ */}
      <aside className="admin-sidebar hidden h-full w-[250px] shrink-0 flex-col text-slate-800 md:flex">

        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173b78] text-white shadow-md shadow-blue-900/15">
            <Droplets size={19} />
          </div>
          <div>
            <div className="max-w-36 truncate text-sm font-extrabold tracking-tight text-[#0f2551]">
              {siteInfo?.name || "Santexnik"}
            </div>
            <div className="mt-0.5 text-[10px] font-bold tracking-[0.16em] text-slate-400">
              ADMIN PANEL
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-6 hide-scrollbar">
          <div className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
            Boshqaruv
          </div>
          <nav className="space-y-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = adminTab === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setAdminTab(n.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? "bg-[#edf3ff] text-[#173b78]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#173b78]"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    active ? "bg-[#173b78] text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-[#173b78]"
                  }`}>
                    <Icon size={17} />
                  </span>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-sm leading-tight">{n.label}</div>
                    <div className="mt-1 truncate text-[10px] text-slate-400">{n.sub}</div>
                  </div>
                  {n.badge && ordersLength > 0 && (
                    <span className="min-w-[20px] rounded-full bg-[#e32636] px-1.5 py-0.5 text-center text-[10px] font-extrabold text-white">
                      {ordersLength}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={15} /> Tizimdan chiqish
          </button>
        </div>
      </aside>

      {/* ══════ MAIN CONTENT ══════ */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full min-w-0">

        {/* Desktop topbar */}
        <header className="hidden h-[68px] shrink-0 items-center justify-between border-b border-slate-100 bg-white px-7 backdrop-blur md:flex">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow shadow-emerald-400/50" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Admin</span>
            <span className="text-slate-300">/</span>
            <h1 className="text-sm font-extrabold text-[#0f2551]">{current.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-500">
              {tashkentDate()}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf3ff] text-xs font-extrabold text-[#173b78]">
              A
            </div>
          </div>
        </header>

        {/* Mobile topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#173b78] rounded-lg flex items-center justify-center">
              <Droplets size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">{current.title}</span>
          </div>
          <button onClick={onLogout} aria-label="Tizimdan chiqish" className="text-slate-400 hover:text-red-500 p-1">
            <LogOut size={20} />
          </button>
        </header>

        {/* Content area */}
        <div className="hide-scrollbar flex-1 overflow-x-hidden overflow-y-auto p-4 pb-24 md:p-7 md:pb-7">
          {children}
        </div>
      </main>

      {/* ══════ MOBILE BOTTOM NAV ══════ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center overflow-x-auto border-t border-slate-200 bg-white/95 px-1 backdrop-blur md:hidden hide-scrollbar"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = adminTab === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setAdminTab(n.id)}
              className={`relative flex min-w-14 flex-1 flex-col items-center py-2.5 transition-colors ${
                active ? "text-[#173b78]" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={20} />
              <span className={`text-[9px] font-extrabold mt-1 ${active ? "text-[#173b78]" : ""}`}>
                {n.short}
              </span>
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#e32636]" />
              )}
              {n.badge && ordersLength > 0 && (
                <span className="absolute top-1.5 right-[18%] bg-[#e32636] text-white text-[8px] font-extrabold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                  {ordersLength}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
