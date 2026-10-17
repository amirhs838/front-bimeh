/**
 * Scroll-3 feature cards — geometry in CSS px measured on the 450x929 design
 * frame of 3.jpg (converted to rem at render time via px()).
 * Coordinates are per-card measurements from the reference: the image shows
 * tiny per-item variations (<=3u) which are replicated on purpose, not
 * "fixed" (see worklog report). Font sizes are width-calibrated per line
 * against the reference (the image's Persian glyphs are proportionally
 * different from Estedad, so each card carries its own sizes).
 */

export type S3IconName = "brain" | "shield" | "bolt" | "calendar" | "network";

/** DESKTOP (D3 "Bimeh AI Persian Landing Page.png", frame 1507x1044).
 *  All numbers are D3 image px, rendered as calc(N * var(--d3)).
 *  box = card rect (absolute, D3 page coords); tile = inset from the card's
 *  RIGHT edge / top; icon = D3 ink box; title/desc = per-line ink targets
 *  (right edge from the card's right edge, ink width for font calibration,
 *  cy card-relative). D3 renders per-card/per-line variations on purpose —
 *  replicated, not "fixed" (master prompt §0). */
export type S3FeatureDk = {
  box: { x: number; y: number; w: number; h: number };
  tile: { right: number; top: number; w: number; h: number };
  icon: { w: number; h: number };
  title: { right: number; w: number; cy: number; lh: number; fs: number };
  desc: { right: number; cy1: number; cy2: number; fs1: number; fs2: number };
  /** desktop title (feature 1 is SHORTER on desktop; a prefix of the mobile title) */
  titleDk: string;
  /** D3 line breaks — words identical to the mobile lines (parity-tested) */
  linesDk: [string, string];
};

export type S3Feature = {
  n: 1 | 2 | 3 | 4 | 5;
  icon: S3IconName;
  /** card top / height on the 450-wide frame (absolute y) */
  top: number;
  height: number;
  /** icon tile: inset from the card's RIGHT edge, top rel. card, size */
  tile: { right: number; top: number; w: number; h: number };
  /** text-block right edge, measured from the card's RIGHT edge */
  textRight: number;
  /** vertical centers (rel. card top) of the title and the 2 description lines */
  titleCy: number;
  descCys: [number, number];
  /** width-calibrated font sizes (frame px) — desc sizes differ per line */
  titleSize: number;
  descSizeL1: number;
  descSizeL2: number;
  /** DESKTOP (D3) geometry + copy — additions only, mobile untouched */
  dk: S3FeatureDk;
};

/** title/desc line-height boxes (frame px) shared by all cards */
export const S3_TITLE_LH = 17;
export const S3_DESC_LH = 16;

export const features: S3Feature[] = [
  {
    n: 1,
    icon: "brain",
    dk: {
      box: { x: 110, y: 569, w: 416, h: 218 },
      tile: { right: 23, top: 24, w: 78, h: 68 },
      icon: { w: 41, h: 39 }, // D3 brain: NO sparkles, rounder, thicker (redrawn)
      title: { right: 71, w: 176, cy: 115.5, lh: 26, fs: 22.3 },
      desc: { right: 23, cy1: 157.5, cy2: 184, fs1: 17.79, fs2: 16.2 },
      titleDk: "معرفی سه بیمه برتر",
      linesDk: ["با تحلیل نیازها و شرایط شما، بهترین", "گزینه‌های بیمه را پیشنهاد می‌دهیم."],
    },
    top: 484,
    height: 73.7,
    tile: { right: 12, top: 13.5, w: 50, h: 45.5 },
    // card 1's text sits ~2.5u further right-edge-in than cards 2-5 + its
    // title is visibly larger — as in the image
    textRight: 95,
    titleCy: 19.5,
    descCys: [40.5, 56.5],
    titleSize: 10.94,
    descSizeL1: 8.73,
    descSizeL2: 8.69,
  },
  {
    n: 2,
    icon: "shield",
    dk: {
      box: { x: 545, y: 569, w: 417, h: 218 },
      tile: { right: 22, top: 24, w: 78, h: 68 },
      icon: { w: 39, h: 42 },
      title: { right: 94, w: 190, cy: 115.5, lh: 26, fs: 19.82 },
      desc: { right: 22, cy1: 156.5, cy2: 183.5, fs1: 17.38, fs2: 16.5 },
      titleDk: "تحت نظارت بیمه مرکزی",
      linesDk: ["با مجوز رسمی و تحت نظارت بیمه مرکزی،", "جمهوری اسلامی ایران."],
    },
    top: 567,
    height: 72.7,
    tile: { right: 12, top: 13.5, w: 50, h: 45.5 },
    textRight: 92.5,
    titleCy: 19.5,
    descCys: [38.5, 54.5],
    titleSize: 10.45,
    descSizeL1: 8.92,
    descSizeL2: 8.58,
  },
  {
    n: 3,
    icon: "bolt",
    dk: {
      box: { x: 983, y: 569, w: 415, h: 218 },
      tile: { right: 22, top: 24, w: 78, h: 68 },
      icon: { w: 35, h: 44 },
      title: { right: 73, w: 189, cy: 116.5, lh: 26, fs: 22.26 },
      desc: { right: 22, cy1: 158.5, cy2: 184, fs1: 16.78, fs2: 16.6 },
      titleDk: "صدور سریع بیمه‌نامه",
      linesDk: ["در کمترین زمان، بیمه‌نامه خود را", "به‌صورت آنلاین دریافت کنید."],
    },
    top: 648.5,
    height: 72.7,
    tile: { right: 12, top: 13.5, w: 50, h: 45.5 },
    textRight: 92.5,
    titleCy: 19.5,
    descCys: [38.5, 54],
    titleSize: 10.45,
    descSizeL1: 8.73,
    descSizeL2: 8.81,
  },
  {
    n: 4,
    icon: "calendar",
    dk: {
      box: { x: 330, y: 807, w: 415, h: 196 },
      tile: { right: 22, top: 20, w: 75, h: 64 },
      icon: { w: 38, h: 38 },
      title: { right: 85, w: 237, cy: 102, lh: 26, fs: 19.8 },
      desc: { right: 22, cy1: 142.5, cy2: 169, fs1: 16.54, fs2: 15.3 },
      titleDk: "امکان خرید اقساطی بیمه‌نامه",
      linesDk: ["با شرایط منعطف و پرداخت آسان، بیمه مورد", "نیازتان را قسطی تهیه کنید."],
    },
    top: 730.4,
    height: 71.6,
    tile: { right: 12, top: 13.5, w: 50, h: 45.5 },
    textRight: 92.5,
    titleCy: 20,
    descCys: [38.5, 54.5],
    titleSize: 9.78,
    descSizeL1: 8.75,
    descSizeL2: 8.81,
  },
  {
    n: 5,
    icon: "network",
    dk: {
      box: { x: 765, y: 807, w: 415, h: 196 },
      tile: { right: 22, top: 20, w: 75, h: 64 },
      icon: { w: 40, h: 36 },
      title: { right: 70, w: 246, cy: 104, lh: 26, fs: 18.84 },
      desc: { right: 22, cy1: 144, cy2: 170, fs1: 15.3, fs2: 16.4 },
      titleDk: "همکاری با تمام شرکت‌های بیمه",
      linesDk: ["دسترسی به تمامی شرکت‌های بیمه معتبر کشور", "در یک پلتفرم."],
    },
    top: 811.3,
    height: 71.6,
    tile: { right: 12, top: 14, w: 50, h: 45.5 },
    textRight: 92.5,
    // card 5's title sits ~3u lower (tighter to its description), as in the image
    titleCy: 22.5,
    descCys: [39.5, 55.5],
    titleSize: 9.41,
    descSizeL1: 8.41,
    descSizeL2: 8.69,
  },
];
