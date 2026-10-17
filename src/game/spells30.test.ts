import { describe, expect, it } from 'vitest';
import { applyCard, drawCards } from './cards';
import { GRIMOIRE } from './data/grimoire.gen';
import { MONSTERS } from './data/monsters';
import { spellsForLevel, type SpellId } from './data/spells';
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

describe('Sorts du Sacrieur, niveaux 15 à 30', () => {
  it('Ravage : bondit sur un ennemi éloigné et le frappe (Terre)', () => {
    const w = arena(['ravage'], [[0, -300]]);
    const m = w.monsters[0], d0 = flatDist(w.hero.x, w.hero.y, m.x, m.y);
    const ev = run(w, 0.2);
    expect(ev.some((e) => e.type === 'dash')).toBe(true);
    expect(flatDist(w.hero.x, w.hero.y, m.x, m.y)).toBeLessThan(d0 - 150);
    expect(m.hp).toBeLessThan(1e5);
  });

  it('Assaut : seulement quand on est encerclé ; échange de place et dommages Air', () => {
    const alone = arena(['assaut'], [[0, -70]]);
    expect(run(alone, 1).some((e) => e.type === 'swap')).toBe(false);
    const w = arena(['assaut'], [[0, -70], [70, 0]]);
    const ev = run(w, 0.2);
    const sw = ev.find((e) => e.type === 'swap');
    expect(sw).toBeTruthy();
    expect(w.monsters.some((m) => m.hp < 1e5)).toBe(true);
  });

  it('Transposition : PV bas et au contact → échange avec l’ennemi le plus éloigné', () => {
    const w = arena(['transposition'], [[0, -70], [0, -350]]);
    expect(run(w, 0.5).some((e) => e.type === 'swap')).toBe(false); // PV pleins : pas de fuite
    w.hero.hp = w.hero.maxHp * 0.3;
    const far = w.monsters[1];
    const [fx, fy] = [far.x, far.y];
    const ev = run(w, 0.2);
    expect(ev.some((e) => e.type === 'swap')).toBe(true);
    expect(flatDist(w.hero.x, w.hero.y, fx, fy)).toBeLessThan(40);
  });

  it('Épée Vorace : une épée vole vers les monstres, leur vole de la vie et soigne le Sacrieur, puis disparaît', () => {
    const w = arena(['epeeVorace'], [[0, -250]]);
    w.hero.hp = Math.round(w.hero.maxHp * 0.5);
    const hp0 = w.hero.hp;
    const ev = run(w, 6);
    expect(ev.filter((e) => e.type === 'swordHit').length).toBeGreaterThan(2);
    expect(w.monsters[0].hp).toBeLessThan(1e5);
    expect(w.hero.hp).toBeGreaterThan(hp0);
    run(w, 8);
    expect(w.swords.length).toBe(0);
  });

  it('Grimoire : les 22 vrais sorts ; débloqués selon le niveau ; les favoris sortent plus souvent', () => {
    expect(GRIMOIRE.length).toBe(22);
    expect(spellsForLevel(1).length).toBe(4);
    expect(spellsForLevel(30).length).toBe(10);
    const w = new World(1, { ...new World(1).hero.def, level: 30 });
    w.startRoom(0);
    let favSeen = 0, plainSeen = 0;
    for (let i = 0; i < 400; i++) {
      const cards = drawCards(w, Math.random, ['ravage']);
      if (cards.some((c) => c.kind === 'spell' && c.spell === 'ravage')) favSeen++;
      const c2 = drawCards(w, Math.random, []);
      if (c2.some((c) => c.kind === 'spell' && c.spell === 'ravage')) plainSeen++;
    }
    expect(favSeen).toBeGreaterThan(plainSeen);
  });
});
