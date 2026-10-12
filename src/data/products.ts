/**
 * Product catalog for Scroll 1 — geometry values are CSS px measured on the
 * 450x875 design frame (converted to rem at render time via px()).
 * `illu` = position/size of the extracted illustration inside the card's
 * illustration band (band spans card width - 10px each side).
 */
export type Product = {
  slug:
    | "third-party"
    | "body"
    | "motorcycle"
    | "home"
    | "supplementary"
    | "life"
    | "mobile"
    | "implant";
  title: string;
  subtitle: string;
  badge?: boolean;
  strip?: string;
  /** height of the illustration band inside the card (CSS px) */
  bandH: number;
  /** exact-pixel band artwork (extracted from the reference, incl. skyline) */
  band: { src: string; w: number; h: number };
  /** transparent line-art illustration (used on sub-pages) */
  illu: { src: string; x: number; y: number; w: number; h: number };
};

export const products: Product[] = [
  {
    slug: "third-party",
    title: "بیمه شخص ثالث خودرو",
    subtitle: "تعهدنامه قانونی خسارت ۱۴۰۴",
    badge: true,
    strip: "اگر تا ساعت ۱۶ سفارش‌تان را ثبت کنید، بیمه‌نامه امروز صادر می‌شود",
    bandH: 46,
    band: { src: "/img/third-party-band.png", w: 392, h: 46 },
    illu: { src: "/img/thirdparty.webp", x: 152.5, y: 4, w: 77.5, h: 41 },
  },
  {
    slug: "body",
    title: "بیمه بدنه خودرو",
    subtitle: "خسارت و تصادف",
    badge: true,
    strip: "پذیرش توسط همه نمایندگی‌های کشور",
    bandH: 50,
    band: { src: "/img/body-band.png", w: 392, h: 50 },
    illu: { src: "/img/body.webp", x: 150, y: 4.5, w: 90, h: 44 },
  },
  {
    slug: "home",
    title: "بیمه خانه",
    subtitle: "آتش‌سوزی، زلزله و سرقت",
    bandH: 46,
    band: { src: "/img/home-band.png", w: 180, h: 46 },
    illu: { src: "/img/home.webp", x: 67, y: 4.5, w: 47, h: 40 },
  },
  {
    slug: "motorcycle",
    title: "بیمه موتور",
    subtitle: "یک سیلندر، دو سیلندر و ...",
    badge: true,
    bandH: 46,
    band: { src: "/img/motorcycle-band.png", w: 184, h: 46 },
    illu: { src: "/img/motorcycle.webp", x: 67, y: 11, w: 59.5, h: 33.5 },
  },
  {
    slug: "life",
    title: "بیمه عمر",
    subtitle: "پوشش فوت و پس‌انداز",
    bandH: 45,
    band: { src: "/img/life-band.png", w: 180, h: 45 },
    illu: { src: "/img/life.webp", x: 71.5, y: 2, w: 37, h: 42.5 },
  },
  {
    slug: "supplementary",
    title: "بیمه تکمیلی",
    subtitle: "بیمارستانی، دندانپزشکی و ...",
    badge: true,
    bandH: 45,
    band: { src: "/img/supplementary-band.png", w: 184, h: 45 },
    illu: { src: "/img/supplementary.webp", x: 74, y: 9, w: 41, h: 35.5 },
  },
  {
    slug: "implant",
    title: "بیمه ایمپلنت",
    subtitle: "دندان‌های دائمی و ایمپلنت",
    bandH: 45,
    band: { src: "/img/implant-band.png", w: 180, h: 45 },
    illu: { src: "/img/implant.webp", x: 76.5, y: 0, w: 27.5, h: 39.5 },
  },
  {
    slug: "mobile",
    title: "بیمه موبایل",
    subtitle: "سرقت، آسیب‌دیدگی و ...",
    badge: true,
    bandH: 45,
    band: { src: "/img/mobile-band.png", w: 184, h: 45 },
    illu: { src: "/img/mobile.webp", x: 83, y: 0, w: 23, h: 39.5 },
  },
];

export const productBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

/**
 * Scroll-1 grid rows, top to bottom.
 * RTL note: the FIRST item of each half-row renders on the RIGHT.
 * titleTop / subTop = text ink offsets (CSS px) measured from the card top.
 */
export const rows: Array<{
  kind: "full" | "half";
  height: number;
  titleTop: number;
  subTop: number;
  bandTop: number;
  /** badge vertical offset + small variant flag (reference is inconsistent) */
  badgeTop: number;
  badgeSmall: boolean;
  items: [string] | [string, string];
}> = [
  { kind: "full", height: 118, bandTop: 8, badgeTop: 8.5, badgeSmall: false, titleTop: 62.5, subTop: 81, items: ["third-party"] },
  { kind: "full", height: 119, bandTop: 8, badgeTop: 3.5, badgeSmall: false, titleTop: 62.5, subTop: 80.5, items: ["body"] },
  { kind: "half", height: 99, bandTop: 8, badgeTop: 3.5, badgeSmall: true, titleTop: 62, subTop: 80, items: ["home", "motorcycle"] },
  { kind: "half", height: 95, bandTop: 7.5, badgeTop: 3.5, badgeSmall: true, titleTop: 59.5, subTop: 76.5, items: ["life", "supplementary"] },
  { kind: "half", height: 90, bandTop: 8, badgeTop: 3.5, badgeSmall: true, titleTop: 56.5, subTop: 70, items: ["implant", "mobile"] },
];
