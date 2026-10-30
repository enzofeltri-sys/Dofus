"""Sacrieur redessiné sur gabarit (calque permis par Enzo, jeu strictement privé), en morceaux animés.
Référence : le rendu officiel Dofus 3 du Sacrieur (tools/comfyui/sacrieur-reference.png), retourné pour regarder à droite.
Chaque pixel est rangé dans un morceau (cape, jambes, bras, torse, tête) d'après des zones tracées à la main sur la
référence et sa couleur ; les morceaux de derrière sont prolongés sous ceux de devant (pas de trou quand un membre tourne).
Les couleurs de la référence sont celles de l'écran de création de Dofus 3 : chacune est reliée à un emplacement
(peau, cheveux, vêtements 1-4) pour que l'écran Apparence continue de marcher.

Usage : <python avec vtracer, numpy, scipy> tools/gabarit_sacri.py <src/art/sacrieur-traced.gen.ts | essai.json> [carte des morceaux.png]"""
import colorsys, json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd
from gabarit import K, trace_shapes

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = os.path.join(ROOT, 'tools/comfyui/sacrieur-reference.png')
PARTS = ['cape', 'legB', 'legF', 'armB', 'torso', 'armF', 'head']  # du fond vers l'avant
TOL = 0.5
LEVELS = [0.5, 0.66, 0.82, 1.0, 1.14]  # nuances de chaque couleur (aplats façon Dofus)
# Cadre du héros : 140 × 170, pieds en (71, 163), 160 px de haut (aigrette comprise).
FOOT, HEIGHT = (71, 163), 160
# Couleurs par défaut de l'écran de création (src/art/sacrieur-chibi.ts, SACRI_COLORS)
SLOTS = {'skin': '#E59B68', 'hair': '#F28F39', 'c1': '#7E752A', 'c2': '#852A34', 'c3': '#FA950F', 'c4': '#76422C'}

# Zones sur la référence d'origine (1024 × 1024, avant retournement)
ARM_F = [(478, 380), (503, 390), (507, 440), (503, 500), (503, 560), (501, 600), (503, 694), (410, 694), (414, 600), (426, 520), (432, 450), (446, 402)]
ARM_B = [(598, 358), (628, 368), (650, 418), (674, 468), (696, 520), (694, 600), (650, 600), (624, 562), (619, 500), (615, 450), (595, 412)]
CAPE = [(380, 530), (436, 530), (430, 600), (412, 700), (448, 700), (452, 760), (444, 845), (420, 900), (370, 900)]
NECK_Y = 356  # au-dessus : la tête
LEGS_Y = 598  # en dessous : les jambes (sauf ceinture, bras et cape)
SPLIT = [(598, 580), (700, 567), (760, 556), (840, 561), (970, 561)]  # séparation jambe avant (gauche) / arrière (droite)
# Prolongement des morceaux de derrière sous ceux de devant (rayon en pixels de la référence)
UNDER = {'cape': {'torso': 30, 'legF': 30, 'armF': 30}, 'legB': {'legF': 30, 'torso': 50}, 'legF': {'torso': 50},
         'armB': {'torso': 34}, 'torso': {'armF': 40, 'head': 28}}
# Points de rotation (référence d'origine) : épaules, hanches, cou, taille ; poing avant (tient l'arme)
PIVOTS = {'cape': (560, 560), 'legB': (604, 612), 'legF': (522, 616), 'armB': (614, 398), 'torso': (560, 580), 'armF': (478, 412), 'head': (566, 350)}
HAND = (458, 648)


def hsv(rgb):
    return colorsys.rgb_to_hsv(*[c / 255 for c in rgb])


def poly_mask(pts):
    m = Image.new('L', (1024, 1024), 0)
    ImageDraw.Draw(m).polygon(pts, fill=255)
    return np.asarray(m) > 0


def labels(a, fig):
    mx, mn = a.max(2), a.min(2)
    vv = mx / 255
    ss = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    r, g, b = [a[..., i].astype(float) for i in range(3)]
    d = np.maximum(mx - mn, 1e-6)
    hh = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    yellow = (hh > 34) & (hh < 52) & (ss > 0.55) & (vv > 0.62)  # pagne et ceinture dorés
    dark = vv < 0.43  # cape (bordeaux sombre)
    olive = (hh > 45) & (hh < 70) & (ss > 0.4) & (vv < 0.6)
    ys, xs = np.mgrid[0:1024, 0:1024]
    split = np.interp(ys, [p[0] for p in SPLIT], [p[1] for p in SPLIT])
    lab = np.full(a.shape[:2], 'torso', dtype=object)
    lab[ys >= LEGS_Y] = np.where(xs[ys >= LEGS_Y] < split[ys >= LEGS_Y], 'legF', 'legB')
    lab[yellow & (ys < 640)] = 'torso'
    arm_b = poly_mask(ARM_B) & ~yellow
    lab[arm_b] = 'armB'
    edge = (ss < 0.3) & (vv > 0.55)  # liseré clair (bord adouci de la référence)
    cape = (poly_mask(CAPE) & (dark | olive | edge)) | (olive & (ys > 560))
    arm_f = poly_mask(ARM_F) & ~dark
    lab[cape] = 'cape'
    lab[poly_mask(ARM_F) & dark & (ys > 440)] = 'cape'
    lab[arm_f] = 'armF'
    lab[ys < NECK_Y] = 'head'
    lab[~fig] = ''
    return lab


# Couleurs fixes (ne suivent pas l'écran Apparence) : peintures de guerre et gants rouges, yeux qui brillent
FIXED = {'rouge': '#D8401A', 'blanc': '#E6DCC4'}
ALLOWED = {'head': ['hair', 'skin', 'c1', 'c3', 'c4', 'rouge', 'blanc'], 'torso': ['skin', 'c3', 'c4', 'c2', 'rouge'],
           'armF': ['skin', 'rouge'], 'armB': ['skin', 'rouge', 'c3'], 'legF': ['c2', 'skin', 'c3'], 'legB': ['c2', 'skin', 'c3'],
           'cape': ['c2', 'c1']}


def classify(a, fig, L):
    """Emplacement de chaque pixel : la couleur de base (ou une de ses nuances, base × t) la plus proche parmi celles permises dans ce morceau."""
    bases = {**SLOTS, **FIXED}
    px = a.astype(float)
    best = np.full(a.shape[:2], '', dtype=object)
    err = np.full(a.shape[:2], np.inf)
    tt = np.ones(a.shape[:2])
    for k, hx in bases.items():
        B = np.array([int(hx[i:i + 2], 16) for i in (1, 3, 5)], float)
        t = np.clip((px @ B) / (B @ B), 0.3, 1.3)
        e = np.linalg.norm(px - t[..., None] * B, axis=2)
        ok = np.isin(L, [p for p, al in ALLOWED.items() if k in al])
        upd = ok & (e < err)
        best[upd], err[upd], tt[upd] = k, e[upd], t[upd]
    best[~fig] = ''
    return best, tt


def main():
    out = sys.argv[1]
    a = np.asarray(Image.open(REF).convert('RGB')).astype(int)
    bg = a.min(2) > 232
    lab, _ = nd.label(bg)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fig = nd.binary_opening(~np.isin(lab, list(border)), iterations=1)
    L = labels(a, fig)
    # halo clair du contour (fond blanc de la référence) : remplacé par la couleur voisine
    dbg = nd.distance_transform_edt(fig)
    mx, mn = a.max(2), a.min(2)
    halo = fig & (dbg <= 4) & ((mx - mn) / np.maximum(mx, 1) < 0.32) & (mx > 150)
    _, (iy, ix) = nd.distance_transform_edt(halo | ~fig, return_indices=True)
    a = a.copy()
    a[halo] = a[iy[halo], ix[halo]]
    slot_px, shade = classify(a, fig, L)
    if len(sys.argv) > 2:  # carte des morceaux, pour vérifier la découpe
        cols = {'cape': (90, 20, 20), 'legB': (40, 90, 200), 'legF': (60, 180, 240), 'armB': (40, 160, 60), 'torso': (230, 180, 60), 'armF': (120, 230, 120), 'head': (220, 80, 200)}
        vis = np.full((1024, 1024, 3), 255, np.uint8)
        for k, c in cols.items():
            vis[L == k] = c
        Image.fromarray(vis).crop((330, 40, 720, 980)).save(sys.argv[2])

    # placement : retourné, pieds en FOOT, HEIGHT de haut
    ys = np.nonzero(fig.any(1))[0]
    s = HEIGHT / (ys[-1] - ys[0] + 1)
    fx = lambda x: 1023 - x
    feet_x = fx((490 + 620) / 2)
    ox, oy = FOOT[0] - feet_x * s, FOOT[1] - (ys[-1] + 1) * s
    W = round(1024 * s * K)
    to_frame = lambda p: [round(fx(p[0]) * s + ox, 1), round(p[1] * s + oy, 1)]

    # aplats : chaque pixel = couleur de son emplacement × une des nuances LEVELS (ombre → lumière)
    bases = {**SLOTS, **FIXED}
    lv = np.array(LEVELS)
    tq = lv[np.abs(shade[..., None] - lv).argmin(2)]
    # couleur de chaque (emplacement, nuance) : la moyenne des pixels de la référence qui y sont rangés
    # (garde les vraies teintes, ex. le pagne doré ; l'écran Apparence décale ensuite chaque nuance avec sa base)
    cel = np.zeros((1024, 1024, 3))
    palette = {}
    for k, hx in bases.items():
        base = np.array([int(hx[i:i + 2], 16) for i in (1, 3, 5)], float)
        for t in LEVELS:
            m = (slot_px == k) & (tq == t)
            if m.sum() < 30:
                continue
            c = np.clip(np.round(a[m].mean(0) if k in SLOTS else t * base), 0, 255).astype(int)
            cel[m] = c
            palette['#%02x%02x%02x' % tuple(c)] = k if k in SLOTS else None
    cel = np.clip(cel, 0, 255).round()
    # hors du personnage : la couleur voisine (le lissage ne mélange jamais le fond)
    _, (iy, ix) = nd.distance_transform_edt(~fig, return_indices=True)
    cel = cel[iy, ix].astype(np.uint8)
    pcols = np.array([[int(c[i:i + 2], 16) for i in (1, 3, 5)] for c in palette])
    pnames = list(palette)
    nearest = lambda f: pnames[np.argmin(((pcols - [int(f[i:i + 2], 16) for i in (1, 3, 5)]) ** 2).sum(1))]
    celimg = Image.fromarray(cel).filter(ImageFilter.ModeFilter(3)).transpose(Image.FLIP_LEFT_RIGHT)
    qall = celimg.resize((W, W), Image.NEAREST).filter(ImageFilter.ModeFilter(3))

    parts = {}
    for p in PARTS:
        m = L == p
        if p in UNDER:
            dist, (iy, ix) = nd.distance_transform_edt(~m, return_indices=True)
            ext = np.zeros_like(m)
            for q, r in UNDER[p].items():
                ext |= (L == q) & (dist <= r)
            m = m | ext
            # sous le morceau de devant : la couleur la plus proche du morceau prolongé
            src = np.asarray(celimg.transpose(Image.FLIP_LEFT_RIGHT))
            under = np.where(ext[..., None], src[iy, ix], src)
            part_rgb = Image.fromarray(under.astype(np.uint8)).transpose(Image.FLIP_LEFT_RIGHT).resize((W, W), Image.NEAREST).filter(ImageFilter.ModeFilter(3))
        else:
            part_rgb = qall
        mask = Image.fromarray((m * 255).astype(np.uint8)).transpose(Image.FLIP_LEFT_RIGHT).resize((W, W), Image.LANCZOS) \
            .filter(ImageFilter.GaussianBlur(K * 0.4)).point(lambda v: 255 if v >= 128 else 0)
        q = part_rgb.convert('RGBA')
        q.putalpha(mask)
        if os.environ.get('DEBUG'):
            q.save(os.path.join(os.environ['DEBUG'], f'q_{p}.png'))
        parts[p] = [[nearest(f), *rest] for f, *rest in trace_shapes(q, ox, oy, TOL)]
        print(p, len(parts[p]), 'formes', sum(len(x[1]) for x in parts[p]) // 1024, 'Ko')
    used = {f for sh in parts.values() for f, *_ in sh}
    slots = {c: palette[c] for c in sorted(used)}
    for k in sorted(slots):
        print(k, slots[k])
    data = {'parts': parts, 'pivots': {k: to_frame(v) for k, v in PIVOTS.items()}, 'hand': to_frame(HAND), 'slots': slots}
    if out.endswith('.ts'):
        open(out, 'w').write('\n'.join([
            '// Généré par tools/gabarit_sacri.py (gabarit du rendu officiel Dofus 3 du Sacrieur, calque permis par Enzo) : ne pas modifier à la main.',
            '/** Morceaux du Sacrieur (du fond vers l\'avant) : formes [couleur, chemin, centre x, centre y] dans le cadre 140 × 170. */',
            f'export const SACRI_SHAPES: Record<string, [string, string, number, number][]> = {json.dumps(parts, separators=(",", ":"))};',
            '/** Points de rotation (épaules, hanches, cou, taille) et poing qui tient l\'arme. */',
            f'export const SACRI_TRACED_PIVOTS: Record<string, [number, number]> = {json.dumps(data["pivots"])};',
            f'export const SACRI_TRACED_HAND: [number, number] = {json.dumps(data["hand"])};',
            '/** Emplacement de l\'écran Apparence de chaque couleur (null : couleur fixe, peintures rouges et yeux). */',
            f'export const SACRI_SLOTS: Record<string, string | null> = {json.dumps(slots)};', '']))
    else:
        json.dump(data, open(out, 'w'))
    print('→', out, os.path.getsize(out) // 1024, 'Ko')


if __name__ == '__main__':
    main()
