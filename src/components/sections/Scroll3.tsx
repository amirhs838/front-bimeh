"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { content } from "@/data/content";
import { features, S3_TITLE_LH, S3_DESC_LH, type S3Feature } from "@/data/features";
import { useUI } from "@/lib/ui-store";
import { px } from "@/lib/format";
import { S3FeatureIcon } from "./s3-icons";

/**
 * Scroll 3 — "معرفی + ویژگی‌ها" (reference: 3.jpg, 450x929 frame).
 * Hero photo is MODE B: the iOS notification banner is baked into the raster;
 * a real hotspot button over it opens the ChatSheet seeded with the
 * notification text as the first assistant message.
 * Everything is absolutely positioned in design units on a 929u-tall stage so
 * the section renders pixel-exact and scales proportionally with the root
 * font-size. The top 57u are a plain safe zone carrying the color bridge from
 * Scroll 2's wave (--s2-bottom-bg) into this section's lighter bg.
 */

/** Hero photo card (x18-432, y57-357) + baked banner hotspot + sr-only copy.
 *  DESKTOP (>=1280): the SAME element becomes the D3 hero-art box (full
 *  phone render, x110-760/y84-560 of the D3 frame) — the raster swaps via a
 *  media-gated <picture> source (no cross-download), the card chrome is
 *  reset inside the desktop media query (.s3-hero). */
function HeroPhoto({ onChat }: { onChat: () => void }) {
  const n = content.intro.notif;
  return (
    <div
      className="s3-hero s3-fade absolute overflow-hidden"
      style={{
        top: px(57),
        left: px(18),
        width: px(414),
        height: px(300),
        borderRadius: px(10),
        background: "var(--s3-photo-bg)",
      }}
    >
      <picture>
        {/* desktop art — fetched only at >=1280 (media-gated source) */}
        <source
          media="(min-width: 1280px)"
          srcSet="/img/s3d-hero.webp"
          width={1300}
          height={952}
        />
        <Image
          src="/img/s3-hero.webp"
          alt={content.intro.heroAlt}
          width={828}
          height={600}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      {/* notification copy for screen readers / SEO (banner is in the raster) */}
      <span className="sr-only">
        {`${n.app} — ${n.time} — ${n.lines.join(" ")}`}
      </span>
      {/* hotspot over the baked banner (>=44px hit area at every width);
          desktop position = % of the D3 art box (banner x294-600, y332-427) */}
      <button
        type="button"
        aria-label={content.why.chatHotspotAria}
        onClick={onChat}
        className="s3-hotspot absolute cursor-pointer rounded-[0.75rem]"
        style={{
          left: px(87),
          top: px(175.5),
          width: px(241),
          height: px(69),
          ...( { "--dkhl": "28.308%", "--dkht": "52.101%", "--dkhw": "47.077%", "--dkhh": "19.958%" } as React.CSSProperties),
        }}
      />
    </div>
  );
}

/** Red eyebrow with two short flanking rules, centered (cy 382.5).
 *  DESKTOP (D3): group box x924-1150, cy 221 — geometry via .s3-eyebrow. */
function SectionEyebrow() {
  return (
    <p
      className="s3-eyebrow s3-reveal absolute inset-x-0 flex items-center justify-center whitespace-nowrap font-bold text-brand"
      style={{
        top: px(374.5),
        height: px(17),
        fontSize: px(11.8),
        lineHeight: px(17),
        transitionDelay: "120ms",
      }}
    >
      <span
        aria-hidden
        className="rounded-full bg-brand"
        style={{ width: px(13), height: px(1.5), marginInlineEnd: px(7) }}
      />
      {content.intro.eyebrow}
      <span
        aria-hidden
        className="rounded-full bg-brand"
        style={{ width: px(13), height: px(1.5), marginInlineStart: px(7) }}
      />
    </p>
  );
}

/** Two-line heading; "AI" is the heavy Latin wordmark in brand red (cy ~451.5).
 *  DESKTOP (D3): L1 fits 581p @cy286; L2 = AI (left, w66) + دارای (right,
 *  w105) centered on its own measured center — geometry via .s3-heading. */
function SectionHeading() {
  return (
    <h2
      id="s3-title"
      className="s3-heading s3-reveal absolute inset-x-0 text-center"
      style={{ top: px(405.2), transitionDelay: "200ms" }}
    >
      <span
        className="s3-h-l1 block whitespace-nowrap text-s2-title"
        style={{
          fontSize: px(20.1),
          fontWeight: 900,
          lineHeight: px(23.4),
          fontFamily: "var(--font-app), Estedad, Vazirmatn, sans-serif",
        }}
      >
        {content.intro.headingL1}
      </span>
      <span
        className="s3-h-row flex items-center justify-center"
        style={{ marginTop: px(5.7), height: px(34) }}
      >
        <span
          className="s3-h-fa whitespace-nowrap text-s2-title"
          style={{
            fontSize: px(23.87),
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: "var(--font-app), Estedad, Vazirmatn, sans-serif",
          }}
        >
          {content.intro.headingWord}
        </span>
        <span
          className="s3-h-latin font-wordmark inline-block whitespace-nowrap text-brand"
          style={{
            fontSize: px(31.5),
            fontWeight: 800,
            lineHeight: 1,
            marginInlineStart: px(6.2),
            transform: `translateY(${px(-3.6)}) scaleX(0.865)`,
            transformOrigin: "left center",
          }}
        >
          {content.intro.headingLatin}
        </span>
      </span>
    </h2>
  );
}

/** DESKTOP-ONLY CTA (D3 x986-1121, y429-475) — display:none below 1280.
 *  Same route as the header pill; hover per master prompt §8. */
function DesktopCta() {
  return (
    <a
      href="/register"
      className="s3-dk-cta s3-reveal absolute"
      style={{ transitionDelay: "140ms" }}
    >
      {content.header.register}
    </a>
  );
}

/** One feature card: icon tile (right) + right-aligned title + 2 nowrap lines.
 *  DESKTOP (D3): the li/tile are re-geometry'd via --dk-* vars and the
 *  mobile text block is replaced by a desktop one (title right edge and
 *  description right edge DIFFER in D3 — two separately positioned blocks). */
function FeatureCard({ f, index }: { f: S3Feature; index: number }) {
  const copy = content.intro.cards[index];
  const titleTop = f.titleCy - S3_TITLE_LH / 2;
  const descMarginTop = f.descCys[0] - S3_DESC_LH / 2 - (titleTop + S3_TITLE_LH);
  const gapLH = f.descCys[1] - f.descCys[0] - S3_DESC_LH;
  const descSizes = [f.descSizeL1, f.descSizeL2];
  const dk = f.dk;
  const descPitch = dk.desc.cy2 - dk.desc.cy1;

  return (
    <li
      className="s3-card s3-reveal absolute list-none"
      style={{
        top: px(f.top),
        left: px(18),
        width: px(414),
        height: px(f.height),
        background: "var(--s3-card-bg)",
        borderRadius: px(10),
        boxShadow: "0 4px 16px rgba(60,80,130,0.06)",
        transitionDelay: `${250 + index * 70}ms`,
        ...( {
          "--dkx": dk.box.x,
          "--dky": dk.box.y,
          "--dkw": dk.box.w,
          "--dkh": dk.box.h,
          "--dk-tr": dk.tile.right,
          "--dk-tt": dk.tile.top,
          "--dk-tw": dk.tile.w,
          "--dk-th": dk.tile.h,
          "--dk-iw": dk.icon.w,
          "--dk-ih": dk.icon.h,
          "--dk-tr2": dk.title.right,
          "--dk-tcy": dk.title.cy,
          "--dk-tlh": dk.title.lh,
          "--dk-tfs": dk.title.fs,
          "--dk-dr": dk.desc.right,
          "--dk-dcy1": dk.desc.cy1,
          "--dk-dcy2": dk.desc.cy2,
          "--dk-dlh": descPitch,
          "--dk-dfs1": dk.desc.fs1,
          "--dk-dfs2": dk.desc.fs2,
        } as React.CSSProperties),
      }}
    >
      {/* icon tile — 12u from the card's right edge (desktop: .s3-dk-tile) */}
      <div
        className="s3-dk-tile absolute flex items-center justify-center"
        style={{
          right: px(f.tile.right),
          top: px(f.tile.top),
          width: px(f.tile.w),
          height: px(f.tile.h),
          background: "var(--s3-icon-tile)",
          borderRadius: px(10),
        }}
      >
        <S3FeatureIcon name={f.icon} />
      </div>

      {/* text block — right-aligned, 2 description lines with exact breaks */}
      <div
        className="s3-m-text absolute text-right"
        style={{ right: px(f.textRight), top: px(titleTop) }}
      >
        <h3
          className="whitespace-nowrap font-bold text-s3-card-title"
          style={{ fontSize: px(f.titleSize), lineHeight: px(S3_TITLE_LH) }}
        >
          {copy.title}
        </h3>
        <p
          className="text-s3-card-desc"
          style={{ marginTop: px(descMarginTop), fontWeight: 500 }}
        >
          {copy.lines.map((line, i) => (
            <span
              key={i}
              className="block whitespace-nowrap"
              style={{
                fontSize: px(descSizes[i]),
                lineHeight: px(S3_DESC_LH),
                marginTop: i > 0 ? px(gapLH) : undefined,
              }}
            >
              {line}
            </span>
          ))}
        </p>
      </div>

      {/* DESKTOP-ONLY text (D3 copy/breaks) — hidden below 1280; the mobile
          block above is hidden at >=1280, so exactly one is ever visible */}
      <h3 className="s3-dk-title whitespace-nowrap">{dk.titleDk}</h3>
      <p className="s3-dk-desc">
        {dk.linesDk.map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </p>
    </li>
  );
}

export function Scroll3() {
  const rootRef = useRef<HTMLElement | null>(null);
  const openChat = useUI((s) => s.openChat);

  // reveal once ~25% visible (no-op without JS: everything stays visible)
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll<HTMLElement>(".s3-reveal, .s3-fade");
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
      id="scroll-3"
      aria-labelledby="s3-title"
      className="relative overflow-x-clip"
      style={{ background: "var(--s3-bg)", paddingBottom: "var(--footer-gap)" }}
    >
      {/* bridge from Scroll 2's wave end into this section's lighter bg
          (top 57u safe zone) + the reference's 1-2% vertical drift */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: px(929),
          background: `linear-gradient(180deg, var(--s2-bottom-bg) 0%, #edf1f4 ${px(28)}, #f5f8fb ${px(57)}, #f3f6f9 25%, #f2f6f9 60%, #f3f7fa 85%, #f4f8fa 100%)`,
        }}
      />

      <div className="s3-frame relative mx-auto max-w-[28.125rem]" style={{ height: px(929) }}>
        <HeroPhoto
          onChat={() =>
            openChat(content.intro.notif.lines.join(" "), "bot")
          }
        />
        <SectionEyebrow />
        <SectionHeading />
        <DesktopCta />
        <ul role="list" className="list-none">
          {features.map((f, i) => (
            <FeatureCard key={f.n} f={f} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
