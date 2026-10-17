import { DUNGEON_KEYS } from './data/items.gen';

/**
 * Clés de donjon (étape 9c, validé par Enzo, §8.3) :
 * - tant qu'un donjon n'a jamais été vaincu, on y entre librement ;
 * - ensuite chaque entrée coûte une clé : d'abord les 3 clés gratuites du jour (valables sur tout donjon),
 *   puis les vraies clés fabriquées, propres à un donjon (Clef de la Crypte de Kardorim) ;
 * - la clé est dépensée en entrant : perdue en cas de défaite.
 */

export const FREE_KEYS_PER_DAY = 3;

export interface KeyState {
  /** Clés gratuites restantes pour `day`. */
  free: number;
  /** Jour (date locale AAAA-MM-JJ) du dernier renouvellement. */
  day: string;
}

/** Date locale du jour, AAAA-MM-JJ. */
export const dayOf = (now: Date) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

/** Les clés gratuites reviennent à 3 chaque jour (elles ne s'accumulent pas). */
export function refreshKeys(k: KeyState | undefined, now = new Date()): KeyState {
  const day = dayOf(now);
  return !k || k.day !== day ? { free: FREE_KEYS_PER_DAY, day } : k;
}

export type EntryCost =
  | { kind: 'open' } // carte de farm : entrée libre
  | { kind: 'first' } // donjon jamais vaincu : tentatives gratuites
  | { kind: 'free'; left: number } // clé gratuite du jour
  | { kind: 'item'; itemId: number; left: number } // clé fabriquée
  | { kind: 'none'; itemId: number | null };

export interface KeyContext {
  keys?: KeyState;
  done: string[];
  resources: Record<string, number>;
}

export function entryCost(s: KeyContext, area: { id: string; kind: 'map' | 'dungeon' }, now = new Date()): EntryCost {
  if (area.kind === 'map') return { kind: 'open' };
  if (!s.done.includes(area.id)) return { kind: 'first' };
  const k = refreshKeys(s.keys, now);
  if (k.free > 0) return { kind: 'free', left: k.free };
  const itemId = DUNGEON_KEYS[area.id] ?? null;
  const n = itemId ? s.resources[itemId] ?? 0 : 0;
  if (itemId && n > 0) return { kind: 'item', itemId, left: n };
  return { kind: 'none', itemId };
}

/** Dépense la clé d'une entrée (ne fait rien si l'entrée est libre). Renvoie null si aucune clé. */
export function payEntry<T extends KeyContext>(s: T, area: { id: string; kind: 'map' | 'dungeon' }, now = new Date()): T | null {
  const c = entryCost(s, area, now);
  if (c.kind === 'none') return null;
  if (c.kind === 'free') return { ...s, keys: { ...refreshKeys(s.keys, now), free: c.left - 1 } };
  if (c.kind === 'item') return { ...s, resources: { ...s.resources, [c.itemId]: c.left - 1 } };
  return s;
}
