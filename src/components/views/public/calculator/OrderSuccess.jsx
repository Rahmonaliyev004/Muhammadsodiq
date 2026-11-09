import React from "react";
import { CheckCircle2, Package, Phone } from "lucide-react";
import { fmt, paymentLabel } from "../../../../lib/data";

export default function OrderSuccess({ order, siteInfo, onContinue }) {
  const isDelivery = order.deliveryMethod === "delivery";
  return (
    <div className="surface-card rounded-3xl p-8 md:p-12 text-center max-w-xl mx-auto">
      <CheckCircle2 size={56} className="mx-auto text-emerald-500 mb-4" />
      <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-2">Buyurtma qabul qilindi!</h3>
      <p className="text-slate-500 text-sm mb-6">Buyurtma raqamingiz:</p>
      <div className="inline-block bg-brand-lighter text-brand-light font-extrabold text-2xl px-6 py-3 rounded-2xl mb-6">
        {order.num}
      </div>
      <div className="text-sm text-slate-600 space-y-2 mb-6">
        <p>
          Jami: <b className="text-slate-900">{fmt(order.total)} so&apos;m</b>
          {order.deliveryPending && " + dostavka (operator tasdiqlaydi)"}
        </p>
        <p>To&apos;lov usuli: {paymentLabel(order.paymentMethod)}</p>
        <p>
          {isDelivery
            ? order.deliveryPending
              ? "Operator siz bilan bog'lanib, dostavka narxini va yakuniy summani tasdiqlaydi."
              : "Operator buyurtmani tasdiqlab, yetkazib berish vaqtini aytadi."
            : "Mahsulot tayyor bo'lganda operator siz bilan bog'lanadi. Do'konga kelganda buyurtma raqamini ayting."}
        </p>
        {order.paymentMethod !== "cash" && (
          <p className="text-amber-700">To&apos;lov hali amalga oshirilmagan — operator tasdiqlaydi.</p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onContinue}
          className="bg-brand-light text-white px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2"
        >
          <Package size={18} /> Xaridni davom ettirish
        </button>
        {siteInfo.phoneHref && (
          <a
            href={siteInfo.phoneHref}
            className="border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2"
          >
            <Phone size={18} /> {siteInfo.phone}
          </a>
        )}
      </div>
    </div>
  );
}
