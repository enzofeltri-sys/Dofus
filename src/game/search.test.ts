import { describe, expect, it } from 'vitest';
import { applyFilters, emptyFilters, norm, parseQuery, STAT_OPTIONS, type Facets } from './search';

const facets = (name: string, level: number, stats: [string, number][], extra: Partial<Facets> = {}): { facets: Facets } => ({
  facets: { name, level, slot: 'anneau', set: null, stats: new Map(stats), text: ['Anneau'], flags: new Set(), order: 0, ...extra },
});

describe('recherche', () => {
  it('ignore accents et majuscules', () => {
    expect(norm('Crâne de KARDORIM')).toBe('crane de kardorim');
  });

  it('reconnaît les abréviations de Dofus, y compris en plusieurs mots', () => {
    const q = parseQuery('fo do feu ré terre');
    expect(q.stats).toEqual([['force'], ['dommagesElem.feu'], ['resPct.terre', 'resFixe.terre', 'res.terre']]);
    expect(q.text).toEqual([]);
  });

  it('lit les niveaux et les comparaisons de stats', () => {
    expect(parseQuery('<15')).toMatchObject({ min: null, max: 14 });
    expect(parseQuery('10-30')).toMatchObject({ min: 10, max: 30 });
    expect(parseQuery('niv 20')).toMatchObject({ min: 20, max: 20 });
    expect(parseQuery('agi > 10').cmp).toEqual([{ paths: ['agilite'], op: '>', v: 10 }]);
  });

  it('filtre et trie par stat, favoris en premier', () => {
    const rows = [
      facets('Anneau Rexik', 1, [['agilite', 5]]),
      facets('Anneau Fort', 12, [['force', 20]]),
      facets('Anneau Agile', 10, [['agilite', 15]]),
      facets('Petit Anneau', 3, [['agilite', 2]], { flags: new Set(['fav']) }),
    ];
    const agi = applyFilters(rows, { ...emptyFilters(), q: 'agi', sort: 'stat' }).map((r) => r.facets.name);
    expect(agi).toEqual(['Petit Anneau', 'Anneau Agile', 'Anneau Rexik']);
    expect(applyFilters(rows, { ...emptyFilters(), q: 'agi>4' }).length).toBe(2);
    expect(applyFilters(rows, { ...emptyFilters(), q: 'anneau', min: 5 }).length).toBe(2);
    expect(applyFilters(rows, { ...emptyFilters(), q: 'rexik' })[0].facets.name).toBe('Anneau Rexik');
    expect(applyFilters(rows, { ...emptyFilters(), only: ['fav'] }).length).toBe(1);
  });

  it('propose les stats présentes dans le jeu', () => {
    expect(STAT_OPTIONS.some((s) => s.path === 'force')).toBe(true);
  });
});
