import test from "node:test";
import assert from "node:assert/strict";
import { normalizePhone, validateOrderInput, validateProductInput } from "../src/lib/validation.js";

test("telefon: turli formatlar bir xil ko'rinishga keladi", () => {
  assert.equal(normalizePhone("90 123 45 67"), "+998 90 123 45 67");
  assert.equal(normalizePhone("+998901234567"), "+998 90 123 45 67");
  assert.equal(normalizePhone("998 (90) 123-45-67"), "+998 90 123 45 67");
});

test("telefon: noto'g'ri formatlar rad etiladi", () => {
  for (const bad of ["", "123", "+1 555 123 4567", "090123456", "9012345678901", "abc"]) {
    assert.equal(normalizePhone(bad), null, bad);
  }
});

const base = {
  customerName: "Aziz Karimov",
  customerPhone: "901234567",
  deliveryMethod: "pickup",
  paymentMethod: "cash",
  items: [{ id: 1, qty: 2 }],
};

test("to'g'ri buyurtma o'tadi", () => {
  const r = validateOrderInput(base);
  assert.equal(r.ok, true);
  assert.equal(r.value.customerPhone, "+998 90 123 45 67");
});

test("majburiy maydonlar bo'sh qolsa xato", () => {
  const r = validateOrderInput({ deliveryMethod: "pickup", items: [] });
  assert.equal(r.ok, false);
  assert.ok(r.errors.customerName && r.errors.customerPhone && r.errors.paymentMethod && r.errors.items);
});

test("yetkazib berishda manzil maydonlari majburiy", () => {
  const r = validateOrderInput({ ...base, deliveryMethod: "delivery" });
  assert.equal(r.ok, false);
  assert.ok(r.errors.zoneId && r.errors.district && r.errors.street && r.errors.house);
});

test("takroriy mahsulot miqdori birlashadi, manfiy miqdor rad etiladi", () => {
  const merged = validateOrderInput({ ...base, items: [{ id: 1, qty: 2 }, { id: 1, qty: 3 }] });
  assert.deepEqual(merged.value.items, [{ id: 1, qty: 5 }]);
  assert.equal(validateOrderInput({ ...base, items: [{ id: 1, qty: -1 }] }).ok, false);
  assert.equal(validateOrderInput({ ...base, items: [{ id: 1, qty: 0 }] }).ok, false);
});

test("mahsulot: narx va rasm havolasi tekshiriladi", () => {
  assert.equal(validateProductInput({ name: "Kran", category: "Kranlar va smesitellar", price: 0 }).ok, false);
  assert.equal(
    validateProductInput({ name: "Kran", category: "Kranlar va smesitellar", price: 1000, img: "javascript:alert(1)" }).ok,
    false,
  );
  assert.equal(
    validateProductInput({ name: "Kran", category: "Kranlar va smesitellar", price: 1000, img: "/api/files/ab12.png" }).ok,
    true,
  );
});
