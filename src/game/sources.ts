import { isEquipment, item } from './data/items';
import { DUNGEON_DROPS, REGION_DROPS } from './data/items.gen';
import { MONSTERS } from './data/monsters';
import { RECIPES, recipeFor } from './craft';
import { DROP_MULT } from './loot';

/** Où obtenir un objet : fabrication, butin du donjon (chance réelle en jeu), butin de région. */
export interface Source {
  kind: 'craft' | 'dungeon' | 'region';
  text: string;
}

/** Boss : taux réels de Dofus (document de design §8). */
const BOSS_IDS = new Set([4051]);
const monsterName = (dofusId: number) => Object.values(MONSTERS).find((m) => m.dofusId === dofusId)?.name ?? `Monstre ${dofusId}`;
const pct = (v: number) => `${v >= 1 ? Math.round(v * 10) / 10 : Math.round(v * 100) / 100} %`.replace('.', ',');

export function sourcesOf(id: number): Source[] {
  const out: Source[] = [];
  const r = recipeFor(id);
  if (r) out.push({ kind: 'craft', text: `Fabrication · Artisan niveau ${r.level}` });
  for (const [mid, drops] of Object.entries(DUNGEON_DROPS)) {
    const d = drops.find(([i]) => i === id);
    if (!d) continue;
    const boss = BOSS_IDS.has(Number(mid));
    const chance = boss ? d[1] : d[1] * (isEquipment(id) ? DROP_MULT.equipment : DROP_MULT.resource);
    out.push({ kind: 'dungeon', text: `${monsterName(Number(mid))}${boss ? ' (boss)' : ''} · Crypte de Kardorim · ${pct(chance)}` });
  }
  const region = [...new Set(REGION_DROPS.filter(([i]) => i === id).map(([, , m]) => m))];
  if (region.length) out.push({ kind: 'region', text: `Butin de région (Incarnam) · ${region.join(', ')}` });
  return out;
}

/** Recettes qui utilisent cette ressource (identifiants des objets fabriqués). */
export const usedIn = (id: number): number[] => RECIPES.filter((r) => r.ingredients.some(([i]) => i === id)).map((r) => r.id);

/** Texte de recherche d'une provenance (noms des monstres, « fabrication »…). */
export const sourceText = (id: number) => sourcesOf(id).map((s) => s.text).join(' ') + (usedIn(id).length ? ' ' + usedIn(id).map((i) => item(i).name).join(' ') : '');
