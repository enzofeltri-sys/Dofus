import { describe, expect, it } from 'vitest';
import { DUNGEON_KEYS, RECIPE_DATA } from './data/items.gen';
import { entryCost, FREE_KEYS_PER_DAY, payEntry, refreshKeys } from './keys';

const crypte = { id: 'crypte', kind: 'dungeon' as const };
const champs = { id: 'champs', kind: 'map' as const };
const day1 = new Date(2026, 9, 17, 10), day1b = new Date(2026, 9, 17, 23, 30), day2 = new Date(2026, 9, 18, 0, 5);
const base = { done: ['champs', 'paturages', 'foret', 'cimetiere'], resources: {} as Record<string, number> };

describe('clés de donjon', () => {
  it('cartes de farm et donjon jamais vaincu : entrée libre', () => {
    expect(entryCost(base, champs).kind).toBe('open');
    expect(entryCost(base, crypte).kind).toBe('first');
    expect(payEntry(base, crypte)).toBe(base);
  });

  it('donjon vaincu : 3 clés gratuites par jour, puis plus rien', () => {
    let s: typeof base & { keys?: ReturnType<typeof refreshKeys> } = { ...base, done: [...base.done, 'crypte'] };
    for (let i = FREE_KEYS_PER_DAY; i > 0; i--) {
      expect(entryCost(s, crypte, day1)).toEqual({ kind: 'free', left: i });
      s = payEntry(s, crypte, day1)!;
    }
    expect(entryCost(s, crypte, day1b).kind).toBe('none');
    expect(payEntry(s, crypte, day1b)).toBeNull();
    // le lendemain, 3 clés de nouveau (elles ne s'accumulent pas)
    expect(entryCost(s, crypte, day2)).toEqual({ kind: 'free', left: 3 });
  });

  it('sans clé gratuite, on dépense une vraie Clef de la Crypte de Kardorim', () => {
    const key = DUNGEON_KEYS.crypte;
    const s = { ...base, done: [...base.done, 'crypte'], keys: { free: 0, day: '2026-10-17' }, resources: { [key]: 2 } };
    expect(entryCost(s, crypte, day1)).toEqual({ kind: 'item', itemId: key, left: 2 });
    const t = payEntry(s, crypte, day1)!;
    expect(t.resources[key]).toBe(1);
  });

  it('la Clef de la Crypte a sa vraie recette (Dofus 3)', () => {
    const r = RECIPE_DATA.find((x) => x.id === DUNGEON_KEYS.crypte)!;
    expect(r.ingredients).toEqual([[16524, 3], [1984, 5]]);
  });
});
