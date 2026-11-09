import { fmt, fmtQty, unitLabel, paymentLabel } from "./data";

// Bot tokeni va chat ID faqat serverda, .env.local faylida saqlanadi
// (o'rnatuvchi dasturchi sozlaydi, do'kon egasi ko'rmaydi).

// Xato matnida token bo'lib qolmasligi uchun (log va bazaga yozishdan oldin)
function scrub(text, token) {
  let out = String(text || "");
  if (token) out = out.split(token).join("***");
  return out.replace(/bot\d+:[A-Za-z0-9_-]+/g, "bot***").slice(0, 300);
}

export function buildOrderMessage(order) {
  const p = order.pricing || {};
  const itemsText = (order.items || [])
    .map(
      (i) =>
        `• ${i.name} — ${fmtQty(i.qty, i.unit)} ${unitLabel(i.unit)} × ${fmt(i.price)} = ${fmt(i.qty * i.price)} so'm`,
    )
    .join("\n");

  const subtotal = p.subtotal ?? (order.items || []).reduce((s, i) => s + i.qty * i.price, 0);

  let deliveryLine;
  if (order.deliveryMethod === "delivery") {
    const fee = order.deliveryPending
      ? "narxi operator tomonidan tasdiqlanadi"
      : order.deliveryFee
        ? `${fmt(order.deliveryFee)} so'm`
        : "bepul";
    deliveryLine = `🚚 Yetkazib berish${order.zoneName ? ` (${order.zoneName})` : ""}: ${fee}`;
  } else {
    deliveryLine = "🏬 Do'kondan olib ketish (0 so'm)";
  }

  const lines = [
    "🆕 Yangi buyurtma!",
    `🧾 Raqami: ${order.num || "-"}`,
    `👤 Mijoz: ${order.customerName || "-"}`,
    `📞 Tel: ${order.customerPhone || "-"}`,
    deliveryLine,
    order.deliveryMethod === "delivery" ? `📍 Manzil: ${order.location || "-"}` : "",
    order.address?.carryToFloor ? `🛗 Qavatga olib chiqish: ${order.address.floor}-qavat` : "",
    "",
    "Mahsulotlar:",
    itemsText || "-",
    "",
    `Mahsulotlar summasi: ${fmt(subtotal)} so'm`,
    p.discount ? `Chegirma: −${fmt(p.discount)} so'm` : "",
    p.vat ? `QQS (${p.vatPercent}%): ${fmt(p.vat)} so'm` : "",
    order.deliveryMethod === "delivery" && !order.deliveryPending
      ? `Dostavka: ${order.deliveryFee ? `${fmt(order.deliveryFee)} so'm` : "bepul"}`
      : "",
    p.extras ? `Qo'shimcha xizmatlar: ${fmt(p.extras)} so'm` : "",
    `💰 Jami: ${fmt(order.total || 0)} so'm${order.deliveryPending ? " (dostavkasiz)" : ""}`,
    `💳 To'lov: ${paymentLabel(order.paymentMethod)}`,
    order.comment ? `💬 Izoh: ${order.comment}` : "",
    `🕒 ${new Date(new Date(order.createdAt).getTime() + 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 16)} (Toshkent vaqti)`,
  ];
  return lines.filter((l, i, arr) => l !== "" || (arr[i - 1] !== "" && i !== 0)).join("\n");
}

// Natija: { ok: true } yoki { ok: false, error: "qisqa matn" }.
// Hech qachon exception tashlamaydi — buyurtma Telegram sabab yo'qolmasligi kerak.
export async function sendOrderTelegramMessage(order) {
  if (process.env.DISABLE_TELEGRAM === "true") {
    return { ok: false, skipped: true, error: "Telegram smoke test uchun o'chirilgan" };
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return { ok: false, skipped: true, error: "Telegram bot sozlanmagan (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID)" };
  }

  try {
    const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text: buildOrderMessage(order) }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await resp.json().catch(() => ({}));
    if (!data.ok) {
      return { ok: false, error: scrub(`Telegram API: ${data.description || resp.status}`, BOT_TOKEN) };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: scrub(`Tarmoq xatosi: ${err?.cause?.code || err?.message || err}`, BOT_TOKEN) };
  }
}
