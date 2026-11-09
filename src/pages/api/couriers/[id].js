import { updateCourier, deleteCourier } from "../../../lib/store";
import { requireAdmin } from "../../../lib/auth";
import { validateCourierInput } from "../../../lib/validation";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const id = Number(req.query.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, error: "Noto'g'ri ID" });
  }

  if (req.method === "PUT") {
    const { ok, errors, value } = validateCourierInput(req.body);
    if (!ok) {
      return res.status(400).json({ ok: false, error: Object.values(errors)[0], fieldErrors: errors });
    }
    const courier = await updateCourier(id, value);
    if (!courier) return res.status(404).json({ ok: false, error: "Kuryer topilmadi" });
    return res.status(200).json({ ok: true, courier });
  }

  if (req.method === "DELETE") {
    const result = await deleteCourier(id);
    if (result.reason === "busy") {
      return res.status(409).json({
        ok: false,
        error: "Kuryerning yakunlanmagan buyurtmasi bor. Uni faol emas qiling.",
      });
    }
    if (!result.ok) return res.status(404).json({ ok: false, error: "Kuryer topilmadi" });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
