"use client";

import Image from "next/image";
import { content } from "@/data/content";
import { useUI } from "@/lib/ui-store";
import { px } from "@/lib/format";

/** Hero card: studio-gradient backdrop, 3D mascot, headline, chat bubble, avatar, typing dots. */
export function HeroBanner() {
  const openChat = useUI((s) => s.openChat);

  return (
    <div className="pl-[1.1875rem] pr-[1.21875rem]">
      <div
        className="relative mx-auto h-[12.03125rem] max-w-[28.125rem] overflow-hidden rounded-[1rem]"
        style={{
          background: [
            // diagonal light beam across the wall
            "linear-gradient(112deg, transparent 24%, rgba(255,255,255,0.20) 38%, rgba(255,255,255,0.04) 50%, transparent 58%)",
            // dark wedge from the top-right corner
            "linear-gradient(245deg, rgba(176,188,205,0.26) 0%, rgba(176,188,205,0.10) 20%, transparent 38%)",
            // floor: soft horizon at ~77% then lighter studio floor
            "linear-gradient(180deg, transparent 72%, rgba(150,162,180,0.10) 76.5%, rgba(150,162,180,0.04) 79%, rgba(255,255,255,0.20) 88%, rgba(255,255,255,0.10) 100%)",
            // soft center glow + base wall gradient
            "radial-gradient(85% 80% at 30% 32%, rgba(255,255,255,0.38), transparent 64%)",
            "linear-gradient(180deg, #e2e8ef 0%, #e7ecf2 55%, #e6eaef 78%, #e9edf1 100%)",
          ].join(", "),
          boxShadow: "0 2px 14px rgba(70,90,140,0.08), inset 0 1px 0 rgba(255,255,255,0.65)",
        }}
      >
        {/* mascot */}
        <button
          type="button"
          onClick={() => openChat()}
          aria-label={content.hero.mascotAria}
          className="anim-hero-float absolute cursor-pointer"
          style={{ left: px(232.5), top: px(17.5), width: px(140), height: px(169) }}
        >
          <Image
            src="/img/mascot.webp"
            alt={content.hero.mascotAlt}
            width={280}
            height={338}
            priority
            fetchPriority="high"
            className="h-full w-full object-contain"
          />
        </button>

        {/* headline */}
        <h1
          className="absolute whitespace-nowrap font-black leading-none text-ink-strong"
          style={{ right: px(190.5), top: px(86), transform: "translateY(-50%)", fontSize: px(26.2) }}
        >
          {content.hero.headline}
        </h1>

        {/* chat bubble */}
        <button
          type="button"
          onClick={() => openChat()}
          aria-label={content.hero.bubbleAria}
          className="absolute cursor-pointer text-right"
          style={{
            left: px(105),
            top: px(113),
            width: px(117),
            height: px(45),
            background: "rgba(251,253,255,0.96)",
            borderRadius: px(18),
            boxShadow: "0 4px 12px rgba(90,105,135,0.10)",
          }}
        >
          <span
            className="absolute inset-0 flex items-start whitespace-pre-line"
            style={{ padding: `${px(5)} ${px(11.5)} ${px(4)} ${px(7)}` }}
          >
            <span
              className="w-full text-right font-medium leading-[1.75] text-ink-soft"
              style={{ fontSize: px(9) }}
            >
              {content.hero.bubble}
            </span>
          </span>
          {/* tail pointing at the avatar */}
          <svg
            aria-hidden
            className="absolute"
            style={{ left: px(-5.5), top: px(26) }}
            width="8"
            height="9"
            viewBox="0 0 8 9"
            fill="rgba(251,253,255,0.96)"
          >
            <path d="M8 0v9L0 4.5 8 0Z" />
          </svg>
        </button>

        {/* avatar tile */}
        <button
          type="button"
          onClick={() => openChat()}
          aria-label={content.hero.bubbleAria}
          className="absolute cursor-pointer"
          style={{
            left: px(56),
            top: px(116),
            width: px(39),
            height: px(39),
            borderRadius: px(10),
            background: "#fdfdfe",
            boxShadow: "0 4px 12px rgba(90,105,135,0.12)",
          }}
        >
          {/* mascot-face logo, faded (same soft-pink treatment as before) */}
          <Image
            src="/img/logo-face-soft.png"
            alt=""
            width={52}
            height={52}
            priority
            aria-hidden
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: px(26),
              height: px(26),
            }}
          />
        </button>

        {/* typing indicator pill */}
        <div
          aria-label={content.hero.typingAria}
          className="absolute flex items-center justify-center"
          style={{
            left: px(117),
            top: px(162),
            width: px(38),
            height: px(20),
            borderRadius: px(10),
            background: "#fdfdfe",
            boxShadow: "0 3px 10px rgba(90,105,135,0.10)",
          }}
        >
          <div dir="ltr" className="absolute left-[0.46875rem] flex" style={{ gap: px(4), top: px(6.5) }}>
            {[1, 0.58, 0.32].map((base, i) => (
              <span
                key={i}
                className="anim-typing-dot rounded-full bg-[#7e8590]"
                style={{ width: px(5.5), height: px(5.5), opacity: base, animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
