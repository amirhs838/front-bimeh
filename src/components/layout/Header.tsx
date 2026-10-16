"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Wordmark, Burger, Headset } from "@/components/icons";
import { content } from "@/data/content";
import { site } from "@/data/site";
import { useUI } from "@/lib/ui-store";
import { px } from "@/lib/format";

/**
 * Sticky header. Physically LTR-positioned like the reference:
 * logo tile + wordmark on the left; pill, headset, hamburger on the right.
 * Turns into blurred glass once the page scrolls; auto-hides on scroll DOWN
 * and slides back (glass) on scroll UP, so section headings below the fold
 * (e.g. "چرا Bimeh AI" at the top of Scroll 2) stay unobstructed.
 * At scrollY = 0 it renders exactly like the reference.
 *
 * DESKTOP (>=1280): solid white full-bleed bar at rest; a main nav
 * (site.desktopNav, active route highlighted) sits left of the headset;
 * the pill and headset are visually swapped via CSS order. All desktop
 * presentation lives in the @media (min-width:1280px) block of globals.css.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const pathname = usePathname();
  const openDrawer = useUI((s) => s.openDrawer);
  const openSupport = useUI((s) => s.openSupport);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 4);
      if (y <= 24) {
        setHidden(false);
      } else {
        const dy = y - lastY.current;
        if (dy > 8) setHidden(true);
        else if (dy < -8) setHidden(false);
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled || undefined}
      data-hidden={hidden || undefined}
      className={`dk-header sticky top-0 z-40 w-full transition-all duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${
        scrolled
          ? "bg-[rgba(242,246,251,0.8)] backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.65),0_10px_26px_-16px_rgba(70,90,140,0.25)]"
          : "bg-transparent"
      }`}
    >
      <div
        dir="ltr"
        className="mx-auto flex h-[3.625rem] max-w-[28.125rem] items-center justify-between pl-[1.375rem] pr-[1.375rem]"
      >
        <Link
          href="/"
          aria-label={content.header.homeAria}
          className="flex items-center rounded-[0.625rem]"
          style={{ gap: px(14) }}
        >
          {/* brand mark — mascot-face logo (fixed 34px box, same as the old SVG tile) */}
          <Image
            src="/img/logo-face.png"
            alt=""
            width={68}
            height={68}
            priority
            className="dk-logo block h-[34px] w-[34px]"
          />
          <Wordmark />
        </Link>

        <div className="dk-right flex items-center" style={{ gap: px(16) }}>
          {/* DESKTOP main nav (hidden below 1280px, outside the a11y tree there) */}
          <nav
            aria-label="ناوبری اصلی"
            dir="rtl"
            className="dk-nav dk-only"
          >
            {site.desktopNav.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`dk-nav-link relative whitespace-nowrap transition-colors hover:text-brand ${
                    active ? "text-brand" : "text-[#343a4c]"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-[-0.55em] h-[2px] rounded-full bg-brand"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/register"
            className="dk-pill flex h-[2.125rem] items-center justify-center rounded-full bg-pill text-[#222c37] transition-colors hover:bg-[#dbe0e7]"
            style={{ padding: `0 ${px(16)}`, fontSize: px(12.6), fontWeight: 600, lineHeight: 1 }}
          >
            {content.header.register}
          </Link>
          <button
            type="button"
            onClick={openSupport}
            aria-label={content.header.supportAria}
            className="dk-headset rounded-[0.5rem] p-[0.125rem] text-[#14161d] transition-opacity hover:opacity-75"
          >
            <Headset className="h-[1.47rem] w-[1.40625rem]" />
          </button>
          <button
            type="button"
            onClick={openDrawer}
            aria-label={content.header.menuAria}
            className="dk-burger ml-[0.21875rem] rounded-[0.5rem] p-[0.125rem] text-[#2a2d3a] transition-opacity hover:opacity-75"
          >
            <Burger className="h-[0.875rem] w-[1.09375rem]" />
          </button>
        </div>
      </div>
    </header>
  );
}
