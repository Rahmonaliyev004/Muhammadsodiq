import { getTransactions, addTransaction } from "../../../lib/store";
import { requireAdmin } from "../../../lib/auth";
import { logEvent } from "../../../lib/log";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    try {
      const transactions = await getTransactions();
      return res.status(200).json({ ok: true, transactions });
    } catch (err) {
      logEvent("error", "Kassa yozuvlarini o'qishda xato", { error: err.message });
      return res.status(500).json({ ok: false, error: "Server xatosi" });
    }
  }

  if (req.method === "POST") {
    const t = req.body || {};
    const amount = Number(t.amount);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return res.status(400).json({ ok: false, error: "Summani to'g'ri kiriting." });
    }
    if (!["Kirim", "Chiqim"].includes(t.type)) {
      return res.status(400).json({ ok: false, error: "Kirim yoki chiqim turini tanlang." });
    }
    if (t.desc !== undefined && typeof t.desc !== "string") {
      return res.status(400).json({ ok: false, error: "Izoh matn bo'lishi kerak." });
    }
    try {
      const transaction = await addTransaction({
        type: t.type,
        amount,
        desc: (t.desc || "").slice(0, 200),
      });
      return res.status(200).json({ ok: true, transaction });
    } catch (err) {
      logEvent("error", "Kassa yozuvini saqlashda xato", { error: err.message });
      return res.status(500).json({ ok: false, error: "Server xatosi" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
