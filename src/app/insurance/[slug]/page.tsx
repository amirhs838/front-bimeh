import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { SubPageShell } from "@/components/layout/SubPageShell";
import { Sparkles } from "@/components/icons";
import { content } from "@/data/content";
import { productBySlug, products } from "@/data/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  return { title: product ? `${product.title} | بیمه شو` : "بیمه شو" };
}

/** Stub page for a single insurance product. */
export default async function InsurancePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  return (
    <SubPageShell title={product.title} backHref="/">
      <div className="flex flex-col items-center rounded-2xl border border-white/90 bg-white/72 p-8 shadow-[0_2px_12px_rgba(70,90,140,0.06)] backdrop-blur-[3px]">
        <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-xl bg-band">
          <Image
            src={product.illu.src}
            alt=""
            width={Math.round(product.illu.w * 2)}
            height={Math.round(product.illu.h * 2)}
            style={{ width: product.illu.w * 1.6, height: "auto" }}
          />
        </div>
        <p className="mt-4 text-[0.8125rem] font-medium text-sub">{product.subtitle}</p>
        {product.badge && (
          <span className="mt-3 flex h-[1.375rem] items-center rounded-full bg-brand px-3 text-[0.6875rem] font-bold text-white">
            {content.badge}
          </span>
        )}
        <h2 className="mt-5 text-[0.9375rem] font-extrabold text-ink">
          {content.insurance.soonTitle}
        </h2>
        <p className="mt-2 max-w-[17rem] text-center text-[0.75rem] leading-6 text-[#5a6474]">
          {content.insurance.soonDesc}
        </p>
        <a
          href="/"
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-[0.9375rem] font-bold text-white shadow-[0_10px_22px_-8px_rgba(252,27,55,0.55)]"
        >
          <Sparkles className="h-4 w-4" />
          {content.insurance.askAI}
        </a>
      </div>
    </SubPageShell>
  );
}
