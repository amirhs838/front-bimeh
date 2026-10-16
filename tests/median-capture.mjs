/**
 * MEDIAN CAPTURE — deterministic screenshot baseline (toolchain noise fix).
 *
 * The headless Chromium build rasterizes (some) WebP images into one of two
 * states depending on a decode/raster cache race, so single captures are
 * non-deterministic (~0.06-0.17% edge noise on identical code+browser).
 * The noise is BIMODAL per image, so the PER-PIXEL MEDIAN of N captures is
 * perfectly stable (verified: median(1..3) vs median(3..5) = 0 px).
 *
 * Usage: node tests/median-capture.mjs <url> <out.png> <W> <H> [dpr] [clipH] [n]
 *   Full-page mode when clipH is "full" (viewport stretched to scrollHeight).
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import fs from "node:fs";

const [, , url, out, wS, hS, dprS, clipHS, nS] = process.argv;
const W = Number(wS ?? 1536);
const H = Number(hS ?? 1024);
const DPR = Number(dprS ?? 1);
const clipH = clipHS === "full" ? "full" : Number(clipHS ?? H);
const N = Number(nS ?? 5);

const FREEZE_CSS = `
  *, *::before, *::after {
    animation-play-state: paused !important;
    animation-delay: 0s !important;
    transition: none !important;
    caret-color: transparent !important;
  }
  html { scroll-behavior: auto !important; }
  nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button] { display: none !important; }
`;

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });

async function captureOnce() {
  const ctx = await browser.newContext({
    viewport: { width: W, height: clipH === "full" ? 900 : clipH },
    deviceScaleFactor: DPR,
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.addStyleTag({ content: FREEZE_CSS });
  await page.evaluate(async (t) => {
    const r = (p, ms) => Promise.race([p, new Promise((res) => setTimeout(res, ms))]);
    await r(document.fonts.ready, 5000);
    sessionStorage.clear();
    localStorage.clear();
  }, 0).catch(() => {});
  await page.reload({ waitUntil: "networkidle", timeout: 60000 });
  await page.addStyleTag({ content: FREEZE_CSS });
  await page.evaluate(async () => {
    const r = (p, ms) => Promise.race([p, new Promise((res) => setTimeout(res, ms))]);
    await r(document.fonts.ready, 5000);
    document
      .querySelectorAll(".s2-reveal,.s3-reveal,.s3-fade,.f-reveal,.f-fade")
      .forEach((el) => el.classList.add("is-in"));
    await r(
      Promise.all(
        Array.from(document.images)
          .filter((i) => !i.complete)
          .map((i) => new Promise((res) => ((i.onload = res), (i.onerror = res))))
      ),
      8000
    );
  }).catch(() => {});
  await page.waitForTimeout(500);
  let clip;
  if (clipH === "full") {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width: W, height: Math.min(h, 12000) });
    await page.waitForTimeout(600);
    clip = { x: 0, y: 0, width: W, height: Math.min(h, 12000) };
  } else {
    clip = { x: 0, y: 0, width: W, height: clipH };
  }
  const buf = await page.screenshot({ clip });
  await ctx.close();
  return buf;
}

const pngs = [];
for (let i = 0; i < N; i++) {
  pngs.push(PNG.sync.read(await captureOnce()));
  process.stdout.write(`run ${i + 1}/${N} done\n`);
}
await browser.close();

const { width, height } = pngs[0];
const med = new PNG({ width, height });
const n = pngs.length;
const mid = n >> 1;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const base = (y * width + x) * 4;
    for (let c = 0; c < 3; c++) {
      const vals = [];
      for (const p of pngs) vals.push(p.data[base + c]);
      vals.sort((a, b) => a - b);
      med.data[base + c] = vals[mid];
    }
    med.data[base + 3] = 255;
  }
  process.stdout.write(`row ${y}/${height}\r`);
}
fs.writeFileSync(out, PNG.sync.write(med));
console.log(`\nMEDIAN CAPTURE (${n} runs) → ${out} ${width}x${height}`);
