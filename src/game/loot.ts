import { isEquipment } from './data/items';
import { DUNGEON_DROPS, REGION_DROPS } from './data/items.gen';

/**
 * Butin (document de design §8.1) : tables réelles de DofusDB, avec des multiplicateurs pour le rythme d'une partie
 * (≈ 73 monstres par Crypte, contre des groupes de 4 à 8 dans Dofus).
 */
export const DROP_MULT = {
  /** Ressources des monstres. */
  resource: 0.15,
  /** Équipement des monstres. */
  equipment: 0.05,
  /** Mini-boss : chances ×3. */
  elite: 3,
};
/** Butin de région : chance par monstre tué de lâcher un objet des monstres de la région (Incarnam). */
export const REGION_CHANCE = 0.1;
/** Dans le butin de région, l'équipement pèse 4 fois moins que les ressources. */
export const REGION_EQUIP_WEIGHT = 0.25;

export interface DropContext {
  /** Identifiant DofusDB du monstre (table de drop). */
  dofusId: number;
  boss?: boolean;
  elite?: boolean;
  /** Prospection (100 = ×1). */
  prospection: number;
}

/** Objets lâchés par un monstre vaincu (identifiants, avec répétitions possibles). */
export function rollDrops(ctx: DropContext, rnd: () => number): number[] {
  const out: number[] = [];
  const pp = Math.max(0, ctx.prospection) / 100;
  for (const [id, pct] of DUNGEON_DROPS[ctx.dofusId] ?? []) {
    // boss : taux réels ; autres monstres : multiplicateurs de rythme
    const mult = ctx.boss ? 1 : (isEquipment(id) ? DROP_MULT.equipment : DROP_MULT.resource) * (ctx.elite ? DROP_MULT.elite : 1);
    if (rnd() < Math.min(1, (pct / 100) * mult * pp)) out.push(id);
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
  return out;
}
