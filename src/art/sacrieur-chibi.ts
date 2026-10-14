import { svg } from './kit';
import { shade } from '../svg';

/**
 * Sacrieur « version Archero » : pas une copie du Sacrieur de Dofus, mais un personnage chibi
 * qui en reprend les codes (bandana-casque kaki à pièce orange et ses pans, oreilles pointues,
 * mèches orange, yeux blancs, peintures rouges, cœur sur le torse, bandes bordeaux, poings gantés,
 * pagne orange déchiqueté, pantalon kaki effiloché, pieds nus à lanières).
 * Proportions Archero : grosse tête ronde, petit corps trapu, membres courts, formes rondes,
 * modelé doux et brillant, silhouette très lisible de loin. Regarde vers la DROITE.
 * Mêmes 6 morceaux articulés que l'ancien Sacrieur (pour les animations).
 */

export const CHIBI_PARTS = ['legB', 'legF', 'armB', 'torso', 'armF', 'head'] as const;
export type ChibiPart = (typeof CHIBI_PARTS)[number];
export const CHIBI_W = 140;
export const CHIBI_H = 170;

type Pt = [number, number];

export interface ChibiOpts {
  /** Taille de la tête (1 = Archero, ≈ 2,2 têtes de haut). */
  head: number;
  /** Corps plus long (0 = trapu Archero). */
  tall: number;
  /** Air furieux (sourcils, dents) ou déterminé. */
  rage: boolean;
  /** Poings et épaules plus gros (berserker). */
  heavy: boolean;
}
export const CHIBI_A: ChibiOpts = { head: 1, tall: 0, rage: false, heavy: false };
export const CHIBI_B: ChibiOpts = { head: 1, tall: 0, rage: true, heavy: true };
export const CHIBI_C: ChibiOpts = { head: 0.88, tall: 0, rage: false, heavy: false };

const C = {
  skin: '#E59B68', hair: '#F28F39', cap: '#7E752A', wrap: '#852A34', cloth: '#FA950F', leather: '#76422C',
};
const LW = 1.8;

let n = 0;
const uid = (p: string) => `${p}${n++}`;

/** Forme ronde et brillante : dégradé radial (lumière en haut à droite), ombre douce côté dos, contour sombre. */
function blob(d: string, base: string, opts: { ink?: string; w?: number; hl?: [number, number]; flat?: boolean } = {}): string {
  const g = uid('g'), s = uid('s');
  const ink = opts.ink ?? shade(base, -0.7);
  const [hx, hy] = opts.hl ?? [0.62, 0.3];
  return [
    `<radialGradient id="${g}" cx="${hx}" cy="${hy}" r="0.85"><stop offset="0" stop-color="${shade(base, opts.flat ? 0.08 : 0.24)}"/><stop offset="0.55" stop-color="${base}"/><stop offset="1" stop-color="${shade(base, -0.22)}"/></radialGradient>`,
    `<linearGradient id="${s}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a0804" stop-opacity="0.28"/><stop offset="0.3" stop-color="#1a0804" stop-opacity="0"/></linearGradient>`,
    `<path d="${d}" fill="url(#${g})"/>`,
    `<path d="${d}" fill="url(#${s})"/>`,
    `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${opts.w ?? LW}" stroke-linejoin="round" stroke-linecap="round"/>`,
  ].join('');
}

/** Bande bordeaux enroulée sur une forme (bandes couleur peau, irrégulières). */
function wrap(d: string, box: [number, number, number, number], step = 7): string {
  const c = uid('c');
  const [x0, y0, x1, y1] = box;
  const bands: string[] = [];
  let k = 0;
  for (let y = y0 + 3; y < y1; y += step, k++) {
    const j = [0, 1.6, -1, 1.2][k % 4];
    bands.push(`M${x0 - 2},${y + 3 + j} Q${(x0 + x1) / 2},${y - 2 + j} ${x1 + 2},${y + j}`);
  }
  return [
    `<clipPath id="${c}"><path d="${d}"/></clipPath>`,
    blob(d, C.wrap, { ink: shade(C.wrap, -0.62) }),
    `<g clip-path="url(#${c})"><path d="${bands.join(' ')}" fill="none" stroke="${shade(C.skin, -0.06)}" stroke-width="2.2" stroke-linecap="round"/></g>`,
    `<path d="${d}" fill="none" stroke="${shade(C.wrap, -0.62)}" stroke-width="${LW}" stroke-linejoin="round"/>`,
  ].join('');
}

/** Gros poing ganté bordeaux. */
function fist(cx: number, cy: number, r: number, facing: 1 | -1): string {
  const d = `M${cx - r},${cy} C${cx - r},${cy - r * 1.05} ${cx + r},${cy - r * 1.1} ${cx + r},${cy - 0.5} C${cx + r},${cy + r} ${cx - r},${cy + r * 1.05} ${cx - r},${cy} Z`;
  return blob(d, shade(C.wrap, 0.04), { ink: shade(C.wrap, -0.65) }) +
    `<path d="M${cx - r * 0.55},${cy + r * 0.25} Q${cx},${cy + r * 0.55} ${cx + r * 0.6},${cy + r * 0.2}" fill="none" stroke="${shade(C.wrap, -0.6)}" stroke-width="1" opacity="0.7"/>` +
    `<path d="M${cx + facing * r * 0.25},${cy - r * 0.75} Q${cx + facing * r * 0.75},${cy - r * 0.2} ${cx + facing * r * 0.35},${cy + r * 0.35}" fill="none" stroke="${shade(C.wrap, -0.6)}" stroke-width="1" opacity="0.6"/>` +
    `<ellipse cx="${cx + r * 0.25}" cy="${cy - r * 0.5}" rx="${r * 0.35}" ry="${r * 0.18}" fill="#fff" opacity="0.35"/>`;
}

export function chibiPivots(o: ChibiOpts = CHIBI_A): Record<ChibiPart, Pt> {
  const t = o.tall;
  return {
    legB: [62, 124 + t * 0.5], legF: [80, 124 + t * 0.5],
    armB: [53, 96 + t * 0.2], torso: [71, 116], armF: [90, 96 + t * 0.2],
    head: [72, 92 + t * 0.2],
  };
}
export const CHIBI_FOOT: Pt = [71, 162];
export function chibiHand(o: ChibiOpts = CHIBI_A): Pt {
  return [95, 121 + o.tall * 0.3];
}

function build(o: ChibiOpts, part?: ChibiPart): string {
  n = 0;
  const t = o.tall;
  const skinInk = shade(C.skin, -0.66), capInk = shade(C.cap, -0.68), hairInk = shade(C.hair, -0.62);
  const up = (dy: number, s: string) => `<g transform="translate(0,${dy})">${s}</g>`;

  /* ---------- Jambes : courtes, pantalon bouffant effiloché, tibia bandé, pied nu ---------- */
  const leg = (hipX: number, footX: number, front: boolean) => {
    const out: string[] = [];
    const top = 118 + t * 0.5, hem = 146;
    // tibia bandé + pied
    out.push(wrap(`M${footX - 5},${hem - 4} L${footX + 5},${hem - 4} L${footX + 5.5},155 L${footX - 5.5},155 Z`, [footX - 6, hem - 4, footX + 6, 155], 5));
    out.push(blob(`M${footX - 6},153 Q${footX - 8},162 ${footX - 3},162.5 L${footX + 10},162.5 Q${footX + 14},161 ${footX + 11},156.5 Q${footX + 5},154 ${footX + 3},151 Z`, C.skin, { ink: skinInk }));
    out.push(`<path d="M${footX - 5.5},156.5 L${footX + 7},158 L${footX + 7.4},160.4 L${footX - 6},159 Z" fill="${C.wrap}" stroke="${shade(C.wrap, -0.62)}" stroke-width="1"/>`);
    // pantalon bouffant
    const pd = `M${hipX - 9},${top} C${hipX - 14},${top + 10} ${footX - 13},${hem - 10} ${footX - 10},${hem} L${footX - 6},${hem + 3.5} L${footX - 2.5},${hem - 0.5} L${footX + 1.5},${hem + 4} L${footX + 5},${hem} L${footX + 8.5},${hem + 3} L${footX + 11},${hem - 1} C${footX + 14},${hem - 12} ${hipX + 13},${top + 10} ${hipX + 9},${top} Z`;
    out.push(blob(pd, C.cap, { ink: capInk }));
    out.push(`<path d="M${hipX + 2},${top + 8} Q${footX + 4},${hem - 12} ${footX + 2},${hem - 3}" fill="none" stroke="${shade(C.cap, -0.45)}" stroke-width="1" opacity="0.6"/>`);
    if (front) out.push(`<circle cx="${footX + 7}" cy="${hem - 11}" r="2.4" fill="${C.cloth}" stroke="${shade(C.cloth, -0.6)}" stroke-width="0.9"/>`);
    return out.join('');
  };
  const legB = leg(62, 59, false);
  const legF = leg(80, 82, true);

  /* ---------- Bras : courts et ronds, épaule en peau, bande bordeaux, gros poing ---------- */
  const fr = o.heavy ? 9 : 7.6;
  const arm = (sx: number, ex: number, fx: number, facing: 1 | -1) => {
    const y = 96 + t * 0.2;
    const sh = blob(`M${sx - 6.5},${y - 2} Q${sx},${y - 8} ${sx + 6.5},${y - 2} Q${sx + 7},${y + 8} ${sx},${y + 9} Q${sx - 7},${y + 8} ${sx - 6.5},${y - 2} Z`, C.skin, { ink: skinInk });
    const fa = `M${sx - 6},${y + 4} Q${ex - 7},${y + 14} ${fx - 5.5},${y + 21} L${fx + 5.5},${y + 21} Q${ex + 7},${y + 14} ${sx + 6},${y + 4} Z`;
    return sh + wrap(fa, [Math.min(sx, fx) - 8, y + 2, Math.max(sx, fx) + 8, y + 22], 6.5) + fist(fx, y + 25, fr, facing);
  };
  const armB = arm(53, 49, 50, -1);
  const armF = arm(90, 95, 95, 1);

  /* ---------- Torse : petit et trapu ---------- */
  const tt: string[] = [];
  const ty = t * 0.2;
  tt.push(blob(`M54,${92 + ty} C56,${84 + ty} 86,${84 + ty} 89,${92 + ty} C91,${104 + ty} 88,${114 + t * 0.5} 84,${120 + t * 0.5} L59,${120 + t * 0.5} C55,${114 + t * 0.5} 52,${104 + ty} 54,${92 + ty} Z`, C.skin, { ink: skinInk }));
  tt.push(`<path d="M60,${97 + ty} Q66,${102 + ty} 71.5,${100 + ty} Q77,${102 + ty} 83,${97 + ty} M71.5,${93 + ty} L71.5,${112 + t * 0.4}" fill="none" stroke="${shade(C.skin, -0.4)}" stroke-width="1" stroke-linecap="round" opacity="0.55"/>`);
  // cœur bordeaux
  tt.push(`<path d="M79,${94 + ty} q-2.6,-3.4 -5.2,-0.8 q-1.4,3.4 5.2,7 q6.6,-3.6 5.2,-7 q-2.6,-2.6 -5.2,0.8 Z" fill="${C.wrap}" stroke="${shade(C.wrap, -0.6)}" stroke-width="0.8"/>`);
  tt.push(`<ellipse cx="77.5" cy="${92.6 + ty}" rx="1.3" ry="0.8" fill="#fff" opacity="0.5"/>`);
  // ceinture, pagne déchiqueté, pans de cuir
  const by = 112 + t * 0.5;
  tt.push(blob(`M57,${by} Q71.5,${by + 4} 87,${by} L88,${by + 5.5} Q71.5,${by + 10} 56,${by + 5.5} Z`, C.leather, { ink: shade(C.leather, -0.62), flat: true }));
  tt.push(blob(`M54,${by + 3} Q71.5,${by + 9} 90,${by + 3} L92,${by + 9} L88,${by + 12} L90,${by + 19} L84,${by + 14} L80,${by + 23} L76,${by + 14} L71.5,${by + 21} L67,${by + 14} L62,${by + 23} L59,${by + 14} L53,${by + 19} L55,${by + 12} L51,${by + 9} Z`, C.cloth, { ink: shade(C.cloth, -0.62) }));
  tt.push(blob(`M66,${by + 6} L72,${by + 7} L71,${by + 17} L68.5,${by + 15} L66.5,${by + 20} L64.5,${by + 14} Z`, shade(C.leather, -0.06), { ink: shade(C.leather, -0.62), flat: true }));
  tt.push(blob(`M72,${by + 7} L78.5,${by + 6} L79.5,${by + 15} L77,${by + 13} L75,${by + 19} L73,${by + 14} Z`, C.leather, { ink: shade(C.leather, -0.62), flat: true }));
  const torso = tt.join('');

  /* ---------- Tête : grosse et ronde ---------- */
  const h: string[] = [];
  // pans du bandana qui flottent derrière
  h.push(blob('M40,44 Q26,34 13,38 Q22,44 15,54 Q28,52 40,54 Z', C.cap, { ink: capInk }));
  h.push(blob('M40,54 Q29,60 24,72 Q36,69 43,61 Z', shade(C.cap, -0.06), { ink: capInk }));
  // oreille arrière longue et pointue
  h.push(blob('M38,64 Q24,60 8,50 Q16,68 38,76 Z', C.skin, { ink: skinInk }));
  h.push(`<path d="M34,66 Q24,62 16,57" fill="none" stroke="${skinInk}" stroke-width="1" opacity="0.5"/>`);
  // tête (visage rond, joues pleines)
  h.push(blob('M38,58 C36,34 54,22 74,22 C96,22 110,36 109,58 C108,76 96,90 75,91 C54,91 40,78 38,58 Z', C.skin, { ink: skinInk, hl: [0.68, 0.45] }));
  // ombre du bandana sur le front
  h.push(`<path d="M40,52 Q74,44 108,52 L108,57 Q74,49 40,57 Z" fill="${shade(C.skin, -0.42)}" opacity="0.4"/>`);
  // oreille avant (dépasse à droite)
  h.push(blob('M104,60 Q116,54 128,44 Q124,62 106,70 Z', C.skin, { ink: skinInk }));
  // mèches orange
  h.push(blob('M42,52 Q37,62 41,72 Q45,63 50,57 Z', C.hair, { ink: hairInk }));
  h.push(blob('M100,52 Q110,55 113,64 Q107,61 102,60 Z', C.hair, { ink: hairInk }));
  h.push(blob('M58,50 Q60,60 66,63 Q66,56 70,52 Z', C.hair, { ink: hairInk }));
  // yeux : grands, blancs lumineux, contour sombre (signature du Sacrieur)
  const brow = o.rage ? 2.6 : 2;
  // grands yeux blancs lumineux, en amande, regard vif et dur
  h.push(`<path d="M64.5,65 Q73,56.5 83,61.5 Q80,72.5 70,71 Q64.5,69.5 64.5,65 Z" fill="${shade(C.skin, -0.5)}" opacity="0.28"/>`);
  h.push(`<path d="M88,61 Q97,55 105,58.5 Q103.5,69 95,69 Q88.5,67.5 88,61 Z" fill="${shade(C.skin, -0.5)}" opacity="0.28"/>`);
  h.push(`<path d="M66,65 Q73.5,58.5 82,62.5 Q79,71 71,70 Q66.5,69 66,65 Z" fill="#fffef8" stroke="#2a1006" stroke-width="1.3"/>`);
  h.push(`<path d="M89.5,61.5 Q97,56.5 103.5,59.5 Q102,67.5 95.5,67.5 Q90,66.5 89.5,61.5 Z" fill="#fffef8" stroke="#2a1006" stroke-width="1.3"/>`);
  h.push(`<ellipse cx="72.5" cy="63.8" rx="2.6" ry="1.3" fill="#fff"/><ellipse cx="95.5" cy="60.8" rx="2.1" ry="1.1" fill="#fff"/>`);
  h.push(`<path d="M${o.rage ? 63 : 64},${o.rage ? 56 : 58.5} L83,${o.rage ? 61 : 59.5} M88,${o.rage ? 59.5 : 57.5} L105,${o.rage ? 53 : 55}" stroke="#3a1608" stroke-width="${brow}" stroke-linecap="round"/>`);
  // peintures de guerre
  h.push(`<path d="M68,74 L77,72.5 M70,78 L76,77 M93,71 L101,69.5" stroke="#c0283a" stroke-width="2.1" stroke-linecap="round"/>`);
  // nez et bouche
  h.push(`<path d="M99,68 Q102,71.5 99.5,74" fill="none" stroke="${skinInk}" stroke-width="1"/>`);
  if (o.rage) {
    h.push(`<path d="M80,79 Q91,88 102,78 Q91,83 80,79 Z" fill="#5a1410" stroke="#2a1006" stroke-width="1"/>`);
    h.push(`<path d="M82,79.6 Q91,83.4 100,78.8 L99.4,80.8 Q91,85 83,81.4 Z" fill="#fffaf0" stroke="#2a1006" stroke-width="0.6"/>`);
  } else {
    h.push(`<path d="M84,81 Q91,79 99,80" fill="none" stroke="#2a1006" stroke-width="1.5" stroke-linecap="round"/>`);
  }
  // bandana-casque kaki, rond et épais, bord bombé
  h.push(blob('M36,58 C32,30 52,13 75,13 C99,13 114,30 111,56 C99,49 50,48 36,58 Z', C.cap, { ink: capInk, hl: [0.65, 0.25] }));
  h.push(`<path d="M39,53 Q75,42 109,51" fill="none" stroke="${shade(C.cap, -0.42)}" stroke-width="1.2" opacity="0.7"/>`);
  h.push(`<path d="M58,22 Q72,16 88,18" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="0.3"/>`);
  // pièce orange irrégulière cousue
  h.push(blob('M80,22 Q84,18 88,21 Q93,19 95,24 Q99,27 96,31 Q98,36 93,36.5 Q90,41 86,37.5 Q80,39.5 79.5,34.5 Q75,32 78,28 Q76,23.5 80,22 Z', C.cloth, { ink: shade(C.cloth, -0.62), w: 1.2 }));
  h.push(`<g fill="#3a1a06"><circle cx="80" cy="24" r="1.2"/><circle cx="95.5" cy="25.5" r="1.2"/><circle cx="78.5" cy="33.5" r="1.2"/><circle cx="94.5" cy="35" r="1.2"/></g>`);
  const head = `<g transform="translate(72,92) scale(${o.head}) translate(-72,-92)">${h.join('')}</g>`;

  const parts: Record<ChibiPart, string> = {
    legB, legF,
    armB: up(0, armB), torso, armF: up(0, armF),
    head: up(t * 0.2, head),
  };
  const content = part ? parts[part] : CHIBI_PARTS.map((k) => parts[k]).join('');
  return svg(CHIBI_W, CHIBI_H, '', content);
}

export const sacriChibiA = (part?: ChibiPart) => build(CHIBI_A, part);
export const sacriChibiB = (part?: ChibiPart) => build(CHIBI_B, part);
export const sacriChibiC = (part?: ChibiPart) => build(CHIBI_C, part);
