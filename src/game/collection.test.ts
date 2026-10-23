import { describe, expect, it } from 'vitest';
import { rng } from '../iso';
import { betterThanWorn, caracWeights, itemScore, ownedOf, zoneOfArea, zoneSets } from './collection';
import { addNew } from './forge';
import { emptyInventory, equip } from './inventory';

describe('collection de panoplies (refonte validée par Enzo)', () => {
  it('chaque zone montre les panoplies que ses monstres lâchent, de la plus basse à la plus haute', () => {
    expect(zoneSets('bouftous').map((s) => s.name)).toEqual(['Panoplie du Bouftou', 'Panoplie du Bouftou Royal']);
    expect(zoneSets('bouftous')[0].pieces).toHaveLength(8);
    expect(zoneOfArea('coinBouftous')).toBe('bouftous');
    for (const z of ['incarnam', 'astrub', 'cote', 'amakna', 'kwaks', 'bworks', 'wabbits']) expect(zoneSets(z).length, z).toBeGreaterThan(0);
  });

  it('3 exemplaires identiques : la pièce peut monter de rang', () => {
    let inv = emptyInventory();
    for (let k = 0; k < 2; k++) inv = addNew(inv, 2411, 0, rng(k + 1));
    expect(ownedOf(inv, 2411)).toMatchObject({ count: 2, fusable: null });
    inv = addNew(inv, 2411, 0, rng(9));
    expect(ownedOf(inv, 2411).fusable).not.toBeNull();
  });

  it('« mieux » suit les éléments joués : un objet Intelligence vaut plus pour un Sacrieur Intelligence', () => {
    const fo = caracWeights({ force: 100 }), ine = caracWeights({ intelligence: 100 });
    expect(fo.force).toBeGreaterThan(ine.force);
    // Coiffe du Bouftou (Force et Intelligence) : comparée à un emplacement vide, toujours mieux
    expect(betterThanWorn(emptyInventory(), 2411, fo)).toBe('up');
    let inv = addNew(emptyInventory(), 2411, 0, rng(1));
    inv = equip(inv, 1, 200);
    expect(betterThanWorn(inv, 2411, fo, inv.items[0].rolls)).toBe('same');
    expect(itemScore(2411, fo)).toBeGreaterThan(0);
  });
});
