import { describe, expect, it } from 'vitest';
import { isUnlocked, ZONES } from './data/areas';
import { gearStats, worn } from './inventory';
import { levelForXp } from './progression';
import { emptySave } from './save';
import { applyTest, BOUFTOU_GEAR } from './testmode';

describe('mode test', () => {
  it('règle le niveau', () => {
    expect(levelForXp(applyTest(emptySave(), { kind: 'niveau', level: 25 }).profile.xp)).toBe(25);
  });
  it('débloque toutes les zones', () => {
    const s = applyTest(emptySave(), { kind: 'zones' });
    for (const n of ZONES.flatMap((z) => z.nodes)) if (!n.soon) expect(isUnlocked(n, s.done), n.id).toBe(true);
  });
  it('prêt pour le Donjon des Bouftous : niveau 30, donjon ouvert mais pas fait, Panoplie du Bouftou portée', () => {
    const s = applyTest(emptySave(), { kind: 'bouftous' });
    expect(levelForXp(s.profile.xp)).toBe(30);
    expect(s.area).toBe('cour');
    expect(s.done).not.toContain('cour');
    const cour = ZONES.flatMap((z) => z.nodes).find((n) => n.id === 'cour')!;
    expect(isUnlocked(cour, s.done)).toBe(true);
    expect(worn(s.inventory).length).toBe(BOUFTOU_GEAR.length);
    expect(Object.keys(gearStats(s.inventory)).length).toBeGreaterThan(0);
  });
});
