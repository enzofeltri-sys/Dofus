import { isEquipment, ITEMS } from './data/items';
import { RECIPE_DATA } from './data/items.gen';
import { addItem, rollItem, type Inventory } from './inventory';

/**
 * Métier unique : Artisan (document de design §9.1). Il fabrique tout l'équipement, avec les vraies recettes de Dofus 3.
 * - une recette demande un niveau d'Artisan au moins égal au niveau de l'objet ;
 * - chaque fabrication rapporte de l'XP de métier, dégressive si la recette est bien plus basse que le métier ;
 * - l'objet fabriqué a des jets aléatoires dans ses vraies fourchettes (rareté Commun ; le craft critique arrive à l'étape 8).
 */

export interface Recipe {
  id: number;
  level: number;
  ingredients: [number, number][];
}
export const RECIPES: Recipe[] = RECIPE_DATA;
export const recipeFor = (id: number) => RECIPES.find((r) => r.id === id);

export const JOB_MAX = 200;

/* ---------- XP du métier ---------- */

/** XP pour passer le niveau n → n + 1 d'Artisan (≈ 25 fabrications pour atteindre le niveau 12). */
export const jobXpToNext = (n: number) => Math.round((8 * Math.pow(n, 1.5)) / 5) * 5;
export const JOB_XP_TABLE: number[] = (() => {
  const t = [0, 0];
  for (let n = 1; n < JOB_MAX; n++) t.push(t[n] + jobXpToNext(n));
  return t;
})();
export function jobLevel(xp: number): number {
  let lv = 1;
  while (lv < JOB_MAX && JOB_XP_TABLE[lv + 1] <= xp) lv++;
  return lv;
}
export function jobProgress(xp: number): { level: number; into: number; need: number } {
  const level = jobLevel(xp);
  if (level >= JOB_MAX) return { level, into: 0, need: 0 };
  return { level, into: xp - JOB_XP_TABLE[level], need: JOB_XP_TABLE[level + 1] - JOB_XP_TABLE[level] };
}

/** XP d'une fabrication : 20 + 10 par niveau de recette, dégressive au-delà de 10 niveaux d'écart (−15 % par niveau). */
export function craftXp(recipeLevel: number, level: number): number {
  const gap = level - recipeLevel - 10;
  const decay = gap <= 0 ? 1 : Math.max(0.01, Math.pow(0.85, gap));
  return Math.max(1, Math.round((20 + 10 * recipeLevel) * decay));
}

/* ---------- Fabrication ---------- */

export interface Workshop {
  resources: Record<string, number>;
  inventory: Inventory;
  /** XP totale d'Artisan. */
  jobXp: number;
  /** Ressources verrouillées : l'atelier n'y touche pas. */
  locked?: number[];
}

/** Quantité d'une ressource utilisable par l'atelier (0 si verrouillée). */
export const usable = (w: Workshop, id: number) => (w.locked?.includes(id) ? 0 : w.resources[id] ?? 0);

export type CraftCheck = { ok: true; max: number } | { ok: false; reason: string; max: 0 };

/** Peut-on fabriquer cette recette ? (niveau d'Artisan, ingrédients) et combien de fois au maximum. */
export function canCraft(w: Workshop, r: Recipe): CraftCheck {
  if (jobLevel(w.jobXp) < r.level) return { ok: false, reason: `Artisan niveau ${r.level} requis`, max: 0 };
  const max = Math.min(...r.ingredients.map(([id, q]) => Math.floor(usable(w, id) / q)));
  if (max <= 0) {
    const lockedOnly = r.ingredients.every(([id, q]) => (w.resources[id] ?? 0) >= q);
    return { ok: false, reason: lockedOnly ? 'Ingrédient verrouillé' : 'Ingrédients manquants', max: 0 };
  }
  return { ok: true, max };
}

export interface CraftResult {
  workshop: Workshop;
  /** Équipements créés (uid) ou ressources ajoutées (quantité). */
  made: number[];
  count: number;
  xp: number;
  levelBefore: number;
  levelAfter: number;
}

/** Fabrique `times` fois (borné par ce qui est possible). Ne modifie pas l'atelier reçu. */
export function craft(w: Workshop, r: Recipe, times: number, rnd: () => number): CraftResult {
  const check = canCraft(w, r);
  const levelBefore = jobLevel(w.jobXp);
  const n = check.ok ? Math.min(times, check.max) : 0;
  const out: Workshop = { ...w, resources: { ...w.resources } };
  const made: number[] = [];
  let xp = 0;
  for (let i = 0; i < n; i++) {
    for (const [id, q] of r.ingredients) {
      out.resources[id] = (out.resources[id] ?? 0) - q;
      if (out.resources[id] <= 0) delete out.resources[id];
    }
    if (isEquipment(r.id)) {
      out.inventory = addItem(out.inventory, r.id, rollItem(r.id, rnd));
      made.push(out.inventory.nextUid - 1);
    } else {
      out.resources[r.id] = (out.resources[r.id] ?? 0) + 1;
    }
    const gained = craftXp(r.level, jobLevel(out.jobXp));
    out.jobXp = Math.min(JOB_XP_TABLE[JOB_MAX], out.jobXp + gained);
    xp += gained;
  }
  return { workshop: out, made, count: n, xp, levelBefore, levelAfter: jobLevel(out.jobXp) };
}

/** Recettes triées pour l'atelier : faisables d'abord, puis par niveau. */
export function sortedRecipes(w: Workshop): Recipe[] {
  return [...RECIPES].filter((r) => ITEMS[r.id]).sort((a, b) =>
    Number(canCraft(w, b).ok) - Number(canCraft(w, a).ok) || a.level - b.level || ITEMS[a.id].name.localeCompare(ITEMS[b.id].name));
}
