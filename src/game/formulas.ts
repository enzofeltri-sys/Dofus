/**
 * Formules de combat, reprises de Dofus.
 * Fonctions pures (aucun état), testées dans formulas.test.ts.
 */

export type Element = 'neutre' | 'terre' | 'feu' | 'eau' | 'air';

/** Caractéristiques de combat d'une entité (joueur ou monstre). */
export interface Stats {
  vitalite: number;
  force: number;
  intelligence: number;
  chance: number;
  agilite: number;
  puissance: number;
  /** Dommages fixes ajoutés à chaque coup. */
  dommages: number;
  /** Chance de coup critique, en %. */
  critique: number;
  /** Dommages critiques fixes ajoutés sur un coup critique. */
  dommagesCritiques: number;
  /** Résistances en % par élément. */
  resPct: Record<Element, number>;
  /** Résistances fixes par élément. */
  resFixe: Record<Element, number>;
}

export const NO_RES: Record<Element, number> = { neutre: 0, terre: 0, feu: 0, eau: 0, air: 0 };

export function baseStats(over: Partial<Stats> = {}): Stats {
  return {
    vitalite: 0, force: 0, intelligence: 0, chance: 0, agilite: 0,
    puissance: 0, dommages: 0, critique: 0, dommagesCritiques: 0,
    resPct: { ...NO_RES }, resFixe: { ...NO_RES },
    ...over,
  };
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
 *   base × (100 + caractéristique + puissance) / 100 + dommages fixes (+ dommages critiques si critique)
 * La caractéristique négative ne peut pas faire descendre sous 0 %.
 */
export function rawDamage(base: number, el: Element, s: Stats, crit: boolean): number {
  const mult = Math.max(0, 100 + caracFor(s, el) + s.puissance) / 100;
  const fixed = s.dommages + (crit ? s.dommagesCritiques : 0);
  return Math.max(0, Math.floor(base * mult + fixed));
}

/** Application des résistances de la cible : d'abord les fixes, puis le pourcentage (plafonné à 50 % comme en JcM). */
export function applyResistances(dmg: number, el: Element, target: Stats): number {
  const pct = Math.min(50, target.resPct[el]);
  const afterFixed = Math.max(0, dmg - target.resFixe[el]);
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

export interface Hit {
  damage: number;
  crit: boolean;
}

/** Résout un coup complet : jet de dés, critique, caractéristique, résistances. `rnd` ∈ [0,1[. */
export function resolveHit(roll: DamageRoll, attacker: Stats, target: Stats, rnd: () => number): Hit {
  const crit = rnd() * 100 < roll.critBase + attacker.critique;
  const base = roll.min + Math.floor(rnd() * (roll.max - roll.min + 1)) + (crit ? roll.critBonus : 0);
  const dmg = rawDamage(base, roll.element, attacker, crit);
  return { damage: applyResistances(dmg, roll.element, target), crit };
}
