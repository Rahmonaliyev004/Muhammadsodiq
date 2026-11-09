import React, { useMemo, useState } from "react";
import OrderDetailsModal from "./orders/OrderDetailsModal";
import { ClipboardList, Eye, Trash2, Store, Truck, Search, RefreshCw, AlertTriangle } from "lucide-react";
import { fmt, paymentLabel, ORDER_STATUSES, STATUS_STYLES } from "../../../lib/data";

export default function OrdersTab({ orders, couriers, loading, onRefresh, onUpdateOrder, onDeleteOrder }) {
  const [viewId, setViewId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const viewOrder = orders.find((o) => o.id === viewId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (typeFilter === "pending" ? !o.deliveryPending : typeFilter !== "all" && o.deliveryMethod !== typeFilter) return false;
      if (!q) return true;
      return (
        (o.num || "").toLowerCase().includes(q) ||
        (o.customerName || "").toLowerCase().includes(q) ||
        (o.customerPhone || "").replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    });
  }, [orders, query, statusFilter, typeFilter]);

  const activeCouriers = couriers.filter((c) => c.active !== false);
  const selectCls =
    "bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs md:text-sm font-semibold text-slate-700 outline-none focus:border-brand-light";

  return (
    <div className="max-w-350 mx-auto space-y-4 md:space-y-6">
      {viewOrder && (
        <OrderDetailsModal
          order={viewOrder}
          couriers={couriers}
          onClose={() => setViewId(null)}
          onUpdate={onUpdateOrder}
          onDelete={onDeleteOrder}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">Buyurtmalar</h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Buyurtmalarni qidirish, holatini o&apos;zgartirish, kuryer biriktirish va boshqarish.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl text-xs md:text-sm font-bold hover:bg-slate-50 shrink-0"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Yangilash
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Raqam, mijoz, telefon yoki mahsulot bo'yicha qidirish..."
            aria-label="Buyurtmalarni qidirish"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-light"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls} aria-label="Holat bo'yicha filtr">
          <option value="all">Barcha holatlar</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectCls} aria-label="Olish usuli bo'yicha filtr">
          <option value="all">Barcha turlar</option>
          <option value="delivery">Yetkazib berish</option>
          <option value="pickup">Olib ketish</option>
          <option value="pending">Operator tasdig&apos;i kerak</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 md:p-16 text-center shadow-sm">
          <ClipboardList size={40} className="mx-auto text-slate-300 mb-3 md:mb-4 md:w-12 md:h-12" />
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-2">Buyurtmalar yo&apos;q</h3>
          <p className="text-xs md:text-sm text-slate-500">Hozircha hech qanday buyurtma mavjud emas.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm text-sm text-slate-500">
          Filtrga mos buyurtma topilmadi.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-left">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] md:text-xs uppercase text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-4">№</th>
                  <th className="px-4 py-4">Mijoz</th>
                  <th className="px-4 py-4">Mahsulotlar</th>
                  <th className="px-4 py-4">Summa</th>
                  <th className="px-4 py-4">Holat</th>
                  <th className="px-4 py-4">Kuryer</th>
                  <th className="px-4 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors align-top">
                    <td className="px-4 py-4 font-extrabold text-slate-500 whitespace-nowrap">
                      {o.num}
                      <div className="text-[10px] font-medium text-slate-400">{o.date}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-extrabold text-slate-800 text-xs md:text-[13px]">{o.customerName}</div>
                      <div className="text-[10px] md:text-xs text-slate-400 font-medium flex items-center gap-1">
                        {o.customerPhone}
                        {o.deliveryMethod === "delivery" ? (
                          <Truck size={11} className="text-orange-500" aria-label="Yetkazib berish" />
                        ) : (
                          <Store size={11} aria-label="Do'kondan olish" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 font-medium min-w-37.5 max-w-64">
                      {o.items.map((i) => i.name).join(", ")}
                    </td>
                    <td className="px-4 py-4 font-extrabold text-slate-900 whitespace-nowrap">
                      {fmt(o.total)}{" "}so&apos;m
                      <div className="text-[10px] font-medium text-slate-400">{paymentLabel(o.paymentMethod)}</div>
                      {o.deliveryPending && (
                        <div className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-0.5">
                          <AlertTriangle size={11} /> Dostavka tasdiqlanmagan
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={o.status}
                        onChange={(e) => onUpdateOrder(o.id, { status: e.target.value })}
                        disabled={o.status === "Bekor qilindi"}
                        aria-label={`${o.num} holati`}
                        className={`border px-2 py-1.5 rounded-full text-[10px] md:text-xs font-bold outline-none cursor-pointer disabled:cursor-not-allowed ${STATUS_STYLES[o.status] || ""}`}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {o.telegramSent === false && (
                        <div className="text-[10px] font-bold text-red-500 mt-1">Telegram yuborilmagan</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {o.deliveryMethod === "delivery" ? (
                        <select
                          value={o.courierId ?? ""}
                          onChange={(e) => onUpdateOrder(o.id, { courierId: e.target.value ? Number(e.target.value) : null })}
                          disabled={o.status === "Bekor qilindi" || o.status === "Yetkazildi"}
                          aria-label={`${o.num} kuryeri`}
                          className={`${selectCls} max-w-36`}
                        >
                          <option value="">Biriktirilmagan</option>
                          {activeCouriers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                          {o.courierId && !activeCouriers.some((c) => c.id === o.courierId) && (
                            <option value={o.courierId}>{couriers.find((c) => c.id === o.courierId)?.name || "Kuryer"}</option>
                          )}
                        </select>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewId(o.id)}
                          className="flex items-center gap-1.5 bg-brand-lighter text-brand-light px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold hover:bg-[#d7eee5] transition-colors"
                        >
                          <Eye size={14} /> <span className="hidden sm:inline">Ko&apos;rish</span>
                        </button>
                        <button
                          onClick={() => confirm("Buyurtmani o'chirishni tasdiqlaysizmi?") && onDeleteOrder(o.id)}
                          aria-label="Buyurtmani o'chirish"
                          className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={14} className="md:w-4 md:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
