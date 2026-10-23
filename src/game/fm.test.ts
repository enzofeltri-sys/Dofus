import { describe, expect, it } from 'vitest';
import type { Workshop } from './craft';
import { applyRune, fmCheck, overmaxCap, puitsMax } from './fm';
import { instance, itemLines } from './inventory';

const CAPE = 2473; // Cape de l'Aventurier, niveau 8 : Force, Intelligence, Chance, Agilité 5
const FO1 = 1519, AGI3 = 1549, PA = 1557, VI15 = 1548, VI50 = 1554;
const seq = (...xs: number[]) => {
  let i = 0;
  return () => xs[Math.min(i++, xs.length - 1)];
};
const shop = (rolls = [5, 5, 5, 5], puits?: number): Workshop => ({
  jobXp: 0,
  kamas: 1e9,
  resources: { [FO1]: 50, [AGI3]: 5, [PA]: 5, [VI15]: 5, [VI50]: 5 },
  inventory: { items: [{ uid: 1, id: CAPE, rolls, puits }], equipped: {}, nextUid: 2 },
});
const cape = (w: Workshop) => instance(w.inventory, 1)!;

describe('forgemagie', () => {
  it('succès critique : la stat monte, rien n’est perdu, la rune est consommée', () => {
    const r = applyRune(shop([3, 5, 5, 5]), 1, FO1, seq(0));
    expect(r.outcome).toBe('sc');
    expect(cape(r.workshop).rolls).toEqual([4, 5, 5, 5]);
    expect(r.workshop.resources[FO1]).toBe(49);
  });

  it('succès neutre : la stat monte, une autre ligne perd autant de poids', () => {
    const r = applyRune(shop([5, 5, 5, 2]), 1, AGI3, seq(0.6, 0));
    expect(r.outcome).toBe('sn');
    const rolls = cape(r.workshop).rolls;
    expect(rolls[3]).toBe(5);
    expect(rolls.slice(0, 3).reduce((a, b) => a + b, 0)).toBe(15 - 3);
  });

  it('échec critique : rien ne monte, le poids perdu va dans le puits', () => {
    const r = applyRune(shop([5, 5, 5, 2]), 1, AGI3, seq(0.95, 0));
    expect(r.outcome).toBe('ec');
    expect(cape(r.workshop).rolls[3]).toBe(2);
    expect(cape(r.workshop).puits).toBe(3);
  });

  it('le puits paie les pertes avant les lignes', () => {
    const r = applyRune(shop([5, 5, 5, 2], 10), 1, AGI3, seq(0.6));
    expect(r.outcome).toBe('sn');
    expect(cape(r.workshop).rolls).toEqual([5, 5, 5, 5]);
    expect(cape(r.workshop).puits).toBe(7);
  });

  it('overmax : au-delà du jet max avec moins de chances, et jamais au-delà du plafond', () => {
    const c = fmCheck(shop(), 1, FO1);
    expect(c.ok && c.target).toBe('over');
    const cap = 5 + overmaxCap('force', 8, 0);
    expect(fmCheck(shop([cap, 5, 5, 5]), 1, FO1)).toEqual({ ok: false, reason: 'Overmax maximal' });
  });

  it('exo : une seule ligne en plus ; PA possible mais très rare et +1 au plus', () => {
    const c = fmCheck(shop(), 1, PA);
    expect(c.ok && c.target).toBe('exo');
    expect(c.ok && c.odds[0] + c.odds[1]).toBeLessThanOrEqual(0.02);
    const r = applyRune(shop(), 1, PA, seq(0));
    expect(cape(r.workshop).exo).toEqual(['pa', 1]);
    expect(itemLines(cape(r.workshop))).toContainEqual(['pa', 1]);
    expect(fmCheck(r.workshop, 1, PA)).toEqual({ ok: false, reason: 'Overmax maximal' });
    expect(fmCheck(r.workshop, 1, VI15)).toEqual({ ok: false, reason: 'Déjà une ligne exo' });
    // une exo de Vitalité est plafonnée selon le niveau
    expect(fmCheck(shop(), 1, VI50).ok).toBe(false);
    expect(fmCheck(shop(), 1, VI15).ok).toBe(true);
  });

  it('plus l’objet est rare, plus son puits est grand', () => {
    expect(puitsMax(8, 4)).toBeGreaterThan(puitsMax(8, 0) * 2.5);
  });

  it('kamas : chaque rune se paie (rune PA bien plus chère que rune Fo), refusée sans assez de kamas', () => {
    const w = shop();
    const fo = fmCheck(w, 1, FO1), pa = fmCheck(w, 1, PA);
    expect(fo.ok && pa.ok).toBe(true);
    if (!fo.ok || !pa.ok) return;
    expect(fo.cost).toBe(13); // poids 1 × (niveau 8 + 5)
    expect(pa.cost).toBe(1300); // poids 100 × 13
    const r = applyRune(w, 1, FO1, seq(0));
    expect(r.workshop.kamas).toBe(1e9 - 13);
    const poor = { ...w, kamas: 12 };
    expect(fmCheck(poor, 1, FO1)).toMatchObject({ ok: false, reason: '13 K requis' });
    expect(applyRune(poor, 1, FO1, seq(0)).outcome).toBeNull();
  });

  it('version simple (choix d’Enzo) : succès critique rend la rune, échec ne change rien, échec critique ne baisse que cette ligne', () => {
    const w = shop([3, 5, 5, 5]); // Force sous son jet max (5)
    const sc = applyRune(w, 1, FO1, seq(0), 'simple');
    expect(sc.outcome).toBe('sc');
    expect(cape(sc.workshop).rolls).toEqual([4, 5, 5, 5]);
    expect(sc.workshop.resources[FO1]).toBe(50);
    const sn = applyRune(w, 1, FO1, seq(0.5), 'simple');
    expect(sn.outcome).toBe('sn');
    expect(cape(sn.workshop).rolls).toEqual([4, 5, 5, 5]);
    expect(sn.workshop.resources[FO1]).toBe(49);
    const ef = applyRune(w, 1, FO1, seq(0.85), 'simple');
    expect(ef.outcome).toBe('ef');
    expect(cape(ef.workshop).rolls).toEqual([3, 5, 5, 5]);
    expect(ef.workshop.resources[FO1]).toBe(49);
    const ec = applyRune(w, 1, FO1, seq(0.99), 'simple');
    expect(ec.outcome).toBe('ec');
    expect(cape(ec.workshop).rolls).toEqual([2, 5, 5, 5]);
    expect(cape(ec.workshop).puits).toBeUndefined();
    // chaque résultat se paie en kamas
    for (const r of [sc, sn, ef, ec]) expect(r.workshop.kamas).toBe(1e9 - 13);
  });

  it('version simple : chances 25 / 50 / 20 / 5 % sous le jet max', () => {
    const c = fmCheck(shop([3, 5, 5, 5]), 1, FO1, 'simple');
    expect(c.ok && c.odds).toEqual([0.25, 0.5, 0.2]);
  });
});
