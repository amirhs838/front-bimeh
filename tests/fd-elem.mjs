/**
 * Element capture for .s1-root / #scroll-2 / #scroll-3 at desktop widths
 * (+ the mobile footer card at 390) — for the before/after regression.
 * Usage: node tests/fd-elem.mjs <outdir>
 */
import { chromium } from "playwright";
import fs from "node:fs";

const OUT = process.argv[2] ?? "/tmp/fd-elem";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });

async function capture(W, H, mobile) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "load", timeout: 90000 });
  await p.addStyleTag({
    content: `*,*::before,*::after{animation-play-state:paused!important;transition:none!important}
      html{scroll-behavior:auto!important}
      header,div.fixed.inset-x-0{display:none!important}`,
  });
  await p.evaluate(async () => {
    document
      .querySelectorAll(".s2-reveal,.s3-reveal,.s3-fade,.f-reveal,.f-fade")
      .forEach((el) => el.classList.add("is-in"));
    await document.fonts.ready;
  });
  await p.waitForTimeout(300);
  const sels = mobile
    ? [".s1-root", "#scroll-2", "#scroll-3", "#footer .f-card"]
    : [".s1-root", "#scroll-2", "#scroll-3"];
  for (const sel of sels) {
    const el = p.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    await p.waitForTimeout(150);
    const buf = await el.screenshot({ animations: "disabled" });
    const name = sel.replace(/[^a-z0-9]/gi, "_");
    fs.writeFileSync(`${OUT}/${name}-${W}.png`, buf);
  }
  await ctx.close();
  console.log(`W${W} captured`);
}

await capture(1280, 900, false);
await capture(1536, 900, false);
await capture(1920, 1000, false);
await capture(390, 844, true);
await browser.close();
