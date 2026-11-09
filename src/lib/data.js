// DEMO ma'lumotlar: faqat SEED_DEMO=true bo'lganda va faqat bo'sh bazaga
// yoziladi. Haqiqiy do'konda SEED_DEMO o'chirilishi kerak (`demo: true`
// belgisi bilan ajratilgan).
const ph = (t) => `https://placehold.co/400x300/f8fafc/475569?text=${encodeURIComponent(t)}`;
export const INITIAL_PRODUCTS = [
  { id: 1, code: "PPR-UG-25", name: "PPR Ugolnik 25mm", category: "PPR burchaklar va fitinglar", price: 4500, stock: 140, spec: "Turkiya · PN20", description: "90 graduslik PPR burchak, payvandlanadigan.", unit: "dona", img: ph("PPR Ugolnik"), active: true, heavy: false, demo: true },
  { id: 2, code: "SIF-LV-01", name: "Lavabo sifoni Flexible", category: "Sifonlar va egiluvchan shlanglar", price: 32000, stock: 25, spec: "40/50 mm chiqish", description: "Egiluvchan lavabo sifoni.", unit: "dona", img: ph("Sifon Flexible"), active: true, heavy: false, demo: true },
  { id: 3, code: "KRN-OSH-01", name: "Oshxona smesiteli", category: "Kranlar va smesitellar", price: 240000, stock: 8, spec: "Qora mat · latun", description: "Oshxona uchun baland smesitel.", unit: "dona", img: ph("Oshxona Kran"), active: true, heavy: false, demo: true },
  { id: 4, code: "PPR-QV-20", name: "PPR quvur 20mm", category: "PPR quvurlar", price: 4500, stock: 320, spec: "PN25 · Turkiya", description: "Issiq va sovuq suv uchun PPR quvur.", unit: "metr", img: ph("Quvur 20mm"), active: true, heavy: true, demo: true },
  { id: 5, code: "NAS-GF-075", name: "Gidrofor nasos 0.75kW", category: "Suv nasoslari", price: 850000, stock: 4, spec: "Pedrollo · 45m", description: "Uy uchun gidrofor nasos.", unit: "dona", img: ph("Suv Nasosi"), active: true, heavy: true, demo: true },
  { id: 6, code: "KRN-SH-12", name: "Sharovoy kran 1/2", category: "Kranlar va smesitellar", price: 42000, stock: 60, spec: "Italiya · latun", description: "Latun sharovoy kran.", unit: "dona", img: ph("Sharovoy Kran"), active: true, heavy: false, demo: true },
  { id: 7, code: "FLT-01", name: "Suv filtri 10 dyuym", category: "Filtrlar", price: 65000, stock: 30, spec: "Mexanik tozalash", description: "Mexanik suv filtri.", unit: "dona", img: ph("Suv filtri"), active: true, heavy: false, demo: true },
  { id: 8, code: "UNT-KMP-01", name: "Unitaz kompakt", category: "Unitaz va vannalar", price: 1250000, stock: 5, spec: "Keramika · gorizontal chiqish", description: "Kompakt unitaz, qopqoq bilan.", unit: "to'plam", img: ph("Unitaz"), active: true, heavy: true, demo: true },
  { id: 9, code: "DSH-SET-01", name: "Dush to'plami", category: "Dush jihozlari", price: 310000, stock: 12, spec: "Yomg'ir dush · 3 rejim", description: "Dush ko'targich va leyka to'plami.", unit: "to'plam", img: ph("Dush to'plami"), active: true, heavy: false, demo: true },
];

export const INITIAL_ORDERS = [
  { id: 1, num: "#1782486644655", customerName: "Aziz Rahimov", customerPhone: "+998 99 765 43 21", location: "Chilonzor tumani, 15-kvartal", items: [{name: "Sharovoy kran 1/2", qty: 3, price: 42000, unit: "dona"}, {name: "Ashxona smesiteli", qty: 1, price: 240000, unit: "dona"}], total: 366000, status: "Yangi", date: "2026-09-23" },
  { id: 2, num: "#1782473434075", customerName: "Muhammadsaid Yoqubov", customerPhone: "+998 95 876 57 84", location: "Do'kondan olib ketish", items: [{name: "Gidrofor nasos 0.75kW", qty: 1, price: 850000, unit: "dona"}, {name: "PPR quvur 20mm", qty: 12, price: 4500, unit: "metr"}], total: 918000, status: "Yangi", date: "2026-09-23" },
  { id: 3, num: "#1782449367209", customerName: "Muhammadsodiq Rustamov", customerPhone: "+998 90 123 45 67", location: "Yunusobod tumani", items: [{name: "Lavabo sifoni Flexible", qty: 2, price: 32000, unit: "dona"}, {name: "PPR Ugolnik 25mm", qty: 10, price: 4500, unit: "dona"}], total: 109000, status: "Yetkazildi", date: "2026-09-22" }
];

export const INITIAL_TRANSACTIONS = [
  { id: 1, type: "Kirim", amount: 2345000, desc: "Mijozdan to'lov (#1782486644655)", date: "2026-09-23" },
  { id: 2, type: "Chiqim", amount: 450000, desc: "Svet va komunal xarajatlar", date: "2026-09-22" },
];

export const CATEGORIES = [
  "Barchasi",
  "Sifonlar va egiluvchan shlanglar",
  "Rakovina va oshxona jihozlari",
  "Kranlar va smesitellar",
  "PPR quvurlar",
  "PPR burchaklar va fitinglar",
  "Suv nasoslari",
  "Filtrlar",
  "Unitaz va vannalar",
  "Dush jihozlari",
  "Santexnika aksessuarlari",
  "Boshqa mahsulotlar",
];

// Katalog filtri: standart kategoriyalar + bazadagi (eski/qo'lda kiritilgan)
// boshqa kategoriyalar ham yo'qolib qolmasin.
export function allCategories(products = []) {
  const extra = [];
  for (const p of products) {
    if (p.category && !CATEGORIES.includes(p.category) && !extra.includes(p.category)) {
      extra.push(p.category);
    }
  }
  return [...CATEGORIES, ...extra];
}

// Do'konda sotiladigan mahsulotlarning o'lchov birliklari:
// dona — birlab sotiladigan narsalar (kran, nasos, fiting...)
// kg   — kilogramm bilan sotiladigan narsalar (elektrod, payvand simi...)
// metr — metrlab sotiladigan narsalar (quvur, trubalar...)
export const UNITS = [
  { value: "dona", label: "dona", step: 1 },
  { value: "kg", label: "kg", step: 0.1 },
  { value: "metr", label: "metr", step: 0.5 },
  { value: "to'plam", label: "to'plam", step: 1 },
];

// Butun sonda sotiladigan birliklar (kasr miqdor mumkin emas)
export function isIntegerUnit(unit) {
  return unit === "dona" || unit === "to'plam" || !unit;
}

export function unitInfo(unit) {
  return UNITS.find((u) => u.value === unit) || UNITS[0];
}

export function unitLabel(unit) {
  return unitInfo(unit).label;
}

export function unitStep(unit) {
  return unitInfo(unit).step;
}

// Miqdorni o'lchov birligiga mos formatda chiqaradi:
// dona uchun butun son, kg/metr uchun kerak bo'lsagina kasr qism bilan.
export function fmtQty(n, unit) {
  const num = Number(n) || 0;
  if (isIntegerUnit(unit)) {
    return Math.round(num).toString();
  }
  const rounded = Math.round(num * 100) / 100;
  return rounded.toString().replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

export const SITE = {
  name: "Santexnik",
  fullName: "Santexnik Pro Market",
  phone: "+998 90 123 45 67",
  phoneHref: "tel:+998901234567",
  telegram: "https://t.me/santexnik_pro",
  address: "Toshkent sh., Chilonzor tumani",
  deliveryFee: 20000,
  freeDeliveryThreshold: 0,
};

export function fmt(n) {
  return Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}


// ---------------------------- Buyurtma holatlari ----------------------------
export const ORDER_STATUSES = [
  "Yangi",
  "Tasdiqlandi",
  "Tayyorlanmoqda",
  "Kuryerga topshirildi",
  "Yo'lda",
  "Yetkazildi",
  "Bekor qilindi",
];

export const STATUS_STYLES = {
  "Yangi": "border-blue-200 text-blue-600 bg-blue-50",
  "Tasdiqlandi": "border-indigo-200 text-indigo-600 bg-indigo-50",
  "Tayyorlanmoqda": "border-amber-200 text-amber-700 bg-amber-50",
  "Kuryerga topshirildi": "border-purple-200 text-purple-600 bg-purple-50",
  "Yo'lda": "border-orange-200 text-orange-600 bg-orange-50",
  "Yetkazildi": "border-green-200 text-green-700 bg-green-50",
  "Bekor qilindi": "border-red-200 text-red-600 bg-red-50",
};

// Yetkazish jarayonida hisoblanadigan (hali yakunlanmagan) holatlar
export const OPEN_STATUSES = ["Yangi", "Tasdiqlandi", "Tayyorlanmoqda", "Kuryerga topshirildi", "Yo'lda"];

// ------------------------------ To'lov usullari ------------------------------
export const PAYMENT_METHODS = [
  { value: "cash", label: "Naqd pul", hint: "Olib ketganda yoki kuryerga to'laysiz" },
  { value: "card", label: "Karta yoki elektron to'lov", hint: "To'lov usuli tanlanadi, operator tasdiqlaydi" },
  { value: "transfer", label: "Bank orqali o'tkazma", hint: "Rekvizitlarni operator yuboradi" },
];

export function paymentLabel(value) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label || "Naqd pul";
}

export const VEHICLES = ["Yengil mashina", "Furgon", "Yuk mashinasi", "Mototsikl", "Velosiped / piyoda"];
