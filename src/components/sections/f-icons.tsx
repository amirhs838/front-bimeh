import type { SVGProps } from "react";

/**
 * Footer icon set — redrawn as inline SVG from 4.png (all stroke/fill
 * currentColor = brand red; the pill icons are outline except the phone).
 */

/** Shield with check (outline) — quick access "بیمه‌ها". */
export function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 26 30" fill="none" aria-hidden {...props}>
      <path
        d="M13 2.2 4.2 5.4 V13.4 C4.2 20.4 7.8 25.4 13 27.9 C18.2 25.4 21.8 20.4 21.8 13.4 V5.4 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.9 14.9 12 18 L17.4 12.1"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Support headset, filled cups + mic boom (outline band) — "خدمات مشتریان". */
export function HeadsetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 30 30" fill="none" aria-hidden {...props}>
      <path
        d="M4.7 17.5 V14.6 C4.7 8.9 9.3 4.3 15 4.3 C20.7 4.3 25.3 8.9 25.3 14.6 V17.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="2.4" y="14.6" width="6.4" height="9.4" rx="2.9" fill="currentColor" />
      <rect x="21.2" y="14.6" width="6.4" height="9.4" rx="2.9" fill="currentColor" />
      <path
        d="M25.3 24 V24.3 C25.3 26.4 23.6 28.1 21.5 28.1 H18.4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="16.6" cy="28.1" r="1.8" fill="currentColor" />
    </svg>
  );
}

/** Circled question mark (outline) — "پرسش‌های متداول". */
export function QuestionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 30 30" fill="none" aria-hidden {...props}>
      <circle cx="15" cy="15" r="12.4" stroke="currentColor" strokeWidth="2.7" />
      <path
        d="M11.4 11.2 C11.4 8.9 13 7.4 15.2 7.4 C17.4 7.4 19 8.8 19 10.9 C19 12.5 18 13.4 16.6 14.3 C15.5 15 15.1 15.7 15.1 17.1"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="15.1" cy="21.3" r="1.7" fill="currentColor" />
    </svg>
  );
}

/** Classic filled handset — pill "تماس با ما" + contact phone row. */
export function PhoneFilledIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

/** Filled map pin with white hole — contact address row. */
export function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path
        fillRule="evenodd"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      />
    </svg>
  );
}

/** Filled envelope with white flap V — contact email row. */
export function EnvelopeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 19" fill="currentColor" aria-hidden {...props}>
      <rect x="0.4" y="0.4" width="23.2" height="18.2" rx="2.6" />
      <path
        d="M2.6 3.4 12 10.6 21.4 3.4"
        stroke="#fff"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Left-pointing chevron (RTL "forward"), round caps. */
export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 10 18" fill="none" aria-hidden {...props}>
      <path
        d="M8.1 1.7 2.1 9 8.1 16.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
