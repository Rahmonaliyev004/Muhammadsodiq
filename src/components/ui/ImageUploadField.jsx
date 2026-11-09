import React, { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";

// Rasmni brauzerda kichraytiradi (eng uzun tomoni 1000px, JPEG) va serverga
// yuklaydi. Baza shishib ketmasligi uchun faqat rasm manzili saqlanadi.
function fileToResizedDataUrl(file, maxSide = 1000) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("bad image"));
    };
    img.src = url;
  });
}

async function uploadImage(file) {
  const dataUrl = await fileToResizedDataUrl(file);
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "upload failed");
  return data.url;
}

const MAX_SIZE_MB = 15;

export default function ImageUploadField({
  value,
  onChange,
  label = "Mahsulot rasmi",
  compact = false,
}) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm fayl tanlang (jpg, png, webp)");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Rasm hajmi ${MAX_SIZE_MB}MB dan oshmasin`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      onChange(await uploadImage(file));
    } catch {
      setError("Rasmni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden border border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 hover:border-brand-light hover:text-brand-light transition-colors shrink-0"
          title="Rasmni almashtirish"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : value ? (
            <Image src={value} alt="" fill unoptimized className="object-cover" />
          ) : (
            <ImagePlus size={16} />
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <div>
      <label className="flex items-center justify-between text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 md:mb-2">
        {label}
        <span className="font-normal text-[9px] md:text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
          Tavsiya etiladi
        </span>
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 hover:border-brand-light hover:text-brand-light transition-colors shrink-0"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : value ? (
            <Image src={value} alt="" fill unoptimized className="object-cover" />
          ) : (
            <ImagePlus size={22} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs md:text-sm font-bold text-brand-light hover:underline"
          >
            {value ? "Rasmni almashtirish" : "Rasm tanlash"}
          </button>
          <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">
            JPG, PNG yoki WEBP · {MAX_SIZE_MB}MB gacha
          </p>
          {error && (
            <p className="text-[10px] md:text-xs text-red-500 font-semibold mt-1">
              {error}
            </p>
          )}
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-slate-400 hover:text-red-500 p-1.5 shrink-0"
            title="Rasmni olib tashlash"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
