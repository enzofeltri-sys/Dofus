import { describe, expect, it } from 'vitest';
import { AREAS, isUnlocked, ZONES } from './data/areas';
import { startingHero } from './data/hero';
import { MONSTERS } from './data/monsters';
import { ARCHI_OF } from './data/monsters.astrub';
import { STEP, World, type Monster } from './world';

const tough = () => ({ ...startingHero(), hp: 100000 });
const node = (id: string) => ZONES.flatMap((z) => z.nodes).find((n) => n.id === id)!;
const make = (w: World, id: string, g: number, x: number, y: number) =>
  (w as unknown as { makeMonster: (d: unknown, g: number, x: number, y: number) => Monster }).makeMonster(MONSTERS[id], g, x, y);
const hurt = (w: World, m: Monster) => (w as unknown as { hurtHero: (m: Monster) => void }).hurtHero(m);

describe('Niveaux 61-70, deuxième donjon : les pirates de l’Arche (validés par Enzo)', () => {
  it('carte et donjon valides, vrais archimonstres (Sparoket, Barebourd)', () => {
    for (const id of ['arche', 'caleArche']) {
      const A = AREAS[id];
      for (const m of [...A.pool, A.elite!.id, ...(A.eliteChoice ?? [])]) expect(MONSTERS[m], m).toBeDefined();
      for (const a of A.archis ?? []) expect(A.pool.some((m) => ARCHI_OF[m] === a), a).toBe(true);
    }
    expect(MONSTERS.gourlo.grades.map((g) => g.hp)).toEqual([1900, 2100, 2400, 2800, 3100]);
    expect(MONSTERS.boomba.grades[0].level).toBe(82);
  });

  it('région Île d’Otomaï : l’Arche s’ouvre avec la carte du monde ET le niveau 55, la Cale au niveau 60', () => {
    expect(isUnlocked(node('arche'), ['lacCania'], 80)).toBe(false);
    expect(isUnlocked(node('arche'), ['nidKwakwa'], 54)).toBe(false);
    expect(isUnlocked(node('arche'), ['nidKwakwa'], 55)).toBe(true);
    expect(isUnlocked(node('caleArche'), ['nidKwakwa', 'arche'], 60)).toBe(true);
  });

  it('l’élite de la Cale est tirée au hasard : Boomba, Nakunbra ou Canondorf', () => {
    const seen = new Set<string>();
    for (let s = 1; s <= 30; s++) {
      const w = new World(s, tough(), AREAS.caleArche);
      w.startRoom(AREAS.caleArche.elite!.room);
      seen.add(w.elite!.def.id);
    }
    expect([...seen].sort()).toEqual(['boomba', 'canondorf', 'nakunbra']);
  });

  it('Tranchage Mortel : fatal à 50 % des PV ou moins, sinon un coup normal', () => {
    const w = new World(5, { ...startingHero(), hp: 1000 }, AREAS.caleArche);
    w.startRoom(1);
    const n = make(w, 'nakunbra', 1, 360, 600);
    w.hero.hp = 600;
    hurt(w, n);
    expect(w.hero.hp).toBeGreaterThan(0);
    w.hero.hp = Math.floor(w.hero.maxHp * 0.5);
    hurt(w, n);
    expect(w.hero.hp).toBe(0);
  });

  it('Gourlo : boulet de loin, Bombarde quand on le colle', () => {
    const w = new World(5, tough(), AREAS.caleArche);
    w.startRoom(AREAS.caleArche.rooms - 1);
    const g = w.boss!;
    w.monsters = [g];
    g.state = 'chase';
    w.hero.x = g.x;
    w.hero.y = g.y + 60;
    w.step({ x: 0, y: 0 });
    expect(g.atk).toBe(MONSTERS.gourlo.close);
    w.hero.y = g.y + 500;
    g.state = 'chase';
    w.step({ x: 0, y: 0 });
    expect(g.atk).toBe(MONSTERS.gourlo.attack);
  });

  it('Rhum Fourbe : casser un tonneau près de Gourlo fait tomber sa résistance Terre (50 % → 0 %) et le soigne', () => {
    const w = new World(5, tough(), AREAS.caleArche);
    w.startRoom(AREAS.caleArche.rooms - 1);
    const g = w.boss!;
    const t = make(w, 'tonneauPirate', 1, g.x + 60, g.y);
    t.summoner = g.uid;
    w.monsters = [g, t];
    g.hp = g.maxHp - 500;
    const before = g.hp;
    const dmg = (w as unknown as { damageMonster: (m: Monster, d: number, c: boolean, e?: string) => void }).damageMonster.bind(w);
    dmg(t, 9999, false, 'terre');
    expect(g.hp).toBeGreaterThan(before);
    expect(g.rum?.pct).toBe(200);
    const hp = g.hp;
    dmg(g, 100, false, 'terre');
    // 100 dommages calculés à 50 % de résistance → 200 sans résistance
    expect(hp - g.hp).toBe(200);
    for (let i = 0; i < Math.ceil(13 / STEP); i++) w.step({ x: 0, y: 0 });
    const hp2 = g.hp;
    dmg(g, 100, false, 'terre');
    expect(hp2 - g.hp).toBe(100);
  });
});
