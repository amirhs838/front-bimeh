/**
 * FOOTER DESKTOP copy parity (§6 unit test):
 * 1. paragraphLinesDesktop == exactly the 5 D4 lines.
 * 2. Mobile footer arrays unchanged (snapshot below, from the approved build).
 * 3. Rendered desktop <p> shows exactly those 5 lines (ZWNJ + ws normalized).
 * Run: node tests/fd-copy.mjs
 */
import { chromium } from "playwright";
import { footer, paragraphLinesDesktop } from "../src/data/footer.ts";

let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${extra ? ` — ${extra}` : ""}`); }
};
const norm = (s) => s.replace(/\u200c/g, "").replace(/\s+/g, " ").trim();

const D4_LINES = [
  "با استفاده از هوش مصنوعی، بهترین پیشنهادهای بیمه‌ای را در چند ثانیه",
  "برای شما پیدا می‌کند. Bimeh AI با تحلیل نیازها و شرایط شما، مقایسه‌ای",
  "دقیق از گزینه‌ها و ارائه توصیه‌های شخصی‌سازی‌شده، انتخاب بیمه را",
  "ساده‌تر، سریع‌تر و مطمئن‌تر می‌کند. ما اینجا هستیم تا تکنولوژی، آینده‌ای",
  "امن‌تر برای شما بسازیم.",
];

ok("paragraphLinesDesktop = 5 lines", paragraphLinesDesktop.length === 5);
ok("lines match D4 exactly", paragraphLinesDesktop.every((l, i) => norm(l) === norm(D4_LINES[i])));

// mobile snapshot (must be byte-identical to the approved mobile build)
const SNAP = {
  heading: "اولین پلتفرم هوشمند بیمه در ایران",
  l2: "برای شما پیدا می‌کند. Bimeh AI با تحلیل نیازها و شرایط شما، مقایسه دقیق",
  l3: "گزینه‌ها و ارائه توصیه‌های شخصی‌سازی‌شده، خرید بیمه را ساده‌تر، سریع‌تر",
  quick: ["بیمه‌ها", "خدمات مشتریان", "پرسش‌های متداول", "تماس با ما"],
  about: ["معرفی بیمه AI", "وبلاگ و اخبار", "همکاری با ما", "قوانین و مقررات"],
  services: ["خرید بیمه‌نامه", "استعلام و پیگیری", "مشاوره هوشمند", "اپلیکیشن بیمه AI"],
};
ok("mobile heading unchanged", footer.intro.heading === SNAP.heading);
ok("mobile L2 unchanged (مقایسه دقیق)", footer.intro.lines[1].text === SNAP.l2, footer.intro.lines[1].text);
ok("mobile L3 unchanged (خرید بیمه)", footer.intro.lines[2].text === SNAP.l3, footer.intro.lines[2].text);
ok("mobile quick labels unchanged", JSON.stringify(footer.quick.items.map((i) => i.label)) === JSON.stringify(SNAP.quick));
ok("mobile about labels unchanged", JSON.stringify(footer.columns.left.links.map((i) => i.label)) === JSON.stringify(SNAP.about));
ok("mobile services labels unchanged", JSON.stringify(footer.columns.right.links.map((i) => i.label)) === JSON.stringify(SNAP.services));

// rendered desktop paragraph
const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
const p = await (await browser.newContext({ viewport: { width: 1536, height: 900 } })).newPage();
await p.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 60000 });
const lines = await p.evaluate(() => {
  const para = document.querySelector("#footer .f-para-d");
  return [...para.querySelectorAll(".f-para-d-line, .f-para-d-l5")].map((el) => el.innerText);
});
ok("DOM: exactly 5 desktop lines", lines.length === 5, String(lines.length));
ok("DOM lines == data lines (normalized)", lines.every((l, i) => norm(l) === norm(D4_LINES[i])), JSON.stringify(lines.map(norm)));
// and the mobile paragraph must NOT be the desktop text
const mobL2 = await p.evaluate(() => document.querySelector("#footer .f-para-m")?.innerText || "");
ok("mobile paragraph keeps مقایسه دقیق (not desktop wording)", mobL2.includes("مقایسه دقیق"), "");
await browser.close();

console.log(`\nFD COPY: ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
