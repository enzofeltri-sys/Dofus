import { describe, expect, it } from 'vitest';
import { AREAS, isUnlocked, ZONES } from './data/areas';
import { startingHero } from './data/hero';
import { MONSTERS } from './data/monsters';
import { ARCHI_OF } from './data/monsters.astrub';
import { DUNGEON_KEYS } from './data/items.gen';
import { STEP, World, type Monster } from './world';

const tough = () => ({ ...startingHero(), hp: 100000 });
const node = (id: string) => ZONES.flatMap((z) => z.nodes).find((n) => n.id === id)!;
const ROYALS = ['blopCocoRoyal', 'blopGriotteRoyal', 'blopIndigoRoyal', 'blopReinetteRoyal'];

describe('Niveaux 51-60 : les Blops (validés par Enzo)', () => {
  it('carte et donjon valides, archimonstres des Blops, vraie clé', () => {
    for (const id of ['lacCania', 'closBlops']) {
      const A = AREAS[id];
      for (const m of A.pool) expect(MONSTERS[m], m).toBeDefined();
      expect(MONSTERS[A.elite!.id], A.elite!.id).toBeDefined();
      for (const a of A.archis ?? []) expect(A.pool.some((m) => ARCHI_OF[m] === a), a).toBe(true);
    }
    expect(AREAS.closBlops.bossChoice).toEqual(ROYALS);
    for (const r of ROYALS) expect(MONSTERS[r].boss, r).toBeDefined();
    expect(DUNGEON_KEYS.closBlops).toBe(9248);
  });

  it('arbre : le Lac de Cania s’ouvre avec le Nid du Kwakwa OU le Donjon des Bworks', () => {
    expect(isUnlocked(node('lacCania'), ['tofus'])).toBe(false);
    expect(isUnlocked(node('lacCania'), ['nidKwakwa'])).toBe(true);
    expect(isUnlocked(node('lacCania'), ['donjonBworks'])).toBe(true);
    expect(isUnlocked(node('closBlops'), ['nidKwakwa', 'lacCania'])).toBe(true);
  });

  it('vraies fiches : Royaux 2 400-3 500 PV, 94 % dans leur élément et -12 % ailleurs', () => {
    expect(MONSTERS.blopCocoRoyal.grades.map((g) => g.hp)).toEqual([2400, 2700, 3000, 3200, 3500]);
    expect(MONSTERS.blopCocoRoyal.grades[4].res).toEqual([-12, -12, -12, -12, 94]);
    expect(MONSTERS.blopGriotteRoyal.grades[4].res[2]).toBe(94);
    expect(MONSTERS.blopIndigoRoyal.grades[4].res[3]).toBe(94);
    expect(MONSTERS.blopReinetteRoyal.grades[4].res[1]).toBe(94);
    expect(MONSTERS.blopCoco.grades.map((g) => g.level)).toEqual([52, 54, 56, 58, 60]);
  });

  it('4 portes avant le boss : la porte prise décide du Blop Royal', () => {
    const A = AREAS.closBlops;
    const w = new World(3, tough(), A);
    w.startRoom(A.rooms - 2);
    const doors = w.doors;
    expect(doors.map((d) => d.id)).toEqual(ROYALS);
    for (const d of doors) expect(d.x > w.bounds.x0 && d.x < w.bounds.x1).toBe(true);
    // la salle arrive en deux vagues : on la vide jusqu'à ce qu'elle soit terminée
    for (let i = 0; i < 2000 && w.phase !== 'cleared'; i++) {
      for (const m of w.monsters) { m.hp = 0; m.state = 'dead'; }
      w.step({ x: 0, y: 0 });
    }
    expect(w.phase).toBe('cleared');
    w.hero.x = doors[2].x;
    w.hero.y = w.bounds.y0;
    for (let i = 0; i < 120 && w.phase !== 'exiting'; i++) w.step({ x: 0, y: -1 });
    expect(w.phase).toBe('exiting');
    expect(w.bossPick).toBe('blopIndigoRoyal');
    w.startRoom(A.rooms - 1);
    expect(w.boss?.def.id).toBe('blopIndigoRoyal');
    // les autres salles n'ont pas de portes
    w.startRoom(1);
    expect(w.doors).toHaveLength(0);
  });

  it('Blovocation : le Royal invoque les 4 Biblops d’un coup', () => {
    const w = new World(5, tough(), AREAS.closBlops);
    w.bossPick = 'blopGriotteRoyal';
    w.startRoom(AREAS.closBlops.rooms - 1);
    const boss = w.boss!;
    w.monsters = [boss];
    boss.state = 'chase';
    boss.summonT = STEP;
    w.step({ x: 0, y: 0 });
    w.step({ x: 0, y: 0 });
    const ids = w.monsters.filter((m) => m.summoner === boss.uid).map((m) => m.def.id).sort();
    expect(ids).toEqual(['biblopCoco', 'biblopGriotte', 'biblopIndigo', 'biblopReinette']);
  });

  it('Blotection : +100 % de résistance Air au boss et à ses Biblops pendant la protection', () => {
    const w = new World(5, tough(), AREAS.closBlops);
    w.bossPick = 'blopGriotteRoyal';
    w.startRoom(AREAS.closBlops.rooms - 1);
    const boss = w.boss!;
    const cut = (m: Monster, d: number, el: 'air' | 'feu') => (w as unknown as { wardCut: (m: Monster, d: number, e: string) => number }).wardCut(m, d, el);
    boss.wardT = 0;
    expect(cut(boss, 100, 'air')).toBe(100);
    boss.wardT = 5;
    // Air -12 % → 88 % : 100 × 12 / 112
    expect(cut(boss, 100, 'air')).toBe(11);
    expect(cut(boss, 100, 'feu')).toBe(100);
  });

  it('Gloutage : le Gloutoblop dévore un Blop voisin et gagne 200 PV', () => {
    const w = new World(5, tough(), AREAS.closBlops);
    w.startRoom(1);
    const glouto = (w as unknown as { makeMonster: (d: unknown, g: number, x: number, y: number) => Monster }).makeMonster(MONSTERS.gloutoblop, 1, 360, 600);
    const prey = (w as unknown as { makeMonster: (d: unknown, g: number, x: number, y: number) => Monster }).makeMonster(MONSTERS.biblopCoco, 1, 420, 600);
    w.monsters = [glouto, prey];
    glouto.state = prey.state = 'chase';
    const hp0 = glouto.maxHp;
    w.hero.x = 360;
    w.hero.y = 1200;
    const eaten = () => (prey.state as string) === 'dead';
    for (let i = 0; i < Math.ceil(9 / STEP) && !eaten(); i++) w.step({ x: 0, y: 0 });
    expect(prey.state).toBe('dead');
    expect(glouto.maxHp).toBe(hp0 + 200);
  });
});
