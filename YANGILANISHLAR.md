# Yangilanishlar (v3.0)

Mavjud loyiha (Next.js + JSON baza) saqlab qolindi va kengaytirildi. Eski ma'lumotlar (`data/store.json`)
avtomatik yangi tuzilmaga moslanadi, hech narsani qo'lda ko'chirish shart emas.

## Eski zip ustiga o'rnatish

1. Bu zipni eski loyiha papkasi ustiga oching (fayllar almashtiriladi). Zipda `.env.local` va `data/` YO'Q,
   shuning uchun sizning sozlamalaringiz va buyurtmalaringiz joyida qoladi.
2. `npm install` (yangi paket kerak emas, lekin tekshiruv uchun foydali).
3. `npm run build && npm start` (yoki `npm run dev`).

## MUHIM: ishga tushirishdan oldin

- **Admin parolini almashtiring.** Eski `.env.local` da `ADMIN_PASSWORD=admin123` edi. Uni murakkab parolga o'zgartiring.
- **Telegram bot tokenini almashtiring** (@BotFather → `/revoke`), agar eski zip faylni boshqalarga yuborgan bo'lsangiz.
- **`SEED_DEMO=false`** qiling. Demo mahsulotlar faqat sinash uchun (ular admin panelda "demo" belgisi bilan ajratilgan).
- **QQS (12%)**: eski kod yakuniy summaga yashirincha 12% qo'shardi. Endi bu o'chirilgan (formulangiz bo'yicha:
  mahsulotlar − chegirma + dostavka + xizmatlar). Kerak bo'lsa: admin panel → Dostavka → "QQS (%)" ga 12 yozing,
  mijozga alohida qator bo'lib ko'rinadi. Eski buyurtmalarning summasi o'zgarmaydi.

## Nimalar qo'shildi

**Mijoz tomoni**
- "Kalkulyator va Buyurtma": chap ustunda qidiruv, 11 kategoriya filtri, savat; o'ngda "Jami hisob", olish usuli,
  mijoz formasi, to'lov usuli, "Buyurtma berish" va Telegram orqali yuborish. Telefonda bir ustun.
- Savat sahifa yangilanganda saqlanadi; miqdorni qo'lda kiritish; ombordan ortiq bo'lmaydi; bir xil mahsulot birlashadi.
- Dostavka: hudud tanlash, tuman/ko'cha/uy/mo'ljal, og'ir yuk transporti, qavatga olib chiqish, "narxni operator tasdiqlaydi".
- Do'kondan olib ketish: 0 so'm, manzil, ish vaqti, olib ketish tartibi.
- `alert()` o'rniga xabarnomalar, formada xatolar maydon ostida, tugma ikki marta bosilsa bitta buyurtma.

**Backend**
- Narx, qoldiq, dostavka, chegirma va jami summa serverda qayta hisoblanadi (brauzerdagi narxga ishonilmaydi).
- Buyurtma yaratish + ombor kamaytirish bitta atomik yozish; takroriy buyurtmadan himoya (kalit + 20 soniyalik tekshiruv);
  noyob raqam (`#00001`...); 7 ta holat va holatlar tarixi; bekor qilinganda ombor qaytadi.
- Telegram xatosi buyurtmani yo'qotmaydi: buyurtma saqlanadi, xato buyurtmada va `data/app.log` da qayd etiladi.
  Token xato matnlaridan tozalanadi.
- Telefon formati (+998), majburiy maydonlar, rasm havolasi tekshiruvi; buyurtma uchun IP bo'yicha limit.
- Shikastlangan `store.json` jimgina bo'shatilmaydi (eski kod keyingi yozishda butun bazani o'chirib yuborishi mumkin edi).

**Admin panel**
- Dashboard: bugungi/yangi/yetkazilishi kerak buyurtmalar, bugungi savdo, oylik hisobot, kam qolgan mahsulotlar.
- Buyurtmalar: qidiruv, filtr, holatni o'zgartirish, kuryer biriktirish, to'lovni tasdiqlash, dostavka narxini tasdiqlash,
  tarix, bekor qilish.
- Mahsulotlar: kod, tavsif, faol/nofaol, og'ir yuk belgisi, 11 kategoriya, "to'plam" birligi, qidiruv.
- Dostavka: hududlar, tarif, bepul chegara, minimal summa, og'ir yuk to'lovi, muddat, QQS va chegirma.
- Kuryerlar: ism, telefon, transport, faollik, biriktirilgan buyurtmalar.

## Tekshirish natijalari (sinab ko'rilgan)

| Tekshiruv | Natija |
|---|---|
| `npm run lint` | xato yo'q |
| `npm test` (birlik testlari) | 26/26 |
| `npm run smoke` (HTTP, alohida test serveri) | 39/39 |
| Brauzer testi (savat, saqlanish, validatsiya, buyurtma, mobil scroll) | 20/20 |
| Brauzer testi (admin: kirish, hudud, kuryer, holat, to'lov) | 9/9 |

Sinab ko'rilMAGAN: haqiqiy Telegram xabari (sinash muhitida internet yo'q edi; faqat xato yo'li tekshirilgan),
haqiqiy telefon qurilmalari (faqat 375px brauzer ekrani), onlayn to'lov (provayder ulanmagan, tizim to'lov
bajarilgan deb ko'rsatmaydi, administrator tasdiqlaydi).

## Smoke testni ishga tushirish

Haqiqiy bazangizga TEGMASLIK uchun alohida test serveri:

```bash
npm run build
DATA_DIR=/tmp/test-data SEED_DEMO=true ADMIN_LOGIN=admin ADMIN_PASSWORD=test-parol-1 \
SESSION_SECRET=test ORDER_RATE_LIMIT=1000 npx next start -p 3111 &
SMOKE_TEST=true BASE_URL=http://localhost:3111 ADMIN_LOGIN=admin ADMIN_PASSWORD=test-parol-1 npm run smoke
```

Smoke-test alohida `DATA_DIR` bilan ishga tushirilgan serverda bajarilishi va
test serverida `DISABLE_TELEGRAM=true` o'rnatilishi kerak.

## Ma'lum cheklovlar

- Baza JSON fayl: bitta server uchun yetarli. Juda katta oqimda (minglab buyurtma/kun) SQLite/PostgreSQL ga o'tish
  kerak bo'ladi (barcha ma'lumot kirishi `src/lib/store.js` orqali, shuning uchun almashtirish bir joyda).
- Rasmlar uchun `placehold.co` (mahsulotga rasm yuklanmagan bo'lsa) ishlatiladi: u internet talab qiladi.
- Hali Swagger/OpenAPI hujjati yo'q (API Django emas, Next.js route'lari: `src/pages/api/*`).
