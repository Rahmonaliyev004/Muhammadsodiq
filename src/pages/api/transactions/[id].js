import { deleteTransaction } from "../../../lib/store";
import { requireAdmin } from "../../../lib/auth";
import { logEvent } from "../../../lib/log";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const id = Number(req.query.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, error: "Noto'g'ri ID" });
  }

  if (req.method === "DELETE") {
    try {
      const deleted = await deleteTransaction(id);
      if (!deleted) return res.status(404).json({ ok: false, error: "Kassa yozuvi topilmadi" });
    } catch (err) {
      logEvent("error", "Kassa yozuvini o'chirishda xato", { id, error: err.message });
      return res.status(500).json({ ok: false, error: "Server xatosi" });
    }
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", ["DELETE"]);
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
