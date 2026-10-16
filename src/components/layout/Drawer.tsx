"use client";

import Link from "next/link";
import {
  SheetRoot,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetTitle,
  SheetCloseButton,
} from "./sheet-primitives";
import { LogoTile, Wordmark } from "@/components/icons";
import { content } from "@/data/content";
import { site } from "@/data/site";
import { useUI } from "@/lib/ui-store";

/** RTL slide-in navigation drawer (from the right edge). */
export function Drawer() {
  const open = useUI((s) => s.drawerOpen);
  const setOpen = (v: boolean) => (v ? useUI.getState().openDrawer() : useUI.getState().closeDrawer());

  return (
    <SheetRoot open={open} onOpenChange={setOpen}>
      <SheetPortal>
        <SheetOverlay />
        <SheetContent
          aria-label={content.drawer.title}
          className="
            dk-drawer
            inset-y-0 right-0 flex w-[min(80%,20rem)] flex-col overflow-y-auto rounded-l-[1.25rem]
            px-6 pb-8 pt-5 shadow-[-16px_0_40px_-20px_rgba(60,80,120,0.35)]
            data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right
            data-[state=open]:duration-300 data-[state=closed]:duration-200
          "
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoTile size={30} radius={9} />
              <Wordmark size={18} />
            </div>
            <SheetCloseButton label={content.drawer.closeAria} />
          </div>

          <SheetTitle className="sr-only">{content.drawer.title}</SheetTitle>

          <nav className="mt-6 flex flex-col">
            {site.nav.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between py-3.5 text-[0.9375rem] font-medium text-ink transition-colors hover:text-brand ${
                  i > 0 ? "border-t border-[#edf0f5]" : ""
                }`}
              >
                {item.label}
                <svg viewBox="0 0 8 14" className="h-3 w-2 text-[#b6bfcc]" fill="none" aria-hidden>
                  <path
                    d="M7 1 1.4 7 7 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ))}
          </nav>

          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="mt-6 flex h-11 items-center justify-center rounded-xl bg-brand text-[0.9375rem] font-bold text-white shadow-[0_8px_20px_-8px_rgba(252,27,55,0.55)] transition-transform active:scale-[0.98]"
          >
            {content.header.register}
          </Link>
        </SheetContent>
      </SheetPortal>
    </SheetRoot>
  );
}
