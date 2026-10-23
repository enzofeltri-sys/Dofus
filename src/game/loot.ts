import { isEquipment, isSpecial, ITEMS, SETS } from './data/items';
import { DUNGEON_DROPS, REGION_DROPS } from './data/items.gen';
import { AREA_DROPS } from './data/zonesets.gen';
import { PET_FOOD, SPECIAL_CHANCE } from './pets';

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

/**
 * Équipement de zone (refonte validée par Enzo : « une zone = ses panoplies ») : chaque monstre peut lâcher une pièce
 * des panoplies que les monstres de la carte lâchent vraiment dans Dofus. Tout le reste de l'équipement se fabrique.
 */
export const ZONE_EQUIP_CHANCE = {
  /** 5 % par monstre, 20 % par élite (×4), 50 % par boss (choix d'Enzo). */
  monster: 0.05,
  /** Élite, archimonstre (et coffre gardé) : ×4. */
  elite: 4,
  boss: 0.5,
};

/** Cartes dont les monstres ne lâchent aucune panoplie dans Dofus : panoplie choisie avec Enzo. */
export const EXTRA_ZONE_SETS: Record<string, number[]> = {
  /** Souterrains d'Astrub (Araknes) : Panoplie Arakne (niveau 11). */
  souterrains: [22],
};

const poolCache = new Map<string, number[]>();
/** Pièces de panoplie qui peuvent tomber sur cette carte (vraies tables de drop de ses monstres). */
export function zoneEquipPool(areaId: string): number[] {
  let p = poolCache.get(areaId);
  if (!p) {
    const extra = (EXTRA_ZONE_SETS[areaId] ?? []).flatMap((s) => SETS[s]?.items ?? []);
    p = [...new Set([...(AREA_DROPS[areaId] ?? []), ...extra])]
      .filter((id) => ITEMS[id]?.set && isEquipment(id) && !isSpecial(id))
      .sort((a, b) => a - b);
    poolCache.set(areaId, p);
  }
  return p;
}

/** Équipement qui tombe sur les monstres : seulement les pièces de panoplie de zone (le reste se fabrique). */
export const isDroppable = (id: number, zonePool?: number[]) => !isEquipment(id) || isSpecial(id) || !!zonePool?.includes(id);

export interface DropContext {
  /** Identifiant DofusDB du monstre (table de drop). */
  dofusId: number;
  boss?: boolean;
  elite?: boolean;
  /** Prospection (100 = ×1). */
  prospection: number;
  /** Équipement de zone de la carte (`zoneEquipPool`). */
  zonePool?: number[];
  /** Familiers de la zone : tirés sur l'élite d'une carte (3 %) ou le boss (10 %). */
  pets?: { ids: number[]; from: 'elite' | 'boss' };
  /** Dofus de ce boss (très rare). */
  dofus?: number;
  /** Super Croquettes (tous les monstres de la partie). */
  food?: boolean;
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
    if (!isDroppable(id, ctx.zonePool)) continue;
    // boss : taux réels (équipement : moitié) ; autres monstres : multiplicateurs de rythme
    if (rnd() < Math.min(1, dropChance(id, pct, ctx) * pp)) out.push(id);
  }
  if (!ctx.boss && REGION_DROPS.length && rnd() < Math.min(1, REGION_CHANCE * pp * (ctx.elite ? DROP_MULT.elite : 1))) {
    const w = (id: number, pct: number) => pct * (isEquipment(id) ? REGION_EQUIP_WEIGHT : 1);
    const table = REGION_DROPS.filter(([id]) => isDroppable(id, ctx.zonePool));
    const total = table.reduce((a, [id, pct]) => a + w(id, pct), 0);
    let r = rnd() * total;
    for (const [id, pct] of table) {
      r -= w(id, pct);
      if (r <= 0) {
        out.push(id);
        break;
      }
    }
  }
  if (ctx.food && rnd() < Math.min(1, SPECIAL_CHANCE.food * pp)) out.push(PET_FOOD);
  if (ctx.pets?.ids.length && rnd() < Math.min(1, (ctx.pets.from === 'boss' ? SPECIAL_CHANCE.petBoss : SPECIAL_CHANCE.petElite) * pp)) out.push(ctx.pets.ids[Math.floor(rnd() * ctx.pets.ids.length)]);
  if (ctx.dofus && rnd() < Math.min(1, SPECIAL_CHANCE.dofus * pp)) out.push(ctx.dofus);
  const zp = ctx.zonePool;
  if (zp?.length) {
    const c = ctx.boss ? ZONE_EQUIP_CHANCE.boss : ZONE_EQUIP_CHANCE.monster * (ctx.elite ? ZONE_EQUIP_CHANCE.elite : 1);
    if (rnd() < Math.min(1, c * pp)) out.push(zp[Math.floor(rnd() * zp.length)]);
  }
  return out;
}
