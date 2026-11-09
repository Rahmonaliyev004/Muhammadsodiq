# Bitta do'konga oddiy o'rnatish

> Bir nechta do'konni bitta serverda yuritish uchun **DEPLOY.md** ga qarang (tavsiya etiladi).

Bu loyiha **to'liq mustaqil** ishlaydi — tashqi ma'lumotlar bazasi (MySQL,
Postgres va h.k.) shart emas. Barcha ma'lumotlar (mahsulotlar, buyurtmalar,
kassa, sozlamalar) `data/store.json` faylida, o'sha kompyuter/serverning
o'zida saqlanadi.

## 1. Talablar

- Node.js 20.9 yoki undan yangi versiya (Next.js 16 talabi)
- Internetga ulanish (Telegram xabarnomalari uchun)

## 2. O'rnatish

```bash
npm install
npm run build
npm start
```

Sayt `http://localhost:3000` (yoki serverning IP manzili) da ochiladi.

Doimiy ishlashi uchun (kompyuter/server qayta yoqilganda ham avtomatik
ishga tushishi uchun) `pm2` kabi vositadan foydalanish tavsiya etiladi:

```bash
npm install -g pm2
pm2 start npm --name santexnik -- start
pm2 save
pm2 startup
```

## 3. Server sozlamalari (`.env.local`)

`.env.local` faylida (faqat o'rnatuvchi ko'radi, do'kon egasi emas):

- `SESSION_SECRET` — har bir do'kon uchun yangi tasodifiy kalit
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — yangi buyurtmalar keladigan bot
- `ADMIN_LOGIN`, `ADMIN_PASSWORD` — admin kirishi (baza birinchi yaratilganda olinadi)

Production muhitida `SESSION_SECRET` (kamida 32 bayt), `ADMIN_LOGIN` va
`ADMIN_PASSWORD` (kamida 12 belgi) majburiy. `ADMIN_PASSWORD` bo'sh yoki
qisqa bo'lsa, admin login API
productionda xavfsizlik sabab ishlamaydi. `admin123` standart paroli faqat
development uchun.

Parolni keyinroq almashtirish:

```bash
npm run set-admin -- <login> <yangi-parol>
```

Do'kon egasi admin panel → **Sozlamalar** da faqat do'kon nomi, telefon va
manzilni o'zgartiradi.

## 4. Telegram chat ID olish

1. Botga Telegram'da `/start` deb yozing
2. Brauzerda oching: `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Javobdagi `"chat":{"id": ...}` raqamini `TELEGRAM_CHAT_ID` ga yozing
4. Serverni qayta ishga tushiring (`.env.local` faqat ishga tushganda o'qiladi)

## 5. Ma'lumotlarni zaxiralash (backup)

Barcha ma'lumot `data/store.json` faylida. Uni vaqti-vaqti bilan boshqa
joyga nusxalab qo'yish tavsiya etiladi:

```bash
cp data/store.json data/store-backup-$(date +%F).json
```

## 6. Yangi do'konga o'rnatishda

Har bir yangi mijoz (do'kon) uchun:
1. Loyihani yangi papkaga nusxalang
2. `data/` papkasini olib tashlang (agar bo'lsa) — yangi bo'sh baza avtomatik yaratiladi
3. `.env.local` dagi `SESSION_SECRET` ni yangisiga almashtiring (tasodifiy
   qatorni `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   buyrug'i bilan yaratish mumkin)
4. Yuqoridagi 2–4 qadamlarni takrorlang

Shu tariqa har bir do'kon uchun alohida dasturchi kerak bo'lmaydi — faqat
shu qo'llanmani bosqichma-bosqich bajarish kifoya.
