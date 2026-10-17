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
# cartes de farm (étape 9) : Champs, Pâturages, Forêt et Cimetière d'Incarnam
MAP_MONSTERS = [970, 979, 980, 981, 972, 973, 971, 984, 982, 4106, 4105, 4048,
                4108, 4109, 4110, 4107, 3270, 3271, 3272, 3273,  # errants : Lac, Mine, Route des âmes
                # Astrub, branche A : Cité, Souterrains, Champs d'Astrub, Prairies, Grange (+ archimonstres, boss)
                236, 489, 490, 491, 492, 493, 2341, 2342, 2343, 2344, 2345, 2347,
                473, 474, 4817, 4818, 2312, 2356, 48, 78, 79, 4820, 2348, 2352, 2358,
                31, 34, 46, 5225, 2331, 2332, 2339, 2574, 4821, 799,
                # branche C : Pichons des Calanques et du Château Ensablé (+ archimonstres, Mob l'Éponge)
                920, 921, 922, 923, 924, 2272, 2338, 2340, 2346, 928,
                # branche B : Tainéla, Forêt d'Astrub, Carrière, Égouts, Donjon des Bouftous (+ archimonstres, Bouftou Royal)
                101, 134, 149, 148, 4822, 103, 104, 4823, 159, 5228, 5229, 5230, 5231, 255, 465, 475, 3205,
                2315, 2316, 2317, 2324, 2333, 2349, 2353, 2334, 2350, 2393, 147,
                # Amakna : Champ des Ingalsse, Donjon des Tofus (+ archimonstre, Batofu)
                98, 796, 804, 806, 4824, 808, 2355, 800, 802,
                # Plaine et Donjon des Scarafeuilles (+ archimonstres, Scarabosse Doré)
                194, 198, 240, 241, 795, 798, 2280, 2281, 2282, 2283, 797]
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

# armes : lignes de dommages (effet → élément) et de vol de vie
WEAPON_DMG = {96: 'eau', 97: 'terre', 98: 'air', 99: 'feu', 100: 'neutre'}
WEAPON_STEAL = {91: 'eau', 92: 'terre', 93: 'air', 94: 'feu', 95: 'neutre'}

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
    if it['slot'] == 'arme':
        lines = []
        for e in d.get('effects', []):
            el = WEAPON_DMG.get(e['effectId']) or WEAPON_STEAL.get(e['effectId'])
            if el:
                lo, hi = e.get('from', 0), e.get('to', 0) or e.get('from', 0)
                lines.append((el, lo, hi, e['effectId'] in WEAPON_STEAL))
        it['weapon'] = {'pa': d.get('apCost', 4), 'crit': d.get('criticalHitProbability', 0) or 0,
                        'critBonus': d.get('criticalHitBonus', 0) or 0, 'range': d.get('range', 1) or 1,
                        'minRange': d.get('minRange', 1) or 1, 'lines': lines}
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
for mid in CRYPT + MAP_MONSTERS:
    dungeon[mid] = drop_table(get(f'/monsters/{mid}'))

# 2) Région : monstres du monde ouvert d'Incarnam (hors Crypte), niveau ±10
region = []
seen = set()
for sa in REGION_SUBAREAS:
    res = get(f'/monsters?subareas={sa}&$limit=50')
    for m in res['data']:
        if m['id'] in CRYPT + MAP_MONSTERS or m['id'] in seen or m.get('isBoss'):
            continue
        seen.add(m['id'])
        lv = m['grades'][0]['level']
        if abs(lv - DUNGEON_LEVEL) > 10:
            continue
        for iid, p in drop_table(m):
            region.append((iid, p, m['name']['fr']))

for iid in EXTRA_ITEMS:
    add_item(iid)

# 2 bis) Recettes : équipements (hors armes pour l'instant) et ressources intermédiaires dont TOUS les ingrédients
# s'obtiennent dans le jeu (butin, ou eux-mêmes fabricables). On itère jusqu'à stabilité.
obtainable = {iid for iid, it in items.items() if it} | {iid for iid, _ in sum(dungeon.values(), [])} | {iid for iid, _, _ in region}
obtainable = {i for i in obtainable if items.get(i)}
recipes = {}
candidates = {}
frontier = set(obtainable)
seen_ing = set()
while frontier:
    nxt = set()
    for ing in frontier:
        if ing in seen_ing:
            continue
        seen_ing.add(ing)
        for r in get(f'/recipes?ingredientIds={ing}&$limit=50').get('data', []):
            candidates[r['resultId']] = r
    changed = True
    while changed:
        changed = False
        for rid, r in candidates.items():
            if rid in recipes:
                continue
            ings = r.get('ingredientIds', [])
            if not ings or not all(i in obtainable for i in ings):
                continue
            d = get(f'/items/{rid}')
            sup = d['type'].get('superTypeId')
            if sup != RESOURCE_SUPER and sup not in SLOT:
                continue
            if not add_item(rid):
                continue
            recipes[rid] = {'id': rid, 'level': d['level'], 'ingredients': list(zip(ings, r.get('quantities', [])))}
            obtainable.add(rid)
            nxt.add(rid)
            changed = True
    frontier = nxt
# on ne garde une ressource intermédiaire que si elle sert à une recette d'équipement gardée
def useful(rid, depth=0):
    it = items[rid]
    if it['slot']:
        return True
    return depth < 4 and any(rid in [i for i, _ in r['ingredients']] and useful(r['id'], depth + 1) for r in recipes.values())
recipes = {k: v for k, v in recipes.items() if useful(k)}

# 2 quater) Clés de donjon (étape 9c) : vraies recettes (métier Bricoleur dans Dofus, Artisan ici)
DUNGEON_KEYS = {'crypte': 8545, 'grange': 8143, 'chateau': 8437, 'cour': 1568, 'tofus': 7918, 'scaraDonjon': 8139}
dropped = {iid for lst in dungeon.values() for iid, _ in lst}
for kid in DUNGEON_KEYS.values():
    d = get(f'/items/{kid}')
    items[kid] = {'id': kid, 'name': d['name']['fr'], 'level': d['level'], 'type': d['type']['name']['fr'],
                  'slot': None, 'icon': d['iconId'], 'set': None, 'effects': []}
    r = get(f'/recipes?resultId={kid}')['data'][0]
    for ing in r['ingredientIds']:
        if ing in dropped or ing in recipes:
            add_item(ing)
    ings = list(zip(r['ingredientIds'], r.get('quantities', [])))
    # ingrédients sans source dans le jeu (pêche, récolte : Greuvette, Truite, Sauge, Orge…) → retirés de la recette (choix d'Enzo)
    ings = [(i, q) for i, q in ings if i in dropped or i in recipes]
    recipes[kid] = {'id': kid, 'level': d['level'], 'ingredients': ings}

# les objets des panoplies rencontrées (pour afficher la panoplie complète)
for s in list(sets.values()):
    for iid in s['items']:
        add_item(iid)

# 2 ter) Runes de forgemagie (brisage) : toutes celles dont la stat existe dans le jeu, en trois tailles (simple, Pa, Ra)
runes = []
for skip in range(0, 200, 50):
    page = get(f'/items?typeId=78&$limit=50&$skip={skip}')
    for d in page.get('data', []):
        effs = d.get('effects', [])
        stat = CHAR.get(effs[0].get('characteristic')) if len(effs) == 1 else None
        if not stat:
            continue
        items[d['id']] = {'id': d['id'], 'name': d['name']['fr'], 'level': d['level'], 'type': d['type']['name']['fr'],
                          'slot': None, 'icon': d['iconId'], 'set': None, 'effects': []}
        runes.append((d['id'], stat, effs[0].get('from', 1)))
    if len(page.get('data', [])) < 50:
        break

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

# 3 bis) Armes : icône en 128 px, tenue en main par le Sacrieur
OUT_WEAPONS = os.path.join(ROOT, 'src/assets/weapons')
os.makedirs(OUT_WEAPONS, exist_ok=True)
for it in items.values():
    if not it or it['slot'] != 'arme':
        continue
    path = os.path.join(OUT_WEAPONS, f"{it['icon']}.png")
    if os.path.exists(path):
        continue
    with urllib.request.urlopen(f"{API}/img/items/{it['icon']}.png", timeout=30) as r:
        im = Image.open(io.BytesIO(r.read())).convert('RGBA')
    im.thumbnail((128, 128), Image.LANCZOS)
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
    wp = ''
    if it.get('weapon'):
        w = it['weapon']
        ls = ', '.join(f"['{el}', {a}, {b}, {'true' if steal else 'false'}]" for el, a, b, steal in w['lines'])
        wp = f", weapon: {{ pa: {w['pa']}, crit: {w['crit']}, critBonus: {w['critBonus']}, range: {w['range']}, minRange: {w['minRange']}, lines: [{ls}] }}"
    out.append(f"  {it['id']}: {{ id: {it['id']}, name: {json.dumps(it['name'], ensure_ascii=False)}, level: {it['level']}, "
               f"type: {json.dumps(it['type'], ensure_ascii=False)}, slot: {slot}, icon: {it['icon']}, set: {st}, effects: {ts_stats(it['effects'])}{wp} }},")
out.append('};')
out.append('')
out.append('export const SET_DATA: Record<number, ItemSetData> = {')
for s in sets.values():
    bonus = '[' + ', '.join('[' + ', '.join(f"['{st}', {a}]" for st, a in b) + ']' for b in s['bonus']) + ']'
    out.append(f"  {s['id']}: {{ id: {s['id']}, name: {json.dumps(s['name'], ensure_ascii=False)}, items: {s['items']}, bonus: {bonus} }},")
out.append('};')
out.append('')
out.append('/** Tables de drop réelles des monstres des donjons et des cartes de farm, par identifiant DofusDB (% moyen sur les grades). */')
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

out = ['/** Recettes réelles (Dofus 3) fabricables avec ce que le jeu permet d\'obtenir : objet, niveau, ingrédients [objet, quantité]. */',
       'export const RECIPE_DATA: { id: number; level: number; ingredients: [number, number][] }[] = [']
for r in sorted(recipes.values(), key=lambda x: (x['level'], x['id'])):
    out.append(f"  {{ id: {r['id']}, level: {r['level']}, ingredients: {json.dumps([list(x) for x in r['ingredients']])} }},")
out.append('];')
out.append('')
out.append('/** Clés de donjon réelles (étape 9c) : donjon → objet clé (fabricable). */')
out.append('export const DUNGEON_KEYS: Record<string, number> = ' + json.dumps(DUNGEON_KEYS) + ';')
out.append('')
out.append('/** Runes de forgemagie réelles : rune, stat, valeur apportée. */')
out.append('export const RUNE_DATA: [number, string, number][] = [')
for rid, stat, v in sorted(runes, key=lambda x: (x[1], x[2])):
    out.append(f"  [{rid}, '{stat}', {v}],")
out.append('];')
open(OUT_TS, 'a').write('\n'.join(out) + '\n')
print(f'{len(recipes)} recettes, {len(runes)} runes', file=sys.stderr)

unknown = sorted({e for e, v in _effects.items() if CHAR.get(v.get('characteristic')) is None})
print(f'{len(kept)} objets, {len(sets)} panoplies, {len(region)} lignes de butin de région', file=sys.stderr)
if unknown:
    print('effets ignorés :', unknown, file=sys.stderr)
