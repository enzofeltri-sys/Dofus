import { describe, expect, it } from 'vitest';
import { canCraft, craft, craftXp, JOB_XP_TABLE, jobLevel, jobXpToNext, recipeFor, RECIPES, type Workshop } from './craft';
import { emptyInventory } from './inventory';
import { ITEMS } from './data/items';
import { rng } from '../iso';

const ws = (resources: Record<string, number>, jobXp = 0): Workshop => ({ resources, inventory: emptyInventory(), jobXp });

describe('Artisan', () => {
  it('recettes réelles : tous les ingrédients existent dans le jeu, la panoplie Kardorim et l’Aventurier sont fabricables', () => {
    for (const r of RECIPES) for (const [id] of r.ingredients) expect(ITEMS[id], `ingrédient ${id} de ${r.id}`).toBeDefined();
    expect(recipeFor(16500)?.ingredients).toEqual(expect.arrayContaining([[16525, 4]]));
    // l'Anneau de l'Aventurier demande des Graines de Sésame, absentes d'Incarnam : pas fabricable ici
    for (const id of [2473, 2474, 2476, 2477, 2478]) expect(recipeFor(id)).toBeDefined();
    expect(recipeFor(2475)).toBeUndefined();
  });

  it('niveau d’Artisan requis et ingrédients comptés', () => {
    const casque = recipeFor(16500)!;
    const full = Object.fromEntries(casque.ingredients.map(([id, q]) => [id, q * 2]));
    expect(canCraft(ws(full), casque)).toEqual({ ok: false, reason: 'Artisan niveau 12 requis', max: 0 });
    expect(canCraft(ws(full, JOB_XP_TABLE[12]), casque)).toEqual({ ok: true, max: 2 });
    expect(canCraft(ws({}, JOB_XP_TABLE[12]), casque).ok).toBe(false);
  });

  it('fabriquer consomme les ingrédients, crée l’objet avec des jets dans les fourchettes et rapporte de l’XP', () => {
    const casque = recipeFor(16500)!;
    const w = ws(Object.fromEntries(casque.ingredients.map(([id, q]) => [id, q * 3])), JOB_XP_TABLE[12]);
    const res = craft(w, casque, 2, rng(4));
    expect(res.count).toBe(2);
    expect(res.workshop.inventory.items).toHaveLength(2);
    expect(res.workshop.inventory.items[0].rolls[0]).toBeGreaterThanOrEqual(11);
    for (const [id, q] of casque.ingredients) expect(res.workshop.resources[id]).toBe(q);
    expect(res.xp).toBe(2 * craftXp(12, 12));
    expect(w.resources[16525]).toBe(12); // l'atelier d'origine n'est pas modifié
  });

  it('les ressources intermédiaires vont dans le stock ; XP dégressive sur les recettes trop basses', () => {
    const planche = recipeFor(16489)!;
    const res = craft(ws({ 303: 25 }), planche, 5, rng(1));
    expect(res.count).toBe(2);
    expect(res.workshop.resources[16489]).toBe(2);
    expect(res.workshop.resources[303]).toBe(5);
    expect(craftXp(1, 30)).toBeLessThan(craftXp(1, 5));
  });

  it('courbe : ≈ 25 fabrications de niveau moyen pour atteindre Artisan 12, et longue jusqu’à 200', () => {
    let xp = 0, crafts = 0;
    while (jobLevel(xp) < 12) { xp += craftXp(Math.max(1, jobLevel(xp) - 2), jobLevel(xp)); crafts++; }
    expect(crafts).toBeGreaterThan(15);
    expect(crafts).toBeLessThan(45);
    expect(jobXpToNext(199)).toBeGreaterThan(20000);
  });
});
