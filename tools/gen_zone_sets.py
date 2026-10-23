"""Panoplies de zone (refonte validée par Enzo) : pour chaque carte, les équipements que ses monstres lâchent vraiment
dans Dofus (tables de drop DofusDB). Le jeu n'en garde que les pièces de panoplie (src/game/loot.ts).

Usage : npx vite-node tools/zone_monsters.ts > <dossier>/zone_monsters.json
        python3 -I tools/gen_zone_sets.py <dossier>   (les fiches DofusDB sont téléchargées dans <dossier>/drops/)
"""
import json, os, sys, urllib.request

work = sys.argv[1]
areas = json.load(open(os.path.join(work, 'zone_monsters.json')))
cache = os.path.join(work, 'drops')
os.makedirs(cache, exist_ok=True)

def monster(mid):
    p = os.path.join(cache, f'{mid}.json')
    if not os.path.exists(p):
        data = urllib.request.urlopen(f'https://api.dofusdb.fr/monsters/{mid}', timeout=30).read()
        open(p, 'wb').write(data)
    return json.load(open(p))

out = {}
for area, mons in sorted(areas.items()):
    ids = set()
    for m in mons:
        for d in monster(m).get('drops') or []:
            ids.add(int(d['objectId']))
    out[area] = sorted(ids)

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lines = ['// Généré par tools/gen_zone_sets.py : objets lâchés par les monstres de chaque carte (tables de drop DofusDB).',
         '// Le jeu n\'en garde que les pièces de panoplie (refonte « une zone = ses panoplies », validée par Enzo).',
         'export const AREA_DROPS: Record<string, number[]> = {']
for area, ids in out.items():
    lines.append(f'  {json.dumps(area)}: {json.dumps(ids)},')
lines.append('};')
open(os.path.join(root, 'src/game/data/zonesets.gen.ts'), 'w').write('\n'.join(lines) + '\n')
print('cartes :', len(out))
