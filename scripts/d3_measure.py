#!/usr/bin/env python3
"""D3 ("Bimeh AI Persian Landing Page.png", 1507x1044) measurements.
Samples colors + measures ink/element bboxes around the master-prompt
estimates (image wins). All coords in D3 image pixels (p)."""
from PIL import Image
import numpy as np

im = Image.open("upload/Bimeh AI Persian Landing Page.png").convert("RGB")
a = np.asarray(im).astype(int)
H, W = a.shape[:2]
print(f"size: {W}x{H}  (frame d = {1536}x{round(H*1536/W)})  f = {1536/W:.5f}")

def avg(x0, y0, x1, y1, mask=None):
    r = a[y0:y1, x0:x1]
    if mask is not None:
        m = mask[y0:y1, x0:x1]
        r = r[m]
    else:
        r = r.reshape(-1, 3)
    return r.mean(axis=0).round(1) if len(r) else None

def hexc(c):
    return "#%02x%02x%02x" % tuple(int(v) for v in c)

# ---------- backgrounds ----------
pts = {
    "corner TL": (8, 8), "corner TR": (W-9, 8), "corner BL": (8, H-9), "corner BR": (W-9, H-9),
    "top mid (safe zone)": (754, 45),
    "gap row1-row2": (754, 797), "left of F1": (60, 680), "right of F3": (1450, 680),
    "below row2": (754, 1030), "gap F2-F3": (972, 650), "above F1 (halo far)": (200, 545),
}
print("\n--- background samples ---")
for k, (x, y) in pts.items():
    print(f"{k:24s} ({x:4d},{y:4d}) {hexc(a[y, x])}")

bg = a[1030:1044, 20:60].reshape(-1, 3).mean(axis=0)  # bottom-left strip
print("bg ref (bottom-left strip):", hexc(bg))

# ---------- non-bg mask ----------
dist = np.abs(a - bg).max(axis=2)
nonbg = dist > 2.0

def edge_scan_row(y, x0, x1, rising=True, th=1.6):
    """first x in [x0,x1) where |c-bg|>th for 4 consecutive px"""
    d = np.abs(a[y, x0:x1] - bg).max(axis=1)
    for i in range(len(d) - 4):
        if (d[i:i+4] > th).all():
            return x0 + i if rising else None
    return None

def card_edges(cx0, cy0, cx1, cy1, name):
    """scan 4 edges around an estimate box"""
    ymid = (cy0 + cy1) // 2
    xmid = (cx0 + cx1) // 2
    L = edge_scan_row(ymid, cx0 - 30, cx0 + 30)
    R = None
    d = np.abs(a[ymid, cx1 - 30:cx1 + 30] - bg).max(axis=1)
    for i in range(len(d) - 1, 3, -1):
        if (d[i-4:i] > 1.6).all():
            R = cx1 - 30 + i
            break
    col = np.abs(a[cy0 - 30:cy0 + 30, xmid] - bg).max(axis=1)
    T = None
    for i in range(len(col) - 4):
        if (col[i:i+4] > 1.6).all():
            T = cy0 - 30 + i
            break
    col2 = np.abs(a[cy1 - 30:cy1 + 30, xmid] - bg).max(axis=1)
    B = None
    for i in range(len(col2) - 1, 3, -1):
        if (col2[i-4:i] > 1.6).all():
            B = cy1 - 30 + i
            break
    print(f"{name}: L={L} R={R} T={T} B={B}  ({(R-L) if L and R else '?'} x {(B-T) if T and B else '?'})")
    return L, R, T, B

print("\n--- card boxes (scan around estimates) ---")
cards = {
    "F1": (110, 569, 526, 787), "F2": (545, 569, 962, 787), "F3": (983, 569, 1398, 787),
    "F4": (330, 807, 745, 1003), "F5": (765, 807, 1180, 1003),
}
edges = {}
for k, v in cards.items():
    edges[k] = card_edges(*v, k)

# ---------- icon tiles (pale pink) ----------
print("\n--- icon tiles (pink mask) ---")
r, g, b = a[..., 0], a[..., 1], a[..., 2]
pink = (r > 240) & (g > 200) & (g < 235) & (b > 200) & (b < 240) & ((r - b) > 8)
tiles = {"F1": (425, 593, 503, 661), "F2": (862, 593, 940, 661), "F3": (1298, 593, 1376, 661),
         "F4": (648, 827, 723, 891), "F5": (1083, 827, 1158, 891)}
for k, (x0, y0, x1, y1) in tiles.items():
    m = pink[y0-14:y1+14, x0-14:x1+14]
    ys, xs = np.where(m)
    if len(xs):
        print(f"{k}: x{x0-14+xs.min()}-{x0-14+xs.max()+1} y{y0-14+ys.min()}-{y0-14+ys.max()+1}  ({xs.max()-xs.min()+1} x {ys.max()-ys.min()+1})")
print("tile fill:", hexc(avg(440, 600, 470, 615)))
print("tile fill F4:", hexc(avg(660, 832, 690, 845)))

# ---------- red elements ----------
red = (r > 190) & (g < 110) & (b < 110)
def redbox(x0, y0, x1, y1, name):
    m = red[y0:y1, x0:x1]
    ys, xs = np.where(m)
    if len(xs) == 0:
        print(f"{name}: NONE in region"); return
    print(f"{name}: x{x0+xs.min()}-{x0+xs.max()+1} y{y0+ys.min()}-{y0+ys.max()+1} ({xs.max()-xs.min()+1} x {ys.max()-ys.min()+1})")

print("\n--- red elements ---")
redbox(900, 190, 1180, 245, "eyebrow text+dashes")
redbox(900, 190, 960, 245, "  left dash")
redbox(1110, 190, 1180, 245, "  right dash")
redbox(940, 320, 1045, 400, "AI (L2)")
redbox(980, 415, 1135, 485, "CTA box")
print("CTA fill:", hexc(avg(1020, 440, 1080, 460, mask=~red)))
redbox(300, 336, 350, 384, "mail tile")
redbox(330, 590, 500, 665, "F1 brain icon ink")
redbox(865, 590, 940, 665, "F2 shield icon ink")
redbox(1300, 590, 1378, 665, "F3 bolt icon ink")
redbox(650, 825, 725, 895, "F4 calendar icon ink")
redbox(1085, 825, 1160, 895, "F5 network icon ink")

# ---------- banner (dark glass) ----------
dark = (a.max(axis=2) < 120)
print("\n--- banner ---")
m = dark[300:460, 260:640]
ys, xs = np.where(m)
print(f"banner dark bbox: x{260+xs.min()}-{260+xs.max()+1} y{300+ys.min()}-{300+ys.max()+1} ({xs.max()-xs.min()+1} x {ys.max()-ys.min()+1})")
# white text inside banner
wm = (a.min(axis=2) > 200)
m2 = wm[330:430, 300:620]
ys2, xs2 = np.where(m2)
print(f"banner white-text bbox: x{300+xs2.min()}-{300+xs2.max()+1} y{330+ys2.min()}-{330+ys2.max()+1}")
print("banner glass (no text):", hexc(avg(560, 355, 590, 368)))

# ---------- phone ----------
print("\n--- phone bezel (very dark) ---")
vd = (a.max(axis=2) < 60)
m = vd[80:560, 280:600]
ys, xs = np.where(m)
print(f"phone dark bbox: x{280+xs.min()}-{280+xs.max()+1} y{80+ys.min()}-{80+ys.max()+1}")
# notch: dark row near top inside screen
m2 = vd[100:135, 360:520]
ys2, xs2 = np.where(m2)
if len(xs2): print(f"notch: x{360+xs2.min()}-{360+xs2.max()+1} y{100+ys2.min()}-{100+ys2.max()+1}")

# ---------- halo extent ----------
print("\n--- halo falloff (row y=320, dist from bg) ---")
for x in [110, 130, 150, 200, 280, 340, 437, 540, 620, 680, 700, 720, 740, 760]:
    print(f"  x={x:3d} d={np.abs(a[320, x]-bg).max():.0f} {hexc(a[320, x])}")
print("--- halo falloff (col x=437) ---")
for y in [80, 88, 95, 110, 540, 548, 560, 580, 600]:
    print(f"  y={y:3d} d={np.abs(a[y, 437]-bg).max():.0f} {hexc(a[y, 437])}")

# ---------- text inks ----------
lum = a.mean(axis=2)
ink = lum < 110
def inkbox(x0, y0, x1, y1, name, mask=None):
    m = (mask if mask is not None else ink)[y0:y1, x0:x1]
    ys, xs = np.where(m)
    if len(xs) == 0:
        print(f"{name}: NONE"); return None
    bb = (x0+xs.min(), y0+ys.min(), x0+xs.max()+1, y0+ys.max()+1)
    print(f"{name}: x{bb[0]}-{bb[2]} y{bb[1]}-{bb[3]} ({bb[2]-bb[0]} x {bb[3]-bb[1]}) cy={(bb[1]+bb[3])/2:.1f}")
    return bb

print("\n--- heading / eyebrow / CTA text inks ---")
inkbox(770, 250, 1380, 320, "H L1 (dark ink)")
# L2: dark word on the right (دارای), red AI on the left
inkbox(1040, 320, 1200, 405, "H L2 دارای")
e = ink[190:245, 900:1180] & ~red[190:245, 900:1180]
ys, xs = np.where(e)
print(f"eyebrow dark part: x{900+xs.min()}-{900+xs.max()+1} y{190+ys.min()}-{190+ys.max()+1}")
# red eyebrow text only (between dashes)
redbox(955, 190, 1120, 245, "eyebrow red text")

print("\n--- card text inks (per card: title dark / desc gray) ---")
gray = (lum >= 110) & (lum < 205) & (np.abs(a[..., 2] - a[..., 0]) < 60)
def cardtext(k):
    L, R, T, B = edges[k]
    # title: dark ink in upper 2/3
    inkbox(L, T, R, T + 120, f"{k} title")
    # desc lines: gray ink rows — split by y
    m = gray[T:T + (B-T), L:R]
    ys, xs = np.where(m)
    if not len(ys): print(f"{k} desc: NONE"); return
    yv = ys + T
    # cluster rows into lines (gap > 4)
    rows = np.zeros(B - T, bool); rows[yv - T] = True
    lines = []
    s = None
    for i in range(len(rows)):
        if rows[i] and s is None: s = i
        if not rows[i] and s is not None:
            if i - s > 5: lines.append((s, i))
            s = None
    if s is not None: lines.append((s, len(rows)))
    for j, (s, e) in enumerate(lines):
        mm = m[s:e]
        ys2, xs2 = np.where(mm)
        print(f"  {k} L{j+1}: x{L+xs2.min()}-{L+xs2.max()+1} y{T+s}-{T+e} w={xs2.max()-xs2.min()+1} cy={T+(s+e)/2:.1f}")
for k in cards:
    cardtext(k)

print("\n--- ink colors ---")
tt = ink[660:700, 250:460]
print("card title ink:", hexc(avg(250, 660, 460, 700, mask=ink)))
print("card desc ink:", hexc(avg(250, 715, 460, 765, mask=gray)))
h1 = ink[250:320, 770:1380]
print("heading ink:", hexc(avg(770, 250, 1380, 320, mask=ink)))
rr = red[420:485, 985:1130]
print("CTA red:", hexc(avg(985, 420, 1130, 485, mask=red)))
core = red[420:485, 985:1130]
sub = a[420:485, 985:1130][core]
print("CTA red core median:", hexc(np.median(sub, axis=0)))
sub2 = a[190:245, 924:1152][red[190:245, 924:1152]]
print("eyebrow red median:", hexc(np.median(sub2, axis=0)))
