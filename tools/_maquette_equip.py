"""Maquette : équipement visible sur le Sacrieur (chapeau, cape, bouclier, familier), d'après les icônes officielles du jeu.
Usage : python3 -I tools/_maquette_equip.py <sacri.json (tools/gabarit_sacri.py)> <sortie.html>"""
import base64, io, json, math, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(sys.argv[1]))
P, PIV, HAND = d['parts'], d['pivots'], d['hand']


def icon(i, flip=False):
    im = Image.open(os.path.join(ROOT, f'src/assets/items/{i}.webp')).convert('RGBA')
    im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox())
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    b = io.BytesIO()
    im.save(b, 'PNG')
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode(), im.size


def img(i, cx, bottom, w, rot=0, flip=False, top=None):
    """Icône posée : centre x, bas (ou haut) à une hauteur donnée, largeur w."""
    uri, (iw, ih) = icon(i, flip)
    h = w * ih / iw
    y = bottom - h if top is None else top
    return f'<image href="{uri}" x="{cx - w / 2:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" transform="rotate({rot} {cx} {y + h / 2:.1f})"/>'


def shapes(part):
    return ''.join(f'<path d="{p}" fill="{f}" stroke="#{"".join(f"{int(int(f[i:i + 2], 16) * .45):02x}" for i in (1, 3, 5))}" stroke-width="0.5" stroke-linejoin="round"/>' for f, p, *_ in P[part])


# Repères (cadre 140 × 170) : crâne, dos, bras arrière
SKULL = (72.3, 39.6)


def hero(look, pose=None, size=300):
    pose = pose or {}
    deg = lambda r: r * 180 / math.pi
    def g(part, inner, key=None):
        px, py = PIV[part]
        return f'<g transform="rotate({deg(pose.get(key or part, 0)):.1f} {px} {py})">{inner}</g>'
    out = []
    # cape : l'icône remplace la cape du Sacrieur, accrochée aux épaules, derrière tout
    out.append(g('cape', img(look['cape'], 52, None, 62, rot=10, top=46) if look.get('cape') else shapes('cape')))
    for p in ['legB', 'legF', 'armB', 'torso']:
        out.append(g(p, shapes(p)))
    # bouclier : tenu par le bras arrière, devant le torse
    if look.get('bouclier'):
        out.append(g('armB', img(look['bouclier'], 54, 104, 30, rot=-8)))
    arm = shapes('armF')
    if 'sword' in pose:
        hx, hy = HAND
        arm += f'<g transform="rotate({deg(-pose["sword"]):.1f} {hx} {hy})"><rect x="{hx - 2}" y="{hy - 46}" width="4" height="42" rx="1.5" fill="#cfd6dc" stroke="#4a5058" stroke-width="0.8"/><rect x="{hx - 7}" y="{hy - 5}" width="14" height="3.5" fill="#7a5a2a"/></g>'
    out.append(g('armF', arm))
    head = shapes('headBare' if look.get('chapeau') else 'head')
    if look.get('chapeau'):
        head += img(look['chapeau'], SKULL[0] + 1, SKULL[1] + 3, look.get('hw', 38), rot=look.get('hr', 0))
    out.append(g('head', head))
    pet = ''
    if look.get('familier'):
        k = look['familier']
        pet = img(k, 18, 166, 34) if isinstance(k, int) else f'<g transform="translate(-4 112) scale(0.36)">{k}</g>'
    return f'<svg viewBox="-20 -6 170 180" width="{size * 170 / 180:.0f}" height="{size}" style="overflow:visible"><ellipse cx="71" cy="163" rx="26" ry="5" fill="#000" opacity=".25"/>{pet}{"".join(out)}</svg>'


def traced(kind):
    """Dessin d'un monstre redessiné (src/art/traced.gen.ts), pour un familier qui existe déjà en monstre."""
    import re
    s = open(os.path.join(ROOT, 'src/art/traced.gen.ts')).read()
    m = re.search(r'\n  ' + kind + r': (\[\[.*?\]\]),\n', s, re.S)
    sh = json.loads(m.group(1))
    return ''.join(f'<path d="{p}" fill="{f}"/>' for f, p, *_ in sh)


LOOKS = [
    ('Sans équipement (couronne)', {}),
    ('Coiffe, Bouclier du Bouftou, Cape du Tofu, familier Wabbit', {'chapeau': 16041, 'cape': 17097, 'bouclier': 82020, 'familier': traced('wabbit')}),
    ('Panoplie Kardorim, Bouclier du Craqueleur, Gwo Tofu', {'chapeau': 16471, 'cape': 17346, 'bouclier': 82023, 'familier': 18072, 'hw': 40}),
    ('Couronne et Cape du Wa Wabbit, Bouclier trophée', {'chapeau': 16021, 'cape': 17021, 'bouclier': 82049, 'hw': 34}),
    ('Chapeau du Marié', {'chapeau': 16053, 'hw': 34}),
    ('Tête nue (sous les chapeaux)', {'chapeau': None, 'bare': True}),
]
POSES = [('Marche', {'legB': .5, 'legF': -.5, 'armB': -.38, 'armF': .45, 'cape': .1, 'sword': .9}),
         ('Coup : bras levé', {'armF': -1.9, 'armB': -.45, 'sword': 2.7, 'torso': .09, 'cape': .09, 'head': .07}),
         ('Coup : frappe', {'armF': 1.55, 'armB': -.45, 'sword': 2.7, 'torso': .09, 'cape': .09, 'head': .07})]


def card(label, body):
    return f'<div class="c"><div class="b">{body}</div><div class="l">{label}</div></div>'


cards = []
for label, look in LOOKS:
    if look.get('bare'):
        cards.append(card(label, f'<svg viewBox="-20 -6 170 180" width="283" height="300">{"".join(shapes(p) for p in ["cape", "legB", "legF", "armB", "torso", "armF", "headBare"])}</svg>'))
    else:
        cards.append(card(label, hero(look)))
poses = [card(l, hero(LOOKS[1][1], p, 220)) for l, p in POSES] + [card('Taille en jeu', hero(LOOKS[2][1], {}, 110) + hero(LOOKS[1][1], {}, 110))]
html = f'''<!doctype html><meta charset="utf-8"><style>
body{{margin:0;background:#3b4a2c;font:14px system-ui;color:#f2ead8;padding:14px}}h2{{font-size:16px;margin:10px 0 6px}}
.row{{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}}.c{{background:#4d5e38;border-radius:10px;padding:8px;text-align:center;max-width:300px}}
.l{{margin-top:4px;font-size:12px;opacity:.9}}.b{{display:flex;align-items:flex-end;justify-content:center}}</style>
<h2>Équipement visible (icônes officielles posées sur le Sacrieur) — maquette</h2><div class="row">{"".join(cards)}</div>
<h2>Il bouge avec (bouclier sur le bras arrière, chapeau sur la tête, cape au dos)</h2><div class="row">{"".join(poses)}</div>'''
open(sys.argv[2], 'w').write(html)
print(sys.argv[2])
