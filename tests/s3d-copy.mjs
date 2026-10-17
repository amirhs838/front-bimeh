/**
 * COPY PARITY (desktop-s3 §6): for each feature, the DESKTOP description
 * lines joined with a space must equal the MOBILE lines joined (ZWNJ +
 * whitespace normalized); titles equal for features 2-5; feature 1's
 * desktop title must be a PREFIX of the mobile title.
 * Usage: node tests/s3d-copy.mjs
 */
const ZWNJ = /\u200c/g;
const norm = (s) => s.replace(ZWNJ, "").replace(/\s+/g, " ").trim();

const features = (await import("../src/data/features.ts")).features;
const { content } = await import("../src/data/content.ts");

let fail = 0;
features.forEach((f, i) => {
  const m = content.intro.cards[i];
  const dJoin = norm(f.dk.linesDk.join(" "));
  const mJoin = norm(m.lines.join(" "));
  if (dJoin !== mJoin) {
    console.error(`feature ${f.n} desc MISMATCH:\n  dk: ${dJoin}\n  m : ${mJoin}`);
    fail++;
  }
  if (f.n === 1) {
    if (!norm(m.title).startsWith(norm(f.dk.titleDk))) {
      console.error(`feature 1 dk title is not a prefix of mobile title:\n  dk: ${f.dk.titleDk}\n  m : ${m.title}`);
      fail++;
    }
  } else if (norm(f.dk.titleDk) !== norm(m.title)) {
    console.error(`feature ${f.n} title MISMATCH:\n  dk: ${f.dk.titleDk}\n  m : ${m.title}`);
    fail++;
  }
});
console.log(fail ? `COPY PARITY: ${fail} FAILURES` : "COPY PARITY: 5/5 PASS");
process.exit(fail ? 1 : 0);
