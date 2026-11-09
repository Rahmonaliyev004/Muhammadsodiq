import test from "node:test";
import assert from "node:assert/strict";
import { computePricing, effectiveZones } from "../src/lib/pricing.js";

const items = [
  { price: 10000, qty: 3, heavy: false },
  { price: 5000, qty: 2, heavy: false },
]; // subtotal 40 000

test("formula: mahsulotlar − chegirma + dostavka + xizmatlar", () => {
  const settings = { discountPercent: 10, discountMinTotal: 30000, floorCarryFee: 5000, heavySurcharge: 20000 };
  const zone = { fee: 15000, freeThreshold: 0, minOrder: 0, heavyFee: null };
  const p = computePricing({
    items: [...items, { price: 100000, qty: 1, heavy: true }],
    settings,
    deliveryMethod: "delivery",
    zone,
    carryToFloor: true,
    floor: 3,
  });
  assert.equal(p.subtotal, 140000);
  assert.equal(p.discount, 14000);
  assert.equal(p.deliveryFee, 15000);
  assert.equal(p.heavyFee, 20000);
  assert.equal(p.floorFee, 15000); // 5000 × 3 qavat
  assert.equal(p.total, 140000 - 14000 + 15000 + 20000 + 15000);
});

test("olib ketishda dostavka 0, QQS sozlanmasa 0", () => {
  const p = computePricing({ items, settings: {}, deliveryMethod: "pickup" });
  assert.equal(p.total, 40000);
  assert.equal(p.deliveryFee, 0);
  assert.equal(p.vat, 0);
});

test("QQS yoqilganda qo'shiladi", () => {
  const p = computePricing({ items, settings: { vatPercent: 12 }, deliveryMethod: "pickup" });
  assert.equal(p.vat, 4800);
  assert.equal(p.total, 44800);
});

test("bepul dostavka chegarasi", () => {
  const zone = { fee: 20000, freeThreshold: 40000, minOrder: 0 };
  const p = computePricing({ items, settings: {}, deliveryMethod: "delivery", zone });
  assert.equal(p.deliveryFee, 0);
  assert.equal(p.deliveryFree, true);
});

test("operator tasdiqlaydigan hudud: narx 0, pending=true", () => {
  const zone = { fee: 0, needsConfirm: true };
  const p = computePricing({ items, settings: {}, deliveryMethod: "delivery", zone });
  assert.equal(p.deliveryPending, true);
  assert.equal(p.total, 40000);
});

test("minimal buyurtma summasidan kam bo'lsa minOrderShort", () => {
  const zone = { fee: 1000, minOrder: 100000 };
  const p = computePricing({ items, settings: {}, deliveryMethod: "delivery", zone });
  assert.equal(p.minOrderShort, 60000);
});

test("hudud yo'q bo'lsa eski deliveryFee yagona hudud bo'ladi", () => {
  const z = effectiveZones({ deliveryFee: 20000, freeDeliveryThreshold: 500000 }, []);
  assert.equal(z.length, 1);
  assert.equal(z[0].fee, 20000);
  assert.equal(z[0].id, "default");
});
