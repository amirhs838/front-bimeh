#!/usr/bin/env python3
"""Refine band/strip/headline/mascot bounds + extract all assets."""
from PIL import Image, ImageFilter
import numpy as np, os, json

SRC = "/home/z/my-project/upload/1.jpg"
OUT = "/home/z/my-project/public"
im = Image.open(SRC).convert("RGB")
A = np.asarray(im).astype(float)

# ---------- refine band edges per card ----------
def band_edges(x, y0, y1, label):
    """column scan: band = rows whose color is close to page-bg tone (blue-gray), card bg = whiter"""
    col = A[y0:y1, x - 2:x + 3].mean(axis=1)
    white = col @ [0.299, 0.587, 0.114]
    blue = col[:, 2] - col[:, 0]  # page-ish band has b > r by ~10, card bg by ~5
    is_band = (blue > 7.5) & (white > 225) & (white < 248)
    segs, s = [], None
    for i, m in enumerate(is_band):
        if m and s is None: s = i
        elif not m and s is not None:
            if i - s > 6: segs.append((y0 + s, y0 + i))
            s = None
    if s is not None: segs.append((y0 + s, y1))
    print(f"band {label} x={x}:", segs)

band_edges(820, 505, 755, "card1")
band_edges(820, 755, 1005, "card2")
band_edges(820, 1010, 1225, "row3R")
band_edges(400, 1010, 1225, "row3L")
band_edges(820, 1225, 1430, "row4R")
band_edges(400, 1225, 1430, "row4L")
band_edges(820, 1430, 1630, "row5R")
band_edges(400, 1430, 1630, "row5L")

# strip vertical edges at x=400 (strong pink test)
def strip_edges(x, y0, y1, label):
    col = A[y0:y1, x - 2:x + 3].mean(axis=1)
    pink = (col[:, 0] - col[:, 2]) > 5
    segs, s = [], None
    for i, m in enumerate(pink):
        if m and s is None: s = i
        elif not m and s is not None:
            if i - s > 4: segs.append((y0 + s, y0 + i))
            s = None
    if s is not None: segs.append((y0 + s, y1))
    print(f"strip {label} x={x}:", segs)

strip_edges(400, 690, 755, "card1")
strip_edges(400, 935, 1005, "card2")

# headline bbox
box = A[240:330, 150:500]
m = box @ [0.299, 0.587, 0.114] < 110
ys, xs = np.where(m)
print(f"headline: x {150+xs.min()}-{150+xs.max()} y {240+ys.min()}-{240+ys.max()} (css x {(150+xs.min())/2:.1f}-{(150+xs.max())/2:.1f} y {(240+ys.min())/2:.1f}-{(240+ys.max())/2:.1f})")

# bubble bbox (white-ish on hero bg)
box = A[330:440, 240:500]
m = (box @ [0.299, 0.587, 0.114]) > 246
ys, xs = np.where(m)
print(f"bubble: x {240+xs.min()}-{240+xs.max()} y {330+ys.min()}-{330+ys.max()} (css {(240+xs.min())/2:.1f}-{(240+xs.max())/2:.1f}, {(330+ys.min())/2:.1f}-{(330+ys.max())/2:.1f})")

# typing pill bbox
box = A[430:490, 260:360]
m = (box @ [0.299, 0.587, 0.114]) > 243
ys, xs = np.where(m)
print(f"typing pill: x {260+xs.min()}-{260+xs.max()} y {430+ys.min()}-{430+ys.max()} (css {(260+xs.min())/2:.1f}-{(260+xs.max())/2:.1f}, {(430+ys.min())/2:.1f}-{(430+ys.max())/2:.1f})")

# mascot bbox (saturated red + white gloves/shoes enclosed) — red mask
box = A[130:505, 470:820]
red = (box[:, :, 0] - box[:, :, 1] > 60) & (box[:, :, 0] > 140)
ys, xs = np.where(red)
print(f"mascot red bbox: x {470+xs.min()}-{470+xs.max()} y {130+ys.min()}-{130+ys.max()} (css {(470+xs.min())/2:.1f}-{(470+xs.max())/2:.1f}, {(130+ys.min())/2:.1f}-{(130+ys.max())/2:.1f})")

# ---------- MASCOT extraction with rembg ----------
os.makedirs(f"{OUT}/img", exist_ok=True)
from rembg import remove, new_session
MBOX = (488, 132, 800, 500)  # generous crop around mascot
mascot = im.crop(MBOX)
print("running rembg on mascot...")
session = new_session("u2net")
res = remove(mascot, session=session, post_process_mask=True)
res = res.convert("RGBA")
alpha = np.asarray(res)[:, :, 3].astype(float)
# clean: erode slightly to kill halo, then feather
al = Image.fromarray(alpha.astype(np.uint8))
al = al.filter(ImageFilter.MinFilter(3))      # erode 1px
al = al.filter(ImageFilter.GaussianBlur(0.8)) # feather
res.putalpha(al)
arr = np.asarray(res)
ys, xs = np.where(arr[:, :, 3] > 12)
x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
trimmed = res.crop((x0, y0, x1, y1))
print(f"mascot trimmed size: {trimmed.size} (css {trimmed.size[0]/2:.1f}x{trimmed.size[1]/2:.1f})")
trimmed.save(f"{OUT}/img/mascot.png")
trimmed.save(f"{OUT}/img/mascot.webp", quality=92, method=6)
print("mascot saved, abs bbox in image:", (MBOX[0] + x0, MBOX[1] + y0, MBOX[0] + x1, MBOX[1] + y1))

# ---------- ILLUSTRATION extraction (luma key) ----------
BANDS = {
    "thirdparty": (58, 528, 842, 621),
    "body":       (58, 777, 842, 877),
    "motorcycle": (58, 1032, 427, 1124),
    "home":       (480, 1032, 841, 1124),
    "supplementary": (58, 1248, 427, 1340),
    "life":       (480, 1248, 841, 1340),
    "mobile":     (58, 1452, 427, 1544),
    "implant":    (480, 1452, 841, 1544),
}
def extract_illu(name, bx0, by0, bx1, by1):
    crop = A[by0:by1, bx0:bx1]
    r, g, b = crop[:, :, 0], crop[:, :, 1], crop[:, :, 2]
    lum = crop @ [0.299, 0.587, 0.114]
    # darkness alpha (strokes are dark gray)
    a_dark = np.clip((222 - lum) / (222 - 100), 0, 1)
    # redness alpha
    redness = (r - np.maximum(g, b)) / 90.0
    a_red = np.clip(redness, 0, 1)
    alpha = np.maximum(a_dark, a_red)
    alpha[alpha < 0.14] = 0           # drop faint skyline + jpeg noise
    alpha = np.clip(alpha * 1.06, 0, 1)
    # unmix color from band bg for clean edges
    bg = np.array([0xEE, 0xF2, 0xF7], dtype=float)
    a3 = alpha[:, :, None]
    rgb = np.clip((crop - (1 - a3) * bg) / np.maximum(a3, 1e-3), 0, 255)
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    # trim
    ys, xs = np.where(out[:, :, 3] > 8)
    if len(xs) == 0: print(name, "EMPTY"); return
    pad = 2
    x0, y0 = max(xs.min() - pad, 0), max(ys.min() - pad, 0)
    x1, y1 = min(xs.max() + 1 + pad, img.width), min(ys.max() + 1 + pad, img.height)
    img = img.crop((x0, y0, x1, y1))
    img.save(f"{OUT}/img/{name}.png")
    img.save(f"{OUT}/img/{name}.webp", quality=90, method=6, exact=False)
    print(f"{name}: size {img.size} css {img.size[0]/2:.1f}x{img.size[1]/2:.1f} | band-rel css x {(bx0+x0-38)/2:.1f} y {(by0+y0-(by0))/2:.1f}")

for k, v in BANDS.items():
    extract_illu(k, *v)

# ---------- color refinement ----------
def med_color(x0, y0, x1, y1, cond=None):
    box = A[y0:y1, x0:x1].reshape(-1, 3)
    if cond is not None:
        m = cond(box)
        box = box[m]
        if len(box) == 0: return "EMPTY"
    med = np.median(box, axis=0).astype(int)
    return f"#{med[0]:02X}{med[1]:02X}{med[2]:02X} n={len(box)}"

print("brand(send):", med_color(770, 1660, 832, 1702, lambda b: (b[:, 0] - b[:, 1]) > 70))
print("brand(badge):", med_color(740, 532, 845, 570, lambda b: (b[:, 0] - b[:, 1]) > 70))
print("brand(logo):", med_color(50, 30, 108, 88, lambda b: (b[:, 0] - b[:, 1]) > 70))
print("page_top:", med_color(300, 2, 700, 18))
print("page_gap:", med_color(200, 750, 700, 759))
print("card_bg:", med_color(150, 640, 300, 700))
print("band_bg:", med_color(120, 540, 250, 615))
print("strip_bg:", med_color(120, 712, 300, 735))
print("hero_top:", med_color(300, 130, 500, 170))
print("hero_mid:", med_color(100, 250, 200, 350))
print("hero_bot:", med_color(80, 440, 300, 495))
print("bubble:", med_color(300, 350, 460, 380))
print("pill_bg:", med_color(550, 30, 676, 88, lambda b: np.abs(b - b.mean(axis=1, keepdims=True)).sum(axis=1) < 24))
print("tab:", med_color(40, 516, 100, 568))
print("input_bg:", med_color(300, 1668, 500, 1700))
print("chatbar_bg:", med_color(500, 1636, 740, 1650))
print("avatar_pink:", med_color(170, 368, 210, 405, lambda b: (b[:, 0] - b[:, 2]) > 25))
print("subtitle:", med_color(320, 674, 590, 695, lambda b: (b[:, 2] - b[:, 0]) > 30))
print("headline:", med_color(200, 255, 470, 320, lambda b: b @ [0.299, 0.587, 0.114] < 90))
print("title:", med_color(280, 632, 620, 666, lambda b: b @ [0.299, 0.587, 0.114] < 90))
print("bubble_text:", med_color(260, 340, 480, 430, lambda b: b @ [0.299, 0.587, 0.114] < 90))
print("checkbox_border:", med_color(56, 526, 96, 566, lambda b: b @ [0.299, 0.587, 0.114] < 120))
print("pill_text:", med_color(570, 40, 660, 82, lambda b: b @ [0.299, 0.587, 0.114] < 110))
