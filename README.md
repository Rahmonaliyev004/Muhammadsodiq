# Santexnika do'koni: buyurtma, kalkulyator va dostavka tizimi

Next.js 16 (Pages Router) + React 19 + Tailwind 4. Ma'lumotlar `data/store.json` faylida saqlanadi
(alohida baza o'rnatish shart emas). Batafsil o'zgarishlar: **YANGILANISHLAR.md**.

## Tez ishga tushirish

```bash
npm install
cp .env.example .env.local      # so'ng .env.local ni to'ldiring (kamida SESSION_SECRET va ADMIN_PASSWORD)
npm run dev                     # http://localhost:3000
```

### Telegram buyurtma xabarlari

Telegramda botni ochib `/start` yuboring. BotFather'dan olingan bot tokenini
`.env.local` faylidagi `TELEGRAM_BOT_TOKEN` qiymatiga, xabar borishi kerak
bo'lgan Telegram chat ID'sini esa `TELEGRAM_CHAT_ID` qiymatiga yozing.
Server ishga tushgan bo'lsa, `.env.local` o'zgargandan keyin uni qayta ishga
tushiring. Yangi buyurtmalar admin panelga saqlanadi va Telegramga ham yuboriladi.
Bot tokenini repoga yoki chatlarga yubormang.

Ishlab chiqarish (production):

```bash
npm run build
npm start
```

## Tekshirish

```bash
npm run lint      # kod tekshiruvi
npm test          # birlik testlari (narx hisobi, validatsiya, buyurtma/ombor/kuryer mantiqi)
npm run smoke     # ishlayotgan serverga qarshi to'liq HTTP tekshiruvi (qarang: YANGILANISHLAR.md)
```

Boshqa hujjatlar: `INSTALL.md` (o'rnatish), `DEPLOY.md` (serverga joylash).
