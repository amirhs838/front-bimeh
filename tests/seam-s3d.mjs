/**
 * SEAM TESTS (desktop-s3 §10.3): S2→S3 and S3→Footer junctions at 1536 & 1920.
 * Numeric: max row-to-row mean |Δ| across the junction zone ≤ 2/255.
 * Visual: 600px stitch centered on each boundary.
 * Usage: node tests/seam-s3d.mjs
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import fs from "node:fs";

const OUT = "/tmp/seam-s3d";
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });

for (const W of [1536, 1920]) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 1024 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 60000 });
  await p.addStyleTag({
    content: `header,div.fixed.inset-x-0,.dk-select{display:none!important}
      *,*::before,*::after{animation-play-state:paused!important;transition:none!important}
      html{scroll-behavior:auto!important}`,
  });
  await p.evaluate(async () => {
    document.querySelectorAll(".s2-reveal,.s3-reveal,.s3-fade,.f-reveal,.f-fade").forEach((el) => el.classList.add("is-in"));
    await Promise.all(Array.from(document.images).filter((i) => i.offsetWidth > 0 && !i.complete).map((i) => new Promise((r) => ((i.onload = r), (i.onerror = r)))));
  });
  await p.waitForTimeout(500);

  for (const [name, sel] of [["s2-s3", "#scroll-3"], ["s3-footer", "#footer"]]) {
    const top = await p.evaluate((s) => {
      const el = document.querySelector(s);
      return el.getBoundingClientRect().top + window.scrollY;
    }, sel);
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(top - 300));
    await p.waitForTimeout(250);
    const buf = await p.screenshot({ clip: { x: 0, y: 0, width: W, height: 600 } });
    fs.writeFileSync(`${OUT}/${name}-${W}.png`, buf);
    const png = PNG.sync.read(buf);
    let worst = 0, worstY = -1;
    for (let y = 292; y < 308; y++) {
      let sum = 0;
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4, j = ((y + 1) * W + x) * 4;
        sum += Math.abs(png.data[i] - png.data[j]) + Math.abs(png.data[i + 1] - png.data[j + 1]) + Math.abs(png.data[i + 2] - png.data[j + 2]);
      }
      const delta = sum / (W * 3);
      if (delta > worst) { worst = delta; worstY = y; }
    }
    console.log(`${name} @${W}: worst row Δ = ${worst.toFixed(2)}/255 at row ${worstY} ${worst <= 2 ? "PASS" : "FAIL"}`);
  }
  await ctx.close();
}
await browser.close();
console.log("SEAM TESTS DONE →", OUT);
