"use client";

import { useRef, useState } from "react";
import { Sparkles, ChatDots } from "@/components/icons";
import { content } from "@/data/content";
import { useUI } from "@/lib/ui-store";
import { px } from "@/lib/format";

/**
 * Fixed AI chat bar (bottom). Enter or the send button opens the chat sheet
 * with the typed text as the first message; empty input just focuses the field.
 */
export function ChatBar() {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const openChat = useUI((s) => s.openChat);

  const submit = () => {
    const clean = text.trim();
    if (!clean) {
      inputRef.current?.focus();
      return;
    }
    openChat(clean);
    setText("");
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="
          dk-chatbar
          pointer-events-auto relative ml-[1.1875rem] mr-[1.21875rem] mb-[calc(1rem+env(safe-area-inset-bottom))] w-full max-w-[25.75rem]
          rounded-[0.875rem] border border-white/85 bg-white/45 shadow-[0_0_0_1px_rgba(255,255,255,0.5),0_0_26px_3px_rgba(252,27,55,0.12),0_12px_28px_-10px_rgba(70,90,140,0.16)]
          backdrop-blur-[10px]
        "
        style={{ height: px(43) }}
      >
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={content.chatBar.placeholder}
          aria-label={content.chatBar.placeholder}
          enterKeyHint="send"
          className="
            dk-chatbar-input
            absolute left-[0.5625rem] top-1/2 h-[2.1875rem] w-[21.3125rem] -translate-y-1/2 rounded-[0.6875rem]
            border-0 bg-white/80 pl-[2.1rem] text-ink-soft outline-none
            placeholder:text-placeholder
          "
          style={{ fontSize: px(11.5), paddingRight: px(14) }}
        />
        <Sparkles
          aria-label={content.chatBar.sparklesAria}
          className="dk-chatbar-sparkles pointer-events-none absolute left-[1.0625rem] top-1/2 -translate-y-1/2 text-brand"
          style={{ width: px(22.5), height: px(20.5) }}
        />
        <button
          type="submit"
          aria-label={content.chatBar.sendAria}
          className="
            dk-chatbar-send
            absolute right-[0.6875rem] top-[0.625rem] flex h-[1.6875rem] w-[2.3125rem] items-center justify-center
            rounded-[0.5rem] bg-brand text-white shadow-[0_6px_14px_-6px_rgba(252,27,55,0.6)]
            transition-transform active:scale-95
          "
        >
          <ChatDots className="dk-chatbar-dots h-[1.0625rem] w-[1.125rem]" />
        </button>
      </form>
    </div>
  );
}
