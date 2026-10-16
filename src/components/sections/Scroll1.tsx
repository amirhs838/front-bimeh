"use client";

import { HeroBanner } from "@/components/hero/HeroBanner";
import { ProductGrid } from "@/components/products/ProductGrid";

/**
 * Scroll 1 — the first viewport of the Bimeh AI site (reference: 1.jpg).
 * Scroll 2 & 3 will be dropped into the #scroll-2 / #scroll-3 anchors in app/page.tsx.
 *
 * Junction note: the section height follows its content (no min-h-[100svh] stretch).
 * Content scales with viewport WIDTH, so stretching to viewport HEIGHT left a large
 * dead gap above Scroll 2 on tall phones. A fixed 3.5rem tail keeps the
 * last-card → "چرا Bimeh AI" rhythm consistent (~97 design px) on every device.
 *
 * DESKTOP (>=1280): styled in globals.css (.s1-root) — proportional --d layout,
 * its own padding-bottom (40d + chat-bar clearance) and a continuous background
 * gradient ending at --s1-bottom-bg so the seam into the (still mobile-column)
 * Scroll 2 stays invisible.
 * TODO(desktop): Scroll 2/3/Footer desktop versions come later — until then they
 * keep rendering as the centered 480px mobile column on the continuous page bg.
 */
export function Scroll1() {
  return (
    <section
      aria-label="بیمه شو — سکشن اصلی"
      className="s1-root pb-[calc(3.5rem+env(safe-area-inset-bottom))]"
    >
      <HeroBanner />
      <ProductGrid />
    </section>
  );
}
