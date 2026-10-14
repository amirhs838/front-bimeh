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
};

/** title/desc line-height boxes (frame px) shared by all cards */
export const S3_TITLE_LH = 17;
export const S3_DESC_LH = 16;

export const features: S3Feature[] = [
  {
    n: 1,
    icon: "brain",
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
