import { AREAS } from './data/areas';
import { DUNGEON_DROPS } from './data/items.gen';
import { gradeStats, MONSTERS, type MonsterDef } from './data/monsters';
import { dropChance } from './loot';

/**
 * Bestiaire (demandé par Enzo) : tous les monstres du jeu, classés en normaux, élites, archimonstres et boss.
 * Un monstre jamais croisé reste une silhouette ; on retient combien on en a vu et vaincu.
 */

export type BeastKind = 'normal' | 'elite' | 'archi' | 'boss';
export const BEAST_KINDS: Record<BeastKind, string> = { normal: 'Normal', elite: 'Élite', archi: 'Archimonstre', boss: 'Boss' };

/** Ce qu'on retient de chaque monstre : vus, vaincus. */
export type Bestiary = Record<string, { seen: number; slain: number }>;

export const beastKind = (d: MonsterDef): BeastKind =>
  d.behavior === 'boss' ? 'boss' : d.archi ? 'archi' : d.hpMult ? 'elite' : 'normal';

/** Où le croiser : cartes et donjons (monstre de la carte, errant, élite, boss), ou invocation. */
export function placesOf(id: string): string[] {
  const out: string[] = [];
  for (const a of Object.values(AREAS)) {
    if (a.pool.includes(id)) out.push(a.name);
    else if (a.elite?.id === id) out.push(`${a.name} (élite)`);
    else if (a.boss?.id === id) out.push(`${a.name} (boss)`);
    else if (a.wanderers?.some((w) => w.pool.includes(id))) out.push(`${a.name} (errant)`);
    else if (a.archis?.some((x) => x === id)) out.push(`${a.name} (rare)`);
  }
  for (const d of Object.values(MONSTERS)) {
    if (d.boss?.summon === id || d.summons?.id === id) out.push(`invoqué par ${d.name}`);
  }
  return [...new Set(out)];
}

/** Monstres présents dans le jeu (rencontrables), dans l'ordre des niveaux. */
export function allBeasts(): MonsterDef[] {
  return Object.values(MONSTERS)
    .filter((d) => placesOf(d.id).length > 0)
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
  for (const [id, n] of Object.entries(seen)) out[id] = { seen: (out[id]?.seen ?? 0) + n, slain: out[id]?.slain ?? 0 };
  for (const [id, n] of Object.entries(slain)) out[id] = { seen: out[id]?.seen ?? n, slain: (out[id]?.slain ?? 0) + n };
  return out;
}
