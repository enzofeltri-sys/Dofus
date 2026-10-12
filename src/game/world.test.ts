import { describe, expect, it } from 'vitest';
import { MONSTERS } from './data/monsters';
import { GATE, PERSP, STEP, TOTAL_ROOMS, World } from './world';

type In = { x: number; y: number } | ((w: World) => { x: number; y: number });
const run = (w: World, seconds: number, input: In = { x: 0, y: 0 }) => {
  const ev = [];
  for (let i = 0; i < seconds / STEP; i++) {
    w.step(typeof input === 'function' ? input(w) : input);
    ev.push(...w.drain());
  }
  return ev;
};

describe('World', () => {
  it('démarre une salle avec des monstres loin du héros', () => {
    const w = new World(3);
    w.startRoom(0);
    expect(w.monsters.length).toBeGreaterThanOrEqual(3);
    for (const m of w.monsters) expect(Math.hypot(m.x - w.hero.x, (m.y - w.hero.y) / PERSP)).toBeGreaterThan(300);
  });

  it("l'arme frappe automatiquement un monstre à portée et peut le tuer", () => {
    const w = new World(1);
    w.startRoom(0);
    const m = w.monsters[0];
    w.monsters = [m];
    m.state = 'chase';
    m.cd = 99; // ne riposte pas
    m.x = w.hero.x + 60;
    m.y = w.hero.y;
    const ev = run(w, 4);
    expect(ev.some((e) => e.type === 'swing')).toBe(true);
    expect(ev.some((e) => e.type === 'hit' && e.target === 'monster')).toBe(true);
    expect(m.state).toBe('dead');
    expect(ev.some((e) => e.type === 'roomCleared')).toBe(true);
  });

  it('un monstre annonce son attaque avant de frapper, et la frappe touche dans la zone', () => {
    const w = new World(2);
    w.startRoom(0);
    const m = w.monsters[0];
    w.monsters = [m];
    m.def = MONSTERS.chaferDebutant;
    m.state = 'chase';
    m.cd = 0;
    m.x = w.hero.x;
    m.y = w.hero.y - 60 * PERSP;
    m.hp = 9999; // ne meurt pas pendant le test
    const before = w.hero.hp;
    const ev = run(w, 1.2);
    const tele = ev.findIndex((e) => e.type === 'telegraph');
    const strike = ev.findIndex((e) => e.type === 'strike');
    expect(tele).toBeGreaterThanOrEqual(0);
    expect(strike).toBeGreaterThan(tele);
    expect(w.hero.hp).toBeLessThan(before);
  });

  it("s'éloigner pendant l'annonce permet d'esquiver", () => {
    const w = new World(2);
    w.startRoom(0);
    const m = w.monsters[0];
    w.monsters = [m];
    m.def = MONSTERS.chaferDebutant;
    m.state = 'windup';
    m.t = 0;
    m.hp = 9999;
    m.x = w.hero.x;
    m.y = w.hero.y - 60 * PERSP;
    m.dir = { x: 0, y: 1 };
    w.hero.x = m.x + 200; // hors de la zone annoncée
    const before = w.hero.hp;
    run(w, 0.8);
    expect(w.hero.hp).toBe(before);
  });

  it('salle vidée : la grille s’ouvre et on sort en marchant dedans', () => {
    const w = new World(5);
    w.startRoom(0);
    for (const m of w.monsters) { m.state = 'dead'; }
    run(w, 1.2);
    expect(w.phase).toBe('cleared');
    expect(w.gate).toBe(1);
    // le joueur vise la grille
    const steer = (ww: World) => {
      const dx = GATE.x - ww.hero.x, dy = ww.bounds.y0 - 20 - ww.hero.y, d = Math.hypot(dx, dy) || 1;
      return { x: dx / d, y: dy / d };
    };
    const ev = run(w, 10, steer);
    expect(ev.some((e) => e.type === 'exit')).toBe(true);
  });

  it('le héros meurt si on le laisse sans défense', () => {
    const w = new World(7);
    w.startRoom(6);
    w.hero.def.weapon = { ...w.hero.def.weapon, reach: 0 }; // désarmé
    const ev = run(w, 120);
    expect(ev.some((e) => e.type === 'heroDied')).toBe(true);
    expect(w.phase).toBe('dead');
  });

  it('les salles successives ont plus de monstres', () => {
    const w = new World(9);
    w.startRoom(0);
    const a = w.monsters.length;
    w.startRoom(7);
    expect(w.monsters.length).toBeGreaterThan(a);
  });

  it('envoie une deuxième vague à partir de la salle 4, et la salle ne finit qu’après elle', () => {
    const w = new World(5);
    w.startRoom(0);
    expect(w.reserve.length).toBe(0);
    w.startRoom(3);
    const first = w.monsters.length, extra = w.reserve.length;
    expect(extra).toBeGreaterThan(0);
    // tous les monstres de la première vague meurent : les renforts arrivent, la salle continue
    for (const m of w.monsters) m.hp = 0, m.state = 'dead';
    const ev = run(w, 0.1);
    expect(ev.some((e) => e.type === 'wave')).toBe(true);
    expect(w.monsters.length).toBe(first + extra);
    expect(w.phase).toBe('fight');
  });

  it('salle du boss : Kardorim invoque, accélère, ses invocations meurent avec lui, victoire', () => {
    const w = new World(2);
    w.startRoom(TOTAL_ROOMS - 1);
    expect(w.boss?.def.id).toBe('kardorim');
    for (const m of w.monsters) if (m !== w.boss) m.hp = 0, m.state = 'dead';
    w.boss!.hp = 1e6; // survit le temps du test
    w.hero.def = { ...w.hero.def, hp: 1e6 };
    w.hero.hp = w.hero.maxHp = 1e6;
    const ev = run(w, 19.5);
    expect(ev.some((e) => e.type === 'bossCrack')).toBe(true);
    expect(ev.filter((e) => e.type === 'summon').length).toBe(1); // à 6 s, puis toutes les 18 s
    const summons = w.monsters.filter((m) => m.summoner === w.boss!.uid);
    expect(summons.length).toBe(1);
    for (const m of summons) Object.assign(m, { state: 'chase', hp: 1e6 }); // vivant au moment où le boss tombe
    // le boss tombe : ses Kardoribs aussi, et c'est la victoire
    w.boss!.hp = 1;
    w.boss!.hurtT = 0;
    const end = run(w, 6, (ww) => ({ x: (ww.boss!.x - ww.hero.x) / 300, y: (ww.boss!.y - ww.hero.y) / 300 }));
    expect(w.boss!.state).toBe('dead');
    expect(w.monsters.filter((m) => m.summoner === w.boss!.uid).every((m) => m.state === 'dead')).toBe(true);
    expect(end.some((e) => e.type === 'victory')).toBe(true);
    run(w, 3);
    expect(w.gate).toBe(0); // pas de sortie après le boss
  });
});
