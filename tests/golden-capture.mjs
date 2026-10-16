/**
 * GOLDEN CAPTURE (mobile freeze protocol, master prompt section 0/10)
 * Captures the full page at fixed widths, DPR 2, animations deterministically
 * paused, reveal-on-scroll fully revealed. Usage:
 *   bunx playwright ... → node tests/golden-capture.mjs <outdir>
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const OUT = process.argv[2] ?? "/tests/golden";
const BASE = process.argv[3] ?? "http://localhost:3000";
const WIDTHS = [360, 390, 412, 430, 450, 480, 600, 768, 1024, 1279];

const FREEZE_CSS = `
  *, *::before, *::after {
    animation-play-state: paused !important;
    animation-delay: 0s !important;
    transition: none !important;
    caret-color: transparent !important;
  }
  html { scroll-behavior: auto !important; }
  nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button] { display: none !important; }
`;

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--disable-dev-shm-usage', '--no-sandbox'] });
const meta = {};

for (const W of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: W, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: FREEZE_CSS });
  await page.evaluate(async () => {
    const t = (x, ms) => Promise.race([x, new Promise((r) => setTimeout(r, ms))]);
    await t(document.fonts.ready, 5000);
    sessionStorage.clear();
    localStorage.clear();
  }).catch(() => {});
  await page.reload({ waitUntil: "networkidle" });
  await page.addStyleTag({ content: FREEZE_CSS });
  await page.evaluate(async () => {
    const t = (x, ms) => Promise.race([x, new Promise((r) => setTimeout(r, ms))]);
    await t(document.fonts.ready, 5000);
    document
      .querySelectorAll(".s2-reveal,.s3-reveal,.s3-fade,.f-reveal,.f-fade")
      .forEach((el) => el.classList.add("is-in"));
    await t(
      Promise.all(
        Array.from(document.images)
          .filter((i) => !i.complete)
          .map((i) => new Promise((r) => ((i.onload = r), (i.onerror = r))))
      ),
      8000
    );
  }).catch(() => {});
  await page.waitForTimeout(400);

  // full-page capture via one giant viewport (fixed elements stay put)
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.setViewportSize({ width: W, height: Math.min(H, 12000) });
  await page.waitForTimeout(300);

  const shot = path.join(OUT, `m-${W}.png`);
  await page.screenshot({ path: shot });

  // DOM text + tab order of header and Scroll 1
  meta[W] = await page.evaluate(() => {
    const header = document.querySelector("header");
    const s1 = document.querySelector('section[aria-label*="سکشن اصلی"]');
    const text = (el) => (el ? el.innerText.replace(/\s+/g, " ").trim() : null);
    const tabOrder = (root) =>
      root
        ? Array.from(
            root.querySelectorAll(
              'a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
            )
          ).map((el) => ({
            tag: el.tagName.toLowerCase(),
            label: el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 40) ?? "",
            href: el.getAttribute("href") ?? undefined,
          }))
        : null;
    return {
      scrollHeight: document.documentElement.scrollHeight,
      headerText: text(header),
      scroll1Text: text(s1),
      headerTabOrder: tabOrder(header),
      scroll1TabOrder: tabOrder(s1),
    };
  });

  await ctx.close();
  console.log(`captured ${W} (h=${H})`);
}

fs.writeFileSync(path.join(OUT, "meta-golden.json"), JSON.stringify(meta, null, 2));
await browser.close();
console.log("GOLDEN CAPTURE DONE →", OUT);
