# بیمه شو — Bimeh AI (Scroll 1)

بازسازی پیکسل‌به‌پیکسل صفحهٔ اول (Scroll 1) وب‌سایت «بیمه شو» بر اساس تصویر مرجع، با Next.js 16 (App Router) + TypeScript + Tailwind CSS 4.

A pixel-perfect, fully interactive Persian (RTL) mobile web build of the Bimeh AI landing screen — Next.js 16 App Router, TypeScript, Tailwind CSS 4.

## ویژگی‌ها / Features

- 🎯 **پیکسل‌پرفکت**: اعتبارسنجی خودکار با Playwright + pixelmatch در برابر تصویر مرجع (450×875 CSS px @2x) — اختلاف نهایی ~۴٪ که فقط شامل ضدپله‌ای متن و لبه‌های تصویر است
- 🌍 **RTL کامل**: `<html lang="fa" dir="rtl">`، فونت [Estedad](https://github.com/aminabedi68/Estedad) (وزن‌های 400–900) + Poppins برای لوگوتایپ لاتین
- 🛒 **انتخاب بیمه‌نامه**: ۸ کارت بیمه (شخص ثالث، بدنه، موتور، خانه، تکمیلی، عمر، موبایل، ایمپلنت) با انتخاب چندگانه و نوار شناور «ادامه با {n} بیمه» (ذخیره در `sessionStorage`)
- 💬 **چت هوشمند**: شیت چت تمام‌صفحه با `POST /api/chat` (mock؛ آمادهٔ اتصال به LLM واقعی از طریق `AI_API_URL` / `AI_API_KEY`)
- 📱 **ریسپانسیو**: مقیاس‌دهی تناسبی فریم ۴۵۰px برای همهٔ عرض‌ها (360–480+)، ستون مرکزی ۴۵۰px روی دسکتاپ، پشتیبانی `safe-area` و `prefers-reduced-motion`
- ♿ **دسترس‌پذیری**: aria-labelهای فارسی، focus-visible، کنتراست، بدون خطای کنسول

## اجرا / Quick Start

```bash
bun install        # یا npm install
bun run db:push    # ساخت دیتابیس SQLite (Prisma)
bun run dev        # http://localhost:3000
```

اسکریپت‌های دیگر:

| اسکریپت | توضیح |
|---|---|
| `bun run lint` | بررسی ESLint |
| `bun run build` + `bun run start` | بیلد پروڈاکشن (standalone) |
| `bunx tsx scripts/verify.ts` | مقایسهٔ پیکسلی اسکرین‌شات با تصویر مرجع (نیازمند `upload/1.jpg`) |
| `node scripts/e2e.mjs` | تست‌های تعاملی (44 بررسی) |
| `node scripts/responsive.mjs` | تست ریسپانسیو 360–1440px |

## ساختار / Structure

```
src/
├─ app/                    # / ، /register ، /insurance/[slug] ، /quote ، /api/chat
├─ components/
│  ├─ layout/              # Header، Drawer، ChatBar، ChatSheet، SupportSheet، SelectionBar
│  ├─ hero/HeroBanner.tsx  # هیرو با ماسکات شناور و حباب چت و تایپینگ
│  ├─ products/            # ProductGrid / ProductCard (انتخاب + ناوبری)
│  └─ sections/Scroll1.tsx
├─ data/                   # content.ts (تمام متن‌ها)، products.ts (هندسهٔ اندازه‌گیری‌شده)، site.ts
└─ fonts/                  # Estedad + Poppins (woff2)
public/img/                # ماسکات و ۸ تصویرسازی کارت‌ها (@2x)
```

## نکات / Notes

- همهٔ متن‌ها در `src/data/content.ts` متمرکز شده‌اند.
- انتخاب‌ها فقط در `sessionStorage` ذخیره می‌شوند (بدون localStorage).
- مقادیر هندسی (مختصات، اندازه‌ها، رنگ‌ها) مستقیماً از تصویر مرجع نمونه‌برداری شده‌اند.
