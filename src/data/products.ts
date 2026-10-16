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
 * DESKTOP (>=1280) Scroll-1 geometry — measured on the D1 frame (1536x1024,
 * reference "Persian Insurance Platform UI with Friendly Mascot.png").
 * Every value is in desktop units "d" (1d = 1px at 1536 wide), consumed via
 * calc(N * var(--d)) inside the @media (min-width:1280px) block. Mobile never
 * reads these.
 *
 * Grid: 4 columns (465 / 219 / 220 / 464 d, 14d gaps) + 5 rows
 * (203 / 18 / 162 / 12 / 150 — spacer rows carry the vertical gaps).
 * Physical placement per D1 (mirrored vs the mobile DOM order):
 *   row 1: third-party (left, cols 1-2) | body (right, cols 3-4)
 *   row 2: motorcycle (col 1) | home (cols 2-3) | supplementary (col 4)
 *   row 3: life (col 1) | mobile (cols 2-3) | implant (col 4)
 */
export type DkProduct = {
  /** grid-area: row-start / col-start / row-end / col-end */
  area: string;
  height: number;
  band: { left: number; right: number; top: number; height: number };
  /** illustration display size (d) — bottom-aligned, centered in the band */
  illu: { w: number; h: number };
  /** title / subtitle ink centers measured from the card top (d) */
  titleCenter: number;
  titleSize: number;
  subCenter: number;
  subSize: number;
  badge?: { top: number; right: number; w: number; h: number; font: number };
  strip?: { top: number; height: number; font: number };
  /** per-card horizontal content offset (D1 "بدنه" sits ~14d left of center) */
  cx?: number;
};

export const dkProducts: Record<string, DkProduct> = {
  "third-party": {
    area: "1 / 1 / 2 / 3",
    height: 203,
    band: { left: 14, right: 14, top: 8, height: 80 },
    illu: { w: 126, h: 71 },
    titleCenter: 111, titleSize: 21.4,
    subCenter: 138, subSize: 14.6,
    badge: { top: 15, right: 16, w: 97, h: 21, font: 12.5 },
    strip: { top: 158, height: 33, font: 13.5 },
  },
  body: {
    area: "1 / 3 / 2 / 5",
    height: 203,
    band: { left: 14, right: 14, top: 8, height: 80 },
    illu: { w: 127, h: 70 },
    titleCenter: 111, titleSize: 19.2,
    subCenter: 138, subSize: 12.1,
    badge: { top: 15, right: 16, w: 97, h: 21, font: 12.5 },
    strip: { top: 158, height: 33, font: 13.5 },
    cx: -14, // D1 renders this card's content ~14d left of the card center
  },
  motorcycle: {
    area: "3 / 1 / 4 / 2",
    height: 162,
    band: { left: 13, right: 11, top: 7, height: 74 },
    illu: { w: 93, h: 57 },
    titleCenter: 104, titleSize: 20.1,
    subCenter: 133, subSize: 15.7,
    badge: { top: 13, right: 10, w: 79, h: 19, font: 11 },
  },
  home: {
    area: "3 / 2 / 4 / 4",
    height: 162,
    band: { left: 13, right: 11, top: 7, height: 74 },
    illu: { w: 70, h: 61 },
    titleCenter: 104, titleSize: 18.1,
    subCenter: 133, subSize: 17.5,
  },
  supplementary: {
    area: "3 / 4 / 4 / 5",
    height: 162,
    band: { left: 13, right: 11, top: 7, height: 74 },
    illu: { w: 61, h: 58 },
    titleCenter: 104, titleSize: 18.3,
    subCenter: 133, subSize: 17.5,
  },
  life: {
    area: "5 / 1 / 6 / 2",
    height: 150,
    band: { left: 13, right: 11, top: 8, height: 69 },
    illu: { w: 50, h: 60 },
    titleCenter: 93, titleSize: 18.3,
    subCenter: 122, subSize: 17.2,
  },
  mobile: {
    area: "5 / 2 / 6 / 4",
    height: 150,
    band: { left: 13, right: 11, top: 8, height: 69 },
    illu: { w: 36, h: 61 },
    titleCenter: 97, titleSize: 18.3,
    subCenter: 125, subSize: 15.7,
    badge: { top: 12, right: 11, w: 87, h: 20, font: 11.5 },
  },
  implant: {
    area: "5 / 4 / 6 / 6",
    height: 150,
    band: { left: 13, right: 11, top: 8, height: 69 },
    illu: { w: 48, h: 61 },
    titleCenter: 96, titleSize: 17.3,
    subCenter: 124, subSize: 15.7,
  },
};

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
