import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Search, X, Plus, Check } from "lucide-react";
import { allCategories, fmt, fmtQty, unitLabel } from "../../../../lib/data";

// Kalkulyator ichida mahsulot qidirish, kategoriya bo'yicha saralash va
// savatga qo'shish (katalogga o'tmasdan).
export default function ProductPicker({ products, cart, onAdd }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Barchasi");
  const categories = useMemo(() => allCategories(products), [products]);
  const inCart = useMemo(() => new Map(cart.map((i) => [i.id, i.qty])), [cart]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => category === "Barchasi" || p.category === category)
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          (p.code || "").toLowerCase().includes(q) ||
          (p.spec || "").toLowerCase().includes(q),
      )
      .slice(0, 60);
  }, [products, query, category]);

  return (
    <div className="surface-card rounded-2xl overflow-hidden">
      <div className="p-4 md:p-5 space-y-3 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mahsulot nomi yoki kodi bo'yicha qidiring..."
            aria-label="Mahsulot qidirish"
            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-lighter text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Qidiruvni tozalash"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex overflow-x-auto gap-2 pb-1 hide-scrollbar" role="tablist" aria-label="Kategoriyalar">
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                category === c
                  ? "bg-brand-light text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-brand-light hover:text-brand-light"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
        {results.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Hech narsa topilmadi. Boshqa so&apos;z yoki kategoriyani sinab ko&apos;ring.
          </div>
        ) : (
          results.map((p) => {
            const qty = inCart.get(p.id);
            const out = p.stock <= 0;
            return (
              <div key={p.id} className="flex items-center gap-3 px-4 md:px-5 py-2.5">
                <div className="relative w-11 h-11 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                  <Image
                    src={p.img || `https://placehold.co/100x100/f8fafc/475569?text=${encodeURIComponent(p.name.slice(0, 2))}`}
                    alt=""
                    fill
                    unoptimized
                    sizes="44px"
                    className="object-cover mix-blend-multiply"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-800 truncate">{p.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {fmt(p.price)} so&apos;m / {unitLabel(p.unit)}
                    {p.code ? ` · ${p.code}` : ""}
                    {" · "}
                    {out ? (
                      <span className="text-red-500 font-semibold">Tugadi</span>
                    ) : (
                      <span>qoldiq {fmtQty(p.stock, p.unit)}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onAdd(p)}
                  disabled={out}
                  aria-label={`${p.name} ni savatga qo'shish`}
                  className="shrink-0 h-10 min-w-10 px-3 rounded-xl bg-brand-lighter text-brand-light font-bold text-sm flex items-center justify-center gap-1 hover:bg-brand-light hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {qty ? <Check size={16} /> : <Plus size={16} />}
                  {qty ? <span className="text-xs">{fmtQty(qty, p.unit)}</span> : null}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
