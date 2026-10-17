#!/usr/bin/env python3
"""D3 vs rendered-shot calibration compare (desktop-s3).
Measures the same ink windows on both images (D3 native p; shot scaled by
f=1536/1507) and prints right-edge/width/cy deltas per text element.
Usage: python3 scripts/d3_compare.py [shot.png]
"""
from PIL import Image
import numpy as np
import sys

F = 1536 / 1507

d3 = np.asarray(Image.open("upload/Bimeh AI Persian Landing Page.png").convert("RGB")).astype(int)
shot_path = sys.argv[1] if len(sys.argv) > 1 else "analysis/shot-s3d.png"
sh = np.asarray(Image.open(shot_path).convert("RGB")).astype(int)
print(f"shot: {shot_path} {sh.shape[1]}x{sh.shape[0]}  f={F:.5f}")

def masks(a):
    lum = a.mean(axis=2)
    return {
        "ink": lum < 150,
        "ink90": lum < 90,
        "gray": (lum >= 110) & (lum < 205),
        "red": (a[..., 0] > 190) & (a[..., 1] < 120) & (a[..., 2] < 120),
        "white": a.min(axis=2) > 200,
        "pinkish": ((a[..., 0] - a[..., 1]) > 8) & (a[..., 0] > 244),
    }

M3, MS = masks(d3), masks(sh)

def bbox(M, a, x0, y0, x1, y1, kind, scale=1.0):
    # window in shot px; result converted back to D3 p units
    wx0, wy0, wx1, wy1 = (int(round(v * scale)) for v in (x0, y0, x1, y1))
    m = M[kind][wy0:wy1, wx0:wx1]
    ys, xs = np.where(m)
    if not len(xs):
        return None
    return ((wx0 + xs.max() + 1) / scale, (xs.max() - xs.min() + 1) / scale,
            (wy0 + (ys.min() + ys.max() + 1) / 2) / scale)

# name, window(x0,y0,x1,y1) in D3 p, mask kind
ELS = [
    ("eyebrow text", (952, 200, 1122, 245), "red"),
    ("dash L", (905, 205, 962, 240), "red"),
    ("dash R", (1110, 205, 1168, 240), "red"),
    ("H L1", (775, 252, 1370, 320), "ink90"),
    ("H L2 دارای", (1045, 330, 1165, 400), "ink90"),
    ("H L2 AI", (940, 328, 1040, 392), "red"),
    ("CTA box", (960, 415, 1140, 490), "red"),
    ("CTA text", (992, 432, 1116, 472), "white"),
    ("F1 title", (262, 668, 462, 702), "ink"),
    ("F1 dL1", (250, 715, 508, 738), "gray"),
    ("F1 dL2", (250, 742, 508, 765), "gray"),
    ("F2 title", (660, 668, 870, 702), "ink"),
    ("F2 dL1", (650, 713, 945, 738), "gray"),
    ("F2 dL2", (650, 740, 945, 764), "gray"),
    ("F3 title", (1115, 668, 1340, 706), "ink"),
    ("F3 dL1", (1140, 714, 1380, 740), "gray"),
    ("F3 dL2", (1140, 740, 1380, 766), "gray"),
    ("F4 title", (410, 893, 672, 926), "ink"),
    ("F4 dL1", (395, 937, 728, 962), "gray"),
    ("F4 dL2", (425, 964, 728, 990), "gray"),
    ("F5 title", (790, 896, 1120, 928), "ink"),
    ("F5 dL1", (800, 939, 1163, 963), "gray"),
    ("F5 dL2", (800, 963, 1163, 990), "gray"),
    ("tile F1", (415, 585, 512, 670), "pinkish"),
    ("tile F2", (852, 585, 950, 670), "pinkish"),
    ("tile F3", (1288, 585, 1386, 670), "pinkish"),
    ("tile F4", (638, 818, 732, 899), "pinkish"),
    ("tile F5", (1073, 818, 1167, 899), "pinkish"),
]

print(f"\n{'element':14s} {'D3: R / w / cy':>26s}   {'SHOT: R / w / cy':>26s}   {'dR':>5s} {'dw':>5s} {'dcy':>5s}")
for name, (x0, y0, x1, y1), kind in ELS:
    b3 = bbox(M3, d3, x0, y0, x1, y1, kind)
    bs = bbox(MS, sh, x0, y0, x1, y1, kind, scale=F)
    if not b3 or not bs:
        print(f"{name:14s}  D3={'-' if not b3 else b3[:3]} SHOT={'-' if not bs else bs[:3]}")
        continue
    dR = bs[0] - b3[0]
    dw = bs[1] - b3[1]
    dcy = bs[2] - b3[2]
    print(f"{name:14s}  {b3[0]:6.0f}/{b3[1]:4.0f}/{b3[2]:7.1f}   {bs[0]:6.0f}/{bs[1]:4.0f}/{bs[2]:7.1f}   {dR:+5.1f} {dw:+5.1f} {dcy:+5.1f}")
