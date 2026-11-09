import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "../../../lib/toast";
import ProductForm from "./products/ProductForm";
import ProductRow from "./products/ProductRow";
import ProductEditRow from "./products/ProductEditRow";

export default function ProductsTab({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) {
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.code || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q),
    );
  }, [products, query]);

  const saveEdit = async (updated) => {
    // Xato bo'lsa sababini hook o'zi toast bilan ko'rsatadi
    const ok = await onUpdateProduct(editingId, updated);
    if (ok) {
      setEditingId(null);
      toast.success("Mahsulot saqlandi");
    }
  };

  const toggleActive = async (p) => {
    const ok = await onUpdateProduct(p.id, { active: p.active === false });
    if (ok) toast.success(p.active === false ? "Mahsulot sotuvga qaytarildi" : "Mahsulot sotuvdan olib qo'yildi");
  };

  const confirmDelete = (p) => {
    if (confirm(`"${p.name}" mahsulotini o'chirishni tasdiqlaysizmi?`))
      onDeleteProduct(p.id);
  };

  return (
    <div className="max-w-350 mx-auto space-y-4 md:space-y-6">
      <ProductForm onAddProduct={onAddProduct} />

      <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-800 flex justify-between items-center text-sm md:text-base">
          <span>Mavjud mahsulotlar ({visible.length}{visible.length !== products.length ? ` / ${products.length}` : ""})</span>
          <div className="relative w-48 md:w-64 font-normal">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom, kod, kategoriya..."
              aria-label="Mahsulotlarni qidirish"
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-light"
            />
          </div>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-125">
          <table className="w-full text-xs md:text-sm text-left relative">
            <thead className="bg-white border-b border-slate-200 text-[10px] md:text-xs uppercase text-slate-500 font-bold tracking-wider sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4">RASM</th>
                <th className="px-4 md:px-6 py-3 md:py-4">KOD</th>
                <th className="px-4 md:px-6 py-3 md:py-4 min-w-37.5 md:min-w-50">
                  NOM
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4">KATEGORIYA</th>
                <th className="px-4 md:px-6 py-3 md:py-4">BIRLIK</th>
                <th className="px-4 md:px-6 py-3 md:py-4 min-w-25 md:min-w-30">
                  NARX
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 min-w-20 md:min-w-25">
                  QOLDIQ
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right">
                  HARAKAT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((p) =>
                editingId === p.id ? (
                  <ProductEditRow
                    key={p.id}
                    product={p}
                    onSave={saveEdit}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <ProductRow
                    key={p.id}
                    product={p}
                    onEdit={() => setEditingId(p.id)}
                    onDelete={() => confirmDelete(p)}
                    onToggleActive={() => toggleActive(p)}
                  />
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
