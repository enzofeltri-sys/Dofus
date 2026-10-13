import { describe, expect, it } from 'vitest';
import { addStats, applyResistances, baseStats, dodgePaOf, erosionLoss, escapeChance, escapeOf, finalMultiplier, initiativeOf, maxHp, prospectionOf, pushDamage, rawDamage, resolveHit, tackleOf } from './formulas';

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

describe('fiche complète', () => {
  it('dommages élémentaires fixes et résistance critique', () => {
    const a = baseStats({ dommagesElem: { neutre: 0, terre: 4, feu: 0, eau: 0, air: 0 } });
    expect(rawDamage(10, 'terre', a, false)).toBe(14);
    expect(rawDamage(10, 'feu', a, false)).toBe(10);
    const t = baseStats({ resCrit: 5 });
    expect(applyResistances(20, 'neutre', t, true)).toBe(15);
    expect(applyResistances(20, 'neutre', t, false)).toBe(20);
  });
  it('une faiblesse (résistance négative) augmente les dommages', () => {
    const t = baseStats({ resPct: { neutre: 0, terre: -15, feu: 0, eau: 0, air: 0 } });
    expect(applyResistances(20, 'terre', t)).toBe(23);
  });
  it('dommages finaux : mêlée / distance, arme / sort, et résistances mêlée de la cible', () => {
    const a = baseStats({ pctMelee: 10, pctArme: 20, pctDistance: 50 });
    const t = baseStats({ resMelee: 10 });
    expect(finalMultiplier({ melee: true, source: 'arme' }, a, t)).toBeCloseTo(1.1 * 1.2 * 0.9);
    expect(finalMultiplier({ melee: false, source: 'sort' }, a, t)).toBeCloseTo(1.5);
    const rnd = () => 0.99;
    expect(resolveHit({ min: 10, max: 10, critBonus: 0, critBase: 0, element: 'neutre' }, a, t, rnd, { melee: true, source: 'arme' }).damage).toBe(11);
  });
  it('dommages de poussée (formule Dofus)', () => {
    // (10 / 2 + 0 − 0 + 32) × 1 / 4 = 9
    expect(pushDamage(10, baseStats(), baseStats(), 1)).toBe(9);
    expect(pushDamage(10, baseStats({ dommagesPoussee: 8 }), baseStats({ resPoussee: 4 }), 2)).toBe(20);
  });
  it('érosion de base 10 %, plafonnée à 50 %', () => {
    expect(erosionLoss(40, baseStats())).toBe(4);
    expect(erosionLoss(40, baseStats({ erosion: 90 }))).toBe(20);
  });
  it('tacle / fuite, esquive, prospection, initiative dérivés des caractéristiques', () => {
    const s = baseStats({ agilite: 45, sagesse: 32, chance: 25, force: 85, tacle: 2 });
    expect(tackleOf(s)).toBe(6);
    expect(escapeOf(s)).toBe(4);
    expect(dodgePaOf(s)).toBe(3);
    expect(prospectionOf(s)).toBe(102);
    expect(initiativeOf(s, 50, 100)).toBe(Math.floor((85 + 25 + 45) / 2));
    expect(escapeChance(10, 10)).toBe(0.5);
    expect(escapeChance(50, 0)).toBe(1);
  });
  it('addStats additionne aussi les champs par élément', () => {
    const s = addStats(baseStats({ force: 10 }), { force: 5, resPct: { neutre: 0, terre: 0, feu: 3, eau: 0, air: 0 } });
    expect(s.force).toBe(15);
    expect(s.resPct.feu).toBe(3);
  });
});
