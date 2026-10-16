/** Site-wide configuration: navigation, contact channels, branding.
 *  Footer routes + contact values live here too (single source of truth —
 *  the footer and the Drawer both read from this file).
 *  NOTE: contact values are PLACEHOLDERS (also used by the JSON-LD block). */
export const site = {
  name: "بیمه شو",
  latinName: "Bimeh AI",
  // --- PLACEHOLDER contact channels (replace with real values) ---
  phone: {
    display: "۰۲۱-۹۱۰۰۹۱۰۰",
    href: "tel:+982191009100", // PLACEHOLDER number
  },
  email: "support@example.com", // PLACEHOLDER email
  hours: "شنبه تا پنجشنبه، ۹ تا ۱۸",
  nav: [
    { label: "بیمه‌ها", href: "/#products" },
    { label: "چرا Bimeh AI", href: "/#scroll-2" },
    { label: "مزایای Bimeh AI", href: "/#scroll-3" },
    { label: "خرید اقساطی", href: "/quote" },
    { label: "پیگیری سفارش", href: "/track" },
    { label: "وبلاگ", href: "/blog" },
    { label: "درباره ما", href: "/about" },
    { label: "تماس با ما", href: "/contact" },
    { label: "ثبت نام", href: "/register" },
  ],
  /** DESKTOP (>=1280) header nav (reference D1) — right-to-left visual order.
   *  "خریدارها" has no dedicated route yet → /quote (instalment purchase);
   *  flagged in the deliverable for the IA owner. */
  desktopNav: [
    { label: "خانه", href: "/" },
    { label: "بیمه‌ها", href: "/#products" },
    { label: "خریدارها", href: "/quote" },
    { label: "تماس با ما", href: "/contact" },
  ],
  /** Footer contact (rendered physically LTR: [icon] [text] [chevron]).
   *  Values are PLACEHOLDERS replicating the reference image. */
  footerContact: {
    address: "تهران، خیابان ولیعصر، پلاک ۱۳۳",
    addressW: 130.9, // measured label width (frame u) for the dir=rtl span
    email: "info@bimeh.ai", // PLACEHOLDER — display copy from the image
    emailHref: "mailto:info@bimeh.ai",
    emailW: 73.0,
    phoneDisplay: "۰۲۱-۹۱۰۰-۰۰۰۰", // PLACEHOLDER — display copy from the image
    phoneHref: "tel:+982191000000", // PLACEHOLDER
    phoneW: 62.1,
    mapUrl: "https://www.google.com/maps?q=تهران،خیابان+ولیعصر،+پلاک+۱۳۳", // PLACEHOLDER
  },
} as const;
