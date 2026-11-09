import { UNITS } from "./data";

// ---------------------------------------------------------------------------
// Kiruvchi ma'lumotlarni tekshirish. BRAUZER (formada xatoni darhol
// ko'rsatish) va SERVER (haqiqiy himoya) bir xil funksiyadan foydalanadi.
// ---------------------------------------------------------------------------

const PAYMENT_VALUES = ["cash", "card", "transfer"];

const str = (v, max) => String(v ?? "").trim().slice(0, max);

// O'zbekiston raqami: 9 raqam yoki 998 + 9 raqam. Natija: "+998 90 123 45 67".
export function normalizePhone(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  let n;
  if (d.length === 9) n = d;
  else if (d.length === 12 && d.startsWith("998")) n = d.slice(3);
  else return null;
  if (n[0] === "0") return null;
  return `+998 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 7)} ${n.slice(7)}`;
}

// Buyurtma ma'lumotlarini tekshiradi va tozalangan nusxasini qaytaradi.
export function validateOrderInput(body = {}) {
  const errors = {};
  const b = body || {};

  const customerName = str(b.customerName, 100);
  if (customerName.length < 2) errors.customerName = "Ism-familiyangizni kiriting";

  const customerPhone = normalizePhone(b.customerPhone);
  if (!customerPhone) errors.customerPhone = "Telefon raqamini to'g'ri kiriting (masalan: 90 123 45 67)";

  const deliveryMethod = b.deliveryMethod === "delivery" ? "delivery" : "pickup";

  const paymentMethod = PAYMENT_VALUES.includes(b.paymentMethod) ? b.paymentMethod : null;
  if (!paymentMethod) errors.paymentMethod = "To'lov usulini tanlang";

  const value = {
    customerName,
    customerPhone,
    deliveryMethod,
    paymentMethod,
    comment: str(b.comment, 500),
    zoneId: "",
    district: "",
    street: "",
    house: "",
    landmark: "",
    carryToFloor: false,
    floor: 1,
    items: [],
    idempotencyKey: "",
  };

  if (deliveryMethod === "delivery") {
    value.zoneId = str(b.zoneId, 50);
    value.district = str(b.district, 120);
    value.street = str(b.street, 150);
    value.house = str(b.house, 30);
    value.landmark = str(b.landmark, 200);
    if (!value.zoneId) errors.zoneId = "Yetkazib berish hududini tanlang";
    if (!value.district) errors.district = "Tuman yoki shaharni kiriting";
    if (!value.street) errors.street = "Ko'cha nomini kiriting";
    if (!value.house) errors.house = "Uy raqamini kiriting";
    if (b.carryToFloor) {
      value.carryToFloor = true;
      const f = Math.floor(Number(b.floor));
      if (!Number.isFinite(f) || f < 1 || f > 100) errors.floor = "Qavatni 1 dan 100 gacha kiriting";
      else value.floor = f;
    }
  }

  if (!Array.isArray(b.items) || b.items.length === 0) {
    errors.items = "Savat bo'sh";
  } else if (b.items.length > 100) {
    errors.items = "Bir buyurtmada 100 tadan ortiq mahsulot bo'lmaydi";
  } else {
    const merged = new Map();
    let bad = false;
    for (const it of b.items) {
      const id = Number(it?.id);
      const qty = Number(it?.qty);
      if (!Number.isFinite(id) || !Number.isFinite(qty) || qty <= 0 || qty > 100000) {
        bad = true;
        break;
      }
      // Bir xil mahsulot takror kelsa miqdori birlashtiriladi
      merged.set(id, Math.round(((merged.get(id) || 0) + qty) * 100) / 100);
    }
    if (bad) errors.items = "Savatdagi mahsulot yoki miqdor noto'g'ri";
    else value.items = [...merged].map(([id, qty]) => ({ id, qty }));
  }

  const key = str(b.idempotencyKey, 100);
  if (key && /^[A-Za-z0-9_-]{8,100}$/.test(key)) value.idempotencyKey = key;

  return { ok: Object.keys(errors).length === 0, errors, value };
}

// Mahsulot ma'lumotlarini tekshiradi. partial=true — tahrirlashda faqat
// kelgan maydonlar tekshiriladi.
export function validateProductInput(body = {}, { partial = false } = {}) {
  const errors = {};
  const b = body || {};
  const value = {};
  const has = (k) => b[k] !== undefined;

  if (!partial || has("name")) {
    const name = str(b.name, 200);
    if (name.length < 2) errors.name = "Mahsulot nomini kiriting";
    value.name = name;
  }
  if (!partial || has("code")) value.code = str(b.code, 40);
  if (!partial || has("category")) {
    const category = str(b.category, 100);
    if (!category) errors.category = "Kategoriyani tanlang";
    value.category = category;
  }
  if (!partial || has("price")) {
    const price = Number(b.price);
    if (!Number.isFinite(price) || price <= 0) errors.price = "Narx 0 dan katta bo'lishi kerak";
    value.price = Math.round(price);
  }
  if (!partial || has("stock")) {
    const stock = b.stock === "" || b.stock === undefined ? 0 : Number(b.stock);
    if (!Number.isFinite(stock) || stock < 0) errors.stock = "Qoldiq manfiy bo'lmasligi kerak";
    value.stock = Math.round(stock * 100) / 100;
  }
  if (!partial || has("unit")) {
    const unit = String(b.unit || "dona");
    if (!UNITS.some((u) => u.value === unit)) errors.unit = "O'lchov birligi noto'g'ri";
    value.unit = unit;
  }
  if (!partial || has("spec")) value.spec = str(b.spec, 300);
  if (!partial || has("description")) value.description = str(b.description, 2000);
  if (!partial || has("img")) {
    const img = str(b.img, 600);
    // Faqat o'zimizning yuklangan rasmlar yoki http(s) havolalar
    if (img && !/^(\/api\/files\/[A-Za-z0-9._-]+|https?:\/\/\S+)$/.test(img)) {
      errors.img = "Rasm havolasi noto'g'ri";
    }
    value.img = img;
  }
  if (!partial || has("active")) value.active = b.active === undefined ? true : !!b.active;
  if (!partial || has("heavy")) value.heavy = !!b.heavy;

  // Butun sonda sotiladigan mahsulotning qoldig'i ham butun bo'lsin
  if (value.stock !== undefined && value.unit && ["dona", "to'plam"].includes(value.unit)) {
    value.stock = Math.floor(value.stock);
  }

  return { ok: Object.keys(errors).length === 0, errors, value };
}

export function validateZoneInput(body = {}) {
  const errors = {};
  const b = body || {};
  const name = str(b.name, 100);
  if (name.length < 2) errors.name = "Hudud nomini kiriting";
  const nonNeg = (k, label) => {
    const n = b[k] === "" || b[k] === undefined || b[k] === null ? 0 : Number(b[k]);
    if (!Number.isFinite(n) || n < 0) {
      errors[k] = `${label} manfiy bo'lmasligi kerak`;
      return 0;
    }
    return Math.round(n);
  };
  const value = {
    name,
    fee: nonNeg("fee", "Tarif"),
    freeThreshold: nonNeg("freeThreshold", "Bepul chegara"),
    minOrder: nonNeg("minOrder", "Minimal summa"),
    heavyFee:
      b.heavyFee === "" || b.heavyFee === undefined || b.heavyFee === null
        ? null
        : nonNeg("heavyFee", "Og'ir yuk to'lovi"),
    eta: str(b.eta, 100),
    needsConfirm: !!b.needsConfirm,
    active: b.active === undefined ? true : !!b.active,
  };
  return { ok: Object.keys(errors).length === 0, errors, value };
}

export function validateCourierInput(body = {}) {
  const errors = {};
  const b = body || {};
  const name = str(b.name, 100);
  if (name.length < 2) errors.name = "Kuryer ism-familiyasini kiriting";
  const phone = normalizePhone(b.phone);
  if (!phone) errors.phone = "Telefon raqamini to'g'ri kiriting";
  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: {
      name,
      phone,
      vehicle: str(b.vehicle, 60),
      active: b.active === undefined ? true : !!b.active,
    },
  };
}
