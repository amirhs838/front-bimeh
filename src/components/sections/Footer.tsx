"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef } from "react";
import { footer, footerDesktop, paragraphLinesDesktop } from "@/data/footer";
import { site } from "@/data/site";
import { useUI } from "@/lib/ui-store";
import { px } from "@/lib/format";
import {
  ShieldCheckIcon,
  HeadsetIcon,
  QuestionIcon,
  PhoneFilledIcon,
  PhoneStrokeIcon,
  PinIcon,
  PinOutlineIcon,
  EnvelopeIcon,
  EnvelopeOutlineIcon,
  ChevronLeftIcon,
} from "./f-icons";

/**
 * Footer (end of page) — pixel-perfect rebuild of 4.png (956x1645 @ s=2.1244
 * -> 450x774.3 frame). One rounded card (x16.2-437.5, y3.0-763.6) floating on
 * the page bg; everything inside is absolutely positioned in design units,
 * card-relative. The reference's outer margins are NOT equal (16.2 / 12.5) —
 * replicated as-is. Decor (waves + red curve + dot) is clipped by the card.
 *
 * DESKTOP (>=1280): the same DOM is re-presented as the D4 full-bleed footer
 * ("Persian Insurance AI Website Footer.png", 1672x940; --d4 = --d*1536/1672).
 * The mobile card chrome is reset inside the media query (no card, no shadow,
 * no radius), the mobile paragraph / mobile decor / contact chevrons / pill
 * backgrounds are hidden, and desktop-only parts (FooterDecorDesktop, the D4
 * paragraph, column dividers, contact separators, outline glyphs) become
 * visible. All desktop geometry lives in footerDesktop (D4 image px) and the
 * /* DESKTOP >=1280 *​/ block of globals.css. Mobile is untouched.
 *
 * Reveal groups are `absolute inset-0` overlays (pointer-events-none, with
 * pointer-events-auto on the interactive children): a transformed wrapper
 * becomes the containing block for absolutely-positioned descendants, so the
 * overlay must span the whole card for the child coordinates to stay
 * card-relative both before and after the reveal transform applies.
 */

const CARD_W = footer.card.width; // 421.3
const CARD_H = footer.card.height; // 760.6

/** Word tokens for a justified line; "Bimeh" + "AI" merge into one LTR token. */
function toTokens(text: string): string[] {
  const out: string[] = [];
  for (const w of text.split(" ")) {
    if (w === "AI" && out[out.length - 1] === "Bimeh") out[out.length - 1] = "Bimeh AI";
    else out.push(w);
  }
  return out;
}

/** group wrapper: full-card overlay so child offsets stay card-relative */
const GROUP = "f-reveal absolute inset-0 pointer-events-none";

/** chevron with the hover nudge (2u toward the left = reading direction) */
function NudgeChevron({
  cx,
  w,
  h,
  fromLeft,
  dy = 0,
}: {
  cx: number;
  w: number;
  h: number;
  fromLeft: boolean;
  /** small vertical ink-alignment nudge (u) */
  dy?: number;
}) {
  return (
    <span
      aria-hidden
      className="f-chev pointer-events-none absolute"
      style={
        fromLeft
          ? { left: px(cx), top: `calc(50% + ${px(dy)})`, transform: "translate(-50%, -50%)" }
          : { right: px(cx), top: `calc(50% + ${px(dy)})`, transform: "translate(0, -50%)" }
      }
    >
      <ChevronLeftIcon
        className="f-chev-svg text-f-chevron transition-transform duration-150 group-hover:translate-x-[-0.125rem]"
        style={{ width: px(w), height: px(h), display: "block" }}
      />
    </span>
  );
}

/** Pill icon by name (measured w/h per icon). */
function PillIcon({ name }: { name: string }) {
  // box sizes fitted so the drawn INK matches the reference measurements
  const size =
    name === "shieldCheck"
      ? [17.1, 16.5]
      : name === "headset"
        ? [17.9, 16.6]
        : name === "question"
          ? [16.4, 16.0]
          : [18.8, 18.1]; // phoneFilled
  const cls = "text-brand";
  switch (name) {
    case "shieldCheck":
      return <ShieldCheckIcon className={cls} style={{ width: px(size[0]), height: px(size[1]) }} />;
    case "headset":
      return <HeadsetIcon className={cls} style={{ width: px(size[0]), height: px(size[1]) }} />;
    case "question":
      return <QuestionIcon className={cls} style={{ width: px(size[0]), height: px(size[1]) }} />;
    default:
      return <PhoneFilledIcon className={cls} style={{ width: px(size[0]), height: px(size[1]) }} />;
  }
}

/** One quick-access pill: the whole pill is the hit target. */
function QuickPill({ item, index }: { item: (typeof footer.quick.items)[number]; index: number }) {
  const openSupport = useUI((s) => s.openSupport);
  const dkRow = footerDesktop.quick.rows[index];
  const inner = (
    <>
      <span
        aria-hidden
        className="f-qa-circle pointer-events-none absolute flex items-center justify-center rounded-full"
        style={{
          right: px(footer.quick.circleInsetR),
          top: `calc(50% - ${px(footer.quick.circleD / 2)})`,
          width: px(footer.quick.circleD),
          height: px(footer.quick.circleD),
          background: "var(--f-pill-icon-bg)",
        }}
      >
        <span
          className={`f-m-icon flex items-center justify-center${item.icon === "phoneFilled" ? " f-m-icon-swap" : ""}`}
        >
          <PillIcon name={item.icon} />
        </span>
        {/* D4 renders the phone handset STROKE-style on desktop */}
        {item.icon === "phoneFilled" && (
          <PhoneStrokeIcon className="f-d-icon text-brand" style={{ width: px(24), height: px(24) }} />
        )}
      </span>
      <span
        className="f-qa-label pointer-events-none absolute whitespace-nowrap text-f-text"
        style={{ right: px(footer.quick.pillRight - footer.quick.labelRight), top: `calc(50% + ${px(0.75)})`, transform: "translateY(-50%)", fontSize: px(item.labelSize), fontWeight: 500 }}
      >
        {item.label}
      </span>
      <NudgeChevron
        cx={footer.quick.chevronCx - footer.quick.pillLeft}
        w={7.5}
        h={10.5}
        dy={0.75}
        fromLeft
      />
    </>
  );
  const cls =
    "f-hit f-qa-row pointer-events-auto group absolute block cursor-pointer rounded-full outline-offset-2 bg-[var(--f-pill-bg)] transition-colors duration-150 hover:bg-[#ececf4] focus-visible:bg-[#ececf4]";
  const style: React.CSSProperties = {
    left: px(footer.quick.pillLeft),
    width: px(footer.quick.pillRight - footer.quick.pillLeft),
    top: px(item.top),
    height: px(item.height),
    "--hit-t": px(-4),
    "--hit-b": px(-4),
    "--dki": index,
    "--dkcy": dkRow.cy,
    "--dkh": dkRow.h,
    "--dkfs": dkRow.size,
  } as React.CSSProperties;
  if (item.action === "support") {
    return (
      <li className="list-none">
        <button type="button" onClick={openSupport} className={cls} style={style} aria-label={item.label}>
          {inner}
        </button>
      </li>
    );
  }
  return (
    <li className="list-none">
      <Link href={item.href} className={cls} style={style} aria-label={item.label}>
        {inner}
      </Link>
    </li>
  );
}

/** One link row of a link column (label right + chevron left). */
function ColumnRow({ link, col, index }: { link: (typeof footer.columns.right.links)[number]; col: "right" | "left"; index: number }) {
  const c = footer.columns[col];
  const dkRow = (col === "right" ? footerDesktop.services : footerDesktop.about).rows[index];
  const openChat = useUI((s) => s.openChat);
  const inner = (
    <>
      <span
        className="f-rowlabel pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-f-text transition-colors duration-150 group-hover:text-f-ink"
        style={{ fontSize: px(link.size), fontWeight: 500 }}
      >
        {link.label}
      </span>
      <NudgeChevron cx={12} w={6.7} h={9.25} dy={1.5} fromLeft />
    </>
  );
  const cls = "f-hit f-row pointer-events-auto group absolute block cursor-pointer";
  const style = {
    left: px(c.chevronCx - 12),
    right: px(c.labelRight),
    top: px(link.cy - 13.15),
    height: px(26.3),
    "--hit-t": px(-2),
    "--hit-b": px(-2),
    "--dki": index,
    "--dkcy": dkRow.cy,
    "--dkh": dkRow.h,
    "--dkfs": dkRow.size,
  } as React.CSSProperties;
  if (link.action === "chat") {
    return (
      <li className="list-none">
        <button type="button" onClick={() => openChat()} className={cls} style={style} aria-label={link.label}>
          {inner}
        </button>
      </li>
    );
  }
  return (
    <li className="list-none">
      <Link href={link.href} className={cls} style={style} aria-label={link.label}>
        {inner}
      </Link>
    </li>
  );
}

/** Contact row — physically LTR: [icon] [text] [chevron]. */
function ContactRow({ row }: { row: (typeof footer.contact.rows)[number] }) {
  const c = site.footerContact;
  const href = row.kind === "map" ? c.mapUrl : row.kind === "email" ? c.emailHref : c.phoneHref;
  const external = row.kind === "map";
  const label = row.kind === "map" ? c.address : row.kind === "email" ? c.email : c.phoneDisplay;
  return (
    <li
      className="f-contact-li absolute list-none"
      data-kind={row.kind}
      style={{ left: px(footer.contact.iconCx - 10), right: px(19), top: px(row.cy - 13.2), height: px(26.4) }}
    >
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        dir="ltr"
        aria-label={label}
        className="f-hit f-contact-row group pointer-events-auto absolute inset-0 block cursor-pointer"
        style={{ "--hit-t": px(-2), "--hit-b": px(-2) } as React.CSSProperties}
      >
        <span
          aria-hidden
          className="f-contact-circle pointer-events-none absolute flex items-center text-brand"
          style={{ left: px(10.1), top: "50%", transform: "translate(-50%, -50%)" }}
        >
          <span className="f-m-icon flex items-center justify-center">
            {row.icon === "pin" && <PinIcon style={{ width: px(14.6), height: px(13.6), display: "block" }} />}
            {row.icon === "envelope" && <EnvelopeIcon style={{ width: px(12.6), height: px(10.35), display: "block" }} />}
            {row.icon === "phoneFilled" && <PhoneFilledIcon style={{ width: px(14.4), height: px(14.4), display: "block" }} />}
          </span>
          {/* D4 contact glyphs are OUTLINE variants (desktop-only) */}
          <span className="f-d-icon items-center justify-center">
            {row.icon === "pin" && <PinOutlineIcon style={{ width: px(22), height: px(22), display: "block" }} />}
            {row.icon === "envelope" && <EnvelopeOutlineIcon style={{ width: px(22), height: px(17.5), display: "block" }} />}
            {row.icon === "phoneFilled" && <PhoneStrokeIcon style={{ width: px(22), height: px(22), display: "block" }} />}
          </span>
        </span>
        <span
          className="f-contact-text pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-f-text"
          style={{
            left: px(footer.contact.textLeft - (footer.contact.iconCx - 10)),
            fontSize: px(row.size),
            fontWeight: 400,
            ...(row.kind === "map" ? { direction: "rtl" as const, textAlign: "left" as const } : {}),
          }}
        >
          {label}
        </span>
        <NudgeChevron cx={4.35} w={5.8} h={8} fromLeft={false} />
      </a>
    </li>
  );
}

/** Waves + red curve + glowing dot (clipped by the card's rounded corners). */
function FooterDecor() {
  return (
    <svg
      aria-hidden
      className="f-fade f-decor-m pointer-events-none absolute inset-0"
      style={{ width: px(CARD_W), height: px(CARD_H), transitionDelay: "350ms" }}
      viewBox={`0 0 ${CARD_W} ${CARD_H}`}
      fill="none"
    >
      <defs>
        <linearGradient id="f-strong-fill" x1="0" y1="705" x2="0" y2={CARD_H} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={footer.decor.strongFill} />
          <stop offset="1" stopColor={footer.decor.strongFillBottom} />
        </linearGradient>
        <linearGradient id="f-curve-fade" gradientUnits="userSpaceOnUse" x1="162" y1="0" x2="262" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id="f-curve-mask">
          <rect width={CARD_W} height={CARD_H} fill="url(#f-curve-fade)" />
        </mask>
        <filter id="f-dot-blur" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
      </defs>
      {/* back wave (pale pink) */}
      <path
        d="M0 692 C2.3 691.1 9.2 687.9 13.8 686.5 C18.4 685.1 22.5 681.8 27.8 683.5 C33.1 685.2 39.2 694.1 45.8 697 C52.4 699.9 59.8 700 67.6 700.8 C75.4 701.5 84.3 700.5 92.6 701.5 C100.9 702.5 108.4 704.5 117.6 706.5 C126.8 708.5 138.4 710.7 147.6 713.5 C156.8 716.3 163.9 720.5 172.6 723.5 C181.3 726.5 192.4 729.7 199.6 731.5 C206.8 733.3 208.8 733.5 215.8 734.5 C222.8 735.5 234.1 736.6 241.8 737.2 C249.5 737.8 254.8 738.5 261.8 738 C268.8 737.5 276 736.1 283.8 734.5 C291.6 732.9 300.5 730.7 308.8 728.5 C317.1 726.3 326 724.2 333.8 721.5 C341.6 718.8 348.3 715.5 355.8 712.5 C363.3 709.5 371.6 705.9 378.8 703.5 C386 701.1 391.7 699.2 398.8 698 C405.9 696.8 417.6 696.6 421.3 696.3 L421.3 760.6 L0 760.6 Z"
        fill={footer.decor.lightFill}
      />
      {/* front wave (stronger pink, slightly lighter toward the bottom) */}
      <path
        d="M0 728.5 C2.3 727.5 9 724.5 13.8 722.5 C18.6 720.5 23.5 718.2 28.8 716.5 C34.1 714.8 40 714.3 45.8 712.5 C51.6 710.7 56.6 706.9 63.8 705.5 C71 704.1 80.8 704.3 88.8 704 C96.8 703.7 105.1 703.2 111.8 703.8 C118.5 704.4 123.5 705.6 128.8 707.5 C134.1 709.4 136.3 712.1 143.8 715 C151.3 717.9 164.6 722.3 173.8 725 C183 727.7 190.8 729.5 198.8 731 C206.8 732.5 214.6 733 221.8 733.8 C229 734.6 235.1 735.4 241.8 736 C248.5 736.6 255.1 737.6 261.8 737.4 C268.5 737.2 275.1 735.8 281.8 734.6 C288.5 733.4 295.1 732.1 301.8 730.4 C308.5 728.7 316.1 725.2 321.8 724.2 C327.5 723.2 331.3 725.2 335.8 724.5 C340.3 723.8 343.3 721.8 348.8 720 C354.3 718.2 363 715.4 368.8 713.9 C374.6 712.4 378.8 711.7 383.8 711.1 C388.8 710.5 392.6 710.2 398.8 710.1 C405.1 710 417.6 710.4 421.3 710.4 L421.3 760.6 L0 760.6 Z"
        fill="url(#f-strong-fill)"
      />
      {/* thin red curve: emerges from the wave, rises through the dot, exits right */}
      <path
        d="M180 734.5 C183.3 734.8 191.3 735.4 200 736 C208.7 736.6 222.7 737.8 232 738 C241.3 738.2 249.8 737.2 255.8 737 C261.8 736.8 263.8 736.8 267.8 736.5 C271.8 736.2 275.8 735.8 279.8 735.3 C283.8 734.8 287.8 734 291.8 733.2 C295.8 732.4 299.8 731.5 303.8 730.4 C307.8 729.3 311.8 727.9 315.8 726.6 C319.8 725.3 323.6 724.1 327.8 722.4 C332.1 720.7 337.3 718.1 341.3 716.5 C345.3 714.9 348.1 714.2 351.8 712.7 C355.6 711.2 359.8 709.4 363.8 707.8 C367.8 706.2 371.8 704.4 375.8 703.1 C379.8 701.8 383.8 700.8 387.8 699.8 C391.8 698.8 396.3 697.6 399.8 696.9 C403.3 696.2 405.2 696 408.8 695.7 C412.4 695.4 419.2 695.3 421.3 695.2"
        stroke={footer.decor.curveColor}
        strokeOpacity="0.9"
        strokeWidth="1.1"
        strokeLinecap="round"
        mask="url(#f-curve-mask)"
      />
      {/* red dot with a soft pulsing glow (same pattern/timing as Scroll 2) */}
      <circle
        className="anim-s2-glow"
        cx={footer.decor.dot.cx}
        cy={footer.decor.dot.cy}
        r="3.6"
        fill={footer.decor.dot.fill}
        opacity="0.5"
        filter="url(#f-dot-blur)"
      />
      <circle cx={footer.decor.dot.cx} cy={footer.decor.dot.cy} r={footer.decor.dot.r} fill={footer.decor.dot.fill} />
    </svg>
  );
}

/**
 * DESKTOP-ONLY decor (D4 §5.F): full-bleed bottom layer — two pale-pink wave
 * fills + a thin brand-red hairline curve + the glowing red dot. Hidden below
 * 1280 (base display:none). The SVG stretches horizontally with the viewport
 * (preserveAspectRatio="none"); the dot is a separate HTML element at a
 * percentage left so it stays a perfect circle at any width.
 */
function FooterDecorDesktop() {
  const d = footerDesktop.decor;
  return (
    <div
      aria-hidden
      className="f-decor-d f-fade pointer-events-none"
      style={{ transitionDelay: "350ms" }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1672 215"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          {/* pale base wave: slightly deepens then lightens to the bottom */}
          <linearGradient id="fdk-a" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="215">
            <stop offset="0" stopColor="#faf0f7" />
            <stop offset="0.6" stopColor="#faebf2" />
            <stop offset="0.8" stopColor="#f9f0f6" />
            <stop offset="1" stopColor="#f9f3f9" />
          </linearGradient>
          {/* deeper wave band: fades out by ~y160 (885p) */}
          <linearGradient id="fdk-b" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="160">
            <stop offset="0" stopColor="#fae3ed" />
            <stop offset="0.55" stopColor="#fae9f1" stopOpacity="0.55" />
            <stop offset="1" stopColor="#faeff5" stopOpacity="0" />
          </linearGradient>
          {/* hairline fade-in at its left end */}
          <linearGradient id="fdk-curve-fade" gradientUnits="userSpaceOnUse" x1="925" y1="0" x2="1010" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="fdk-curve-mask">
            <rect width="1672" height="215" fill="url(#fdk-curve-fade)" />
          </mask>
        </defs>
        {/* layer 1: pale wave — crest x216-288, trough x1008 */}
        <path
          d="M0 37 C50 22 100 10 160 3 C210 -1 250 0 300 4 C370 10 430 26 500 42 C560 55 620 72 690 95 C760 116 830 133 920 140 C980 143 1030 142 1090 138 C1150 133 1210 120 1280 101 C1350 80 1430 60 1500 48 C1560 40 1620 43 1672 48 L1672 215 L0 215 Z"
          fill="url(#fdk-a)"
        />
        {/* layer 2: deeper band — crest x360, trough x980, meets layer 1 at the right */}
        <path
          d="M0 131 C40 102 80 80 140 63 C200 50 260 45 320 45 C380 46 440 55 500 66 C560 77 640 93 720 108 C800 122 870 133 950 139 C1030 142 1100 136 1170 126 C1240 115 1300 98 1360 80 C1420 63 1480 52 1540 46 C1600 42 1650 43 1672 45 L1672 215 L0 215 Z"
          fill="url(#fdk-b)"
        />
        {/* thin brand-red hairline: fade-in ~x925, trough (1020,126.5), through
            the dot (1305,82), exits the right edge at (1672,6) */}
        <path
          d="M925 121 C970 125 1010 126.5 1045 126.5 C1105 126 1155 117 1205 107.5 C1255 98 1275 90 1305 82 C1338 74 1372 63 1405 52 C1445 39.5 1505 23 1565 12.5 C1605 6 1645 5 1672 5.5"
          stroke="var(--dk4-curve)"
          strokeOpacity="0.9"
          strokeWidth="1.3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          mask="url(#fdk-curve-mask)"
        />
      </svg>
      {/* red dot + pulsing glow (HTML so it never stretches) */}
      <span
        className="absolute"
        style={{
          left: `${(d.dotX / footerDesktop.frame.w) * 100}%`,
          top: `calc(${d.dotY} * var(--d4))`,
          width: `calc(${d.dotD} * var(--d4))`,
          height: `calc(${d.dotD} * var(--d4))`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <span
          className="anim-s2-glow absolute inset-0 rounded-full"
          style={{ background: "var(--dk4-dot)", filter: "blur(calc(3 * var(--d4)))", opacity: 0.5 }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{ background: "var(--dk4-dot)" }}
        />
      </span>
    </div>
  );
}

export function Footer() {
  const rootRef = useRef<HTMLElement | null>(null);

  // reveal once ~20% visible (no-op without JS: everything stays visible)
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll<HTMLElement>(".f-reveal, .f-fade");
    if (!els || !els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.2 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const f = footer;
  const dk = footerDesktop;
  return (
    <footer
      ref={rootRef}
      id="footer"
      aria-labelledby="f-title"
      className="relative"
      style={{
        background: `linear-gradient(180deg, var(--s3-bg) 0%, #f3f8fa ${px(12)}, var(--f-outside-bg) ${px(40)}, var(--f-outside-bg) 100%)`,
        paddingBottom: `calc(${px(69.5)} + env(safe-area-inset-bottom))`,
      }}
    >
      <FooterDecorDesktop />

      <div className="f-col relative mx-auto max-w-[28.125rem]">
        <div
          className="f-card f-reveal relative overflow-hidden"
          style={{
            // RTL block layout: margins must sum with the width to the
            // container (16.2 + 421.3 + 12.5 = 450) or the leftover space is
            // reassigned to margin-left, shifting the whole card +12.5px.
            marginLeft: px(f.card.left),
            marginRight: px(450 - f.card.left - f.card.width),
            width: px(f.card.width),
            height: px(f.card.height),
            borderRadius: px(f.card.radius),
            background: "var(--f-card-bg)",
            boxShadow:
              "0 8px 14px -10px rgba(70,90,140,0.22), 0 2px 6px -4px rgba(70,90,140,0.04)",
          }}
        >
          <FooterDecor />

          {/* ---- brand wordmark ----
              NOTE: static top (cy 50.2 - 16.5 box half) — no translateY(-50%):
              the reduced-motion override (`transform: none !important` on
              .f-reveal) would kill an inline centering transform here. */}
          <p
            className="f-brand f-reveal pointer-events-none absolute"
            style={{ right: px(f.wordmark.right), top: px(37.9) }}
          >
            <Link
              href="/"
              aria-label="Bimeh AI — صفحه اصلی"
              className="f-brand-link font-wordmark pointer-events-auto inline-block whitespace-nowrap leading-none text-brand"
              style={{ fontSize: px(f.wordmark.size), fontWeight: 700, letterSpacing: "-0.01em" }}
            >
              Bimeh AI
            </Link>
          </p>

          {/* ---- intro ---- */}
          <div className={GROUP} style={{ transitionDelay: "70ms" }}>
            <h2
              id="f-title"
              className="whitespace-nowrap text-f-ink"
              style={{ position: "absolute", right: px(f.textRight), top: px(f.intro.headingCy), transform: "translateY(-50%)", fontSize: px(f.intro.headingSize), fontWeight: 800, lineHeight: 1.4 }}
            >
              {f.intro.heading}
            </h2>
            <p className="f-para-m" style={{ position: "absolute", inset: 0 }}>
              <span className="sr-only">{f.intro.lines.map((l) => l.text).join(" ")}</span>
              {f.intro.lines.map((line, i) =>
                line.noJustify ? (
                  <span
                    key={i}
                    aria-hidden
                    className="absolute whitespace-nowrap text-f-text"
                    style={{ right: px(f.textRight), top: px(line.cy), transform: "translateY(-50%)", fontSize: px(line.size), fontWeight: 500, lineHeight: px(21.3) }}
                  >
                    {line.text}
                  </span>
                ) : (
                  <span
                    key={i}
                    aria-hidden
                    className="absolute flex justify-between whitespace-nowrap text-f-text"
                    style={{
                      right: px(f.textRight),
                      top: px(line.cy),
                      transform: "translateY(-50%)",
                      width: px(line.w),
                      minWidth: "max-content",
                      fontSize: px(line.size),
                      fontWeight: 500,
                      lineHeight: px(21.3),
                    }}
                  >
                    {/* "Bimeh AI" stays one LTR island so the Latin phrase
                        keeps its internal order inside the RTL flex row */}
                    {toTokens(line.text).map((w, j) =>
                      w === "Bimeh AI" ? (
                        <span key={j} dir="ltr" className="font-wordmark" style={{ fontWeight: 600, fontSize: px(line.size * 0.94) }}>
                          {w}
                        </span>
                      ) : (
                        <span key={j}>{w}</span>
                      ),
                    )}
                  </span>
                ),
              )}
            </p>
            {/* DESKTOP paragraph (D4 wording; hidden below 1280).
                L1-L4: one block span each, stretched to the fixed 533p box
                with text-align-last: justify (word gaps only — no kashida,
                no letter-spacing). L5 keeps its natural width. Real space
                text nodes between spans are what justify distributes. */}
            <p className="f-para-d">
              <span className="sr-only">{paragraphLinesDesktop.join(" ")}</span>
              {paragraphLinesDesktop.map((line, i) => {
                const parts = toTokens(line);
                const inner = parts.map((w, j) => (
                  <Fragment key={j}>
                    {j > 0 && " "}
                    {w === "Bimeh AI" ? (
                      <span dir="ltr" className="font-wordmark">
                        {w}
                      </span>
                    ) : (
                      <span>{w}</span>
                    )}
                  </Fragment>
                ));
                return i < 4 ? (
                  <span key={i} aria-hidden className="f-para-d-line">
                    {inner}
                  </span>
                ) : (
                  <span key={i} aria-hidden className="f-para-d-l5">
                    {inner}
                  </span>
                );
              })}
            </p>
          </div>

          {/* ---- quick access ---- */}
          <nav
            aria-labelledby="qa-title"
            className={`${GROUP} f-col-quick`}
            style={{
              transitionDelay: "140ms",
              "--dktr": dk.quick.titleRight,
              "--dktcy": dk.quick.titleCy,
              "--dkts": 24.9,
              "--dkulr": dk.quick.ulRight,
              "--dkrl": dk.quick.rowLeft,
              "--dkrr": dk.quick.rowRight,
              "--dkdl": dk.quick.divLeft,
              "--dkdr": dk.quick.divRight,
            } as React.CSSProperties}
          >
            <h3
              id="qa-title"
              className="whitespace-nowrap text-f-ink"
              style={{ position: "absolute", right: px(f.quick.titleRight), top: px(f.quick.titleCy), transform: "translateY(-50%)", fontSize: px(f.quick.titleSize), fontWeight: 800, lineHeight: 1.4 }}
            >
              {f.quick.title}
            </h3>
            <span
              aria-hidden
              className="f-ul absolute rounded-full bg-brand"
              style={{ right: px(f.quick.underline.right), top: px(f.quick.underline.cy - 0.95), width: px(f.quick.underline.w), height: px(1.9) }}
            />
            <ul role="list" className="list-none">
              {f.quick.items.map((item, i) => (
                <QuickPill key={item.label} item={item} index={i} />
              ))}
            </ul>
            {/* DESKTOP-ONLY row dividers (D4; display:none below 1280) */}
            {dk.quick.divs.map((y) => (
              <span key={y} aria-hidden className="f-dk-div" style={{ "--dkdy": y } as React.CSSProperties} />
            ))}
          </nav>

          {/* ---- two link columns ---- */}
          {(["right", "left"] as const).map((col) => {
            const c = f.columns[col];
            const dkc = col === "right" ? dk.services : dk.about;
            return (
              <nav
                key={c.id}
                aria-labelledby={c.id}
                className={`${GROUP} ${col === "right" ? "f-col-services" : "f-col-about"}`}
                style={{
                  transitionDelay: "210ms",
                  "--dktr": dkc.titleRight,
                  "--dktcy": dkc.titleCy,
                  "--dkts": col === "right" ? 24.9 : 26.7,
                  "--dkulr": dkc.ulRight,
                  "--dkrl": dkc.rowLeft,
                  "--dkrr": dkc.rowRight,
                  "--dkdl": dkc.divLeft,
                  "--dkdr": dkc.divRight,
                } as React.CSSProperties}
              >
                <h3
                  id={c.id}
                  className="whitespace-nowrap text-f-ink"
                  style={{ position: "absolute", right: px(c.titleRight), top: px(c.titleCy), transform: "translateY(-50%)", fontSize: px(c.titleSize), fontWeight: 800, lineHeight: 1.4 }}
                >
                  {c.title}
                </h3>
                <span
                  aria-hidden
                  className="f-ul absolute rounded-full bg-brand"
                  style={{ right: px(c.titleRight), top: px(f.columns.underlineCy - 0.95), width: px(c.underlineW), height: px(1.9) }}
                />
                <ul role="list" className="list-none">
                  {c.links.map((link, i) => (
                    <ColumnRow key={link.label} link={link} col={col} index={i} />
                  ))}
                </ul>
                {/* DESKTOP-ONLY row dividers (D4; display:none below 1280) */}
                {dkc.divs.map((y) => (
                  <span key={y} aria-hidden className="f-dk-div" style={{ "--dkdy": y } as React.CSSProperties} />
                ))}
              </nav>
            );
          })}

          {/* ---- divider + contact ---- */}
          <div className={`${GROUP} f-contact-g`} style={{ transitionDelay: "280ms" }}>
            <span
              aria-hidden
              className="f-maindiv absolute"
              style={{ left: px(f.divider.left), right: px(CARD_W - f.divider.right), top: px(f.divider.cy - 0.5), height: 1, background: "var(--f-divider)" }}
            />
            {/* DESKTOP-ONLY contact separators (display:none below 1280) */}
            {dk.contact.vseps.map((x) => (
              <span key={x} aria-hidden className="f-dk-vsep" style={{ "--dkvx": x } as React.CSSProperties} />
            ))}
            <ul role="list" className="list-none">
              {f.contact.rows.map((row) => (
                <ContactRow key={row.kind} row={row} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
