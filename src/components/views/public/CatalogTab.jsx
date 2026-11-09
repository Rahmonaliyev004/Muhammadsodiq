import React, { useState } from "react";
import { X, Search } from "lucide-react";
import ProductCard from "../../ui/ProductCard";

const PAGE_SIZE = 16;

export default function CatalogTab({
  categories,
  category,
  setCategory,
  filteredProducts,
  addToCart,
  searchQuery,
  setSearchQuery,
}) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleProducts = filteredProducts.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-5 md:space-y-7">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 surface-card p-5 md:p-7 rounded-3xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-light mb-2">Mahsulot tanlash</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Mahsulotlar katalogi
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Kerakli ehtiyot qismini tez va oson toping
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Qidirish..."
            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-light focus:ring-4 focus:ring-brand-lighter/70 transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategory(c);
              setPage(1);
            }}
            className={`px-4 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${category === c ? "bg-brand text-white shadow-md shadow-brand/15" : "bg-white border border-slate-200/90 text-slate-600 hover:border-brand-light/50 hover:text-brand-light"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="surface-card rounded-3xl p-10 md:p-16 text-center">
          <Search size={40} className="mx-auto text-slate-300 mb-3 md:mb-4" />
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-2">
            Hech narsa topilmadi
          </h3>
          <p className="text-xs md:text-sm text-slate-500">
            Boshqa so&apos;z bilan qidirib ko&apos;ring yoki kategoriyani
            o&apos;zgartiring.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {visibleProducts.map((p) => (
            <ProductCard key={p.id} p={p} addToCart={addToCart} />
          ))}
        </div>
      )}

      {filteredProducts.length > PAGE_SIZE && (
        <nav
          aria-label="Katalog sahifalari"
          className="flex flex-col sm:flex-row items-center justify-between gap-3 surface-card rounded-2xl px-4 py-3"
        >
          <p aria-live="polite" className="text-sm text-slate-500">
            {start + 1}–{Math.min(start + PAGE_SIZE, filteredProducts.length)} /{" "}
            {filteredProducts.length} ta mahsulot
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-light hover:text-brand-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              Oldingi
            </button>
            <span className="min-w-16 text-center text-sm font-semibold text-slate-600">
              {currentPage} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === pageCount}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-light hover:text-brand-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              Keyingi
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
