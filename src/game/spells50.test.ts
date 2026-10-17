import { describe, expect, it } from 'vitest';
import { applyCard } from './cards';
import { MONSTERS } from './data/monsters';
import { CELL, slotsForLevel, spellsForLevel, type SpellId } from './data/spells';
import { flatDist, PERSP, STEP, World, type WorldEvent } from './world';

const run = (w: World, seconds: number) => {
  const ev: WorldEvent[] = [];
  for (let i = 0; i < seconds / STEP; i++) {
    w.step({ x: 0, y: 0 });
    ev.push(...w.drain());
  }
  return ev;
};

/** Monstres immobiles et inoffensifs placés autour du héros (distances au sol). */
function arena(spells: SpellId[], spots: [number, number][]) {
  const w = new World(4);
  w.startRoom(0);
  const base = w.monsters[0];
  w.monsters = spots.map(([dx, dy], i) => ({ ...base, uid: 900 + i, def: { ...MONSTERS.chaferDebutant, speed: 0 }, state: 'chase' as const, hp: 1e5, maxHp: 1e5, cd: 1e9, x: w.hero.x + dx, y: w.hero.y + dy * PERSP, knock: { x: 0, y: 0 } }));
  w.hero.def = { ...w.hero.def, weapon: { ...w.hero.def.weapon, reach: 0 } };
  w.hero.castCd = 0;
  spells.forEach((id) => applyCard(w, { kind: 'spell', spell: id }));
  w.drain();
  return w;
}
const casts = (ev: WorldEvent[], id: SpellId) => ev.filter((e) => e.type === 'cast' && e.spell === id).length;

describe('Sorts du Sacrieur, niveaux 35 à 50', () => {
  it('Condensation : frappe tout le groupe et le rapproche du Sacrieur', () => {
    const w = arena(['condensation'], [[0, -260], [50, -260], [-50, -280], [200, 0]]);
    const d0 = w.monsters.map((m) => flatDist(w.hero.x, w.hero.y, m.x, m.y));
    const ev = run(w, 0.2);
    expect(casts(ev, 'condensation')).toBe(1);
    const [a, b, c, alone] = w.monsters;
    for (const m of [a, b, c]) expect(m.hp).toBeLessThan(1e5);
    expect(alone.hp).toBe(1e5); // hors de la zone
    [a, b, c].forEach((m, i) => expect(flatDist(w.hero.x, w.hero.y, m.x, m.y)).toBeLessThan(d0[i] - CELL));
  });

  it('Hostilité : frappe et repousse de 2 cases ; un obstacle ajoute des dommages de poussée', () => {
    const w = arena(['hostilite'], [[0, -150]]);
    const m = w.monsters[0];
    const d0 = flatDist(w.hero.x, w.hero.y, m.x, m.y);
    const ev = run(w, 0.2);
    expect(casts(ev, 'hostilite')).toBe(1);
    expect(flatDist(w.hero.x, w.hero.y, m.x, m.y)).toBeGreaterThan(d0 + 1.5 * CELL);
    const hits = ev.filter((e) => e.type === 'hit' && e.target === 'monster').length;
    // contre un mur : le monstre ne recule pas, il prend un second coup (poussée)
    const w2 = arena(['hostilite'], [[0, -150]]);
    const m2 = w2.monsters[0];
    (w2 as unknown as { pushOut: (x: number, y: number) => [number, number] }).pushOut = () => [m2.x, m2.y];
    const ev2 = run(w2, 0.2);
    expect(ev2.filter((e) => e.type === 'hit' && e.target === 'monster').length).toBe(hits + 1);
  });

  it('Couronne d’Épines : seulement au contact ; bouclier + renvoi des coups de mêlée', () => {
    const far = arena(['couronne'], [[0, -300]]);
    expect(casts(run(far, 0.5), 'couronne')).toBe(0);
    const w = arena(['couronne'], [[0, -70]]);
    expect(casts(run(w, 0.2), 'couronne')).toBe(1);
    expect(w.hero.shield).toBeGreaterThanOrEqual(Math.round(w.hero.maxHp * 0.08));
    expect(w.hero.thornsT).toBeGreaterThan(0);
    const m = w.monsters[0];
    (w as unknown as { hurtHero: (m: unknown) => void }).hurtHero(m);
    expect(m.hp).toBeLessThan(1e5);
  });

  it('Transfusion : dommages autour du Sacrieur, proportionnels à ses PV', () => {
    const full = arena(['transfusion'], [[0, -100], [100, 0], [0, -400]]);
    expect(casts(run(full, 0.2), 'transfusion')).toBe(1);
    const lostFull = 1e5 - full.monsters[0].hp;
    expect(full.monsters[1].hp).toBeLessThan(1e5);
    expect(full.monsters[2].hp).toBe(1e5); // trop loin
    const low = arena(['transfusion'], [[0, -100]]);
    low.hero.hp = Math.round(low.hero.maxHp * 0.25);
    run(low, 0.2);
    expect(1e5 - low.monsters[0].hp).toBeLessThan(lostFull);
  });

  it('Niveau 50 : les 14 sorts et une 5e case', () => {
    expect(spellsForLevel(34).length).toBe(10);
    expect(spellsForLevel(50).length).toBe(14);
    expect(slotsForLevel(49)).toBe(4);
    expect(slotsForLevel(50)).toBe(5);
  });
});
