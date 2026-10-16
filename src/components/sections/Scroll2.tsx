"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { steps, TITLE_LH, DESC_LH, type WhyStep } from "@/data/steps";
import { content } from "@/data/content";
import { site } from "@/data/site";
import { useUI } from "@/lib/ui-store";
import { px } from "@/lib/format";

/**
 * Scroll 2 — "چرا Bimeh AI" (reference: 2.jpg, 450x875 frame).
 * Everything is absolutely positioned in design units so the frame renders
 * pixel-exact and scales proportionally with the root font-size.
 *
 * DESKTOP (>=1280): D2 presentation ("Bimeh AI Smart Insurance Features.png",
 * 1536x1024) — viewport-anchored decor (DecorDesktop), per-step desktop art
 * (s2d-*.webp via <picture>), 2-line descriptions, exact D2 geometry.
 * All desktop styling lives in the @media (min-width:1280px) block of
 * globals.css; mobile rules/tokens are untouched (mobile freeze protocol).
 */

/** Section heading: "چرا" on the right, Latin wordmark on the left (RTL bidi). */
function SectionTitle() {
  const idx = content.why.title.indexOf(site.latinName);
  const faPart = idx > 0 ? content.why.title.slice(0, idx) : "";
  return (
    <h2
      id="s2-title"
      className="s2-title s2-reveal absolute whitespace-nowrap font-black text-s2-title"
      style={{
        top: px(41),
        right: px(112),
        fontSize: px(36.5),
        lineHeight: 1,
        letterSpacing: "0",
      }}
    >
      <span
        className="s2-title-fa"
        style={{
          fontFamily: "var(--font-vazir-black), var(--font-app)",
          fontSize: px(42.5),
          letterSpacing: "0",
        }}
      >
        {faPart}
      </span>
      <span className="font-wordmark" style={{ fontWeight: 800 }}>
        {site.latinName}
      </span>
    </h2>
  );
}

/** Top-left background decor: faint pale circle (cropped by the section top)
 *  + the thin red arc with a short fade-in mask at its top end (seam). */
function Decor() {
  return (
    <div aria-hidden className="s2-m-decor pointer-events-none absolute inset-0">
      {/* very large, very faint pale circle cropped by the top edge;
          fades in over the first 50px so the seam stays invisible */}
      <svg
        className="absolute"
        style={{ left: px(-160), top: px(-255), width: px(320), height: px(320), overflow: "visible" }}
        viewBox="0 0 320 320"
        fill="none"
        aria-hidden
      >
        <defs>
          <radialGradient id="s2-circle-fill" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#d3dbe7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#d3dbe7" stopOpacity="0" />
          </radialGradient>
          {/* fade the first 50 section-px (svg y 255-305) */}
          <linearGradient id="s2-circle-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.797" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.953" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="s2-circle-mask">
            <rect width="320" height="320" fill="url(#s2-circle-fade)" />
          </mask>
        </defs>
        <circle cx="160" cy="160" r="160" fill="url(#s2-circle-fill)" mask="url(#s2-circle-mask)" />
      </svg>
      {/* thin red arc: left edge y~90 -> exits top at x~60; fades in over the seam */}
      <svg
        className="absolute"
        style={{ left: 0, top: 0, width: px(70), height: px(92) }}
        viewBox="0 0 70 92"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="s2-arc-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.13" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="s2-arc-mask">
            <rect width="70" height="92" fill="url(#s2-arc-fade)" />
          </mask>
        </defs>
        <path
          d="M60.5 0 C60.5 26 58.5 46 49 61 C41 74.5 20 84.8 0 90.4"
          stroke="var(--brand)"
          strokeOpacity="0.85"
          strokeWidth="1.1"
          strokeLinecap="round"
          mask="url(#s2-arc-mask)"
        />
      </svg>
    </div>
  );
}

/** One zig-zag step: illustration (reveal + idle float + optional hotspot)
 *  and its text block (reveal, 80ms after the illustration).
 *  DESKTOP: same li/h3/p semantics; the art swaps via <picture> (media
 *  query-gated source — no JS device detection, no cross-download), the
 *  text block is re-positioned by CSS vars + the 2-line desktop <p>. */
function StepItem({
  step,
  index,
  onChat,
  onSupport,
}: {
  step: WhyStep;
  index: number;
  onChat: () => void;
  onSupport: () => void;
}) {
  const { illu, hotspot, dkIllu, dkHotspot } = step;
  const copy = content.why.steps[index];
  const titleTop = step.titleCenterY - TITLE_LH / 2;
  const descMarginTop =
    step.descYs[0] - DESC_LH / 2 - (titleTop + TITLE_LH);
  const gapLH = (i: number) => step.descYs[i] - step.descYs[i - 1] - DESC_LH;

  return (
    <li className="list-none">
      {/* illustration */}
      <div
        className="s2-illu s2-reveal absolute"
        style={{
          left: px(illu.x),
          top: px(illu.y),
          width: px(illu.w),
          height: px(illu.h),
          ...(dkIllu
            ? ({
                "--dkx": dkIllu.x,
                "--dky": dkIllu.y,
                "--dkw": dkIllu.w,
                "--dkh": dkIllu.h,
              } as React.CSSProperties)
            : {}),
        }}
      >
        <div
          className="anim-s2-float relative h-full w-full"
          style={{ animationDelay: `${-(step.n - 1) * 1.4}s` }}
        >
          <picture>
            {/* desktop art — fetched only at >=1280 (media-gated source) */}
            {dkIllu && (
              <source
                media="(min-width: 1280px)"
                srcSet={dkIllu.src}
                width={dkIllu.w * 2}
                height={dkIllu.h * 2}
              />
            )}
            <Image
              src={illu.src}
              alt={content.why.alts[index]}
              width={illu.w * 2}
              height={illu.h * 2}
              loading="lazy"
              decoding="async"
              className="s2-img-m h-full w-full object-contain"
            />
          </picture>
        </div>
        {hotspot && (
          <button
            type="button"
            aria-label={hotspot.aria}
            onClick={hotspot.action === "chat" ? onChat : onSupport}
            className="s2-hotspot absolute cursor-pointer rounded-[0.75rem]"
            style={{
              left: px(hotspot.x - illu.x),
              top: px(hotspot.y - illu.y),
              width: px(hotspot.w),
              height: px(hotspot.h),
              ...(dkHotspot
                ? ({
                    "--dkhl": `${dkHotspot.l}%`,
                    "--dkht": `${dkHotspot.t}%`,
                    "--dkhw": `${dkHotspot.w}%`,
                    "--dkhh": `${dkHotspot.h}%`,
                  } as React.CSSProperties)
                : {}),
            }}
          />
        )}
      </div>

      {/* text block */}
      <div
        className="s2-text s2-reveal s2-reveal-text absolute text-right"
        style={{
          right: px(450 - step.textRight),
          top: px(titleTop),
          ...(step.dkTextRight
            ? ({
                "--dktr": step.dkTextRight,
                "--dkty": step.dkTitleCy,
                "--dkt": step.dkTitleSize,
                "--dkd1": step.dkDescSizes[0],
                "--dkd2": step.dkDescSizes[1],
                "--dkmt":
                  step.dkDescCys[0] - step.dkTitleCy - 44.5,
              } as React.CSSProperties)
            : {}),
        }}
      >
        <h3
          className="whitespace-nowrap font-extrabold text-s2-step-title"
          style={{
            fontSize: px(17),
            lineHeight: px(TITLE_LH),
            transform: step.titleSqueeze ? `scaleX(${step.titleSqueeze})` : undefined,
            transformOrigin: "100% 50%",
          }}
        >
          {copy.title}
        </h3>
        <p
          className="s2-desc-m text-s2-desc"
          style={{
            marginTop: px(descMarginTop),
            fontSize: px(step.descSize ?? 11),
            fontWeight: 400,
          }}
        >
          {copy.lines.map((line, i) => (
            <span
              key={i}
              className="block whitespace-nowrap"
              style={{
                lineHeight: px(DESC_LH),
                marginTop: i > 0 ? px(gapLH(i)) : undefined,
              }}
            >
              {line}
            </span>
          ))}
        </p>
        {copy.linesDesktop && (
          <p className="s2-desc-dk dk-only" style={{ fontWeight: 400 }}>
            {copy.linesDesktop.map((line, i) => (
              <span key={i} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </p>
        )}
      </div>
    </li>
  );
}

/** Bottom pale wave — full-bleed (stretches with the viewport, exact 1:1 at
 *  the 450px column) with a gentle shadow along its crest. */
function Wave() {
  return (
    <svg
      aria-hidden
      className="s2-m-wave pointer-events-none absolute inset-x-0 bottom-0 w-full"
      style={{ height: px(95) }}
      viewBox="0 0 450 95"
      fill="none"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="s2-wave-fill" x1="0" y1="0" x2="0" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#e6e9ee" />
          <stop offset="0.45" stopColor="#e4e7ec" />
          <stop offset="1" stopColor="#e3e6eb" />
        </linearGradient>
      </defs>
      <path
        d="M0 24 C10 21.2 26 20.2 44 20.7 C70 21.6 86 26.5 110 35.5 C134 44.5 158 57.5 184 66 C208 73.8 228 77.4 254 77.6 C286 77.8 314 74.4 350 69 C386 63.4 418 55.4 450 51.4 L450 95 L0 95 Z"
        fill="url(#s2-wave-fill)"
        style={{ filter: "drop-shadow(0 -2.5px 3px rgba(173,185,203,0.30))" }}
      />
    </svg>
  );
}

/** Thin red curve + glowing dot (column coords), leading into Scroll 3. */
function RedCurve() {
  return (
    <svg
      aria-hidden
      className="s2-m-curve pointer-events-none absolute inset-x-0"
      style={{ top: px(795), height: px(80), width: "100%" }}
      viewBox="0 795 450 80"
      fill="none"
    >
      <defs>
        <filter id="s2-dot-blur" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <path
        d="M362 843.5 C374 838.6 388 832.6 404 825.9 C420 819 437 812.9 451 808.9"
        stroke="var(--brand)"
        strokeOpacity="0.9"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* red dot with a soft pulsing glow */}
      <circle
        className="anim-s2-glow"
        cx="366"
        cy="840.7"
        r="4.5"
        fill="#ee1218"
        filter="url(#s2-dot-blur)"
      />
      <circle cx="366" cy="840.7" r="2.6" fill="#ee1218" />
    </svg>
  );
}

/**
 * DESKTOP (>=1280) background decor — viewport-anchored (D2 §5.B).
 * display:none below the breakpoint (dk-only); inline SVG, aria-hidden,
 * pointer-events:none; sits behind everything (first child of the section).
 * Top/bottom mask fades keep the S1→S2 and S2→S3 seams invisible.
 */
function DecorDesktop() {
  return (
    <div aria-hidden className="s2-decor-dk dk-only pointer-events-none absolute inset-0">
      {/* LEFT group — anchored to the viewport's left edge (frame x0) */}
      <svg
        className="absolute left-0 top-0 h-full"
        style={{ width: "calc(240 * var(--d))" }}
        viewBox="0 0 240 1024"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="dk2-disc" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.62" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          {/* discs: fade in over the first 48d, out over the last 48d */}
          <linearGradient id="dk2-fade-disc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.047" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.953" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          {/* left curve: its top end exits the top edge → 16d fade */}
          <linearGradient id="dk2-fade-curve-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.0156" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <filter id="dk2-dot-blur" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <mask id="dk2-mask-disc-l">
            <rect width="240" height="1024" fill="url(#dk2-fade-disc)" />
          </mask>
          <mask id="dk2-mask-curve-l">
            <rect width="240" height="1024" fill="url(#dk2-fade-curve-l)" />
          </mask>
        </defs>
        {/* pale disc, top-left (center beyond the left edge) */}
        <circle cx="-45.4" cy="85" r="114.4" fill="url(#dk2-disc)" mask="url(#dk2-mask-disc-l)" />
        {/* pale disc, bottom-left */}
        <circle cx="-45" cy="1055" r="215" fill="url(#dk2-disc)" mask="url(#dk2-mask-disc-l)" />
        {/* thin red curve: (0,~92) → dot (127,92) → exits top (225,0) */}
        <path
          d="M0 92.5 C30 99 50 101.5 75 100.5 C105 99 130 88 160 76 C185 62 205 35 224.5 0"
          stroke="var(--brand)"
          strokeOpacity="0.9"
          strokeWidth="1.2"
          strokeLinecap="round"
          mask="url(#dk2-mask-curve-l)"
        />
        <circle className="anim-s2-glow" cx="127" cy="92" r="6" fill="#ee1218" filter="url(#dk2-dot-blur)" />
        <circle cx="127" cy="92" r="3.4" fill="#ee1218" />
      </svg>
      {/* RIGHT group — anchored to the viewport's right edge (local x = frame − (vw−280d)) */}
      <svg
        className="absolute right-0 top-0 h-full"
        style={{ width: "calc(280 * var(--d))" }}
        viewBox="0 0 280 1024"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="dk2-fade-disc-r" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.047" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          {/* right curve: enters the bottom edge → 24d fade-out */}
          <linearGradient id="dk2-fade-curve-r" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.9766" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="dk2-mask-disc-r">
            <rect width="280" height="1024" fill="url(#dk2-fade-disc-r)" />
          </mask>
          <mask id="dk2-mask-curve-r">
            <rect width="280" height="1024" fill="url(#dk2-fade-curve-r)" />
          </mask>
        </defs>
        {/* pale disc, top-right (center beyond the top-right corner) */}
        <circle cx="314" cy="-140" r="245" fill="url(#dk2-disc)" mask="url(#dk2-mask-disc-r)" />
        {/* thin red curve: bottom (1271,1024) → dot (1497,899) → right edge (1536,888) */}
        <path
          d="M15 1024 C40 1008 60 996 74 987 C110 964 140 948 164 936 C195 921 225 905 241 899 C255 894 268 891 280 888"
          stroke="var(--brand)"
          strokeOpacity="0.9"
          strokeWidth="1.2"
          strokeLinecap="round"
          mask="url(#dk2-mask-curve-r)"
        />
        <circle
          className="anim-s2-glow"
          style={{ animationDelay: "1.2s" }}
          cx="241"
          cy="899"
          r="6"
          fill="#ee1218"
          filter="url(#dk2-dot-blur)"
        />
        <circle cx="241" cy="899" r="3.4" fill="#ee1218" />
      </svg>
    </div>
  );
}

export function Scroll2() {
  const rootRef = useRef<HTMLElement | null>(null);
  const openChat = useUI((s) => s.openChat);
  const openSupport = useUI((s) => s.openSupport);

  // reveal each step once ~25% visible (no-op without JS: everything stays visible)
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll<HTMLElement>(".s2-reveal");
    if (!els || !els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.25 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      id="scroll-2"
      aria-labelledby="s2-title"
      className="s2-root relative overflow-hidden"
      style={{
        height: px(875),
        // one continuous background: bridge from Scroll 1's page bg (C1) into
        // this section's own bg (C2), then a subtle drift toward the wave.
        background:
          "linear-gradient(180deg, rgba(238,242,245,0) 0%, rgba(238,242,245,0.55) 9.2%, #eef2f5 18.3%, #f0f4f6 50%, #eff3f6 82%, #eef2f5 100%)",
      }}
    >
      <DecorDesktop />
      <Wave />
      <div className="s2-container relative mx-auto h-full max-w-[28.125rem]">
        <Decor />
        <SectionTitle />
        <ol role="list" className="list-none">
          {steps.map((st, i) => (
            <StepItem
              key={st.n}
              step={st}
              index={i}
              onChat={() => openChat()}
              onSupport={() => openSupport()}
            />
          ))}
        </ol>
        <RedCurve />
      </div>
    </section>
  );
}
