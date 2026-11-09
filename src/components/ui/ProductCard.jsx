import React from "react";
import Image from "next/image";
import { AlertTriangle, Plus } from "lucide-react";
import { fmt, fmtQty, unitLabel } from "../../lib/data";

export default function ProductCard({ p, addToCart }) {
  return (
    <div className="product-card surface-card rounded-3xl p-3.5 md:p-4 group flex flex-col">
      <div className="w-full h-44 md:h-48 rounded-[1.35rem] overflow-hidden mb-4 relative bg-gradient-to-br from-sand to-slate-100 flex items-center justify-center">
        <Image
          src={
            p.img ||
            `https://placehold.co/400x300/f8fafc/475569?text=${encodeURIComponent(p.name)}`
          }
          alt={p.name}
          fill
          unoptimized
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 25vw"
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 md:group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="text-[9px] md:text-[10px] font-bold text-brand bg-white/90 backdrop-blur px-2.5 py-1.5 rounded-lg uppercase tracking-wider shadow-sm ring-1 ring-slate-900/5">
            {p.category}
          </span>
        </div>
        {p.stock < 10 && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-1.5 rounded-lg shadow-sm ring-1 ring-orange-200/70">
              <AlertTriangle size={12} />{" "}
              {p.stock > 0
                ? `Qoldi: ${fmtQty(p.stock, p.unit)} ${unitLabel(p.unit)}`
                : "Tugadi"}
            </span>
          </div>
        )}
      </div>

      <h3 className="font-bold text-sm md:text-base leading-snug mb-1 md:group-hover:text-brand-light transition-colors text-slate-900">
        {p.name}
      </h3>
      <p className="text-xs text-slate-500 mb-4 flex-1">{p.spec}</p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div>
          <div className="font-extrabold text-base md:text-lg text-slate-900 leading-none">
            {fmt(p.price)}
          </div>
          <div className="text-[9px] md:text-[10px] text-slate-500 font-medium mt-1">
            so&apos;m / {unitLabel(p.unit)}
          </div>
        </div>
        <button
          onClick={() => addToCart(p)}
          disabled={p.stock <= 0}
          aria-label={`${p.name} savatga qo'shish`}
          className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-brand text-white flex items-center justify-center hover:bg-brand-light md:hover:scale-105 transition-all shadow-md shadow-brand/15 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
