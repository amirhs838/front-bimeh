"use client";

import {
  SheetRoot,
  SheetPortal,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetCloseButton,
} from "./sheet-primitives";
import { Headset, Sparkles, Wordmark } from "@/components/icons";
import { content } from "@/data/content";
import { site } from "@/data/site";
import { useUI } from "@/lib/ui-store";

/** Bottom sheet with support contact channels. */
export function SupportSheet() {
  const open = useUI((s) => s.supportOpen);
  const setOpen = (v: boolean) =>
    v ? useUI.getState().openSupport() : useUI.getState().closeSupport();
  const openChat = useUI((s) => s.openChat);

  return (
    <SheetRoot open={open} onOpenChange={setOpen}>
      <SheetPortal>
        <SheetContent
          className="
            inset-x-0 bottom-0 mx-auto max-w-[28.125rem] rounded-t-[1.25rem] px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4
            data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full
            data-[state=open]:duration-300 data-[state=closed]:duration-200
          "
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#dde3ec]" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-tint text-brand">
                <Headset className="h-5 w-5" />
              </span>
              <div>
                <SheetTitle className="text-[1.0625rem] font-bold text-ink">
                  {content.support.title}
                </SheetTitle>
                <SheetDescription className="text-[0.75rem] text-[#7d879a]">
                  {content.support.desc}
                </SheetDescription>
              </div>
            </div>
            <SheetCloseButton label={content.support.closeAria} />
          </div>

          <div className="mt-5 flex flex-col gap-2.5">
            <a
              href={site.phone.href}
              className="flex items-center gap-3 rounded-xl border border-[#edf0f5] bg-[#f8fafc] p-3.5 transition-colors hover:bg-brand-tint/60"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
                <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="currentColor" aria-hidden>
                  <path d="M4.1 2.4c.5-.5 1.3-.5 1.8 0l2 2c.5.5.5 1.3 0 1.8l-.9.9a.8.8 0 0 0-.15.95 11 11 0 0 0 4.3 4.3c.3.16.68.1.95-.15l.9-.9c.5-.5 1.3-.5 1.8 0l2 2c.5.5.5 1.3 0 1.8l-1 1c-.9.9-2.2 1.2-3.4.8-2.3-.8-4.5-2.2-6.4-4.1S2.5 9 1.7 6.7c-.4-1.2-.1-2.5.8-3.4l1-1Z" />
                </svg>
              </span>
              <span className="flex flex-col">
                <span className="text-[0.875rem] font-bold text-ink">{content.support.call}</span>
                <span dir="ltr" className="text-right text-[0.8125rem] font-medium text-[#7d879a]">
                  {site.phone.display}
                </span>
              </span>
            </a>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openChat();
              }}
              className="flex items-center gap-3 rounded-xl border border-[#edf0f5] bg-[#f8fafc] p-3.5 text-right transition-colors hover:bg-brand-tint/60"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
                <Sparkles className="h-4.5 w-4.5" />
              </span>
              <span className="text-[0.875rem] font-bold text-ink">
                {content.support.chatWithAI}
              </span>
            </button>

            <div className="flex items-center gap-3 rounded-xl border border-[#edf0f5] bg-[#f8fafc] p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
                <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" aria-hidden>
                  <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="m3 6 7 5 7-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <span className="flex flex-col">
                <span dir="ltr" className="text-[0.8125rem] font-medium text-[#5a6474]">
                  {site.email}
                </span>
                <span className="text-[0.6875rem] text-[#98a2b3]">{site.hours}</span>
              </span>
            </div>
          </div>

          <p className="mt-4 text-center text-[0.625rem] leading-4 text-[#a3adbd]">
            اطلاعات تماس بالا نمونه هستند و باید در تنظیمات سایت (data/site.ts) جایگزین شوند.
          </p>
        </SheetContent>
      </SheetPortal>
    </SheetRoot>
  );
}
