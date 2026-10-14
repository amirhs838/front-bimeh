"use client";

import { useEffect, useRef, useState } from "react";
import {
  SheetRoot,
  SheetPortal,
  SheetContent,
  SheetTitle,
  SheetCloseButton,
} from "./sheet-primitives";
import { LogoTile, Sparkles } from "@/components/icons";
import { content } from "@/data/content";
import { useUI } from "@/lib/ui-store";

type Msg = { id: number; role: "user" | "bot"; text: string; failed?: boolean };

let nextId = 1;

export function ChatSheet() {
  const open = useUI((s) => s.chatOpen);
  const seed = useUI((s) => s.chatSeed);
  const setOpen = (v: boolean) => (v ? useUI.getState().openChat() : useUI.getState().closeChat());

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const consumedSeed = useRef<string | null>(null);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || pending) return;
    const history = msgs.slice(-8).map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
    setMsgs((m) => [...m, { id: nextId++, role: "user", text: clean }]);
    setPending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, history }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data: { reply?: string } = await res.json();
      setMsgs((m) => [...m, { id: nextId++, role: "bot", text: data.reply ?? "…" }]);
    } catch {
      setMsgs((m) => [...m, { id: nextId++, role: "bot", text: clean, failed: true }]);
    } finally {
      setPending(false);
    }
  };

  // seed the conversation when opened from the chat bar / hero / notification
  useEffect(() => {
    if (open && seed && seed !== consumedSeed.current) {
      consumedSeed.current = seed;
      const role = useUI.getState().chatSeedRole;
      if (role === "bot") {
        // seeded assistant greeting (e.g. Scroll 3 notification hotspot) — no API call
        setMsgs((m) => [...m, { id: nextId++, role: "bot", text: seed }]);
      } else {
        void send(seed);
      }
      useUI.setState({ chatSeed: null });
    }
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [open, seed]);

  // keep the message list pinned to the bottom
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, pending]);

  const submit = () => {
    const text = input;
    if (!text.trim()) {
      inputRef.current?.focus();
      return;
    }
    setInput("");
    void send(text);
  };

  return (
    <SheetRoot open={open} onOpenChange={setOpen}>
      <SheetPortal>
        <SheetContent
          className="
            inset-x-0 bottom-0 top-0 mx-auto flex h-[100dvh] max-w-[28.125rem] flex-col !rounded-none bg-[#f3f6fb]
            data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full
            data-[state=open]:duration-300 data-[state=closed]:duration-200
          "
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* header */}
          <div className="flex items-center justify-between border-b border-[#e7ecf3] bg-white/80 px-4 pb-3 pt-[calc(0.875rem+env(safe-area-inset-top))] backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <LogoTile size={30} radius={9} />
              <SheetTitle className="text-[1rem] font-bold text-ink">
                {content.chat.title}
              </SheetTitle>
            </div>
            <SheetCloseButton label={content.chat.closeAria} />
          </div>

          {/* messages */}
          <div ref={listRef} className="chat-scroll flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
            {msgs.length === 0 && !pending && (
              <div className="mt-10 flex flex-col items-center gap-3 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-[0_10px_24px_-10px_rgba(252,27,55,0.5)]">
                  <Sparkles className="h-7 w-7" />
                </span>
                <p className="max-w-[16rem] text-[0.8125rem] font-medium leading-6 text-[#5a6474]">
                  سلام! من دستیار هوشمند بیمه شو هستم. هر سوالی درباره بیمه‌ها داری بپرس.
                </p>
              </div>
            )}

            {msgs.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-brand px-3.5 py-2.5 text-[0.8125rem] font-medium leading-6 text-white">
                    {m.text}
                  </div>
                </div>
              ) : m.failed ? (
                <div key={m.id} className="flex justify-start">
                  <div className="flex max-w-[80%] flex-col gap-1.5 rounded-2xl rounded-tr-md border border-[#f3c6cd] bg-[#fff3f4] px-3.5 py-2.5">
                    <span className="text-[0.8125rem] font-medium leading-6 text-[#b3324a]">
                      {content.chat.errorText}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMsgs((cur) => cur.filter((x) => x.id !== m.id));
                        void send(m.text);
                      }}
                      className="self-start rounded-lg bg-brand px-3 py-1 text-[0.75rem] font-bold text-white"
                    >
                      {content.chat.retry}
                    </button>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex justify-start">
                  <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-tl-md border border-[#e9edf4] bg-white px-3.5 py-2.5 text-[0.8125rem] font-medium leading-6 text-ink-soft shadow-[0_2px_10px_rgba(70,90,140,0.06)]">
                    {m.text}
                  </div>
                </div>
              )
            )}

            {pending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tr-md border border-[#e9edf4] bg-white px-4 py-3 shadow-[0_2px_10px_rgba(70,90,140,0.06)]" aria-label="در حال تایپ">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-[#98a2b3]"
                      style={{
                        animation: "typing-bounce 1.1s ease-in-out infinite",
                        animationDelay: `${i * 0.18}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* composer */}
          <div className="border-t border-[#e7ecf3] bg-white/85 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={content.chat.inputPlaceholder}
                enterKeyHint="send"
                className="h-10 flex-1 rounded-xl border border-[#e7ecf3] bg-white px-3.5 text-[0.8125rem] text-ink-soft outline-none transition-shadow placeholder:text-placeholder focus:shadow-[0_0_0_2px_rgba(252,27,55,0.15)]"
              />
              <button
                type="submit"
                aria-label={content.chat.sendAria}
                className="flex h-10 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-transform active:scale-95"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5 rotate-180" fill="currentColor" aria-hidden>
                  <path d="M2.3 9.1 16.5 2.6c.9-.4 1.8.5 1.4 1.4l-6.4 14.3c-.4.9-1.7.8-2-.1l-1.7-5.2a1 1 0 0 0-.6-.6L2 10.6c-.9-.3-1-1.1-.3-1.5Z" />
                </svg>
              </button>
            </form>
          </div>
        </SheetContent>
      </SheetPortal>
    </SheetRoot>
  );
}
