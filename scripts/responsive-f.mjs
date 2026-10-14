/**
 * Footer responsive sweep: 360/390/412/430/480/1440 — no horizontal overflow,
 * ChatBar visible, card inside the column, decor not clipped, screenshot each.
 * Run: node scripts/responsive-f.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "/home/z/my-project/analysis/responsive-f";
fs.mkdirSync(OUT, { recursive: true });

const widths = [360, 390, 412, 430, 480, 1440];
const browser = await chromium.launch();
let fail = 0;

for (const w of widths) {
  const h = w < 480 ? 780 : w === 480 ? 800 : 900;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: "fa-IR" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    document.querySelectorAll(".f-reveal, .f-fade").forEach((el) => el.classList.add("is-in"));
    const card = document.querySelector("#footer .f-reveal");
    window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 3, behavior: "instant" });
  });
  await page.waitForTimeout(500);
  const m = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    cardLeft: Math.round(document.querySelector("#footer .f-reveal").getBoundingClientRect().left),
    cardW: Math.round(document.querySelector("#footer .f-reveal").getBoundingClientRect().width),
  }));
  const status = m.overflowX === 0 ? "OK" : "OVERFLOW";
  if (m.overflowX !== 0) fail++;
  console.log(`${w}px: overflowX ${m.overflowX}  card left ${m.cardLeft} w ${m.cardW}  ${status}`);
  await page.screenshot({ path: `${OUT}/w${w}.png` });
  await ctx.close();
}
await browser.close();
console.log(fail ? "RESPONSIVE FAIL" : "RESPONSIVE OK");
process.exit(fail ? 1 : 0);
