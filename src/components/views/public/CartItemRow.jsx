import React, { useState } from "react";
import Image from "next/image";
import { X, Plus, Minus } from "lucide-react";
import { fmt, unitLabel, unitStep, isIntegerUnit, fmtQty } from "../../../lib/data";

// Savatdagi bitta mahsulot qatori: rasm, nom, birlik narxi, miqdor
// (tugmalar yoki qo'lda kiritish), qator summasi, o'chirish.
export default function CartItemRow({ item, onIncrease, onDecrease, onSetQty, onRemove }) {
  // Yozayotganda bo'sh qoldirish mumkin; miqdor fokus ketganda (yoki Enter) qo'llanadi
  const [draft, setDraft] = useState(null);
  const commit = () => {
    if (draft !== null) onSetQty(draft);
    setDraft(null);
  };

  return (
    <div className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 hover:bg-slate-50/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
          <Image
            src={item.img || `https://placehold.co/120x120/f8fafc/475569?text=${encodeURIComponent(item.name.slice(0, 2))}`}
            alt=""
            fill
            unoptimized
            sizes="56px"
            className="object-cover mix-blend-multiply"
          />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-slate-900 text-sm md:text-base break-words">{item.name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {fmt(item.price)} so&apos;m / {unitLabel(item.unit)}
            {item.code ? ` · ${item.code}` : ""}
          </p>
          {item.qty >= item.stock && (
            <p className="text-[11px] text-orange-600 font-semibold mt-0.5">
              Omborda shuncha bor: {fmtQty(item.stock, item.unit)} {unitLabel(item.unit)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-5 w-full sm:w-auto">
        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
          <button
            onClick={onDecrease}
            aria-label="Miqdorni kamaytirish"
            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Minus size={16} />
          </button>
          <input
            type="text"
            inputMode={isIntegerUnit(item.unit) ? "numeric" : "decimal"}
            aria-label={`${item.name} miqdori (${unitLabel(item.unit)})`}
            value={draft ?? String(item.qty)}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            onFocus={(e) => e.target.select()}
            className="w-16 text-center text-sm font-bold border-x border-slate-200 h-10 outline-none"
          />
          <button
            onClick={onIncrease}
            aria-label="Miqdorni oshirish"
            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="text-[11px] font-semibold text-slate-400 -ml-1 w-10 shrink-0">{unitLabel(item.unit)}</div>
        <div className="text-right sm:w-28 ml-auto sm:ml-0">
          <div className="font-extrabold text-slate-900 text-sm md:text-base whitespace-nowrap">
            {fmt(item.price * item.qty)}{" "}so&apos;m
          </div>
        </div>
        <button
          onClick={onRemove}
          aria-label={`${item.name} ni savatdan olib tashlash`}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
