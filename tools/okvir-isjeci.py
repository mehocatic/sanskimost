# Cuts the photograph of Meho's white carved frame (originals/okvir-bijeli.webp) into the pieces the corridor builds its frames from
# (js/hodnik.js): two top corners, the carved middle and a plain stretch of each side. The wall round the frame is made transparent.
# The bottom corners are the top ones mirrored (dried flowers lie over the real ones), the bottom's plain stretch comes from its right half.
#
#   python -I tools/okvir-isjeci.py            -> photos/okvir/*.webp and photos/okvir/okvir.json (sizes, in pixels)
#
# The numbers below are read off this one photograph: the inner opening (IL, IT, IR, IB), how far the frame reaches out past it (D),
# the size of a corner (C) and where the carved middles sit.
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from numpy.lib.stride_tricks import sliding_window_view as sw

SRC = 'originals/okvir-bijeli.webp'
OUT = 'photos/okvir'
IL, IT, IR, IB = 192, 199, 984, 785      # the inner opening (the edge of the photograph)
D = 140                                   # from the opening out to beyond the furthest carving
C = 250                                   # a corner piece is C x C, from the outer corner inward
TOP_MID = (460, 720)                      # the carved middle of the top and bottom sides (x)
SIDE_MID = (425, 560)                     # the carved middle of the left and right sides (y)

im = Image.open(SRC).convert('RGB')
W, H = im.size
L = np.asarray(im).astype(float).mean(2)

# the frame is carved and cracked, the wall is smooth: local contrast tells them apart
k = 7
sd = sw(np.pad(L, k // 2, mode='edge'), (k, k)).std(axis=(2, 3))
B = Image.fromarray(((sd > 13) * 255).astype('uint8')).filter(ImageFilter.MaxFilter(7))
B = B.filter(ImageFilter.MinFilter(13)).filter(ImageFilter.MaxFilter(13))   # cut thin bridges to specks on the wall
ImageDraw.Draw(B).rectangle((IL, IT, IR, IB), fill=255)                      # the opening is not wall to flood
for x in range(0, W, 25):
    for y in (0, H - 1):
        if B.getpixel((x, y)) == 0: ImageDraw.floodfill(B, (x, y), 128)
for y in range(0, H, 25):
    for x in (0, W - 1):
        if B.getpixel((x, y)) == 0: ImageDraw.floodfill(B, (x, y), 128)
mask = Image.fromarray(((np.asarray(B) != 128) * 255).astype('uint8'))
mask = mask.filter(ImageFilter.MinFilter(9))                                          # in a little, past the light rim of wall
ImageDraw.floodfill(mask, (IL - 60, (IT + IB) // 2), 128)                             # keep only the frame itself, not specks
mask = Image.fromarray(((np.asarray(mask) == 128) * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.2))
ImageDraw.Draw(mask).rectangle((IL + 1, IT + 1, IR - 1, IB - 1), fill=0)              # the opening itself is see-through

rgba = im.copy(); rgba.putalpha(mask)
os.makedirs(OUT, exist_ok=True)
pieces = {
    'c-tl': (IL - D, IT - D, IL - D + C, IT - D + C),
    'c-tr': (IR + D - C, IT - D, IR + D, IT - D + C),
    't-l': (IL - D + C, IT - D, TOP_MID[0], IT),
    't-c': (TOP_MID[0], IT - D, TOP_MID[1], IT),
    't-r': (TOP_MID[1], IT - D, IR + D - C, IT),
    'b-c': (TOP_MID[0], IB, TOP_MID[1], IB + D),
    'b-p': (TOP_MID[1], IB, IR + D - C, IB + D),
    'l-c': (IL - D, SIDE_MID[0], IL, SIDE_MID[1]),
    'l-p': (IL - D, IT - D + C, IL, SIDE_MID[0]),
    'r-c': (IR, SIDE_MID[0], IR + D, SIDE_MID[1]),
    'r-p': (IR, IT - D + C, IR + D, SIDE_MID[0]),
}
sizes = {}
for name, box in pieces.items():
    p = rgba.crop(box)
    p.save(f'{OUT}/{name}.webp', 'WEBP', quality=88, method=6, exact=True)
    sizes[name] = p.size
with open(f'{OUT}/okvir.json', 'w') as f:
    json.dump({'D': D, 'C': C, 'pieces': sizes}, f)
print(json.dumps(sizes))
