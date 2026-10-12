import type { SVGProps } from "react";
import { px } from "@/lib/format";

/** Smiling face (two closed-eye arcs + smile) used in the logo tile and avatar. */
export function Face({
  stroke = "#fff",
  strokeWidth = 2.7,
  ...props
}: SVGProps<SVGSVGElement> & { stroke?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 34 34" fill="none" aria-hidden {...props}>
      <path
        d="M7.6 14.9 Q11.3 9.9 15 14.9"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M19 14.9 Q22.7 9.9 26.4 14.9"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M10.2 20.4 Q17 28.4 23.8 20.4"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Red rounded logo tile with the white face. */
export function LogoTile({
  size = 34,
  radius = 10,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number; radius?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      aria-hidden
      {...props}
    >
      <rect width="34" height="34" rx={radius} fill="var(--brand)" />
      <Face />
    </svg>
  );
}

/** "Bimeh AI" wordmark (rendered as styled text with the Latin rounded font). */
export function Wordmark({
  className,
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={`font-wordmark font-bold leading-none text-brand select-none ${className ?? ""}`}
      style={{ fontSize: px(size), letterSpacing: "-0.01em" }}
    >
      Bimeh AI
    </span>
  );
}

/** Hamburger: 3 rounded lines. */
export function Burger(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 15" fill="none" aria-hidden {...props}>
      <path
        d="M1 1.4h16M1 7.5h16M1 13.6h16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Solid support headset with mic (round cups, mic boom from right cup). */
export function Headset(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 25" fill="none" aria-hidden {...props}>
      <path
        d="M3.6 14.2v-3a8.4 8.4 0 0 1 16.8 0v3"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <circle cx="4.6" cy="15.4" r="3.3" fill="currentColor" />
      <circle cx="19.4" cy="15.4" r="3.3" fill="currentColor" />
      <path
        d="M19.4 18.7v.5a4.3 4.3 0 0 1-4.3 4.3h-1.6"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <circle cx="11.9" cy="23.4" r="1.55" fill="currentColor" />
    </svg>
  );
}

/** Red AI sparkles: one large + one small 4-point star. */
export function Sparkles(props: SVGProps<SVGSVGElement>) {
  const star = (cx: number, cy: number, r: number) =>
    `M ${cx} ${cy - r}
     Q ${cx + r * 0.18} ${cy - r * 0.18} ${cx + r} ${cy}
     Q ${cx + r * 0.18} ${cy + r * 0.18} ${cx} ${cy + r}
     Q ${cx - r * 0.18} ${cy + r * 0.18} ${cx - r} ${cy}
     Q ${cx - r * 0.18} ${cy - r * 0.18} ${cx} ${cy - r} Z`;
  return (
    <svg viewBox="0 0 22 20" fill="currentColor" aria-hidden {...props}>
      <path d={star(8.2, 9.2, 8.4)} />
      <path d={star(17.4, 15.6, 4.4)} />
    </svg>
  );
}

/** Chat bubble with three dots (send button icon). */
export function ChatDots(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 17" fill="none" aria-hidden {...props}>
      <path
        d="M9 .8h-.2C4.4.8.9 4 .9 8c0 1.5.5 2.9 1.4 4.1L1 16.2l4.4-1.2c1.1.5 2.3.8 3.6.8h.2c4.4 0 7.9-3.2 7.9-7.2S13.4.8 9 .8Z"
        fill="currentColor"
      />
      <circle cx="5.4" cy="8.1" r="1.15" fill="var(--brand)" />
      <circle cx="9" cy="8.1" r="1.15" fill="var(--brand)" />
      <circle cx="12.6" cy="8.1" r="1.15" fill="var(--brand)" />
    </svg>
  );
}

/** Animated checkbox check. */
export function Check(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden {...props}>
      <path
        d="M3 7.2 5.8 10 11 4.4"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** RTL "back" chevron (points right). */
export function ChevronRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 8 14" fill="none" aria-hidden {...props}>
      <path
        d="M7 1 1.4 7 7 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Faint city skyline for the illustration stage (left variant; mirrored via CSS for right). */
export function Skyline({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 56 46"
      fill="none"
      aria-hidden
      className={className}
      {...props}
    >
      <g stroke="#C6D2E4" strokeOpacity="0.38" strokeWidth="1">
        <path d="M4 46V12a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v34" fill="rgba(255,255,255,.28)" />
        <path d="M20 46V22a2.5 2.5 0 0 1 2.5-2.5h6A2.5 2.5 0 0 1 31 22v24" fill="rgba(255,255,255,.18)" />
        <path d="M34 46V6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v40" fill="rgba(255,255,255,.28)" />
      </g>
      <g fill="#C9D5E7" fillOpacity="0.34">
        <rect x="7" y="16" width="2.6" height="2.6" rx="0.6" />
        <rect x="12" y="16" width="2.6" height="2.6" rx="0.6" />
        <rect x="7" y="22" width="2.6" height="2.6" rx="0.6" />
        <rect x="12" y="28" width="2.6" height="2.6" rx="0.6" />
        <rect x="38" y="10" width="2.6" height="2.6" rx="0.6" />
        <rect x="43" y="10" width="2.6" height="2.6" rx="0.6" />
        <rect x="38" y="16" width="2.6" height="2.6" rx="0.6" />
        <rect x="43" y="22" width="2.6" height="2.6" rx="0.6" />
        <rect x="24" y="26" width="2.4" height="2.4" rx="0.6" />
      </g>
    </svg>
  );
}
