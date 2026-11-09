import { getOrders, createOrder, markOrderTelegram, OrderError } from "../../../lib/store";
import { requireAdmin } from "../../../lib/auth";
import { sendOrderTelegramMessage } from "../../../lib/telegram";
import { validateOrderInput } from "../../../lib/validation";
import { rateLimit, clientIp } from "../../../lib/ratelimit";
import { logEvent } from "../../../lib/log";

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (!requireAdmin(req, res)) return;
    try {
      const orders = await getOrders();
      return res.status(200).json({ ok: true, orders });
    } catch (err) {
      logEvent("error", "Buyurtmalarni o'qishda xato", { error: err.message });
      return res.status(500).json({ ok: false, error: "Server xatosi" });
    }
  }

  if (req.method === "POST") {
    // Buyurtma berish — mijoz uchun ochiq (login talab qilinmaydi), lekin
    // spamdan himoyalangan: bir IP dan 10 daqiqada 10 tagacha
    // (ORDER_RATE_LIMIT muhit o'zgaruvchisi bilan o'zgartiriladi).
    const limit = Number(process.env.ORDER_RATE_LIMIT) || 10;
    if (!rateLimit("order", clientIp(req), limit, 10 * 60 * 1000)) {
      return res.status(429).json({
        ok: false,
        error: "Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring.",
      });
    }

    const { ok, errors, value } = validateOrderInput(req.body);
    if (!ok) {
      return res.status(400).json({
        ok: false,
        error: Object.values(errors)[0],
        fieldErrors: errors,
      });
    }

    let result;
    try {
      // Narx, qoldiq, dostavka va jami summa serverda qayta hisoblanadi —
      // brauzerdan kelgan narxga umuman ishonilmaydi.
      result = await createOrder(value);
    } catch (err) {
      if (err instanceof OrderError) {
        return res.status(err.status).json({
          ok: false,
          error: err.message,
          fieldErrors: err.field ? { [err.field]: err.message } : undefined,
        });
      }
      logEvent("error", "Buyurtma yaratishda kutilmagan xato", { error: err.message });
      return res.status(500).json({
        ok: false,
        error: "Buyurtmani saqlashda xatolik yuz berdi. Qayta urinib ko'ring.",
      });
    }

    const { order, duplicate } = result;

    // Buyurtma ALLAQACHON bazada. Telegram xabari muvaffaqiyatsiz bo'lsa ham
    // mijozga buyurtma qabul qilingani aytiladi, muammo esa admin uchun
    // buyurtmada va logda saqlanadi. Takroriy so'rovda qayta yuborilmaydi.
    if (!duplicate) {
      const tg = await sendOrderTelegramMessage(order);
      try {
        await markOrderTelegram(order.id, tg.ok, tg.ok ? null : tg.error);
      } catch (err) {
        logEvent("error", "Telegram holatini saqlashda xato", { error: err.message });
      }
      if (!tg.ok) {
        logEvent("error", "Telegram xabari yuborilmadi", { order: order.num, error: tg.error });
      }
    }

    // Mijozga faqat kerakli maydonlar qaytariladi
    return res.status(200).json({
      ok: true,
      duplicate,
      order: {
        num: order.num,
        status: order.status,
        total: order.total,
        deliveryMethod: order.deliveryMethod,
        deliveryFee: order.deliveryFee,
        deliveryPending: order.deliveryPending,
        paymentMethod: order.paymentMethod,
      },
    });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
