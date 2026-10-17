/**
 * DOM probe: natural (nowrap) widths of the desktop paragraph lines + key
 * footer text ink widths, at 1536. Usage: node tests/fd-probe.mjs
 */
import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
const ctx = await browser.newContext({ viewport: { width: 1536, height: 865 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(300);

const data = await p.evaluate(() => {
  const out = {};
  const para = document.querySelector("#footer .f-para-d");
  if (para) {
    const fs = parseFloat(getComputedStyle(para).fontSize);
    out.paraFontSize = fs;
    out.lines = Array.from(para.querySelectorAll(".f-para-d-line, .f-para-d-l5")).map((el) => {
      const r = el.getBoundingClientRect();
      const clone = el.cloneNode(true);
      clone.style.whiteSpace = "nowrap";
      clone.style.position = "absolute";
      clone.style.visibility = "hidden";
      clone.style.textAlign = "right";
      clone.style.textAlignLast = "auto";
      el.appendChild(clone);
      const w = clone.getBoundingClientRect().width;
      el.removeChild(clone);
      return { natW: w, boxW: r.width, fs };
    });
  }
  const probe = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    return { x: r.x, y: r.y + window.scrollY, w: r.width, h: r.height, fs: st.fontSize, right: r.right };
  };
  out.brand = probe("#footer .f-brand-link");
  out.title = probe("#f-title");
  out.tAbout = probe("#footer .f-col-about > h3");
  out.tServ = probe("#footer .f-col-services > h3");
  out.tQuick = probe("#footer .f-col-quick > h3");
  out.footerTop = document.querySelector("#footer").getBoundingClientRect().top + window.scrollY;
  return out;
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
