/**
 * Dispositions des salles de la crypte (objets de décor + obstacles).
 * Partagées par la logique (collisions) et le rendu (dessin).
 * Coordonnées en pixels de salle (720 de large), sol à partir de y = 300.
 */

export type PropKind = 'column' | 'sarcophagus' | 'brazier' | 'boneBowl' | 'rubble' | 'bones' | 'candles' | 'blossom' | 'stone' | 'stele' | 'flowers';

export interface PropPlacement {
  kind: PropKind;
  x: number;
  y: number;
  scale?: number;
}

/** Obstacle circulaire au sol (rayon « à plat », écrasé à l'affichage par la perspective). */
export interface Obstacle {
  x: number;
  y: number;
  r: number;
  /** Demi-longueur horizontale (capsule) : 0 pour un simple cercle. */
  hx: number;
}

/** Rayon d'obstacle de chaque objet (0 = décor traversable). */
const BLOCK: Record<PropKind, number> = { column: 46, sarcophagus: 0, brazier: 42, boneBowl: 36, rubble: 38, bones: 0, candles: 0, blossom: 30, stone: 40, stele: 28, flowers: 0 };

const TEMPLATES: PropPlacement[][] = [
  [
    { kind: 'column', x: 186, y: 700 }, { kind: 'column', x: 534, y: 700 },
    { kind: 'sarcophagus', x: 360, y: 1010 },
    { kind: 'brazier', x: 150, y: 1200 }, { kind: 'brazier', x: 570, y: 1200 },
    { kind: 'boneBowl', x: 600, y: 880 }, { kind: 'rubble', x: 610, y: 470, scale: 0.8 },
    { kind: 'bones', x: 128, y: 930 }, { kind: 'bones', x: 560, y: 1360 },
    { kind: 'candles', x: 118, y: 560 }, { kind: 'candles', x: 606, y: 600 },
  ],
  [
    { kind: 'column', x: 200, y: 620 }, { kind: 'column', x: 520, y: 620 },
    { kind: 'column', x: 200, y: 1060 }, { kind: 'column', x: 520, y: 1060 },
    { kind: 'brazier', x: 360, y: 840 },
    { kind: 'bones', x: 140, y: 820 }, { kind: 'bones', x: 590, y: 1240 },
    { kind: 'candles', x: 120, y: 480 }, { kind: 'candles', x: 600, y: 480 },
    { kind: 'rubble', x: 590, y: 860, scale: 0.8 },
  ],
  [
    { kind: 'sarcophagus', x: 230, y: 720 }, { kind: 'sarcophagus', x: 490, y: 1000 },
    { kind: 'brazier', x: 560, y: 560 }, { kind: 'brazier', x: 160, y: 1180 },
    { kind: 'column', x: 600, y: 1240 },
    { kind: 'boneBowl', x: 140, y: 920 },
    { kind: 'bones', x: 420, y: 520 }, { kind: 'candles', x: 610, y: 780 },
    { kind: 'rubble', x: 330, y: 1300 },
  ],
  [
    { kind: 'brazier', x: 150, y: 540 }, { kind: 'brazier', x: 570, y: 540 },
    { kind: 'brazier', x: 150, y: 1180 }, { kind: 'brazier', x: 570, y: 1180 },
    { kind: 'boneBowl', x: 360, y: 860 },
    { kind: 'bones', x: 250, y: 700 }, { kind: 'bones', x: 470, y: 1030 },
    { kind: 'candles', x: 360, y: 460 },
    { kind: 'rubble', x: 610, y: 860, scale: 0.8 },
  ],
];

/** Champs d'Incarnam : arbres en fleurs, blocs de grès gravés, stèles ; fleurs dorées traversables. */
const CHAMPS_TEMPLATES: PropPlacement[][] = [
  [
    { kind: 'blossom', x: 190, y: 700, scale: 1.4 }, { kind: 'stone', x: 540, y: 760 },
    { kind: 'stele', x: 170, y: 1160 }, { kind: 'blossom', x: 560, y: 1180, scale: 1.3 },
    { kind: 'flowers', x: 300, y: 560 }, { kind: 'flowers', x: 470, y: 980 }, { kind: 'flowers', x: 140, y: 920 }, { kind: 'flowers', x: 600, y: 1360 },
  ],
  [
    { kind: 'stone', x: 220, y: 620 }, { kind: 'stone', x: 500, y: 620, scale: 0.85 },
    { kind: 'blossom', x: 360, y: 900, scale: 1.4 },
    { kind: 'stele', x: 190, y: 1180 }, { kind: 'stele', x: 540, y: 1150 },
    { kind: 'flowers', x: 130, y: 820 }, { kind: 'flowers', x: 600, y: 860 }, { kind: 'flowers', x: 360, y: 1300 },
  ],
  [
    { kind: 'blossom', x: 160, y: 560, scale: 1.35 }, { kind: 'blossom', x: 570, y: 600, scale: 1.3 },
    { kind: 'stone', x: 300, y: 960 }, { kind: 'stele', x: 520, y: 1030 },
    { kind: 'blossom', x: 170, y: 1260, scale: 1.25 },
    { kind: 'flowers', x: 420, y: 720 }, { kind: 'flowers', x: 250, y: 760 }, { kind: 'flowers', x: 590, y: 1300 },
  ],
  [
    { kind: 'stele', x: 200, y: 640 }, { kind: 'stele', x: 520, y: 640 },
    { kind: 'stone', x: 180, y: 1150 }, { kind: 'stone', x: 540, y: 1150, scale: 0.9 },
    { kind: 'flowers', x: 360, y: 520 }, { kind: 'flowers', x: 300, y: 880 }, { kind: 'flowers', x: 430, y: 880 }, { kind: 'flowers', x: 360, y: 1320 },
  ],
];

export function roomLayout(index: number, theme: 'crypt' | 'champs' = 'crypt'): PropPlacement[] {
  const t = theme === 'champs' ? CHAMPS_TEMPLATES : TEMPLATES;
  return t[index % t.length];
}

export function roomObstacles(layout: PropPlacement[]): Obstacle[] {
  const obs: Obstacle[] = [];
  for (const p of layout) {
    if (p.kind === 'sarcophagus') {
      // le sarcophage est long : une capsule horizontale
      obs.push({ x: p.x, y: p.y - 12, r: 44, hx: 70 });
    } else if (BLOCK[p.kind] > 0) {
      obs.push({ x: p.x, y: p.y, r: BLOCK[p.kind] * (p.scale ?? 1), hx: 0 });
    }
  }
  return obs;
}

/** Point le plus proche de (x, y) sur l'axe de l'obstacle (centre, ou segment pour une capsule). */
export function obstacleCore(o: Obstacle, x: number): number {
  return Math.max(o.x - o.hx, Math.min(o.x + o.hx, x));
}
