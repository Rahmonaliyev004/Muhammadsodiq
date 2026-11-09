import { updateZone, deleteZone } from "../../../lib/store";
import { requireAdmin } from "../../../lib/auth";
import { validateZoneInput } from "../../../lib/validation";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const id = Number(req.query.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, error: "Noto'g'ri ID" });
  }

  if (req.method === "PUT") {
    const { ok, errors, value } = validateZoneInput(req.body);
    if (!ok) {
      return res.status(400).json({ ok: false, error: Object.values(errors)[0], fieldErrors: errors });
    }
    const zone = await updateZone(id, value);
    if (!zone) return res.status(404).json({ ok: false, error: "Hudud topilmadi" });
    return res.status(200).json({ ok: true, zone });
  }

  if (req.method === "DELETE") {
    const ok = await deleteZone(id);
    if (!ok) return res.status(404).json({ ok: false, error: "Hudud topilmadi" });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
