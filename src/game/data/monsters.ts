import { baseStats, type DamageRoll, type Stats } from '../formulas';

/**
 * Fiches des monstres. Niveau, PV et caractéristiques : grade 1 de DofusDB.
 * Le reste (vitesse, attaque, télégraphe) est l'adaptation au temps réel.
 */

export type Behavior = 'melee' | 'stealth' | 'lancer' | 'brute';
export type AttackShape = 'circle' | 'cone' | 'line';

export interface MonsterAttack {
  shape: AttackShape;
  /** Distance à laquelle le monstre déclenche son attaque (px, sol « à plat »). */
  trigger: number;
  /** Rayon (cercle/cône) ou longueur (ligne), en px. */
  size: number;
  /** Demi-largeur de la ligne ou demi-angle du cône (radians). */
  spread: number;
  /** Décalage du centre du cercle devant le monstre. */
  offset: number;
  /** Durée de l'annonce au sol avant la frappe (s). */
  windup: number;
  /** Temps de récupération après la frappe (s). */
  recover: number;
  /** Délai entre deux attaques (s), tiré entre min et max. */
  cooldown: [number, number];
  roll: DamageRoll;
}

export interface MonsterDef {
  id: string;
  name: string;
  /** Identifiant DofusDB (pour les drops et l'illustration). */
  dofusId: number;
  level: number;
  hp: number;
  stats: Stats;
  behavior: Behavior;
  /** Vitesse de déplacement (px/s). */
  speed: number;
  /** Rayon de collision au sol (px). */
  radius: number;
  attack: MonsterAttack;
  /** Art utilisé (variante de Chafer). */
  art: 'debutant' | 'furtif' | 'piquier' | 'sergent';
}

const neutre = (min: number, max: number): DamageRoll => ({ min, max, critBonus: 2, critBase: 3, element: 'neutre' });

export const MONSTERS: Record<string, MonsterDef> = {
  chaferDebutant: {
    id: 'chaferDebutant', name: 'Chafer Débutant', dofusId: 4046, level: 5, hp: 42,
    stats: baseStats({ force: 20 }), behavior: 'melee', speed: 144, radius: 24, art: 'debutant',
    attack: { shape: 'circle', trigger: 105, size: 66, spread: 0, offset: 62, windup: 0.43, recover: 0.26, cooldown: [0.85, 1.36], roll: neutre(4, 8) },
  },
  chaferFurtif: {
    id: 'chaferFurtif', name: 'Chafer Furtif', dofusId: 4047, level: 6, hp: 48,
    stats: baseStats({ force: 30 }), behavior: 'stealth', speed: 184, radius: 24, art: 'furtif',
    attack: { shape: 'circle', trigger: 100, size: 62, spread: 0, offset: 58, windup: 0.37, recover: 0.24, cooldown: [1.02, 1.44], roll: neutre(4, 8) },
  },
  chaferPiquier: {
    id: 'chaferPiquier', name: 'Chafer Piquier', dofusId: 4049, level: 7, hp: 54,
    stats: baseStats({ force: 20 }), behavior: 'lancer', speed: 124, radius: 26, art: 'piquier',
    attack: { shape: 'line', trigger: 200, size: 215, spread: 24, offset: 0, windup: 0.52, recover: 0.3, cooldown: [1.1, 1.53], roll: neutre(5, 9) },
  },
  sergentChafer: {
    id: 'sergentChafer', name: 'Sergent Chafer', dofusId: 4050, level: 7, hp: 54,
    stats: baseStats({ force: 60 }), behavior: 'brute', speed: 115, radius: 28, art: 'sergent',
    attack: { shape: 'cone', trigger: 130, size: 165, spread: 0.72, offset: 0, windup: 0.61, recover: 0.34, cooldown: [1.19, 1.7], roll: neutre(5, 9) },
  },
};

export const CRYPT_POOL = ['chaferDebutant', 'chaferDebutant', 'chaferFurtif', 'chaferPiquier', 'sergentChafer'];
