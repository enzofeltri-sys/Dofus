import { describe, expect, it } from 'vitest';
import { applyResistances, baseStats, maxHp, rawDamage, resolveHit } from './formulas';

describe('rawDamage', () => {
  it('applique la caractéristique et la puissance', () => {
    // 10 × (100 + 60 Force + 40 Puissance) / 100 = 20
    expect(rawDamage(10, 'terre', baseStats({ force: 60, puissance: 40 }), false)).toBe(20);
  });
  it('neutre utilise la Force, feu l’Intelligence', () => {
    const s = baseStats({ force: 100, intelligence: 0 });
    expect(rawDamage(10, 'neutre', s, false)).toBe(20);
    expect(rawDamage(10, 'feu', s, false)).toBe(10);
  });
  it('ajoute les dommages fixes et les dommages critiques en critique', () => {
    const s = baseStats({ dommages: 3, dommagesCritiques: 5 });
    expect(rawDamage(10, 'air', s, false)).toBe(13);
    expect(rawDamage(10, 'air', s, true)).toBe(18);
  });
  it('une caractéristique très négative ne donne pas de dommages négatifs', () => {
    expect(rawDamage(10, 'eau', baseStats({ chance: -500 }), false)).toBe(0);
  });
});

describe('applyResistances', () => {
  it('retire les fixes puis le pourcentage', () => {
    const t = baseStats({ resFixe: { neutre: 0, terre: 4, feu: 0, eau: 0, air: 0 }, resPct: { neutre: 0, terre: 20, feu: 0, eau: 0, air: 0 } });
    // (24 - 4) × 80 % = 16
    expect(applyResistances(24, 'terre', t)).toBe(16);
  });
  it('plafonne les résistances à 50 %', () => {
    const t = baseStats({ resPct: { neutre: 90, terre: 0, feu: 0, eau: 0, air: 0 } });
    expect(applyResistances(20, 'neutre', t)).toBe(10);
  });
});

describe('maxHp', () => {
  it('niveau 12 avec 20 de Vitalité', () => {
    expect(maxHp(12, 20)).toBe(130);
  });
});

describe('resolveHit', () => {
  it('critique garanti ajoute le bonus critique', () => {
    const seq = [0, 0]; // 1er tirage : critique ; 2e : jet minimal
    const rnd = () => seq.shift() ?? 0;
    const hit = resolveHit({ min: 5, max: 9, critBonus: 3, critBase: 100, element: 'neutre' }, baseStats({ force: 100 }), baseStats(), rnd);
    expect(hit).toEqual({ crit: true, damage: 16 }); // (5 + 3) × 2
  });
  it('jet maximal sans critique', () => {
    const seq = [0.99, 0.999];
    const rnd = () => seq.shift() ?? 0;
    const hit = resolveHit({ min: 5, max: 9, critBonus: 3, critBase: 5, element: 'neutre' }, baseStats(), baseStats(), rnd);
    expect(hit).toEqual({ crit: false, damage: 9 });
  });
});
