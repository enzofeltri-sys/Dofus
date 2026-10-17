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

export type CritterKind = 'tofu' | 'pissenlit' | 'rose' | 'tournesol' | 'palichon' | 'orageux' | 'nuageux' | 'bouftor' | 'chakrobat' | 'tigrimas' | 'ronronchon'
  | 'plikplok' | 'gloot' | 'splatch' | 'aminite' | 'feuVif' | 'feuJoie' | 'feuFurieux' | 'feuFollet'
  | 'piouViolet' | 'piouRouge' | 'piouVert' | 'piouBleu' | 'piouRose' | 'piouJaune' | 'tofuMalade' | 'arakneMalade' | 'araknose' | 'arakmute'
  | 'tournesolSauvage' | 'roseDemo' | 'pissenlitDiabo' | 'epouvanteur' | 'gardienne' | 'tournesolAffame' | 'larveBleue' | 'larveVerte' | 'larveOrange' | 'larveJaune';
export const TOFU_PARTS = ['wingB', 'legB', 'legF', 'body', 'crest', 'wingF'] as const;
export const PLANT_PARTS = ['legB', 'legF', 'stem', 'leafB', 'leafF', 'head'] as const;
export const SHEEP_PARTS = ['tail', 'legB', 'body', 'legF', 'head', 'horn'] as const;
export const CAT_PARTS = ['tail', 'legB', 'body', 'legF', 'head', 'wisp'] as const;
/** Gelées du Lac et Feux de la Route des âmes : flaque (ou halo), corps, visage. */
export const JELLY_PARTS = ['back', 'body', 'face'] as const;
/** Aminite (Mine) : pieds, corps, chapeau. */
export const SHROOM_PARTS = ['legB', 'legF', 'body', 'head'] as const;
export type CritterPart = (typeof TOFU_PARTS)[number] | (typeof PLANT_PARTS)[number] | (typeof SHEEP_PARTS)[number] | (typeof CAT_PARTS)[number] | (typeof JELLY_PARTS)[number];
export const SHEEP: CritterKind[] = ['palichon', 'orageux', 'nuageux', 'bouftor'];
export const CATS: CritterKind[] = ['chakrobat', 'tigrimas', 'ronronchon'];
export const JELLIES: CritterKind[] = ['plikplok', 'gloot', 'splatch', 'larveBleue', 'larveVerte', 'larveOrange', 'larveJaune'];
export const PIOUS: CritterKind[] = ['piouViolet', 'piouRouge', 'piouVert', 'piouBleu', 'piouRose', 'piouJaune'];
export const SPIDERS: CritterKind[] = ['arakneMalade', 'araknose', 'arakmute'];
export const FLAMES: CritterKind[] = ['feuVif', 'feuJoie', 'feuFurieux', 'feuFollet'];
export const partsOf = (k: CritterKind): readonly CritterPart[] =>
  (k === 'tofu' || k === 'tofuMalade' ? TOFU_PARTS : SHEEP.includes(k) || PIOUS.includes(k) ? SHEEP_PARTS : CATS.includes(k) ? CAT_PARTS
    : JELLIES.includes(k) || FLAMES.includes(k) ? JELLY_PARTS : k === 'aminite' || SPIDERS.includes(k) ? SHROOM_PARTS : PLANT_PARTS);
const BIRD_PIVOTS: Partial<Record<CritterPart, [number, number]>> = { tail: [94, 112], legB: [78, 134], body: [70, 140], legF: [62, 134], head: [58, 104], horn: [58, 80] };
const SPIDER_PIVOTS: Partial<Record<CritterPart, [number, number]>> = { legB: [86, 116], legF: [56, 118], body: [70, 140], head: [70, 100] };
const PLANT_PIVOTS: Partial<Record<CritterPart, [number, number]>> = { legB: [70, 130], legF: [70, 130], stem: [70, 132], leafB: [76, 112], leafF: [64, 114], head: [70, 96] };
const JELLY_PIVOTS: Partial<Record<CritterPart, [number, number]>> = { back: [70, 144], body: [70, 146], face: [70, 146] };
const FLAME_PIVOTS: Partial<Record<CritterPart, [number, number]>> = { back: [70, 150], body: [70, 120], face: [70, 120] };
const SHEEP_PIVOTS: Partial<Record<CritterPart, [number, number]>> = { tail: [116, 98], legB: [104, 136], body: [80, 132], legF: [66, 138], head: [60, 110], horn: [60, 94] };

/** Pivots (rotation des morceaux) : hanches, base de la tige, attache de la tête… */
export const CRITTER_PIVOTS = {
  tofu: { wingB: [104, 92], legB: [80, 128], legF: [62, 128], body: [72, 128], crest: [70, 62], wingF: [80, 114] },
  pissenlit: { legB: [70, 130], legF: [70, 130], stem: [70, 132], leafB: [72, 120], leafF: [68, 122], head: [70, 108] },
  rose: { legB: [70, 130], legF: [70, 130], stem: [70, 132], leafB: [74, 112], leafF: [66, 114], head: [70, 102] },
  tournesol: { legB: [70, 130], legF: [70, 130], stem: [70, 132], leafB: [74, 116], leafF: [66, 118], head: [70, 98] },
  palichon: SHEEP_PIVOTS, orageux: SHEEP_PIVOTS, nuageux: SHEEP_PIVOTS, bouftor: SHEEP_PIVOTS,
  chakrobat: { tail: [86, 126], legB: [80, 78], body: [70, 148], legF: [64, 140], head: [66, 70], wisp: [58, 82] },
  tigrimas: { tail: [106, 84], legB: [102, 110], body: [70, 150], legF: [80, 112], head: [68, 88], wisp: [70, 138] },
  ronronchon: { tail: [118, 108], legB: [104, 146], body: [80, 150], legF: [60, 146], head: [58, 104], wisp: [24, 92] },
  plikplok: JELLY_PIVOTS, gloot: JELLY_PIVOTS, splatch: JELLY_PIVOTS,
  feuVif: FLAME_PIVOTS, feuJoie: FLAME_PIVOTS, feuFurieux: FLAME_PIVOTS, feuFollet: FLAME_PIVOTS,
  aminite: { legB: [78, 140], legF: [62, 140], body: [70, 146], head: [70, 92] },
  ...Object.fromEntries(['piouViolet', 'piouRouge', 'piouVert', 'piouBleu', 'piouRose', 'piouJaune'].map((k) => [k, BIRD_PIVOTS])),
  tofuMalade: { wingB: [104, 92], legB: [80, 128], legF: [62, 128], body: [72, 128], crest: [70, 62], wingF: [80, 114] },
  ...Object.fromEntries(['arakneMalade', 'araknose', 'arakmute'].map((k) => [k, SPIDER_PIVOTS])),
  ...Object.fromEntries(['larveBleue', 'larveVerte', 'larveOrange', 'larveJaune'].map((k) => [k, JELLY_PIVOTS])),
  tournesolSauvage: PLANT_PIVOTS, roseDemo: PLANT_PIVOTS, pissenlitDiabo: PLANT_PIVOTS, gardienne: PLANT_PIVOTS,
  epouvanteur: { legB: [70, 150], legF: [70, 150], stem: [70, 150], leafB: [86, 92], leafF: [54, 92], head: [70, 70] },
  tournesolAffame: { legB: [70, 130], legF: [70, 130], stem: [70, 132], leafB: [86, 104], leafF: [54, 104], head: [70, 80] },
} as Record<CritterKind, Partial<Record<CritterPart, [number, number]>>>;

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
  // Un seul bloc (tête et corps confondus, sans cou) : oreilles et visage posés en haut du bloc.
  if (kind === 'chakrobat') {
    // longue « chaussette » dressée, ventre rond en bas, bras tendus vers le feu follet bleu, bouche grande ouverte
    push(P, 'tail', catTail('M86,126 Q106,134 98,148 Q94,156 108,154', 5));
    push(P, 'legB', catBody([capsule(80, 78, 80, 30, 4.5), ellipse(80, 28, 5.5, 4.5)], 24, 90));
    push(P, 'body', catBody([
      ear(57, 56, 52, 38, 64, 48), ear(70, 48, 82, 38, 82, 58),
      'M56,64 C54,52 60,46 68,46 C78,46 84,54 82,66 C80,84 82,98 88,110 C96,126 90,146 72,148 C54,150 48,134 54,116 C58,102 58,82 56,64 Z',
      ellipse(62, 148, 7, 4.5), ellipse(81, 147, 7, 4.5),
    ], 40, 150, ['M60,56 Q64,50 70,50', 'M62,118 Q64,110 72,108']));
    push(P, 'head',
      `<path d="M57,57 q3,-3 6,0 M69,56 q3,-3 6,0" fill="none" stroke="${DARK}" stroke-width="2.2" stroke-linecap="round"/>`,
      `<path d="M55,63 Q56,82 66,82 Q76,81 77,63 Q66,68 55,63 Z" fill="#a8202e" stroke="${DARK}" stroke-width="1.4"/><path d="M59,77 Q66,73 73,77 Q66,83 59,77 Z" fill="#ea6f7c"/>`,
      `<path d="M58,64.5 l2,3 l2,-2.6 Z M69,65 l2,3 l2,-3.2 Z" fill="#fff"/>`,
      whiskers(54, 66), whiskers(84, 64, 1));
    push(P, 'legF', '');
    push(P, 'wisp', glowOrb(64, 26, 10, '#7fd3ff'), catBody([capsule(52, 90, 47, 32, 4.5), ellipse(47, 30, 5.5, 4.5)], 24, 90));
  } else if (kind === 'tigrimas') {
    // boule en équilibre sur son feu follet vert (patte avant posée dessus), patte arrière lancée, queue dressée en crochet
    push(P, 'tail', catTail('M106,84 Q122,60 114,40 Q108,22 124,14', 7));
    push(P, 'legB', catBody([capsule(102, 110, 118, 120, 5.5), ellipse(120, 121, 6.5, 5)], 104, 126));
    push(P, 'body', glowOrb(70, 138, 12, '#3fe0a0'), catBody([
      ear(50, 80, 40, 48, 64, 68), ear(70, 66, 86, 40, 92, 74),
      ellipse(80, 94, 32, 30),
    ], 44, 124, ['M58,72 Q66,64 78,64', 'M98,106 Q104,100 106,92']));
    push(P, 'legF', catBody([capsule(80, 112, 72, 124, 6), ellipse(71, 126, 7.5, 5)], 108, 130));
    push(P, 'head',
      `<path d="M54,78 Q58,74 63,77 Q58,80 54,78 Z M70,75 Q74,71 79,74 Q74,78 70,75 Z" fill="${DARK}"/>`,
      `<path d="M53,73 L63,75 M70,71 L80,70" stroke="${DARK}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<path d="M52,86 Q55,100 68,99 Q80,97 84,84 Q68,90 52,86 Z" fill="#a8202e" stroke="${DARK}" stroke-width="1.4"/><path d="M59,95 Q68,91 77,94 Q69,99 59,95 Z" fill="#ea6f7c"/>`,
      `<path d="M56,87.4 l2.2,4 l2.2,-3.3 Z M75,87.4 l2.2,4 l2.2,-4.3 Z" fill="#fff"/>`,
      whiskers(50, 84), whiskers(92, 80, 1));
  } else {
    // grosse boule affalée, l'air blasé ; sa queue monte et devient un esprit bleu à yeux au-dessus de lui
    push(P, 'tail', catTail('M118,108 Q140,84 128,52 Q118,28 96,38', 10), glowOrb(90, 44, 12, '#86d8ff', -0.1));
    push(P, 'legB', catBody([ellipse(104, 148, 10, 5)], 142, 154));
    push(P, 'body', catBody([
      ear(42, 98, 38, 70, 58, 86), ear(64, 84, 74, 64, 84, 88),
      ellipse(80, 116, 45, 34),
    ], 64, 150, ['M48,92 Q58,84 72,84', 'M108,96 Q118,104 120,116']));
    push(P, 'legF', catBody([ellipse(50, 146, 10, 5.5), ellipse(72, 150, 10, 5)], 140, 155));
    push(P, 'head',
      `<path d="M44,100 L55,99 Q54,105 49.5,105 Q45,104.5 44,100 Z M62,98 L72,98 Q71,104 67,104 Q63,103.5 62,98 Z" fill="${DARK}"/>`,
      `<path d="M43,99.5 L56,98.5 M61,97.8 L73,97.8" stroke="${DARK}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<path d="M52,113 Q57,109 62,113" fill="none" stroke="${DARK}" stroke-width="2" stroke-linecap="round"/>`,
      whiskers(42, 106), whiskers(80, 104, 1));
    push(P, 'wisp', glowOrb(24, 92, 7, '#3fe0a0'), glowOrb(128, 140, 7, '#b4f05a'));
  }
  return assemble(kind, P, part);
}

/* ---------------------------------------------------------------------------------------- */
/* Lac d'Incarnam : gelées bleues translucides (Plikplok, Petit Gloot, Grand Splatch)         */
/* ---------------------------------------------------------------------------------------- */

const JELLY = '#3fb0d8';
const JELLY_INK = '#1a5a7a';

/** Corps de gelée : dégradé bleu, transparence, gros reflet et petit reflet rose pâle. */
function jellyBody(d: string, hl: [number, number, number, number]): string {
  const g = uid('jg');
  const [hx, hy, hrx, hry] = hl;
  return `<radialGradient id="${g}" cx="0.38" cy="0.3" r="0.85"><stop offset="0" stop-color="#bff0ff"/><stop offset="0.45" stop-color="${JELLY}"/><stop offset="1" stop-color="#1f7aa8"/></radialGradient>` +
    `<path d="${d}" fill="url(#${g})" fill-opacity="0.92" stroke="${JELLY_INK}" stroke-width="${LW}" stroke-linejoin="round"/>` +
    `<ellipse cx="${hx}" cy="${hy}" rx="${hrx}" ry="${hry}" fill="#ffffff" opacity="0.55" transform="rotate(-20 ${hx} ${hy})"/>` +
    `<ellipse cx="${hx + hrx * 0.4}" cy="${hy - hry * 0.4}" rx="${hrx * 0.35}" ry="${hry * 0.35}" fill="#ffe4f0" opacity="0.8"/>`;
}
/** Flaque et gouttelettes autour de la gelée. */
const puddle = (rx: number, drops: [number, number, number][]) =>
  `<ellipse cx="70" cy="144" rx="${rx}" ry="${rx * 0.2}" fill="${JELLY}" opacity="0.35" stroke="${JELLY_INK}" stroke-width="1" stroke-opacity="0.4"/>` +
  drops.map(([x, y, r]) => blob(ellipse(x, y, r, r * 0.7), JELLY, { ink: JELLY_INK, w: 1.2, rim: false })).join('');
const jellyEye = (cx: number, cy: number, r: number, look = -0.3) =>
  `<circle cx="${cx}" cy="${cy}" r="${r + 2.5}" fill="${JELLY_INK}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fdfdf8"/>` +
  `<circle cx="${cx + look * r}" cy="${cy + r * 0.1}" r="${r * 0.42}" fill="#101418"/><circle cx="${cx + look * r - r * 0.18}" cy="${cy - r * 0.12}" r="${r * 0.14}" fill="#fff"/>`;

function jellySvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  if (kind === 'plikplok') {
    // dôme mou qui éclabousse : grands yeux, bouche ouverte aux dents de lapin
    push(P, 'back', puddle(56, [[16, 140, 6], [124, 136, 7], [112, 148, 5], [26, 150, 4]]));
    push(P, 'body', jellyBody('M28,142 C22,104 44,74 72,74 C102,74 122,102 116,142 Q72,152 28,142 Z', [52, 92, 13, 8]));
    push(P, 'face', jellyEye(54, 106, 10), jellyEye(80, 104, 9),
      `<path d="M50,122 Q66,140 84,122 Q66,128 50,122 Z" fill="#8a1e2a" stroke="${JELLY_INK}" stroke-width="1.4"/>`,
      `<path d="M60,123.5 h6 v6 h-6 Z M67,124 h6 v5.5 h-6 Z" fill="#fff" stroke="${JELLY_INK}" stroke-width="0.8"/>`);
  } else if (kind === 'gloot') {
    // boule de gel penchée, deux yeux énormes cerclés
    push(P, 'back', puddle(50, [[22, 146, 4]]));
    push(P, 'body', jellyBody('M26,134 C18,104 40,80 74,80 C106,80 124,100 118,128 C114,146 92,148 70,148 C44,148 30,146 26,134 Z', [48, 96, 14, 8]));
    push(P, 'face', jellyEye(56, 112, 15, -0.2), jellyEye(92, 104, 11.5, -0.2));
  } else {
    // grande goutte dressée, l'air grognon
    push(P, 'back', puddle(54, [[18, 144, 7], [120, 140, 8], [108, 152, 5], [34, 152, 4], [52, 118, 3]]));
    push(P, 'body', jellyBody('M36,144 C32,112 30,74 46,52 C58,36 88,36 100,52 C114,74 112,112 108,144 Q72,152 36,144 Z', [56, 58, 9, 13]));
    push(P, 'face',
      `<path d="M50,86 q7,-6 14,0 M76,84 q7,-6 14,0" fill="none" stroke="${JELLY_INK}" stroke-width="2.6" stroke-linecap="round"/>`,
      `<path d="M48,78 L62,82 M92,76 L78,80" stroke="${JELLY_INK}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<path d="M60,104 Q70,98 80,104" fill="none" stroke="${JELLY_INK}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<ellipse cx="48" cy="94" rx="6" ry="3" fill="#8fd8f8" opacity="0.8"/><ellipse cx="92" cy="92" rx="6" ry="3" fill="#8fd8f8" opacity="0.8"/>`);
  }
  return assemble(kind, P, part);
}

/* ---------------------------------------------------------------------------------------- */
/* Route des âmes : Feux (flammes lumineuses à cœur blanc et petits yeux)                     */
/* ---------------------------------------------------------------------------------------- */

const FLAME_COL: Record<string, string> = { feuVif: '#3fe0a0', feuJoie: '#b8f05a', feuFurieux: '#38c8d0', feuFollet: '#a8eef8' };

function flameSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const col = FLAME_COL[kind];
  const ink = shade(col, -0.45);
  const g = uid('fg');
  // forme : goutte à pointe recourbée (Vif, Joie), flamme à trois langues (Furieux), goutte à pointe détachée (Follet)
  const d = kind === 'feuFurieux'
    ? 'M44,118 C40,96 46,78 54,70 C54,84 60,88 62,82 C62,62 72,48 80,34 C84,56 92,64 96,70 C98,64 100,60 104,56 C108,80 106,100 100,118 C94,136 80,142 72,142 C56,142 46,132 44,118 Z'
    : 'M42,116 C42,96 56,82 66,68 C74,58 74,48 70,40 C88,50 92,64 90,78 C100,90 104,104 100,118 C96,136 82,144 70,144 C54,144 42,132 42,116 Z';
  push(P, 'back', halo(uid('h'), 72, 112, 58, col), `<ellipse cx="72" cy="156" rx="22" ry="5" fill="#2a2a20" opacity="0.25"/>`);
  push(P, 'body',
    `<radialGradient id="${g}" cx="0.45" cy="0.7" r="0.8"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="${shade(col, 0.55)}"/><stop offset="1" stop-color="${col}"/></radialGradient>`,
    `<path d="${d}" fill="url(#${g})" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round"/>`,
    `<ellipse cx="70" cy="118" rx="20" ry="17" fill="#ffffff" opacity="0.85"/>`,
    `<path d="M54,112 Q70,100 86,112" fill="none" stroke="${shade(col, 0.4)}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>`,
    kind === 'feuFollet' ? `<path d="M74,28 Q84,16 78,4 Q90,14 84,30 Q80,36 74,28 Z" fill="${col}" stroke="${ink}" stroke-width="1.2"/>` : '');
  const eye = (cx: number, r: number) => `<ellipse cx="${cx}" cy="126" rx="${r}" ry="${r * 1.1}" fill="#fff" stroke="#1d3a40" stroke-width="1.6"/><circle cx="${cx - r * 0.3}" cy="127" r="${r * 0.45}" fill="#101418"/>`;
  push(P, 'face', eye(62, 6.5), eye(80, 5.5),
    kind === 'feuFurieux' ? `<path d="M54,116 L68,121 M88,114 L76,120" stroke="#1d3a40" stroke-width="2.6" stroke-linecap="round"/>` : '');
  return assemble(kind, P, part);
}

/* ---------------------------------------------------------------------------------------- */
/* Mine d'Incarnam : Aminite (champignon au grand chapeau vert tacheté)                        */
/* ---------------------------------------------------------------------------------------- */

function aminiteSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const WHITE = '#eef8f8', CAP = '#4fd884';
  push(P, 'legB', blob(ellipse(80, 144, 9, 5), WHITE, { ink: '#5a7a7a' }));
  push(P, 'legF', blob(ellipse(60, 146, 10, 5.5), WHITE, { ink: '#5a7a7a' }));
  push(P, 'body', halo(uid('h'), 70, 110, 52, '#e8fff0'),
    blob('M48,118 C46,96 56,84 70,84 C86,84 96,98 94,118 C92,136 82,144 70,144 C56,144 50,134 48,118 Z', WHITE, { ink: '#5a7a7a' }),
    blob(ellipse(84, 124, 5, 4), '#7fd8a8', { rim: false, w: 1 }), blob(ellipse(58, 132, 4, 3), '#7fd8a8', { rim: false, w: 1 }), blob(ellipse(88, 106, 3, 2.5), '#7fd8a8', { rim: false, w: 1 }),
    eyeChibi(60, 100, 5.5, 6.5, '#2fae6a', { look: [-0.3, 0.2] }), eyeChibi(76, 100, 5, 6, '#2fae6a', { look: [-0.3, 0.2] }));
  const cap = 'M12,78 C14,50 40,22 70,20 C100,22 126,50 128,78 C112,88 92,90 70,90 C48,90 28,88 12,78 Z';
  push(P, 'head',
    blob(cap, CAP, { ink: '#1f6a3a', hl: [0.4, 0.15] }),
    `<path d="M70,22 L70,88 M48,26 Q40,56 34,86 M92,26 Q100,56 106,86 M28,42 Q22,62 20,82 M112,42 Q118,62 120,82" fill="none" stroke="#bff8d0" stroke-width="1.6" opacity="0.7"/>`,
    `<path d="M14,78 Q40,92 70,92 Q100,92 126,78 L124,84 Q100,98 70,98 Q40,98 16,84 Z" fill="#2fb868" stroke="#1f6a3a" stroke-width="1.6"/>`,
    ...[[44, 44, 9, 6], [96, 50, 8, 6], [70, 34, 6, 4], [30, 64, 6, 5], [108, 70, 6, 4]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#2f9a6a" opacity="0.8"/>`),
    `<ellipse cx="60" cy="30" rx="16" ry="6" fill="#ffffff" opacity="0.55"/>`);
  return assemble('aminite', P, part);
}

/* ======================================================================================== */
/* Astrub, branche A : Pious, Souterrains, Champs d'Astrub, Larves, Grange du Tournesol Affamé */
/* ======================================================================================== */

/** Pious : petit oiseau rond, bec orange ; la queue change selon la couleur (comme dans Dofus). */
const PIOU: Record<string, { c: string; tail: 'peacock' | 'flame' | 'leaf' | 'club'; flower?: boolean }> = {
  piouViolet: { c: '#c03aa0', tail: 'peacock' }, piouRouge: { c: '#d8342c', tail: 'flame' }, piouVert: { c: '#6ab82c', tail: 'leaf' },
  piouBleu: { c: '#3a5ab0', tail: 'club' }, piouRose: { c: '#e88ad0', tail: 'leaf', flower: true }, piouJaune: { c: '#f0d23a', tail: 'leaf' },
};

function piouSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const { c, tail, flower } = PIOU[kind];
  const ink = shade(c, -0.55);
  // queue
  if (tail === 'leaf') {
    push(P, 'tail', blob('M92,116 C104,84 112,48 124,16 C134,40 130,78 104,118 Z', shade(c, -0.05), { ink }),
      `<path d="M94,114 C108,82 116,50 124,20" fill="none" stroke="${shade(c, 0.4)}" stroke-width="2"/>`,
      `<path d="M106,84 l12,-4 M110,68 l12,-6 M114,52 l10,-6 M102,100 l12,-2" stroke="${ink}" stroke-width="1.2" opacity="0.6"/>`);
  } else if (tail === 'club') {
    push(P, 'tail', tube('M94,114 Q104,70 112,34', 9, shade(c, -0.1), ink), blob(ellipse(114, 26, 12, 16), c, { ink }), `<ellipse cx="114" cy="24" rx="5" ry="7" fill="#9ab0e8" opacity="0.7"/>`);
  } else if (tail === 'flame') {
    push(P, 'tail', blob('M92,118 C96,80 92,50 100,14 C108,40 112,52 116,30 C122,60 124,84 106,120 Z', c, { ink }),
      blob('M98,112 C100,86 100,64 106,44 C110,64 112,84 104,114 Z', '#ff8a5a', { ink, w: 1, rim: false }));
  } else {
    for (const [x2, y2] of [[100, 24], [114, 30], [126, 44], [132, 62], [88, 30]] as [number, number][]) {
      push(P, 'tail', `<path d="M94,112 Q${(94 + x2) / 2 + 6},${(112 + y2) / 2} ${x2},${y2}" fill="none" stroke="#4a5a8a" stroke-width="2"/>`,
        blob(ellipse(x2, y2, 7, 10), shade(c, -0.25), { ink }), `<ellipse cx="${x2}" cy="${y2}" rx="3.5" ry="5" fill="#d8b0f0"/><circle cx="${x2}" cy="${y2}" r="1.8" fill="#3a1a4a"/>`);
    }
  }
  // pattes orange fines, doigts
  const leg = (x: number) => tube(`M${x},128 L${x - 1},144`, 3.6, '#f0a030') + `<path d="M${x - 8},147 L${x - 1},144 L${x + 5},148 M${x - 1},144 L${x - 2},149" stroke="#a86010" stroke-width="2.6" stroke-linecap="round"/>`;
  push(P, 'legB', leg(80));
  push(P, 'legF', leg(62));
  // corps rond, ventre plus clair, aile
  push(P, 'body', blob(ellipse(74, 112, 27, 23), c, { ink }), blob(ellipse(64, 118, 14, 11), shade(c, 0.4), { ink, w: 1, rim: false }),
    blob('M80,104 Q100,104 102,118 Q92,124 80,118 Z', shade(c, -0.15), { ink, w: 1.4 }));
  // tête : ronde, joue, bec, œil rieur
  push(P, 'head', blob(ellipse(60, 88, 21, 19), c, { ink }),
    `<ellipse cx="54" cy="96" rx="6" ry="4" fill="${shade(c, 0.45)}" opacity="0.9"/>`,
    blob('M42,88 L28,93 L42,98 Z', '#f0a030', { ink: '#8a5010', w: 1.4, rim: false }),
    `<path d="M48,82 q4,-4 8,0" fill="none" stroke="#1d1a20" stroke-width="2.4" stroke-linecap="round"/>`,
    eyeChibi(66, 82, 5, 6, '#1d1a20', { look: [-0.3, 0] }));
  push(P, 'horn', ...[[-10, 0], [-3, -4], [4, -1]].map(([dx, dy]) => blob(`M${56 + dx},72 L${58 + dx},${58 + dy} L${62 + dx},70 Z`, c, { ink, w: 1.4, rim: false })),
    flower ? blob(circle(72, 66, 6), '#e83a4a', { ink: '#7a1020', w: 1.2 }) + `<circle cx="72" cy="66" r="2.4" fill="#ffd84a"/>` : '');
  return assemble(kind, P, part);
}

/** Tofu Malade : tofu beige ébouriffé, rapiécé, l'air hagard. */
function tofuMaladeSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const C = '#d8c49a';
  push(P, 'wingB', blob(ellipse(108, 92, 12, 9), C));
  push(P, 'legB', tube('M80,126 Q83,138 84,146', 3.4, '#8a6a3a'), blob(ellipse(88, 148, 11, 6), '#9a5a2a'));
  push(P, 'legF', tube('M62,126 Q60,138 58,146', 3.4, '#8a6a3a'), blob(ellipse(54, 148, 12, 6.5), '#9a5a2a'));
  push(P, 'body', blob(circle(74, 98, 36), C, { hl: [0.3, 0.22] }),
    blob(circle(100, 112, 9), '#b89a6a', { w: 1.2, rim: false }), blob(circle(46, 74, 7), '#b89a6a', { w: 1.2, rim: false }),
    `<path d="M95,105 l10,14 M103,106 l-6,13" stroke="#7a5a2a" stroke-width="1.2"/>`,
    eyeChibi(66, 94, 10, 12, '#4a3a20', { lid: -1, skin: C }), eyeChibi(46, 96, 11.5, 13.5, '#4a3a20', { lid: -1, skin: C }),
    `<path d="M48,116 Q56,112 64,117" fill="none" stroke="#5a3a1a" stroke-width="2" stroke-linecap="round"/>`);
  push(P, 'crest', `<path d="M58,64 L50,34 M64,62 L64,28 M70,62 L78,30 M76,64 L92,40 M54,66 L36,48 M66,62 L58,22" stroke="#c8a85a" stroke-width="2.4" stroke-linecap="round"/><path d="M60,62 L56,40 M72,62 L84,36" stroke="#8a6a2a" stroke-width="1.6"/>`);
  push(P, 'wingF', blob(ellipse(84, 114, 11, 8), shade(C, -0.08)));
  return assemble('tofuMalade', P, part);
}

/** Araknes des Souterrains : corps poilu anguleux, pattes épaisses ; Arakmuté : boule sombre couverte d'yeux. */
function spiderSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const muted = kind === 'arakmute';
  const C = kind === 'arakneMalade' ? '#7a9a8a' : kind === 'araknose' ? '#5aa030' : '#3e3e22';
  const ink = shade(C, -0.6);
  const LEG = muted ? '#1e1e16' : '#8a7a8a';
  const leg = (d: string) => (muted ? tube(d, 3, LEG, '#000') : tube(d, 7, LEG));
  push(P, 'legB', leg(muted ? 'M92,112 Q120,96 126,150' : 'M90,116 Q116,104 120,140'), leg(muted ? 'M84,118 Q104,124 108,154' : 'M84,122 Q100,128 100,148'));
  push(P, 'legF', leg(muted ? 'M50,112 Q20,96 14,150' : 'M52,116 Q26,104 22,140'), leg(muted ? 'M58,118 Q38,124 34,154' : 'M58,122 Q42,128 40,148'));
  const body = muted
    ? 'M30,90 L40,66 L56,58 L72,50 L92,58 L106,70 L112,90 L106,110 L90,122 L54,122 L38,112 Z'
    : 'M26,104 L34,74 L52,70 L60,50 L74,66 L90,56 L96,74 L112,80 L114,106 L100,124 L44,126 Z';
  push(P, 'body', blob(body, C, { ink }),
    ...[[40, 86], [58, 66], [88, 70], [104, 96], [90, 116]].map(([x, y]) => `<path d="M${x},${y} l${x < 70 ? -6 : 6},-6" stroke="${shade(C, 0.35)}" stroke-width="2" stroke-linecap="round"/>`));
  if (kind === 'arakneMalade') push(P, 'head', eyeChibi(52, 98, 9, 8, '#8a1a1a', { lid: 1, skin: C, ring: '#c84a3a' }), eyeChibi(76, 96, 8, 7, '#8a1a1a', { lid: 1, skin: C, ring: '#c84a3a' }),
    `<path d="M54,114 L58,120 L62,114 L66,120 L70,114" fill="#fff" stroke="${ink}" stroke-width="1.2"/>`, `<circle cx="88" cy="82" r="3" fill="#b84a3a" opacity="0.7"/><circle cx="96" cy="88" r="2" fill="#b84a3a" opacity="0.7"/>`);
  else if (kind === 'araknose') push(P, 'head',
    `<ellipse cx="52" cy="94" rx="12" ry="15" fill="#fdfdf8" stroke="#a82a1a" stroke-width="3"/><ellipse cx="80" cy="92" rx="11" ry="14" fill="#fdfdf8" stroke="#a82a1a" stroke-width="3"/>`,
    `<ellipse cx="50" cy="95" rx="2.6" ry="9" fill="#101418"/><ellipse cx="78" cy="93" rx="2.4" ry="8" fill="#101418"/>`,
    `<path d="M56,116 L60,128 L64,116 Z M70,116 L74,128 L78,116 Z" fill="#fffaf0" stroke="${ink}" stroke-width="1.2"/>`);
  else push(P, 'head', ...[[46, 82, 9], [74, 76, 7], [96, 90, 10], [60, 104, 6], [84, 110, 5], [40, 106, 5]].map(([x, y, r]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#f4ecd0" stroke="#101010" stroke-width="1.6"/><circle cx="${x - r * 0.3}" cy="${y + r * 0.1}" r="${r * 0.45}" fill="#101418"/>`));
  return assemble(kind, P, part);
}

/** Plantes des Champs d'Astrub et de la Grange (deux pieds-racines, tige, feuilles-bras, tête). */
function astrubPlantSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const G = '#3a9a3a';
  const legs = (col = G) => {
    push(P, 'legB', rootLeg(74, 128, 80, 144, 12, col));
    push(P, 'legF', rootLeg(66, 128, 60, 146, -12, col));
  };
  if (kind === 'tournesolSauvage' || kind === 'tournesolAffame') {
    const boss = kind === 'tournesolAffame';
    legs(boss ? '#2a8a3a' : G);
    push(P, 'stem', tube('M70,132 Q66,116 70,100', boss ? 12 : 8, boss ? '#2a8a3a' : G));
    push(P, 'leafB', blob('M76,112 Q100,98 112,112 Q96,122 76,114 Z', '#5ab84a'));
    push(P, 'leafF', boss
      ? blob('M62,112 Q34,96 22,128 L30,124 L26,140 L36,130 L38,144 Q50,120 62,116 Z', '#4aa83a', { ink: '#1a4a1a' })
      : blob('M64,114 Q40,100 28,114 Q44,124 64,116 Z', '#5ab84a'));
    // pétales larges en deux couronnes, comme les tournesols de Dofus
    const petals = [0, 1].map((ring) => [...Array(13)].map((_, i) => {
      const a = ((i + ring * 0.5) / 13) * 360, r = ring ? 30 : 34;
      return `<ellipse cx="68" cy="${80 - r}" rx="${ring ? 9 : 10}" ry="${ring ? 17 : 19}" transform="rotate(${a.toFixed(0)} 68 80)" fill="${ring ? '#f8d23a' : '#f0b81c'}" stroke="#a87010" stroke-width="1.6"/>`;
    }).join('')).join('');
    push(P, 'head', petals, blob(circle(68, 80, 22), boss ? '#a8301c' : '#7a4a1a', { ink: '#3a1a08' }));
    if (boss) push(P, 'head',
      `<path d="M50,58 L56,40 L62,56 L70,34 L78,56 L86,40 L90,58 Z" fill="#e83a1a" stroke="#5a1008" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="M50,74 L60,70 M78,70 L88,74" stroke="#f8e8a0" stroke-width="3" stroke-linecap="round"/>`,
      eyeChibi(60, 76, 5, 5.5, '#101010', { lid: 1, skin: '#a8301c' }), eyeChibi(78, 76, 5, 5.5, '#101010', { lid: 1, skin: '#a8301c' }),
      `<path d="M50,86 Q68,108 88,86 Q68,94 50,86 Z" fill="#2a0a08" stroke="#3a1a08" stroke-width="1.4"/><path d="M53,87 l3,5 l3,-4 l3,5 l3,-4 l3,5 l3,-4 l3,5 l3,-4 l3,5 l3,-5" fill="#fffaf0" stroke="#3a1a08" stroke-width="0.8"/>`);
    else push(P, 'head', eyeChibi(60, 74, 6, 7, '#101010'), eyeChibi(76, 72, 5.5, 6.5, '#101010'),
      `<path d="M54,84 Q66,100 82,84 Q66,90 54,84 Z" fill="#5a1a10" stroke="#3a1a08" stroke-width="1.4"/><path d="M60,86 Q68,90 76,86" fill="#e85a4a"/>`);
  } else if (kind === 'roseDemo') {
    legs();
    push(P, 'stem', tube('M70,132 Q64,116 70,100', 7, G));
    push(P, 'leafB', blob('M76,110 Q98,96 108,106 L114,98 L112,112 Q96,120 76,114 Z', '#4aa83a'), `<path d="M108,104 l8,-6 M100,100 l6,-8" stroke="#e8e0c0" stroke-width="2.4"/>`);
    push(P, 'leafF', blob('M64,112 Q40,98 30,110 L22,104 L26,118 Q44,124 64,116 Z', '#4aa83a'), `<path d="M30,110 l-10,-4 M38,104 l-6,-8" stroke="#e8e0c0" stroke-width="2.4"/>`);
    push(P, 'head', blob('M42,84 C40,58 56,46 72,48 C92,50 102,64 98,84 C92,100 80,104 70,104 C56,104 44,98 42,84 Z', '#d8401c', { ink: '#5a1008' }),
      `<path d="M52,64 Q70,52 88,64 Q78,60 70,66 Q62,58 56,70 M58,80 Q70,70 84,78 M48,86 Q60,94 72,88" fill="none" stroke="#7a1408" stroke-width="2" stroke-linecap="round"/>`,
      blob('M60,40 Q70,30 84,40 Q76,46 70,44 Q66,48 60,40 Z', '#f0782c', { ink: '#5a1008', w: 1.2 }),
      eyeChibi(60, 84, 7, 8.5, '#101010'), eyeChibi(80, 82, 6.5, 8, '#101010'));
  } else if (kind === 'pissenlitDiabo') {
    legs();
    push(P, 'stem', tube('M70,132 Q66,122 70,112', 7, G));
    push(P, 'leafB', blob('M76,118 Q94,110 102,120 Q90,126 76,122 Z', '#5ab84a'));
    push(P, 'leafF', blob('M64,118 Q46,110 38,120 Q50,126 64,122 Z', '#5ab84a'));
    push(P, 'head', blob(circle(70, 70, 40), '#f4ecd0', { ink: '#8a7a50', hl: [0.35, 0.3] }),
      ...[...Array(26)].map((_, i) => {
        const a = i * 2.4, r = 10 + (i % 5) * 6;
        return `<path d="M${f(70 + Math.cos(a) * r)},${f(70 + Math.sin(a) * r)} l${f(Math.cos(a + 1) * 6)},${f(Math.sin(a + 1) * 6)}" stroke="#a89a6a" stroke-width="1.4" stroke-linecap="round"/>`;
      }),
      `<ellipse cx="58" cy="78" rx="9" ry="11" fill="#fff" stroke="#101010" stroke-width="2.4"/><ellipse cx="82" cy="76" rx="8" ry="10" fill="#fff" stroke="#101010" stroke-width="2.4"/>`,
      `<circle cx="56" cy="80" r="3" fill="#101010"/><circle cx="80" cy="78" r="2.8" fill="#101010"/>`);
  } else if (kind === 'epouvanteur') {
    push(P, 'legF', tube('M70,150 L70,104', 6, '#7a5a30', '#3a2410'));
    push(P, 'legB', '');
    push(P, 'stem', blob('M52,100 Q70,94 88,100 L92,130 L84,124 L80,134 L72,126 L64,134 L58,124 L50,130 Z', '#d8c8a0', { ink: '#6a5a3a' }),
      `<circle cx="72" cy="112" r="8" fill="none" stroke="#c8301c" stroke-width="2"/><circle cx="72" cy="112" r="3" fill="#c8301c"/><path d="M60,104 h4 M80,120 h5" stroke="#6a5a3a" stroke-width="1.4"/>`);
    push(P, 'leafB', tube('M70,98 L108,92', 5, '#7a5a30', '#3a2410'), `<path d="M108,92 l6,-4 M108,92 l7,2 M108,92 l4,6" stroke="#c8a85a" stroke-width="2" stroke-linecap="round"/>`);
    push(P, 'leafF', tube('M70,98 L34,92', 5, '#7a5a30', '#3a2410'),
      blob('M34,92 L22,52 Q20,44 28,46 L34,58 L38,90 Z', '#6a6a72', { ink: '#2a2a30' }), blob('M28,94 L42,90 L42,96 L28,100 Z', '#8a5a2a', { ink: '#3a2410', w: 1.2, rim: false }));
    push(P, 'head', blob('M50,70 C48,52 60,44 70,44 C82,44 92,52 90,70 C88,84 80,90 70,90 C60,90 52,84 50,70 Z', '#e0d0a8', { ink: '#6a5a3a' }),
      `<circle cx="61" cy="66" r="7" fill="none" stroke="#c8301c" stroke-width="2"/><circle cx="61" cy="66" r="2.6" fill="#c8301c"/><circle cx="79" cy="66" r="7" fill="none" stroke="#c8301c" stroke-width="2"/><circle cx="79" cy="66" r="2.6" fill="#c8301c"/>`,
      `<path d="M62,80 Q70,86 78,80" fill="none" stroke="#c8301c" stroke-width="2" stroke-linecap="round"/>`,
      `<path d="M56,46 L54,24 M62,44 L62,20 M70,44 L72,18 M78,44 L82,22 M84,48 L90,28" stroke="#e8b83a" stroke-width="3.4" stroke-linecap="round"/>`,
      `<path d="M46,48 Q70,40 94,48" fill="none" stroke="#a8781a" stroke-width="4" stroke-linecap="round"/>`);
  } else {
    // Gardienne Champêtre : tige recourbée, bourgeon de feuilles fermé
    push(P, 'legB', blob(ellipse(78, 148, 10, 4), '#2a6a2a', { rim: false }));
    push(P, 'legF', blob(ellipse(62, 148, 10, 4), '#2a6a2a', { rim: false }));
    push(P, 'stem', tube('M70,148 Q78,120 70,96 Q62,76 64,62', 8, '#4aa83a'));
    push(P, 'leafB', blob('M72,108 Q92,100 98,110 Q86,116 74,112 Z', '#6ac84a'));
    push(P, 'leafF', blob('M68,124 Q48,118 42,128 Q54,134 68,128 Z', '#6ac84a'));
    push(P, 'head', blob('M40,50 C40,26 60,14 76,18 C94,22 100,40 92,56 C84,70 64,74 52,68 C44,64 40,58 40,50 Z', '#7ad84a', { ink: '#2a6a1a' }),
      blob('M50,52 C48,34 62,24 74,28 C66,36 64,48 70,62 C60,64 52,60 50,52 Z', '#4aa83a', { ink: '#2a6a1a', w: 1.4 }),
      blob('M76,30 C90,32 94,46 86,58 C80,52 76,42 76,30 Z', '#5ab83a', { ink: '#2a6a1a', w: 1.4 }),
      `<path d="M48,56 Q60,46 76,50" fill="none" stroke="#bff0a0" stroke-width="2" opacity="0.7"/>`);
  }
  return assemble(kind, P, part);
}

/** Larves des Prairies : chenilles brillantes en anneaux ; piquants (Bleue), cornes et taches (Verte), antennes lumineuses (Orange, Jaune). */
const LARVE: Record<string, { c: string; deco: 'spikes' | 'horns' | 'glow' | 'spiral' }> = {
  larveBleue: { c: '#2a8ad8', deco: 'spikes' }, larveVerte: { c: '#4ab83a', deco: 'horns' }, larveOrange: { c: '#f0901c', deco: 'glow' }, larveJaune: { c: '#f8c81c', deco: 'spiral' },
};

function larveSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const { c, deco } = LARVE[kind];
  const ink = shade(c, -0.55);
  const segs: [number, number, number][] = [[112, 124, 16], [94, 118, 20], [74, 114, 23]];
  push(P, 'back', `<ellipse cx="78" cy="146" rx="52" ry="8" fill="#2a2a20" opacity="0.2"/>`,
    ...segs.map(([x, y, r]) => blob(ellipse(x, y, r, r * 0.95), c, { ink, hl: [0.4, 0.25] })),
    ...segs.map(([x, y, r]) => blob(ellipse(x + 2, y + r * 0.85, r * 0.45, r * 0.25), shade(c, -0.3), { ink, w: 1.2, rim: false })));
  if (deco === 'spikes') push(P, 'back', ...segs.map(([x, y, r]) => blob(`M${x - 5},${y - r + 3} L${x + 2},${y - r - 14} L${x + 6},${y - r + 4} Z`, shade(c, -0.3), { ink, w: 1.4 })));
  if (deco === 'horns') push(P, 'back', ...segs.map(([x, y, r]) => blob(circle(x + 4, y - r * 0.2, r * 0.22), '#c8301c', { ink: '#5a1008', w: 1.2, rim: false })));
  if (deco === 'spiral') push(P, 'back', ...segs.slice(0, 2).map(([x, y, r]) => `<path d="M${x},${y} m-${r * 0.4},0 a${r * 0.4},${r * 0.4} 0 1,1 ${r * 0.8},0 a${r * 0.25},${r * 0.25} 0 1,1 -${r * 0.5},0" fill="none" stroke="#c84a1a" stroke-width="2.6"/>`));
  push(P, 'body', blob(ellipse(48, 112, 26, 25), c, { ink, hl: [0.35, 0.25] }));
  if (deco === 'glow' || deco === 'spiral') push(P, 'body', ...[[44, 88, -0.3], [62, 86, 0.3]].map(([x, y, a]) =>
    tube(`M${x},${y + 4} Q${x + a * 20},${y - 14} ${x + a * 14},${y - 26}`, 3, shade(c, -0.2), ink) + halo(uid('h'), x + a * 14, y - 30, 12, '#fff6a0') + blob(ellipse(x + a * 14, y - 30, 6, 7), '#fff6b0', { ink: '#c8a830', w: 1.2, rim: false })));
  if (deco === 'horns') push(P, 'body', blob('M54,90 L60,70 L64,92 Z', '#e8781c', { ink: '#6a3008', w: 1.4 }));
  if (deco === 'spikes') push(P, 'body', blob('M50,90 L58,66 L64,92 Z', shade(c, -0.3), { ink, w: 1.4 }));
  push(P, 'face', blob(ellipse(30, 118, 9, 9), '#f8c81c', { ink: '#8a6010', w: 1.4, rim: false }),
    `<circle cx="38" cy="108" r="9" fill="#fdfdf8" stroke="${ink}" stroke-width="1.8"/><circle cx="35" cy="109" r="4.2" fill="#101418"/><circle cx="33.5" cy="107" r="1.4" fill="#fff"/>`);
  return assemble(kind, P, part);
}

export const CRITTER_SVG = {
  tofu: tofuSvg, pissenlit: pissenlitSvg, rose: roseSvg, tournesol: tournesolSvg,
  plikplok: (p) => jellySvg('plikplok', p), gloot: (p) => jellySvg('gloot', p), splatch: (p) => jellySvg('splatch', p),
  feuVif: (p) => flameSvg('feuVif', p), feuJoie: (p) => flameSvg('feuJoie', p), feuFurieux: (p) => flameSvg('feuFurieux', p), feuFollet: (p) => flameSvg('feuFollet', p),
  aminite: (p) => aminiteSvg(p),
  ...(Object.fromEntries(Object.keys(PIOU).map((k) => [k, (p?: CritterPart) => piouSvg(k as CritterKind, p)])) as Record<string, (p?: CritterPart) => string>),
  tofuMalade: (p) => tofuMaladeSvg(p),
  arakneMalade: (p) => spiderSvg('arakneMalade', p), araknose: (p) => spiderSvg('araknose', p), arakmute: (p) => spiderSvg('arakmute', p),
  tournesolSauvage: (p) => astrubPlantSvg('tournesolSauvage', p), roseDemo: (p) => astrubPlantSvg('roseDemo', p), pissenlitDiabo: (p) => astrubPlantSvg('pissenlitDiabo', p),
  epouvanteur: (p) => astrubPlantSvg('epouvanteur', p), gardienne: (p) => astrubPlantSvg('gardienne', p), tournesolAffame: (p) => astrubPlantSvg('tournesolAffame', p),
  ...(Object.fromEntries(Object.keys(LARVE).map((k) => [k, (p?: CritterPart) => larveSvg(k as CritterKind, p)])) as Record<string, (p?: CritterPart) => string>),
  chakrobat: (p) => catSvg('chakrobat', p), tigrimas: (p) => catSvg('tigrimas', p), ronronchon: (p) => catSvg('ronronchon', p),
  palichon: (p) => sheepSvg('palichon', p), orageux: (p) => sheepSvg('orageux', p), nuageux: (p) => sheepSvg('nuageux', p), bouftor: (p) => sheepSvg('bouftor', p),
} as Record<CritterKind, (part?: CritterPart) => string>;

/** Feu follet seul (piège de la Forêt) : cadre 60 × 70, centre en (30, 44). */
export function wispSvg(col = '#7ff0b0'): string {
  begin();
  return svg(60, 70, '', glowOrb(30, 44, 13, col));
}
