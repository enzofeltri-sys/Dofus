import { describe, expect, it } from 'vitest';
import { rng } from '../iso';
import { applyCard, drawCards, STAT_BONUS } from './cards';
import { startingHero } from './data/hero';
import { World } from './world';

describe('cartes de bonus (choix d’Enzo : tous les éléments, Vitalité et Sagesse)', () => {
  it('Force, Intelligence, Chance, Agilité, Vitalité et Sagesse existent', () => {
    for (const s of ['force', 'intelligence', 'chance', 'agilite', 'vitalite', 'sagesse'] as const) expect(STAT_BONUS[s]).toBeDefined();
  });

  it('une carte Intelligence / Sagesse monte la stat en combat', () => {
    const w = new World(3);
    const i0 = w.heroStats().intelligence, s0 = w.heroStats().sagesse;
    applyCard(w, { kind: 'stat', stat: 'intelligence' });
    applyCard(w, { kind: 'stat', stat: 'sagesse' });
    expect(w.heroStats().intelligence).toBe(i0 + 15);
    expect(w.heroStats().sagesse).toBe(s0 + 15);
  });

  it('les cartes d’élément tombent selon les points mis dans chaque élément', () => {
    const hero = startingHero();
    const w = new World(3, { ...hero, stats: { ...hero.stats, force: 0, intelligence: 200, chance: 0, agilite: 0 } });
    w.run.slots = w.run.slots.map(() => null);
    const n: Record<string, number> = {};
    const r = rng(5);
    for (let i = 0; i < 4000; i++) for (const c of drawCards(w, r)) if (c.kind === 'stat') n[c.stat] = (n[c.stat] ?? 0) + 1;
    expect(n.intelligence).toBeGreaterThan(5 * (n.force ?? 0));
    expect(n.chance ?? 0).toBeGreaterThan(0);
    expect(n.sagesse).toBeGreaterThan(0);
  });
});
