/**
 * Progression du personnage : table d'XP, niveaux, points de caractéristique (document de design §6 et §7.7).
 * Fonctions pures, testées dans progression.test.ts.
 */

export const LEVEL_MAX = 200;
export const START_LEVEL = 10;
/** Points de caractéristique gagnés par niveau (Dofus : 5, à partir du niveau 2). */
export const POINTS_PER_LEVEL = 5;

export type CaracId = 'vitalite' | 'sagesse' | 'force' | 'intelligence' | 'chance' | 'agilite';
export const CARACS: CaracId[] = ['vitalite', 'sagesse', 'force', 'intelligence', 'chance', 'agilite'];

/** Ce qui est gardé pour toujours : XP totale et caractéristiques investies (valeurs, pas points). */
export interface Profile {
  xp: number;
  carac: Record<CaracId, number>;
  /** Points de parchemins (paliers du bestiaire), gardés pour toujours, en plus des points investis. */
  parcho?: Partial<Record<CaracId, number>>;
}

/* ---------- Courbe d'XP ---------- */

/** Temps de jeu visé pour passer le niveau n (minutes) : 4 min au niveau 10, +3 % par niveau. */
export const minutesForLevel = (n: number) => 4 * Math.pow(1.03, n - 10);
/**
 * XP gagnée par minute dans un donjon de son niveau. Mesurée au niveau 10 (Crypte de Kardorim, simulation),
 * extrapolée au-delà (l'XP des monstres de Dofus croît à peu près comme niveau^1,6). À recalibrer à chaque tranche de donjons.
 */
export const XP_PER_MIN_10 = 3500;
export const xpPerMinute = (n: number) => XP_PER_MIN_10 * Math.pow(n / 10, 1.6);

/** XP nécessaire pour passer du niveau n au niveau n + 1 (arrondie à la dizaine). */
export const xpToNext = (n: number) => Math.round((xpPerMinute(n) * minutesForLevel(n)) / 10) * 10;

/** XP totale pour atteindre chaque niveau : XP_TABLE[n] (XP_TABLE[1] = 0). */
export const XP_TABLE: number[] = (() => {
  const t = [0, 0];
  for (let n = 1; n < LEVEL_MAX; n++) t.push(t[n] + xpToNext(n));
  return t;
})();

export function levelForXp(xp: number): number {
  let lv = 1;
  while (lv < LEVEL_MAX && XP_TABLE[lv + 1] <= xp) lv++;
  return lv;
}

/** Avancement dans le niveau courant (pour la barre d'XP). */
export function levelProgress(xp: number): { level: number; into: number; need: number } {
  const level = levelForXp(xp);
  if (level >= LEVEL_MAX) return { level, into: 0, need: 0 };
  return { level, into: xp - XP_TABLE[level], need: XP_TABLE[level + 1] - XP_TABLE[level] };
}

/* ---------- Gain d'XP ---------- */

/** Écart de niveau au-delà duquel l'XP diminue (donjon trop bas). */
export const XP_FULL_GAP = 10;
/** XP dégressive : pleine jusqu'à 10 niveaux d'écart, puis −15 % par niveau de plus (au moins 1 %). */
export function xpDecay(heroLevel: number, monsterLevel: number): number {
  const gap = heroLevel - monsterLevel - XP_FULL_GAP;
  return gap <= 0 ? 1 : Math.max(0.01, Math.pow(0.85, gap));
}

/** XP d'un monstre vaincu : XP du grade × Sagesse × dégressivité. */
export function xpGain(monsterXp: number, monsterLevel: number, heroLevel: number, sagesse: number): number {
  return Math.floor(monsterXp * (Math.max(0, 100 + sagesse) / 100) * xpDecay(heroLevel, monsterLevel));
}

/* ---------- Points de caractéristique (paliers du Sacrieur, DofusDB) ---------- */

/** Coût en points pour monter une caractéristique de `value` à `value + 1`. */
export function pointCost(id: CaracId, value: number): number {
  if (id === 'vitalite') return 1;
  if (id === 'sagesse') return 3;
  if (value < 100) return 1;
  if (value < 200) return 2;
  if (value < 300) return 3;
  return 4;
}

/** Points dépensés pour avoir investi `value` dans une caractéristique. */
export function pointsSpentOn(id: CaracId, value: number): number {
  let s = 0;
  for (let v = 0; v < value; v++) s += pointCost(id, v);
  return s;
}

export const pointsEarned = (level: number) => (level - 1) * POINTS_PER_LEVEL;
export const pointsSpent = (p: Profile) => CARACS.reduce((a, id) => a + pointsSpentOn(id, p.carac[id]), 0);
export const pointsFree = (p: Profile) => pointsEarned(levelForXp(p.xp)) - pointsSpent(p);

/** Investit `n` fois dans une caractéristique (s'arrête quand il n'y a plus assez de points). */
export function invest(p: Profile, id: CaracId, n = 1): Profile {
  const out: Profile = { xp: p.xp, carac: { ...p.carac } };
  let free = pointsFree(out);
  for (let i = 0; i < n; i++) {
    const c = pointCost(id, out.carac[id]);
    if (c > free) break;
    out.carac[id]++;
    free -= c;
  }
  return out;
}

/** Remise à zéro gratuite des caractéristiques (au camp). */
export const resetCarac = (p: Profile): Profile => ({ xp: p.xp, carac: emptyCarac() });

export const emptyCarac = (): Record<CaracId, number> => ({ vitalite: 0, sagesse: 0, force: 0, intelligence: 0, chance: 0, agilite: 0 });

/** Sacrieur de départ : niveau 10, tous ses points en Force. */
export function defaultProfile(): Profile {
  return { xp: XP_TABLE[START_LEVEL], carac: { ...emptyCarac(), force: pointsEarned(START_LEVEL) } };
}

/** Ajoute de l'XP (plafonnée au niveau max). */
export const addXp = (p: Profile, xp: number): Profile => ({ ...p, xp: Math.min(XP_TABLE[LEVEL_MAX], p.xp + Math.max(0, xp)) });
