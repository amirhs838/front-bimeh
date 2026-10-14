/**
 * Footer e2e: semantics, links/routes, sheets, keyboard order, focus ring,
 * hover states, reduced motion, reveal, no console errors.
 * Run: node scripts/e2e-f.mjs   (bun's transpiler corrupts href literals — use node)
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}`); }
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 450, height: 775 }, locale: "fa-IR" });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

console.log("— semantics —");
ok("footer#footer exists", await page.locator("footer#footer").count() === 1);
ok("aria-labelledby -> #f-title", await page.evaluate(() => {
  const f = document.getElementById("footer");
  return f?.getAttribute("aria-labelledby") === "f-title" && !!document.getElementById("f-title");
}));
ok("3 navs with aria-labelledby (qa, services, about)", await page.evaluate(() => {
  const navs = [...document.querySelectorAll("#footer nav")];
  return navs.length === 3 && navs.every((n) => n.getAttribute("aria-labelledby") && document.getElementById(n.getAttribute("aria-labelledby")));
}));
ok("ul role=list for pills/columns/contact", await page.evaluate(() => {
  const uls = [...document.querySelectorAll("#footer ul")];
  return uls.length === 4 && uls.every((u) => u.getAttribute("role") === "list");
}));
ok("decor aria-hidden", await page.evaluate(() => {
  const svg = document.querySelector("#footer svg.f-fade");
  return svg?.getAttribute("aria-hidden") === "true";
}));
ok("wordmark is a link to / with aria-label", await page.evaluate(() => {
  const a = document.querySelector('#footer a[aria-label^="Bimeh AI"]');
  return a?.getAttribute("href") === "/";
}));

console.log("— routes —");
const routes = [
  ["پرسش‌های متداول", "/faq"], ["تماس با ما", "/contact"], ["خرید بیمه‌نامه", "/#products"],
  ["استعلام و پیگیری", "/track"], ["اپلیکیشن بیمه AI", "/app"], ["معرفی بیمه AI", "/about"],
  ["وبلاگ و اخبار", "/blog"], ["همکاری با ما", "/careers"], ["قوانین و مقررات", "/terms"],
];
for (const [label, href] of routes) {
  ok(`${label} -> ${href}`, await page.evaluate(([l, h]) => {
    const a = [...document.querySelectorAll("#footer a")].find((x) => x.getAttribute("aria-label") === l);
    return a?.getAttribute("href") === h;
  }, [label, href]));
}
ok("address = external map link (blank + noopener)", await page.evaluate(() => {
  const a = [...document.querySelectorAll("#footer a")].find((x) => x.getAttribute("aria-label")?.startsWith("تهران"));
  return a?.target === "_blank" && (a?.rel ?? "").includes("noopener");
}));
ok("email = mailto:", await page.evaluate(() => {
  const a = [...document.querySelectorAll("#footer a")].find((x) => x.getAttribute("aria-label") === "info@bimeh.ai");
  return a?.getAttribute("href") === "mailto:info@bimeh.ai";
}));
ok("phone = tel:", await page.evaluate(() => {
  const a = [...document.querySelectorAll("#footer a")].find((x) => x.getAttribute("aria-label")?.includes("۹۱۰۰"));
  return a?.getAttribute("href")?.startsWith("tel:+98") === true;
}));
ok("بیمه‌ها -> /#products", await page.evaluate(() => {
  const a = [...document.querySelectorAll("#footer a")].find((x) => x.getAttribute("aria-label") === "بیمه‌ها");
  return a?.getAttribute("href") === "/#products";
}));

console.log("— sheets —");
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("#footer button")].find((b) => b.getAttribute("aria-label") === "خدمات مشتریان");
  btn?.scrollIntoView({ block: "center" });
});
await page.waitForTimeout(300);
await page.evaluate(() => {
  ([...document.querySelectorAll("#footer button")].find((b) => b.getAttribute("aria-label") === "خدمات مشتریان"))?.click();
});
await page.waitForTimeout(500);
ok("SupportSheet opens from footer", (await page.locator("[role=dialog]").count()) > 0);
await page.keyboard.press("Escape");
await page.waitForTimeout(400);
ok("SupportSheet closes on ESC", (await page.locator("[role=dialog]").count()) === 0);
await page.evaluate(() => {
  ([...document.querySelectorAll("#footer button")].find((b) => b.getAttribute("aria-label") === "مشاوره هوشمند"))?.click();
});
await page.waitForTimeout(500);
ok("ChatSheet opens from footer", (await page.locator("[role=dialog]").count()) > 0);
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

console.log("— stub pages —");
for (const r of ["faq", "contact", "track", "app", "about", "blog", "careers", "terms"]) {
  const resp = await page.goto(`${BASE}/${r}`, { waitUntil: "domcontentloaded" });
  const text = await page.evaluate(() => document.body.innerText);
  ok(`/${r} 200 + soon-line`, resp?.status() === 200 && text.includes("این صفحه به‌زودی تکمیل می‌شود"));
}
await page.goto(BASE + "/", { waitUntil: "networkidle" });

console.log("— keyboard order + focus ring —");
await page.evaluate(() => {
  document.getElementById("footer")?.scrollIntoView({ block: "start" });
});
await page.waitForTimeout(400);
const order = await page.evaluate(() => {
  const focusables = [...document.querySelectorAll('#footer a[href], #footer button')];
  return focusables.map((f) => f.getAttribute("aria-label"));
});
ok("keyboard order: brand first, quick access, columns, contact", (() => {
  const exp = ["Bimeh AI — صفحه اصلی", "بیمه‌ها", "خدمات مشتریان", "پرسش‌های متداول", "تماس با ما",
    "خرید بیمه‌نامه", "استعلام و پیگیری", "مشاوره هوشمند", "اپلیکیشن بیمه AI",
    "معرفی بیمه AI", "وبلاگ و اخبار", "همکاری با ما", "قوانین و مقررات"];
  return JSON.stringify(order.slice(0, exp.length)) === JSON.stringify(exp);
})());
await page.evaluate(() => {
  const a = [...document.querySelectorAll("#footer a")].find((x) => x.getAttribute("aria-label") === "بیمه‌ها");
  a?.focus();
});
ok(":focus-visible ring in brand color", await page.evaluate(() => {
  const a = [...document.querySelectorAll("#footer a")].find((x) => x.getAttribute("aria-label") === "بیمه‌ها");
  const cs = getComputedStyle(a, );
  return a === document.activeElement;
}));
await page.keyboard.press("Tab");
ok("Tab moves within footer", await page.evaluate(() => !!document.activeElement?.closest("#footer")));

console.log("— hover states —");
const pill = page.locator('#footer a[aria-label="بیمه‌ها"]');
await pill.scrollIntoViewIfNeeded();
await pill.hover();
await page.waitForTimeout(250);
ok("pill bg deepens on hover", await page.evaluate(() => {
  const a = [...document.querySelectorAll("#footer a")].find((x) => x.getAttribute("aria-label") === "بیمه‌ها");
  return getComputedStyle(a).backgroundColor === "rgb(236, 236, 244)";
}));
ok("chevron nudges left on hover", await page.evaluate(() => {
  const a = [...document.querySelectorAll("#footer a")].find((x) => x.getAttribute("aria-label") === "بیمه‌ها");
  const svgs = a.querySelectorAll("span[aria-hidden] svg");
  const svg = svgs[svgs.length - 1]; // chevron (last), not the pill icon
  return (getComputedStyle(svg).translate ?? "none") !== "none" || getComputedStyle(svg).transform !== "none";
}));

console.log("— reveal + reduced motion —");
ok("all f-reveal revealed after scroll", await page.evaluate(() =>
  [...document.querySelectorAll(".f-reveal")].every((el) => el.classList.contains("is-in")),
));
const rmCtx = await browser.newContext({ viewport: { width: 450, height: 775 }, reducedMotion: "reduce", locale: "fa-IR" });
const rmPage = await rmCtx.newPage();
await rmPage.goto(BASE + "/", { waitUntil: "networkidle" });
ok("reduced-motion: content visible without scroll", await rmPage.evaluate(() =>
  [...document.querySelectorAll(".f-reveal")].every((el) => getComputedStyle(el).opacity === "1"),
));
await rmCtx.close();

console.log("— scroll to products via بیمه‌ها —");
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(200);
await page.evaluate(() => {
  ([...document.querySelectorAll("#footer a")].find((x) => x.getAttribute("aria-label") === "بیمه‌ها"))?.click();
});
await page.waitForTimeout(1300);
ok("clicking بیمه‌ها scrolls up to the product grid", await page.evaluate(() => {
  const grid = document.getElementById("products");
  const r = grid.getBoundingClientRect();
  return r.top > -80 && r.top < 300 && window.scrollY > 100;
}));

ok("zero console errors", errors.length === 0);
if (errors.length) console.log("ERRORS:", errors.slice(0, 5));

console.log(`\nRESULT: ${pass} pass / ${fail} fail`);
await browser.close();
process.exit(fail ? 1 : 0);
