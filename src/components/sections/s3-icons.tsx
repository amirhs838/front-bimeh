import type { CSSProperties } from "react";
import type { S3IconName } from "@/data/features";
import { px } from "@/lib/format";

/**
 * Scroll-3 feature icons — redrawn as clean outline SVGs from 3.jpg.
 * Stroke = currentColor (rendered inside a --brand colored wrapper),
 * ~1.6u stroke, round caps/joins, no fill (calendar dots excepted).
 * viewBox units = design px on the 450-wide frame; the svg fills the
 * sized wrapper (w/h in rem via S3_ICON_SIZE).
 */

const S = {
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
} as const;

const SVGcls = "block h-full w-full";

/** 4-point sparkle (concave diamond), outlined — used by the brain icon. */
function Sparkle({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const k = r * 0.18;
  return (
    <path
      {...S}
      d={`M${cx} ${cy - r} C${cx + k} ${cy - k * 1.6} ${cx + k * 1.6} ${cy - k} ${cx + r} ${cy} C${cx + k * 1.6} ${cy + k} ${cx + k} ${cy + k * 1.6} ${cx} ${cy + r} C${cx - k} ${cy + k * 1.6} ${cx - k * 1.6} ${cy + k} ${cx - r} ${cy} C${cx - k * 1.6} ${cy - k} ${cx - k} ${cy - k * 1.6} ${cx} ${cy - r} Z`}
    />
  );
}

function Brain() {
  return (
    <svg viewBox="0 0 37 31" aria-hidden className={SVGcls}>
      {/* left hemisphere */}
      <path
        {...S}
        d="M17.4 7.4 C16.1 4.8 12.7 3.8 10.3 5.4 C7.5 4.6 4.7 6.4 4.5 9.2 C2.1 10.2 1.1 13.2 2.5 15.4 C1.1 17.8 2.3 21 4.9 21.8 C5.1 24.8 7.9 26.8 10.7 25.8 C11.9 27.8 14.9 28.2 16.7 26.6"
      />
      {/* right hemisphere */}
      <path
        {...S}
        d="M18.6 7.4 C19.9 4.8 23.3 3.8 25.7 5.4 C28.5 4.6 31.3 6.4 31.5 9.2 C33.9 10.2 34.9 13.2 33.5 15.4 C34.9 17.8 33.7 21 31.1 21.8 C30.9 24.8 28.1 26.8 25.3 25.8 C24.1 27.8 21.1 28.2 19.3 26.6"
      />
      {/* central fissure */}
      <path {...S} d="M18 7 C17.6 13.2 18.4 19.8 18 26.2" />
      {/* sulci */}
      <path {...S} d="M7.6 11 C9.1 12 9.1 14 7.7 15" />
      <path {...S} d="M6.8 18.2 C8.5 18.4 9.7 20 9.3 21.7" />
      <path {...S} d="M28.4 11 C26.9 12 26.9 14 28.3 15" />
      <path {...S} d="M29.2 18.2 C27.5 18.4 26.3 20 26.7 21.7" />
      {/* sparkles top-right */}
      <Sparkle cx={32.6} cy={4.6} r={3.1} />
      <Sparkle cx={35.4} cy={10.6} r={1.55} />
    </svg>
  );
}

function Shield() {
  return (
    <svg viewBox="0 0 28 30" aria-hidden className={SVGcls}>
      <path
        {...S}
        d="M14 2 C17.5 3.6 21 4.7 24.5 5.2 L24.5 13.6 C24.5 20.6 20.4 25.8 14 28 C7.6 25.8 3.5 20.6 3.5 13.6 L3.5 5.2 C7 4.7 10.5 3.6 14 2 Z"
      />
      <path {...S} d="M9.3 14.6 L12.7 18 L19 10.9" />
    </svg>
  );
}

function Bolt() {
  return (
    <svg viewBox="0 0 22 28" aria-hidden className={SVGcls}>
      <path
        {...S}
        d="M12.4 2.2 L4.2 15.4 L9.9 15.4 L8.4 25.8 L17.8 11.6 L11.4 11.6 Z"
      />
    </svg>
  );
}

function Calendar() {
  const cols = [8.2, 13, 17.8, 22.6];
  const rows = [15.9, 19.5, 23.1];
  return (
    <svg viewBox="0 0 28 28" aria-hidden className={SVGcls}>
      <rect {...S} x="3" y="5.4" width="22" height="20.2" rx="4.4" />
      {/* ring tabs */}
      <circle {...S} cx="8.6" cy="4" r="2" />
      <circle {...S} cx="19.4" cy="4" r="2" />
      {/* header line */}
      <path {...S} d="M3 11.2 H25" />
      {/* dot grid 3 rows x 4 cols */}
      {rows.map((y) =>
        cols.map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.95" fill="currentColor" />
        )),
      )}
    </svg>
  );
}

function Network() {
  return (
    <svg viewBox="0 0 30 27" aria-hidden className={SVGcls}>
      <circle {...S} cx="15" cy="4.8" r="3.3" />
      <circle {...S} cx="5.9" cy="21.2" r="3.3" />
      <circle {...S} cx="24.1" cy="21.2" r="3.3" />
      <path {...S} d="M13.8 7.7 L7.1 18.3" />
      <path {...S} d="M16.2 7.7 L22.9 18.3" />
      <path {...S} d="M9.4 21.2 L20.6 21.2" />
    </svg>
  );
}

const ICONS: Record<S3IconName, () => React.ReactElement> = {
  brain: Brain,
  shield: Shield,
  bolt: Bolt,
  calendar: Calendar,
  network: Network,
};

/** Intrinsic frame-px sizes (from 3.jpg) — the icon is centered in its tile. */
export const S3_ICON_SIZE: Record<S3IconName, { w: number; h: number }> = {
  brain: { w: 37, h: 31 },
  shield: { w: 28, h: 30 },
  bolt: { w: 22, h: 28 },
  calendar: { w: 28, h: 28 },
  network: { w: 30, h: 27 },
};

export function S3FeatureIcon({ name }: { name: S3IconName }) {
  const Cmp = ICONS[name];
  const size = S3_ICON_SIZE[name];
  return (
    <span
      aria-hidden
      className="block text-brand"
      style={{ width: px(size.w), height: px(size.h) }}
    >
      <Cmp />
    </span>
  );
}
