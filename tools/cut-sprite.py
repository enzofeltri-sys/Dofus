"""Découpe une image de personnage (fond transparent) en morceaux articulés pour le Rig.

python3 tools/cut-sprite.py <image.png> <dossier_sortie>
Chaque morceau est enregistré sur la toile entière (mêmes coordonnées partout), réduit
à OUT_H pixels de haut. Les polygones sont en coordonnées de l'image source.
"""
import json, sys
from PIL import Image, ImageDraw, ImageFilter

OUT_H = 455  # ≈ 2,6 × la hauteur logique (175) : net sur téléphone

# Sacrieur ComfyUI v2 (341 × 901), tourné vers la droite.
PARTS = {
    'armB': [(96, 335), (152, 330), (160, 400), (162, 470), (158, 635), (66, 635), (62, 470), (84, 400)],
    'armF': [(266, 328), (306, 336), (334, 420), (340, 540), (298, 545), (284, 470), (268, 400)],
    'legF': [(98, 640), (214, 640), (214, 901), (98, 901)],
    'legB': [(214, 640), (341, 640), (341, 840), (214, 840)],
    'head': [(0, 0), (341, 0), (341, 300), (290, 318), (150, 318), (0, 300)],
}
PIVOTS = {'legB': (262, 640), 'legF': (160, 640), 'armB': (126, 350), 'torso': (205, 620), 'armF': (284, 345), 'head': (205, 312)}
FOOT = (205, 870)
HAND = (318, 505)

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
# contour d'encre brune autour de la silhouette (lisibilité, comme les autres personnages)
OUTLINE = 13  # px dans l'image source (≈ 2,5 unités de jeu)
alpha = im.getchannel('A').point(lambda v: 255 if v > 40 else 0)
ring = alpha.filter(ImageFilter.MaxFilter(OUTLINE)).filter(ImageFilter.GaussianBlur(1.2))
outlined = Image.new('RGBA', im.size, (59, 36, 20, 0))
outlined.putalpha(ring)
outlined.alpha_composite(im)
im = outlined
k = OUT_H / im.size[1]
taken = Image.new('L', im.size, 0)
masks = {}
for name, poly in PARTS.items():
    m = Image.new('L', im.size, 0)
    ImageDraw.Draw(m).polygon(poly, fill=255)
    masks[name] = m
    taken.paste(255, mask=m)
masks['torso'] = Image.eval(taken, lambda v: 255 - v)
size = (round(im.size[0] * k), OUT_H)
for name, m in masks.items():
    part = Image.new('RGBA', im.size, (0, 0, 0, 0))
    part.paste(im, mask=m)
    part.resize(size, Image.LANCZOS).save(f'{out}/{name}.png', optimize=True)
meta = {
    'scale': k, 'width': size[0], 'height': size[1],
    'pivots': {n: [round(x * k, 1), round(y * k, 1)] for n, (x, y) in PIVOTS.items()},
    'foot': [round(FOOT[0] * k, 1), round(FOOT[1] * k, 1)], 'hand': [round(HAND[0] * k, 1), round(HAND[1] * k, 1)],
}
json.dump(meta, open(f'{out}/rig.json', 'w'), indent=1)
print(meta)
