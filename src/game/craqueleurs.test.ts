import { describe, expect, it } from 'vitest';
import { AREAS, isUnlocked, ZONES } from './data/areas';
import { startingHero } from './data/hero';
import { MONSTERS } from './data/monsters';
import { ARCHI_OF } from './data/monsters.astrub';
import { STEP, World } from './world';

const tough = () => ({ ...startingHero(), hp: 100000 });
const node = (id: string) => ZONES.flatMap((z) => z.nodes).find((n) => n.id === id)!;

describe('Niveaux 61-70 : les Craqueleurs (validés par Enzo)', () => {
  it('carte et donjon valides, vrais archimonstres', () => {
    for (const id of ['plainesRocheuses', 'pitonsRocheux']) {
      const A = AREAS[id];
      for (const m of A.pool) expect(MONSTERS[m], m).toBeDefined();
      expect(MONSTERS[A.elite!.id], A.elite!.id).toBeDefined();
      for (const a of A.archis ?? []) expect(A.pool.some((m) => ARCHI_OF[m] === a), a).toBe(true);
    }
    expect(MONSTERS[AREAS.pitonsRocheux.boss!.id].boss).toBeDefined();
  });

  it('arbre : les Plaines Rocheuses s’ouvrent avec le Château du Wa Wabbit OU le Clos des Blops', () => {
    expect(isUnlocked(node('plainesRocheuses'), ['lacCania'])).toBe(false);
    expect(isUnlocked(node('plainesRocheuses'), ['chateauWabbit'])).toBe(true);
    expect(isUnlocked(node('plainesRocheuses'), ['closBlops'])).toBe(true);
    expect(isUnlocked(node('pitonsRocheux'), ['closBlops', 'plainesRocheuses'])).toBe(true);
  });

  it('vraies fiches : Craqueleur Légendaire 3 100-4 600 PV, Kirboule 1 900-2 300 PV', () => {
    expect(MONSTERS.craqueleurLegendaire.grades.map((g) => g.hp)).toEqual([3100, 3500, 3800, 4200, 4600]);
    expect(MONSTERS.craqueleurLegendaire.grades[4].res).toEqual([58, -12, 58, 67, -17]);
    expect(MONSTERS.kirboule.grades.map((g) => g.hp)).toEqual([1900, 2000, 2100, 2200, 2300]);
    expect(MONSTERS.craqueleur.grades.map((g) => g.level)).toEqual([62, 64, 66, 68, 70]);
  });

  it('Invocation Montagnarde : Craqueboule, Craqueleur ou Craqueleur des Plaines, 3 au plus', () => {
    const w = new World(5, tough(), AREAS.pitonsRocheux);
    w.startRoom(AREAS.pitonsRocheux.rooms - 1);
    const boss = w.boss!;
    w.monsters = [boss];
    boss.state = 'chase';
    w.hero.x = boss.x;
    w.hero.y = boss.y + 600;
    for (let i = 0; i < Math.ceil(60 / STEP); i++) w.step({ x: 0, y: 0 });
    const s = w.monsters.filter((m) => m.summoner === boss.uid && m.state !== 'dead');
    expect(s.length).toBeGreaterThan(0);
    expect(s.length).toBeLessThanOrEqual(3);
    for (const m of s) expect(['craqueboule', 'craqueleur', 'craqueleurPlaines']).toContain(m.def.id);
  });

  it('Pierre Étourdissante : le héros touché perd tous ses PA', () => {
    const w = new World(5, tough(), AREAS.pitonsRocheux);
    w.startRoom(AREAS.pitonsRocheux.rooms - 1);
    const boss = w.boss!;
    w.monsters = [boss];
    const hurt = (w as unknown as { hurtHero: (m: unknown) => void }).hurtHero.bind(w);
    boss.atk = MONSTERS.craqueleurLegendaire.boss!.nova!.attack;
    w.hero.pa = 6;
    hurt(boss);
    expect(w.hero.pa).toBe(0);
  });

  it('Écrasement Handicapant de Kirboule : -1 PA par coup (2 dans Dofus, mais il frappe plusieurs fois par tour)', () => {
    const w = new World(5, tough(), AREAS.pitonsRocheux);
    w.startRoom(3);
    const k = (w as unknown as { makeMonster: (d: unknown, g: number, x: number, y: number) => import('./world').Monster }).makeMonster(MONSTERS.kirboule, 3, 360, 600);
    w.hero.pa = 6;
    (w as unknown as { hurtHero: (m: unknown) => void }).hurtHero(k);
    expect(w.hero.pa).toBe(5);
  });
});
