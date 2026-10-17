import { rng } from '../iso';
import { shade } from '../svg';
import { FLOOR_TOP, GATE_BARS_H, GATE_BARS_W, ROOM_H, ROOM_W } from './cryptRoom';

/**
 * Champs d'Incarnam — d'après les vraies cartes de Dofus 3 (rendus DofusDB, sous-zone 444) :
 * - herbe dorée et sèche, touffes ocre, petites fleurs jaunes et blanches ;
 * - pavés ronds de grès crème, gravures d'Incarnam (méandres et spirales) incrustées dans le sol ;
 * - l'île flotte : au fond et sur les côtés, la falaise plonge dans un ciel de nuit turquoise et violet,
 *   étoilé, avec des aurores, des constellations et des îlots flottants ;
 * - sortie : arche de grès gravée de symboles, fermée par une barrière de bois.
 * Même format que la Crypte (portrait, vue de dessus 3/4).
 */

const EDGE0 = 54; // bord de falaise sur les côtés
/** Bord de l'île pour la salle en cours (plus étroit dans un couloir). */
let EDGE = EDGE0;
import type { Theme } from '../game/data/areas';
import type { RoomShape } from '../game/shapes';

/** Palette d'une carte d'Incarnam (même île, autres couleurs et détails). */
interface Look {
  grass: [string, string, string];
  light: string;
  dark: string;
  tuftTones: [string, string, string];
  touch: [string, string];
  flowers: number;
  glyphs: boolean;
  cobbles: boolean;
  /** Dallage de pierre (Pâturages). */
  tiles: boolean;
  /** Pétales blancs tombés des arbres (Forêt). */
  petals: boolean;
  /** Nappes de brume (Cimetière). */
  fog: boolean;
  stone: string;
  cliff?: [string, string, string];
  void: [string, string, string, string];
  /** Carte terrestre (Astrub) : pas de vide, des haies ou des murs, des étangs à la place des trous. */
  land?: Land;
}

/** Astrub, d'après les vraies cartes : ciel de jour, collines, haies ou murs, étangs, sols variés. */
interface Land {
  sky: [string, string];
  hills: [string, string];
  /** Ce qu'on voit au fond : arbres, maisons de la Cité, granges, ou un mur (Souterrains). */
  far: 'trees' | 'houses' | 'barns' | 'wall' | 'dunes' | 'sea' | 'arena';
  /** Bordure des côtés et du fond : haie, mur de briques, rochers de grès, remparts de sable. */
  border: 'hedge' | 'wall' | 'rock' | 'sandwall' | 'shore';
  /** Couleur de la berge des étangs (sable sur la côte). */
  bank?: string;
  water: [string, string, string];
  /** Sol : place pavée (Cité), arène de planches en damier (Grange), dalles moussues (Souterrains). */
  floor?: 'plaza' | 'planks' | 'slabs';
  /** Carrés de blé et de tournesols, chemins de terre. */
  wheat: number;
  dirt: number;
  /** Herbe dessinée (touffes, touches) : 1 = partout. */
  grassy: number;
  arch: [string, string, string];
}
const LOOKS: Record<Exclude<Theme, 'crypt'>, Look> = {
  ...ASTRUB_LOOKS(),
  champs: { grass: ['#f2cf52', '#efc743', '#e8bb3a'], light: '#fbe08a', dark: '#c8962a', tuftTones: ['#c8962a', '#e3ad34', '#f8dc70'], touch: ['#ffe78a', '#d9a52e'], flowers: 60, glyphs: true, cobbles: true, tiles: false, petals: false, fog: false, stone: '#efe2b8', void: ['#155a66', '#1a3f66', '#2c2a6a', '#4a2a72'] },
  paturages: { grass: ['#f0cc4e', '#ebc040', '#e2b236'], light: '#fbe08a', dark: '#c08a26', tuftTones: ['#c08a26', '#e3ad34', '#f8dc70'], touch: ['#ffe78a', '#d9a52e'], flowers: 40, glyphs: true, cobbles: false, tiles: true, petals: false, fog: false, stone: '#efe2b8', void: ['#155a66', '#1a3f66', '#2c2a6a', '#4a2a72'] },
  foret: { grass: ['#eec84c', '#e6bb3e', '#d8a834'], light: '#f8dc80', dark: '#b88424', tuftTones: ['#b88424', '#dca632', '#f2d468'], touch: ['#fbe286', '#cf9a2a'], flowers: 30, glyphs: true, cobbles: true, tiles: false, petals: true, fog: false, stone: '#efe2b8', void: ['#14525e', '#183a60', '#2a2866', '#46286c'] },
  cimetiere: { grass: ['#8a7c44', '#74683a', '#5e5430'], light: '#a89a58', dark: '#3e3622', tuftTones: ['#5a4e2a', '#7a6c3a', '#9a8a4c'], touch: ['#a8986a', '#4a4228'], flowers: 0, glyphs: false, cobbles: true, tiles: false, petals: false, fog: true, stone: '#a8a494', cliff: ['#7a7062', '#4e463c', '#2a2420'], void: ['#0e3a48', '#14304e', '#1e2448', '#2a2040'] },
};
let L: Look = LOOKS.champs;

function ASTRUB_LOOKS(): Record<'cite' | 'souterrains' | 'champsAstrub' | 'prairies' | 'grange' | 'lisiere' | 'dunes' | 'calanques' | 'plage' | 'chateau', Look> {
  const base = { flowers: 0, glyphs: false, cobbles: false, tiles: false, petals: false, fog: false, stone: '#d8d0bc', void: ['#7ac8f0', '#7ac8f0', '#7ac8f0', '#7ac8f0'] as [string, string, string, string] };
  const green = { grass: ['#8ccc4a', '#7cbc3e', '#6aa834'] as [string, string, string], light: '#b0e070', dark: '#4e8a2a', tuftTones: ['#4e8a2a', '#6aaa34', '#a0d860'] as [string, string, string], touch: ['#b8e878', '#5a9a2e'] as [string, string] };
  const sky: [string, string] = ['#6ab8ec', '#d8f0fa'];
  const water: [string, string, string] = ['#7ad0e8', '#3a98c8', '#2a6a9a'];
  const sea: [string, string, string] = ['#a8f0e8', '#4ac8d0', '#2a90b0'];
  // sable doré de la côte : touffes d'oyat vertes, touches claires
  const sand = { grass: ['#f2d88a', '#ecce7a', '#e2c068'] as [string, string, string], light: '#fbeab0', dark: '#c8a050', tuftTones: ['#7aa83a', '#9ac04a', '#c8b05a'] as [string, string, string], touch: ['#fff0c0', '#d8b460'] as [string, string] };
  return {
    cite: { ...base, ...green, flowers: 20, land: { sky, hills: ['#8ac850', '#6aa83a'], far: 'houses', border: 'hedge', water, floor: 'plaza', wheat: 0, dirt: 0, grassy: 0.35, arch: ['#f0ece0', '#b8b0a0', '#6a6458'] } },
    prairies: { ...base, ...green, flowers: 50, land: { sky, hills: ['#9ad058', '#78b444'], far: 'trees', border: 'hedge', water, wheat: 0, dirt: 5, grassy: 1, arch: ['#e8c890', '#a87a40', '#5a3a1a'] } },
    champsAstrub: { ...base, ...green, grass: ['#a6cc48', '#98c040', '#88b036'], flowers: 30, land: { sky, hills: ['#a8cc58', '#88b444'], far: 'barns', border: 'hedge', water, wheat: 7, dirt: 2, grassy: 0.9, arch: ['#e8c890', '#a87a40', '#5a3a1a'] } },
    grange: { ...base, ...green, flowers: 10, land: { sky, hills: ['#a8cc58', '#88b444'], far: 'barns', border: 'hedge', water, floor: 'planks', wheat: 6, dirt: 0, grassy: 0.6, arch: ['#e8c890', '#a87a40', '#5a3a1a'] } },
    lisiere: { ...base, ...green, grass: ['#a8cc50', '#9ac046', '#8cb43c'], flowers: 40, land: { sky, hills: ['#a8cc58', '#e8d08a'], far: 'trees', border: 'hedge', water: sea, bank: '#e8cc88', wheat: 3, dirt: 6, grassy: 0.9, arch: ['#e8c890', '#a87a40', '#5a3a1a'] } },
    dunes: { ...base, ...sand, flowers: 0, land: { sky, hills: ['#f4dc98', '#e8c87a'], far: 'dunes', border: 'rock', water: sea, bank: '#f4e0a8', wheat: 0, dirt: 0, grassy: 0.35, arch: ['#f4e0b0', '#c8a868', '#6a4a1a'] } },
    calanques: { ...base, ...sand, flowers: 0, land: { sky, hills: ['#f4dc98', '#e8c87a'], far: 'sea', border: 'rock', water: sea, bank: '#f4e0a8', wheat: 0, dirt: 0, grassy: 0.2, arch: ['#f4e0b0', '#c8a868', '#6a4a1a'] } },
    plage: { ...base, ...sand, grass: ['#f6e2a0', '#f0d890', '#e8cc80'], flowers: 0, land: { sky, hills: ['#f4dc98', '#e8c87a'], far: 'sea', border: 'shore', water: sea, bank: '#f8e8b8', wheat: 0, dirt: 0, grassy: 0.1, arch: ['#f4e0b0', '#c8a868', '#6a4a1a'] } },
    chateau: { ...base, ...sand, grass: ['#f2d68a', '#ecce7c', '#e2c06c'], flowers: 0, land: { sky, hills: ['#f0d488', '#e0c070'], far: 'arena', border: 'sandwall', water: sea, bank: '#f4e0a8', wheat: 0, dirt: 0, grassy: 0, arch: ['#f8e4b0', '#d0ac60', '#7a5a1a'] } },
    souterrains: { ...base, grass: ['#5e6656', '#545c4c', '#4a5042'], light: '#727a62', dark: '#363c30', tuftTones: ['#3e5a2a', '#4e6e32', '#6a8a3e'], touch: ['#6e7a5a', '#3a4034'], stone: '#8a8c7c', cliff: ['#5a5a50', '#3e3e36', '#24241e'], land: { sky: ['#1e221c', '#2e342a'], hills: ['#3a4032', '#2a3024'], far: 'wall', border: 'wall', water: ['#5a7a4a', '#3e5a34', '#24381e'], floor: 'slabs', wheat: 0, dirt: 0, grassy: 0.25, arch: ['#9a9a88', '#5e5e52', '#2a2a24'] } },
  };
}

const OCHRE = '#a8761e';
const STONE_DARK = '#c2ad78';
const STONE_INK = '#8a7448';
const GLYPH = '#fbf2d4';

const f1 = (n: number) => n.toFixed(1);

/* ---------- Ciel de nuit d'Incarnam (au-delà de la falaise) ---------- */

function voidSky(r: () => number): string {
  const o: string[] = [];
  o.push(`<rect x="0" y="0" width="${ROOM_W}" height="${ROOM_H}" fill="url(#voidG)"/>`);
  // aurores
  for (const [x, w, c] of [[140, 160, '#3fe0c0'], [420, 220, '#7a6aff'], [640, 140, '#3fd8e0']] as const) {
    o.push(`<path d="M${x - w / 2},0 Q${x},${FLOOR_TOP * 0.6} ${x + w / 3},${FLOOR_TOP + 40} L${x + w / 3 + 40},${FLOOR_TOP + 40} Q${x + 40},${FLOOR_TOP * 0.5} ${x + w / 2},0 Z" fill="${c}" opacity="0.16" filter="url(#blur8)"/>`);
  }
  // étoiles
  for (let k = 0; k < 90; k++) {
    const x = r() * ROOM_W, y = r() * ROOM_H, s = 0.6 + r() * 1.6;
    o.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(s)}" fill="#ffffff" opacity="${(0.35 + r() * 0.6).toFixed(2)}"/>`);
  }
  // constellation (comme sur les cartes d'Incarnam)
  const pts: [number, number][] = [[470, 60], [520, 96], [578, 84], [612, 130], [560, 168], [500, 150]];
  o.push(`<path d="${pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')} Z" fill="none" stroke="#bff6ff" stroke-width="1.3" stroke-dasharray="3 4" opacity="0.45"/>`);
  for (const [x, y] of pts) o.push(`<circle cx="${x}" cy="${y}" r="3" fill="#e8fdff" opacity="0.85"/>`);
  // îlots flottants : dessus doré, falaise de grès
  for (const [x, y, s] of [[96, 150, 0.9], [640, 210, 0.6], [300, 70, 0.45]] as const) {
    o.push(`<g transform="translate(${x},${y}) scale(${s})">
      <path d="M-56,0 Q-40,-10 0,-12 Q44,-10 58,0 Q46,24 24,48 Q8,72 -2,84 Q-14,60 -32,34 Q-48,16 -56,0 Z" fill="${STONE_DARK}" stroke="${STONE_INK}" stroke-width="2.6"/>
      <path d="M-30,12 Q-10,30 -4,60 M20,10 Q14,32 6,58" fill="none" stroke="${STONE_INK}" stroke-width="1.6" opacity="0.6"/>
      <path d="M-56,0 Q-40,-12 0,-14 Q44,-12 58,0 Q30,8 0,6 Q-30,8 -56,0 Z" fill="${L.grass[1]}" stroke="${OCHRE}" stroke-width="2.4"/>
    </g>`);
  }
  return o.join('\n');
}

/** Bord de falaise (contour d'herbe dorée qui surplombe la roche), le long d'une ligne. */
function cliffRim(points: [number, number][], drop: number, dir: 'down' | 'left' | 'right'): string {
  const o: string[] = [];
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${f1(p[0])},${f1(p[1])}`).join(' ');
  // face de la roche
  const off = (p: [number, number]): [number, number] => dir === 'down' ? [p[0], p[1] + drop] : dir === 'left' ? [p[0] - drop, p[1] + drop * 0.3] : [p[0] + drop, p[1] + drop * 0.3];
  const face = [...points, ...[...points].reverse().map(off)];
  if (drop === 0) {
    // bord du fond : on ne voit que le liseré d'herbe contre le ciel
    o.push(`<path d="${d}" fill="none" stroke="${OCHRE}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>`);
    o.push(`<path d="${d}" fill="none" stroke="${L.grass[1]}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`);
    return o.join('\n');
  }
  o.push(`<path d="${face.map((p, i) => `${i ? 'L' : 'M'}${f1(p[0])},${f1(p[1])}`).join(' ')} Z" fill="url(#cliffG)" stroke="${STONE_INK}" stroke-width="2.4" stroke-linejoin="round"/>`);
  // strates
  for (let k = 1; k < 4; k++) {
    const q = points.map((p) => { const [x, y] = off(p); return [p[0] + (x - p[0]) * k / 4, p[1] + (y - p[1]) * k / 4] as [number, number]; });
    o.push(`<path d="${q.map((p, i) => `${i ? 'L' : 'M'}${f1(p[0])},${f1(p[1])}`).join(' ')}" fill="none" stroke="${STONE_INK}" stroke-width="1.4" opacity="0.45"/>`);
  }
  // brume au pied
  o.push(`<path d="${points.map(off).map((p, i) => `${i ? 'L' : 'M'}${f1(p[0])},${f1(p[1])}`).join(' ')}" fill="none" stroke="#dff6ff" stroke-width="26" opacity="0.35" filter="url(#blur8)"/>`);
  // liseré d'herbe dorée qui déborde un peu sur le vide
  o.push(`<path d="${d}" fill="none" stroke="${OCHRE}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>`);
  o.push(`<path d="${d}" fill="none" stroke="${L.grass[1]}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`);
  for (let i = 0; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const sx = dir === 'left' ? -1 : 1;
    o.push(`<path d="M${f1(x)},${f1(y + 14)} q${f1(sx * 6)},-8 ${f1(sx * 12)},-4 M${f1(x)},${f1(y + 30)} q${f1(sx * 5)},-6 ${f1(sx * 10)},-2" fill="none" stroke="${L.grass[1]}" stroke-width="4" stroke-linecap="round"/>`);
  }
  return o.join('\n');
}

/* ---------- Sol ---------- */

/** Gravure d'Incarnam : méandre ou spirale en relief clair, incrusté dans le sol. */
function glyph(x: number, y: number, s: number, kind: number): string {
  const paths = [
    'M0,0 h22 v-10 h-12 v-8 h26 v18 h12',
    'M0,0 q0,-14 14,-14 q12,0 12,10 q0,8 -8,8 q-6,0 -6,-6',
    'M0,0 h10 v-12 h16 v12 h10 M18,-12 v-8',
    'M0,0 h34 M8,0 v-10 h18 v10',
  ];
  const d = paths[kind % paths.length];
  return `<g transform="translate(${f1(x)},${f1(y)}) scale(${s},${f1(s * 0.62)})"><path d="${d}" fill="none" stroke="${STONE_INK}" stroke-width="6.5" stroke-linecap="square" opacity="0.35"/><path d="${d}" fill="none" stroke="${GLYPH}" stroke-width="3.6" stroke-linecap="square"/></g>`;
}

function ground(r: () => number): string {
  const o: string[] = [];
  const x0 = EDGE, x1 = ROOM_W - EDGE, y0 = FLOOR_TOP, y1 = ROOM_H;
  o.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#grassG)"/>`);
  // nappes plus claires / plus sombres
  for (let k = 0; k < 24; k++) {
    const cx = x0 + r() * (x1 - x0), cy = y0 + r() * (y1 - y0), R = 40 + r() * 80;
    o.push(`<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(R * 1.5)}" ry="${f1(R * 0.8)}" fill="${r() < 0.55 ? L.light : L.dark}" opacity="${(0.18 + r() * 0.2).toFixed(2)}" filter="url(#soft)"/>`);
  }
  // dallage de pierre claire en damier (Pâturages)
  if (L.tiles) {
    const cx = ROOM_W / 2 + (r() - 0.5) * 120, cy = y0 + 420 + r() * 380, n = 4, w = 58, h = 34;
    for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
      if (Math.abs(i) + Math.abs(j) > n + 1 || r() < 0.18) continue;
      const px = cx + (i - j) * w * 0.5, py = cy + (i + j) * h * 0.5;
      o.push(`<path d="M${f1(px)},${f1(py - h / 2)} L${f1(px + w / 2)},${f1(py)} L${f1(px)},${f1(py + h / 2)} L${f1(px - w / 2)},${f1(py)} Z" fill="${shade(L.stone, (i + j) % 2 ? -0.04 : 0.04)}" stroke="${STONE_DARK}" stroke-width="1.4" opacity="0.92"/>`);
    }
  }
  if (L.land) o.push(landFloor(L.land, r));
  // gravures dans l'herbe
  if (L.glyphs) for (let k = 0; k < 12; k++) o.push(glyph(x0 + 30 + r() * (x1 - x0 - 140), y0 + 80 + r() * (y1 - y0 - 160), 2.2 + r() * 1.2, Math.floor(r() * 4)));
  // chemin de pavés ronds en grès crème, du bas jusqu'à l'arche
  const spine: [number, number][] = [];
  if (L.cobbles) for (let y = ROOM_H + 30, i = 0; y > FLOOR_TOP - 10; y -= 100, i++) spine.push([ROOM_W / 2 + Math.sin(i * 1.1 + r() * 0.6) * 60 * Math.min(1, (y - FLOOR_TOP) / 300), y]);
  for (let i = 0; i < spine.length - 1; i++) {
    const [ax, ay] = spine[i], [bx, by] = spine[i + 1];
    if (i % 3 === 1) continue; // l'herbe reprend par endroits
    for (let t = 0; t < 1; t += 0.32) {
      const cx = ax + (bx - ax) * t, cy = ay + (by - ay) * t;
      for (let j = -1.5; j <= 1.5; j += 1) {
        if (r() < 0.3) continue;
        const px = cx + j * 38 + (r() - 0.5) * 14, py = cy + (r() - 0.5) * 16, w = 24 + r() * 12, h = 15 + r() * 7;
        o.push(`<ellipse cx="${f1(px)}" cy="${f1(py + 3)}" rx="${f1(w)}" ry="${f1(h)}" fill="${STONE_INK}" opacity="0.35"/>`);
        o.push(`<ellipse cx="${f1(px)}" cy="${f1(py)}" rx="${f1(w)}" ry="${f1(h)}" fill="${shade(L.stone, (r() - 0.5) * 0.12)}" stroke="${STONE_DARK}" stroke-width="1.6"/>`);
        o.push(`<ellipse cx="${f1(px - w * 0.25)}" cy="${f1(py - h * 0.35)}" rx="${f1(w * 0.45)}" ry="${f1(h * 0.3)}" fill="#fffaf0" opacity="0.4"/>`);
      }
    }
  }
  // texture d'herbe : petites touches claires et sombres, puis touffes dorées
  for (let k = 0; k < 700 * (L.land?.grassy ?? 1); k++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), w = 4 + r() * 7;
    o.push(`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w)}" ry="${f1(w * 0.45)}" fill="${r() < 0.5 ? L.touch[0] : L.touch[1]}" opacity="${(0.35 + r() * 0.35).toFixed(2)}"/>`);
  }
  for (let k = 0; k < 170 * (L.land?.grassy ?? 1); k++) {
    const x = x0 + r() * (x1 - x0), y = y0 + 10 + r() * (y1 - y0 - 10), h = 10 + r() * 14;
    const c = r() < 0.3 ? L.tuftTones[0] : r() < 0.6 ? L.tuftTones[1] : L.tuftTones[2];
    o.push(`<path d="M${f1(x - 5)},${f1(y)} q1,${f1(-h * 0.6)} -2,${f1(-h)} M${f1(x)},${f1(y)} q1,${f1(-h * 0.8)} 3,${f1(-h * 1.2)} M${f1(x + 5)},${f1(y)} q-1,${f1(-h * 0.5)} 3,${f1(-h * 0.9)}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`);
  }
  // petites fleurs jaunes en bouquets, et quelques blanches
  for (let k = 0; k < L.flowers; k++) {
    const x = x0 + 20 + r() * (x1 - x0 - 40), y = y0 + 30 + r() * (y1 - y0 - 40);
    const white = r() < 0.25;
    for (let j = 0; j < (white ? 1 : 4); j++) {
      const fx = x + (r() - 0.5) * 16, fy = y + (r() - 0.5) * 10;
      o.push(`<circle cx="${f1(fx)}" cy="${f1(fy)}" r="${white ? 3.2 : 2.6}" fill="${white ? '#ffffff' : '#ffe23a'}" stroke="${white ? '#c9c2a8' : OCHRE}" stroke-width="0.8"/>`);
    }
  }
  // pétales blancs et bleu pâle tombés des arbres (Forêt)
  if (L.petals) for (let k = 0; k < 140; k++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
    o.push(`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="3.4" ry="2.2" transform="rotate(${Math.floor(r() * 180)},${f1(x)},${f1(y)})" fill="${r() < 0.3 ? '#bfe2f2' : '#fbfbf6'}" opacity="0.85"/>`);
  }
  // nappes de brume qui traînent au sol (Cimetière)
  if (L.fog) for (let k = 0; k < 9; k++) {
    const x = x0 + r() * (x1 - x0), y = y0 + 80 + r() * (y1 - y0 - 80), w = 120 + r() * 160;
    o.push(`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w)}" ry="${f1(w * 0.22)}" fill="#e8f0f0" opacity="${(0.14 + r() * 0.12).toFixed(2)}" filter="url(#soft)"/>`);
  }
  o.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#000" filter="url(#grain)" opacity="0.06"/>`);
  return o.join('\n');
}

/** Arche de grès gravée, au fond : la sortie. L'ouverture est lumineuse, la barrière s'ouvre à part. */
function exitArch(): string {
  const u = ROOM_W / 2, b = FLOOR_TOP;
  const o: string[] = [];
  o.push(`<path d="M${u - 70},${b} L${u - 70},${b - 120} Q${u},${b - 196} ${u + 70},${b - 120} L${u + 70},${b} Z" fill="url(#archLight)"/>`);
  // blocs de l'arche
  const blocks = 11;
  for (let i = 0; i < blocks; i++) {
    const a0 = Math.PI * (1 - i / blocks), a1 = Math.PI * (1 - (i + 1) / blocks);
    const pt = (a: number, R: number) => [u + Math.cos(a) * R, b - 120 - Math.sin(a) * R * 0.95] as const;
    const legs = (a: number) => (a > Math.PI * 0.92 || a < Math.PI * 0.08);
    const [ax, ay] = pt(a0, 76), [bx, by] = pt(a1, 76), [cx, cy] = pt(a1, 106), [dx, dy] = pt(a0, 106);
    o.push(`<path d="M${f1(ax)},${f1(ay)} L${f1(bx)},${f1(by)} L${f1(cx)},${f1(cy)} L${f1(dx)},${f1(dy)} Z" fill="url(#archStone)" stroke="${STONE_INK}" stroke-width="2.6" stroke-linejoin="round"/>`);
    if (!legs(a0) && i % 2 === 0) {
      const mx = (ax + cx) / 2, my = (ay + cy) / 2;
      o.push(`<path d="M${f1(mx - 6)},${f1(my)} h12 M${f1(mx)},${f1(my - 6)} v12" stroke="#8a6a3a" stroke-width="2.4" opacity="0.7"/>`);
    }
  }
  // piliers gravés
  for (const side of [-1, 1]) {
    const x = u + side * 91;
    o.push(`<rect x="${x - 16}" y="${b - 122}" width="32" height="124" rx="6" fill="url(#archStone)" stroke="${STONE_INK}" stroke-width="2.6"/>`);
    for (let k = 0; k < 3; k++) o.push(`<rect x="${x - 16}" y="${b - 122 + k * 41}" width="32" height="41" rx="4" fill="none" stroke="${STONE_INK}" stroke-width="1.6"/>`);
    o.push(`<path d="M${x - 7},${b - 104} h14 v8 h-10 v8 h10 M${x - 8},${b - 60} q0,-8 8,-8 q7,0 7,6 q0,5 -5,5 M${x - 6},${b - 22} h12 v10 h-12 Z" fill="none" stroke="#7a5a2e" stroke-width="2.4"/>`);
  }
  return o.join('\n');
}

/** Trous de vide dans l'île : ciel de nuit au fond, paroi de falaise sur le bord du fond, liseré d'herbe, brume. */
function holesSvg(shape: RoomShape, r: () => number): string {
  const o: string[] = [];
  const P = 0.62;
  o.push(`<clipPath id="island"><rect x="${EDGE}" y="${FLOOR_TOP - 6}" width="${ROOM_W - 2 * EDGE}" height="${ROOM_H}"/></clipPath>`);
  shape.holes.forEach((h, i) => {
    const ry = h.r * P;
    const stadium = (dy = 0) => `M${f1(h.x - h.hx)},${f1(h.y - ry + dy)} L${f1(h.x + h.hx)},${f1(h.y - ry + dy)} A${f1(h.r)},${f1(ry)} 0 0 1 ${f1(h.x + h.hx)},${f1(h.y + ry + dy)} L${f1(h.x - h.hx)},${f1(h.y + ry + dy)} A${f1(h.r)},${f1(ry)} 0 0 1 ${f1(h.x - h.hx)},${f1(h.y - ry + dy)} Z`;
    const id = `hole${i}`;
    o.push(`<clipPath id="${id}"><path d="${stadium()}"/></clipPath>`);
    o.push(`<g clip-path="url(#island)"><g clip-path="url(#${id})">`);
    // paroi du fond (roche), puis le vide en dessous
    o.push(`<path d="${stadium()}" fill="url(#cliffG)"/>`);
    o.push(`<path d="${stadium(Math.min(60, ry * 0.7))}" fill="url(#voidG)"/>`);
    for (let k = 0; k < 14; k++) {
      const x = h.x - h.hx - h.r + r() * (2 * (h.hx + h.r)), y = h.y - ry * 0.2 + r() * ry * 1.2;
      o.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(0.6 + r() * 1.4)}" fill="#fff" opacity="${(0.4 + r() * 0.5).toFixed(2)}"/>`);
    }
    o.push(`<ellipse cx="${f1(h.x)}" cy="${f1(h.y + ry * 0.5)}" rx="${f1(h.hx + h.r)}" ry="${f1(ry * 0.4)}" fill="#dff6ff" opacity="0.22" filter="url(#blur8)"/>`);
    o.push(`</g>`);
    // liseré d'herbe qui surplombe le vide
    o.push(`<path d="${stadium()}" fill="none" stroke="${OCHRE}" stroke-width="13"/><path d="${stadium()}" fill="none" stroke="${L.grass[1]}" stroke-width="8"/>`);
    o.push(`</g>`);
  });
  // ponts de corde sur les bandes de vide
  for (const b of shape.bands) {
    const x0 = b.gapX - b.gapHalf - 6, x1 = b.gapX + b.gapHalf + 6, y0 = b.y - b.half - 14, y1 = b.y + b.half + 14;
    for (let y = y0; y < y1; y += 15) {
      o.push(`<rect x="${f1(x0 + (r() - 0.5) * 3)}" y="${f1(y)}" width="${f1(x1 - x0)}" height="11" rx="2" fill="${shade('#a8743e', (r() - 0.5) * 0.2)}" stroke="#4a2e14" stroke-width="1.8"/>`);
    }
    for (const x of [x0 - 2, x1 + 2]) {
      o.push(`<path d="M${f1(x)},${f1(y0 - 4)} Q${f1(x)},${f1(b.y + 10)} ${f1(x)},${f1(y1 + 4)}" fill="none" stroke="#5a3a1a" stroke-width="4"/>`);
      for (const y of [y0 - 10, y1 + 2]) o.push(`<rect x="${f1(x - 5)}" y="${f1(y - 14)}" width="10" height="24" rx="2" fill="#8a5a2e" stroke="#3a220c" stroke-width="2"/>`);
    }
  }
  return o.join('\n');
}


/* ---------- Astrub : cartes terrestres ---------- */

/** Fond au-delà de la haie : ciel de jour, collines, et selon la carte des arbres, des maisons ou des granges. */
function landBackdrop(D: Land, r: () => number): string {
  const o: string[] = [];
  if (D.far === 'wall') {
    // Souterrains : voûte de briques sombres, tuyaux de cuivre, mousse
    o.push(`<rect x="0" y="0" width="${ROOM_W}" height="${FLOOR_TOP + 10}" fill="${D.sky[0]}"/>`);
    for (let y = 0, row = 0; y < FLOOR_TOP; y += 26, row++) for (let x = row % 2 ? -30 : 0; x < ROOM_W; x += 60) {
      o.push(`<rect x="${x + 2}" y="${y + 2}" width="56" height="22" rx="3" fill="${shade(D.hills[0], (r() - 0.5) * 0.25)}" stroke="#14160f" stroke-width="2"/>`);
    }
    for (const x of [90, 250, 470, 630]) {
      o.push(`<rect x="${x - 14}" y="0" width="28" height="${FLOOR_TOP}" fill="#8a5a2a" stroke="#2a1a0a" stroke-width="3"/><rect x="${x - 8}" y="0" width="6" height="${FLOOR_TOP}" fill="#c08a4a" opacity="0.6"/>`);
      for (const y of [60, 180]) o.push(`<rect x="${x - 20}" y="${y}" width="40" height="12" rx="3" fill="#6a4020" stroke="#2a1a0a" stroke-width="2"/>`);
    }
    for (let k = 0; k < 30; k++) o.push(`<ellipse cx="${f1(r() * ROOM_W)}" cy="${f1(FLOOR_TOP - r() * 120)}" rx="${f1(10 + r() * 20)}" ry="${f1(5 + r() * 6)}" fill="#4e7a2e" opacity="${(0.4 + r() * 0.3).toFixed(2)}"/>`);
    o.push(`<rect x="0" y="${FLOOR_TOP - 60}" width="${ROOM_W}" height="70" fill="#000" opacity="0.25" filter="url(#soft)"/>`);
    return o.join('\n');
  }
  o.push(`<rect x="0" y="0" width="${ROOM_W}" height="${FLOOR_TOP + 10}" fill="url(#skyG)"/>`);
  for (let k = 0; k < 4; k++) {
    const x = r() * ROOM_W, y = 30 + r() * 90, w = 60 + r() * 70;
    o.push(`<g opacity="0.9">${[0, 1, 2].map((i) => `<ellipse cx="${f1(x + (i - 1) * w * 0.5)}" cy="${f1(y - (i === 1 ? 12 : 0))}" rx="${f1(w * 0.5)}" ry="${f1(w * 0.28)}" fill="#ffffff"/>`).join('')}</g>`);
  }
  if (D.far === 'sea') {
    // mer turquoise jusqu'à l'horizon, vagues blanches, îlot rocheux
    o.push(`<rect x="0" y="${FLOOR_TOP - 150}" width="${ROOM_W}" height="160" fill="url(#seaG)"/>`);
    for (let k = 0; k < 16; k++) {
      const x = r() * ROOM_W, y = FLOOR_TOP - 140 + r() * 130, w = 14 + r() * 26;
      o.push(`<path d="M${f1(x - w)},${f1(y)} q${f1(w / 2)},-4 ${f1(w)},0 q${f1(w / 2)},4 ${f1(w)},0" fill="none" stroke="#e8ffff" stroke-width="2" opacity="${(0.4 + r() * 0.4).toFixed(2)}"/>`);
    }
    o.push(`<path d="M520,${FLOOR_TOP - 118} Q540,${FLOOR_TOP - 160} 572,${FLOOR_TOP - 150} Q600,${FLOOR_TOP - 140} 612,${FLOOR_TOP - 118} Z" fill="#d8b878" stroke="#8a6a3a" stroke-width="2"/>`);
    o.push(`<path d="M0,${FLOOR_TOP - 6} Q180,${FLOOR_TOP - 22} 360,${FLOOR_TOP - 10} Q540,${FLOOR_TOP} ${ROOM_W},${FLOOR_TOP - 16} V${FLOOR_TOP + 10} H0 Z" fill="#f8f4e0" opacity="0.85"/>`);
    return o.join('\n');
  }
  if (D.far === 'arena') {
    // arène du Château Ensablé : arches de sable sous le ciel
    o.push(`<rect x="0" y="${FLOOR_TOP - 130}" width="${ROOM_W}" height="140" fill="#e8c878"/>`);
    for (let x = 0; x < ROOM_W; x += 80) {
      o.push(`<path d="M${x + 10},${FLOOR_TOP - 20} L${x + 10},${FLOOR_TOP - 92} Q${x + 40},${FLOOR_TOP - 130} ${x + 70},${FLOOR_TOP - 92} L${x + 70},${FLOOR_TOP - 20} Z" fill="url(#skyG)" stroke="#a8844a" stroke-width="2.4"/>`);
    }
    o.push(`<rect x="0" y="${FLOOR_TOP - 138}" width="${ROOM_W}" height="14" fill="#f4dc98" stroke="#a8844a" stroke-width="2"/>`);
    for (let x = 6; x < ROOM_W; x += 30) o.push(`<rect x="${x}" y="${FLOOR_TOP - 152}" width="16" height="16" fill="#f4dc98" stroke="#a8844a" stroke-width="2"/>`);
    o.push(`<rect x="0" y="${FLOOR_TOP - 22}" width="${ROOM_W}" height="32" fill="#e8c878"/>`);
    return o.join('\n');
  }
  // collines au loin
  o.push(`<path d="M0,${FLOOR_TOP - 90} Q160,${FLOOR_TOP - 170} 330,${FLOOR_TOP - 110} Q500,${FLOOR_TOP - 190} ${ROOM_W},${FLOOR_TOP - 120} V${FLOOR_TOP + 10} H0 Z" fill="${D.hills[0]}" opacity="0.75"/>`);
  o.push(`<path d="M0,${FLOOR_TOP - 50} Q200,${FLOOR_TOP - 110} 380,${FLOOR_TOP - 60} Q560,${FLOOR_TOP - 100} ${ROOM_W},${FLOOR_TOP - 60} V${FLOOR_TOP + 10} H0 Z" fill="${D.hills[1]}"/>`);
  const roof = (x: number, w: number, h: number, c: string, dark: string) =>
    `<rect x="${f1(x - w * 0.42)}" y="${f1(FLOOR_TOP - 34 - h * 0.55)}" width="${f1(w * 0.84)}" height="${f1(h * 0.55 + 20)}" fill="#efe2c4" stroke="#5a4028" stroke-width="2"/>` +
    `<path d="M${f1(x - w / 2)},${f1(FLOOR_TOP - 30 - h * 0.5)} Q${f1(x - w / 2)},${f1(FLOOR_TOP - 34 - h * 1.1)} ${f1(x)},${f1(FLOOR_TOP - 36 - h * 1.15)} Q${f1(x + w / 2)},${f1(FLOOR_TOP - 34 - h * 1.1)} ${f1(x + w / 2)},${f1(FLOOR_TOP - 30 - h * 0.5)} Z" fill="${c}" stroke="${dark}" stroke-width="2.4"/>`;
  if (D.far === 'houses') for (let x = 40; x < ROOM_W; x += 100 + r() * 30) o.push(roof(x, 80 + r() * 30, 60 + r() * 40, r() < 0.7 ? '#4a7ab8' : '#c85a3a', '#22344e'));
  if (D.far === 'barns') for (let x = 60; x < ROOM_W; x += 190 + r() * 60) o.push(roof(x, 110 + r() * 30, 70 + r() * 30, '#e8783a', '#7a3010'));
  // rangée d'arbres ronds (verts et dorés : l'automne d'Astrub)
  if (D.far === 'dunes') {
    for (const x of [90, 300, 560]) o.push(`<path d="M${x},${FLOOR_TOP - 30} q-10,-60 6,-90 M${x},${FLOOR_TOP - 90} q-30,-6 -44,6 M${x},${FLOOR_TOP - 90} q30,-12 46,2 M${x},${FLOOR_TOP - 90} q-12,-24 -34,-28 M${x},${FLOOR_TOP - 90} q16,-24 38,-24" fill="none" stroke="#3a7a22" stroke-width="7" stroke-linecap="round"/>`);
    return o.join('\n');
  }
  for (let x = -20; x < ROOM_W + 20; x += 36 + r() * 30) {
    if (D.far !== 'trees' && r() < 0.5) continue;
    const y = FLOOR_TOP - 40 - r() * 30, R = 22 + r() * 18, c = r() < 0.25 ? '#e8902a' : r() < 0.5 ? '#9ac83a' : '#6aa834';
    o.push(`<rect x="${f1(x - 4)}" y="${f1(y)}" width="8" height="40" fill="#6a4020"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(R + 2)}" fill="#2a3a10"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(R)}" fill="${c}"/><circle cx="${f1(x - R * 0.3)}" cy="${f1(y - R * 0.35)}" r="${f1(R * 0.4)}" fill="#fff" opacity="0.2"/>`);
  }
  return o.join('\n');
}

/** Haie (boules de feuillage sombre) ou mur de briques le long d'une ligne de points. */
function landBorder(D: Land, pts: [number, number][], r: () => number, width: number): string {
  const o: string[] = [];
  if (D.border === 'shore') {
    // la plage descend dans la mer sur les côtés : eau turquoise, écume, quelques galets
    // au fond, la mer est déjà dessinée : juste l'écume au bord du sable
    if (Math.abs(pts[pts.length - 1][0] - pts[0][0]) > 200) {
      return `<path d="${pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)},${f1(y - 6)}`).join(' ')}" fill="none" stroke="#fffaf0" stroke-width="6" stroke-linecap="round" opacity="0.8"/>`;
    }
    const left = pts[0][0] < ROOM_W / 2;
    const edge = pts.map(([x, y]) => [x + (left ? width * 0.35 : -width * 0.35) + (r() - 0.5) * 10, y] as [number, number]);
    const outer = left ? -10 : ROOM_W + 10;
    const d = `M${outer},${FLOOR_TOP - 20} ` + edge.map(([x, y]) => `L${f1(x)},${f1(y)}`).join(' ') + ` L${outer},${ROOM_H + 40} Z`;
    o.push(`<path d="${d}" fill="url(#seaSide)"/>`);
    o.push(`<path d="${edge.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)},${f1(y)}`).join(' ')}" fill="none" stroke="#fffaf0" stroke-width="7" stroke-linejoin="round" opacity="0.85"/>`);
    o.push(`<path d="${edge.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x + (left ? -14 : 14))},${f1(y)}`).join(' ')}" fill="none" stroke="#e8ffff" stroke-width="2.4" stroke-dasharray="16 12" opacity="0.7"/>`);
    return o.join('\n');
  }
  if (D.border === 'rock' || D.border === 'sandwall') {
    const wall = D.border === 'sandwall';
    for (const [x, y] of pts) {
      const w = width * (0.9 + r() * 0.3), h = wall ? 60 : 44 + r() * 26;
      if (wall) {
        o.push(`<rect x="${f1(x - w / 2)}" y="${f1(y - h + 20)}" width="${f1(w)}" height="${f1(h)}" fill="${shade('#ecd08a', (r() - 0.5) * 0.08)}" stroke="#8a6a2a" stroke-width="2.4"/>`);
        o.push(`<path d="M${f1(x - w / 2)},${f1(y - h + 20)} v-10 h${f1(w / 4)} v10 h${f1(w / 4)} v-10 h${f1(w / 4)} v10" fill="#f4dc9a" stroke="#8a6a2a" stroke-width="2"/>`);
      } else {
        o.push(`<path d="M${f1(x - w / 2)},${f1(y + 18)} Q${f1(x - w / 2 - 4)},${f1(y - h * 0.6)} ${f1(x - w * 0.1)},${f1(y - h + 16)} Q${f1(x + w / 2)},${f1(y - h + 10)} ${f1(x + w / 2)},${f1(y + 18)} Z" fill="${shade('#d8b878', (r() - 0.5) * 0.14)}" stroke="#7a5a2a" stroke-width="2.6"/>`);
        o.push(`<path d="M${f1(x - w * 0.3)},${f1(y - h * 0.4 + 16)} Q${f1(x)},${f1(y - h * 0.5 + 16)} ${f1(x + w * 0.3)},${f1(y - h * 0.3 + 16)}" fill="none" stroke="#a8844a" stroke-width="2" opacity="0.8"/>`);
      }
    }
    return o.join('\n');
  }
  if (D.border === 'wall') {
    for (const [x, y] of pts) {
      o.push(`<rect x="${f1(x - width / 2)}" y="${f1(y - 30)}" width="${f1(width)}" height="56" fill="${shade(D.hills[0], (r() - 0.5) * 0.2)}" stroke="#14160f" stroke-width="2.4"/>`);
      o.push(`<path d="M${f1(x - width / 2)},${f1(y - 2)} H${f1(x + width / 2)} M${f1(x)},${f1(y - 30)} V${f1(y - 2)}" stroke="#14160f" stroke-width="1.6" opacity="0.7"/>`);
    }
    return o.join('\n');
  }
  for (const [x, y] of pts) {
    const R = width * (0.42 + r() * 0.16);
    o.push(`<circle cx="${f1(x)}" cy="${f1(y + 4)}" r="${f1(R + 3)}" fill="#1e3a10"/>`);
  }
  for (const [x, y] of pts) {
    const R = width * (0.4 + r() * 0.14), c = r() < 0.12 ? '#d8862a' : r() < 0.5 ? '#4e8a2a' : '#5e9a32';
    o.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(R)}" fill="${c}"/><circle cx="${f1(x - R * 0.3)}" cy="${f1(y - R * 0.35)}" r="${f1(R * 0.38)}" fill="#c8f080" opacity="0.25"/>`);
  }
  return o.join('\n');
}

/** Sols d'Astrub posés sur l'herbe : place pavée, arène de planches, dalles ; carrés de blé ; chemins de terre. */
function landFloor(D: Land, r: () => number): string {
  const o: string[] = [];
  const x0 = EDGE, x1 = ROOM_W - EDGE, y0 = FLOOR_TOP, y1 = ROOM_H;
  for (let k = 0; k < D.dirt; k++) {
    const x = x0 + r() * (x1 - x0), y = y0 + 100 + r() * (y1 - y0 - 200), w = 70 + r() * 90;
    o.push(`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w)}" ry="${f1(w * 0.45)}" fill="#c89a5a" opacity="0.85" filter="url(#blur8)"/>`);
    for (let j = 0; j < 8; j++) o.push(`<circle cx="${f1(x + (r() - 0.5) * w * 1.4)}" cy="${f1(y + (r() - 0.5) * w * 0.6)}" r="${f1(2 + r() * 3)}" fill="#8a6030" opacity="0.6"/>`);
  }
  if (D.floor === 'plaza') {
    // pavés gris-beige de la Cité, toute la place
    for (let y = y0 + 20, row = 0; y < y1 + 20; y += 34, row++) for (let x = x0 + (row % 2 ? -26 : 0); x < x1 + 30; x += 52) {
      if (r() < 0.04) continue;
      const w = 22 + r() * 4, h = 14 + r() * 2;
      o.push(`<rect x="${f1(x - w)}" y="${f1(y - h)}" width="${f1(w * 2)}" height="${f1(h * 2)}" rx="7" fill="${shade(L.stone, (r() - 0.5) * 0.14)}" stroke="#8a8270" stroke-width="1.6"/>`);
    }
    o.push(`<circle cx="${ROOM_W / 2}" cy="${y0 + 640}" r="120" fill="none" stroke="#b8a888" stroke-width="10" opacity="0.7"/>`);
  } else if (D.floor === 'slabs') {
    for (let y = y0 + 30, row = 0; y < y1 + 40; y += 80, row++) for (let x = x0 + (row % 2 ? -50 : 0); x < x1 + 60; x += 100) {
      o.push(`<rect x="${f1(x + 3)}" y="${f1(y + 3)}" width="94" height="74" rx="6" fill="${shade(L.stone, (r() - 0.5) * 0.22)}" stroke="#2a2c22" stroke-width="2.4"/>`);
      if (r() < 0.35) o.push(`<ellipse cx="${f1(x + 20 + r() * 60)}" cy="${f1(y + 70)}" rx="${f1(14 + r() * 16)}" ry="6" fill="#5a8a2e" opacity="0.7"/>`);
    }
  } else if (D.floor === 'planks') {
    // arène de la Grange : grand damier de planches au centre
    const cx = ROOM_W / 2, cy = y0 + 640, n = 5, w = 64, h = 40;
    for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
      if (Math.abs(i) + Math.abs(j) > n + 1) continue;
      const px = cx + (i - j) * w * 0.5, py = cy + (i + j) * h * 0.5;
      o.push(`<path d="M${f1(px)},${f1(py - h / 2)} L${f1(px + w / 2)},${f1(py)} L${f1(px)},${f1(py + h / 2)} L${f1(px - w / 2)},${f1(py)} Z" fill="${(i + j) % 2 ? '#c8945a' : '#a8743e'}" stroke="#6a4420" stroke-width="1.6"/>`);
    }
  }
  // carrés de blé et de tournesols
  for (let k = 0; k < D.wheat; k++) {
    const x = x0 + 40 + r() * (x1 - x0 - 80), y = y0 + 150 + r() * (y1 - y0 - 250);
    if (D.floor === 'planks' && Math.abs(x - ROOM_W / 2) < 230 && Math.abs(y - (y0 + 640)) < 180) continue;
    const w = 50 + r() * 40, h = 30 + r() * 20;
    o.push(`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w)}" ry="${f1(h)}" fill="#d8b040" opacity="0.8"/>`);
    for (let j = 0; j < 26; j++) {
      const sx = x + (r() - 0.5) * w * 1.7, sy = y + (r() - 0.5) * h * 1.5, t = 14 + r() * 8;
      o.push(`<path d="M${f1(sx)},${f1(sy)} q1,${f1(-t * 0.5)} 2,${f1(-t)}" stroke="#a8781a" stroke-width="2" fill="none"/><ellipse cx="${f1(sx + 2)}" cy="${f1(sy - t)}" rx="2.6" ry="5" fill="#f0cc4a" stroke="#a8781a" stroke-width="0.8"/>`);
    }
  }
  return o.join('\n');
}

/** Étangs à la place des trous de vide (eau, berge de terre, reflets) ; eaux sales dans les Souterrains. */
function pondsSvg(D: Land, shape: RoomShape, r: () => number): string {
  const o: string[] = [];
  const P = 0.62;
  shape.holes.forEach((h, i) => {
    const ry = h.r * P;
    const stadium = (g = 0) => `M${f1(h.x - h.hx)},${f1(h.y - ry - g)} L${f1(h.x + h.hx)},${f1(h.y - ry - g)} A${f1(h.r + g)},${f1(ry + g)} 0 0 1 ${f1(h.x + h.hx)},${f1(h.y + ry + g)} L${f1(h.x - h.hx)},${f1(h.y + ry + g)} A${f1(h.r + g)},${f1(ry + g)} 0 0 1 ${f1(h.x - h.hx)},${f1(h.y - ry - g)} Z`;
    o.push(`<clipPath id="pond${i}"><path d="${stadium()}"/></clipPath>`);
    o.push(`<path d="${stadium(10)}" fill="${D.border === 'wall' ? '#3a3c32' : D.bank ?? '#a8783e'}"/>`);
    o.push(`<path d="${stadium()}" fill="url(#waterG)"/>`);
    o.push(`<g clip-path="url(#pond${i})">`);
    o.push(`<path d="${stadium()}" fill="none" stroke="#000" stroke-width="22" opacity="0.18" transform="translate(0,${f1(-ry * 0.25)})"/>`);
    for (let k = 0; k < 8; k++) {
      const x = h.x - h.hx - h.r * 0.6 + r() * (2 * h.hx + h.r * 1.2), y = h.y - ry * 0.4 + r() * ry * 1.1, w = 10 + r() * 22;
      o.push(`<path d="M${f1(x - w)},${f1(y)} q${f1(w)},-5 ${f1(w * 2)},0" fill="none" stroke="${D.water[0]}" stroke-width="2.4" opacity="0.8"/>`);
    }
    if (D.border === 'hedge') for (let k = 0; k < 2; k++) {
      const x = h.x + (r() - 0.5) * (h.hx + h.r), y = h.y + (r() - 0.3) * ry * 0.8;
      o.push(`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="13" ry="7" fill="#5aa83a" stroke="#2a5a1a" stroke-width="1.4"/><path d="M${f1(x)},${f1(y)} l10,-4" stroke="url(#waterG)" stroke-width="3"/>`);
    }
    o.push(`</g>`);
    o.push(`<path d="${stadium()}" fill="none" stroke="${D.border === 'wall' ? '#24251e' : '#6a4a20'}" stroke-width="4"/>`);
    if (D.border === 'hedge') for (let k = 0; k < 10; k++) {
      const a = r() * Math.PI * 2, x = h.x + Math.cos(a) * (h.hx + h.r + 4), y = h.y + Math.sin(a) * (ry + 4);
      o.push(`<path d="M${f1(x - 4)},${f1(y)} q1,-12 -2,-18 M${f1(x)},${f1(y)} q1,-14 3,-20 M${f1(x + 4)},${f1(y)} q-1,-10 3,-15" fill="none" stroke="#3a7a22" stroke-width="2.4" stroke-linecap="round"/>`);
    }
  });
  // passerelles de planches
  for (const b of shape.bands) {
    const x0 = b.gapX - b.gapHalf - 6, x1 = b.gapX + b.gapHalf + 6, y0 = b.y - b.half - 14, y1 = b.y + b.half + 14;
    for (let y = y0; y < y1; y += 15) o.push(`<rect x="${f1(x0 + (r() - 0.5) * 3)}" y="${f1(y)}" width="${f1(x1 - x0)}" height="12" rx="2" fill="${shade('#b8824a', (r() - 0.5) * 0.2)}" stroke="#4a2e14" stroke-width="1.8"/>`);
    for (const x of [x0 - 3, x1 + 3]) o.push(`<rect x="${f1(x - 4)}" y="${f1(y0 - 6)}" width="8" height="${f1(y1 - y0 + 12)}" rx="3" fill="#8a5a2e" stroke="#3a220c" stroke-width="2"/>`);
  }
  return o.join('\n');
}

function landRoom(D: Land, shape: RoomShape | undefined, r: () => number): string {
  const back: [number, number][] = [];
  for (let x = 10; x <= ROOM_W - 10; x += 34) if (Math.abs(x - ROOM_W / 2) > 120) back.push([x, FLOOR_TOP - 8 + (r() - 0.5) * 8]);
  const side = (x: number) => {
    const pts: [number, number][] = [];
    for (let y = FLOOR_TOP; y <= ROOM_H + 40; y += 40) pts.push([x + (r() - 0.5) * 14, y]);
    return pts;
  };
  const W = Math.max(60, EDGE * 1.25);
  return [
    landBackdrop(D, r),
    ground(r),
    landBorder(D, side(EDGE - W * 0.3), r, W),
    landBorder(D, side(ROOM_W - EDGE + W * 0.3), r, W),
    landBorder(D, back, r, 56),
    shape ? pondsSvg(D, shape, r) : '',
    exitArch(),
  ].join('\n');
}

export function champsRoomSvg(seed = 7, theme: Exclude<Theme, 'crypt'> = 'champs', shape?: RoomShape): string {
  L = LOOKS[theme];
  EDGE = EDGE0 + (shape?.margin ?? 0);
  const r = rng(seed);
  const defs = `
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="9"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.4 -0.45"/>
    </filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="blur8" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
    <linearGradient id="voidG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L.void[0]}"/><stop offset="0.25" stop-color="${L.void[1]}"/><stop offset="0.6" stop-color="${L.void[2]}"/><stop offset="1" stop-color="${L.void[3]}"/></linearGradient>
    <linearGradient id="grassG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L.grass[0]}"/><stop offset="0.5" stop-color="${L.grass[1]}"/><stop offset="1" stop-color="${L.grass[2]}"/></linearGradient>
    <linearGradient id="cliffG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${(L.cliff ?? ['#b89a5e'])[0]}"/><stop offset="0.5" stop-color="${(L.cliff ?? ['', '#8a7046'])[1]}"/><stop offset="1" stop-color="${(L.cliff ?? ['', '', '#4a3a30'])[2]}"/></linearGradient>
    <linearGradient id="archStone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${L.land?.arch[0] ?? '#fbf0cc'}"/><stop offset="1" stop-color="${L.land?.arch[1] ?? '#d6c08a'}"/></linearGradient>
    <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L.land?.sky[0] ?? '#000'}"/><stop offset="1" stop-color="${L.land?.sky[1] ?? '#000'}"/></linearGradient>
    <linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a90b0"/><stop offset="0.6" stop-color="#4ac8d0"/><stop offset="1" stop-color="#a8f0e8"/></linearGradient>
    <linearGradient id="seaSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a90b0"/><stop offset="0.5" stop-color="#4ac8d0"/><stop offset="1" stop-color="#2a90b0"/></linearGradient>
    <linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L.land?.water[2] ?? '#000'}"/><stop offset="0.5" stop-color="${L.land?.water[1] ?? '#000'}"/><stop offset="1" stop-color="${L.land?.water[0] ?? '#000'}"/></linearGradient>
    <radialGradient id="archLight" cx="0.5" cy="0.62" r="0.75"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#d8fbff"/><stop offset="1" stop-color="#58b8c8"/></radialGradient>`;
  // bords de l'île : falaise au fond (sous l'arche) et sur les côtés
  const back: [number, number][] = [];
  for (let x = EDGE - 10; x <= ROOM_W - EDGE + 10; x += 40) back.push([x, FLOOR_TOP + (Math.abs(x - ROOM_W / 2) < 100 ? 0 : (r() - 0.5) * 12)]);
  const left: [number, number][] = [], right: [number, number][] = [];
  for (let y = FLOOR_TOP; y <= ROOM_H + 40; y += 46) {
    left.push([EDGE + (r() - 0.5) * 26, y]);
    right.push([ROOM_W - EDGE + (r() - 0.5) * 26, y]);
  }
  const body = L.land ? landRoom(L.land, shape, r) : [
    voidSky(r),
    cliffRim(left, 40, 'left'), cliffRim(right, 40, 'right'),
    ground(r),
    `<rect x="${EDGE - 10}" y="${FLOOR_TOP - 6}" width="${ROOM_W - 2 * EDGE + 20}" height="14" fill="${L.grass[1]}"/>`,
    cliffRim(back, 0, 'down'),
    shape ? holesSvg(shape, r) : '',
    exitArch(),
  ].join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ROOM_W} ${ROOM_H}" width="${ROOM_W}" height="${ROOM_H}"><defs>${defs}</defs>${body}</svg>`;
}

/** Barrière de bois de la sortie (calque animé, mêmes dimensions que la grille de la Crypte). */
export function champsGateSvg(): string {
  const u = GATE_BARS_W / 2, b = GATE_BARS_H - 2;
  const o: string[] = [];
  for (let i = -3; i <= 3; i++) {
    const x = u + i * 20, top = b - 150 + i * i * 4;
    o.push(`<path d="M${x - 8},${b} L${x - 8},${top + 8} L${x},${top} L${x + 8},${top + 8} L${x + 8},${b} Z" fill="#a8743e" stroke="#4a2e14" stroke-width="2.5" stroke-linejoin="round"/>`);
    o.push(`<path d="M${x - 4},${b - 6} L${x - 4},${top + 12}" stroke="#d6a46a" stroke-width="2" opacity="0.7"/>`);
  }
  for (const y of [b - 40, b - 104]) o.push(`<rect x="${u - 72}" y="${y - 7}" width="144" height="14" rx="4" fill="#8a5a2e" stroke="#4a2e14" stroke-width="2.5"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GATE_BARS_W} ${GATE_BARS_H}" width="${GATE_BARS_W}" height="${GATE_BARS_H}">${o.join('')}</svg>`;
}
