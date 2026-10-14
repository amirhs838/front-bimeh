/**
 * Scroll 3 verification: screenshot #scroll-3 at 450x929@2x (ChatBar and
 * selection bar hidden, header FORCED SHOWN like the reference, section top
 * at viewport top) and diff against upload/3.jpg resized to 900x1858.
 *
 * Usage: bun scripts/verify-s3.ts shot|diff|all|measure
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const OUT = "/home/z/my-project/analysis";
const REF = "/home/z/my-project/upload/3.jpg";
const SHOT = path.join(OUT, "shot-s3.png");
// hide the fixed chat bar + floating selection CTA; keep the sticky header
const HIDE = `div.fixed.inset-x-0 { display: none !important; }`;

async function shot() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 450, height: 929 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
    locale: "fa-IR",
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE });
  await page.evaluate(() => document.fonts.ready);
  // park #scroll-3 exactly at the viewport top, then force the header SHOWN
  // (scroll up >8px so the auto-hide flips to visible, like the reference)
  await page.evaluate(() => {
    const el = document.getElementById("scroll-3")!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + 60, behavior: "instant" });
    window.scrollTo({ top, behavior: "instant" });
  });
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll("img")).every((i) => (i as HTMLImageElement).complete),
  );
  await page.waitForTimeout(700);
  await page.screenshot({ path: SHOT });
  await browser.close();
  console.log("saved", SHOT);
}

async function diff() {
  const refBuf = await sharp(REF).resize(900, 1858, { kernel: "lanczos3" }).png().toBuffer();
  const ref = PNG.sync.read(refBuf);
  const shot = PNG.sync.read(fs.readFileSync(SHOT));
  if (shot.width !== ref.width || shot.height !== ref.height) {
    console.error(`size mismatch: shot ${shot.width}x${shot.height} vs ref ${ref.width}x${ref.height}`);
    process.exit(1);
  }
  const out = new PNG({ width: ref.width, height: ref.height });
  const n = pixelmatch(ref.data, shot.data, out.data, ref.width, ref.height, {
    threshold: 0.12,
    includeAA: false,
    alpha: 0.1,
  });
  fs.writeFileSync(path.join(OUT, "diff-s3.png"), PNG.sync.write(out));
  const sbs = await sharp({
    create: { width: ref.width * 2 + 20, height: ref.height, channels: 3, background: { r: 40, g: 44, b: 52 } },
  })
    .composite([
      { input: refBuf, left: 0, top: 0 },
      { input: fs.readFileSync(SHOT), left: ref.width + 20, top: 0 },
    ])
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(OUT, "side-s3.png"), sbs);
  const half = await sharp(fs.readFileSync(SHOT)).ensureAlpha(0.5).png().toBuffer();
  await sharp(refBuf)
    .composite([{ input: half, blend: "over" }])
    .png()
    .toFile(path.join(OUT, "overlay-s3.png"));
  const total = ref.width * ref.height;
  console.log(`diff: ${n} px = ${((n / total) * 100).toFixed(2)}%`);
}

/** Rendered TEXT geometry (via Range) vs the reference targets (frame u). */
async function measure() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 450, height: 929 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
    locale: "fa-IR",
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const fontState = await page.evaluate(async () => {
    const fam = getComputedStyle(document.querySelector("#scroll-3 h3")).fontFamily.split(",")[0].trim();
    const wm = getComputedStyle(document.querySelector("#s3-title .font-wordmark")!).fontFamily.split(",")[0].trim();
    await Promise.all([
      document.fonts.load(`400 16px "${fam}"`),
      document.fonts.load(`500 16px "${fam}"`),
      document.fonts.load(`700 16px "${fam}"`),
      document.fonts.load(`900 16px "${fam}"`),
      document.fonts.load(`800 16px "${wm}"`),
    ]);
    await document.fonts.ready;
    return {
      fam,
      wm,
      has500: document.fonts.check(`500 16px "${fam}"`),
      has700: document.fonts.check(`700 16px "${fam}"`),
      loaded: document.fonts.size,
    };
  });
  console.error("fonts:", JSON.stringify(fontState));
  const data = await page.evaluate(() => {
    const s3 = document.getElementById("scroll-3")!;
    const s3Top = s3.getBoundingClientRect().top + window.scrollY;
    const rel = (r: DOMRect) => ({
      x: +(r.left).toFixed(1),
      right: +r.right.toFixed(1),
      cy: +(r.top + window.scrollY - s3Top + r.height / 2).toFixed(1),
      w: +r.width.toFixed(1),
    });
    const textOf = (el: Element) => {
      const rg = document.createRange();
      rg.selectNodeContents(el);
      return rel(rg.getBoundingClientRect());
    };
    const eyebrow = document.querySelector("#scroll-3 p")!;
    const h2spans = [...document.querySelectorAll("#s3-title span span")].map(textOf);
    const l1span = document.querySelector("#s3-title > span")!; // L1 block
    const cards = [...document.querySelectorAll("#scroll-3 li")].map((li) => {
      const title = li.querySelector("h3")!;
      const lines = [...li.querySelectorAll("p span")];
      const fs = (el: Element) => +getComputedStyle(el).fontSize.replace("px", "").replace(/\.\d+$/, "");
      return {
        top: +(li.getBoundingClientRect().top + window.scrollY - s3Top).toFixed(1),
        h: +li.getBoundingClientRect().height.toFixed(1),
        title: textOf(title),
        titleFs: fs(title),
        l1: textOf(lines[0]),
        l1Fs: fs(lines[0]),
        l2: lines[1] ? textOf(lines[1]) : null,
        l2Fs: lines[1] ? fs(lines[1]) : 0,
      };
    });
    return { eyebrow: textOf(eyebrow), l1: textOf(l1span), h2spans, cards };
  });

  const T = {
    eyebrow: { x: 187, w: 77, cy: 382.5 },
    l1: { x: 93, w: 265, cy: 416.2 },
    ai: { x: 179.4, w: 29.4 },
    word: { x: 220, w: 50 },
    cards: [
      { title: 192.8, l1: 191.2, l2: 70.6, right: 337 },
      { title: 101, l1: 184.5, l2: 47.4, right: 339.5 },
      { title: 91.8, l1: 172.2, l2: 46.4, right: 339.5 },
      { title: 121.1, l1: 185.1, l2: 69.1, right: 339.5 },
      { title: 124.7, l1: 157.7, l2: 45.4, right: 340 },
    ],
    tops: [484, 567, 648.5, 730.4, 811.3],
  };
  const d = (a: number, b: number) => (a - b >= 0 ? "+" : "") + (a - b).toFixed(1);
  console.log(`eyebrow  x ${data.eyebrow.x} (${d(data.eyebrow.x, T.eyebrow.x)})  w ${data.eyebrow.w} (${d(data.eyebrow.w, T.eyebrow.w)})  cy ${data.eyebrow.cy} (${d(data.eyebrow.cy, T.eyebrow.cy)})`);
  console.log(`L1       x ${data.l1.x} (${d(data.l1.x, T.l1.x)})  w ${data.l1.w} (${d(data.l1.w, T.l1.w)})  cy ${data.l1.cy} (${d(data.l1.cy, T.l1.cy)})`);
  const [word, ai] = data.h2spans;
  console.log(`word     x ${word.x} (${d(word.x, T.word.x)})  w ${word.w} (${d(word.w, T.word.w)})`);
  console.log(`AI       x ${ai.x} (${d(ai.x, T.ai.x)})  w ${ai.w} (${d(ai.w, T.ai.w)})`);
  data.cards.forEach((c, i) => {
    const t = T.cards[i];
    console.log(
      `card${i + 1}  top ${c.top} (${d(c.top, T.tops[i])})  [fs ${c.titleFs}/${c.l1Fs}/${c.l2Fs}]  title w ${c.title.w} (${d(c.title.w, t.title)})  L1 ${c.l1.w} (${d(c.l1.w, t.l1)})  L2 ${c.l2?.w} (${d(c.l2?.w ?? 0, t.l2)})  right ${c.title.right} (${d(c.title.right, t.right)})`,
    );
  });
  await browser.close();
}

const cmd = process.argv[2];
if (cmd === "shot") await shot();
else if (cmd === "diff") await diff();
else if (cmd === "measure") await measure();
else if (cmd === "all") {
  await shot();
  await diff();
} else console.log("usage: verify-s3.ts shot|diff|all|measure");
