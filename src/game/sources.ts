import { isEquipment, item, statLabel } from './data/items';
import { DUNGEON_DROPS, REGION_DROPS, ZONE_EQUIP } from './data/items.gen';
import { MONSTERS } from './data/monsters';
import { RECIPES, recipeFor } from './craft';
import { DROP_MULT, ZONE_EQUIP_CHANCE } from './loot';
import { RUNE_STAT } from './forge';
import { AREAS, ZONE_TIERS, ZONES } from './data/areas';

/** Où obtenir un objet : fabrication, butin du donjon (chance réelle en jeu), butin de région. */
export interface Source {
  kind: 'craft' | 'dungeon' | 'region' | 'break' | 'zone';
  text: string;
}

/** Boss : taux réels de Dofus (document de design §8). */
const BOSS_IDS = new Set([4051]);
const monsterName = (dofusId: number) => Object.values(MONSTERS).find((m) => m.dofusId === dofusId)?.name ?? `Monstre ${dofusId}`;
/** Carte ou donjon où l'on croise ce monstre. */
const placeOf = (dofusId: number) => Object.values(AREAS).find((a) =>
  [...a.pool, a.elite?.id, a.boss?.id].some((id) => id && MONSTERS[id]?.dofusId === dofusId))?.name ?? 'Incarnam';
const pct = (v: number) => `${v >= 1 ? Math.round(v * 10) / 10 : Math.round(v * 100) / 100} %`.replace('.', ',');

export function sourcesOf(id: number): Source[] {
  const out: Source[] = [];
  const rune = RUNE_STAT.get(id);
  if (rune) out.push({ kind: 'break', text: `Brisage d’un objet avec la stat ${statLabel(rune[0])} (Atelier)` });
  const r = recipeFor(id);
  if (r) out.push({ kind: 'craft', text: `Fabrication · Artisan niveau ${r.level}` });
  for (const [mid, drops] of Object.entries(DUNGEON_DROPS)) {
    const d = drops.find(([i]) => i === id);
    if (!d) continue;
    const boss = BOSS_IDS.has(Number(mid));
    const chance = d[1] * (boss ? (isEquipment(id) ? DROP_MULT.bossEquipment : 1) : isEquipment(id) ? DROP_MULT.equipment : DROP_MULT.resource);
    out.push({ kind: 'dungeon', text: `${monsterName(Number(mid))}${boss ? ' (boss)' : ''} · ${placeOf(Number(mid))} · ${pct(chance)}` });
  }
  if (ZONE_EQUIP.includes(id)) {
    const lv = item(id).level;
    const zones = ZONES.filter((z) => ZONE_TIERS[z.id] && lv >= ZONE_TIERS[z.id][0] && lv <= ZONE_TIERS[z.id][1]).map((z) => z.name);
    if (zones.length) out.push({ kind: 'zone', text: `Équipement de zone · ${zones.join(', ')} · ${pct(ZONE_EQUIP_CHANCE.monster * 100)} par monstre, ${pct(ZONE_EQUIP_CHANCE.boss * 100)} par boss (un objet au hasard de la zone)` });
  }
  const region = [...new Set(REGION_DROPS.filter(([i]) => i === id).map(([, , m]) => m))];
  if (region.length) out.push({ kind: 'region', text: `Butin de région (Incarnam) · ${region.join(', ')}` });
  return out;
}

/** Recettes qui utilisent cette ressource (identifiants des objets fabriqués). */
export const usedIn = (id: number): number[] => RECIPES.filter((r) => r.ingredients.some(([i]) => i === id)).map((r) => r.id);

/** Texte de recherche d'une provenance (noms des monstres, « fabrication »…). */
export const sourceText = (id: number) => sourcesOf(id).map((s) => s.text).join(' ') + (usedIn(id).length ? ' ' + usedIn(id).map((i) => item(i).name).join(' ') : '');
