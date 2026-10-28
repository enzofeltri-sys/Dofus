import { isUnlocked, REGIONS, worldOpen, ZONES } from '../game/data/areas';

/** Écran « Donjons » : l'arbre des zones (cartes de farm puis donjon), avec l'état de chaque étape. */
export interface AtlasNode {
  id: string;
  name: string;
  level: number;
  kind: 'map' | 'dungeon';
  sub: string;
  state: 'done' | 'open' | 'locked' | 'soon';
  /** Ce qu'il faut faire pour la débloquer. */
  need: string;
  selected: boolean;
  /** Victoires obtenues / demandées, pour les cartes qui en demandent plusieurs. */
  wins?: [number, number];
  /** Donjon pas encore dans le jeu (région) : son boss. */
  boss?: string;
}
/** Région de la carte du monde (validée par Enzo) : ses étapes jouables et celles à venir, dans l'ordre des niveaux. */
export interface RegionCard {
  id: string;
  name: string;
  color: string;
  levels: [number, number];
  open: number;
  state: 'open' | 'locked' | 'soon';
  /** Donjons terminés / donjons de la région (vrai nombre DofusDB). */
  dungeons: [number, number];
  steps: AtlasNode[];
  here: boolean;
}
export interface AtlasView {
  /** Zones du continent (Incarnam → Bworks). */
  zones: { id: string; name: string; nodes: AtlasNode[] }[];
  /** Carte du monde ouverte (Nid du Kwakwa ou Donjon des Bworks terminé). */
  world: boolean;
  heroLevel: number;
  regions: RegionCard[];
}

export function atlasView(done: string[], selected: string, mapWins: Record<string, number> = {}, heroLevel = Infinity): AtlasView {
  const nameOf = (id: string) => ZONES.flatMap((z) => z.nodes).find((n) => n.id === id)?.name ?? id;
  const zoneNodes = (z: (typeof ZONES)[number]): AtlasNode[] => z.nodes.map((n) => ({
    id: n.id, name: n.name, level: n.level, kind: n.kind,
    sub: n.soon ? 'Bientôt' : n.area?.sub ?? '',
    state: n.soon ? 'soon' : done.includes(n.id) ? 'done' : isUnlocked(n, done, heroLevel) ? 'open' : 'locked',
    need: [n.needs.length ? `Termine : ${n.needs.map(nameOf).join(', ')}` : '', n.needsAny ? `Termine : ${n.needsAny.map(nameOf).join(' ou ')}` : '',
      n.minLevel && n.minLevel > heroLevel ? `Niveau ${n.minLevel}` : ''].filter(Boolean).join(' · '),
    selected: n.id === selected,
    ...(n.area?.winsNeeded && n.area.winsNeeded > 1 ? { wins: [Math.min(mapWins[n.id] ?? 0, n.area.winsNeeded), n.area.winsNeeded] as [number, number] } : {}),
  }));
  const regions = REGIONS.map((r): RegionCard => {
    const built = ZONES.filter((z) => z.region === r.id).flatMap(zoneNodes);
    const soon = r.upcoming.map((u): AtlasNode => ({
      id: `soon:${u.name}`, name: u.name, level: u.level, kind: 'dungeon', sub: '', state: 'soon', need: 'Bientôt', selected: false, boss: u.boss,
    }));
    const steps = [...built, ...soon].sort((a, b) => a.level - b.level || (a.kind === 'map' ? -1 : 1) - (b.kind === 'map' ? -1 : 1));
    const djs = steps.filter((n) => n.kind === 'dungeon');
    return {
      id: r.id, name: r.name, color: r.color, levels: r.levels, open: r.open,
      state: heroLevel < r.open ? 'locked' : built.length ? 'open' : 'soon',
      dungeons: [djs.filter((n) => n.state === 'done').length, Math.max(r.total, djs.length)], steps, here: built.some((n) => n.selected),
    };
  }).sort((a, b) => a.open - b.open || a.levels[0] - b.levels[0]);
  return {
    zones: ZONES.filter((z) => !z.region).map((z) => ({ id: z.id, name: z.name, nodes: zoneNodes(z) })),
    world: worldOpen(done), heroLevel, regions,
  };
}
