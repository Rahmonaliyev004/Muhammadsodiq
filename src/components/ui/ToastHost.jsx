import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const STYLES = {
  success: { box: "border-emerald-200 bg-emerald-50 text-emerald-800", Icon: CheckCircle2 },
  error: { box: "border-red-200 bg-red-50 text-red-800", Icon: AlertCircle },
  info: { box: "border-blue-200 bg-blue-50 text-blue-800", Icon: Info },
};

// Ekran tepasida (mobil pastki navigatsiyadan yuqorida emas — tepada) chiqadigan xabarlar
export default function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let counter = 0;
    const onToast = (e) => {
      const id = ++counter + Date.now();
      setItems((prev) => [...prev.slice(-3), { id, ...e.detail }]);
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4500);
    };
    window.addEventListener("santexnik:toast", onToast);
    return () => window.removeEventListener("santexnik:toast", onToast);
  }, []);

  return (
    <div
      className="fixed top-3 left-1/2 -translate-x-1/2 z-200 w-[calc(100%-1.5rem)] max-w-md space-y-2 pointer-events-none"
      aria-live="polite"
    >
      {items.map((t) => {
        const { box, Icon } = STYLES[t.type] || STYLES.info;
        return (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start gap-3 border rounded-2xl px-4 py-3 shadow-xl backdrop-blur text-sm font-medium ${box}`}
          >
            <Icon size={18} className="shrink-0 mt-0.5" />
            <span className="flex-1 break-words">{t.message}</span>
            <button
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
              className="shrink-0 opacity-60 hover:opacity-100"
              aria-label="Yopish"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
