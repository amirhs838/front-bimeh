/**
 * End-to-end interaction tests for Bimeh AI Scroll 1.
 * Run: node scripts/e2e.mjs  (bun's transpiler mangles a[href selectors)
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const link = (slug) => `a[href='/insurance/${slug}']`;
const checkbox = (slug) => `input[data-checkbox='${slug}']`;
const overlayLinks = `a[href^='/insurance/']`;

let failures = 0;
function check(name, cond, extra = "") {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
  if (!cond) failures++;
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 450, height: 875 },
  deviceScaleFactor: 2,
  locale: "fa-IR",
});
const page = await ctx.newPage();
const consoleErrors = [];
page.on("console", (m) => {
  if (m.type() === "error" && !m.text().includes("Failed to load resource")) consoleErrors.push(m.text());
});
page.on("pageerror", (e) => consoleErrors.push(String(e)));

await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);

// ---------- 1. static structure ----------
check("8 overlay links", (await page.locator(overlayLinks).count()) === 8);
check("badges on 5 cards", (await page.locator("span.bg-brand.text-white").count()) === 5);
check("info strips on 2 full cards", (await page.locator("span.bg-strip").count()) === 2);

// ---------- 2. checkbox selection + continue bar ----------
const firstCheckbox = page.locator(checkbox("third-party"));
await firstCheckbox.click();
await page.waitForTimeout(250);
check("checkbox checked", await firstCheckbox.isChecked());
await firstCheckbox.click();
await page.waitForTimeout(200);
check("checkbox toggles off", !(await firstCheckbox.isChecked()));
check("continue bar hidden when 0 selected", !(await page.getByRole("button", { name: /ادامه با/ }).isVisible().catch(() => false)));

await firstCheckbox.click();
await page.locator(checkbox("body")).click();
await page.waitForTimeout(300);
const bar = page.getByRole("button", { name: /ادامه با/ });
check("continue bar appears with 2 selected", await bar.isVisible());
check("continue bar uses Persian digits", (await bar.textContent())?.includes("۲") ?? false);

const stored = await page.evaluate(() => sessionStorage.getItem("bimeh-selection"));
check("selection persisted in sessionStorage", stored?.includes("third-party") === true);

// ---------- 3. card navigation ----------
await page.locator(checkbox("body")).click();
await page.waitForTimeout(150);
check("checkbox click does not navigate", page.url() === BASE + "/");
await page.locator(link("body")).click();
await page.waitForURL("**/insurance/body");
check("card click navigates to /insurance/body", page.url().endsWith("/insurance/body"));
check("stub page shows product title", (await page.locator("h1").textContent())?.includes("بیمه بدنه") === true);
await page.locator("a[aria-label='بازگشت']").first().click();
await page.waitForURL(BASE + "/");
check("back button returns home", page.url() === BASE + "/");
check("selection persisted after navigation", ((await page.evaluate(() => sessionStorage.getItem("bimeh-selection"))) ?? "").includes("third-party"));

// ---------- 4. continue → quote ----------
await page.locator(checkbox("body")).click();
await page.waitForTimeout(250);
await page.getByRole("button", { name: /ادامه با/ }).click();
await page.waitForURL("**/quote?items=third-party,body");
check("quote page opens with items param", page.url().includes("quote?items=third-party,body"));
check("quote lists 2 products", (await page.locator("main img").count()) === 2);
await page.locator("a[aria-label='بازگشت']").first().click();
await page.waitForURL(BASE + "/");

// ---------- 5. drawer ----------
await page.locator("button[aria-label='منو']").click();
await page.waitForTimeout(400);
const drawer = page.locator("[role=dialog]");
check("drawer opens", await drawer.isVisible());
check("drawer has nav links", (await drawer.locator("a").count()) >= 8);
await page.keyboard.press("Escape");
await page.waitForTimeout(350);
check("drawer closes on ESC", (await page.locator("[role=dialog]").count()) === 0);
await page.locator("button[aria-label='منو']").click();
await page.waitForTimeout(350);
await page.mouse.click(60, 400);
await page.waitForTimeout(350);
check("drawer closes on overlay click", (await page.locator("[role=dialog]").count()) === 0);

// ---------- 6. support sheet ----------
await page.locator("header button[aria-label='پشتیبانی']").click();
await page.waitForTimeout(400);
const support = page.locator("[role=dialog]");
check("support sheet opens", await support.isVisible());
check("support has tel link", (await support.locator("a[href^='tel:']").count()) === 1);
await support.getByRole("button", { name: "چت با هوش مصنوعی" }).click();
await page.waitForTimeout(450);
const chat = page.locator("[role=dialog]");
check("support → chat sheet opens", (await chat.locator("input").count()) >= 1);
await page.keyboard.press("Escape");
await page.waitForTimeout(300);

// ---------- 7. chat flow ----------
await page.locator("input[aria-label='سوال خود را اینجا بنویسید...']").fill("سلام");
await page.keyboard.press("Enter");
await page.waitForTimeout(500);
const dialog = page.locator("[role=dialog]");
check("chat sheet opened with seeded message", (await dialog.locator("text=سلام").count()) >= 1);
await page.waitForTimeout(1200);
check("bot reply arrives", (await dialog.locator("div.justify-start").count()) >= 1);
await page.route("**/api/chat", (route) => route.abort());
await dialog.locator("input").fill("تست خطا");
await dialog.locator("input").press("Enter");
await page.waitForTimeout(900);
check("error bubble + retry shown", await dialog.getByRole("button", { name: "تلاش دوباره" }).isVisible().catch(() => false));
await page.unroute("**/api/chat");
await dialog.getByRole("button", { name: "تلاش دوباره" }).click();
await page.waitForTimeout(900);
check("retry succeeds", (await dialog.getByRole("button", { name: "تلاش دوباره" }).count()) === 0);
await page.keyboard.press("Escape");
await page.waitForTimeout(300);

// empty chat bar → focuses input
const chatInput = page.locator("input[aria-label='سوال خود را اینجا بنویسید...']");
await chatInput.click();
await chatInput.fill("");
await page.keyboard.press("Enter");
await page.waitForTimeout(250);
check("empty enter focuses input (no sheet)", (await page.locator("[role=dialog]").count()) === 0);
check("input focused", await chatInput.evaluate((el) => document.activeElement === el));

// ---------- 8. hero ----------
await page.locator("button[aria-label='شروع گفتگو با هوش مصنوعی']").first().click({ force: true }); // hero mascot (first match)
await page.waitForTimeout(400);
check("mascot/bubble opens chat", (await page.locator("[role=dialog]").count()) === 1);
await page.keyboard.press("Escape");
await page.waitForTimeout(300);

// ---------- 9. register ----------
await page.locator("header a[href='/register']").click();
await page.waitForURL("**/register");
check("register page opens", page.url().endsWith("/register"));
const phone = page.locator("#phone");
await phone.fill("09123");
check("send disabled for invalid phone", await page.getByRole("button", { name: "ارسال کد" }).isDisabled());
await phone.fill("09123456789");
check("send enabled for valid phone", !(await page.getByRole("button", { name: "ارسال کد" }).isDisabled()));
await phone.fill("۰۹۱۲۳۴۵۶۷۸۹");
await page.getByRole("button", { name: "ارسال کد" }).click();
await page.waitForTimeout(300);
check("OTP step appears", await page.locator("#otp").isVisible());
await page.locator("#otp").fill("1111");
await page.getByRole("button", { name: "تایید و ادامه" }).click();
await page.waitForTimeout(250);
check("wrong code shows error", (await page.locator("text=کد وارد شده صحیح نیست.").count()) === 1);
await page.locator("#otp").fill("۱۲۳۴");
await page.getByRole("button", { name: "تایید و ادامه" }).click();
await page.waitForTimeout(300);
check("success state shown", (await page.locator("text=ثبت نام انجام شد").count()) === 1);

// ---------- 10. stub pages ----------
for (const slug of ["third-party", "home", "implant"]) {
  await page.goto(`${BASE}/insurance/${slug}`);
  await page.waitForTimeout(200);
  check(`/insurance/${slug} renders`, (await page.locator("h1").count()) === 1);
}

// ---------- 11. header glass ----------
await page.goto(BASE + "/");
await page.waitForTimeout(400);
const headerBg1 = await page.locator("header").evaluate((el) => getComputedStyle(el).backgroundColor);
await page.evaluate(() => window.scrollTo(0, 300));
await page.waitForTimeout(300);
const headerBg2 = await page.locator("header").evaluate((el) => getComputedStyle(el).backgroundColor);
check("header transparent at top", headerBg1 === "rgba(0, 0, 0, 0)");
check("header glass after scroll", headerBg2 !== headerBg1);

// ---------- 12. reduced motion ----------
const ctx2 = await browser.newContext({ viewport: { width: 450, height: 875 }, reducedMotion: "reduce" });
const p2 = await ctx2.newPage();
await p2.goto(BASE + "/", { waitUntil: "networkidle" });
const anim = await p2.locator(".anim-hero-float").first().evaluate((el) => getComputedStyle(el).animationDuration);
check("reduced motion disables float", parseFloat(anim) * 1000 < 1, `dur=${anim}`);
await ctx2.close();

// ---------- console ----------
check("no console/page errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));

await browser.close();
console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
