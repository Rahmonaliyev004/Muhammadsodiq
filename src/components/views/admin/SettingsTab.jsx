import React, { useState } from "react";
import { Store } from "lucide-react";
import { toast } from "../../../lib/toast";

const inputClass =
  "w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl outline-none focus:border-brand-light text-xs md:text-sm";

function Field({ label, value, onChange, className = "", type = "text", hint }) {
  return (
    <div className={className}>
      <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      {hint && <p className="text-[10px] md:text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// Do'kon nomi, telefon, manzil va yetkazib berish narxini o'zgartirish.
// Saqlangach sayt sarlavhasi, admin panel va footerdagi nom ham darhol
// yangilanadi, yetkazib berish narxi esa saytdagi buyurtma formasida
// darhol qo'llanadi.
export default function SettingsTab({ settings, onUpdateSettings }) {
  const [form, setForm] = useState({
    storeName: settings.storeName || "",
    phone: settings.phone || "",
    address: settings.address || "",
    storeHours: settings.storeHours || "",
    pickupNote: settings.pickupNote || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onUpdateSettings({ settings: form });
    setSaving(false);
    if (ok) toast.success("Sozlamalar saqlandi!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">Sozlamalar</h2>
        <p className="text-xs md:text-sm text-slate-500 font-medium">
          Do&apos;kon nomi, aloqa va olib ketish ma&apos;lumotlari. Dostavka tariflari &quot;Dostavka&quot; bo&apos;limida.
        </p>
      </div>

      <form
        onSubmit={save}
        className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm space-y-4 md:space-y-5"
      >
        <div className="flex items-center gap-2 md:gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-lighter text-brand-light rounded-lg md:rounded-xl flex items-center justify-center">
            <Store size={18} className="md:w-5 md:h-5" />
          </div>
          <h3 className="text-base md:text-lg font-bold text-slate-800">Do&apos;kon ma&apos;lumotlari</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Do'kon nomi" value={form.storeName} onChange={set("storeName")} />
          <Field label="Telefon raqami" value={form.phone} onChange={set("phone")} />
          <Field label="Manzil" value={form.address} onChange={set("address")} className="md:col-span-2" />
          <Field
            label="Ish vaqti"
            value={form.storeHours}
            onChange={set("storeHours")}
            hint="Do'kondan olib ketish bo'limida mijozga ko'rsatiladi. Masalan: Du–Sha 09:00–18:00"
            className="md:col-span-2"
          />
          <Field
            label="Olib ketish tartibi"
            value={form.pickupNote}
            onChange={set("pickupNote")}
            hint="Bo'sh qoldirilsa, standart matn ko'rsatiladi."
            className="md:col-span-2"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-brand-light hover:bg-brand text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-bold transition-colors text-sm disabled:opacity-60"
        >
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
    </div>
  );
}
