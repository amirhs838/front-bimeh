/**
 * Scroll 3 interaction tests (node; run: node scripts/e2e-s3.mjs)
 * Covers: reveal-on-scroll, notification hotspot -> ChatSheet seeded with the
 * assistant greeting, sr-only banner copy, drawer link scroll, chat bar over
 * Scroll 3, no horizontal overflow, reduced-motion visibility, zero errors.
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
  const ctx = await browser.newContext({ viewport: { width: 450, height: 929 }, deviceScaleFactor: 2, locale: "fa-IR" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "networkidle" });

  console.log("— structure —");
  const struct = await page.evaluate(() => ({
    section: !!document.getElementById("scroll-3"),
    labelled: document.getElementById("scroll-3")?.getAttribute("aria-labelledby") === "s3-title",
    title: document.getElementById("s3-title")?.textContent.includes("اولین پلتفرم"),
    cards: document.querySelectorAll("#scroll-3 li").length,
    srText: document.querySelector("#scroll-3 .sr-only")?.textContent.includes("1m ago"),
    footerAfter: !!document.getElementById("footer"),
    hScroll: document.documentElement.scrollWidth > window.innerWidth,
  }));
  ok(struct.section && struct.labelled && struct.title, "section semantics (#scroll-3 / s3-title)");
  ok(struct.cards === 5, `5 feature cards — got ${struct.cards}`);
  ok(struct.srText, "visually-hidden notification copy present");
  ok(struct.footerAfter, "footer#footer present after the section");
  ok(!struct.hScroll, "no horizontal scroll at 450");

  console.log("— reveal on scroll —");
  const before = await page.evaluate(() => {
    const el = document.querySelector("#scroll-3 li");
    return el ? el.classList.contains("is-in") : null;
  });
  ok(before === false, "cards not revealed before scroll (below fold)");
  await page.evaluate(() => document.getElementById("scroll-3").scrollIntoView({ behavior: "instant", block: "start" }));
  await page.waitForTimeout(1200);
  const revealed = await page.evaluate(() => {
    // desktop-only parts (e.g. the >=1280 CTA) are display:none on mobile —
    // the reveal observer ignores them (master prompt §Mobile Freeze 6), so
    // only elements with a layout box participate in the visibility check.
    const els = [...document.querySelectorAll("#scroll-3 .s3-reveal, #scroll-3 .s3-fade")].filter((e) => e.getClientRects().length > 0);
    return {
      count: els.length,
      allIn: [...els].every((e) => e.classList.contains("is-in")),
      opacities: [...els].map((e) => getComputedStyle(e).opacity),
    };
  });
  ok(revealed.allIn, `all ${revealed.count} s3 reveal elements visible after scroll`);
  ok(revealed.opacities.every((o) => o === "1"), "all revealed at full opacity");

  console.log("— notification hotspot —");
  await page.evaluate(() => {
    const b = document.querySelector('#scroll-3 button[aria-label="شروع گفتگو با هوش مصنوعی"]');
    b.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await page.waitForTimeout(300);
  const hit = await page.evaluate(() => {
    const b = document.querySelector('#scroll-3 button[aria-label="شروع گفتگو با هوش مصنوعی"]');
    const r = b.getBoundingClientRect();
    return { w: r.width, h: r.height };
  });
  ok(hit.h >= 44 && hit.w >= 44, `hotspot hit area >= 44px (${Math.round(hit.w)}x${Math.round(hit.h)})`);
  await page.click('#scroll-3 button[aria-label="شروع گفتگو با هوش مصنوعی"]');
  await page.waitForTimeout(700);
  const chat = await page.evaluate(() => {
    const dlg = [...document.querySelectorAll('[role="dialog"]')].find((d) => d.textContent.includes("چت با هوش مصنوعی"));
    const firstBot = dlg?.querySelector(".chat-scroll > div");
    return {
      open: !!dlg,
      firstMsg: firstBot?.textContent ?? "",
      isBot: !!firstBot && !firstBot.textContent.includes("ارسال پیام ناموفق"),
    };
  });
  ok(chat.open, "ChatSheet opens from the banner hotspot");
  ok(
    chat.firstMsg.includes("سلام!") && chat.firstMsg.includes("بررسی کنم؟"),
    `first assistant message is the notification text ("${chat.firstMsg.slice(0, 30)}…")`,
  );
  ok(chat.isBot, "seeded message rendered as an assistant bubble (no API error)");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  console.log("— drawer link scrolls to #scroll-3 —");
  await page.click('button[aria-label="منو"]');
  await page.waitForTimeout(500);
  const hasLink = await page.isVisible('a[href="/#scroll-3"]');
  ok(hasLink, 'drawer contains "مزایای Bimeh AI" link');
  await page.click('a[href="/#scroll-3"]');
  await page.waitForTimeout(1500);
  const afterNav = await page.evaluate(() => {
    const el = document.getElementById("scroll-3");
    return { top: el.getBoundingClientRect().top, drawerOpen: !!document.querySelector('[data-state="open"]') };
  });
  ok(Math.abs(afterNav.top) <= 2, `#scroll-3 top aligned to viewport top (top=${afterNav.top.toFixed(1)})`);
  ok(!afterNav.drawerOpen, "drawer closed after navigation");

  console.log("— chrome over Scroll 3 —");
  const chrome = await page.evaluate(() => {
    const bar = [...document.querySelectorAll("div.fixed.inset-x-0")].pop();
    const r = bar?.getBoundingClientRect();
    return { barVisible: r && r.height > 0 && r.bottom <= window.innerHeight + 1, header: !!document.querySelector("header") };
  });
  ok(chrome.barVisible, "chat bar visible and interactive over Scroll 3");
  ok(errors.length === 0, `zero console errors (${errors.length}) ${errors.slice(0, 2).join(" | ")}`);
  await ctx.close();
}

// ---------- pass 2: reduced motion ----------
{
  console.log("— reduced motion —");
  const ctx = await browser.newContext({ viewport: { width: 450, height: 929 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  const rm = await page.evaluate(() => {
    const els = document.querySelectorAll("#scroll-3 .s3-reveal, #scroll-3 .s3-fade");
    return [...els].map((e) => getComputedStyle(e).opacity);
  });
  ok(rm.length >= 8 && rm.every((o) => o === "1"), "all Scroll 3 content visible without scrolling under reduced motion");
  await ctx.close();
}

await browser.close();
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
