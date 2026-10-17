/**
 * GOLDEN CHECK for desktop-s3 — re-captures the mobile full-page goldens
 * (median-of-5, DPR2) at the 10 frozen widths and pixel-compares them with
 * tests/golden/m-*.png. Exit code 1 if ANY width differs by more than the
 * documented webp-edge noise budget (0.022% of page pixels).
 *
 * Usage: node tests/golden-check-s3d.mjs <outdir>
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const OUT = process.argv[2] ?? "/tmp/golden-check-s3d";
fs.mkdirSync(OUT, { recursive: true });
const WIDTHS = [360, 390, 412, 430, 450, 480, 600, 768, 1024, 1279];
const N = 5;
let fail = false;

for (const W of WIDTHS) {
  const out = path.join(OUT, `m-${W}.png`);
  execFileSync(
    "node",
    ["tests/median-capture.mjs", "http://localhost:3000/", out, String(W), "900", "2", "full", String(N)],
    { stdio: "inherit", cwd: "/home/z/my-project" },
  );
  const goldPath = `/home/z/my-project/tests/golden/m-${W}.png`;
  if (!fs.existsSync(goldPath)) {
    console.error(`GOLDEN MISSING: ${goldPath}`);
    fail = true;
    continue;
  }
  const gold = PNG.sync.read(fs.readFileSync(goldPath));
  const cur = PNG.sync.read(fs.readFileSync(out));
  if (gold.width !== cur.width || gold.height !== cur.height) {
    console.error(`W${W}: SIZE MISMATCH gold ${gold.width}x${gold.height} vs cur ${cur.width}x${cur.height}`);
    fail = true;
    continue;
  }
  const diff = new PNG({ width: gold.width, height: gold.height });
  const n = pixelmatch(gold.data, cur.data, diff.data, gold.width, gold.height, {
    threshold: 0.12, includeAA: false, alpha: 0.1,
  });
  const pct = ((n / (gold.width * gold.height)) * 100).toFixed(4);
  const status = n / (gold.width * gold.height) <= 0.00022 ? "PASS" : "FAIL";
  if (status === "FAIL") fail = true;
  if (n > 0) fs.writeFileSync(path.join(OUT, `diff-${W}.png`), PNG.sync.write(diff));
  console.log(`W${W}: ${n} px (${pct}%) ${status}`);
}
console.log(fail ? "GOLDEN CHECK: FAIL" : "GOLDEN CHECK: ALL PASS");
process.exit(fail ? 1 : 0);
