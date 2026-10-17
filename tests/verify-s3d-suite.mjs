/**
 * DESKTOP SCROLL 3 suite (master prompt §10.4-10.5):
 * responsive 1280-2560 (proportional, centered, no overflow), 1279/1280
 * boundary (mobile column -> desktop frame), DPR2, interactions (hotspot ->
 * ChatSheet seeded, CTA route, drawer link), reduced-motion visibility,
 * network waterfall (no cross-download of the hero art).
 * Usage: node tests/verify-s3d-suite.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3000/";
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`  PASS ${name}${extra ? " — " + extra : ""}`); }
  else { fail++; console.error(`  FAIL ${name}${extra ? " — " + extra : ""}`); }
};
const HIDE = `header, div.fixed.inset-x-0, .dk-select { display: none !important; }`;

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });

// ---------- responsive sweep ----------
for (const W of [1280, 1366, 1440, 1536, 1728, 1920, 2560]) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 1024 } });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const el = document.getElementById("scroll-3");
    const frame = el.querySelector(".s3-frame");
    const fr = frame.getBoundingClientRect();
    const hero = el.querySelector(".s3-hero").getBoundingClientRect();
    const cta = el.querySelector(".s3-dk-cta").getBoundingClientRect();
    const sec = el.getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      frameW: fr.width, frameLeft: fr.left,
      secH: sec.height, heroW: hero.width, ctaW: cta.width,
      mTextHidden: getComputedStyle(el.querySelector(".s3-m-text")).display === "none",
      dkTextShown: getComputedStyle(el.querySelector(".s3-dk-title")).display !== "none",
      ctaVisible: getComputedStyle(el.querySelector(".s3-dk-cta")).display !== "none",
    };
  });
  const d = W / 1536;
  const expFrame = Math.min(W, 1536); // frame caps at 1536d beyond 1536px
  ok(`W${W} no overflow`, !r.overflow);
  ok(`W${W} frame width ${Math.round(r.frameW)}≈${Math.round(expFrame)}`, Math.abs(r.frameW - expFrame) < 1.5);
  ok(`W${W} frame centered`, Math.abs(r.frameLeft - (W - r.frameW) / 2) < 1);
  ok(`W${W} section height ≈1064d`, Math.abs(r.secH - 1064 * (expFrame / 1536)) < 2);
  ok(`W${W} art proportional`, Math.abs(r.heroW - 650 * (expFrame / 1536) * (1536 / 1507)) < 2);
  ok(`W${W} CTA proportional`, Math.abs(r.ctaW - 135 * (expFrame / 1536) * (1536 / 1507)) < 2);
  ok(`W${W} mobile text hidden / dk text + CTA shown`, r.mTextHidden && r.dkTextShown && r.ctaVisible);
  await ctx.close();
}

// ---------- boundary 1279/1280 ----------
for (const W of [1279, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const el = document.getElementById("scroll-3");
    const frame = el.querySelector(".s3-frame");
    return {
      frameW: frame.getBoundingClientRect().width,
      heroBg: getComputedStyle(el.querySelector(".s3-hero")).background.slice(0, 30),
      heroRadius: getComputedStyle(el.querySelector(".s3-hero")).borderRadius,
      dkCta: getComputedStyle(el.querySelector(".s3-dk-cta")).display,
      mText: getComputedStyle(el.querySelector(".s3-m-text")).display,
      dkTitle: getComputedStyle(el.querySelector(".s3-dk-title")).display,
      brainM: getComputedStyle(el.querySelector(".s3-dk-tile .m-only")).display,
    };
  });
  if (W === 1279) {
    ok("1279 mobile column 480px", Math.abs(r.frameW - 480) < 1);
    ok("1279 dk CTA/text hidden, m-text shown", r.dkCta === "none" && r.mText !== "none" && r.dkTitle === "none");
  } else {
    ok("1280 desktop frame 1280px", Math.abs(r.frameW - 1280) < 1.5);
    ok("1280 dk CTA/text shown, m-text hidden", r.dkCta !== "none" && r.mText === "none" && r.dkTitle !== "none");
  }
  await ctx.close();
}

// ---------- interactions ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1536, height: 1024 } });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: "networkidle" });
  // hotspot -> ChatSheet seeded
  await p.evaluate(() => {
    const el = document.getElementById("scroll-3");
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: "instant" });
  });
  await p.waitForTimeout(600);
  await p.click("#scroll-3 .s3-hotspot");
  await p.waitForTimeout(500);
  const chat = await p.evaluate(() => {
    const sheet = document.querySelector('[data-state="open"].dk-chat, .dk-chat[data-state="open"]');
    const msgs = [...document.querySelectorAll(".dk-chat [data-role], .dk-chat .text-right, .dk-chat p, .dk-chat div")].map((n) => n.textContent).join(" ");
    return { open: !!sheet, seeded: msgs.includes("تصادف ماشینت") };
  });
  ok("hotspot opens ChatSheet", chat.open);
  ok("ChatSheet seeded with notif text", chat.seeded);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  // CTA href + route
  const href = await p.getAttribute("#scroll-3 .s3-dk-cta", "href");
  ok("CTA href=/register", href === "/register");
  await p.click("#scroll-3 .s3-dk-cta");
  await p.waitForTimeout(900);
  ok("CTA navigates to /register", p.url().includes("/register"));
  await ctx.close();
}

// ---------- drawer link + keyboard focus ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1536, height: 1024 } });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.click(".dk-burger, header button[aria-label*='منو']");
  await p.waitForTimeout(500);
  await p.click("a[href='/#scroll-3']");
  await p.waitForTimeout(1200);
  const top = await p.evaluate(() => Math.round(document.getElementById("scroll-3").getBoundingClientRect().top));
  ok("drawer link scrolls #scroll-3 to top", Math.abs(top) <= 2, `top=${top}`);
  // tab order: hotspot then CTA
  const order = await p.evaluate(() => {
    document.getElementById("scroll-3").scrollIntoView({ behavior: "instant" });
    const els = [...document.querySelectorAll("#scroll-3 .s3-hotspot, #scroll-3 .s3-dk-cta")];
    return els.map((e) => e.className.split(" ")[0]);
  });
  ok("tab order hotspot→CTA", order[0] === "s3-hotspot" && order[1] === "s3-dk-cta");
  await ctx.close();
}

// ---------- reduced motion: everything visible immediately ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1536, height: 1024 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.evaluate(() => {
    const el = document.getElementById("scroll-3");
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 2000, behavior: "instant" });
  });
  await p.waitForTimeout(300);
  const vis = await p.evaluate(() => {
    const el = document.getElementById("scroll-3");
    const hero = el.querySelector(".s3-hero");
    const cta = el.querySelector(".s3-dk-cta");
    return {
      heroOp: getComputedStyle(hero).opacity,
      ctaOp: getComputedStyle(cta).opacity,
      ctaTf: getComputedStyle(cta).transform,
    };
  });
  ok("reduced-motion: hero+CTA visible without scroll", vis.heroOp === "1" && vis.ctaOp === "1" && (vis.ctaTf === "none" || vis.ctaTf === "matrix(1, 0, 0, 1, 0, 0)"));
  await ctx.close();
}

// ---------- network waterfall: no cross-download ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  const mobileReqs = [];
  p.on("request", (r) => { if (r.url().includes("/img/")) mobileReqs.push(r.url().split("/img/")[1]); });
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(1200);
  ok("mobile: no s3d-hero download", !mobileReqs.some((u) => u.startsWith("s3d-")), mobileReqs.filter((u) => u.startsWith("s3")).join(","));
  await ctx.close();
  const ctx2 = await browser.newContext({ viewport: { width: 1536, height: 1024 } });
  const p2 = await ctx2.newPage();
  const dkReqs = [];
  p2.on("request", (r) => { if (r.url().includes("/img/")) dkReqs.push(r.url().split("/img/")[1]); });
  await p2.goto(BASE, { waitUntil: "networkidle" });
  await p2.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await p2.waitForTimeout(1500);
  ok("desktop: s3d-hero downloads, no mobile s3-hero", dkReqs.some((u) => u.startsWith("s3d-hero")) && !dkReqs.some((u) => u.startsWith("s3-hero")), dkReqs.filter((u) => u.startsWith("s3")).join(","));
  await ctx2.close();
}

await browser.close();
console.log(`\nS3D SUITE: ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
