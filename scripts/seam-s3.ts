/**
 * Seam test: capture the Scroll2→Scroll3 transition (doc y 1180-2100) and
 * verify no visible edge: row-to-row color delta <= 2/255 near the seam,
 * no banding, Scroll 2's wave/red curve/dot intact. Header hidden / shown.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";

const OUT = "/home/z/my-project/analysis";
// Scroll 2 section top = 0 (header in flow) + ... — find the doc-y of the
// seam (= #scroll-3 top) at runtime instead of hardcoding.
const SEAM_Y = `(document.getElementById("scroll-3").getBoundingClientRect().top + window.scrollY)`;

async function capture(page, name, forceHeader) {
  if (forceHeader) {
    await page.addStyleTag({ content: `header { transform: none !important; }` });
  } else {
    await page.addStyleTag({ content: `header, div.fixed.inset-x-0 { display: none !important; }` });
  }
  await page.evaluate((yOff) => {
    const seam = eval(yOff) as number;
    window.scrollTo({ top: seam - 320, behavior: "instant" });
  }, SEAM_Y);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/seam3-${name}.png` });
}

async function analyze(file, label) {
  const raw = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const W = info.width, C = info.channels;
  // seam sits at viewport y 320 css = img row 640; scan +-40 rows
  let maxDelta = 0, maxRow = -1;
  for (let y = 632; y < 652; y++) { // junction rows (seam at img 640)
    let worst = 0;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * C, j = ((y + 1) * W + x) * C;
      // skip chromatic ink pixels (red hairline curve / glowing dot AA)
      const spreadA = Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);
      const spreadB = Math.max(data[j], data[j + 1], data[j + 2]) - Math.min(data[j], data[j + 1], data[j + 2]);
      if (spreadA > 25 || spreadB > 25) continue;
      const d = Math.max(Math.abs(data[i] - data[j]), Math.abs(data[i + 1] - data[j + 1]), Math.abs(data[i + 2] - data[j + 2]));
      if (d > worst) worst = d;
    }
    if (worst > maxDelta) { maxDelta = worst; maxRow = y; }
  }
  console.log(`${label}: max row-to-row delta at junction = ${maxDelta}/255 at img row ${maxRow} (viewport css ${maxRow / 2})`);
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

const d1 = await analyze(`${OUT}/seam3-hidden.png`, "seam (header hidden) ");
const d2 = await analyze(`${OUT}/seam3-header.png`, "seam (header visible)");
console.log(d1 <= 2 && d2 <= 2 ? "SEAM OK (≤2/255)" : `SEAM CHECK: delta ${Math.max(d1, d2)}/255`);

// stitched side-by-side of the transition (doc y seam-320 .. seam+555)
const a = await sharp(`${OUT}/seam3-hidden.png`).extract({ left: 0, top: 0, width: 900, height: 855 }).toBuffer();
const b = await sharp(`${OUT}/seam3-header.png`).extract({ left: 0, top: 0, width: 900, height: 855 }).toBuffer();
await sharp({ create: { width: 1820, height: 855, channels: 3, background: { r: 40, g: 44, b: 52 } } })
  .composite([{ input: a, left: 0, top: 0 }, { input: b, left: 920, top: 0 }])
  .png()
  .toFile(`${OUT}/seam3-pair.png`);
console.log("saved seam3-pair.png");
void fs;
