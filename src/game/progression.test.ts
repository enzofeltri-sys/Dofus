import { describe, expect, it } from 'vitest';
import {
  addXp, defaultProfile, invest, LEVEL_MAX, levelForXp, levelProgress, minutesForLevel, pointCost, pointsFree, pointsSpentOn,
  resetCarac, START_LEVEL, XP_TABLE, xpDecay, xpGain, xpToNext,
} from './progression';

describe('courbe d’XP', () => {
  it('≈ 4 min au niveau 10, ≈ 18 h pour 199 → 200, ≈ 600 h au total', () => {
    expect(minutesForLevel(10)).toBeCloseTo(4);
    expect(minutesForLevel(199) / 60).toBeGreaterThan(16);
    expect(minutesForLevel(199) / 60).toBeLessThan(20);
    let total = 0;
    for (let n = 1; n < LEVEL_MAX; n++) total += minutesForLevel(n);
    expect(total / 60).toBeGreaterThan(560);
    expect(total / 60).toBeLessThan(640);
  });
  it('table croissante, niveau retrouvé depuis l’XP', () => {
    for (let n = 2; n < LEVEL_MAX; n++) expect(xpToNext(n)).toBeGreaterThan(xpToNext(n - 1));
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(XP_TABLE[10])).toBe(10);
    expect(levelForXp(XP_TABLE[11] - 1)).toBe(10);
    expect(levelForXp(1e15)).toBe(LEVEL_MAX);
    expect(levelProgress(XP_TABLE[10] + 5)).toEqual({ level: 10, into: 5, need: xpToNext(10) });
  });
  it('XP dégressive au-delà de 10 niveaux d’écart, et bonus de Sagesse', () => {
    expect(xpDecay(20, 10)).toBe(1);
    expect(xpDecay(21, 10)).toBeCloseTo(0.85);
    expect(xpDecay(60, 10)).toBe(0.01);
    expect(xpGain(200, 10, 10, 50)).toBe(300);
  });
});

describe('points de caractéristique', () => {
  it('paliers du Sacrieur : 1 pour 1 jusqu’à 100, puis 2, 3, 4 ; Sagesse 3 pour 1 ; Vitalité 1 pour 1', () => {
    expect(pointCost('force', 99)).toBe(1);
    expect(pointCost('force', 100)).toBe(2);
    expect(pointCost('agilite', 250)).toBe(3);
    expect(pointCost('chance', 300)).toBe(4);
    expect(pointCost('sagesse', 0)).toBe(3);
    expect(pointCost('vitalite', 500)).toBe(1);
    expect(pointsSpentOn('force', 110)).toBe(120);
  });
  it('Sacrieur de départ : niveau 10, 45 en Force, aucun point libre', () => {
    const p = defaultProfile();
    expect(levelForXp(p.xp)).toBe(START_LEVEL);
    expect(p.carac.force).toBe(45);
    expect(pointsFree(p)).toBe(0);
  });
  it('un niveau donne 5 points ; on investit, on remet à zéro gratuitement', () => {
    let p = addXp(defaultProfile(), xpToNext(10));
    expect(levelForXp(p.xp)).toBe(11);
    expect(pointsFree(p)).toBe(5);
    p = invest(p, 'sagesse', 5); // 3 points pour 1 : une seule fois
    expect(p.carac.sagesse).toBe(1);
    expect(pointsFree(p)).toBe(2);
    p = resetCarac(p);
    expect(pointsFree(p)).toBe(50);
  });
});
