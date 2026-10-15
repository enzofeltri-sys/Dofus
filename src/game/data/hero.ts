import { addStats, baseStats, maxHp, type DamageRoll, type Stats } from '../formulas';
import { defaultProfile, levelForXp, type Profile } from '../progression';
import { gearStats, starterInventory } from '../inventory';
import { ITEMS, type WeaponData } from './items';
import { CELL } from './spells';

/** Une ligne de dommages d'arme : jet, élément, vol de vie (Dofus : soigne de la moitié des dommages). */
export interface WeaponLine extends DamageRoll {
  steal: boolean;
}

/** Arme : attaque de base automatique, frappe tout ce qui est dans son arc (ou la cible la plus proche pour une arme à distance). */
export interface WeaponDef {
  /** Objet DofusDB (null : mains nues). */
  itemId: number | null;
  name: string;
  /** Lignes de dommages (déjà converties au temps réel). */
  lines: WeaponLine[];
  /** Attaques par seconde. */
  speed: number;
  /** Portée (px, sol « à plat »). */
  reach: number;
  /** Arme à distance (portée minimale ≥ 2 cases) : un seul coup sur la cible la plus proche. */
  ranged: boolean;
  /** Demi-angle de l'arc de frappe (radians). */
  arc: number;
  /** Instant de l'impact dans l'animation (fraction de 1 / speed). */
  impactAt: number;
}

/**
 * Conversion des armes de Dofus au temps réel (calibrée sur l'ancien réglage validé : 1,9 coup/s pour une arme à 4 PA) :
 * - cadence = 1,9 × 4 / coût en PA (une dague à 2 PA frappe deux fois plus vite qu'une épée à 4 PA) ;
 * - dommages par coup = jet de Dofus × 0,56 (arrondi, au moins 1).
 */
export const WEAPON_RATE_4PA = 1.9;
export const WEAPON_POWER = 0.56;
const MELEE_REACH = 120;

/** Mains nues (Dofus) : 1 à 5 dommages Neutre, 4 PA. */
export const MAINS_NUES: WeaponData = { pa: 4, crit: 0, critBonus: 0, range: 1, minRange: 1, lines: [['neutre', 1, 5, false]] };

export function weaponDef(itemId: number | null): WeaponDef {
  const d = itemId !== null ? ITEMS[itemId] : undefined;
  const w = d?.weapon ?? MAINS_NUES;
  const conv = (v: number) => Math.max(1, Math.round(v * WEAPON_POWER));
  const ranged = w.minRange >= 2;
  return {
    itemId: d ? d.id : null,
    name: d ? d.name : 'Mains nues',
    lines: w.lines.map(([element, a, b, steal]) => ({
      min: conv(a), max: Math.max(conv(a), conv(b)), critBonus: Math.round(w.critBonus * WEAPON_POWER), critBase: w.crit, element, steal,
    })),
    speed: (WEAPON_RATE_4PA * 4) / Math.max(1, w.pa),
    reach: ranged ? Math.min(6, w.range) * CELL : Math.max(MELEE_REACH, w.range * CELL),
    ranged,
    arc: 1.25,
    impactAt: 0.35,
  };
}

/** Base du Sacrieur dans Dofus : 6 PA, 3 PM, 1 invocation. */
export const SACRIEUR_BASE: Partial<Stats> = { pa: 6, pm: 3, invocations: 1 };

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
export function startingHero(profile: Profile = defaultProfile(), gear: Partial<Stats> = gearStats(starterInventory()), weaponId: number | null = null): HeroDef {
  const level = levelForXp(profile.xp);
  const stats = addStats(baseStats(SACRIEUR_BASE), profile.carac, gear);
  return { level, stats, hp: maxHp(level, stats.vitalite), speed: speedForPm(stats.pm), radius: 22, weapon: weaponDef(weaponId), gear };
}
