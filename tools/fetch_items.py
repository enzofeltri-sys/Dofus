"""
Extrait de DofusDB les données de butin et d'équipement de la Crypte de Kardorim et de sa région (Incarnam).
Produit src/game/data/items.gen.ts et les icônes src/assets/items/<iconId>.png (64 px).

  python3 tools/fetch_items.py

Règles (document de design §8) :
- tables de drop réelles des monstres de la Crypte ;
- butin de région : drops des monstres du monde ouvert d'Incarnam de niveau ±10 autour du donjon ;
- on ne garde que les ressources et l'équipement (pas de consommables, d'apparat, d'âmes, d'événements à 0 %).
"""
import io
import json
import os
import sys
import urllib.request

from PIL import Image

API = 'https://api.dofusdb.fr'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_TS = os.path.join(ROOT, 'src/game/data/items.gen.ts')
OUT_ICONS = os.path.join(ROOT, 'src/assets/items')

DUNGEON_LEVEL = 10
CRYPT = [4046, 4047, 4049, 4050, 4051]
# Incarnam, monde ouvert : Lac, Forêt, Champs, Pâturages, Mine, Cimetière, Route des âmes
REGION_SUBAREAS = [442, 443, 444, 445, 778, 449, 450]
# objets de départ (Panoplie du Jeune Aventurier) : toujours inclus
EXTRA_ITEMS = [2473, 2474, 2475, 2476, 2477, 2478]

# superType DofusDB → emplacement (None = ressource)
SLOT = {1: 'amulette', 2: 'arme', 3: 'anneau', 4: 'ceinture', 5: 'bottes', 7: 'bouclier', 10: 'chapeau', 11: 'cape'}
RESOURCE_SUPER = 9

# caractéristique DofusDB → champ de Stats (le jeu)
CHAR = {
    1: 'pa', 10: 'force', 11: 'vitalite', 12: 'sagesse', 13: 'chance', 14: 'agilite', 15: 'intelligence',
    16: 'dommages', 18: 'critique', 19: 'portee', 23: 'pm', 25: 'puissance', 26: 'invocations',
    27: 'esquivePA', 28: 'esquivePM', 44: 'initiative', 48: 'prospection', 49: 'soins', 50: 'renvoi',
    78: 'fuite', 79: 'tacle', 82: 'retraitPA', 83: 'retraitPM', 84: 'dommagesPoussee', 85: 'resPoussee',
    86: 'dommagesCritiques', 87: 'resCrit',
    33: 'resPct.terre', 34: 'resPct.feu', 35: 'resPct.eau', 36: 'resPct.air', 37: 'resPct.neutre',
    54: 'resFixe.terre', 55: 'resFixe.feu', 56: 'resFixe.eau', 57: 'resFixe.air', 58: 'resFixe.neutre',
    88: 'dommagesElem.terre', 89: 'dommagesElem.feu', 90: 'dommagesElem.eau', 91: 'dommagesElem.air', 92: 'dommagesElem.neutre',
    120: 'pctDistance', 121: 'resDistance', 122: 'pctArme', 123: 'pctSort', 124: 'resMelee', 125: 'pctMelee',
}

_cache: dict = {}


def get(path):
    if path in _cache:
        return _cache[path]
    with urllib.request.urlopen(API + path, timeout=30) as r:
        data = json.load(r)
    _cache[path] = data
    return data


_effects: dict = {}


def effect(eid):
    if eid not in _effects:
        _effects[eid] = get(f'/effects/{eid}')
    return _effects[eid]


def stat_lines(effects):
    """Lignes d'effets → [(stat, min, max)] ; les malus deviennent négatifs."""
    out = []
    for e in effects:
        ef = effect(e['effectId'])
        stat = CHAR.get(ef.get('characteristic'))
        if not stat:
            continue
        lo, hi = e.get('from', 0), e.get('to', 0) or e.get('from', 0)
        sign = -1 if ef.get('bonusType') == -1 else 1
        a, b = sorted((sign * lo, sign * hi))
        out.append((stat, a, b))
    return out


def avg_pct(drop):
    vals = [drop.get(f'percentDropForGrade{g}', 0) or 0 for g in range(1, 6)]
    return sum(vals) / len(vals)


items: dict = {}
sets: dict = {}


def add_item(iid):
    if iid in items:
        return items[iid] is not None
    d = get(f'/items/{iid}')
    sup = d['type'].get('superTypeId')
    if sup != RESOURCE_SUPER and sup not in SLOT:
        items[iid] = None
        return False
    it = {
        'id': iid, 'name': d['name']['fr'], 'level': d['level'], 'type': d['type']['name']['fr'],
        'slot': SLOT.get(sup), 'icon': d['iconId'], 'set': d.get('itemSetId') if (d.get('itemSetId') or -1) > 0 else None,
        'effects': stat_lines(d.get('effects', [])) if sup in SLOT else [],
    }
    items[iid] = it
    if it['set'] and it['set'] not in sets:
        s = get(f"/item-sets/{it['set']}")
        ids = [i if isinstance(i, int) else i['id'] for i in s['items']]
        sets[it['set']] = {'id': it['set'], 'name': s['name']['fr'], 'items': ids,
                           'bonus': [[(st, a) for st, a, _ in stat_lines(b)] for b in s['effects']]}
    return True


def drop_table(mon):
    out = []
    for dr in mon.get('drops', []):
        p = avg_pct(dr)
        if p <= 0 or not add_item(dr['objectId']):
            continue
        out.append((dr['objectId'], round(p, 4)))
    return out


# 1) Crypte
dungeon = {}
for mid in CRYPT:
    dungeon[mid] = drop_table(get(f'/monsters/{mid}'))

# 2) Région : monstres du monde ouvert d'Incarnam (hors Crypte), niveau ±10
region = []
seen = set()
for sa in REGION_SUBAREAS:
    res = get(f'/monsters?subareas={sa}&$limit=50')
    for m in res['data']:
        if m['id'] in CRYPT or m['id'] in seen or m.get('isBoss'):
            continue
        seen.add(m['id'])
        lv = m['grades'][0]['level']
        if abs(lv - DUNGEON_LEVEL) > 10:
            continue
        for iid, p in drop_table(m):
            region.append((iid, p, m['name']['fr']))

for iid in EXTRA_ITEMS:
    add_item(iid)

# les objets des panoplies rencontrées (pour afficher la panoplie complète)
for s in list(sets.values()):
    for iid in s['items']:
        add_item(iid)

# 3) Icônes
os.makedirs(OUT_ICONS, exist_ok=True)
for it in items.values():
    if not it:
        continue
    path = os.path.join(OUT_ICONS, f"{it['icon']}.png")
    if os.path.exists(path):
        continue
    with urllib.request.urlopen(f"{API}/img/items/{it['icon']}.png", timeout=30) as r:
        im = Image.open(io.BytesIO(r.read())).convert('RGBA')
    im.thumbnail((64, 64), Image.LANCZOS)
    im.save(path, optimize=True)

# 4) TypeScript
def ts_stats(lines):
    return '[' + ', '.join(f"['{s}', {a}, {b}]" for s, a, b in lines) + ']'


kept = {k: v for k, v in items.items() if v}
out = ['// Généré par tools/fetch_items.py depuis DofusDB — ne pas modifier à la main.',
       "import type { ItemData, ItemSetData } from './items';", '',
       'export const ITEM_DATA: Record<number, ItemData> = {']
for it in sorted(kept.values(), key=lambda x: (x['slot'] is None, x['level'], x['id'])):
    slot = f"'{it['slot']}'" if it['slot'] else 'null'
    st = it['set'] if it['set'] else 'null'
    out.append(f"  {it['id']}: {{ id: {it['id']}, name: {json.dumps(it['name'], ensure_ascii=False)}, level: {it['level']}, "
               f"type: {json.dumps(it['type'], ensure_ascii=False)}, slot: {slot}, icon: {it['icon']}, set: {st}, effects: {ts_stats(it['effects'])} }},")
out.append('};')
out.append('')
out.append('export const SET_DATA: Record<number, ItemSetData> = {')
for s in sets.values():
    bonus = '[' + ', '.join('[' + ', '.join(f"['{st}', {a}]" for st, a in b) + ']' for b in s['bonus']) + ']'
    out.append(f"  {s['id']}: {{ id: {s['id']}, name: {json.dumps(s['name'], ensure_ascii=False)}, items: {s['items']}, bonus: {bonus} }},")
out.append('};')
out.append('')
out.append('/** Tables de drop réelles des monstres de la Crypte, par identifiant DofusDB (% moyen sur les grades). */')
out.append('export const DUNGEON_DROPS: Record<number, [number, number][]> = {')
for k, v in dungeon.items():
    out.append(f"  {k}: {json.dumps(v)},")
out.append('};')
out.append('')
out.append('/** Butin de la région Incarnam : drops des monstres du monde ouvert de niveau ±10 (objet, %, monstre). */')
out.append('export const REGION_DROPS: [number, number, string][] = [')
for iid, p, name in region:
    out.append(f"  [{iid}, {p}, {json.dumps(name, ensure_ascii=False)}],")
out.append('];')
open(OUT_TS, 'w').write('\n'.join(out) + '\n')

unknown = sorted({e for e, v in _effects.items() if CHAR.get(v.get('characteristic')) is None})
print(f'{len(kept)} objets, {len(sets)} panoplies, {len(region)} lignes de butin de région', file=sys.stderr)
if unknown:
    print('effets ignorés :', unknown, file=sys.stderr)
