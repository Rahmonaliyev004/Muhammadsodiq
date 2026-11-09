import fs from "fs";
import path from "path";

// Xatolar va muhim voqealar data/app.log fayliga yoziladi (bir qatorda bitta
// JSON). Maxfiy ma'lumot (token, parol) bu yerga HECH QACHON yozilmaydi.
const DIR =
  process.env.DATA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
const FILE = path.join(/*turbopackIgnore: true*/ DIR, "app.log");
const MAX_BYTES = 5 * 1024 * 1024;

export function logEvent(level, message, extra = {}) {
  const line = { t: new Date().toISOString(), level, message, ...extra };
  (level === "error" ? console.error : console.log)(`[${level}] ${message}`, extra);
  try {
    fs.mkdirSync(DIR, { recursive: true });
    if (fs.existsSync(FILE) && fs.statSync(FILE).size > MAX_BYTES) {
      fs.renameSync(FILE, `${FILE}.1`);
    }
    fs.appendFileSync(FILE, JSON.stringify(line) + "\n", "utf8");
  } catch {
    // Log yozilmasa ham asosiy jarayon to'xtamasligi kerak
  }
}
