import { describe, expect, it } from 'vitest';
import { beastBonuses, claimable, PARCHO_CAP, TIERS, tierReward, tierState } from './bestiary';
import { startingHero } from './data/hero';
import { MONSTERS } from './data/monsters';
import { AREAS } from './data/areas';
import { claimTier, emptySave } from './save';
import { World } from './world';

describe('Paliers du bestiaire (validés par Enzo)', () => {
  it('seuils : 10/50/200/1000 (normaux), 1/5/20/50 (boss et élites), 1/5 (archimonstres)', () => {
    expect(TIERS.normal).toEqual([10, 50, 200, 1000]);
    expect(tierState(MONSTERS.bouftouRoyal, { seen: 3, slain: 5 }).reached).toBe(2);
    expect(tierState(MONSTERS.archi2317, { seen: 1, slain: 1 }).goals).toEqual([1, 5]);
  });

  it('récompenses dans l’ordre : butin, runes de son élément, parchemin (+1, plafond 100), archimonstre ×2', () => {
    let s = { ...emptySave(), bestiary: { bouftou: { seen: 1200, slain: 1200 } } };
    expect(claimable(s.bestiary)).toBe(4);
    s = claimTier(s, 'bouftou')!;
    expect(beastBonuses(s.bestiary).bouftou.drop).toBeCloseTo(0.05);
    s = claimTier(s, 'bouftou')!;
    expect(s.resources[1522]).toBe(3); // Bouftou : Feu → Rune Ine
    const vit0 = startingHero(s.profile).stats.intelligence;
    s = claimTier(s, 'bouftou')!;
    expect(s.profile.parcho?.intelligence).toBe(1);
    expect(startingHero(s.profile).stats.intelligence).toBe(vit0 + 1);
    expect(beastBonuses(s.bestiary).bouftou.drop).toBeCloseTo(0.15);
    s = claimTier(s, 'bouftou')!;
    expect(beastBonuses(s.bestiary).bouftou.archi).toBe(2);
    expect(claimTier(s, 'bouftou')).toBeNull();
    expect(claimable(s.bestiary)).toBe(0);
    expect(tierReward(MONSTERS.bouftou, 3).text).toContain('Archimonstre');
    // plafond des parchemins
    const full = { ...s, profile: { ...s.profile, parcho: { intelligence: PARCHO_CAP } }, bestiary: { ...s.bestiary, bouftou: { seen: 300, slain: 300, claimed: 2 } } };
    expect(claimTier(full, 'bouftou')!.profile.parcho?.intelligence).toBe(PARCHO_CAP);
  });

  it('pas de palier sans victoires suffisantes', () => {
    const s = { ...emptySave(), bestiary: { bouftou: { seen: 20, slain: 9 } } };
    expect(claimTier(s, 'bouftou')).toBeNull();
  });

  it('en combat : le palier 4 double la chance d’archimonstre', () => {
    const count = (bonus: boolean) => {
      let n = 0;
      for (let seed = 1; seed <= 400; seed++) {
        const w = new World(seed, startingHero(), AREAS.coinBouftous);
        if (bonus) w.beastBonus = { bouftou: { drop: 0, archi: 2 }, bouftonBlanc: { drop: 0, archi: 2 }, bouftonNoir: { drop: 0, archi: 2 }, chefBouftou: { drop: 0, archi: 2 } };
        w.startRoom(1);
        n += w.monsters.filter((m) => m.def.archi).length;
      }
      return n;
    };
    expect(count(true)).toBeGreaterThan(count(false) * 1.4);
  });
});
