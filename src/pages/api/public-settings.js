import { getSettings, getZones } from "../../lib/store";
import { effectiveZones } from "../../lib/pricing";

// Faqat ommaviy (maxfiy bo'lmagan) sozlamalarni qaytaradi — Telegram bot
// tokeni bu yerda HECH QACHON qaytarilmaydi, chunki bu endpoint login
// talab qilmaydi va har kim ochishi mumkin. Dostavka hududlari va tariflari
// mijoz buyurtma berishdan oldin ko'rishi kerak bo'lgani uchun shu yerda.
export default async function handler(req, res) {
  const [settings, zones] = await Promise.all([getSettings(), getZones()]);
  return res.status(200).json({
    ok: true,
    settings: {
      storeName: settings.storeName,
      phone: settings.phone,
      address: settings.address,
      storeHours: settings.storeHours,
      pickupNote: settings.pickupNote,
      deliveryFee: settings.deliveryFee,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      vatPercent: settings.vatPercent,
      discountPercent: settings.discountPercent,
      discountMinTotal: settings.discountMinTotal,
      heavySurcharge: settings.heavySurcharge,
      floorCarryFee: settings.floorCarryFee,
    },
    zones: effectiveZones(settings, zones),
  });
}
