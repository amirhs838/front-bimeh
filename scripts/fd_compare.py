#!/usr/bin/env python3
"""
FOOTER DESKTOP calibration: measures ink bounding boxes on the rendered
footer screenshot (1536 x 864 frame) and compares them with D4 targets
(D4 px * 1536/1672). Windows are generous; ink = dark or red pixels.
Usage: python3 scripts/fd_compare.py /tmp/fd-iterN.png
"""
import sys
from PIL import Image
import numpy as np

S = 1536 / 1672.0  # D4 px -> frame px

def win(x0, y0, x1, y1):
    return (round(x0 * S), round(y0 * S), round(x1 * S), round(y1 * S))

# label, window(D4 px), target ink bbox (D4 px) or None, mode
ELEMENTS = [
    ("wordmark",  (1290, 100, 1665, 230), (1345, 140, 1591, 185), "red"),
    ("heading",   (1050, 205, 1665, 275), (1178, 230, 1591, 261), "ink"),
    ("paraL1",    (1040, 288, 1665, 320), (1059, 296, 1591, 315), "ink"),
    ("paraL2",    (1040, 328, 1665, 360), (1060, 336, 1591, 355), "ink"),
    ("paraL3",    (1040, 368, 1665, 398), (1061, 375, 1591, 393), "ink"),
    ("paraL4",    (1040, 407, 1665, 440), (1060, 414, 1591, 434), "ink"),
    ("paraL5",    (1040, 448, 1665, 478), (1424, 455, 1590, 472), "ink"),
    ("T1-about",  (810, 168, 1000, 215),  (862, 184, 949, 207),   "ink"),
    ("T2-serv",   (590, 168, 790, 215),   (637, 184, 739, 202),   "ink"),
    ("T3-quick",  (220, 168, 460, 215),   (263, 186, 414, 208),   "ink"),
    ("U1",        (840, 214, 1000, 234),  (906, 222, 951, 225),   "red"),
    ("U2",        (630, 214, 790, 234),   (694, 222, 739, 225),   "red"),
    ("U3",        (310, 214, 460, 234),   (370, 222, 415, 225),   "red"),
    ("C1r1",      (815, 253, 1000, 290),  (866, 263, 987, 281),   "ink"),
    ("C1r2",      (815, 320, 1000, 356),  (884, 327, 987, 347),   "ink"),
    ("C1r3",      (815, 390, 1000, 425),  (889, 398, 987, 417),   "ink"),
    ("C1r4",      (815, 460, 1000, 495),  (858, 468, 987, 487),   "ink"),
    ("C2r1",      (545, 253, 745, 290),   (622, 263, 738, 281),   "ink"),
    ("C2r2",      (545, 320, 745, 356),   (593, 325, 737, 348),   "ink"),
    ("C2r3",      (545, 390, 745, 425),   (603, 398, 738, 416),   "ink"),
    ("C2r4",      (545, 460, 745, 495),   (598, 467, 737, 488),   "ink"),
    ("C3r1",      (120, 250, 345, 285),   (286, 258, 339, 276),   "ink"),
    ("C3r2",      (120, 318, 345, 353),   (209, 327, 339, 345),   "ink"),
    ("C3r3",      (120, 388, 345, 423),   (187, 396, 339, 417),   "ink"),
    ("C3r4",      (120, 458, 345, 493),   (259, 468, 339, 486),   "ink"),
    ("qaCirc1",   (355, 238, 430, 302),   (368, 245, 416, 292),   "pink"),
    ("qaCirc4",   (355, 446, 430, 510),   (368, 453, 416, 500),   "pink"),
    ("divMain",   (60, 548, 1610, 568),   (80, 557, 1591, 558),   "div"),
    ("addrText",  (1170, 608, 1455, 652), (1182, 620, 1438, 639), "ink"),
    ("mailText",  (775, 608, 925, 652),   (786, 621, 912, 638),   "ink"),
    ("telText",   (398, 608, 548, 652),   (409, 624, 533, 636),   "ink"),
    ("addrCirc",  (1092, 596, 1165, 662), (1103, 604, 1153, 653), "pink"),
    ("mailCirc",  (698, 598, 770, 662),   (708, 606, 757, 653),   "pink"),
    ("telCirc",   (326, 598, 398, 662),   (336, 606, 385, 653),   "pink"),
    ("vsep1",     (615, 604, 645, 660),   (627, 612, 627, 651),   "div"),
    ("vsep2",     (998, 604, 1028, 660),  (1010, 612, 1010, 651), "div"),
]

def masks(a):
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    return {
        "ink": a.sum(axis=2) < 560,
        "red": (r > 170) & (g < 120) & (b < 140),
        "pink": (r >= 246) & (r - g >= 7) & (r - b >= 3) & (g > 170),
        "div": (a.sum(axis=2) < 725) & (a.sum(axis=2) > 590) & (np.abs(r - g) < 14) & (b >= r),
    }

def main(path):
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(int)
    H, W = a.shape[:2]
    # vertical offset of the footer top inside the screenshot:
    # footer height = 940*S (863.54); shot height 864/865 -> top = H - 940*S
    ftop = H - 940 * S
    mk = masks(a)
    print(f"shot {W}x{H} footer-top offset {ftop:.2f}")
    worst = []
    for label, (x0, y0, x1, y1), tgt, mode in ELEMENTS:
        wx0, wy0, wx1, wy1 = win(x0, y0, x1, y1)
        wy0 = max(0, round(y0 * S + ftop)); wy1 = min(H, round(y1 * S + ftop))
        sub = mk[mode][wy0:wy1, wx0:wx1]
        ys, xs = np.nonzero(sub)
        if len(xs) == 0:
            print(f"{label:10s} EMPTY")
            continue
        ax0, ax1 = wx0 + xs.min(), wx0 + xs.max()
        ay0, ay1 = wy0 + ys.min() - ftop, wy0 + ys.max() - ftop
        # to D4 px for comparison
        rx0, rx1 = ax0 / S, ax1 / S
        ry0, ry1 = ay0 / S, ay1 / S
        if tgt:
            t = ",".join(f"{v:+.1f}" for v in (rx0 - tgt[0], rx1 - tgt[2], ry0 - tgt[1], ry1 - tgt[3]))
            w = (rx1 - rx0) - (tgt[2] - tgt[0])
            print(f"{label:10s} got x{rx0:7.1f}-{rx1:7.1f} y{ry0:6.1f}-{ry1:6.1f}  d[{t}]  dW{w:+6.1f}")
            worst.append((abs(w), label))
        else:
            print(f"{label:10s} got x{rx0:7.1f}-{rx1:7.1f} y{ry0:6.1f}-{ry1:6.1f}")
    if worst:
        worst.sort(reverse=True)
        print("worst widths:", [(l, round(w, 1)) for w, l in worst[:8]])

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "/tmp/fd-iter1.png")
