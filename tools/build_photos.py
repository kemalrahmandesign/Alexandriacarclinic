#!/usr/bin/env python3
"""Build the service/team photos from the untouched originals.

1. Optional paste-back: take ONLY the listed boxes from the AI object-removal output
   (media/removed/<name>.jpg) and drop them into the original, so every other pixel
   (blur, text, faces, colour) is exactly what the camera shot.
2. Optional blur patches (licence plates).
3. Per-photo colour grade (tools/grade.py).

run:  python3 tools/build_photos.py [name ...]
"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(__file__))
from grade import grade

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# boxes are (x0, y0, x1, y1) in 1600x1067 original coordinates
PHOTOS = {
    "tires": dict(out="services/tires-alignment",
        paste=[(845, 20, 1090, 290), (140, 470, 470, 880), (470, 470, 590, 580)],
        grade=dict(exp=-0.10, contrast=0.30, hi=0.30, sat=0.85, red=0.62, navy=0.5, warm=0.30)),
    "oil": dict(out="services/oil-change",
        paste=[(80, 500, 310, 900), (1225, 560, 1600, 1067)],
        grade=dict(exp=-0.30, contrast=0.30, hi=0.9, sat=0.90, white=0.90, navy=0.5, warm=0.30)),
    "steering": dict(out="services/steering-suspension",
        paste=[(150, 540, 575, 1067), (0, 790, 150, 1067)],
        grade=dict(exp=-0.08, contrast=0.30, sat=0.92, navy=0.5, warm=0.30)),
    "engine": dict(out="services/engine-diagnostics",
        paste=[(185, 955, 465, 1067), (640, 995, 745, 1055), (160, 870, 270, 935), (800, 985, 905, 1035)],
        grade=dict(exp=-0.02, contrast=0.25, hi=0.4, sat=0.92, red=0.80, navy=0.45, warm=0.30)),
    "brakes": dict(out="services/brakes",
        grade=dict(exp=-0.05, contrast=0.30, hi=0.5, sat=0.90, navy=0.5, warm=0.30)),
    "diff": dict(out="services/differentials",
        grade=dict(exp=-0.30, contrast=0.30, hi=0.9, sat=0.90, white=0.90, navy=0.5, warm=0.30)),
    "body": dict(out="services/bodywork-paint",
        grade=dict(exp=-0.05, contrast=0.28, sat=0.88, navy=0.5, warm=0.30)),
    "about": dict(out="team/team-1",
        blur=[(186, 548, 306, 642)],   # Virginia licence plate
        grade=dict(exp=-0.05, contrast=0.28, hi=0.4, sat=0.90, red=0.78, navy=0.45, warm=0.30)),
}


def feather_mask(size, box, f=14):
    w, h = size
    m = Image.new("L", size, 0)
    x0, y0, x1, y1 = box
    m.paste(255, (x0, y0, x1, y1))
    return m.filter(ImageFilter.GaussianBlur(f))


def ring_mean(arr, box, pad=18):
    x0, y0, x1, y1 = box
    h, w = arr.shape[:2]
    X0, Y0, X1, Y1 = max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)
    outer = arr[Y0:Y1, X0:X1].reshape(-1, 3)
    mask = np.ones((Y1 - Y0, X1 - X0), bool)
    mask[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = False
    return arr[Y0:Y1, X0:X1][mask].mean(axis=0)


def paste_back(orig, ai, boxes):
    ai = ai.resize(orig.size, Image.LANCZOS)
    o = np.asarray(orig, dtype=np.float32)
    a = np.asarray(ai, dtype=np.float32)
    out = o.copy()
    for box in boxes:
        # tone-match the patch to the original using the surrounding ring
        shift = ring_mean(o, box) - ring_mean(a, box)
        patch = np.clip(a + shift, 0, 255)
        m = np.asarray(feather_mask(orig.size, box), dtype=np.float32)[..., None] / 255.0
        out = out * (1 - m) + patch * m
    return Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8))


def blur_boxes(img, boxes, r=22):
    for (x0, y0, x1, y1) in boxes:
        crop = img.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(r))
        img.paste(crop, (x0, y0))
    return img


def main(names):
    for n in names or PHOTOS:
        cfg = PHOTOS[n]
        orig = Image.open(f"{ROOT}/media/originals/{n}.jpg").convert("RGB")
        if cfg.get("paste"):
            orig = paste_back(orig, Image.open(f"{ROOT}/media/removed/{n}.jpg").convert("RGB"), cfg["paste"])
        if cfg.get("blur"):
            orig = blur_boxes(orig, cfg["blur"])
        out = grade(orig, **cfg["grade"])
        dst = f"{ROOT}/media/{cfg['out']}.jpg"
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        out.save(dst, quality=92, subsampling=0)
        print("built", dst)


if __name__ == "__main__":
    main(sys.argv[1:])
