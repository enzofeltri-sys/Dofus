/**
 * Dispositions des salles de la crypte (objets de décor + obstacles).
 * Partagées par la logique (collisions) et le rendu (dessin).
 * Coordonnées en pixels de salle (720 de large), sol à partir de y = 300.
 */

import type { Theme } from './data/areas';

export type PropKind = 'column' | 'sarcophagus' | 'brazier' | 'boneBowl' | 'rubble' | 'bones' | 'candles' | 'blossom' | 'stone' | 'stele' | 'flowers'
  | 'redbush' | 'block' | 'horns' | 'tomb' | 'deadtree' | 'lantern' | 'chest' | 'fountain'
  | 'autumnTree' | 'fence' | 'barn' | 'haystack' | 'house' | 'stall' | 'crates' | 'sunflowers' | 'pipe'
  | 'palm' | 'shell' | 'shellBlue' | 'sandrock' | 'tower' | 'pebbles' | 'mossrock' | 'quarry' | 'hut' | 'barrels';

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
const BLOCK: Record<PropKind, number> = { column: 46, sarcophagus: 0, brazier: 42, boneBowl: 36, rubble: 38, bones: 0, candles: 0, blossom: 30, stone: 40, stele: 28, flowers: 0,
  redbush: 30, block: 36, horns: 36, tomb: 32, deadtree: 22, lantern: 22, chest: 34, fountain: 56,
  autumnTree: 32, fence: 40, barn: 66, haystack: 38, house: 66, stall: 44, crates: 36, sunflowers: 0, pipe: 30,
  palm: 24, shell: 32, shellBlue: 32, sandrock: 42, tower: 40, pebbles: 0, mossrock: 42, quarry: 46, hut: 56, barrels: 36 };

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

/** Pâturages : comme les Champs, avec buissons rouges et blocs de pierre sombre. */
const PATURAGES_TEMPLATES: PropPlacement[][] = [
  [
    { kind: 'redbush', x: 180, y: 640 }, { kind: 'block', x: 540, y: 700 }, { kind: 'block', x: 600, y: 760, scale: 0.8 },
    { kind: 'blossom', x: 170, y: 1160, scale: 1.3 }, { kind: 'redbush', x: 560, y: 1200, scale: 1.1 },
    { kind: 'flowers', x: 330, y: 560 }, { kind: 'flowers', x: 460, y: 980 }, { kind: 'flowers', x: 140, y: 900 },
  ],
  [
    { kind: 'block', x: 220, y: 620 }, { kind: 'block', x: 500, y: 620 },
    { kind: 'redbush', x: 360, y: 900, scale: 1.2 },
    { kind: 'stone', x: 190, y: 1180 }, { kind: 'blossom', x: 550, y: 1160, scale: 1.3 },
    { kind: 'flowers', x: 130, y: 820 }, { kind: 'flowers', x: 600, y: 860 }, { kind: 'flowers', x: 360, y: 1300 },
  ],
  [
    { kind: 'blossom', x: 160, y: 560, scale: 1.3 }, { kind: 'redbush', x: 570, y: 600 },
    { kind: 'block', x: 300, y: 960 }, { kind: 'block', x: 520, y: 1040, scale: 0.9 },
    { kind: 'redbush', x: 170, y: 1260 },
    { kind: 'flowers', x: 420, y: 720 }, { kind: 'flowers', x: 590, y: 1300 },
  ],
  [
    { kind: 'redbush', x: 200, y: 640 }, { kind: 'redbush', x: 520, y: 640 },
    { kind: 'block', x: 180, y: 1150 }, { kind: 'stele', x: 540, y: 1150 },
    { kind: 'flowers', x: 360, y: 520 }, { kind: 'flowers', x: 300, y: 880 }, { kind: 'flowers', x: 430, y: 880 },
  ],
];

/** Forêt : arbres en fleurs serrés, grandes cornes d'ivoire. */
const FORET_TEMPLATES: PropPlacement[][] = [
  [
    { kind: 'blossom', x: 170, y: 620, scale: 1.4 }, { kind: 'blossom', x: 560, y: 680, scale: 1.35 },
    { kind: 'horns', x: 380, y: 940 }, { kind: 'blossom', x: 150, y: 1180, scale: 1.3 }, { kind: 'blossom', x: 580, y: 1220, scale: 1.4 },
    { kind: 'flowers', x: 300, y: 560 }, { kind: 'flowers', x: 470, y: 1100 },
  ],
  [
    { kind: 'horns', x: 200, y: 640 }, { kind: 'blossom', x: 520, y: 600, scale: 1.4 },
    { kind: 'blossom', x: 360, y: 940, scale: 1.4 },
    { kind: 'blossom', x: 170, y: 1200, scale: 1.3 }, { kind: 'horns', x: 550, y: 1160 },
    { kind: 'flowers', x: 130, y: 860 }, { kind: 'flowers', x: 600, y: 900 },
  ],
  [
    { kind: 'blossom', x: 150, y: 560, scale: 1.35 }, { kind: 'blossom', x: 360, y: 600, scale: 1.25 }, { kind: 'blossom', x: 580, y: 580, scale: 1.35 },
    { kind: 'horns', x: 260, y: 1000 }, { kind: 'blossom', x: 520, y: 1060, scale: 1.3 },
    { kind: 'blossom', x: 170, y: 1300, scale: 1.25 },
    { kind: 'flowers', x: 420, y: 800 },
  ],
  [
    { kind: 'horns', x: 190, y: 660 }, { kind: 'horns', x: 530, y: 660 },
    { kind: 'blossom', x: 170, y: 1150, scale: 1.4 }, { kind: 'blossom', x: 550, y: 1150, scale: 1.4 },
    { kind: 'flowers', x: 360, y: 520 }, { kind: 'flowers', x: 360, y: 1320 },
  ],
];

/** Cimetière : tombes, arbres morts, piliers-lanternes. */
const CIMETIERE_TEMPLATES: PropPlacement[][] = [
  [
    { kind: 'lantern', x: 170, y: 600 }, { kind: 'tomb', x: 530, y: 700 }, { kind: 'tomb', x: 610, y: 740, scale: 0.85 },
    { kind: 'deadtree', x: 160, y: 1160, scale: 1.2 }, { kind: 'tomb', x: 540, y: 1180 },
    { kind: 'bones', x: 330, y: 560 }, { kind: 'bones', x: 470, y: 1000 },
  ],
  [
    { kind: 'tomb', x: 210, y: 640 }, { kind: 'tomb', x: 290, y: 660, scale: 0.85 }, { kind: 'lantern', x: 520, y: 620 },
    { kind: 'deadtree', x: 360, y: 940, scale: 1.25 },
    { kind: 'tomb', x: 180, y: 1190 }, { kind: 'lantern', x: 560, y: 1160 },
    { kind: 'bones', x: 600, y: 880 },
  ],
  [
    { kind: 'deadtree', x: 160, y: 580, scale: 1.2 }, { kind: 'lantern', x: 580, y: 600 },
    { kind: 'tomb', x: 300, y: 970 }, { kind: 'tomb', x: 380, y: 990, scale: 0.85 }, { kind: 'tomb', x: 540, y: 1060 },
    { kind: 'deadtree', x: 180, y: 1290 },
    { kind: 'bones', x: 420, y: 720 },
  ],
  [
    { kind: 'lantern', x: 200, y: 640 }, { kind: 'lantern', x: 520, y: 640 },
    { kind: 'tomb', x: 180, y: 1150 }, { kind: 'deadtree', x: 550, y: 1160, scale: 1.2 },
    { kind: 'bones', x: 360, y: 880 }, { kind: 'bones', x: 360, y: 1320 },
  ],
];

const THEME_TEMPLATES: Partial<Record<Theme, PropPlacement[][]>> = {
  crypt: TEMPLATES, champs: CHAMPS_TEMPLATES, paturages: PATURAGES_TEMPLATES, foret: FORET_TEMPLATES, cimetiere: CIMETIERE_TEMPLATES,
};

export function roomLayout(index: number, theme: Theme = 'crypt'): PropPlacement[] {
  const t = THEME_TEMPLATES[theme] ?? CHAMPS_TEMPLATES;
  return t[index % t.length];
}

/** Retourne une disposition de gauche à droite. */
export const mirrorLayout = (l: PropPlacement[]): PropPlacement[] => l.map((p) => ({ ...p, x: 720 - p.x }));

/** Objets de chaque île : obstacles (avec tailles) et petits décors traversables. */
const ISLAND_PROPS: Record<Exclude<Theme, 'crypt'>, { block: [PropKind, number, number][]; decor: PropKind[] }> = {
  champs: { block: [['blossom', 1.25, 1.4], ['blossom', 1.25, 1.4], ['stone', 0.85, 1], ['stele', 1, 1]], decor: ['flowers'] },
  paturages: { block: [['redbush', 0.9, 1.2], ['redbush', 0.9, 1.2], ['block', 0.8, 1], ['blossom', 1.25, 1.35], ['stone', 0.85, 1]], decor: ['flowers'] },
  foret: { block: [['blossom', 1.25, 1.4], ['blossom', 1.25, 1.4], ['blossom', 1.25, 1.4], ['horns', 0.9, 1.1]], decor: ['flowers'] },
  cimetiere: { block: [['tomb', 0.85, 1], ['tomb', 0.85, 1], ['deadtree', 1, 1.25], ['lantern', 1, 1]], decor: ['bones'] },
  // Astrub, d'après les vraies cartes
  cite: { block: [['house', 0.75, 0.85], ['stall', 0.95, 1.1], ['crates', 0.9, 1.1], ['autumnTree', 1, 1.15]], decor: ['flowers'] },
  souterrains: { block: [['pipe', 0.95, 1.15], ['pipe', 0.95, 1.15], ['crates', 0.9, 1.1], ['block', 0.8, 1]], decor: ['bones'] },
  champsAstrub: { block: [['barn', 0.75, 0.85], ['haystack', 0.9, 1.15], ['haystack', 0.9, 1.15], ['fence', 1, 1.1]], decor: ['sunflowers', 'flowers'] },
  prairies: { block: [['autumnTree', 1.05, 1.25], ['autumnTree', 1.05, 1.25], ['fence', 1, 1.1], ['haystack', 0.9, 1.05]], decor: ['flowers'] },
  grange: { block: [['haystack', 0.9, 1.15], ['crates', 0.9, 1.1], ['fence', 1, 1.1], ['haystack', 0.9, 1.15]], decor: ['sunflowers'] },
  // Côte d'Astrub (validé par Enzo : 2 cartes chemin, 2 cartes plage) et Château Ensablé
  lisiere: { block: [['autumnTree', 1.05, 1.2], ['haystack', 0.9, 1.05], ['fence', 1, 1.1], ['palm', 0.95, 1.1]], decor: ['sunflowers', 'flowers'] },
  dunes: { block: [['sandrock', 0.8, 1], ['palm', 1, 1.15], ['shell', 0.85, 1], ['fence', 1, 1.1]], decor: ['pebbles'] },
  calanques: { block: [['sandrock', 0.9, 1.1], ['palm', 1, 1.2], ['shell', 0.9, 1.05], ['shellBlue', 0.9, 1.05]], decor: ['pebbles'] },
  plage: { block: [['palm', 1, 1.2], ['palm', 1, 1.2], ['shell', 0.9, 1.05], ['shellBlue', 0.9, 1.05], ['sandrock', 0.8, 0.95]], decor: ['pebbles'] },
  chateau: { block: [['tower', 0.95, 1.1], ['tower', 0.95, 1.1], ['shell', 0.9, 1.05], ['sandrock', 0.8, 0.95]], decor: ['pebbles'] },
  // branche B, d'après les vraies cartes
  tainela: { block: [['autumnTree', 1.05, 1.2], ['house', 0.6, 0.7], ['fence', 1, 1.1], ['haystack', 0.9, 1.05]], decor: ['flowers'] },
  foretAstrub: { block: [['autumnTree', 1.1, 1.3], ['autumnTree', 1.1, 1.3], ['mossrock', 0.85, 1.05], ['autumnTree', 1.1, 1.3]], decor: ['flowers'] },
  carriere: { block: [['quarry', 0.85, 1.05], ['quarry', 0.85, 1.05], ['crates', 0.9, 1.1], ['mossrock', 0.8, 0.95]], decor: ['pebbles'] },
  egouts: { block: [['pipe', 0.95, 1.15], ['pipe', 0.95, 1.15], ['crates', 0.9, 1.1], ['block', 0.8, 1]], decor: ['bones'] },
  cour: { block: [['stall', 0.95, 1.1], ['haystack', 0.9, 1.1], ['crates', 0.9, 1.1], ['barrels', 0.9, 1.05]], decor: ['flowers'] },
  coinBouftous: { block: [['autumnTree', 1.05, 1.25], ['autumnTree', 1.05, 1.25], ['hut', 1.0, 1.15], ['mossrock', 0.8, 1]], decor: ['flowers'] },
  coinBoos: { block: [['barn', 0.7, 0.8], ['barrels', 0.9, 1.05], ['haystack', 0.9, 1.05], ['fence', 1, 1.1], ['autumnTree', 1, 1.15]], decor: ['flowers'] },
  abords: { block: [['autumnTree', 1.05, 1.2], ['fence', 1, 1.1], ['crates', 0.9, 1.1], ['haystack', 0.9, 1.05]], decor: ['flowers'] },
  // Amakna, d'après les vraies cartes : prairie aux arbres d'automne et grosses bottes de foin ; Tofulailler (grange sombre, paille, caisses, tonneaux)
  ingalsse: { block: [['autumnTree', 1.05, 1.25], ['haystack', 1.0, 1.2], ['autumnTree', 1.05, 1.25], ['mossrock', 0.8, 1], ['fence', 1, 1.1]], decor: ['flowers'] },
  tofus: { block: [['haystack', 0.9, 1.1], ['crates', 0.9, 1.1], ['barrels', 0.9, 1.05], ['haystack', 0.9, 1.1]], decor: ['pebbles'] },
  // Plaine des Scarafeuilles : prairie, arbres d'automne, ruines de pierre, étals ; Donjon : grotte-jungle moussue
  plaineScara: { block: [['autumnTree', 1.05, 1.25], ['stall', 0.9, 1.05], ['mossrock', 0.85, 1.05], ['autumnTree', 1.05, 1.25], ['block', 0.8, 1]], decor: ['flowers'] },
  // Cimetière d'Amakna : îlots d'herbe dans un marais, tombes, arbres d'automne, lanternes ; Cryptes et Donjon : pierre, tombes, lanternes
  cimetiereAmakna: { block: [['tomb', 0.9, 1.05], ['autumnTree', 1.05, 1.25], ['tomb', 0.9, 1.05], ['lantern', 1, 1], ['mossrock', 0.85, 1]], decor: ['flowers'] },
  cryptes: { block: [['tomb', 0.9, 1.05], ['tomb', 0.9, 1.05], ['block', 0.85, 1.05], ['lantern', 1, 1]], decor: ['bones'] },
  squelettes: { block: [['tomb', 0.9, 1.05], ['block', 0.85, 1.05], ['deadtree', 1, 1.2], ['lantern', 1, 1]], decor: ['bones'] },
  maisonFantome: { block: [['crates', 0.9, 1.05], ['barrels', 0.9, 1.05], ['deadtree', 1, 1.15], ['lantern', 1, 1]], decor: ['bones'] },
  // Niveaux 41-50, d'après les vraies cartes : Craqueleurs (herbe sur falaises beiges, arbres d'automne), Nid du Kwakwa (dalles au-dessus des nuages),
  // Campement et Village des Bworks (herbe ocre, roches claires, huttes, arbres morts), Donjon des Bworks (souterrain sombre, caisses, ossements)
  craqueleurs: { block: [['quarry', 0.85, 1.05], ['autumnTree', 1.05, 1.25], ['mossrock', 0.85, 1.05], ['quarry', 0.85, 1.05], ['hut', 1.0, 1.1]], decor: ['flowers'] },
  nidKwakwa: { block: [['sandrock', 0.9, 1.1], ['autumnTree', 1.0, 1.2], ['mossrock', 0.85, 1.05], ['stone', 0.9, 1.1]], decor: ['pebbles'] },
  campementBworks: { block: [['hut', 1.0, 1.15], ['deadtree', 1, 1.2], ['quarry', 0.85, 1.05], ['crates', 0.9, 1.05], ['autumnTree', 1, 1.15]], decor: ['bones'] },
  villageBworks: { block: [['hut', 1.0, 1.15], ['barrels', 0.9, 1.05], ['quarry', 0.85, 1.05], ['deadtree', 1, 1.2], ['crates', 0.9, 1.05]], decor: ['bones'] },
  donjonBworks: { block: [['crates', 0.9, 1.05], ['barrels', 0.9, 1.05], ['block', 0.85, 1.05], ['lantern', 1, 1]], decor: ['bones'] },
  scaraDonjon: { block: [['mossrock', 0.9, 1.15], ['mossrock', 0.9, 1.15], ['block', 0.85, 1.05], ['stone', 0.9, 1.1]], decor: ['flowers'] },
};

/** Zone de la salle et formes à éviter pour poser un décor. */
export interface Room {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  /** Trous de vide et autres obstacles déjà posés. */
  holes: Obstacle[];
  /** Points de passage à laisser libres (ponts, départ du héros…). */
  keep: { x: number; y: number; r: number }[];
}

const flat = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, (ay - by) / 0.62);

/** Pose d'objets au hasard dans une salle d'île : jamais dans le vide, ni sur les passages, ni trop serrés. */
export function islandLayout(theme: Exclude<Theme, 'crypt'>, room: Room, rnd: () => number, blockers: number, extra: PropPlacement[] = []): PropPlacement[] {
  const P = ISLAND_PROPS[theme];
  const out: PropPlacement[] = [...extra];
  const free = (x: number, y: number, r: number, gap: number) =>
    room.holes.every((o) => flat(x, y, Math.max(o.x - o.hx, Math.min(o.x + o.hx, x)), o.y) > o.r + r + 60) && // le héros (44 px) passe toujours entre un trou et un objet
    room.keep.every((k) => flat(x, y, k.x, k.y) > k.r + r) &&
    out.every((p) => flat(x, y, p.x, p.y) > gap + (BLOCK[p.kind] ? BLOCK[p.kind] * (p.scale ?? 1) : 0)) &&
    !(Math.abs(x - 360) < 100 && y < room.y0 + 220); // allée de la sortie
  const place = (kind: PropKind, scale: number, gap: number) => {
    const r = BLOCK[kind] * scale;
    for (let t = 0; t < 120; t++) {
      const x = room.x0 + 30 + rnd() * (room.x1 - room.x0 - 60), y = room.y0 + 160 + rnd() * (room.y1 - room.y0 - 260);
      if (free(x, y, r, gap)) {
        out.push({ kind, x: Math.round(x), y: Math.round(y), scale: +scale.toFixed(2) });
        return;
      }
    }
  };
  // les objets défilent dans un ordre mélangé : pas trois fois le même dans une salle
  const order = P.block.map((x) => [rnd(), x] as const).sort((u, v) => u[0] - v[0]).map((u) => u[1]);
  for (let i = 0; i < blockers; i++) {
    const [kind, a, b] = order[i % order.length];
    place(kind, a + rnd() * (b - a), 150);
  }
  for (let i = 0; i < 4; i++) place(P.decor[Math.floor(rnd() * P.decor.length)], 1, 70);
  return out;
}

export function roomObstacles(layout: PropPlacement[]): Obstacle[] {
  const obs: Obstacle[] = [];
  for (const p of layout) {
    if (p.kind === 'sarcophagus') {
      // le sarcophage est long : une capsule horizontale
      obs.push({ x: p.x, y: p.y - 12, r: 44, hx: 70 });
    } else if (p.kind === 'fence') {
      // clôture : une capsule basse et longue
      obs.push({ x: p.x, y: p.y - 10, r: 16 * (p.scale ?? 1), hx: 42 * (p.scale ?? 1) });
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
