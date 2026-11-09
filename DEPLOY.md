# Bitta sayt — ko'p do'kon: server va sotuv qo'llanmasi

## 1. Sxema (nima qilamiz)

**Bitta server (VPS) → bitta kod nusxasi → har bir do'kon uchun alohida "nusxa"** (o'z domeni, o'z bazasi, o'z admin paroli, o'z Telegram boti).

```
Mijoz telefoni ──► doston.uz ──► Caddy (HTTPS) ──► santexnik-doston  (port 3001, /var/santexnik/shops/doston)
                   ali.uz    ──►                ──► santexnik-ali     (port 3002, /var/santexnik/shops/ali)
```

- Kod bitta joyda turadi → yangilash **bir marta** qilinadi, hamma do'kon yangilanadi.
- Ma'lumotlar (baza, rasmlar) har do'konda alohida → bir do'kon boshqasinikini ko'rmaydi.
- Yangi do'kon qo'shish = `deploy/shops.json` ga 1 blok yozib, 3 ta buyruq (5 daqiqa).

## 2. Nima sotib olasiz

| Nima | Tavsiya |
|---|---|
| **VPS** | Ubuntu 22.04/24.04, **2 GB RAM** (~8 do'kon), 4 GB (~20 do'kon). Root kirish bo'lishi shart. |
| **Domen** | Bitta asosiy domen (masalan `sizningnom.uz`) va har do'kon uchun subdomen: `doston.sizningnom.uz`. Yoki do'konning o'z domeni. |

Muhim: mijozlarning ism/telefoni — shaxsiy ma'lumot. O'zbekiston qonunchiligi fuqarolar ma'lumotini
mamlakat ichidagi serverda saqlashni talab qilishi mumkin — **sotishdan oldin yurist bilan tekshiring**
va imkon bo'lsa O'zbekistondagi hosting kompaniyasidan VPS oling.

**Netlify / Vercel mos emas** — ma'lumotlar faylda saqlanadi, ular faylni saqlab qolmaydi.

## 3. Serverni birinchi marta tayyorlash (bir marta)

Serverga `ssh root@SERVER_IP` bilan kiring:

```bash
apt update && apt upgrade -y
# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs
# pm2 (dastur doim ishlab turishi uchun)
npm install -g pm2
pm2 startup            # chiqqan buyruqni nusxalab ishga tushiring
# Caddy (avtomatik HTTPS)
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy
# Xavfsizlik devori
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
```

## 4. Kodni joylash

```bash
mkdir -p /srv/santexnik && cd /srv/santexnik
# zip'ni serverga yuklang (scp yoki FileZilla), so'ng:
unzip santexnik-yangilangan.zip && mv santexnik app && cd app
rm -f .env.local          # <- MUHIM: sizning shaxsiy token/parollaringiz serverda qolmasin
npm install
npm run build
```

## 5. Do'konlarni qo'shish

```bash
cd /srv/santexnik/app
cp deploy/shops.example.json deploy/shops.json
nano deploy/shops.json    # do'kon(lar)ni yozing (id, domain, nom, telefon, manzil, Telegram)
node scripts/generate-deploy.mjs
```

Skript har do'kon uchun **admin parolini o'zi yaratib**, ekranga chiqaradi (`YANGI ADMIN -> ...`) — uni yozib oling
va do'kon egasiga bering. Keyin:

```bash
pm2 startOrReload deploy/generated/ecosystem.config.cjs && pm2 save
cp deploy/generated/Caddyfile /etc/caddy/Caddyfile && systemctl reload caddy
```

**DNS:** domen sozlamalarida har bir domen/subdomen uchun **A yozuv** → server IP manzili.
DNS yangilanishi 5–60 daqiqa olishi mumkin. Shundan so'ng `https://doston.sizningnom.uz` ochiladi
(HTTPS sertifikatni Caddy o'zi oladi).

**Domenni almashtirish:** domenni shu VPS'ga yo'naltirib, Caddyfile'dagi domenni yangilang.
`DATA_DIR` (`/var/santexnik/shops/<id>`) va PM2 do'kon `id` sini o'zgartirmang —
mahsulotlar, buyurtmalar, sozlamalar va rasmlar o'sha joyda qoladi. Admin yangi
domen orqali qayta login qiladi, chunki brauzer sessiya cookie'si eski domenga bog'langan.
Yangi serverga ko'chirilsa, `store.json` bilan birga `uploads/` papkasini ham
`DATA_DIR` ichidan ko'chiring, so'ng yangi serverda rezerv nusxa oling.

Namoyish do'koni uchun blokka `"demo": true` yozing — namuna mahsulotlar bilan boshlanadi.

## 6. Kundalik ishlar

| Ish | Buyruq |
|---|---|
| Yangi do'kon qo'shish | `shops.json` ga blok qo'shing → 5-bo'limdagi buyruqlarni qayta bajaring (mavjud do'konlar buzilmaydi) |
| Yangi versiyaga yangilash | Yangi kodni `app/` ga qo'ying (`.env.local`, `deploy/` ga tegmang) → `bash scripts/update.sh` |
| Admin parolini almashtirish | `npm run set-admin -- --shop=doston <login> <yangi-parol>` |
| Zaxira nusxa | `crontab -e` → `0 3 * * * /srv/santexnik/app/scripts/backup.sh` (har kecha, 14 kun saqlanadi) |
| Holatni ko'rish | `pm2 status`, `pm2 logs santexnik-doston` |
| Telegram bot ulash | `shops.json` da `telegramBotToken` va `telegramChatId` → generate → `pm2 startOrReload ...` |

**Zaxira nusxani boshqa joyga ham ko'chiring** (o'z kompyuteringizga yoki bulutga) — server buzilsa,
faqat shu qutqaradi. Do'kon ma'lumoti: `/var/santexnik/shops/<id>/store.json` va `uploads/`.

## 7. QR kod

Har bir do'konning manzili (`https://doston.sizningnom.uz`) ni QR botiga yuboring — tayyor QR chiqadi.
Domen tayyor bo'lgach chop eting, keyin domen o'zgarsa QR eskiradi.

## 8. Sotishdan oldingi tekshiruv ro'yxati

- [ ] Sinov do'koni yarating, telefondan buyurtma bering → Telegramga keldimi?
- [ ] Admin: mahsulot qo'shish (rasm bilan), tahrirlash, o'chirish
- [ ] Buyurtmani "Yetkazildi" qiling → kassaga kirim qo'shildimi, zaxira kamaydimi?
- [ ] `https://` bilan admin panelga kirish ishlayaptimi (HTTP bilan kirmaydi)
- [ ] Zaxira nusxa skripti ishlaganini tekshiring (`ls /var/backups/santexnik`)
- [ ] Do'kon egasiga ko'rsating: mahsulot/rasm qo'shish, buyurtmani yetkazildi qilish, kassaga chiqim yozish

## 9. Ochiq gapirish kerak bo'lgan cheklovlar (mijozga va o'zingizga)

- Bitta admin akkaunt (xodimlar uchun alohida rollar yo'q)
- Onlayn to'lov (Payme/Click) yo'q — to'lov yetkazilganda naqd/qo'lda qayd etiladi
- Ma'lumotlar JSON faylda: kichik-o'rta do'kon (kuniga o'nlab–yuzlab buyurtma) uchun yetarli;
  minglab mahsulot/kuniga yuzlab buyurtma bo'lsa, bazani (PostgreSQL) almashtirish kerak bo'ladi
- Server sizniki: uzilish/zaxira uchun mas'uliyat sizda — shuning uchun oylik xizmat haqi olish mantiqiy

## 10. Sotuv modeli (tavsiya)

1. **Bir martalik o'rnatish** (domen, sozlash, o'rgatish) + 2. **oylik obuna** (hosting, zaxira, yangilanishlar, yordam).
Narxni server xarajatingiz (VPS narxi / do'konlar soni) va bozor bilan solishtirib o'zingiz belgilang.
