"""
Generate Pica app icons — supersampled for crisp edges.
"""

from PIL import Image, ImageDraw

INK   = (26,  24,  20,  255)
PAPER = (244, 240, 232, 255)
CORAL = (200,  70,  40,  255)
TRANS = (0, 0, 0, 0)

SCALE = 4  # supersample factor

def draw_icon(canvas_size, bg, ring_r_frac, ring_w_frac, dot_r_frac, transparent_bg=False):
    s = canvas_size * SCALE
    img = Image.new("RGBA", (s, s), TRANS if transparent_bg else bg)
    draw = ImageDraw.Draw(img)
    cx = cy = s // 2

    if transparent_bg:
        # Draw background circle (safe zone)
        bg_r = int(s * 0.50)
        draw.ellipse([cx-bg_r, cy-bg_r, cx+bg_r, cy+bg_r], fill=bg)

    ring_r = int(s * ring_r_frac)
    ring_w = max(4, int(s * ring_w_frac))
    dot_r  = int(s * dot_r_frac)

    # Ring: outer filled circle then inner cutout
    draw.ellipse([cx-ring_r, cy-ring_r, cx+ring_r, cy+ring_r], fill=PAPER)
    inner_r = ring_r - ring_w
    if not transparent_bg:
        draw.ellipse([cx-inner_r, cy-inner_r, cx+inner_r, cy+inner_r], fill=bg)
    else:
        draw.ellipse([cx-inner_r, cy-inner_r, cx+inner_r, cy+inner_r], fill=bg)

    # Coral center dot
    draw.ellipse([cx-dot_r, cy-dot_r, cx+dot_r, cy+dot_r], fill=CORAL)

    # Accent dot — top-right, on the ring
    accent_r = max(3, s // 90)
    ax = cx + int(ring_r * 0.72)
    ay = cy - int(ring_r * 0.72)
    draw.ellipse([ax-accent_r, ay-accent_r, ax+accent_r, ay+accent_r], fill=CORAL)

    # Downsample
    out = img.resize((canvas_size, canvas_size), Image.LANCZOS)
    return out

import os
base = os.path.dirname(os.path.abspath(__file__))

# icon.png — 1024x1024, full bleed dark bg
icon = draw_icon(1024, INK, 0.30, 0.018, 0.055, transparent_bg=False)
icon.save(os.path.join(base, "icon.png"))
print("icon.png written")

# adaptive-icon.png — 1024x1024, transparent bg (Android adds its own bg)
adp = draw_icon(1024, INK, 0.28, 0.018, 0.052, transparent_bg=True)
adp.save(os.path.join(base, "adaptive-icon.png"))
print("adaptive-icon.png written")

# splash-icon.png — 512x512 (Expo places this on splash bg)
splash = draw_icon(512, INK, 0.30, 0.018, 0.055, transparent_bg=False)
splash.save(os.path.join(base, "splash-icon.png"))
print("splash-icon.png written")

# favicon.png — 48x48
fav = draw_icon(48, INK, 0.30, 0.020, 0.055, transparent_bg=False)
fav.save(os.path.join(base, "favicon.png"))
print("favicon.png written")

print("Done.")
