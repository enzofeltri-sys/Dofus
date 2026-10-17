import { describe, expect, it } from 'vitest';
import { AREAS, isUnlocked, ZONES } from './data/areas';
import { MONSTERS } from './data/monsters';
import { roomLayout } from './rooms';

const node = (id: string) => ZONES.flatMap((z) => z.nodes).find((n) => n.id === id)!;

describe('arbre d’Incarnam', () => {
  it('les Champs ouvrent les trois autres cartes, dans l’ordre qu’on veut', () => {
    for (const id of ['paturages', 'foret', 'cimetiere']) {
      expect(isUnlocked(node(id), [])).toBe(false);
      expect(isUnlocked(node(id), ['champs'])).toBe(true);
    }
  });

  it('la Crypte demande les 4 cartes', () => {
    expect(isUnlocked(node('crypte'), ['champs', 'paturages', 'foret'])).toBe(false);
    expect(isUnlocked(node('crypte'), ['champs', 'paturages', 'foret', 'cimetiere'])).toBe(true);
  });

  it('une étape déjà vaincue reste ouverte (anciennes sauvegardes)', () => {
    expect(isUnlocked(node('crypte'), ['champs', 'crypte'])).toBe(true);
  });

  it('chaque carte a des monstres et un décor qui existent', () => {
    for (const a of Object.values(AREAS)) {
      for (const id of [...a.pool, a.elite?.id, a.boss?.id].filter(Boolean)) expect(MONSTERS[id!], `${a.id} : ${id}`).toBeDefined();
      for (let i = 0; i < a.rooms; i++) expect(roomLayout(i, a.theme).length).toBeGreaterThan(0);
    }
  });
});
