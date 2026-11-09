import React, { useState } from "react";
import { Bike, Plus, Pencil, Trash2, Phone } from "lucide-react";
import Field, { inputClass, borderFor } from "../../ui/Field";
import { VEHICLES, OPEN_STATUSES } from "../../../lib/data";
import { normalizePhone } from "../../../lib/validation";
import { toast } from "../../../lib/toast";

const EMPTY = { name: "", phone: "", vehicle: VEHICLES[0], active: true };

export default function CouriersTab({ couriers, orders, onSave, onDelete }) {
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const assigned = (id) => orders.filter((o) => o.courierId === id && OPEN_STATUSES.includes(o.status));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = "Ism-familiyani kiriting";
    if (!normalizePhone(form.phone)) errs.phone = "Telefon raqamini to'g'ri kiriting";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    const ok = await onSave(editingId, form);
    setSaving(false);
    if (ok) {
      toast.success(editingId ? "Kuryer yangilandi" : "Kuryer qo'shildi");
      setForm(EMPTY);
      setEditingId(null);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name, phone: c.phone, vehicle: c.vehicle || VEHICLES[0], active: c.active !== false });
    setErrors({});
    window.scrollTo?.({ top: 0 });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">Kuryerlar</h2>
        <p className="text-xs md:text-sm text-slate-500 font-medium">Yetkazuvchilarni qo&apos;shing va buyurtmalarga biriktiring.</p>
      </div>

      <form onSubmit={submit} noValidate className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Plus size={18} className="text-brand-light" /> {editingId ? "Kuryerni tahrirlash" : "Yangi kuryer"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Ism-familiya" required error={errors.name}>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputClass} ${borderFor(errors.name)}`} />
          </Field>
          <Field label="Telefon" required error={errors.phone}>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998 90 123 45 67" className={`${inputClass} ${borderFor(errors.phone)}`} />
          </Field>
          <Field label="Transport turi">
            <select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} className={`${inputClass} border-slate-200`}>
              {VEHICLES.map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 md:mt-7 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-[#205a46]" />
            Faol (buyurtmaga biriktirish mumkin)
          </label>
        </div>
        <div className="flex gap-2 mt-5">
          <button type="submit" disabled={saving} className="bg-brand-light hover:bg-brand text-white px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60">
            {saving ? "Saqlanmoqda..." : editingId ? "Saqlash" : "Qo'shish"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY); setErrors({}); }} className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm">
              Bekor
            </button>
          )}
        </div>
      </form>

      {couriers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
          <Bike size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-800 mb-1">Kuryerlar yo&apos;q</h3>
          <p className="text-sm text-slate-500">Yuqoridagi forma orqali birinchi kuryerni qo&apos;shing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {couriers.map((c) => {
            const list = assigned(c.id);
            return (
              <div key={c.id} className={`bg-white border rounded-2xl p-5 shadow-sm ${c.active === false ? "border-slate-200 opacity-70" : "border-slate-200"}`}>
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="font-extrabold text-slate-900 break-words">{c.name}</div>
                    <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="text-sm text-slate-500 flex items-center gap-1.5 mt-1 hover:text-brand-light">
                      <Phone size={13} /> {c.phone}
                    </a>
                    <div className="text-xs text-slate-400 mt-1">{c.vehicle || "Transport ko'rsatilmagan"}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${c.active === false ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"}`}>
                    {c.active === false ? "Faol emas" : "Faol"}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <b className="text-slate-800">{list.length}</b> ta faol buyurtma biriktirilgan
                  {list.length > 0 && <span className="block text-slate-400 mt-0.5">{list.map((o) => o.num).join(", ")}</span>}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => startEdit(c)} className="flex items-center gap-1.5 bg-brand-lighter text-brand-light px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#d7eee5]">
                    <Pencil size={13} /> Tahrirlash
                  </button>
                  <button
                    onClick={() => confirm(`"${c.name}" kuryerini o'chirishni tasdiqlaysizmi?`) && onDelete(c.id)}
                    className="flex items-center gap-1.5 bg-red-50 text-red-500 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-100"
                  >
                    <Trash2 size={13} /> O&apos;chirish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
