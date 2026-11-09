import React from "react";
import Image from "next/image";
import { Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { fmtQty, fmt, unitLabel } from "../../../../lib/data";

// Mahsulotlar jadvalidagi oddiy (ko'rish) qator
export default function ProductRow({ product: p, onEdit, onDelete, onToggleActive }) {
  return (
  <tr
    className={`hover:bg-slate-50 transition-colors group ${p.active === false ? "opacity-60" : ""}`}
  >
    <td className="px-4 md:px-6 py-3 md:py-4">
      <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
        <Image
          src={
            p.img ||
            "https://placehold.co/100x100/f8fafc/475569?text=X"
          }
          alt={p.name}
          fill
          unoptimized
          sizes="40px"
          className="object-cover mix-blend-multiply"
        />
      </div>
    </td>
    <td className="px-4 md:px-6 py-3 md:py-4 text-slate-500 text-xs font-semibold whitespace-nowrap">
      {p.code || "—"}
    </td>
    <td className="px-4 md:px-6 py-3 md:py-4 font-semibold text-slate-800 text-xs md:text-sm">
      {p.name}
      {p.active === false && (
        <span className="ml-2 text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">faol emas</span>
      )}
      {p.heavy && (
        <span className="ml-2 text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">og&apos;ir</span>
      )}
      {p.demo && (
        <span className="ml-2 text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">demo</span>
      )}
    </td>
    <td className="px-4 md:px-6 py-3 md:py-4">
      <span className="bg-slate-100 text-slate-600 px-2 md:px-2.5 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-bold">
        {p.category}
      </span>
    </td>
    <td className="px-4 md:px-6 py-3 md:py-4">
      <span className="text-slate-500 font-semibold text-xs md:text-sm">
        {unitLabel(p.unit)}
      </span>
    </td>
    <td className="px-4 md:px-6 py-3 md:py-4 font-bold text-brand-light text-sm md:text-[15px] whitespace-nowrap">
      {fmt(p.price)}{" "}so&apos;m
    </td>
    <td className="px-4 md:px-6 py-3 md:py-4">
      <span
        className={`px-2 md:px-2.5 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-bold ${p.stock < 10 ? "bg-orange-100 text-orange-600" : "bg-green-50 text-green-600"}`}
      >
        {fmtQty(p.stock, p.unit)} {unitLabel(p.unit)}
      </span>
    </td>
    <td className="px-4 md:px-6 py-3 md:py-4 text-right">
      <div className="flex items-center justify-end gap-1 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          onClick={onToggleActive}
          aria-label={p.active === false ? "Sotuvga qaytarish" : "Sotuvdan olib qo'yish"}
          title={p.active === false ? "Sotuvga qaytarish" : "Sotuvdan olib qo'yish"}
          className="text-slate-500 hover:bg-slate-100 p-1.5 md:p-2 rounded-lg transition-colors border border-slate-100 md:border-transparent"
        >
          {p.active === false ? <EyeOff size={14} className="md:w-4 md:h-4" /> : <Eye size={14} className="md:w-4 md:h-4" />}
        </button>
        <button
          onClick={onEdit}
          className="text-brand-light hover:bg-brand-lighter p-1.5 md:p-2 rounded-lg transition-colors border border-slate-100 md:border-transparent hover:border-brand-lighter"
        >
          <Edit size={14} className="md:w-4 md:h-4" />
        </button>
        <button
          onClick={onDelete}
          className="text-red-500 hover:bg-red-50 p-1.5 md:p-2 rounded-lg transition-colors border border-slate-100 md:border-transparent hover:border-red-100"
        >
          <Trash2 size={14} className="md:w-4 md:h-4" />
        </button>
      </div>
    </td>
  </tr>
  );
}
