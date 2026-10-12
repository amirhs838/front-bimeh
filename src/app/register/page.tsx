"use client";

import { useState } from "react";
import { SubPageShell } from "@/components/layout/SubPageShell";
import { LogoTile } from "@/components/icons";
import { content } from "@/data/content";
import { toEn, toFa } from "@/lib/format";

type Step = "phone" | "otp" | "done";

/** /register — Iranian mobile number + mock OTP verification. */
export default function RegisterPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const phoneValid = /^09\d{9}$/.test(toEn(phone));

  const sendCode = () => {
    if (!phoneValid) {
      setError(content.register.invalidPhone);
      return;
    }
    setError(null);
    setStep("otp");
  };

  const verify = () => {
    if (toEn(code) !== "1234") {
      setError(content.register.wrongCode);
      return;
    }
    setError(null);
    setStep("done");
  };

  return (
    <SubPageShell title={content.register.title} backHref="/">
      <div className="mt-2 flex flex-col items-center rounded-2xl border border-white/90 bg-white/72 p-6 shadow-[0_2px_12px_rgba(70,90,140,0.06)] backdrop-blur-[3px]">
        <LogoTile size={44} radius={13} />

        {step === "phone" && (
          <form
            className="mt-5 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              sendCode();
            }}
          >
            <label htmlFor="phone" className="block text-[0.8125rem] font-bold text-ink">
              {content.register.phoneLabel}
            </label>
            <input
              id="phone"
              dir="ltr"
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                setPhone(toFa(toEn(e.target.value).replace(/\D/g, "").slice(0, 11)));
                setError(null);
              }}
              placeholder={content.register.phonePlaceholder}
              className="mt-2 h-11 w-full rounded-xl border border-[#e4e8ee] bg-white px-3.5 text-center text-[0.9375rem] font-semibold tracking-widest text-ink outline-none transition-shadow placeholder:tracking-normal placeholder:text-placeholder focus:shadow-[0_0_0_2px_rgba(252,27,55,0.15)]"
            />
            <p className="mt-2 text-[0.6875rem] text-[#8a94a6]">{content.register.phoneHint}</p>
            {error && <p className="mt-2 text-[0.75rem] font-medium text-brand">{error}</p>}
            <button
              type="submit"
              className="mt-4 h-11 w-full rounded-xl bg-brand text-[0.9375rem] font-bold text-white shadow-[0_10px_22px_-8px_rgba(252,27,55,0.55)] transition-transform active:scale-[0.98] disabled:opacity-40"
              disabled={!phoneValid}
            >
              {content.register.sendCode}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form
            className="mt-5 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              verify();
            }}
          >
            <label htmlFor="otp" className="block text-[0.8125rem] font-bold text-ink">
              {content.register.otpLabel}
            </label>
            <input
              id="otp"
              dir="ltr"
              inputMode="numeric"
              autoFocus
              value={code}
              onChange={(e) => {
                setCode(toFa(toEn(e.target.value).replace(/\D/g, "").slice(0, 4)));
                setError(null);
              }}
              placeholder="▪ ▪ ▪ ▪"
              className="mt-2 h-11 w-full rounded-xl border border-[#e4e8ee] bg-white px-3.5 text-center text-[1.125rem] font-bold tracking-[0.6em] text-ink outline-none transition-shadow placeholder:text-placeholder focus:shadow-[0_0_0_2px_rgba(252,27,55,0.15)]"
            />
            <p className="mt-2 text-[0.6875rem] text-[#8a94a6]">{content.register.otpHintMock}</p>
            {error && <p className="mt-2 text-[0.75rem] font-medium text-brand">{error}</p>}
            <button
              type="submit"
              className="mt-4 h-11 w-full rounded-xl bg-brand text-[0.9375rem] font-bold text-white shadow-[0_10px_22px_-8px_rgba(252,27,55,0.55)] transition-transform active:scale-[0.98]"
            >
              {content.register.verify}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="mt-5 flex w-full flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-brand">
              <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none" aria-hidden>
                <path
                  d="m4 10.5 4 4 8-9"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h2 className="mt-3 text-[1rem] font-extrabold text-ink">
              {content.register.successTitle}
            </h2>
            <p className="mt-1 text-[0.8125rem] text-[#5a6474]">{content.register.successDesc}</p>
            <a
              href="/"
              className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-brand text-[0.9375rem] font-bold text-white"
            >
              {content.register.back}
            </a>
          </div>
        )}
      </div>
    </SubPageShell>
  );
}
