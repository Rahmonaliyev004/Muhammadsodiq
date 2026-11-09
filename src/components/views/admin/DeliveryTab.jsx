import React, { useState } from "react";
import { Truck, Plus, Pencil, Trash2, MapPin, Percent, AlertTriangle } from "lucide-react";
import Field, { inputClass, borderFor } from "../../ui/Field";
import { fmt, OPEN_STATUSES } from "../../../lib/data";
import { toast } from "../../../lib/toast";

const EMPTY_ZONE = {
  name: "",
  fee: "",
  freeThreshold: "",
  minOrder: "",
  heavyFee: "",
  eta: "",
  needsConfirm: false,
  active: true,
};

function Card({ icon: Icon, title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Icon size={18} className="text-brand-light" /> {title}
      </h3>
      {children}
    </div>
  );
}

export default function DeliveryTab({ zones, settings, orders, onSaveZone, onDeleteZone, onUpdateSettings }) {
  const [zone, setZone] = useState(EMPTY_ZONE);
  const [editingId, setEditingId] = useState(null);
  const [zoneErrors, setZoneErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [general, setGeneral] = useState({
    deliveryFee: settings.deliveryFee ?? 0,
    freeDeliveryThreshold: settings.freeDeliveryThreshold ?? 0,
    heavySurcharge: settings.heavySurcharge ?? 0,
    floorCarryFee: settings.floorCarryFee ?? 0,
    vatPercent: settings.vatPercent ?? 0,
    discountPercent: settings.discountPercent ?? 0,
    discountMinTotal: settings.discountMinTotal ?? 0,
  });
  const [savingGeneral, setSavingGeneral] = useState(false);
  const setG = (k) => (e) => setGeneral((g) => ({ ...g, [k]: e.target.value }));

  const pendingOrders = orders.filter((o) => o.deliveryPending && OPEN_STATUSES.includes(o.status));

  const submitZone = async (e) => {
    e.preventDefault();
    const errs = {};
    if (zone.name.trim().length < 2) errs.name = "Hudud nomini kiriting";
    for (const k of ["fee", "freeThreshold", "minOrder", "heavyFee"]) {
      if (zone[k] !== "" && (!Number.isFinite(Number(zone[k])) || Number(zone[k]) < 0)) errs[k] = "Manfiy bo'lmasligi kerak";
    }
    setZoneErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    const ok = await onSaveZone(editingId, zone);
    setSaving(false);
    if (ok) {
      toast.success(editingId ? "Hudud yangilandi" : "Hudud qo'shildi");
      setZone(EMPTY_ZONE);
      setEditingId(null);
    }
  };

  const startEdit = (z) => {
    setEditingId(z.id);
    setZone({
      name: z.name,
      fee: z.fee ?? "",
      freeThreshold: z.freeThreshold || "",
      minOrder: z.minOrder || "",
      heavyFee: z.heavyFee ?? "",
      eta: z.eta || "",
      needsConfirm: !!z.needsConfirm,
      active: z.active !== false,
    });
    setZoneErrors({});
  };

  const saveGeneral = async (e) => {
    e.preventDefault();
    setSavingGeneral(true);
    const ok = await onUpdateSettings({ settings: general });
    setSavingGeneral(false);
    if (ok) toast.success("Sozlamalar saqlandi");
  };

  const zf = (k) => (e) => setZone((z) => ({ ...z, [k]: e.target.value }));

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">Dostavka</h2>
        <p className="text-xs md:text-sm text-slate-500 font-medium">
          Hududlar va tariflarni siz belgilaysiz — tizimda qat&apos;iy narx yo&apos;q. Hudud kiritilmasa, quyidagi umumiy tarif ishlaydi.
        </p>
      </div>

      {pendingOrders.length > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl p-4 text-sm">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>
            <b>{pendingOrders.length}</b> ta buyurtmada dostavka narxi operator tasdig&apos;ini kutmoqda:{" "}
            {pendingOrders.map((o) => o.num).join(", ")}. Buyurtma tafsilotlarida narxni kiriting.
          </span>
        </div>
      )}

      <Card icon={MapPin} title={editingId ? "Hududni tahrirlash" : "Yangi hudud"}>
        <form onSubmit={submitZone} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Hudud nomi" required error={zoneErrors.name} className="md:col-span-2">
              <input value={zone.name} onChange={zf("name")} placeholder="Masalan: Shahar ichida" className={`${inputClass} ${borderFor(zoneErrors.name)}`} />
            </Field>
            <Field label="Taxminiy muddat">
              <input value={zone.eta} onChange={zf("eta")} placeholder="Masalan: 1–2 kun" className={`${inputClass} border-slate-200`} />
            </Field>
            <Field label="Tarif (so'm)" error={zoneErrors.fee} hint="Operator tasdiqlasa — bo'sh qoldiring">
              <input type="number" min={0} value={zone.fee} onChange={zf("fee")} className={`${inputClass} ${borderFor(zoneErrors.fee)}`} />
            </Field>
            <Field label="Bepul dostavka chegarasi (so'm)" error={zoneErrors.freeThreshold} hint="0 yoki bo'sh — bepul bo'lmaydi">
              <input type="number" min={0} value={zone.freeThreshold} onChange={zf("freeThreshold")} className={`${inputClass} ${borderFor(zoneErrors.freeThreshold)}`} />
            </Field>
            <Field label="Minimal buyurtma summasi (so'm)" error={zoneErrors.minOrder} hint="Bo'sh — cheklov yo'q">
              <input type="number" min={0} value={zone.minOrder} onChange={zf("minOrder")} className={`${inputClass} ${borderFor(zoneErrors.minOrder)}`} />
            </Field>
            <Field label="Og'ir yuk uchun to'lov (so'm)" error={zoneErrors.heavyFee} hint="Bo'sh — umumiy sozlama ishlatiladi" className="md:col-span-1">
              <input type="number" min={0} value={zone.heavyFee} onChange={zf("heavyFee")} className={`${inputClass} ${borderFor(zoneErrors.heavyFee)}`} />
            </Field>
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 sm:items-center md:mt-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={zone.needsConfirm} onChange={(e) => setZone((z) => ({ ...z, needsConfirm: e.target.checked }))} className="w-4 h-4 accent-[#205a46]" />
                Narxni operator tasdiqlaydi
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={zone.active} onChange={(e) => setZone((z) => ({ ...z, active: e.target.checked }))} className="w-4 h-4 accent-[#205a46]" />
                Faol
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <button type="submit" disabled={saving} className="bg-brand-light hover:bg-brand text-white px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60 flex items-center gap-2">
              <Plus size={16} /> {saving ? "Saqlanmoqda..." : editingId ? "Saqlash" : "Hudud qo'shish"}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setZone(EMPTY_ZONE); setZoneErrors({}); }} className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm">
                Bekor
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card icon={Truck} title={`Hududlar (${zones.length})`}>
        {zones.length === 0 ? (
          <p className="text-sm text-slate-500">
            Hududlar hali kiritilmagan. Mijozlar uchun bitta umumiy tarif ishlayapti ({fmt(settings.deliveryFee || 0)} so&apos;m).
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] md:text-xs uppercase text-slate-500 font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-2 py-3">Hudud</th>
                  <th className="px-2 py-3">Tarif</th>
                  <th className="px-2 py-3">Bepul chegara</th>
                  <th className="px-2 py-3">Min. summa</th>
                  <th className="px-2 py-3">Og&apos;ir yuk</th>
                  <th className="px-2 py-3">Muddat</th>
                  <th className="px-2 py-3 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {zones.map((z) => (
                  <tr key={z.id} className={z.active === false ? "opacity-50" : ""}>
                    <td className="px-2 py-3 font-bold text-slate-800">
                      {z.name}
                      {z.active === false && <span className="ml-2 text-[10px] font-bold text-slate-400">faol emas</span>}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      {z.needsConfirm ? <span className="text-amber-600 font-bold">Operator</span> : `${fmt(z.fee)} so'm`}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">{z.freeThreshold > 0 ? `${fmt(z.freeThreshold)} so'm` : "—"}</td>
                    <td className="px-2 py-3 whitespace-nowrap">{z.minOrder > 0 ? `${fmt(z.minOrder)} so'm` : "—"}</td>
                    <td className="px-2 py-3 whitespace-nowrap">{z.heavyFee != null ? `${fmt(z.heavyFee)} so'm` : "umumiy"}</td>
                    <td className="px-2 py-3">{z.eta || "—"}</td>
                    <td className="px-2 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => startEdit(z)} aria-label="Tahrirlash" className="text-brand-light hover:bg-brand-lighter p-2 rounded-lg">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => confirm(`"${z.name}" hududini o'chirasizmi?`) && onDeleteZone(z.id)} aria-label="O'chirish" className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card icon={Percent} title="Umumiy tarif, qo'shimcha xizmatlar va chegirma">
        <form onSubmit={saveGeneral}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Umumiy dostavka narxi (so'm)" hint="Faqat hudud kiritilmagan bo'lsa ishlaydi">
              <input type="number" min={0} value={general.deliveryFee} onChange={setG("deliveryFee")} className={`${inputClass} border-slate-200`} />
            </Field>
            <Field label="Umumiy bepul dostavka chegarasi (so'm)" hint="0 — hech qachon bepul emas">
              <input type="number" min={0} value={general.freeDeliveryThreshold} onChange={setG("freeDeliveryThreshold")} className={`${inputClass} border-slate-200`} />
            </Field>
            <Field label="Og'ir/katta yuk uchun qo'shimcha transport (so'm)" hint="Og'ir deb belgilangan mahsulot (quvur, unitaz, nasos...) bo'lsa qo'shiladi">
              <input type="number" min={0} value={general.heavySurcharge} onChange={setG("heavySurcharge")} className={`${inputClass} border-slate-200`} />
            </Field>
            <Field label="Qavatga olib chiqish (so'm / qavat)" hint="0 — xizmat mijozga ko'rsatilmaydi">
              <input type="number" min={0} value={general.floorCarryFee} onChange={setG("floorCarryFee")} className={`${inputClass} border-slate-200`} />
            </Field>
            <Field label="Chegirma (%)" hint="0 — chegirma yo'q">
              <input type="number" min={0} max={100} step="0.5" value={general.discountPercent} onChange={setG("discountPercent")} className={`${inputClass} border-slate-200`} />
            </Field>
            <Field label="Chegirma boshlanadigan summa (so'm)">
              <input type="number" min={0} value={general.discountMinTotal} onChange={setG("discountMinTotal")} className={`${inputClass} border-slate-200`} />
            </Field>
            <Field label="QQS (%)" hint="0 — yakuniy summaga QQS qo'shilmaydi">
              <input type="number" min={0} max={100} step="0.5" value={general.vatPercent} onChange={setG("vatPercent")} className={`${inputClass} border-slate-200`} />
            </Field>
          </div>
          <button type="submit" disabled={savingGeneral} className="mt-5 bg-brand-light hover:bg-brand text-white px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60">
            {savingGeneral ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </form>
      </Card>
    </div>
  );
}

