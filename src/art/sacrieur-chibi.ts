import { svg } from './kit';
import { shade } from '../svg';

/**
 * Sacrieur « version Archero » (choix d'Enzo : proposition A).
 * Personnage chibi à nous qui reprend les codes du Sacrieur de Dofus : bandana-casque à pièce cousue et pans
 * flottants, longues oreilles pointues, mèches, yeux blancs, peintures de guerre, cœur sur le torse, avant-bras
 * bandés, gros poings gantés, pagne déchiqueté et pans de cuir, pantalon bouffant effiloché, pieds nus à lanières.
 * Proportions Archero (grosse tête ronde, petit corps trapu), modelé doux et brillant. Regarde vers la DROITE.
 *
 * Les couleurs se changent comme dans Dofus 3 : peau, cheveux et 4 couleurs de vêtements.
 * Mêmes 6 morceaux articulés que l'ancien Sacrieur (animations).
 */

export const CHIBI_PARTS = ['legB', 'legF', 'armB', 'torso', 'armF', 'head'] as const;
export type ChibiPart = (typeof CHIBI_PARTS)[number];
export const CHIBI_W = 140;
export const CHIBI_H = 170;

type Pt = [number, number];

/** Les 6 couleurs du personnage (mêmes emplacements que l'écran de création de Dofus 3). */
export interface SacriColors {
  /** Peau. */
  skin: string;
  /** Cheveux. */
  hair: string;
  /** Vêtements 1 : bandana et pantalon. */
  c1: string;
  /** Vêtements 2 : bandages, gants, cœur, lanières. */
  c2: string;
  /** Vêtements 3 : pièce du bandana, pagne, boutons. */
  c3: string;
  /** Vêtements 4 : ceinture et pans de cuir. */
  c4: string;
}

/** Couleurs du Sacrieur de Dofus 3 (écran de création). */
export const SACRI_COLORS: SacriColors = {
  skin: '#E59B68', hair: '#F28F39', c1: '#7E752A', c2: '#852A34', c3: '#FA950F', c4: '#76422C',
};
export const COLOR_SLOTS: { key: keyof SacriColors; label: string }[] = [
  { key: 'skin', label: 'Peau' }, { key: 'hair', label: 'Cheveux' },
  { key: 'c1', label: 'Vêtements 1' }, { key: 'c2', label: 'Vêtements 2' },
  { key: 'c3', label: 'Vêtements 3' }, { key: 'c4', label: 'Vêtements 4' },
];

export const CHIBI_FOOT: Pt = [71, 163];
export const CHIBI_PIVOTS: Record<ChibiPart, Pt> = {
  legB: [62, 124], legF: [80, 124], armB: [53, 97], torso: [71, 116], armF: [90, 97], head: [72, 92],
};
/** Poing avant (tient l'arme). */
export const CHIBI_HAND: Pt = [94, 124];

const LW = 1.7;
let n = 0;
/** Préfixe unique par dessin : plusieurs Sacrieurs peuvent cohabiter dans une même page sans mélanger leurs dégradés. */
let pre = 'sc';
let builds = 0;
const uid = (p: string) => `${pre}${p}${n++}`;

interface BlobOpts { ink?: string; w?: number; hl?: [number, number]; flat?: boolean; rim?: boolean }

/** Forme ronde et brillante : dégradé radial (lumière en haut à droite), ombre douce côté dos, liseré lumineux, contour. */
function blob(d: string, base: string, o: BlobOpts = {}): string {
  const g = uid('g'), s = uid('s'), c = uid('c');
  const ink = o.ink ?? shade(base, -0.7);
  const [hx, hy] = o.hl ?? [0.64, 0.3];
  return [
    `<radialGradient id="${g}" cx="${hx}" cy="${hy}" r="0.9"><stop offset="0" stop-color="${shade(base, o.flat ? 0.08 : 0.26)}"/><stop offset="0.5" stop-color="${base}"/><stop offset="1" stop-color="${shade(base, -0.24)}"/></radialGradient>`,
    `<linearGradient id="${s}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a0804" stop-opacity="0.26"/><stop offset="0.32" stop-color="#1a0804" stop-opacity="0"/></linearGradient>`,
    `<clipPath id="${c}"><path d="${d}"/></clipPath>`,
    `<path d="${d}" fill="url(#${g})"/>`,
    `<path d="${d}" fill="url(#${s})"/>`,
    // liseré de lumière côté droit (reflet « Archero »)
    o.rim === false ? '' : `<path d="${d}" fill="none" stroke="#fff" stroke-width="3" opacity="0.16" clip-path="url(#${c})" transform="translate(-1.6,1.2)"/>`,
    `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${o.w ?? LW}" stroke-linejoin="round" stroke-linecap="round"/>`,
  ].join('');
}

/** Bandage croisé (bandes claires en diagonale qui se croisent) sur une forme de couleur c2. */
function bandage(d: string, box: [number, number, number, number], col: SacriColors, step = 6.5): string {
  const c = uid('c');
  const [x0, y0, x1, y1] = box;
  const a: string[] = [], b: string[] = [];
  for (let y = y0 - 8; y < y1 + 4; y += step) {
    a.push(`M${x0 - 3},${y} L${x1 + 3},${y + 6}`);
    b.push(`M${x0 - 3},${y + 7} L${x1 + 3},${y + 1}`);
  }
  const light = shade(col.c2, 0.38), dark = shade(col.c2, -0.6);
  return [
    `<clipPath id="${c}"><path d="${d}"/></clipPath>`,
    blob(d, col.c2, { ink: dark }),
    `<g clip-path="url(#${c})">
      <path d="${a.join(' ')}" stroke="${dark}" stroke-width="2.4" opacity="0.6"/>
      <path d="${a.join(' ')}" stroke="${light}" stroke-width="1.3" opacity="0.7" transform="translate(0,-1)"/>
      <path d="${b.join(' ')}" stroke="${dark}" stroke-width="1.2" opacity="0.35"/>
    </g>`,
    `<path d="${d}" fill="none" stroke="${dark}" stroke-width="${LW}" stroke-linejoin="round"/>`,
  ].join('');
}

/** Gros poing ganté : jointures, pouce, reflet. `facing` : côté vers lequel pointe le pouce. */
function fist(cx: number, cy: number, r: number, col: SacriColors, facing: 1 | -1): string {
  const ink = shade(col.c2, -0.65);
  const d = `M${cx - r},${cy - r * 0.15} C${cx - r},${cy - r * 1.1} ${cx + r * 1.05},${cy - r * 1.15} ${cx + r},${cy - r * 0.1} C${cx + r * 1.02},${cy + r * 0.95} ${cx - r * 0.95},${cy + r * 1.05} ${cx - r},${cy - r * 0.15} Z`;
  const knuckles = [-0.55, -0.05, 0.45].map((k) => `M${cx + k * r - r * 0.18},${cy - r * 0.62} q${r * 0.24},${-r * 0.22} ${r * 0.44},0`).join(' ');
  const thumb = `M${cx + facing * r * 0.15},${cy + r * 0.05} q${facing * r * 0.75},${-r * 0.05} ${facing * r * 0.8},${r * 0.45} q${-facing * r * 0.2},${r * 0.35} ${-facing * r * 0.75},${r * 0.2}`;
  return blob(d, shade(col.c2, 0.06), { ink }) +
    `<path d="${knuckles}" fill="none" stroke="${ink}" stroke-width="1" opacity="0.65" stroke-linecap="round"/>` +
    `<path d="${thumb}" fill="${shade(col.c2, 0.02)}" stroke="${ink}" stroke-width="1.1" stroke-linejoin="round"/>` +
    `<ellipse cx="${cx + r * 0.3}" cy="${cy - r * 0.48}" rx="${r * 0.32}" ry="${r * 0.15}" fill="#fff" opacity="0.4"/>`;
}

function build(col: SacriColors, part?: ChibiPart): string {
  n = 0;
  pre = `sc${(builds++).toString(36)}`;
  const skInk = shade(col.skin, -0.66), c1Ink = shade(col.c1, -0.68), hairInk = shade(col.hair, -0.62);
  const c3Ink = shade(col.c3, -0.62), c4Ink = shade(col.c4, -0.62), c2Ink = shade(col.c2, -0.62);
  const paint = shade(col.c2, 0.3);

  /* ================= Jambes : pantalon bouffant effiloché, tibia bandé, pied nu à lanière ================= */
  const leg = (hipX: number, footX: number, front: boolean) => {
    const out: string[] = [];
    const top = 118, hem = 146;
    // tibia bandé (sous le pantalon)
    out.push(bandage(`M${footX - 5.2},${hem - 5} Q${footX},${hem - 7} ${footX + 5.2},${hem - 5} L${footX + 5.6},155 L${footX - 5.6},155 Z`, [footX - 6, hem - 6, footX + 6, 155], col, 5));
    // pied nu, orteils vers la droite, lanière croisée
    const foot = `M${footX - 6.5},153 Q${footX - 8.5},162.5 ${footX - 3},163 L${footX + 10.5},163 Q${footX + 15},162 ${footX + 12},157 Q${footX + 6},154.5 ${footX + 3.5},151.5 Z`;
    out.push(blob(foot, col.skin, { ink: skInk, rim: false }));
    out.push(`<path d="M${footX + 6.5},160.6 l0.3,2.2 M${footX + 9.5},160 l0.4,2.4" stroke="${skInk}" stroke-width="0.8" opacity="0.7"/>`);
    // lanière : un tour à la cheville et une bride sur le cou-de-pied
    const strap = `M${footX - 6.2},155.6 Q${footX},157.2 ${footX + 4.6},154.6 M${footX + 2.6},155.4 Q${footX + 6},158.4 ${footX + 9.5},157.6`;
    out.push(`<path d="${strap}" fill="none" stroke="${c2Ink}" stroke-width="3" stroke-linecap="round"/>`);
    out.push(`<path d="${strap}" fill="none" stroke="${col.c2}" stroke-width="1.7" stroke-linecap="round"/>`);
    // pantalon bouffant : ourlet en dents irrégulières
    const pd = `M${hipX - 9},${top} C${hipX - 15},${top + 9} ${footX - 14},${hem - 10} ${footX - 10.5},${hem - 1} L${footX - 7},${hem + 3.5} L${footX - 4},${hem} L${footX - 0.5},${hem + 4.5} L${footX + 3},${hem + 0.5} L${footX + 6.5},${hem + 3.8} L${footX + 9},${hem} L${footX + 11.5},${hem + 1.5} C${footX + 14.5},${hem - 12} ${hipX + 13.5},${top + 9} ${hipX + 9},${top} Z`;
    out.push(blob(pd, col.c1, { ink: c1Ink }));
    // plis du tissu
    out.push(`<path d="M${hipX + 1},${top + 7} Q${footX + 5},${hem - 13} ${footX + 3},${hem - 3} M${hipX - 5},${top + 10} Q${footX - 7},${hem - 12} ${footX - 6},${hem - 4}" fill="none" stroke="${shade(col.c1, -0.42)}" stroke-width="1" opacity="0.55" stroke-linecap="round"/>`);
    if (front) {
      // bouton et pièce cousue
      out.push(`<circle cx="${footX + 8}" cy="${hem - 11}" r="2.4" fill="${col.c3}" stroke="${c3Ink}" stroke-width="0.9"/><path d="M${footX + 7},${hem - 12} l2,2 m0,-2 l-2,2" stroke="${c3Ink}" stroke-width="0.6"/>`);
      out.push(`<path d="M${hipX - 4},${top + 12} l6,-1 l1,6 l-6,1 Z" fill="${shade(col.c1, -0.12)}" stroke="${c1Ink}" stroke-width="0.8"/><path d="M${hipX - 3},${top + 12.5} l4.5,4.5 M${hipX + 1.5},${top + 11.5} l-4,5" stroke="${shade(col.c1, -0.5)}" stroke-width="0.6"/>`);
    }
    return out.join('');
  };
  const legB = leg(62, 59, false);
  const legF = leg(80, 82, true);

  /* ================= Bras : épaule et biceps en peau, avant-bras bandé, bout de bandage, gros poing ================= */
  const arm = (sx: number, dir: 1 | -1, front: boolean) => {
    const out: string[] = [];
    const y = 97;
    const ex = sx + dir * 1.5, fx = sx + dir * 3;
    // haut du bras (peau) : deltoïde + biceps
    const up = `M${sx - 6.8},${y - 1} Q${sx},${y - 8.5} ${sx + 6.8},${y - 1} Q${ex + 7},${y + 7} ${ex + 5.8},${y + 11} L${ex - 5.8},${y + 11} Q${ex - 7},${y + 7} ${sx - 6.8},${y - 1} Z`;
    out.push(blob(up, col.skin, { ink: skInk }));
    out.push(`<path d="M${sx + dir * 2},${y + 2} Q${ex + dir * 4},${y + 6} ${ex + dir * 3},${y + 9}" fill="none" stroke="${shade(col.skin, -0.4)}" stroke-width="0.9" opacity="0.5"/>`);
    // avant-bras bandé, qui s'élargit vers le poing
    const fa = `M${ex - 6},${y + 9} Q${ex},${y + 7} ${ex + 6},${y + 9} L${fx + 6.8},${y + 21} L${fx - 6.8},${y + 21} Z`;
    out.push(bandage(fa, [Math.min(ex, fx) - 8, y + 8, Math.max(ex, fx) + 8, y + 22], col, 4.6));
    // bout de bandage qui flotte
    if (front) out.push(blob(`M${fx + dir * 5},${y + 13} q${dir * 7},-2 ${dir * 10},3 q${-dir * 4},0 ${-dir * 5},3 q${-dir * 3},-2 ${-dir * 5},-2 Z`, shade(col.c2, 0.08), { ink: c2Ink, w: 1.1, rim: false }));
    out.push(fist(fx, y + 27, 8.2, col, dir));
    return out.join('');
  };
  const armB = arm(53, -1, false);
  const armF = arm(90, 1, true);

  /* ================= Torse : trapu et musclé ================= */
  const t: string[] = [];
  // cou
  t.push(blob('M64,84 L80,84 L81,96 L63,96 Z', shade(col.skin, -0.1), { ink: skInk, rim: false }));
  // buste : épaules rondes, pectoraux, taille
  const chest = 'M52,99 C51,91 58,88.5 65,89.5 L78,89.5 C86,88.5 93,91 92,99 C93,108 89.5,115 85.5,121 L58.5,121 C54.5,115 51,108 52,99 Z';
  t.push(blob(chest, col.skin, { ink: skInk }));
  const mus = shade(col.skin, -0.42);
  t.push(`<path d="M58.5,99 Q65,106 71.5,103 Q78,106 85,99" fill="none" stroke="${mus}" stroke-width="1.1" stroke-linecap="round" opacity="0.6"/>`);
  t.push(`<path d="M58.5,99.5 Q65,106.5 71.5,103.5 Q66,108 60,104.5 Z" fill="${mus}" opacity="0.2"/>`);
  t.push(`<path d="M71.5,92 L71.5,116 M65.5,108.5 q3,1.3 5,0 M73.5,108.5 q3,1.3 5,0 M66,113 q2.8,1.2 4.6,0 M73.5,113 q2.8,1.2 4.6,0" fill="none" stroke="${mus}" stroke-width="0.9" stroke-linecap="round" opacity="0.5"/>`);
  t.push(`<ellipse cx="80" cy="94.5" rx="5" ry="2" fill="#fff" opacity="0.22"/>`);
  // cœur (marque du Sacrieur) + cicatrice
  t.push(`<path d="M80,97.5 q-2.8,-3.6 -5.5,-0.8 q-1.5,3.6 5.5,7.4 q7,-3.8 5.5,-7.4 q-2.7,-2.8 -5.5,0.8 Z" fill="${col.c2}" stroke="${c2Ink}" stroke-width="0.9"/>`);
  t.push(`<ellipse cx="78" cy="96" rx="1.4" ry="0.8" fill="#fff" opacity="0.5"/>`);
  t.push(`<path d="M58,107 l3,2.5 M57.5,110 l3,2.2" stroke="${shade(col.c2, 0.1)}" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>`);
  // ceinture de cuir
  t.push(blob('M56.5,112.5 Q71.5,117 87.5,112.5 L88.5,118.5 Q71.5,123 55.5,118.5 Z', col.c4, { ink: c4Ink, flat: true }));
  t.push(`<path d="M58,115 Q71.5,119.5 86,115" fill="none" stroke="${shade(col.c4, -0.5)}" stroke-width="0.7" stroke-dasharray="1.6 1.4" opacity="0.8"/>`);
  // pagne déchiqueté
  t.push(blob('M53.5,116 Q71.5,122.5 90.5,116 L92.5,122 L88.5,125 L90.5,132 L84.5,127.5 L80.5,137 L76.5,127.5 L71.5,135 L67,127.5 L62,137 L59,127.5 L53,132 L55,125 L51,122 Z', col.c3, { ink: c3Ink }));
  t.push(`<path d="M55,120 Q71.5,126 89,120" fill="none" stroke="${shade(col.c3, -0.35)}" stroke-width="0.9" opacity="0.6"/>`);
  // pans de cuir et nœud
  t.push(blob('M65,119 L71.5,120 L70.8,131 L68.4,129 L66.4,134 L64.2,128 Z', shade(col.c4, -0.06), { ink: c4Ink, flat: true, rim: false }));
  t.push(blob('M71.5,120 L78.5,119 L79.6,128 L77.2,126 L75.2,132.5 L72.8,127.5 Z', col.c4, { ink: c4Ink, flat: true, rim: false }));
  t.push(blob('M67.5,116 Q71.5,113 75.5,116 Q75,120.5 71.5,121 Q68,120.5 67.5,116 Z', shade(col.c4, 0.12), { ink: c4Ink, w: 1.1, rim: false }));
  const torso = t.join('');

  /* ================= Tête : grosse et ronde ================= */
  const h: string[] = [];
  // pans du bandana qui flottent (bout découpé en dents)
  h.push(blob('M41,44 Q30,35 17,35 Q11,35 6,38 L11,41 L5,44 L12,46 Q20,46 26,52 Q33,51 41,53 Z', col.c1, { ink: c1Ink }));
  h.push(`<path d="M37,45 Q26,40 14,41" fill="none" stroke="${shade(col.c1, -0.45)}" stroke-width="0.9" opacity="0.6"/>`);
  h.push(blob('M40,53 Q30,58 26,66 L23,72 L28,70 L30,75 Q36,67 44,60 Z', shade(col.c1, -0.08), { ink: c1Ink }));
  // mèche de nuque
  h.push(blob('M44,66 Q38,76 42,84 Q46,78 51,74 Z', col.hair, { ink: hairInk, rim: false }));
  // oreille arrière, longue et pointue
  h.push(blob('M41,66 Q26,62 5,51 Q14,71 41,79 Z', col.skin, { ink: skInk }));
  h.push(`<path d="M38,69 Q25,64 13,57 Q22,68 38,74 Z" fill="${shade(col.skin, -0.3)}" opacity="0.45"/>`);
  // visage rond, joues pleines, menton vers l'avant
  h.push(blob('M40,58 C39,36 56,24 75,24 C96,24 109,38 108,58 C107,77 95,90 76,91 C57,91 41,79 40,58 Z', col.skin, { ink: skInk, hl: [0.7, 0.45] }));
  // ombre portée du bandana sur le front
  h.push(`<path d="M41,53 Q75,44 107,52 L107,58 Q75,50 41,59 Z" fill="${shade(col.skin, -0.45)}" opacity="0.38"/>`);
  // joues
  h.push(`<ellipse cx="95" cy="76" rx="6" ry="3.2" fill="${shade(col.c2, 0.45)}" opacity="0.18"/>`);
  // oreille avant
  h.push(blob('M104,63 Q118,56 133,45 Q128,66 106,73 Z', col.skin, { ink: skInk }));
  h.push(`<path d="M107,65 Q118,59 128,51 Q123,63 108,69 Z" fill="${shade(col.skin, -0.3)}" opacity="0.45"/>`);
  // mèches : tempes et front
  h.push(blob('M44,52 Q37,63 43,75 Q46,66 53,60 Z', col.hair, { ink: hairInk }));
  h.push(blob('M53,54 Q54,64 61,68 Q60,61 64,56 Z', col.hair, { ink: hairInk }));
  h.push(blob('M86,51 Q88,59 93,62 Q92,56 95,52 Z', col.hair, { ink: hairInk }));
  h.push(blob('M100,51 Q111,56 112,67 Q107,62 101,61 Z', col.hair, { ink: hairInk }));
  // yeux : grands, blancs lumineux (signature du Sacrieur), halo léger
  h.push(`<path d="M64.5,65 Q73,56.5 83,61.5 Q80,72.5 70,71 Q64.5,69.5 64.5,65 Z" fill="${shade(col.skin, -0.5)}" opacity="0.26"/>`);
  h.push(`<path d="M88,61 Q97,55 105,58.5 Q103.5,69 95,69 Q88.5,67.5 88,61 Z" fill="${shade(col.skin, -0.5)}" opacity="0.26"/>`);
  h.push(`<path d="M66,65 Q73.5,58.5 82,62.5 Q79,71 71,70 Q66.5,69 66,65 Z" fill="#fffef8" stroke="#2a1006" stroke-width="1.3"/>`);
  h.push(`<path d="M89.5,61.5 Q97,56.5 103.5,59.5 Q102,67.5 95.5,67.5 Q90,66.5 89.5,61.5 Z" fill="#fffef8" stroke="#2a1006" stroke-width="1.3"/>`);
  h.push(`<path d="M68,67.5 Q74,69.5 80,64" fill="none" stroke="#d8e6ee" stroke-width="1.3" opacity="0.8"/><path d="M91.5,63.5 Q97,66 102,61" fill="none" stroke="#d8e6ee" stroke-width="1.2" opacity="0.8"/>`);
  h.push(`<ellipse cx="72.5" cy="63.6" rx="2.6" ry="1.3" fill="#fff"/><ellipse cx="95.5" cy="60.6" rx="2.1" ry="1.1" fill="#fff"/>`);
  // sourcils froncés
  h.push(`<path d="M63.5,58 Q73,57 83,60 M88,58 Q97,55 105,55.5" fill="none" stroke="#3a1608" stroke-width="2.2" stroke-linecap="round"/>`);
  // peintures de guerre (couleur des bandages)
  h.push(`<path d="M67.5,74.5 L77,73 M69.5,78.5 L75.5,77.5 M93,71.5 L101.5,70" stroke="${paint}" stroke-width="2.2" stroke-linecap="round"/>`);
  // nez, bouche décidée
  h.push(`<path d="M100,67.5 Q103.5,71 100.5,74.5 Q99,75 97.5,74.2" fill="none" stroke="${skInk}" stroke-width="1.1" stroke-linecap="round"/>`);
  h.push(`<path d="M83.5,81.5 Q91,79 99.5,80.5" fill="none" stroke="#2a1006" stroke-width="1.6" stroke-linecap="round"/><path d="M99.5,80.5 q1.5,-0.5 2.2,-2" fill="none" stroke="#2a1006" stroke-width="1.2" stroke-linecap="round"/>`);
  h.push(`<path d="M86,84.5 Q91,86 96,84.5" fill="none" stroke="${skInk}" stroke-width="0.8" opacity="0.5"/>`);
  // bandana-casque : dôme, coutures, rebord replié, nœud à l'arrière
  h.push(blob('M36,58 C32,30 52,12 75,12 C99,12 114,30 111,57 C99,50 50,49 36,58 Z', col.c1, { ink: c1Ink, hl: [0.65, 0.22] }));
  h.push(`<path d="M75,13 Q70,30 72,51 M52,22 Q48,38 49,54" fill="none" stroke="${shade(col.c1, -0.4)}" stroke-width="0.9" opacity="0.5"/>`);
  h.push(blob('M36.5,57.5 C50,48.5 99,49.5 110.8,56.5 L110,61 C98,54.5 51,53.5 37.5,62 Z', shade(col.c1, -0.12), { ink: c1Ink, flat: true, rim: false }));
  h.push(`<path d="M57,19 Q72,13 89,16" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity="0.32"/>`);
  h.push(blob('M34,44 Q38,37 45,40 Q47,48 41,52 Q35,51 34,44 Z', shade(col.c1, -0.05), { ink: c1Ink, w: 1.3 }));
  // pièce irrégulière cousue (points en croix)
  h.push(blob('M80,22 Q84,18 88,21 Q93,19 95,24 Q99,27 96,31 Q98,36 93,36.5 Q90,41 86,37.5 Q80,39.5 79.5,34.5 Q75,32 78,28 Q76,23.5 80,22 Z', col.c3, { ink: c3Ink, w: 1.2 }));
  const stitch = (x: number, y: number) => `M${x - 1.3},${y - 1.3} l2.6,2.6 m0,-2.6 l-2.6,2.6`;
  h.push(`<path d="${[stitch(80.5, 24.5), stitch(95, 25.5), stitch(79, 33.5), stitch(94, 35)].join(' ')}" stroke="#2a1406" stroke-width="1" stroke-linecap="round"/>`);
  const head = h.join('');

  const parts: Record<ChibiPart, string> = { legB, legF, armB, torso, armF, head };
  const content = part ? parts[part] : CHIBI_PARTS.map((k) => parts[k]).join('');
  return svg(CHIBI_W, CHIBI_H, '', content);
}

/** Le Sacrieur version Archero, avec ses couleurs (par défaut : celles du jeu). */
export const sacriChibi = (part?: ChibiPart, colors: SacriColors = SACRI_COLORS) => build(colors, part);
