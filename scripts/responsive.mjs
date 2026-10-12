/** Responsive screenshots + sanity checks at required widths. Run: node scripts/responsive.mjs */
import { chromium } from "playwright";
import fs from "node:fs";

const OUT = "/home/z/my-project/analysis/responsive";
fs.mkdirSync(OUT, { recursive: true });

const widths = [360, 390, 412, 430, 480, 1440];
const browser = await chromium.launch();
for (const w of widths) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 875 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
    locale: "fa-IR",
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/w${w}.png`, fullPage: false });
  // sanity: no horizontal overflow, chat bar visible
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const chatVisible = await page.locator("input[aria-label='سوال خود را اینجا بنویسید...']").isVisible();
  console.log(`w=${w}: horizontal-overflow=${overflow}px chatbar=${chatVisible}`);
  await ctx.close();
}
await browser.close();
console.log("done");
