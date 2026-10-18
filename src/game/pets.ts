import type { Inventory } from './inventory';

/**
 * Familiers et Dofus (validés par Enzo).
 * Familiers : vrais bonus maximaux (DofusDB) ; rattachés aux zones selon leurs monstres (choix : dans Dofus, ils viennent de la boutique, d'œufs ou de quêtes).
 * Un familier commence à 20 % de son bonus et grandit en mangeant des Super Croquettes (vraie nourriture de Dofus), qui tombent sur tous les monstres
 * — pas les ressources de fabrication (demandé par Enzo).
 */
export const PET_START = 20;
/** Super Croquette (DofusDB 20040, « Nourriture pour familier »). */
export const PET_FOOD = 20040;
/** Chaque croquette : +4 % → 20 repas de 20 % à 100 %. */
export const FOOD_STEP = 4;

/** Familiers de chaque zone (identifiant de la zone de l'arbre → objets). */
export const ZONE_PETS: Record<string, number[]> = {
  incarnam: [1711, 7523], // Chienchien, Chachatte Rousse
  astrub: [7712, 7711, 7708, 7709, 7710, 7713], // Pioutes vert, rouge, bleu, jaune, rose, violet
  bouftous: [7707], // Marcassin
  amakna: [11858, 10865], // Gwo Tofu Ventripotent, Tofoudre
  scarafeuilles: [12988, 8154], // Scarakiri, El Scarador
  squelettes: [10106, 7518], // Vampyrette, Fotome
  kwaks: [2076, 2075, 2074, 2077], // Bwaks d'Air, d'Eau, de Feu, de Terre
  wabbits: [1748], // Wabbit
};

/**
 * Dofus (demandé par Enzo : tous droppables, très très rares, comme dans Dofus Rétro). Dans Dofus ils ne tombent pas sur les monstres :
 * le boss qui lâche chacun est un choix (niveau du boss ≈ niveau du Dofus, zone et stats logiques).
 */
export const BOSS_DOFUS: Record<string, number> = {
  kardorim: 7113, // Dofawa (niveau 6, +1 Vitalité) — Incarnam
  tournesolAffame: 30356, // Jyfus (niveau 20, +20 Vitalité)
  mobEponge: 19629, // Dofus Argenté (niveau 20)
  kwakwa: 20987, // Dofus Cacao (niveau 50)
  waWabbit: 972, // Dofus Cawotte (niveau 60)
};

export const SPECIAL_CHANCE = {
  /** Familier de la zone : élite d'une carte (et coffre gardé). */
  petElite: 0.03,
  /** Familier de la zone : boss de donjon. */
  petBoss: 0.1,
  /** Super Croquette : n'importe quel monstre. */
  food: 0.03,
  /** Dofus : boss de son donjon. */
  dofus: 0.005,
};

/** Donne `n` croquettes à un familier (s'arrête à 100 %). Renvoie l'inventaire et le nombre de croquettes mangées. */
export function feedPet(inv: Inventory, uid: number, n: number): { inventory: Inventory; eaten: number } {
  const it = inv.items.find((i) => i.uid === uid);
  if (!it || it.food === undefined || n <= 0) return { inventory: inv, eaten: 0 };
  const eaten = Math.min(n, Math.ceil((100 - it.food) / FOOD_STEP));
  if (eaten <= 0) return { inventory: inv, eaten: 0 };
  const food = Math.min(100, it.food + eaten * FOOD_STEP);
  return { inventory: { ...inv, items: inv.items.map((i) => (i.uid === uid ? { ...i, food } : i)) }, eaten };
}
