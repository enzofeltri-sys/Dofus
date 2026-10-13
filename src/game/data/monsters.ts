import { baseStats, type DamageRoll, type Stats } from '../formulas';

/**
 * Grade DofusDB : niveau, PV, Force, résistances % [neutre, terre, feu, eau, air], XP, sagesse,
 * tacle, esquive PA / PM ; `more` pour les autres caractéristiques (Intelligence, Agilité…).
 */
const g = (level: number, hp: number, force: number, res: Res5, xp: number, sagesse: number, tacle: number, esqPA: number, esqPM: number, more: Partial<MonsterGrade> = {}): MonsterGrade =>
  ({ level, hp, force, intelligence: 0, chance: 0, agilite: 0, res, xp, sagesse, tacle, esquivePA: esqPA, esquivePM: esqPM, ...more });
type Res5 = [number, number, number, number, number];
const neu = (v: number): Res5 => [v, 0, 0, 0, 0];
const air = (v: number): Res5 => [0, 0, 0, 0, v];
const eau = (v: number): Res5 => [0, 0, 0, v, 0];
const feu = (v: number): Res5 => [0, 0, v, 0, 0];
const KARDORIM_RES: Res5 = [10, -15, 20, -10, 5];
const NONE: Res5 = [0, 0, 0, 0, 0];

/**
 * Fiches des monstres. Niveau, PV et Force des 5 grades : DofusDB.
 * Le reste (vitesse, attaque, télégraphe) est l'adaptation au temps réel.
 */

export type Behavior = 'melee' | 'stealth' | 'lancer' | 'brute' | 'boss';
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
  intelligence: number;
  chance: number;
  agilite: number;
  sagesse: number;
  /** Résistances en % : neutre, terre, feu, eau, air. */
  res: Res5;
  /** XP de base rapportée (avant bonus de groupe et de Sagesse). */
  xp: number;
  tacle: number;
  esquivePA: number;
  esquivePM: number;
}

/** Adaptation au temps réel : les monstres ont plus de PV qu'en tour par tour. */
export const REALTIME_HP = 1.8;
/** Bonus de Puissance des monstres (en % de leur multiplicateur de dégâts) : +30 % de dégâts. */
export const MONSTER_POWER = 0.3;

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
  /** Art utilisé (variante de Chafer, ou boss de la crypte). */
  art: MonsterArt;
  /** Taille d'affichage (1 = Chafer). */
  scale?: number;
  /** Capacités de boss, traduites des sorts Dofus (1 tour = 4 s). */
  boss?: BossKit;
  /** Multiplicateur de PV (monstre d'élite). */
  hpMult?: number;
  /** Multiplicateur d'XP (monstre d'élite). */
  xpMult?: number;
  /** Charge : attaque spéciale en ligne, puis le monstre fonce sur toute la longueur. */
  charge?: { every: number; attack: MonsterAttack; dash: number };
}

export type MonsterArt = 'debutant' | 'furtif' | 'piquier' | 'sergent' | 'kardorim' | 'kardorib';

export interface BossKit {
  /** Craquement d'Os : accélère le boss et ses alliés proches (s). */
  crackEvery: number;
  crackDuration: number;
  haste: number;
  crackRadius: number;
  /** Appel de Kardorib : invocation (s). */
  summonFirst: number;
  summonEvery: number;
  summon: string;
  maxSummons: number;
}

const neutre = (min: number, max: number): DamageRoll => ({ min, max, critBonus: 2, critBase: 3, element: 'neutre' });

/** Sergent Chafer (DofusDB 4050) : Force et Intelligence, résistance Feu. */
const SERGENT = [[7, 36, 60, 160, 20, 7], [8, 40, 70, 190, 25, 7], [9, 44, 80, 230, 30, 7], [10, 49, 90, 280, 35, 7], [11, 54, 100, 340, 40, 6]]
  .map(([lv, hp, f, xp, sa, epa], i) => g(lv, hp, f, feu(10 + i), xp, sa, 10, epa, 5, { intelligence: f }));

export const MONSTERS: Record<string, MonsterDef> = {
  chaferDebutant: {
    id: 'chaferDebutant', name: 'Chafer Débutant', dofusId: 4046,
    grades: [g(5, 28, 20, neu(10), 110, 10, 10, 2, 2), g(6, 32, 30, neu(11), 130, 20, 10, 1, 2), g(7, 36, 40, neu(12), 160, 30, 10, 1, 2), g(8, 40, 50, neu(13), 190, 40, 10, 1, 2), g(9, 44, 60, neu(14), 230, 50, 10, 0, 2)], behavior: 'melee', speed: 144, radius: 24, art: 'debutant',
    attack: { shape: 'circle', trigger: 105, size: 66, spread: 0, offset: 62, windup: 0.43, recover: 0.26, cooldown: [0.85, 1.36], roll: neutre(4, 8) },
  },
  chaferFurtif: {
    id: 'chaferFurtif', name: 'Chafer Furtif', dofusId: 4047,
    grades: [g(6, 32, 30, air(10), 130, 10, 10, 2, 3), g(7, 36, 40, air(11), 160, 20, 10, 3, 4), g(8, 40, 50, air(12), 190, 30, 10, 3, 5), g(9, 44, 60, air(13), 230, 40, 10, 3, 6), g(10, 49, 70, air(14), 280, 50, 10, 4, 7)], behavior: 'stealth', speed: 184, radius: 24, art: 'furtif',
    attack: { shape: 'circle', trigger: 100, size: 62, spread: 0, offset: 58, windup: 0.37, recover: 0.24, cooldown: [1.02, 1.44], roll: neutre(4, 8) },
  },
  chaferPiquier: {
    id: 'chaferPiquier', name: 'Chafer Piquier', dofusId: 4049,
    grades: [g(7, 36, 20, eau(10), 160, 0, 15, 6, 0), g(8, 40, 30, eau(11), 190, 0, 15, 6, 0), g(9, 44, 40, eau(12), 230, 0, 15, 6, 0), g(10, 49, 50, eau(13), 280, 0, 15, 6, 0), g(11, 54, 60, eau(14), 340, 0, 15, 6, 0)], behavior: 'lancer', speed: 124, radius: 26, art: 'piquier',
    attack: { shape: 'line', trigger: 200, size: 215, spread: 24, offset: 0, windup: 0.52, recover: 0.3, cooldown: [1.1, 1.53], roll: neutre(5, 9) },
  },
  sergentChafer: {
    id: 'sergentChafer', name: 'Sergent Chafer', dofusId: 4050,
    grades: SERGENT, behavior: 'brute', speed: 115, radius: 28, art: 'sergent',
    attack: { shape: 'cone', trigger: 130, size: 165, spread: 0.72, offset: 0, windup: 0.61, recover: 0.34, cooldown: [1.19, 1.7], roll: neutre(5, 9) },
  },
  /**
   * Mini-boss de la salle 5 (création, faute de mini-boss de ce niveau dans Dofus) :
   * le vrai Sergent Chafer au grade 5, plus grand, 2,5 fois plus de PV, et une charge annoncée en ligne.
   */
  sergentElite: {
    id: 'sergentElite', name: 'Sergent Chafer d’élite', dofusId: 4050,
    grades: SERGENT,
    behavior: 'brute', speed: 120, radius: 34, art: 'sergent', scale: 1.3, hpMult: 2.5, xpMult: 2.5,
    attack: { shape: 'cone', trigger: 140, size: 175, spread: 0.72, offset: 0, windup: 0.6, recover: 0.34, cooldown: [1.1, 1.6], roll: neutre(5, 9) },
    charge: {
      every: 6, dash: 290,
      attack: { shape: 'line', trigger: 420, size: 330, spread: 30, offset: 0, windup: 0.85, recover: 0.6, cooldown: [1.2, 1.6], roll: neutre(8, 12) },
    },
  },
  /**
   * Kardorim (DofusDB 4051) : niveau 10, 140 à 200 PV, Force 50.
   * Casse-crâne : corps à corps neutre 34-38, 2 fois par tour → toutes les ~1,5-2 s, très bien annoncé.
   * Craquement d'Os : +1 PM en zone tous les 3 tours → accélération toutes les 12 s (1 tour = 4 s).
   * Appel de Kardorib : invocation tous les 6 tours → toutes les 24 s (16 s ici : difficulté relevée à la demande d'Enzo).
   */
  kardorim: {
    id: 'kardorim', name: 'Kardorim', dofusId: 4051,
    grades: ([[140, 890], [150, 1100], [170, 1300], [190, 1500], [200, 1796]] as const).map(([hp, xp]) => g(10, hp, 50, KARDORIM_RES, xp, 50, 0, 6, 5, { intelligence: 50, chance: 50, agilite: 50 })),
    behavior: 'boss', speed: 118, radius: 44, art: 'kardorim', scale: 1.55,
    attack: { shape: 'circle', trigger: 135, size: 92, spread: 0, offset: 78, windup: 0.8, recover: 0.5, cooldown: [1.4, 2.0], roll: { min: 34, max: 38, critBonus: 4, critBase: 3, element: 'neutre' } },
    boss: { crackEvery: 12, crackDuration: 4, haste: 1.6, crackRadius: 280, summonFirst: 6, summonEvery: 16, summon: 'kardorib', maxSummons: 4 },
  },
  /** Kardorib (DofusDB 4052) : invocation de Kardorim, niveau 10, 60 PV, Force 40. */
  kardorib: {
    id: 'kardorib', name: 'Kardorib', dofusId: 4052,
    grades: [1, 2, 3, 4, 5].map(() => g(10, 60, 40, NONE, 0, 0, 20, 4, 15, { agilite: 40 })),
    behavior: 'melee', speed: 165, radius: 26, art: 'kardorib',
    attack: { shape: 'circle', trigger: 100, size: 60, spread: 0, offset: 56, windup: 0.4, recover: 0.26, cooldown: [0.9, 1.4], roll: neutre(4, 8) },
  },
};

export const CRYPT_POOL = ['chaferDebutant', 'chaferDebutant', 'chaferFurtif', 'chaferPiquier', 'sergentChafer'];

/** Statistiques d'un monstre à un grade donné (1 à 5). */
export function gradeStats(def: MonsterDef, grade: number): { level: number; maxHp: number; xp: number; stats: Stats } {
  const gr = def.grades[Math.max(1, Math.min(def.grades.length, grade)) - 1];
  const [neutre, terre, feu, eau, air] = gr.res;
  const stats = baseStats({
    force: gr.force, intelligence: gr.intelligence, chance: gr.chance, agilite: gr.agilite, sagesse: gr.sagesse,
    puissance: Math.round((100 + gr.force) * MONSTER_POWER),
    resPct: { neutre, terre, feu, eau, air },
    tacle: gr.tacle, esquivePA: gr.esquivePA, esquivePM: gr.esquivePM,
  });
  return { level: gr.level, maxHp: Math.round(gr.hp * REALTIME_HP * (def.hpMult ?? 1)), xp: Math.round(gr.xp * (def.xpMult ?? 1)), stats };
}
