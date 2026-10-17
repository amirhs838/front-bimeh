#!/usr/bin/env python3
"""Extract the D3 hero art (Mode B): halo + phone + mascot + baked banner.
Region x110-760, y84-560 (650x476) — edges in low-delta zones, feathered
alpha >=24p on all outer edges, 2x lanczos upscale, webp."""
from PIL import Image, ImageFilter
import numpy as np

im = Image.open("upload/Bimeh AI Persian Landing Page.png").convert("RGB")
X0, Y0, X1, Y1 = 110, 84, 760, 560
W, H = X1 - X0, Y1 - Y0
crop = im.crop((X0, Y0, X1, Y1))
print(f"crop: {W}x{H} at ({X0},{Y0})")

# --- average edge colors (for the feather sanity check) ---
a = np.asarray(crop).astype(int)
print("edge avg TL/TR/BL/BR rows:")
print("  top   :", a[:3].reshape(-1, 3).mean(axis=0).round(1))
print("  bottom:", a[-3:].reshape(-1, 3).mean(axis=0).round(1))
print("  left  :", a[:, :3].reshape(-1, 3).mean(axis=0).round(1))
print("  right :", a[:, -3:].reshape(-1, 3).mean(axis=0).round(1))

# --- feathered alpha mask (linear ramp F px on every edge) ---
F = 26
mask = np.ones((H, W), dtype=float)
ramp = np.linspace(0, 1, F)
mask[:F, :] *= ramp[:, None]
mask[-F:, :] *= ramp[::-1][:, None]
mask[:, :F] *= ramp[None, :]
mask[:, -F:] *= ramp[::-1][None, :]
# ease the ramp (smoothstep) to avoid a visible gradient knee
mask = mask * mask * (3 - 2 * mask)

alpha = (mask * 255).astype(np.uint8)
rgba = crop.convert("RGBA")
rgba.putalpha(Image.fromarray(alpha))
big = rgba.resize((W * 2, H * 2), Image.LANCZOS)
# slight sharpen after upscale
big = big.filter(ImageFilter.UnsharpMask(radius=1.2, percent=42, threshold=2))
big.save("public/img/s3d-hero.webp", "WEBP", quality=92, method=6)
import os
print("saved public/img/s3d-hero.webp", big.size, os.path.getsize("public/img/s3d-hero.webp"), "bytes")

# --- preview on the real page background (flat --s3-bg #f4f8fa) ---
bgim = Image.new("RGBA", big.size, (244, 248, 250, 255))
comp = Image.alpha_composite(bgim, big).convert("RGB")
comp.save("analysis/s3d-hero-preview.png")
# edge-band deltas after composite (should be ~0 vs bg)
c = np.asarray(comp).astype(int)
print("composite edge max|d-bg|: top", np.abs(c[:2].reshape(-1, 3) - [244, 248, 250]).max(),
      "bottom", np.abs(c[-2:].reshape(-1, 3) - [244, 248, 250]).max(),
      "left", np.abs(c[:, :2].reshape(-1, 3) - [244, 248, 250]).max(),
      "right", np.abs(c[:, -2:].reshape(-1, 3) - [244, 248, 250]).max())
