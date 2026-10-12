#!/usr/bin/env python3
"""Inspect reference image: sample colors, save crops for visual inspection."""
from PIL import Image
import os, json

SRC = "/home/z/my-project/upload/1.jpg"
OUT = "/home/z/my-project/analysis"
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert("RGB")
W, H = im.size
print(f"size: {W}x{H}")

def hexat(x, y):
    r, g, b = im.getpixel((x, y))
    return f"#{r:02X}{g:02X}{b:02X}"

def avg(x0, y0, x1, y1):
    """average color of box"""
    box = im.crop((x0, y0, x1, y1))
    px = list(box.getdata())
    n = len(px)
    r = sum(p[0] for p in px) // n
    g = sum(p[1] for p in px) // n
    b = sum(p[2] for p in px) // n
    return f"#{r:02X}{g:02X}{b:02X}"

def darkest(x0, y0, x1, y1):
    """darkest pixel in box (for text color)"""
    box = im.crop((x0, y0, x1, y1))
    px = list(box.getdata())
    p = min(px, key=lambda p: p[0] + p[1] + p[2])
    return f"#{p[0]:02X}{p[1]:02X}{p[2]:02X}"

def reddest(x0, y0, x1, y1):
    """most saturated red pixel in box"""
    box = im.crop((x0, y0, x1, y1))
    px = list(box.getdata())
    p = max(px, key=lambda p: p[0] - (p[1] + p[2]) / 2)
    return f"#{p[0]:02X}{p[1]:02X}{p[2]:02X}"

samples = {
    # page bg corners / edges
    "page_bg_top_right": avg(860, 4, 895, 30),
    "page_bg_left_mid": avg(2, 880, 30, 960),
    "page_bg_bottom": avg(2, 1740, 30, 1749),
    "page_bg_top_left": avg(4, 4, 30, 30),
    # logo tile
    "logo_tile": avg(60, 40, 100, 80),
    "logo_tile_reddest": reddest(50, 30, 110, 90),
    # wordmark red
    "wordmark_red": reddest(280, 30, 600, 90),
    # pill ثبت نام
    "pill_bg": avg(560, 40, 600, 70),
    "pill_text": darkest(570, 35, 660, 85),
    # hamburger
    "hamburger": darkest(815, 40, 855, 80),
    # hero card bg
    "hero_tl": avg(60, 140, 120, 200),
    "hero_top_mid": avg(380, 130, 460, 170),
    "hero_left_mid": avg(60, 280, 120, 340),
    "hero_bottom_left": avg(60, 440, 160, 490),
    "hero_bottom_right": avg(700, 460, 840, 495),
    "hero_tr": avg(780, 140, 850, 200),
    # headline ink
    "headline_ink": darkest(220, 260, 460, 320),
    # bubble bg + text
    "bubble_bg": avg(260, 360, 300, 380),
    "bubble_text": darkest(270, 350, 470, 420),
    # avatar tile
    "avatar_face": reddest(160, 355, 220, 415),
    # typing pill
    "typing_pill_bg": avg(280, 440, 330, 470),
    "typing_dot_dark": darkest(300, 445, 330, 465),
    # card bg (card1, empty left area)
    "card_bg_1": avg(80, 640, 160, 700),
    "card_bg_between": avg(480, 1230, 560, 1290),
    # card border-ish (top edge of card1)
    "card_top_edge": avg(300, 512, 500, 516),
    # badge red
    "badge_red": reddest(740, 530, 850, 575),
    # checkbox border
    "checkbox_border": darkest(56, 528, 92, 564),
    # strip bg (card1) + strip text
    "strip_bg": avg(100, 706, 200, 738),
    "strip_text": reddest(300, 708, 700, 738),
    # subtitle blue (card1 subtitle area)
    "subtitle_blue": darkest(300, 672, 600, 696),
    # title ink (card1)
    "title_ink": darkest(300, 636, 600, 664),
    # chat bar
    "chatbar_bg": avg(60, 1645, 130, 1680),
    "chatbar_bg_right": avg(855, 1645, 875, 1680),
    "input_bg": avg(300, 1660, 400, 1700),
    "send_btn": avg(780, 1670, 820, 1695),
    "sparkle_red": reddest(70, 1655, 120, 1700),
    "placeholder_text": darkest(500, 1660, 720, 1695),
    # gap between cards (page bg between card1 & card2)
    "gap_cards": avg(300, 748, 500, 760),
}

print(json.dumps(samples, indent=1, ensure_ascii=False))

# ---- crops for visual inspection (zoomed where useful) ----
crops = {
    "header": (0, 0, 899, 120, 1),
    "logo": (30, 10, 640, 110, 2),
    "header_right": (520, 10, 880, 110, 2),
    "hero": (38, 116, 860, 500, 1),
    "mascot": (480, 130, 810, 500, 1),
    "bubble_area": (130, 320, 500, 490, 2),
    "card1": (38, 512, 860, 748, 1),
    "card2": (38, 760, 860, 998, 1),
    "row3": (38, 1016, 860, 1214, 1),
    "row4": (38, 1232, 860, 1422, 1),
    "row5": (38, 1436, 860, 1616, 1),
    "chatbar": (38, 1625, 860, 1725, 1),
    "badge_zoom": (720, 520, 860, 585, 4),
    "checkbox_zoom": (38, 512, 130, 590, 4),
    "stage_left": (48, 525, 200, 625, 3),
    "stage_right": (700, 525, 850, 625, 3),
    "car_illu": (330, 530, 580, 625, 2),
}
for name, (x0, y0, x1, y1, z) in crops.items():
    c = im.crop((x0, y0, x1, y1))
    if z > 1:
        c = c.resize((c.width * z, c.height * z), Image.LANCZOS)
    c.save(f"{OUT}/{name}.png")
    print(f"saved {name}.png {c.size}")
