import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS,
  ORDER_STATUSES,
  isIntegerUnit,
  unitLabel,
  fmt,
} from "./data";
import { hashPassword } from "./auth";
import { computePricing, effectiveZones } from "./pricing";
import { tashkentDate } from "./dates";
import { logEvent } from "./log";

// ---------------------------------------------------------------------------
// Oddiy, fayl asosidagi ma'lumotlar bazasi.
//
// Nega alohida server (Postgres/MySQL) emas, JSON fayl?
// Bu loyiha har bir do'konga alohida o'rnatiladi (ko'pincha oddiy kompyuter
// yoki kichik server ustida). Fayl asosidagi saqlash uchun na alohida
// dastur o'rnatish, na sozlash kerak — "npm install && npm run build &&
// npm start" bilan ishlaydi va ma'lumotlar shu papka ichida saqlanadi.
// Kichik-o'rta do'kon uchun bu yetarlicha ishonchli va professional yechim.
//
// Barcha yozish amallari navbatga qo'yiladi (queue), shu bilan bir vaqtning
// o'zida ikkita buyurtma kelsa ham ma'lumotlar buzilmaydi (race condition
// oldini olinadi).
// ---------------------------------------------------------------------------

// Bir nechta do'kon bitta kod nusxasidan ishlashi uchun har bir do'kon o'z
// papkasini DATA_DIR orqali oladi (scripts/generate-deploy.mjs shuni sozlaydi).
export const DATA_DIR =
  process.env.DATA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
const DATA_FILE = path.join(/*turbopackIgnore: true*/ DATA_DIR, "store.json");
const DEFAULT_ADMIN_PASSWORD =
  process.env.NODE_ENV === "production"
    ? crypto.randomBytes(32).toString("hex")
    : "admin123";

// SEED_DEMO=true bo'lsa namuna mahsulot/buyurtmalar bilan boshlanadi (namoyish
// uchun). Aks holda yangi do'kon bo'sh bazadan boshlaydi.
function seedData() {
  const demo = process.env.SEED_DEMO === "true";
  return {
    products: demo ? INITIAL_PRODUCTS : [],
    orders: demo ? INITIAL_ORDERS : [],
    transactions: demo ? INITIAL_TRANSACTIONS : [],
    couriers: [],
    zones: [],
    meta: { orderSeq: demo ? INITIAL_ORDERS.length : 0 },
    settings: {
      storeName: process.env.STORE_NAME || "Santexnik Pro Market",
      phone: process.env.STORE_PHONE || "+998 90 123 45 67",
      address: process.env.STORE_ADDRESS || "Toshkent sh., Chilonzor tumani",
      // Yetkazib berish narxi va qancha summadan yuqori bo'lsa bepul bo'lishi —
      // admin panel "Sozlamalar" dan o'zgartiriladi. 0 = bepul chegarasi yo'q.
      deliveryFee: Number(process.env.DELIVERY_FEE) || 20000,
      freeDeliveryThreshold: Number(process.env.FREE_DELIVERY_THRESHOLD) || 500000,
      // Yangi sozlamalar (admin panel → Dostavka). Haqiqiy tariflar aniqlanmaguncha
      // qo'shimcha to'lovlar 0 — hech qanday narx o'zboshimchalik bilan belgilanmaydi.
      vatPercent: Number(process.env.VAT_PERCENT) || 0, // QQS, % (0 = o'chirilgan)
      discountPercent: 0, // chegirma, %
      discountMinTotal: 0, // chegirma boshlanadigan minimal summa
      heavySurcharge: 0, // og'ir/katta yuk uchun qo'shimcha transport haqi
      floorCarryFee: 0, // qavatga olib chiqish (har bir qavat uchun)
      storeHours: process.env.STORE_HOURS || "", // masalan: "Du–Sha 09:00–18:00"
      pickupNote: process.env.PICKUP_NOTE || "", // olib ketish tartibi
    },
    admin: {
      // Login/parol .env.local dagi ADMIN_LOGIN / ADMIN_PASSWORD dan olinadi
      // (developmentda: admin / admin123). Productionda xavfsiz parol majburiy.
      login: process.env.ADMIN_LOGIN || "admin",
      passwordHash: hashPassword(process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD),
    },
  };
}

const DEFAULT_SETTINGS = seedData().settings;

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedData(), null, 2), "utf8");
  }
}

// Eski (yangi maydonlar yo'q) yozuvlarni yangi tuzilmaga moslaydi — mavjud
// do'konlarning ma'lumotlari yo'qolmaydi va hech narsa qo'lda ko'chirilmaydi.
function normalizeProduct(p) {
  return {
    ...p,
    code: p.code || "",
    description: p.description || "",
    active: p.active !== false,
    heavy: !!p.heavy,
  };
}

function normalizeOrder(o) {
  const created = o.createdAt || `${o.date || tashkentDate()}T00:00:00.000Z`;
  return {
    ...o,
    paymentMethod: o.paymentMethod || "cash",
    payment: o.payment || {
      method: o.paymentMethod || "cash",
      status: o.paymentRecorded ? "Tasdiqlandi" : "Kutilmoqda",
      confirmedAt: null,
    },
    courierId: o.courierId ?? null,
    deliveryPending: !!o.deliveryPending,
    comment: o.comment || "",
    statusHistory:
      Array.isArray(o.statusHistory) && o.statusHistory.length > 0
        ? o.statusHistory
        : [{ status: o.status, at: created, note: "" }],
  };
}

function readRaw() {
  ensureFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const fallback = seedData();
    return {
      products: (Array.isArray(parsed.products) ? parsed.products : []).map(normalizeProduct),
      orders: (Array.isArray(parsed.orders) ? parsed.orders : []).map(normalizeOrder),
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : [],
      couriers: Array.isArray(parsed.couriers) ? parsed.couriers : [],
      zones: Array.isArray(parsed.zones) ? parsed.zones : [],
      meta: { orderSeq: 0, ...(parsed.meta || {}) },
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      admin: parsed.admin || fallback.admin,
    };
  } catch (err) {
    // Fayl shikastlangan bo'lsa jim bo'sh holatga QAYTMAYMIZ: keyingi yozish
    // butun bazani o'chirib yuborardi. Xatoni ko'tarib, faylga tegmaymiz.
    logEvent("error", "data/store.json o'qilmadi (fayl shikastlangan bo'lishi mumkin)", {
      error: err.message,
    });
    throw new Error("Ma'lumotlar bazasini o'qib bo'lmadi");
  }
}

function writeRaw(data) {
  ensureFile();
  const tmpFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmpFile, DATA_FILE); // Bir xil diskda rename atomik amal
}

// Barcha o'qish/yozish amallarini ketma-ket bajarish uchun oddiy navbat.
let queue = Promise.resolve();
function locked(fn) {
  const run = queue.then(() => fn());
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function getProducts() {
  return locked(() => readRaw().products);
}

export function getOrders() {
  return locked(() => readRaw().orders);
}

export function getTransactions() {
  return locked(() => readRaw().transactions);
}

export function addProduct(product) {
  return locked(() => {
    const data = readRaw();
    const id = newId(data.products);
    const newProduct = { ...product, id, code: product.code || `P-${String(id).slice(-6)}` };
    data.products = [newProduct, ...data.products];
    writeRaw(data);
    return newProduct;
  });
}

export function updateProduct(id, patch) {
  return locked(() => {
    const data = readRaw();
    let updated = null;
    data.products = data.products.map((p) => {
      if (p.id === id) {
        updated = { ...p, ...patch, id };
        return updated;
      }
      return p;
    });
    writeRaw(data);
    return updated;
  });
}

export function deleteProduct(id) {
  return locked(() => {
    const data = readRaw();
    const before = data.products.length;
    data.products = data.products.filter((p) => p.id !== id);
    writeRaw(data);
    return data.products.length < before;
  });
}

// ------------------------------ Yordamchilar -------------------------------
export class OrderError extends Error {
  constructor(message, { field, status = 400, code = "ORDER_ERROR" } = {}) {
    super(message);
    this.name = "OrderError";
    this.field = field;
    this.status = status;
    this.code = code;
  }
}

// Yangi ID: har doim mavjudlaridan katta (bir millisekundda ikki yozuv
// kelsa ham to'qnashmaydi).
function newId(list) {
  return Math.max(Date.now(), ...list.map((x) => Number(x.id) || 0)) + 1;
}

function restoreStock(data, items) {
  data.products = data.products.map((p) => {
    const it = items.find((i) => i.id === p.id);
    return it ? { ...p, stock: round2(p.stock + it.qty) } : p;
  });
}

// Mijoz buyurtma berganda chaqiriladi. XAVFSIZLIK UCHUN MUHIM: narx, qoldiq
// va dostavka summasi mijoz brauzeridan emas, serverdagi haqiqiy
// ma'lumotlardan olinadi. Butun amal (tekshirish → ombor → buyurtma) bitta
// navbatli blokda bajariladi va bitta atomik yozish bilan saqlanadi:
// yo hammasi saqlanadi, yo hech narsa.
// `payload` — validateOrderInput() dan o'tgan ma'lumot.
export function createOrder(payload) {
  return locked(() => {
    const data = readRaw();

    // 1) Takroriy buyurtmadan himoya (bir xil kalit — bir xil buyurtma)
    if (payload.idempotencyKey) {
      const same = data.orders.find((o) => o.idempotencyKey === payload.idempotencyKey);
      if (same) return { order: same, duplicate: true };
    }
    // Kalit kelmagan bo'lsa ham, 20 soniya ichida AYNAN bir xil buyurtma (mahsulot,
    // olish usuli, hudud, manzil, to'lov) takror yaratilmaydi. Manzil yoki
    // dostavka boshqacha bo'lsa — bu boshqa buyurtma.
    const signature = (o) =>
      JSON.stringify([
        o.items.map((i) => `${i.id}:${i.qty}`),
        o.deliveryMethod,
        String(o.zoneId || o.zoneId === 0 ? o.zoneId : ""),
        o.district ?? o.address?.district ?? "",
        o.street ?? o.address?.street ?? "",
        o.house ?? o.address?.house ?? "",
        o.paymentMethod,
      ]);
    const sig = signature(payload);
    const recent = data.orders.find(
      (o) =>
        o.customerPhone === payload.customerPhone &&
        Date.now() - new Date(o.createdAt).getTime() < 20000 &&
        signature(o) === sig,
    );
    if (recent) return { order: recent, duplicate: true };

    // 2) Mahsulotlar: serverdagi narx va qoldiq bo'yicha
    const resolvedItems = [];
    for (const reqItem of payload.items) {
      const product = data.products.find((p) => p.id === reqItem.id);
      if (!product || product.active === false) {
        throw new OrderError("Savatdagi mahsulotlardan biri sotuvda yo'q. Savatni yangilang.", {
          field: "items",
          status: 409,
          code: "PRODUCT_UNAVAILABLE",
        });
      }
      const qty = round2(reqItem.qty);
      if (isIntegerUnit(product.unit) && !Number.isInteger(qty)) {
        throw new OrderError(`"${product.name}" butun sonda sotiladi`, { field: "items" });
      }
      if (qty > product.stock) {
        throw new OrderError(
          `"${product.name}" dan omborda faqat ${product.stock} ${unitLabel(product.unit)} bor`,
          { field: "items", status: 409, code: "OUT_OF_STOCK" },
        );
      }
      resolvedItems.push({
        id: product.id,
        code: product.code || "",
        name: product.name,
        unit: product.unit,
        price: product.price, // buyurtmada nusxa: keyingi narx o'zgarishi eski buyurtmaga tegmaydi
        qty,
        heavy: !!product.heavy,
      });
    }

    // 3) Dostavka hududi va narxlar (serverda)
    const isDelivery = payload.deliveryMethod === "delivery";
    const zone = isDelivery
      ? effectiveZones(data.settings, data.zones).find((z) => String(z.id) === String(payload.zoneId))
      : null;
    if (isDelivery && !zone) {
      throw new OrderError("Yetkazib berish hududi topilmadi. Qaytadan tanlang.", { field: "zoneId" });
    }
    const pricing = computePricing({
      items: resolvedItems,
      settings: data.settings,
      deliveryMethod: payload.deliveryMethod,
      zone,
      carryToFloor: payload.carryToFloor,
      floor: payload.floor,
    });
    if (pricing.minOrderShort > 0) {
      throw new OrderError(
        `Bu hudud uchun minimal buyurtma summasi ${fmt(zone.minOrder)} so'm`,
        { field: "items", code: "MIN_ORDER" },
      );
    }

    // 4) Ombor qoldig'ini kamaytirish
    data.products = data.products.map((p) => {
      const bought = resolvedItems.find((i) => i.id === p.id);
      return bought ? { ...p, stock: Math.max(0, round2(p.stock - bought.qty)) } : p;
    });

    // 5) Noyob buyurtma raqami (ketma-ket hisoblagich)
    const seq = Math.max(Number(data.meta.orderSeq) || 0, data.orders.length) + 1;
    data.meta.orderSeq = seq;
    const now = new Date();
    const iso = now.toISOString();

    const address = isDelivery
      ? {
          district: payload.district,
          street: payload.street,
          house: payload.house,
          landmark: payload.landmark,
          carryToFloor: payload.carryToFloor,
          floor: payload.carryToFloor ? payload.floor : null,
        }
      : null;

    const order = {
      id: newId(data.orders),
      num: `#${String(seq).padStart(5, "0")}`,
      idempotencyKey: payload.idempotencyKey || null,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      deliveryMethod: isDelivery ? "delivery" : "pickup",
      zoneId: isDelivery ? String(zone.id) : null,
      zoneName: isDelivery ? zone.name : "",
      address,
      location: isDelivery
        ? [zone.name, payload.district, payload.street, payload.house, payload.landmark && `mo'ljal: ${payload.landmark}`]
            .filter(Boolean)
            .join(", ")
        : "Do'kondan olib ketish",
      comment: payload.comment,
      paymentMethod: payload.paymentMethod,
      payment: { method: payload.paymentMethod, status: "Kutilmoqda", confirmedAt: null },
      items: resolvedItems,
      pricing,
      deliveryFee: pricing.deliveryFee,
      deliveryPending: pricing.deliveryPending,
      total: pricing.total,
      status: "Yangi",
      statusHistory: [{ status: "Yangi", at: iso, note: "Buyurtma yaratildi" }],
      courierId: null,
      paymentRecorded: false,
      telegramSent: false,
      telegramError: null,
      date: tashkentDate(now),
      createdAt: iso,
    };

    data.orders = [order, ...data.orders];
    writeRaw(data); // bitta atomik yozish
    return { order, duplicate: false };
  });
}

// Admin buyurtmani yangilaydi: holat, kuryer, to'lov tasdig'i, dostavka narxi.
// Bekor qilinganda ombor qoldig'i qaytariladi. "Yetkazildi" holatiga o'tganda
// summa avtomatik kassaga (Kirim) qo'shiladi — faqat bir marta.
// patch: { status?, note?, courierId?, paymentConfirmed?, deliveryFee? }
export function updateOrder(id, patch) {
  return locked(() => {
    const data = readRaw();
    const idx = data.orders.findIndex((o) => o.id === id);
    if (idx < 0) return { order: null, transaction: null };

    const o = { ...data.orders[idx] };
    const history = [...(o.statusHistory || [])];
    const iso = new Date().toISOString();
    let transaction = null;

    if (patch.deliveryFee !== undefined) {
      if (o.deliveryMethod !== "delivery") {
        throw new OrderError("Olib ketiladigan buyurtmada dostavka narxi bo'lmaydi", { status: 409 });
      }
      const fee = Math.max(0, Math.round(Number(patch.deliveryFee) || 0));
      o.total = o.total - (o.deliveryFee || 0) + fee;
      o.deliveryFee = fee;
      if (o.pricing) o.pricing = { ...o.pricing, deliveryFee: fee, deliveryPending: false, total: o.total };
      o.deliveryPending = false;
      history.push({ status: o.status, at: iso, note: `Dostavka narxi tasdiqlandi: ${fmt(fee)} so'm` });
    }

    if (patch.courierId !== undefined) {
      if (patch.courierId === null) {
        o.courierId = null;
        history.push({ status: o.status, at: iso, note: "Kuryer olib tashlandi" });
      } else {
        if (o.deliveryMethod !== "delivery") {
          throw new OrderError("Kuryer faqat yetkazib beriladigan buyurtmaga biriktiriladi", { status: 409 });
        }
        const courier = data.couriers.find((c) => c.id === patch.courierId);
        if (!courier || courier.active === false) {
          throw new OrderError("Kuryer topilmadi yoki faol emas", { status: 404 });
        }
        o.courierId = courier.id;
        history.push({ status: o.status, at: iso, note: `Kuryer biriktirildi: ${courier.name}` });
      }
    }

    if (patch.paymentConfirmed === true && o.payment?.status !== "Tasdiqlandi") {
      o.payment = { ...o.payment, status: "Tasdiqlandi", confirmedAt: iso };
      history.push({ status: o.status, at: iso, note: "To'lov tasdiqlandi" });
    }

    if (patch.status !== undefined && patch.status !== o.status) {
      if (!ORDER_STATUSES.includes(patch.status)) {
        throw new OrderError("Noto'g'ri holat", { status: 400 });
      }
      if (o.status === "Bekor qilindi") {
        throw new OrderError("Bekor qilingan buyurtma holatini o'zgartirib bo'lmaydi", { status: 409 });
      }
      if (patch.status === "Bekor qilindi" && o.status === "Yetkazildi") {
        throw new OrderError("Yetkazilgan buyurtmani bekor qilib bo'lmaydi", { status: 409 });
      }
      if (patch.status === "Yetkazildi" && o.deliveryPending) {
        throw new OrderError("Avval dostavka narxini tasdiqlang", { status: 409 });
      }

      if (patch.status === "Bekor qilindi") restoreStock(data, o.items);

      o.status = patch.status;
      history.push({ status: patch.status, at: iso, note: String(patch.note || "").slice(0, 200) });

      if (patch.status === "Yetkazildi" && !o.paymentRecorded) {
        o.paymentRecorded = true;
        o.payment = { ...o.payment, status: "Tasdiqlandi", confirmedAt: o.payment?.confirmedAt || iso };
        transaction = {
          id: newId(data.transactions),
          type: "Kirim",
          amount: o.total,
          desc: `Buyurtma to'lovi (${o.num})`,
          date: tashkentDate(),
        };
      }
    }

    o.statusHistory = history;
    data.orders[idx] = o;
    if (transaction) data.transactions = [transaction, ...data.transactions];
    writeRaw(data);
    return { order: o, transaction };
  });
}

// Buyurtma o'chirilganda yakunlanmagan buyurtmaning mahsuloti omborga qaytadi.
export function deleteOrder(id) {
  return locked(() => {
    const data = readRaw();
    const o = data.orders.find((x) => x.id === id);
    if (!o) return false;
    if (o.status !== "Yetkazildi" && o.status !== "Bekor qilindi") restoreStock(data, o.items);
    data.orders = data.orders.filter((x) => x.id !== id);
    writeRaw(data);
    return true;
  });
}

export function markOrderTelegram(id, sent, error = null) {
  return locked(() => {
    const data = readRaw();
    data.orders = data.orders.map((o) =>
      o.id === id ? { ...o, telegramSent: !!sent, telegramError: sent ? null : error } : o,
    );
    writeRaw(data);
  });
}

export function getOrderById(id) {
  return locked(() => readRaw().orders.find((o) => o.id === id) || null);
}

// ------------------------------ Kuryerlar ----------------------------------
export function getCouriers() {
  return locked(() => readRaw().couriers);
}

export function addCourier(c) {
  return locked(() => {
    const data = readRaw();
    const courier = { ...c, id: newId(data.couriers), createdAt: new Date().toISOString() };
    data.couriers = [...data.couriers, courier];
    writeRaw(data);
    return courier;
  });
}

export function updateCourier(id, patch) {
  return locked(() => {
    const data = readRaw();
    let updated = null;
    data.couriers = data.couriers.map((c) => {
      if (c.id !== id) return c;
      updated = { ...c, ...patch, id };
      return updated;
    });
    if (updated) writeRaw(data);
    return updated;
  });
}

// Faol buyurtmasi bor kuryerni o'chirib bo'lmaydi (faqat nofaol qilinadi).
export function deleteCourier(id) {
  return locked(() => {
    const data = readRaw();
    const busy = data.orders.some(
      (o) => o.courierId === id && o.status !== "Yetkazildi" && o.status !== "Bekor qilindi",
    );
    if (busy) return { ok: false, reason: "busy" };
    const before = data.couriers.length;
    data.couriers = data.couriers.filter((c) => c.id !== id);
    if (data.couriers.length === before) return { ok: false, reason: "notfound" };
    writeRaw(data);
    return { ok: true };
  });
}

// ------------------------- Dostavka hududlari/tariflari ---------------------
export function getZones() {
  return locked(() => readRaw().zones);
}

export function addZone(z) {
  return locked(() => {
    const data = readRaw();
    const zone = { ...z, id: newId(data.zones) };
    data.zones = [...data.zones, zone];
    writeRaw(data);
    return zone;
  });
}

export function updateZone(id, patch) {
  return locked(() => {
    const data = readRaw();
    let updated = null;
    data.zones = data.zones.map((z) => {
      if (z.id !== id) return z;
      updated = { ...z, ...patch, id };
      return updated;
    });
    if (updated) writeRaw(data);
    return updated;
  });
}

export function deleteZone(id) {
  return locked(() => {
    const data = readRaw();
    const before = data.zones.length;
    data.zones = data.zones.filter((z) => z.id !== id);
    if (data.zones.length === before) return false;
    writeRaw(data);
    return true;
  });
}

export function addTransaction(t) {
  return locked(() => {
    const data = readRaw();
    const newT = {
      id: newId(data.transactions),
      type: t.type === "Chiqim" ? "Chiqim" : "Kirim",
      amount: Number(t.amount) || 0,
      desc: (t.desc || (t.type === "Kirim" ? "Kirim" : "Chiqim")).slice(0, 200),
      date: tashkentDate(),
    };
    data.transactions = [newT, ...data.transactions];
    writeRaw(data);
    return newT;
  });
}

export function deleteTransaction(id) {
  return locked(() => {
    const data = readRaw();
    const before = data.transactions.length;
    data.transactions = data.transactions.filter((t) => t.id !== id);
    if (data.transactions.length === before) return false;
    writeRaw(data);
    return true;
  });
}

// ------------------------------- Sozlamalar --------------------------------
// Do'kon nomi, telefon va manzil admin panel "Sozlamalar" bo'limidan
// o'zgartiriladi.

export function getSettings() {
  return locked(() => readRaw().settings);
}

export function updateSettings(patch) {
  return locked(() => {
    const data = readRaw();
    data.settings = { ...data.settings, ...patch };
    writeRaw(data);
    return data.settings;
  });
}

export function verifyAdminCredentials(login, password) {
  return locked(() => {
    const data = readRaw();
    return { admin: data.admin, matches: data.admin.login === login };
  });
}
