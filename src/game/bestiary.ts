import { AREAS } from './data/areas';
import { DUNGEON_DROPS } from './data/items.gen';
import { gradeStats, MONSTERS, type MonsterDef } from './data/monsters';
import { dropChance } from './loot';
import type { CaracId } from './progression';

/**
 * Bestiaire (demandé par Enzo) : tous les monstres du jeu, classés en normaux, élites, archimonstres et boss.
 * Un monstre jamais croisé reste une silhouette ; on retient combien on en a vu et vaincu.
 */

export type BeastKind = 'normal' | 'elite' | 'archi' | 'boss';
export const BEAST_KINDS: Record<BeastKind, string> = { normal: 'Normal', elite: 'Élite', archi: 'Archimonstre', boss: 'Boss' };

/** Ce qu'on retient de chaque monstre : vus, vaincus. */
export type Bestiary = Record<string, { seen: number; slain: number; /** Paliers récupérés. */ claimed?: number }>;

export const beastKind = (d: MonsterDef): BeastKind =>
  d.behavior === 'boss' ? 'boss' : d.archi ? 'archi' : d.hpMult ? 'elite' : 'normal';

/** Où le croiser : cartes et donjons (monstre de la carte, errant, élite, boss), ou invocation. */
export function placesOf(id: string): string[] {
  const out: string[] = [];
  for (const a of Object.values(AREAS)) {
    if (a.pool.includes(id)) out.push(a.name);
    else if (a.elite?.id === id) out.push(`${a.name} (élite)`);
    else if (a.boss?.id === id || a.bossChoice?.includes(id)) out.push(`${a.name} (boss)`);
    else if (a.wanderers?.some((w) => w.pool.includes(id))) out.push(`${a.name} (errant)`);
    else if (a.archis?.some((x) => x === id)) out.push(`${a.name} (rare)`);
  }
  for (const d of Object.values(MONSTERS)) {
    const sm = d.boss?.summon;
    if ((Array.isArray(sm) ? sm.includes(id) : sm === id) || [d.summons?.id ?? []].flat().includes(id)) out.push(`invoqué par ${d.name}`);
  }
  return [...new Set(out)];
}

/** Monstres présents dans le jeu (rencontrables), dans l'ordre des niveaux. */
export function allBeasts(): MonsterDef[] {
  return Object.values(MONSTERS)
    .filter((d) => d.dofusId > 0 && placesOf(d.id).length > 0)
    .sort((a, b) => a.grades[0].level - b.grades[0].level || a.name.localeCompare(b.name));
}

export interface BeastSheet {
  levels: [number, number];
  hp: [number, number];
  xp: [number, number];
  /** Résistances % au grade le plus haut : neutre, terre, feu, eau, air. */
  res: number[];
  /** Butin : objet, chance en jeu (0-1) par monstre vaincu. */
  drops: [number, number][];
}

export function beastSheet(d: MonsterDef): BeastSheet {
  const g1 = gradeStats(d, 1), g5 = gradeStats(d, d.grades.length);
  const kind = beastKind(d);
  return {
    levels: [g1.level, g5.level],
    hp: [g1.maxHp, g5.maxHp],
    xp: [g1.xp, g5.xp],
    res: [...d.grades[d.grades.length - 1].res],
    drops: (DUNGEON_DROPS[d.dofusId] ?? []).map(([id, pct]) => [id, dropChance(id, pct, { boss: kind === 'boss', elite: kind === 'elite' || kind === 'archi' })] as [number, number])
      .filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]),
  };
}

/** Ajoute ce qu'une partie a vu et vaincu. */
export function mergeBestiary(b: Bestiary | undefined, seen: Record<string, number>, slain: Record<string, number>): Bestiary {
  const out: Bestiary = { ...(b ?? {}) };
  for (const [id, n] of Object.entries(seen)) out[id] = { ...out[id], seen: (out[id]?.seen ?? 0) + n, slain: out[id]?.slain ?? 0 };
  for (const [id, n] of Object.entries(slain)) out[id] = { ...out[id], seen: out[id]?.seen ?? n, slain: (out[id]?.slain ?? 0) + n };
  return out;
}

/* ---------- Paliers (validés par Enzo) ---------- */

/** Victoires demandées pour chaque palier : monstres normaux, élites et boss, archimonstres. */
export const TIERS: Record<BeastKind, number[]> = { normal: [10, 50, 200, 1000], elite: [1, 5, 20, 50], boss: [1, 5, 20, 50], archi: [1, 5] };
/** Parchemins : 100 points au plus par caractéristique (règle de Dofus, valeur à confirmer). */
export const PARCHO_CAP = 100;
const RUNE: Record<string, number> = { neutre: 1519, terre: 1519, feu: 1522, eau: 1525, air: 1524 };
const CARAC_OF: Record<string, CaracId> = { neutre: 'force', terre: 'force', feu: 'intelligence', eau: 'chance', air: 'agilite' };
const CARAC_NAME: Record<CaracId, string> = { force: 'Force', intelligence: 'Intelligence', chance: 'Chance', agilite: 'Agilité', vitalite: 'Vitalité', sagesse: 'Sagesse' };

export interface TierReward {
  text: string;
  /** Bonus de butin sur ce monstre (s'ajoute). */
  drop?: number;
  runes?: { id: number; n: number };
  parcho?: { carac: CaracId; n: number };
  /** Chance d'archimonstre multipliée. */
  archi?: number;
}

/** Récompense du palier `i` (0 à 3) d'un monstre : +5 % de butin, 3 runes de son élément, 1 parchemin et +10 % de butin, archimonstre ×2. */
export function tierReward(d: MonsterDef, i: number): TierReward {
  const el = d.attack.roll.element;
  const carac = CARAC_OF[el];
  const runeName = { 1519: 'Rune Fo', 1522: 'Rune Ine', 1525: 'Rune Cha', 1524: 'Rune Age' }[RUNE[el]];
  const boss = beastKind(d) === 'boss' || beastKind(d) === 'elite';
  switch (i) {
    case 0: return { text: '+5 % de butin sur ce monstre', drop: 0.05 };
    case 1: return { text: `3 ${runeName!.replace('Rune', 'Runes')}`, runes: { id: RUNE[el], n: 3 } };
    case 2: return { text: `${boss ? 'Parchemin' : 'Petit Parchemin'} de ${CARAC_NAME[carac]} (+1) et +10 % de butin`, parcho: { carac, n: 1 }, drop: 0.1 };
    default: return { text: 'Archimonstre deux fois plus fréquent, étoile dorée', archi: 2 };
  }
}

/** Paliers atteints (selon les victoires) et récupérés. */
export function tierState(d: MonsterDef, rec: Bestiary[string] | undefined): { goals: number[]; reached: number; claimed: number } {
  const goals = TIERS[beastKind(d)];
  const slain = rec?.slain ?? 0;
  return { goals, reached: goals.filter((g) => slain >= g).length, claimed: Math.min(rec?.claimed ?? 0, goals.length) };
}

/** Bonus en combat venant des paliers récupérés : butin et archimonstres, par monstre. */
export function beastBonuses(b: Bestiary | undefined): Record<string, { drop: number; archi: number }> {
  const out: Record<string, { drop: number; archi: number }> = {};
  for (const [id, rec] of Object.entries(b ?? {})) {
    const d = MONSTERS[id];
    if (!d || !rec.claimed) continue;
    let drop = 0, archi = 1;
    for (let i = 0; i < rec.claimed; i++) {
      const r = tierReward(d, i);
      drop += r.drop ?? 0;
      archi *= r.archi ?? 1;
    }
    out[id] = { drop, archi };
  }
  return out;
}

/** Nombre de paliers atteints mais pas encore récupérés (pastille). */
export const claimable = (b: Bestiary | undefined) =>
  Object.entries(b ?? {}).reduce((n, [id, rec]) => (MONSTERS[id] ? n + Math.max(0, tierState(MONSTERS[id], rec).reached - (rec.claimed ?? 0)) : n), 0);
