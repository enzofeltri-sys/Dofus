import { describe, expect, it } from 'vitest';
import { startingHero, weaponDef } from './data/hero';
import { MONSTERS } from './data/monsters';
import { escapeChance, escapeOf, tackleOf } from './formulas';
import { CHAMPS, CRYPTE } from './data/areas';
import { GATE, PERSP, STEP, TACKLE_MIN, TOTAL_ROOMS, World } from './world';

type In = { x: number; y: number } | ((w: World) => { x: number; y: number });
/** Sans salles spéciales (tirées au hasard), pour tester les salles normales. */
const plain = (w: World) => {
  for (const p of w.plan) p.special = null;
  return w;
};
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
    const w = new World(1, startingHero(undefined, undefined, 30828)); // Bounihimée
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

  it('vraies armes de Dofus converties au temps réel ; mains nues par défaut', () => {
    const nu = weaponDef(null);
    expect(nu.name).toBe('Mains nues');
    expect(nu.lines[0]).toMatchObject({ min: 1, max: 3, element: 'neutre' });
    const bouni = weaponDef(30828); // 14 à 18 Neutre, 4 PA
    expect(bouni.lines[0]).toMatchObject({ min: 8, max: 10 });
    expect(bouni.speed).toBeCloseTo(1.9);
    const dague = weaponDef(97); // Dagues de Boisaille : 2 PA → deux fois plus rapides
    expect(dague.speed).toBeCloseTo(3.8);
    const arc = weaponDef(1942); // Arc de Chasse : distance
    expect(arc.ranged).toBe(true);
    expect(arc.reach).toBeGreaterThan(bouni.reach);
    expect(startingHero().weapon.itemId).toBeNull();
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
    const w = plain(new World(9));
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

  it('salle 5 : le Sergent d’élite charge en ligne et la salle se termine sans victoire', () => {
    const w = new World(3);
    w.startRoom(CRYPTE.elite!.room);
    const e = w.elite!;
    expect(e.def.id).toBe('sergentElite');
    expect(e.maxHp).toBeGreaterThan(200);
    for (const m of w.monsters) if (m !== e) m.hp = 0, m.state = 'dead';
    w.hero.hp = w.hero.maxHp = 1e6;
    Object.assign(e, { state: 'chase', x: w.hero.x, y: w.hero.y - 300 * PERSP, chargeT: 0 });
    w.hero.def = { ...w.hero.def, weapon: { ...w.hero.def.weapon, reach: 0 } };
    const ev = run(w, 0.3);
    expect(ev.some((x) => x.type === 'telegraph')).toBe(true);
    expect(e.atk).toBe(e.def.charge!.attack);
    const y0 = e.y;
    run(w, 1.2);
    expect(Math.abs(e.y - y0)).toBeGreaterThan(100); // il a foncé
    e.hp = 0; e.state = 'dead';
    const end = run(w, 0.1);
    expect(end.some((x) => x.type === 'roomCleared')).toBe(true);
    expect(end.some((x) => x.type === 'victory')).toBe(false);
  });
});

describe('Mécaniques de Dofus en temps réel', () => {
  const lone = (seed = 1) => {
    const w = new World(seed);
    w.startRoom(0);
    const m = w.monsters[0];
    w.monsters = [m];
    Object.assign(m, { def: { ...MONSTERS.chaferPiquier, speed: 0 }, state: 'chase', cd: 1e9 });
    w.drain();
    return { w, m };
  };

  it('vaincre un monstre rapporte son XP de grade (Sagesse comprise)', () => {
    const { w, m } = lone();
    m.hp = 1;
    m.x = w.hero.x + 60;
    m.y = w.hero.y;
    const ev = run(w, 1.5);
    const xp = ev.find((e) => e.type === 'xp');
    expect(xp && xp.type === 'xp' && xp.amount).toBe(m.xp);
    expect(w.stats.xp).toBe(m.xp);
  });

  it('érosion : les PV max baissent avec les dégâts subis, et reviennent à la salle suivante', () => {
    const { w, m } = lone();
    const max = w.hero.maxHp;
    Object.assign(m, { cd: 0, hp: 1e5, maxHp: 1e5 });
    m.x = w.hero.x;
    m.y = w.hero.y - 80 * PERSP;
    w.hero.def = { ...w.hero.def, weapon: { ...w.hero.def.weapon, reach: 0 } };
    run(w, 3);
    expect(w.stats.taken).toBeGreaterThan(0);
    expect(w.hero.eroded).toBe(max - w.hero.maxHp);
    expect(w.hero.eroded).toBeGreaterThan(0);
    w.startRoom(1);
    expect(w.hero.maxHp).toBe(max);
  });

  it('tacle : au contact d’un Piquier (tacle 15), le Sacrieur ralentit selon sa fuite', () => {
    const { w, m } = lone();
    m.x = w.hero.x + 50;
    m.y = w.hero.y;
    const fuite = escapeOf(w.heroStats());
    expect(w.tackleFactor()).toBeCloseTo(TACKLE_MIN + (1 - TACKLE_MIN) * escapeChance(fuite, tackleOf(m.stats)));
    expect(w.tackleFactor()).toBeLessThan(0.6);
    m.x = w.hero.x + 300;
    expect(w.tackleFactor()).toBe(1);
  });

  it('poussée (validé par Enzo) : le recul de l’arme contre un mur ne fait pas de dommages de poussée', () => {
    const { w, m } = lone();
    Object.assign(m, { hp: 1e5, maxHp: 1e5 });
    w.hero.x = w.bounds.x1 - 90;
    m.x = w.bounds.x1;
    m.y = w.hero.y;
    const ev = run(w, 1.5);
    expect(ev.some((e) => e.type === 'hit' && e.target === 'monster' && !e.push)).toBe(true);
    expect(ev.some((e) => e.type === 'hit' && e.push)).toBe(false);
  });

  it('contact (validé par Enzo) : les monstres sont solides et leur contact fait mal, au plus 1 fois toutes les 1,5 s', () => {
    const { w, m } = lone();
    Object.assign(m, { hp: 1e5, maxHp: 1e5, cd: 1e9 });
    m.def = { ...m.def, speed: 0 };
    m.x = w.hero.x - 120;
    m.y = w.hero.y;
    const hp0 = w.hero.hp;
    let contacts = 0;
    for (let i = 0; i < 2 / STEP; i++) {
      w.step({ x: -1, y: 0 }); // le héros fonce dans le monstre
      for (const e of w.drain()) if (e.type === 'hit' && e.contact) contacts++;
      expect(Math.abs(w.hero.x - m.x)).toBeGreaterThanOrEqual(m.def.radius + w.hero.def.radius - 1);
    }
    expect(contacts).toBeGreaterThanOrEqual(1);
    expect(contacts).toBeLessThanOrEqual(3);
    expect(w.hero.hp).toBeLessThan(hp0);
  });

  it('initiative : le camp le plus rapide agit en premier', () => {
    const w = new World(1);
    w.startRoom(0);
    const ev = w.drain().find((e) => e.type === 'initiative');
    expect(ev).toBeDefined();
    w.startRoom(TOTAL_ROOMS - 1); // Kardorim : 200 d'initiative, plus que le Sacrieur
    const boss = w.drain().find((e) => e.type === 'initiative');
    expect(boss && boss.type === 'initiative' && boss.hero).toBe(false);
    expect(w.hero.castCd).toBeGreaterThan(0);
  });
});

describe('Butin en combat', () => {
  it('les monstres vaincus remplissent le sac de la partie, le boss remplit son propre sac', () => {
    const w = plain(new World(4));
    let drops = 0;
    for (let room = 0; room < 3; room++) {
      w.startRoom(room);
      w.drain();
      for (const m of w.monsters) m.hp = 1;
      w.reserve = [];
      for (const m of w.monsters) {
        m.state = 'chase';
        m.x = w.hero.x + 50;
        m.y = w.hero.y;
      }
      drops += run(w, 4).filter((e) => e.type === 'drop').length;
    }
    expect(drops).toBeGreaterThan(0);
    expect(Object.values(w.stats.loot).reduce((a, b) => a + b, 0)).toBeGreaterThan(0);
    expect(Object.keys(w.stats.bossLoot)).toHaveLength(0);
  });
});

describe('cartes de farm (étape 9a)', () => {
  it('Champs : 5 salles, élite Tournesol en dernière salle, victoire en la nettoyant', () => {
    const w = new World(4, startingHero(), CHAMPS);
    w.startRoom(0);
    expect(w.monsters.every((m) => CHAMPS.pool.includes(m.def.id))).toBe(true);
    w.startRoom(4);
    expect(w.elite?.def.id).toBe('tournesol');
    expect(w.lastRoom).toBe(true);
    for (const m of w.monsters) { m.hp = 0; m.state = 'dead'; }
    w.reserve = [];
    const ev = run(w, 0.1);
    expect(ev.some((e) => e.type === 'victory')).toBe(true);
  });

  it('le Pissenlit pose sa zone là où était le héros', () => {
    const w = new World(5, startingHero(), CHAMPS);
    w.startRoom(0);
    const m = w.monsters[0];
    w.monsters = [m];
    Object.assign(m, { def: MONSTERS.pissenlit, atk: MONSTERS.pissenlit.attack, state: 'chase', cd: 0, x: w.hero.x, y: w.hero.y - 250 * PERSP });
    run(w, 0.05);
    expect(m.state).toBe('windup');
    expect(m.aim).toBeGreaterThan(200);
    expect(w.inAttack(m)).toBe(true);
  });
});
