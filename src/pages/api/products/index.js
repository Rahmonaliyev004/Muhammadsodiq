import { getProducts, addProduct } from "../../../lib/store";
import { getSession } from "../../../lib/auth";
import { requireAdmin } from "../../../lib/auth";
import { validateProductInput } from "../../../lib/validation";
import { logEvent } from "../../../lib/log";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const products = await getProducts();
      // Mijozlar faqat faol mahsulotlarni ko'radi. Admin (?all=1) — hammasini.
      const wantAll = req.query.all === "1" && getSession(req);
      return res.status(200).json({
        ok: true,
        products: wantAll ? products : products.filter((p) => p.active !== false),
      });
    } catch (err) {
      logEvent("error", "Mahsulotlarni o'qishda xato", { error: err.message });
      return res.status(500).json({ ok: false, error: "Server xatosi" });
    }
  }

  if (req.method === "POST") {
    if (!requireAdmin(req, res)) return;
    const { ok, errors, value } = validateProductInput(req.body);
    if (!ok) {
      return res.status(400).json({ ok: false, error: Object.values(errors)[0], fieldErrors: errors });
    }
    const product = await addProduct(value);
    return res.status(200).json({ ok: true, product });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
