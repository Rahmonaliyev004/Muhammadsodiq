// Admin login/parolini almashtirish (o'rnatuvchi dasturchi uchun):
//   npm run set-admin -- <login> <yangi-parol>                 (oddiy o'rnatish)
//   npm run set-admin -- --shop=doston <login> <yangi-parol>   (ko'p do'konli server)
import fs from "fs";
import path from "path";
import crypto from "crypto";

const args = process.argv.slice(2);
const shopArg = args.find((a) => a.startsWith("--shop="));
const [login, password] = args.filter((a) => !a.startsWith("--"));

if (!login || !password || password.length < 12) {
  console.error("Foydalanish: npm run set-admin -- [--shop=id] <login> <parol (kamida 12 belgi)>");
  process.exit(1);
}

let dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
if (shopArg) {
  const cfg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "deploy", "shops.json"), "utf8"));
  dataDir = path.join(cfg.dataRoot || "/var/santexnik/shops", shopArg.split("=")[1]);
}

const file = path.join(dataDir, "store.json");
if (!fs.existsSync(file)) {
  console.error(`${file} topilmadi. Avval sayt bir marta ishga tushirilishi kerak.`);
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");
const data = JSON.parse(fs.readFileSync(file, "utf8"));
data.admin = { login, passwordHash: `${salt}:${hash}` };
fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
console.log(`Tayyor: admin login "${login}", parol yangilandi.`);
