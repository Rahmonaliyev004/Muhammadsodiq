// Oddiy xotiradagi cheklagich (server qayta ishga tushsa tozalanadi).
// Buyurtma spami va login "qo'pol kuch" urinishlarini sekinlashtiradi.
const buckets = new Map();

export function rateLimit(bucket, key, max, windowMs) {
  const now = Date.now();
  const id = `${bucket}:${key}`;
  const entry = buckets.get(id);
  if (!entry || now - entry.start > windowMs) {
    buckets.set(id, { count: 1, start: now });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now - v.start > windowMs) buckets.delete(k);
    }
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

export function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return String(fwd).split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}
