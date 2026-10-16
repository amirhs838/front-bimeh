/**
 * INTERIM CAPTURE v2 — full-page median captures at 1280/1536/1920 (DPR1)
 * + section offsets, for the desktop-s2 before/after element regression.
 * Usage: node tests/interim2.mjs <outdir>
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import fs from "node:fs";

const OUT = process.argv[2] ?? "/tmp/interim";
fs.mkdirSync(OUT, { recursive: true });
const N = 3;

const FREEZE_CSS = `
  *, *::before, *::after {
    animation-play-state: paused !important;
    animation-delay: 0s !important;
    transition: none !important;
    caret-color: transparent !important;
  }
  html { scroll-behavior: auto !important; }
  header, div.fixed.inset-x-0 { display: none !important; }
  nextjs-portal, [data-nextjs-toast] { display: none !important; }
`;

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });

async function captureOnce(W) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 1024 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 60000 });
  await p.addStyleTag({ content: FREEZE_CSS });
  await p.evaluate(async () => {
    const r = (q, ms) => Promise.race([q, new Promise((res) => setTimeout(res, ms))]);
    await r(document.fonts.ready, 5000);
    sessionStorage.clear();
    localStorage.clear();
  }).catch(() => {});
  await p.reload({ waitUntil: "networkidle", timeout: 60000 });
  await p.addStyleTag({ content: FREEZE_CSS });
  await p.evaluate(async () => {
    const r = (q, ms) => Promise.race([q, new Promise((res) => setTimeout(res, ms))]);
    await r(document.fonts.ready, 5000);
    document.querySelectorAll(".s2-reveal,.s3-reveal,.s3-fade,.f-reveal,.f-fade").forEach((el) => el.classList.add("is-in"));
    await r(Promise.all(Array.from(document.images).filter((i) => !i.complete).map((i) => new Promise((res) => ((i.onload = res), (i.onerror = res))))), 8000);
  }).catch(() => {});
  await p.waitForTimeout(500);
  const h = await p.evaluate(() => ({
    h: document.documentElement.scrollHeight,
    s1: document.querySelector(".s1-root").getBoundingClientRect().top + scrollY,
    s2: document.getElementById("scroll-2").getBoundingClientRect().top + scrollY,
    s3: document.getElementById("scroll-3").getBoundingClientRect().top + scrollY,
    f: document.getElementById("footer").getBoundingClientRect().top + scrollY,
  }));
  await p.setViewportSize({ width: W, height: Math.min(h.h, 12000) });
  await p.waitForTimeout(600);
  const buf = await p.screenshot({ clip: { x: 0, y: 0, width: W, height: Math.min(h.h, 12000) } });
  await ctx.close();
  return { buf, meta: h };
}

let meta = null;
for (const W of [1280, 1536, 1920]) {
  const pngs = [];
  for (let i = 0; i < N; i++) {
    const { buf, meta: m } = await captureOnce(W);
    pngs.push(PNG.sync.read(buf));
    meta = m;
    process.stdout.write(`W${W} run ${i + 1}/${N}\n`);
  }
  const { width, height } = pngs[0];
  const med = new PNG({ width, height });
  const mid = N >> 1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const base = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        const vals = pngs.map((p) => p.data[base + c]).sort((a, b) => a - b);
        med.data[base + c] = vals[mid];
      }
      med.data[base + 3] = 255;
    }
  }
  fs.writeFileSync(`${OUT}/full-${W}.png`, PNG.sync.write(med));
  fs.writeFileSync(`${OUT}/meta-${W}.json`, JSON.stringify(meta));
  console.log(`W${W}: ${width}x${height}`, JSON.stringify(meta));
}
await browser.close();
console.log("INTERIM2 DONE");
