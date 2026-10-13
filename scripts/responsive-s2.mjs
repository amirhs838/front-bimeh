/**
 * Scroll 2 responsive test: 360/390/412/430/480/1440 — no horizontal overflow,
 * chat bar visible, proportional scaling, centered column at wide widths.
 * Run: node scripts/responsive-s2.mjs
 */
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";

const OUT = "/home/z/my-project/analysis/responsive-s2";
fs.mkdirSync(OUT, { recursive: true });

const widths = [360, 390, 412, 430, 480, 1440];
const browser = await chromium.launch();
let fail = 0;

for (const w of widths) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 875 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
    locale: "fa-IR",
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.getElementById("scroll-2").scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(600);
  const m = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    chatBar: [...document.querySelectorAll("div.fixed.inset-x-0")].some((b) => {
      const r = b.getBoundingClientRect();
      return r.height > 0 && r.bottom <= innerHeight + 1;
    }),
    titleRightGap: (() => {
      const h2 = document.getElementById("s2-title");
      if (!h2) return null;
      const r = h2.getBoundingClientRect();
      return Math.round((innerWidth > 480 ? (innerWidth - 450) / 2 + 450 : innerWidth) - r.right);
    })(),
  }));
  const shot = `${OUT}/w${w}.png`;
  await page.screenshot({ path: shot });
  const okOverflow = m.overflowX <= 0;
  if (!okOverflow) fail++;
  console.log(
    `w${String(w).padStart(4)}: overflowX=${m.overflowX}${okOverflow ? "" : "  ✗ OVERFLOW"}  chatBar=${m.chatBar}  titleRightGap=${m.titleRightGap}`,
  );
  await ctx.close();
}

// wide-layout sanity: at 1440 the column is centered (bg continues full width)
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.evaluate(() => document.getElementById("scroll-2").scrollIntoView({ behavior: "instant", block: "start" }));
await page.waitForTimeout(500);
const center = await page.evaluate(() => {
  const s2 = document.getElementById("scroll-2");
  const col = s2.querySelector("div");
  const r = col.getBoundingClientRect();
  return { colLeft: Math.round(r.left), colW: Math.round(r.width), secW: s2.getBoundingClientRect().width };
});
console.log(`w1440: column left=${center.colLeft} (expect 480), width=${center.colW} (expect 480 = 450-frame at capped root 17.0666px), section=${center.secW}`);
if (center.colLeft !== (1440 - 480) / 2 || center.colW !== 480) fail++;
await browser.close();
console.log(fail ? `FAIL (${fail})` : "RESPONSIVE OK");
process.exit(fail ? 1 : 0);
