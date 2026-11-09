import test, { before } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "santexnik-api-test-"));
process.env.SESSION_SECRET = "api-hardening-test-secret";
process.env.ADMIN_PASSWORD = "api-hardening-test-password";

let auth;
let token;
let transactionsHandler;
let transactionHandler;
let settingsHandler;
let loginHandler;
let store;

before(async () => {
  auth = await import("../src/lib/auth.js");
  store = await import("../src/lib/store.js");
  ({ default: transactionsHandler } = await import("../src/pages/api/transactions/index.js"));
  ({ default: transactionHandler } = await import("../src/pages/api/transactions/[id].js"));
  ({ default: settingsHandler } = await import("../src/pages/api/settings/index.js"));
  ({ default: loginHandler } = await import("../src/pages/api/auth/login.js"));
  token = auth.createSessionToken("test-admin");
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

function adminRequest(method, body, query = {}) {
  return {
    method,
    body,
    query,
    headers: { cookie: `santexnik_admin_session=${token}` },
  };
}

test("noto'g'ri formatlangan cookie sessiyasiz so'rov sifatida rad etiladi", () => {
  assert.equal(auth.getSession({ headers: { cookie: "santexnik_admin_session=%zz" } }), null);
});

test("sessiya imzosi to'g'ri bo'lsa ham muddati bo'lmagan token rad etiladi", () => {
  const data = Buffer.from(JSON.stringify({ login: "admin" })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", process.env.SESSION_SECRET)
    .update(data)
    .digest("base64url");
  assert.equal(auth.verifySessionToken(`${data}.${signature}`), null);
});

test("ishlab chiqarishda sessiya kaliti yo'q yoki qisqa bo'lsa token tuzilmaydi", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.SESSION_SECRET;
  process.env.NODE_ENV = "production";

  delete process.env.SESSION_SECRET;
  assert.throws(() => auth.createSessionToken("admin"), /SESSION_SECRET.*majburiy/);
  process.env.SESSION_SECRET = "too-short";
  assert.throws(() => auth.createSessionToken("admin"), /kamida 32 bayt/);

  process.env.SESSION_SECRET = originalSecret;
  if (originalEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalEnv;
});

test("ishlab chiqarishda admin login va kamida 12 belgili parol talab qilinadi", async () => {
  const originalEnv = process.env.NODE_ENV;
  const originalLogin = process.env.ADMIN_LOGIN;
  const originalPassword = process.env.ADMIN_PASSWORD;
  process.env.NODE_ENV = "production";

  delete process.env.ADMIN_LOGIN;
  delete process.env.ADMIN_PASSWORD;
  const missing = createResponse();
  await loginHandler({ method: "POST", body: { login: "admin", password: "admin123" } }, missing);
  assert.equal(missing.statusCode, 503);

  process.env.ADMIN_LOGIN = "admin";
  process.env.ADMIN_PASSWORD = "weak";
  const weak = createResponse();
  await loginHandler({ method: "POST", body: { login: "admin", password: "weak" } }, weak);
  assert.equal(weak.statusCode, 503);

  if (originalLogin === undefined) delete process.env.ADMIN_LOGIN;
  else process.env.ADMIN_LOGIN = originalLogin;
  if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD;
  else process.env.ADMIN_PASSWORD = originalPassword;
  if (originalEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalEnv;
});

test("kassa API noto'g'ri summa va tur qiymatlarini saqlamaydi", async () => {
  for (const body of [
    { type: "Kirim", amount: -1 },
    { type: "Kirim", amount: 1.5 },
    { type: "Boshqa", amount: 100 },
  ]) {
    const res = createResponse();
    await transactionsHandler(adminRequest("POST", body), res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.ok, false);
  }
});

test("kassa yozuvi serverga yoziladi va mavjud bo'lmagan ID o'chirilmaydi", async () => {
  const res = createResponse();
  await transactionsHandler(
    adminRequest("POST", { type: "Chiqim", amount: 25000, desc: "Do'kon xarajati" }),
    res,
  );
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.transaction.type, "Chiqim");
  assert.equal((await store.getTransactions()).some((item) => item.id === res.body.transaction.id), true);

  const missing = createResponse();
  await transactionHandler(adminRequest("DELETE", undefined, { id: 987654321 }), missing);
  assert.equal(missing.statusCode, 404);
});

test("sozlamalar API noto'g'ri sonlarni rad etib, to'g'ri qiymatni saqlaydi", async () => {
  const invalid = createResponse();
  await settingsHandler(
    adminRequest("PUT", { settings: { deliveryFee: "xato" } }),
    invalid,
  );
  assert.equal(invalid.statusCode, 400);

  const valid = createResponse();
  await settingsHandler(
    adminRequest("PUT", { settings: { deliveryFee: 35000 } }),
    valid,
  );
  assert.equal(valid.statusCode, 200);
  assert.equal((await store.getSettings()).deliveryFee, 35000);
});
