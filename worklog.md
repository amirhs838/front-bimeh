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
