import { verifyAdminCredentials } from "../../../lib/store";
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  checkLoginRateLimit,
  resetLoginRateLimit,
} from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.ADMIN_LOGIN || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12)
  ) {
    return res.status(503).json({
      ok: false,
      error: "Admin kirishi serverda sozlanmagan. O'rnatuvchiga murojaat qiling.",
    });
  }

  const { login, password } = req.body || {};
  if (!login || !password) {
    return res
      .status(400)
      .json({ ok: false, error: "Login va parolni kiriting." });
  }

  // Bir IP manzildan qisqa vaqt ichida ko'p marta noto'g'ri urinishning
  // oldini olish (parolni "qo'pol kuch" bilan topishga urinish himoyasi).
  const rateLimitKey =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  if (!checkLoginRateLimit(rateLimitKey)) {
    return res.status(429).json({
      ok: false,
      error: "Juda ko'p urinish. Iltimos 15 daqiqadan so'ng qayta urining.",
    });
  }

  const { admin, matches } = await verifyAdminCredentials(login, password);
  if (!matches || !verifyPassword(password, admin.passwordHash)) {
    return res
      .status(401)
      .json({ ok: false, error: "Login yoki parol noto'g'ri." });
  }

  resetLoginRateLimit(rateLimitKey);
  const token = createSessionToken(admin.login);
  setSessionCookie(res, token);
  return res.status(200).json({ ok: true });
}
