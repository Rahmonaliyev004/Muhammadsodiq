import React from "react";
import { Send, Store, Truck, Clock, MapPin, ShieldCheck, Loader2, Info } from "lucide-react";
import Field, { inputClass, borderFor } from "../../../ui/Field";
import { fmt, fmtQty, unitLabel, PAYMENT_METHODS, SITE } from "../../../../lib/data";
import { normalizePhone } from "../../../../lib/validation";

const toggleBtn = (active) =>
  `flex flex-col items-center gap-1 py-3 rounded-xl border text-xs md:text-sm font-bold transition-colors ${
    active
      ? "border-brand-light bg-brand-lighter text-brand-light"
      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
  }`;

// Buyurtma formasi: olish usuli, manzil, mijoz ma'lumotlari, to'lov usuli
export default function CheckoutForm({
  form,
  setField,
  errors,
  zones,
  zone,
  zoneId,
  siteInfo,
  pricing,
  cart,
  submitting,
  onSubmit,
}) {
  const isDelivery = form.deliveryMethod === "delivery";
  const err = (k) => errors[k];

  const telegramText = [
    "Salom! Buyurtma:",
    ...cart.map((i) => `• ${i.name} — ${fmtQty(i.qty, i.unit)} ${unitLabel(i.unit)}`),
    "",
    isDelivery
      ? `Yetkazib berish: ${[zone?.name, form.district, form.street, form.house].filter(Boolean).join(", ") || "manzil kiritilmagan"}`
      : "Do'kondan olib ketaman",
    "",
    `Jami: ${fmt(pricing.total)} so'm${pricing.deliveryPending ? " (dostavka narxi operator tasdiqlaydi)" : ""}`,
  ].join("\n");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
      className="surface-card rounded-2xl p-5 md:p-6 space-y-5"
    >
      {/* Olish usuli */}
      <div>
        <div className="text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Olish usuli</div>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Olish usuli">
          <button type="button" role="radio" aria-checked={!isDelivery} onClick={() => setField("deliveryMethod", "pickup")} className={toggleBtn(!isDelivery)}>
            <Store size={18} /> Do&apos;kondan olish
          </button>
          <button type="button" role="radio" aria-checked={isDelivery} onClick={() => setField("deliveryMethod", "delivery")} className={toggleBtn(isDelivery)}>
            <Truck size={18} /> Yetkazib berish
          </button>
        </div>

        {!isDelivery && (
          <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm space-y-2">
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin size={16} className="shrink-0 mt-0.5 text-brand-light" />
              <span>{siteInfo.address || SITE.address}</span>
            </div>
            {siteInfo.storeHours && (
              <div className="flex items-start gap-2 text-slate-700">
                <Clock size={16} className="shrink-0 mt-0.5 text-brand-light" />
                <span>{siteInfo.storeHours}</span>
              </div>
            )}
            <div className="flex items-start gap-2 text-slate-600">
              <Info size={16} className="shrink-0 mt-0.5 text-brand-light" />
              <span>
                {siteInfo.pickupNote ||
                  "Buyurtma berilgach, operator mahsulot tayyor bo'lganda siz bilan bog'lanadi. Do'konga kelganda buyurtma raqamingizni ayting."}
              </span>
            </div>
            <div className="text-xs font-bold text-emerald-700">Dostavka narxi: 0 so&apos;m</div>
          </div>
        )}

        {isDelivery && (
          <div className="mt-3 space-y-3">
            <Field label="Hudud" required error={err("zoneId")}>
              <select
                value={zoneId}
                onChange={(e) => setField("zoneId", e.target.value)}
                aria-invalid={!!err("zoneId")}
                className={`${inputClass} ${borderFor(err("zoneId"))}`}
              >
                <option value="">Hududni tanlang</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} —{" "}
                    {z.needsConfirm ? "narxi operator tasdiqlaydi" : z.fee > 0 ? `${fmt(z.fee)} so'm` : "bepul"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tuman / shahar" required error={err("district")}>
              <input value={form.district} onChange={(e) => setField("district", e.target.value)} placeholder="Masalan: Chilonzor tumani" autoComplete="address-level2" aria-invalid={!!err("district")} className={`${inputClass} ${borderFor(err("district"))}`} />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Ko'cha" required error={err("street")} className="col-span-2">
                <input value={form.street} onChange={(e) => setField("street", e.target.value)} autoComplete="address-line1" aria-invalid={!!err("street")} className={`${inputClass} ${borderFor(err("street"))}`} />
              </Field>
              <Field label="Uy" required error={err("house")}>
                <input value={form.house} onChange={(e) => setField("house", e.target.value)} aria-invalid={!!err("house")} className={`${inputClass} ${borderFor(err("house"))}`} />
              </Field>
            </div>
            <Field label="Mo'ljal">
              <input value={form.landmark} onChange={(e) => setField("landmark", e.target.value)} placeholder="Masalan: maktab yonida" className={`${inputClass} ${borderFor()}`} />
            </Field>

            {siteInfo.floorCarryFee > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <label className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.carryToFloor}
                    onChange={(e) => setField("carryToFloor", e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#205a46]"
                  />
                  <span>
                    Qavatga olib chiqish xizmati
                    <span className="block text-xs text-slate-500">{fmt(siteInfo.floorCarryFee)} so&apos;m / qavat</span>
                  </span>
                </label>
                {form.carryToFloor && (
                  <Field label="Nechanchi qavat?" error={err("floor")} className="mt-3">
                    <input type="number" min={1} max={100} inputMode="numeric" value={form.floor} onChange={(e) => setField("floor", e.target.value)} className={`${inputClass} ${borderFor(err("floor"))}`} />
                  </Field>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mijoz ma'lumotlari */}
      <div className="space-y-3">
        <div className="text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wide">Mijoz ma&apos;lumotlari</div>
        <Field label="Ism-familiya" required error={err("customerName")}>
          <input value={form.customerName} onChange={(e) => setField("customerName", e.target.value)} placeholder="Masalan: Sardor Karimov" autoComplete="name" aria-invalid={!!err("customerName")} className={`${inputClass} ${borderFor(err("customerName"))}`} />
        </Field>
        <Field label="Telefon raqam" required error={err("customerPhone")}>
          <input
            type="tel"
            inputMode="tel"
            value={form.customerPhone}
            onChange={(e) => setField("customerPhone", e.target.value)}
            onBlur={() => {
              const n = normalizePhone(form.customerPhone);
              if (n) setField("customerPhone", n);
            }}
            placeholder="+998 90 123 45 67"
            autoComplete="tel"
            aria-invalid={!!err("customerPhone")}
            className={`${inputClass} ${borderFor(err("customerPhone"))}`}
          />
        </Field>
        <Field label="Qo'shimcha izoh">
          <textarea value={form.comment} onChange={(e) => setField("comment", e.target.value)} rows={2} maxLength={500} placeholder="Masalan: qo'ng'iroq qilib keling" className={`${inputClass} ${borderFor()} resize-none`} />
        </Field>
      </div>

      {/* To'lov usuli */}
      <div>
        <div className="text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">To&apos;lov usuli</div>
        <div className="space-y-2" role="radiogroup" aria-label="To'lov usuli">
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m.value}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                form.paymentMethod === m.value ? "border-brand-light bg-brand-lighter/60" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input type="radio" name="paymentMethod" value={m.value} checked={form.paymentMethod === m.value} onChange={() => setField("paymentMethod", m.value)} className="mt-1 accent-[#205a46]" />
              <span className="text-sm">
                <span className="font-bold text-slate-800">{m.label}</span>
                <span className="block text-xs text-slate-500">{m.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.paymentMethod && <p className="text-xs text-red-600 mt-1">{errors.paymentMethod}</p>}
        {form.paymentMethod !== "cash" && (
          <p className="text-xs text-slate-500 mt-2">
            Onlayn to&apos;lov hozircha ulanmagan: to&apos;lov amalga oshirilmaydi, usul buyurtmaga yoziladi va operator tasdiqlaydi.
          </p>
        )}
      </div>

      <div className="space-y-3 pt-1">
        <button
          type="submit"
          disabled={submitting || cart.length === 0}
          className="w-full bg-brand hover:bg-brand-light text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand/15 text-base disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {submitting ? "Yuborilmoqda..." : "Buyurtma berish"}
        </button>
        <a
          href={`${SITE.telegram}?text=${encodeURIComponent(telegramText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-brand-lighter hover:bg-[#d6f0e6] text-brand-light py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-base"
        >
          <Send size={18} /> Telegram orqali yuborish
        </a>
      </div>

      <div className="flex items-start justify-center gap-2 text-[11px] text-slate-400 font-medium text-center">
        <ShieldCheck size={14} className="shrink-0 mt-0.5" />
        <span>Ma&apos;lumotlaringiz faqat buyurtmani rasmiylashtirish uchun ishlatiladi. Narx va qoldiq server tomonidan qayta tekshiriladi.</span>
      </div>
    </form>
  );
}
