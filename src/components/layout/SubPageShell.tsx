"use client";

import Link from "next/link";
import { Header } from "./Header";
import { ChevronRight } from "@/components/icons";

/** Simpler chrome for sub-pages: sticky header + back row, no chat bar. */
export function SubPageShell({
  title,
  backHref = "/",
  children,
}: {
  title: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-[100svh] max-w-[28.125rem] px-[1.1875rem] pb-16">
        <div className="flex items-center gap-3 pb-5 pt-4">
          <Link
            href={backHref}
            aria-label="بازگشت"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#3c4654] shadow-[0_2px_10px_rgba(70,90,140,0.10)] transition-transform active:scale-95"
          >
            <ChevronRight className="h-3.5 w-2" />
          </Link>
          <h1 className="text-[1.0625rem] font-extrabold text-ink">{title}</h1>
        </div>
        {children}
      </main>
    </>
  );
}
