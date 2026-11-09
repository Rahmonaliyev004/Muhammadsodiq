import { getCouriers, addCourier } from "../../../lib/store";
import { requireAdmin } from "../../../lib/auth";
import { validateCourierInput } from "../../../lib/validation";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, couriers: await getCouriers() });
  }

  if (req.method === "POST") {
    const { ok, errors, value } = validateCourierInput(req.body);
    if (!ok) {
      return res.status(400).json({ ok: false, error: Object.values(errors)[0], fieldErrors: errors });
    }
    return res.status(200).json({ ok: true, courier: await addCourier(value) });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
