import { describe, expect, it } from 'vitest';
import { applyCard, drawCards, needsReplace, swapSlots } from './cards';
import { MONSTERS } from './data/monsters';
import { PA_MAX, SPELLS, TURN, type SpellId } from './data/spells';
import { PERSP, STEP, World, type WorldEvent } from './world';
import { rng } from '../iso';

const run = (w: World, seconds: number) => {
  const ev: WorldEvent[] = [];
  for (let i = 0; i < seconds / STEP; i++) {
    w.step({ x: 0, y: 0 });
    ev.push(...w.drain());
  }
  return ev;
};

/** Un seul Chafer, immobile et inoffensif, à `dist` px (au sol) devant le héros. */
function duel(dist: number, spells: SpellId[]) {
  const w = new World(4);
  w.startRoom(0);
  const m = w.monsters[0];
  w.monsters = [m];
  Object.assign(m, { def: { ...MONSTERS.chaferDebutant, speed: 0 }, state: 'chase', hp: 1e5, maxHp: 1e5, cd: 1e9 });
  m.x = w.hero.x;
  m.y = w.hero.y - dist * PERSP;
  w.hero.def = { ...w.hero.def, weapon: { ...w.hero.def.weapon, reach: 0 } }; // pas d'épée : on teste les sorts
  spells.forEach((id) => applyCard(w, { kind: 'spell', spell: id }));
  w.drain();
  return { w, m };
}

describe('Sorts du Sacrieur', () => {
  it('Supplice : vole de la vie au corps à corps et coûte 3 PA', () => {
    const { w, m } = duel(60, ['supplice']);
    w.hero.hp = 60;
    const ev = run(w, 0.1);
    const cast = ev.find((e) => e.type === 'cast');
    expect(cast && cast.type === 'cast' && cast.spell).toBe('supplice');
    expect(m.hp).toBeLessThan(1e5);
    expect(w.hero.hp).toBeGreaterThan(60); // vol de vie
    expect(w.hero.pa).toBeLessThan(PA_MAX - 2.5);
    expect(m.markT).toBeGreaterThan(0);
  });

  it('respecte l’ordre des cases et ne lance pas un sort hors de portée', () => {
    const { w } = duel(250, ['supplice', 'absorption']);
    const ev = run(w, 0.1);
    const casts = ev.filter((e) => e.type === 'cast').map((e) => e.type === 'cast' && e.spell);
    expect(casts).toEqual(['absorption']); // Supplice (corps à corps) n'a pas de cible à 250 px
    swapSlots(w, 0, 1);
    expect(w.run.slots[0]?.id).toBe('absorption');
  });

  it('les PA limitent le rythme : 6 PA par tour, donc 2 Supplices par tour', () => {
    const { w } = duel(60, ['supplice']);
    const ev = run(w, TURN * 4);
    const n = ev.filter((e) => e.type === 'cast').length;
    expect(n).toBeGreaterThanOrEqual(8);
    expect(n).toBeLessThanOrEqual(10);
  });

  it('Attirance ramène un ennemi éloigné au contact', () => {
    const { w, m } = duel(380, ['attirance']);
    run(w, 0.1);
    const d = Math.hypot(m.x - w.hero.x, (m.y - w.hero.y) / PERSP);
    expect(d).toBeLessThan(80);
  });

  it('Mutilation : sacrifie 10 % des PV, monte d’un palier par tour, puis devient un bouclier', () => {
    const { w } = duel(60, ['mutilation']);
    const hp0 = w.hero.hp;
    run(w, 0.1);
    expect(w.hero.mutStage).toBe(1);
    expect(w.hero.hp).toBe(hp0 - Math.round(hp0 * 0.1));
    expect(w.heroStats().puissance).toBe(50);
    run(w, TURN + 0.1);
    expect(w.hero.mutStage).toBe(2);
    w.hero.hp = Math.floor(w.hero.maxHp * 0.3);
    const ev = run(w, 0.1);
    expect(w.hero.mutStage).toBe(0);
    expect(ev.some((e) => e.type === 'coagulation')).toBe(true);
    expect(w.hero.shield).toBe(Math.round((w.hero.maxHp * 15) / 100));
  });

  it('la Souffrance monte quand on est touché et redescend ensuite', () => {
    const { w, m } = duel(60, []);
    Object.assign(m, { cd: 0 });
    run(w, 2);
    expect(w.hero.souffrance).toBeGreaterThan(0);
    m.hp = 0;
    m.state = 'dead';
    const s = w.hero.souffrance;
    run(w, TURN + 0.2);
    expect(w.hero.souffrance).toBe(s - 1);
  });
});

describe('Cartes entre les salles', () => {
  it('3 cartes différentes, dont au moins un nouveau sort tant qu’il reste une case', () => {
    const w = new World(1);
    w.startRoom(0);
    const r = rng(7);
    for (let i = 0; i < 20; i++) {
      const cards = drawCards(w, r);
      expect(new Set(cards.map((c) => JSON.stringify(c))).size).toBe(3);
      expect(cards.some((c) => c.kind === 'spell')).toBe(true);
    }
  });

  it('remplit les cases, puis remplace la case choisie ; la Vitalité augmente les PV max', () => {
    const w = new World(1);
    w.startRoom(0);
    (['supplice', 'absorption', 'attirance', 'mutilation'] as SpellId[]).forEach((spell) => applyCard(w, { kind: 'spell', spell }));
    expect(w.run.slots.map((s) => s?.id)).toEqual(['supplice', 'absorption', 'attirance', 'mutilation']);
    const c = { kind: 'spell', spell: 'stase' } as const;
    expect(needsReplace(w, c)).toBe(true);
    applyCard(w, c, 1);
    expect(w.run.slots[1]?.id).toBe('stase');
    const max = w.hero.maxHp;
    applyCard(w, { kind: 'stat', stat: 'vitalite' });
    expect(w.hero.maxHp).toBe(max + 20);
    applyCard(w, { kind: 'upgrade', spell: 'supplice', up: 'dmg' });
    expect(w.run.slots[0]?.dmgBonus).toBeCloseTo(0.2);
    expect(Object.keys(SPELLS)).toHaveLength(6);
  });

  it('un nouveau donjon remet les cartes à zéro', () => {
    const w = new World(1);
    w.startRoom(0);
    applyCard(w, { kind: 'spell', spell: 'supplice' });
    w.restart();
    expect(w.run.slots.every((s) => s === null)).toBe(true);
  });
});
