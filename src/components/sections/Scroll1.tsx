"use client";

import { HeroBanner } from "@/components/hero/HeroBanner";
import { ProductGrid } from "@/components/products/ProductGrid";

/**
 * Scroll 1 — the first viewport of the Bimeh AI site (reference: 1.jpg).
 * Scroll 2 & 3 will be dropped into the #scroll-2 / #scroll-3 anchors in app/page.tsx.
 */
export function Scroll1() {
  return (
    <section
      aria-label="بیمه شو — سکشن اصلی"
      className="min-h-[100svh] pb-[calc(4.5rem+env(safe-area-inset-bottom))]"
    >
      <HeroBanner />
      <ProductGrid />
    </section>
  );
}
