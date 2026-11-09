import React, { useState } from "react";
import { Trash2, X, Phone, MapPin, Store, Truck, AlertTriangle, CheckCircle2, Ban, MessageSquare } from "lucide-react";
import { fmtQty, fmt, unitLabel, paymentLabel, ORDER_STATUSES, STATUS_STYLES } from "../../../../lib/data";

function Section({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-slate-100 font-extrabold text-slate-800 text-sm bg-slate-50/50">{title}</div>
      <div className="p-4 md:p-5">{children}</div>
    </div>
  );
}

function Line({ label, value, strong }) {
  return (
    <div className="flex justify-between gap-3 text-sm py-1">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? "font-extrabold text-slate-900" : "font-semibold text-slate-800"}>{value}</span>
    </div>
  );
}

// Buyurtma tafsilotlari: mijoz, manzil, hisob, to'lov, holat, kuryer va tarix
export default function OrderDetailsModal({ order, couriers, onClose, onUpdate, onDelete }) {
  const [fee, setFee] = useState("");
  const [busy, setBusy] = useState(false);
  const p = order.pricing;
  const isFinal = order.status === "Yetkazildi" || order.status === "Bekor qilindi";
  const isDelivery = order.deliveryMethod === "delivery";
  const activeCouriers = couriers.filter((c) => c.active !== false);
  const courier = couriers.find((c) => c.id === order.courierId);

  const run = async (patch) => {
    setBusy(true);
    await onUpdate(order.id, patch);
    setBusy(false);
  };

  const selectCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-brand-light disabled:opacity-60";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-100 p-3 md:p-4" role="dialog" aria-modal="true" aria-label="Buyurtma tafsilotlari">
      <div className="bg-slate-50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        <div className="p-5 md:p-6 border-b border-slate-100 flex justify-between items-start bg-white">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">Buyurtma {order.num}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`border px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold ${STATUS_STYLES[order.status]}`}>{order.status}</span>
              <span className="flex items-center gap-1 border border-slate-200 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold">
                {isDelivery ? <><Truck size={12} /> Yetkazib berish</> : <><Store size={12} /> Do&apos;kondan olish</>}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{(order.createdAt || order.date || "").slice(0, 16).replace("T", " ")}</span>
            </div>
          </div>
          <button onClick={onClose} aria-label="Yopish" className="w-9 h-9 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4">
          {order.telegramSent === false && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 text-xs md:text-sm">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>
                Telegram xabari yuborilmagan{order.telegramError ? `: ${order.telegramError}` : ""}. Buyurtma bazada saqlangan — mijoz bilan o&apos;zingiz bog&apos;laning.
              </span>
            </div>
          )}

          <Section title="Mijoz">
            <div className="text-lg font-extrabold text-slate-900 mb-2">{order.customerName}</div>
            <div className="space-y-2 text-sm text-slate-600 font-medium">
              <a href={`tel:${order.customerPhone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-brand-light">
                <Phone size={15} className="text-slate-400" /> {order.customerPhone}
              </a>
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-slate-400 mt-0.5 shrink-0" /> <span>{order.location || "Noma'lum"}</span>
              </div>
              {order.address?.carryToFloor && <div className="text-xs text-slate-500">Qavatga olib chiqish: {order.address.floor}-qavat</div>}
              {order.comment && (
                <div className="flex items-start gap-2 text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  <MessageSquare size={15} className="text-slate-400 mt-0.5 shrink-0" /> <span className="break-words">{order.comment}</span>
                </div>
              )}
            </div>
          </Section>

          <Section title="Mahsulotlar va hisob">
            <div className="divide-y divide-slate-100 mb-3">
              {order.items.map((i, idx) => (
                <div key={idx} className="py-2.5 flex justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 text-sm break-words">{i.name}</div>
                    <div className="text-[11px] text-slate-400 font-semibold">
                      {fmtQty(i.qty, i.unit)} {unitLabel(i.unit)} × {fmt(i.price)} so&apos;m{i.code ? ` · ${i.code}` : ""}
                    </div>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm whitespace-nowrap">{fmt(i.qty * i.price)} so&apos;m</div>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-slate-200 pt-2">
              {p && <Line label="Mahsulotlar summasi" value={`${fmt(p.subtotal)} so'm`} />}
              {p?.discount > 0 && <Line label="Chegirma" value={`−${fmt(p.discount)} so'm`} />}
              {p?.vat > 0 && <Line label={`QQS (${p.vatPercent}%)`} value={`${fmt(p.vat)} so'm`} />}
              {isDelivery && (
                <Line
                  label={`Dostavka${order.zoneName ? ` · ${order.zoneName}` : ""}`}
                  value={order.deliveryPending ? "Tasdiqlanmagan" : order.deliveryFee > 0 ? `${fmt(order.deliveryFee)} so'm` : "Bepul"}
                />
              )}
              {p?.heavyFee > 0 && <Line label="Og'ir yuk transporti" value={`${fmt(p.heavyFee)} so'm`} />}
              {p?.floorFee > 0 && <Line label="Qavatga olib chiqish" value={`${fmt(p.floorFee)} so'm`} />}
              <Line label="Jami" value={`${fmt(order.total)} so'm`} strong />
            </div>

            {order.deliveryPending && !isFinal && (
              <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <div className="text-xs font-bold text-amber-800 mb-2">Dostavka narxini operator tasdiqlaydi</div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    placeholder="Dostavka narxi (so'm)"
                    aria-label="Dostavka narxi"
                    className="flex-1 min-w-0 bg-white border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                  />
                  <button
                    disabled={busy || fee === ""}
                    onClick={() => run({ deliveryFee: Number(fee) })}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 rounded-xl text-sm font-bold disabled:opacity-50"
                  >
                    Tasdiqlash
                  </button>
                </div>
              </div>
            )}
          </Section>

          <Section title="To'lov">
            <Line label="To'lov usuli" value={paymentLabel(order.paymentMethod)} />
            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-sm text-slate-500">Holati</span>
              {order.payment?.status === "Tasdiqlandi" ? (
                <span className="flex items-center gap-1 text-emerald-700 text-sm font-bold">
                  <CheckCircle2 size={15} /> Tasdiqlandi
                </span>
              ) : (
                <button
                  disabled={busy || order.status === "Bekor qilindi"}
                  onClick={() => run({ paymentConfirmed: true })}
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  To&apos;lovni tasdiqlash
                </button>
              )}
            </div>
            {order.paymentMethod !== "cash" && order.payment?.status !== "Tasdiqlandi" && (
              <p className="text-[11px] text-slate-400 mt-2">Onlayn to&apos;lov provayderi ulanmagan: to&apos;lov qo&apos;lda tekshirilib tasdiqlanadi.</p>
            )}
          </Section>

          <Section title="Holat va kuryer">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Buyurtma holati</label>
                <select value={order.status} disabled={busy || order.status === "Bekor qilindi"} onChange={(e) => run({ status: e.target.value })} className={selectCls}>
                  {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {isDelivery && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Kuryer</label>
                  <select
                    value={order.courierId ?? ""}
                    disabled={busy || isFinal}
                    onChange={(e) => run({ courierId: e.target.value ? Number(e.target.value) : null })}
                    className={selectCls}
                  >
                    <option value="">Biriktirilmagan</option>
                    {activeCouriers.map((c) => <option key={c.id} value={c.id}>{c.name}{c.vehicle ? ` · ${c.vehicle}` : ""}</option>)}
                    {courier && !activeCouriers.some((c) => c.id === courier.id) && <option value={courier.id}>{courier.name} (faol emas)</option>}
                  </select>
                  {courier && <a href={`tel:${courier.phone.replace(/\s/g, "")}`} className="text-xs text-slate-500 mt-1 inline-block hover:text-brand-light">{courier.phone}</a>}
                </div>
              )}
            </div>
          </Section>

          <Section title="Buyurtma tarixi">
            <ol className="relative border-l-2 border-slate-100 ml-2 space-y-3">
              {[...(order.statusHistory || [])].reverse().map((h, idx) => (
                <li key={idx} className="ml-4">
                  <span className="absolute -left-1.75 w-3 h-3 rounded-full bg-brand-light border-2 border-white" />
                  <div className="text-sm font-bold text-slate-800">{h.status}</div>
                  {h.note && <div className="text-xs text-slate-500">{h.note}</div>}
                  <div className="text-[11px] text-slate-400">{(h.at || "").slice(0, 16).replace("T", " ")}</div>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        <div className="p-4 md:p-5 border-t border-slate-100 bg-white flex flex-wrap justify-between items-center gap-3">
          <button
            onClick={() => {
              if (confirm("Buyurtmani o'chirishni tasdiqlaysizmi?")) {
                onDelete(order.id);
                onClose();
              }
            }}
            className="flex items-center gap-2 bg-red-50 text-red-500 hover:bg-red-100 px-4 py-2.5 rounded-xl font-bold text-sm"
          >
            <Trash2 size={16} /> O&apos;chirish
          </button>
          <div className="flex gap-2">
            {!isFinal && (
              <button
                disabled={busy}
                onClick={() => confirm("Buyurtmani bekor qilasizmi? Mahsulotlar omborga qaytariladi.") && run({ status: "Bekor qilindi" })}
                className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
              >
                <Ban size={16} /> Bekor qilish
              </button>
            )}
            <button onClick={onClose} className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold text-sm">
              Yopish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
