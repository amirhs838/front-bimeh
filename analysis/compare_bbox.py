#!/usr/bin/env python3
"""Compare ink bboxes: reference vs current shot, identical masks."""
from PIL import Image
import numpy as np

ref = np.asarray(Image.open("upload/1.jpg").convert("RGB").resize((900, 1750), Image.LANCZOS)).astype(float)
shot = np.asarray(Image.open("analysis/shot.png").convert("RGB")).astype(float)

def bbox(A, x0, y0, x1, y1, mask_fn):
    box = A[y0:y1, x0:x1]
    m = mask_fn(box)
    ys, xs = np.where(m)
    if len(xs) == 0: return None
    return (x0 + xs.min(), y0 + ys.min(), x0 + xs.max(), y0 + ys.max())

dark = lambda b: b @ [0.299, 0.587, 0.114] < 130
dark170 = lambda b: b @ [0.299, 0.587, 0.114] < 170
red = lambda b: (b[:, :, 0] - b[:, :, 1] > 60) & (b[:, :, 0] > 130)
blueish = lambda b: (b[:, :, 2] - b[:, :, 0] > 15) & (b @ [0.299, 0.587, 0.114] < 228)

ITEMS = [
    ("wordmark",   (130, 25, 340, 90), red),
    ("pill_text",  (555, 28, 680, 95), dark),
    ("burger",     (795, 25, 875, 90), dark),
    ("headline",   (95, 240, 500, 335), dark170),
    ("bubble_txt", (250, 340, 495, 435), dark),
    ("typing_dots",(275, 445, 350, 480), lambda b: b @ [0.299,0.587,0.114] < 215),
    ("mascot",     (470, 130, 820, 505), red),
    ("title1",     (255, 628, 655, 672), dark170),
    ("sub1",       (255, 672, 655, 700), blueish),
    ("strip1_txt", (80, 700, 820, 746), red),
    ("badge1",     (700, 520, 880, 570), red),
    ("checkbox1",  (40, 515, 120, 585), dark),
    ("title2",     (270, 878, 630, 925), dark170),
    ("half3L_title",(90, 1155, 400, 1195), dark170),
    ("placeholder",(440, 1648, 750, 1708), blueish),
    ("sendbtn",    (740, 1640, 865, 1720), red),
    ("sparkles",   (55, 1645, 130, 1710), red),
]
print(f"{'item':14s} {'ref (x0,y0,x1,y1)':>26s} {'mine':>26s} {'delta dx0,dy0,dx1,dy1'}")
for name, (x0, y0, x1, y1), fn in ITEMS:
    r = bbox(ref, x0, y0, x1, y1, fn)
    s = bbox(shot, x0, y0, x1, y1, fn)
    if r is None or s is None:
        print(f"{name:14s} ref={r} mine={s}")
        continue
    d = tuple(si - ri for si, ri in zip(s, r))
    flag = " <<<" if max(abs(v) for v in d) > 4 else ""
    print(f"{name:14s} {str(r):>26s} {str(s):>26s} {d}{flag}")
