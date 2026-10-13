/**
 * Scroll 2 ("چرا Bimeh AI") — step data.
 * Geometry values are CSS px measured on the 450x875 design frame from the
 * reference (2.jpg), converted to rem at render time via px().
 * Copy (titles + description lines) lives in data/content.ts under `why`.
 */
import { content } from "./content";

export type WhyStep = {
  /** step number 1-4 (drives stagger/aria) */
  n: 1 | 2 | 3 | 4;
  /** right edge of the text block (CSS px) — RTL text-align right */
  textRight: number;
  /** ink center of the title line (CSS px y) */
  titleCenterY: number;
  /** ink centers of the 3 description lines (CSS px y) */
  descYs: [number, number, number];
  /** illustration crop box on the frame (CSS px); asset is exact 2x */
  illu: { src: string; x: number; y: number; w: number; h: number };
  /** horizontal condensation for the title (reference font is slightly
   *  narrower for steps 2 & 4); scaleX with the right edge anchored */
  titleSqueeze?: number;
  /** per-step description font size (the reference renders each block at a
   *  slightly different size); default 11 */
  descSize?: number;
  /** invisible hotspot over the illustration (frame CSS px) */
  hotspot?: {
    x: number;
    y: number;
    w: number;
    h: number;
    action: "chat" | "support";
    aria: string;
  };
};

export const TITLE_LH = 24; // step-title line box (CSS px)
export const DESC_LH = 21.5; // description line box (CSS px)

const w = content.why;

export const steps: WhyStep[] = [
  {
    n: 1,
    textRight: 434,
    titleCenterY: 181.8,
    descYs: [211.2, 232.8, 254.2],
    illu: { src: "/img/s2-step1.webp", x: 0, y: 91, w: 254, h: 202 },
    descSize: 10.4,
    hotspot: { x: 44, y: 104, w: 136, h: 142, action: "chat", aria: w.chatHotspotAria },
  },
  {
    n: 2,
    textRight: 226,
    titleCenterY: 360,
    descYs: [389.2, 409.8, 429.5],
    illu: { src: "/img/s2-step2.webp", x: 218, y: 287, w: 224, h: 168 },
    titleSqueeze: 0.935,
    descSize: 11.1,
  },
  {
    n: 3,
    textRight: 437,
    titleCenterY: 525.8,
    descYs: [557.5, 580.5, 602],
    illu: { src: "/img/s2-step3.webp", x: 8, y: 474, w: 238, h: 163 },
  },
  {
    n: 4,
    textRight: 241,
    titleCenterY: 700.2,
    descYs: [732, 754, 774.5],
    illu: { src: "/img/s2-step4.webp", x: 236, y: 650, w: 213, h: 159 },
    titleSqueeze: 0.947,
    hotspot: { x: 309, y: 672, w: 58, h: 48, action: "support", aria: w.supportHotspotAria },
  },
];
