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
  speed: 1.8,
  reach: 120,
  arc: 1.25,
  impactAt: 0.35,
};

/** Sacrieur de l'étape 2 : caractéristiques fixes (les niveaux viennent à l'étape 5). */
export interface HeroDef {
  level: number;
  stats: Stats;
  hp: number;
  /** Vitesse (px/s), dérivée des PM. */
  speed: number;
  radius: number;
  weapon: WeaponDef;
}

export function startingHero(): HeroDef {
  const stats = baseStats({ vitalite: 20, force: 60, critique: 5, dommagesCritiques: 2 });
  const pm = 3;
  return { level: 12, stats, hp: maxHp(12, stats.vitalite), speed: 260 + pm * 35, radius: 22, weapon: EPEE_ROUILLEE };
}
