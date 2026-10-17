import { describe, expect, it } from 'vitest';
import { AREAS, isUnlocked, ZONES } from './data/areas';
import { startingHero } from './data/hero';
import { MONSTERS } from './data/monsters';
import { ARCHI_OF } from './data/monsters.astrub';
import { DUNGEON_DROPS, DUNGEON_KEYS, RECIPE_DATA } from './data/items.gen';
import { obstacleCore } from './rooms';
import { MID_SHAPES } from './shapes';
import { ARCHI_CHANCE, flatDist, STEP, World } from './world';

const strong = () => ({ ...startingHero(), hp: 5000 });
const ASTRUB = ['cite', 'souterrains', 'champsAstrub', 'prairies', 'grange', 'lisiere', 'dunes', 'calanques', 'plage', 'chateau', 'tainela', 'coinBouftous', 'coinBoos', 'abords', 'cour'];

describe('Astrub, branche A', () => {
  it('cartes valides : monstres, élites, boss et archimonstres existent', () => {
    for (const id of ASTRUB) {
      const A = AREAS[id];
      for (const m of A.pool) expect(MONSTERS[m], `${id} : ${m}`).toBeDefined();
      expect(MONSTERS[A.elite!.id]).toBeDefined();
      for (const a of A.archis ?? []) {
        expect(MONSTERS[a]?.archi, `${id} : ${a}`).toBeDefined();
        // chaque archimonstre de la carte remplace un monstre de la carte (ou de la Grange)
        expect(A.pool.some((m) => ARCHI_OF[m] === a)).toBe(true);
      }
    }
    expect(AREAS.grange.boss?.id).toBe('tournesolAffame');
    expect(DUNGEON_KEYS.grange).toBe(8143);
    expect(AREAS.chateau.boss?.id).toBe('mobEponge');
    expect(DUNGEON_KEYS.chateau).toBe(8437);
    expect(AREAS.cour.boss?.id).toBe('bouftouRoyal');
  });

  it('branche C : la Côte s’ouvre après le Donjon des Champs, le Château après ses 4 cartes', () => {
    const z = ZONES.find((q) => q.id === 'astrub')!;
    const node = (id: string) => z.nodes.find((n) => n.id === id)!;
    expect(isUnlocked(node('lisiere'), ['crypte', 'cite'])).toBe(false);
    expect(isUnlocked(node('lisiere'), ['grange'])).toBe(true);
    expect(isUnlocked(node('calanques'), ['grange', 'lisiere', 'dunes'])).toBe(true);
    expect(isUnlocked(node('chateau'), ['grange', 'lisiere', 'dunes', 'calanques'])).toBe(false);
    expect(isUnlocked(node('chateau'), ['grange', 'lisiere', 'dunes', 'calanques', 'plage'])).toBe(true);
  });

  it('clés des Champs et du Château fabricables : chaque ingrédient tombe sur un monstre du jeu (Greuvette, Truite, Sauge, Orge retirées)', () => {
    const dropped = new Set(Object.values(MONSTERS).flatMap((d) => (DUNGEON_DROPS[d.dofusId] ?? []).map(([id]) => id)));
    for (const key of [8143, 8437, 1568]) {
      const r = RECIPE_DATA.find((x) => x.id === key)!;
      for (const no of [598, 1844, 428, 400]) expect(r.ingredients.map(([id]) => id)).not.toContain(no);
      for (const [id] of r.ingredients) expect(dropped.has(id), `ingrédient ${id} de ${key}`).toBe(true);
    }
  });

  it('détours (branche B) : la salle devient la zone visitée, décor et monstres (« si c’est forêt c’est forêt »)', () => {
    let detours = 0, rooms = 0;
    for (let seed = 1; seed <= 150; seed++) {
      const w = new World(seed, strong(), AREAS.coinBouftous);
      for (let i = 1; i < 4; i++) {
        w.plan[i] = { ...w.plan[i], special: null };
        w.startRoom(i);
        rooms++;
        const all = [...w.monsters.map((m) => m.def), ...w.reserve.map((r) => r.def)];
        if (w.detour) {
          detours++;
          expect(w.roomTheme).toBe('foretAstrub');
          for (const d of all) expect(['prespic', 'sanglier', 'ecurouille', 'milimulou'].includes(d.archi?.of ?? d.id), d.id).toBe(true);
          expect(w.drain().some((e) => e.type === 'wanderers')).toBe(true);
        } else {
          expect(w.roomTheme).toBe('coinBouftous');
          for (const d of all) expect(d.id.startsWith('boufto') || d.id === 'chefBouftou' || d.archi, d.id).toBeTruthy();
          w.drain();
        }
      }
    }
    expect(detours / rooms).toBeGreaterThan(0.12);
    expect(detours / rooms).toBeLessThan(0.28);
    // jamais dans la salle de l'élite ni dans Incarnam
    const w = new World(2, strong(), AREAS.coinBouftous);
    w.startRoom(4);
    expect(w.detour).toBeNull();
  });

  it('Mob l’Éponge : se soigne (Régénération Spontanée) et n’invoque pas', () => {
    const w = new World(5, { ...startingHero(), hp: 100000 }, AREAS.chateau);
    w.startRoom(AREAS.chateau.rooms - 1);
    expect(w.boss?.def.id).toBe('mobEponge');
    const before = w.monsters.length;
    let heal = '';
    for (let t = 0; t < 30; t += STEP) {
      w.step({ x: 0, y: 0 });
      if (w.boss && w.boss.hp > w.boss.maxHp * 0.6) w.boss.hp = w.boss.maxHp * 0.6;
      for (const e of w.drain()) if (e.type === 'monsterHeal' && e.uid === w.boss?.uid) heal = e.spell ?? '';
    }
    expect(heal).toBe('Régénération Spontanée');
    expect(w.monsters.length).toBeLessThanOrEqual(before);
  });

  it('arbre : Astrub s’ouvre après la Crypte, la Grange après les 4 cartes', () => {
    const z = ZONES.find((q) => q.id === 'astrub')!;
    const node = (id: string) => z.nodes.find((n) => n.id === id)!;
    expect(isUnlocked(node('cite'), ['champs', 'paturages', 'foret', 'cimetiere'])).toBe(false);
    expect(isUnlocked(node('cite'), ['crypte'])).toBe(true);
    expect(isUnlocked(node('grange'), ['crypte', 'cite', 'souterrains', 'champsAstrub'])).toBe(false);
    expect(isUnlocked(node('grange'), ['crypte', 'cite', 'souterrains', 'champsAstrub', 'prairies'])).toBe(true);
    expect(isUnlocked(node('cour'), ['grange'])).toBe(false);
    expect(isUnlocked(node('cour'), ['grange', 'tainela', 'coinBouftous', 'coinBoos'])).toBe(false);
    expect(isUnlocked(node('cour'), ['grange', 'tainela', 'coinBouftous', 'coinBoos', 'abords'])).toBe(true);
  });

  it('ni monstre ni décor dans les étangs, sur les 5 décors', () => {
    for (const id of ASTRUB) for (const shape of MID_SHAPES) {
      const w = new World(4, strong(), AREAS[id]);
      w.plan[1] = { shape, mirror: false, special: null };
      w.startRoom(1);
      const inHole = (x: number, y: number) => w.shape.holes.some((o) => flatDist(x, y, obstacleCore(o, x), o.y) < o.r);
      for (const m of w.monsters) expect(inHole(m.x, m.y), `${id}/${shape}`).toBe(false);
      for (const p of w.layout) expect(inHole(p.x, p.y), `${id}/${shape} : ${p.kind}`).toBe(false);
    }
  });

  it('archimonstres : environ 1 % des monstres de la carte, annoncés', () => {
    let n = 0, archi = 0, events = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const w = new World(seed, strong(), AREAS.cite);
      for (let i = 0; i < 4; i++) {
        w.plan[i] = { ...w.plan[i], special: null };
        w.startRoom(i);
        const all = [...w.monsters, ...w.reserve.map((r) => ({ def: r.def }))];
        n += all.length;
        archi += all.filter((m) => m.def.archi).length;
        events += w.drain().filter((e) => e.type === 'archi').length;
      }
    }
    const rate = archi / n;
    expect(rate).toBeGreaterThan(ARCHI_CHANCE * 0.5);
    expect(rate).toBeLessThan(ARCHI_CHANCE * 1.7);
    expect(events).toBeGreaterThan(0);
    // pas d'archimonstre dans Incarnam
    const w = new World(3, strong(), AREAS.champs);
    for (let i = 0; i < 4; i++) {
      w.startRoom(i);
      expect(w.monsters.some((m) => m.def.archi)).toBe(false);
    }
  });

  it('Tournesol Affamé : invoque ses plantes et se soigne', () => {
    const w = new World(7, { ...startingHero(), hp: 100000 }, AREAS.grange);
    w.startRoom(AREAS.grange.rooms - 1);
    expect(w.boss?.def.id).toBe('tournesolAffame');
    const before = w.monsters.length;
    let healed = false;
    for (let t = 0; t < 40; t += STEP) {
      w.step({ x: 0, y: 0 });
      if (w.boss && w.boss.hp < w.boss.maxHp * 0.6) w.boss.hp = w.boss.maxHp * 0.6; // le garder en vie
      if (w.drain().some((e) => e.type === 'monsterHeal')) healed = true;
    }
    expect(w.monsters.length).toBeGreaterThan(before);
    expect(healed).toBe(true);
  });
});
