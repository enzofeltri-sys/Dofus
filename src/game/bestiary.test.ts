import { describe, expect, it } from 'vitest';
import { AREAS } from './data/areas';
import { startingHero } from './data/hero';
import { allBeasts, beastKind, mergeBestiary, placesOf } from './bestiary';
import { MONSTERS } from './data/monsters';
import { applyRun, emptySave } from './save';
import { STEP, World } from './world';

describe('bestiaire', () => {
  it('classe les monstres : normaux, élites, boss ; chacun a un lieu', () => {
    expect(beastKind(MONSTERS.tofu)).toBe('normal');
    expect(beastKind(MONSTERS.tournesol)).toBe('elite');
    expect(beastKind(MONSTERS.kardorim)).toBe('boss');
    expect(placesOf('feuJoie')).toContain('invoqué par Ronronchon');
    for (const d of allBeasts()) expect(placesOf(d.id).length, d.id).toBeGreaterThan(0);
  });

  it('une partie remplit le bestiaire (vus, vaincus), même perdue', () => {
    const w = new World(2, { ...startingHero(), hp: 5000 }, AREAS.champs);
    for (const p of w.plan) p.special = null;
    w.startRoom(0);
    for (let t = 0; t < 20; t += STEP) w.step({ x: 0, y: 0 });
    expect(Object.keys(w.stats.seen).length).toBeGreaterThan(0);
    const s = applyRun(emptySave(), { won: false, room: 1, time: 20, kills: 1, dealt: 0, taken: 0, healed: 0, cards: [], loot: { xp: 0, items: {} }, bossLoot: { xp: 0, items: {} }, area: 'champs', seen: w.stats.seen, slain: w.stats.slain }).save;
    const id = Object.keys(w.stats.seen)[0];
    expect(s.bestiary?.[id]?.seen).toBe(w.stats.seen[id]);
    expect(mergeBestiary(s.bestiary, { [id]: 2 }, { [id]: 1 })[id].seen).toBe(w.stats.seen[id] + 2);
  });
});
