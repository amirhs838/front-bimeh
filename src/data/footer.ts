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

/**
 * DESKTOP FOOTER (>=1280) — geometry measured on D4
 * "Persian Insurance AI Website Footer.png" (1672x940 px; NOT 1536 wide).
 * Section-local unit: --d4 = --d * 1536/1672 (~0.9187 x --d); the design
 * frame is 1536d x 863.7d. All values below are D4 image px ("p").
 * Consumed in Footer.tsx / globals.css (desktop MQ) via --dkf-* CSS vars —
 * mobile rules never read them. Mobile arrays above stay untouched.
 *
 * Per-item D4 inconsistencies replicated here (NOT silently fixed):
 * - "درباره ما" title right edge sits 38p INSIDE its links' right edge
 *   (titleRight 723+46/2... see about.titleRight vs rowRight 683 → x951 vs 989).
 * - row centers differ per column: about/services 272/337/407.5/477.5,
 *   quick 268/337/407/477; quick dividers sit at 301/370/440 vs 302/371/441.
 * - title cys differ per column (195.5 / 193 / 197).
 * - about dividers end x989 but its rows' ink reaches 987; services dividers
 *   end x740 = its title right edge; quick divider ends x392 ≠ circle 417.
 * - contact icon-circle center offsets differ (map 25.5p vs mail/tel 24.5p).
 */
export const footerDesktop = {
  frame: { w: 1672, h: 940 },
  /** empty background above the wordmark ink (--dk4-top-pad, tunable) */
  topPad: 140,
  wordmark: { right: 76, inkTop: 140, inkW: 247, capH: 46, size: 56 },
  intro: {
    headingRight: 80,
    headingCy: 243.9,
    headingW: 414,
    /** paragraph: L1-L4 justified into a fixed 533p box, L5 natural.
     *  D4 renders per-line metrics (like D2/D3): a single L1-calibrated size
     *  would wrap L2 (natural 552p > 533p), so L1-L4 share the L2-safe size
     *  (17.7p; the leftover distributes as inter-word justify gaps — D4's
     *  L3 shows the same wide gap) and L5 is its own smaller size (16.5p,
     *  measured ink 167p vs 179.6p at the shared size). */
    paraRight: 80,
    paraW: 533,
    paraCy1: 305.5,
    paraPitch: 39.5,
    l5W: 167,
    /** calibrated font sizes (p) — targets: heading ink 414p wide,
     *  L1 natural ≈ 533p (±1.5%), L5 ≈ 167p */
    headingSize: 29.5,
    paraSize: 17.8,
    l5Size: 15.8,
  },
  about: {
    titleRight: 722.5, // 1672-949: title ink right edge x949 (+2 ink inset)
    titleCy: 195.5,
    ulRight: 720, // underline x906-951
    ulCy: 223.5,
    ulW: 46,
    ulH: 3,
    rowLeft: 791, // chevron cx 803 - 12
    rowRight: 683, // 1672-989
    divLeft: 794,
    divRight: 989,
    divs: [302, 371, 441],
    rows: [
      { cy: 272, h: 63, size: 20.9 },
      { cy: 337, h: 69, size: 19.7 },
      { cy: 407.5, h: 70, size: 19.3 },
      { cy: 477.5, h: 70, size: 19.9 },
    ],
  },
  services: {
    titleRight: 931, // 1672-739 (+2 ink inset)
    titleCy: 197.2, // ink cy 193 (glyph box offset compensated)
    ulRight: 932,
    ulCy: 223.5,
    ulW: 46,
    ulH: 3,
    rowLeft: 509, // chevron cx 521 - 12
    rowRight: 932, // 1672-740
    divLeft: 512,
    divRight: 740,
    divs: [302, 371, 441],
    rows: [
      { cy: 272, h: 63, size: 20.2 },
      { cy: 336.5, h: 69, size: 20.3 },
      { cy: 407, h: 70, size: 20.2 },
      { cy: 477.5, h: 70, size: 19.7 },
    ],
  },
  quick: {
    titleRight: 1255.5, // 1672-414 (+2.5 ink inset)
    titleCy: 195, // ink cy 197 (descender compensated)
    ulRight: 1256, // underline x370-415
    ulCy: 223.5,
    ulW: 46,
    ulH: 3,
    rowLeft: 95,
    rowRight: 1255, // 1672-(417): rows span x95-417
    circleD: 49,
    circleRight: 0.5,
    labelRight: 76, // 417-341
    chevLeft: 9.5, // chevron cx 104.5 - 95
    divLeft: 95,
    divRight: 392,
    divs: [301, 370, 440],
    rows: [
      { cy: 268, h: 68, size: 19.6 },
      { cy: 337, h: 69, size: 19.2 },
      { cy: 407, h: 70, size: 20.1 },
      { cy: 477, h: 70, size: 19.1 },
    ],
  },
  divider: { left: 80, right: 80, cy: 557.5 },
  contact: {
    cy: 629.5,
    circleD: 49.5,
    map: { left: 1103, right: 222, circleCx: 25.5, textLeft: 77, size: 19.5, dy: 2.5 },
    mail: { left: 708, right: 747, circleCx: 24.5, textLeft: 77, size: 20, dy: 4 },
    tel: { left: 336, right: 1127, circleCx: 24.5, textLeft: 72.5, size: 22.4, dy: 4 },
    vsepTop: 612,
    vsepH: 40,
    vseps: [627, 1010],
  },
  decor: { h: 215, dotX: 1305, dotY: 82, dotD: 14 },
} as const;

/**
 * Desktop paragraph — D4's wording differs from the mobile paragraph in real
 * words (not just line breaks): "مقایسه‌ای دقیق از گزینه‌ها" (mobile:
 * "مقایسه دقیق گزینه‌ها"), "انتخاب بیمه" (mobile: "خرید بیمه") and
 * "آینده‌ای امن‌تر" (mobile: "آینده‌ی امن‌تری"). Mobile text must not change.
 * L3 of D4 shows a broken gap "ر ا" (AI artifact): rendered here as the
 * normal word "را" with regular justification.
 */
export const paragraphLinesDesktop = [
  "با استفاده از هوش مصنوعی، بهترین پیشنهادهای بیمه‌ای را در چند ثانیه",
  "برای شما پیدا می‌کند. Bimeh AI با تحلیل نیازها و شرایط شما، مقایسه‌ای",
  "دقیق از گزینه‌ها و ارائه توصیه‌های شخصی‌سازی‌شده، انتخاب بیمه را",
  "ساده‌تر، سریع‌تر و مطمئن‌تر می‌کند. ما اینجا هستیم تا تکنولوژی، آینده‌ای",
  "امن‌تر برای شما بسازیم.",
] as const;
