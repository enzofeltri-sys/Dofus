import { smoothPath, svg } from './kit';
import { shade } from '../svg';

/**
 * Sacrieur façon Dofus 3, redessiné d'après les captures d'Enzo (écran de création du personnage).
 * Couleurs exactes du jeu : peau #E59B68, cheveux #F28F39, vêtements #7E752A / #852A34 / #FA950F / #76422C.
 * Silhouette élancée et sèche, bandana-casque kaki à pièce orange, oreilles pointues, yeux blancs,
 * bras et tibias bandés de bordeaux, pagne orange déchiqueté, pantalon kaki effiloché, pieds nus à lanières.
 * Trait fin et sombre, modelé doux (dégradés) avec une ombre franche côté dos. Regarde vers la DROITE.
 *
 * Mêmes 6 morceaux que l'ancien Sacrieur (jambes, bras, torse, tête) pour garder les animations.
 */

export const D3_PARTS = ['legB', 'legF', 'armB', 'torso', 'armF', 'head'] as const;
export type D3Part = (typeof D3_PARTS)[number];

export const D3_W = 140;
export const D3_H = 190;

export interface D3Opts {
  skin: string;
  hair: string;
  cap: string;
  wrap: string;
  cloth: string;
  leather: string;
  /** Échelle de la tête (1 = proportions du jeu). */
  head: number;
  /** Carrure (épaules, bras). */
  build: number;
  /** Expression : regard fermé (jeu) ou rictus montrant les dents. */
  grin: boolean;
  /** Épaisseur du trait. */
  line: number;
}

export const D3_DEFAULT: D3Opts = {
  skin: '#E59B68', hair: '#F28F39', cap: '#7E752A', wrap: '#852A34', cloth: '#FA950F', leather: '#76422C',
  head: 1, build: 1, grin: false, line: 1.25,
};

type Pt = [number, number];

/** Pieds (sol) et pivots dans le repère 140 × 190. */
export const D3_FOOT: Pt = [71, 183];
export function d3Pivots(o: D3Opts = D3_DEFAULT): Record<D3Part, Pt> {
  const sx = 3.5 * (o.build - 1);
  return {
    legB: [63, 106], legF: [80, 106],
    armB: [55 - sx, 66], torso: [71, 100], armF: [88 + sx, 66],
    head: [72, 58],
  };
}
/** Poing avant (tient l'arme). */
export function d3Hand(o: D3Opts = D3_DEFAULT): Pt {
  return [91 + 3.5 * (o.build - 1), 122];
}

let uid = 0;
const id = (p: string) => `${p}${uid++}`;

/** Forme modelée : dégradé vertical, ombre franche côté dos (gauche), reflet côté lumière, contour fin. */
function body(d: string, base: string, o: D3Opts, opts: { shadow?: number; light?: number; ink?: string; w?: number } = {}): string {
  const g = id('g'), c = id('c'), s = id('s');
  const ink = opts.ink ?? shade(base, -0.68);
  const sh = opts.shadow ?? 0.32;
  return [
    `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(base, 0.12)}"/><stop offset="1" stop-color="${shade(base, -0.12)}"/></linearGradient>`,
    `<linearGradient id="${s}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a0e06" stop-opacity="${sh}"/><stop offset="0.36" stop-color="#2a0e06" stop-opacity="${sh * 0.85}"/><stop offset="0.4" stop-color="#2a0e06" stop-opacity="0"/><stop offset="0.82" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="${opts.light ?? 0.16}"/></linearGradient>`,
    `<clipPath id="${c}"><path d="${d}"/></clipPath>`,
    `<path d="${d}" fill="url(#${g})"/>`,
    `<path d="${d}" fill="url(#${s})"/>`,
    `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${opts.w ?? o.line}" stroke-linejoin="round"/>`,
  ].join('');
}

/** Contour d'un membre effilé passant par des points (largeur w0 → w1), bouts arrondis. */
function taper(pts: Pt[], w0: number, w1: number): string {
  const n = pts.length;
  const L: Pt[] = [], R: Pt[] = [];
  const f = (v: number) => +v.toFixed(1);
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
    const nx = -dy / m, ny = dx / m, h = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
    L.push([f(pts[i][0] + nx * h), f(pts[i][1] + ny * h)]);
    R.push([f(pts[i][0] - nx * h), f(pts[i][1] - ny * h)]);
  }
  const dir = (i: number, j: number): Pt => {
    const dx = pts[j][0] - pts[i][0], dy = pts[j][1] - pts[i][1], m = Math.hypot(dx, dy) || 1;
    return [dx / m, dy / m];
  };
  const [ex, ey] = dir(n - 2, n - 1), [sx, sy] = dir(1, 0);
  const end = pts[n - 1], start = pts[0];
  const capEnd = ` Q${f(end[0] + ex * w1 * 0.75)},${f(end[1] + ey * w1 * 0.75)} ${R[n - 1][0]},${R[n - 1][1]}`;
  const back = smoothPath([...R].reverse()).replace(/^M[^ C]*/, '');
  const capStart = ` Q${f(start[0] + sx * w0 * 0.75)},${f(start[1] + sy * w0 * 0.75)} ${L[0][0]},${L[0][1]}`;
  return `${smoothPath(L)}${capEnd}${back}${capStart} Z`;
}

/** Bande bordeaux enroulée : base bordeaux, bandes couleur peau en croissants, modelé, contour. */
function wrapped(pts: Pt[], w0: number, w1: number, o: D3Opts, from = 0, step = 7): string {
  const d = taper(pts, w0, w1);
  const c = id('c');
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs) - 10, x1 = Math.max(...xs) + 10, y1 = Math.max(...ys) + 10;
  const ys0 = Math.max(from, Math.min(...ys) - 10);
  const bands: string[] = [];
  let k = 0;
  for (let y = ys0; y < y1; y += step, k++) {
    const j = [0, 2.2, -1.4, 1.6][k % 4];
    bands.push(`M${x0},${y + 4 + j} Q${(x0 + x1) / 2},${y - 3 + j} ${x1},${y + j}`);
  }
  const ink = shade(o.wrap, -0.62);
  return [
    `<clipPath id="${c}"><path d="${d}"/></clipPath>`,
    body(d, o.wrap, o, { ink, shadow: 0.3 }),
    `<g clip-path="url(#${c})"><path d="${bands.join(' ')}" fill="none" stroke="${shade(o.skin, -0.08)}" stroke-width="2.1" stroke-linecap="round"/>
      <path d="${bands.join(' ')}" fill="none" stroke="${ink}" stroke-width="0.6" opacity="0.55" transform="translate(0,1.5)"/></g>`,
    `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${o.line}" stroke-linejoin="round"/>`,
  ].join('');
}

/** Membre de peau (épaule) prolongé par la bande bordeaux à partir de `wrapFrom`. */
function arm(o: D3Opts, pts: Pt[], fist: Pt, back: boolean): string {
  const w0 = 11 * o.build, w1 = 8.2 * o.build;
  const skinInk = shade(o.skin, -0.64);
  const out: string[] = [];
  // épaule et haut du bras en peau
  out.push(body(taper(pts.slice(0, 3), w0, w0 * 0.9), o.skin, o, { ink: skinInk }));
  // bande bordeaux du milieu du bras au poignet
  out.push(wrapped(pts.slice(1), w0 * 0.93, w1, o, 0, 13));
  // poing ganté
  const [cx, cy] = fist, r = 6.4 * o.build;
  const fd = `M${cx - r},${cy - 2} Q${cx - r},${cy - r - 1} ${cx},${cy - r} Q${cx + r + 1},${cy - r + 1} ${cx + r},${cy + 1} Q${cx + r - 1},${cy + r} ${cx - 1},${cy + r} Q${cx - r - 1},${cy + r - 1} ${cx - r},${cy - 2} Z`;
  out.push(body(fd, shade(o.wrap, -0.05), o, { ink: shade(o.wrap, -0.65), light: 0.22 }));
  out.push(`<path d="M${cx - r + 2},${cy + 1} Q${cx},${cy + 3} ${cx + r - 2},${cy}" fill="none" stroke="${shade(o.wrap, -0.6)}" stroke-width="0.8" opacity="0.7"/>`);
  out.push(`<path d="M${cx + (back ? -2 : 2)},${cy - r + 2} Q${cx + (back ? -4 : 4)},${cy - 2} ${cx + (back ? -2 : 3)},${cy + 2}" fill="none" stroke="${shade(o.wrap, -0.6)}" stroke-width="0.8" opacity="0.6"/>`);
  return out.join('');
}

/** Jambe : pantalon ample effiloché, tibia bandé, pied nu à lanière. */
function leg(o: D3Opts, hipX: number, kneeX: number, footX: number, front: boolean): string {
  const out: string[] = [];
  const hem = 157;
  const skinInk = shade(o.skin, -0.64);
  // tibia bandé
  out.push(wrapped([[footX, hem - 6], [footX + 0.5, 167], [footX + 1, 176]], 8.6, 7.6, o, hem - 2, 8));
  // pied nu (orteils vers la droite) + lanière
  const fx = footX + 1;
  const foot = `M${fx - 5},174 Q${fx - 6.5},181 ${fx - 3},183 L${fx + 10},183 Q${fx + 13.5},182 ${fx + 12},178.5 Q${fx + 7},176 ${fx + 4},173 Z`;
  out.push(body(foot, o.skin, o, { ink: skinInk }));
  out.push(`<path d="M${fx + 6.5},180.6 l0,2 M${fx + 9.3},180.2 l0,2.2" stroke="${skinInk}" stroke-width="0.7" opacity="0.7"/>`);
  out.push(body(`M${fx - 4},176.5 L${fx + 7},178 L${fx + 7.5},180.4 L${fx - 4.5},179 Z`, o.wrap, o, { ink: shade(o.wrap, -0.62), w: 0.9 }));
  // pantalon : ample au genou, ourlet en dents
  const a = 8, b = 8.5;
  const pd = `M${hipX - a},102 C${hipX - a - 1.5},120 ${kneeX - b},132 ${footX - 11},${hem - 2} L${footX - 8},${hem + 3} L${footX - 5},${hem - 1} L${footX - 1.5},${hem + 4} L${footX + 2},${hem} L${footX + 5.5},${hem + 4} L${footX + 8.5},${hem - 1} L${footX + 11},${hem + 2} C${kneeX + b},130 ${hipX + a + 1.5},118 ${hipX + a},103 Z`;
  out.push(body(pd, o.cap, o, { ink: shade(o.cap, -0.66), shadow: front ? 0.28 : 0.4 }));
  // plis
  const fold = shade(o.cap, -0.45);
  out.push(`<path d="M${hipX + 2},112 Q${kneeX + 3},126 ${kneeX + 1},138 M${kneeX - 5},136 Q${footX - 4},146 ${footX - 6},${hem - 3}" fill="none" stroke="${fold}" stroke-width="0.9" opacity="0.7"/>`);
  if (front) {
    // pièces orange cousues (comme en jeu)
    for (const [x, y] of [[hipX + 7, 122], [kneeX + 6.5, 141]] as Pt[]) {
      out.push(`<circle cx="${x}" cy="${y}" r="2.3" fill="${o.cloth}" stroke="${shade(o.cloth, -0.6)}" stroke-width="0.8"/>`);
    }
  }
  return out.join('');
}

function build(o: D3Opts, part?: D3Part): string {
  uid = 0;
  const skinInk = shade(o.skin, -0.64);
  const sx = 3.5 * (o.build - 1);

  /* ---------- Jambes ---------- */
  const legB = leg(o, 63, 59, 58, false);
  const legF = leg(o, 80, 83, 84, true);

  /* ---------- Bras ---------- */
  const armB = arm(o, [[55 - sx, 66], [51 - sx, 80], [49 - sx, 95], [51 - sx, 108], [53 - sx, 115]], [54 - sx, 121], true);
  const armF = arm(o, [[88 + sx, 66], [92 + sx, 80], [94 + sx, 95], [92 + sx, 108], [90 + sx, 115]], [91 + sx, 122], false);

  /* ---------- Torse ---------- */
  const t: string[] = [];
  // cou
  t.push(body('M65,50 L78,50 L80,64 L63,64 Z', o.skin, o, { ink: skinInk, shadow: 0.4 }));
  // buste sec : épaules, pectoraux, taille fine
  const w = o.build;
  const L = (x: number) => 71 + (x - 71) * w;
  const chest = `M${L(53)},67 C${L(55)},59 ${L(64)},58 71,59 C${L(80)},58 ${L(89)},59 ${L(90)},67 C${L(91)},78 ${L(87)},88 85,100 L58,100 C${L(55)},88 ${L(52)},78 ${L(53)},67 Z`;
  t.push(body(chest, o.skin, o, { ink: skinInk, shadow: 0.3, light: 0.2 }));
  // modelé musculaire (pectoraux, sternum, abdominaux) : traits doux
  const mus = shade(o.skin, -0.42);
  t.push(`<path d="M59,72 Q64,79 71,77 Q78,79 84,72 M71,66 L71,96 M64,84 Q67,85 69,84 M73,84 Q76,85 79,84 M64.5,90 Q67,91 69,90 M73,90 Q76,91 78.5,90" fill="none" stroke="${mus}" stroke-width="0.9" stroke-linecap="round" opacity="0.6"/>`);
  t.push(`<path d="M59,73 Q64,80 71,78 Q66,82 60,78 Z" fill="${shade(o.skin, -0.3)}" opacity="0.35"/>`);
  // cœur bordeaux sur le pectoral + petites cicatrices
  t.push(`<path d="M80,70 q-2.4,-3.2 -4.7,-0.7 q-1.3,3.2 4.7,6.4 q6,-3.2 4.7,-6.4 q-2.3,-2.5 -4.7,0.7 Z" fill="${o.wrap}" stroke="${shade(o.wrap, -0.55)}" stroke-width="0.6"/>`);
  t.push(`<path d="M60,82 q-2,2 0,4 M84,86 q2,2 0,4" fill="none" stroke="${o.wrap}" stroke-width="1.4" stroke-linecap="round"/>`);
  // ceinture de cuir
  t.push(body('M57,95 Q71,99 86,95 L87,100 Q71,104 56,100 Z', o.leather, o, { ink: shade(o.leather, -0.6) }));
  // pagne orange déchiqueté
  t.push(body('M54,97 Q71,103 89,97 L91,103 L88,107 L90,115 L84,110 L81,121 L77,111 L73,119 L69,111 L64,121 L61,110 L55,116 L57,107 L53,104 Z', o.cloth, o, { ink: shade(o.cloth, -0.62), light: 0.25 }));
  t.push(`<path d="M56,101 Q71,106 87,101" fill="none" stroke="${shade(o.cloth, -0.35)}" stroke-width="0.9" opacity="0.7"/>`);
  // rabat de cuir devant
  t.push(body('M65,104 L72,105 L71,115 L68.5,113 L66.5,118 L64,112 Z', shade(o.leather, -0.08), o, { ink: shade(o.leather, -0.62) }));
  t.push(body('M72,105 L79,104 L80,113 L77.5,111 L75.5,117 L73,112 Z', o.leather, o, { ink: shade(o.leather, -0.62) }));
  t.push(body('M68,101.5 Q72,99 76,101.5 Q75,106 72,106.5 Q69,106 68,101.5 Z', shade(o.leather, 0.1), o, { ink: shade(o.leather, -0.62), w: 0.9 }));
  const torso = t.join('');

  /* ---------- Tête ---------- */
  const h: string[] = [];
  const hairInk = shade(o.hair, -0.6), capInk = shade(o.cap, -0.66);
  // pans du nœud du bandana (vers l'arrière)
  h.push(body('M56,24 Q46,18 38,22 Q45,25 41,32 Q49,30 56,31 Z', o.cap, o, { ink: capInk }));
  h.push(body('M55,30 Q47,35 43,43 Q51,41 57,35 Z', shade(o.cap, -0.08), o, { ink: capInk }));
  // oreille arrière, longue et pointue
  h.push(body('M60,39 Q49,35 36,29 Q44,41 59,47 Z', o.skin, o, { ink: skinInk }));
  h.push(`<path d="M57,41 Q49,38 42,34" fill="none" stroke="${skinInk}" stroke-width="0.8" opacity="0.6"/>`);
  // nuque : mèche orange
  h.push(body('M58,38 Q53,46 56,53 Q60,48 62,45 Z', o.hair, o, { ink: hairInk }));
  // visage fin, menton vers l'avant
  h.push(body('M58,27 C57,40 61,49 70,53 C76,56 82,56 86,52 C90,48 92,41 91,31 Z', o.skin, o, { ink: skinInk, shadow: 0.34, light: 0.18 }));
  // ombre portée du bandana sur le front
  h.push(`<path d="M58,29 Q75,27 91,32 L91,35 Q75,31 58,33 Z" fill="${shade(o.skin, -0.4)}" opacity="0.45"/>`);
  // oreille avant (dépasse derrière la joue)
  h.push(body('M89,36 Q97,32 104,27 Q100,37 90,42 Z', o.skin, o, { ink: skinInk }));
  // mèches orange sous le bandana
  h.push(body('M60,31 Q57,37 59,43 Q61,38 64,34 Z', o.hair, o, { ink: hairInk }));
  h.push(body('M86,32 Q93,34 95,40 Q91,38 88,37 Z', o.hair, o, { ink: hairInk }));
  // yeux blancs lumineux, regard dur (cernés sombres comme en jeu)
  h.push(`<path d="M63.5,37 Q69.5,33 76.5,36 Q72,42 65,40 Q63.5,39 63.5,37 Z" fill="${shade(o.skin, -0.55)}" opacity="0.55"/>`);
  h.push(`<path d="M80,36 Q86,32.5 91,34.5 Q89,40 82,39.5 Q80,38.5 80,36 Z" fill="${shade(o.skin, -0.55)}" opacity="0.55"/>`);
  h.push(`<path d="M65,37.6 Q70,34.6 75.5,36.6 Q71.5,40.4 66,39.3 Z" fill="#fffef8" stroke="#2a1006" stroke-width="0.8"/>`);
  h.push(`<path d="M81.4,36.4 Q86,33.8 89.6,35.2 Q88,39 83,38.6 Z" fill="#fffef8" stroke="#2a1006" stroke-width="0.8"/>`);
  h.push(`<path d="M64,35.6 L75.5,34.6 M81,34.4 L90,32.4" stroke="#2a1006" stroke-width="1.1" stroke-linecap="round"/>`);
  // peintures de guerre rouges
  h.push(`<path d="M67,43 L73,42 M83,42 L88,41" stroke="#c0283a" stroke-width="1.5" stroke-linecap="round"/>`);
  // nez et bouche
  h.push(`<path d="M88,40 Q90.5,43 88.5,45" fill="none" stroke="${skinInk}" stroke-width="0.8"/>`);
  if (o.grin) {
    h.push(`<path d="M75,48 Q81,53 88,47 Q82,50 75,48 Z" fill="#fffaf0" stroke="#3a1608" stroke-width="0.8"/>`);
    h.push(`<path d="M78,49.5 l0.8,1.6 M81.5,50 l0.4,1.7 M85,49 l-0.2,1.7" stroke="#3a1608" stroke-width="0.5"/>`);
  } else {
    h.push(`<path d="M77,49 Q82,47.5 87,48.5" fill="none" stroke="#3a1608" stroke-width="1" stroke-linecap="round"/>`);
  }
  // bandana-casque kaki, bord sur les sourcils
  h.push(body('M55,33 C52,16 63,8 76,8 C90,8 99,16 97,32 C88,28 66,28 55,33 Z', o.cap, o, { ink: capInk, light: 0.22 }));
  h.push(`<path d="M57,29 Q76,24 96,28" fill="none" stroke="${shade(o.cap, -0.4)}" stroke-width="0.9" opacity="0.7"/>`);
  h.push(`<path d="M62,14 Q72,10 82,11" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity="0.28"/>`);
  // pièce orange irrégulière, cousue de points sombres
  h.push(`<path d="M77,14.5 Q80,11.5 83,13.5 Q86.5,12 88,15.5 Q91,17.5 88.5,20.5 Q90,24 86,24.5 Q83.5,27.5 80.5,25 Q76.5,26.5 76,23 Q72.5,21 75,18 Q74,15 77,14.5 Z" fill="${o.cloth}" stroke="${shade(o.cloth, -0.6)}" stroke-width="0.8" stroke-linejoin="round"/>`);
  h.push(`<path d="M78.5,17 Q81,15.5 83,17" fill="none" stroke="#fff3c0" stroke-width="1" opacity="0.6" stroke-linecap="round"/>`);
  h.push(`<g fill="#3a1a06"><circle cx="77" cy="15.6" r="1"/><circle cx="88.3" cy="16.5" r="1"/><circle cx="75.6" cy="22.6" r="1"/><circle cx="87.6" cy="23.6" r="1"/><circle cx="82" cy="26" r="0.8"/></g>`);
  const head = `<g transform="translate(72,56) scale(${o.head}) translate(-72,-56)">${h.join('')}</g>`;

  const parts: Record<D3Part, string> = { legB, legF, armB, torso, armF, head };
  const content = part ? parts[part] : D3_PARTS.map((k) => parts[k]).join('');
  return svg(D3_W, D3_H, '', content);
}

/** Version A : fidèle au jeu (proportions et regard de l'écran de création). */
export const sacriD3A = (part?: D3Part) => build(D3_DEFAULT, part);
/** Version B : plus « berserker » (carrure un peu plus large, rictus). */
export const D3_B: D3Opts = { ...D3_DEFAULT, build: 1.1, grin: true };
export const sacriD3B = (part?: D3Part) => build(D3_B, part);
/** Version C : plus cartoon (tête plus grosse, plus lisible de loin sur téléphone). */
export const D3_C: D3Opts = { ...D3_DEFAULT, head: 1.15 };
export const sacriD3C = (part?: D3Part) => build(D3_C, part);
