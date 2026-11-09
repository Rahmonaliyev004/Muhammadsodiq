import { getZones, addZone } from "../../../lib/store";
import { requireAdmin } from "../../../lib/auth";
import { validateZoneInput } from "../../../lib/validation";

// Hududlarni tahrirlash faqat admin uchun. Mijozlar hududlarni
// /api/public-settings orqali oladi.
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, zones: await getZones() });
  }

  if (req.method === "POST") {
    const { ok, errors, value } = validateZoneInput(req.body);
    if (!ok) {
      return res.status(400).json({ ok: false, error: Object.values(errors)[0], fieldErrors: errors });
    }
    return res.status(200).json({ ok: true, zone: await addZone(value) });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
