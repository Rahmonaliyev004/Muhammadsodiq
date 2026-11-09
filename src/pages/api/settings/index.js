import { getSettings, updateSettings } from "../../../lib/store";
import { requireAdmin } from "../../../lib/auth";
import { logEvent } from "../../../lib/log";

const TEXT_FIELDS = ["storeName", "phone", "address", "storeHours", "pickupNote"];
const NUMBER_FIELDS = [
  "deliveryFee",
  "freeDeliveryThreshold",
  "heavySurcharge",
  "floorCarryFee",
  "discountMinTotal",
];
const PERCENT_FIELDS = ["vatPercent", "discountPercent"]; // 0–100

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    try {
      return res.status(200).json({ ok: true, settings: await getSettings() });
    } catch (err) {
      logEvent("error", "Sozlamalarni o'qishda xato", { error: err.message });
      return res.status(500).json({ ok: false, error: "Server xatosi" });
    }
  }

  if (req.method === "PUT") {
    const input = req.body?.settings;
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return res.status(400).json({ ok: false, error: "Sozlamalar formati noto'g'ri." });
    }
    const patch = {};
    for (const key of TEXT_FIELDS) {
      if (input[key] !== undefined) {
        if (typeof input[key] !== "string") {
          return res.status(400).json({ ok: false, error: `${key} matn bo'lishi kerak.` });
        }
        patch[key] = input[key].trim().slice(0, 300);
      }
    }
    for (const key of NUMBER_FIELDS) {
      if (input[key] !== undefined) {
        const value = Number(input[key]);
        if (!Number.isFinite(value) || value < 0) {
          return res.status(400).json({ ok: false, error: `${key} manfiy bo'lmasligi kerak.` });
        }
        patch[key] = Math.round(value);
      }
    }
    for (const key of PERCENT_FIELDS) {
      if (input[key] !== undefined) {
        const value = Number(input[key]);
        if (!Number.isFinite(value) || value < 0 || value > 100) {
          return res.status(400).json({ ok: false, error: `${key} 0 dan 100 gacha bo'lishi kerak.` });
        }
        patch[key] = value;
      }
    }
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ ok: false, error: "Saqlash uchun sozlama ko'rsatilmagan." });
    }
    try {
      const settings = await updateSettings(patch);
      return res.status(200).json({ ok: true, settings });
    } catch (err) {
      logEvent("error", "Sozlamalarni saqlashda xato", { error: err.message });
      return res.status(500).json({ ok: false, error: "Server xatosi" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
