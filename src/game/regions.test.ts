import { describe, expect, it } from 'vitest';
import { REGIONS, worldOpen, ZONES } from './data/areas';
import { atlasView } from '../ui/atlas-view';

describe('Carte du monde : une région par île, chacune son arbre (validé par Enzo)', () => {
  it('s’ouvre avec le Nid du Kwakwa ou le Donjon des Bworks', () => {
    expect(worldOpen(['tofus', 'cour'])).toBe(false);
    expect(worldOpen(['nidKwakwa'])).toBe(true);
    expect(worldOpen(['donjonBworks'])).toBe(true);
  });

  it('les zones déjà jouables sont rangées dans leur vraie région ; le continent garde le reste', () => {
    const reg = (z: string) => ZONES.find((x) => x.id === z)!.region;
    expect([reg('wabbits'), reg('blops'), reg('craqueleursZone'), reg('otomai')]).toEqual(['wabbits', 'cania', 'amakna', 'otomai']);
    for (const z of ZONES.filter((x) => x.region)) expect(REGIONS.some((r) => r.id === z.region), z.id).toBe(true);
    const v = atlasView(['nidKwakwa'], 'champs', {}, 64);
    expect(v.zones.some((z) => z.id === 'wabbits')).toBe(false);
    expect(v.zones.some((z) => z.id === 'incarnam')).toBe(true);
  });

  it('une région s’ouvre au niveau de son premier donjon − 10 ; l’arbre mêle étapes jouables et donjons à venir, dans l’ordre', () => {
    const v = atlasView(['nidKwakwa', 'arche', 'caleArche'], 'arche', {}, 64);
    const oto = v.regions.find((r) => r.id === 'otomai')!;
    expect(oto.state).toBe('open');
    expect(oto.steps.map((n) => n.name).slice(0, 3)).toEqual(['Grotte Hesque', 'Arche d’Otomaï', 'Cale de l’Arche d’Otomaï']);
    expect(oto.steps[0].state).toBe('soon');
    expect(oto.dungeons).toEqual([1, 6]);
    expect(oto.here).toBe(true);
    const fri = v.regions.find((r) => r.id === 'frigost')!;
    expect([fri.state, fri.open]).toEqual(['locked', 110]);
    expect(v.regions.find((r) => r.id === 'sidimote')!.state).toBe('soon');
  });

  it('dans une région, une étape demande son niveau − 10', () => {
    const v = atlasView(['nidKwakwa'], 'champs', {}, 50);
    const am = v.regions.find((r) => r.id === 'amakna')!;
    const pl = am.steps.find((n) => n.id === 'plainesRocheuses')!;
    expect(pl.state).toBe('locked');
    expect(pl.need).toContain('Niveau 53');
  });
});
