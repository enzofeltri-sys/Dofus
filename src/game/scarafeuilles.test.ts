import { describe, expect, it } from 'vitest';
import { AREAS, isUnlocked, ZONES } from './data/areas';
import { startingHero } from './data/hero';
import { MONSTERS } from './data/monsters';
import { ARCHI_OF } from './data/monsters.astrub';
import { DUNGEON_KEYS } from './data/items.gen';
import { PERSP, STEP, World, type Monster, type WorldEvent } from './world';

const tough = () => ({ ...startingHero(), hp: 100000 });
const run = (w: World, seconds: number) => {
  const ev: WorldEvent[] = [];
  for (let i = 0; i < seconds / STEP; i++) {
    w.step({ x: 0, y: 0 });
    ev.push(...w.drain());
  }
  return ev;
};
function room(spots: [string, number, number][], area = AREAS.plaineScara) {
  const w = new World(3, tough(), area);
  w.startRoom(0);
  const base = w.monsters[0];
  w.monsters = spots.map(([id, dx, dy], i) => {
    const def = MONSTERS[id];
    return { ...base, uid: 800 + i, def, atk: def.attack, state: 'chase' as const, hp: 300, maxHp: 300, cd: 1e9, supportT: 0, blessT: 0, summonT: def.summons?.first ?? 0, hidden: false,
      x: w.hero.x + dx, y: w.hero.y + dy * PERSP, knock: { x: 0, y: 0 } } as Monster;
  });
  w.hero.def = { ...w.hero.def, weapon: { ...w.hero.def.weapon, reach: 0 } };
  w.drain();
  return w;
}

describe('Plaine et Donjon des Scarafeuilles, Bomberfu', () => {
  it('cartes valides ; en parallèle du Champ des Ingalsse ; Scarabosse Doré et sa clé', () => {
    for (const id of ['plaineScara', 'scaraDonjon']) {
      const A = AREAS[id];
      for (const m of A.pool) expect(MONSTERS[m], `${id} : ${m}`).toBeDefined();
      expect(MONSTERS[A.elite!.id]).toBeDefined();
      for (const a of A.archis ?? []) expect(A.pool.some((m) => ARCHI_OF[m] === a)).toBe(true);
    }
    expect(AREAS.scaraDonjon.boss?.id).toBe('scarabosse');
    expect(DUNGEON_KEYS.scaraDonjon).toBe(8139);
    const z = ZONES.find((q) => q.id === 'amakna')!;
    const node = (id: string) => z.nodes.find((n) => n.id === id)!;
    expect(isUnlocked(node('plaineScara'), ['cour'])).toBe(true);
    expect(isUnlocked(node('scaraDonjon'), ['cour', 'ingalsse', 'tofus'])).toBe(false);
    expect(isUnlocked(node('scaraDonjon'), ['cour', 'plaineScara'])).toBe(true);
  });

  it('chaque Scarafeuille est immunisé à un élément et faible à un autre (vraies résistances)', () => {
    const res = (id: string) => MONSTERS[id].grades[0].res;
    expect(res('scaraRouge')[2]).toBe(100); // Feu
    expect(res('scaraBleu')[3]).toBe(100); // Eau
    expect(res('scaraVert')[1]).toBe(100); // Terre
    expect(res('scaraBlanc')[4]).toBe(100); // Air
    expect(res('scaraRouge')[3]).toBe(-50);
  });

  it('Bomberfu : explose au contact (Feu, valeur réelle) et meurt', () => {
    const w = room([['bomberfu', 0, -40]]);
    w.monsters[0].cd = 0;
    const hp0 = w.hero.hp;
    const ev = run(w, 1.5);
    expect(ev.some((e) => e.type === 'explode')).toBe(true);
    expect(w.monsters[0].state).toBe('dead');
    expect(hp0 - w.hero.hp).toBeGreaterThanOrEqual(6);
  });

  it('Tofu Ventripotent : invoque des Bomberfus (2 au plus)', () => {
    const w = room([['tofuVentripotent', 0, -600]], AREAS.tofus);
    let n = 0;
    for (let t = 0; t < 12; t += STEP) {
      w.step({ x: 0, y: 0 });
      for (const e of w.drain()) if (e.type === 'summon') n++;
      expect(w.monsters.filter((m) => m.def.id === 'bomberfu' && m.state !== 'dead').length).toBeLessThanOrEqual(2);
    }
    expect(n).toBeGreaterThanOrEqual(2);
  });

  it('Scarafeuille Immature (Scarasoin) : soigne un allié de 7 % de ses PV', () => {
    const w = room([['scaraImmature', 0, -500], ['scaraRouge', 60, -500]]);
    w.monsters[1].hp = 100;
    const ev = run(w, 0.3);
    expect(ev.some((e) => e.type === 'monsterHeal' && e.spell === 'Scarasoin')).toBe(true);
    expect(w.monsters[1].hp).toBe(121);
  });

  it('Picoti (choix d’Enzo) : 2 éléments puis 1, les éléments tournent', () => {
    const w = new World(5, tough(), AREAS.scaraDonjon);
    w.startRoom(AREAS.scaraDonjon.rooms - 1);
    const boss = w.boss!;
    const seen: number[] = [];
    for (let i = 0; i < 4; i++) {
      const hp0 = w.hero.hp;
      (w as unknown as { hurtHero: (m: Monster) => void }).hurtHero(boss);
      seen.push(hp0 - w.hero.hp);
      w.hero.invulnT = 0;
    }
    expect(boss.multiHits).toBe(4);
    // coups à 2 éléments nettement plus forts que ceux à 1 élément
    expect(seen[0]).toBeGreaterThan(seen[1]);
    expect(seen[2]).toBeGreaterThan(seen[3]);
  });

  it('Scarabosse Doré : Picoti frappe dans plusieurs éléments et vole de la vie ; Naissance : 5 Immatures d’un coup, une seule fois', () => {
    const w = new World(5, tough(), AREAS.scaraDonjon);
    w.startRoom(AREAS.scaraDonjon.rooms - 1);
    const boss = w.boss!;
    expect(boss.def.id).toBe('scarabosse');
    let born = 0;
    for (let t = 0; t < 14; t += STEP) {
      w.step({ x: 0, y: 0 });
      for (const e of w.drain()) {
        if (e.type === 'summon' && e.by === boss.uid) born++;
      }
    }
    expect(born).toBe(5);
    // une seule Naissance : tuées, elles ne reviennent pas
    for (const m of w.monsters) if (m.def.id === 'scaraImmature') m.hp = 0;
    for (let t = 0; t < 30; t += STEP) {
      w.step({ x: 0, y: 0 });
      for (const e of w.drain()) if (e.type === 'summon' && e.by === boss.uid) born++;
    }
    expect(born).toBe(5);
    expect(w.monsters.filter((m) => m.def.id === 'scaraImmature' && m.summoner === boss.uid).length).toBe(5);
    // 4 jets de 11-15 : au moins 4 × 11 avant résistances
    boss.hp = boss.maxHp - 500;
    const hp0 = w.hero.hp, b0 = boss.hp;
    (w as unknown as { hurtHero: (m: Monster) => void }).hurtHero(boss);
    expect(hp0 - w.hero.hp).toBeGreaterThanOrEqual(30);
    expect(boss.hp).toBeGreaterThan(b0);
  });
});
