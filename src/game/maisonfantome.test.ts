import { describe, expect, it } from 'vitest';
import { AREAS, isUnlocked, ZONES } from './data/areas';
import { startingHero } from './data/hero';
import { MONSTERS } from './data/monsters';
import { ARCHI_OF } from './data/monsters.astrub';
import { DUNGEON_KEYS } from './data/items.gen';
import { PERSP, STEP, World, type Monster } from './world';

const tough = () => ({ ...startingHero(), hp: 100000 });
const bossRoom = () => {
  const w = new World(5, tough(), AREAS.maisonFantome);
  w.startRoom(AREAS.maisonFantome.rooms - 1);
  w.hero.def = { ...w.hero.def, weapon: { ...w.hero.def.weapon, reach: 0 } };
  return w;
};

describe('Maison Fantôme (validée par Enzo)', () => {
  it('donjon valide, après les Cryptes, archimonstres de ses monstres, vraie clé', () => {
    const A = AREAS.maisonFantome;
    for (const m of A.pool) expect(MONSTERS[m], m).toBeDefined();
    for (const a of A.archis ?? []) expect(A.pool.some((m) => ARCHI_OF[m] === a), a).toBe(true);
    expect(A.boss?.id).toBe('boostache');
    expect(DUNGEON_KEYS.maisonFantome).toBe(11799);
    const node = ZONES.flatMap((z) => z.nodes).find((n) => n.id === 'maisonFantome')!;
    expect(isUnlocked(node, ['cour', 'cimetiereAmakna'])).toBe(false);
    expect(isUnlocked(node, ['cour', 'cimetiereAmakna', 'cryptes'])).toBe(true);
  });

  it('L’Enfer des Zombies : le Boostache relève le dernier allié mort (sans nouveau butin)', () => {
    const w = bossRoom();
    const boss = w.boss!;
    const add = w.monsters.find((m) => m !== boss && m.state !== 'dead')!;
    (w as unknown as { kill: (m: Monster) => void }).kill(add);
    let raised: Monster | undefined;
    for (let t = 0; t < 5 && !raised; t += STEP) {
      w.step({ x: 0, y: 0 });
      w.drain();
      raised = w.monsters.find((m) => m.def.id === add.def.id && m.summoner === boss.uid && m.state !== 'dead');
    }
    expect(raised).toBeDefined();
    expect(raised!.hp).toBe(raised!.maxHp);
  });

  it('Frayeurs : repousse le héros proche et lui retire 2 PA', () => {
    const w = bossRoom();
    const boss = w.boss!;
    w.monsters = [boss];
    boss.cd = 1e9;
    boss.state = 'chase';
    w.hero.x = boss.x;
    w.hero.y = boss.y + 70 * PERSP;
    w.hero.pa = 6;
    boss.fearT = STEP;
    const y0 = w.hero.y;
    w.step({ x: 0, y: 0 });
    expect(w.hero.y - y0).toBeGreaterThan(60);
    expect(w.hero.pa).toBeLessThan(6);
  });

  it('Le Dentiste érode ; l’Ashi-magari immobilise (1 tour = 4 s) sans dommages', () => {
    expect(MONSTERS.boostache.attack.erosion).toBe(30);
    expect(MONSTERS.boostache.attack.steal).toBe(true);
    const ashi = MONSTERS.ashiMagari;
    expect(ashi.attack.roll.max).toBe(0);
    expect(ashi.attack.root).toBe(4);
    const w = bossRoom();
    const hp0 = w.hero.hp;
    const a = w.monsters[0];
    const fake = { ...a, def: ashi, atk: ashi.attack } as Monster;
    (w as unknown as { hurtHero: (m: Monster) => void }).hurtHero(fake);
    expect(w.hero.rootT).toBe(4);
    expect(w.hero.hp).toBe(hp0);
  });
});
