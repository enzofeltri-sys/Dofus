import { describe, expect, it } from 'vitest';
import { addStats, baseStats } from './formulas';
import { ITEMS, SETS } from './data/items';
import { addItem, canEquip, compare, emptyInventory, equip, gearStats, rollItem, setCounts, starterInventory, STARTER_ITEMS, unequip } from './inventory';
import { DROP_MULT, REGION_CHANCE, rollDrops } from './loot';
import { applyRun, emptySave, loadSave, type RunResult } from './save';
import { rng } from '../iso';

const CASQUE = 16500, CAPE = 16501, BRACELET = 16502, CHAPEAU_AV = 2474, ANNEAU_AV = 2475;

describe('équipement et panoplies', () => {
  it('départ : 5 pièces de l’Aventurier portées, bonus de panoplie à 5 objets', () => {
    const inv = starterInventory();
    expect(inv.items.map((i) => i.id)).toEqual(STARTER_ITEMS);
    expect(Object.keys(inv.equipped)).toHaveLength(5);
    expect(setCounts(inv).get(5)).toBe(5);
    const g = addStats(baseStats(), gearStats(inv));
    // 5 + 2 + 5 + 5 + 5 = 22 en objets, +15 de bonus à 5 objets
    expect(g.force).toBe(37);
    expect(g.agilite).toBe(37);
    expect(g.dommagesElem.terre).toBe(2);
  });

  it('jets dans les fourchettes réelles', () => {
    const r = rng(3);
    for (let i = 0; i < 50; i++) {
      const [fo, dt] = rollItem(CASQUE, r);
      expect(fo).toBeGreaterThanOrEqual(11);
      expect(fo).toBeLessThanOrEqual(15);
      expect(dt).toBe(2);
    }
  });

  it('niveau requis, anneaux dans deux cases, pas deux fois le même anneau de panoplie', () => {
    let inv = starterInventory();
    inv = addItem(inv, CASQUE, [13, 2]);
    const casque = inv.nextUid - 1;
    expect(canEquip(inv, casque, 11)).toEqual({ ok: false, reason: 'Niveau 12 requis' });
    expect(canEquip(inv, casque, 12)).toEqual({ ok: true, slot: 'chapeau' });
    inv = addItem(inv, BRACELET, [12, 2]);
    const bracelet = inv.nextUid - 1;
    inv = equip(inv, bracelet, 12);
    expect(inv.equipped.anneau2).toBe(bracelet); // l'anneau de l'Aventurier reste dans la 1re case
    inv = addItem(inv, ANNEAU_AV, [2, 2, 2, 2]);
    const anneau2 = inv.nextUid - 1;
    expect(canEquip(inv, anneau2, 12, 'anneau2').ok).toBe(false);
  });

  it('deux anneaux identiques hors panoplie : permis', () => {
    // anneau fictif sans panoplie, le temps d'en avoir un vrai dans le jeu
    ITEMS[999001] = { id: 999001, name: 'Anneau test', level: 1, type: 'Anneau', slot: 'anneau', icon: 9048, set: null, effects: [['force', 1, 1]] };
    let inv = emptyInventory();
    inv = addItem(inv, 999001, [1]);
    inv = equip(inv, 1, 10);
    inv = addItem(inv, 999001, [1]);
    expect(canEquip(inv, 2, 10)).toEqual({ ok: true, slot: 'anneau2' });
    delete ITEMS[999001];
  });

  it('panoplie Kardorim complète : bonus à 3 objets ; la comparaison compte les bonus perdus et gagnés', () => {
    let inv = starterInventory();
    for (const [id, rolls] of [[CASQUE, [15, 2]], [CAPE, [10, 10]], [BRACELET, [15, 2]]] as [number, number[]][]) {
      inv = addItem(inv, id, rolls);
    }
    const [c, k, b] = [inv.nextUid - 3, inv.nextUid - 2, inv.nextUid - 1];
    const diff = new Map(compare(inv, c, 12));
    expect(diff.get('force')).toBe(15); // casque sur une case vide, pas encore de bonus Kardorim
    inv = equip(equip(equip(inv, c, 12), k, 12), b, 12);
    expect(setCounts(inv).get(375)).toBe(3);
    const g = addStats(baseStats(), gearStats(inv));
    expect(g.vitalite).toBe(SETS[375].bonus[2].find(([p]) => p === 'vitalite')![1]);
    // l'Aventurier perd sa cape : bonus à 4 objets au lieu de 5
    expect(setCounts(inv).get(5)).toBe(4);
    const off = new Map(compare(inv, b, 12));
    expect(off.get('chance')).toBeLessThan(-15); // retirer le bracelet : son jet + le bonus à 3 objets
    inv = unequip(inv, 'anneau2');
    expect(setCounts(inv).get(375)).toBe(2);
  });
});

describe('butin', () => {
  it('ressources et équipement des monstres avec les multiplicateurs, la Prospection augmente les chances', () => {
    const r = rng(11);
    const n = 20000;
    const count = (pp: number) => {
      const c: Record<number, number> = {};
      for (let i = 0; i < n; i++) for (const id of rollDrops({ dofusId: 4046, prospection: pp }, r)) c[id] = (c[id] ?? 0) + 1;
      return c;
    };
    const c = count(100);
    expect(c[310] / n).toBeCloseTo(0.58 * DROP_MULT.resource, 2);
    expect(c[CHAPEAU_AV] / n).toBeGreaterThan(0.2 * DROP_MULT.equipment * 0.8);
    expect(c[CHAPEAU_AV] / n).toBeLessThan(0.2 * DROP_MULT.equipment * 1.25 + REGION_CHANCE * 0.05);
    const c2 = count(200);
    expect(c2[310] / n).toBeCloseTo(0.58 * DROP_MULT.resource * 2, 2);
  });

  it('boss : taux réels (20 % par pièce de sa panoplie)', () => {
    const r = rng(5);
    let casques = 0;
    for (let i = 0; i < 10000; i++) if (rollDrops({ dofusId: 4051, boss: true, prospection: 100 }, r).includes(CASQUE)) casques++;
    expect(casques / 10000).toBeCloseTo(0.2, 1);
  });

  it('butin de région : environ 10 % des monstres lâchent un objet d’Incarnam', () => {
    const r = rng(9);
    let region = 0;
    const own = new Set([310, 2474, 16524, 16663]);
    for (let i = 0; i < 10000; i++) if (rollDrops({ dofusId: 4046, prospection: 100 }, r).some((id) => !own.has(id))) region++;
    expect(region / 10000).toBeGreaterThan(0.06);
    expect(region / 10000).toBeLessThan(0.11);
  });
});

describe('sauvegarde', () => {
  const run = (won: boolean, loot: Record<number, number>, boss: Record<number, number>): RunResult => ({
    won, room: 9, time: 200, kills: 70, dealt: 0, taken: 0, healed: 0, cards: [], loot: { xp: 100, items: loot }, bossLoot: { xp: 0, items: boss },
  });
  it('ressources au stock, équipement à l’inventaire avec ses jets ; butin du boss perdu en cas de défaite', () => {
    const s0 = emptySave();
    const lost = applyRun(s0, run(false, { 310: 3, [CHAPEAU_AV]: 1 }, { [CASQUE]: 1 }), rng(1));
    expect(lost.save.resources['310']).toBe(3);
    expect(lost.save.inventory.items.map((i) => i.id)).toContain(CHAPEAU_AV);
    expect(lost.save.inventory.items.map((i) => i.id)).not.toContain(CASQUE);
    expect(lost.fresh).toHaveLength(1);
    const won = applyRun(s0, run(true, {}, { [CASQUE]: 1, 16525: 1 }), rng(1));
    const casque = won.save.inventory.items.find((i) => i.id === CASQUE)!;
    expect(casque.rolls[0]).toBeGreaterThanOrEqual(11);
    expect(won.save.resources['16525']).toBe(1);
  });
  it('une ancienne sauvegarde reçoit l’équipement de départ', () => {
    const store: Record<string, string> = { 'dofus-enzo-save': JSON.stringify({ v: 2, runs: 4, wins: 1, bestRoom: 9, bestWinTime: 213, xp: 0, resources: {} }) };
    (globalThis as unknown as { localStorage: Pick<Storage, 'getItem'> }).localStorage = { getItem: (k: string) => store[k] ?? null };
    const s = loadSave();
    expect(s.v).toBe(3);
    expect(s.runs).toBe(4);
    expect(s.inventory.items).toHaveLength(5);
  });
});
