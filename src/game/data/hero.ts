import { addStats, baseStats, maxHp, type DamageRoll, type Stats } from '../formulas';
import { defaultProfile, levelForXp, type Profile } from '../progression';
import { gearStats, starterInventory } from '../inventory';

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

/** Base du Sacrieur dans Dofus : 6 PA, 3 PM, 1 invocation ; 2 dommages critiques (arme de départ). */
export const SACRIEUR_BASE: Partial<Stats> = { pa: 6, pm: 3, invocations: 1, dommagesCritiques: 2 };

/** Sacrieur : niveau et caractéristiques du profil sauvegardé, plus l'équipement. */
export interface HeroDef {
  level: number;
  stats: Stats;
  hp: number;
  /** Vitesse (px/s), dérivée des PM. */
  speed: number;
  radius: number;
  weapon: WeaponDef;
  /** Stats apportées par l'équipement porté (objets + bonus de panoplie). */
  gear: Partial<Stats>;
}

/** Vitesse de déplacement (px/s) selon les PM. */
export const speedForPm = (pm: number) => 250 + pm * 30;

/** Sacrieur construit depuis son profil (par défaut : niveau 10, tous ses points en Force) et son équipement (par défaut : celui de départ). */
export function startingHero(profile: Profile = defaultProfile(), gear: Partial<Stats> = gearStats(starterInventory())): HeroDef {
  const level = levelForXp(profile.xp);
  const stats = addStats(baseStats(SACRIEUR_BASE), profile.carac, gear);
  return { level, stats, hp: maxHp(level, stats.vitalite), speed: speedForPm(stats.pm), radius: 22, weapon: EPEE_ROUILLEE, gear };
}
