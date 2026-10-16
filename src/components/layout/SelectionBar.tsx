"use client";

import { useRouter } from "next/navigation";
import { useSelection } from "@/lib/selection";
import { content } from "@/data/content";
import { toFa } from "@/lib/format";

/**
 * Floating brand CTA that slides up just above the chat bar
 * when at least one product card is selected.
 */
export function SelectionBar() {
  const items = useSelection((s) => s.items);
  const router = useRouter();
  const visible = items.length > 0;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center"
      aria-hidden={!visible}
    >
      <button
        type="button"
        tabIndex={visible ? 0 : -1}
        onClick={() => router.push(`/quote?items=${items.join(",")}`)}
        className="
          dk-select
          pointer-events-auto mb-[calc(4.3125rem+env(safe-area-inset-bottom))] w-[calc(100%-2.375rem)] max-w-[25.75rem]
          rounded-[0.875rem] bg-brand py-3 text-[0.9375rem] font-bold text-white shadow-[0_14px_30px_-10px_rgba(252,27,55,0.55)]
          transition-all duration-200 active:scale-[0.98]
        "
        style={{
          transform: visible ? "translateY(0)" : "translateY(0.75rem)",
          opacity: visible ? 1 : 0,
        }}
      >
        {content.selectionBar(toFa(items.length))}
      </button>
    </div>
  );
}
