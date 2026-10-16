/**
 * INTERIM ELEMENT CAPTURE (desktop-s2 master prompt §0.1)
 * Captures element screenshots at 1280/1536/1920 BEFORE the desktop Scroll 2
 * build, as the regression baseline for the interim (mobile-column) renders:
 *   - #scroll-1 clipped to its top 930d (y=0..930 at 1536 scale)
 *   - #scroll-3 (element)
 *   - #footer (element)
 * Usage: node tests/interim-capture.mjs <outdir>
 */
import { chromium } from "playwright";
import fs from "node:fs";

const OUT = process.argv[2] ?? "/home/z/my-project/tests/interim-s2d-before";
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });

for (const W of [1280, 1536, 1920]) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 1024 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 60000 });
  await p.addStyleTag({
    content: `*,*::before,*::after{animation-play-state:paused !important;transition:none !important;}
      header,div.fixed.inset-x-0{display:none !important;}
      html{scroll-behavior:auto !important;}`,
  });
  await p.evaluate(async () => {
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))]);
    document.querySelectorAll(".s2-reveal,.s3-reveal,.s3-fade,.f-reveal,.f-fade").forEach((el) => el.classList.add("is-in"));
    await Promise.all(Array.from(document.images).filter((i) => !i.complete).map((i) => new Promise((r) => ((i.onload = r), (i.onerror = r)))));
  });
  await p.waitForTimeout(500);
  const s1 = await p.$(".s1-root");
  const s1box = await s1.boundingBox();
  const s1H = await p.evaluate(() => document.querySelector(".s1-root").getBoundingClientRect().height);
  // scale: 930d at 1536 → at width W the same proportional band
  const band = Math.round((930 / 1536) * W);
  await p.screenshot({ path: `${OUT}/s1-top-${W}.png`, clip: { x: 0, y: 0, width: W, height: Math.min(band, Math.round(s1box.height)) } });
  void s1H;
  for (const [name, sel] of [["s3", "#scroll-3"], ["footer", "#footer"]]) {
    const el = await p.$(sel);
    await el.scrollIntoViewIfNeeded();
    await p.waitForTimeout(250);
    await el.screenshot({ path: `${OUT}/${name}-${W}.png` });
  }
  await ctx.close();
  console.log(`W=${W} done`);
}
await browser.close();
console.log("INTERIM CAPTURE DONE →", OUT);
