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
 */

/** Section heading: "چرا" on the right, Latin wordmark on the left (RTL bidi). */
function SectionTitle() {
  const idx = content.why.title.indexOf(site.latinName);
  const faPart = idx > 0 ? content.why.title.slice(0, idx) : "";
  return (
    <h2
      id="s2-title"
      className="s2-reveal absolute whitespace-nowrap font-black text-s2-title"
      style={{
        top: px(41),
        right: px(112),
        fontSize: px(36.5),
        lineHeight: 1,
        letterSpacing: "0",
      }}
    >
      <span
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
    <div aria-hidden className="pointer-events-none absolute inset-0">
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
 *  and its text block (reveal, 80ms after the illustration). */
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
  const { illu, hotspot } = step;
  const copy = content.why.steps[index];
  const titleTop = step.titleCenterY - TITLE_LH / 2;
  const descMarginTop =
    step.descYs[0] - DESC_LH / 2 - (titleTop + TITLE_LH);
  const gapLH = (i: number) => step.descYs[i] - step.descYs[i - 1] - DESC_LH;

  return (
    <li className="list-none">
      {/* illustration */}
      <div
        className="s2-reveal absolute"
        style={{
          left: px(illu.x),
          top: px(illu.y),
          width: px(illu.w),
          height: px(illu.h),
        }}
      >
        <div
          className="anim-s2-float relative h-full w-full"
          style={{ animationDelay: `${-(step.n - 1) * 1.4}s` }}
        >
          <Image
            src={illu.src}
            alt={content.why.alts[index]}
            width={illu.w * 2}
            height={illu.h * 2}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain"
          />
        </div>
        {hotspot && (
          <button
            type="button"
            aria-label={hotspot.aria}
            onClick={hotspot.action === "chat" ? onChat : onSupport}
            className="absolute cursor-pointer rounded-[0.75rem]"
            style={{
              left: px(hotspot.x - illu.x),
              top: px(hotspot.y - illu.y),
              width: px(hotspot.w),
              height: px(hotspot.h),
            }}
          />
        )}
      </div>

      {/* text block */}
      <div
        className="s2-reveal s2-reveal-text absolute text-right"
        style={{ right: px(450 - step.textRight), top: px(titleTop) }}
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
          className="text-s2-desc"
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
      className="pointer-events-none absolute inset-x-0 bottom-0 w-full"
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
      className="pointer-events-none absolute inset-x-0"
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
      className="relative overflow-hidden"
      style={{
        height: px(875),
        // one continuous background: bridge from Scroll 1's page bg (C1) into
        // this section's own bg (C2), then a subtle drift toward the wave.
        background:
          "linear-gradient(180deg, rgba(238,242,245,0) 0%, rgba(238,242,245,0.55) 9.2%, #eef2f5 18.3%, #f0f4f6 50%, #eff3f6 82%, #eef2f5 100%)",
      }}
    >
      <Wave />
      <div className="relative mx-auto h-full max-w-[28.125rem]">
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
