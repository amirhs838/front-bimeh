/**
 * Footer verification: screenshot the footer card at 450x775@2x (header,
 * ChatBar and selection bar hidden, card top exactly 3u below the viewport
 * top — matching the 4.png crop) and diff against upload/4.png resized to
 * 900x1550. `measure` prints DOM Range geometry vs reference targets (u).
 *
 * Usage: bun scripts/verify-f.ts shot|diff|all|measure
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const OUT = "/home/z/my-project/analysis";
const REF = "/home/z/my-project/upload/4.png";
const SHOT = path.join(OUT, "shot-f.png");
const W = 450;
const H = 775;
const HIDE = `header { display: none !important; } div.fixed.inset-x-0 { display: none !important; }`;

async function page450() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
    locale: "fa-IR",
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE });
  await page.evaluate(() => document.fonts.ready);
  return { browser, page };
}

async function parkAtCard(page: import("playwright").Page) {
  await page.evaluate(() => {
    document.querySelectorAll(".f-reveal, .f-fade").forEach((el) => el.classList.add("is-in"));
    const card = document.querySelector("#footer .f-reveal") as HTMLElement;
    const top = card.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + 80, behavior: "instant" });
    window.scrollTo({ top: top - 3, behavior: "instant" });
  });
  await page.waitForTimeout(600);
}

async function shot() {
  fs.mkdirSync(OUT, { recursive: true });
  const { browser, page } = await page450();
  await parkAtCard(page);
  await page.screenshot({ path: SHOT });
  await browser.close();
  console.log("saved", SHOT);
}

async function diff() {
  const refBuf = await sharp(REF).resize(900, 1550, { kernel: "lanczos3" }).png().toBuffer();
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
  fs.writeFileSync(path.join(OUT, "diff-f.png"), PNG.sync.write(out));
  const sbs = await sharp({
    create: { width: ref.width * 2 + 20, height: ref.height, channels: 3, background: { r: 40, g: 44, b: 52 } },
  })
    .composite([
      { input: refBuf, left: 0, top: 0 },
      { input: fs.readFileSync(SHOT), left: ref.width + 20, top: 0 },
    ])
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(OUT, "side-f.png"), sbs);
  const half = await sharp(fs.readFileSync(SHOT)).ensureAlpha(0.5).png().toBuffer();
  await sharp(refBuf)
    .composite([{ input: half, blend: "over" }])
    .png()
    .toFile(path.join(OUT, "overlay-f.png"));
  const total = ref.width * ref.height;
  console.log(`diff: ${n} px = ${((n / total) * 100).toFixed(2)}%`);
}

/** DOM geometry vs reference targets, all card-relative u. */
async function measure() {
  const { browser, page } = await page450();
  const data = await page.evaluate(() => {
    const card = document.querySelector("#footer .f-reveal") as HTMLElement;
    const cr = card.getBoundingClientRect();
    const rel = (r: DOMRect) => ({
      x: +(r.left - cr.left).toFixed(1),
      right: +(r.right - cr.left).toFixed(1),
      cy: +(r.top - cr.top + r.height / 2).toFixed(1),
      top: +(r.top - cr.top).toFixed(1),
      w: +r.width.toFixed(1),
      h: +r.height.toFixed(1),
    });
    const textOf = (el: Element) => {
      const rg = document.createRange();
      rg.selectNodeContents(el);
      return rel(rg.getBoundingClientRect());
    };
    const fs = (el: Element) => +getComputedStyle(el).fontSize.replace("px", "");

    const wm = card.querySelector('a[aria-label^="Bimeh AI"]')!;
    const h2 = card.querySelector("#f-title")!;
    const lineEls = [...card.querySelectorAll("p > span[aria-hidden]")];
    const qaTitle = card.querySelector("#qa-title")!;
    const pills = [...card.querySelectorAll("nav button, nav a")].filter((e) =>
      e.closest("nav")?.querySelector("#qa-title"),
    );
    const cols = ["f-services", "f-about"].map((id) => {
      const nav = document.getElementById(id)!.closest("nav")!;
      const title = document.getElementById(id)!;
      const rows = [...nav.querySelectorAll("li a, li button")];
      return {
        title: textOf(title),
        titleFs: fs(title),
        rows: rows.map((r) => ({ label: r.getAttribute("aria-label"), t: textOf(r.querySelector("span")!) })),
      };
    });
    const contacts = [...card.querySelectorAll("ul li a[dir=ltr]")].map((a) => ({
      label: a.getAttribute("aria-label"),
      t: textOf(a.querySelectorAll("span")[1]!),
    }));
    return {
      card: { w: +cr.width.toFixed(1), h: +cr.height.toFixed(1) },
      wm: textOf(wm),
      h2: { ...textOf(h2), fs: fs(h2) },
      lines: lineEls.map((l) => ({ w: textOf(l).w, right: textOf(l).right })),
      qaTitle: { w: textOf(qaTitle).w, right: textOf(qaTitle).right },
      pills: pills.map((p) => ({
        label: p.getAttribute("aria-label"),
        box: rel((p as HTMLElement).getBoundingClientRect()),
        label: textOf((p as HTMLElement).querySelector("span:not([aria-hidden])")!),
      })),
      cols,
      contacts,
    };
  });

  // ---- reference targets (card-relative u, from 4.png analysis) ----
  const T = {
    card: { w: 421.3, h: 760.6 },
    wm: { w: 130.4, right: 404.6, cy: 50.2 },
    h2: { w: 192.5, right: 404.8, cy: 93.3 },
    lines: [
      { w: 347.4, right: 404.8 },
      { w: 361.0, right: 404.6 },
      { w: 359.6, right: 404.9 },
      { w: 355.9, right: 404.9 },
      { w: 33.9, right: 404.9 },
    ],
    qaTitle: { w: 82.3, right: 404.1 },
    pillLabels: [29.7, 73.9, 84.7, 46.1],
    pillRight: 374.2 - 16.2,
    pillTops: [264.8, 306.7, 347.7, 390.0],
    pillH: [33.5, 33.0, 34.3, 33.5],
    cols: [
      {
        titleW: 54.6,
        titleRight: 419.9 - 16.2,
        rows: [64.0, 78.6, 73.0, 79.1],
        rowRight: 413.0 - 16.2,
      },
      {
        titleW: 47.5,
        titleRight: 224.5 - 16.2,
        rows: [70.1, 59.3, 58.4, 76.3],
        rowRight: 217.5 - 16.2,
      },
    ],
    contacts: [130.9, 73.0, 62.1],
    contactLeft: 268.8 - 16.2,
  };
  const d = (a: number, b: number) => (a - b >= 0 ? "+" : "") + (a - b).toFixed(1);
  console.log(`card    w ${data.card.w} (${d(data.card.w, T.card.w)})  h ${data.card.h} (${d(data.card.h, T.card.h)})`);
  console.log(`wm      w ${data.wm.w} (${d(data.wm.w, T.wm.w)})  right ${data.wm.right} (${d(data.wm.right, T.wm.right)})  cy ${data.wm.cy} (${d(data.wm.cy, T.wm.cy)})`);
  console.log(`h2      w ${data.h2.w} (${d(data.h2.w, T.h2.w)})  right ${data.h2.right} (${d(data.h2.right, T.h2.right)})  cy ${data.h2.cy} (${d(data.h2.cy, T.h2.cy)})  fs ${data.h2.fs}`);
  data.lines.forEach((l, i) => {
    console.log(`para L${i + 1}   w ${l.w} (${d(l.w, T.lines[i].w)})  right ${l.right} (${d(l.right, T.lines[i].right)})`);
  });
  console.log(`qaTitle w ${data.qaTitle.w} (${d(data.qaTitle.w, T.qaTitle.w)})  right ${data.qaTitle.right} (${d(data.qaTitle.right, T.qaTitle.right)})`);
  data.pills.forEach((p, i) => {
    console.log(`pill${i + 1}   top ${p.box.top} (${d(p.box.top, T.pillTops[i])})  h ${p.box.h} (${d(p.box.h, T.pillH[i])})  labelW ${p.label.w} (${d(p.label.w, T.pillLabels[i])})  labelRight ${p.label.right} (${d(p.label.right, T.pillRight)})`);
  });
  data.cols.forEach((c, ci) => {
    const t = T.cols[ci];
    console.log(`col${ci}  title w ${c.title.w} (${d(c.title.w, t.titleW)})  right ${c.title.right} (${d(c.title.right, t.titleRight)})`);
    c.rows.forEach((r, ri) => {
      console.log(`  row${ri + 1}  w ${r.t.w} (${d(r.t.w, t.rows[ri])})  right ${r.t.right} (${d(r.t.right, t.rowRight)})`);
    });
  });
  data.contacts.forEach((c, i) => {
    console.log(`contact${i + 1} w ${c.t.w} (${d(c.t.w, T.contacts[i])})  left ${c.t.x} (${d(c.t.x, T.contactLeft)})`);
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
} else console.log("usage: verify-f.ts shot|diff|all|measure");
