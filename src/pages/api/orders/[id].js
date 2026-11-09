import { updateOrder, deleteOrder, OrderError } from "../../../lib/store";
import { requireAdmin } from "../../../lib/auth";
import { ORDER_STATUSES } from "../../../lib/data";
import { logEvent } from "../../../lib/log";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const id = Number(req.query.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, error: "Noto'g'ri ID" });
  }

  if (req.method === "PATCH") {
    const body = req.body || {};
    const patch = {};

    if (body.status !== undefined) {
      if (!ORDER_STATUSES.includes(body.status)) {
        return res.status(400).json({ ok: false, error: "Noto'g'ri status" });
      }
      patch.status = body.status;
      if (body.note) patch.note = body.note;
    }
    if (body.courierId !== undefined) {
      patch.courierId = body.courierId === null ? null : Number(body.courierId);
      if (patch.courierId !== null && !patch.courierId) {
        return res.status(400).json({ ok: false, error: "Noto'g'ri kuryer" });
      }
    }
    if (body.paymentConfirmed === true) patch.paymentConfirmed = true;
    if (body.deliveryFee !== undefined) {
      const fee = Number(body.deliveryFee);
      if (!Number.isFinite(fee) || fee < 0) {
        return res.status(400).json({ ok: false, error: "Dostavka narxi noto'g'ri" });
      }
      patch.deliveryFee = fee;
    }
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ ok: false, error: "O'zgartirish ko'rsatilmagan" });
    }

    try {
      const { order, transaction } = await updateOrder(id, patch);
      if (!order) return res.status(404).json({ ok: false, error: "Buyurtma topilmadi" });
      return res.status(200).json({ ok: true, order, transaction });
    } catch (err) {
      if (err instanceof OrderError) {
        return res.status(err.status).json({ ok: false, error: err.message });
      }
      logEvent("error", "Buyurtmani yangilashda xato", { id, error: err.message });
      return res.status(500).json({ ok: false, error: "Server xatosi" });
    }
  }

  if (req.method === "DELETE") {
    const ok = await deleteOrder(id);
    if (!ok) return res.status(404).json({ ok: false, error: "Buyurtma topilmadi" });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", ["PATCH", "DELETE"]);
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
