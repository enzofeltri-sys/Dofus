import { item, ITEMS, type StatPath } from './data/items';
import { RUNE_DATA } from './data/items.gen';
import { craftXp, jobLevel, usable, type Workshop } from './craft';
import { addItem, instance, isWorn, type Inventory, type ItemInstance } from './inventory';

/**
 * Étape 8 (document de design §8.4 et §9) : raretés, fusion, brisage.
 * - 5 rangs, chaque rang relève les fourchettes d'≈ 15 % ; Légendaire et Mythique ajoutent une ligne bonus ;
 * - fusion : 3 identiques (Commun → Rare, et objets hors panoplie), sinon 1 objet + 2 pièces de sa panoplie du même rang ;
 *   Légendaire et Mythique coûtent aussi la ressource du boss de la région ;
 * - brisage : l'objet donne des runes de ses stats (vraies runes de Dofus 3, trois tailles), selon le poids de chaque stat.
 */

/* ---------- Raretés ---------- */

export const RARITIES = ['Commun', 'Rare', 'Épique', 'Légendaire', 'Mythique'] as const;
export const MAX_RARITY = RARITIES.length - 1;
export const RARITY_STEP = 1.15;

/** Valeur d'une borne de fourchette au rang r (les malus ne bougent pas, une valeur ne baisse jamais). */
export const scaleValue = (v: number, r: number) => (v <= 0 || r <= 0 ? v : Math.max(v, Math.round(v * Math.pow(RARITY_STEP, r))));

/** Fourchettes d'un objet à un rang donné. */
export const rangesFor = (id: number, r = 0): [StatPath, number, number][] =>
  item(id).effects.map(([p, a, b]) => [p, scaleValue(a, r), scaleValue(b, r)]);

export type RaritySource = 'monster' | 'boss' | 'craft';
/** Rang d'un objet obtenu : monstres 95 % Commun / 5 % Rare ; boss 85 / 12 / 3 % (Épique) ; fabrication : Commun (le craft critique est tiré à part). */
export function rollRarity(src: RaritySource, rnd: () => number): number {
  const x = rnd();
  if (src === 'monster') return x < 0.05 ? 1 : 0;
  if (src === 'boss') return x < 0.03 ? 2 : x < 0.15 ? 1 : 0;
  return 0;
}

/** Chance de craft critique (Rare) : 3 % + 0,2 % par niveau d'Artisan au-dessus de la recette, 20 % au plus. */
export const critChance = (jobLv: number, recipeLv: number) => Math.min(0.2, 0.03 + 0.002 * Math.max(0, jobLv - recipeLv));

/* ---------- Ligne bonus (Légendaire, Mythique) ---------- */

const ELS = ['neutre', 'terre', 'feu', 'eau', 'air'];
/** Stat, valeur selon le niveau de l'objet, poids du tirage. */
const BONUS_POOL: [StatPath, (lv: number) => number, number][] = [
  ['vitalite', (l) => 10 + Math.floor(1.5 * l), 3],
  ['puissance', (l) => 3 + Math.floor(l / 8), 3],
  ['sagesse', (l) => 3 + Math.floor(l / 8), 2],
  ['critique', (l) => 1 + Math.floor(l / 50), 2],
  ['soins', (l) => 2 + Math.floor(l / 12), 2],
  ['dommages', (l) => 1 + Math.floor(l / 30), 2],
  ['initiative', (l) => 40 + 4 * l, 2],
  ['prospection', (l) => 5 + Math.floor(l / 10), 2],
  ['tacle', (l) => 2 + Math.floor(l / 15), 1],
  ['fuite', (l) => 2 + Math.floor(l / 15), 1],
  ...ELS.map((e): [StatPath, (l: number) => number, number] => [`resPct.${e}`, (l) => 2 + Math.floor(l / 40), 1]),
  ['portee', () => 1, 0.5],
  ['invocations', () => 1, 0.5],
];
/** Mythique : chance que la ligne devienne +1 PA ou +1 PM. */
export const MYTHIC_APM_CHANCE = 0.1;

export function rollBonus(level: number, rnd: () => number): [StatPath, number] {
  const total = BONUS_POOL.reduce((a, [, , w]) => a + w, 0);
  let x = rnd() * total;
  for (const [p, f, w] of BONUS_POOL) {
    x -= w;
    if (x <= 0) return [p, f(level)];
  }
  const [p, f] = BONUS_POOL[0];
  return [p, f(level)];
}

/** Ligne bonus au passage Mythique : 10 % → +1 PA ou +1 PM, sinon la ligne Légendaire ×1,5. */
export function mythicBonus(prev: [StatPath, number] | undefined, level: number, rnd: () => number): [StatPath, number] {
  if (rnd() < MYTHIC_APM_CHANCE) return [rnd() < 0.5 ? 'pa' : 'pm', 1];
  const [p, v] = prev ?? rollBonus(level, rnd);
  return [p, v > 1 ? Math.round(v * 1.5) : v];
}

/** Nouvel objet d'un rang donné : jets dans les fourchettes du rang, ligne bonus si Légendaire ou plus. */
export function makeItem(id: number, rarity: number, rnd: () => number): Omit<ItemInstance, 'uid'> {
  const rolls = rangesFor(id, rarity).map(([, a, b]) => a + Math.floor(rnd() * (b - a + 1)));
  const out: Omit<ItemInstance, 'uid'> = { id, rolls };
  if (rarity > 0) out.rarity = rarity;
  if (rarity >= 3) out.bonus = rollBonus(item(id).level, rnd);
  if (rarity >= 4) out.bonus = mythicBonus(out.bonus, item(id).level, rnd);
  return out;
}

/** Ajoute un nouvel objet à l'inventaire. */
export const addNew = (inv: Inventory, id: number, rarity: number, rnd: () => number) => {
  const { rolls, ...rest } = makeItem(id, rarity, rnd);
  return addItem(inv, id, rolls, rest);
};

/* ---------- Fusion ---------- */

/** Ressource du boss de la région (Crypte de Kardorim → Crâne de Kardorim). */
export const BOSS_RESOURCE = 16525;
/** Coût en ressource du boss selon le rang visé. */
export const FUSION_BOSS_COST = [0, 0, 0, 3, 10];

const rarityOf = (it: ItemInstance) => it.rarity ?? 0;

/** Règle de fusion de cet objet : « identiques » ou « panoplie ». */
export function fusionRule(it: ItemInstance): 'same' | 'set' {
  return rarityOf(it) === 0 || !item(it.id).set ? 'same' : 'set';
}

/** Objets qui peuvent accompagner celui-ci dans une fusion (même rang, ni portés ni verrouillés). */
export function fusionPartners(inv: Inventory, mainUid: number): ItemInstance[] {
  const main = instance(inv, mainUid);
  if (!main || rarityOf(main) >= MAX_RARITY) return [];
  const rule = fusionRule(main);
  const set = item(main.id).set;
  return inv.items.filter((o) =>
    o.uid !== mainUid && !o.lock && !isWorn(inv, o.uid) && rarityOf(o) === rarityOf(main) &&
    (rule === 'same' ? o.id === main.id : item(o.id).set === set));
}

export type FuseCheck = { ok: true } | { ok: false; reason: string };
export function canFuse(w: Workshop, mainUid: number, partners: number[]): FuseCheck {
  const main = instance(w.inventory, mainUid);
  if (!main) return { ok: false, reason: 'Objet introuvable' };
  const r = rarityOf(main);
  if (r >= MAX_RARITY) return { ok: false, reason: 'Déjà Mythique' };
  const allowed = new Set(fusionPartners(w.inventory, mainUid).map((o) => o.uid));
  if (partners.length !== 2 || new Set(partners).size !== 2) return { ok: false, reason: 'Choisis 2 objets' };
  if (!partners.every((u) => allowed.has(u))) return { ok: false, reason: 'Objets non compatibles' };
  const cost = FUSION_BOSS_COST[r + 1];
  if (cost && usable(w, BOSS_RESOURCE) < cost) return { ok: false, reason: `${cost} × ${item(BOSS_RESOURCE).name} requis` };
  return { ok: true };
}

/** Garde la qualité du jet : même position dans la nouvelle fourchette (un dépassement au-delà du max est conservé). */
export function upgradeRolls(id: number, rolls: number[], from: number, to: number): number[] {
  const a0 = rangesFor(id, from), a1 = rangesFor(id, to);
  return rolls.map((v, i) => {
    if (!a0[i]) return v;
    const [, lo, hi] = a0[i], [, lo2, hi2] = a1[i];
    if (v > hi) return hi2 + (v - hi);
    if (v < lo) return lo2 - (lo - v);
    const p = hi > lo ? (v - lo) / (hi - lo) : 1;
    return lo2 + Math.round(p * (hi2 - lo2));
  });
}

export interface ForgeResult {
  workshop: Workshop;
  xp: number;
  levelBefore: number;
  levelAfter: number;
}

/** Fusionne : l'objet principal monte d'un rang (même uid, reste porté), les 2 autres sont détruits. */
export function fuse(w: Workshop, mainUid: number, partners: number[], rnd: () => number): ForgeResult & { item: ItemInstance | null } {
  const levelBefore = jobLevel(w.jobXp);
  if (!canFuse(w, mainUid, partners).ok) return { workshop: w, item: null, xp: 0, levelBefore, levelAfter: levelBefore };
  const main = instance(w.inventory, mainUid)!;
  const r = rarityOf(main) + 1, lv = item(main.id).level;
  const up: ItemInstance = { ...main, rarity: r, rolls: upgradeRolls(main.id, main.rolls, r - 1, r) };
  if (r === 3) up.bonus = rollBonus(lv, rnd);
  if (r === 4) up.bonus = mythicBonus(main.bonus, lv, rnd);
  const resources = { ...w.resources };
  const cost = FUSION_BOSS_COST[r];
  if (cost) {
    resources[BOSS_RESOURCE] -= cost;
    if (resources[BOSS_RESOURCE] <= 0) delete resources[BOSS_RESOURCE];
  }
  const gone = new Set(partners);
  const inventory: Inventory = { ...w.inventory, items: w.inventory.items.filter((o) => !gone.has(o.uid)).map((o) => (o.uid === mainUid ? up : o)) };
  const xp = craftXp(lv, levelBefore) * r;
  const jobXp = w.jobXp + xp;
  return { workshop: { ...w, inventory, resources, jobXp }, item: up, xp, levelBefore, levelAfter: jobLevel(jobXp) };
}

/* ---------- Brisage ---------- */

/** Poids d'un point de stat (poids des runes de Dofus). */
export const STAT_WEIGHT: Record<string, number> = {
  force: 1, intelligence: 1, chance: 1, agilite: 1, vitalite: 0.2, sagesse: 3, initiative: 0.1, prospection: 3,
  pa: 100, pm: 90, portee: 51, invocations: 30, critique: 10, soins: 10, dommages: 20, puissance: 2, renvoi: 10,
  dommagesCritiques: 5, resCrit: 2, dommagesPoussee: 5, resPoussee: 2, tacle: 4, fuite: 4,
  esquivePA: 7, esquivePM: 7, retraitPA: 7, retraitPM: 7,
  pctMelee: 15, pctDistance: 15, pctArme: 15, pctSort: 15, resMelee: 15, resDistance: 15,
};
export const statWeight = (p: StatPath) => {
  const [k] = p.split('.');
  return k === 'dommagesElem' ? 5 : k === 'resFixe' ? 2 : k === 'resPct' ? 6 : STAT_WEIGHT[k] ?? 0;
};

/** Runes par stat, de la plus grosse à la plus petite : [rune, valeur]. */
export const RUNES_BY_STAT = new Map<StatPath, [number, number][]>();
for (const [id, stat, v] of RUNE_DATA) {
  if (!ITEMS[id]) continue;
  RUNES_BY_STAT.set(stat, [...(RUNES_BY_STAT.get(stat) ?? []), [id, v] as [number, number]].sort((a, b) => b[1] - a[1]));
}
export const RUNE_STAT = new Map<number, [StatPath, number]>(RUNE_DATA.map(([id, s, v]) => [id, [s, v]]));

/** Lignes que l'on peut briser (positives, avec une rune existante). */
function breakLines(it: ItemInstance): [StatPath, number][] {
  const lines: [StatPath, number][] = item(it.id).effects.map(([p], i) => [p, it.rolls[i] ?? 0]);
  if (it.bonus) lines.push(it.bonus);
  if (it.exo) lines.push(it.exo);
  return lines.filter(([p, v]) => v > 0 && RUNES_BY_STAT.has(p) && statWeight(p) > 0);
}

/** Poids de runes rendu par une ligne : (3 × valeur × poids × niveau / 200 + 1) × (1 + 10 % par rang). */
export const lineWeight = (value: number, weight: number, level: number, rarity: number) =>
  ((3 * value * weight * level) / 200 + 1) * (1 + 0.1 * rarity);

/** Runes d'une ligne : les grosses d'abord, le reste en petites runes, et la fraction en chance d'une petite rune de plus. */
function lineRunes(p: StatPath, W: number): { fixed: [number, number][]; extra: [number, number] | null } {
  const runes = RUNES_BY_STAT.get(p)!;
  const w = statWeight(p);
  const fixed: [number, number][] = [];
  let left = W;
  for (const [id, v] of runes) {
    const rw = v * w;
    const n = Math.floor(left / rw + 1e-9);
    if (n > 0) {
      fixed.push([id, n]);
      left -= n * rw;
    }
  }
  const [smallId, smallV] = runes[runes.length - 1];
  const frac = left / (smallV * w);
  return { fixed, extra: frac > 0.001 ? [smallId, Math.min(1, frac)] : null };
}

/** Aperçu du brisage : rune → [minimum garanti, maximum possible]. */
export function breakPreview(it: ItemInstance): Map<number, [number, number]> {
  const out = new Map<number, [number, number]>();
  const lv = item(it.id).level, r = rarityOf(it);
  for (const [p, v] of breakLines(it)) {
    const { fixed, extra } = lineRunes(p, lineWeight(v, statWeight(p), lv, r));
    for (const [id, n] of fixed) {
      const [a, b] = out.get(id) ?? [0, 0];
      out.set(id, [a + n, b + n]);
    }
    if (extra) {
      const [a, b] = out.get(extra[0]) ?? [0, 0];
      out.set(extra[0], [a, b + 1]);
    }
  }
  return out;
}

export type BreakCheck = { ok: true } | { ok: false; reason: string };
export function canBreak(inv: Inventory, uid: number): BreakCheck {
  const it = instance(inv, uid);
  if (!it) return { ok: false, reason: 'Objet introuvable' };
  if (it.lock) return { ok: false, reason: 'Verrouillé' };
  if (isWorn(inv, uid)) return { ok: false, reason: 'Porté' };
  return { ok: true };
}

/** Brise l'objet : il disparaît, les runes vont dans les ressources. */
export function breakItem(w: Workshop, uid: number, rnd: () => number): ForgeResult & { runes: Record<number, number> } {
  const levelBefore = jobLevel(w.jobXp);
  if (!canBreak(w.inventory, uid).ok) return { workshop: w, runes: {}, xp: 0, levelBefore, levelAfter: levelBefore };
  const it = instance(w.inventory, uid)!;
  const lv = item(it.id).level, r = rarityOf(it);
  const runes: Record<number, number> = {};
  for (const [p, v] of breakLines(it)) {
    const { fixed, extra } = lineRunes(p, lineWeight(v, statWeight(p), lv, r));
    for (const [id, n] of fixed) runes[id] = (runes[id] ?? 0) + n;
    if (extra && rnd() < extra[1]) runes[extra[0]] = (runes[extra[0]] ?? 0) + 1;
  }
  const resources = { ...w.resources };
  for (const [id, n] of Object.entries(runes)) resources[id] = (resources[id] ?? 0) + n;
  const inventory: Inventory = { ...w.inventory, items: w.inventory.items.filter((o) => o.uid !== uid) };
  const xp = Math.max(1, Math.round(craftXp(lv, levelBefore) / 2));
  const jobXp = w.jobXp + xp;
  return { workshop: { ...w, inventory, resources, jobXp }, runes, xp, levelBefore, levelAfter: jobLevel(jobXp) };
}
