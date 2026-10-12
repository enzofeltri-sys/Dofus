import { rng } from '../iso';
import { shade } from '../svg';

/**
 * Salle de la Crypte de Kardorim — format PORTRAIT plein écran, vue de dessus 3/4 (façon Archero),
 * direction artistique des vraies cartes Dofus de la crypte :
 * - mur du fond vu de face : colonnade d'arcades rouge-brun sur piliers rouges peints de flammes,
 *   chapiteaux crème sculptés de crânes, mur ocre peint de flammes, grille de sortie lumineuse ;
 * - murs latéraux avec chaperon (dessus) et face intérieure ombrée → profondeur ;
 * - sol de dalles en grès doré, tailles irrégulières, biseautées, taches et débris.
 *
 * Unités : pixels « de conception ». La salle fait ROOM_W de large (= largeur de l'écran).
 */

export const ROOM_W = 720;
export const ROOM_H = 1560;
/** Ligne du pied du mur du fond (début du sol). */
export const FLOOR_TOP = 300;
/** Limites jouables. */
export const BOUNDS = { x0: 76, x1: ROOM_W - 76, y0: FLOOR_TOP + 24, y1: ROOM_H - 60 };

const SIDE = 34; // épaisseur du chaperon des murs latéraux
const FACE = 26; // face intérieure visible des murs latéraux

const SAND = '#c9ae78';
const SAND_LIGHT = '#f2e2b2';
const SAND_DARK = '#8a7246';
const GROUT = '#7a6440';
const ARCH = '#8e3d24';
const FLAME = '#e0782c';
const CREAM = '#e6d6aa';
const CREAM_INK = '#6e5a36';
const OCHRE = '#c99a46';

/** Appliques (lumières murales), en coordonnées de salle. */
export const LIGHTS: { x: number; y: number }[] = [];
/** Centre de la grille de sortie. */
export const EXIT = { x: ROOM_W / 2, y: FLOOR_TOP - 70 };

const f1 = (n: number) => n.toFixed(1);

/* ------------------------------------------------------------------ */
/* Mur du fond : colonnade vue de face                                 */
/* ------------------------------------------------------------------ */

function backWall(r: () => number): string {
  const o: string[] = [];
  const spring = 128; // naissance des arcs (haut des chapiteaux)
  const apex = 34; // sommet de l'intrados
  const T = 34; // épaisseur des arcs
  const pillars = [58, 250, 470, 662];

  // Maçonnerie sombre au-dessus des arcs (voûte dans la pénombre, sans noir).
  o.push(`<rect x="0" y="0" width="${ROOM_W}" height="${FLOOR_TOP}" fill="url(#vault)"/>`);
  for (let y = 4, row = 0; y < spring; y += 26, row++) {
    for (let x = row % 2 ? -26 : 0; x < ROOM_W; x += 58) o.push(`<rect x="${x + 2}" y="${y}" width="54" height="22" rx="4" fill="#6a3620" opacity="0.5"/>`);
  }

  const arc = (u0: number, u1: number, top: number, n = 28) => {
    const cu = (u0 + u1) / 2, half = (u1 - u0) / 2;
    const pts: [number, number][] = [];
    for (let k = 0; k <= n; k++) {
      const a = Math.PI * (1 - k / n);
      pts.push([cu + Math.cos(a) * half, spring + (top - spring) * Math.sin(a)]);
    }
    return pts;
  };
  const P = (ps: [number, number][]) => ps.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L');

  // Mur ocre (sous la naissance des arcs + dans chaque arc).
  const clip: string[] = [`M0,${FLOOR_TOP} L0,${spring} L${ROOM_W},${spring} L${ROOM_W},${FLOOR_TOP} Z`];
  for (let i = 0; i < 3; i++) clip.push(`M${P(arc(pillars[i] + 30 - T, pillars[i + 1] - 30 + T, apex - T))} Z`);
  o.push(`<clipPath id="wallClip"><path d="${clip.join(' ')}"/></clipPath>`);
  o.push(`<g clip-path="url(#wallClip)"><rect x="0" y="0" width="${ROOM_W}" height="${FLOOR_TOP}" fill="url(#ochre)"/>`);
  for (let y = FLOOR_TOP - 26, row = 0; y > 0; y -= 26, row++) {
    o.push(`<path d="M0,${y} L${ROOM_W},${y}" stroke="${shade(OCHRE, -0.35)}" stroke-width="1.4" opacity="0.3"/>`);
    for (let x = row % 2 ? 26 : 0; x < ROOM_W; x += 52) o.push(`<path d="M${x},${y} l0,26" stroke="${shade(OCHRE, -0.35)}" stroke-width="1.4" opacity="0.25"/>`);
  }
  for (let x = 14; x < ROOM_W; x += 30 + r() * 28) {
    const h = 40 + r() * 60, y0 = FLOOR_TOP - 20 - r() * 70;
    o.push(`<path d="M${f1(x)},${f1(y0)} q${f1(-6 - r() * 6)},${f1(-h * 0.5)} 2,${f1(-h)} q${f1(2 + r() * 6)},${f1(h * 0.45)} 10,${f1(h * 0.2)} q2,${f1(h * 0.4)} -12,${f1(h * 0.8)} Z" fill="${FLAME}" opacity="${(0.2 + r() * 0.22).toFixed(2)}"/>`);
  }
  o.push('</g>');

  // Mobilier du fond des travées.
  o.push(shelves(154, r));
  o.push(chains(566), sconce(566));
  LIGHTS.push({ x: 566, y: 190 });
  o.push(exitGate(ROOM_W / 2));

  // Arcs : douelle (profondeur), bandeau, claveaux, motifs, pointes.
  for (let i = 0; i < 3; i++) {
    const u0 = pillars[i] + 30, u1 = pillars[i + 1] - 30;
    const inner = arc(u0, u1, apex), outer = arc(u0 - T, u1 + T, apex - T), deep = arc(u0 + 12, u1 - 12, apex + 16);
    o.push(`<path d="M${P(inner)} L${P([...deep].reverse())} Z" fill="#4e1c10"/>`);
    o.push(`<path d="M${P(outer)} L${P([...inner].reverse())} Z" fill="url(#archG)" stroke="#3a140a" stroke-width="2.2" stroke-linejoin="round"/>`);
    for (let k = 2; k < 28; k += 3) {
      o.push(`<path d="M${f1(inner[k][0])},${f1(inner[k][1])} L${f1(outer[k][0])},${f1(outer[k][1])}" stroke="#3a140a" stroke-width="2.5"/>`);
      if ((k / 3) % 2 === 0 && k + 2 < 28) {
        const mx = (inner[k + 1][0] + outer[k + 2][0]) / 2, my = (inner[k + 1][1] + outer[k + 2][1]) / 2;
        o.push(`<g fill="#5a200e" opacity="0.9"><circle cx="${f1(mx - 4.5)}" cy="${f1(my + 2.5)}" r="3.4"/><circle cx="${f1(mx + 4.5)}" cy="${f1(my + 2.5)}" r="3.4"/><circle cx="${f1(mx)}" cy="${f1(my - 4.5)}" r="3.4"/></g>`);
      }
    }
    o.push(`<path d="M${P(arc(u0 - T + 5, u1 + T - 5, apex - T + 5).slice(4, 25))}" fill="none" stroke="#e39a6a" stroke-width="2.2" opacity="0.4" stroke-linecap="round"/>`);
    for (const k of [6, 14, 22]) {
      const [x, y] = outer[k];
      const a = Math.atan2(y - spring, x - (u0 + u1) / 2);
      const nx = Math.cos(a), ny = Math.sin(a), tx = -ny, ty = nx;
      const p1 = [x + tx * 13, y + ty * 13], p2 = [x + nx * 30, y + ny * 30], p3 = [x - tx * 13, y - ty * 13];
      o.push(`<path d="M${f1(p1[0])},${f1(p1[1])} L${f1(p2[0])},${f1(p2[1])} L${f1(p3[0])},${f1(p3[1])} Z" fill="${CREAM}" stroke="${CREAM_INK}" stroke-width="2.5" stroke-linejoin="round"/>`);
      o.push(`<path d="M${f1(p2[0])},${f1(p2[1])} L${f1(p3[0])},${f1(p3[1])} L${f1(x)},${f1(y)} Z" fill="${shade(CREAM, -0.22)}"/>`);
    }
  }

  // Piliers engagés (devant les arcs).
  for (const x of pillars) o.push(wallPillar(x, spring));
  o.push(cobweb(pillars[1] + 32, spring + 4, 1));
  o.push(cobweb(pillars[3] - 32, spring + 4, -1));
  return o.join('\n');
}

function wallPillar(u: number, spring: number): string {
  const W = 46, base = FLOOR_TOP;
  const o: string[] = [];
  o.push(`<rect x="${u - W / 2}" y="${spring}" width="${W}" height="${base - spring - 30}" fill="url(#pillarG)" stroke="#3a120a" stroke-width="2.2"/>`);
  o.push(`<path d="M${u - 10},${base - 40} q-10,-26 4,-56 q-2,26 10,32 q4,-18 -2,-36 q16,24 4,60 Z" fill="${FLAME}" opacity="0.9"/>`);
  o.push(`<path d="M${u - 4},${base - 46} q-4,-14 3,-30 q0,14 6,20 Z" fill="#ffc06a" opacity="0.9"/>`);
  o.push(`<rect x="${u + W / 2 - 12}" y="${spring + 2}" width="10" height="${base - spring - 34}" fill="#000" opacity="0.2"/>`);
  o.push(`<path d="M${u - 34},${base} L${u - 34},${base - 30} L${u + 34},${base - 30} L${u + 34},${base} Z" fill="${CREAM}" stroke="${CREAM_INK}" stroke-width="2.2"/>`);
  o.push(`<path d="M${u - 30},${base - 30} Q${u},${base - 42} ${u + 30},${base - 30} Z" fill="${shade(CREAM, -0.06)}" stroke="${CREAM_INK}" stroke-width="2.5"/>`);
  o.push(`<path d="M${u - 33},${base - 27} L${u + 33},${base - 27}" stroke="#fff6d8" stroke-width="2" opacity="0.8"/>`);
  const cy = spring + 4;
  o.push(skullCapital(u, cy));
  return o.join('');
}

/** Chapiteau crème sculpté d'un crâne (face avant + tablette supérieure en volume). */
export function skullCapital(u: number, cy: number, w = 34): string {
  const o: string[] = [];
  o.push(`<path d="M${u - w},${cy} L${u - w + 4},${cy - 36} L${u + w - 4},${cy - 36} L${u + w},${cy} Z" fill="url(#capG)" stroke="${CREAM_INK}" stroke-width="2.2" stroke-linejoin="round"/>`);
  // crâne en relief
  o.push(`<path d="M${u - 18},${cy - 22} C${u - 18},${cy - 36} ${u + 18},${cy - 36} ${u + 18},${cy - 22} C${u + 18},${cy - 14} ${u + 12},${cy - 10} ${u + 10},${cy - 4} L${u - 10},${cy - 4} C${u - 12},${cy - 10} ${u - 18},${cy - 14} ${u - 18},${cy - 22} Z" fill="#efe2bc" stroke="${CREAM_INK}" stroke-width="1.6"/>`);
  o.push(`<ellipse cx="${u - 8}" cy="${cy - 21}" rx="5.5" ry="5" fill="url(#socket)"/><ellipse cx="${u + 8}" cy="${cy - 21}" rx="5.5" ry="5" fill="url(#socket)"/>`);
  o.push(`<path d="M${u - 2},${cy - 12} l2,-5 l2,5 Z" fill="#4a3618"/>`);
  o.push(`<path d="M${u - 8},${cy - 4} L${u - 8},${cy - 8} M${u - 3},${cy - 4} L${u - 3},${cy - 8} M${u + 2},${cy - 4} L${u + 2},${cy - 8} M${u + 7},${cy - 4} L${u + 7},${cy - 8}" stroke="${CREAM_INK}" stroke-width="1.4"/>`);
  o.push(`<ellipse cx="${u - 9}" cy="${cy - 31}" rx="5" ry="2" fill="#fff" opacity="0.55"/>`);
  // tablette supérieure : face avant + dessus éclairé
  o.push(`<path d="M${u - w - 6},${cy - 36} L${u + w + 6},${cy - 36} L${u + w + 6},${cy - 44} L${u - w - 6},${cy - 44} Z" fill="#c9b484" stroke="${CREAM_INK}" stroke-width="2.2" stroke-linejoin="round"/>`);
  o.push(`<path d="M${u - w - 6},${cy - 44} L${u + w + 6},${cy - 44} L${u + w},${cy - 52} L${u - w},${cy - 52} Z" fill="#f8eed2" stroke="${CREAM_INK}" stroke-width="2.2" stroke-linejoin="round"/>`);
  o.push(`<rect x="${u + w - 12}" y="${cy - 35}" width="10" height="34" fill="#000" opacity="0.12"/>`);
  return o.join('');
}

function shelves(u: number, r: () => number): string {
  const o: string[] = [];
  o.push(`<rect x="${u - 56}" y="150" width="112" height="134" rx="4" fill="#3e2c1a" stroke="#2a1a0c" stroke-width="2.2"/>`);
  for (const y of [192, 236]) o.push(`<rect x="${u - 56}" y="${y}" width="112" height="7" fill="#7a5634" stroke="#2a1a0c" stroke-width="2"/>`);
  const item = (x: number, y: number) => {
    const k = r();
    if (k < 0.55) {
      o.push(`<ellipse cx="${f1(x)}" cy="${y - 10}" rx="10" ry="9" fill="#efe4c4" stroke="${CREAM_INK}" stroke-width="2"/>`);
      o.push(`<ellipse cx="${f1(x - 3.5)}" cy="${y - 11}" rx="2.6" ry="3" fill="#3a2a22"/><ellipse cx="${f1(x + 3.5)}" cy="${y - 11}" rx="2.6" ry="3" fill="#3a2a22"/>`);
    } else if (k < 0.8) {
      o.push(`<path d="M${f1(x - 14)},${y - 4} L${f1(x + 14)},${y - 10}" stroke="${CREAM_INK}" stroke-width="7" stroke-linecap="round"/><path d="M${f1(x - 14)},${y - 4} L${f1(x + 14)},${y - 10}" stroke="#efe4c4" stroke-width="4" stroke-linecap="round"/>`);
    } else {
      o.push(`<path d="M${f1(x - 8)},${y} Q${f1(x - 11)},${y - 14} ${f1(x - 5)},${y - 20} L${f1(x + 5)},${y - 20} Q${f1(x + 11)},${y - 14} ${f1(x + 8)},${y} Z" fill="#5a6a6a" stroke="#2a3434" stroke-width="2"/>`);
    }
  };
  for (const y of [190, 234, 282]) for (let i = 0; i < 3; i++) if (r() < 0.85) item(u - 32 + i * 32 + (r() - 0.5) * 8, y);
  return o.join('');
}

function chains(u: number): string {
  let d = '';
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const x = u - 50 + t * 100, y = 150 + Math.sin(t * Math.PI) * 32;
    d += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="7" ry="4.5" fill="none" stroke="#3c4a3a" stroke-width="3.5" transform="rotate(${(Math.cos(t * Math.PI) * -30).toFixed(0)} ${f1(x)} ${f1(y)})"/>`;
  }
  return d;
}

function sconce(u: number): string {
  return `<path d="M${u - 16},196 Q${u},210 ${u + 16},196 L${u + 11},208 Q${u},218 ${u - 11},208 Z" fill="#4a3a2a" stroke="#22180e" stroke-width="2.5"/>
    <path d="M${u},212 L${u},242" stroke="#4a3a2a" stroke-width="5"/><path d="M${u - 10},242 L${u + 10},242" stroke="#4a3a2a" stroke-width="5" stroke-linecap="round"/>`;
}

function exitGate(u: number): string {
  const o: string[] = [];
  const b = FLOOR_TOP;
  o.push(`<path d="M${u - 70},${b} L${u - 70},${b - 120} Q${u},${b - 196} ${u + 70},${b - 120} L${u + 70},${b} Z" fill="url(#gateLight)" stroke="#2a1a0c" stroke-width="4"/>`);
  for (let i = -4; i <= 4; i++) o.push(`<path d="M${u + i * 15},${b} L${u + i * 15},${b - 160 + i * i * 3}" stroke="#2e2a26" stroke-width="5"/>`);
  for (const y of [b - 36, b - 92]) o.push(`<path d="M${u - 70},${y} L${u + 70},${y}" stroke="#2e2a26" stroke-width="6"/>`);
  o.push(`<circle cx="${u}" cy="${b - 132}" r="16" fill="none" stroke="#2e2a26" stroke-width="5"/><circle cx="${u}" cy="${b - 132}" r="5" fill="#c9a24a"/>`);
  return o.join('');
}

function cobweb(x: number, y: number, dir: 1 | -1): string {
  return `<g stroke="#f4f0e8" stroke-width="1.2" fill="none" opacity="0.5">
    <path d="M${x},${y} L${x + dir * 56},${y - 66} M${x},${y} L${x + dir * 24},${y - 76} M${x},${y} L${x + dir * 70},${y - 28}"/>
    <path d="M${x + dir * 12},${y - 16} Q${x + dir * 20},${y - 14} ${x + dir * 22},${y - 6} M${x + dir * 24},${y - 32} Q${x + dir * 40},${y - 28} ${x + dir * 44},${y - 14} M${x + dir * 36},${y - 50} Q${x + dir * 56},${y - 44} ${x + dir * 60},${y - 24}"/></g>`;
}

/* ------------------------------------------------------------------ */
/* Murs latéraux (profondeur) et mur avant                             */
/* ------------------------------------------------------------------ */

function sideWalls(r: () => number): string {
  const o: string[] = [];
  for (const side of [0, 1]) {
    const capX = side === 0 ? 0 : ROOM_W - SIDE;
    const faceX = side === 0 ? SIDE : ROOM_W - SIDE - FACE;
    o.push(`<rect x="${faceX}" y="${FLOOR_TOP - 10}" width="${FACE}" height="${ROOM_H - FLOOR_TOP}" fill="url(#${side === 0 ? 'faceL' : 'faceR'})"/>`);
    for (let y = FLOOR_TOP; y < ROOM_H; y += 30) o.push(`<path d="M${faceX},${y} l${FACE},0" stroke="#3a2a14" stroke-width="1.5" opacity="0.45"/>`);
    o.push(`<rect x="${capX}" y="0" width="${SIDE}" height="${ROOM_H}" fill="#a88a58"/>`);
    for (let y = -10; y < ROOM_H; y += 40 + r() * 20) {
      o.push(`<rect x="${capX + 3}" y="${f1(y)}" width="${SIDE - 6}" height="${f1(34 + r() * 14)}" rx="5" fill="${shade('#c9ad78', (r() - 0.5) * 0.2)}" stroke="#6e5530" stroke-width="2"/>`);
    }
    for (let y = FLOOR_TOP + 260; y < ROOM_H - 120; y += 380) {
      const px = side === 0 ? SIDE - 4 : ROOM_W - SIDE - 40;
      o.push(`<rect x="${px}" y="${y - 70}" width="44" height="120" rx="4" fill="url(#pillarG)" stroke="#3a120a" stroke-width="2.2"/>`);
      o.push(`<path d="M${px + 14},${y + 36} q-8,-22 4,-46 q-2,22 8,26 q3,-14 -2,-28 q13,20 3,48 Z" fill="${FLAME}" opacity="0.9"/>`);
      o.push(`<rect x="${px - 4}" y="${y - 84}" width="52" height="18" rx="3" fill="${CREAM}" stroke="${CREAM_INK}" stroke-width="2.5"/>`);
      o.push(`<rect x="${px - 4}" y="${y + 46}" width="52" height="16" rx="3" fill="${CREAM}" stroke="${CREAM_INK}" stroke-width="2.5"/>`);
      const lx = side === 0 ? px + 46 : px - 2;
      o.push(`<path d="M${lx - 10},${y - 34} Q${lx},${y - 24} ${lx + 10},${y - 34} L${lx + 7},${y - 26} Q${lx},${y - 20} ${lx - 7},${y - 26} Z" fill="#4a3a2a" stroke="#22180e" stroke-width="2"/>`);
      LIGHTS.push({ x: lx, y: y - 44 });
    }
  }
  o.push(`<rect x="0" y="${ROOM_H - 34}" width="${ROOM_W}" height="34" fill="#a88a58"/>`);
  for (let x = -10; x < ROOM_W; x += 60) o.push(`<rect x="${x}" y="${ROOM_H - 31}" width="56" height="28" rx="5" fill="${shade('#c9ad78', (r() - 0.5) * 0.2)}" stroke="#6e5530" stroke-width="2"/>`);
  return o.join('\n');
}

/* ------------------------------------------------------------------ */
/* Sol                                                                 */
/* ------------------------------------------------------------------ */

function floor(r: () => number): string {
  const o: string[] = [];
  const x0 = SIDE + FACE - 6, x1 = ROOM_W - SIDE - FACE + 6, y0 = FLOOR_TOP, y1 = ROOM_H - 34;
  o.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${GROUT}"/>`);
  const CW = 44, CH = 38; // demi-dalle, profondeur légèrement écrasée (vue 3/4)
  const W = Math.ceil((x1 - x0) / CW), H = Math.ceil((y1 - y0) / CH);
  const used = new Uint8Array(W * H);
  const free = (i: number, j: number, w: number, h: number) => {
    if (i + w > W || j + h > H) return false;
    for (let dj = 0; dj < h; dj++) for (let di = 0; di < w; di++) if (used[(j + dj) * W + i + di]) return false;
    return true;
  };
  const sizes: [number, number][] = [[2, 2], [2, 2], [3, 2], [2, 3], [1, 2], [2, 1], [3, 3], [1, 1], [2, 2], [3, 2]];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    if (used[j * W + i]) continue;
    let [w, h] = sizes[Math.floor(r() * sizes.length)];
    while (!free(i, j, w, h) && (w > 1 || h > 1)) { if (w >= h && w > 1) w--; else h--; }
    for (let dj = 0; dj < h; dj++) for (let di = 0; di < w; di++) used[(j + dj) * W + i + di] = 1;
    o.push(slab(x0 + i * CW, y0 + j * CH, w * CW, h * CH, r));
  }
  for (let k = 0; k < 22; k++) {
    const cx = x0 + r() * (x1 - x0), cy = y0 + r() * (y1 - y0);
    const pts: string[] = [];
    const R = 24 + r() * 50;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2, rr = R * (0.5 + r() * 0.6);
      pts.push(`${f1(cx + Math.cos(a) * rr * 1.3)},${f1(cy + Math.sin(a) * rr * 0.9)}`);
    }
    o.push(`<polygon points="${pts.join(' ')}" fill="#5e4422" opacity="${(0.15 + r() * 0.16).toFixed(2)}" filter="url(#soft)"/>`);
  }
  for (let k = 0; k < 50; k++) {
    const cx = x0 + r() * (x1 - x0), cy = y0 + r() * (y1 - y0), s = 3 + r() * 5;
    o.push(`<path d="M${f1(cx - s)},${f1(cy)} l${f1(s * 0.6)},${f1(-s * 0.7)} l${f1(s * 1.2)},${f1(s * 0.2)} l${f1(-s * 0.3)},${f1(s * 0.6)} Z" fill="${SAND_LIGHT}" stroke="${SAND_DARK}" stroke-width="1.2"/>`);
  }
  o.push(`<ellipse cx="250" cy="1010" rx="30" ry="22" fill="#3a3430" stroke="#1e1a16" stroke-width="2.2"/>`);
  for (let i = -2; i <= 2; i++) o.push(`<path d="M${250 + i * 10},${992 + Math.abs(i) * 3} L${250 + i * 10},${1028 - Math.abs(i) * 3}" stroke="#1e1a16" stroke-width="2.2"/>`);
  o.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#000" filter="url(#grain)" opacity="0.12"/>`);
  o.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="70" fill="url(#backShadow)"/>`);
  o.push(`<rect x="${x0}" y="${y0}" width="50" height="${y1 - y0}" fill="url(#sideShadowL)"/>`);
  o.push(`<rect x="${x1 - 50}" y="${y0}" width="50" height="${y1 - y0}" fill="url(#sideShadowR)"/>`);
  return o.join('\n');
}

function slab(x: number, y: number, w: number, h: number, r: () => number): string {
  const g = 2.5;
  const a: [number, number] = [x + g, y + g], b: [number, number] = [x + w - g, y + g], c: [number, number] = [x + w - g, y + h - g], d: [number, number] = [x + g, y + h - g];
  const tint = r();
  const base = tint < 0.15 ? '#b4a684' : tint < 0.3 ? '#d2b072' : SAND; // dalles plus grises ou plus dorées
  const fill = shade(base, (r() - 0.5) * 0.18 - (r() < 0.1 ? 0.12 : 0));
  const P = (ps: [number, number][]) => ps.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' ');
  const o: string[] = [];
  o.push(`<rect x="${f1(a[0])}" y="${f1(a[1])}" width="${f1(w - 2 * g)}" height="${f1(h - 2 * g)}" rx="6" fill="${fill}"/>`);
  o.push(`<rect x="${f1(a[0])}" y="${f1(a[1])}" width="${f1(w - 2 * g)}" height="${f1(h - 2 * g)}" rx="6" fill="url(#slabHi)"/>`);
  o.push(`<polyline points="${P([d, a, b])}" fill="none" stroke="${SAND_LIGHT}" stroke-width="2.4" stroke-linejoin="round" opacity="0.85"/>`);
  o.push(`<polyline points="${P([b, c, d])}" fill="none" stroke="${SAND_DARK}" stroke-width="2.2" stroke-linejoin="round" opacity="0.85"/>`);
  if (r() < 0.25) {
    const sx = x + w * (0.2 + r() * 0.5), sy = y + h * (0.2 + r() * 0.5);
    o.push(`<path d="M${f1(sx)},${f1(sy)} l${f1(6 + r() * 8)},${f1(3 + r() * 4)} l${f1(-3 + r() * 6)},7 l9,3" fill="none" stroke="${SAND_DARK}" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>`);
  }
  if (r() < 0.3) {
    // coin ébréché
    const cx = r() < 0.5 ? x + g : x + w - g, cy = r() < 0.5 ? y + g : y + h - g;
    const sx = cx === x + g ? 1 : -1, sy = cy === y + g ? 1 : -1, k = 6 + r() * 8;
    o.push(`<path d="M${f1(cx)},${f1(cy)} l${f1(sx * k)},0 l${f1(-sx * k * 0.3)},${f1(sy * k * 0.5)} l${f1(-sx * k * 0.7)},${f1(sy * k * 0.4)} Z" fill="${GROUT}"/>`);
  }
  return o.join('');
}

export function cryptRoomSvg(seed = 7): string {
  LIGHTS.length = 0;
  const r = rng(seed);
  const defs = `
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="4"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.4 -0.45"/>
    </filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
    <linearGradient id="vault" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1c0e"/><stop offset="1" stop-color="#5a2e18"/></linearGradient>
    <linearGradient id="ochre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5424"/><stop offset="0.45" stop-color="${OCHRE}"/><stop offset="1" stop-color="#b8863a"/></linearGradient>
    <linearGradient id="archG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e2c18"/><stop offset="1" stop-color="${ARCH}"/></linearGradient>
    <linearGradient id="pillarG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4e160c"/><stop offset="0.16" stop-color="#a8442c"/><stop offset="0.3" stop-color="#d0684a"/><stop offset="0.42" stop-color="#a03c26"/><stop offset="0.75" stop-color="#6a2214"/><stop offset="1" stop-color="#3a0c06"/></linearGradient>
    <radialGradient id="slabHi" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#fff6dc" stop-opacity="0.32"/><stop offset="1" stop-color="#fff6dc" stop-opacity="0"/></radialGradient>
    <linearGradient id="capG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f6ead0"/><stop offset="0.55" stop-color="#e2d0a0"/><stop offset="1" stop-color="#a8925e"/></linearGradient>
    <radialGradient id="socket" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="#2a1a0c"/><stop offset="1" stop-color="#6a5430"/></radialGradient>
    <radialGradient id="gateLight" cx="0.5" cy="0.62" r="0.7"><stop offset="0" stop-color="#ffe09a"/><stop offset="0.6" stop-color="#e0882c"/><stop offset="1" stop-color="#6a3a14"/></radialGradient>
    <linearGradient id="faceL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5e4626"/><stop offset="1" stop-color="#8a6c40"/></linearGradient>
    <linearGradient id="faceR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#4a3820"/><stop offset="1" stop-color="#7a5e36"/></linearGradient>
    <linearGradient id="backShadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a08" stop-opacity="0.5"/><stop offset="1" stop-color="#2a1a08" stop-opacity="0"/></linearGradient>
    <linearGradient id="sideShadowL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a1a08" stop-opacity="0.45"/><stop offset="1" stop-color="#2a1a08" stop-opacity="0"/></linearGradient>
    <linearGradient id="sideShadowR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#2a1a08" stop-opacity="0.5"/><stop offset="1" stop-color="#2a1a08" stop-opacity="0"/></linearGradient>`;
  const body = [floor(r), backWall(r), sideWalls(r)].join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ROOM_W} ${ROOM_H}" width="${ROOM_W}" height="${ROOM_H}"><defs>${defs}</defs>${body}</svg>`;
}
