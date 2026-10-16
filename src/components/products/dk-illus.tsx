/**
 * DESKTOP (>=1280) product-card illustrations — EXACT crops from D1
 * ("Persian Insurance Platform UI with Friendly Mascot.png"), background
 * keyed out to transparency, 2x lanczos upscale + light sharpening.
 * Served only at >=1280px (the mobile raster bands are untouched).
 *
 * LIMITATION (reported in the deliverable): these are raster pixels taken
 * from the 1x D1 render and upscaled 2x — slightly soft on retina at close
 * inspection. Hand-drawn SVG replacements did not reach D1's silhouettes
 * within the master's 1–2d tolerance, so the image itself wins (master §0).
 */
export const dkIllus: Record<string, { src: string; w: number; h: number }> = {
  "third-party": { src: "/img/dk/third-party.png", w: 126, h: 71 },
  body: { src: "/img/dk/body.png", w: 127, h: 70 },
  motorcycle: { src: "/img/dk/motorcycle.png", w: 93, h: 57 },
  home: { src: "/img/dk/home.png", w: 70, h: 61 },
  supplementary: { src: "/img/dk/supplementary.png", w: 61, h: 58 },
  life: { src: "/img/dk/life.png", w: 50, h: 60 },
  mobile: { src: "/img/dk/mobile.png", w: 36, h: 61 },
  implant: { src: "/img/dk/implant.png", w: 48, h: 61 },
};
