import { describe, expect, it } from 'vitest';
import { AREAS, isUnlocked, ZONES } from './data/areas';
import { startingHero } from './data/hero';
import { MONSTERS } from './data/monsters';
import { ARCHI_OF } from './data/monsters.astrub';
import { DUNGEON_KEYS } from './data/items.gen';
import { allBeasts } from './bestiary';
import { STEP, World } from './world';

const tough = () => ({ ...startingHero(), hp: 100000 });

describe('Cimetière, Cryptes et Donjon des Squelettes', () => {
  it('cartes valides, archimonstres de leurs monstres, clé réelle', () => {
    for (const id of ['cimetiereAmakna', 'cryptes', 'squelettes']) {
      const A = AREAS[id];
      for (const m of A.pool) expect(MONSTERS[m], `${id} : ${m}`).toBeDefined();
      expect(MONSTERS[A.elite!.id]).toBeDefined();
      for (const a of A.archis ?? []) expect(A.pool.some((m) => ARCHI_OF[m] === a), `${id} : ${a}`).toBe(true);
    }
    expect(AREAS.squelettes.boss?.id).toBe('ronin');
    expect(DUNGEON_KEYS.squelettes).toBe(1570);
  });

  it('arbre : Cimetière après le Donjon des Bouftous, Cryptes après le Cimetière, donjon après les deux', () => {
    const node = (id: string) => ZONES.flatMap((q) => q.nodes).find((n) => n.id === id)!;
    expect(isUnlocked(node('cimetiereAmakna'), [])).toBe(false);
    expect(isUnlocked(node('cimetiereAmakna'), ['cour'])).toBe(true);
    expect(isUnlocked(node('cryptes'), ['cour'])).toBe(false);
    expect(isUnlocked(node('cryptes'), ['cour', 'cimetiereAmakna'])).toBe(true);
    expect(isUnlocked(node('squelettes'), ['cour', 'cimetiereAmakna'])).toBe(false);
    expect(isUnlocked(node('squelettes'), ['cour', 'cimetiereAmakna', 'cryptes'])).toBe(true);
  });

  it('Chafer Rōnin : 4 illusions à la fois, sans dégâts, absentes du bestiaire', () => {
    const w = new World(5, tough(), AREAS.squelettes);
    w.startRoom(AREAS.squelettes.rooms - 1);
    const boss = w.boss!;
    expect(boss.def.id).toBe('ronin');
    const live = () => w.monsters.filter((m) => m.def.id === 'roninIllusion' && m.state !== 'dead');
    let maxLive = 0;
    for (let t = 0; t < 8; t += STEP) {
      w.step({ x: 0, y: 0 });
      w.drain();
      maxLive = Math.max(maxLive, live().length);
    }
    expect(maxLive).toBe(4);
    const ill = MONSTERS.roninIllusion;
    expect(ill.attack.roll.max).toBe(0);
    expect(ill.grades[0].hp).toBe(1);
    expect(allBeasts().some((b) => b.id === 'roninIllusion')).toBe(false);
  });
});
