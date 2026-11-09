import React, { useEffect, useState } from "react";
import {
  Wallet,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  Truck,
  BadgeDollarSign,
  Inbox,
  ArrowRight,
} from "lucide-react";
import { fmt, fmtQty, unitLabel, STATUS_STYLES } from "../../../lib/data";
import { api } from "../../../lib/api";
import { toast } from "../../../lib/toast";

const MONTHS = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];

/* ══════ Stat karta ══════ */
function StatCard({ icon: Icon, label, value, sub, iconBg, iconColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group w-full cursor-pointer rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-[0_4px_18px_rgba(15,37,81,0.04)] transition-all hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_12px_28px_rgba(15,37,81,0.09)] sm:p-5"
    >
      <div className="flex min-h-11 items-start justify-between gap-2">
        <p className="line-clamp-2 min-w-0 pt-1 text-[10px] font-extrabold uppercase leading-4 tracking-wider text-slate-400 sm:tracking-widest">
          {label}
        </p>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 sm:h-11 sm:w-11 ${iconBg}`}>
          <Icon size={20} className={iconColor} strokeWidth={2.2} />
        </div>
      </div>
      <h3 className="mt-2 whitespace-nowrap text-[clamp(1.05rem,5vw,1.5rem)] font-black leading-tight tracking-tight text-[#0f2551] sm:text-2xl">
        {value}
      </h3>
      {sub && <p className="mt-1.5 text-[10px] font-medium leading-snug text-slate-400 sm:text-[11px]">{sub}</p>}
    </button>
  );
}

/* ══════ Sektsiya sarlavhasi ══════ */
function SectionTitle({ label, title }) {
  return (
    <div className="mb-5">
      {label && (
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#e32636] mb-1">{label}</p>
      )}
      <h2 className="text-base font-extrabold text-[#0f2551]">{title}</h2>
    </div>
  );
}

export default function DashboardTab({ stats: initialStats, orders, setAdminTab, loading }) {
  const [apiStats, setApiStats] = useState(null);
  const stats = apiStats || initialStats;

  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      try {
        const { data } = await api("/api/dashboard");
        if (cancelled) return;
        if (!data?.ok) {
          toast.error(data?.error || "Dashboard ma'lumotlarini yuklab bo'lmadi.");
          return;
        }
        setApiStats(data.stats);
      } catch {
        if (!cancelled) toast.error("Dashboard ma'lumotlarini yuklab bo'lmadi.");
      }
    };

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [initialStats]);

  const maxSales = Math.max(1, ...stats.months.map((m) => m.sales));
  const maxOrders = Math.max(1, ...stats.months.map((m) => m.orders));
  const chartWidth = 720;
  const chartTop = 22;
  const chartBottom = 174;
  const chartPoints = stats.months.map((month, index) => {
    const x = stats.months.length <= 1
      ? chartWidth / 2
      : (index / (stats.months.length - 1)) * chartWidth;
    return {
      month,
      x,
      salesY: chartBottom - (month.sales / maxSales) * (chartBottom - chartTop),
      ordersY: chartBottom - (month.orders / maxOrders) * (chartBottom - chartTop),
    };
  });
  const salesLine = chartPoints.map(({ x, salesY }) => `${x},${salesY}`).join(" ");
  const ordersLine = chartPoints.map(({ x, ordersY }) => `${x},${ordersY}`).join(" ");
  const salesArea = chartPoints.length
    ? `0,${chartBottom} ${salesLine} ${chartWidth},${chartBottom}`
    : "";

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e32636]">Xush kelibsiz</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0f2551] sm:text-3xl">
            Boshqaruv paneli
          </h2>
        </div>
        <p className="text-xs font-medium text-slate-500">
          Do‘koningizning bugungi holati va asosiy ko‘rsatkichlari
        </p>
      </div>

      {loading && (
        <p className="animate-pulse text-xs font-medium text-slate-400">Ma&apos;lumotlar yuklanmoqda...</p>
      )}

      {/* ── Bugungi statistika ── */}
      <div>
        <SectionTitle label="Bugun" title="Joriy holat" />
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard
            icon={ClipboardList}
            label="Bugungi buyurtmalar"
            value={stats.todayOrders}
            sub="bekor qilinmaganlar"
            iconBg="bg-blue-50"
            iconColor="text-[#173b78]"
            onClick={() => setAdminTab("orders")}
          />
          <StatCard
            icon={Inbox}
            label="Yangi buyurtmalar"
            value={stats.newOrders}
            sub="ko'rib chiqilmagan"
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            onClick={() => setAdminTab("orders")}
          />
          <StatCard
            icon={Truck}
            label="Yetkazilishi kerak"
            value={stats.toDeliver}
            sub={
              stats.needsOperator > 0
                ? `${stats.needsOperator} tasi kutmoqda`
                : "yakunlanmagan"
            }
            iconBg="bg-orange-50"
            iconColor="text-orange-500"
            onClick={() => setAdminTab("orders")}
          />
          <StatCard
            icon={BadgeDollarSign}
            label="Bugungi savdo"
            value={`${fmt(stats.todaySales)}`}
            sub="so'm (bekor qilinmaganlar)"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            onClick={() => setAdminTab("orders")}
          />
        </div>
      </div>

      {/* ── Moliyaviy statistika ── */}
      <div>
        <SectionTitle label="Moliya" title="Kassa va ombor" />
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {/* Balans */}
          <div className="min-[380px]:col-span-2 rounded-2xl bg-gradient-to-br from-[#173b78] to-[#0f2551] p-5 text-white shadow-[0_12px_28px_rgba(15,37,81,0.18)] lg:col-span-1">
            <div className="flex items-start justify-between gap-2 mb-4">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200">Kassa Balansi</p>
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                <Wallet size={18} className="text-blue-200" />
              </div>
            </div>
            <h3 className="text-2xl font-black tracking-tight">{fmt(stats.totalIncome - stats.totalExpense)}</h3>
            <span className="mt-3 inline-block text-[10px] font-bold text-blue-200 bg-white/10 px-2.5 py-1 rounded-lg">
              so&apos;m · Joriy holat
            </span>
          </div>

          {/* Kirim */}
          <StatCard
            icon={TrendingUp}
            label="Umumiy Kirim"
            value={fmt(stats.totalIncome)}
            sub="so'm · barcha tushumlar"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            onClick={() => setAdminTab("finance")}
          />

          {/* Chiqim */}
          <StatCard
            icon={TrendingDown}
            label="Umumiy Chiqim"
            value={fmt(stats.totalExpense)}
            sub="so'm · barcha xarajatlar"
            iconBg="bg-rose-50"
            iconColor="text-rose-500"
            onClick={() => setAdminTab("finance")}
          />

          {/* Ombor */}
          <StatCard
            icon={Package}
            label="Ombor Qoldig'i"
            value={stats.totalItems}
            sub={`${stats.totalProducts} xil turdagi mahsulot`}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            onClick={() => setAdminTab("products")}
          />
        </div>
      </div>

      {/* ── Oylik savdo + Kam qolganlar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">

        {/* Oylik savdo */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_18px_rgba(15,37,81,0.04)] md:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-extrabold text-[#0f2551] text-sm md:text-base">Oylik savdo hisoboti</h3>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#315fc1]" /> Savdo
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#e32636]" /> Buyurtmalar
            </span>
          </div>
          <div className="w-full overflow-hidden">
            <svg
              viewBox="0 0 720 220"
              role="img"
              aria-label="Oylik savdo va buyurtmalar grafigi"
              className="h-52 w-full overflow-visible sm:h-60"
              preserveAspectRatio="none"
            >
              {[22, 60, 98, 136, 174].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="#edf1f7"
                  strokeDasharray="4 6"
                />
              ))}
              {salesArea && (
                <polygon points={salesArea} fill="url(#salesFill)" />
              )}
              <defs>
                <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#315fc1" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#315fc1" stopOpacity="0" />
                </linearGradient>
              </defs>
              {chartPoints.length > 1 && (
                <>
                  <polyline
                    points={salesLine}
                    fill="none"
                    stroke="#315fc1"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points={ordersLine}
                    fill="none"
                    stroke="#e32636"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="5 5"
                  />
                </>
              )}
              {chartPoints.map(({ month, x, salesY }) => (
                <g key={month.month}>
                  <circle cx={x} cy={salesY} r="4" fill="#315fc1" stroke="white" strokeWidth="2" />
                  <text
                    x={x}
                    y="207"
                    textAnchor="middle"
                    fill="#8b96a8"
                    fontSize="10"
                  >
                    {MONTHS[Number(month.month.slice(5, 7)) - 1]}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Kam qolganlar */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_18px_rgba(15,37,81,0.04)] md:p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-extrabold text-[#0f2551] text-sm md:text-base flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Omborda kam qolganlar
            </h3>
            <button
              onClick={() => setAdminTab("products")}
              className="flex items-center gap-1 text-xs font-bold text-[#173b78] hover:text-[#e32636] transition-colors"
            >
              Mahsulotlar <ArrowRight size={13} />
            </button>
          </div>
          {stats.lowStockList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Package size={32} className="mb-2 opacity-40" />
              <p className="text-sm font-medium">Kam qolgan mahsulot yo&apos;q</p>
              <p className="text-xs mt-1 opacity-70">Hammasi yetarli miqdorda</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto hide-scrollbar">
              {stats.lowStockList.slice(0, 12).map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center gap-3 text-sm bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-100"
                >
                  <span className="font-semibold text-slate-700 truncate">{p.name}</span>
                  <span
                    className={`font-extrabold whitespace-nowrap text-xs px-2.5 py-1 rounded-lg ${
                      p.stock <= 0
                        ? "bg-red-50 text-red-600"
                        : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    {p.stock <= 0 ? "Tugagan" : `${fmtQty(p.stock, p.unit)} ${unitLabel(p.unit)}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── So'nggi buyurtmalar + Ish holati ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 md:gap-5">

        {/* So'nggi buyurtmalar */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_18px_rgba(15,37,81,0.04)] md:p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-extrabold text-[#0f2551] text-sm md:text-base">So&apos;nggi buyurtmalar</h3>
            <button
              onClick={() => setAdminTab("orders")}
              className="flex items-center gap-1 text-xs font-bold text-[#173b78] hover:text-[#e32636] transition-colors"
            >
              Barchasi <ArrowRight size={13} />
            </button>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 4).map((o) => (
              <div
                key={o.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-4 bg-[#f8faff] rounded-xl border border-slate-100"
              >
                <div>
                  <div className="font-bold text-slate-800 text-sm">{o.customerName}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{o.num} · {o.date}</div>
                </div>
                <div className="sm:text-right flex sm:flex-col items-center sm:items-end gap-2">
                  <div className="font-extrabold text-[#0f2551] text-sm">{fmt(o.total)} so&apos;m</div>
                  <div className={`border px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[o.status] || ""}`}>
                    {o.status}
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="flex flex-col items-center py-10 text-slate-400">
                <Inbox size={32} className="mb-2 opacity-40" />
                <p className="text-sm font-medium">Buyurtmalar yo&apos;q</p>
              </div>
            )}
          </div>
        </div>

        {/* Ish holati */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_18px_rgba(15,37,81,0.04)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-[#0f2551] text-sm">Ish holati</h3>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-100">
                Faol
              </span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Yangi buyurtmalar", value: stats.newOrders, color: "text-[#173b78]" },
                { label: "Past zaxira", value: stats.lowStock, color: stats.lowStock > 0 ? "text-orange-500" : "text-slate-800" },
                { label: "Bugungi buyurtmalar", value: stats.todayOrders, color: "text-[#173b78]" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-500 font-medium">{label}</span>
                  <span className={`text-sm font-extrabold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {stats.lowStock > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-700 font-extrabold mb-2 text-sm">
                <AlertTriangle size={14} /> Past zaxira
              </div>
              <p className="text-xs text-amber-700/80 leading-relaxed">
                {stats.lowStock} ta mahsulot 10 birlikdan kam qolgan.
              </p>
              <button
                onClick={() => setAdminTab("products")}
                className="mt-3 text-xs font-extrabold text-amber-800 hover:text-amber-900 flex items-center gap-1"
              >
                Omborni tekshirish <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
