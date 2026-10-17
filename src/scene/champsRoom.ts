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

const EDGE = 54; // bord de falaise sur les côtés
import type { Theme } from '../game/data/areas';

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
}
const LOOKS: Record<Exclude<Theme, 'crypt'>, Look> = {
  champs: { grass: ['#f2cf52', '#efc743', '#e8bb3a'], light: '#fbe08a', dark: '#c8962a', tuftTones: ['#c8962a', '#e3ad34', '#f8dc70'], touch: ['#ffe78a', '#d9a52e'], flowers: 60, glyphs: true, cobbles: true, tiles: false, petals: false, fog: false, stone: '#efe2b8', void: ['#155a66', '#1a3f66', '#2c2a6a', '#4a2a72'] },
  paturages: { grass: ['#f0cc4e', '#ebc040', '#e2b236'], light: '#fbe08a', dark: '#c08a26', tuftTones: ['#c08a26', '#e3ad34', '#f8dc70'], touch: ['#ffe78a', '#d9a52e'], flowers: 40, glyphs: true, cobbles: false, tiles: true, petals: false, fog: false, stone: '#efe2b8', void: ['#155a66', '#1a3f66', '#2c2a6a', '#4a2a72'] },
  foret: { grass: ['#eec84c', '#e6bb3e', '#d8a834'], light: '#f8dc80', dark: '#b88424', tuftTones: ['#b88424', '#dca632', '#f2d468'], touch: ['#fbe286', '#cf9a2a'], flowers: 30, glyphs: true, cobbles: true, tiles: false, petals: true, fog: false, stone: '#efe2b8', void: ['#14525e', '#183a60', '#2a2866', '#46286c'] },
  cimetiere: { grass: ['#8a7c44', '#74683a', '#5e5430'], light: '#a89a58', dark: '#3e3622', tuftTones: ['#5a4e2a', '#7a6c3a', '#9a8a4c'], touch: ['#a8986a', '#4a4228'], flowers: 0, glyphs: false, cobbles: true, tiles: false, petals: false, fog: true, stone: '#a8a494', cliff: ['#7a7062', '#4e463c', '#2a2420'], void: ['#0e3a48', '#14304e', '#1e2448', '#2a2040'] },
};
let L: Look = LOOKS.champs;

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
  for (let k = 0; k < 700; k++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), w = 4 + r() * 7;
    o.push(`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w)}" ry="${f1(w * 0.45)}" fill="${r() < 0.5 ? L.touch[0] : L.touch[1]}" opacity="${(0.35 + r() * 0.35).toFixed(2)}"/>`);
  }
  for (let k = 0; k < 170; k++) {
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

export function champsRoomSvg(seed = 7, theme: Exclude<Theme, 'crypt'> = 'champs'): string {
  L = LOOKS[theme];
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
    <linearGradient id="archStone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf0cc"/><stop offset="1" stop-color="#d6c08a"/></linearGradient>
    <radialGradient id="archLight" cx="0.5" cy="0.62" r="0.75"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#d8fbff"/><stop offset="1" stop-color="#58b8c8"/></radialGradient>`;
  // bords de l'île : falaise au fond (sous l'arche) et sur les côtés
  const back: [number, number][] = [];
  for (let x = EDGE - 10; x <= ROOM_W - EDGE + 10; x += 40) back.push([x, FLOOR_TOP + (Math.abs(x - ROOM_W / 2) < 100 ? 0 : (r() - 0.5) * 12)]);
  const left: [number, number][] = [], right: [number, number][] = [];
  for (let y = FLOOR_TOP; y <= ROOM_H + 40; y += 46) {
    left.push([EDGE + (r() - 0.5) * 26, y]);
    right.push([ROOM_W - EDGE + (r() - 0.5) * 26, y]);
  }
  const body = [
    voidSky(r),
    cliffRim(left, 40, 'left'), cliffRim(right, 40, 'right'),
    ground(r),
    `<rect x="${EDGE - 10}" y="${FLOOR_TOP - 6}" width="${ROOM_W - 2 * EDGE + 20}" height="14" fill="${L.grass[1]}"/>`,
    cliffRim(back, 0, 'down'),
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
