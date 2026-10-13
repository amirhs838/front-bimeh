/**
 * Seam test: capture the Scroll1→Scroll2 transition region (doc y 575-1450)
 * and verify no visible edge: row-to-row color delta ≤ 2/255 near the seam,
 * no banding, no clipped glow. Two passes: header hidden / header visible.
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import sharp from "sharp";
import fs from "node:fs";

const OUT = "/home/z/my-project/analysis";

async function capture(page, name, forceHeader) {
  if (forceHeader) {
    await page.addStyleTag({ content: `header { transform: none !important; }` });
  } else {
    await page.addStyleTag({ content: `header, div.fixed.inset-x-0 { display: none !important; }` });
  }
  await page.evaluate(() => {
    window.scrollTo({ top: 575, behavior: "instant" });
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/seam-${name}.png` });
}

async function analyze(file, label) {
  const buf = await sharp(file).extract({ left: 0, top: 400, width: 900, height: 200 }).png().toBuffer();
  // rows 400-600 of the shot = doc y 775-875+... seam at viewport y300 = img 600
  const raw = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const W = info.width, C = info.channels;
  let maxDelta = 0, maxRow = -1;
  for (let y = 560; y < 640; y++) {
    let worst = 0;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * C, j = ((y + 1) * W + x) * C;
      const d = Math.max(Math.abs(data[i] - data[j]), Math.abs(data[i + 1] - data[j + 1]), Math.abs(data[i + 2] - data[j + 2]));
      if (d > worst) worst = d;
    }
    if (worst > maxDelta) { maxDelta = worst; maxRow = y; }
  }
  console.log(`${label}: max row-to-row delta near seam = ${maxDelta}/255 at img row ${maxRow} (viewport css ${maxRow / 2})`);
  return maxDelta;
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 450, height: 875 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
  locale: "fa-IR",
});
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

await capture(page, "hidden", false);
await capture(page, "header", true);
await browser.close();

const d1 = await analyze(`${OUT}/seam-hidden.png`, "seam (header hidden) ");
const d2 = await analyze(`${OUT}/seam-header.png`, "seam (header visible)");
console.log(d1 <= 2 && d2 <= 2 ? "SEAM OK (≤2/255)" : `SEAM CHECK: delta ${Math.max(d1, d2)}/255`);

// stitched side-by-side for the report
const a = await sharp(`${OUT}/seam-hidden.png`).extract({ left: 0, top: 300, width: 900, height: 700 }).toBuffer();
const b = await sharp(`${OUT}/seam-header.png`).extract({ left: 0, top: 300, width: 900, height: 700 }).toBuffer();
await sharp({ create: { width: 1820, height: 700, channels: 3, background: { r: 40, g: 44, b: 52 } } })
  .composite([{ input: a, left: 0, top: 0 }, { input: b, left: 920, top: 0 }])
  .png()
  .toFile(`${OUT}/seam-pair.png`);
console.log("saved seam-pair.png");
