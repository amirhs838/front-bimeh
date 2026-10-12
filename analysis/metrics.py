#!/usr/bin/env python3
"""Extract precise vertical/horizontal metrics for cards, bands, strips."""
from PIL import Image
import numpy as np, json

SRC = "/home/z/my-project/upload/1.jpg"
im = Image.open(SRC).convert("RGB")
A = np.asarray(im).astype(float)

PAGE = np.array([0xEF, 0xF4, 0xF9])  # approx page bg

def col_segments(x, y0, y1, tol=5.0):
    """classify rows as page-bg or not along column x (median filtered)"""
    col = A[y0:y1, x - 3:x + 4].mean(axis=1)  # (rows, 3)
    d = np.abs(col - PAGE).sum(axis=1)
    is_page = d < tol
    segs = []
    start = None
    for i, p in enumerate(is_page):
        if not p and start is None:
            start = i
        elif p and start is not None:
            if i - start > 8:
                segs.append((y0 + start, y0 + i))
            start = None
    if start is not None:
        segs.append((y0 + start, y1))
    return segs

print("card segments @x=100:", col_segments(100, 100, 1749))
print("card segments @x=450:", col_segments(450, 100, 1749))
print("card segments @x=700:", col_segments(700, 100, 1749))

def sub_edges(x, y0, y1, label):
    """within a card segment at column x, find band edges (darker than card bg)"""
    col = A[y0:y1, x - 2:x + 3].mean(axis=1)
    lum = col @ [0.299, 0.587, 0.114]
    base = np.median(lum)
    darker = lum < base - 2.5
    pinkish = (col[:, 0] - col[:, 2]) > 3.5
    segs = []
    for mask, name in ((darker, "dark"), (pinkish, "pink")):
        s = None
        for i, m in enumerate(mask):
            if m and s is None: s = i
            elif not m and s is not None:
                if i - s > 3: segs.append((name, y0 + s, y0 + i))
                s = None
        if s is not None: segs.append((name, y0 + s, y1))
    print(f"{label} (x={x}, base_lum={base:.0f}):", segs)

# band/strip edges for each card (clean columns)
sub_edges(110, 505, 755, "card1 col110")
sub_edges(110, 755, 1005, "card2 col110")
sub_edges(520, 1010, 1225, "row3-right col520")
sub_edges(110, 1010, 1225, "row3-left col110")
sub_edges(520, 1225, 1430, "row4-right col520")
sub_edges(110, 1225, 1430, "row4-left col110")
sub_edges(520, 1430, 1630, "row5-right col520")
sub_edges(110, 1430, 1630, "row5-left col110")

def row_edges(y, x0, x1, label, tol=5.0):
    row = A[y - 2:y + 3, x0:x1].mean(axis=0)
    d = np.abs(row - PAGE).sum(axis=1)
    non = d >= tol
    segs = []
    s = None
    for i, m in enumerate(non):
        if m and s is None: s = i
        elif not m and s is not None:
            if i - s > 4: segs.append((x0 + s, x0 + i))
            s = None
    if s is not None: segs.append((x0 + s, x1))
    print(f"{label} (y={y}):", segs)

# band left/right edges at band mid-height (clean y w/o illustration: use band top + 6)
row_edges(545, 30, 880, "card1 band row")
row_edges(795, 30, 880, "card2 band row")
row_edges(1046, 30, 880, "row3 band row")
row_edges(1262, 30, 880, "row4 band row")
row_edges(1466, 30, 880, "row5 band row")
# strip edges
row_edges(725, 30, 880, "card1 strip row(pink)", tol=3)
row_edges(972, 30, 880, "card2 strip row(pink)", tol=3)

# header items bboxes via darkness/red masks
def bbox(x0, y0, x1, y1, mask_fn, label):
    box = A[y0:y1, x0:x1]
    m = mask_fn(box)
    ys, xs = np.where(m)
    if len(xs) == 0:
        print(label, "EMPTY"); return
    print(f"{label}: x {x0+xs.min()}-{x0+xs.max()} y {y0+ys.min()}-{y0+ys.max()} (css x {(x0+xs.min())/2:.1f}-{(x0+xs.max())/2:.1f} y {(y0+ys.min())/2:.1f}-{(y0+ys.max())/2:.1f})")

red = lambda b: (b[:, :, 0] - b[:, :, 1] > 60) & (b[:, :, 0] > 150)
dark = lambda b: b @ [0.299, 0.587, 0.114] < 120
bbox(30, 10, 130, 110, red, "logo tile")
bbox(140, 10, 640, 110, red, "wordmark")
bbox(530, 10, 700, 105, lambda b: b @ [0.299, 0.587, 0.114] < 150, "pill(text)")
bbox(530, 10, 700, 105, lambda b: (np.abs(b - np.array([0xE2, 0xE6, 0xEB])).sum(axis=2) < 18), "pill(bg)")
bbox(700, 10, 790, 110, dark, "headset")
bbox(795, 10, 880, 110, dark, "hamburger")
bbox(140, 320, 250, 440, lambda b: (b[:, :, 0] - b[:, :, 2] > 25) & (b[:, :, 0] > 200), "avatar face")
bbox(240, 425, 360, 490, lambda b: b @ [0.299, 0.587, 0.114] < 170, "typing dots")
bbox(60, 1640, 130, 1710, red, "sparkles")
bbox(740, 1640, 860, 1720, red, "send btn")
bbox(720, 520, 880, 590, red, "badge1")
bbox(320, 528, 600, 625, lambda b: (b @ [0.299, 0.587, 0.114] < 150) | ((b[:, :, 0] - b[:, :, 1] > 50) & (b[:, :, 0] > 130)), "car1 illu")
bbox(300, 776, 620, 880, lambda b: (b @ [0.299, 0.587, 0.114] < 150) | ((b[:, :, 0] - b[:, :, 1] > 50) & (b[:, :, 0] > 130)), "car2 illu")
bbox(100, 1025, 440, 1140, lambda b: (b @ [0.299, 0.587, 0.114] < 150) | ((b[:, :, 0] - b[:, :, 1] > 50) & (b[:, :, 0] > 130)), "moto illu")
bbox(500, 1025, 850, 1140, lambda b: (b @ [0.299, 0.587, 0.114] < 150) | ((b[:, :, 0] - b[:, :, 1] > 50) & (b[:, :, 0] > 130)), "house illu")
bbox(100, 1240, 440, 1360, lambda b: (b @ [0.299, 0.587, 0.114] < 150) | ((b[:, :, 0] - b[:, :, 1] > 50) & (b[:, :, 0] > 130)), "heart illu")
bbox(500, 1240, 850, 1360, lambda b: (b @ [0.299, 0.587, 0.114] < 150) | ((b[:, :, 0] - b[:, :, 1] > 50) & (b[:, :, 0] > 130)), "cake illu")
bbox(100, 1445, 440, 1570, lambda b: (b @ [0.299, 0.587, 0.114] < 150) | ((b[:, :, 0] - b[:, :, 1] > 50) & (b[:, :, 0] > 130)), "phone illu")
bbox(500, 1445, 850, 1570, lambda b: (b @ [0.299, 0.587, 0.114] < 150) | ((b[:, :, 0] - b[:, :, 1] > 50) & (b[:, :, 0] > 130)), "tooth illu")
