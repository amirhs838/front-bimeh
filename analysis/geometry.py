#!/usr/bin/env python3
"""Precise geometry: find card/hero/chatbar edges + mode colors."""
from PIL import Image
import numpy as np, json, os

SRC = "/home/z/my-project/upload/1.jpg"
im = Image.open(SRC).convert("RGB")
A = np.asarray(im).astype(int)
H, W = A.shape[:2]

def lum(y, x):
    r, g, b = A[y, x]
    return 0.299 * r + 0.587 * g + 0.114 * b

def scan_col(x, y0, y1, thresh=6):
    """return list of (y, 'down'/'up') transitions of avg-lum along column x"""
    vals = [np.mean([lum(y, xx) for xx in range(x - 2, x + 3)]) for y in range(y0, y1)]
    trans = []
    for i in range(1, len(vals)):
        d = vals[i] - vals[i - 1]
        if abs(d) > thresh:
            if trans and trans[-1][1] == ("down" if d < 0 else "up") and i - trans[-1][0] < 3:
                continue
            trans.append((y0 + i, "down" if d < 0 else "up"))
    return trans

def scan_row(y, x0, x1, thresh=6):
    vals = [np.mean([lum(yy, x) for yy in range(y - 2, y + 3)]) for x in range(x0, x1)]
    trans = []
    for i in range(1, len(vals)):
        d = vals[i] - vals[i - 1]
        if abs(d) > thresh:
            if trans and trans[-1][1] == ("down" if d < 0 else "up") and i - trans[-1][0] < 3:
                continue
            trans.append((x0 + i, "down" if d < 0 else "up"))
    return trans

print("== vertical scan x=450 (column gap for half rows / inside full cards), y500..1640 ==")
print(scan_col(450, 500, 1640, 5))
print("== vertical scan x=100, y100..540 (hero) ==")
print(scan_col(100, 100, 545, 5))
print("== vertical scan x=100, y1600..1749 (chatbar) ==")
print(scan_col(100, 1600, 1749, 4))
print("== horizontal scan y=1100 (row3) x0..899 ==")
print(scan_row(1100, 0, 899, 5))
print("== horizontal scan y=300 (hero mid) x0..899 ==")
print(scan_row(300, 0, 899, 5))
print("== horizontal scan y=1675 (chatbar) x0..899 ==")
print(scan_row(1675, 0, 899, 4))
print("== horizontal scan y=600 (card1) x0..899 ==")
print(scan_row(600, 0, 899, 5))

def mode_color(x0, y0, x1, y1, q=8):
    box = A[y0:y1, x0:x1].reshape(-1, 3)
    qnt = (box // q * q + q // 2)
    vals, counts = np.unique(qnt, axis=0, return_counts=True)
    v = vals[counts.argmax()]
    c = counts.max() / len(box)
    return f"#{v[0]:02X}{v[1]:02X}{v[2]:02X} ({c:.0%})"

regions = {
    "brand_send_btn": (770, 1660, 830, 1700),
    "brand_badge": (750, 535, 840, 570),
    "brand_logo": (55, 35, 105, 85),
    "page_bg_top": (400, 2, 700, 20),
    "page_bg_gap": (200, 750, 600, 758),
    "page_bg_left": (2, 900, 30, 1000),
    "card_bg": (90, 620, 200, 700),
    "card_bg_half": (480, 1300, 560, 1330),
    "pill_bg": (560, 35, 600, 80),
    "strip_bg": (120, 710, 240, 736),
    "band_bg": (600, 545, 700, 560),
    "hero_bg_mid": (150, 200, 260, 260),
    "hero_bg_top": (350, 130, 450, 160),
    "hero_bg_bottom": (120, 450, 260, 490),
    "hero_bg_floor": (600, 470, 700, 495),
    "bubble_bg": (300, 355, 460, 375),
    "avatar_face": (165, 360, 215, 410),
    "input_bg": (300, 1665, 500, 1698),
    "chatbar_left": (50, 1640, 90, 1660),
    "chatbar_mid": (500, 1636, 700, 1648),
    "below_send": (880, 1700, 899, 1749),
    "tab_white": (48, 520, 90, 530),
}
print(json.dumps({k: mode_color(*v) for k, v in regions.items()}, indent=1))

# text colors: percentile approach — take 5th percentile luminance pixels' mean
def text_color(x0, y0, x1, y1, pct=4):
    box = A[y0:y1, x0:x1].reshape(-1, 3).astype(float)
    l = box @ [0.299, 0.587, 0.114]
    idx = np.argsort(l)[: max(8, int(len(l) * pct / 100))]
    m = box[idx].mean(axis=0).astype(int)
    return f"#{m[0]:02X}{m[1]:02X}{m[2]:02X}"

tc = {
    "headline": (216, 250, 480, 320),
    "title1": (280, 630, 620, 668),
    "subtitle1": (300, 670, 600, 700),
    "strip_text": (250, 705, 650, 740),
    "pill_text": (575, 35, 665, 85),
    "bubble_text": (260, 340, 480, 430),
    "placeholder": (480, 1655, 730, 1700),
    "badge_text": (755, 535, 845, 572),
}
print(json.dumps({k: text_color(*v) for k, v in tc.items()}, indent=1))
