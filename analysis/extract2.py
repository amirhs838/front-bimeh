#!/usr/bin/env python3
"""Re-extract illustrations with tab/badge exclusion + hero grid sample + headline mode color."""
from PIL import Image
import numpy as np, os

SRC = "/home/z/my-project/upload/1.jpg"
OUT = "/home/z/my-project/public"
im = Image.open(SRC).convert("RGB")
A = np.asarray(im).astype(float)

BANDS = {  # name: (x0, y0, x1, y1, has_badge)
    "thirdparty":    (58, 528, 842, 621, True),
    "body":          (58, 777, 842, 877, True),
    "motorcycle":    (58, 1032, 427, 1124, True),
    "home":          (480, 1032, 841, 1124, False),
    "supplementary": (58, 1248, 427, 1340, True),
    "life":          (480, 1248, 841, 1340, False),
    "mobile":        (58, 1452, 427, 1544, True),
    "implant":       (480, 1452, 841, 1544, False),
}
def extract_illu(name, bx0, by0, bx1, by1, has_badge):
    crop = A[by0:by1, bx0:bx1].copy()
    h, w = crop.shape[:2]
    r, g, b = crop[:, :, 0], crop[:, :, 1], crop[:, :, 2]
    lum = crop @ [0.299, 0.587, 0.114]
    a_dark = np.clip((222 - lum) / (222 - 100), 0, 1)
    a_red = np.clip((r - np.maximum(g, b)) / 90.0, 0, 1)
    alpha = np.maximum(a_dark, a_red)
    alpha[alpha < 0.14] = 0
    alpha = np.clip(alpha * 1.06, 0, 1)
    # exclusion: checkbox tab zone (top-left of every card)
    alpha[0:48, 0:52] = 0
    # exclusion: badge zone (top-right of badged cards)
    if has_badge:
        alpha[0:40, w - 120:] = 0
    bg = np.array([0xEE, 0xF2, 0xF7], dtype=float)
    a3 = alpha[:, :, None]
    rgb = np.clip((crop - (1 - a3) * bg) / np.maximum(a3, 1e-3), 0, 255)
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    ys, xs = np.where(out[:, :, 3] > 8)
    pad = 2
    x0, y0 = max(xs.min() - pad, 0), max(ys.min() - pad, 0)
    x1, y1 = min(xs.max() + 1 + pad, img.width), min(ys.max() + 1 + pad, img.height)
    img = img.crop((x0, y0, x1, y1))
    img.save(f"{OUT}/img/{name}.png")
    img.save(f"{OUT}/img/{name}.webp", quality=90, method=6)
    print(f"{name}: {img.size} css {img.size[0]/2:.1f}x{img.size[1]/2:.1f} origin-in-band css {(x0)/2:.1f},{(y0)/2:.1f}")

for k, v in BANDS.items():
    extract_illu(k, *v)

# hero bg grid sample (10 cols x 8 rows)
print("HERO GRID (image px x88-858, y116-500):")
for gy in range(8):
    row = []
    for gx in range(10):
        x0 = 88 + int(gx * (770 / 10)); y0 = 120 + int(gy * (380 / 8))
        box = A[y0:y0 + 30, x0:x0 + 40].reshape(-1, 3)
        med = np.median(box, axis=0).astype(int)
        row.append(f"#{med[0]:02X}{med[1]:02X}{med[2]:02X}")
    print(" ".join(row))

# headline / title ink mode (quantize 4)
def mode_dark(x0, y0, x1, y1, lum_max=100, q=6):
    box = A[y0:y1, x0:x1].reshape(-1, 3)
    l = box @ [0.299, 0.587, 0.114]
    dk = box[l < lum_max]
    qnt = dk // q * q
    vals, counts = np.unique(qnt, axis=0, return_counts=True)
    top = np.argsort(counts)[-3:][::-1]
    return [(f"#{vals[i][0]:.0f}", counts[i]) for i in top]

print("headline ink modes:", mode_dark(200, 255, 470, 320, 90))
print("title ink modes:", mode_dark(280, 632, 620, 666, 90))
print("bubble text modes:", mode_dark(260, 340, 480, 430, 90))
