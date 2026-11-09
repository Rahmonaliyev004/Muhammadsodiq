import test, { before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Har bir test ishga tushirilishida alohida vaqtinchalik baza (haqiqiy
// data/ papkasiga tegmaydi).
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "santexnik-test-"));
process.env.DATA_DIR = tmp;
process.env.ADMIN_PASSWORD = "test-parol-123";
process.env.SESSION_SECRET = "test-secret";
delete process.env.SEED_DEMO;

let store;
let kran;
let quvur;
let heavy;
let n = 0;

const order = (over = {}) => ({
  customerName: "Test Mijoz",
  customerPhone: `+998 90 111 22 ${String(10 + n++).padStart(2, "0")}`,
  deliveryMethod: "pickup",
  paymentMethod: "cash",
  comment: "",
  zoneId: "",
  district: "",
  street: "",
  house: "",
  landmark: "",
  carryToFloor: false,
  floor: 1,
  items: [{ id: kran.id, qty: 1 }],
  idempotencyKey: "",
  ...over,
});

const stockOf = async (id) => (await store.getProducts()).find((p) => p.id === id).stock;

before(async () => {
  store = await import("../src/lib/store.js");
  kran = await store.addProduct({ name: "Kran", code: "K-1", category: "Kranlar va smesitellar", price: 10000, stock: 100, unit: "dona", active: true, heavy: false, spec: "", description: "", img: "" });
  quvur = await store.addProduct({ name: "Quvur", code: "Q-1", category: "PPR quvurlar", price: 4500, stock: 10, unit: "metr", active: true, heavy: false, spec: "", description: "", img: "" });
  heavy = await store.addProduct({ name: "Unitaz", code: "U-1", category: "Unitaz va vannalar", price: 1000000, stock: 3, unit: "dona", active: true, heavy: true, spec: "", description: "", img: "" });
});

test("buyurtma: narx serverdan, qoldiq kamayadi, raqam noyob", async () => {
  const { order: o1 } = await store.createOrder(order({ items: [{ id: kran.id, qty: 2 }, { id: quvur.id, qty: 3.5 }] }));
  assert.equal(o1.pricing.subtotal, 2 * 10000 + 3.5 * 4500);
  assert.equal(o1.total, o1.pricing.subtotal);
  assert.equal(o1.items[0].price, 10000);
  assert.equal(await stockOf(kran.id), 98);
  assert.equal(await stockOf(quvur.id), 6.5);
  const { order: o2 } = await store.createOrder(order());
  assert.notEqual(o1.num, o2.num);
  assert.notEqual(o1.id, o2.id);
  assert.equal(o1.statusHistory[0].status, "Yangi");
});

test("omborda yo'q miqdor rad etiladi va qoldiq o'zgarmaydi", async () => {
  const before = await stockOf(kran.id);
  await assert.rejects(() => store.createOrder(order({ items: [{ id: kran.id, qty: before + 1 }] })), (e) => e.code === "OUT_OF_STOCK");
  assert.equal(await stockOf(kran.id), before);
});

test("takroriy kalit: bitta buyurtma, qoldiq bir marta kamayadi", async () => {
  const key = "idem-key-0001";
  const before = await stockOf(kran.id);
  const a = await store.createOrder(order({ idempotencyKey: key }));
  const b = await store.createOrder(order({ idempotencyKey: key }));
  assert.equal(a.duplicate, false);
  assert.equal(b.duplicate, true);
  assert.equal(a.order.id, b.order.id);
  assert.equal(await stockOf(kran.id), before - 1);
});

test("bir vaqtda ko'p buyurtma: ombordan ortiq sotilmaydi", async () => {
  const p = await store.addProduct({ name: "Cheklangan", code: "C-1", category: "Boshqa mahsulotlar", price: 1000, stock: 3, unit: "dona", active: true, heavy: false, spec: "", description: "", img: "" });
  const results = await Promise.allSettled(
    Array.from({ length: 8 }, () => store.createOrder(order({ items: [{ id: p.id, qty: 1 }] }))),
  );
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 3);
  assert.equal(results.filter((r) => r.status === "rejected").length, 5);
  assert.equal(await stockOf(p.id), 0);
});

test("faol bo'lmagan mahsulotni buyurtma qilib bo'lmaydi", async () => {
  const p = await store.addProduct({ name: "Nofaol", code: "N-1", category: "Boshqa mahsulotlar", price: 1000, stock: 9, unit: "dona", active: false, heavy: false, spec: "", description: "", img: "" });
  await assert.rejects(() => store.createOrder(order({ items: [{ id: p.id, qty: 1 }] })), (e) => e.code === "PRODUCT_UNAVAILABLE");
});

test("dostavka: hudud tarifi, og'ir yuk, operator tasdig'i", async () => {
  await store.updateSettings({ heavySurcharge: 30000, floorCarryFee: 5000 });
  const city = await store.addZone({ name: "Shahar ichida", fee: 20000, freeThreshold: 0, minOrder: 0, heavyFee: null, eta: "1 kun", needsConfirm: false, active: true });
  const far = await store.addZone({ name: "Uzoq manzil", fee: 0, freeThreshold: 0, minOrder: 0, heavyFee: null, eta: "", needsConfirm: true, active: true });
  const addr = { deliveryMethod: "delivery", district: "Chilonzor", street: "Bunyodkor", house: "12" };

  const { order: o1 } = await store.createOrder(order({ ...addr, zoneId: String(city.id), items: [{ id: heavy.id, qty: 1 }], carryToFloor: true, floor: 2 }));
  assert.equal(o1.deliveryFee, 20000);
  assert.equal(o1.pricing.heavyFee, 30000);
  assert.equal(o1.pricing.floorFee, 10000);
  assert.equal(o1.total, 1000000 + 20000 + 30000 + 10000);

  const { order: o2 } = await store.createOrder(order({ ...addr, zoneId: String(far.id) }));
  assert.equal(o2.deliveryPending, true);
  await assert.rejects(() => store.updateOrder(o2.id, { status: "Yetkazildi" }), /dostavka narxini/);
  const { order: confirmed } = await store.updateOrder(o2.id, { deliveryFee: 50000 });
  assert.equal(confirmed.deliveryPending, false);
  assert.equal(confirmed.total, 10000 + 50000);

  await assert.rejects(() => store.createOrder(order({ ...addr, zoneId: "999999" })), (e) => e.field === "zoneId");
});

test("holatlar: tarix, bekor qilinganda qoldiq qaytadi, qayta o'zgartirib bo'lmaydi", async () => {
  const before = await stockOf(quvur.id);
  const { order: o } = await store.createOrder(order({ items: [{ id: quvur.id, qty: 2 }] }));
  assert.equal(await stockOf(quvur.id), before - 2);

  const { order: a } = await store.updateOrder(o.id, { status: "Tasdiqlandi" });
  assert.equal(a.statusHistory.at(-1).status, "Tasdiqlandi");

  const { order: c } = await store.updateOrder(o.id, { status: "Bekor qilindi" });
  assert.equal(c.status, "Bekor qilindi");
  assert.equal(await stockOf(quvur.id), before);
  await assert.rejects(() => store.updateOrder(o.id, { status: "Yangi" }), /Bekor qilingan/);
});

test("yetkazildi: kassaga faqat bir marta kirim yoziladi", async () => {
  const { order: o } = await store.createOrder(order());
  const r1 = await store.updateOrder(o.id, { status: "Yetkazildi" });
  assert.equal(r1.transaction.type, "Kirim");
  assert.equal(r1.transaction.amount, o.total);
  assert.equal(r1.order.payment.status, "Tasdiqlandi");
  const r2 = await store.updateOrder(o.id, { status: "Yetkazildi" });
  assert.equal(r2.transaction, null);
  await assert.rejects(() => store.updateOrder(o.id, { status: "Bekor qilindi" }), /bekor qilib bo'lmaydi/);
});

test("kuryer: faqat yetkazib berishga, band kuryerni o'chirib bo'lmaydi", async () => {
  const courier = await store.addCourier({ name: "Kuryer Bir", phone: "+998 90 000 00 01", vehicle: "Furgon", active: true });
  const zone = (await store.getZones())[0];
  const { order: pick } = await store.createOrder(order());
  await assert.rejects(() => store.updateOrder(pick.id, { courierId: courier.id }), /faqat yetkazib/);

  const { order: del } = await store.createOrder(order({ deliveryMethod: "delivery", zoneId: String(zone.id), district: "Yunusobod", street: "Amir Temur", house: "5" }));
  const { order: assigned } = await store.updateOrder(del.id, { courierId: courier.id });
  assert.equal(assigned.courierId, courier.id);
  assert.deepEqual(await store.deleteCourier(courier.id), { ok: false, reason: "busy" });

  await store.updateOrder(del.id, { status: "Bekor qilindi" });
  assert.deepEqual(await store.deleteCourier(courier.id), { ok: true });
});

test("buyurtmadagi narx keyinchalik mahsulot narxi o'zgarsa ham o'zgarmaydi", async () => {
  const { order: o } = await store.createOrder(order({ items: [{ id: kran.id, qty: 1 }] }));
  await store.updateProduct(kran.id, { price: 99999 });
  const saved = await store.getOrderById(o.id);
  assert.equal(saved.items[0].price, 10000);
  assert.equal(saved.total, 10000);
});

test("Telegram xatosi buyurtmani o'chirmaydi (holat saqlanadi)", async () => {
  const { order: o } = await store.createOrder(order());
  await store.markOrderTelegram(o.id, false, "Tarmoq xatosi: test");
  const saved = await store.getOrderById(o.id);
  assert.equal(saved.telegramSent, false);
  assert.equal(saved.telegramError, "Tarmoq xatosi: test");
  assert.ok(saved.num);
});

test("20 soniyalik himoya: manzil yoki dostavka boshqacha bo'lsa — boshqa buyurtma", async () => {
  const zone = (await store.getZones())[0];
  const phone = "+998 93 777 66 55";
  const base = { customerPhone: phone, items: [{ id: kran.id, qty: 1 }] };
  const pick = await store.createOrder(order(base));
  const pickAgain = await store.createOrder(order(base));
  assert.equal(pickAgain.duplicate, true); // aynan bir xil — takror
  const delivery = await store.createOrder(
    order({ ...base, deliveryMethod: "delivery", zoneId: String(zone.id), district: "Chilonzor", street: "Bunyodkor", house: "9" }),
  );
  assert.equal(delivery.duplicate, false); // dostavka — boshqa buyurtma
  assert.notEqual(delivery.order.num, pick.order.num);
  const otherAddr = await store.createOrder(
    order({ ...base, deliveryMethod: "delivery", zoneId: String(zone.id), district: "Chilonzor", street: "Bunyodkor", house: "10" }),
  );
  assert.equal(otherAddr.duplicate, false); // boshqa uy — boshqa buyurtma
});
