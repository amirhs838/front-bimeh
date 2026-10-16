/**
 * DESKTOP S2 — responsive sweep (§10.4/§10.6), DPR2 sharpness (§10.1),
 * interactions (§10.5) and network waterfall rule (§7.3).
 * Usage: node tests/verify-s2d-suite.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "/tmp/verify-s2d";
fs.mkdirSync(OUT, { recursive: true });
const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k.padEnd(52), v); };

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });

// ---------- 1. responsive sweep: proportional scaling, decor anchored, no overflow ----------
for (const W of [1280, 1366, 1440, 1536, 1920, 2560]) {
  const p = await browser.newPage({ viewport: { width: W, height: 1024 } });
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(600);
  const m = await p.evaluate(() => {
    const s2 = document.getElementById("scroll-2");
    const r = s2.getBoundingClientRect();
    const container = s2.querySelector(".s2-container").getBoundingClientRect();
    const decorL = s2.querySelector(".s2-decor-dk svg");
    const decorR = s2.querySelectorAll(".s2-decor-dk svg")[1];
    const art1 = document.querySelectorAll("#scroll-2 .s2-illu")[0].getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      s2h: Math.round(r.height),
      s2w: Math.round(r.width),
      contLeft: Math.round(container.left),
      contW: Math.round(container.width),
      decorLeftX: Math.round(decorL.getBoundingClientRect().left),
      decorRightEdge: Math.round(decorR.getBoundingClientRect().right),
      art1x: Math.round(art1.left),
      expD: Math.min(innerWidth, 1536) / 1536,
    };
  });
  const d = m.expD;
  const okOverflow = m.overflow <= 0;
  const okH = Math.abs(m.s2h - 1024 * d) <= 2;
  const okCont = Math.abs(m.contLeft - (W - 1536 * d) / 2) <= 2 && Math.abs(m.contW - 1536 * d) <= 2;
  const okDecor = m.decorLeftX === 0 && Math.abs(m.decorRightEdge - W) <= 1;
  const okArt = Math.abs(m.art1x - (m.contLeft + 147 * d)) <= 2;
  log(
    `W=${W} overflow/height/container/decor/art`,
    okOverflow && okH && okCont && okDecor && okArt ? "PASS" : `FAIL ${JSON.stringify(m)}`,
  );
  if (W === 1536 || W === 2560) await p.screenshot({ path: `${OUT}/resp-${W}.png`, fullPage: false });
  await p.close();
}

// ---------- 2. boundary 1279/1280 ----------
{
  const p = await browser.newPage({ viewport: { width: 1279, height: 900 } });
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(500);
  const m = await p.evaluate(() => {
    const s2 = document.getElementById("scroll-2");
    const cont = s2.querySelector(".s2-container");
    const dk = s2.querySelector(".s2-decor-dk");
    const img = s2.querySelector("#scroll-2 picture img");
    return {
      h: Math.round(s2.getBoundingClientRect().height),
      contW: Math.round(cont.getBoundingClientRect().width),
      decor: getComputedStyle(dk).display,
      curSrc: img.currentSrc.split("/").pop(),
    };
  });
  log("1279 = mobile column (h=933, cont 480, decor none, mobile art)", m.h === 933 && m.contW === 480 && m.decor === "none" && m.curSrc.startsWith("s2-step") ? "PASS" : `FAIL ${JSON.stringify(m)}`);
  await p.close();
}
{
  const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(600);
  const m = await p.evaluate(() => {
    const s2 = document.getElementById("scroll-2");
    const dk = s2.querySelector(".s2-decor-dk");
    const img = s2.querySelector("#scroll-2 picture img");
    const dm = getComputedStyle(s2.querySelector(".s2-m-decor")).display;
    return {
      h: Math.round(s2.getBoundingClientRect().height),
      decor: getComputedStyle(dk).display,
      mDecor: dm,
      curSrc: img.currentSrc.split("/").pop(),
      descM: getComputedStyle(s2.querySelector(".s2-desc-m")).display,
      descD: getComputedStyle(s2.querySelector(".s2-desc-dk")).display,
    };
  });
  const ok = m.h === Math.round(1024 * (1280 / 1536)) && m.decor === "block" && m.mDecor === "none" && m.curSrc.startsWith("s2d-") && m.descM === "none" && m.descD === "block";
  log("1280 = desktop (h=853=1024d, dk decor, s2d art, 2-line desc)", ok ? "PASS" : `FAIL ${JSON.stringify(m)}`);
  await p.close();
}

// ---------- 3. DPR2 sharpness pass (§10.1) ----------
{
  const p = await browser.newPage({ viewport: { width: 1536, height: 1024 }, deviceScaleFactor: 2 });
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await p.addStyleTag({ content: `header,div.fixed.inset-x-0{display:none!important}html{scroll-behavior:auto!important}` });
  await p.evaluate(() => {
    const el = document.getElementById("scroll-2");
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: "instant" });
  });
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${OUT}/dpr2-s2.png`, clip: { x: 0, y: 0, width: 1536, height: 1024 } });
  log("DPR2 capture", "saved (/tmp/verify-s2d/dpr2-s2.png)");
  await p.close();
}

// ---------- 4. interactions (§10.5) ----------
{
  const p = await browser.newPage({ viewport: { width: 1536, height: 1024 } });
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(700);

  // 4a. step-1 phone hotspot → ChatSheet (desktop position)
  const hs = await p.evaluate(() => {
    const b = document.querySelectorAll("#scroll-2 .s2-hotspot")[0].getBoundingClientRect();
    const art = document.querySelectorAll("#scroll-2 .s2-illu")[0].getBoundingClientRect();
    return { bx: b.x, by: b.y, bw: b.width, bh: b.height, art };
  });
  // expected: frame x312-482 y122-358 (viewport coords AFTER parking s2 at top)
  const contLeft = await p.evaluate(() => document.querySelector(".s2-container").getBoundingClientRect().left);
  const s2top = await p.evaluate(() => document.getElementById("scroll-2").getBoundingClientRect().top + scrollY);
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), s2top);
  await p.waitForTimeout(1100); // let the 0.5s reveal transition finish
  const hsNow = await p.evaluate(() => {
    const b = document.querySelectorAll("#scroll-2 .s2-hotspot")[0].getBoundingClientRect();
    return { x: b.x, y: b.y, w: b.width, h: b.height };
  });
  const exp = { x: contLeft + 312, y: 122, w: 170, h: 236 };
  const hsOk = Math.abs(hsNow.x - exp.x) <= 3 && Math.abs(hsNow.y - exp.y) <= 3 && Math.abs(hsNow.w - exp.w) <= 3 && Math.abs(hsNow.h - exp.h) <= 3;
  log("hotspot#1 at D2 frame (312,122,170,236)", hsOk ? "PASS" : `FAIL got ${JSON.stringify(hsNow)} exp ${JSON.stringify(exp)}`);
  await p.click('#scroll-2 .s2-hotspot >> nth=0');
  await p.waitForTimeout(500);
  const chat = await p.evaluate(() => document.querySelector(".dk-chat")?.getAttribute("data-state"));
  log("phone hotspot opens ChatSheet", chat === "open" ? "PASS" : `FAIL ${chat}`);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);

  // 4b. step-4 headset hotspot → SupportSheet
  await p.click('#scroll-2 .s2-hotspot >> nth=1');
  await p.waitForTimeout(500);
  const sup = await p.evaluate(() => document.querySelector(".dk-support")?.getAttribute("data-state"));
  log("headset hotspot opens SupportSheet", sup === "open" ? "PASS" : `FAIL ${sup}`);
  const supBox = await p.evaluate(() => {
    const b = document.querySelector(".dk-support").getBoundingClientRect();
    return { w: Math.round(b.width), cx: Math.round(b.x + b.width / 2) };
  });
  log("SupportSheet = 440d centered", Math.abs(supBox.w - 440) <= 2 && Math.abs(supBox.cx - 768) <= 6 ? "PASS" : `FAIL ${JSON.stringify(supBox)}`);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);

  // 4c. hotspot hit area >= 44px
  const hit = await p.evaluate(() => {
    const b = document.querySelectorAll("#scroll-2 .s2-hotspot")[1].getBoundingClientRect();
    return { w: b.width, h: b.height };
  });
  log("hotspot hit area >= 44x44", hit.w >= 44 && hit.h >= 44 ? "PASS" : `FAIL ${JSON.stringify(hit)}`);

  // 4d. drawer link چرا Bimeh AI → smooth scroll to #scroll-2
  await p.click(".dk-burger");
  await p.waitForTimeout(450);
  await p.click('a[href="/#scroll-2"]');
  await p.waitForTimeout(1200);
  const s2v = await p.evaluate(() => Math.abs(document.getElementById("scroll-2").getBoundingClientRect().top));
  log("drawer link → #scroll-2 aligned", s2v <= 2 ? "PASS" : `FAIL top=${s2v}`);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(350);

  // 4e. header auto-hide on scroll down / show on up
  await p.evaluate(() => window.scrollTo({ top: 200, behavior: "instant" }));
  await p.waitForTimeout(200);
  await p.mouse.wheel(0, 400);
  await p.waitForTimeout(500);
  const hidden = await p.evaluate(() => {
    const h = document.querySelector("header");
    return parseFloat(getComputedStyle(h).top) < -40 || getComputedStyle(h).transform.includes("-") || h.getBoundingClientRect().bottom <= 0;
  });
  await p.mouse.wheel(0, -300);
  await p.waitForTimeout(500);
  const shown = await p.evaluate(() => document.querySelector("header").getBoundingClientRect().bottom > 0);
  log("header auto-hide (down)/show (up)", hidden && shown ? "PASS" : `FAIL hidden=${hidden} shown=${shown}`);

  // 4f. reduced motion: reveals instant, floats off
  const p2 = await browser.newPage({ viewport: { width: 1536, height: 1024 }, reducedMotion: "reduce" });
  await p2.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await p2.waitForTimeout(600);
  const rm = await p2.evaluate(() => {
    const el = document.querySelector("#scroll-2 .s2-illu");
    const cs = getComputedStyle(el);
    const fl = getComputedStyle(el.querySelector(".anim-s2-float")).animationDuration;
    return { opacity: cs.opacity, floatDur: fl };
  });
  log("reduced-motion: reveal visible, float 0.01ms", rm.opacity === "1" && parseFloat(rm.floatDur) <= 0.02 ? "PASS" : `FAIL ${JSON.stringify(rm)}`);
  await p2.close();

  // 4g. keyboard focus on hotspot
  await p.evaluate(() => document.querySelectorAll("#scroll-2 .s2-hotspot")[0].focus());
  const focused = await p.evaluate(() => document.activeElement.className.includes("s2-hotspot"));
  log("hotspot keyboard-focusable", focused ? "PASS" : "FAIL");
  await p.close();
}

// ---------- 5. network waterfall rule (§7.3) ----------
{
  // desktop fetches s2d-*, never s2-step*
  const p = await browser.newPage({ viewport: { width: 1536, height: 1024 } });
  const reqs = [];
  p.on("request", (r) => { if (r.url().includes("/img/")) reqs.push(r.url().split("/").pop()); });
  await p.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await p.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
  await p.waitForTimeout(1200);
  const dkBad = reqs.filter((r) => r.startsWith("s2-step"));
  const dkGood = reqs.filter((r) => r.startsWith("s2d-"));
  log("desktop loads s2d- art only", dkBad.length === 0 && dkGood.length >= 4 ? `PASS (${dkGood.join(", ")})` : `FAIL bad=${dkBad} good=${dkGood}`);
  await p.close();

  // mobile fetches s2-step*, never s2d-*
  const pm = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const reqsM = [];
  pm.on("request", (r) => { if (r.url().includes("/img/")) reqsM.push(r.url().split("/").pop()); });
  await pm.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await pm.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
  await pm.waitForTimeout(1200);
  const mBad = reqsM.filter((r) => r.startsWith("s2d-"));
  const mGood = reqsM.filter((r) => r.startsWith("s2-step"));
  log("mobile loads s2-step art only", mBad.length === 0 && mGood.length >= 4 ? `PASS (${mGood.length} files)` : `FAIL bad=${mBad} good=${mGood}`);
  await pm.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
const fails = results.filter(([, v]) => String(v).startsWith("FAIL"));
console.log(`\nSUITE DONE — ${results.length - fails.length}/${results.length} PASS`);
