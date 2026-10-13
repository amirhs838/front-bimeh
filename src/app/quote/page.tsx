"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SubPageShell } from "@/components/layout/SubPageShell";
import { content } from "@/data/content";
import { productBySlug } from "@/data/products";
import { useSelection } from "@/lib/selection";
import { toFa } from "@/lib/format";

function QuoteContent() {
  const params = useSearchParams();
  const itemsParam = params.get("items") ?? "";
  const slugs = itemsParam.split(",").filter(Boolean);
  const clear = useSelection((s) => s.clear);
  const items = slugs.map(productBySlug).filter(Boolean);

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && (
        <p className="rounded-2xl border border-white/90 bg-white/72 p-6 text-center text-[0.8125rem] leading-7 text-[#5a6474] backdrop-blur-[3px]">
          {content.quote.empty}
        </p>
      )}

      {items.map((p) => (
        <div
          key={p!.slug}
          className="flex items-center gap-3 rounded-2xl border border-white/90 bg-white/72 p-3 shadow-[0_2px_12px_rgba(70,90,140,0.06)] backdrop-blur-[3px]"
        >
          <span className="flex h-14 w-16 items-center justify-center rounded-xl bg-band">
            <Image
              src={p!.illu.src}
              alt=""
              width={Math.round(p!.illu.w * 2)}
              height={Math.round(p!.illu.h * 2)}
              style={{ width: p!.illu.w, height: "auto" }}
            />
          </span>
          <span className="flex flex-col">
            <span className="text-[0.875rem] font-extrabold text-ink">{p!.title}</span>
            <span className="text-11 text-sub">{p!.subtitle}</span>
          </span>
          {p!.badge && (
            <span className="mr-auto flex h-[1.375rem] items-center rounded-full bg-brand px-2.5 text-[0.625rem] font-bold text-white">
              {content.badge}
            </span>
          )}
        </div>
      ))}

      {items.length > 0 && (
        <button
          type="button"
          onClick={() => {
            clear();
            window.alert(content.quote.done);
          }}
          className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-brand text-[0.9375rem] font-bold text-white shadow-[0_12px_26px_-10px_rgba(252,27,55,0.55)] transition-transform active:scale-[0.98]"
        >
          {content.quote.submit} ({toFa(items.length)})
        </button>
      )}

      <Link
        href="/"
        className="mt-1 flex h-11 w-full items-center justify-center rounded-xl border border-[#e4e8ee] bg-white/70 text-[0.875rem] font-bold text-ink"
      >
        {content.quote.back}
      </Link>
    </div>
  );
}

export default function QuotePage() {
  return (
    <SubPageShell title={content.quote.title} backHref="/">
      <Suspense fallback={null}>
        <QuoteContent />
      </Suspense>
    </SubPageShell>
  );
}
