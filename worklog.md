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
