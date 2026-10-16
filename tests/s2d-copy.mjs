/**
 * COPY PARITY TEST (desktop-s2 master prompt §6): for each step, the desktop
 * 2 lines joined with a space must equal the mobile 3 lines joined with a
 * space, after normalizing ZWNJ (\u200c) and whitespace.
 * Run: node tests/s2d-copy.mjs
 */
import fs from "node:fs";

const content = fs.readFileSync("src/data/content.ts", "utf8");
// crude extraction of the why.steps block
const why = content.slice(content.indexOf("why: {"), content.indexOf("intro: {"));
const stepsArr = why.slice(why.indexOf("steps: ["));
const norm = (s) => s.replace(/\u200c/g, "").replace(/\s+/g, " ").trim();

const stepBlocks = stepsArr.split("title:").slice(1);
let fail = 0;
stepBlocks.forEach((block, i) => {
  const arr = (name) => {
    const m = block.match(new RegExp(`${name}:\\s*\\[([^\\]]+)\\]`, "s"));
    return m
      ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1])
      : null;
  };
  const mobile = arr("lines");
  const desktop = arr("linesDesktop");
  if (!mobile || !desktop) {
    console.error(`step ${i + 1}: MISSING arrays (mobile=${!!mobile} desktop=${!!desktop})`);
    fail++;
    return;
  }
  const a = norm(mobile.join(" "));
  const b = norm(desktop.join(" "));
  if (a !== b) {
    console.error(`step ${i + 1}: MISMATCH\n  mobile:   ${a}\n  desktop:  ${b}`);
    fail++;
  } else {
    console.log(`step ${i + 1}: parity OK (${a.length} chars normalized)`);
  }
});
if (stepBlocks.length !== 4) {
  console.error(`expected 4 steps, found ${stepBlocks.length}`);
  fail++;
}
process.exit(fail ? 1 : 0);
