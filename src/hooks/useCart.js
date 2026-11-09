import { useState, useMemo, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { unitStep, unitLabel, fmtQty, fmt, isIntegerUnit } from "../lib/data";
import { computePricing, effectiveZones } from "../lib/pricing";
import { validateOrderInput } from "../lib/validation";
import { toast } from "../lib/toast";

const CART_KEY = "santexnik_cart_v1";

const EMPTY_FORM = {
  customerName: "",
  customerPhone: "",
  deliveryMethod: "pickup", // "pickup" | "delivery"
  zoneId: "",
  district: "",
  street: "",
  house: "",
  landmark: "",
  carryToFloor: false,
  floor: "1",
  comment: "",
  paymentMethod: "cash",
};

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

// Savat brauzerda faqat {id, qty} ko'rinishida saqlanadi — narx va qoldiq
// har doim joriy mahsulotlar ro'yxatidan olinadi (eskirgan narx qolmaydi).
function loadLines() {
  if (typeof window === "undefined") return [];
  try {
    const arr = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((l) => Number.isFinite(Number(l?.id)) && Number(l?.qty) > 0)
      .map((l) => ({ id: Number(l.id), qty: Number(l.qty) }));
  } catch {
    return [];
  }
}

function makeKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `k${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

// Mijoz savati va buyurtma berish mantiqi.
// siteInfo: { zones, deliveryFee, ..., vatPercent, ... } — hisob faqat ekranda
// oldindan ko'rsatish uchun; yakuniy summa serverda qayta hisoblanadi.
export default function useCart({ products, setProducts, siteInfo }) {
  const [lines, setLines] = useState(loadLines);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const submitLock = useRef(false);
  const keyRef = useRef({ sig: "", key: "" });

  // Sahifa yangilanganda savat saqlanib qoladi
  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
    } catch {
      // Brauzer saqlashni taqiqlagan bo'lsa (maxfiy rejim) — jim o'tamiz
    }
  }, [lines]);

  // Savat: joriy mahsulotlar bilan birlashtiriladi. Sotuvdan chiqqan yoki
  // tugagan mahsulot ko'rinmaydi, miqdor qoldiqdan oshib ketmaydi.
  const cart = useMemo(
    () =>
      lines
        .map((l) => {
          const p = products.find((x) => x.id === l.id);
          if (!p || p.active === false || p.stock <= 0) return null;
          return { ...p, qty: Math.min(l.qty, p.stock) };
        })
        .filter(Boolean),
    [lines, products],
  );
  const cartCount = cart.length;

  const zones = useMemo(
    () => effectiveZones(siteInfo, siteInfo?.zones),
    [siteInfo],
  );
  const zoneId = form.zoneId || (zones.length === 1 ? String(zones[0].id) : "");
  const zone = zones.find((z) => String(z.id) === String(zoneId)) || null;

  const pricing = useMemo(
    () =>
      computePricing({
        items: cart,
        settings: siteInfo || {},
        deliveryMethod: form.deliveryMethod,
        zone,
        carryToFloor: form.carryToFloor,
        floor: Number(form.floor) || 1,
      }),
    [cart, siteInfo, form.deliveryMethod, zone, form.carryToFloor, form.floor],
  );

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const stockOf = (p) => {
    const live = products.find((x) => x.id === p.id);
    return live ? live.stock : p.stock;
  };

  const warnStock = (p, available) =>
    toast.error(`Omborda "${p.name}" dan faqat ${fmtQty(available, p.unit)} ${unitLabel(p.unit)} qoldi.`);

  const addToCart = (p) => {
    const available = stockOf(p);
    const step = unitStep(p.unit);
    const current = lines.find((l) => l.id === p.id)?.qty || 0;
    if (round2(current + step) > available) {
      warnStock(p, available);
      return;
    }
    // Bir xil mahsulot takror qo'shilsa miqdori birlashadi
    setLines((prev) =>
      prev.some((l) => l.id === p.id)
        ? prev.map((l) => (l.id === p.id ? { ...l, qty: round2(l.qty + step) } : l))
        : [...prev, { id: p.id, qty: step }],
    );
    toast.success(`"${p.name}" savatga qo'shildi`);
  };

  const changeQty = (id, compute) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    const step = unitStep(item.unit);
    let next = compute(item.qty, step);
    if (next > item.stock) {
      warnStock(item, item.stock);
      next = item.stock;
    }
    if (isIntegerUnit(item.unit)) next = Math.round(next);
    next = Math.max(step, round2(next));
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty: next } : l)));
  };

  const increaseCartQty = (id) => changeQty(id, (q, step) => q + step);
  const decreaseCartQty = (id) => changeQty(id, (q, step) => q - step);
  const setCartQty = (id, raw) =>
    changeQty(id, (q, step) => {
      const v = Number(String(raw).replace(",", "."));
      return Number.isFinite(v) && v > 0 ? v : step;
    });
  const removeFromCart = (id) => setLines((prev) => prev.filter((l) => l.id !== id));
  const clearCart = () => setLines([]);

  const refreshProducts = () =>
    api("/api/products").then(({ data }) => {
      if (data?.ok) setProducts(data.products);
    });

  const placeOrder = async () => {
    if (submitLock.current) return; // tugma ikki marta bosilsa ham bitta so'rov
    submitLock.current = true;
    try {
      if (cart.length === 0) {
        toast.error("Savat bo'sh. Avval mahsulot tanlang.");
        return;
      }

      const items = cart.map((i) => ({ id: i.id, qty: i.qty }));
      const payload = { ...form, zoneId, floor: Number(form.floor) || 1, items };

      const check = validateOrderInput(payload);
      if (!check.ok) {
        setErrors(check.errors);
        toast.error(Object.values(check.errors)[0]);
        return;
      }
      if (pricing.minOrderShort > 0) {
        toast.error(
          `Bu hudud uchun minimal buyurtma summasi ${fmt(zone.minOrder)} so'm`,
        );
        return;
      }

      // Bir xil buyurtma — bir xil kalit. Savat yoki forma o'zgarsa — yangi kalit.
      const sig = JSON.stringify([check.value, items]);
      if (keyRef.current.sig !== sig) keyRef.current = { sig, key: makeKey() };

      setSubmitting(true);
      setErrors({});
      const { status, data } = await api("/api/orders", {
        method: "POST",
        body: JSON.stringify({ ...payload, idempotencyKey: keyRef.current.key }),
      });

      if (!data?.ok) {
        if (data?.fieldErrors) setErrors(data.fieldErrors);
        toast.error(
          data?.error ||
            "Server bilan aloqa yo'q. Internetni tekshirib, qayta urinib ko'ring (buyurtma ikki marta yaratilmaydi).",
        );
        if (status === 409) refreshProducts(); // qoldiq o'zgargan — yangilaymiz
        return;
      }

      refreshProducts();
      setLines([]);
      setForm({ ...EMPTY_FORM, customerName: form.customerName, customerPhone: form.customerPhone });
      keyRef.current = { sig: "", key: "" };
      setPlacedOrder(data.order);
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  return {
    cart, cartCount, pricing, zones, zone, zoneId,
    form, setField, errors, submitting,
    placedOrder, clearPlacedOrder: () => setPlacedOrder(null),
    addToCart, increaseCartQty, decreaseCartQty, setCartQty, removeFromCart, clearCart,
    placeOrder,
  };
}
