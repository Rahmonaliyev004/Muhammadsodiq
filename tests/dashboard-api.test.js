import test, { before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "santexnik-dashboard-test-"));
process.env.DATA_DIR = dataDir;
process.env.SESSION_SECRET = "dashboard-test-secret";
process.env.ADMIN_PASSWORD = "dashboard-test-password";

let handler;
let createSessionToken;
let store;

before(async () => {
  store = await import("../src/lib/store.js");
  ({ createSessionToken } = await import("../src/lib/auth.js"));
  ({ default: handler } = await import("../src/pages/api/dashboard.js"));

  await store.addProduct({
    name: "Test nasos",
    category: "Suv nasoslari",
    price: 100000,
    stock: 3,
    unit: "dona",
    active: true,
  });
  await store.addProduct({
    name: "Nofaol mahsulot",
    category: "Boshqa mahsulotlar",
    price: 50000,
    stock: 1,
    unit: "dona",
    active: false,
  });
  await store.addTransaction({ type: "Kirim", amount: 150000 });
  await store.addTransaction({ type: "Chiqim", amount: 40000 });
});

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("dashboard API admin sessiyasiz 401 qaytaradi", async () => {
  const res = createResponse();
  await handler({ method: "GET", headers: {} }, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.ok, false);
});

test("dashboard API admin statistikani qaytaradi", async () => {
  const res = createResponse();
  await handler(
    {
      method: "GET",
      headers: { cookie: `santexnik_admin_session=${createSessionToken("admin")}` },
    },
    res,
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.stats.totalProducts, 2);
  assert.equal(res.body.stats.totalItems, 4);
  assert.equal(res.body.stats.lowStock, 1);
  assert.equal(res.body.stats.lowStockList[0].name, "Test nasos");
  assert.equal(res.body.stats.totalIncome, 150000);
  assert.equal(res.body.stats.totalExpense, 40000);
  assert.equal(res.body.stats.months.length, 6);
});

test("dashboard API faqat GET хүсэлтийг зөвшөөрдөг", async () => {
  const res = createResponse();
  await handler(
    {
      method: "POST",
      headers: { cookie: `santexnik_admin_session=${createSessionToken("admin")}` },
    },
    res,
  );

  assert.equal(res.statusCode, 405);
  assert.deepEqual(res.headers.Allow, ["GET"]);
});
