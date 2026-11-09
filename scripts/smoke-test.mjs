// Ishlayotgan serverga qarshi to'liq jarayon tekshiruvi.
//   SMOKE_TEST=true BASE_URL=http://localhost:3000 ADMIN_LOGIN=... ADMIN_PASSWORD=... npm run smoke
// DIQQAT: bu test serverga haqiqiy buyurtma/hudud/kuryer qo'shadi — haqiqiy
// do'kon bazasiga EMAS, alohida test serveriga (DATA_DIR=...) ishlating.
if (
  process.env.SMOKE_TEST !== "true" ||
  !process.env.BASE_URL ||
  !process.env.ADMIN_LOGIN ||
  !process.env.ADMIN_PASSWORD
) {
  console.error("SMOKE_TEST=true, BASE_URL, ADMIN_LOGIN va ADMIN_PASSWORD ni belgilang.");
  process.exit(2);
}

const BASE = process.env.BASE_URL.replace(/\/+$/, "");
const LOGIN = process.env.ADMIN_LOGIN;
const PASSWORD = process.env.ADMIN_PASSWORD;
const baseUrl = new URL(BASE);
if (
  !["localhost", "127.0.0.1", "::1"].includes(baseUrl.hostname) &&
  process.env.SMOKE_TEST_ALLOW_REMOTE !== "true"
) {
  console.error("Masofaviy serverga smoke-test yuborish uchun SMOKE_TEST_ALLOW_REMOTE=true talab qilinadi.");
  process.exit(2);
}

let cookie = "";
let passed = 0;
let failed = 0;

async function call(path, { method = "GET", body, auth = false } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(auth && cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const set = res.headers.get("set-cookie");
  if (set) cookie = set.split(";")[0];
  let data = null;
  try {
    data = await res.json();
  } catch {}
  return { status: res.status, data };
}

function check(name, cond, extra = "") {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name} ${extra}`);
  }
}

const customer = (over = {}) => ({
  customerName: "Smoke Test",
  customerPhone: "90 123 45 67",
  deliveryMethod: "pickup",
  paymentMethod: "cash",
  items: [],
  ...over,
});

console.log(`Smoke test: ${BASE}`);

// --- Ommaviy API
let r = await call("/api/products");
check("mahsulotlar ro'yxati ochiq", r.status === 200 && r.data.ok);
const products = r.data.products;
const kran = products.find((p) => p.unit === "dona" && p.stock >= 5 && !p.heavy);
check("demo mahsulot topildi", !!kran);

r = await call("/api/orders");
check("buyurtmalar ro'yxati loginsiz yopiq (401)", r.status === 401);
r = await call("/api/couriers");
check("kuryerlar loginsiz yopiq (401)", r.status === 401);
r = await call("/api/orders/1", { method: "PATCH", body: { status: "Yetkazildi" } });
check("holat o'zgartirish loginsiz yopiq (401)", r.status === 401);

// --- Validatsiya
r = await call("/api/orders", { method: "POST", body: customer({ customerPhone: "123", items: [{ id: kran.id, qty: 1 }] }) });
check("noto'g'ri telefon rad etiladi", r.status === 400 && r.data.fieldErrors?.customerPhone);
r = await call("/api/orders", { method: "POST", body: customer() });
check("bo'sh savat rad etiladi", r.status === 400 && r.data.fieldErrors?.items);
r = await call("/api/orders", { method: "POST", body: customer({ deliveryMethod: "delivery", items: [{ id: kran.id, qty: 1 }] }) });
check("manzilsiz dostavka rad etiladi", r.status === 400 && r.data.fieldErrors?.street);

// --- Admin kirish
r = await call("/api/auth/login", { method: "POST", body: { login: LOGIN, password: "noto'g'ri-parol" } });
check("noto'g'ri parol rad etiladi", r.status === 401);
r = await call("/api/auth/login", { method: "POST", body: { login: LOGIN, password: PASSWORD } });
check("admin kirdi", r.status === 200 && r.data.ok);

// --- Hudud va kuryer
r = await call("/api/delivery-zones", { method: "POST", auth: true, body: { name: "Smoke shahar", fee: 15000, eta: "1 kun" } });
const city = r.data.zone;
check("hudud qo'shildi", r.status === 200 && city?.id);
r = await call("/api/delivery-zones", { method: "POST", auth: true, body: { name: "Smoke uzoq", needsConfirm: true } });
const far = r.data.zone;
check("operator hududi qo'shildi", r.status === 200 && far?.needsConfirm === true);
r = await call("/api/couriers", { method: "POST", auth: true, body: { name: "Smoke Kuryer", phone: "+998 91 000 00 00", vehicle: "Furgon" } });
const courier = r.data.courier;
check("kuryer qo'shildi", r.status === 200 && courier?.id);
r = await call("/api/couriers", { method: "POST", auth: true, body: { name: "X", phone: "1" } });
check("kuryer validatsiyasi", r.status === 400);

r = await call("/api/public-settings");
check("mijoz hududlarni ko'radi, token ko'rinmaydi", r.data.zones.some((z) => z.id === city.id) && !JSON.stringify(r.data).includes("TELEGRAM"));

// --- Buyurtma: olib ketish
const stockBefore = (await call("/api/products")).data.products.find((p) => p.id === kran.id).stock;
const key = `smoke-${Date.now()}-key`;
const pickup = customer({ items: [{ id: kran.id, qty: 2 }], idempotencyKey: key });
r = await call("/api/orders", { method: "POST", body: pickup });
const o1 = r.data?.order;
check("olib ketish buyurtmasi yaratildi", r.status === 200 && o1?.num);
check("javobda ichki maydonlar yo'q (telegram, kalit)", o1 && !("telegramSent" in o1) && !("idempotencyKey" in o1));
const stockAfter = (await call("/api/products")).data.products.find((p) => p.id === kran.id).stock;
check("ombor qoldig'i kamaydi", stockAfter === stockBefore - 2, `${stockBefore} -> ${stockAfter}`);
r = await call("/api/orders", { method: "POST", body: pickup });
check("takroriy so'rov — o'sha buyurtma, qoldiq qayta kamaymaydi", r.data.duplicate === true && r.data.order.num === o1.num);
check("qoldiq o'zgarmadi", (await call("/api/products")).data.products.find((p) => p.id === kran.id).stock === stockAfter);

// --- Ortiqcha miqdor
r = await call("/api/orders", { method: "POST", body: customer({ items: [{ id: kran.id, qty: 100000 }] }) });
check("ombordan ortiq miqdor rad etiladi (409)", r.status === 409 && r.data.error);

// --- Narxni soxtalashtirish urinishi (server e'tiborsiz qoldiradi)
r = await call("/api/orders", { method: "POST", body: customer({ items: [{ id: kran.id, qty: 1, price: 1 }], total: 1 }) });
check("brauzerdan kelgan narx hisobga olinmaydi", r.status === 200 && r.data.order.total === kran.price, `jami ${r.data?.order?.total}, kutilgan ${kran.price}`);

// --- Dostavka
const addr = { deliveryMethod: "delivery", district: "Chilonzor", street: "Bunyodkor", house: "1", paymentMethod: "transfer" };
r = await call("/api/orders", { method: "POST", body: customer({ ...addr, zoneId: String(city.id), items: [{ id: kran.id, qty: 1 }] }) });
check("shahar dostavkasi: tarif qo'shildi", r.status === 200 && r.data.order.deliveryFee === 15000 && r.data.order.total === kran.price + 15000);
r = await call("/api/orders", { method: "POST", body: customer({ ...addr, zoneId: String(far.id), items: [{ id: kran.id, qty: 1 }] }) });
const pending = r.data.order;
check("uzoq manzil: narx operator tasdig'ini kutadi", r.status === 200 && pending.deliveryPending === true);
r = await call("/api/orders", { method: "POST", body: customer({ ...addr, zoneId: "999999", items: [{ id: kran.id, qty: 1 }] }) });
check("mavjud bo'lmagan hudud rad etiladi", r.status === 400);

// --- Admin: buyurtmalar
r = await call("/api/orders", { auth: true });
const all = r.data.orders;
const adminPending = all.find((o) => o.num === pending.num);
check("admin buyurtmalarni ko'radi", r.status === 200 && all.length >= 4);
check("Telegram xatosi buyurtmani yo'qotmadi va qayd etildi", adminPending && adminPending.telegramSent === false && !!adminPending.telegramError, JSON.stringify(adminPending?.telegramError));
check("Telegram tokeni xato matnida yo'q", !JSON.stringify(all).includes("FAKE"));

r = await call(`/api/orders/${adminPending.id}`, { method: "PATCH", auth: true, body: { status: "Yetkazildi" } });
check("dostavka narxi tasdiqlanmaguncha 'Yetkazildi' mumkin emas", r.status === 409);
r = await call(`/api/orders/${adminPending.id}`, { method: "PATCH", auth: true, body: { deliveryFee: 45000 } });
check("operator dostavka narxini tasdiqladi", r.status === 200 && r.data.order.total === kran.price + 45000 && !r.data.order.deliveryPending);
r = await call(`/api/orders/${adminPending.id}`, { method: "PATCH", auth: true, body: { courierId: courier.id } });
check("kuryer biriktirildi", r.status === 200 && r.data.order.courierId === courier.id);
for (const s of ["Tasdiqlandi", "Tayyorlanmoqda", "Kuryerga topshirildi", "Yo'lda", "Yetkazildi"]) {
  r = await call(`/api/orders/${adminPending.id}`, { method: "PATCH", auth: true, body: { status: s } });
  if (r.status !== 200) break;
}
check("holatlar ketma-ketligi → Yetkazildi", r.data.order?.status === "Yetkazildi" && r.data.order.statusHistory.length >= 7);
check("yetkazilganda kassaga kirim yozildi", r.data.transaction?.type === "Kirim");
r = await call(`/api/orders/${adminPending.id}`, { method: "PATCH", auth: true, body: { status: "Noma'lum holat" } });
check("noto'g'ri holat rad etiladi", r.status === 400);

// --- Bekor qilish ombor qoldig'ini qaytaradi
const s0 = (await call("/api/products")).data.products.find((p) => p.id === kran.id).stock;
r = await call("/api/orders", { method: "POST", body: customer({ items: [{ id: kran.id, qty: 3 }] }) });
const toCancel = r.data.order;
const all2 = (await call("/api/orders", { auth: true })).data.orders;
const cancelId = all2.find((o) => o.num === toCancel.num).id;
r = await call(`/api/orders/${cancelId}`, { method: "PATCH", auth: true, body: { status: "Bekor qilindi" } });
const s1 = (await call("/api/products")).data.products.find((p) => p.id === kran.id).stock;
check("bekor qilingach qoldiq qaytdi", r.status === 200 && s1 === s0, `${s0} -> ${s1}`);

// --- Faol bo'lmagan mahsulot mijozga ko'rinmaydi
r = await call(`/api/products/${kran.id}`, { method: "PUT", auth: true, body: { active: false } });
check("mahsulot faol emas qilindi", r.status === 200 && r.data.product.active === false);
check("mijoz faol bo'lmagan mahsulotni ko'rmaydi", !(await call("/api/products")).data.products.some((p) => p.id === kran.id));
check("admin ko'radi (?all=1)", (await call("/api/products?all=1", { auth: true })).data.products.some((p) => p.id === kran.id));
r = await call("/api/orders", { method: "POST", body: customer({ customerPhone: "93 555 44 33", items: [{ id: kran.id, qty: 1 }] }) });
check("faol bo'lmagan mahsulotni buyurtma qilib bo'lmaydi", r.status === 409);
await call(`/api/products/${kran.id}`, { method: "PUT", auth: true, body: { active: true } });

console.log(`\nNatija: ${passed} o'tdi, ${failed} yiqildi`);
process.exit(failed ? 1 : 0);
