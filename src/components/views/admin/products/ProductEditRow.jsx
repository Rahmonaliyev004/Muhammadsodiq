import React, { useState } from "react";
import { UNITS, CATEGORIES } from "../../../../lib/data";
import ImageUploadField from "../../../ui/ImageUploadField";

// Jadvaldagi mahsulotni joyida tahrirlash qatori
export default function ProductEditRow({ product, onSave, onCancel }) {
  const [inlineEditForm, setInlineEditForm] = useState(product);

  const saveInlineEdit = () =>
    onSave({
      ...inlineEditForm,
      price: Number(inlineEditForm.price),
      stock: Number(inlineEditForm.stock),
    });

  const field = "w-full px-2 py-1.5 md:px-3 md:py-2 border border-slate-300 rounded-lg text-slate-800 text-xs md:text-sm bg-white";

  return (
    <>
    <tr className="bg-blue-50/40 relative">
      <td className="px-2 md:px-4 py-2 md:py-3">
        <ImageUploadField
          compact
          value={inlineEditForm.img}
          onChange={(dataUrl) =>
            setInlineEditForm({
              ...inlineEditForm,
              img: dataUrl,
            })
          }
        />
      </td>
      <td className="px-2 md:px-4 py-2 md:py-3">
        <input
          aria-label="Mahsulot kodi"
          placeholder="Kod"
          value={inlineEditForm.code || ""}
          onChange={(e) => setInlineEditForm({ ...inlineEditForm, code: e.target.value })}
          className={field}
        />
      </td>
      <td className="px-2 md:px-4 py-2 md:py-3">
        <input
          value={inlineEditForm.name}
          onChange={(e) =>
            setInlineEditForm({
              ...inlineEditForm,
              name: e.target.value,
            })
          }
          className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-slate-300 rounded-lg font-semibold text-slate-800 text-xs md:text-sm"
        />
      </td>
      <td className="px-2 md:px-4 py-2 md:py-3">
        <select
          value={inlineEditForm.category}
          onChange={(e) =>
            setInlineEditForm({
              ...inlineEditForm,
              category: e.target.value,
            })
          }
          className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-slate-300 rounded-lg font-medium text-slate-700 text-xs md:text-sm"
        >
          {CATEGORIES.slice(1).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </td>
      <td className="px-2 md:px-4 py-2 md:py-3">
        <select
          value={inlineEditForm.unit}
          onChange={(e) =>
            setInlineEditForm({
              ...inlineEditForm,
              unit: e.target.value,
            })
          }
          className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-slate-300 rounded-lg font-medium text-slate-700 text-xs md:text-sm"
        >
          {UNITS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 md:px-4 py-2 md:py-3">
        <input
          type="number"
          value={inlineEditForm.price}
          onChange={(e) =>
            setInlineEditForm({
              ...inlineEditForm,
              price: e.target.value,
            })
          }
          className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-slate-300 rounded-lg font-bold text-slate-800 text-xs md:text-sm"
        />
      </td>
      <td className="px-2 md:px-4 py-2 md:py-3">
        <input
          type="number"
          step={inlineEditForm.unit === "dona" ? 1 : "any"}
          value={inlineEditForm.stock}
          onChange={(e) =>
            setInlineEditForm({
              ...inlineEditForm,
              stock: e.target.value,
            })
          }
          className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-slate-300 rounded-lg font-bold text-slate-800 text-xs md:text-sm"
        />
      </td>
      <td className="px-2 md:px-4 py-2 md:py-3 text-right">
        <div className="flex items-center justify-end gap-1 md:gap-1.5">
          <button
            onClick={saveInlineEdit}
            className="bg-[#10b981] hover:bg-[#059669] text-white px-2 py-1.5 md:px-3 md:py-2 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold transition-colors"
          >
            Saqlash
          </button>
          <button
            onClick={() => onCancel()}
            className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1.5 md:px-3 md:py-2 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold transition-colors"
          >
            Bekor
          </button>
        </div>
      </td>
    </tr>
    <tr className="bg-blue-50/40">
      <td colSpan={8} className="px-3 md:px-4 pb-3">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-start">
          <textarea
            rows={2}
            aria-label="Tavsif"
            placeholder="Tavsif"
            value={inlineEditForm.description || ""}
            onChange={(e) => setInlineEditForm({ ...inlineEditForm, description: e.target.value })}
            className={`${field} resize-none`}
          />
          <div className="flex flex-col gap-1.5 text-xs md:text-sm font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={inlineEditForm.active !== false} onChange={(e) => setInlineEditForm({ ...inlineEditForm, active: e.target.checked })} className="w-4 h-4 accent-[#205a46]" />
              Sotuvda (faol)
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!inlineEditForm.heavy} onChange={(e) => setInlineEditForm({ ...inlineEditForm, heavy: e.target.checked })} className="w-4 h-4 accent-[#205a46]" />
              Og&apos;ir / katta yuk
            </label>
          </div>
        </div>
      </td>
    </tr>
    </>
  );
}
