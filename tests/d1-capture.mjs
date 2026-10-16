/**
 * D1 COMPARISON CAPTURE (master prompt section 10)
 * Captures the top 1024px of the desktop site at 1536x1024 (DPR configurable),
 * animations paused at first frame, header at rest. Usage:
 *   node tests/d1-capture.mjs <out.png> [dpr]
 */
import { chromium } from "playwright";

const OUT = process.argv[2] ?? "/tmp/d1-shot.png";
const DPR = Number(process.argv[3] ?? 1);
const BASE = process.argv[4] ?? "http://localhost:3000";

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

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1536, height: 1024 },
  deviceScaleFactor: DPR,
});
await page.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
await page.addStyleTag({ content: FREEZE_CSS });
await page.evaluate(async () => {
  const withTimeout = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
  await withTimeout(document.fonts.ready, 5000);
  sessionStorage.clear();
  localStorage.clear();
  document
    .querySelectorAll(".s2-reveal,.s3-reveal,.s3-fade,.f-reveal,.f-fade")
    .forEach((el) => el.classList.add("is-in"));
  await withTimeout(
    Promise.all(
      Array.from(document.images)
        .filter((i) => !i.complete)
        .map((i) => new Promise((r) => ((i.onload = r), (i.onerror = r))))
    ),
    8000
  );
});
await page.waitForTimeout(500);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1536, height: 1024 } });
console.log("saved", OUT, "dpr", DPR);
await browser.close();
