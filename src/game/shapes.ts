import type { Obstacle } from './rooms';

/**
 * Formes des salles des îles d'Incarnam (création, d'après les vraies cartes : ponts de corde, trous dans l'île, bords de falaise).
 * Le vide est un obstacle (on ne peut pas y tomber, on le contourne). Coordonnées de salle (720 de large, sol à partir de y = 324).
 * Le rayon d'un trou est « à plat » (écrasé par la perspective à l'affichage), comme les obstacles.
 */

export type ShapeId = 'plaine' | 'pont' | 'trous' | 'arene' | 'couloir' | 'archipel' | 'lac';

/** Bande de vide horizontale traversée par un pont. */
export interface Band {
  y: number;
  /** Demi-épaisseur à l'écran. */
  half: number;
  /** Centre et demi-largeur du pont. */
  gapX: number;
  gapHalf: number;
}

export interface RoomShape {
  id: ShapeId;
  name: string;
  /** Trous de vide (obstacles). */
  holes: Obstacle[];
  /** Bandes de vide à franchir par un pont (leurs trous sont dans `holes`). */
  bands: Band[];
  /** Rétrécissement de l'île sur les côtés (couloir). */
  margin: number;
}

const PERSP = 0.62;
const W = 720;

/** Bande de vide sur toute la largeur, avec un pont en `gapX` : deux capsules de part et d'autre. */
function band(y: number, half: number, gapX: number, gapHalf: number): { band: Band; holes: Obstacle[] } {
  const r = half / PERSP;
  const leftEnd = gapX - gapHalf - r, rightStart = gapX + gapHalf + r;
  const L = -300, R = W + 300;
  return {
    band: { y, half, gapX, gapHalf },
    holes: [
      { x: (L + leftEnd) / 2, y, r, hx: (leftEnd - L) / 2 },
      { x: (rightStart + R) / 2, y, r, hx: (R - rightStart) / 2 },
    ],
  };
}

export const SHAPE_NAMES: Record<ShapeId, string> = {
  plaine: 'Plaine', pont: 'Pont de corde', trous: 'Île trouée', arene: 'Arène', couloir: 'Couloir', archipel: 'Archipel', lac: 'Gouffre',
};

/** Forme d'une salle ; `mirror` la retourne de gauche à droite. */
export function roomShape(id: ShapeId, mirror = false): RoomShape {
  const mx = (x: number) => (mirror ? W - x : x);
  const s: RoomShape = { id, name: SHAPE_NAMES[id], holes: [], bands: [], margin: 0 };
  if (id === 'pont') {
    const b = band(770, 72, mx(330), 42);
    s.bands.push(b.band);
    s.holes.push(...b.holes);
  } else if (id === 'archipel') {
    for (const b of [band(640, 58, mx(200), 40), band(990, 58, mx(520), 40)]) {
      s.bands.push(b.band);
      s.holes.push(...b.holes);
    }
  } else if (id === 'trous') {
    s.holes.push({ x: mx(220), y: 640, r: 92, hx: 0 }, { x: mx(510), y: 990, r: 100, hx: 0 }, { x: mx(560), y: 520, r: 58, hx: 0 });
  } else if (id === 'arene') {
    for (const [x, y] of [[20, 300], [700, 300], [20, 1440], [700, 1440]]) s.holes.push({ x, y, r: 250, hx: 0 });
  } else if (id === 'couloir') {
    s.margin = 112;
  } else if (id === 'lac') {
    s.holes.push({ x: mx(380), y: 820, r: 96, hx: 70 });
  }
  return s;
}

/** Salles normales : toutes les formes ; la première reste simple, la salle de l'élite est une plaine ou une arène. */
export const FIRST_SHAPES: ShapeId[] = ['plaine', 'trous', 'lac'];
export const MID_SHAPES: ShapeId[] = ['pont', 'trous', 'couloir', 'archipel', 'lac', 'plaine', 'arene'];
export const ELITE_SHAPES: ShapeId[] = ['plaine', 'arene'];
