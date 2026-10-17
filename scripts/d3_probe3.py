#!/usr/bin/env python3
"""D3 probe #3: precise card/tile boxes, red mode colors, CTA shadow,
banner edges, ink core colors."""
from PIL import Image
import numpy as np
from collections import Counter

im = Image.open("upload/Bimeh AI Persian Landing Page.png").convert("RGB")
a = np.asarray(im).astype(int)
H, W = a.shape[:2]

def mode_color(region, mask=None, q=8):
    r = region.reshape(-1, 3)
    if mask is not None:
        r = r[mask.reshape(-1)]
    if not len(r): return None
    qq = (r // q) * q
    c = Counter(map(tuple, qq))
    (col, n), = c.most_common(1)
    # refine: mean of pixels within q of the mode
    sel = r[(np.abs(r - col) <= q).all(axis=1)]
    return tuple(int(v) for v in sel.mean(axis=0)), len(sel)

# 1) reds (mode of saturated red pixels)
red = (a[..., 0] > 200) & (a[..., 1] < 120) & (a[..., 2] < 120)
print("--- red mode colors ---")
for name, (x0, y0, x1, y1) in {
    "CTA": (990, 432, 1118, 472),
    "eyebrow text": (960, 205, 1112, 238),
    "AI": (960, 330, 1030, 384),
    "brain icon": (440, 605, 490, 650),
    "shield icon": (880, 603, 922, 651),
    "bolt icon": (1320, 602, 1356, 652),
    "mail tile": (305, 341, 345, 380),
}.items():
    mc = mode_color(a[y0:y1, x0:x1], red[y0:y1, x0:x1])
    if mc: print(f"{name}: #%02x%02x%02x  (n={mc[1]})" % mc[0])

# 2) card fill boxes: min(rgb) > 250 sustained
fill = (a.min(axis=2) >= 250)
print("\n--- card fill boxes ---")
est = {"F1": (110, 569, 526, 787), "F2": (545, 569, 962, 787), "F3": (983, 569, 1398, 787),
       "F4": (330, 807, 745, 1003), "F5": (765, 807, 1180, 1003)}
for k, (x0, y0, x1, y1) in est.items():
    ym, xm = (y0 + y1) // 2, (x0 + x1) // 2
    row = fill[ym, x0-20:x1+20]
    xs = np.where(row)[0]
    col = fill[y0-20:y1+20, xm]
    ys = np.where(col)[0]
    # fill run: largest contiguous
    def runs(m):
        out, s = [], None
        for i, v in enumerate(m):
            if v and s is None: s = i
            if not v and s is not None:
                out.append((s, i)); s = None
        if s is not None: out.append((s, len(m)))
        return max(out, key=lambda t: t[1]-t[0])
    rx = runs(row); ry = runs(col)
    L, R = x0-20+rx[0], x0-20+rx[1]
    T, B = y0-20+ry[0], y0-20+ry[1]
    print(f"{k}: x{L}-{R} y{T}-{B} ({R-L} x {B-T})")

# 3) tile boxes: relaxed pink (r-g > 8, r>244)
pinkish = ((a[..., 0] - a[..., 1]) > 8) & (a[..., 0] > 244) & (a[..., 1] < 250)
print("\n--- tile boxes (relaxed pink) ---")
test = {"F1": (425, 593, 503, 661), "F2": (862, 593, 940, 661), "F3": (1298, 593, 1376, 661),
        "F4": (648, 827, 723, 891), "F5": (1083, 827, 1158, 891)}
for k, (x0, y0, x1, y1) in test.items():
    ym = (y0 + y1) // 2
    row = pinkish[ym, x0-25:x1+25]
    xs = np.where(row)[0]
    col = pinkish[(y0+y1)//2, x0-25:x1+25]
    colv = pinkish[y0-25:y1+25, (x0+x1)//2]
    ys = np.where(colv)[0]
    print(f"{k}: x{x0-25+xs.min()}-{x0-25+xs.max()+1} y{y0-25+ys.min()}-{y0-25+ys.max()+1} ({xs.max()-xs.min()+1} x {ys.max()-ys.min()+1})")
mc = mode_color(a[600:615, 430:445], pinkish[600:615, 430:445])
print("tile fill mode:", "#%02x%02x%02x" % mc[0] if mc else "n/a")

# 4) CTA shadow: rows below CTA
bg = a[1030:1044, 20:60].reshape(-1, 3).mean(axis=0)
print("\n--- under CTA (x=1053) ---")
for y in range(470, 496, 2):
    print(f"  y={y}: {tuple(a[y, 1053])} d={np.abs(a[y, 1053]-bg).max():.0f}")
print("--- right of CTA (y=452) ---")
for x in range(1115, 1141, 2):
    print(f"  x={x}: {tuple(a[452, x])} d={np.abs(a[452, x]-bg).max():.0f}")

# 5) banner edges
dark = (a.max(axis=2) < 130)
row = dark[380, 270:640]
xs = np.where(row)[0]
print(f"\nbanner @y380 dark run: x{270+xs.min()}-{270+xs.max()+1}")
col = dark[300:460, 300]
ys = np.where(col)[0]
print(f"banner @x300 dark run: y{300+ys.min()}-{300+ys.max()+1}")
col2 = dark[300:460, 590]
ys2 = np.where(col2)[0]
print(f"banner @x590 dark run: y{300+ys2.min()}-{300+ys2.max()+1}")

# 6) ink cores
def core(x0, y0, x1, y1, lmax):
    r = a[y0:y1, x0:x1].reshape(-1, 3)
    l = r.mean(axis=1)
    sel = r[l < lmax]
    return tuple(int(v) for v in np.median(sel, axis=0)) if len(sel) else None
print("\n--- ink cores ---")
t = core(678, 674, 869, 697, 120); print("F2 title core:", "#%02x%02x%02x" % t)
d = core(658, 717, 941, 735, 185); print("F2 desc core:", "#%02x%02x%02x" % d)
h = core(779, 258, 1361, 315, 90); print("heading core:", "#%02x%02x%02x" % h)
e = core(965, 209, 1109, 234, 200); print("eyebrow core:", "#%02x%02x%02x" % e)

# 7) card corner radius estimate: F1 top-left corner profile
print("\n--- F1 top-left corner (fill mask) ---")
for y in range(568, 584, 2):
    row = fill[y, 100:135]
    xs = np.where(row)[0]
    print(f"  y={y}: fill starts x={100+xs.min() if len(xs) else '-'}")
