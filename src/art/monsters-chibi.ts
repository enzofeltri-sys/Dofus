import { svg } from './kit';
import { shade } from '../svg';
import { CHAFER_H, CHAFER_PARTS, CHAFER_W, type ChaferKind, type ChaferPart } from './chafer';

/**
 * Monstres de la Crypte « version Archero », assortis au Sacrieur chibi :
 * grosse tête ronde, petit corps, bottes et armes surdimensionnées, formes rondes et brillantes.
 * Mêmes morceaux, mêmes pivots et même cadre que les anciens dessins (animations inchangées) ;
 * ils regardent vers la GAUCHE. Pieds en (84, 177).
 */

type Parts = Record<ChaferPart, string[]>;
const empty = (): Parts => ({ cape: [], armB: [], legB: [], pelvis: [], legF: [], chest: [], shield: [], armF: [], head: [] });

const LW = 1.7;
let n = 0;
let pre = 'mc';
let builds = 0;
const uid = (p: string) => `${pre}${p}${n++}`;
function begin() {
  n = 0;
  pre = `mc${(builds++).toString(36)}`;
}

interface BlobOpts { ink?: string; w?: number; hl?: [number, number]; flat?: boolean; rim?: boolean }
/** Forme ronde et brillante (lumière en haut à GAUCHE : les monstres regardent vers la gauche). */
function blob(d: string, base: string, o: BlobOpts = {}): string {
  const g = uid('g'), s = uid('s'), c = uid('c');
  const ink = o.ink ?? shade(base, -0.7);
  const [hx, hy] = o.hl ?? [0.36, 0.3];
  return [
    `<radialGradient id="${g}" cx="${hx}" cy="${hy}" r="0.9"><stop offset="0" stop-color="${shade(base, o.flat ? 0.08 : 0.26)}"/><stop offset="0.5" stop-color="${base}"/><stop offset="1" stop-color="${shade(base, -0.24)}"/></radialGradient>`,
    `<linearGradient id="${s}" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#1a0804" stop-opacity="0.26"/><stop offset="0.32" stop-color="#1a0804" stop-opacity="0"/></linearGradient>`,
    `<clipPath id="${c}"><path d="${d}"/></clipPath>`,
    `<path d="${d}" fill="url(#${g})"/>`,
    `<path d="${d}" fill="url(#${s})"/>`,
    o.rim === false ? '' : `<path d="${d}" fill="none" stroke="#fff" stroke-width="3" opacity="0.16" clip-path="url(#${c})" transform="translate(1.6,1.2)"/>`,
    `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${o.w ?? LW}" stroke-linejoin="round" stroke-linecap="round"/>`,
  ].join('');
}

/** Os en tube arrondi (contour + remplissage + reflet). */
function bone(pts: [number, number][], w: number, col = BONE): string {
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  return `<path d="${d}" fill="none" stroke="${BONE_INK}" stroke-width="${w + LW * 2}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w * 0.3}" stroke-linecap="round" opacity="0.35" transform="translate(-${w * 0.18},-${w * 0.18})"/>`;
}

const glowFilter = (id: string, sd = 1.6) => `<filter id="${id}" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;

const BONE = '#efe6cf';
const BONE_INK = '#4a3a26';
const GOLD = '#f0b42a';
const GOLD_INK = '#6a4808';
const IRON = '#8c8a96';
const BOOT = '#4b4954';

function assemble(P: Parts, part?: ChaferPart, wrap = (s: string) => s, defs = ''): string {
  const body = part ? P[part].join('') : CHAFER_PARTS.map((k) => P[k].join('')).join('');
  return svg(CHAFER_W, CHAFER_H, defs, wrap(body));
}

/* ======================================================================================== */
/* Chafers                                                                                   */
/* ======================================================================================== */

export function chaferChibiSvg(kind: ChaferKind, part?: ChaferPart): string {
  begin();
  const P = empty();
  const glow = uid('glow');

  // Cape rouge du sergent, derrière tout
  if (kind === 'sergent') {
    P.cape.push(blob('M84,74 Q108,88 118,128 L108,124 L104,136 L95,126 L86,134 Q84,104 78,82 Z', '#b22a26', { ink: '#3e0c0a' }));
    P.cape.push(`<path d="M88,84 Q100,104 102,124" fill="none" stroke="#5a0e0c" stroke-width="1" opacity="0.6"/>`);
  }

  // Bras arrière (pend le long du flanc) et main osseuse
  P.armB.push(bone([[98, 86], [104, 98], [103, 110]], 5.2));
  P.armB.push(blob('M98,110 Q103,106 108,110 Q109,116 103,117 Q98,116 98,110 Z', BONE, { ink: BONE_INK, rim: false }));

  // Bouclier du piquier (porté par le bras arrière)
  if (kind === 'piquier') {
    P.shield.push(blob('M94,80 Q112,76 124,82 Q126,106 112,124 Q98,116 94,98 Z', '#7a8a2a', { ink: '#262c0a' }));
    P.shield.push(blob('M101,88 Q111,86 118,89 Q117,102 110,112 Q103,106 101,96 Z', shade('#7a8a2a', -0.12), { ink: '#262c0a', flat: true, rim: false }));
    P.shield.push(blob('M106,92 L114,91 L110,104 Z', GOLD, { ink: GOLD_INK, w: 1.2, rim: false }));
    P.shield.push(`<circle cx="99" cy="85" r="1.6" fill="${GOLD}" stroke="${GOLD_INK}" stroke-width="0.7"/><circle cx="119" cy="86" r="1.6" fill="${GOLD}" stroke="${GOLD_INK}" stroke-width="0.7"/>`);
  }

  // Jambes : os courts, genouillère ronde, grosse botte cerclée d'or
  const leg = (arr: string[], hipX: number, kneeX: number, bootX: number) => {
    arr.push(bone([[hipX, 122], [kneeX, 138], [bootX + 4, 150]], 5.4));
    arr.push(blob(`M${kneeX - 6.5},${138} a6.5,6 0 1,0 13,0 a6.5,6 0 1,0 -13,0 Z`, IRON, { ink: '#26242c' }));
    const b = `M${bootX - 12},${152} Q${bootX - 13},${146} ${bootX - 4},${145} L${bootX + 10},${145} Q${bootX + 15},${147} ${bootX + 15},${156} L${bootX + 15},${172} Q${bootX + 14},${177} ${bootX + 8},${177} L${bootX - 15},${177} Q${bootX - 22},${176} ${bootX - 21},${170} Q${bootX - 19},${163} ${bootX - 12},${161} Z`;
    arr.push(blob(b, BOOT, { ink: '#1c1a20' }));
    arr.push(`<path d="M${bootX - 13},${152} Q${bootX + 1},${149} ${bootX + 15},${152}" fill="none" stroke="${GOLD_INK}" stroke-width="4.6" stroke-linecap="round"/><path d="M${bootX - 13},${152} Q${bootX + 1},${149} ${bootX + 15},${152}" fill="none" stroke="${GOLD}" stroke-width="2.8" stroke-linecap="round"/>`);
    arr.push(`<path d="M${bootX - 18},${172} L${bootX + 13},${172}" stroke="#1c1a20" stroke-width="1" opacity="0.6"/>`);
  };
  leg(P.legB, 94, 99, 98);
  leg(P.legF, 80, 74, 70);

  // Bassin et pagne effiloché
  P.pelvis.push(blob('M74,106 Q86,100 98,106 L96,116 Q86,120 76,116 Z', BONE, { ink: BONE_INK }));
  const ragCol = kind === 'furtif' ? '#3e3a52' : '#7a6442';
  P.pelvis.push(blob('M71,108 Q86,104 101,108 L103,120 L97,117 L94,127 L88,118 L84,128 L79,118 L73,125 L72,117 L68,121 Z', ragCol, { ink: shade(ragCol, -0.65) }));

  // Colonne et petite cage thoracique ronde
  P.chest.push(bone([[78, 66], [84, 80], [87, 96], [86, 108]], 4.2));
  for (let i = 0; i < 4; i++) {
    const y = 75 + i * 7.5, w = 15 - i * 2.2, cx = 85 + i * 0.6;
    const ribF = `M${cx},${y} Q${cx - w - 3},${y - 1} ${cx - w + 2},${y + 7}`;
    const ribB = `M${cx},${y} Q${cx + w * 0.75 + 2},${y} ${cx + w * 0.65},${y + 6}`;
    for (const d of [ribB, ribF]) {
      P.chest.push(`<path d="${d}" fill="none" stroke="${BONE_INK}" stroke-width="5.6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${BONE}" stroke-width="3" stroke-linecap="round"/>`);
    }
  }
  if (kind === 'sergent') {
    // plastron rouge à rivets d'or
    P.chest.push(blob('M70,74 Q86,68 100,74 Q102,92 94,104 Q84,108 76,104 Q68,92 70,74 Z', '#a8302a', { ink: '#3e0c0a' }));
    P.chest.push(`<path d="M72,79 Q86,74 99,79" fill="none" stroke="${GOLD}" stroke-width="2.2"/><circle cx="78" cy="88" r="1.6" fill="${GOLD}"/><circle cx="92" cy="88" r="1.6" fill="${GOLD}"/>`);
  }
  if (kind === 'furtif') {
    // écharpe sombre qui flotte
    P.chest.push(blob('M70,66 Q86,62 96,68 L94,76 Q84,72 72,74 Z', '#3e3a52', { ink: '#141220' }));
    P.chest.push(blob('M94,68 Q108,66 116,74 L110,76 L114,82 Q104,78 94,76 Z', '#3e3a52', { ink: '#141220' }));
  }

  // Bras avant tendu vers la gauche, tenant l'arme
  P.armF.push(bone([[74, 86], [63, 96], [53, 98]], 5.2));
  if (kind === 'piquier') {
    // lance : hampe en bois, fer large
    P.armF.push(`<path d="M68,124 L22,28" stroke="#2e1e10" stroke-width="7" stroke-linecap="round"/><path d="M68,124 L22,28" stroke="#9a6a3a" stroke-width="4" stroke-linecap="round"/>`);
    P.armF.push(blob('M14,8 Q24,14 27,28 L21,33 L15,30 Q11,18 14,8 Z', '#e8eef2', { ink: '#3a4450' }));
    P.armF.push(blob('M17,30 L26,26 L28,31 L19,35 Z', GOLD, { ink: GOLD_INK, w: 1.2, rim: false }));
  } else if (kind === 'furtif') {
    // dague courbe
    P.armF.push(blob('M48,96 Q34,90 26,78 Q34,82 50,92 Z', '#7a8090', { ink: '#1c1e26' }));
    P.armF.push(`<path d="M30,82 Q38,88 48,93" fill="none" stroke="#eef2f6" stroke-width="1.2" opacity="0.9"/>`);
    P.armF.push(blob('M46,92 L52,90 L54,99 L48,101 Z', '#2e3036', { ink: '#121316', rim: false }));
  } else {
    // cimeterre (le sergent a une lame plus large et dorée)
    const big = kind === 'sergent';
    const blade = big
      ? 'M50,98 L34,88 Q10,76 2,86 Q2,102 22,106 Q36,108 50,104 Z'
      : 'M50,98 L36,90 Q16,80 8,86 Q6,98 22,102 Q34,104 50,102 Z';
    P.armF.push(blob(blade, big ? '#6a6e7a' : '#5a5e68', { ink: '#16171a' }));
    P.armF.push(`<path d="${big ? 'M5,88 Q4,100 22,104 Q34,106 48,103' : 'M10,88 Q8,98 22,100 Q34,102 48,101'}" fill="none" stroke="#eef2f4" stroke-width="2.2" stroke-linecap="round"/>`);
    P.armF.push(blob('M47,92 L56,90 L58,106 L49,108 Z', big ? GOLD : '#2e3036', { ink: big ? GOLD_INK : '#121316', rim: false }));
  }
  P.armF.push(blob('M48,94 Q54,90 59,95 Q59,102 53,103 Q48,101 48,94 Z', BONE, { ink: BONE_INK, rim: false }));

  // Tête : gros crâne rond, mâchoire à dents, orbites à lueur rouge
  const h = P.head;
  h.push(glowFilter(glow, 1.8));
  // mâchoire inférieure (devant à gauche)
  h.push(blob('M40,58 Q38,72 52,76 Q66,78 74,68 L72,60 Z', BONE, { ink: BONE_INK }));
  h.push(`<path d="M44,63 L72,65 L71,70 L47,69 Z" fill="#fffdf3" stroke="${BONE_INK}" stroke-width="1.1"/><path d="M50,63.4 L50,69.4 M56,63.8 L56,69.8 M62,64.2 L62,70 M67,64.6 L67,70" stroke="${BONE_INK}" stroke-width="0.9"/>`);
  // crâne
  h.push(blob('M36,40 C34,20 50,8 68,8 C88,8 102,20 100,40 C99,54 90,62 76,64 L50,64 C42,60 36,52 36,40 Z', '#f4ecd6', { ink: BONE_INK }));
  // orbites de trois-quarts (l'avant plus grande) et lueur rouge
  h.push(`<path d="M41,36 Q43,28 53,30 L60,37 Q60,48 50,48 Q41,47 41,36 Z" fill="#2a1e22"/>`);
  h.push(`<path d="M67,35 Q72,29 79,32 Q81,43 72,45 Q66,43 67,35 Z" fill="#2a1e22"/>`);
  h.push(`<circle cx="50" cy="39" r="5" fill="#ff4a2c" filter="url(#${glow})" opacity="0.9"/><circle cx="73" cy="38" r="3.8" fill="#ff4a2c" filter="url(#${glow})" opacity="0.8"/>`);
  h.push(`<circle cx="50" cy="39" r="2.6" fill="#ffd0a0"/><circle cx="73" cy="38" r="2" fill="#ffd0a0"/>`);
  h.push(`<path d="M38,30 Q47,23 61,33 M65,32 Q74,25 84,30" fill="none" stroke="${BONE_INK}" stroke-width="2" stroke-linecap="round"/>`);
  h.push(`<path d="M57,50 L62,50 L59.5,56 Z" fill="#3a2a2a"/>`);
  h.push(`<path d="M86,14 L82,24 L87,28" fill="none" stroke="${BONE_INK}" stroke-width="1.3" opacity="0.7"/>`);
  h.push(`<ellipse cx="54" cy="16" rx="9" ry="4" fill="#fff" opacity="0.4" transform="rotate(-15 54 16)"/>`);
  // couvre-chefs
  if (kind === 'piquier' || kind === 'sergent') {
    const c = kind === 'piquier' ? '#8a9a34' : '#a8302a';
    const ci = kind === 'piquier' ? '#262c08' : '#2a0a08';
    h.push(blob('M32,32 C31,10 49,0 68,0 C88,0 104,10 102,32 Q68,22 32,32 Z', c, { ink: ci }));
    h.push(`<path d="M33,31 Q68,21 101,31" fill="none" stroke="${GOLD_INK}" stroke-width="4.6" stroke-linecap="round"/><path d="M33,31 Q68,21 101,31" fill="none" stroke="${GOLD}" stroke-width="2.8" stroke-linecap="round"/>`);
    if (kind === 'piquier') h.push(blob('M64,1 a4.5,4 0 1,0 9,0 a4.5,4 0 1,0 -9,0 Z', GOLD, { ink: GOLD_INK, w: 1.2 }));
    else h.push(blob('M60,4 Q54,-10 70,-14 Q86,-12 80,2 Q72,6 60,4 Z', '#e0382e', { ink: '#5a0e0c' }));
  }
  if (kind === 'furtif') {
    // capuche sombre
    h.push(blob('M30,46 C26,18 44,2 68,2 C92,2 108,18 104,44 Q98,30 86,24 Q66,18 48,26 Q36,34 30,46 Z', '#3e3a52', { ink: '#141220' }));
    h.push(`<path d="M86,24 Q100,34 104,44" fill="none" stroke="#141220" stroke-width="1" opacity="0.6"/>`);
  }
  if (kind === 'debutant') {
    // bandeau de tissu noué (le débutant n'a pas de casque)
    h.push(blob('M37,26 Q68,14 100,26 L100,33 Q68,22 37,33 Z', '#7a6442', { ink: '#2e2210' }));
    h.push(blob('M98,27 Q108,24 114,30 L108,32 L112,37 Q104,35 98,32 Z', '#7a6442', { ink: '#2e2210' }));
  }

  const ghostWrap = (s: string) => kind === 'furtif'
    ? `<g opacity="0.7"><g filter="url(#${pre}ghost)">${s}</g></g>` : s;
  const defs = kind === 'furtif'
    ? `<filter id="${pre}ghost"><feColorMatrix type="matrix" values="0.6 0.15 0.15 0 0.04  0.2 0.8 0.25 0 0.08  0.3 0.3 0.95 0 0.14  0 0 0 1 0"/></filter>` : '';
  return assemble(P, part, ghostWrap, defs);
}

/* ======================================================================================== */
/* Kardorim (boss) et Kardorib (invocation)                                                  */
/* ======================================================================================== */

const K_SKIN = '#8da08c';
const K_SKIN_INK = '#2a3a2e';
const K_STONE = '#9a9384';
const K_STONE_INK = '#3a352c';
const K_GLOW = '#b6ff7a';

/** Kardorim : colosse mort-vivant trapu, casque à cornes d'or, bouclier de pierre, épée à lueur verte. */
export function kardorimChibiSvg(part?: ChaferPart): string {
  begin();
  const P = empty();
  const glow = uid('glow');

  // pan de tissu vert dans le dos
  P.cape.push(blob('M84,72 Q110,84 116,130 L106,126 L100,138 L92,128 L84,136 Q84,104 78,80 Z', '#3f7a52', { ink: '#12301c' }));

  // bras arrière massif + bouclier rond de pierre cerclé d'or
  P.armB.push(blob('M94,80 Q108,82 108,100 L104,112 Q98,114 94,108 Z', K_SKIN, { ink: K_SKIN_INK }));
  P.shield.push(blob('M92,92 a20,22 0 1,0 40,0 a20,22 0 1,0 -40,0 Z', K_STONE, { ink: K_STONE_INK }));
  P.shield.push(`<circle cx="112" cy="92" r="17" fill="none" stroke="${GOLD_INK}" stroke-width="4.4"/><circle cx="112" cy="92" r="17" fill="none" stroke="${GOLD}" stroke-width="2.6"/>`);
  P.shield.push(blob('M106,86 L118,86 L112,100 Z', GOLD, { ink: GOLD_INK, w: 1.2 }));
  P.shield.push(`<path d="M100,80 L106,90 L102,98 M120,100 L116,108" fill="none" stroke="${K_STONE_INK}" stroke-width="1.2" opacity="0.7"/>`);

  // jambes trapues, grosses bottes cerclées d'or
  const leg = (arr: string[], x: number, bx: number) => {
    arr.push(blob(`M${x - 8},120 Q${x},116 ${x + 8},120 L${bx + 7},150 L${bx - 7},150 Z`, K_SKIN, { ink: K_SKIN_INK }));
    const b = `M${bx - 13},150 Q${bx - 13},144 ${bx - 4},143 L${bx + 10},143 Q${bx + 15},145 ${bx + 15},154 L${bx + 15},172 Q${bx + 14},177 ${bx + 8},177 L${bx - 16},177 Q${bx - 23},176 ${bx - 22},169 Q${bx - 20},161 ${bx - 13},160 Z`;
    arr.push(blob(b, '#4a4038', { ink: '#1c1814' }));
    arr.push(`<path d="M${bx - 14},150 Q${bx + 1},147 ${bx + 15},150" fill="none" stroke="${GOLD_INK}" stroke-width="5" stroke-linecap="round"/><path d="M${bx - 14},150 Q${bx + 1},147 ${bx + 15},150" fill="none" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/>`);
  };
  leg(P.legB, 96, 98);
  leg(P.legF, 78, 70);

  // short brun, ceinture verte à boucle d'or
  P.pelvis.push(blob('M66,106 Q86,100 106,106 L106,124 Q96,128 86,124 Q76,128 66,124 Z', '#5a3a22', { ink: '#22140a' }));
  P.pelvis.push(blob('M65,104 Q86,98 107,104 L107,111 Q86,105 65,111 Z', '#3f7a52', { ink: '#12301c', flat: true }));
  P.pelvis.push(blob('M80,101 L92,101 L92,111 L80,111 Z', GOLD, { ink: GOLD_INK, w: 1.2 }));

  // torse massif et épaulières de pierre à pointes d'or
  P.chest.push(blob('M64,74 Q86,62 108,74 Q112,92 104,106 L68,106 Q60,92 64,74 Z', K_SKIN, { ink: K_SKIN_INK }));
  P.chest.push(`<path d="M74,84 Q86,90 98,84 M86,90 L86,104" fill="none" stroke="${K_SKIN_INK}" stroke-width="1" opacity="0.45"/>`);
  P.chest.push(`<path d="M76,92 l4,3 M92,94 l5,-2" stroke="#5a2a2a" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>`);
  for (const [cx, cy] of [[64, 74], [104, 72]] as [number, number][]) {
    P.chest.push(blob(`M${cx - 13},${cy + 4} Q${cx - 12},${cy - 10} ${cx},${cy - 11} Q${cx + 12},${cy - 10} ${cx + 13},${cy + 4} Q${cx},${cy + 9} ${cx - 13},${cy + 4} Z`, K_STONE, { ink: K_STONE_INK }));
    P.chest.push(blob(`M${cx - 3},${cy - 10} L${cx},${cy - 20} L${cx + 3},${cy - 10} Z`, GOLD, { ink: GOLD_INK, w: 1.1, rim: false }));
  }

  // bras avant et grande épée à lueur verte
  P.armF.push(blob('M70,78 Q60,84 54,94 L60,100 Q66,92 76,88 Z', K_SKIN, { ink: K_SKIN_INK }));
  P.armF.push(glowFilter(glow, 3.2));
  P.armF.push(`<path d="M52,94 L6,40" stroke="${K_GLOW}" stroke-width="14" stroke-linecap="round" filter="url(#${glow})" opacity="0.65"/>`);
  P.armF.push(blob('M50,90 L10,36 Q2,30 4,40 L46,98 Z', '#dcefdc', { ink: '#2a4a32' }));
  P.armF.push(`<path d="M44,92 L8,40" stroke="#f4fff0" stroke-width="1.8" opacity="0.9" stroke-linecap="round"/>`);
  P.armF.push(blob('M42,90 L58,86 L60,92 L44,97 Z', GOLD, { ink: GOLD_INK, w: 1.2 }));
  P.armF.push(blob('M50,94 Q58,90 63,96 Q63,104 56,105 Q50,102 50,94 Z', K_SKIN, { ink: K_SKIN_INK, rim: false }));

  // tête : casque à cornes d'or, visière sombre, yeux verts
  const h = P.head;
  const hg = uid('hg');
  h.push(glowFilter(hg, 2));
  h.push(blob('M34,42 C32,18 50,6 68,6 C88,6 104,18 102,42 C101,58 90,68 68,68 C46,68 35,58 34,42 Z', '#6f6a62', { ink: '#26221c' }));
  h.push(`<path d="M38,38 Q68,30 98,38 L96,50 Q68,44 40,50 Z" fill="#1a1612" stroke="#0e0c0a" stroke-width="1.2"/>`);
  h.push(`<ellipse cx="54" cy="44" rx="6" ry="3" fill="${K_GLOW}" filter="url(#${hg})"/><ellipse cx="78" cy="43" rx="5" ry="2.6" fill="${K_GLOW}" filter="url(#${hg})"/>`);
  h.push(`<ellipse cx="54" cy="44" rx="3.4" ry="1.6" fill="#eaffd8"/><ellipse cx="78" cy="43" rx="2.8" ry="1.3" fill="#eaffd8"/>`);
  h.push(`<path d="M68,8 L68,36 M40,56 Q68,62 96,56" fill="none" stroke="#26221c" stroke-width="1.2" opacity="0.5"/>`);
  h.push(`<path d="M37,34 Q68,26 99,34" fill="none" stroke="${GOLD_INK}" stroke-width="4.4" stroke-linecap="round"/><path d="M37,34 Q68,26 99,34" fill="none" stroke="${GOLD}" stroke-width="2.6" stroke-linecap="round"/>`);
  h.push(blob('M38,22 Q22,16 14,2 Q30,4 42,14 Z', GOLD, { ink: GOLD_INK }));
  h.push(blob('M96,20 Q110,12 116,-2 Q104,2 92,12 Z', GOLD, { ink: GOLD_INK }));
  h.push(`<ellipse cx="54" cy="16" rx="9" ry="4" fill="#fff" opacity="0.35" transform="rotate(-15 54 16)"/>`);

  return assemble(P, part);
}

/** Kardorib : petit chien squelette à cornes de bélier. */
export function kardoribChibiSvg(part?: ChaferPart): string {
  begin();
  const P = empty();
  const glow = uid('glow');
  const paw = (x: number) => blob(`M${x - 10},${170} Q${x - 10},${162} ${x},${161} Q${x + 10},${162} ${x + 10},${170} Q${x + 10},${177} ${x},${177} L${x - 6},${177} Q${x - 11},${176} ${x - 10},${170} Z`, BONE, { ink: BONE_INK, rim: false });
  // pattes arrière et avant
  P.legB.push(bone([[104, 118], [112, 138], [106, 162]], 6.5));
  P.legB.push(paw(106));
  P.legF.push(bone([[66, 118], [60, 140], [62, 162]], 6.5));
  P.legF.push(paw(60));
  // bassin et queue
  P.pelvis.push(bone([[108, 112], [122, 100], [128, 84], [136, 76]], 4.6));
  P.pelvis.push(blob('M98,112 a10,8 0 1,0 20,0 a10,8 0 1,0 -20,0 Z', BONE, { ink: BONE_INK }));
  // colonne, côtes, épines dorsales
  P.chest.push(bone([[62, 106], [84, 100], [110, 108]], 5.2));
  for (let i = 0; i < 4; i++) {
    const x = 70 + i * 10;
    const d = `M${x},${102} Q${x - 5},${116} ${x + 2},${123}`;
    P.chest.push(`<path d="${d}" fill="none" stroke="${BONE_INK}" stroke-width="5.6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${BONE}" stroke-width="3" stroke-linecap="round"/>`);
    P.chest.push(blob(`M${x - 3},${100} L${x + 1},${88 - (i % 2) * 4} L${x + 5},${100} Z`, BONE, { ink: BONE_INK, w: 1.3, rim: false }));
  }
  // gros crâne de bélier, cornes enroulées, crocs, lueur rouge
  const h = P.head;
  h.push(glowFilter(glow, 1.6));
  h.push(blob('M22,98 Q18,78 36,72 Q58,68 66,84 Q68,100 54,108 L32,108 Q22,106 22,98 Z', '#f4ecd6', { ink: BONE_INK }));
  h.push(`<path d="M20,102 L46,104 L44,112 L26,112 Z" fill="#fffdf3" stroke="${BONE_INK}" stroke-width="1.1"/><path d="M27,104 l1,7 M33,104.4 l0.6,7.6 M39,104.6 l0.4,7.4" stroke="${BONE_INK}" stroke-width="0.9"/>`);
  h.push(`<path d="M30,88 Q34,82 42,85 Q43,94 36,95 Q30,94 30,88 Z" fill="#2a1e22"/>`);
  h.push(`<circle cx="37" cy="89" r="4" fill="#ff4a2c" filter="url(#${glow})"/><circle cx="37" cy="89" r="2" fill="#ffd0a0"/>`);
  h.push(`<path d="M50,78 C54,62 74,58 80,72 C84,84 72,92 64,86 C58,82 62,74 68,76" fill="none" stroke="#3a2210" stroke-width="10" stroke-linecap="round"/><path d="M50,78 C54,62 74,58 80,72 C84,84 72,92 64,86 C58,82 62,74 68,76" fill="none" stroke="#c8965e" stroke-width="7" stroke-linecap="round"/>`);
  h.push(`<path d="M56,68 l4,3 M66,63 l2,4 M76,66 l-1,4" stroke="#6a4420" stroke-width="1.2"/>`);
  h.push(`<ellipse cx="34" cy="78" rx="7" ry="3" fill="#fff" opacity="0.4" transform="rotate(-15 34 78)"/>`);
  return assemble(P, part);
}
