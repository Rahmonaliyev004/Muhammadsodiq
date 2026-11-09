import fs from "fs";
import path from "path";
import { DATA_DIR } from "../../../lib/store";

const MIME = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

// Yuklangan mahsulot rasmlarini ochiq beradi. Fayl nomi qat'iy tekshiriladi
// (papkadan tashqariga chiqib ketishning oldini olish uchun).
export default function handler(req, res) {
  const name = String(req.query.name || "");
  const m = /^[a-f0-9]{24}\.(jpg|png|webp)$/.exec(name);
  if (!m) return res.status(404).end();

  const file = path.join(DATA_DIR, "uploads", name);
  if (!fs.existsSync(file)) return res.status(404).end();

  res.setHeader("Content-Type", MIME[m[1]]);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  return res.status(200).send(fs.readFileSync(file));
}
