/**
 * FOOTER DESKTOP pixel-vs-D4: captures the footer at 1536 (DPR1), resizes
 * D4 to 1536 x round(940*1536/1672), runs pixelmatch, saves
 * shot/diff/side-by-side. Usage: node tests/fd-pdiff.mjs [label]
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const LABEL = process.argv[2] ?? "iter";
const W = 1536;
const H = Math.round((940 * 1536) / 1672); // 864
const OUT = `/tmp/fd-${LABEL}`;
fs.mkdirSync(OUT, { recursive: true });

// 1) capture
execFileSync("node", ["tests/fd-capture.mjs", `${OUT}/shot.png`, String(W), "1"], {
  stdio: "inherit",
  cwd: "/home/z/my-project",
});

// 2) resize D4 to the frame
execFileSync(
  "python3",
  [
    "-c",
    `from PIL import Image
im = Image.open('/home/z/my-project/upload/Persian Insurance AI Website Footer.png').convert('RGB')
im = im.resize((${W}, ${H}), Image.LANCZOS)
im.save('${OUT}/d4.png')`,
  ],
  { cwd: "/home/z/my-project" },
);

// 3) compare
const d4 = PNG.sync.read(fs.readFileSync(`${OUT}/d4.png`));
let shot = PNG.sync.read(fs.readFileSync(`${OUT}/shot.png`));
if (shot.height !== H) {
  // crop/pad the shot to exactly H from the bottom
  const fixed = new PNG({ width: W, height: H });
  const src = shot;
  // footer bottom == viewport bottom: copy the LAST H rows
  PNG.bitblt(src, 0, src.height - H, W, H, fixed, 0, 0);
  shot = fixed;
}
const diff = new PNG({ width: W, height: H });
const n = pixelmatch(d4.data, shot.data, diff.data, W, H, {
  threshold: 0.12,
  includeAA: false,
  alpha: 0.1,
});
fs.writeFileSync(`${OUT}/diff.png`, PNG.sync.write(diff));
const pct = ((n / (W * H)) * 100).toFixed(3);
console.log(`pixelmatch: ${n} px (${pct}%)`);

// 4) side-by-side + 50% overlay
execFileSync(
  "python3",
  [
    "-c",
    `from PIL import Image
a = Image.open('${OUT}/d4.png'); b = Image.open('${OUT}/shot.png'); d = Image.open('${OUT}/diff.png')
side = Image.new('RGB', (${W}*3+20, ${H}), (40,40,40))
side.paste(a,(0,0)); side.paste(b,(${W}+10,0)); side.paste(d,(${W}*2+20,0))
side.save('${OUT}/side.png')
Image.blend(a,b,0.5).save('${OUT}/overlay.png')`,
  ],
  { cwd: "/home/z/my-project" },
);
console.log(`artifacts in ${OUT}`);
