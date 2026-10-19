import { describe, expect, it } from 'vitest';
import { rng } from '../iso';
import { item, ITEMS } from './data/items';
import {
  addNew, autoBreakLimit, autoBreakMax, BOSS_RESOURCE, breakItem, breakMany, breakPreview, canFuse, critChance, fuse, fusionPartners, fusionRule, lineWeight, makeItem, purgeTargets,
  rangesFor, RUNES_BY_STAT, rollRarity, scaleValue, upgradeRolls,
} from './forge';
import { emptyInventory, equip, gearStats, itemLines, type Inventory } from './inventory';
import type { Workshop } from './craft';

const ws = (inventory: Inventory, resources: Record<string, number> = {}): Workshop => ({ resources, inventory, jobXp: 0 });
const KARDO = [16500, 16501, 16502]; // Casque, Cape, Bracelet de Kardorim (panoplie)
const ringsAt = (lv: number) => Object.values(ITEMS).filter((d) => d.slot === 'anneau' && d.level === lv && d.effects.length).map((d) => d.id);
/** 4 anneaux différents du même niveau, et un anneau d'un autre niveau. */
const RING_LV = Array.from({ length: 60 }, (_, i) => i + 1).find((lv) => ringsAt(lv).length >= 4)!;
const RINGS = ringsAt(RING_LV).slice(0, 4);
const OTHER_RING = Object.values(ITEMS).find((d) => d.slot === 'anneau' && d.level !== RING_LV && d.effects.length)!.id;

describe('raretés', () => {
  it('≈ +15 % par rang, jamais en baisse, malus inchangés', () => {
    expect(scaleValue(15, 4)).toBe(26);
    expect(scaleValue(1, 1)).toBe(1);
    expect(scaleValue(1, 4)).toBe(2);
    expect(scaleValue(-5, 3)).toBe(-5);
    expect(rangesFor(16500, 2)[0]).toEqual(['force', 15, 20]);
  });

  it('Légendaire et Mythique ont une ligne bonus, comptée dans les stats', () => {
    const leg = makeItem(16500, 3, rng(3));
    expect(leg.bonus).toBeDefined();
    let inv = addNew(emptyInventory(), 16500, 4, rng(5));
    expect(inv.items[0].bonus).toBeDefined();
    inv = equip(inv, 1, 200);
    const [p, v] = inv.items[0].bonus!;
    expect(itemLines(inv.items[0]).at(-1)).toEqual([p, v]);
    expect(gearStats(inv)).toBeTruthy();
  });

  it('taux : monstres ≈ 5 % Rare, boss ≈ 12 % Rare et 3 % Épique ; craft critique plafonné à 20 %', () => {
    const r = rng(9), n = 20000;
    const mons = Array.from({ length: n }, () => rollRarity('monster', r));
    const boss = Array.from({ length: n }, () => rollRarity('boss', r));
    expect(mons.filter((x) => x === 1).length / n).toBeCloseTo(0.05, 1);
    expect(boss.filter((x) => x === 2).length / n).toBeCloseTo(0.03, 1);
    expect(boss.filter((x) => x === 1).length / n).toBeCloseTo(0.12, 1);
    expect(critChance(12, 12)).toBeCloseTo(0.03);
    expect(critChance(200, 1)).toBe(0.2);
  });
});

describe('fusion', () => {
  it('Commun → Rare : 3 identiques ; le jet garde sa qualité', () => {
    let inv = emptyInventory();
    for (let i = 0; i < 3; i++) inv = addNew(inv, 16500, 0, rng(i + 1));
    inv = { ...inv, items: inv.items.map((o) => (o.uid === 1 ? { ...o, rolls: [15, 2] } : o)) };
    expect(fusionPartners(inv, 1).map((o) => o.uid)).toEqual([2, 3]);
    const res = fuse(ws(inv), 1, [2, 3], rng(1));
    expect(res.item!.rarity).toBe(1);
    expect(res.item!.rolls[0]).toBe(rangesFor(16500, 1)[0][2]); // jet max → reste max
    expect(res.workshop.inventory.items).toHaveLength(1);
    expect(res.xp).toBeGreaterThan(0);
  });

  it('jusqu’à Légendaire (choix d’Enzo) : même emplacement, même niveau et même rang ; portés, verrouillés et favoris exclus', () => {
    let inv = emptyInventory();
    for (const id of RINGS) inv = addNew(inv, id, 1, rng(id)); // uid 1 à 4 : anneaux Rares
    inv = addNew(inv, RINGS[0], 0, rng(1)); // 5 : Commun, pas le même rang
    inv = addNew(inv, KARDO[0], 1, rng(2)); // 6 : Rare mais casque
    inv = addNew(inv, OTHER_RING, 1, rng(3)); // 7 : anneau Rare d'un autre niveau (ajouté par Enzo : même niveau)
    expect(fusionRule(inv.items[0])).toBe('slot');
    const ps = fusionPartners(inv, 1).map((o) => o.uid);
    expect(ps.sort()).toEqual([2, 3, 4]);
    inv = { ...inv, items: inv.items.map((o) => (o.uid === 2 ? { ...o, lock: true } : o.uid === 3 ? { ...o, fav: true } : o)) };
    inv = equip(inv, 4, 200);
    expect(fusionPartners(inv, 1)).toHaveLength(0);
  });

  it('vers Mythique : retour à l’ancienne règle (pièces de la panoplie)', () => {
    let inv = emptyInventory();
    for (const id of KARDO) inv = addNew(inv, id, 3, rng(id));
    inv = addNew(inv, KARDO[0], 3, rng(9)); // 4 : même casque Légendaire
    expect(fusionRule(inv.items[0])).toBe('set');
    expect(fusionPartners(inv, 1).map((o) => o.uid).sort()).toEqual([2, 3, 4]);
    let rings = emptyInventory();
    for (const id of RINGS.slice(0, 3)) rings = addNew(rings, id, 3, rng(id));
    // anneaux hors panoplie différents : plus de fusion vers Mythique
    const solo = rings.items.filter((o) => !item(o.id).set);
    if (solo.length >= 2) expect(fusionPartners(rings, solo[0].uid).filter((o) => o.id !== solo[0].id && !item(o.id).set)).toHaveLength(0);
  });

  it('Légendaire et Mythique coûtent des Crânes de Kardorim (verrouillés : non)', () => {
    let inv = emptyInventory();
    for (const id of RINGS.slice(0, 3)) inv = addNew(inv, id, 2, rng(id));
    expect(canFuse(ws(inv), 1, [2, 3])).toMatchObject({ ok: false });
    const w = ws(inv, { [BOSS_RESOURCE]: 4 });
    expect(canFuse({ ...w, locked: [BOSS_RESOURCE] }, 1, [2, 3])).toMatchObject({ ok: false });
    const res = fuse(w, 1, [2, 3], rng(2));
    expect(res.item!.rarity).toBe(3);
    expect(res.item!.bonus).toBeDefined();
    expect(res.workshop.resources[BOSS_RESOURCE]).toBe(1);
  });

  it('un dépassement du maximum (forgemagie) est conservé', () => {
    const [, , hi] = rangesFor(16500, 0)[0];
    expect(upgradeRolls(16500, [hi + 3, 2], 0, 1)[0]).toBe(rangesFor(16500, 1)[0][2] + 3);
  });
});

describe('brisage', () => {
  it('vraies runes, grosses d’abord, aperçu = résultat', () => {
    expect(RUNES_BY_STAT.get('force')!.map(([, v]) => v)).toEqual([10, 3, 1]);
    let inv = addNew(emptyInventory(), 16500, 0, rng(4));
    inv = { ...inv, items: [{ ...inv.items[0], rolls: [15, 2] }] };
    const prev = breakPreview(inv.items[0]);
    const res = breakItem(ws(inv), 1, rng(1));
    expect(res.workshop.inventory.items).toHaveLength(0);
    for (const [id, n] of Object.entries(res.runes)) {
      const [a, b] = prev.get(Number(id))!;
      expect(n).toBeGreaterThanOrEqual(a);
      expect(n).toBeLessThanOrEqual(b);
      expect(res.workshop.resources[id]).toBe(n);
    }
    expect(Object.keys(res.runes).map((id) => item(Number(id)).name)).toContain('Rune Pa Fo');
  });

  it('plus haut niveau ou plus rare = plus de runes ; portés et verrouillés refusés', () => {
    expect(lineWeight(10, 1, 100, 0)).toBeGreaterThan(lineWeight(10, 1, 10, 0));
    expect(lineWeight(10, 1, 10, 4)).toBeGreaterThan(lineWeight(10, 1, 10, 0));
    let inv = addNew(emptyInventory(), 16500, 0, rng(4));
    inv = equip(inv, 1, 200);
    expect(breakItem(ws(inv), 1, rng(1)).workshop.inventory.items).toHaveLength(1);
  });
});

describe('épurer et brisage automatique (choix d’Enzo)', () => {
  it('seuil toujours au moins 15 niveaux sous le personnage', () => {
    expect(autoBreakMax(10)).toBe(0);
    expect(autoBreakMax(40)).toBe(25);
    expect(autoBreakLimit(30, 40)).toBe(25);
    expect(autoBreakLimit(10, 40)).toBe(10);
    expect(autoBreakLimit(undefined, 40)).toBe(0);
  });

  it('brise tout sous le seuil sauf portés, verrouillés, favoris, familiers et Dofus', () => {
    let inv = emptyInventory();
    const low = Object.values(ITEMS).filter((d) => d.slot === 'anneau' && d.level < 10 && d.effects.length).slice(0, 4).map((d) => d.id);
    for (const id of low) inv = addNew(inv, id, 0, rng(id));
    inv = addNew(inv, 16500, 0, rng(1)); // Casque de Kardorim, niveau 12 : au-dessus du seuil 10
    inv = { ...inv, items: inv.items.map((o) => (o.uid === 2 ? { ...o, lock: true } : o.uid === 3 ? { ...o, fav: true } : o)) };
    inv = equip(inv, 4, 200);
    expect(purgeTargets(inv, 10).map((o) => o.uid)).toEqual([1]);
    const r = breakMany(ws(inv), [1], rng(1));
    expect(r.n).toBe(1);
    expect(r.workshop.inventory.items).toHaveLength(4);
  });
});
