import type { Stats } from './formulas';
import { addLine, item, ITEMS, SETS, slotsFor, type SlotId, type StatPath } from './data/items';

/**
 * Inventaire et équipement (gardés pour toujours, dans la sauvegarde).
 * Chaque objet d'équipement a ses propres jets, tirés quand il est obtenu (comme dans Dofus).
 */

export interface ItemInstance {
  uid: number;
  id: number;
  /** Jet de chaque ligne de l'objet, dans l'ordre de ses effets. */
  rolls: number[];
  /** Favori : en tête des listes. */
  fav?: boolean;
  /** Verrouillé : protégé de la fusion et du brisage (étape 8). */
  lock?: boolean;
}

export interface Inventory {
  items: ItemInstance[];
  equipped: Partial<Record<SlotId, number>>;
  nextUid: number;
}

export const emptyInventory = (): Inventory => ({ items: [], equipped: {}, nextUid: 1 });

/** Jets d'un nouvel objet, uniformes dans les fourchettes. */
export const rollItem = (id: number, rnd: () => number): number[] =>
  item(id).effects.map(([, a, b]) => a + Math.floor(rnd() * (b - a + 1)));

/** Jets moyens (arrondis) : objets de départ. */
export const averageRolls = (id: number): number[] => item(id).effects.map(([, a, b]) => Math.round((a + b) / 2));

export function addItem(inv: Inventory, id: number, rolls: number[]): Inventory {
  return { ...inv, items: [...inv.items, { uid: inv.nextUid, id, rolls }], nextUid: inv.nextUid + 1 };
}

export const instance = (inv: Inventory, uid: number) => inv.items.find((i) => i.uid === uid);

/** Met ou enlève une marque (favori, verrou) sur un objet. */
export function toggleMark(inv: Inventory, uid: number, mark: 'fav' | 'lock'): Inventory {
  return { ...inv, items: inv.items.map((i) => (i.uid === uid ? { ...i, [mark]: !i[mark] || undefined } : i)) };
}

/** Lignes d'un objet avec ses jets. */
export const itemLines = (it: ItemInstance): [StatPath, number][] => item(it.id).effects.map(([p], i) => [p, it.rolls[i] ?? 0]);

/** Objets portés (case → objet). */
export function worn(inv: Inventory): [SlotId, ItemInstance][] {
  return (Object.entries(inv.equipped) as [SlotId, number][])
    .map(([s, uid]) => [s, instance(inv, uid)] as [SlotId, ItemInstance | undefined])
    .filter((x): x is [SlotId, ItemInstance] => !!x[1]);
}

/** Nombre d'objets différents portés par panoplie. */
export function setCounts(inv: Inventory): Map<number, number> {
  const ids = new Set(worn(inv).map(([, it]) => it.id));
  const out = new Map<number, number>();
  for (const id of ids) {
    const s = ITEMS[id]?.set;
    if (s) out.set(s, (out.get(s) ?? 0) + 1);
  }
  return out;
}

export const setBonus = (setId: number, n: number): [StatPath, number][] => (n > 0 ? SETS[setId]?.bonus[n - 1] ?? [] : []);

/** Toutes les stats apportées par l'équipement : jets des objets + bonus de panoplie. */
export function gearStats(inv: Inventory): Partial<Stats> {
  const out: Partial<Stats> = {};
  for (const [, it] of worn(inv)) for (const [p, v] of itemLines(it)) addLine(out, p, v);
  for (const [s, n] of setCounts(inv)) for (const [p, v] of setBonus(s, n)) addLine(out, p, v);
  return out;
}

/** Même équipement, en lignes (chemin → valeur), pour comparer. */
function gearLines(inv: Inventory): Map<StatPath, number> {
  const m = new Map<StatPath, number>();
  const add = (p: StatPath, v: number) => m.set(p, (m.get(p) ?? 0) + v);
  for (const [, it] of worn(inv)) for (const [p, v] of itemLines(it)) add(p, v);
  for (const [s, n] of setCounts(inv)) for (const [p, v] of setBonus(s, n)) add(p, v);
  return m;
}

export type EquipCheck = { ok: true; slot: SlotId } | { ok: false; reason: string };

/** Peut-on porter cet objet ? Choisit la case (une case vide d'abord, sinon on remplace). */
export function canEquip(inv: Inventory, uid: number, level: number, slot?: SlotId): EquipCheck {
  const it = instance(inv, uid);
  if (!it) return { ok: false, reason: 'Objet introuvable' };
  const d = item(it.id);
  if (!d.slot) return { ok: false, reason: 'Ce n’est pas un équipement' };
  if (level < d.level) return { ok: false, reason: `Niveau ${d.level} requis` };
  const options = slotsFor(d.slot);
  const target = slot && options.includes(slot) ? slot : options.find((s) => inv.equipped[s] === undefined) ?? options[0];
  // Dofus : deux anneaux identiques sont permis, sauf s'ils font partie d'une panoplie
  const other = options.find((s) => s !== target && inv.equipped[s] !== undefined);
  if (other && d.set && instance(inv, inv.equipped[other]!)?.id === it.id) return { ok: false, reason: 'Anneau de panoplie déjà porté' };
  return { ok: true, slot: target };
}

export function equip(inv: Inventory, uid: number, level: number, slot?: SlotId): Inventory {
  const c = canEquip(inv, uid, level, slot);
  if (!c.ok) return inv;
  const equipped = { ...inv.equipped };
  for (const s of Object.keys(equipped) as SlotId[]) if (equipped[s] === uid) delete equipped[s];
  equipped[c.slot] = uid;
  return { ...inv, equipped };
}

export function unequip(inv: Inventory, slot: SlotId): Inventory {
  const equipped = { ...inv.equipped };
  delete equipped[slot];
  return { ...inv, equipped };
}

export const isWorn = (inv: Inventory, uid: number) => Object.values(inv.equipped).includes(uid);

/**
 * Ce que changerait le fait de porter cet objet (bonus de panoplie compris) : lignes (chemin, écart), sans les écarts nuls.
 * Si l'objet est déjà porté : ce que l'on perdrait en le retirant.
 */
export function compare(inv: Inventory, uid: number, level: number): [StatPath, number][] {
  const before = gearLines(inv);
  let after: Map<StatPath, number>;
  if (isWorn(inv, uid)) {
    const slot = (Object.keys(inv.equipped) as SlotId[]).find((s) => inv.equipped[s] === uid)!;
    after = gearLines(unequip(inv, slot));
  } else {
    const c = canEquip(inv, uid, Math.max(level, 200));
    if (!c.ok) return [];
    after = gearLines(equip(inv, uid, 200, c.slot));
  }
  const keys = new Set([...before.keys(), ...after.keys()]);
  return [...keys].map((k): [StatPath, number] => [k, (after.get(k) ?? 0) - (before.get(k) ?? 0)]).filter(([, v]) => v !== 0);
}

/** Équipement de départ : Panoplie du Jeune Aventurier sans le Chapeau (lâché par les Chafers). */
export const STARTER_ITEMS = [2473, 2475, 2476, 2477, 2478];
export function starterInventory(): Inventory {
  let inv = emptyInventory();
  for (const id of STARTER_ITEMS) {
    inv = addItem(inv, id, averageRolls(id));
    inv = equip(inv, inv.nextUid - 1, 200);
  }
  return inv;
}
