import type { CritterKind } from '../../art/champs-chibi';
import type { ChaferKind } from '../../art/chafer';
import { baseStats, type DamageRoll, type Stats } from '../formulas';
import { astrubMonsters } from './monsters.astrub';

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

export type Behavior = 'melee' | 'stealth' | 'lancer' | 'brute' | 'boss' | 'caster';
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
  /** Sort lancé à distance : la zone se pose là où se tenait le héros au début de l'annonce (offset = distance au héros). */
  atTarget?: boolean;
  /** Poison sur le héros (Graine Empoisonnée) : dommages Neutre par PA dépensé, pendant `duration` s. */
  poison?: { min: number; max: number; duration: number };
  /** Un jet par élément (Picoti du Scarabosse : 11-15 dans plusieurs éléments). */
  multi?: DamageRoll['element'][];
  /** Nombre d'éléments de `multi` utilisés à chaque coup, en alternance (les éléments tournent). Tous par défaut. */
  multiCycle?: number[];
  /** Vol de vie : le monstre récupère la moitié des dommages infligés. */
  steal?: boolean;
  /** Explose : le monstre meurt en frappant (Détonation du poulailler du Bomberfu). */
  selfDestruct?: boolean;
  /** Érosion en plus (%) : part des dommages qui réduit les PV max (Le Dentiste du Boostache : 30 %). */
  erosion?: number;
  /** Immobilise le héros (s) : Enchevêtrement de l'Ashi-magari. */
  root?: number;
  /** Repousse le héros touché de `push` cases (Kwakoukas Kwayal du Kwakwa : 4). */
  push?: number;
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
  /** Invocation (hors boss) : premier appel et intervalle (s), monstre invoqué, nombre maximum en même temps. */
  summons?: { first: number; every: number; id: string; max: number };
  /** Archimonstre (version rare et nommée d'un monstre de la zone). */
  archi?: { of: string };
  /** Soin unique : toute sa vie revient la première fois qu'il passe sous `below` de ses PV. */
  selfHeal?: { below: number };
  /** Charge : attaque spéciale en ligne, puis le monstre fonce sur toute la longueur. */
  charge?: { every: number; attack: MonsterAttack; dash: number };
  /**
   * Sort de soutien lancé toutes les `every` s sur les alliés à `radius` px ou moins (lui compris) :
   * soin du plus blessé (PV fixes ou % des PV max), ou bénédiction de tous (attaques plus rapides, PV en plus).
   */
  support?: { name: string; every: number; radius: number; heal?: [number, number]; healPct?: [number, number]; notBoss?: boolean; bless?: { duration: number; speed: number; hp: number } };
}

/** Dessin : Chafers et Kardorim (rig des Chafers), ou une des bestioles d'Incarnam et d'Astrub. */
export type MonsterArt = ChaferKind | 'kardorim' | 'kardorib' | CritterKind;

export interface BossKit {
  /** Craquement d'Os : accélère le boss et ses alliés proches (s) ; 0 = pas de craquement. */
  crackEvery: number;
  crackDuration: number;
  haste: number;
  crackRadius: number;
  /** Appel de Kardorib : invocation (s). */
  summonFirst: number;
  summonEvery: number;
  /** Monstre invoqué (au hasard dans la liste). */
  summon: string | string[];
  maxSummons: number;
  /** Nombre d'invocations à chaque appel (Naissance : 5 Scarafeuilles Immatures), 1 par défaut. */
  summonCount?: number;
  /** Soin périodique du boss (PV, toutes les `every` s). */
  heal?: { every: number; min: number; max: number; spell?: string };
  /** Frayeurs (Boostache) : repousse le héros proche de `push` cases et lui retire `pa` PA, toutes les `every` s. */
  fear?: { every: number; radius: number; push: number; pa: number; spell: string };
  /** L'Enfer des Zombies (Boostache) : réanime le dernier allié mort (100 % de ses PV), au plus toutes les `every` s. */
  revive?: { every: number; spell: string };
  /** Grand soin (Reconstitution Bwork de la Bworkette) : `pct` % des PV max, au plus toutes les `every` s, quand il est blessé ; `once` : une seule fois par combat. */
  regen?: { every: number; pct: number; spell: string; once?: boolean };
}

const neutre = (min: number, max: number): DamageRoll => ({ min, max, critBonus: 2, critBase: 3, element: 'neutre' });
const roll = (element: DamageRoll['element'], min: number, max: number): DamageRoll => ({ min, max, critBonus: 1, critBase: 3, element });
/** Grades DofusDB sans Force (monstres des Champs) : niveau, PV, résistances, XP, autres caractéristiques. */
const champ = (rows: [number, number, Res5, number][], more: (i: number) => Partial<MonsterGrade> = () => ({})) =>
  rows.map(([lv, hp, res, xp], i) => g(lv, hp, 0, res, xp, 0, 0, 0, 0, more(i)));

/** Sergent Chafer (DofusDB 4050) : Force et Intelligence, résistance Feu. */
/**
 * Grades DofusDB complets : niveau, PV, [Force, Intelligence, Chance, Agilité, Sagesse], résistances, XP, tacle, esquive PA, esquive PM.
 */
type Row = [number, number, [number, number, number, number, number], Res5, number, number, number, number];
const rows = (r: Row[]) => r.map(([lv, hp, [fo, int, cha, agi, sa], res, xp, tac, epa, epm]) =>
  g(lv, hp, fo, res, xp, sa, tac, epa, epm, { intelligence: int, chance: cha, agilite: agi }));

const SERGENT = [[7, 36, 60, 160, 20, 7], [8, 40, 70, 190, 25, 7], [9, 44, 80, 230, 30, 7], [10, 49, 90, 280, 35, 7], [11, 54, 100, 340, 40, 6]]
  .map(([lv, hp, f, xp, sa, epa], i) => g(lv, hp, f, feu(10 + i), xp, sa, 10, epa, 5, { intelligence: f }));

/** Les 4 Feux de la Route des âmes (3270-3273) : niveaux 1-5, Brûlure légère : Air 6-10 au contact. */
function feux(): Record<string, MonsterDef> {
  const out: Record<string, MonsterDef> = {};
  const list: [string, string, number, MonsterArt, number, number][] = [
    ['feuVif', 'Feu Vif', 3270, 'feuVif', 4, 0], ['feuJoie', 'Feu de Joie', 3271, 'feuJoie', 1, 0],
    ['feuFurieux', 'Feu Furieux', 3272, 'feuFurieux', 3, 0], ['feuFollet', 'Feu Follet', 3273, 'feuFollet', 2, 1],
  ];
  for (const [id, name, dofusId, art, el, dodge] of list) {
    out[id] = {
      id, name, dofusId,
      grades: [[1, 15, 10, 50], [2, 18, 11, 60], [3, 21, 12, 70], [4, 24, 13, 90], [5, 28, 15, 110]].map(([lv, hp, r, xp], i) => {
        const res: Res5 = [0, 0, 0, 0, 0];
        res[el] = r;
        return g(lv, hp, 0, res, xp, 0, 0, i >= 2 ? dodge : 0, i >= 2 ? dodge : 0);
      }),
      behavior: 'melee', speed: id === 'feuFurieux' ? 175 : 150, radius: 20, art, scale: 0.7,
      attack: { shape: 'circle', trigger: 85, size: 50, spread: 0, offset: 46, windup: 0.38, recover: 0.24, cooldown: [1.0, 1.4], roll: roll('air', 2, 3) },
    };
  }
  return out;
}

/** Élite de fin de carte (création, faute d'élite de ce niveau dans Dofus) : le vrai monstre, plus grand, PV et XP ×2,5. */
const eliteOf = (base: MonsterDef, id: string, name: string): MonsterDef => ({
  ...base, id, name, scale: (base.scale ?? 1) * 1.3, radius: base.radius + 8, hpMult: 2.5, xpMult: 2.5,
});

const ASTRUB = astrubMonsters(rows, roll, neutre);

export const MONSTERS: Record<string, MonsterDef> = {
  ...ASTRUB,
  piouElite: eliteOf(ASTRUB.piouRouge, 'piouElite', 'Piou Rouge d’élite'),
  arakneElite: eliteOf(ASTRUB.arakneMalade, 'arakneElite', 'Arakne Malade d’élite'),
  epouvanteurElite: eliteOf(ASTRUB.epouvanteur, 'epouvanteurElite', 'Épouvanteur d’élite'),
  larveElite: eliteOf(ASTRUB.larveOrange, 'larveElite', 'Larve Orange d’élite'),
  gardienneElite: eliteOf(ASTRUB.gardienne, 'gardienneElite', 'Gardienne Champêtre d’élite'),
  // branche C (élites : créations, comme celles d'Incarnam)
  roseElite: eliteOf(ASTRUB.roseDemo, 'roseElite', 'Rose Démoniaque d’élite'),
  pichonBleuElite: eliteOf(ASTRUB.pichonBleu, 'pichonBleuElite', 'Pichon Bleu d’élite'),
  pichonVertElite: eliteOf(ASTRUB.pichonVert, 'pichonVertElite', 'Pichon Vert d’élite'),
  klouneElite: eliteOf(ASTRUB.pichonKloune, 'klouneElite', 'Pichon Kloune d’élite'),
  // branche B (élites : créations)
  chefElite: eliteOf(ASTRUB.chefBouftou, 'chefElite', 'Chef de Guerre Bouftou d’élite'),
  bouftouElite: eliteOf(ASTRUB.bouftou, 'bouftouElite', 'Bouftou d’élite'),
  bouftonNoirElite: eliteOf(ASTRUB.bouftonNoir, 'bouftonNoirElite', 'Boufton Noir d’élite'),
  bouftouNoirElite: eliteOf(ASTRUB.bouftouNoir, 'bouftouNoirElite', 'Bouftou Noir d’élite'),
  tofuNoirElite: eliteOf(ASTRUB.tofuNoir, 'tofuNoirElite', 'Tofu Noir d’élite'),
  tofuMutantElite: eliteOf(ASTRUB.tofuMutant, 'tofuMutantElite', 'Tofu Mutant d’élite'),
  scaraVertElite: eliteOf(ASTRUB.scaraVert, 'scaraVertElite', 'Scarafeuille Vert d’élite'),
  scaraNoirElite: eliteOf(ASTRUB.scaraNoir, 'scaraNoirElite', 'Scarafeuille Noir d’élite'),
  fantassinElite: eliteOf(ASTRUB.chaferFantassin, 'fantassinElite', 'Chafer Fantassin d’élite'),
  maitreVampireElite: eliteOf(ASTRUB.maitreVampire, 'maitreVampireElite', 'Maître Vampire d’élite'),
  primitifElite: eliteOf(ASTRUB.chaferPrimitif, 'primitifElite', 'Chafer Primitif d’élite'),
  gargrouilleElite: eliteOf(ASTRUB.gargrouille, 'gargrouilleElite', 'Gargrouille d’élite'),
  // niveaux 41-50 (élites : créations)
  kwakereElite: eliteOf(ASTRUB.kwakereFlamme, 'kwakereElite', 'Kwakere de Flamme d’élite'),
  kwakereTerreElite: eliteOf(ASTRUB.kwakereTerre, 'kwakereTerreElite', 'Kwakere de Terre d’élite'),
  bworkElite: eliteOf(ASTRUB.bwork, 'bworkElite', 'Bwork d’élite'),
  bworkMageElite: eliteOf(ASTRUB.bworkMage, 'bworkMageElite', 'Bwork Mage d’élite'),
  bworkArcherElite: eliteOf(ASTRUB.bworkArcher, 'bworkArcherElite', 'Bwork Archer d’élite'),
  /**
   * Bouftou Royal (147) : boss du Donjon des Bouftous, niveau 30, 610 à 900 PV, toutes caractéristiques 120,
   * résistances Neutre 35, Terre 20, Feu 20, Eau 25, Air 5 ; 5 PM.
   * Morsure du Bouftou Royal : Feu 31-46 et vol de vie Feu 31-46 au contact (on garde une ligne : 31-46, valeur réelle) ;
   * Guérison Bouftou : soin 51-75 PV (sans délai dans Dofus, 1 fois par tour → toutes les 4 s). N'invoque pas.
   */
  bouftouRoyal: {
    id: 'bouftouRoyal', name: 'Bouftou Royal', dofusId: 147,
    grades: ([[610, 8600], [690, 10000], [760, 12000], [830, 15000], [900, 17280]] as const).map(([hp, xp]) => g(30, hp, 120, [35, 20, 20, 25, 5], xp, 120, 0, 0, 0, { intelligence: 120, chance: 120, agilite: 120 })),
    behavior: 'boss', speed: 120, radius: 48, art: 'bouftouRoyal', scale: 1.75,
    attack: { shape: 'circle', trigger: 140, size: 100, spread: 0, offset: 82, windup: 0.8, recover: 0.45, cooldown: [1.4, 1.9], roll: { min: 31, max: 46, critBonus: 5, critBase: 3, element: 'feu' } },
    boss: { crackEvery: 0, crackDuration: 0, haste: 1, crackRadius: 0, summonFirst: 999, summonEvery: 999, summon: 'bouftou', maxSummons: 0, heal: { every: 4, min: 51, max: 75, spell: 'Guérison Bouftou' } },
  },
  /**
   * Batofu (800) : boss du Donjon des Tofus, niveau 40, 760 à 1100 PV, Agilité 350, Sagesse 150,
   * résistances Neutre 37, Terre 9, Feu -14, Eau -4, Air 36 ; 10 PM.
   * Béco de Batofu : Air 17-26 à 1-2 cases (valeur réelle, comme les autres boss) ;
   * Lancer de Tofu Fugace : Neutre 21-30 en ligne à 1-10 cases, tous les 2 tours → toutes les 8 s (le Tofu Fugace invoqué n'est pas repris) ;
   * Gotame : invoque un Tofu Noir tous les 5 tours → toutes les 20 s. Liberté (repousse autour de lui) n'est pas reprise.
   */
  batofu: {
    id: 'batofu', name: 'Batofu', dofusId: 800,
    grades: ([[760, 17000], [850, 21000], [940, 25000], [1000, 30000], [1100, 34560]] as const).map(([hp, xp]) => g(40, hp, 0, [37, 9, -14, -4, 36], xp, 150, 0, 3, 2, { agilite: 350 })),
    behavior: 'boss', speed: 160, radius: 44, art: 'batofu', scale: 1.5,
    attack: { shape: 'circle', trigger: 150, size: 90, spread: 0, offset: 86, windup: 0.7, recover: 0.4, cooldown: [1.1, 1.5], roll: { min: 17, max: 26, critBonus: 4, critBase: 3, element: 'air' } },
    charge: { every: 8, dash: 0, attack: { shape: 'line', trigger: 480, size: 520, spread: 26, offset: 0, windup: 0.9, recover: 0.5, cooldown: [1.2, 1.6], roll: { min: 21, max: 30, critBonus: 4, critBase: 3, element: 'neutre' } } },
    boss: { crackEvery: 0, crackDuration: 0, haste: 1, crackRadius: 0, summonFirst: 8, summonEvery: 20, summon: 'tofuNoir', maxSummons: 2 },
  },
  /**
   * Scarabosse Doré (797) : boss du Donjon des Scarafeuilles, niveau 40, 1 600 à 2 400 PV, toutes caractéristiques 280, Sagesse 280,
   * résistances 24 % partout ; 3 PM.
   * Picoti : vol de vie 11-15 par élément, 1-3 cases en ligne, 1 fois par tour → toutes les 4 s ; dans Dofus les 4 éléments à chaque coup,
   * ici (choix d'Enzo) 2 éléments puis 1, en alternance, les éléments tournant (Eau+Terre, Air, Feu+Eau, Terre…) ;
   * Premiers soins : se soigne de 17-26 PV tous les 3 tours → toutes les 12 s ;
   * Naissance : invoque 5 Scarafeuilles Immatures d'un coup, une seule fois (choix d'Enzo : on peut les tuer et il n'en refait pas ; dans Dofus, tous les 5 tours).
   * Expulsion (repousse autour de lui) et Brouillard Empoisonné (-6 PO, -2 PM) ne sont pas repris.
   */
  scarabosse: {
    id: 'scarabosse', name: 'Scarabosse Doré', dofusId: 797,
    grades: ([[1600, 17000], [1800, 21000], [2000, 25000], [2200, 30000], [2400, 34560]] as const).map(([hp, xp]) => g(40, hp, 280, [24, 24, 24, 24, 24], xp, 280, 0, -7, 2, { intelligence: 280, chance: 280, agilite: 280 })),
    behavior: 'boss', speed: 100, radius: 48, art: 'scarabosse', scale: 1.6,
    attack: { shape: 'circle', trigger: 190, size: 90, spread: 0, offset: 110, windup: 0.85, recover: 0.5, cooldown: [3.6, 4.4], roll: { min: 11, max: 15, critBonus: 3, critBase: 3, element: 'eau' }, multi: ['eau', 'terre', 'air', 'feu'], multiCycle: [2, 1], steal: true },
    boss: { crackEvery: 0, crackDuration: 0, haste: 1, crackRadius: 0, summonFirst: 10, summonEvery: 1e9, summon: 'scaraImmature', maxSummons: 5, summonCount: 5, heal: { every: 12, min: 17, max: 26, spell: 'Premiers soins' } },
  },
  /**
   * Chafer Rōnin (3238) : boss du Donjon des Squelettes, niveau 40, 680 à 1 000 PV, Force et Intelligence 200 ; 4 PM, 10 PA.
   * Bushido : vol de vie Terre 31-35 au contact, 4 fois par tour (valeur réelle) ;
   * Kikoha : Feu 19-23 et -1 PM, 1-6 cases, 3 fois par tour → tir en ligne de loin toutes les 4 s ;
   * Bunshin : crée 4 illusions de lui-même (elles ne frappent pas et disparaissent au premier coup), au plus tous les 3 tours → toutes les 12 s.
   */
  ronin: {
    id: 'ronin', name: 'Chafer Rōnin', dofusId: 3238,
    grades: ([[680, 17000], [760, 21000], [840, 25000], [920, 30000], [1000, 34560]] as const).map(([hp, xp]) => g(40, hp, 200, [0, 0, 0, 0, 0], xp, 0, 0, 12, 24, { intelligence: 200 })),
    behavior: 'boss', speed: 130, radius: 40, art: 'ronin', scale: 1.5,
    attack: { shape: 'circle', trigger: 130, size: 90, spread: 0, offset: 74, windup: 0.55, recover: 0.3, cooldown: [1.0, 1.3], roll: { min: 31, max: 35, critBonus: 4, critBase: 3, element: 'terre' }, steal: true },
    charge: { every: 4, dash: 0, attack: { shape: 'line', trigger: 380, size: 400, spread: 24, offset: 0, windup: 0.75, recover: 0.4, cooldown: [1.2, 1.6], roll: { min: 19, max: 23, critBonus: 3, critBase: 3, element: 'feu' } } },
    boss: { crackEvery: 0, crackDuration: 0, haste: 1, crackRadius: 0, summonFirst: 6, summonEvery: 12, summon: 'roninIllusion', maxSummons: 4, summonCount: 4 },
  },
  /**
   * Boostache (2975) : boss de la Maison Fantôme, niveau 40, 820 à 1 200 PV, Force, Intelligence, Chance et Agilité 160 ;
   * résistances Neutre 55 %, Eau 15 %, Air 85 % (plafonnées à 50 %) ; 6 PM, 10 PA. Valeurs réelles (comme les autres boss) :
   * Le Dentiste : vol de vie Air 31-40 au contact et 30 % d'érosion, 3 fois par tour ;
   * Frayeurs : repousse de 3 cases tout ce qui l'entoure et -2 PA, tous les 3 tours → toutes les 12 s ;
   * Esprit empêtrant : invoque un Ashi-magari tous les 3 tours → toutes les 12 s ;
   * L'Enfer des Zombies : réanime le dernier allié mort avec toute sa vie, 1 fois par tour → toutes les 4 s.
   */
  boostache: {
    id: 'boostache', name: 'Boostache', dofusId: 2975,
    grades: ([[820, 17000], [910, 21000], [1000, 25000], [1100, 30000], [1200, 34560]] as const).map(([hp, xp]) => g(40, hp, 160, [55, 0, 0, 15, 85], xp, 0, 0, 0, 0, { intelligence: 160, chance: 160, agilite: 160 })),
    behavior: 'boss', speed: 140, radius: 40, art: 'boostache', scale: 1.5,
    attack: { shape: 'circle', trigger: 130, size: 90, spread: 0, offset: 74, windup: 0.55, recover: 0.3, cooldown: [1.0, 1.3], roll: { min: 31, max: 40, critBonus: 4, critBase: 3, element: 'air' }, steal: true, erosion: 30 },
    boss: { crackEvery: 0, crackDuration: 0, haste: 1, crackRadius: 0, summonFirst: 8, summonEvery: 12, summon: 'ashiMagari', maxSummons: 3,
      fear: { every: 12, radius: 150, push: 3, pa: 2, spell: 'Frayeurs' }, revive: { every: 4, spell: 'L’Enfer des Zombies' } },
  },
  /**
   * Kwakwa (2995) : boss du Nid du Kwakwa, niveau 50, 1 100 à 1 600 PV, toutes caractéristiques 300, Sagesse 150,
   * résistances 80 % partout (plafonnées à 50 %) ; 7 PM, 9 PA. Valeurs réelles (comme les autres boss) :
   * Kwabolition : 7-9 Feu, Eau, Terre et Air d'un coup au contact, 1 fois par tour → toutes les 4 s ;
   * Kwakoukas Kwayal : Neutre 11-15 et repousse de 4 cases, 1-7 cases → tir en ligne de loin toutes les 6 s ;
   * Kwarmée Kwayal : invoque les 4 Bwaks (Vent, Glace, Terre, Flamme) d'un coup, tous les 5 tours → toutes les 20 s ;
   * Kwaristocratie : +2 PA pendant 1 tour, tous les 4 tours → plus rapide pendant 4 s, toutes les 16 s (les +30 Puissance ne sont pas repris).
   * Wakpot Kwayal (vol de vie 8-11 dans les 4 éléments, 1-3 cases) n'est pas repris.
   */
  kwakwa: {
    id: 'kwakwa', name: 'Kwakwa', dofusId: 2995,
    grades: ([[1100, 30000], [1200, 37000], [1300, 45000], [1500, 52000], [1600, 60000]] as const).map(([hp, xp]) => g(50, hp, 300, [80, 80, 80, 80, 80], xp, 150, 20, -4, 0, { intelligence: 300, chance: 300, agilite: 300 })),
    behavior: 'boss', speed: 160, radius: 44, art: 'kwakwa', scale: 1.6,
    attack: { shape: 'circle', trigger: 130, size: 90, spread: 0, offset: 74, windup: 0.6, recover: 0.35, cooldown: [3.6, 4.4], roll: { min: 7, max: 9, critBonus: 2, critBase: 3, element: 'feu' }, multi: ['feu', 'eau', 'terre', 'air'] },
    charge: { every: 6, dash: 0, attack: { shape: 'line', trigger: 420, size: 440, spread: 26, offset: 0, windup: 0.8, recover: 0.45, cooldown: [1.0, 1.4], roll: { min: 11, max: 15, critBonus: 3, critBase: 3, element: 'neutre' }, push: 4 } },
    boss: { crackEvery: 16, crackDuration: 4, haste: 1.4, crackRadius: 0, summonFirst: 6, summonEvery: 20, summon: ['bwakVent', 'bwakGlace', 'bwakTerre', 'bwakFlamme'], maxSummons: 4, summonCount: 4 },
  },
  /**
   * Bworkette (792) : boss du Donjon des Bworks, niveau 50, 1 600 à 2 300 PV, Force 240, Intelligence 380, Agilité 140,
   * résistances Neutre 33, Terre 33, Feu 48, Eau 18, Air 28 ; 5 PM, 9 PA. Valeurs réelles :
   * Mot Croisé : Feu 15-18 sur ses ennemis et soin 15-18 de ses alliés (elle comprise), 0-6 cases, 2 fois par tour
   * → un coup à distance toutes les 2 s et un soin de 15-18 PV toutes les 4 s ;
   * Charge : Terre 21-40 au contact, tous les 2 tours → elle fonce sur le héros toutes les 8 s ;
   * Reconstitution Bwork : se soigne de 50 % de ses PV max, tous les 6 tours dans Dofus ; ici une seule fois par combat (choix d'Enzo : la vraie cadence la rendait imbattable).
   * Abolissement (Neutre 200) ne touche que les invocations : sans objet ici. Rage (+6-10 dommages) n'est pas reprise.
   */
  bworkette: {
    id: 'bworkette', name: 'Bworkette', dofusId: 792,
    grades: ([[1600, 30000], [1800, 37000], [1900, 45000], [2100, 52000], [2300, 60000]] as const).map(([hp, xp]) => g(50, hp, 240, [33, 33, 48, 18, 28], xp, 0, 0, 7, 10, { intelligence: 380, agilite: 140 })),
    behavior: 'boss', speed: 140, radius: 44, art: 'bworkette', scale: 1.5,
    attack: { shape: 'circle', trigger: 240, size: 70, spread: 0, offset: 0, windup: 0.75, recover: 0.35, cooldown: [1.6, 2.2], roll: { min: 15, max: 18, critBonus: 3, critBase: 3, element: 'feu' }, atTarget: true },
    charge: { every: 8, dash: 240, attack: { shape: 'line', trigger: 380, size: 300, spread: 30, offset: 0, windup: 0.85, recover: 0.5, cooldown: [1.2, 1.6], roll: { min: 21, max: 40, critBonus: 4, critBase: 3, element: 'terre' } } },
    boss: { crackEvery: 0, crackDuration: 0, haste: 1, crackRadius: 0, summonFirst: 999, summonEvery: 999, summon: 'bwork', maxSummons: 0,
      heal: { every: 4, min: 15, max: 18, spell: 'Mot Croisé' }, regen: { every: 24, pct: 50, spell: 'Reconstitution Bwork', once: true } },
  },
  /** Ashi-magari (2976) : invocation du Boostache, 150 PV ; Enchevêtrement : immobilise ce qui l'entoure pendant 1 tour (4 s), sans dommages. */
  ashiMagari: {
    id: 'ashiMagari', name: 'Ashi-magari', dofusId: 2976,
    grades: [g(40, 150, 0, [0, 0, 0, 0, 0], 0, 0, 0, 0, 0)],
    behavior: 'melee', speed: 50, radius: 22, art: 'ashimagari', scale: 0.8,
    attack: { shape: 'circle', trigger: 90, size: 80, spread: 0, offset: 0, windup: 0.6, recover: 0.4, cooldown: [3.6, 4.4], roll: { min: 0, max: 0, critBonus: 0, critBase: 0, element: 'neutre' }, root: 4 },
  },
  /** Illusion du Chafer Rōnin (Bunshin) : son apparence, aucun dégât, disparaît au premier coup ; ne rapporte rien. */
  roninIllusion: {
    id: 'roninIllusion', name: 'Illusion du Chafer Rōnin', dofusId: 0,
    grades: [g(40, 1, 0, [0, 0, 0, 0, 0], 0, 0, 0, 0, 0)],
    behavior: 'melee', speed: 130, radius: 32, art: 'ronin', scale: 1.5,
    attack: { shape: 'circle', trigger: 130, size: 90, spread: 0, offset: 74, windup: 0.55, recover: 0.3, cooldown: [1.0, 1.3], roll: { min: 0, max: 0, critBonus: 0, critBase: 0, element: 'terre' } },
  },
  /**
   * Mob l'Éponge (928) : boss du Château Ensablé, niveau 20, 280 à 420 PV, toutes caractéristiques 80, résistances 14 %, 3 PM.
   * Dégraissage : vol de vie Eau 15-20 au contact (valeur réelle, comme les autres boss) ;
   * Régénération Spontanée : se soigne de 51-75 PV tous les 2 tours → toutes les 8 s. N'invoque pas (comme dans Dofus).
   */
  mobEponge: {
    id: 'mobEponge', name: 'Mob l’Éponge', dofusId: 928,
    grades: ([[280, 3300], [320, 4200], [350, 5000], [380, 5900], [420, 6720]] as const).map(([hp, xp]) => g(20, hp, 80, [14, 14, 14, 14, 14], xp, 80, 0, 0, 0, { intelligence: 80, chance: 80, agilite: 80 })),
    behavior: 'boss', speed: 95, radius: 40, art: 'mobEponge', scale: 1.5,
    attack: { shape: 'circle', trigger: 130, size: 90, spread: 0, offset: 74, windup: 0.75, recover: 0.45, cooldown: [1.3, 1.8], roll: { min: 15, max: 20, critBonus: 4, critBase: 3, element: 'eau' } },
    boss: { crackEvery: 0, crackDuration: 0, haste: 1, crackRadius: 0, summonFirst: 999, summonEvery: 999, summon: 'pichonOrange', maxSummons: 0, heal: { every: 8, min: 51, max: 75, spell: 'Régénération Spontanée' } },
  },
  /**
   * Tournesol Affamé (799) : boss de la Grange, niveau 20, 550 à 810 PV, toutes caractéristiques 80, 2 PM.
   * Goinfrage : vol de vie Eau 17-30 au contact (valeur réelle, comme Kardorim) ;
   * Appel des Champs : invoque Gardienne, Pissenlit, Rose ou Épouvanteur tous les 3 tours → toutes les 12 s ;
   * Soin Feuillu : 17-26 PV tous les 4 tours → toutes les 16 s.
   */
  tournesolAffame: {
    id: 'tournesolAffame', name: 'Tournesol Affamé', dofusId: 799,
    grades: ([[550, 3300], [610, 4200], [680, 5100], [740, 5900], [810, 6720]] as const).map(([hp, xp]) => g(20, hp, 80, [25, 25, 25, -10, -15], xp, 60, 0, 0, 0, { intelligence: 80, chance: 80, agilite: 80 })),
    behavior: 'boss', speed: 70, radius: 46, art: 'tournesolAffame', scale: 1.55,
    attack: { shape: 'circle', trigger: 140, size: 96, spread: 0, offset: 80, windup: 0.85, recover: 0.5, cooldown: [1.5, 2.1], roll: { min: 17, max: 30, critBonus: 4, critBase: 3, element: 'eau' } },
    boss: { crackEvery: 0, crackDuration: 0, haste: 1, crackRadius: 0, summonFirst: 5, summonEvery: 12, summon: ['gardienne', 'pissenlitDiabo', 'roseDemo', 'epouvanteur'], maxSummons: 3, heal: { every: 16, min: 17, max: 26 } },
  },
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

  /* ---------- Champs d'Incarnam (carte de farm 1) : vraies fiches DofusDB, sorts de grade 1 × 0,25 (comme les Chafers) ---------- */

  /** Tofu Chimérique (970) : niveaux 1-5, Agilité 20-28. Béco du Tofu : Air 13-18, 1-2 cases → coups de bec rapides. */
  tofu: {
    id: 'tofu', name: 'Tofu Chimérique', dofusId: 970,
    grades: champ([[1, 15, [0, -10, -5, 0, 5], 50], [2, 18, [0, -9, -4, 0, 6], 60], [3, 21, [0, -8, -3, 0, 7], 70], [4, 24, [0, -7, -2, 0, 8], 90], [5, 28, [0, -6, -1, 0, 9], 110]], (i) => ({ agilite: 20 + 2 * i })),
    behavior: 'melee', speed: 200, radius: 22, art: 'tofu',
    attack: { shape: 'circle', trigger: 90, size: 54, spread: 0, offset: 50, windup: 0.32, recover: 0.22, cooldown: [0.8, 1.2], roll: roll('air', 3, 5) },
  },
  /** Pissenlit Miroitant (979) : niveaux 2-6. Herbe Sauvage : Feu 21-30, 0-5 cases → zone posée à distance. */
  pissenlit: {
    id: 'pissenlit', name: 'Pissenlit Miroitant', dofusId: 979,
    grades: champ([[2, 18, [-25, 0, -25, -10, -4], 60], [3, 21, [-20, 0, -20, -8, -3], 70], [4, 24, [-15, 0, -15, -6, -2], 90], [5, 28, [-10, 0, -10, -4, -1], 110], [6, 32, [-5, 0, -5, -2, 0], 130]]),
    behavior: 'caster', speed: 80, radius: 22, art: 'pissenlit',
    attack: { shape: 'circle', trigger: 300, size: 62, spread: 0, offset: 0, windup: 0.95, recover: 0.4, cooldown: [2.2, 3.0], roll: roll('feu', 5, 8), atTarget: true },
  },
  /** Rose Vaporeuse (980) : niveaux 2-6, Intelligence 10-30. Effleurement : Neutre 11-14 au corps à corps. */
  rose: {
    id: 'rose', name: 'Rose Vaporeuse', dofusId: 980,
    grades: champ([[2, 18, [-4, -10, -3, -10, -4], 60], [3, 21, [-4, -9, -3, -9, -4], 70], [4, 24, [-3, -8, -2, -8, -3], 90], [5, 28, [-2, -7, -1, -7, -2], 110], [6, 32, [-2, -6, -1, -6, -2], 130]], (i) => ({ intelligence: i === 4 ? 30 : 10 })),
    behavior: 'melee', speed: 125, radius: 22, art: 'rose',
    attack: { shape: 'circle', trigger: 95, size: 58, spread: 0, offset: 52, windup: 0.4, recover: 0.25, cooldown: [0.9, 1.3], roll: neutre(3, 4) },
  },
  /**
   * Tournesol Nébuleux (981) : niveaux 3-7. Racine Barbelée : Terre 15-20, 1-8 cases.
   * Élite de fin de carte (création : pas d'élite de ce niveau dans Dofus) : plus grand, PV et XP ×2,5.
   */
  tournesol: {
    id: 'tournesol', name: 'Tournesol Nébuleux', dofusId: 981,
    grades: champ([[3, 21, [10, 0, -10, 0, -15], 70], [4, 24, [11, 0, -9, 0, -14], 90], [5, 28, [12, 0, -8, 0, -13], 110], [6, 32, [13, 0, -7, 0, -12], 130], [7, 36, [14, 0, -6, 0, -11], 160]]),
    behavior: 'caster', speed: 70, radius: 30, art: 'tournesol', scale: 1.3, hpMult: 2.5, xpMult: 2.5,
    attack: { shape: 'circle', trigger: 480, size: 78, spread: 0, offset: 0, windup: 1.0, recover: 0.45, cooldown: [1.8, 2.4], roll: roll('terre', 4, 5), atTarget: true },
  },
  /* ---------- Pâturages d'Incarnam (carte 2) : DofusDB, sorts de grade 1 × 0,25 ---------- */

  /** Boufton Pâlichon (972) : niveaux 3-7, 2 PM (lent). Mâchouillage : Air 19-26 au corps à corps. */
  palichon: {
    id: 'palichon', name: 'Boufton Pâlichon', dofusId: 972,
    grades: rows([[3, 21, [0, 0, 0, 15, 0], [0, -4, -5, -5, 1], 70, 0, 0, 0], [4, 24, [0, 0, 0, 20, 0], [0, -3, -4, -4, 2], 90, 0, 0, 0], [5, 28, [0, 0, 0, 25, 0], [0, -2, -3, -3, 3], 110, 0, 0, 0], [6, 32, [0, 0, 0, 30, 0], [0, -1, -2, -2, 4], 130, 0, 0, 0], [7, 36, [0, 0, 0, 35, 0], [0, 0, -1, -1, 5], 160, 0, 0, 0]]),
    behavior: 'melee', speed: 115, radius: 22, art: 'palichon', scale: 0.9,
    attack: { shape: 'circle', trigger: 90, size: 54, spread: 0, offset: 48, windup: 0.42, recover: 0.25, cooldown: [0.9, 1.3], roll: roll('air', 5, 7) },
  },
  /** Boufton Orageux (973) : niveaux 3-7, 2 PM. Mordillement : Eau 19-26 au corps à corps. */
  orageux: {
    id: 'orageux', name: 'Boufton Orageux', dofusId: 973,
    grades: rows([[3, 21, [0, 0, 0, 15, 0], [-3, -10, -8, -8, -2], 70, 0, 0, 0], [4, 24, [0, 0, 0, 20, 0], [-3, -8, -9, -9, -2], 90, 0, 0, 0], [5, 28, [0, 0, 0, 25, 0], [-2, -6, -10, -10, -1], 110, 0, 0, 0], [6, 32, [0, 0, 0, 30, 0], [-1, -4, -11, -11, 0], 130, 0, 0, 0], [7, 36, [0, 0, 0, 35, 0], [-1, -2, -12, -12, 0], 160, 0, 0, 0]]),
    behavior: 'melee', speed: 115, radius: 22, art: 'orageux', scale: 0.9,
    attack: { shape: 'circle', trigger: 90, size: 54, spread: 0, offset: 48, windup: 0.42, recover: 0.25, cooldown: [0.9, 1.3], roll: roll('eau', 5, 7) },
  },
  /** Bouftou Nuageux (971) : niveaux 4-8, 3 PM. Morsure : Terre 2-4 seulement (vraie valeur) → il mord peu mais encaisse (Neutre 10-14 %). */
  nuageux: {
    id: 'nuageux', name: 'Bouftou Nuageux', dofusId: 971,
    grades: rows([[4, 24, [0, 0, 0, 10, 5], [10, -10, -15, 0, 0], 90, 0, 0, 0], [5, 28, [0, 0, 0, 11, 6], [11, -9, -14, 0, 0], 110, 0, 0, 0], [6, 32, [0, 0, 0, 12, 7], [12, -8, -13, 0, 0], 130, 0, 0, 0], [7, 36, [0, 0, 0, 13, 8], [13, -7, -12, 0, 0], 160, 0, 0, 0], [8, 40, [0, 0, 0, 14, 9], [14, -6, -11, 0, 0], 190, 0, 0, 0]]),
    behavior: 'melee', speed: 135, radius: 28, art: 'nuageux', scale: 1.25,
    attack: { shape: 'circle', trigger: 100, size: 62, spread: 0, offset: 56, windup: 0.45, recover: 0.25, cooldown: [0.9, 1.3], roll: roll('terre', 1, 1) },
  },
  /**
   * Bouftor Éthéré (984) : niveaux 5-9, 4 PM, grosse esquive. Morsure du Bouftou : Feu 21-30 au corps à corps ;
   * Fureur du Bouftou : Terre 16-25, 1-4 cases en ligne, tous les 2 tours → charge annoncée toutes les 8 s.
   * Élite de fin de carte : plus grand, PV et XP ×2,5.
   */
  bouftor: {
    id: 'bouftor', name: 'Bouftor Éthéré', dofusId: 984,
    grades: rows([[5, 28, [10, 0, 0, 25, 10], [0, 0, -10, -10, -4], 110, 0, 9, 12], [6, 32, [15, 0, 0, 30, 20], [0, 0, -8, -8, -3], 130, 0, 11, 16], [7, 36, [20, 0, 0, 35, 30], [0, 0, -6, -6, -2], 160, 0, 14, 20], [8, 40, [25, 0, 0, 40, 40], [0, 0, -4, -4, -1], 190, 0, 16, 24], [9, 44, [30, 0, 0, 45, 50], [0, 0, -2, -2, 0], 230, 0, 19, 28]]),
    behavior: 'brute', speed: 125, radius: 34, art: 'bouftor', scale: 1.55, hpMult: 2.5, xpMult: 2.5,
    attack: { shape: 'circle', trigger: 115, size: 74, spread: 0, offset: 66, windup: 0.55, recover: 0.3, cooldown: [1.1, 1.5], roll: roll('feu', 5, 8) },
    charge: {
      every: 8, dash: 260,
      attack: { shape: 'line', trigger: 360, size: 300, spread: 30, offset: 0, windup: 0.85, recover: 0.6, cooldown: [1.2, 1.6], roll: roll('terre', 4, 6) },
    },
  },

  /* ---------- Forêt d'Incarnam (carte 3) ---------- */

  /** Chakrobat (982) : niveaux 4-8. Souffle Céleste : Terre 4-5 au corps à corps (1 fois par tour) → faible mais vif. */
  chakrobat: {
    id: 'chakrobat', name: 'Chakrobat', dofusId: 982,
    grades: rows([[4, 24, [0, 0, 0, 0, 0], [-10, -4, -4, -5, 0], 90, 0, 0, 0], [5, 28, [0, 0, 0, 0, 0], [-8, -3, -3, -4, 0], 110, 0, 1, 1], [6, 32, [0, 0, 0, 0, 0], [-6, -2, -2, -3, 0], 130, 0, 1, 1], [7, 36, [0, 0, 0, 0, 0], [-4, -1, -1, -2, 0], 160, 0, 2, 2], [8, 40, [0, 0, 0, 0, 0], [-2, 0, 0, -1, 0], 190, 0, 2, 2]]),
    behavior: 'melee', speed: 190, radius: 22, art: 'chakrobat', scale: 0.95,
    attack: { shape: 'circle', trigger: 90, size: 54, spread: 0, offset: 48, windup: 0.32, recover: 0.22, cooldown: [1.2, 1.6], roll: roll('terre', 1, 2) },
  },
  /** Tigrimas (4106) : niveaux 5-9, tacle 20. Lancer de Feu Vif : Neutre 17-23, 1-3 cases en ligne. */
  tigrimas: {
    id: 'tigrimas', name: 'Tigrimas', dofusId: 4106,
    grades: rows([[5, 28, [10, 0, 20, 10, 10], [2, 0, -10, 2, 0], 110, 20, 7, 8], [6, 32, [20, 0, 25, 20, 20], [4, 0, -8, 4, 0], 130, 20, 10, 12], [7, 36, [30, 0, 30, 30, 30], [6, 0, -6, 6, 0], 160, 20, 12, 16], [8, 40, [40, 0, 35, 40, 40], [8, 0, -4, 8, 0], 190, 20, 15, 20], [9, 44, [50, 0, 40, 50, 50], [10, 0, -2, 10, 0], 230, 20, 17, 24]]),
    behavior: 'lancer', speed: 140, radius: 24, art: 'tigrimas',
    // Reconstitution Céleste (tous les 15 tours dans Dofus) : une fois par combat, sous 30 % de PV
    selfHeal: { below: 0.3 },
    attack: { shape: 'line', trigger: 170, size: 180, spread: 22, offset: 0, windup: 0.5, recover: 0.3, cooldown: [1.2, 1.6], roll: neutre(4, 6) },
  },
  /**
   * Ronronchon (4105) : niveaux 6-10. Ron-Ron : Neutre 11-20, 1-2 cases ; Écrasement du Ronronchon : Neutre 16-20 + poussée.
   * Élite de fin de carte : plus grand, PV et XP ×2,5. (Son Invocation de Feu de Joie n'est pas encore reprise.)
   */
  ronronchon: {
    id: 'ronronchon', name: 'Ronronchon', dofusId: 4105,
    grades: rows([[6, 32, [20, 10, 0, 10, 20], [0, 0, -10, 2, -10], 130, 10, 0, 0], [7, 36, [30, 20, 0, 15, 30], [0, 0, -8, 4, -8], 160, 10, 0, 0], [8, 40, [40, 30, 0, 20, 40], [0, 0, -6, 6, -6], 190, 10, -1, 0], [9, 44, [60, 40, 0, 25, 60], [0, 0, -4, 8, -4], 230, 10, -1, 0], [10, 49, [80, 50, 0, 30, 80], [0, 0, -2, 10, -2], 280, 10, -2, 0]]),
    behavior: 'brute', speed: 105, radius: 36, art: 'ronronchon', scale: 1.3, hpMult: 2.5, xpMult: 2.5,
    // Invocation de Feu de Joie (tous les 5 tours dans Dofus) : toutes les 20 s, 2 au plus
    summons: { first: 6, every: 20, id: 'feuJoie', max: 2 },
    attack: { shape: 'cone', trigger: 140, size: 165, spread: 0.7, offset: 0, windup: 0.65, recover: 0.35, cooldown: [1.2, 1.7], roll: neutre(3, 5) },
    charge: {
      every: 7, dash: 200,
      attack: { shape: 'line', trigger: 300, size: 240, spread: 32, offset: 0, windup: 0.9, recover: 0.6, cooldown: [1.2, 1.6], roll: neutre(4, 5) },
    },
  },

  /* ---------- Monstres errants d'Incarnam (Lac, Mine, Route des âmes) : rencontres dans les cartes ---------- */

  /** Plikplok (4108) : niveaux 3-7. Plouf : Eau 6-10 autour de lui. */
  plikplok: {
    id: 'plikplok', name: 'Plikplok', dofusId: 4108,
    grades: rows([[3, 21, [0, 0, 0, 0, 0], [0, 0, -15, 15, 0], 70, 0, 3, 0], [4, 24, [0, 0, 0, 0, 0], [0, 0, -14, 16, 0], 90, 0, 3, 2], [5, 28, [0, 0, 0, 0, 0], [0, 0, -13, 17, 0], 110, 0, 4, 3], [6, 32, [0, 0, 0, 0, 0], [0, 0, -12, 18, 0], 130, 0, 5, 4], [7, 36, [0, 0, 0, 0, 0], [0, 0, -11, 19, 0], 160, 0, 5, 5]]),
    behavior: 'melee', speed: 120, radius: 24, art: 'plikplok', scale: 0.85,
    attack: { shape: 'circle', trigger: 85, size: 80, spread: 0, offset: 0, windup: 0.5, recover: 0.3, cooldown: [1.2, 1.6], roll: roll('eau', 2, 3) },
  },
  /** Petit Gloot (4109) : niveaux 2-6. Glougloutte : Eau 6-10, 1-2 cases, et repousse. */
  gloot: {
    id: 'gloot', name: 'Petit Gloot', dofusId: 4109,
    grades: rows([[2, 18, [0, 0, 0, 0, 0], [0, 0, 0, 10, -20], 60, 0, 3, 0], [3, 21, [0, 0, 0, 0, 0], [0, 0, 0, 11, -19], 70, 0, 3, 2], [4, 24, [0, 0, 0, 0, 0], [0, 0, 0, 12, -18], 90, 0, 4, 3], [5, 28, [0, 0, 0, 0, 0], [0, 0, 0, 13, -17], 110, 0, 5, 4], [6, 32, [0, 0, 0, 0, 0], [0, 0, 0, 14, -16], 130, 0, 5, 5]]),
    behavior: 'melee', speed: 125, radius: 22, art: 'gloot', scale: 0.75,
    attack: { shape: 'circle', trigger: 110, size: 58, spread: 0, offset: 66, windup: 0.42, recover: 0.25, cooldown: [1.0, 1.4], roll: roll('eau', 2, 3) },
  },
  /** Grand Splatch (4110) : niveaux 4-8. Splotch : Eau 6-10, 1-3 cases en ligne. */
  splatch: {
    id: 'splatch', name: 'Grand Splatch', dofusId: 4110,
    grades: rows([[4, 24, [0, 0, 0, 0, 0], [0, -10, 0, 20, 0], 90, 0, 3, 0], [5, 28, [0, 0, 0, 0, 0], [0, -9, 0, 21, 0], 110, 0, 3, 2], [6, 32, [0, 0, 0, 0, 0], [0, -8, 0, 22, 0], 130, 0, 4, 3], [7, 36, [0, 0, 0, 0, 0], [0, -7, 0, 23, 0], 160, 0, 5, 4], [8, 40, [0, 0, 0, 0, 0], [0, -6, 0, 24, 0], 190, 0, 5, 5]]),
    behavior: 'lancer', speed: 100, radius: 26, art: 'splatch',
    attack: { shape: 'line', trigger: 170, size: 180, spread: 24, offset: 0, windup: 0.55, recover: 0.3, cooldown: [1.2, 1.6], roll: roll('eau', 2, 3) },
  },
  /** Aminite (4107) : niveaux 5-9, Intelligence 150-190. Coup de Piléus : Neutre 11-20 au corps à corps. */
  aminite: {
    id: 'aminite', name: 'Aminite', dofusId: 4107,
    grades: rows([[5, 28, [20, 150, 0, 10, 0], [20, 0, -10, 10, -10], 110, 0, 0, 0], [6, 32, [25, 160, 0, 15, 0], [21, 0, -9, 11, -9], 130, 0, 0, 0], [7, 36, [30, 170, 0, 20, 0], [22, 0, -8, 12, -8], 160, 0, 0, 0], [8, 40, [35, 180, 0, 25, 0], [23, 0, -7, 13, -7], 190, 0, 0, 0], [9, 44, [40, 190, 0, 30, 0], [24, 0, -6, 14, -6], 230, 0, 0, 0]]),
    behavior: 'melee', speed: 110, radius: 26, art: 'aminite',
    attack: { shape: 'circle', trigger: 100, size: 62, spread: 0, offset: 56, windup: 0.5, recover: 0.3, cooldown: [1.1, 1.5], roll: neutre(3, 5) },
  },
  ...feux(),

  /* ---------- Cimetière d'Incarnam (carte 4) ---------- */

  /** Chafer Éclaireur (4048) : niveaux 6-10, Intelligence. Flèche de Feu : Feu 8-12, 1-6 cases en ligne (+ brûlure). */
  chaferEclaireur: {
    id: 'chaferEclaireur', name: 'Chafer Éclaireur', dofusId: 4048,
    grades: rows([[6, 32, [10, 30, 0, 10, 10], [0, 10, 0, 0, 0], 130, 5, 3, 2], [7, 36, [15, 40, 0, 15, 10], [0, 11, 0, 0, 0], 160, 5, 3, 2], [8, 40, [20, 50, 0, 20, 10], [0, 12, 0, 0, 0], 190, 5, 3, 2], [9, 44, [25, 60, 0, 25, 10], [0, 13, 0, 0, 0], 230, 5, 3, 2], [10, 49, [30, 70, 0, 30, 10], [0, 14, 0, 0, 0], 280, 5, 3, 2]]),
    behavior: 'lancer', speed: 120, radius: 24, art: 'eclaireur',
    attack: { shape: 'line', trigger: 300, size: 320, spread: 18, offset: 0, windup: 0.6, recover: 0.3, cooldown: [1.4, 1.9], roll: roll('feu', 3, 4) },
  },
  /** Élite du Cimetière (création : pas d'élite de ce niveau dans Dofus) : le vrai Chafer Piquier, plus grand, PV et XP ×2,5. */
  piquierElite: {
    id: 'piquierElite', name: 'Chafer Piquier d’élite', dofusId: 4049,
    grades: [g(7, 36, 20, eau(10), 160, 0, 15, 6, 0), g(8, 40, 30, eau(11), 190, 0, 15, 6, 0), g(9, 44, 40, eau(12), 230, 0, 15, 6, 0), g(10, 49, 50, eau(13), 280, 0, 15, 6, 0), g(11, 54, 60, eau(14), 340, 0, 15, 6, 0)],
    behavior: 'lancer', speed: 115, radius: 32, art: 'piquier', scale: 1.3, hpMult: 2.5, xpMult: 2.5,
    attack: { shape: 'line', trigger: 220, size: 240, spread: 28, offset: 0, windup: 0.6, recover: 0.32, cooldown: [1.0, 1.4], roll: neutre(5, 9) },
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
