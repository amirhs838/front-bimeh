/**
 * Footer — copy + geometry measured on the 450x774.3 design frame of 4.png
 * (956x1645 px, s = 2.1244; converted to rem at render time via px()).
 * The card sits at x16.2-437.5, y3.0-763.6 in that frame (the reference's
 * outer margins are NOT equal: 16.2 left / 12.5 right — replicated as-is).
 * Font sizes are width-calibrated per line against the reference (the same
 * DOM-probe loop used for Scroll 3), so per-item values may differ slightly.
 */

/** Quick-access pill row (right icon circle + label + left chevron). */
export type QuickLink = {
  label: string;
  /** action: internal route | opens the support sheet | opens the chat sheet */
  action: "link" | "support" | "chat";
  href: string;
  icon: "shieldCheck" | "headset" | "question" | "phoneFilled";
  /** measured pill top / height / label width (frame u) */
  top: number;
  height: number;
  labelW: number;
  labelSize: number;
};

/** One link row of the two link columns. */
export type ColumnLink = {
  label: string;
  action: "link" | "support" | "chat";
  href: string;
  /** measured label width + vertical center (frame u, page coords) */
  w: number;
  cy: number;
  size: number;
};

export const footer = {
  /** card geometry (frame u) */
  card: { left: 16.2, top: 3.0, width: 421.3, height: 760.6, radius: 14 },
  /** right inset of the text content from the card's right edge */
  textRight: 16.5,

  wordmark: { size: 29.5, right: 16.7, cy: 50.2 },

  intro: {
    heading: "اولین پلتفرم هوشمند بیمه در ایران",
    headingCy: 93.3,
    headingW: 192.5,
    headingSize: 13.15,
    /** 5 hard lines; each justified to its measured width (L5 stays natural) */
    lines: [
      { text: "با استفاده از هوش مصنوعی، بهترین پیشنهادهای بیمه‌ای را در چند ثانیه", w: 347.4, cy: 121.5, size: 10.75 },
      { text: "برای شما پیدا می‌کند. Bimeh AI با تحلیل نیازها و شرایط شما، مقایسه دقیق", w: 361.0, cy: 142.4, size: 10.75 },
      { text: "گزینه‌ها و ارائه توصیه‌های شخصی‌سازی‌شده، خرید بیمه را ساده‌تر، سریع‌تر", w: 359.6, cy: 165.0, size: 10.75 },
      { text: "و مطمئن‌تر می‌کند. ما اینجا هستیم تا تکنولوژی، آینده‌ی امن‌تری برای شما", w: 355.9, cy: 186.7, size: 10.75 },
      { text: "بسازیم.", w: 33.9, cy: 206.9, size: 10.75, noJustify: true },
    ],
    latin: "Bimeh AI",
  },

  quick: {
    title: "دسترسی سریع",
    titleCy: 237.5,
    titleRight: 17.2,
    titleW: 82.3,
    titleSize: 13.3,
    underline: { right: 16.7, w: 24.5, cy: 251.9 },
    /** pill row left/right edges (card-relative) + chevron center-x */
    pillLeft: 20.0,
    pillRight: 402.7,
    circleD: 32,
    /** icon circle center-x is flush with the pill's right edge (0.4u inset) */
    circleInsetR: 0.4,
    labelRight: 358.0,
    labelSize: 13.2, // unused fallback — per-item labelSize below
    chevronCx: 37.95,
    items: [
      { label: "بیمه‌ها", action: "link", href: "/#products", icon: "shieldCheck", top: 264.8, height: 33.5, labelW: 29.7, labelSize: 10.16 },
      { label: "خدمات مشتریان", action: "support", href: "#support", icon: "headset", top: 306.7, height: 33.0, labelW: 73.9, labelSize: 10.33 },
      { label: "پرسش‌های متداول", action: "link", href: "/faq", icon: "question", top: 347.7, height: 34.3, labelW: 84.7, labelSize: 10.39 },
      { label: "تماس با ما", action: "link", href: "/contact", icon: "phoneFilled", top: 390.0, height: 33.5, labelW: 46.1, labelSize: 10.75 },
    ] as QuickLink[],
  },

  columns: {
    titleSize: 13.2,
    underlineCy: 473.6,
    rowSize: 12.8,
    /** per-column: title right edge, label right edge, chevron center-x (card-rel) */
    right: {
      id: "f-services",
      title: "خدمات ما",
      titleCy: 458.25,
      titleSize: 12.85,
      titleRight: 17.6,
      titleW: 54.6,
      underlineW: 25.9,
      labelRight: 24.4,
      chevronCx: 248.8,
      links: [
        { label: "خرید بیمه‌نامه", action: "link", href: "/#products", w: 64.0, cy: 495.6, size: 10.78 },
        { label: "استعلام و پیگیری", action: "link", href: "/track", w: 78.6, cy: 521.5, size: 10.3 },
        { label: "مشاوره هوشمند", action: "chat", href: "#chat", w: 73.0, cy: 548.3, size: 10.24 },
        { label: "اپلیکیشن بیمه AI", action: "link", href: "/app", w: 79.1, cy: 574.4, size: 10.85 },
      ] as ColumnLink[],
    },
    left: {
      id: "f-about",
      title: "درباره ما",
      titleCy: 456.35,
      titleSize: 14.0,
      titleRight: 213.0,
      titleW: 47.5,
      underlineW: 24.9,
      labelRight: 220.0,
      chevronCx: 30.65,
      links: [
        { label: "معرفی بیمه AI", action: "link", href: "/about", w: 70.1, cy: 495.6, size: 11.68 },
        { label: "وبلاگ و اخبار", action: "link", href: "/blog", w: 59.3, cy: 521.5, size: 10.68 },
        { label: "همکاری با ما", action: "link", href: "/careers", w: 58.4, cy: 548.3, size: 11.37 },
        { label: "قوانین و مقررات", action: "link", href: "/terms", w: 76.3, cy: 574.4, size: 10.63 },
      ] as ColumnLink[],
    },
  },

  divider: { left: 19.8, right: 404.6, cy: 603.3 },

  contact: {
    /** rows are physically LTR: [icon] [text] [chevron] */
    iconCx: 228.1,
    textLeft: 252.6,
    textSize: 12.6, // unused fallback — per-row size below
    chevronCx: 396.3,
    rows: [
      { icon: "pin", kind: "map", w: 130.9, cy: 622.3, size: 10.0 } as const,
      { icon: "envelope", kind: "email", w: 73.0, cy: 648.9, size: 11.2 } as const,
      { icon: "phoneFilled", kind: "tel", w: 62.1, cy: 675.5, size: 9.4 } as const,
    ],
  },

  decor: {
    /** measured top-edge points (card-relative x,y) of the two wave layers */
    lightFill: "#f7f1f6",
    strongFill: "#f8e7ef",
    strongFillBottom: "#f7ebf1",
    curveColor: "#f83153",
    dot: { cx: 341.3, cy: 716.5, r: 2.1, fill: "#fb254f" },
  },
} as const;
