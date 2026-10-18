import { describe, expect, it } from 'vitest';
import { AREAS, isUnlocked, ZONE_TIERS, ZONES, zoneEquipRange } from './data/areas';
import { startingHero } from './data/hero';
import { MONSTERS } from './data/monsters';
import { ARCHI_OF } from './data/monsters.astrub';
import { DUNGEON_KEYS } from './data/items.gen';
import { SPELLS } from './data/spells';
import { BOSS_DOFUS, ZONE_PETS } from './pets';
import { STEP, World, type Monster } from './world';

const tough = () => ({ ...startingHero(), hp: 100000 });
const bossRoom = () => {
  const w = new World(5, tough(), AREAS.chateauWabbit);
  w.startRoom(AREAS.chateauWabbit.rooms - 1);
  w.hero.def = { ...w.hero.def, weapon: { ...w.hero.def.weapon, reach: 0 } };
  return w;
};
const node = (id: string) => ZONES.flatMap((z) => z.nodes).find((n) => n.id === id)!;

describe('Niveaux 51-60 : les Wabbits (validés par Enzo)', () => {
  it('cartes et donjon valides, archimonstres de leurs monstres, vraie clé', () => {
    for (const id of ['cawotte', 'couronne', 'chateauWabbit']) {
      const A = AREAS[id];
      for (const m of A.pool) expect(MONSTERS[m], m).toBeDefined();
      expect(MONSTERS[A.elite!.id], A.elite!.id).toBeDefined();
      for (const a of A.archis ?? []) expect(A.pool.some((m) => ARCHI_OF[m] === a), a).toBe(true);
    }
    expect(AREAS.chateauWabbit.boss?.id).toBe('waWabbit');
    expect(DUNGEON_KEYS.chateauWabbit).toBe(14464);
  });

  it('arbre : l’Île de la Cawotte s’ouvre avec le Nid du Kwakwa OU le Donjon des Bworks', () => {
    expect(isUnlocked(node('cawotte'), ['maisonFantome', 'tofus'])).toBe(false);
    expect(isUnlocked(node('cawotte'), ['nidKwakwa'])).toBe(true);
    expect(isUnlocked(node('cawotte'), ['donjonBworks'])).toBe(true);
    expect(isUnlocked(node('chateauWabbit'), ['nidKwakwa', 'cawotte'])).toBe(false);
    expect(isUnlocked(node('chateauWabbit'), ['nidKwakwa', 'cawotte', 'couronne'])).toBe(true);
  });

  it('équipement 51-60, familier Wabbit, Dofus Cawotte sur le Wa Wabbit', () => {
    expect(ZONE_TIERS.wabbits).toEqual([51, 60]);
    expect(zoneEquipRange('cawotte')).toMatchObject({ lo: 51, hi: 54 });
    expect(zoneEquipRange('chateauWabbit')).toMatchObject({ lo: 51, hi: 60 });
    expect(ZONE_PETS.wabbits).toEqual([1748]);
    expect(BOSS_DOFUS.waWabbit).toBe(972);
  });

  it('vraies fiches : Wa Wabbit 2 600-3 300 PV ; le Wo Wabbit invoque des Tiwabbits', () => {
    expect(MONSTERS.waWabbit.grades.map((g) => g.hp)).toEqual([2600, 2800, 2900, 3100, 3300]);
    expect(MONSTERS.wabbit.grades.map((g) => g.level)).toEqual([44, 46, 48, 50, 52]);
    expect(MONSTERS.woWabbit.summons?.id).toEqual(['tiwabbit', 'blackTiwabbit', 'tiwabbitKiafin']);
    expect(MONSTERS.woWabbit.attack.push).toBe(6);
  });

  it('Awmuwe Woyale : dommages × 0,7 puis bouclier de 120 PV pendant l’armure', () => {
    const w = bossRoom();
    const boss = w.boss!;
    w.monsters = [boss];
    boss.state = 'chase';
    boss.cd = 1e9;
    boss.armorCdT = STEP;
    w.step({ x: 0, y: 0 });
    expect(boss.armorT).toBeGreaterThan(7);
    const hp0 = boss.hp;
    (w as unknown as { damageMonster: (m: Monster, d: number, c: boolean) => void }).damageMonster(boss, 100, false); // 70 absorbés par le bouclier
    expect(boss.hp).toBe(hp0);
    (w as unknown as { damageMonster: (m: Monster, d: number, c: boolean) => void }).damageMonster(boss, 100, false); // 50 restants de bouclier, 20 passent
    expect(hp0 - boss.hp).toBe(20);
  });

  it('Abwutissement : la prochaine attaque du Wa Wabbit devient la zone Eau autour de lui', () => {
    const w = bossRoom();
    const boss = w.boss!;
    w.monsters = [boss];
    boss.state = 'chase';
    boss.novaT = STEP;
    w.hero.x = boss.x;
    w.hero.y = boss.y + 60;
    for (let i = 0; i < 3; i++) w.step({ x: 0, y: 0 });
    expect(boss.atk.roll.element).toBe('eau');
    expect(boss.atk.size).toBe(150);
  });

  it('sorts du Sacrieur : Dissolution (55) et Désolation (60), vol de vie en zone', () => {
    expect(SPELLS.dissolution.level).toBe(55);
    expect(SPELLS.desolation.level).toBe(60);
    expect(SPELLS.desolation.kind).toMatchObject({ type: 'zone', steal: true, slow: 4 });
  });
});
