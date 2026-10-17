/**
 * FOOTER DESKTOP (fd) capture — footer-only screenshot at a desktop width.
 * Hides Header / ChatBar / floating continue button, pauses animations,
 * forces reveal .is-in, waits for fonts, scrolls the footer's bottom edge to
 * the viewport bottom, then screenshots the viewport.
 * Usage: node tests/fd-capture.mjs <out.png> [width=1536] [dpr=1]
 */
import { chromium } from "playwright";
import fs from "node:fs";

const out = process.argv[2] ?? "/tmp/fd.png";
const W = Number(process.argv[3] ?? 1536);
const DPR = Number(process.argv[4] ?? 1);
const H = Math.round((940 * 1536) / 1672); // footer frame height (863.54 -> 864)

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: DPR,
});
const p = await ctx.newPage();
await p.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 60000 });
await p.addStyleTag({
  content: `header,div.fixed.inset-x-0,.dk-select{display:none!important}
    *,*::before,*::after{animation-play-state:paused!important;transition:none!important}
    html{scroll-behavior:auto!important}`,
});
await p.evaluate(async () => {
  document
    .querySelectorAll(".s2-reveal,.s3-reveal,.s3-fade,.f-reveal,.f-fade")
    .forEach((el) => el.classList.add("is-in"));
  await Promise.all(
    Array.from(document.images)
      .filter((i) => i.offsetWidth > 0 && !i.complete)
      .map((i) => new Promise((r) => ((i.onload = r), (i.onerror = r)))),
  );
  await document.fonts.ready;
});
await p.waitForTimeout(400);
// scroll so the footer's bottom edge coincides with the viewport bottom
await p.evaluate(() => {
  const f = document.querySelector("#footer");
  const top = f.getBoundingClientRect().top + window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: Math.min(top + f.offsetHeight - window.innerHeight, max), behavior: "instant" });
});
await p.waitForTimeout(250);
fs.mkdirSync("/tmp", { recursive: true });
await p.screenshot({ path: out });
await browser.close();
console.log(`saved ${out} @${W}x${H} dpr${DPR}`);
