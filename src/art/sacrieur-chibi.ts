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

  /* ================= Tête : grosse et ronde, de trois-quarts (le visage regarde vers la droite) ================= */
  const h: string[] = [];
  // pans du bandana qui flottent depuis le nœud (bout découpé en dents)
  h.push(blob('M40,38 Q29,29 16,30 Q10,30 5,33 L10,36 L4,39 L11,41 Q19,41 25,47 Q32,45 39,47 Z', col.c1, { ink: c1Ink }));
  h.push(`<path d="M36,39 Q25,34 13,36" fill="none" stroke="${shade(col.c1, -0.45)}" stroke-width="0.9" opacity="0.6"/>`);
  h.push(blob('M38,46 Q29,52 25,60 L22,66 L27,64 L29,69 Q35,61 42,54 Z', shade(col.c1, -0.08), { ink: c1Ink }));
  // mèche de nuque
  h.push(blob('M45,66 Q40,76 44,84 Q48,77 53,73 Z', col.hair, { ink: hairInk, rim: false }));
  // oreille arrière, longue et pointue
  h.push(blob('M43,58 Q27,53 7,43 Q15,63 43,71 Z', col.skin, { ink: skInk }));
  h.push(`<path d="M40,61 Q27,56 15,49 Q23,60 40,66 Z" fill="${shade(col.skin, -0.3)}" opacity="0.45"/>`);
  // oreille avant (dépasse derrière la joue droite)
  h.push(blob('M103,56 Q117,48 131,38 Q127,57 105,67 Z', col.skin, { ink: skInk }));
  h.push(`<path d="M106,58 Q117,51 126,44 Q122,56 107,63 Z" fill="${shade(col.skin, -0.3)}" opacity="0.45"/>`);
  // crâne et visage : rond, joues pleines, menton doux
  h.push(blob('M40,55 C40,33 55,21 73,21 C92,21 107,34 107,55 C107,74 94,89 74,90 C55,90 40,76 40,55 Z', col.skin, { ink: skInk, hl: [0.66, 0.5] }));
  // ombre portée sous le rebord du bandana
  h.push(`<path d="M41,50 C50,44 62,41 74,41 C88,41 99,44 107,50 L107,55 C98,49 87,46.5 74,46.5 C62,46.5 50,49 41,55 Z" fill="${shade(col.skin, -0.45)}" opacity="0.32"/>`);
  // joues
  h.push(`<ellipse cx="66" cy="73" rx="6.5" ry="3.4" fill="#e0606a" opacity="0.16"/><ellipse cx="97" cy="71" rx="4.5" ry="3" fill="#e0606a" opacity="0.14"/>`);
  // mèches : tempes et front, sous le rebord
  h.push(blob('M42,47 Q36,58 41,68 Q44,60 50,54 Z', col.hair, { ink: hairInk }));
  h.push(blob('M55,45 Q56,54 62,57 Q61,51 65,47 Z', col.hair, { ink: hairInk }));
  h.push(blob('M86,43 Q88,50 93,52 Q92,47 95,44 Z', col.hair, { ink: hairInk }));
  h.push(blob('M101,46 Q109,51 110,61 Q105,56 100,55 Z', col.hair, { ink: hairInk }));
  // yeux (trois-quarts : l'œil gauche, plus proche, est plus grand), blancs lumineux, contour sombre
  h.push(`<path d="M61.5,62 Q69,55.5 78,59.5 Q75.5,67.5 67,67 Q61.5,66 61.5,62 Z" fill="#fffef8" stroke="#2a1006" stroke-width="1.3" stroke-linejoin="round"/>`);
  h.push(`<path d="M88,59.5 Q94.5,55 100,57.5 Q98.5,64.5 93,64.5 Q88.5,63.8 88,59.5 Z" fill="#fffef8" stroke="#2a1006" stroke-width="1.3" stroke-linejoin="round"/>`);
  h.push(`<path d="M63.5,64.5 Q69.5,66.5 76,62.5 M89.5,61.8 Q94.5,63.6 98.6,60" fill="none" stroke="#d6e4ee" stroke-width="1.2" opacity="0.85"/>`);
  h.push(`<ellipse cx="68" cy="60.2" rx="2.4" ry="1.2" fill="#fff"/><ellipse cx="93.6" cy="58.4" rx="1.7" ry="0.9" fill="#fff"/>`);
  // sourcils froncés (épais, en biseau vers le nez)
  h.push(`<path d="M59.5,55.5 Q68,53 79,57 L78.5,58.6 Q68,55.6 60,57.4 Z M87.5,56.5 Q94,52.5 101.5,53 L101.5,54.6 Q94,54.6 88,58 Z" fill="#3a1608" stroke="#3a1608" stroke-width="0.8" stroke-linejoin="round"/>`);
  // peintures de guerre (couleur des bandages), deux traits sous chaque œil
  h.push(`<path d="M62,71 L71,69.5 M63.5,74.8 L69.5,73.8 M91,67.5 L98,66.4" stroke="${col.c2}" stroke-width="2.3" stroke-linecap="round" opacity="0.92"/>`);
  // petit nez de trois-quarts
  h.push(`<path d="M85.5,66 Q88.5,69.5 85.8,71.6" fill="none" stroke="${skInk}" stroke-width="1.2" stroke-linecap="round"/>`);
  h.push(`<ellipse cx="85.5" cy="71.4" rx="2.2" ry="1" fill="${shade(col.skin, -0.35)}" opacity="0.35"/>`);
  // bouche décidée, légèrement tombante
  h.push(`<path d="M76.5,79.5 Q82,77.6 88.5,79" fill="none" stroke="#2a1006" stroke-width="1.6" stroke-linecap="round"/>`);
  h.push(`<path d="M78.5,82.3 Q82.5,83.4 86.5,82.3" fill="none" stroke="${skInk}" stroke-width="0.8" opacity="0.45" stroke-linecap="round"/>`);
  // bandana-casque : il épouse le haut du crâne, rebord replié incliné (trois-quarts)
  h.push(blob('M37,52 C33,29 51,13 74,13 C97,13 111,29 108.5,50 C100,44 87,41 74,41 C59,41 45,45 37,52 Z', col.c1, { ink: c1Ink, hl: [0.66, 0.24] }));
  h.push(`<path d="M76,14 Q71,27 73,41 M52,20 Q47,32 47,45" fill="none" stroke="${shade(col.c1, -0.4)}" stroke-width="0.9" opacity="0.45"/>`);
  h.push(blob('M37,52 C45,45 59,41 74,41 C87,41 100,44 108.5,50 L108,55 C99,49 87,46.2 74,46.2 C59.5,46.2 46.5,49.6 38.4,56.6 Z', shade(col.c1, -0.12), { ink: c1Ink, flat: true, rim: false }));
  h.push(`<path d="M56,19 Q71,13.5 88,16" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity="0.32"/>`);
  // nœud à l'arrière
  h.push(blob('M34,38 Q37,31 44,33 Q47,41 41,46 Q35,45 34,38 Z', shade(col.c1, -0.05), { ink: c1Ink, w: 1.3 }));
  // pièce irrégulière cousue (points en croix), sur l'avant du bandana
  h.push(blob('M80,20 Q83.5,16.5 87,19 Q91.5,17.5 93,21.5 Q96.5,24 94,27.5 Q95.5,31.5 91.5,32 Q89,36 85.5,33 Q80.5,34.5 80,30.5 Q76,28.5 78.5,25 Q77,21.5 80,20 Z', col.c3, { ink: c3Ink, w: 1.2 }));
  const stitch = (x: number, y: number) => `M${x - 1.2},${y - 1.2} l2.4,2.4 m0,-2.4 l-2.4,2.4`;
  h.push(`<path d="${[stitch(80.5, 22.3), stitch(93, 23), stitch(79.5, 30), stitch(92, 31)].join(' ')}" stroke="#2a1406" stroke-width="1" stroke-linecap="round"/>`);
  const head = h.join('');

  const parts: Record<ChibiPart, string> = { legB, legF, armB, torso, armF, head };
  const content = part ? parts[part] : CHIBI_PARTS.map((k) => parts[k]).join('');
  return svg(CHIBI_W, CHIBI_H, '', content);
}

/** Le Sacrieur version Archero, avec ses couleurs (par défaut : celles du jeu). */
export const sacriChibi = (part?: ChibiPart, colors: SacriColors = SACRI_COLORS) => build(colors, part);
