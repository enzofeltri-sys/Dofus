import { addStats, baseStats, maxHp, type DamageRoll, type Stats } from '../formulas';
import { defaultProfile, levelForXp, type Profile } from '../progression';

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
  stats: Partial<Stats>;
}

/**
 * Équipement de niveau 10 : jets moyens de la Panoplie du Piou Vert (DofusDB, niv. 12, 6 objets,
 * jets max Force 60, Vitalité 60, Critique 3), sans bonus de panoplie.
 */
export const STUFF_NIVEAU_10: GearDef = { name: 'Équipement de niveau 10', stats: { force: 40, vitalite: 40, critique: 2 } };

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
  gear: GearDef;
}

/** Vitesse de déplacement (px/s) selon les PM. */
export const speedForPm = (pm: number) => 250 + pm * 30;

/** Sacrieur construit depuis son profil (par défaut : niveau 10, tous ses points en Force) et l'équipement de niveau 10. */
export function startingHero(profile: Profile = defaultProfile()): HeroDef {
  const level = levelForXp(profile.xp), gear = STUFF_NIVEAU_10;
  const stats = addStats(baseStats(SACRIEUR_BASE), profile.carac, gear.stats);
  return { level, stats, hp: maxHp(level, stats.vitalite), speed: speedForPm(stats.pm), radius: 22, weapon: EPEE_ROUILLEE, gear };
}
