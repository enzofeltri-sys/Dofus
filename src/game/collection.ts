import { AREAS, isUnlocked, ZONES } from './data/areas';
import { isSpecial, item, ITEMS, SETS, type SlotId, type StatPath } from './data/items';
import { fusionPartners, statWeight } from './forge';
import { averageRolls, isWorn, type Inventory } from './inventory';
import { zoneEquipPool } from './loot';

/**
 * Collection de panoplies (refonte validée par Enzo, livraison 2) : chaque zone montre les panoplies que ses monstres lâchent,
 * avec les pièces obtenues ou manquantes ; et une note par objet pour dire « mieux / moins bien » que ce qui est porté.
 */

export interface ZoneSet {
  id: number;
  name: string;
  /** Niveau de la panoplie (sa pièce la plus haute). */
  level: number;
  /** Pièces équipables, dans l'ordre de Dofus. */
  pieces: number[];
}

const setCache = new Map<string, ZoneSet[]>();
/** Panoplies qui tombent dans une zone (toutes ses cartes et donjons), de la plus basse à la plus haute. */
export function zoneSets(zoneId: string): ZoneSet[] {
  let out = setCache.get(zoneId);
  if (out) return out;
  const zone = ZONES.find((z) => z.id === zoneId);
  const ids = new Set<number>();
  for (const n of zone?.nodes ?? []) if (n.area) for (const i of zoneEquipPool(n.area.id)) if (ITEMS[i].set) ids.add(ITEMS[i].set!);
  out = [...ids].map((s) => {
    const pieces = SETS[s].items.filter((i) => ITEMS[i]?.slot && !isSpecial(i));
    return { id: s, name: SETS[s].name, level: Math.max(...pieces.map((i) => ITEMS[i].level)), pieces };
  }).filter((s) => s.pieces.length).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  setCache.set(zoneId, out);
  return out;
}

/** Zone d'une carte ou d'un donjon. */
export const zoneOfArea = (areaId: string) => ZONES.find((z) => z.nodes.some((n) => n.area?.id === areaId))?.id ?? ZONES[0].id;

/** Zones ouvertes (au moins une étape débloquée). */
export const openZones = (done: string[], level = Infinity) => ZONES.filter((z) => z.nodes.some((n) => !n.soon && isUnlocked(n, done, level)));

/** Cartes et donjons où une pièce tombe. */
export const dropAreasOf = (id: number) => Object.values(AREAS).filter((a) => zoneEquipPool(a.id).includes(id));

/* ---------- « Mieux / moins bien » ---------- */

/** Caractéristique qui fait frapper chaque élément (le Neutre suit la Force, comme dans Dofus). */
const ELEMENT_CARAC: Record<string, string> = { terre: 'force', neutre: 'force', feu: 'intelligence', eau: 'chance', air: 'agilite' };
const CARACS = ['force', 'intelligence', 'chance', 'agilite'] as const;

/** Poids des 4 caractéristiques d'élément selon le Sacrieur : une stat qu'il joue compte plus (1 = moyenne). */
export function caracWeights(stats: Partial<Record<(typeof CARACS)[number], number>>): Record<string, number> {
  const raw = CARACS.map((c) => Math.max(0, stats[c] ?? 0) + 10);
  const mean = raw.reduce((a, b) => a + b, 0) / raw.length;
  return Object.fromEntries(CARACS.map((c, i) => [c, raw[i] / mean]));
}

/** Note d'une ligne : son poids de rune (Fo 1, Vi 0,2, PA 100…), × l'intérêt de l'élément pour le Sacrieur. */
export function lineScore(p: StatPath, v: number, w: Record<string, number>): number {
  const [k, el] = p.split('.');
  const carac = (CARACS as readonly string[]).includes(k) ? k : k === 'dommagesElem' && el ? ELEMENT_CARAC[el] : null;
  return v * statWeight(p) * (carac ? w[carac] ?? 1 : 1);
}

/** Note d'un objet (jets donnés, sinon jets moyens). */
export function itemScore(id: number, w: Record<string, number>, rolls?: number[]): number {
  const r = rolls ?? averageRolls(id);
  return item(id).effects.reduce((a, [p], i) => a + lineScore(p, r[i] ?? 0, w), 0);
}

const slotsOf = (id: number): SlotId[] => {
  const s = item(id).slot;
  return s === 'anneau' ? ['anneau1', 'anneau2'] : s && s !== 'dofus' && s !== 'familier' ? [s as SlotId] : [];
};

/**
 * Comparé à ce qui est porté au même emplacement (anneaux : le moins bon des deux) : « up » mieux, « down » moins bien,
 * « same » à peu près pareil (±5 %), null si cet objet ne se compare pas (familier, Dofus).
 */
export function betterThanWorn(inv: Inventory, id: number, w: Record<string, number>, rolls?: number[]): 'up' | 'down' | 'same' | null {
  const slots = slotsOf(id);
  if (!slots.length) return null;
  const worn = slots.map((s) => inv.equipped[s]).map((uid) => (uid ? inv.items.find((o) => o.uid === uid) : undefined));
  if (worn.some((o) => !o)) return 'up';
  const base = Math.min(...worn.map((o) => itemScore(o!.id, w, o!.rolls)));
  const mine = itemScore(id, w, rolls);
  if (mine > base * 1.05) return 'up';
  if (mine < base * 0.95) return 'down';
  return 'same';
}

/* ---------- Pièces possédées ---------- */

export interface Owned {
  /** Exemplaires possédés. */
  count: number;
  /** Meilleur rang possédé. */
  rarity: number;
  worn: boolean;
  /** Un exemplaire qui peut monter de rang tout de suite (3 identiques du même rang), sinon null. */
  fusable: number | null;
}

export function ownedOf(inv: Inventory, id: number): Owned {
  const mine = inv.items.filter((o) => o.id === id);
  const fusable = mine.find((o) => fusionPartners(inv, o.uid).length >= 2)?.uid ?? null;
  return { count: mine.length, rarity: Math.max(0, ...mine.map((o) => o.rarity ?? 0)), worn: mine.some((o) => isWorn(inv, o.uid)), fusable };
}
