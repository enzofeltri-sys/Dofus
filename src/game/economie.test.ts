import { describe, expect, it } from 'vitest';
import { rng } from '../iso';
import { AREAS } from './data/areas';
import { ITEMS } from './data/items';
import { runKamas } from './farm';
import { kamasFor, runeCost } from './kamas';
import { XP_TABLE } from './progression';
import { applyRun, emptySave, type RunResult } from './save';

const run = (items: Record<string, number>, kamas = 0): RunResult => ({
  won: false, room: 1, time: 20, kills: 1, dealt: 0, taken: 0, healed: 0, cards: [],
  loot: { xp: 0, kamas, items }, bossLoot: { xp: 0, items: {} }, area: 'champs',
});
const LOW = Object.values(ITEMS).find((d) => d.slot === 'anneau' && d.level <= 5 && d.effects.length)!.id;
const HIGH = Object.values(ITEMS).find((d) => d.slot === 'anneau' && d.level >= 30 && d.level <= 35 && d.effects.length)!.id;

describe('brisage automatique du butin (choix d’Enzo)', () => {
  it('les équipements obtenus sous le seuil deviennent des runes, les autres restent', () => {
    const s = { ...emptySave(), autoBreak: 20, profile: { ...emptySave().profile, xp: XP_TABLE[40] } };
    const n0 = s.inventory.items.length;
    const r = applyRun(s, run({ [LOW]: 2, [HIGH]: 1 }), rng(3));
    expect(r.broken.n).toBe(2);
    expect(r.save.inventory.items.length).toBe(n0 + 1);
    expect(r.fresh).toHaveLength(1);
    expect(Object.values(r.broken.runes).reduce((a, b) => a + b, 0)).toBeGreaterThan(0);
  });

  it('désactivé par défaut, et sans effet tant que le personnage est sous le niveau 17', () => {
    const r = applyRun(emptySave(), run({ [LOW]: 1 }), rng(3));
    expect(r.broken.n).toBe(0);
    const young = applyRun({ ...emptySave(), autoBreak: 10 }, run({ [LOW]: 1 }), rng(3));
    expect(young.broken.n).toBe(0);
  });
});

describe('kamas', () => {
  it('gagnés en partie et gardés dans la sauvegarde', () => {
    const r = applyRun(emptySave(), run({}, 250), rng(1));
    expect(r.save.kamas).toBe(250);
    expect(kamasFor(20, 'monster')).toBe(23);
    expect(kamasFor(20, 'elite')).toBe(115);
    expect(kamasFor(20, 'boss')).toBe(460);
  });

  it('une partie paie environ une dizaine de runes moyennes (poids 3) sur un objet de son niveau', () => {
    for (const id of ['champs', 'cite', 'craqueleurs']) {
      const A = AREAS[id];
      let k = 0;
      for (let i = 0; i < 50; i++) k += runKamas(A, rng(i + 1));
      const perRun = k / 50;
      const lv = A.level;
      const mid = Object.values(ITEMS).find((d) => d.level === lv && d.slot)?.id ?? 2473;
      // Rune Pa Fo (+3 Force, poids 3)
      const cost = runeCost(1545, mid);
      const runes = perRun / cost;
      expect(runes, `${id} : ${perRun.toFixed(0)} K par partie, ${cost} K la rune`).toBeGreaterThan(7);
      expect(runes).toBeLessThan(15);
    }
  });
});
