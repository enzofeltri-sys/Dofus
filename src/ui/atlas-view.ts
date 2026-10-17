import { isUnlocked, ZONES } from '../game/data/areas';

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
}
export interface AtlasView {
  zones: { id: string; name: string; nodes: AtlasNode[] }[];
}

export function atlasView(done: string[], selected: string): AtlasView {
  const nameOf = (id: string) => ZONES.flatMap((z) => z.nodes).find((n) => n.id === id)?.name ?? id;
  return {
    zones: ZONES.map((z) => ({
      id: z.id, name: z.name,
      nodes: z.nodes.map((n) => ({
        id: n.id, name: n.name, level: n.level, kind: n.kind,
        sub: n.soon ? 'Bientôt' : n.area?.sub ?? '',
        state: n.soon ? 'soon' : done.includes(n.id) ? 'done' : isUnlocked(n, done) ? 'open' : 'locked',
        need: n.needs.length ? `Termine : ${n.needs.map(nameOf).join(', ')}` : '',
        selected: n.id === selected,
      })),
    })),
  };
}
