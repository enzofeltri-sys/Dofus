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
/**
 * Puissance des sorts en temps réel : dans Dofus on lance ~2 sorts par tour de ~30 s, ici 2 toutes les 4 s
 * en plus de l'arme ; les dommages (et donc le vol de vie) sont réduits d'autant.
 */
export let SPELL_POWER = 0.3;
export const setSpellPower = (v: number) => (SPELL_POWER = v);
/** Délai minimal entre deux sorts (temps de l'animation de lancer). */
export const CAST_DELAY = 0.35;

export type SpellId = 'supplice' | 'hemorragie' | 'absorption' | 'stase' | 'attirance' | 'mutilation' | 'epeeVorace' | 'ravage' | 'assaut' | 'transposition'
  | 'condensation' | 'hostilite' | 'couronne' | 'transfusion';

export type SpellKind =
  /** Vol de vie sur une cible ; `debuff` = effet secondaire du sort Dofus. */
  | { type: 'steal'; roll: DamageRoll; debuff?: 'mark' | 'power' | 'crit' | 'heal' }
  /** Attire la cible de N cases vers le lanceur. */
  | { type: 'pull'; cells: number }
  /** Posture : sacrifie des PV contre de la Puissance, par paliers ; se transforme en bouclier. */
  | { type: 'mutilation' }
  /** Invocation (Épée Vorace) : un allié qui vole de la vie aux monstres proches et soigne le Sacrieur. */
  | { type: 'summon'; roll: DamageRoll; life: number; every: number }
  /** Bond vers la cible (Ravage) puis dommages. */
  | { type: 'dash'; roll: DamageRoll; cells: number }
  /** Échange de position avec la cible (Assaut : quand on est encerclé, avec dommages ; Transposition : pour fuir, PV bas). */
  | { type: 'swap'; roll?: DamageRoll; when: 'surrounded' | 'danger' }
  /** Dommages en zone autour de la cible, puis attire les touchés vers le lanceur (Condensation). */
  | { type: 'zone'; roll: DamageRoll; radius: number; pullCells: number }
  /** Dommages puis repousse la cible ; contre un obstacle : dommages de poussée (Hostilité). */
  | { type: 'push'; roll: DamageRoll; cells: number }
  /** Bouclier et renvoi des dommages de mêlée pendant un tour (Couronne d'Épines). */
  | { type: 'thorns'; shieldPct: number; perEnemyPct: number }
  /** Dommages Neutre en zone autour du lanceur, selon sa vie restante (Transfusion). */
  | { type: 'nova'; hpPct: number; radius: number };

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

const hit = (element: Element, min: number, max: number, critMin: number): DamageRoll =>
  ({ min, max, critBonus: critMin - min, critBase: 15, element });
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
    text: 'Attire un ennemi éloigné (2 à 8 cases) jusqu’à toi. Souffrance 6+ (60 % de PV perdus) : portée +4.',
  },
  // Mutilation (12737) : 2 PA, sur soi, 1/tour ; -10 % PV contre +50 Puissance (ramené à +30 en temps réel), paliers à chaque tour ;
  // relancé → Coagulation : bouclier de 5 / 15 / 25 % des PV max selon le palier (1 tour).
  mutilation: {
    id: 'mutilation', name: 'Mutilation', element: null, level: 10, pa: 2, range: [0, 0], cooldown: TURN,
    kind: { type: 'mutilation' },
    text: `Sacrifie 10 % de tes PV toutes les ${TURN} s pour +30 Puissance par palier (3 max). Sous 40 % de PV : bouclier.`,
  },
  // Épée Vorace (12744) : 3 PA, tous les 4 tours ; invoque une Épée Vorace (Soif de Sang : 2 PA, vol Neutre 8-10, soigne l'invocateur).
  // Temps réel : une épée toutes les 16 s, qui vit 12 s (dans Dofus, jusqu'à ce qu'on la tue) et frappe 3 fois par tour.
  epeeVorace: {
    id: 'epeeVorace', name: 'Épée Vorace', element: 'neutre', level: 15, pa: 3, range: [0, 6 * CELL], cooldown: 4 * TURN,
    kind: { type: 'summon', roll: steal('neutre', 8, 10, 11), life: 3 * TURN, every: TURN / 3 },
    text: 'Invoque une épée qui vole de la vie Neutre aux monstres proches et te soigne, pendant 12 s (toutes les 16 s).',
  },
  // Ravage (12746) : 3 PA, 1 à 6 cases en ligne, 2/tour ; rapproche le lanceur de la cible (5 cases), dommages Terre 17-20.
  ravage: {
    id: 'ravage', name: 'Ravage', element: 'terre', level: 20, pa: 3, range: [MELEE + 20, 6 * CELL], cooldown: TURN / 2,
    kind: { type: 'dash', roll: hit('terre', 17, 20, 21), cells: 5 },
    text: 'Bondit sur un ennemi éloigné (jusqu’à 6 cases) et lui inflige des dommages Terre.',
  },
  // Assaut (12733) : 2 PA, 1 à 2 cases, 3/tour ; échange de position avec la cible, dommages Air 9-11.
  // Temps réel : seulement quand on est encerclé (2 monstres au contact), sinon le joueur perdrait le contrôle de sa position.
  assaut: {
    id: 'assaut', name: 'Assaut', element: 'air', level: 25, pa: 2, range: [0, 2 * CELL], cooldown: TURN / 3,
    kind: { type: 'swap', roll: hit('air', 9, 11, 13), when: 'surrounded' },
    text: 'Quand tu es encerclé : échange ta place avec un ennemi au contact et lui inflige des dommages Air.',
  },
  // Transposition (12736) : 3 PA, 1 à 7 cases, tous les 3 tours ; échange de position avec la cible ; Souffrance 6+ : portée +4.
  // Temps réel : pour fuir, quand les PV sont bas et que des monstres sont au contact → avec le monstre le plus éloigné.
  transposition: {
    id: 'transposition', name: 'Transposition', element: null, level: 30, pa: 3, range: [2 * CELL, 7 * CELL], cooldown: 3 * TURN,
    kind: { type: 'swap', when: 'danger' },
    text: 'Sous 50 % de PV et au contact d’ennemis : échange ta place avec l’ennemi le plus éloigné (7 cases, +4 en Souffrance 6).',
  },
  // Condensation (12745) : 3 PA, 0 à 5 cases, 2/tour ; Eau 13-16 en cercle de 2 cases autour de la cible, attire de 2 cases.
  condensation: {
    id: 'condensation', name: 'Condensation', element: 'eau', level: 35, pa: 3, range: [0, 5 * CELL], cooldown: TURN / 2,
    kind: { type: 'zone', roll: hit('eau', 13, 16, 17), radius: 2 * CELL, pullCells: 2 },
    text: 'Dommages Eau sur un groupe (2 cases autour de la cible, jusqu’à 5 cases) et l’attire de 2 cases vers toi.',
  },
  // Hostilité (12756) : 2 PA, 1 à 6 cases, 3/tour ; Feu 9-11, repousse de 2 cases.
  hostilite: {
    id: 'hostilite', name: 'Hostilité', element: 'feu', level: 40, pa: 2, range: [0, 6 * CELL], cooldown: TURN / 3,
    kind: { type: 'push', roll: hit('feu', 9, 11, 13), cells: 2 },
    text: 'Dommages Feu (jusqu’à 6 cases) et repousse la cible de 2 cases ; contre un obstacle, dommages de poussée.',
  },
  // Couronne d'Épines (12761) : 2 PA, sur soi, tous les 3 tours ; bouclier et renvoi des dommages de mêlée (1 tour) ;
  // Souffrance 6+ : bouclier en plus par ennemi proche. (« Pesanteur » sur les ennemis : sans équivalent utile en temps réel.)
  couronne: {
    id: 'couronne', name: 'Couronne d’Épines', element: null, level: 45, pa: 2, range: [0, 0], cooldown: 3 * TURN,
    kind: { type: 'thorns', shieldPct: 8, perEnemyPct: 3 },
    text: `Au contact d’ennemis : bouclier de 8 % de tes PV et renvoi des dommages de mêlée pendant ${TURN} s (toutes les 12 s). Souffrance 6+ : +3 % par ennemi proche.`,
  },
  // Transfusion (12738) : 2 PA, sur soi, 1/tour ; dommages Neutre (8 % de la vie du lanceur) en cercle de 3 cases.
  // (Le transfert de vie aux alliés ne sert qu'à l'Épée Vorace, qui n'a pas de PV : laissé de côté.)
  transfusion: {
    id: 'transfusion', name: 'Transfusion', element: 'neutre', level: 50, pa: 2, range: [0, 3 * CELL], cooldown: TURN,
    kind: { type: 'nova', hpPct: 8, radius: 3 * CELL },
    text: 'Explosion Neutre autour de toi (3 cases), selon ta vie restante : plus tu as de PV, plus elle fait mal.',
  },
};

/** Mutilation : Puissance par palier, sacrifice par palier, bouclier de Coagulation par palier (% PV max). */
export const MUTILATION = { power: 30, sacrifice: 0.1, maxStage: 3, shield: [5, 15, 25], stopBelow: 0.4, startAbove: 0.5 };
/** Supplice : soin des attaquants de la cible marquée (% des dommages). */
export const SUPPLICE_MARK = 0.2;

/** Souffrance : 1 charge par tranche de 10 % de PV perdus (elle suit la vie, ne retombe pas toute seule). */
/** Chaque charge : +5 % de dégâts finaux (armes et sorts), soit +50 % à 10 charges. */
export const SOUFFRANCE = { max: 10, pctPerCharge: 5, pullBonusAt: 6, pullBonusCells: 4 };

/** Sorts accessibles à un niveau donné (le grimoire). */
export const spellsForLevel = (level: number): SpellDef[] => Object.values(SPELLS).filter((s) => s.level <= level);

/** Nombre de cases de sorts selon le niveau (4 → 8). */
export const slotsForLevel = (level: number): number => 4 + [50, 100, 150, 200].filter((l) => level >= l).length;

/** Passifs gagnés par les cartes (cumulables jusqu'à `max`), valables pour le donjon en cours. */
export type PassiveId = 'vampirisme' | 'regeneration' | 'epines' | 'frenesie' | 'douleur' | 'endurance';
export const PASSIVES: Record<PassiveId, { name: string; text: string; per: number; max: number }> = {
  vampirisme: { name: 'Soif de sang', text: 'Vol de vie des sorts +10 % (50 % → 60 %).', per: 0.1, max: 3 },
  regeneration: { name: 'Sang neuf', text: 'Tu régénères 0,6 % de tes PV max par seconde.', per: 0.006, max: 3 },
  epines: { name: 'Épines', text: 'Renvoie 15 % des dégâts reçus à l’attaquant.', per: 0.15, max: 3 },
  frenesie: { name: 'Frénésie', text: 'Ton arme frappe 15 % plus vite.', per: 0.15, max: 3 },
  douleur: { name: 'Douleur exaltée', text: 'Chaque charge de Souffrance donne +1 % de dégâts de plus.', per: 1, max: 3 },
  endurance: { name: 'Peau de cuir', text: 'Tu subis 8 % de dégâts en moins.', per: 0.08, max: 3 },
};
