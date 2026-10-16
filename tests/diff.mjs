/**
 * PIXEL DIFF (master prompt section 10) — compares two PNGs with pixelmatch.
 * Usage: node tests/diff.mjs <a.png> <b.png> [mask "x,y,w,h;x,y,w,h"]
 * Writes <a>-diff.png and prints: total px, % different, worst rows.
 */
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import fs from "node:fs";

const [aPath, bPath, maskSpec] = process.argv.slice(2);
if (!aPath || !bPath) {
  console.error("usage: node tests/diff.mjs <a.png> <b.png> [mask]");
  process.exit(1);
}
const a = PNG.sync.read(fs.readFileSync(aPath));
const b = PNG.sync.read(fs.readFileSync(bPath));
const W = Math.min(a.width, b.width);
const H = Math.min(a.height, b.height);
const diff = new PNG({ width: W, height: H });

const mask = (maskSpec ?? "").split(";").filter(Boolean).map((s) => s.split(",").map(Number));
const inMask = (x, y) => mask.some(([mx, my, mw, mh]) => x >= mx && x < mx + mw && y >= my && y < my + mh);

// remap mask coords if b is the D1 reference at natural size (caller handles scaling)
const d = pixelmatch(
  new Uint8Array(a.data.buffer, a.data.byteOffset, a.data.byteLength),
  new Uint8Array(b.data.buffer, b.data.byteOffset, b.data.byteLength),
  new Uint8Array(diff.data.buffer, diff.data.byteOffset, diff.data.byteLength),
  W,
  H,
  { threshold: 0.1, includeAA: true, alpha: 0.1 }
);

// count per-row to locate mismatches
const rowHits = new Uint32Array(H);
let total = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (diff.data[i] === 255 && diff.data[i + 1] === 0) {
      if (inMask(x, y)) {
        // neutralize masked px in the reported count (keep image)
        diff.data[i] = 128; diff.data[i + 1] = 128; diff.data[i + 2] = 255;
        continue;
      }
      rowHits[y]++;
      total++;
    }
  }
}
fs.writeFileSync(aPath.replace(/\.png$/, "-diff.png"), PNG.sync.write(diff));
const pct = ((total / (W * H)) * 100).toFixed(3);
console.log(`diff ${total} px (${pct}%)  size ${W}x${H}`);
const rows = [];
for (let y = 0; y < H; y++) if (rowHits[y] > W * 0.005) rows.push(`${y}:${rowHits[y]}`);
console.log("busy rows:", rows.slice(0, 60).join(" ") || "none");
