import crypto from "crypto";

// ---------------------------------------------------------------------------
// Xavfsizlik: parol hech qachon ochiq matnda saqlanmaydi (scrypt bilan
// xeshlanadi), sessiya esa HttpOnly cookie orqali, HMAC bilan imzolangan
// tokenda saqlanadi (JavaScript orqali o'qib bo'lmaydi, soxtalashtirib
// bo'lmaydi). Tashqi kutubxona (bcrypt, jsonwebtoken) ishlatilmagan —
// Node.js ning o'z crypto moduli yetarli va o'rnatishda muammo tug'dirmaydi.
// ---------------------------------------------------------------------------

const SESSION_COOKIE = "santexnik_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 kun

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET production muhitida majburiy");
    }
    console.warn(
      "[auth] OGOHLANTIRISH: SESSION_SECRET .env.local da yo'q! Standart kalit ishlatilmoqda — buni albatta to'ldiring.",
    );
    return "santexnik-fallback-secret-CHANGE-ME";
  }
  if (process.env.NODE_ENV === "production" && Buffer.byteLength(secret) < 32) {
    throw new Error("SESSION_SECRET kamida 32 bayt bo'lishi kerak");
  }
  return secret;
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  try {
    const attempt = crypto.scryptSync(password, salt, 64).toString("hex");
    const a = Buffer.from(hash, "hex");
    const b = Buffer.from(attempt, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

function unsign(token) {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function createSessionToken(login) {
  return sign({ login, exp: Date.now() + SESSION_MAX_AGE * 1000 });
}

export function verifySessionToken(token) {
  const payload = unsign(token);
  if (
    !payload ||
    typeof payload.login !== "string" ||
    !payload.login ||
    !Number.isFinite(payload.exp) ||
    Date.now() > payload.exp
  ) {
    return null;
  }
  return payload;
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    try {
      out[part.slice(0, idx).trim()] = decodeURIComponent(
        part.slice(idx + 1).trim(),
      );
    } catch {
      // Noto'g'ri formatlangan cookie sessiyasiz so'rov sifatida ko'riladi.
    }
  });
  return out;
}

export function getSession(req) {
  const cookies = parseCookies(req.headers?.cookie);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  return verifySessionToken(token);
}

export function setSessionCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax${isProd ? "; Secure" : ""}`,
  );
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`,
  );
}

// Admin API route'larida chaqiriladi. Sessiya yaroqsiz bo'lsa 401 qaytarib,
// null beradi — chaqirgan kod shunda darhol return qilishi kerak.
export function requireAdmin(req, res) {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ ok: false, error: "Tizimga kirish talab qilinadi" });
    return null;
  }
  return session;
}

// ------------------------- Login urinishlarini cheklash -------------------
// Oddiy xotiradagi hisoblagich — parolni "brute force" bilan topishga
// urinishlarni sekinlashtiradi. Server qayta ishga tushsa tozalanadi, bu
// kichik do'kon uchun yetarli himoya.
const attempts = new Map();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000; // 15 daqiqa

export function checkLoginRateLimit(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.start > WINDOW_MS) {
    attempts.set(key, { count: 1, start: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_ATTEMPTS;
}

export function resetLoginRateLimit(key) {
  attempts.delete(key);
}
