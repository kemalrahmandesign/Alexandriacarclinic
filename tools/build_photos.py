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
        grade=dict(exp=-0.15, contrast=0.50, hi=0.40, sat=1.12, red=0.70, blue=1.5, navy=1.8, warm=1.1, matte=0.8, vig=0.28)),
    "steering": dict(out="services/steering-suspension",
        paste=[(150, 540, 575, 1067), (0, 790, 150, 1067)],
        grade=dict(exp=-0.12, contrast=0.50, hi=0.30, sat=1.10, blue=1.4, navy=1.8, warm=1.1, matte=0.8, vig=0.28)),
    "engine": dict(out="services/engine-diagnostics",
        paste=[(185, 955, 465, 1067), (640, 995, 745, 1055), (160, 870, 270, 935), (800, 985, 905, 1035)],
        grade=dict(exp=-0.10, contrast=0.50, hi=0.50, sat=1.08, red=0.82, blue=1.5, navy=1.8, warm=1.1, matte=0.8, vig=0.28)),
    "brakes": dict(out="services/brakes",
        grade=dict(exp=-0.02, contrast=0.50, hi=0.50, sat=1.10, blue=1.4, navy=1.8, warm=1.1, matte=0.8, vig=0.28)),
    "body": dict(out="services/collision-repair",
        grade=dict(exp=-0.05, contrast=0.45, hi=0.30, sat=1.05, blue=1.4, navy=1.6, warm=1.0, matte=0.7, vig=0.26)),
    "diff2": dict(out="services/differentials",
        box=(0, 207, 1290, 1067),   # crop the Virginia licence plate out of frame (was an ugly blur box)
        grade=dict(exp=-0.10, contrast=0.50, hi=0.50, sat=1.08, red=0.80, blue=1.4, navy=1.8, warm=1.1, matte=0.8, vig=0.28)),
    "transsvc": dict(out="services/transmission-service",
        paste=[(0, 840, 520, 1067), (60, 640, 500, 900), (1330, 500, 1560, 660), (1380, 360, 1540, 520)],
        grade=dict(exp=-0.12, contrast=0.50, hi=0.50, sat=1.10, blue=1.5, navy=1.8, warm=1.1, matte=0.8, vig=0.28)),
    "transrep": dict(out="services/oil-change",
        paste=[(0, 540, 235, 1000)],
        grade=dict(exp=-0.12, contrast=0.50, hi=0.50, sat=1.10, blue=1.5, navy=1.8, warm=1.1, matte=0.8, vig=0.28)),
    "oil2": dict(out="team/team-1",
        paste=[(0, 220, 130, 625), (150, 985, 540, 1067)],
        grade=dict(exp=-0.15, contrast=0.50, hi=0.60, sat=1.10, white=0.95, blue=1.5, navy=1.8, warm=1.1, matte=0.8, vig=0.28)),
    "about": dict(out="spare/about-mazda",
        paste=[(0, 330, 215, 1067), (330, 1000, 580, 1067), (1150, 790, 1420, 905)],
        blur=[(186, 548, 306, 642)],   # Virginia licence plate
        grade=dict(exp=-0.10, contrast=0.50, hi=0.50, sat=1.08, red=0.80, blue=1.4, navy=1.8, warm=1.1, matte=0.8, vig=0.28)),
    # AI / Pexels stills (sources in media/ai-src and media/stock, not deployed; Pexels licence: free commercial use). Darker, desaturated theme grade.
    "electrical-battery": dict(src="stock/px-4374843", box=(600, 800, 1600, 1467), out="services/electrical-battery", grade=dict(exp=-0.05, contrast=0.42, hi=0.45, sat=0.88, red=0.80, blue=1.3, navy=1.5, warm=1.0, matte=0.35, vig=0.30)),
    "ac-heating": dict(src="stock/px-11291690", out="services/ac-heating", grade=dict(exp=-0.05, contrast=0.42, hi=0.45, sat=0.88, red=0.80, blue=1.3, navy=1.5, warm=1.0, matte=0.35, vig=0.30)),
    "belts-hoses-cooling": dict(src="stock/px-3757226", out="services/belts-hoses-cooling", grade=dict(exp=-0.20, contrast=0.45, hi=0.50, sat=0.90, red=0.85, blue=1.3, navy=1.5, warm=1.1, matte=0.4, vig=0.30)),
    "engine-replacement": dict(src="stock/px-5158155", out="services/engine-replacement", grade=dict(exp=-0.20, contrast=0.45, hi=0.50, sat=0.90, red=0.85, blue=1.3, navy=1.5, warm=1.1, matte=0.4, vig=0.30)),
    "transmission-replacement": dict(src="ai-src/transmission-gears", out="services/transmission-replacement",
        grade=dict(exp=-0.20, contrast=0.60, hi=0.50, sat=1.0, blue=1.2, navy=1.5, warm=1.4, matte=0.3, vig=0.30)),
    "bodywork-paint": dict(src="stock/px-6870314", out="services/bodywork-paint", grade=dict(exp=-0.55, contrast=0.55, hi=0.70, sat=0.85, blue=1.4, navy=1.7, warm=1.0, matte=0.4, white=0.85, vig=0.40)),
    "detailing": dict(src="stock/px-9784193", out="services/detailing", grade=dict(exp=-0.05, contrast=0.42, hi=0.45, sat=0.88, red=0.80, blue=1.3, navy=1.5, warm=1.0, matte=0.35, vig=0.30)),
    "undercoating": dict(src="ai-src/undercoating-v2", out="services/undercoating", grade=dict(exp=-0.05, contrast=0.42, hi=0.45, sat=0.88, red=0.80, blue=1.3, navy=1.5, warm=1.0, matte=0.35, vig=0.30)),
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
        orig = Image.open(f"{ROOT}/media/{cfg.get('src', 'originals/' + n)}.jpg").convert("RGB")
        if cfg.get("box"):  # pre-crop (e.g. to cut out readable text)
            orig = orig.crop(cfg["box"])
        if cfg.get("src"):  # stock / AI sources: centre-crop to 3:2, max 1600 wide
            w, h = orig.size
            if w / h > 1.5:
                nw = int(h * 1.5); orig = orig.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
            else:
                nh = int(w / 1.5); orig = orig.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
            if orig.width > 1600:
                orig = orig.resize((1600, round(1600 / 1.5)), Image.LANCZOS)
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
