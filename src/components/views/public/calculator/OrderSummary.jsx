import React from "react";
import { Calculator } from "lucide-react";
import { fmt, fmtQty, unitLabel } from "../../../../lib/data";

function Row({ label, value, strong, muted, className = "" }) {
  return (
    <div className={`flex justify-between gap-3 ${className}`}>
      <span className={muted ? "text-slate-400" : "text-slate-500"}>{label}</span>
      <span className={`text-right ${strong ? "font-bold text-slate-900" : "font-medium text-slate-900"}`}>{value}</span>
    </div>
  );
}

// "Jami hisob" kartasi: turlar, umumiy miqdor, summalar, yakuniy to'lov
export default function OrderSummary({ cart, pricing, deliveryMethod, zone }) {
  // Aralash birliklar (dona/metr/kg) yig'indisi ma'nosiz, shuning uchun birlik bo'yicha guruhlanadi
  const byUnit = {};
  for (const i of cart) byUnit[i.unit] = (byUnit[i.unit] || 0) + i.qty;
  const qtyText = Object.entries(byUnit)
    .map(([unit, q]) => `${fmtQty(q, unit)} ${unitLabel(unit)}`)
    .join(" · ");

  const isDelivery = deliveryMethod === "delivery";

  return (
    <div className="surface-card rounded-2xl p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4 text-slate-800">
        <Calculator size={20} />
        <h3 className="font-bold text-base md:text-lg">Jami hisob</h3>
      </div>

      <div className="space-y-2.5 text-sm">
        <Row label="Mahsulot turlari" value={`${cart.length} ta`} />
        <Row label="Umumiy miqdor" value={qtyText || "—"} />
        <Row label="Mahsulotlar summasi" value={`${fmt(pricing.subtotal)} so'm`} className="border-t border-dashed border-slate-200 pt-2.5" />
        {pricing.discount > 0 && (
          <Row label="Chegirma" value={`−${fmt(pricing.discount)} so'm`} className="text-emerald-700" />
        )}
        {pricing.vat > 0 && <Row label={`QQS (${pricing.vatPercent}%)`} value={`${fmt(pricing.vat)} so'm`} />}
        <Row
          label={isDelivery ? `Dostavka${zone ? ` · ${zone.name}` : ""}` : "Dostavka"}
          value={
            !isDelivery
              ? "0 so'm (olib ketish)"
              : !zone
                ? "Hudud tanlang"
                : pricing.deliveryPending
                  ? "Operator tasdiqlaydi"
                  : pricing.deliveryFree
                    ? "Bepul"
                    : `${fmt(pricing.deliveryFee)} so'm`
          }
        />
        {pricing.heavyFee > 0 && <Row label="Og'ir/katta yuk uchun transport" value={`${fmt(pricing.heavyFee)} so'm`} />}
        {pricing.floorFee > 0 && <Row label="Qavatga olib chiqish" value={`${fmt(pricing.floorFee)} so'm`} />}
        {isDelivery && zone?.eta && <Row label="Taxminiy muddat" value={zone.eta} muted />}
      </div>

      <div className="bg-gradient-to-br from-brand to-brand-light rounded-xl p-4 text-white mt-5 shadow-md">
        <div className="text-[11px] text-white/70 mb-1">Yakuniy to&apos;lov</div>
        <div className="text-2xl font-extrabold break-words">{fmt(pricing.total)} so&apos;m</div>
        {pricing.deliveryPending && (
          <div className="text-[11px] text-white/80 mt-1.5">+ dostavka narxi (operator tasdiqlagach aniqlanadi)</div>
        )}
      </div>

      {pricing.deliveryPending && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 mt-3">
          Dostavka narxi operator tomonidan tasdiqlanadi. Buyurtma qabul qilingach, operator siz bilan bog&apos;lanib,
          yakuniy summani aniqlaydi.
        </p>
      )}
      {pricing.minOrderShort > 0 && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 mt-3">
          Bu hudud uchun minimal buyurtma summasi {fmt(zone.minOrder)} so&apos;m. Yana {fmt(pricing.minOrderShort)} so&apos;mlik
          mahsulot qo&apos;shing.
        </p>
      )}
    </div>
  );
}
