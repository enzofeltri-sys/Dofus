import { describe, expect, it } from 'vitest';
import { item } from './data/items';
import { canBreak, fusionPartners, makeItem } from './forge';
import { canEquip, emptyInventory, addItem, equip, itemLines } from './inventory';
import { rollDrops } from './loot';
import { BOSS_DOFUS, feedPet, PET_FOOD, SPECIAL_CHANCE, ZONE_PETS } from './pets';
import { rng } from '../iso';

const add = (inv: ReturnType<typeof emptyInventory>, id: number) => {
  const { rolls, ...rest } = makeItem(id, 3, Math.random);
  return addItem(inv, id, rolls, rest);
};

describe('Familiers, Super Croquettes et Dofus (validés par Enzo)', () => {
  it('données réelles : familiers et Dofus équipables, Super Croquette = ressource', () => {
    for (const ids of Object.values(ZONE_PETS)) for (const id of ids) expect(item(id).slot).toBe('familier');
    for (const id of Object.values(BOSS_DOFUS)) expect(item(id).slot).toBe('dofus');
    expect(item(PET_FOOD).slot).toBeNull();
    expect(item(7712).effects[0]).toEqual(['force', 120, 120]); // Pioute vert : Force 120 au maximum
  });

  it('un familier commence à 20 % (sans rareté), grandit de 4 % par croquette jusqu’à 100 %', () => {
    let inv = add(emptyInventory(), 7712);
    const pet = inv.items[0];
    expect(pet.rarity).toBeUndefined();
    expect(pet.food).toBe(20);
    expect(itemLines(pet)[0]).toEqual(['force', 24]);
    const r = feedPet(inv, pet.uid, 50);
    expect(r.eaten).toBe(20);
    inv = r.inventory;
    expect(inv.items[0].food).toBe(100);
    expect(itemLines(inv.items[0])[0]).toEqual(['force', 120]);
    expect(feedPet(inv, pet.uid, 3).eaten).toBe(0);
  });

  it('ni fusion ni brisage ; un seul exemplaire de chaque Dofus', () => {
    let inv = add(add(add(emptyInventory(), 7712), 7712), 7712);
    expect(fusionPartners(inv, 1)).toEqual([]);
    expect(canBreak(inv, 1).ok).toBe(false);
    inv = add(add(inv, 7113), 7113);
    inv = equip(inv, 4, 50);
    expect(canEquip(inv, 5, 50)).toEqual({ ok: false, reason: 'Ce Dofus est déjà porté' });
    inv = equip(inv, 1, 50);
    expect(inv.equipped.familier).toBe(1);
  });

  it('chances : croquette 3 % par monstre, familier 3 % (élite) et 10 % (boss), Dofus 0,5 % (boss)', () => {
    const rate = (ctx: Parameters<typeof rollDrops>[0], id: (x: number) => boolean) => {
      const rnd = rng(11);
      let n = 0;
      const N = 80000;
      for (let i = 0; i < N; i++) n += rollDrops(ctx, rnd).filter(id).length;
      return n / N;
    };
    const pets = ZONE_PETS.astrub;
    expect(rate({ dofusId: -1, prospection: 100, food: true }, (x) => x === PET_FOOD)).toBeCloseTo(SPECIAL_CHANCE.food, 2);
    expect(rate({ dofusId: -1, prospection: 100, pets: { ids: pets, from: 'elite' } }, (x) => pets.includes(x))).toBeCloseTo(0.03, 2);
    expect(rate({ dofusId: -1, prospection: 100, boss: true, pets: { ids: pets, from: 'boss' } }, (x) => pets.includes(x))).toBeCloseTo(0.1, 2);
    expect(rate({ dofusId: -1, prospection: 100, boss: true, dofus: 7113 }, (x) => x === 7113)).toBeCloseTo(0.005, 3);
  });
});
