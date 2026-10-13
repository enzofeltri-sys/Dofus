/**
 * Formules de combat, reprises de Dofus.
 * Fonctions pures (aucun état), testées dans formulas.test.ts.
 */

export type Element = 'neutre' | 'terre' | 'feu' | 'eau' | 'air';
export const ELEMENTS: Element[] = ['neutre', 'terre', 'feu', 'eau', 'air'];

/**
 * Fiche de caractéristiques d'une entité (joueur ou monstre), comme la fiche de Dofus.
 * Les valeurs dérivées (tacle, fuite, esquive, retrait, prospection, initiative) se calculent
 * avec les fonctions plus bas : ici on ne stocke que les bonus.
 */
export interface Stats {
  // Caractéristiques
  vitalite: number;
  sagesse: number;
  force: number;
  intelligence: number;
  chance: number;
  agilite: number;
  // Points et utilitaires
  pa: number;
  pm: number;
  portee: number;
  invocations: number;
  initiative: number;
  prospection: number;
  // Dommages
  puissance: number;
  /** Dommages fixes ajoutés à chaque coup. */
  dommages: number;
  /** Dommages fixes par élément (Dommages Terre, Feu…). */
  dommagesElem: Record<Element, number>;
  /** Chance de coup critique, en %. */
  critique: number;
  /** Dommages critiques fixes ajoutés sur un coup critique. */
  dommagesCritiques: number;
  soins: number;
  dommagesPoussee: number;
  /** Renvoie ces dommages à chaque attaque de mêlée reçue. */
  renvoi: number;
  /** Dommages finaux en % (mêlée / distance, armes / sorts). */
  pctMelee: number;
  pctDistance: number;
  pctArme: number;
  pctSort: number;
  // Résistances
  /** Résistances en % par élément (négatives = faiblesse). */
  resPct: Record<Element, number>;
  /** Résistances fixes par élément. */
  resFixe: Record<Element, number>;
  resCrit: number;
  resPoussee: number;
  /** Résistances finales en % (mêlée / distance). */
  resMelee: number;
  resDistance: number;
  // Combat
  tacle: number;
  fuite: number;
  retraitPA: number;
  retraitPM: number;
  esquivePA: number;
  esquivePM: number;
  /** Érosion en % : part des dommages subis qui réduit les PV max jusqu'à la fin du combat. */
  erosion: number;
}

export const NO_RES: Record<Element, number> = { neutre: 0, terre: 0, feu: 0, eau: 0, air: 0 };

/** Érosion de base de Dofus. */
export const BASE_EROSION = 10;
export const MAX_EROSION = 50;
/** Résistances en % plafonnées (comme en JcJ dans Dofus). */
export const RES_CAP = 50;

export function baseStats(over: Partial<Stats> = {}): Stats {
  return {
    vitalite: 0, sagesse: 0, force: 0, intelligence: 0, chance: 0, agilite: 0,
    pa: 0, pm: 0, portee: 0, invocations: 0, initiative: 0, prospection: 0,
    puissance: 0, dommages: 0, dommagesElem: { ...NO_RES }, critique: 0, dommagesCritiques: 0,
    soins: 0, dommagesPoussee: 0, renvoi: 0,
    pctMelee: 0, pctDistance: 0, pctArme: 0, pctSort: 0,
    resPct: { ...NO_RES }, resFixe: { ...NO_RES }, resCrit: 0, resPoussee: 0, resMelee: 0, resDistance: 0,
    tacle: 0, fuite: 0, retraitPA: 0, retraitPM: 0, esquivePA: 0, esquivePM: 0,
    erosion: BASE_EROSION,
    ...over,
  };
}

/** Additionne des fiches (base + équipement + bonus) ; les champs par élément s'additionnent aussi. */
export function addStats(a: Stats, ...more: Partial<Stats>[]): Stats {
  const out: Stats = { ...a, dommagesElem: { ...a.dommagesElem }, resPct: { ...a.resPct }, resFixe: { ...a.resFixe } };
  for (const b of more) {
    for (const [k, v] of Object.entries(b) as [keyof Stats, Stats[keyof Stats]][]) {
      if (typeof v === 'number') (out[k] as number) += v;
      else if (v) for (const el of ELEMENTS) (out[k] as Record<Element, number>)[el] += v[el] ?? 0;
    }
  }
  return out;
}

/* ---------- Valeurs dérivées (formules de Dofus) ---------- */

/** Tacle = bonus + Agilité / 10. */
export const tackleOf = (s: Stats) => s.tacle + Math.floor(s.agilite / 10);
/** Fuite = bonus + Agilité / 10. */
export const escapeOf = (s: Stats) => s.fuite + Math.floor(s.agilite / 10);
/** Esquive et retrait PA/PM = bonus + Sagesse / 10. */
export const dodgePaOf = (s: Stats) => s.esquivePA + Math.floor(s.sagesse / 10);
export const dodgePmOf = (s: Stats) => s.esquivePM + Math.floor(s.sagesse / 10);
export const retraitPaOf = (s: Stats) => s.retraitPA + Math.floor(s.sagesse / 10);
export const retraitPmOf = (s: Stats) => s.retraitPM + Math.floor(s.sagesse / 10);
/** Prospection = 100 + bonus + Chance / 10. */
export const prospectionOf = (s: Stats) => 100 + s.prospection + Math.floor(s.chance / 10);
/** Initiative = (somme des caractéristiques + bonus) × PV / PV max. */
export function initiativeOf(s: Stats, hp = 1, hpMax = 1): number {
  const total = Math.max(0, s.force) + Math.max(0, s.intelligence) + Math.max(0, s.chance) + Math.max(0, s.agilite) + s.initiative;
  return Math.max(0, Math.floor((total * hp) / Math.max(1, hpMax)));
}
/** Bonus d'XP de la Sagesse : × (100 + Sagesse) / 100. */
export const wisdomXp = (s: Stats) => Math.max(0, 100 + s.sagesse) / 100;

/**
 * Probabilité de se dégager d'un tacle (Dofus) : (fuite + 2) / (2 × (tacle + 2)), bornée à [0, 1].
 * À égalité on garde la moitié de ses PM.
 */
export function escapeChance(fuite: number, tacle: number): number {
  return Math.max(0, Math.min(1, (fuite + 2) / (2 * (Math.max(0, tacle) + 2))));
}

/** Caractéristique qui augmente les dommages d'un élément (comme dans Dofus : neutre et terre → Force). */
export function caracFor(s: Stats, el: Element): number {
  switch (el) {
    case 'neutre':
    case 'terre':
      return s.force;
    case 'feu':
      return s.intelligence;
    case 'eau':
      return s.chance;
    case 'air':
      return s.agilite;
  }
}

/**
 * Dommages infligés (avant résistances) :
 *   base × (100 + caractéristique + puissance) / 100 + dommages fixes + dommages de l'élément
 *   (+ dommages critiques si critique).
 * La caractéristique négative ne peut pas faire descendre sous 0 %.
 */
export function rawDamage(base: number, el: Element, s: Stats, crit: boolean): number {
  const mult = Math.max(0, 100 + caracFor(s, el) + s.puissance) / 100;
  const fixed = s.dommages + s.dommagesElem[el] + (crit ? s.dommagesCritiques : 0);
  return Math.max(0, Math.floor(base * mult + fixed));
}

/**
 * Résistances élémentaires de la cible : d'abord les fixes (et la résistance critique sur un critique),
 * puis le pourcentage (plafonné à 50 %, une faiblesse négative augmente les dommages).
 */
export function applyResistances(dmg: number, el: Element, target: Stats, crit = false): number {
  const pct = Math.min(RES_CAP, target.resPct[el]);
  const afterFixed = Math.max(0, dmg - target.resFixe[el] - (crit ? target.resCrit : 0));
  return Math.max(0, Math.floor((afterFixed * (100 - pct)) / 100));
}

/** Points de vie : base de 50 + 5 par niveau + Vitalité (simplification de Dofus). */
export function maxHp(level: number, vitalite: number): number {
  return 50 + 5 * level + vitalite;
}

export interface DamageRoll {
  min: number;
  max: number;
  /** Bonus aux dommages de base quand le coup est critique (lignes « en critique » des armes). */
  critBonus: number;
  /** Chance de critique propre à l'arme/au sort, en %. */
  critBase: number;
  element: Element;
}

/** D'où vient le coup : mêlée ou distance, arme ou sort (pour les % de dommages et résistances finaux). */
export interface HitContext {
  melee: boolean;
  source: 'arme' | 'sort';
}
export const MELEE_SPELL: HitContext = { melee: true, source: 'sort' };

export interface Hit {
  damage: number;
  crit: boolean;
}

/** Multiplicateur final (dommages finaux de l'attaquant, résistances finales de la cible). */
export function finalMultiplier(ctx: HitContext, attacker: Stats, target: Stats): number {
  const range = ctx.melee ? attacker.pctMelee : attacker.pctDistance;
  const source = ctx.source === 'arme' ? attacker.pctArme : attacker.pctSort;
  const res = Math.min(RES_CAP, ctx.melee ? target.resMelee : target.resDistance);
  return (Math.max(0, 100 + range) / 100) * (Math.max(0, 100 + source) / 100) * ((100 - res) / 100);
}

/**
 * Résout un coup complet : jet de dés, critique, caractéristique, dommages fixes, résistances,
 * dommages et résistances finaux. `rnd` ∈ [0,1[.
 */
export function resolveHit(roll: DamageRoll, attacker: Stats, target: Stats, rnd: () => number, ctx: HitContext = MELEE_SPELL): Hit {
  const crit = rnd() * 100 < roll.critBase + attacker.critique;
  const base = roll.min + Math.floor(rnd() * (roll.max - roll.min + 1)) + (crit ? roll.critBonus : 0);
  const dmg = applyResistances(rawDamage(base, roll.element, attacker, crit), roll.element, target, crit);
  return { damage: Math.max(0, Math.floor(dmg * finalMultiplier(ctx, attacker, target))), crit };
}

/**
 * Dommages de poussée (Dofus) : (niveau / 2 + dommages de poussée − résistance de la cible + 32) × cases / 4.
 * `cells` = cases de poussée qui restaient quand la cible a heurté l'obstacle.
 */
export function pushDamage(level: number, attacker: Stats, target: Stats, cells: number): number {
  return Math.max(0, Math.floor(((level / 2 + attacker.dommagesPoussee - target.resPoussee + 32) * cells) / 4));
}

/** PV max perdus par érosion pour des dommages subis. */
export function erosionLoss(damage: number, s: Stats): number {
  return Math.floor((damage * Math.max(0, Math.min(MAX_EROSION, s.erosion))) / 100);
}
