#!/usr/bin/env python3
"""D3 probe #2: card edges via shadow profile, tile crops, phone edges,
banner exact box, desc/title ink boxes (fixed)."""
from PIL import Image
import numpy as np

im = Image.open("upload/Bimeh AI Persian Landing Page.png").convert("RGB")
a = np.asarray(im).astype(int)
H, W = a.shape[:2]
bg = a[1030:1044, 20:60].reshape(-1, 3).mean(axis=0)

# --- raw profile across F1 left edge at y=680 ---
print("row y=680, x=95..135:")
for x in range(95, 136, 2):
    print(f"  x={x}: {tuple(a[680, x])} d={np.abs(a[680, x]-bg).max():.0f}")
print("row y=680, x=515..545:")
for x in range(515, 546, 2):
    print(f"  x={x}: {tuple(a[680, x])} d={np.abs(a[680, x]-bg).max():.0f}")
print("col x=300, y=555..585 (F1 top edge):")
for y in range(555, 586, 2):
    print(f"  y={y}: {tuple(a[y, 300])} d={np.abs(a[y, 300]-bg).max():.0f}")
print("col x=300, y=775..800 (F1 bottom edge):")
for y in range(775, 801, 2):
    print(f"  y={y}: {tuple(a[y, 300])} d={np.abs(a[y, 300]-bg).max():.0f}")

# --- darker-than-bg mask (shadow + ink) ---
lum = a.mean(axis=2)
darker = (bg - a).max(axis=2) > 3.0

def shadow_edge_row(y, x0, x1, from_left=True):
    """first sustained (>=6px) darker run"""
    d = darker[y, x0:x1]
    rng = range(len(d) - 6) if from_left else range(len(d) - 7, 5, -1)
    for i in rng:
        if d[i:i+6].all():
            return x0 + i
    return None

def shadow_edge_col(x, y0, y1, from_top=True):
    d = darker[y0:y1, x]
    rng = range(len(d) - 6) if from_top else range(len(d) - 7, 5, -1)
    for i in rng:
        if d[i:i+6].all():
            return y0 + i
    return None

print("\n--- card boxes via shadow (scan around estimates) ---")
cards = {"F1": (110, 569, 526, 787), "F2": (545, 569, 962, 787), "F3": (983, 569, 1398, 787),
         "F4": (330, 807, 745, 1003), "F5": (765, 807, 1180, 1003)}
edges = {}
for k, (x0, y0, x1, y1) in cards.items():
    ym, xm = (y0 + y1) // 2, (x0 + x1) // 2
    L = shadow_edge_row(ym, x0 - 25, x0 + 25, True)
    R = shadow_edge_row(ym, x1 - 25, x1 + 25, False)
    T = shadow_edge_col(xm, y0 - 25, y0 + 25, True)
    B = shadow_edge_col(xm, y1 - 25, y1 + 25, False)
    edges[k] = (L, R, T, B)
    print(f"{k}: x{L}-{R} y{T}-{B} ({R-L} x {B-T})")

# --- tile crops (dump for visual check) ---
for k, (x0, y0, x1, y1) in {"F1": (425, 593, 503, 661), "F4": (648, 827, 723, 891)}.items():
    crop = im.crop((x0 - 12, y0 - 12, x1 + 12, y1 + 12)).resize(((x1 - x0 + 24) * 4, (y1 - y0 + 24) * 4), Image.NEAREST)
    crop.save(f"analysis/d3-tile-{k}.png")
print("\ntile crops saved: analysis/d3-tile-F1.png, d3-tile-F4.png")

# tile edge probe: row across tile F1 at y=627
print("row y=627 x=415..515 every 4px (tile F1):")
for x in range(415, 516, 4):
    print(f"  x={x}: {tuple(a[627, x])}")

# --- phone edges at clean rows ---
vd = (a.max(axis=2) < 70)
for y in [160, 200, 480, 500]:
    xs = np.where(vd[y, 280:600])[0]
    if len(xs): print(f"phone dark @y={y}: x{280+xs.min()}-{280+xs.max()+1}")

# --- banner exact rows (x300-318 = left of phone bezel) ---
d2 = (bg - a).max(axis=2)
rows = [(y, d2[y, 300:318].mean()) for y in range(320, 440)]
dark_rows = [y for y, v in rows if v > 30]
print(f"\nbanner rows (x300-318 dark): y{min(dark_rows)}-{max(dark_rows)+1}")
cols = [(x, d2[340:420, x].mean()) for x in range(280, 620)]
dark_cols = [x for x, v in cols if v > 30]
print(f"banner cols (y340-420 dark): x{min(dark_cols)}-{max(dark_cols)+1}")

# --- text inks per card (title=dark ink, desc=gray) ---
ink = lum < 110
gray = (lum >= 110) & (lum < 205) & (np.abs(a[..., 2] - a[..., 0]) < 60)
print("\n--- card text (title ink / desc gray lines) ---")
for k, (x0, y0, x1, y1) in cards.items():
    L, R, T, B = edges[k]
    bb = np.where(ink[T:T + 130, L:R])
    if len(bb[0]):
        print(f"{k} title: x{L+bb[1].min()}-{L+bb[1].max()+1} y{T+bb[0].min()}-{T+bb[0].max()+1} w={bb[1].max()-bb[1].min()+1} cy={T+(bb[0].min()+bb[0].max()+1)/2:.1f}")
    m = gray[T:B, L:R]
    ys, xs = np.where(m)
    if len(ys):
        rows_ = np.zeros(B - T, bool); rows_[ys] = True
        lines, s = [], None
        for i in range(len(rows_)):
            if rows_[i] and s is None: s = i
            if (not rows_[i] or i == len(rows_) - 1) and s is not None:
                if i - s > 5: lines.append((s, i))
                s = None
        for j, (s, e) in enumerate(lines):
            mm = m[s:e]
            ys2, xs2 = np.where(mm)
            print(f"  {k} desc L{j+1}: x{L+xs2.min()}-{L+xs2.max()+1} y{T+s}-{T+e} w={xs2.max()-xs2.min()+1} cy={T+(s+e)/2:.1f}")

# --- ink colors ---
sub = a[560:1010, 100:1400][ink[560:1010, 100:1400]]
print("\ncard title ink median:", "#%02x%02x%02x" % tuple(int(v) for v in np.median(sub, axis=0)))
g2 = a[560:1010, 100:1400][gray[560:1010, 100:1400]]
print("card desc gray median:", "#%02x%02x%02x" % tuple(int(v) for v in np.median(g2, axis=0)))
h1 = a[258:314, 779:1360][ink[258:314, 779:1360]]
print("heading ink median:", "#%02x%02x%02x" % tuple(int(v) for v in np.median(h1, axis=0)))
rr = a[429:475, 986:1121]
rm = (rr[..., 0] > 200) & (rr[..., 1] < 90)
print("CTA red median:", "#%02x%02x%02x" % tuple(int(v) for v in np.median(rr[rm], axis=0)))
# card fill
print("card fill F1:", "#%02x%02x%02x" % tuple(int(v) for v in a[600:615, 150:220].reshape(-1, 3).mean(axis=0)))
print("card fill F3:", "#%02x%02x%02x" % tuple(int(v) for v in a[700:715, 1000:1100].reshape(-1, 3).mean(axis=0)))
# eyebrow red text bbox (between dashes)
red = (a[..., 0] > 190) & (a[..., 1] < 110) & (a[..., 2] < 110)
m = red[205:240, 950:1125]
ys, xs = np.where(m)
print(f"eyebrow red text: x{950+xs.min()}-{950+xs.max()+1} y{205+ys.min()}-{205+ys.max()+1} cy={205+(ys.min()+ys.max()+1)/2:.1f}")
# halo avg color (placeholder) - ring around phone
ring = []
for x in range(160, 720, 10):
    for y in range(100, 540, 10):
        d = np.abs(a[y, x] - bg).max()
        if 8 < d < 60: ring.append(a[y, x])
print("halo mid-tone avg:", "#%02x%02x%02x" % tuple(int(v) for v in np.mean(ring, axis=0)))
