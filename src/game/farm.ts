import { AREAS, zoneIdOf, type AreaDef } from './data/areas';
import { MONSTERS } from './data/monsters';
import { ARCHI_OF } from './data/monsters.astrub';
import { dayOf } from './keys';
import { rollDrops, zoneEquipPool } from './loot';
import { ZONE_PETS } from './pets';
import { addLoot, type SaveData } from './save';

/**
 * Farm (validé par Enzo) sur une carte déjà terminée :
 * - farm auto : le Sacrieur joue tout seul en boucle (pilote automatique, ×1 / ×2 / ×4), récompenses normales (dans main.ts) ;
 * - farm instantané : le butin d'une partie complète tout de suite, sans XP, limité par jour ;
 * - expédition : le Sacrieur part farmer téléphone fermé ; au retour, le butin du temps passé (plafonné), sans XP,
 *   un peu sous le rendement d'une vraie partie.
 */
export const FARM = {
  /** Farms instantanés par jour et par zone (choix d'Enzo). */
  instantPerDay: 5,
  /** Expédition : part du butin d'une vraie partie (choix d'Enzo : 10 à 20 % au plus ; avant 80 %, beaucoup trop). */
  expeditionRate: 0.2,
  /** Expédition : durée prise en compte au plus (heures). */
  expeditionCapH: 8,
  /** Durée d'une partie selon le nombre de monstres (mesurée : ~25 monstres en 1,6 à 1,9 min). */
  secondsPerKill: 4,
  speeds: [1, 2, 4] as const,
};

/** Cartes où l'on peut farmer (instantané, expédition) : les cartes terminées. */
export const canFarm = (s: Pick<SaveData, 'done'>, id: string) => !!AREAS[id] && AREAS[id].kind === 'map' && s.done.includes(id);

/** Monstres d'une partie complète gagnée sur une carte (mêmes règles que le jeu : nombre par salle, élite, archimonstres à 1 %). */
export function runKills(A: AreaDef, rnd: () => number): { id: string; elite: boolean }[] {
  const out: { id: string; elite: boolean }[] = [];
  const pick = () => {
    const id = A.pool[Math.floor(rnd() * A.pool.length)];
    const archi = ARCHI_OF[id];
    return archi && A.archis?.includes(archi) && rnd() < 0.01 ? archi : id;
  };
  for (let i = 0; i < A.rooms; i++) {
    if (A.elite && i === A.elite.room) {
      out.push({ id: A.elite.id, elite: true });
      for (let k = 0; k < A.elite.adds; k++) out.push({ id: pick(), elite: false });
      continue;
    }
    const n = Math.min(A.count.max, A.count.base + Math.floor(i * A.count.perRoom));
    for (let k = 0; k < n; k++) out.push({ id: pick(), elite: false });
  }
  return out.map((k) => ({ ...k, elite: k.elite || !!MONSTERS[k.id].archi }));
}

/** Butin d'une partie complète (sans le boss : cartes seulement), avec la Prospection du héros. */
export function runLoot(A: AreaDef, prospection: number, rnd: () => number, rate = 1): Record<string, number> {
  const loot: Record<string, number> = {};
  const zonePool = zoneEquipPool(A.id);
  const pets = ZONE_PETS[zoneIdOf(A.id) ?? ''] ?? [];
  for (const k of runKills(A, rnd)) {
    if (rate < 1 && rnd() >= rate) continue;
    const items = rollDrops({ dofusId: MONSTERS[k.id].dofusId, elite: k.elite, prospection, zonePool, food: true, pets: k.elite ? { ids: pets, from: 'elite' } : undefined }, rnd);
    for (const id of items) loot[id] = (loot[id] ?? 0) + 1;
  }
  return loot;
}

/** Durée moyenne d'une partie complète sur cette carte (s). */
export const runSeconds = (A: AreaDef) => {
  let n = 0;
  for (let i = 0; i < A.rooms; i++) n += A.elite && i === A.elite.room ? 1 + A.elite.adds : Math.min(A.count.max, A.count.base + Math.floor(i * A.count.perRoom));
  return n * FARM.secondsPerKill;
};

/** Farms instantanés restants aujourd'hui dans la zone de cette carte (5 par zone et par jour). */
export const instantLeft = (s: Pick<SaveData, 'instant'>, id: string, now = new Date()) => {
  const z = zoneIdOf(id) ?? id;
  return s.instant?.day === dayOf(now) ? Math.max(0, FARM.instantPerDay - (s.instant.used[z] ?? 0)) : FARM.instantPerDay;
};

export interface FarmResult { save: SaveData; loot: Record<string, number>; fresh: number[] }

/** Farm instantané : le butin d'une partie complète, tout de suite (pas d'XP). Null si impossible. */
export function instantFarm(s: SaveData, id: string, prospection: number, rnd: () => number, now = new Date()): FarmResult | null {
  if (!canFarm(s, id) || instantLeft(s, id, now) <= 0) return null;
  const loot = runLoot(AREAS[id], prospection, rnd);
  const z = zoneIdOf(id) ?? id, day = dayOf(now);
  const used = s.instant?.day === day ? s.instant.used : {};
  const out: SaveData = { ...s, resources: { ...s.resources }, instant: { day, used: { ...used, [z]: (used[z] ?? 0) + 1 } } };
  const fresh = addLoot(out, { xp: 0, items: loot }, rnd, 'monster');
  return { save: out, loot, fresh };
}

/** Départ en expédition (une seule à la fois). */
export function startExpedition(s: SaveData, id: string, now = Date.now()): SaveData | null {
  if (!canFarm(s, id) || s.expedition) return null;
  return { ...s, expedition: { area: id, start: now } };
}

/** Temps d'expédition compté (s), plafonné. */
export const expeditionSeconds = (e: { start: number }, now = Date.now()) => Math.max(0, Math.min(FARM.expeditionCapH * 3600, (now - e.start) / 1000));

/** Retour d'expédition : le butin du temps passé (parties complètes au rendement de l'expédition, sans XP). */
export function collectExpedition(s: SaveData, prospection: number, rnd: () => number, now = Date.now()): FarmResult | null {
  const e = s.expedition;
  if (!e || !AREAS[e.area]) return null;
  const A = AREAS[e.area];
  const runs = expeditionSeconds(e, now) / runSeconds(A);
  const loot: Record<string, number> = {};
  const whole = Math.floor(runs);
  for (let i = 0; i <= whole; i++) {
    // la dernière partie, commencée, compte au prorata
    const rate = FARM.expeditionRate * (i < whole ? 1 : runs - whole);
    if (rate <= 0) continue;
    for (const [k, n] of Object.entries(runLoot(A, prospection, rnd, rate))) loot[k] = (loot[k] ?? 0) + n;
  }
  const out: SaveData = { ...s, resources: { ...s.resources }, expedition: undefined };
  const fresh = addLoot(out, { xp: 0, items: loot }, rnd, 'monster');
  return { save: out, loot, fresh };
}
