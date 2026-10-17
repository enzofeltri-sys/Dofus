import { svg } from './kit';
import { shade } from '../svg';

/**
 * Monstres des Champs d'Incarnam « version Archero » (versions « chimériques » de Dofus 3 : pâles, éthérées, lumineuses).
 * Ils regardent vers la GAUCHE, comme les Chafers. Cadre 140 × 160, pieds en (70, 152).
 * - Tofu Chimérique : boule bleu pâle, crête en piques, gros yeux, petites ailes, pattes fines et pieds verts.
 * - Pissenlit Miroitant : aigrette de duvet translucide, grands yeux tristes cernés, sur une tige à deux pieds.
 * - Rose Vaporeuse : rose cyan en pétales superposés, sourcils froncés, feuilles, tige à deux pieds.
 * - Tournesol Nébuleux (élite) : pétales blancs, cœur sombre brillant qui grimace, tige à deux pieds.
 */

export const CRITTER_W = 140;
export const CRITTER_H = 160;
export const CRITTER_FOOT: [number, number] = [70, 152];

export type CritterKind = 'tofu' | 'pissenlit' | 'rose' | 'tournesol' | 'palichon' | 'orageux' | 'nuageux' | 'bouftor' | 'chakrobat' | 'tigrimas' | 'ronronchon';
export const TOFU_PARTS = ['wingB', 'legB', 'legF', 'body', 'crest', 'wingF'] as const;
export const PLANT_PARTS = ['legB', 'legF', 'stem', 'leafB', 'leafF', 'head'] as const;
export const SHEEP_PARTS = ['tail', 'legB', 'body', 'legF', 'head', 'horn'] as const;
export const CAT_PARTS = ['tail', 'legB', 'body', 'legF', 'head', 'wisp'] as const;
export type CritterPart = (typeof TOFU_PARTS)[number] | (typeof PLANT_PARTS)[number] | (typeof SHEEP_PARTS)[number] | (typeof CAT_PARTS)[number];
export const SHEEP: CritterKind[] = ['palichon', 'orageux', 'nuageux', 'bouftor'];
export const CATS: CritterKind[] = ['chakrobat', 'tigrimas', 'ronronchon'];
export const partsOf = (k: CritterKind): readonly CritterPart[] =>
  (k === 'tofu' ? TOFU_PARTS : SHEEP.includes(k) ? SHEEP_PARTS : CATS.includes(k) ? CAT_PARTS : PLANT_PARTS);
const SHEEP_PIVOTS: Partial<Record<CritterPart, [number, number]>> = { tail: [116, 98], legB: [104, 136], body: [80, 132], legF: [66, 138], head: [60, 110], horn: [60, 94] };

/** Pivots (rotation des morceaux) : hanches, base de la tige, attache de la tête… */
export const CRITTER_PIVOTS: Record<CritterKind, Partial<Record<CritterPart, [number, number]>>> = {
  tofu: { wingB: [104, 92], legB: [80, 128], legF: [62, 128], body: [72, 128], crest: [70, 62], wingF: [80, 114] },
  pissenlit: { legB: [70, 130], legF: [70, 130], stem: [70, 132], leafB: [72, 120], leafF: [68, 122], head: [70, 108] },
  rose: { legB: [70, 130], legF: [70, 130], stem: [70, 132], leafB: [74, 112], leafF: [66, 114], head: [70, 102] },
  tournesol: { legB: [70, 130], legF: [70, 130], stem: [70, 132], leafB: [74, 116], leafF: [66, 118], head: [70, 98] },
  palichon: SHEEP_PIVOTS, orageux: SHEEP_PIVOTS, nuageux: SHEEP_PIVOTS, bouftor: SHEEP_PIVOTS,
  chakrobat: { tail: [84, 128], legB: [78, 132], body: [70, 140], legF: [64, 132], head: [66, 96], wisp: [56, 34] },
  tigrimas: { tail: [102, 112], legB: [96, 132], body: [78, 140], legF: [64, 132], head: [62, 100], wisp: [24, 124] },
  ronronchon: { tail: [104, 110], legB: [100, 140], body: [76, 146], legF: [56, 140], head: [54, 104], wisp: [30, 70] },
};

type Parts = Partial<Record<CritterPart, string[]>>;
const LW = 1.8;
let n = 0;
let pre = 'cc';
let builds = 0;
const uid = (p: string) => `${pre}${p}${n++}`;
function begin() {
  n = 0;
  pre = `cc${(builds++).toString(36)}`;
}
const push = (P: Parts, k: CritterPart, ...s: string[]) => (P[k] ??= []).push(...s);

interface BlobOpts { ink?: string; w?: number; hl?: [number, number]; alpha?: number; rim?: boolean }
/** Forme ronde et brillante (lumière en haut à gauche). */
function blob(d: string, base: string, o: BlobOpts = {}): string {
  const g = uid('g'), c = uid('c');
  const ink = o.ink ?? shade(base, -0.62);
  const [hx, hy] = o.hl ?? [0.34, 0.28];
  return [
    `<radialGradient id="${g}" cx="${hx}" cy="${hy}" r="0.95"><stop offset="0" stop-color="${shade(base, 0.45)}"/><stop offset="0.45" stop-color="${base}"/><stop offset="1" stop-color="${shade(base, -0.22)}"/></radialGradient>`,
    `<clipPath id="${c}"><path d="${d}"/></clipPath>`,
    `<path d="${d}" fill="url(#${g})" ${o.alpha !== undefined ? `fill-opacity="${o.alpha}"` : ''}/>`,
    o.rim === false ? '' : `<path d="${d}" fill="none" stroke="#fff" stroke-width="3.2" opacity="0.28" clip-path="url(#${c})" transform="translate(1.8,1.6)"/>`,
    `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${o.w ?? LW}" stroke-linejoin="round" stroke-linecap="round"/>`,
  ].join('');
}
const circle = (cx: number, cy: number, r: number) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0 Z`;

/** Tube coloré (tige, patte) avec contour. */
function tube(d: string, w: number, col: string, ink = shade(col, -0.6)): string {
  return `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${w + LW * 2}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w * 0.28}" stroke-linecap="round" opacity="0.3" transform="translate(-${w * 0.2},-${w * 0.15})"/>`;
}

/** Halo éthéré (Incarnam) derrière une forme. */
const halo = (id: string, cx: number, cy: number, r: number, col: string) =>
  `<radialGradient id="${id}"><stop offset="0.55" stop-color="${col}" stop-opacity="0.45"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;

/** Petite étincelle à 4 branches. */
const spark = (x: number, y: number, s: number, op = 0.9) =>
  `<path d="M${x},${y - s} Q${x + s * 0.18},${y - s * 0.18} ${x + s},${y} Q${x + s * 0.18},${y + s * 0.18} ${x},${y + s} Q${x - s * 0.18},${y + s * 0.18} ${x - s},${y} Q${x - s * 0.18},${y - s * 0.18} ${x},${y - s} Z" fill="#fff" opacity="${op}"/>`;

/**
 * Œil chibi : blanc, iris, pupille et deux reflets (regard vers la gauche).
 * `lid` : paupière (0 = aucune, > 0 = fâché : trait épais incliné ; < 0 = triste : trait incliné dans l'autre sens).
 */
function eyeChibi(cx: number, cy: number, rx: number, ry: number, iris: string, o: { lid?: number; ring?: string; skin?: string; look?: [number, number] } = {}): string {
  const [lx, ly] = o.look ?? [-0.32, 0.12];
  const ix = cx + lx * rx, iy = cy + ly * ry;
  const out = [
    o.ring ? `<path d="${ellipse(cx, cy, rx + 4, ry + 4)}" fill="${o.ring}" opacity="0.45"/>` : '',
    `<path d="${ellipse(cx, cy, rx, ry)}" fill="#fdfdf8" stroke="#24323a" stroke-width="${LW}"/>`,
    `<ellipse cx="${ix}" cy="${iy}" rx="${rx * 0.52}" ry="${ry * 0.56}" fill="${iris}"/>`,
    `<ellipse cx="${ix}" cy="${iy + ry * 0.05}" rx="${rx * 0.28}" ry="${ry * 0.32}" fill="#101418"/>`,
    `<circle cx="${ix - rx * 0.16}" cy="${iy - ry * 0.2}" r="${Math.max(1.6, rx * 0.17)}" fill="#fff"/>`,
    `<circle cx="${ix + rx * 0.16}" cy="${iy + ry * 0.18}" r="${Math.max(0.9, rx * 0.08)}" fill="#fff" opacity="0.8"/>`,
  ];
  if (o.lid) {
    // paupière découpée dans l'œil (couleur de la peau), bord incliné : fâché (> 0, bord qui descend vers le nez) ou triste (< 0)
    const clip = uid('e');
    const y0 = cy - ry * 0.35, dy = ry * 0.32 * Math.sign(o.lid);
    out.push(`<clipPath id="${clip}"><path d="${ellipse(cx, cy, rx, ry)}"/></clipPath>`);
    out.push(`<path d="M${cx - rx - 2},${y0 - dy} L${cx + rx + 2},${y0 + dy} L${cx + rx + 2},${cy - ry - 2} L${cx - rx - 2},${cy - ry - 2} Z" fill="${o.skin ?? '#9fd2ee'}" clip-path="url(#${clip})"/>`);
    out.push(`<path d="M${cx - rx * 0.92},${y0 - dy * 0.92} L${cx + rx * 0.92},${y0 + dy * 0.92}" stroke="#24323a" stroke-width="3" stroke-linecap="round"/>`);
    out.push(`<path d="${ellipse(cx, cy, rx, ry)}" fill="none" stroke="#24323a" stroke-width="${LW}"/>`);
  }
  return out.join('');
}

/** Pied-racine : tige qui se termine en petit pied pointu (comme les plantes de Dofus). */
function rootLeg(x0: number, y0: number, x1: number, y1: number, toe: number, col: string): string {
  const mx = (x0 + x1) / 2 + (x1 > x0 ? 2 : -2);
  return tube(`M${x0},${y0} Q${mx},${(y0 + y1) / 2} ${x1},${y1}`, 6.5, col) +
    blob(`M${x1 - 5},${y1 - 3} Q${x1 + toe * 0.5},${y1 - 6} ${x1 + toe},${y1 + 1} Q${x1 + toe * 0.4},${y1 + 5} ${x1 - 5},${y1 + 4} Q${x1 - 8},${y1} ${x1 - 5},${y1 - 3} Z`, col);
}

function assemble(kind: CritterKind, P: Parts, part?: CritterPart, defs = ''): string {
  const body = part ? (P[part] ?? []).join('') : partsOf(kind).map((k) => (P[k] ?? []).join('')).join('');
  return svg(CRITTER_W, CRITTER_H, defs, body);
}

/* ---------------------------------------------------------------------------------------- */

const STEM = '#5f7684';

export function tofuSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const BLUE = '#9fd2ee', FOOT = '#8be3a4';
  push(P, 'wingB', blob(ellipse(108, 90, 13, 10), BLUE));
  push(P, 'legB', tube('M80,126 Q83,138 84,146', 3.4, '#6b8fa3'), blob(ellipse(88, 148, 11, 6), FOOT));
  push(P, 'legF', tube('M62,126 Q60,138 58,146', 3.4, '#6b8fa3'), blob(ellipse(54, 148, 12, 6.5), FOOT));
  // corps : boule bleu pâle translucide, halo éthéré
  push(P, 'body', halo(uid('h'), 74, 96, 54, '#c9ecff'));
  push(P, 'body', blob(circle(74, 98, 38), BLUE, { hl: [0.3, 0.22] }));
  push(P, 'body', `<path d="M48,82 Q56,68 72,64" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.55"/>`);
  // yeux énormes, tournés vers la gauche ; le plus proche déborde du corps
  push(P, 'body', eyeChibi(68, 94, 11.5, 15, '#3f7f62'), eyeChibi(46, 96, 13.5, 17, '#3f7f62'));
  push(P, 'body', spark(96, 78, 4.5, 0.85), spark(102, 112, 3, 0.6));
  // crête en piques
  push(P, 'crest', blob('M64,64 Q56,42 58,24 Q68,40 72,62 Z', BLUE), blob('M72,63 Q78,38 90,26 Q86,46 80,64 Z', BLUE), blob('M58,68 Q46,56 44,44 Q56,52 64,64 Z', BLUE));
  push(P, 'wingF', blob('M74,112 Q64,116 62,126 Q74,132 86,122 Q84,112 74,112 Z', BLUE));
  return assemble('tofu', P, part);
}

export function pissenlitSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  push(P, 'legB', rootLeg(71, 126, 82, 146, -12, STEM));
  push(P, 'legF', rootLeg(69, 126, 58, 147, -14, STEM));
  push(P, 'stem', tube('M70,134 Q66,120 70,104', 7, STEM));
  push(P, 'leafB', blob('M72,122 Q86,112 92,118 Q84,126 72,124 Z', '#7fa7a0'));
  push(P, 'leafF', blob('M68,124 Q52,118 46,124 Q56,132 68,127 Z', '#7fa7a0'));
  // aigrette : sphère de duvet translucide au bord pelucheux
  const h = uid('h');
  const fuzz = Array.from({ length: 46 }, (_, i) => {
    const a = (i / 46) * Math.PI * 2, r0 = 40, r1 = 45 + (i % 3) * 1.5;
    return `M${70 + Math.cos(a) * r0},${66 + Math.sin(a) * r0} L${70 + Math.cos(a) * r1},${66 + Math.sin(a) * r1}`;
  }).join(' ');
  push(P, 'head',
    halo(h, 70, 66, 58, '#e8fbff'),
    `<path d="${fuzz}" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity="0.9"/>`,
    blob(circle(70, 66, 41), '#eaf8f6', { alpha: 0.82, ink: '#9fc4c4', hl: [0.3, 0.25] }),
    `<path d="M40,52 Q50,32 72,28" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.75"/>`,
    // visage : grands yeux tristes cernés de sombre, petite bouche en accent circonflexe
    eyeChibi(78, 70, 11, 12.5, '#5b4a38', { ring: '#3e4a52', skin: '#dcefee', lid: -1, look: [-0.25, 0.3] }),
    eyeChibi(52, 71, 12, 13.5, '#5b4a38', { ring: '#3e4a52', skin: '#dcefee', lid: -1, look: [-0.25, 0.3] }),
    `<path d="M58,92 Q63,86 68,92" fill="none" stroke="#24323a" stroke-width="2.6" stroke-linecap="round"/>`,
    spark(98, 50, 4.5), spark(44, 96, 3, 0.7),
  );
  return assemble('pissenlit', P, part);
}

export function roseSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const PET = '#c8eef0', PET2 = '#a6e2e6';
  push(P, 'legB', rootLeg(71, 126, 83, 146, -12, STEM));
  push(P, 'legF', rootLeg(69, 126, 57, 147, -14, STEM));
  push(P, 'stem', tube('M70,134 Q74,118 70,100', 7, STEM));
  // épines
  push(P, 'stem', `<path d="M72,122 L78,119 L73,117 Z M68,112 L62,110 L67,107 Z" fill="${STEM}" stroke="${shade(STEM, -0.6)}" stroke-width="1"/>`);
  push(P, 'leafB', blob('M74,110 Q98,96 108,104 Q96,118 74,114 Z', '#a8d9cf'), `<path d="M78,111 Q92,106 104,104" stroke="#6a9a92" stroke-width="1.2" fill="none"/>`);
  push(P, 'leafF', blob('M66,112 Q40,100 30,108 Q44,122 66,116 Z', '#a8d9cf'), `<path d="M62,113 Q46,108 34,108" stroke="#6a9a92" stroke-width="1.2" fill="none"/>`);
  // bouton de rose : pétales extérieurs, puis intérieurs, spirale au sommet
  push(P, 'head',
    halo(uid('h'), 70, 70, 56, '#d8fbff'),
    blob('M30,74 Q26,50 44,40 Q52,62 44,92 Q32,88 30,74 Z', PET2),
    blob('M110,74 Q114,50 96,40 Q88,62 96,92 Q108,88 110,74 Z', PET2),
    blob('M36,64 Q32,46 44,36 Q50,26 62,30 Q70,20 80,28 Q94,26 98,38 Q110,48 104,66 Q108,84 94,94 Q84,104 70,100 Q54,104 46,94 Q32,84 36,64 Z', PET),
    blob('M46,42 Q56,24 72,32 Q86,22 96,40 Q84,34 72,40 Q58,32 46,42 Z', '#e6fbfb'),
    `<path d="M44,40 Q52,50 48,62 M96,40 Q88,50 92,62" fill="none" stroke="#7cbcc4" stroke-width="1.6" opacity="0.8"/>`,
    `<path d="M62,38 Q70,30 78,36 Q74,44 66,42 Q64,38 70,37" fill="none" stroke="#5a9aa2" stroke-width="2" stroke-linecap="round"/>`,
    `<path d="M40,66 Q46,92 70,98 M100,66 Q94,92 70,98" fill="none" stroke="#7cbcc4" stroke-width="1.6" opacity="0.8"/>`,
    // yeux fâchés (sourcils en V), regard vers la gauche
    eyeChibi(80, 66, 10, 12, '#2e6f74', { skin: '#bfe9ec', lid: 1, look: [-0.35, 0.18] }),
    eyeChibi(55, 67, 11, 13, '#2e6f74', { skin: '#bfe9ec', lid: 1, look: [-0.35, 0.18] }),
    `<path d="M58,86 Q66,82 74,86" fill="none" stroke="#24323a" stroke-width="2.6" stroke-linecap="round"/>`,
    spark(100, 44, 4), spark(38, 90, 3, 0.7),
  );
  return assemble('rose', P, part);
}

export function tournesolSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  push(P, 'legB', rootLeg(71, 126, 84, 146, -12, STEM));
  push(P, 'legF', rootLeg(69, 126, 56, 147, -14, STEM));
  push(P, 'stem', tube('M70,134 Q66,116 70,96', 8, STEM));
  push(P, 'leafB', blob('M74,114 Q98,102 106,110 Q96,122 74,118 Z', '#9cc7bd'));
  push(P, 'leafF', blob('M66,116 Q42,106 34,114 Q46,126 66,120 Z', '#9cc7bd'));
  // pétales blancs en couronne autour d'un cœur sombre et brillant
  const cx = 70, cy = 62;
  const petals = Array.from({ length: 13 }, (_, i) => {
    const a = (i / 13) * Math.PI * 2 - Math.PI / 2;
    const tip = [cx + Math.cos(a) * 54, cy + Math.sin(a) * 54];
    const l = [cx + Math.cos(a - 0.2) * 24, cy + Math.sin(a - 0.2) * 24];
    const r = [cx + Math.cos(a + 0.2) * 24, cy + Math.sin(a + 0.2) * 24];
    const cl = [cx + Math.cos(a - 0.17) * 46, cy + Math.sin(a - 0.17) * 46];
    const cr = [cx + Math.cos(a + 0.17) * 46, cy + Math.sin(a + 0.17) * 46];
    return blob(`M${l[0]},${l[1]} Q${cl[0]},${cl[1]} ${tip[0]},${tip[1]} Q${cr[0]},${cr[1]} ${r[0]},${r[1]} Z`, '#f4fbfb', { ink: '#8fb2b6', w: 1.4, rim: false });
  }).join('');
  push(P, 'head',
    halo(uid('h'), cx, cy, 64, '#e6fbff'),
    petals,
    blob(circle(cx - 2, cy + 2, 25), '#2e3a40', { ink: '#0e1418', hl: [0.32, 0.26] }),
    `<path d="M${cx - 18},${cy - 10} Q${cx - 8},${cy - 22} ${cx + 8},${cy - 18}" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity="0.5"/>`,
    // yeux plissés de rage, cernés de rose
    eyeChibi(cx + 6, cy - 2, 7.5, 9, '#7a2a3a', { ring: '#c2667a', skin: '#2e3a40', lid: 1, look: [-0.3, 0.2] }),
    eyeChibi(cx - 14, cy - 1, 8.5, 10, '#7a2a3a', { ring: '#c2667a', skin: '#2e3a40', lid: 1, look: [-0.3, 0.2] }),
    // grimace : dents serrées
    `<path d="M${cx - 20},${cy + 13} Q${cx - 6},${cy + 9} ${cx + 8},${cy + 13} L${cx + 7},${cy + 19} Q${cx - 6},${cy + 16} ${cx - 19},${cy + 19} Z" fill="#f4f4ee" stroke="#0e1418" stroke-width="1.6" stroke-linejoin="round"/>`,
    `<path d="M${cx - 14},${cy + 12} L${cx - 14},${cy + 18} M${cx - 8},${cy + 11} L${cx - 8},${cy + 17} M${cx - 2},${cy + 11} L${cx - 2},${cy + 17} M${cx + 4},${cy + 12} L${cx + 4},${cy + 18}" stroke="#0e1418" stroke-width="1.2"/>`,
    spark(cx + 34, cy - 30, 4.5), spark(cx - 40, cy + 26, 3, 0.7),
  );
  return assemble('tournesol', P, part);
}

/* ---------------------------------------------------------------------------------------- */
/* Pâturages d'Incarnam : Bouftous « chimériques » (moutons-nuages)                          */
/* ---------------------------------------------------------------------------------------- */

interface SheepStyle {
  fleece: string;
  face: string;
  hoof: string;
  iris: string;
  ear: string;
  /** Couleur du nez ; `false` = pas de nez. */
  nose?: string | false;
  sleepy?: boolean;
  horn: 'small' | 'ram';
  hornCol: string;
  crystals?: boolean;
}
const SHEEP_STYLE: Record<string, SheepStyle> = {
  palichon: { fleece: '#f2f7f6', face: '#a9bcb4', hoof: '#8ff0b4', iris: '#6a7a3a', ear: '#93aaa2', horn: 'small', hornCol: '#8fa49c' },
  orageux: { fleece: '#7f978b', face: '#1f2a25', hoof: '#eef8f4', iris: '#3a4a3a', ear: '#2a3630', horn: 'small', hornCol: '#f2f6f4' },
  nuageux: { fleece: '#f4f8f8', face: '#cfe2dc', hoof: '#8ff0b4', iris: '#2a5a7a', ear: '#b4cac4', nose: false, horn: 'small', hornCol: '#e6eeec' },
  bouftor: { fleece: '#eef7fb', face: '#c4d8dc', hoof: '#8ff0b4', iris: '#7a6a2a', ear: '#a8c6d0', nose: false, sleepy: true, horn: 'ram', hornCol: '#5e6662', crystals: true },
};

/** Toison en nuage : boules qui se chevauchent, contour commun (on trace tous les contours, puis tous les remplissages). */
function fleece(balls: [number, number, number][], col: string): string {
  const g = uid('fl');
  const ink = shade(col, -0.55);
  return `<radialGradient id="${g}" cx="0.35" cy="0.25" r="1"><stop offset="0" stop-color="${shade(col, 0.5)}"/><stop offset="0.55" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, -0.2)}"/></radialGradient>` +
    balls.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + LW}" fill="${ink}"/>`).join('') +
    balls.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${g})"/>`).join('') +
    balls.slice(0, 4).map(([x, y, r]) => `<path d="M${x - r * 0.55},${y - r * 0.35} q${r * 0.35},${-r * 0.4} ${r * 0.8},${-r * 0.2}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`).join('');
}

function sheepSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const S = SHEEP_STYLE[kind];
  const P: Parts = {};
  // pattes très courtes : seuls les sabots dépassent de la toison
  const leg = (x: number, y0: number) => tube(`M${x},${y0} L${x - 1},${y0 + 7}`, 8, shade(S.fleece, -0.15)) + blob(ellipse(x - 1, y0 + 10, 5.5, 3.5), S.hoof, { w: 1.4, rim: false });
  // queue (cristal pour le Bouftor)
  push(P, 'tail', S.crystals
    ? blob('M114,96 L130,74 L124,92 L138,86 L126,100 Z', '#bfe6f6', { ink: '#5a8aa0' }) + tube('M112,100 Q122,96 126,88', 3, '#7aa4b4')
    : blob(circle(118, 98, 9), S.fleece));
  push(P, 'legB', leg(96, 136), leg(112, 134));
  push(P, 'legF', leg(58, 138), leg(74, 140));
  // corps : toison
  const balls: [number, number, number][] = [[80, 98, 32], [102, 92, 22], [60, 92, 22], [84, 74, 22], [106, 110, 20], [62, 114, 20], [86, 118, 22], [70, 76, 16]];
  push(P, 'body', halo(uid('h'), 82, 98, 62, '#e4f6ff'), fleece(balls, S.fleece));
  if (S.crystals) {
    for (const [x, y, a, l] of [[96, 58, 0.2, 16], [114, 92, 1.2, 14], [110, 120, 2.2, 11]] as const) {
      const tx = x + Math.sin(a) * l, ty = y - Math.cos(a) * l;
      push(P, 'body', blob(`M${x - 5},${y} L${f(tx)},${f(ty)} L${x + 5},${y + 2} Z`, '#c8ecfa', { ink: '#5a8aa0', w: 1.4 }));
    }
  }
  push(P, 'body', spark(104, 70, 4), spark(66, 122, 3, 0.6));
  // tête : visage, oreille, œil, museau
  push(P, 'head',
    blob(ellipse(46, 108, 20, 19), S.face),
    fleece([[48, 88, 14], [62, 92, 12], [40, 96, 9]], S.fleece),
    blob('M62,102 Q74,96 76,106 Q68,112 62,108 Z', S.ear),
    eyeChibi(42, 108, 9.5, 11.5, S.iris, { look: [-0.4, 0.15], ...(S.sleepy ? { lid: -1, skin: S.face } : {}) }),
    S.nose === false ? '' : S.nose ? blob(ellipse(29, 117, 8, 6), S.nose) : `<ellipse cx="29" cy="117" rx="5" ry="3.5" fill="${shade(S.face, -0.5)}"/>`,
    `<path d="M32,124 Q38,128 44,124" fill="none" stroke="${shade(S.face, -0.6)}" stroke-width="2" stroke-linecap="round"/>`,
  );
  // cornes
  if (S.horn === 'ram') {
    // grosses cornes de bélier en pierre gravée
    // corne en spirale (pierre gravée) enroulée sur le côté de la tête
    const spiral = 'M56,98 C44,70 70,48 92,60 C114,72 108,104 86,110 C70,114 64,98 72,90 C78,84 88,88 86,96';
    const back = 'M66,90 C66,70 84,58 100,64 C110,68 112,80 106,86';
    // plus petite (réduite autour de l'attache de la tête)
    push(P, 'horn', `<g transform="translate(60,96) scale(0.62) translate(-60,-96)">` +
      tube(back, 14, shade(S.hornCol, -0.25), '#1e2220') +
      tube(spiral, 19, S.hornCol, '#1e2220') +
      `<path d="M58,76 l7,5 M76,58 l2,8 M98,64 l-4,7 M106,88 l-8,0 M94,106 l-4,-6" stroke="#c8d0cc" stroke-width="2.4" stroke-linecap="round"/>` +
      `<path d="M62,70 Q72,56 88,56" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.35"/></g>`);
  } else {
    push(P, 'horn', blob('M48,82 Q46,70 54,66 Q60,70 56,82 Z', S.hornCol));
  }
  return assemble(kind, P, part);
}
const f = (n: number) => n.toFixed(1);

/* ---------------------------------------------------------------------------------------- */
/* Forêt d'Incarnam : chats fantômes (Dofus 3) — silhouette d'un seul tenant, blanc en haut,   */
/* cyan en bas, contour fin ; petits yeux, moustaches vertes ; feux follets lumineux à yeux.   */
/* ---------------------------------------------------------------------------------------- */

const CAT_INK = '#5b8ca4';
const WHISKER = '#4fdc95';

/** Capsule (segment aux bouts ronds) de (x1,y1) à (x2,y2), rayon r. */
function capsule(x1: number, y1: number, x2: number, y2: number, r: number): string {
  const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * r, ny = Math.cos(a) * r;
  return `M${f(x1 + nx)},${f(y1 + ny)} L${f(x2 + nx)},${f(y2 + ny)} A${r},${r} 0 0,0 ${f(x2 - nx)},${f(y2 - ny)} L${f(x1 - nx)},${f(y1 - ny)} A${r},${r} 0 0,0 ${f(x1 + nx)},${f(y1 + ny)} Z`;
}

/** Silhouette fusionnée : tous les contours, puis tous les remplissages (même dégradé vertical), puis un reflet. */
function catBody(shapes: string[], top: number, bottom: number, hl: string[] = []): string {
  const g = uid('cg');
  return `<linearGradient id="${g}" gradientUnits="userSpaceOnUse" x1="0" y1="${top}" x2="0" y2="${bottom}"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#e6f5fb"/><stop offset="1" stop-color="#a6d8ec"/></linearGradient>` +
    shapes.map((d) => `<path d="${d}" fill="none" stroke="${CAT_INK}" stroke-width="3.2" stroke-linejoin="round"/>`).join('') +
    shapes.map((d) => `<path d="${d}" fill="url(#${g})" stroke="url(#${g})" stroke-width="0.6" stroke-linejoin="round"/>`).join('') +
    hl.map((d) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity="0.85"/>`).join('');
}

/** Feu follet : boule lumineuse (cœur blanc), petite flamme au-dessus, deux yeux ronds. */
function glowOrb(x: number, y: number, r: number, col: string, look = -0.3): string {
  const g = uid('og'), h = uid('oh');
  const flame = `M${x - r * 0.8},${y - r * 0.4} Q${x - r * 0.6},${y - r * 1.5} ${x + r * 0.15},${y - r * 2.1} Q${x},${y - r * 1.3} ${x + r * 0.75},${y - r * 0.9} Q${x + r},${y - r * 0.5} ${x + r * 0.8},${y - r * 0.2} Z`;
  const eye = (ex: number, s: number) => `<ellipse cx="${f(ex)}" cy="${f(y + r * 0.12)}" rx="${f(s)}" ry="${f(s * 1.15)}" fill="#fff" stroke="#1d2a30" stroke-width="1.1"/><circle cx="${f(ex + look * s)}" cy="${f(y + r * 0.18)}" r="${f(s * 0.5)}" fill="#1d2a30"/>`;
  return `<radialGradient id="${h}"><stop offset="0.35" stop-color="${col}" stop-opacity="0.6"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${g}" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="${shade(col, 0.55)}"/><stop offset="1" stop-color="${col}"/></radialGradient>` +
    `<circle cx="${x}" cy="${y - r * 0.3}" r="${r * 2.3}" fill="url(#${h})"/>` +
    `<path d="${flame}" fill="${shade(col, 0.3)}" stroke="${shade(col, -0.35)}" stroke-width="1"/>` +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${g})" stroke="${shade(col, -0.35)}" stroke-width="1"/>` +
    eye(x - r * 0.38, r * 0.27) + eye(x + r * 0.3, r * 0.23);
}

const ear = (x0: number, y0: number, tx: number, ty: number, x1: number, y1: number) => `M${x0},${y0} Q${tx - 3},${ty + 8} ${tx},${ty} Q${tx + 5},${ty + 9} ${x1},${y1} Z`;
const whiskers = (x: number, y: number, dir = -1) =>
  `<path d="M${x},${y} l${dir * 15},-6 M${x},${y + 3} l${dir * 17},0 M${x},${y + 6} l${dir * 14},6" stroke="${WHISKER}" stroke-width="1.5" stroke-linecap="round"/>`;
/** Queue effilée qui se termine en pointe cyan. */
const catTail = (d: string, w: number) => {
  const g = uid('tg');
  return `<linearGradient id="${g}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e6f5fb"/><stop offset="1" stop-color="#8fcde6"/></linearGradient>` +
    `<path d="${d}" fill="none" stroke="${CAT_INK}" stroke-width="${w + 3.2}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#${g})" stroke-width="${w}" stroke-linecap="round"/>`;
};
const DARK = '#1d2a30';

function catSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  if (kind === 'chakrobat') {
    // acrobate étiré, dressé sur ses pattes arrière, bras tendus vers le feu follet bleu ; il hurle de joie, yeux plissés
    push(P, 'tail', catTail('M78,126 Q104,134 100,148 Q97,156 110,154', 5));
    push(P, 'legB', catBody([capsule(76, 122, 82, 144, 6), ellipse(84, 147, 7.5, 4.5)], 110, 152));
    push(P, 'legF', catBody([capsule(62, 122, 58, 145, 6), ellipse(56, 148, 8, 4.5)], 110, 152));
    push(P, 'body', catBody([capsule(80, 96, 66, 44, 4.5)], 40, 100), catBody([ellipse(70, 106, 15, 24)], 82, 132, ['M62,92 Q64,86 70,84']));
    push(P, 'head',
      catBody([ear(48, 62, 44, 40, 60, 56), ear(64, 55, 78, 40, 80, 64), ellipse(63, 72, 21, 18)], 38, 92, ['M50,62 Q56,56 64,57']),
      `<path d="M46,66 q4,-4 8,0 M62,65 q4,-4 8,0" fill="none" stroke="${DARK}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<path d="M46,76 Q47,92 56,92 Q64,91 63,77 Q55,79 46,76 Z" fill="#a8202e" stroke="${DARK}" stroke-width="1.4"/><path d="M50,88 Q55,85 60,88 Q56,92 50,88 Z" fill="#ea6f7c"/>`,
      `<path d="M49,77.5 l2,3.2 l2,-2.8 M58,78.5 l1.8,3 l1.8,-3.2" fill="#fff"/>`,
      whiskers(44, 76), whiskers(80, 74, 1),
      catBody([capsule(60, 96, 28, 74, 4.5), capsule(28, 74, 44, 44, 4.5)], 40, 96));
    push(P, 'wisp', glowOrb(56, 34, 12, '#7fd3ff'));
  } else if (kind === 'tigrimas') {
    // chat rond en plein bond, la queue dressée en crochet, sourire carnassier ; son feu follet vert roule devant lui
    push(P, 'tail', catTail('M104,108 Q128,98 124,64 Q120,40 134,32', 6.5));
    push(P, 'legB', catBody([capsule(104, 120, 112, 138, 7.5), ellipse(114, 141, 9, 5)], 100, 146));
    push(P, 'legF', catBody([capsule(66, 122, 58, 138, 7), ellipse(55, 141, 9, 5), capsule(80, 124, 78, 141, 7), ellipse(76, 144, 8.5, 5)], 110, 148));
    push(P, 'body', catBody([ellipse(88, 110, 28, 23)], 86, 134, ['M78,94 Q90,88 102,92']));
    push(P, 'head',
      catBody([ear(36, 66, 33, 42, 52, 58), ear(60, 57, 74, 38, 80, 66), ellipse(57, 82, 28, 24)], 40, 106, ['M40,70 Q48,62 60,62']),
      // yeux plissés de malice
      `<path d="M38,76 Q43,71 49,75 Q44,79 38,76 Z M58,74 Q64,69 70,74 Q64,78 58,74 Z" fill="${DARK}"/><circle cx="42" cy="75" r="1.1" fill="#fff"/><circle cx="62" cy="73" r="1.1" fill="#fff"/>`,
      `<path d="M36,70 L49,72 M57,70 L71,69" stroke="${DARK}" stroke-width="2" stroke-linecap="round"/>`,
      // large sourire ouvert, crocs
      `<path d="M36,86 Q38,102 54,101 Q68,99 72,85 Q54,92 36,86 Z" fill="#a8202e" stroke="${DARK}" stroke-width="1.4"/><path d="M44,96 Q54,92 64,95 Q55,101 44,96 Z" fill="#ea6f7c"/>`,
      `<path d="M41,87.5 l2.5,4.5 l2.5,-3.6 Z M62,88.5 l2.5,4.4 l2.4,-4.6 Z" fill="#fff"/>`,
      whiskers(34, 84), whiskers(84, 80, 1));
    push(P, 'wisp', glowOrb(24, 128, 11, '#3fe0a0'));
  } else {
    // gros chat affalé, l'air blasé ; sa queue devient un esprit bleu à yeux qui s'enroule au-dessus de lui
    push(P, 'tail', catTail('M110,110 Q136,92 124,56 Q114,30 88,34', 9), glowOrb(80, 36, 12, '#86d8ff', -0.1));
    push(P, 'legB', catBody([ellipse(110, 142, 11, 6)], 134, 148));
    push(P, 'legF', catBody([ellipse(50, 141, 10, 6), ellipse(70, 145, 10, 6)], 134, 151));
    push(P, 'body', catBody([ellipse(82, 118, 40, 28)], 90, 146, ['M66,98 Q84,90 104,96']));
    push(P, 'head',
      catBody([ear(34, 92, 32, 66, 48, 84), ear(56, 82, 68, 64, 74, 90), ellipse(52, 102, 26, 21)], 64, 124, ['M36,92 Q44,86 54,86']),
      // paupières lourdes : demi-yeux sous un trait plat
      `<path d="M36,98 L48,97 Q47,104 42,104 Q37,103 36,98 Z M56,96 L67,96 Q66,103 61.5,103 Q57,102 56,96 Z" fill="${DARK}"/>`,
      `<path d="M35,97.5 L49,96.5 M55,95.8 L68,95.8" stroke="${DARK}" stroke-width="2.6" stroke-linecap="round"/>`,
      `<circle cx="40.5" cy="100.5" r="1" fill="#fff"/><circle cx="60" cy="99.5" r="1" fill="#fff"/>`,
      `<path d="M44,112 Q49,108 54,112" fill="none" stroke="${DARK}" stroke-width="2" stroke-linecap="round"/>`,
      whiskers(32, 106), whiskers(78, 104, 1));
    push(P, 'wisp', glowOrb(24, 74, 7, '#3fe0a0'), glowOrb(128, 132, 7, '#b4f05a'));
  }
  return assemble(kind, P, part);
}

export const CRITTER_SVG: Record<CritterKind, (part?: CritterPart) => string> = {
  tofu: tofuSvg, pissenlit: pissenlitSvg, rose: roseSvg, tournesol: tournesolSvg,
  chakrobat: (p) => catSvg('chakrobat', p), tigrimas: (p) => catSvg('tigrimas', p), ronronchon: (p) => catSvg('ronronchon', p),
  palichon: (p) => sheepSvg('palichon', p), orageux: (p) => sheepSvg('orageux', p), nuageux: (p) => sheepSvg('nuageux', p), bouftor: (p) => sheepSvg('bouftor', p),
};
