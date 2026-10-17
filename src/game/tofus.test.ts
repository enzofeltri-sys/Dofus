import { describe, expect, it } from 'vitest';
import { applyCard } from './cards';
import { AREAS, isUnlocked, ZONES } from './data/areas';
import { startingHero } from './data/hero';
import { MONSTERS } from './data/monsters';
import { ARCHI_OF } from './data/monsters.astrub';
import { DUNGEON_KEYS } from './data/items.gen';
import { PERSP, STEP, World, type Monster, type WorldEvent } from './world';
import { applyRun, emptySave } from './save';
import { atlasView } from '../ui/atlas-view';

const tough = () => ({ ...startingHero(), hp: 100000 });
const run = (w: World, seconds: number) => {
  const ev: WorldEvent[] = [];
  for (let i = 0; i < seconds / STEP; i++) {
    w.step({ x: 0, y: 0 });
    ev.push(...w.drain());
  }
  return ev;
};
/** Salle de test : les monstres demandés, placés autour du héros (distances au sol). */
function room(spots: [string, number, number][]) {
  const w = new World(3, tough(), AREAS.ingalsse);
  w.startRoom(0);
  const base = w.monsters[0];
  w.monsters = spots.map(([id, dx, dy], i) => {
    const def = MONSTERS[id];
    return { ...base, uid: 800 + i, def, atk: def.attack, state: 'chase' as const, hp: 300, maxHp: 300, cd: 1e9, supportT: 0, blessT: 0, hidden: false,
      x: w.hero.x + dx, y: w.hero.y + dy * PERSP, knock: { x: 0, y: 0 } } as Monster;
  });
  w.hero.def = { ...w.hero.def, weapon: { ...w.hero.def.weapon, reach: 0 } };
  w.drain();
  return w;
}

describe('Amakna : Champ des Ingalsse et Donjon des Tofus', () => {
  it('cartes valides ; s’ouvrent après le Donjon des Bouftous ; Batofu et sa clé', () => {
    for (const id of ['ingalsse', 'tofus']) {
      const A = AREAS[id];
      for (const m of A.pool) expect(MONSTERS[m], `${id} : ${m}`).toBeDefined();
      expect(MONSTERS[A.elite!.id]).toBeDefined();
      for (const a of A.archis ?? []) expect(A.pool.some((m) => ARCHI_OF[m] === a)).toBe(true);
    }
    expect(AREAS.tofus.boss?.id).toBe('batofu');
    expect(DUNGEON_KEYS.tofus).toBe(7918);
    const z = { nodes: ZONES.flatMap((q) => q.nodes) };
    const node = (id: string) => z.nodes.find((n) => n.id === id)!;
    expect(isUnlocked(node('ingalsse'), ['grange'])).toBe(false);
    expect(isUnlocked(node('ingalsse'), ['cour'])).toBe(true);
    expect(isUnlocked(node('tofus'), ['cour'])).toBe(false);
    expect(isUnlocked(node('tofus'), ['cour', 'ingalsse'])).toBe(true);
  });

  it('Champ des Ingalsse (validé par Enzo) : terminé après 3 victoires, le Donjon des Tofus s’ouvre alors', () => {
    const win = { won: true, room: 5, time: 60, kills: 10, dealt: 0, taken: 0, healed: 0, cards: [], loot: { xp: 0, items: {} }, bossLoot: { xp: 0, items: {} }, area: 'ingalsse' };
    let s = { ...emptySave(), done: ['cour'] };
    for (let i = 1; i <= 3; i++) {
      s = applyRun(s, win).save;
      const node = atlasView(s.done, 'ingalsse', s.mapWins).zones.flatMap((z) => z.nodes).find((n) => n.id === 'ingalsse')!;
      expect(node.wins).toEqual([i, 3]);
      expect(s.done.includes('ingalsse')).toBe(i === 3);
    }
    // une carte normale reste terminée dès la 1re victoire
    expect(applyRun(emptySave(), { ...win, area: 'champs' }).save.done).toContain('champs');
  });

  it('Tofoune (Picota) : soigne l’allié le plus blessé à côté d’elle', () => {
    const w = room([['tofoune', 0, -400], ['tofuJaune', 60, -400], ['tofuNoir', 0, 400]]);
    w.monsters[1].hp = 100;
    w.monsters[2].hp = 50; // trop loin
    const ev = run(w, 0.5);
    expect(ev.some((e) => e.type === 'monsterHeal' && e.uid === 801 && e.spell === 'Picota')).toBe(true);
    expect(w.monsters[1].hp).toBeGreaterThanOrEqual(111);
    expect(w.monsters[2].hp).toBe(50);
  });

  it('Tofoune (Graine Empoisonnée) : pas de dommages directs, puis chaque PA dépensé coûte des PV', () => {
    const w = room([['tofoune', 0, -60]]);
    applyCard(w, { kind: 'spell', spell: 'absorption' });
    w.hero.castCd = 99;
    w.monsters[0].cd = 0;
    const hp0 = w.hero.hp;
    const ev = run(w, 1);
    expect(ev.some((e) => e.type === 'poisoned')).toBe(true);
    expect(w.hero.hp).toBe(hp0);
    expect(w.hero.poisonT).toBeGreaterThan(15);
    w.hero.castCd = 0;
    const ev2 = run(w, 0.5);
    expect(ev2.some((e) => e.type === 'hit' && e.target === 'hero' && e.poison)).toBe(true);
    expect(w.hero.hp).toBeLessThan(hp0);
  });

  it('Tofu Ventripotent (Bénédiction du Tofulailler) : PV en plus et attaques plus rapides pour les alliés proches', () => {
    const w = room([['tofuVentripotent', 0, -500], ['tofuJaune', 80, -500], ['tofuNoir', 0, 500]]);
    const ev = run(w, 0.3);
    expect(ev.some((e) => e.type === 'bless')).toBe(true);
    expect(w.monsters[1].maxHp).toBe(325);
    expect(w.monsters[1].blessT).toBeGreaterThan(15);
    expect(w.monsters[2].blessT).toBe(0);
    // une seule fois tant que la bénédiction dure
    run(w, 9);
    expect(w.monsters[1].maxHp).toBe(325);
  });

  it('Tofu Mutant (Mutation Prolifique) : se soigne de 15 à 20 % de ses PV', () => {
    const w = room([['tofuMutant', 0, -500]]);
    w.monsters[0].hp = 100;
    const ev = run(w, 0.3);
    expect(ev.some((e) => e.type === 'monsterHeal' && e.spell === 'Mutation Prolifique')).toBe(true);
    expect(w.monsters[0].hp).toBeGreaterThanOrEqual(145);
    expect(w.monsters[0].hp).toBeLessThanOrEqual(160);
  });

  it('Batofu : invoque des Tofus Noirs (Gotame) et lance un Tofu en ligne de loin', () => {
    const w = new World(5, tough(), AREAS.tofus);
    w.startRoom(AREAS.tofus.rooms - 1);
    expect(w.boss?.def.id).toBe('batofu');
    let summoned = 0;
    for (let t = 0; t < 25; t += STEP) {
      w.step({ x: 0, y: 0 });
      for (const e of w.drain()) if (e.type === 'summon' && e.by === w.boss?.uid) summoned++;
    }
    expect(summoned).toBeGreaterThanOrEqual(1);
    expect(w.monsters.some((m) => m.def.id === 'tofuNoir' && m.summoner === w.boss?.uid)).toBe(true);
  });
});
