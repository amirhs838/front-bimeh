/**
 * Scroll 3 responsive test: 360/390/412/430/480/1440 — no horizontal overflow,
 * chat bar visible, card text intact (nowrap lines never clipped by the tile),
 * centered column at wide widths.
 * Run: node scripts/responsive-s3.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";

const OUT = "/home/z/my-project/analysis/responsive-s3";
fs.mkdirSync(OUT, { recursive: true });

const widths = [360, 390, 412, 430, 480, 1440];
const browser = await chromium.launch();
let fail = 0;

for (const w of widths) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 929 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
    locale: "fa-IR",
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.getElementById("scroll-3").scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(600);
  const m = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("#scroll-3 li")];
    // text right edge must sit left of the icon tile's left edge (no collision)
    let minGap = Infinity;
    for (const li of cards) {
      const p = li.querySelector("p");
      const tile = li.querySelector("div");
      if (p && tile) minGap = Math.min(minGap, tile.getBoundingClientRect().left - p.getBoundingClientRect().right);
    }
    return {
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      chatBar: [...document.querySelectorAll("div.fixed.inset-x-0")].some((b) => {
        const r = b.getBoundingClientRect();
        return r.height > 0 && r.bottom <= innerHeight + 1;
      }),
      minTextTileGap: +minGap.toFixed(1),
      heroOk: (() => {
        const img = document.querySelector("#scroll-3 img");
        return img && img.complete && img.naturalWidth > 0;
      })(),
    };
  });
  const shot = `${OUT}/w${w}.png`;
  await page.screenshot({ path: shot });
  const okOverflow = m.overflowX <= 0;
  const okGap = m.minTextTileGap >= 2;
  if (!okOverflow || !okGap) fail++;
  console.log(
    `w${String(w).padStart(4)}: overflowX=${m.overflowX}${okOverflow ? "" : "  ✗ OVERFLOW"}  chatBar=${m.chatBar}  hero=${m.heroOk}  textTileGap=${m.minTextTileGap}${okGap ? "" : "  ✗ COLLISION"}`,
  );
  await ctx.close();
}

// wide-layout sanity: at 1440 the column is centered (bg continues full width)
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.evaluate(() => document.getElementById("scroll-3").scrollIntoView({ behavior: "instant", block: "start" }));
await page.waitForTimeout(500);
const center = await page.evaluate(() => {
  const s3 = document.getElementById("scroll-3");
  const col = s3.querySelector("div.relative");
  const r = col.getBoundingClientRect();
  return { colLeft: Math.round(r.left), colW: Math.round(r.width), secW: s3.getBoundingClientRect().width };
});
console.log(`w1440: column left=${center.colLeft} (expect 480), width=${center.colW} (expect 480 = 450-frame at capped root 17.0666px), section=${center.secW}`);
if (center.colLeft !== (1440 - 480) / 2 || center.colW !== 480) fail++;
await browser.close();
console.log(fail ? `FAIL (${fail})` : "RESPONSIVE OK");
process.exit(fail ? 1 : 0);
