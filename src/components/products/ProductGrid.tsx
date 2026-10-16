"use client";

import { ProductCard } from "./ProductCard";
import { productBySlug, rows } from "@/data/products";
import { px } from "@/lib/format";

/**
 * Scroll-1 product grid: two full-width rows, then three half rows.
 * Row heights and vertical gaps replicate the reference exactly.
 * RTL: the first DOM item of each half row renders on the right.
 */
const ROW_GAPS = [5.5, 6, 9, 9, 7]; // gap above each row (row 1 gap is to the hero)

export function ProductGrid() {
  return (
    <div id="products" className="pl-[1.1875rem] pr-[1.21875rem]">
      <div
        dir="ltr"
        className="pg-root mx-auto flex max-w-[28.125rem] flex-col"
      >
        {rows.map((row, i) => (
          <div
            key={i}
            dir="rtl"
            className={
              row.kind === "half"
                ? "pg-row grid grid-cols-[12.53125rem_12.78125rem] gap-x-[0.40625rem]"
                : "pg-row block"
            }
            style={{ marginTop: px(ROW_GAPS[i]), height: px(row.height) }}
          >
            {row.items.map((slug) => {
              const product = productBySlug(slug);
              if (!product) return null;
              return (
                <ProductCard
                  key={slug}
                  product={product}
                  height={row.height}
                  titleTop={row.titleTop}
                  subTop={row.subTop}
                  bandTop={row.bandTop}
                  badgeTop={row.badgeTop}
                  badgeSmall={row.badgeSmall}
                  half={row.kind === "half"}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
