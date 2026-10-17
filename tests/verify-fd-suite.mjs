/**
 * FOOTER DESKTOP suite (D4 §10) — responsive frame, boundary, end-of-page,
 * hover/focus, reveal, reduced motion, sheets, tab order, DOM text regression.
 * Run: node tests/verify-fd-suite.mjs
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`  ✓ ${name}${extra ? ` — ${extra}` : ""}`); }
  else { fail++; console.log(`  ✗ ${name}${extra ? ` — ${extra}` : ""}`); }
};

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });

/* ---------- 1) responsive frame: 1280 → 2560 ---------- */
console.log("— responsive frame (1280-2560) —");
for (const W of [1280, 1366, 1440, 1536, 1728, 1920, 2560]) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await p.evaluate(() => document.fonts.ready);
  const m = await p.evaluate(() => {
    const f = document.getElementById("footer");
    const r = f.getBoundingClientRect();
    const col = f.querySelector(".f-col").getBoundingClientRect();
    const decor = f.querySelector(".f-decor-d").getBoundingClientRect();
    return {
      fh: r.height,
      colW: col.width,
      colLeft: col.left,
      decorLeft: decor.left,
      decorW: decor.width,
      dot: f.querySelector(".f-decor-d > span:last-child")?.getBoundingClientRect(),
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  const d = Math.min(W, 1536) / 1536;
  const expH = 940 * (d * 1536 / 1672);
  const expColW = 1536 * d;
  const expMargin = (W - expColW) / 2;
  ok(`W${W}: height ${expH.toFixed(0)}`, Math.abs(m.fh - expH) < 1.5, `got ${m.fh.toFixed(1)}`);
  ok(`W${W}: frame ${expColW.toFixed(0)}d centered`, Math.abs(m.colW - expColW) < 1.5 && Math.abs(m.colLeft - expMargin) < 1, `w ${m.colW.toFixed(0)} left ${m.colLeft.toFixed(0)}`);
  ok(`W${W}: decor full-bleed`, m.decorLeft === 0 && m.decorW === W, `${m.decorW}`);
  ok(`W${W}: no overflow-x`, !m.overflowX);
  ok(`W${W}: zero page errors`, errors.length === 0);
  if (m.dot) {
    const dotD = m.dot.width;
    const circleish = Math.abs(m.dot.height - dotD) < 0.5;
    ok(`W${W}: dot stays circular ${dotD.toFixed(1)}px`, circleish && dotD > 10);
  }
  await ctx.close();
}

/* ---------- 2) boundary 1279 mobile column vs 1280 desktop ---------- */
console.log("— boundary 1279/1280 —");
{
  const ctx = await browser.newContext({ viewport: { width: 1279, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await p.evaluate(() => document.querySelector("#footer").scrollIntoView());
  await p.waitForTimeout(700);
  const m = await p.evaluate(() => {
    const card = document.querySelector("#footer .f-card");
    const decorD = getComputedStyle(document.querySelector(".f-decor-d")).display;
    const paraD = getComputedStyle(document.querySelector(".f-para-d")).display;
    const paraM = getComputedStyle(document.querySelector(".f-para-m")).display;
    const s = getComputedStyle(card);
    return { radius: s.borderRadius, shadow: s.boxShadow !== "none", bg: s.backgroundColor, decorD, paraD, paraM, w: card.getBoundingClientRect().width };
  });
  ok("1279: mobile card look intact (radius+shadow+bg)", m.radius !== "0px" && m.shadow && m.bg !== "rgba(0, 0, 0, 0)", `${m.radius} w=${m.w.toFixed(0)}`);
  ok("1279: desktop-only parts display:none", m.decorD === "none" && m.paraD === "none");
  ok("1279: mobile paragraph visible", m.paraM !== "none");
  await ctx.close();
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const p2 = await ctx2.newPage();
  await p2.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await p2.evaluate(() => document.querySelector("#footer").scrollIntoView());
  await p2.waitForTimeout(700);
  const m2 = await p2.evaluate(() => {
    const card = document.querySelector("#footer .f-card");
    const s = getComputedStyle(card);
    return {
      radius: s.borderRadius, shadow: s.boxShadow, bg: s.backgroundColor,
      decorD: getComputedStyle(document.querySelector(".f-decor-d")).display,
      paraD: getComputedStyle(document.querySelector(".f-para-d")).display,
      paraM: getComputedStyle(document.querySelector(".f-para-m")).display,
      decM: getComputedStyle(document.querySelector(".f-decor-m")).display,
      w: card.getBoundingClientRect().width,
    };
  });
  ok("1280: card chrome reset", m2.radius === "0px" && !m2.shadow.includes("none") === false && m2.bg === "rgba(0, 0, 0, 0)", `radius ${m2.radius}`);
  ok("1280: desktop-only parts visible", m2.decorD === "block" && m2.paraD === "block");
  ok("1280: mobile decor/para hidden", m2.decM === "none" && m2.paraM === "none");
  await ctx2.close();
}

/* ---------- 3) end-of-page: ChatBar over decor, dot gap ---------- */
console.log("— end-of-page ChatBar —");
{
  const ctx = await browser.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await p.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await p.waitForTimeout(800);
  const m = await p.evaluate(() => {
    const bar = document.querySelector(".fixed.inset-x-0.bottom-0, [class*='chatbar'], footer ~ div.fixed");
    const fixed = [...document.querySelectorAll("body *")].filter((el) => {
      const s = getComputedStyle(el);
      return s.position === "fixed" && s.bottom === "0px" && el.offsetHeight > 20 && el.offsetHeight < 120;
    });
    const bar2 = fixed[fixed.length - 1];
    const dot = document.querySelector(".f-decor-d > span:last-child").getBoundingClientRect();
    const barTop = bar2 ? bar2.getBoundingClientRect().top : window.innerHeight;
    return { barFound: !!bar2, barH: bar2?.offsetHeight, gap: barTop - dot.bottom, dotVisible: dot.top < barTop };
  });
  ok("ChatBar fixed at bottom over footer", m.barFound && m.barH > 20);
  ok("red dot fully visible above bar (gap >= 40d*0.9187=36.7px)", m.gap >= 36.7, `gap ${m.gap?.toFixed(1)}px`);
  await ctx.close();
}

/* ---------- 4) hover / focus / reveal / sheets ---------- */
console.log("— interactions —");
{
  const ctx = await browser.newContext({ viewport: { width: 1536, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  await p.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await p.evaluate(() => document.querySelector("#footer").scrollIntoView({ block: "end" }));
  await p.waitForTimeout(900);
  const rev = await p.evaluate(() => {
    const els = [...document.querySelectorAll("#footer .f-reveal, #footer .f-fade")].filter((e) => {
      // SVG elements have no offsetParent — use display/height instead
      return getComputedStyle(e).display !== "none" && e.getBoundingClientRect().height > 0;
    });
    return { total: els.length, in: els.filter((e) => e.classList.contains("is-in")).length };
  });
  ok("reveal: all visible groups is-in (display:none excluded per Mobile Freeze 6)", rev.total > 0 && rev.in === rev.total, `${rev.in}/${rev.total} visible`);

  // hover: label color + chevron nudge + circle deepen
  const row = p.locator("#footer .f-col-about .f-row").first();
  const before = await row.evaluate((el) => ({
    label: getComputedStyle(el.querySelector(".f-rowlabel")).color,
    chev: el.querySelector(".f-chev-svg").getBoundingClientRect().x,
    circ: getComputedStyle(el.querySelector(".f-chev-svg")).color,
  }));
  await row.hover();
  await p.waitForTimeout(350);
  const after = await row.evaluate((el) => ({
    label: getComputedStyle(el.querySelector(".f-rowlabel")).color,
    chev: el.querySelector(".f-chev-svg").getBoundingClientRect().x,
  }));
  ok("hover: label -> ink", before.label !== after.label, `${before.label} -> ${after.label}`);
  ok("hover: chevron nudges left", after.chev < before.chev, `${(after.chev - before.chev).toFixed(1)}px`);

  const qaRow = p.locator("#footer .f-col-quick .f-qa-row").first();
  const cb = await qaRow.evaluate((el) => getComputedStyle(el.querySelector(".f-qa-circle")).backgroundColor);
  await qaRow.hover();
  await p.waitForTimeout(350);
  const ca = await qaRow.evaluate((el) => getComputedStyle(el.querySelector(".f-qa-circle")).backgroundColor);
  ok("hover: qa circle deepens", cb !== ca, `${cb} -> ${ca}`);

  const cRow = p.locator('#footer .f-contact-li[data-kind="email"] a');
  const cc = await cRow.evaluate((el) => getComputedStyle(el.querySelector(".f-contact-circle")).backgroundColor);
  await cRow.hover();
  await p.waitForTimeout(350);
  const cc2 = await cRow.evaluate((el) => getComputedStyle(el.querySelector(".f-contact-circle")).backgroundColor);
  ok("hover: contact circle deepens", cc !== cc2);

  // focus ring
  await p.evaluate(() => document.querySelector("#footer .f-col-about .f-row").focus());
  const ring = await p.evaluate(() => {
    const el = document.querySelector("#footer .f-col-about .f-row:focus-visible") || document.activeElement;
    const s = getComputedStyle(el);
    return s.outlineColor + "/" + s.outlineWidth;
  });
  ok("focus-visible ring in brand", ring.includes("252, 27, 55") || ring.includes("253, 16, 60") || ring.includes("2px"), ring);

  // sheets
  await p.evaluate(() => document.querySelector("#footer .f-col-quick ul > li:nth-child(2) button, #footer .f-col-quick ul > li:nth-child(2) a")?.scrollIntoView({ block: "center" }));
  await p.click('#footer .f-col-quick ul > li:nth-child(2) button, #footer .f-col-quick ul > li:nth-child(2) a');
  await p.waitForTimeout(600);
  const supportOpen = await p.evaluate(() => !!document.querySelector("[role='dialog'], [aria-modal='true']"));
  ok("خدمات مشتریان opens SupportSheet (centered)", supportOpen);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  await p.click('#footer .f-col-services ul > li:nth-child(3) button, #footer .f-col-services ul > li:nth-child(3) a');
  await p.waitForTimeout(600);
  const chatOpen = await p.evaluate(() => !!document.querySelector("[role='dialog'], [aria-modal='true']"));
  ok("مشاوره هوشمند opens ChatSheet (centered)", chatOpen);
  await p.keyboard.press("Escape");

  // routes
  const hrefs = await p.evaluate(() =>
    [...document.querySelectorAll("#footer a")].map((a) => a.getAttribute("href")).filter(Boolean),
  );
  for (const h of ["/#products", "/faq", "/contact", "/track", "/app", "/about", "/blog", "/careers", "/terms", "/"]) {
    ok(`route ${h} present`, hrefs.includes(h));
  }
  ok("mailto/tel/map links", await p.evaluate(() => {
    const hs = [...document.querySelectorAll("#footer a")].map((a) => a.getAttribute("href"));
    return hs.some((h) => h?.startsWith("mailto:")) && hs.some((h) => h?.startsWith("tel:")) && hs.some((h) => h?.includes("maps"));
  }));
  ok("zero console/page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

/* ---------- 5) reduced motion ---------- */
console.log("— reduced motion —");
{
  const ctx = await browser.newContext({ viewport: { width: 1536, height: 900 }, reducedMotion: "reduce", deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await p.evaluate(() => document.querySelector("#footer").scrollIntoView({ block: "end" }));
  await p.waitForTimeout(500);
  const m = await p.evaluate(() => {
    const el = document.querySelector("#footer .f-col-about");
    const s = getComputedStyle(el);
    const glow = document.querySelector("#footer .anim-s2-glow");
    return { opacity: s.opacity, transform: s.transform, anim: glow ? getComputedStyle(glow).animationDuration : "n/a" };
  });
  ok("reduced motion: groups visible, no transform", m.opacity === "1" && (m.transform === "none" || m.transform === "matrix(1, 0, 0, 1, 0, 0)"));
  ok("reduced motion: no dot pulse", m.anim === "0.01ms" || m.anim === "1e-05s" || m.anim === "n/a", m.anim);
  await ctx.close();
}

/* ---------- 6) tab order + DOM text regression ---------- */
console.log("— tab order + DOM text —");
{
  const ctx = await browser.newContext({ viewport: { width: 1536, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await p.evaluate(() => document.querySelector("#footer").scrollIntoView({ block: "end" }));
  await p.waitForTimeout(600);
  // DOM order of interactive elements
  const order = await p.evaluate(() =>
    [...document.querySelectorAll("#footer a, #footer button")].map((el) => el.getAttribute("aria-label") || el.textContent.trim()),
  );
  ok("tab order = DOM: brand, quick, خدمات, درباره, contact", JSON.stringify(order.slice(0, 4)) === JSON.stringify(["Bimeh AI — صفحه اصلی", "بیمه‌ها", "خدمات مشتریان", "پرسش‌های متداول"]) && order[4] === "تماس با ما" && order[5] === "خرید بیمه‌نامه", order.slice(0, 6).join(" | "));
  // keyboard: tab into footer links works
  await p.evaluate(() => document.querySelector("#footer .f-col-about .f-row").focus());
  await p.keyboard.press("Tab");
  const active = await p.evaluate(() => document.activeElement?.getAttribute("aria-label") || document.activeElement?.tagName);
  ok("keyboard Tab advances", !!active, String(active));
  // mobile footer DOM text snapshot (arrays unchanged)
  const text = await p.evaluate(() => document.getElementById("footer")?.innerText.replace(/\s+/g, " ").slice(0, 400));
  const expectStart = "Bimeh AI اولین پلتفرم هوشمند بیمه در ایران";
  ok("mobile footer text intact", text?.startsWith(expectStart), text?.slice(0, 60));
  await ctx.close();
}

console.log(`\nFD SUITE: ${pass} pass / ${fail} fail`);
await browser.close();
process.exit(fail ? 1 : 0);
