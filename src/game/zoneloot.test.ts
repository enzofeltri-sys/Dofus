import { describe, expect, it } from 'vitest';
import { AREAS } from './data/areas';
import { isEquipment, isSpecial, ITEMS, SETS } from './data/items';
import { rollDrops, ZONE_EQUIP_CHANCE, zoneEquipPool } from './loot';
import { rng } from '../iso';

describe('Équipement de zone : « une zone = ses panoplies » (refonte validée par Enzo)', () => {
  it('chaque carte a ses pièces de panoplie, et seulement des pièces de panoplie', () => {
    for (const id of Object.keys(AREAS)) {
      const pool = zoneEquipPool(id);
      expect(pool.length, id).toBeGreaterThan(0);
      for (const i of pool) {
        expect(isEquipment(i)).toBe(true);
        expect(ITEMS[i].set, ITEMS[i].name).toBeTruthy();
      }
    }
  });

  it('vraies panoplies des monstres : Bouftou aux Bouftous, Kwaks aux Craqueleurs, Grüt chez les Bworks, Arakne aux Souterrains', () => {
    const sets = (id: string) => new Set(zoneEquipPool(id).map((i) => SETS[ITEMS[i].set!].name));
    expect(sets('tainela').has('Panoplie du Bouftou')).toBe(true);
    expect(sets('cour').has('Panoplie du Bouftou Royal')).toBe(true);
    expect(sets('craqueleurs').has('Panoplie du Kwak de Glace')).toBe(true);
    expect(sets('campementBworks').has('Panoplie de Grüt')).toBe(true);
    expect(sets('souterrains').has('Panoplie Arakne')).toBe(true);
    expect(sets('calanques').has('Panoplie en Mousse')).toBe(true);
  });

  it('un équipement hors panoplie de la carte ne tombe jamais (il se fabrique)', () => {
    const r = rng(3);
    const pool = zoneEquipPool('crypte');
    for (let i = 0; i < 3000; i++)
      for (const id of rollDrops({ dofusId: 4051, boss: true, prospection: 300, zonePool: pool }, r))
        if (isEquipment(id) && !isSpecial(id)) expect(pool).toContain(id);
  });

  it('chances : 5 % par monstre, 20 % par élite, 50 % par boss (Prospection 100, choix d’Enzo)', () => {
    const pool = zoneEquipPool('cour');
    const set = new Set(pool);
    const rate = (ctx: { boss?: boolean; elite?: boolean }) => {
      const rnd = rng(7);
      let n = 0;
      const N = 60000;
      for (let i = 0; i < N; i++) n += rollDrops({ dofusId: -1, prospection: 100, zonePool: pool, ...ctx }, rnd).filter((x) => set.has(x)).length;
      return n / N;
    };
    expect(rate({})).toBeCloseTo(0.05, 2);
    expect(rate({ elite: true })).toBeCloseTo(0.2, 1);
    expect(ZONE_EQUIP_CHANCE.monster * ZONE_EQUIP_CHANCE.elite).toBeCloseTo(0.2, 5);
    expect(rate({ boss: true })).toBeCloseTo(0.5, 1);
  });
});
