// Bitta kod nusxasi bilan ko'p do'konni ishga tushirish uchun sozlamalarni yaratadi.
//
//   1) deploy/shops.example.json ni deploy/shops.json ga nusxalab, do'konlarni yozing
//   2) node scripts/generate-deploy.mjs
//   3) deploy/generated/ecosystem.config.cjs  -> pm2 uchun
//      deploy/generated/Caddyfile             -> HTTPS + domenlar uchun
//
// Parol, sessiya kaliti va port avtomatik yaratilib shops.json ga yoziladi
// (keyingi ishga tushirishda o'zgarmaydi).
import fs from "fs";
import path from "path";
import crypto from "crypto";

const file = path.join(process.cwd(), "deploy", "shops.json");
if (!fs.existsSync(file)) {
  console.error("deploy/shops.json topilmadi. deploy/shops.example.json ni nusxalang.");
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(file, "utf8"));
const rand = (n) => crypto.randomBytes(n).toString("hex");
const appDir = config.appDir || process.cwd();
const dataRoot = config.dataRoot || "/var/santexnik/shops";
const created = [];

if (!Array.isArray(config.shops) || config.shops.length === 0) {
  throw new Error("deploy/shops.json ichida kamida bitta do'kon bo'lishi kerak");
}

const ids = new Set();
const domains = new Set();
const ports = new Set();
config.shops.forEach((shop, i) => {
  if (!shop.id || !/^[a-z0-9-]+$/.test(shop.id)) throw new Error(`Noto'g'ri id: ${shop.id}`);
  if (ids.has(shop.id)) throw new Error(`Takroriy do'kon id: ${shop.id}`);
  ids.add(shop.id);
  if (
    typeof shop.domain !== "string" ||
    !/^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?:\.(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?))*$/.test(shop.domain)
  ) {
    throw new Error(`"${shop.id}" uchun domain noto'g'ri`);
  }
  const normalizedDomain = shop.domain.toLowerCase();
  if (domains.has(normalizedDomain)) throw new Error(`Takroriy domain: ${shop.domain}`);
  domains.add(normalizedDomain);
  shop.port = shop.port || 3001 + i;
  if (!Number.isInteger(shop.port) || shop.port < 1024 || shop.port > 65535) {
    throw new Error(`"${shop.id}" uchun port 1024–65535 oralig'ida bo'lishi kerak`);
  }
  if (ports.has(shop.port)) throw new Error(`Takroriy port: ${shop.port}`);
  ports.add(shop.port);
  shop.sessionSecret = shop.sessionSecret || rand(32);
  if (!shop.adminPassword) {
    shop.adminPassword = rand(16);
    created.push(`${shop.id}: login=${shop.adminLogin || "admin"} parol=${shop.adminPassword}`);
  }
  if (typeof shop.adminPassword !== "string" || shop.adminPassword.length < 12) {
    throw new Error(`"${shop.id}" admin paroli kamida 12 belgidan iborat bo'lishi kerak`);
  }
  if (typeof shop.sessionSecret !== "string" || Buffer.byteLength(shop.sessionSecret) < 32) {
    throw new Error(`"${shop.id}" SESSION_SECRET kamida 32 bayt bo'lishi kerak`);
  }
  shop.adminLogin = shop.adminLogin || "admin";
});
fs.writeFileSync(file, JSON.stringify(config, null, 2) + "\n");

const apps = config.shops.map((s) => ({
  name: `santexnik-${s.id}`,
  cwd: appDir,
  script: "node_modules/next/dist/bin/next",
  args: `start -p ${s.port}`,
  env: {
    NODE_ENV: "production",
    DATA_DIR: path.join(dataRoot, s.id),
    SESSION_SECRET: s.sessionSecret,
    TELEGRAM_BOT_TOKEN: s.telegramBotToken || "",
    TELEGRAM_CHAT_ID: s.telegramChatId || "",
    ADMIN_LOGIN: s.adminLogin,
    ADMIN_PASSWORD: s.adminPassword,
    STORE_NAME: s.storeName || "",
    STORE_PHONE: s.phone || "",
    STORE_ADDRESS: s.address || "",
    DELIVERY_FEE: String(s.deliveryFee ?? 20000),
    FREE_DELIVERY_THRESHOLD: String(s.freeDeliveryThreshold ?? 0),
    SEED_DEMO: s.demo ? "true" : "false",
  },
}));

const out = path.join(process.cwd(), "deploy", "generated");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(
  path.join(out, "ecosystem.config.cjs"),
  `module.exports = ${JSON.stringify({ apps }, null, 2)};\n`,
);
fs.writeFileSync(
  path.join(out, "Caddyfile"),
  config.shops
    .map((s) => `${s.domain} {\n  encode gzip\n  request_body {\n    max_size 8MB\n  }\n  reverse_proxy 127.0.0.1:${s.port}\n}\n`)
    .join("\n"),
);

console.log(`Tayyor: ${config.shops.length} ta do'kon.`);
created.forEach((c) => console.log("YANGI ADMIN ->", c));
console.log("Keyingi qadam: pm2 startOrReload deploy/generated/ecosystem.config.cjs && pm2 save");
console.log("Caddy: deploy/generated/Caddyfile ni /etc/caddy/Caddyfile ga qo'yib, `sudo systemctl reload caddy`");
