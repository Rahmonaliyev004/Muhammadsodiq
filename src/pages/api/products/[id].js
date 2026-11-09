import { updateProduct, deleteProduct } from "../../../lib/store";
import { requireAdmin } from "../../../lib/auth";
import { validateProductInput } from "../../../lib/validation";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const id = Number(req.query.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, error: "Noto'g'ri ID" });
  }

  if (req.method === "PUT") {
    // Faqat ruxsat etilgan maydonlar (id va boshqa ichki maydonlar o'zgarmaydi)
    const { ok, errors, value } = validateProductInput(req.body, { partial: true });
    if (!ok) {
      return res.status(400).json({ ok: false, error: Object.values(errors)[0], fieldErrors: errors });
    }
    const updated = await updateProduct(id, value);
    if (!updated) return res.status(404).json({ ok: false, error: "Mahsulot topilmadi" });
    return res.status(200).json({ ok: true, product: updated });
  }

  if (req.method === "DELETE") {
    const deleted = await deleteProduct(id);
    if (!deleted) return res.status(404).json({ ok: false, error: "Mahsulot topilmadi" });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
