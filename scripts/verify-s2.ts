/**
 * Scroll 2 verification: screenshot #scroll-2 at 450x875@2x (chrome hidden,
 * section top at viewport top) and diff against upload/2.jpg (900x1750).
 *
 * Usage: bun scripts/verify-s2.ts shot|diff|all
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const OUT = "/home/z/my-project/analysis";
const REF = "/home/z/my-project/upload/2.jpg";
const SHOT = path.join(OUT, "shot-s2.png");
const HIDE = `header, div.fixed.inset-x-0 { display: none !important; }`;

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
  await page.addStyleTag({ content: HIDE });
  await page.evaluate(() => document.fonts.ready);
  // park #scroll-2 exactly at the viewport top (instant, no smooth scroll)
  await page.evaluate(() => {
    const el = document.getElementById("scroll-2")!;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
  });
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll("img")).every((i) => (i as HTMLImageElement).complete),
  );
  // ensure reveal completed (reduced-motion makes it instant, but be safe)
  await page.waitForTimeout(700);
  await page.screenshot({ path: SHOT });
  await browser.close();
  console.log("saved", SHOT);
}

async function diff() {
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
  fs.writeFileSync(path.join(OUT, "diff-s2.png"), PNG.sync.write(out));
  const sbs = await sharp({
    create: { width: ref.width * 2 + 20, height: ref.height, channels: 3, background: { r: 40, g: 44, b: 52 } },
  })
    .composite([
      { input: refBuf, left: 0, top: 0 },
      { input: fs.readFileSync(SHOT), left: ref.width + 20, top: 0 },
    ])
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(OUT, "side-s2.png"), sbs);
  // 50% overlay
  const overlay = await sharp(refBuf)
    .composite([{ input: fs.readFileSync(SHOT), blend: "over", raw: undefined }])
    .png()
    .toBuffer()
    .catch(() => null);
  // simpler: half-opacity blend
  const half = await sharp(fs.readFileSync(SHOT)).ensureAlpha(0.5).png().toBuffer();
  await sharp(refBuf)
    .composite([{ input: half, blend: "over" }])
    .png()
    .toFile(path.join(OUT, "overlay-s2.png"));
  void overlay;
  const total = ref.width * ref.height;
  console.log(`diff: ${n} px = ${((n / total) * 100).toFixed(2)}%`);
}

const cmd = process.argv[2];
if (cmd === "shot") await shot();
else if (cmd === "diff") await diff();
else if (cmd === "all") {
  await shot();
  await diff();
} else console.log("usage: verify-s2.ts shot|diff|all");
