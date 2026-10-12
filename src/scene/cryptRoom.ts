import { TILE_H, TILE_W, rng } from '../iso';
import { shade } from '../svg';

/**
 * Fond statique d'une salle de la Crypte de Kardorim :
 * sol en dalles isométriques + deux murs de pierre (arrière-gauche, arrière-droit)
 * avec niches à crânes, torches, bannière et porte de sortie.
 *
 * Tout est généré en un seul SVG, rastérisé une fois.
 */

export const ROOM_N = 11; // salle de 11 × 11 cases
export const WALL_H = 190;
const PAD = 40;
const HW = TILE_W / 2;
const HH = TILE_H / 2;

export const ROOM_W = ROOM_N * TILE_W + PAD * 2;
export const ROOM_H = ROOM_N * TILE_H + WALL_H + PAD * 2;
/** Position, dans le SVG, du coin arrière de la salle (case 0,0). */
export const ORIGIN = { x: ROOM_N * HW + PAD, y: WALL_H + PAD };

const STONE = '#968b78';
const GROUT = '#4d463f';
const WALL_L = '#9a917f'; // mur gauche, éclairé
const WALL_R = '#7a7266'; // mur droit, dans l'ombre

function iso(x: number, y: number): [number, number] {
  return [ORIGIN.x + (x - y) * HW, ORIGIN.y + (x + y) * HH];
}
const pt = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

/** Points d'accroche des torches, en coordonnées du SVG (pour les halos et flammes animés). */
export const TORCHES: { x: number; y: number }[] = [];

// Repère local d'un mur : u = pixels le long du mur, v = pixels vers le bas (négatif = vers le haut).
const DIAG = Math.hypot(HW, HH);
const LEFT_M = { a: -HW / DIAG, b: HH / DIAG, e: ORIGIN.x, f: ORIGIN.y };
const RIGHT_M = { a: HW / DIAG, b: HH / DIAG, e: ORIGIN.x, f: ORIGIN.y };
const WALL_LEN = ROOM_N * DIAG;

function wallToScreen(m: typeof LEFT_M, u: number, v: number) {
  return { x: m.e + m.a * u, y: m.f + m.b * u + v };
}

function wall(m: typeof LEFT_M, base: string, seed: number, side: 'L' | 'R'): string {
  const r = rng(seed);
  const out: string[] = [];
  const mat = `matrix(${m.a} ${m.b} 0 1 ${m.e} ${m.f})`;
  out.push(`<g transform="${mat}">`);
  // fond du mur (joints)
  out.push(`<rect x="0" y="${-WALL_H}" width="${WALL_LEN}" height="${WALL_H}" fill="${GROUT}"/>`);
  // pierres de taille, rangées décalées
  const rowH = 27;
  for (let row = 0; row * rowH < WALL_H; row++) {
    const y0 = -(row + 1) * rowH;
    let u = row % 2 ? -22 : 0;
    while (u < WALL_LEN) {
      const w = 38 + r() * 26;
      const c = shade(base, (r() - 0.5) * 0.18);
      const x0 = Math.max(u + 2, 0);
      const x1 = Math.min(u + w - 2, WALL_LEN);
      if (x1 - x0 > 6) {
        out.push(`<rect x="${x0.toFixed(1)}" y="${(y0 + 2).toFixed(1)}" width="${(x1 - x0).toFixed(1)}" height="${rowH - 4}" rx="5" fill="${c}"/>`);
        // reflet sur l'arête haute de la pierre
        out.push(`<rect x="${(x0 + 3).toFixed(1)}" y="${(y0 + 3.5).toFixed(1)}" width="${(x1 - x0 - 6).toFixed(1)}" height="3" rx="1.5" fill="#fff" opacity="0.13"/>`);
        if (r() < 0.12) {
          const cx = x0 + (x1 - x0) * r();
          out.push(`<path d="M${cx},${y0 + 3} l4,8 l-3,6 l5,7" fill="none" stroke="${shade(base, -0.45)}" stroke-width="1.5" stroke-linecap="round"/>`);
        }
      }
      u += w;
    }
  }
  // dégradé d'ombre : le haut du mur se perd dans le noir de la crypte
  out.push(`<rect x="0" y="${-WALL_H}" width="${WALL_LEN}" height="${WALL_H}" fill="url(#wallFade)"/>`);
  // plinthe sombre au pied du mur
  out.push(`<rect x="0" y="-16" width="${WALL_LEN}" height="16" fill="${shade(base, -0.5)}" opacity="0.55"/>`);

  // décor du mur
  const niche = (u: number) => {
    out.push(`<path d="M${u - 26},-30 L${u - 26},-96 Q${u},-128 ${u + 26},-96 L${u + 26},-30 Z" fill="${shade(base, -0.25)}" stroke="${shade(base, -0.55)}" stroke-width="3"/>`);
    out.push(`<path d="M${u - 18},-34 L${u - 18},-92 Q${u},-116 ${u + 18},-92 L${u + 18},-34 Z" fill="#1d1820"/>`);
    // crâne dans la niche
    out.push(`<ellipse cx="${u}" cy="-52" rx="11" ry="10" fill="#e8dfc8" stroke="#6e5f44" stroke-width="2"/>`);
    out.push(`<ellipse cx="${u - 4}" cy="-52" rx="3" ry="3.4" fill="#2a2024"/><ellipse cx="${u + 4}" cy="-52" rx="3" ry="3.4" fill="#2a2024"/>`);
    out.push(`<rect x="${u - 6}" y="-44" width="12" height="5" rx="1.5" fill="#e8dfc8" stroke="#6e5f44" stroke-width="1.5"/>`);
    // bougie
    out.push(`<rect x="${u + 12}" y="-46" width="5" height="12" rx="1.5" fill="#efe3c0" stroke="#8a7a50" stroke-width="1"/>`);
    out.push(`<path d="M${u + 14.5},-54 q3,4 0,8 q-3,-4 0,-8 Z" fill="#ffcf5a"/>`);
  };
  const torch = (u: number) => {
    out.push(`<path d="M${u - 7},-92 L${u + 7},-92 L${u + 4},-78 L${u - 4},-78 Z" fill="#3b3337" stroke="#1a1618" stroke-width="2"/>`);
    out.push(`<rect x="${u - 2.5}" y="-80" width="5" height="22" rx="2" fill="#5a3d26" stroke="#2a1a10" stroke-width="1.5"/>`);
    out.push(`<path d="M${u - 10},-60 L${u + 10},-60" stroke="#3b3337" stroke-width="4" stroke-linecap="round"/>`);
    const p = wallToScreen(m, u, -100);
    TORCHES.push({ x: p.x, y: p.y });
  };
  const banner = (u: number) => {
    out.push(`<path d="M${u - 30},-170 L${u + 30},-170" stroke="#5a3d26" stroke-width="5" stroke-linecap="round"/>`);
    out.push(`<path d="M${u - 24},-168 L${u + 24},-168 L${u + 24},-92 L${u + 12},-100 L${u + 4},-86 L${u - 8},-98 L${u - 24},-88 Z" fill="#3f5a3a" stroke="#1f2e1c" stroke-width="3"/>`);
    out.push(`<ellipse cx="${u}" cy="-132" rx="11" ry="10" fill="#d9a62a" stroke="#6a4a10" stroke-width="2"/>`);
    out.push(`<ellipse cx="${u - 4}" cy="-133" rx="2.6" ry="3" fill="#3f5a3a"/><ellipse cx="${u + 4}" cy="-133" rx="2.6" ry="3" fill="#3f5a3a"/>`);
  };
  const door = (u: number) => {
    out.push(`<path d="M${u - 44},0 L${u - 44},-104 Q${u},-160 ${u + 44},-104 L${u + 44},0 Z" fill="${shade(base, -0.2)}" stroke="${shade(base, -0.55)}" stroke-width="3"/>`);
    out.push(`<path d="M${u - 34},0 L${u - 34},-100 Q${u},-146 ${u + 34},-100 L${u + 34},0 Z" fill="#5b3a22" stroke="#2a180c" stroke-width="3"/>`);
    for (const dx of [-17, 0, 17]) out.push(`<path d="M${u + dx},-2 L${u + dx},${dx === 0 ? -134 : -118}" stroke="#3d2412" stroke-width="2"/>`);
    out.push(`<path d="M${u - 34},-32 L${u + 34},-32 M${u - 34},-80 L${u + 34},-80" stroke="#43464d" stroke-width="6"/>`);
    out.push(`<circle cx="${u + 20}" cy="-56" r="5" fill="none" stroke="#c9a24a" stroke-width="2.5"/>`);
  };
  const cobweb = (u: number, dir: 1 | -1) => {
    const x = u, y = -WALL_H;
    out.push(`<g stroke="#e8e4f0" stroke-width="1" fill="none" opacity="0.35">
      <path d="M${x},${y} L${x + dir * 46},${y + 46} M${x},${y} L${x + dir * 20},${y + 56} M${x},${y} L${x + dir * 56},${y + 18}"/>
      <path d="M${x + dir * 14},${y + 4} Q${x + dir * 12},${y + 14} ${x + dir * 6},${y + 16} M${x + dir * 30},${y + 8} Q${x + dir * 26},${y + 26} ${x + dir * 12},${y + 34} M${x + dir * 44},${y + 13} Q${x + dir * 38},${y + 38} ${x + dir * 17},${y + 48}"/></g>`);
  };

  if (side === 'L') {
    niche(WALL_LEN * 0.22);
    torch(WALL_LEN * 0.4);
    banner(WALL_LEN * 0.56);
    torch(WALL_LEN * 0.72);
    niche(WALL_LEN * 0.88);
    cobweb(4, 1);
  } else {
    niche(WALL_LEN * 0.18);
    torch(WALL_LEN * 0.34);
    door(WALL_LEN * 0.55);
    torch(WALL_LEN * 0.76);
    niche(WALL_LEN * 0.9);
  }
  out.push('</g>');
  return out.join('\n');
}

function floor(): string {
  const r = rng(7);
  const out: string[] = [];
  const floorPoly = [iso(0, 0), iso(ROOM_N, 0), iso(ROOM_N, ROOM_N), iso(0, ROOM_N)].map(pt).join(' ');
  out.push(`<polygon points="${floorPoly}" fill="${GROUT}"/>`);
  for (let gx = 0; gx < ROOM_N; gx++) {
    for (let gy = 0; gy < ROOM_N; gy++) {
      const k = 0.05;
      const j = () => (r() - 0.5) * 0.05;
      const a = iso(gx + k + j(), gy + k + j()), b = iso(gx + 1 - k + j(), gy + k + j()), c = iso(gx + 1 - k + j(), gy + 1 - k + j()), d = iso(gx + k + j(), gy + 1 - k + j());
      const v = (r() - 0.5) * 0.22 + (r() < 0.12 ? -0.12 : 0);
      const fill = shade(STONE, v);
      out.push(`<polygon points="${[a, b, c, d].map(pt).join(' ')}" fill="${fill}" stroke="${shade(fill, -0.18)}" stroke-width="1.5" stroke-linejoin="round"/>`);
      // reflet sur les arêtes hautes de la dalle
      out.push(`<polyline points="${[d, a, b].map(pt).join(' ')}" fill="none" stroke="#fff" stroke-opacity="0.16" stroke-width="2"/>`);
      if (r() < 0.22) {
        const s = iso(gx + 0.25 + r() * 0.3, gy + 0.2 + r() * 0.3);
        out.push(`<path d="M${pt(s)} l${8 + r() * 6},${4 + r() * 3} l${-2 + r() * 4},${6} l${7},${2}" fill="none" stroke="${shade(fill, -0.42)}" stroke-width="1.4" stroke-linecap="round"/>`);
      }
      if ((gx === 0 || gy === 0) && r() < 0.5) {
        const m = iso(gx + 0.5, gy + 0.5);
        out.push(`<ellipse cx="${m[0]}" cy="${m[1]}" rx="${18 + r() * 14}" ry="${7 + r() * 5}" fill="#5d7a3a" opacity="0.32" filter="url(#soft)"/>`);
      }
    }
  }
  // tapis usé (rouge sombre, bordure dorée) menant à la porte
  out.push(carpet());
  // texture « peinte » sur tout le sol
  out.push(`<polygon points="${floorPoly}" fill="#000" filter="url(#grain)" opacity="0.16"/>`);
  // occlusion ambiante au pied des murs
  out.push(`<polygon points="${[iso(0, 0), iso(ROOM_N, 0), iso(ROOM_N, 1.3), iso(0, 1.3)].map(pt).join(' ')}" fill="url(#aoR)"/>`);
  out.push(`<polygon points="${[iso(0, 0), iso(1.3, 0), iso(1.3, ROOM_N), iso(0, ROOM_N)].map(pt).join(' ')}" fill="url(#aoL)"/>`);
  return out.join('\n');
}

function carpet(): string {
  const x0 = 5.15, x1 = 6.85, y0 = 0.15, y1 = 8.6;
  const poly = (a: number, b: number, c: number, d: number) => [iso(a, c), iso(b, c), iso(b, d), iso(a, d)].map(pt).join(' ');
  const out: string[] = [];
  out.push(`<polygon points="${poly(x0, x1, y0, y1)}" fill="#7a2a2c" stroke="#3a1012" stroke-width="2.5" stroke-linejoin="round"/>`);
  out.push(`<polygon points="${poly(x0 + 0.14, x1 - 0.14, y0 + 0.1, y1 - 0.14)}" fill="none" stroke="#c99a3a" stroke-width="3" opacity="0.85"/>`);
  out.push(`<polygon points="${poly(x0 + 0.3, x1 - 0.3, y0 + 0.25, y1 - 0.3)}" fill="#8c3234"/>`);
  // motifs en losange
  for (let y = 1; y < 8; y += 1.5) {
    const c = iso((x0 + x1) / 2, y);
    out.push(`<path d="M${c[0]},${c[1] - 9} l14,9 l-14,9 l-14,-9 Z" fill="none" stroke="#c99a3a" stroke-width="2" opacity="0.7"/>`);
  }
  // usure : taches et trou
  const w1 = iso(5.9, 6.4);
  out.push(`<ellipse cx="${w1[0]}" cy="${w1[1]}" rx="26" ry="11" fill="#4a1a1c" opacity="0.45" filter="url(#soft)"/>`);
  // franges côté salle
  const f0 = iso(x0, y1), f1 = iso(x1, y1);
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const fx = f0[0] + (f1[0] - f0[0]) * t, fy = f0[1] + (f1[1] - f0[1]) * t;
    out.push(`<path d="M${fx.toFixed(1)},${fy.toFixed(1)} l-3,7" stroke="#c99a3a" stroke-width="1.6" stroke-linecap="round"/>`);
  }
  return out.join('\n');
}

/** Épaisseur de la dalle de sol sur les deux bords avant (la salle « flotte », comme les cartes Dofus). */
function slabEdge(): string {
  const T = 34;
  const dn = (p: [number, number]): [number, number] => [p[0], p[1] + T];
  const left = [iso(0, ROOM_N), iso(ROOM_N, ROOM_N), dn(iso(ROOM_N, ROOM_N)), dn(iso(0, ROOM_N))];
  const right = [iso(ROOM_N, 0), iso(ROOM_N, ROOM_N), dn(iso(ROOM_N, ROOM_N)), dn(iso(ROOM_N, 0))];
  return [
    `<polygon points="${left.map(pt).join(' ')}" fill="#5a5148" stroke="#2b2622" stroke-width="2.5" stroke-linejoin="round"/>`,
    `<polygon points="${right.map(pt).join(' ')}" fill="#463f38" stroke="#2b2622" stroke-width="2.5" stroke-linejoin="round"/>`,
  ].join('\n');
}

function wallCaps(): string {
  // Chaperon (épaisseur) au sommet des murs.
  const t = 0.35;
  const up = (p: [number, number]): [number, number] => [p[0], p[1] - WALL_H];
  const capL = [up(iso(0, -t)), up(iso(0, ROOM_N)), up(iso(-t, ROOM_N)), up(iso(-t, -t))];
  const capR = [up(iso(-t, 0)), up(iso(ROOM_N, 0)), up(iso(ROOM_N, -t)), up(iso(-t, -t))];
  return [
    `<polygon points="${capL.map(pt).join(' ')}" fill="#5e574d" stroke="#2b2622" stroke-width="2.5" stroke-linejoin="round"/>`,
    `<polygon points="${capR.map(pt).join(' ')}" fill="#544e45" stroke="#2b2622" stroke-width="2.5" stroke-linejoin="round"/>`,
  ].join('\n');
}

export function cryptRoomSvg(): string {
  TORCHES.length = 0;
  const defs = `
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.4 -0.45"/>
    </filter>
    <filter id="soft"><feGaussianBlur stdDeviation="4"/></filter>
    <linearGradient id="wallFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d0a10" stop-opacity="0.85"/><stop offset="0.55" stop-color="#0d0a10" stop-opacity="0.1"/><stop offset="1" stop-color="#0d0a10" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoR" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.45"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoL" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.4"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>`;
  const body = [
    wall(LEFT_M, WALL_L, 11, 'L'),
    wall(RIGHT_M, WALL_R, 23, 'R'),
    wallCaps(),
    slabEdge(),
    floor(),
  ].join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ROOM_W} ${ROOM_H}" width="${ROOM_W}" height="${ROOM_H}"><defs>${defs}</defs>${body}</svg>`;
}
