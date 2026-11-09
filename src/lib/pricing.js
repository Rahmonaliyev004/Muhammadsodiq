// ---------------------------------------------------------------------------
// Narx hisoblash — SERVER va BRAUZER bir xil funksiyadan foydalanadi.
// Brauzerdagi natija faqat oldindan ko'rsatish uchun; yakuniy summa har
// doim serverda (store.js → createOrder) shu funksiya bilan qayta hisoblanadi.
//
// Formula:
//   Yakuniy = mahsulotlar − chegirma + QQS (agar yoqilgan) + dostavka
//             + qo'shimcha xizmatlar (og'ir yuk, qavatga olib chiqish)
// ---------------------------------------------------------------------------

const int = (n) => Math.round(Number(n) || 0);
const num = (n) => Number(n) || 0;

// Hudud kiritilmagan do'konda eski bitta tarif (sozlamalardagi deliveryFee)
// yagona hudud sifatida ishlaydi — mavjud do'konlar buzilmaydi.
export function effectiveZones(settings, zones) {
  const active = (zones || []).filter((z) => z.active !== false);
  if (active.length > 0) return active;
  return [
    {
      id: "default",
      name: "Yetkazib berish",
      fee: num(settings?.deliveryFee),
      freeThreshold: num(settings?.freeDeliveryThreshold),
      minOrder: 0,
      heavyFee: null,
      eta: "",
      needsConfirm: false,
      active: true,
    },
  ];
}

export function computePricing({
  items = [],
  settings = {},
  deliveryMethod = "pickup",
  zone = null,
  carryToFloor = false,
  floor = 1,
}) {
  const subtotal = int(items.reduce((s, i) => s + num(i.price) * num(i.qty), 0));

  const discountPct = Math.min(Math.max(num(settings.discountPercent), 0), 100);
  const discount =
    discountPct > 0 && subtotal >= num(settings.discountMinTotal)
      ? int((subtotal * discountPct) / 100)
      : 0;
  const afterDiscount = subtotal - discount;

  const vatPct = Math.max(num(settings.vatPercent), 0);
  const vat = int((afterDiscount * vatPct) / 100);

  let deliveryFee = 0;
  let deliveryPending = false;
  let deliveryFree = false;
  let heavyFee = 0;
  let floorFee = 0;
  let minOrderShort = 0;

  if (deliveryMethod === "delivery" && zone) {
    if (num(zone.minOrder) > 0 && afterDiscount < num(zone.minOrder)) {
      minOrderShort = int(num(zone.minOrder) - afterDiscount);
    }
    if (zone.needsConfirm) {
      deliveryPending = true;
    } else if (num(zone.freeThreshold) > 0 && afterDiscount >= num(zone.freeThreshold)) {
      deliveryFree = true;
    } else {
      deliveryFee = int(zone.fee);
    }
    if (items.some((i) => i.heavy)) {
      heavyFee = int(zone.heavyFee ?? settings.heavySurcharge);
    }
    if (carryToFloor) {
      floorFee = int(num(settings.floorCarryFee) * Math.max(1, int(floor)));
    }
  }

  const extras = heavyFee + floorFee;
  const total = afterDiscount + vat + deliveryFee + extras;

  return {
    subtotal,
    discount,
    vat,
    vatPercent: vatPct,
    deliveryFee,
    deliveryPending,
    deliveryFree,
    heavyFee,
    floorFee,
    extras,
    minOrderShort,
    total,
  };
}
