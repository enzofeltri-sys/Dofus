import { isEquipment, ITEMS } from './data/items';
import { DUNGEON_DROPS, REGION_DROPS, ZONE_EQUIP } from './data/items.gen';
import { zoneEquipRange } from './data/areas';

/**
 * Butin (document de design §8.1) : tables réelles de DofusDB, avec des multiplicateurs pour le rythme d'une partie
 * (≈ 73 monstres par Crypte, contre des groupes de 4 à 8 dans Dofus).
 */
export const DROP_MULT = {
  /** Ressources des monstres. */
  resource: 0.15,
  /** Équipement des monstres (×0,05 → ×0,02 : « le drop d'objets est trop simple », Enzo). */
  equipment: 0.02,
  /** Équipement du boss : moitié du taux réel (la fabrication reste la voie normale). */
  bossEquipment: 0.5,
  /** Mini-boss : chances ×3. */
  elite: 3,
};
/** Butin de région : chance par monstre tué de lâcher un objet des monstres de la région (Incarnam). */
export const REGION_CHANCE = 0.1;
/** Dans le butin de région, l'équipement pèse 10 fois moins que les ressources. */
export const REGION_EQUIP_WEIGHT = 0.1;

/** Équipement de zone (validé par Enzo) : chance par monstre tué de lâcher un équipement de la tranche de la zone. */
export const ZONE_EQUIP_CHANCE = {
  monster: 0.01,
  /** Élite, archimonstre (et coffre gardé) : ×3. */
  elite: 3,
  boss: 0.5,
};

const poolCache = new Map<string, number[]>();
/** Équipements qui peuvent tomber sur cette carte (vide si la carte n'est dans aucune zone). */
export function zoneEquipPool(areaId: string): number[] {
  let p = poolCache.get(areaId);
  if (!p) {
    const r = zoneEquipRange(areaId);
    p = r ? ZONE_EQUIP.filter((id) => ITEMS[id] && ITEMS[id].level >= r.lo && ITEMS[id].level <= r.hi) : [];
    poolCache.set(areaId, p);
  }
  return p;
}

export interface DropContext {
  /** Identifiant DofusDB du monstre (table de drop). */
  dofusId: number;
  boss?: boolean;
  elite?: boolean;
  /** Prospection (100 = ×1). */
  prospection: number;
  /** Équipement de zone de la carte (`zoneEquipPool`). */
  zonePool?: number[];
}

/** Chance (0-1) qu'un objet de la table tombe, avec les multiplicateurs du jeu (prospection 100). */
export function dropChance(id: number, pct: number, ctx: { boss?: boolean; elite?: boolean }): number {
  const mult = ctx.boss
    ? (isEquipment(id) ? DROP_MULT.bossEquipment : 1)
    : (isEquipment(id) ? DROP_MULT.equipment : DROP_MULT.resource) * (ctx.elite ? DROP_MULT.elite : 1);
  return Math.min(1, (pct / 100) * mult);
}

/** Objets lâchés par un monstre vaincu (identifiants, avec répétitions possibles). */
export function rollDrops(ctx: DropContext, rnd: () => number): number[] {
  const out: number[] = [];
  const pp = Math.max(0, ctx.prospection) / 100;
  for (const [id, pct] of DUNGEON_DROPS[ctx.dofusId] ?? []) {
    // boss : taux réels (équipement : moitié) ; autres monstres : multiplicateurs de rythme
    if (rnd() < Math.min(1, dropChance(id, pct, ctx) * pp)) out.push(id);
  }
  if (!ctx.boss && REGION_DROPS.length && rnd() < Math.min(1, REGION_CHANCE * pp * (ctx.elite ? DROP_MULT.elite : 1))) {
    const w = (id: number, pct: number) => pct * (isEquipment(id) ? REGION_EQUIP_WEIGHT : 1);
    const total = REGION_DROPS.reduce((a, [id, pct]) => a + w(id, pct), 0);
    let r = rnd() * total;
    for (const [id, pct] of REGION_DROPS) {
      r -= w(id, pct);
      if (r <= 0) {
        out.push(id);
        break;
      }
    }
  }
  const zp = ctx.zonePool;
  if (zp?.length) {
    const c = ctx.boss ? ZONE_EQUIP_CHANCE.boss : ZONE_EQUIP_CHANCE.monster * (ctx.elite ? ZONE_EQUIP_CHANCE.elite : 1);
    if (rnd() < Math.min(1, c * pp)) out.push(zp[Math.floor(rnd() * zp.length)]);
  }
  return out;
}
