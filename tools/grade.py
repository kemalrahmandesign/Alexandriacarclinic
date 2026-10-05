#!/usr/bin/env python3
"""Per-photo colour grade for the shop photos. Deterministic, no AI.

usage: python3 tools/grade.py <in.jpg> <out.jpg> [key=value ...]
keys (all optional):
  exp      exposure in stops (-1..1)         default 0
  contrast S-curve strength (0..1)           default 0.25
  hi       highlight compression (0..1)     default 0
  sat      global saturation multiplier       default 0.9
  red      extra saturation multiplier on strong reds/oranges  default 1
  navy     navy lean in shadows (0..1)        default 0.5
  warm     warm tint in highlights (0..1)     default 0.35
  vig      vignette strength (0..1)           default 0.15
  white    white point (0.8..1) pulls blown backgrounds down  default 1
  blue     extra saturation on blues (uniforms, lifts) default 1
  matte    lift blacks toward deep navy (0..1)  default 0
"""
import sys
import numpy as np
from PIL import Image


def smooth_s(x, k):
    # blend identity with a smoothstep S-curve
    s = x * x * (3 - 2 * x)
    return x * (1 - k) + s * k


def grade(img, exp=0.0, contrast=0.25, hi=0.0, sat=0.9, red=1.0, navy=0.5, warm=0.35, vig=0.15, white=1.0, blue=1.0, matte=0.0):
    a = np.asarray(img.convert("RGB"), dtype=np.float32) / 255.0
    a = np.clip(a * (2.0 ** exp), 0, 1)
    if hi > 0:  # roll off highlights
        t = 0.62
        over = np.clip(a - t, 0, None)
        a = np.where(a > t, t + (1 - t) * (1 - np.exp(-over / (1 - t) * (1 + 2 * hi))) / (1 - np.exp(-(1 + 2 * hi))) , a)
    a = a * white
    a = smooth_s(a, contrast)
    lum = (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2])[..., None]
    a = lum + (a - lum) * sat
    if red != 1.0:  # tame strong reds / oranges only
        r, g, b = a[..., 0], a[..., 1], a[..., 2]
        redness = np.clip((r - np.maximum(g, b)) * 3.0 - 0.15, 0, 1)[..., None]
        lum2 = (0.299 * r + 0.587 * g + 0.114 * b)[..., None]
        a = a + (lum2 + (a - lum2) * red - a) * redness
    if blue != 1.0:  # richer blues only
        r, g, b = a[..., 0], a[..., 1], a[..., 2]
        blueness = np.clip((b - np.maximum(r, g)) * 4.0, 0, 1)[..., None]
        lum3 = (0.299 * r + 0.587 * g + 0.114 * b)[..., None]
        a = a + (lum3 + (a - lum3) * blue - a) * blueness
    lum = (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2])[..., None]
    sh = (1 - lum) ** 2.2
    hl = lum ** 2.2
    a = a + sh * navy * np.array([-0.010, 0.012, 0.050], dtype=np.float32)
    a = a + hl * warm * np.array([0.045, 0.020, -0.020], dtype=np.float32)
    if matte > 0:  # navy-tinted blacks
        a = a * (1 - matte * 0.06) + matte * np.array([0.02, 0.045, 0.10], dtype=np.float32) * (1 - lum) ** 1.5
    if vig > 0:
        h, w = a.shape[:2]
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / 1.41
        a = a * (1 - vig * np.clip(d, 0, 1) ** 2.2)[..., None]
    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))


if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    kw = {k: float(v) for k, v in (p.split("=") for p in sys.argv[3:])}
    grade(Image.open(src), **kw).save(dst, quality=93, subsampling=0)
