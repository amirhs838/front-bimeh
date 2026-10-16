# Bimeh AI — Worklog

Project: Pixel-perfect RTL (Persian) rebuild of Bimeh AI "Scroll 1" from reference image
`/home/z/my-project/upload/1.jpg` (899x1750 @2x → 450x875 CSS frame).

---
Task ID: 1
Agent: main (Z.ai Code)
Task: Inspect environment + reference image (colors, crops, geometry sampling)

Work Log:
- Confirmed stack: Next.js 16.1.1 / React 19 / Tailwind 4 / TS5, dev server already running on :3000.
- Sampled reference image with PIL/numpy (analysis/inspect_ref.py, geometry.py, metrics.py, extract.py, extract2.py).
- Measured exact geometry (CSS px): header y0–59; hero x19–430.5 y58–250.5 r16; mascot 139x168.5 @ (252,76);
  bubble 117x45 @ (124,171); avatar 39x39 @ (75,174); typing pill 38x20 @ (136,220);
  rows: full 118/119, halves 99/95/90 with 6.5px col gap (right col 200, left col 204.5);
  illustration band top inset 8.5, heights 46.5/50/46/45/45; chat bar 411.5x43 @ y816 r14;
  send btn 37x27 @ (381.5,826.5); sparkles @ (37,829.5); badge h15 @ top 9.5 right 7.
- Sampled true colors (mode/median): brand #FC1B37, page #F1F5FB→#EDF3F9, card #F7F9FC(effective), band #EEF3F9,
  strip #F9F2F6, pill #E4E8EE, tab #FDFDFE, headline ink ≈#3F4550, title ink ≈#101E30, bubble text #131F2B,
  subtitle #7FA9DC, checkbox border #4D586B, avatar pink #F4959F, placeholder #A9BFDD.
- Downloaded fonts: Vazirmatn 400–900 + Poppins 600/700/800 (woff2 → src/fonts/).
- Installed rembg+onnxruntime; extracted mascot (278x337 → 139x168.5 CSS) cleanly incl. white shoes/gloves.
- Extracted 8 product illustrations via luminance keying (dark strokes + red accents on transparency).
  Faint skyline is below keying threshold → will be re-drawn as SVG (sanctioned by spec §5).

Stage Summary:
- All measurements/colors/assets ready. Assets in public/img/ (mascot.webp/png + 8 illustrations).
- Fonts in src/fonts/. Analysis scripts kept in analysis/ for the verification loop.

---
Task ID: 2
Agent: main (Z.ai Code)
Task: Asset extraction (mascot, illustrations) + fonts

Work Log:
- Extracted mascot via rembg/u2net from 1.jpg (280x338 @2x), feathered alpha, no halos; white shoes/gloves and chest wordmark intact.
- Extracted 8 product line-art illustrations via luminance keying (dark strokes + red accents on transparency, band bg unmixed).
- Final architecture: illustration BANDS (band bg + faint skyline + artwork) are extracted as exact-pixel PNG strips per card
  (public/img/{slug}-band.png) rendered 1:1 at integer CSS boxes to avoid Chrome snap-and-resample blur; transparent
  per-product illustrations kept for sub-pages.
- Fonts: Estedad 400–900 (woff2, next/font/local) — chosen after glyph comparison beat Vazirmatn (proportions match the
  reference headline/title metrics); Poppins 600/700/800 for the Latin wordmark (calibrated 20px ≈ ref 88.5x16.5px).

Stage Summary:
- All raster assets in public/img/, fonts in src/fonts/. Analysis tooling in analysis/ + scripts/.

---
Task ID: 3-5
Agent: main (Z.ai Code)
Task: Tokens, data layer, components, Scroll1

Work Log:
- globals.css: sampled design tokens (--brand #FC1B37, inks, band/strip/pill colors), proportional scaling
  (html font-size = 100vw/28.125 capped at 17.0666px → 450px frame renders exactly, >480px capped column), reduced-motion.
- Data: src/data/content.ts (ALL copy), products.ts (8 products + per-row measured geometry), site.ts (nav/contact config).
- Components: Header (sticky, glass after scroll, LTR physical layout), Drawer (radix, RTL slide-in, focus trap),
  SupportSheet, ChatSheet (full-height chat: seed, typing, error+retry), ChatBar (sparkle + send), SelectionBar
  (floating "ادامه با {n} بیمه"), AppShell; HeroBanner (CSS studio gradient + floor + streaks, floating mascot, bubble,
  avatar, animated typing pill); ProductCard/Grid (overlay-link card pattern, real checkbox, animated check, 44px hit area).
- Product card structure: card is a <div>, transparent overlay <a> navigates, checkbox layer sits above it — no nested
  interactive elements, no preventDefault conflicts (React 19 controlled-checkbox restore bug avoided by design).
- Pages: / (Scroll1 + #scroll-2/#scroll-3 anchors), /register (mock OTP), /insurance/[slug] (8 stubs + 404), /quote,
  POST /api/chat (mock Persian replies, AI_API_URL/AI_API_KEY env hookup). Favicon icon.svg. SEO metadata fa_IR.

Stage Summary:
- Full Scroll 1 implemented data-driven; copy centralized; all interactions per spec §6.

---
Task ID: 7-8
Agent: main (Z.ai Code)
Task: Pixel verification loop + interaction/responsive tests

Work Log:
- Built scripts/verify.ts (Playwright 450x875@2x, reducedMotion, fonts ready) + pixelmatch diff vs reference resized 900x1750.
- Iterated ~10 rounds: fixed container width (411.5px exact), header height 58px, per-row title/subtitle offsets,
  font sizes calibrated by width-matching (headline 26.2px Black, titles 11.5px, subtitles 8px, strip 7.6px, badge 9.4/7.6px),
  badge per-row geometry (reference is inconsistent: full-row 1 badge sits at 9.5px, others 4.5px), typing dots (5.5px/gap4),
  chat-bar input on the LEFT (was wrongly right-aligned), integer CSS boxes for all images (Chrome half-pixel resample fix),
  next/image unoptimized, bg glow/opacity tuning.
- FINAL DIFF: 4.06% (pixelmatch t=0.12, includeAA off) — residual is text rasterizer AA, mascot edge AA, subtle gradient
  shapes (all elements verified within ±1px via ink-bbox comparison script).
- scripts/e2e.mjs (node; bun 1.3.14 transpiler corrupts a[href string literals at runtime — documented): 44/44 PASS
  (structure, checkbox toggle/store/sessionStorage, continue bar, card navigation, drawer ESC/overlay, support sheet,
  chat seed/reply/error/retry, empty-input focus, register phone→OTP→success, stub pages, sticky header glass, reduced motion,
  zero console errors).
- scripts/responsive.mjs: 360/390/412/430/480/1440 — zero horizontal overflow, chat bar visible, proportional scaling,
  centered 480px column at 1440 (fixed max-w 30rem→28.125rem).
- bun run lint: clean. dev.log: no errors.

Stage Summary:
- Pixel loop converged; all interactions verified; responsive verified. Artifacts: analysis/final_triptych.png,
  side.png, diff.png, shot.png, responsive/w*.png.

---
Task ID: 9
Agent: main (Z.ai Code)
Task: Push project to GitHub repo (github.com/amirhs838/front-bimeh)

Work Log:
- Cleaned git index: untracked analysis/ (comparison artifacts), upload/ (reference image), db/ (runtime SQLite), .zscripts/, .env, mini-services/ — added to .gitignore.
- Renamed package: "nextjs_tailwind_shadcn_ts" → "front-bimeh" v1.0.0; validated JSON.
- Added README.md (fa/en): features, quick start, scripts table, structure, notes.
- Committed "feat: Bimeh AI Scroll 1 — pixel-perfect RTL build" (150 files at HEAD).
- Added remote origin (token-embedded URL) and pushed main → verified remote HEAD 929dcae matches local.

Stage Summary:
- Repo live at github.com/amirhs838/front-bimeh (main, 150 files, clean deployable tree; internal artifacts kept local only).

---
Task ID: 10
Agent: main (Z.ai Code)
Task: Scroll 2 ("چرا Bimeh AI") pixel-perfect build + verification loop

Work Log:
- Sampled 2.jpg (899x1750 @2x): C1 (#f0f5fa family), C2 #eef2f5, wave fill #e3e6eb, desc ink ≈#969ea8,
  title ink #0c141e, arc/dot/curve paths (dot core at (366,840.7)), wave profile y(x) traced.
- Extracted 4 step illustrations at native 2x with feathered alpha (public/img/s2-step{1..4}.webp, lossless);
  s1 left / s4 right edges hard-cut exactly like the reference frame edges.
- Scroll 2 built data-driven: data/steps.ts (measured geometry, per-step titleSqueeze/descSize),
  copy in data/content.ts (why.* incl. [VERIFY]-corrected strings), tokens --s2-* in globals.css.
- components/sections/Scroll2.tsx: SectionTitle (bidi h2: Vazirmatn Black "چرا" 42.5px + Poppins-800
  "Bimeh AI" 36.5px), Decor (SVG pale circle + red arc with SVG-mask seam fade), StepItem (reveal 0.25
  via IO gated on html.js, idle float 5.6s staggered, hidden chat/support hotspots ≥44px), Wave
  (full-bleed stretched SVG) + RedCurve (dot glow pulse 2.4s).
- Seam: transparent→C2 160u bridge; circle+arc fade via SVG masks (CSS mask-image ignored by headless
  Chromium — replaced with SVG masks). Seam test: bg row delta ≤3/255 (arc AA excluded as ink).
- Allowed Scroll 1 edits: header auto-hide (down=hide/up=glass, scrollY=0 unchanged), drawer link
  "چرا Bimeh AI" → /#scroll-2, scroll-behavior smooth (no-preference), html.js inline script +
  suppressHydrationWarning, #scroll-3 spacer (7rem, bg --s2-bottom-bg).
- Verification: pixelmatch 5.01% (target <2%: residual = font glyph shapes — reference uses an
  unavailable font; all ink bboxes within ±2px, desc line widths matched per-step ±5px, illustrations
  pixel-exact); Scroll 1 regression diff 4.06% (unchanged); e2e-s2 16/16 PASS (reveal, hotspots,
  drawer scroll, header auto-hide, reduced-motion, zero console errors); e2e 44/44 (selector scoping
  fix for duplicate aria-label); responsive 360-1440 OK (0 overflow, centered 480px column at 1440);
  lint clean; hydration fixed (suppressHydrationWarning on <html>).

Stage Summary:
- Scroll 2 live below Scroll 1 as one continuous page; all section-8-permitted edits only.
- Artifacts: analysis/{shot-s2,diff-s2,side-s2,overlay-s2,seam-*,final_triptych_s2}.png,
  responsive-s2/w*.png; scripts/{verify-s2.ts,seam-s2.ts,e2e-s2.mjs,responsive-s2.mjs}.

---
Task ID: 1
Agent: main (Z.ai Code)
Task: Shrink the Scroll 1 → Scroll 2 junction gap (user report: too large on mobile)

Work Log:
- Diagnosed: Scroll1 carried min-h-[100svh]; its content (750 design px) scales with
  viewport WIDTH but 100svh tracks HEIGHT — real phones (aspect ~2.16) stretch the
  section past its content → ~194px dead zone + 62px pb + Scroll2's 41px title offset
  ≈ 230px perceived gap on 390x844 (design frame 450x875 only showed 166px).
- Fix (Scroll1.tsx ONLY): removed min-h-[100svh]; pb 4.5rem → 3.5rem (safe-area kept).
  Junction is now a fixed proportional rhythm on every device.
- scripts/e2e-s2.mjs: (a) below-fold reveal assertion re-targeted from .s2-reveal[0]
  (section title — now legitimately peeks into viewport 1) to [1] (first step illu,
  page-y ≈ 897 > 875); (b) header auto-hide test switched from absolute scrollTo(1000/
  1100) — which clamped to max-scroll after the page shortened, firing no events — to
  relative scrollBy deltas. Header/Scroll2 components untouched.
- Verified: lint clean; e2e-s2 16/16; e2e (Scroll1+subpages) ALL PASS; responsive-s2
  OK (360-1440, 0 overflow); agent-browser measurements 390x844 gap card→S2 = 49px,
  card→title = 84px (was ~194/~230), 1440x900 = 60/103px; screenshots junction-mobile-
  390 / top-mobile-390 / junction-desktop-1440 confirm first screen pixel-identical,
  seam + decor + reveals intact; zero console errors; dev.log clean.
- Git: silenced mode-bit-only churn (git config core.fileMode false — sandbox chmod
  noise, no content change); committed ONLY Scroll1.tsx + e2e-s2.mjs as ce5606a and
  pushed to github.com/amirhs838/front-bimeh main.

Stage Summary:
- Junction gap on mobile reduced ~63% (230→84px to heading); identical first-screen
  content; all suites green; fix live on remote (ce5606a).

---
Task ID: 2
Agent: main (Z.ai Code)
Task: New mascot-face logo in exactly 2 places (header top-left + hero avatar)

Work Log:
- Source of truth: file_00000000340481f4b5b88b2b9af7d716.png uploaded by the owner
  at repo ROOT (commit dc80213) — single 1254px tile, gradient red body, white
  arc-eyes smiley, tile touches canvas edges (corner R ≈ 22%).
  (upload/pasted_image_*.png was a 20-variant sprite sheet — NOT used; repo file
  byte-differs and is authoritative.)
- Generated public/img/logo-face.png (full color, rounded-corner alpha, 512px) and
  public/img/logo-face-soft.png (body recolored #f4959f, white face crisp — same
  faded treatment the hero avatar already had).
- Header.tsx: LogoTile SVG → next/image logo-face.png, fixed 34px box (geometry
  identical to old tile), priority.
- HeroBanner.tsx: inner pink square + Face SVG → next/image logo-face-soft.png at
  px(26) inside the unchanged white tile (39px, radius 10, shadow).
- Untouched on purpose: Drawer, ChatSheet, register page (still old SVG LogoTile),
  mascot image, everything else.
- Verified: agent-browser 390x844 (img complete, 34px + 23px rendered, zoom crops
  clean), drawer visual check (old tile intact), e2e ALL PASS, e2e-s2 16/16,
  lint clean, zero console errors.
- Git: rebased onto owner's dc80213, pushed a6d947b + c70c2d6 to origin/main.

Stage Summary:
- New logo live in exactly the 2 requested spots; soft/faded variant in the hero;
  all other logo instances and page parts untouched; remote in sync.

---
Task ID: 3
Agent: main (Z.ai Code)
Task: Scroll 3 ("معرفی + ویژگی‌ها") pixel-perfect build below Scroll 2 (master prompt, ref 3.jpg)

Work Log:
- Verified 3.jpg = 873x1802, s=1.94, frame 450x929. Edge-detected real geometry:
  hero x18-432 y57-357; card tops 484/567/648.5/730.4/811.3 (h 71.6-73.7);
  tiles 50x45.5 @ right-12; icon tile c3 49x44.8 @ x370.1; heading bands
  L1 403.6-427.3 / word 439.7-462.9 / AI 437.1-458.2 (cap 21.1u, w 29.4).
- Colors sampled (percentile): --s3-bg #f4f8fa (drift #f6f9fb->#f3f7fa),
  card #f8fafc (NOT pure white — image wins), title #1b2340, desc #8797b3,
  tile #faecee, photo-bg #d3d7db.
- MODE B hero: crop x37-836 y112-690 (2px inset), pre-scaled lanczos to exact
  828x600 (2x of 414x300), webp q93 30KB; sr-only banner copy; hotspot
  (rel 87,175.5, 241x69) -> openChat(seed, "bot").
- ChatSheet/ui-store: added chatSeedRole ("user"|"bot") — bot seed inserts the
  assistant message directly, no API call; existing call sites unchanged.
- Calibration loop (verify-s3.ts measure): discovered canvas metrics used a
  fallback font AND an early font-load race — switched to DOM Range probes with
  explicit document.fonts.load; widths respond ~quadratically at DPR2 (device-px
  advance quantization) → fixed-point iteration to per-line sizes. Final: heading
  L1 20.1/word 23.87/AI 31.5+scaleX(.865) origin-left (row laid out to visual
  targets 179.4-208.8 / 219.6-270.1 exactly); eyebrow 11.8 (text 76.8u);
  per-card titles [10.94,10.45,10.45,9.78,9.41], desc L1/L2 per line
  (image replicates per-item size variations: card1 title visibly larger).
- pixelmatch 4.45% (900x1858): region breakdown — hero photo = 79% of residual
  (JPEG/resample noise, irreducible), cards 20%, header 13%, heading 10%.
  Scroll 1 4.03% / Scroll 2 5.00% — no regression.
- Seam s2->s3: junction rows ≤1/255 header hidden+shown; initial 7/255 reading
  was Scroll 2's wave-crest drop-shadow AA crossing a scan row (content, kept).
  Wave/red curve/glowing dot intact (seam3-pair.png).
- e2e-s3 18/18 (semantics, reveal, hotspot 241x69 -> seeded assistant msg,
  drawer "مزایای Bimeh AI" -> /#scroll-3 aligned 0.0, chat bar over s3, zero
  console errors, reduced-motion). responsive-s3 360-1440 OK (no overflow,
  text-tile min gap 24.4px at 360, column centered at 1440).
- Lighthouse mobile: a11y 96, CLS 0; performance 65 vs DEV server (build
  forbidden in sandbox) — LCP 10.9s is dev-server overhead; s3 hero lazy.
- Allowed edits honored: page.tsx slot swap + #footer-slot; drawer link;
  content/data; ui-store/ChatSheet minimal seeding hook (required by §6);
  header glass and Scroll 2 untouched.

Stage Summary:
- Scroll 3 live below Scroll 2 as one continuous page; commit 9317a59 pushed.
- Artifacts: analysis/{shot-s3,diff-s3,side-s3,overlay-s3,seam3-*,responsive-s3/},
  scripts/{verify-s3.ts,seam-s3.ts,e2e-s3.mjs,responsive-s3.mjs}.

---
Task ID: 4
Agent: main (Z.ai Code)
Task: FOOTER (end of Scroll 3) — pixel-perfect build from 4.png (master prompt)

Work Log:
- Sampled 4.png (956x1645, s=2.1244 -> frame 450x774.3u). Edge-detected real
  geometry: card x16.2-437.5 y3.0-763.6 r14 (outer margins NOT equal in the
  file: 16.2/12.5 — replicated as-is); wordmark bbox 290.4-420.8 x 41.4-65.0;
  h2 cy96.3 w192.5; para 5 lines cy 124.5-209.9 pitch ~21.3, right edge 421;
  QA title cy240.5 + underline cy254.9 w24.5; 4 pills x36.2-418.9 h~33.4 pitch
  41.75, icon circle d32 FLUSH with pill right edge (center x402.5), labels
  right edge 374.2; col titles cy458.5/459.6 + underlines cy476.6 (R w25.9,
  L w24.9); rows cy 497.1/523.0/549.8/575.9 (pitch 26.27), chevrons R cx265
  L cx46.85; divider y606.3 x36-420.8; contact rows: icon cx244.3 (pin 8.5x11.3,
  envelope 12.2x9.9, phone 10.8x10.8), text left 268.8, chev cx412.5; waves
  traced (light crest x~43 y687 -> trough x~280 y741 -> right edge y~699;
  strong crest x~105 y707 -> trough x~280 y741 -> flat y~713.1 at right);
  red curve measured through dot (357.5,719.5) exiting right edge y~698;
  dot core #FB254F.
- Colors sampled: --f-card-bg #F5F9FC, --f-outside-bg #F1F6F9, --f-ink #101A34,
  muted text/labels/chevrons ONE core tone #5B6A89 (prompt's split --f-text/
  --f-label #6F7893/#5F6780 not supported by sampling), --f-pill-bg #F3F3F9
  (pale lavender, NOT the prompt's pink-lilac #F5EEF3 — image wins, no
  horizontal gradient), --f-pill-icon-bg #F7E7EE, --f-divider #DFE6EF,
  waves light #F7F1F6 / strong #F8E7EF->#F7EBF1, curve #F83153.
- Data-driven build: src/data/footer.ts (all copy incl. [VERIFY]-corrected
  paragraph, per-item measured geometry + per-item width-calibrated font
  sizes); hrefs/contact in src/data/site.ts (single source; Drawer's site.nav
  hrefs updated: /track /blog /about /contact).
- components/sections/Footer.tsx + f-icons.tsx (shield-check, headset,
  question, filled phone/pin/envelope, left chevron — ink-fitted sizes).
  Paragraph justified via flex space-between at measured widths ("Bimeh AI"
  as one dir=ltr Poppins island); decor SVG (waves + curve w/ SVG-mask fade
  + pulsing dot) clipped by card; reveal groups as absolute inset-0 overlays
  (transformed wrapper = containing block — keeps child coords card-relative).
- CRITICAL RTL find: block child narrower than container with under-constrained
  margins gets the leftover space moved to margin-LEFT in RTL (card sat +12.5px
  off) — fixed by pinning BOTH margins (16.2 + 12.5 = 450).
- Reduced-motion override (transform:none !important) killed inline translateY
  centering on the wordmark -> static top positioning instead.
- Icon ink-vs-box calibration: Material-style paths only fill ~75-83% of their
  viewBox -> sizes fitted so DRAWN INK matches the image (shield 17.1x16.5 etc).
- Inset white top highlight removed (image shows no bright top line; seam test
  caught it: 7.3/255 -> 1.7/255 after removal).
- Card shadow tuned to sampled falloff (below-only, no side darkening).
- 8 stub pages (/faq /contact /track /app /about /blog /careers /terms) via
  shared StubPage + SubPageShell; id="products" already on the product grid;
  optional JSON-LD Organization added in page.tsx (placeholder values flagged).
- Allowed edits honored: page.tsx footer slot swap; Scroll3 pb -> --footer-gap
  (32u); site.ts additions; e2e-s3 footer-slot assertion updated to footer#footer.
- Verification: verify-f.ts measure loop (DOM Range vs targets) — card w/h
  +0.0, all right/left edges +0.0-0.2, per-line widths within quantization;
  pixelmatch vs 4.png resized 900x1550: 4.02% (residual = glyph shapes + AI
  kashida; same accepted class as S2 5.00% / S3 4.45%); regressions S1 4.03 /
  S2 5.00 / S3 4.45 unchanged; seam S3->footer 1.3-1.7/255 (OK, hidden+shown);
  end-of-page gap 10.4u >= 10; e2e-f 39/39 (routes, sheets, mailto/tel/map,
  keyboard order, focus, hover pill+chevron-nudge, reduced motion, smooth
  scroll to products, zero console errors); responsive 360-1440 zero overflow;
  Lighthouse mobile a11y 96 / CLS 0 (perf 59 = dev-server LCP overhead, same
  documented limitation as S3; 2 flagged a11y items are pre-existing Scroll 1
  elements, untouched per §12); agent-browser golden-path pass at 390x844.
- 11px floor NOT applied to calibrated text (smallest 9.4u): it would break
  §10.2's "identical width/position" — same precedent as Scroll 3's 9.41u.
  No horizontal overflow at any width; nowrap lines never rewrap.

Stage Summary:
- Footer live as the end of the page; card matches 4.png (structure <=1u);
  seams/regressions green; commit pushed.
- Artifacts: analysis/{shot-f,diff-f,side-f,overlay-f,seam-f-*,endpage-f,
  responsive-f/}.png, analysis/f4/*, scripts/{verify-f.ts,seam-f.ts,e2e-f.mjs,
  responsive-f.mjs}.

---
Task ID: logo-unify
Agent: Z.ai Code (main)
Task: Replace all remaining old SVG logos with the new header logo (/img/logo-face.png) — chat sheet, hamburger drawer, register page

Work Log:
- Audited every logo reference in src: Header (new PNG already), HeroBanner (soft PNG already), ChatSheet, Drawer, register/page (all used old LogoTile SVG), SupportSheet (unused import)
- Rewrote LogoTile in src/components/icons.tsx to render /img/logo-face.png via next/image (radius prop kept for compat, ignored — PNG has baked corners)
- Removed unused LogoTile import from SupportSheet.tsx
- Added icons.metadata (favicon) pointing to /img/logo-face.png in src/app/layout.tsx
- Deleted orphaned old public/logo.svg (zero references)
- Verified via agent-browser: chat sheet header, drawer header, register page all render the new logo identical to header; lint clean; dev.log 200s only
- Committed 952ae3c and pushed to github.com/amirhs838/front-bimeh main

Stage Summary:
- Single-source fix: LogoTile component now renders the header PNG, so chat/drawer/register/favicon all match the header logo exactly

---
Task ID: desktop-s1
Agent: main (Z.ai Code)
Task: DESKTOP SCROLL 1 — pixel-perfect build from D1 ("Persian Insurance Platform UI with Friendly Mascot.png", 1536x1024) with Mobile Freeze Protocol

Work Log:
- Found the desktop implementation largely present from the compacted session (commit 8702153: desktop CSS block, dk assets, HeroDecorDesktop, dk-illus, tests). This session ran the full verification loop and drove calibration to the D1 frame.
- Rebuilt the mascot as an EXACT D1 crop: the shipped mascot-desktop.png was the mobile render rescaled (aspect 0.825 vs D1's ~0.89 — different pose proportions). u2net/isnet dropped the white gloves; used a custom neutral/red-vs-bluish-bg color key + closing/1px erosion + 0.6px feather + 2x lanczos/sharpen → public/img/mascot-d1.png (267x261d canvas at frame (943,99)). Red-body IoU vs D1: 0.994; earlier "x1206 ink" readings were the skyline building behind the mascot, not the mascot.
- Header: D1 nav label is خریدارها (was درباره ما) — swapped, href /quote (IA flagged); HeadsetDk (big rounded cups + filled mic dot) added for desktop via .m-only/.dk-only swap (mobile glyph untouched); logo group +2.5d, wordmark +1.5d, pill h34d; nav gap 28→24d, margin-right 18→14d → nav ink (1012-1252) vs ref (1011-1252).
- Hero: headline 53→52.2d, right 829→827d, top 89→91.5d; bubble text 20→20.3d, lh 1.45→1.52, padding 9/23→5/27; avatar = full logo-face.png at opacity .69 on desktop (G-channel match 48α+255(1-α)=113), mobile keeps approved soft PNG (picture swap).
- Grid: +3d centering (card field x63-1473 vs ref 63/1472), title calc +2d, strips 159/34d.
- Chat bar: uniform warm surface (253,250,251) — removed the lighter inner input pill; placeholder #a6b4c8, font 16.6d, padding-right 25d (ink 1199-1381 vs ref 1196-1381); sparkle 30d at left 15d; width 1409d; dk-select matched.
- Wide desktop (>1536): .s1-root > div capped at 1536d + centered (hero was stretching to 1800px at 1920 — fixed); header stays full-bleed; verified 1280/1366/1440/1536/1728/1920 → zero overflow, exact expected boxes.
- TOOLCHAIN: freshly-installed Playwright Chromium (headless shell 156, v1248) rasterizes WebP images nondeterministically (bimodal decode/raster cache race, ±0.17% run-to-run on identical code). Fix: tests/median-capture.mjs — per-pixel MEDIAN of 5 runs is deterministic (median(1-3) vs median(3-5) = 0px). Mobile goldens re-baselined as median-of-5 at 360-1279.
- VERIFICATION: D1 pixelmatch 3.814% → 3.019% (accepted residual class: reference font unavailable — glyph shapes, image AA; same class as approved mobile sections at 4-5%); ALL structural ink bboxes within ±3px (mascot IoU 0.994); Mobile Freeze: structural ZERO (residual ≤0.021% confined to webp edges: mascot hero + s2/s3 illustrations; text/box/geometry = 0px); e2e 44 + s2 16 + s3 18 + f 39 = 117/117 PASS (fixed HeadsetDk invalid SVG transform translateY → cy=23.2); seam S1→S2 at 1536 invisible; agent-browser golden path at 1536x1024: checkboxes → CTA bar → sessionStorage persistence across reload (3 checked), drawer 380d, chat + support as CENTERED dialogs, nav خریدارها → /quote, header auto-hide/glass, zero console errors; lint clean; dev.log 200s only.
- Commits: 8702153 (earlier desktop build) + e4dc944 amended → pushed e49f49d to origin/main (with re-baselined median goldens + median-capture tool).
- Reported for IA owner: desktopNav "خریدارها" currently routes to /quote; D1 تکمیلی card shows no installment badge (desktop hides it via CSS, mobile data untouched — D1 wins).

Stage Summary:
- Desktop Scroll 1 pixel-verified against D1 at 1536x1024 (3.019%, structure ±3px, mascot 0.994 IoU); mobile frozen (median golden protocol, structural 0); all suites green; pushed e49f49d.
- Artifacts: analysis/{shot-d1,diff-d1,side-d1}.png, /tmp/resp-*.png, tests/median-capture.mjs, tests/golden/m-*.png (median baselines).
