import { baseStats, maxHp, type DamageRoll, type Stats } from '../formulas';

/** Arme : attaque de base automatique, frappe tout ce qui est dans son arc. */
export interface WeaponDef {
  id: string;
  name: string;
  roll: DamageRoll;
  /** Attaques par seconde. */
  speed: number;
  /** Portée (px, sol « à plat »). */
  reach: number;
  /** Demi-angle de l'arc de frappe (radians). */
  arc: number;
  /** Instant de l'impact dans l'animation (fraction de 1 / speed). */
  impactAt: number;
}

export const EPEE_ROUILLEE: WeaponDef = {
  id: 'epeeRouillee',
  name: 'Épée rouillée',
  roll: { min: 7, max: 11, critBonus: 3, critBase: 5, element: 'neutre' },
  speed: 1.9,
  reach: 120,
  arc: 1.25,
  impactAt: 0.35,
};

/** Équipement porté : pour l'instant un bloc de stats fixe, en attendant l'inventaire (étape 6). */
export interface GearDef {
  name: string;
  force: number;
  vitalite: number;
  critique: number;
}

/**
 * Équipement de niveau 10 : jets moyens de la Panoplie du Piou Vert (DofusDB, niv. 12, 6 objets,
 * jets max Force 60, Vitalité 60, Critique 3), sans bonus de panoplie.
 */
export const STUFF_NIVEAU_10: GearDef = { name: 'Équipement de niveau 10', force: 40, vitalite: 40, critique: 2 };

/** Points de caractéristique gagnés par niveau (Dofus : 5, à partir du niveau 2). */
export const POINTS_PER_LEVEL = 5;

/** Sacrieur de l'étape 2 : caractéristiques fixes (les niveaux viennent à l'étape 5). */
export interface HeroDef {
  level: number;
  stats: Stats;
  hp: number;
  /** Vitesse (px/s), dérivée des PM. */
  speed: number;
  radius: number;
  weapon: WeaponDef;
  gear: GearDef;
}

/** Sacrieur niveau 10, tous ses points en Force, avec l'équipement de niveau 10. */
export function startingHero(): HeroDef {
  const level = 10, gear = STUFF_NIVEAU_10;
  const points = (level - 1) * POINTS_PER_LEVEL;
  const stats = baseStats({ force: points + gear.force, vitalite: gear.vitalite, critique: gear.critique, dommagesCritiques: 2 });
  const pm = 3;
  return { level, stats, hp: maxHp(level, stats.vitalite), speed: 300 + pm * 40, radius: 22, weapon: EPEE_ROUILLEE, gear };
}
