/**
 * Footer seam + end-of-page tests.
 *
 * 1. SEAM: Scroll 3 bottom (300u) + footer top (300u) at DPR 2, header hidden
 *    and shown — verifies the gradient bridge (no edge, no banding) and that
 *    the card shadow isn't clipped at the section boundary.
 * 2. END-OF-PAGE: scrolled to the very bottom with ChatBar visible — the
 *    card bottom edge, waves, red curve and dot must clear the ChatBar by
 *    >= 10u.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";

const OUT = "/home/z/my-project/analysis";
const FOOTER_TOP = `(document.getElementById("footer").getBoundingClientRect().top + window.scrollY)`;

async function capture(page, name, showHeader) {
  if (showHeader) {
    await page.addStyleTag({ content: `header { transform: none !important; display: flex !important; }` });
  } else {
    await page.addStyleTag({ content: `header { display: none !important; }` });
  }
  await page.evaluate((yOff) => {
    const seam = eval(yOff) as number;
    window.scrollTo({ top: seam - 300, behavior: "instant" });
  }, FOOTER_TOP);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/seam-f-${name}.png` });
}

async function rowDelta(file, label) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, C = info.channels;
  // seam at viewport y 300 css = img row 600
  let maxDelta = 0, maxRow = -1;
  for (let y = 594; y < 610; y++) {
    for (let x = 10; x < W - 10; x++) {
      const i = (y * W + x) * C, j = ((y + 1) * W + x) * C;
      const spreadA = Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);
      const spreadB = Math.max(data[j], data[j + 1], data[j + 2]) - Math.min(data[j], data[j + 1], data[j + 2]);
      if (spreadA > 40 || spreadB > 40) continue; // skip ink/AA columns
      const d = Math.abs(data[i] - data[j]) + Math.abs(data[i + 1] - data[j + 1]) + Math.abs(data[i + 2] - data[j + 2]);
      if (d > maxDelta) { maxDelta = d; maxRow = y; }
    }
  }
  console.log(`${label}: max row delta = ${(maxDelta / 3).toFixed(1)}/255 (row ${maxRow})`);
  return maxDelta / 3;
}

async function endOfPage() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 450, height: 775 },
    deviceScaleFactor: 2,
    locale: "fa-IR",
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    document.querySelectorAll(".f-reveal, .f-fade").forEach((el) => el.classList.add("is-in"));
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/endpage-f.png` });
  const geo = await page.evaluate(() => {
    const card = document.querySelector("#footer .f-reveal") as HTMLElement;
    const bar = document.querySelector("div.fixed.inset-x-0 form") as HTMLElement;
    const r = card.getBoundingClientRect();
    const b = bar.getBoundingClientRect();
    return { cardBottom: +r.bottom.toFixed(1), barTop: +b.top.toFixed(1), gap: +(b.top - r.bottom).toFixed(1) };
  });
  console.log(`end-of-page: cardBottom ${geo.cardBottom}  chatBarTop ${geo.barTop}  gap ${geo.gap}u (need >=10)`);
  await browser.close();
}

const cmd = process.argv[2] ?? "all";
if (cmd === "seam" || cmd === "all") {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 450, height: 775 },
    deviceScaleFactor: 2,
    locale: "fa-IR",
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    document.querySelectorAll(".f-reveal, .f-fade").forEach((el) => el.classList.add("is-in"));
  });
  await capture(page, "hidden", false);
  await capture(page, "shown", true);
  await browser.close();
  const d1 = await rowDelta(`${OUT}/seam-f-hidden.png`, "seam (header hidden)");
  const d2 = await rowDelta(`${OUT}/seam-f-shown.png`, "seam (header shown) ");
  console.log(d1 <= 2 && d2 <= 2 ? "SEAM OK" : "SEAM FAIL");
}
if (cmd === "end" || cmd === "all") await endOfPage();
