/**
 * DESKTOP VERIFICATION SUITE (master prompt §10)
 * - multi-width (1280..2560): proportional scaling, no horizontal overflow
 * - boundary 1279/1280
 * - DPR2 sharpness pass
 * - seam test: desktop Scroll1 bottom vs Scroll2 top
 * - interactions: nav, drawer, sheets, cards, checkbox+CTA, chat bar
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "/tmp/verify";
fs.mkdirSync(OUT, { recursive: true });
const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k.padEnd(46), v); };

const browser = await chromium.launch();

// ---------- 1. multi-width + no overflow ----------
for (const W of [1280, 1366, 1440, 1536, 1920, 2560]) {
  const p = await browser.newPage({ viewport: { width: W, height: 1024 } });
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(700);
  const overflow = await p.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    bodyScrollW: document.body.scrollWidth,
  }));
  const ok = overflow.scrollW <= overflow.clientW;
  log(`width ${W}: no horizontal overflow`, ok ? "PASS" : `FAIL ${JSON.stringify(overflow)}`);
  if (W === 1536) {
    await p.screenshot({ path: `${OUT}/w1536.png` });
  } else if (W === 1280 || W === 1920 || W === 2560) {
    await p.screenshot({ path: `${OUT}/w${W}.png` });
  }
  await p.close();
}

// ---------- 2. boundary 1279 vs 1280 ----------
{
  const p = await browser.newPage({ viewport: { width: 1279, height: 900 } });
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(600);
  const m = await p.evaluate(() => {
    const hero = document.querySelector(".dk-hero-card");
    const nav = document.querySelector(".dk-nav");
    return { heroW: Math.round(hero.getBoundingClientRect().width), navDisplay: getComputedStyle(nav).display };
  });
  log("1279 = mobile column (hero 480, nav hidden)", m.heroW === 480 && m.navDisplay === "none" ? "PASS" : `FAIL ${JSON.stringify(m)}`);
  await p.close();
}
{
  const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(600);
  const m = await p.evaluate(() => {
    const hero = document.querySelector(".dk-hero-card");
    const nav = document.querySelector(".dk-nav");
    const band = document.querySelector(".pc-band-img");
    return { heroW: Math.round(hero.getBoundingClientRect().width), navDisplay: getComputedStyle(nav).display, bandImgDisplay: getComputedStyle(band).display };
  });
  const ok = m.navDisplay === "flex" && m.bandImgDisplay === "none";
  log("1280 = desktop (nav shown, mobile band hidden)", ok ? "PASS" : `FAIL ${JSON.stringify(m)}`);
  await p.close();
}

// ---------- 3. DPR2 sharpness ----------
{
  const p = await browser.newPage({ viewport: { width: 1536, height: 1024 }, deviceScaleFactor: 2 });
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${OUT}/dpr2.png`, clip: { x: 0, y: 0, width: 1536, height: 1024 } });
  log("DPR2 capture", "saved (inspect dpr2.png)");
  await p.close();
}

// ---------- 4. seam test ----------
for (const W of [1536, 1920]) {
  const p = await browser.newPage({ viewport: { width: W, height: 1024 } });
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(700);
  const seam = await p.evaluate(() => {
    // find Scroll2 top in viewport coords by scrolling it into view
    const s2 = document.querySelector("#scroll-2");
    s2.scrollIntoView({ block: "start", behavior: "instant" });
    return { y: Math.round(s2.getBoundingClientRect().top) };
  });
  // stitch: capture the seam area (300px above + 300 below the section top)
  const page2 = await p.evaluate(() => window.scrollY);
  await p.screenshot({ path: `${OUT}/seam-${W}.png`, clip: { x: 0, y: 1024 / 2 - 300, width: W, height: 600 } });
  // numeric seam check: rows just above/below the section boundary
  const rowDelta = await p.evaluate(() => {
    const c = document.createElement("canvas");
    return null; // numeric check done in python below
  });
  log(`seam ${W}: captured (seam-${W}.png, scrollY=${page2})`, "visual + numeric below");
  await p.close();
}

// ---------- 5. interactions ----------
{
  const p = await browser.newPage({ viewport: { width: 1536, height: 1024 } });
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(700);

  // 5a. nav link navigates
  await p.click('.dk-nav-link:has-text("درباره ما")');
  await p.waitForURL("**/about", { timeout: 8000 }).catch(() => {});
  log("nav link → /about", p.url().includes("/about") ? "PASS" : "FAIL " + p.url());
  await p.goBack();
  await p.waitForTimeout(500);

  // 5b. drawer opens as 380d right panel + ESC closes
  await p.click('.dk-burger');
  await p.waitForTimeout(450);
  const drawer = await p.evaluate(() => {
    const d = document.querySelector(".dk-drawer");
    const b = d.getBoundingClientRect();
    return { w: Math.round(b.width), x: Math.round(b.x), vw: innerWidth };
  });
  const drawerOk = Math.abs(drawer.w - 380) <= 2 && Math.abs(drawer.x + drawer.w - drawer.vw) <= 2;
  log("drawer = 380d right panel", drawerOk ? "PASS" : `FAIL ${JSON.stringify(drawer)}`);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(350);
  log("drawer ESC close", (await p.$(".dk-drawer[data-state='closed']")) !== null ? "PASS" : "FAIL");

  // 5c. support sheet → centered dialog
  await p.click('.dk-headset');
  await p.waitForTimeout(450);
  const sup = await p.evaluate(() => {
    const d = document.querySelector(".dk-support");
    const b = d.getBoundingClientRect();
    return { w: Math.round(b.width), cx: Math.round(b.x + b.width / 2), h: Math.round(b.height) };
  });
  log("support sheet = 440d centered dialog", Math.abs(sup.w - 440) <= 2 && Math.abs(sup.cx - 768) <= 6 ? "PASS" : `FAIL ${JSON.stringify(sup)}`);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(350);

  // 5d. card click navigates
  await p.click('[data-slug="third-party"] a');
  await p.waitForURL("**/insurance/third-party", { timeout: 8000 }).catch(() => {});
  log("card link → /insurance/third-party", p.url().includes("/insurance/third-party") ? "PASS" : "FAIL " + p.url());
  await p.goBack();
  await p.waitForTimeout(500);

  // 5e. checkbox select → selection bar
  await p.click('[data-slug="third-party"] .pc-check-hit');
  await p.waitForTimeout(400);
  const sel = await p.evaluate(() => {
    const input = document.querySelector('[data-checkbox="third-party"]');
    const btn = document.querySelector(".dk-select");
    return { checked: input.checked, btnVisible: btn && getComputedStyle(btn).opacity === "1", text: btn?.textContent };
  });
  log("checkbox + continue CTA", sel.checked && sel.btnVisible && String(sel.text).includes("۱") ? "PASS" : `FAIL ${JSON.stringify(sel)}`);
  // persist across reload
  await p.reload({ waitUntil: "load" });
  await p.waitForTimeout(600);
  const persisted = await p.evaluate(() => document.querySelector('[data-checkbox="third-party"]').checked);
  log("selection persists (sessionStorage)", persisted ? "PASS" : "FAIL");
  await p.evaluate(() => sessionStorage.clear());
  await p.reload({ waitUntil: "load" });
  await p.waitForTimeout(500);

  // 5f. chat bar with text → ChatSheet seeded
  await p.fill(".dk-chatbar-input", "سلام تست");
  await p.press(".dk-chatbar-input", "Enter");
  await p.waitForTimeout(600);
  const chat = await p.evaluate(() => {
    const d = document.querySelector(".dk-chat");
    const msgs = document.querySelectorAll(".dk-chat [class*='rounded-2xl']");
    const b = d ? d.getBoundingClientRect() : null;
    return { open: !!d && d.getAttribute("data-state") === "open", w: b ? Math.round(b.width) : 0, msgCount: msgs.length, firstText: msgs[0]?.textContent };
  });
  log("chat bar → ChatSheet 480d seeded", chat.open && Math.abs(chat.w - 480) <= 3 && chat.msgCount >= 1 && (chat.firstText ?? "").includes("سلام تست") ? "PASS" : `FAIL ${JSON.stringify(chat)}`);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);

  // 5g. empty chat bar focuses input
  await p.click(".dk-chatbar-send");
  await p.waitForTimeout(300);
  const focused = await p.evaluate(() => document.activeElement === document.querySelector(".dk-chatbar-input"));
  log("empty chat bar focuses field", focused ? "PASS" : "FAIL");

  // 5h. hero bubble + mascot open chat
  await p.click(".hero-bubble", { force: true });
  await p.waitForTimeout(500);
  const chat2 = await p.evaluate(() => document.querySelector(".dk-chat")?.getAttribute("data-state"));
  log("bubble opens ChatSheet", chat2 === "open" ? "PASS" : `FAIL ${chat2}`);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  await p.click(".hero-mascot", { force: true });
  await p.waitForTimeout(500);
  const chat3 = await p.evaluate(() => document.querySelector(".dk-chat")?.getAttribute("data-state"));
  log("mascot opens ChatSheet", chat3 === "open" ? "PASS" : `FAIL ${chat3}`);
  await p.keyboard.press("Escape");

  // 5i. hover state on card
  await p.waitForTimeout(300);
  const before = await p.evaluate(() => getComputedStyle(document.querySelector('[data-slug="third-party"]')).transform);
  await p.hover('[data-slug="third-party"]');
  await p.waitForTimeout(250);
  const after = await p.evaluate(() => getComputedStyle(document.querySelector('[data-slug="third-party"]')).transform);
  log("card hover lifts", before !== after ? "PASS" : `FAIL ${before} → ${after}`);

  await p.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
console.log("\nVERIFY SUITE DONE");
