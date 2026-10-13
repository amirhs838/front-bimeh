/** Site-wide configuration: navigation, contact channels, branding. */
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
    { label: "خرید اقساطی", href: "/quote" },
    { label: "پیگیری سفارش", href: "#" },
    { label: "وبلاگ", href: "#" },
    { label: "درباره ما", href: "#" },
    { label: "تماس با ما", href: "#" },
    { label: "ثبت نام", href: "/register" },
  ],
} as const;
