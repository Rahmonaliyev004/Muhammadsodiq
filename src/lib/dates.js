// Sanalar O'zbekiston vaqti (UTC+5) bo'yicha olinadi — server UTC da ishlasa
// ham "bugun" tushunchasi do'kon egasining kuniga mos bo'ladi.
const TZ_OFFSET_MS = 5 * 60 * 60 * 1000;

export function tashkentDate(d = new Date()) {
  return new Date(d.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 10);
}

export function tashkentMonth(d = new Date()) {
  return tashkentDate(d).slice(0, 7);
}
