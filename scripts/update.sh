#!/usr/bin/env bash
# Yangi versiyani barcha do'konlarga bir vaqtda o'rnatadi (ma'lumotlarga tegmaydi).
# Avval yangi kodni appDir ga joylang, so'ng shu skriptni ishga tushiring.
set -euo pipefail
cd "$(dirname "$0")/.."
npm install
npm run build
pm2 reload all
echo "Yangilandi."
