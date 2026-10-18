import { describe, expect, it } from 'vitest';
import { AREAS, zoneEquipRange } from './data/areas';
import { isEquipment, ITEMS } from './data/items';
import { ZONE_EQUIP } from './data/items.gen';
import { rollDrops, ZONE_EQUIP_CHANCE, zoneEquipPool } from './loot';
import { rng } from '../iso';

describe('Équipement de zone (validé par Enzo)', () => {
  it('tranches : Incarnam 1-10, Astrub 11-21, Bouftous 22-30, Amakna 31-40 ; carte : jusqu’à son niveau + 2', () => {
    expect(zoneEquipRange('champs')).toMatchObject({ lo: 1, hi: 5 });
    expect(zoneEquipRange('crypte')).toMatchObject({ lo: 1, hi: 10 });
    expect(zoneEquipRange('cite')).toMatchObject({ lo: 11, hi: 14 });
    expect(zoneEquipRange('chateau')).toMatchObject({ lo: 11, hi: 21 });
    expect(zoneEquipRange('tainela')).toMatchObject({ lo: 22, hi: 24 });
    expect(zoneEquipRange('cour')).toMatchObject({ lo: 22, hi: 30 });
    expect(zoneEquipRange('squelettes')).toMatchObject({ lo: 31, hi: 40 });
  });

  it('des centaines de vrais équipements, tous droppables quelque part, chacun dans sa tranche', () => {
    expect(ZONE_EQUIP.length).toBeGreaterThan(500);
    const everywhere = new Set(Object.keys(AREAS).flatMap((id) => zoneEquipPool(id)));
    for (const id of ZONE_EQUIP) {
      expect(isEquipment(id)).toBe(true);
      expect(everywhere.has(id), ITEMS[id].name).toBe(true);
    }
    for (const id of Object.keys(AREAS)) {
      const r = zoneEquipRange(id);
      if (!r) continue;
      const pool = zoneEquipPool(id);
      expect(pool.length, id).toBeGreaterThan(0);
      for (const i of pool) expect(ITEMS[i].level >= r.lo && ITEMS[i].level <= r.hi).toBe(true);
    }
  });

  it('chances : 1 % par monstre, ×3 élite, 50 % boss (Prospection 100)', () => {
    const pool = zoneEquipPool('cour');
    const set = new Set(pool);
    const rate = (ctx: { boss?: boolean; elite?: boolean }) => {
      const rnd = rng(7);
      let n = 0;
      const N = 60000;
      for (let i = 0; i < N; i++) n += rollDrops({ dofusId: -1, prospection: 100, zonePool: pool, ...ctx }, rnd).filter((x) => set.has(x)).length;
      return n / N;
    };
    expect(rate({})).toBeCloseTo(ZONE_EQUIP_CHANCE.monster, 2);
    expect(rate({ elite: true })).toBeCloseTo(0.03, 2);
    expect(rate({ boss: true })).toBeCloseTo(0.5, 1);
  });
});
