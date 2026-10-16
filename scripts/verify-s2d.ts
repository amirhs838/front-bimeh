/**
 * DESKTOP SCROLL 2 verification (master prompt §10.1-10.2):
 * viewport 1536x1024 DPR1, chrome hidden, #scroll-2 top at viewport top,
 * animations frozen at their first frame; screenshot vs D2 (native size).
 *
 * Usage: bun scripts/verify-s2d.ts shot|diff|all
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const OUT = "/home/z/my-project/analysis";
const REF = "/home/z/my-project/upload/Bimeh AI Smart Insurance Features.png";
const SHOT = path.join(OUT, "shot-s2d.png");
const HIDE = `header, div.fixed.inset-x-0, .dk-select { display: none !important; }`;
const FREEZE = `*,*::before,*::after{animation-play-state:paused !important;animation-delay:0s !important;transition:none !important;caret-color:transparent !important;}`;

async function shot() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1536, height: 1024 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    locale: "fa-IR",
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE + FREEZE });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    const el = document.getElementById("scroll-2")!;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
  });
  // wait for VISIBLE images only — display:none lazy imgs (mobile bands on
  // desktop) never fetch by design; race-guard the rest like median-capture
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll("img"))
        .filter((i) => (i.offsetWidth ?? 0) > 0)
        .every((i) => (i as HTMLImageElement).complete),
    { timeout: 20000 },
  );
  await page.waitForTimeout(700);
  await page.screenshot({ path: SHOT });
  await browser.close();
  console.log("saved", SHOT);
}

async function diff() {
  const refBuf = await sharp(REF).png().toBuffer();
  const ref = PNG.sync.read(refBuf);
  const shot = PNG.sync.read(fs.readFileSync(SHOT));
  if (shot.width !== ref.width || shot.height !== ref.height) {
    console.error(`size mismatch: shot ${shot.width}x${shot.height} vs ref ${ref.width}x${ref.height}`);
    process.exit(1);
  }
  const out = new PNG({ width: ref.width, height: ref.height });
  const n = pixelmatch(ref.data, shot.data, out.data, ref.width, ref.height, {
    threshold: 0.12,
    includeAA: false,
    alpha: 0.1,
  });
  fs.writeFileSync(path.join(OUT, "diff-s2d.png"), PNG.sync.write(out));
  const half = await sharp(fs.readFileSync(SHOT)).ensureAlpha(0.5).png().toBuffer();
  await sharp(refBuf).composite([{ input: half, blend: "over" }]).png().toFile(path.join(OUT, "overlay-s2d.png"));
  const sbs = await sharp({
    create: { width: ref.width * 2 + 20, height: ref.height, channels: 3, background: { r: 40, g: 44, b: 52 } },
  })
    .composite([
      { input: refBuf, left: 0, top: 0 },
      { input: fs.readFileSync(SHOT), left: ref.width + 20, top: 0 },
    ])
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(OUT, "side-s2d.png"), sbs);
  const total = ref.width * ref.height;
  console.log(`diff: ${n} px = ${((n / total) * 100).toFixed(3)}%`);
}

const cmd = process.argv[2];
if (cmd === "shot") await shot();
else if (cmd === "diff") await diff();
else if (cmd === "all") {
  await shot();
  await diff();
} else console.log("usage: verify-s2d.ts shot|diff|all");
