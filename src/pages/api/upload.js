import fs from "fs";
import path from "path";
import crypto from "crypto";
import { DATA_DIR } from "../../lib/store";
import { requireAdmin } from "../../lib/auth";

// Base64 rasm qabul qiladi (brauzer uni oldindan kichraytirib yuboradi).
export const config = { api: { bodyParser: { sizeLimit: "6mb" } } };

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(
    (req.body || {}).dataUrl || "",
  );
  if (!match) {
    return res.status(400).json({ ok: false, error: "Faqat JPG, PNG yoki WEBP rasm." });
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 4 * 1024 * 1024) {
    return res.status(400).json({ ok: false, error: "Rasm hajmi 4MB dan oshmasin." });
  }

  const dir = path.join(DATA_DIR, "uploads");
  fs.mkdirSync(dir, { recursive: true });
  const name = `${crypto.randomBytes(12).toString("hex")}.${TYPES[match[1]]}`;
  fs.writeFileSync(path.join(dir, name), buffer);

  return res.status(200).json({ ok: true, url: `/api/files/${name}` });
}
