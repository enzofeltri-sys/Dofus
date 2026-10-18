"""Génère src/game/data/grimoire.gen.ts : les 22 sorts du Sacrieur (DofusDB, Dofus 3).
Usage : python3 -I tools/gen_grimoire.py <dossier des JSON DofusDB> (sorts s<id>.json et niveaux l<id>.json)."""
import json, os, re, sys
D = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src/game/data/grimoire.gen.ts')
ORDER = [12725, 12748, 12734, 12728, 12735, 12737, 12744, 12746, 12733, 12736, 12745, 12756, 12761, 12738, 12757, 12753, 12739, 12732, 12750, 12759, 12743, 12741]
# sorts présents dans le jeu (identifiant interne)
IDS = {12725: 'supplice', 12748: 'hemorragie', 12734: 'absorption', 12728: 'stase', 12735: 'attirance', 12737: 'mutilation',
       12744: 'epeeVorace', 12746: 'ravage', 12733: 'assaut', 12736: 'transposition',
       12745: 'condensation', 12756: 'hostilite', 12761: 'couronne', 12738: 'transfusion', 12757: 'dissolution', 12753: 'desolation'}
rows = []
for sp in ORDER:
    s = json.load(open(f'{D}/s{sp}.json'))
    l = json.load(open(f"{D}/l{s['spellLevels'][0]}.json"))
    rows.append({'dofusId': sp, 'name': s['name']['fr'], 'level': l.get('minPlayerLevel') or 1, 'pa': l['apCost'],
                 'text': re.sub(r'\s+', ' ', s['description']['fr']).strip(), 'id': IDS.get(sp)})
rows.sort(key=lambda r: (r['level'], ORDER.index(r['dofusId'])))
out = ['// Généré par tools/gen_grimoire.py depuis DofusDB (sorts du Sacrieur, Dofus 3) : ne pas modifier à la main.',
       "import type { SpellId } from './spells';", '',
       '/** Les 22 sorts du Sacrieur : niveau de déblocage réel, coût en PA et description DofusDB ; `id` = sort présent dans le jeu. */',
       'export const GRIMOIRE: { dofusId: number; name: string; level: number; pa: number; text: string; id: SpellId | null }[] = [']
for r in rows:
    out.append(f"  {{ dofusId: {r['dofusId']}, name: {json.dumps(r['name'], ensure_ascii=False)}, level: {r['level']}, pa: {r['pa']}, text: {json.dumps(r['text'], ensure_ascii=False)}, id: {json.dumps(r['id']) if r['id'] else 'null'} }},")
out.append('];')
open(OUT, 'w').write('\n'.join(out) + '\n')
print(len(rows), 'sorts →', OUT)
