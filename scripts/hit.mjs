import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 450, height: 875 } })).newPage();
await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await p.waitForTimeout(600);
const r = await p.evaluate(() => {
  const links = document.querySelectorAll("a[href^='/insurance/']");
  const inputs = document.querySelectorAll("input[type=checkbox]");
  const card = document.querySelector("a[href='/insurance/third-party']");
  return {
    links: links.length,
    inputs: inputs.length,
    cardHTML: card ? card.outerHTML.slice(0, 600) : "NO CARD",
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
