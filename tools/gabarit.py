"""Monstres redessinés sur gabarit (décision d'Enzo du 29/10 : calque permis, jeu strictement privé ; le jeu doit rester léger).
Chaque illustration DofusDB est retournée (le monstre regarde à gauche), posée dans notre cadre 140 × 160 (pieds en 70, 152),
réduite à une vingtaine de couleurs, puis chaque zone devient une forme lisse et simplifiée : ~20 Ko par monstre au lieu
de 110-210 Ko pour un calque brut. Les formes sont ensuite réparties en morceaux animables dans src/art/traced.ts.

Usage : <python avec vtracer> tools/gabarit.py <dossier des images DofusDB g<gfx>.png> [liste.json {dessin: gfxId}]
Liste des monstres : TRACED ci-dessous (id du dessin, gfxId DofusDB, hauteur dans le cadre, couleurs), complétée par la liste
JSON (hauteur 130, 20 couleurs). Sortie : src/art/traced.gen.ts."""
import json, math, os, re, sys, tempfile
import vtracer
from PIL import Image, ImageFilter

K = 4  # travail à 4 × la résolution du cadre
TRACED = [
    ('wobot', 102, 132, 24), ('waWobot', 1006, 140, 28), ('blackWoWabbit', 1007, 124, 24), ('wobotKiafin', 1008, 140, 24),
    ('blancPaWabbit', 1009, 140, 24), ('tiwobot', 1018, 128, 24),
    ('scordionBleu', 1489, 116, 24), ('fennex', 1490, 118, 24), ('boulepique', 1491, 128, 24), ('leolhyene', 1493, 112, 24),
    ('ouroboulos', 1494, 132, 24), ('mantiscore', 1495, 140, 28),
]


def simplify(pts, eps):
    """Douglas-Peucker."""
    if len(pts) < 3:
        return pts
    (ax, ay), (bx, by) = pts[0], pts[-1]
    dx, dy = bx - ax, by - ay
    n = math.hypot(dx, dy) or 1e-9
    i, dmax = 0, 0.0
    for k in range(1, len(pts) - 1):
        px, py = pts[k]
        d = abs(dy * (px - ax) - dx * (py - ay)) / n
        if d > dmax:
            i, dmax = k, d
    if dmax <= eps:
        return [pts[0], pts[-1]]
    return simplify(pts[: i + 1], eps)[:-1] + simplify(pts[i:], eps)


def f1(v):
    return f'{v:.1f}'.rstrip('0').rstrip('.')


def gabarit(src, height, ncol, tol=0.7, speckle=K * K, flip=True):
    """Formes [couleur, chemin, cx, cy] du fond vers le dessus, en coordonnées du cadre."""
    im = Image.open(src).convert('RGBA')
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    alpha = im.getchannel('A').point(lambda v: 255 if v >= 200 else 0)  # l'ombre au sol disparaît
    x0, y0, x1, y1 = alpha.getbbox()
    im, alpha = im.crop((x0, y0, x1, y1)), alpha.crop((x0, y0, x1, y1))
    s = height / (y1 - y0)
    if (x1 - x0) * s > 136:
        s = 136 / (x1 - x0)
    w, h = round((x1 - x0) * s * K), round((y1 - y0) * s * K)
    ox, oy = 70 - (x1 - x0) * s / 2, 152 - (y1 - y0) * s  # centré, pieds en bas du cadre
    rgb = im.convert('RGB').resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(K * 0.5))
    mask = alpha.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(K * 0.6)).point(lambda v: 255 if v >= 128 else 0)
    q = rgb.quantize(colors=ncol, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB').filter(ImageFilter.ModeFilter(K * 2 + 1)).convert('RGBA')
    q.putalpha(mask)
    tmp = tempfile.mkdtemp()
    q.save(os.path.join(tmp, 'q.png'))
    vtracer.convert_image_to_svg_py(os.path.join(tmp, 'q.png'), os.path.join(tmp, 'q.svg'), colormode='color', hierarchical='stacked', mode='polygon',
                                    filter_speckle=speckle, color_precision=8, layer_difference=4, path_precision=1)
    svg = open(os.path.join(tmp, 'q.svg')).read()
    shapes = []
    for m in re.finditer(r'<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})"(?: transform="translate\(([-\d.]+),([-\d.]+)\)")?', svg):
        d, fill = m.group(1), m.group(2).lower()
        tx, ty = float(m.group(3) or 0), float(m.group(4) or 0)
        rings, allp = [], []
        for sub in re.findall(r'M[^M]+', d):
            nums = list(map(float, re.findall(r'-?\d+(?:\.\d+)?', sub)))
            pts = [((nums[i] + tx) / K + ox, (nums[i + 1] + ty) / K + oy) for i in range(0, len(nums) - 1, 2)]
            if len(pts) < 3:
                continue
            # contour fermé : coupé au point le plus éloigné du départ, puis les deux moitiés simplifiées
            j = max(range(len(pts)), key=lambda k: (pts[k][0] - pts[0][0]) ** 2 + (pts[k][1] - pts[0][1]) ** 2)
            pts = simplify(pts[: j + 1], tol)[:-1] + simplify(pts[j:] + [pts[0]], tol)[:-1]
            if len(pts) < 3:
                continue
            # contour lissé : on passe par le milieu de chaque côté, les sommets servent de points de contrôle
            mid = lambda a, b: ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
            start = mid(pts[-1], pts[0])
            seg = [f'M{f1(start[0])},{f1(start[1])}']
            for k in range(len(pts)):
                e = mid(pts[k], pts[(k + 1) % len(pts)])
                seg.append(f'Q{f1(pts[k][0])},{f1(pts[k][1])} {f1(e[0])},{f1(e[1])}')
            rings.append(''.join(seg) + 'Z')
            allp += pts
        if not rings:
            continue
        xs, ys = [p[0] for p in allp], [p[1] for p in allp]
        if (max(xs) - min(xs)) * (max(ys) - min(ys)) < 4:
            continue
        shapes.append([fill, ''.join(rings), round(sum(xs) / len(xs), 1), round(sum(ys) / len(ys), 1)])
    return shapes


if __name__ == '__main__':
    refs = sys.argv[1]
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    todo = list(TRACED)
    if len(sys.argv) > 2:
        known = {t[0] for t in todo}
        todo += [(k, g, 130, 20) for k, g in json.load(open(sys.argv[2])).items() if k not in known]
    out = {}
    for kind, gfx, height, ncol in todo:
        out[kind] = gabarit(os.path.join(refs, f'g{gfx}.png'), height, ncol, 0.8)
        print(kind, len(out[kind]), 'formes', sum(len(x[1]) for x in out[kind]) // 1024, 'Ko')
    lines = ['// Généré par tools/gabarit.py (gabarits des illustrations DofusDB, calque permis par Enzo) : ne pas modifier à la main.',
             '/** Formes de chaque monstre redessiné sur gabarit : [couleur, chemin, centre x, centre y], du fond vers le dessus (cadre 140 × 160). */',
             'export const TRACED_SHAPES: Record<string, [string, string, number, number][]> = {']
    for kind, shapes in out.items():
        lines.append(f'  {kind}: {json.dumps(shapes, separators=(",", ":"))},')
    lines.append('};')
    open(os.path.join(root, 'src/art/traced.gen.ts'), 'w').write('\n'.join(lines) + '\n')
    print('→ src/art/traced.gen.ts', os.path.getsize(os.path.join(root, 'src/art/traced.gen.ts')) // 1024, 'Ko')
