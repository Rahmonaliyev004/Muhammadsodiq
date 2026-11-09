import React, { useState } from "react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Headset,
  Package,
  Phone,
  Truck,
} from "lucide-react";

const categories = [
  {
    name: "PPR quvurlar va fitinglar",
    localImg: "/products/filters.jpg",
    unsplash: "photo-1607472586893-edb57bdc0e39",
  },
  {
    name: "Kranlar va smesitellar",
    localImg: "/products/faucets.jpg",
  },
  {
    name: "Suv nasoslari",
    localImg: "/products/pump.jpg",
  },
  {
    name: "Unitaz va vannalar",
    unsplash: "photo-1620626011761-996317b8d101",
  },
  {
    name: "Dush jihozlari",
    localImg: "/products/shower.jpg",
  },
  {
    name: "Filtrlar va shlanglar",
    localImg: "/products/filters.jpg",
  },
];

const reasons = [
  {
    icon: BadgeCheck,
    title: "Sifat kafolati",
    text: "Ishonchli ishlab chiqaruvchilarning saralangan mahsulotlari.",
    color: "bg-blue-50 text-blue-600",
    border: "border-blue-100",
  },
  {
    icon: Package,
    title: "Keng tanlov",
    text: "Uy va katta loyihalar uchun kerakli santexnika bir joyda.",
    color: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-100",
  },
  {
    icon: Truck,
    title: "Tez yetkazib berish",
    text: "Buyurtmangizni manzilingizga qulay vaqtda yetkazamiz.",
    color: "bg-orange-50 text-orange-600",
    border: "border-orange-100",
  },
  {
    icon: Headset,
    title: "Mutaxassis maslahati",
    text: "Mos mahsulot va o'lchamni tanlashda yordam beramiz.",
    color: "bg-purple-50 text-purple-600",
    border: "border-purple-100",
  },
];

const questions = [
  {
    question: "Qanday to'lash mumkin?",
    answer:
      "Naqd pul, plastik karta yoki bank o'tkazmasi orqali to'lash mumkin. To'lov usulini operator bilan kelishib olasiz.",
  },
  {
    question: "Yetkazib berish narxi qancha?",
    answer:
      "Yetkazib berish narxi manzil va buyurtma hajmiga qarab belgilanadi. Operator buyurtmani tasdiqlashda aniq narxni aytadi.",
  },
  {
    question: "Do'kondan olib ketsam bo'ladimi?",
    answer:
      "Ha, buyurtmangizni oldindan kelishib do'konimizdan mustaqil olib ketishingiz mumkin.",
  },
  {
    question: "Mahsulotni qanday tanlayman?",
    answer:
      "Katalogdan qidiring yoki mutaxassislarimizga qo'ng'iroq qiling — loyihangizga mos mahsulotni birga tanlaymiz.",
  },
];

const stats = [
  { value: "500+", label: "Mahsulot turi" },
  { value: "2000+", label: "Bajarilgan buyurtma" },
  { value: "98%", label: "Mijoz mamnuniyati" },
  { value: "24/7", label: "Qo'llab-quvvatlash" },
];

const reveal = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export default function HomeTab({
  setActiveTab,
  setCategory,
  products,
  addToCart,
  siteInfo,
}) {
  const [openFaq, setOpenFaq] = useState(null);
  const shouldReduceMotion = useReducedMotion();

  const openCategory = (category) => {
    const matchingCategory = products.find((product) =>
      product.category.toLowerCase().includes(category.split(" ")[0].toLowerCase()),
    )?.category;
    if (setCategory) setCategory(matchingCategory || category);
    setActiveTab("catalog");
  };

  const phoneHref = siteInfo?.phoneHref || "tel:+998901234567";
  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-6xl space-y-20 pb-12">
        {/* ═══════════════ HERO ═══════════════ */}
        <motion.section
          initial={shouldReduceMotion ? false : "hidden"}
          animate={shouldReduceMotion ? undefined : "show"}
          variants={stagger}
          className="relative grid min-h-[420px] items-center gap-8 py-10 md:grid-cols-[1.1fr_0.9fr] md:gap-6 md:py-14 lg:py-16"
        >
          {/* ── Chap: Matn ── */}
          <motion.div variants={reveal} className="relative z-10">
            <h1 className="max-w-xl text-[2.6rem] font-extrabold leading-[1.1] tracking-tight text-[#0f2551] sm:text-5xl lg:text-[3.4rem]">
              Uyingiz uchun ishonchli santexnika mahsulotlari
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-500 sm:text-[15px]">
              Quvur, fiting, kran, nasos va boshqa mahsulotlar. Narxni oldindan
              hisoblang, buyurtma bering, biz yetkazib beramiz.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab("catalog")}
                className="inline-flex items-center gap-2 rounded-full bg-[#e32636] px-7 py-3.5 text-sm font-extrabold text-white shadow-md shadow-red-200 transition hover:bg-[#ca1f2e] hover:-translate-y-0.5 active:translate-y-0"
              >
                Katalogni ko&lsquo;rish
              </button>
              <a
                href={phoneHref}
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-7 py-3.5 text-sm font-extrabold text-[#0f2551] transition hover:border-blue-200 hover:bg-blue-50"
              >
                Bepul maslahat olish
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e32636]" />
              Tez yetkazib berish
            </div>
          </motion.div>

          {/* ── O'ng: Mahsulot rasmlari kolaji ── */}
          <motion.div
            variants={reveal}
            className="relative flex min-w-0 items-center justify-center px-1 sm:px-0"
          >
            {/* Orqa fon — katta och ko'k doira */}
            <div className="absolute right-0 top-1/2 aspect-square w-[92%] -translate-y-1/2 rounded-full bg-[#ddeeff]" />

            {/* Kolaj wrapper */}
            <div className="relative z-10 h-[min(88vw,390px)] min-h-[290px] w-full max-w-[420px] sm:h-[390px]">
              {/* Yirik doira — kranlar (yuqori o'ng) */}
              <div className="absolute right-[5%] top-0 z-10 aspect-square w-[72%] overflow-hidden rounded-full border-4 border-white shadow-xl shadow-blue-100/60 sm:border-[5px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/products/faucets.jpg"
                  alt="Kranlar va smesitellar"
                  className="h-full w-full object-cover object-center"
                />
              </div>

              {/* Kichik karta — nasos (pastki chap) */}
              <div className="absolute bottom-[1%] left-0 z-20 aspect-square w-[44%] overflow-hidden rounded-[1.4rem] border-4 border-white shadow-xl shadow-blue-100/60 sm:rounded-[1.7rem] sm:border-[5px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/products/pump.jpg"
                  alt="Suv nasosi"
                  className="h-full w-full object-cover object-center"
                />
              </div>

              {/* Kichik karta — filtrlar/quvurlar (pastki o'ng) */}
              <div className="absolute bottom-[1%] right-0 z-20 aspect-square w-[44%] overflow-hidden rounded-[1.4rem] border-4 border-white shadow-xl shadow-blue-100/60 sm:rounded-[1.7rem] sm:border-[5px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/products/filters.jpg"
                  alt="Filtrlar va quvurlar"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ═══════════════ STATS STRIP ═══════════════ */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
        >
          {stats.map(({ value, label }) => (
            <motion.div
              key={label}
              variants={reveal}
              whileHover={shouldReduceMotion ? undefined : { y: -4 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-6 shadow-sm"
            >
              <span className="text-2xl font-extrabold text-[#173b78] sm:text-3xl">
                {value}
              </span>
              <span className="mt-1 text-xs font-semibold text-slate-500">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.section>

        {/* ═══════════════ CATEGORIES ═══════════════ */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
          variants={stagger}
        >
          {/* Sarlavha — markazlashgan, rasmdagi kabi */}
          <motion.div
            variants={reveal}
            className="mx-auto mb-7 max-w-xl px-2 text-center sm:mb-10"
          >
            <h2 className="text-[1.65rem] font-extrabold leading-tight tracking-tight text-[#0f2551] sm:text-3xl lg:text-4xl">
              Mahsulot kategoriyalari
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Kerakli bo&apos;limni tanlang va katalogda barcha mahsulotlarni
              ko&apos;ring.
            </p>
          </motion.div>

          {/* 3×2 grid — oq kartalar */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {categories.map((cat) => (
              <motion.button
                key={cat.name}
                onClick={() => openCategory(cat.name)}
                variants={reveal}
                whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Rasm */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 sm:aspect-[1.15] lg:aspect-[1.35]">
                  {cat.localImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.localImg}
                      alt={cat.name}
                      className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://images.unsplash.com/${cat.unsplash}?auto=format&fit=crop&w=600&q=80`}
                      alt={cat.name}
                      className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                    />
                  )}
                </div>

                {/* Nom + o'q */}
                <div className="flex min-h-[96px] items-center justify-between gap-3 px-6 py-4 sm:min-h-[68px] sm:px-4 sm:py-3">
                  <span className="line-clamp-2 min-w-0 text-xl font-extrabold leading-snug text-[#173b78] sm:text-sm">
                    {cat.name}
                  </span>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#173b78] transition group-hover:bg-[#173b78] group-hover:text-white sm:h-8 sm:w-8">
                    <ArrowRight size={21} />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ═══════════════ WHY US (70vh) + HOW TO ORDER (30vh) ═══════════════ */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
          variants={stagger}
          className="flex min-h-[80vh] flex-col justify-center py-10 sm:py-14"
        >
          <div className="flex w-full flex-col items-center justify-center px-2 sm:px-4 lg:px-10">
            <motion.div
              variants={reveal}
              className="mb-10 text-center sm:mb-12"
            >
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0f2551] sm:text-4xl lg:text-[2.6rem]">
                Nega aynan biz?
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {[
                {
                  icon: BadgeCheck,
                  title: "Tekshirilgan mahsulotlar",
                  text: "Har bir mahsulot sotuvga chiqishdan oldin sifat bo'yicha tekshiriladi.",
                },
                {
                  icon: Package,
                  title: "Ochiq narxlar",
                  text: "Narxlar oldindan ko'rinadi — yashirin to'loviarsiz.",
                },
                {
                  icon: Truck,
                  title: "Tez yetkazib berish",
                  text: "Buyurtmangizni qisqa muddatda manzilingizga yetkazamiz.",
                },
                {
                  icon: Headset,
                  title: "Usta maslahati",
                  text: "Qaysi mahsulot mos kelishini tajribali usta bilan aniqlang.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <motion.div
                  key={title}
                  variants={reveal}
                  whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                  className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Ikonka */}
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8eef9] text-[#173b78]">
                    <Icon size={22} strokeWidth={1.8} />
                  </span>
                  {/* Sarlavha */}
                  <h3 className="mb-2 text-sm font-extrabold leading-snug text-[#173b78] sm:text-[15px]">
                    {title}
                  </h3>
                  {/* Matn */}
                  <p className="text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                    {text}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
          variants={stagger}
          className="flex min-h-screen flex-col justify-center py-10 sm:py-14"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-2 sm:px-6">
            <motion.h2
              variants={reveal}
              className="mb-14 text-3xl font-extrabold tracking-tight text-[#0f2551] sm:text-4xl lg:text-5xl"
            >
              Qanday buyurtma beriladi?
            </motion.h2>

            <div className="relative w-full">
              <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-0.5 bg-[#e32636] lg:block" />

              <motion.div
                variants={stagger}
                className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8"
              >
                {[
                  {
                    num: "1",
                    title: "Tanlang",
                    desc: "Katalogdan mahsulot tanlang",
                  },
                  {
                    num: "2",
                    title: "Hisoblang",
                    desc: "Jami narx va yetkazib berish narxini ko'ring",
                  },
                  {
                    num: "3",
                    title: "Buyurtma bering",
                    desc: "Ma'lumotlaringizni qoldiring",
                  },
                  {
                    num: "4",
                    title: "Qabul qiling",
                    desc: "Yetkazib beramiz yoki do'kondan olib ketasiz",
                  },
                ].map(({ num, title, desc }) => (
                  <motion.div
                    key={num}
                    variants={reveal}
                    className="relative flex flex-col items-center text-center"
                  >
                    <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8eef9] text-xl font-extrabold text-[#173b78] ring-4 ring-white shadow-sm sm:h-16 sm:w-16 sm:text-2xl">
                      {num}
                    </div>
                    <h3 className="text-base font-extrabold text-[#0f2551] sm:text-lg">
                      {title}
                    </h3>
                    <p className="mt-2 max-w-[230px] text-sm leading-6 text-slate-500 sm:text-base">
                      {desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ═══════════════ BIZ HAQIMIZDA ═══════════════ */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          variants={stagger}
          className="py-3 sm:py-5"
        >
          <div className="grid items-center gap-7 md:grid-cols-[0.9fr_1.1fr] md:gap-10 lg:gap-12">
            {/* ── Chap: Do'kon rasmi ── */}
            <motion.div
              variants={reveal}
              className="relative mx-auto h-[250px] w-full max-w-[550px] overflow-hidden rounded-2xl shadow-lg shadow-blue-960/10 sm:h-[290px] md:h-[340px] lg:h-[370px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/products/store.jpg"
                alt="Santexnika do'koni"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </motion.div>

            {/* ── O'ng: Matn ── */}
            <motion.div
              variants={reveal}
              className="flex min-w-0 flex-col justify-center py-2 sm:py-3 md:py-5"
            >
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#173b78] sm:text-4xl lg:text-5xl">
                Biz haqimizda
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
                Biz uy va xonadonlar uchun santexnika mahsulotlarini sotamiz.
                Har bir mijozga to&apos;g&apos;ri mahsulot tanlashda yordam
                berishga <br />
                harakat qilamiz.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* ═══════════════ FAQ ═══════════════ */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
          variants={stagger}
          className="mx-auto flex min-h-[90vh] w-full max-w-4xl flex-col justify-center py-10 sm:py-14"
        >
          {/* Sarlavha — katta, markazlashgan */}
          <motion.div variants={reveal} className="mb-10 text-center sm:mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0f2551] sm:text-4xl lg:text-[2.75rem]">
              Ko&apos;p beriladigan savollar
            </h2>
          </motion.div>

          {/* FAQ ro'yxati */}
          <motion.div
            variants={stagger}
            className="mx-auto w-full max-w-3xl space-y-3"
          >
            {questions.map(({ question, answer }, i) => {
              const isOpen = openFaq === i;
              return (
                <motion.div
                  key={question}
                  variants={reveal}
                  whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                  className="rounded-2xl bg-white shadow-[0_10px_30px_rgba(15,37,81,0.07)]"
                >
                  {/* Savol qatori */}
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full cursor-pointer items-center justify-between gap-5 rounded-2xl px-5 py-4 text-left transition hover:bg-slate-50/60 sm:gap-6 sm:px-7 sm:py-5"
                  >
                    <span
                      className={`text-base font-bold sm:text-[17px] ${isOpen ? "text-[#173b78]" : "text-[#0f2551]"}`}
                    >
                      {question}
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-500">
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </span>
                  </button>

                  {/* Javob */}
                  {isOpen && (
                    <div className="px-5 pb-4 sm:px-7 sm:pb-5">
                      <p className="text-sm leading-6 text-slate-500">
                        {answer}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>
      </div>
    </MotionConfig>
  );
}
