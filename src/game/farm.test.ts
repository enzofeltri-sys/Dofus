import { describe, expect, it } from 'vitest';
import { AREAS } from './data/areas';
import { item } from './data/items';
import { collectExpedition, FARM, instantFarm, instantLeft, runLoot, runSeconds, startExpedition } from './farm';
import { emptySave, type SaveData } from './save';
import { rng } from '../iso';

const done = (): SaveData => ({ ...emptySave(), done: ['champs', 'paturages', 'crypte', 'cite'] });
const count = (loot: Record<string, number>, equip: boolean) => Object.entries(loot).filter(([k]) => (item(Number(k)).slot !== null) === equip).reduce((a, [, n]) => a + n, 0);

describe('Farm (validé par Enzo)', () => {
  it('une partie calculée rapporte autant qu’une vraie partie (Cité : ~1,3 équipement, ~4-5 ressources)', () => {
    const rnd = rng(3);
    let eq = 0, res = 0;
    for (let i = 0; i < 400; i++) {
      const l = runLoot(AREAS.cite, 100, rnd);
      eq += count(l, true);
      res += count(l, false);
    }
    expect(eq / 400).toBeGreaterThan(0.9);
    expect(eq / 400).toBeLessThan(1.8);
    expect(res / 400).toBeGreaterThan(2);
    expect(runSeconds(AREAS.cite)).toBeGreaterThan(60);
    expect(runSeconds(AREAS.cite)).toBeLessThan(150);
  });

  it('farm instantané : seulement sur une carte terminée, 5 par jour et par zone, sans XP', () => {
    const now = new Date(2026, 9, 19, 12);
    let s = done();
    expect(instantFarm(s, 'foret', 100, rng(1), now)).toBeNull(); // pas terminée
    expect(instantFarm(s, 'crypte', 100, rng(1), now)).toBeNull(); // donjon
    const xp = s.profile.xp;
    for (let i = 0; i < FARM.instantPerDay; i++) {
      const r = instantFarm(s, 'cite', 100, rng(i + 1), now)!;
      expect(r).not.toBeNull();
      s = r.save;
    }
    expect(s.profile.xp).toBe(xp);
    expect(instantLeft(s, 'cite', now)).toBe(0);
    expect(instantFarm(s, 'cite', 100, rng(99), now)).toBeNull();
    expect(instantLeft(s, 'champs', now)).toBe(FARM.instantPerDay); // autre zone (Incarnam) : compteur à part
    expect(instantFarm(s, 'paturages', 100, rng(98), now)).not.toBeNull();
    expect(instantLeft(s, 'cite', new Date(2026, 9, 20, 8))).toBe(FARM.instantPerDay); // le lendemain
  });

  it('expédition : une à la fois, butin selon le temps (plafond 8 h), 20 % d’une vraie partie, sans XP', () => {
    const t0 = Date.UTC(2026, 9, 19, 8);
    const s = startExpedition(done(), 'cite', t0)!;
    expect(startExpedition(s, 'champs', t0)).toBeNull();
    const h1 = collectExpedition(s, 100, rng(5), t0 + 3600e3)!;
    const h8 = collectExpedition(s, 100, rng(5), t0 + 8 * 3600e3)!;
    const h20 = collectExpedition(s, 100, rng(5), t0 + 20 * 3600e3)!;
    const runsPerHour = 3600 / runSeconds(AREAS.cite);
    const eq1 = count(h1.loot, true);
    expect(eq1).toBeGreaterThan(runsPerHour * 0.2 * 0.6);
    expect(eq1).toBeLessThan(runsPerHour * 0.2 * 2);
    expect(count(h8.loot, true)).toBeGreaterThan(eq1 * 5);
    expect(Math.abs(count(h20.loot, true) - count(h8.loot, true))).toBeLessThan(count(h8.loot, true) * 0.25); // plafonné
    expect(h1.save.expedition).toBeUndefined();
    expect(h1.save.profile.xp).toBe(s.profile.xp);
    console.log(`expédition Cité : 1 h → ${eq1} équipements, ${count(h1.loot, false)} ressources ; 8 h → ${count(h8.loot, true)} équipements, ${count(h8.loot, false)} ressources`);
  });
});
