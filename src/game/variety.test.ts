import { describe, expect, it } from 'vitest';
import { AREAS } from './data/areas';
import { startingHero } from './data/hero';
import { obstacleCore } from './rooms';
import { MID_SHAPES, roomShape } from './shapes';
import { flatDist, HAZARD, STEP, WAVES_TIME, World } from './world';

const strong = () => ({ ...startingHero(), hp: 5000 });
const inHole = (w: World, x: number, y: number) => w.shape.holes.some((o) => flatDist(x, y, obstacleCore(o, x), o.y) < o.r);
const run = (w: World, s: number, input = { x: 0, y: 0 }) => {
  for (let t = 0; t < s; t += STEP) w.step(input);
};

describe('formes des salles', () => {
  it('chaque partie tire des formes différentes, sans doublon au milieu', () => {
    const w = new World(5, strong(), AREAS.paturages);
    const first = w.plan.map((p) => p.shape).join();
    const mids = w.plan.slice(1, 4).map((p) => p.shape);
    expect(new Set(mids).size).toBe(mids.length);
    const plans = new Set([first]);
    for (let i = 0; i < 5; i++) {
      w.restart();
      plans.add(w.plan.map((p) => p.shape).join());
    }
    expect(plans.size).toBeGreaterThan(3);
  });

  it('ni monstre ni décor dans le vide, quelle que soit la forme', () => {
    for (const shape of MID_SHAPES) for (const mirror of [false, true]) {
      const w = new World(3, strong(), AREAS.foret);
      w.plan[1] = { shape, mirror, special: null };
      w.startRoom(1);
      for (const m of w.monsters) expect(inHole(w, m.x, m.y), `${shape} : monstre`).toBe(false);
      for (const p of w.layout) expect(inHole(w, p.x, p.y), `${shape} : ${p.kind}`).toBe(false);
    }
  });

  it('les monstres passent par le pont pour rejoindre le héros', () => {
    const w = new World(9, strong(), AREAS.champs);
    w.plan[1] = { shape: 'pont', mirror: false, special: null };
    w.startRoom(1);
    const b = w.shape.bands[0];
    // héros sous la bande, monstres au-dessus
    w.hero.x = 600;
    w.hero.y = b.y + 300;
    const above = w.monsters.filter((m) => m.y < b.y);
    expect(above.length).toBeGreaterThan(0);
    run(w, 12);
    // tous ont franchi la bande (par le pont), et aucun ne reste bloqué en route
    for (const m of above) expect(m.y, m.def.name).toBeGreaterThan(b.y);
    for (const m of w.monsters) if (m.state !== 'dead') expect(flatDist(m.x, m.y, w.hero.x, w.hero.y), `${m.def.name} bloqué`).toBeLessThan(200);
  });

  it('le couloir rétrécit la salle', () => {
    const w = new World(1, strong(), AREAS.cimetiere);
    w.plan[1] = { shape: 'couloir', mirror: false, special: null };
    w.startRoom(1);
    expect(w.bounds.x1 - w.bounds.x0).toBe(720 - 152 - 2 * roomShape('couloir').margin);
  });
});

describe('salles spéciales', () => {
  it('embuscade : salle vide, puis les monstres surgissent autour du héros', () => {
    const w = new World(2, strong(), AREAS.champs);
    w.plan[1] = { shape: 'plaine', mirror: false, special: 'embuscade' };
    w.startRoom(1);
    expect(w.monsters.length).toBe(0);
    run(w, 2);
    expect(w.monsters.length).toBeGreaterThan(2);
    for (const m of w.monsters) expect(flatDist(m.x, m.y, w.hero.x, w.hero.y)).toBeLessThan(420);
  });

  it('coffre gardé : gardien grade 5 et deux fois plus résistant, coffre ouvert à la fin avec butin', () => {
    const w = new World(4, strong(), AREAS.paturages);
    w.plan[1] = { shape: 'plaine', mirror: false, special: 'coffre' };
    w.startRoom(1);
    expect(w.guard?.grade).toBe(5);
    expect(w.layout.some((p) => p.kind === 'chest')).toBe(true);
    for (const m of w.monsters) m.hp = 0, m.state = 'dead';
    w.reserve = [];
    w.step({ x: 0, y: 0 });
    const ev = w.drain();
    expect(w.chest?.open).toBe(true);
    expect(ev.some((e) => e.type === 'chest')).toBe(true);
  });

  it('fontaine : soigne près de l’eau, au plus la moitié des PV par salle', () => {
    const w = new World(6, strong(), AREAS.foret);
    w.plan[1] = { shape: 'plaine', mirror: false, special: 'fontaine' };
    w.startRoom(1);
    for (const m of w.monsters) m.cd = 999;
    const f = w.fountain!;
    w.hero.x = f.x;
    w.hero.y = f.y + 40;
    w.hero.hp = 100;
    run(w, 30);
    expect(w.hero.hp).toBeGreaterThan(100);
    expect(f.healed).toBeLessThanOrEqual(Math.ceil(w.hero.maxHp * 0.5));
  });

  it('vagues : renforts pendant le temps imparti, puis les monstres s’enfuient et la porte s’ouvre', () => {
    const w = new World(8, strong(), AREAS.champs);
    w.plan[1] = { shape: 'plaine', mirror: false, special: 'vagues' };
    w.startRoom(1);
    for (const m of w.monsters) m.cd = 999;
    run(w, WAVES_TIME + 5); // les gels d'impact ralentissent un peu le minuteur
    expect(w.monsters.length).toBeGreaterThan(2);
    expect(w.phase).toBe('cleared');
  });

  it('salles spéciales tirées au hasard, coffre très rare ; la Crypte garde ses murs', () => {
    const n: Record<string, number> = {};
    let rooms = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const w = new World(seed, strong(), AREAS.crypte);
      expect(w.plan.every((p) => p.shape === 'plaine')).toBe(true);
      expect(w.plan[0].special).toBeNull();
      expect(w.plan[4].special).toBeNull();
      expect(w.plan[8].special).toBeNull();
      for (const p of w.plan.slice(1, 8)) if (p !== w.plan[4]) { rooms++; if (p.special) n[p.special] = (n[p.special] ?? 0) + 1; }
    }
    expect(n.coffre / rooms).toBeLessThan(0.04);
    expect(n.embuscade / rooms).toBeGreaterThan(0.08);
    expect((rooms - Object.values(n).reduce((a, b) => a + b, 0)) / rooms).toBeGreaterThan(0.55);
  });
});

describe('pièges de carte', () => {
  it('troupeau (Pâturages) : annoncé, puis il traverse et blesse le héros sur sa ligne', () => {
    const w = new World(11, strong(), AREAS.paturages);
    w.plan[1] = { shape: 'plaine', mirror: false, special: null };
    w.startRoom(1);
    for (const m of w.monsters) m.cd = 999;
    const hp = w.hero.hp;
    run(w, 4 + HAZARD.herd.windup + 1.5);
    expect(w.hero.hp).toBeLessThan(hp);
  });

  it('mains (Cimetière) : le héros immobile est agrippé', () => {
    const w = new World(12, strong(), AREAS.cimetiere);
    w.plan[1] = { shape: 'plaine', mirror: false, special: null };
    w.startRoom(1);
    for (const m of w.monsters) m.cd = 999;
    let rooted = false;
    for (let t = 0; t < 6; t += STEP) {
      w.step({ x: 0, y: 0 });
      if (w.drain().some((e) => e.type === 'rooted')) rooted = true;
    }
    expect(rooted).toBe(true);
    // agrippé : il ne peut plus bouger
    const x = w.hero.x;
    w.hero.rootT = 1;
    w.step({ x: 1, y: 0 });
    expect(w.hero.x).toBe(x);
  });

  it('feux follets (Forêt) : explosent si on reste à côté', () => {
    const w = new World(13, strong(), AREAS.foret);
    w.plan[1] = { shape: 'plaine', mirror: false, special: null };
    w.startRoom(1);
    for (const m of w.monsters) m.cd = 999;
    const z = w.hazards[0];
    w.hero.x = z.x;
    w.hero.y = z.y + 20;
    const hp = w.hero.hp;
    run(w, 1.5);
    expect(w.hero.hp).toBeLessThan(hp);
  });

  it('pas de piège dans les Champs ni dans la salle de l’élite', () => {
    const w = new World(14, strong(), AREAS.paturages);
    w.startRoom(4);
    run(w, 15);
    expect(w.hazards.length).toBe(0);
    const c = new World(14, strong(), AREAS.champs);
    c.startRoom(1);
    run(c, 15);
    expect(c.hazards.length).toBe(0);
  });
});
