import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import fs from "node:fs";
const [aPath, bPath] = process.argv.slice(2);
const a = PNG.sync.read(fs.readFileSync(aPath));
const b = PNG.sync.read(fs.readFileSync(bPath));
const d = new PNG({ width: a.width, height: a.height });
const n = pixelmatch(a.data, b.data, d.data, a.width, a.height, { threshold: 0.12, includeAA: false, alpha: 0.1 });
console.log(`${aPath.split("/").pop()} vs golden: ${n} px = ${((n / (a.width * a.height)) * 100).toFixed(4)}% ${n / (a.width * a.height) <= 0.00022 ? "PASS" : "FAIL"}`);
