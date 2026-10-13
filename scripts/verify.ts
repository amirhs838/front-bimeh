/**
 * Screenshot the app at the reference viewport (450x875 @2x) and diff
 * against the reference image with pixelmatch.
 *
 * Usage:
 *   bun scripts/verify.ts shot   -> writes analysis/shot.png (900x1750)
 *   bun scripts/verify.ts diff   -> writes analysis/diff.png + prints diff %
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const OUT = "/home/z/my-project/analysis";
const REF = "/home/z/my-project/upload/1.jpg";
const SHOT = path.join(OUT, "shot.png");

async function shot() {
  fs.mkdirSync(OUT, { recursive: true });
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
  await page.waitForTimeout(600);
  await page.screenshot({ path: SHOT });
  await browser.close();
  console.log("saved", SHOT);
}

async function diff() {
  // reference resized to 900x1750
  const refBuf = await sharp(REF).resize(900, 1750, { kernel: "lanczos3" }).png().toBuffer();
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
  fs.writeFileSync(path.join(OUT, "diff.png"), PNG.sync.write(out));
  // side-by-side
  const sbs = await sharp({
    create: { width: ref.width * 2 + 20, height: ref.height, channels: 3, background: { r: 40, g: 44, b: 52 } },
  })
    .composite([
      { input: refBuf, left: 0, top: 0 },
      { input: fs.readFileSync(SHOT), left: ref.width + 20, top: 0 },
    ])
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(OUT, "side.png"), sbs);
  const total = ref.width * ref.height;
  console.log(`diff: ${n} px = ${((n / total) * 100).toFixed(2)}%`);
}

const cmd = process.argv[2];
if (cmd === "shot") await shot();
else if (cmd === "diff") await diff();
else if (cmd === "all") {
  await shot();
  await diff();
} else console.log("usage: verify.ts shot|diff|all");
