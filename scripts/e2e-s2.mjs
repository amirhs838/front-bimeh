/**
 * Scroll 2 interaction tests (node; run: node scripts/e2e-s2.mjs)
 * Covers: reveal-on-scroll, hotspots (chat/support), drawer link scroll,
 * header auto-hide, reduced-motion visibility, chrome over Scroll 2,
 * zero console errors.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000/";
let pass = 0, fail = 0;
const ok = (cond, name) => {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}`); }
};

const browser = await chromium.launch();

// ---------- pass 1: normal motion ----------
{
  const ctx = await browser.newContext({ viewport: { width: 450, height: 875 }, deviceScaleFactor: 2, locale: "fa-IR" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "networkidle" });

  console.log("— reveal on scroll —");
  const revealState = await page.evaluate(() => {
    const el = document.querySelector("#scroll-2 .s2-reveal");
    return { hasJs: document.documentElement.classList.contains("js"), isIn: el?.classList.contains("is-in"), opacity: el ? getComputedStyle(el).opacity : null };
  });
  ok(revealState.hasJs, "html.js flag set");
  ok(revealState.isIn === false || revealState.isIn === null, "step 1 not revealed before scroll (below fold)");
  await page.evaluate(() => document.getElementById("scroll-2").scrollIntoView({ behavior: "instant", block: "start" }));
  await page.waitForTimeout(900);
  const revealed = await page.evaluate(() => {
    const els = document.querySelectorAll("#scroll-2 .s2-reveal");
    return {
      count: els.length,
      allIn: [...els].every((e) => e.classList.contains("is-in")),
      opacities: [...els].map((e) => getComputedStyle(e).opacity),
    };
  });
  ok(revealed.count === 9, `9 reveal elements (1 title + 4 illu + 4 text) — got ${revealed.count}`);
  ok(revealed.allIn, "all steps revealed after scroll");
  ok(revealed.opacities.every((o) => o === "1"), "all revealed at full opacity");

  console.log("— hotspots —");
  await page.click('#scroll-2 button[aria-label="شروع گفتگو با هوش مصنوعی"]');
  await page.waitForTimeout(500);
  ok(await page.isVisible('[role="dialog"]'), "chat sheet opens from step-1 phone hotspot");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  await page.click('#scroll-2 button[aria-label="پشتیبانی"]');
  await page.waitForTimeout(500);
  const supportVisible = await page.evaluate(() => {
    const dlg = [...document.querySelectorAll('[role="dialog"]')];
    return dlg.some((d) => d.textContent.includes("پشتیبانی"));
  });
  ok(supportVisible, "support sheet opens from step-4 headset hotspot");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  console.log("— chat bar over scroll 2 —");
  const chatBar = await page.evaluate(() => {
    const bar = [...document.querySelectorAll("div.fixed.inset-x-0")].pop();
    const r = bar?.getBoundingClientRect();
    const input = bar?.querySelector("input, textarea");
    return { visible: r && r.height > 0 && r.bottom <= window.innerHeight + 1, hasInput: !!input };
  });
  ok(chatBar.visible && chatBar.hasInput, "chat bar visible and interactive over Scroll 2");

  console.log("— header auto-hide —");
  await page.evaluate(() => window.scrollTo({ top: 1000, behavior: "instant" }));
  await page.waitForTimeout(150);
  await page.evaluate(() => window.scrollTo({ top: 1100, behavior: "instant" }));
  await page.waitForTimeout(400);
  const hidden = await page.evaluate(() => {
    const h = document.querySelector("header");
    return { cls: h.className, rect: h.getBoundingClientRect().bottom };
  });
  ok(hidden.rect <= 0.5, `header hides on scroll down (bottom=${hidden.rect})`);
  await page.evaluate(() => window.scrollTo({ top: 1000, behavior: "instant" }));
  await page.waitForTimeout(400);
  const shown = await page.evaluate(() => {
    const h = document.querySelector("header");
    return { bottom: h.getBoundingClientRect().bottom, glass: h.className.includes("backdrop-blur") };
  });
  ok(shown.bottom > 0, "header reappears on scroll up");
  ok(shown.glass, "header glass when scrolled");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(400);
  const atTop = await page.evaluate(() => {
    const h = document.querySelector("header");
    return { bottom: h.getBoundingClientRect().bottom, glass: h.className.includes("backdrop-blur"), hidden: h.className.includes("-translate-y-full") };
  });
  ok(atTop.bottom > 0 && !atTop.glass && !atTop.hidden, "header identical to reference at scrollY=0");

  console.log("— drawer link scrolls to #scroll-2 —");
  await page.click('button[aria-label="منو"]');
  await page.waitForTimeout(500);
  await page.click('a[href="/#scroll-2"]');
  await page.waitForTimeout(1400);
  const afterNav = await page.evaluate(() => {
    const el = document.getElementById("scroll-2");
    return { scrollY: window.scrollY, top: el.getBoundingClientRect().top, drawerOpen: !!document.querySelector('[data-state="open"]') };
  });
  ok(Math.abs(afterNav.top) <= 2, `#scroll-2 top aligned to viewport top (top=${afterNav.top})`);
  ok(!afterNav.drawerOpen, "drawer closed after navigation");
  ok(errors.length === 0, `zero console errors (${errors.length}) ${errors.slice(0, 2).join(" | ")}`);
  await ctx.close();
}

// ---------- pass 2: reduced motion ----------
{
  console.log("— reduced motion —");
  const ctx = await browser.newContext({ viewport: { width: 450, height: 875 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  const rm = await page.evaluate(() => {
    const els = document.querySelectorAll("#scroll-2 .s2-reveal");
    return [...els].map((e) => getComputedStyle(e).opacity);
  });
  ok(rm.every((o) => o === "1"), "all content visible without scrolling under reduced motion");
  await ctx.close();
}

await browser.close();
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
