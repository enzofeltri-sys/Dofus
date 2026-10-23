// Monstres de chaque carte / donjon (identifiants DofusDB), pour tools/gen_zone_sets.py.
// npx vite-node tools/zone_monsters.ts > <fichier>.json
import { AREAS } from '../src/game/data/areas';
import { MONSTERS } from '../src/game/data/monsters';

const out: Record<string, number[]> = {};
for (const [id, A] of Object.entries(AREAS)) {
  const ids = new Set<number>();
  for (const m of [...A.pool, A.elite?.id, A.boss?.id]) {
    const d = m ? MONSTERS[m]?.dofusId : undefined;
    if (d) ids.add(d);
  }
  out[id] = [...ids];
}
console.log(JSON.stringify(out));
