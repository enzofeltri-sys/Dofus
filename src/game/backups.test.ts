import { beforeEach, describe, expect, it } from 'vitest';
import { autoBackup, importSave, listBackups, makeBackup, MAX_BACKUPS, pendingReset, resetGame, restoreBackup } from './backups';
import { XP_TABLE } from './progression';
import { emptySave, SAVE_KEY } from './save';

let mem: Record<string, string> = {};
const save = (level: number, done: string[] = []) => JSON.stringify({ ...emptySave(), profile: { ...emptySave().profile, xp: XP_TABLE[level] }, done });

describe('Paramètres : copies de sauvegarde et réinitialisation (demande d’Enzo)', () => {
  beforeEach(() => {
    mem = {};
    (globalThis as unknown as { localStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> }).localStorage = {
      getItem: (k) => mem[k] ?? null,
      setItem: (k, v) => void (mem[k] = v),
      removeItem: (k) => void delete mem[k],
    };
  });

  it('copie automatique : une seule toutes les 20 h, avec le résumé (niveau, étapes)', () => {
    mem[SAVE_KEY] = save(23, ['champs', 'crypte']);
    expect(autoBackup(1000)).not.toBeNull();
    expect(autoBackup(1000 + 3600_000)).toBeNull();
    expect(autoBackup(1000 + 21 * 3600_000)).not.toBeNull();
    const [b] = listBackups();
    expect([b.kind, b.level, b.done]).toEqual(['auto', 23, 2]);
  });

  it(`au plus ${MAX_BACKUPS} copies : les automatiques les plus anciennes partent d’abord`, () => {
    mem[SAVE_KEY] = save(5);
    makeBackup('manuelle', 1);
    for (let i = 0; i < 12; i++) makeBackup('auto', 10 + i);
    const l = listBackups();
    expect(l).toHaveLength(MAX_BACKUPS);
    expect(l.some((b) => b.kind === 'manuelle')).toBe(true);
    expect(l[0].at).toBe(21);
  });

  it('restaurer : la sauvegarde revient, et l’actuelle est copiée avant', () => {
    mem[SAVE_KEY] = save(10);
    const old = makeBackup('manuelle', 5)!;
    mem[SAVE_KEY] = save(40);
    expect(restoreBackup(old.at)).toBe(true);
    expect(JSON.parse(mem[SAVE_KEY]).profile.xp).toBe(XP_TABLE[10]);
    expect(listBackups()[0]).toMatchObject({ kind: 'avant-restauration', level: 40 });
  });

  it('importer : refuse un texte qui n’est pas une sauvegarde', () => {
    mem[SAVE_KEY] = save(10);
    expect(importSave('bonjour')).toBe('Ce texte n’est pas une sauvegarde du jeu.');
    expect(importSave(save(33))).toBe(true);
    expect(JSON.parse(mem[SAVE_KEY]).profile.xp).toBe(XP_TABLE[33]);
  });

  it('réinitialiser : partie neuve, mais une copie « avant réinitialisation » est gardée', () => {
    mem[SAVE_KEY] = save(50);
    expect(resetGame()).toBe(true);
    expect(mem[SAVE_KEY]).toBeUndefined();
    expect(listBackups()[0]).toMatchObject({ kind: 'avant-reset', level: 50 });
  });

  it('la réinitialisation demandée par Enzo n’a lieu qu’une fois', () => {
    mem[SAVE_KEY] = save(60);
    expect(pendingReset()).toBe(true);
    expect(mem[SAVE_KEY]).toBeUndefined();
    mem[SAVE_KEY] = save(2);
    expect(pendingReset()).toBe(false);
    expect(mem[SAVE_KEY]).toBeDefined();
    expect(listBackups().filter((b) => b.kind === 'avant-reset')).toHaveLength(1);
  });
});
