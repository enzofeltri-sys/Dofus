import { rng } from '../iso';
import { shade } from '../svg';
import { FLOOR_TOP, GATE_BARS_H, GATE_BARS_W, ROOM_H, ROOM_W } from './cryptRoom';

/**
 * Champs d'Incarnam — même format que la Crypte (portrait, vue de dessus 3/4).
 * Incarnam est une île flottante au-dessus des nuages : au fond, ciel pâle, nuages et îlots flottants ;
 * une haie fleurie ferme le champ, avec une arche de bois et de lierre pour sortir.
 * Sol : herbe vert tendre teintée de bleu (ambiance « chimérique »), chemin de terre claire, fleurs, trèfles.
 */

const SIDE = 58; // haies latérales
const GRASS = '#a9d98e';
const GRASS_LIGHT = '#d4f2b4';
const GRASS_DARK = '#6fae64';
const PATH = '#e6d6a6';
const PATH_DARK = '#b9a674';
const HEDGE = '#5f9e5c';

const f1 = (n: number) => n.toFixed(1);

/** Touffe de buisson ronde (plusieurs boules qui se chevauchent). */
function hedgeBall(x: number, y: number, r: number, col = HEDGE): string {
  return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}" stroke="${shade(col, -0.55)}" stroke-width="2.4"/>` +
    `<circle cx="${f1(x - r * 0.3)}" cy="${f1(y - r * 0.35)}" r="${f1(r * 0.45)}" fill="${shade(col, 0.25)}" opacity="0.7"/>`;
}

function sky(r: () => number): string {
  const o: string[] = [];
  o.push(`<rect x="0" y="0" width="${ROOM_W}" height="${FLOOR_TOP + 10}" fill="url(#skyG)"/>`);
  // nuages
  for (let i = 0; i < 9; i++) {
    const cx = r() * ROOM_W, cy = 40 + r() * 140, w = 60 + r() * 90;
    o.push(`<g opacity="${(0.55 + r() * 0.35).toFixed(2)}">` +
      [0, 1, 2, 3].map((k) => `<ellipse cx="${f1(cx + (k - 1.5) * w * 0.35)}" cy="${f1(cy - (k % 2) * 10)}" rx="${f1(w * 0.32)}" ry="${f1(w * 0.2)}" fill="#ffffff"/>`).join('') + '</g>');
  }
  // îlots flottants d'Incarnam au loin
  for (const [x, y, s] of [[110, 120, 1], [600, 90, 0.8], [400, 60, 0.55]] as const) {
    o.push(`<g transform="translate(${x},${y}) scale(${s})">
      <path d="M-60,0 Q-50,-14 0,-16 Q50,-14 60,0 Q40,10 26,40 Q10,70 0,86 Q-12,62 -30,36 Q-46,14 -60,0 Z" fill="#b6a58c" stroke="#7a6a54" stroke-width="2.5"/>
      <path d="M-60,0 Q-50,-14 0,-16 Q50,-14 60,0 Q30,8 0,6 Q-30,8 -60,0 Z" fill="#8fd27e" stroke="#4f8a48" stroke-width="2.5"/>
      <circle cx="-22" cy="-18" r="12" fill="#6fbf6a" stroke="#3f7a3a" stroke-width="2"/><circle cx="18" cy="-20" r="9" fill="#7ccc72" stroke="#3f7a3a" stroke-width="2"/>
    </g>`);
  }
  // halo lumineux derrière l'arche de sortie
  o.push(`<ellipse cx="${ROOM_W / 2}" cy="${FLOOR_TOP - 60}" rx="150" ry="110" fill="url(#exitGlow)"/>`);
  return o.join('\n');
}

/** Haie du fond, interrompue par l'arche de sortie. */
function backHedge(r: () => number): string {
  const o: string[] = [];
  const y = FLOOR_TOP - 20;
  o.push(`<rect x="0" y="${y - 40}" width="${ROOM_W}" height="70" fill="${shade(HEDGE, -0.25)}"/>`);
  for (let x = -10; x < ROOM_W + 20; x += 34) {
    if (Math.abs(x - ROOM_W / 2) < 92) continue;
    o.push(hedgeBall(x, y - 18 - r() * 16, 28 + r() * 10));
    if (r() < 0.45) {
      const fx = x + (r() - 0.5) * 30, fy = y - 30 - r() * 20;
      o.push(`<circle cx="${f1(fx)}" cy="${f1(fy)}" r="4.5" fill="${['#ffffff', '#f6c6e6', '#c8e6ff'][Math.floor(r() * 3)]}" stroke="#7a8a9a" stroke-width="1"/>`);
    }
  }
  // arche de bois et de lierre (l'ouverture est dans le décor, la barrière s'ouvre à part)
  const u = ROOM_W / 2, b = FLOOR_TOP;
  o.push(`<path d="M${u - 70},${b} L${u - 70},${b - 120} Q${u},${b - 196} ${u + 70},${b - 120} L${u + 70},${b} Z" fill="url(#archLight)"/>`);
  o.push(`<path d="M${u - 82},${b + 2} L${u - 82},${b - 124} Q${u},${b - 214} ${u + 82},${b - 124} L${u + 82},${b + 2}" fill="none" stroke="#6a4626" stroke-width="16" stroke-linecap="round"/>`);
  o.push(`<path d="M${u - 82},${b + 2} L${u - 82},${b - 124} Q${u},${b - 214} ${u + 82},${b - 124} L${u + 82},${b + 2}" fill="none" stroke="#9a6a3a" stroke-width="9" stroke-linecap="round"/>`);
  for (let i = 0; i < 14; i++) {
    const t = i / 13, a = Math.PI * (1 - t);
    const lx = u + Math.cos(a) * 84, ly = b - 124 - Math.sin(a) * 88 + (t < 0.08 || t > 0.92 ? 60 : 0);
    o.push(`<ellipse cx="${f1(lx)}" cy="${f1(ly)}" rx="9" ry="6" transform="rotate(${f1((r() - 0.5) * 80)},${f1(lx)},${f1(ly)})" fill="#6fbf6a" stroke="#3f7a3a" stroke-width="1.5"/>`);
  }
  return o.join('\n');
}

function sideHedges(r: () => number): string {
  const o: string[] = [];
  for (const left of [true, false]) {
    const x0 = left ? 0 : ROOM_W - SIDE;
    o.push(`<rect x="${x0}" y="${FLOOR_TOP - 30}" width="${SIDE}" height="${ROOM_H - FLOOR_TOP + 30}" fill="${shade(HEDGE, -0.2)}"/>`);
    for (let y = FLOOR_TOP - 10; y < ROOM_H + 20; y += 38) {
      const x = left ? SIDE - 12 + r() * 10 : ROOM_W - SIDE + 2 + r() * 10;
      o.push(hedgeBall(x, y, 30 + r() * 10, r() < 0.3 ? '#6aa866' : HEDGE));
    }
  }
  return o.join('\n');
}

function meadow(r: () => number): string {
  const o: string[] = [];
  const x0 = SIDE - 10, x1 = ROOM_W - SIDE + 10, y0 = FLOOR_TOP - 10, y1 = ROOM_H;
  o.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#grassG)"/>`);
  // taches d'herbe plus claire / plus foncée
  for (let k = 0; k < 26; k++) {
    const cx = x0 + r() * (x1 - x0), cy = y0 + r() * (y1 - y0), R = 40 + r() * 70;
    o.push(`<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(R * 1.4)}" ry="${f1(R * 0.8)}" fill="${r() < 0.5 ? GRASS_LIGHT : GRASS_DARK}" opacity="${(0.18 + r() * 0.18).toFixed(2)}" filter="url(#soft)"/>`);
  }
  // chemin de terre claire, du bas vers l'arche
  const pts: [number, number][] = [];
  for (let y = ROOM_H + 20, i = 0; y > FLOOR_TOP - 20; y -= 120, i++) pts.push([ROOM_W / 2 + Math.sin(i * 1.3 + r()) * 70 * Math.min(1, (y - FLOOR_TOP) / 300), y]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${f1(p[0])},${f1(p[1])}`).join(' ');
  o.push(`<path d="${d}" fill="none" stroke="${PATH_DARK}" stroke-width="112" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" filter="url(#softS)"/>`);
  o.push(`<path d="${d}" fill="none" stroke="${PATH}" stroke-width="96" stroke-linecap="round" stroke-linejoin="round" filter="url(#softS)"/>`);
  for (let k = 0; k < 40; k++) {
    const p = pts[Math.floor(r() * pts.length)];
    o.push(`<ellipse cx="${f1(p[0] + (r() - 0.5) * 80)}" cy="${f1(p[1] + (r() - 0.5) * 110)}" rx="${f1(3 + r() * 5)}" ry="${f1(2 + r() * 3)}" fill="${shade(PATH, -0.18)}" stroke="${PATH_DARK}" stroke-width="1"/>`);
  }
  // brins d'herbe
  for (let k = 0; k < 260; k++) {
    const x = x0 + r() * (x1 - x0), y = y0 + 20 + r() * (y1 - y0 - 20), h = 8 + r() * 10;
    const c = r() < 0.5 ? GRASS_DARK : shade(GRASS, -0.12);
    o.push(`<path d="M${f1(x - 4)},${f1(y)} q2,${f1(-h * 0.6)} 1,${f1(-h)} M${f1(x)},${f1(y)} q1,${f1(-h * 0.8)} 3,${f1(-h * 1.15)} M${f1(x + 4)},${f1(y)} q-1,${f1(-h * 0.5)} 2,${f1(-h * 0.85)}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`);
  }
  // petites fleurs et trèfles
  for (let k = 0; k < 70; k++) {
    const x = x0 + 20 + r() * (x1 - x0 - 40), y = y0 + 30 + r() * (y1 - y0 - 40);
    if (r() < 0.35) {
      o.push([0, 1, 2].map((i) => `<circle cx="${f1(x + Math.cos(i * 2.1) * 4)}" cy="${f1(y + Math.sin(i * 2.1) * 3)}" r="4" fill="#8fcf74" stroke="#4f8a48" stroke-width="1"/>`).join(''));
    } else {
      const col = ['#ffffff', '#ffe58a', '#f6c6e6', '#c8e6ff'][Math.floor(r() * 4)];
      o.push([0, 1, 2, 3, 4].map((i) => `<circle cx="${f1(x + Math.cos(i * 1.256) * 3.6)}" cy="${f1(y + Math.sin(i * 1.256) * 2.8)}" r="2.8" fill="${col}"/>`).join('') + `<circle cx="${f1(x)}" cy="${f1(y)}" r="2" fill="#f2b23a"/>`);
    }
  }
  o.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#000" filter="url(#grain)" opacity="0.06"/>`);
  o.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="60" fill="url(#backShadowG)"/>`);
  return o.join('\n');
}

export function champsRoomSvg(seed = 7): string {
  const r = rng(seed);
  const defs = `
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="9"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.4 -0.45"/>
    </filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="softS" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3"/></filter>
    <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9d8f2"/><stop offset="0.6" stop-color="#e2eefa"/><stop offset="1" stop-color="#f6f0ff"/></linearGradient>
    <linearGradient id="grassG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd29a"/><stop offset="0.5" stop-color="${GRASS}"/><stop offset="1" stop-color="#97cc84"/></linearGradient>
    <radialGradient id="exitGlow"><stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
    <radialGradient id="archLight" cx="0.5" cy="0.62" r="0.75"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#e6f4ff"/><stop offset="1" stop-color="#a8cfe8"/></radialGradient>
    <linearGradient id="backShadowG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e4a20" stop-opacity="0.35"/><stop offset="1" stop-color="#1e4a20" stop-opacity="0"/></linearGradient>`;
  const body = [sky(r), meadow(r), backHedge(r), sideHedges(r)].join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ROOM_W} ${ROOM_H}" width="${ROOM_W}" height="${ROOM_H}"><defs>${defs}</defs>${body}</svg>`;
}

/** Barrière de bois de la sortie (calque animé, mêmes dimensions que la grille de la Crypte). */
export function champsGateSvg(): string {
  const u = GATE_BARS_W / 2, b = GATE_BARS_H - 2;
  const o: string[] = [];
  for (let i = -3; i <= 3; i++) {
    const x = u + i * 20, top = b - 150 + i * i * 4;
    o.push(`<path d="M${x - 8},${b} L${x - 8},${top + 8} L${x},${top} L${x + 8},${top + 8} L${x + 8},${b} Z" fill="#b07a44" stroke="#5a3a1c" stroke-width="2.5" stroke-linejoin="round"/>`);
    o.push(`<path d="M${x - 4},${b - 6} L${x - 4},${top + 12}" stroke="#d6a46a" stroke-width="2" opacity="0.7"/>`);
  }
  for (const y of [b - 40, b - 104]) o.push(`<rect x="${u - 72}" y="${y - 7}" width="144" height="14" rx="4" fill="#9a6a3a" stroke="#5a3a1c" stroke-width="2.5"/>`);
  o.push(`<path d="M${u - 66},${b - 40} L${u + 66},${b - 104}" stroke="#5a3a1c" stroke-width="10" stroke-linecap="round"/><path d="M${u - 66},${b - 40} L${u + 66},${b - 104}" stroke="#9a6a3a" stroke-width="6" stroke-linecap="round"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GATE_BARS_W} ${GATE_BARS_H}" width="${GATE_BARS_W}" height="${GATE_BARS_H}">${o.join('')}</svg>`;
}
