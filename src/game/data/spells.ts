import type { DamageRoll, Element } from '../formulas';

/**
 * Sorts du Sacrieur, grade 1 (DofusDB), traduits en temps réel.
 *
 * Règles de traduction (document de design §4.4) :
 * - 1 tour Dofus = TURN secondes ; les PA (6) se rechargent de 6 par tour ;
 * - « N lancers par tour » → au plus un lancer toutes les TURN / N secondes ;
 * - 1 case ≈ CELL px au sol (repère « à plat ») ;
 * - vol de vie : soigne de 50 % des dommages infligés.
 */
export const TURN = 4;
export const CELL = 60;
export const PA_MAX = 6;
export const PA_REGEN = PA_MAX / TURN;
/** Portée « corps à corps » des sorts (comme l'arme). */
export const MELEE = 120;
/** Délai minimal entre deux sorts (temps de l'animation de lancer). */
export const CAST_DELAY = 0.35;

export type SpellId = 'supplice' | 'hemorragie' | 'absorption' | 'stase' | 'attirance' | 'mutilation';

export type SpellKind =
  /** Vol de vie sur une cible ; `debuff` = effet secondaire du sort Dofus. */
  | { type: 'steal'; roll: DamageRoll; debuff?: 'mark' | 'power' | 'crit' | 'heal' }
  /** Attire la cible de N cases vers le lanceur. */
  | { type: 'pull'; cells: number }
  /** Posture : sacrifie des PV contre de la Puissance, par paliers ; se transforme en bouclier. */
  | { type: 'mutilation' };

export interface SpellDef {
  id: SpellId;
  name: string;
  element: Element | null;
  /** Niveau de déblocage réel (grade 1). */
  level: number;
  pa: number;
  /** Portée en px au sol (min, max). */
  range: [number, number];
  /** Délai minimal entre deux lancers (s). */
  cooldown: number;
  kind: SpellKind;
  /** Texte court pour les cartes. */
  text: string;
}

const steal = (element: Element, min: number, max: number, critMin: number): DamageRoll =>
  ({ min, max, critBonus: critMin - min, critBase: 15, element });

export const SPELLS: Record<SpellId, SpellDef> = {
  // Supplice (12725) : 3 PA, CàC, vol Terre 13-16 (crit 17-20), 3/tour ; marque : les attaquants de la cible sont soignés de 20 %.
  supplice: {
    id: 'supplice', name: 'Supplice', element: 'terre', level: 1, pa: 3, range: [0, MELEE], cooldown: TURN / 3,
    kind: { type: 'steal', roll: steal('terre', 13, 16, 17), debuff: 'mark' },
    text: 'Vol de vie Terre au corps à corps. Tes coups sur la cible marquée te soignent de 20 %.',
  },
  // Hémorragie (12748) : 3 PA, CàC, vol Air 13-16 (crit 17-20), 3/tour ; soins reçus par la cible ×70 %.
  hemorragie: {
    id: 'hemorragie', name: 'Hémorragie', element: 'air', level: 1, pa: 3, range: [0, MELEE], cooldown: TURN / 3,
    kind: { type: 'steal', roll: steal('air', 13, 16, 17), debuff: 'heal' },
    text: 'Vol de vie Air au corps à corps. Réduit les soins reçus par la cible.',
  },
  // Absorption (12734) : 3 PA, 1 à 6 cases, vol Feu 12-14 (crit 15-17), 3/tour ; -50 Puissance à la cible pendant 1 tour.
  absorption: {
    id: 'absorption', name: 'Absorption', element: 'feu', level: 1, pa: 3, range: [0, 6 * CELL], cooldown: TURN / 3,
    kind: { type: 'steal', roll: steal('feu', 12, 14, 15), debuff: 'power' },
    text: `Vol de vie Feu à distance (6 cases). La cible perd 50 Puissance pendant ${TURN} s.`,
  },
  // Stase (12728) : 3 PA, 1 à 5 cases, vol Eau 12-14 (crit 15-17), 3/tour ; -10 % Critique à la cible pendant 1 tour.
  stase: {
    id: 'stase', name: 'Stase', element: 'eau', level: 1, pa: 3, range: [0, 5 * CELL], cooldown: TURN / 3,
    kind: { type: 'steal', roll: steal('eau', 12, 14, 15), debuff: 'crit' },
    text: `Vol de vie Eau à distance (5 cases). La cible perd 10 % de Critique pendant ${TURN} s.`,
  },
  // Attirance (12735) : 2 PA, 2 à 8 cases, attire de 7 cases, 2/tour ; Souffrance 6+ : portée +4 et attraction plus forte.
  attirance: {
    id: 'attirance', name: 'Attirance', element: null, level: 5, pa: 2, range: [2 * CELL, 8 * CELL], cooldown: TURN / 2,
    kind: { type: 'pull', cells: 7 },
    text: 'Attire un ennemi éloigné (2 à 8 cases) jusqu’à toi. Souffrance 6+ : portée +4.',
  },
  // Mutilation (12737) : 2 PA, sur soi, 1/tour ; -10 % PV contre +50 Puissance, paliers à chaque tour ;
  // relancé → Coagulation : bouclier de 5 / 15 / 25 % des PV max selon le palier (1 tour).
  mutilation: {
    id: 'mutilation', name: 'Mutilation', element: null, level: 10, pa: 2, range: [0, 0], cooldown: TURN,
    kind: { type: 'mutilation' },
    text: `Sacrifie 10 % de tes PV toutes les ${TURN} s pour +50 Puissance par palier (3 max). Sous 40 % de PV : bouclier.`,
  },
};

/** Mutilation : Puissance par palier, sacrifice par palier, bouclier de Coagulation par palier (% PV max). */
export const MUTILATION = { power: 50, sacrifice: 0.1, maxStage: 3, shield: [5, 15, 25], stopBelow: 0.4, startAbove: 0.5 };
/** Supplice : soin des attaquants de la cible marquée (% des dommages). */
export const SUPPLICE_MARK = 0.2;

/** Souffrance : charges gagnées en prenant des coups. */
export const SOUFFRANCE = { max: 10, powerPerCharge: 3, decayEvery: TURN, pullBonusAt: 6, pullBonusCells: 4 };

/** Sorts accessibles à un niveau donné (le grimoire). */
export const spellsForLevel = (level: number): SpellDef[] => Object.values(SPELLS).filter((s) => s.level <= level);

/** Nombre de cases de sorts selon le niveau (4 → 8). */
export const slotsForLevel = (level: number): number => 4 + [50, 100, 150, 200].filter((l) => level >= l).length;
