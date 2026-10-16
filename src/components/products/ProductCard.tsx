"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Check } from "@/components/icons";
import { content } from "@/data/content";
import { dkIllus } from "./dk-illus";
import type { Product } from "@/data/products";
import { dkProducts } from "@/data/products";
import { useSelection } from "@/lib/selection";
import { px } from "@/lib/format";

/**
 * One product card: checkbox tab (top-left), optional installment badge
 * (top-right), illustration band artwork, centered title + subtitle, and
 * (full cards) the bottom info strip.
 *
 * Structure: the card is a <div>; a transparent overlay <Link> handles
 * navigation to /insurance/{slug}, while the real <input type=checkbox>
 * sits in a higher layer so its clicks never touch the link.
 *
 * DESKTOP (>=1280): the same DOM is re-laid-out via per-card CSS variables
 * (--dk-*, from data/products.ts dkProducts, measured on the D1 frame).
 * The mobile raster band is swapped for the desktop line-art SVG
 * (.pc-dk-band is display:none below the breakpoint; .pc-band-img above it).
 */
export function ProductCard({
  product,
  height,
  titleTop,
  subTop,
  bandTop,
  badgeTop,
  badgeSmall,
  half = false,
}: {
  product: Product;
  height: number;
  titleTop: number;
  subTop: number;
  bandTop: number;
  badgeTop: number;
  badgeSmall: boolean;
  half?: boolean;
}) {
  const checked = useSelection((s) => s.items.includes(product.slug));
  const toggle = useSelection((s) => s.toggle);
  const dk = dkProducts[product.slug];
  const dkIllu = dkIllus[product.slug];

  /* DESKTOP geometry vars (d units) — inert on mobile (consumed only inside
     the @media (min-width:1280px) block in globals.css) */
  const dkVars = {
    "--dk-area": dk.area,
    "--dk-band-l": dk.band.left,
    "--dk-band-r": dk.band.right,
    "--dk-band-t": dk.band.top,
    "--dk-band-h": dk.band.height,
    "--dk-illu-w": dk.illu.w,
    "--dk-illu-h": dk.illu.h,
    "--dk-title-t": dk.titleCenter - dk.titleSize * 0.62 + 2,
    "--dk-title-fs": dk.titleSize,
    "--dk-sub-t": dk.subCenter - dk.subSize * 0.62,
    "--dk-sub-fs": dk.subSize,
    ...(dk.badge
      ? {
          "--dk-badge-t": dk.badge.top,
          "--dk-badge-r": dk.badge.right,
          "--dk-badge-w": dk.badge.w,
          "--dk-badge-h": dk.badge.h,
          "--dk-badge-fs": dk.badge.font,
        }
      : {}),
    ...(dk.strip
      ? {
          "--dk-strip-t": dk.strip.top,
          "--dk-strip-h": dk.strip.height,
          "--dk-strip-fs": dk.strip.font,
        }
      : {}),
    ...(dk.cx ? { "--dk-cx": dk.cx } : {}),
  } as CSSProperties;

  return (
    <div
      aria-label={product.title}
      data-slug={product.slug}
      dir="rtl"
      className={`
        pc-card group relative block overflow-hidden rounded-[0.875rem] border
        transition-all duration-150 ease-out
        hover:-translate-y-[1px] hover:shadow-[0_8px_22px_-6px_rgba(70,90,140,0.16)]
        active:scale-[0.985]
        ${
          checked
            ? "border-brand bg-brand-tint/85 shadow-[0_2px_12px_rgba(252,27,55,0.10)]"
            : "border-white/90 bg-white/55 shadow-[0_2px_12px_rgba(70,90,140,0.06),inset_0_1px_0_rgba(255,255,255,0.85)]"
        }
      `}
      style={{ height: px(height), ...dkVars }}
      data-checked={checked || undefined}
    >
      {/* checkbox tab (physically top-left, like the reference) */}
      <span
        aria-hidden
        className="pc-tab absolute bg-[#fdfdfe]"
        style={{
          left: px(-1),
          top: px(-1),
          width: px(33),
          height: px(30),
          borderRadius: `${px(14)} 0 ${px(10)} 0`,
          boxShadow: "2px 2px 6px rgba(70,90,140,0.05)",
        }}
      />

      {/* illustration stage — MOBILE: exact-pixel band artwork from the
          reference (corners baked into the asset); DESKTOP: CSS band +
          line-art SVG (swapped inside the desktop media query) */}
      <Image
        src={product.band.src}
        alt=""
        width={Math.round(product.band.w * 2)}
        height={Math.round(product.band.h * 2)}
        className="pc-band-img absolute"
        style={{ left: px(9), top: px(bandTop), width: px(product.band.w), height: px(product.band.h) }}
      />
      <span aria-hidden className="pc-dk-band dk-only">
        {dkIllu && (
          <Image
            src={dkIllu.src}
            alt=""
            width={dkIllu.w * 2}
            height={dkIllu.h * 2}
            className="pc-dk-illu"
          />
        )}
      </span>

      {/* installment badge (top-right, above the stage) */}
      {product.badge && (
        <span
          className="pc-badge absolute z-[5] flex items-center justify-center whitespace-nowrap rounded-full bg-brand text-white"
          style={{
            top: px(badgeTop),
            right: px(badgeSmall ? 6 : 5.5),
            height: px(badgeSmall ? 12.5 : 14.5),
            padding: `0 ${px(badgeSmall ? 3.5 : 4)}`,
            fontSize: px(badgeSmall ? 7.6 : 8.4),
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {content.badge}
        </span>
      )}

      {/* title + subtitle (positions measured per row; ref text column sits +1.5px right) */}
      <span
        className="pc-title absolute inset-x-0 whitespace-nowrap text-center font-semibold text-ink"
        style={{ top: px(titleTop), fontSize: px(11.5), lineHeight: 1.1, transform: "translateX(1.5px)" }}
      >
        {product.title}
      </span>
      <span
        className="pc-sub absolute inset-x-0 whitespace-nowrap text-center font-normal text-sub"
        style={{ top: px(subTop), fontSize: px(8), lineHeight: 1.1, transform: "translateX(1.5px)" }}
      >
        {product.subtitle}
      </span>

      {/* info strip (full cards only) */}
      {product.strip && (
        <span
          className="pc-strip absolute flex items-center justify-center rounded-[0.375rem] bg-strip font-medium text-[#fa1226]"
          style={{
            left: px(9),
            right: px(9),
            bottom: px(2.5),
            height: px(18),
            fontSize: px(7.6),
            lineHeight: 1,
          }}
        >
          <span className="pc-strip-text whitespace-nowrap" style={{ transform: "translateX(2px)" }}>{product.strip}</span>
        </span>
      )}

      {/* navigation overlay (below the checkbox layer) */}
      <Link
        href={`/insurance/${product.slug}`}
        aria-label={product.title}
        className="absolute inset-0 z-10 rounded-[0.875rem] outline-none focus-visible:ring-2 focus-visible:ring-brand"
      />

      {/* checkbox + hit area (above the navigation overlay) */}
      <span
        className="pc-check-hit absolute z-20 cursor-pointer"
        style={{ left: px(-4), top: px(-6.5), padding: px(15) }}
        onClick={(e) => {
          // clicks landing on the wrapper (not the native input) still toggle —
          // keeps the expanded hit area working on desktop hit-targets
          if ((e.target as HTMLElement).tagName !== "INPUT") toggle(product.slug);
        }}
      >
        <input
          type="checkbox"
          data-checkbox={product.slug}
          checked={checked}
          onChange={() => toggle(product.slug)}
          aria-label={`انتخاب ${product.title}`}
          className={`
            pc-checkbox relative block h-[0.875rem] w-[0.875rem] cursor-pointer appearance-none rounded-[0.28125rem]
            border-2 bg-transparent transition-colors duration-150
            ${
              checked
                ? "border-brand bg-brand"
                : "border-[#4d586b] bg-transparent hover:border-brand/60"
            }
          `}
        />
        {checked && (
          <Check
            className="pc-check pointer-events-none absolute animate-[check-pop_0.18s_ease-out]"
            style={{
              left: px(15),
              top: px(15),
              width: px(14),
              height: px(14),
            }}
          />
        )}
      </span>
    </div>
  );
}
