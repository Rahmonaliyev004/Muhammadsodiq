import React, { useState } from "react";
import { Plus } from "lucide-react";
import { UNITS, unitLabel, CATEGORIES } from "../../../../lib/data";
import ImageUploadField from "../../../ui/ImageUploadField";
import { toast } from "../../../../lib/toast";

const EMPTY_PRODUCT = {
  name: "",
  code: "",
  category: CATEGORIES[1],
  price: "",
  stock: "10",
  spec: "",
  description: "",
  unit: "dona",
  img: "",
  active: true,
  heavy: false,
};

// Yangi mahsulot qo'shish formasi
export default function ProductForm({ onAddProduct }) {
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    setSaving(true);
    const ok = await onAddProduct({
      ...newProduct,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
    });
    setSaving(false);
    // Xato bo'lsa sababini hook o'zi toast bilan ko'rsatadi
    if (ok) {
      setNewProduct(EMPTY_PRODUCT);
      toast.success("Yangi mahsulot qo'shildi!");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
      <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8 border-b border-slate-100 pb-4">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-lighter text-brand-light rounded-lg md:rounded-xl flex items-center justify-center">
          <Plus size={18} className="md:w-5 md:h-5" />
        </div>
        <div>
          <div className="text-[9px] md:text-[10px] font-bold text-brand-light uppercase tracking-widest flex items-center gap-1">
            <span className="text-brand-light font-extrabold">
              + Xodimlar paneli
            </span>
          </div>
          <h2 className="text-lg md:text-2xl font-bold text-slate-800">
            Yangi mahsulot qo&apos;shish
          </h2>
        </div>
      </div>

      <form
        onSubmit={saveProduct}
        className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6"
      >
        <div className="md:col-span-2">
          <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 md:mb-2">
            Mahsulot nomi *
          </label>
          <input
            required
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            placeholder="PPR Ugolnik"
            className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-lighter transition-all text-xs md:text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 md:mb-2">
            Kategoriya
          </label>
          <select
            value={newProduct.category}
            onChange={(e) =>
              setNewProduct({ ...newProduct, category: e.target.value })
            }
            className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl outline-none focus:border-brand-light text-xs md:text-sm"
          >
            {CATEGORIES.slice(1).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 md:mb-2">
            Narxi (so&apos;m / {unitLabel(newProduct.unit)}) *
          </label>
          <input
            required
            type="number"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
            placeholder="0"
            className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl outline-none focus:border-brand-light text-xs md:text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 md:mb-2">
            Soni ({unitLabel(newProduct.unit)})
          </label>
          <input
            type="number"
            step={newProduct.unit === "dona" ? 1 : "any"}
            value={newProduct.stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock: e.target.value })
            }
            placeholder="10"
            className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl outline-none focus:border-brand-light text-xs md:text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 md:mb-2">
            O&apos;lchov birligi
          </label>
          <select
            value={newProduct.unit}
            onChange={(e) =>
              setNewProduct({ ...newProduct, unit: e.target.value })
            }
            className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl outline-none focus:border-brand-light text-xs md:text-sm"
          >
            {UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <ImageUploadField
            value={newProduct.img}
            onChange={(dataUrl) =>
              setNewProduct({ ...newProduct, img: dataUrl })
            }
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 md:mb-2">
            Texnik ma&apos;lumot
          </label>
          <input
            value={newProduct.spec}
            onChange={(e) =>
              setNewProduct({ ...newProduct, spec: e.target.value })
            }
            placeholder="Turkiya · PN20"
            className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl outline-none focus:border-brand-light text-xs md:text-sm"
          />
        </div>

        <div>
          <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 md:mb-2">
            Mahsulot kodi
          </label>
          <input
            value={newProduct.code}
            onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
            placeholder="Bo'sh — avtomatik"
            className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl outline-none focus:border-brand-light text-xs md:text-sm"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 md:mb-2">
            Tavsif
          </label>
          <textarea
            rows={2}
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            placeholder="Mahsulot haqida qisqacha"
            className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl outline-none focus:border-brand-light text-xs md:text-sm resize-none"
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-2 justify-center">
          <label className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-700 cursor-pointer">
            <input type="checkbox" checked={newProduct.active} onChange={(e) => setNewProduct({ ...newProduct, active: e.target.checked })} className="w-4 h-4 accent-[#205a46]" />
            Sotuvda (faol)
          </label>
          <label className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-700 cursor-pointer">
            <input type="checkbox" checked={newProduct.heavy} onChange={(e) => setNewProduct({ ...newProduct, heavy: e.target.checked })} className="w-4 h-4 accent-[#205a46]" />
            Og&apos;ir / katta yuk (dostavkada qo&apos;shimcha transport)
          </label>
        </div>

        <div className="md:col-span-full pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2 md:gap-3">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-brand-light text-white px-5 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold hover:bg-brand transition-colors text-sm disabled:opacity-60"
          >
            {saving ? "Saqlanmoqda..." : "Qo'shish"}
          </button>
          <button
            type="button"
            onClick={() => setNewProduct(EMPTY_PRODUCT)}
            className="w-full sm:w-auto bg-slate-100 text-slate-600 px-5 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm"
          >
            Tozalash
          </button>
        </div>
      </form>
    </div>
  );
}
