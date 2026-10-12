import { baseStats, type DamageRoll, type Stats } from '../formulas';

const g = (level: number, hp: number, force: number): MonsterGrade => ({ level, hp, force });

/**
 * Fiches des monstres. Niveau, PV et Force des 5 grades : DofusDB.
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

/** Grade d'un monstre (1 à 5), valeurs réelles de DofusDB. */
export interface MonsterGrade {
  level: number;
  hp: number;
  force: number;
}

/** Adaptation au temps réel : les monstres ont plus de PV qu'en tour par tour. */
export const REALTIME_HP = 1.5;

export interface MonsterDef {
  id: string;
  name: string;
  /** Identifiant DofusDB (pour les drops et l'illustration). */
  dofusId: number;
  grades: MonsterGrade[];
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
    id: 'chaferDebutant', name: 'Chafer Débutant', dofusId: 4046,
    grades: [g(5, 28, 20), g(6, 32, 30), g(7, 36, 40), g(8, 40, 50), g(9, 44, 60)], behavior: 'melee', speed: 144, radius: 24, art: 'debutant',
    attack: { shape: 'circle', trigger: 105, size: 66, spread: 0, offset: 62, windup: 0.43, recover: 0.26, cooldown: [0.85, 1.36], roll: neutre(4, 8) },
  },
  chaferFurtif: {
    id: 'chaferFurtif', name: 'Chafer Furtif', dofusId: 4047,
    grades: [g(6, 32, 30), g(7, 36, 40), g(8, 40, 50), g(9, 44, 60), g(10, 49, 70)], behavior: 'stealth', speed: 184, radius: 24, art: 'furtif',
    attack: { shape: 'circle', trigger: 100, size: 62, spread: 0, offset: 58, windup: 0.37, recover: 0.24, cooldown: [1.02, 1.44], roll: neutre(4, 8) },
  },
  chaferPiquier: {
    id: 'chaferPiquier', name: 'Chafer Piquier', dofusId: 4049,
    grades: [g(7, 36, 20), g(8, 40, 30), g(9, 44, 40), g(10, 49, 50), g(11, 54, 60)], behavior: 'lancer', speed: 124, radius: 26, art: 'piquier',
    attack: { shape: 'line', trigger: 200, size: 215, spread: 24, offset: 0, windup: 0.52, recover: 0.3, cooldown: [1.1, 1.53], roll: neutre(5, 9) },
  },
  sergentChafer: {
    id: 'sergentChafer', name: 'Sergent Chafer', dofusId: 4050,
    grades: [g(7, 36, 60), g(8, 40, 70), g(9, 44, 80), g(10, 49, 90), g(11, 54, 100)], behavior: 'brute', speed: 115, radius: 28, art: 'sergent',
    attack: { shape: 'cone', trigger: 130, size: 165, spread: 0.72, offset: 0, windup: 0.61, recover: 0.34, cooldown: [1.19, 1.7], roll: neutre(5, 9) },
  },
};

export const CRYPT_POOL = ['chaferDebutant', 'chaferDebutant', 'chaferFurtif', 'chaferPiquier', 'sergentChafer'];

/** Statistiques d'un monstre à un grade donné (1 à 5). */
export function gradeStats(def: MonsterDef, grade: number): { level: number; maxHp: number; stats: Stats } {
  const gr = def.grades[Math.max(1, Math.min(def.grades.length, grade)) - 1];
  return { level: gr.level, maxHp: Math.round(gr.hp * REALTIME_HP), stats: baseStats({ force: gr.force }) };
}
