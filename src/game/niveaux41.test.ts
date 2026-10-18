import { describe, expect, it } from 'vitest';
import { AREAS, isUnlocked, ZONE_TIERS, ZONES, zoneEquipRange } from './data/areas';
import { startingHero } from './data/hero';
import { MONSTERS } from './data/monsters';
import { ARCHI_OF } from './data/monsters.astrub';
import { DUNGEON_KEYS } from './data/items.gen';
import { BOSS_DOFUS, ZONE_PETS } from './pets';
import { PERSP, STEP, World, type Monster } from './world';

const tough = () => ({ ...startingHero(), hp: 100000 });
const bossRoom = (id: string) => {
  const w = new World(5, tough(), AREAS[id]);
  w.startRoom(AREAS[id].rooms - 1);
  w.hero.def = { ...w.hero.def, weapon: { ...w.hero.def.weapon, reach: 0 } };
  return w;
};
const node = (id: string) => ZONES.flatMap((z) => z.nodes).find((n) => n.id === id)!;

describe('Niveaux 41-50 : Kwaks et Bworks (validés par Enzo)', () => {
  it('cartes et donjons valides, archimonstres de leurs monstres, vraies clés', () => {
    for (const id of ['craqueleurs', 'nidKwakwa', 'campementBworks', 'villageBworks', 'donjonBworks']) {
      const A = AREAS[id];
      for (const m of A.pool) expect(MONSTERS[m], m).toBeDefined();
      expect(MONSTERS[A.elite!.id], A.elite!.id).toBeDefined();
      for (const a of A.archis ?? []) expect(A.pool.some((m) => ARCHI_OF[m] === a), a).toBe(true);
    }
    expect(AREAS.nidKwakwa.boss?.id).toBe('kwakwa');
    expect(AREAS.donjonBworks.boss?.id).toBe('bworkette');
    expect(DUNGEON_KEYS.nidKwakwa).toBe(12017);
    expect(DUNGEON_KEYS.donjonBworks).toBe(8135);
  });

  it('arbre : les Kwaks après le Donjon des Tofus, les Bworks après la Maison Fantôme', () => {
    expect(isUnlocked(node('craqueleurs'), ['ingalsse'])).toBe(false);
    expect(isUnlocked(node('craqueleurs'), ['ingalsse', 'tofus'])).toBe(true);
    expect(isUnlocked(node('nidKwakwa'), ['tofus', 'craqueleurs'])).toBe(true);
    expect(isUnlocked(node('campementBworks'), ['cryptes'])).toBe(false);
    expect(isUnlocked(node('campementBworks'), ['cryptes', 'maisonFantome'])).toBe(true);
    expect(isUnlocked(node('donjonBworks'), ['maisonFantome', 'campementBworks'])).toBe(false);
    expect(isUnlocked(node('donjonBworks'), ['maisonFantome', 'campementBworks', 'villageBworks'])).toBe(true);
  });

  it('équipement de zone 41-50, Bwaks dans la zone des Kwaks, Dofus Cacao sur le Kwakwa', () => {
    expect(ZONE_TIERS.kwaks).toEqual([41, 50]);
    expect(ZONE_TIERS.bworks).toEqual([41, 50]);
    expect(zoneEquipRange('craqueleurs')).toMatchObject({ lo: 41, hi: 47 });
    expect(zoneEquipRange('donjonBworks')).toMatchObject({ lo: 41, hi: 50 });
    expect(ZONE_PETS.kwaks).toEqual([2076, 2075, 2074, 2077]);
    expect(BOSS_DOFUS.kwakwa).toBe(20987);
  });

  it('vraies fiches : niveaux 42-50, Kwakwa 1 100-1 600 PV, Bworkette 1 600-2 300 PV', () => {
    expect(MONSTERS.kwakVent.grades.map((g) => g.level)).toEqual([42, 44, 46, 48, 50]);
    expect(MONSTERS.kwakereFlamme.grades[0].res[2]).toBe(100);
    expect(MONSTERS.kwakwa.grades.map((g) => g.hp)).toEqual([1100, 1200, 1300, 1500, 1600]);
    expect(MONSTERS.bworkette.grades.map((g) => g.hp)).toEqual([1600, 1800, 1900, 2100, 2300]);
    expect(MONSTERS.kwakwa.attack.multi).toEqual(['feu', 'eau', 'terre', 'air']);
    expect(MONSTERS.bworkMage.summons?.id).toBe('tofuMalefique');
  });

  it('Kwarmée Kwayal : le Kwakwa invoque les 4 Bwaks d’un coup', () => {
    const w = bossRoom('nidKwakwa');
    const boss = w.boss!;
    w.monsters = [boss];
    boss.state = 'chase';
    boss.summonT = STEP;
    w.step({ x: 0, y: 0 });
    w.step({ x: 0, y: 0 });
    const bwaks = w.monsters.filter((m) => m.summoner === boss.uid).map((m) => m.def.id).sort();
    expect(bwaks).toEqual(['bwakFlamme', 'bwakGlace', 'bwakTerre', 'bwakVent']);
  });

  it('Kwakoukas Kwayal repousse le héros de 4 cases', () => {
    const w = bossRoom('nidKwakwa');
    const boss = w.boss!;
    const atk = MONSTERS.kwakwa.charge!.attack;
    expect(atk.push).toBe(4);
    w.hero.x = boss.x;
    w.hero.y = boss.y + 120 * PERSP;
    const y0 = w.hero.y;
    const fake = { ...boss, atk, dir: { x: 0, y: 1 } } as Monster;
    (w as unknown as { hurtHero: (m: Monster) => void }).hurtHero(fake);
    expect(w.hero.y - y0).toBeGreaterThan(60);
  });

  it('Reconstitution Bwork : la Bworkette se soigne de 50 % de ses PV max une fois bien entamée', () => {
    const w = bossRoom('donjonBworks');
    const boss = w.boss!;
    w.monsters = [boss];
    boss.state = 'chase';
    boss.cd = 1e9;
    boss.hp = Math.round(boss.maxHp * 0.3);
    boss.regenT = STEP;
    boss.healT = 1e9;
    const hp0 = boss.hp;
    w.step({ x: 0, y: 0 });
    expect(boss.hp - hp0).toBe(Math.round(boss.maxHp * 0.5));
  });
});
