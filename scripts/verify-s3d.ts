/**
 * DESKTOP SCROLL 3 verification (master prompt §10.1-10.2):
 * viewport 1536x1064 (= D3 frame 1507x1044 * 1536/1507), DPR1, chrome hidden,
 * #scroll-3 top at viewport top; screenshot vs D3 resized to 1536x1064.
 * The header band (y < 92 rows = 90p * f) is EXCLUDED from the numeric diff
 * (shared Header wins over D3's header) but kept in the visual artifacts.
 *
 * Usage: bun scripts/verify-s3d.ts shot|diff|all
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const OUT = "/home/z/my-project/analysis";
const REF = "/home/z/my-project/upload/Bimeh AI Persian Landing Page.png";
const SHOT = path.join(OUT, "shot-s3d.png");
const RW = 1536;
const RH = 1064; // round(1044 * 1536 / 1507) = 1063.95
const BAND = 92; // header band rows excluded (90p * 1.019244)
const HIDE = `header, div.fixed.inset-x-0, .dk-select { display: none !important; }`;
const FREEZE = `*,*::before,*::after{animation-play-state:paused !important;animation-delay:0s !important;transition:none !important;caret-color:transparent !important;}`;

async function shot(dpr = 1) {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
  const ctx = await browser.newContext({
    viewport: { width: 1536, height: RH },
    deviceScaleFactor: dpr,
    reducedMotion: "reduce",
    locale: "fa-IR",
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE + FREEZE });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    const el = document.getElementById("scroll-3")!;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
  });
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll("img"))
        .filter((i) => (i.offsetWidth ?? 0) > 0)
        .every((i) => (i as HTMLImageElement).complete),
    { timeout: 20000 },
  );
  await page.waitForTimeout(700);
  await page.screenshot({ path: dpr === 1 ? SHOT : path.join(OUT, `shot-s3d-dpr2.png`) });
  await browser.close();
  console.log("saved", dpr === 1 ? SHOT : "shot-s3d-dpr2.png");
}

function maskBand(img: PNG) {
  for (let y = 0; y < BAND; y++)
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 128;
    }
}

async function diff() {
  // reference: D3 resized to the render frame
  const refBuf = await sharp(REF).resize(RW, RH, { kernel: "lanczos3" }).png().toBuffer();
  const ref = PNG.sync.read(refBuf);
  const shot = PNG.sync.read(fs.readFileSync(SHOT));
  if (shot.width !== RW || shot.height !== RH) {
    console.error(`size mismatch: shot ${shot.width}x${shot.height} vs frame ${RW}x${RH}`);
    process.exit(1);
  }
  const a = PNG.sync.read(refBuf);
  const b = PNG.sync.read(fs.readFileSync(SHOT));
  maskBand(a);
  maskBand(b);
  const out = new PNG({ width: RW, height: RH });
  const n = pixelmatch(a.data, b.data, out.data, RW, RH, {
    threshold: 0.12,
    includeAA: false,
    alpha: 0.1,
  });
  fs.writeFileSync(path.join(OUT, "diff-s3d.png"), PNG.sync.write(out));
  const half = await sharp(fs.readFileSync(SHOT)).ensureAlpha(0.5).png().toBuffer();
  await sharp(refBuf).composite([{ input: half, blend: "over" }]).png().toFile(path.join(OUT, "overlay-s3d.png"));
  const sbs = await sharp({
    create: { width: RW * 2 + 20, height: RH, channels: 3, background: { r: 40, g: 44, b: 52 } },
  })
    .composite([
      { input: refBuf, left: 0, top: 0 },
      { input: fs.readFileSync(SHOT), left: RW + 20, top: 0 },
    ])
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(OUT, "side-s3d.png"), sbs);
  const total = RW * RH - BAND * RW;
  console.log(`diff (excl. header band): ${n} px = ${((n / total) * 100).toFixed(3)}%`);
}

const cmd = process.argv[2];
if (cmd === "shot") await shot();
else if (cmd === "shot2") await shot(2);
else if (cmd === "diff") await diff();
else if (cmd === "all") {
  await shot();
  await diff();
} else console.log("usage: verify-s3d.ts shot|shot2|diff|all");
