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
const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0 Z`;
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
  if (kind === 'vampire' || kind === 'maitreVampire') return vampireChibiSvg(kind, part);
  if (kind === 'bwork' || kind === 'bworkMage' || kind === 'bworkArcher' || kind === 'bworkette') return bworkChibiSvg(kind, part);
  begin();
  const P = empty();
  const glow = uid('glow');

  // Cape rouge du sergent, derrière tout
  if (kind === 'sergent') {
    P.cape.push(blob('M86,70 Q112,86 120,132 L110,127 L105,140 L96,129 L87,137 Q86,104 80,78 Z', '#9a2420', { ink: '#3e0c0a' }));
    P.cape.push(`<path d="M90,82 Q102,104 104,128" fill="none" stroke="#5a0e0c" stroke-width="1" opacity="0.6"/>`);
  }
  // Éclaireur : carquois de flèches dans le dos, puis longue cape sombre en lambeaux
  if (kind === 'eclaireur') {
    for (const [x, y] of [[104, 30], [111, 34], [98, 36]] as [number, number][]) {
      P.cape.push(`<path d="M${x - 10},${y + 34} L${x},${y}" stroke="#3a2a14" stroke-width="3.4" stroke-linecap="round"/><path d="M${x - 10},${y + 34} L${x},${y}" stroke="#c8a060" stroke-width="1.6"/>`);
      P.cape.push(blob(`M${x},${y} L${x - 4},${y - 9} L${x + 1},${y - 5} L${x + 4},${y - 11} L${x + 4},${y - 2} Z`, '#efe4c4', { ink: '#5a4a2a', w: 1, rim: false }));
    }
    P.cape.push(blob('M88,62 L102,46 Q108,44 110,50 L98,74 Q92,76 88,70 Z', '#b0682a', { ink: '#3e1e08' }));
    P.cape.push(`<path d="M92,58 L106,50" stroke="${GOLD}" stroke-width="2.4"/>`);
    P.cape.push(blob('M84,64 Q114,76 122,140 L114,132 L110,148 L102,134 L96,150 L90,136 L84,146 Q86,104 78,72 Z', '#2e3438', { ink: '#0e1012' }));
    P.cape.push(`<path d="M92,80 Q104,104 106,134 M86,90 Q92,116 92,140" fill="none" stroke="#14181a" stroke-width="1.2" opacity="0.7"/>`);
  }

  // Bras arrière fin, pend le long du flanc
  P.armB.push(bone([[97, 84], [104, 100], [101, 114]], 4.2));
  P.armB.push(blob('M96,114 Q101,110 106,114 Q107,119 101,120 Q96,119 96,114 Z', BONE, { ink: BONE_INK, rim: false }));

  // Jambes fines, genouillère ronde, grosse botte sombre cerclée d'or
  const leg = (arr: string[], hipX: number, kneeX: number, bootX: number) => {
    arr.push(bone([[hipX, 118], [kneeX, 138], [bootX + 4, 150]], 4.4));
    arr.push(blob(`M${kneeX - 6},138 a6,5.6 0 1,0 12,0 a6,5.6 0 1,0 -12,0 Z`, IRON, { ink: '#26242c' }));
    const b = `M${bootX - 11},152 Q${bootX - 12},146 ${bootX - 4},145 L${bootX + 9},145 Q${bootX + 14},147 ${bootX + 14},156 L${bootX + 14},172 Q${bootX + 13},177 ${bootX + 7},177 L${bootX - 15},177 Q${bootX - 22},176 ${bootX - 21},170 Q${bootX - 19},163 ${bootX - 11},161 Z`;
    arr.push(blob(b, kind === 'primitif' || kind === 'ronin' ? '#7a4a28' : BOOT, { ink: '#1c1a20' }));
    arr.push(`<path d="M${bootX - 12},152 Q${bootX + 1},149 ${bootX + 14},152" fill="none" stroke="${GOLD_INK}" stroke-width="4.6" stroke-linecap="round"/><path d="M${bootX - 12},152 Q${bootX + 1},149 ${bootX + 14},152" fill="none" stroke="${GOLD}" stroke-width="2.8" stroke-linecap="round"/>`);
  };
  leg(P.legB, 94, 100, 99);
  leg(P.legF, 80, 72, 68);

  // Bassin osseux
  P.pelvis.push(blob('M74,104 Q86,98 99,104 L96,116 Q86,121 77,116 Z', BONE, { ink: BONE_INK }));
  P.pelvis.push(`<path d="M80,108 a3,2.6 0 1,0 6,0 a3,2.6 0 1,0 -6,0 M88,108 a3,2.6 0 1,0 6,0 a3,2.6 0 1,0 -6,0" fill="#5a4a36" opacity="0.55"/>`);

  // Colonne voûtée (le dos se courbe, la tête part en avant) et cage thoracique
  P.chest.push(bone([[88, 106], [92, 94], [90, 80], [82, 70], [72, 64]], 4));
  for (let i = 0; i < 4; i++) {
    const y = 74 + i * 7, w = 14 - i * 2, cx = 89 - i * 0.2;
    const ribF = `M${cx},${y} Q${cx - w - 3},${y + 1} ${cx - w + 2},${y + 8}`;
    const ribB = `M${cx},${y} Q${cx + w * 0.6 + 2},${y + 1} ${cx + w * 0.5},${y + 6}`;
    for (const d of [ribB, ribF]) {
      P.chest.push(`<path d="${d}" fill="none" stroke="${BONE_INK}" stroke-width="5.2" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${BONE}" stroke-width="2.7" stroke-linecap="round"/>`);
    }
  }
  // Chafer Primitif : pagne clair et ceinture à tête de mort ; Chafer Rōnin : plastron vert sombre, jupe de lamelles, fourrure aux épaules
  if (kind === 'primitif') {
    P.pelvis.push(blob('M72,104 L100,104 L102,126 L94,121 L88,132 L82,121 L74,128 L70,120 Z', '#efe4c0', { ink: '#5a4a2a' }));
    P.pelvis.push(blob('M70,102 Q86,98 102,102 L102,108 Q86,104 70,108 Z', '#6a4424', { ink: '#2a1808', w: 1.2 }));
    P.pelvis.push(blob('M82,100 Q86,96 90,100 Q90,106 86,107 Q82,106 82,100 Z', '#f4ecd6', { ink: '#3a2a1a', w: 1, rim: false }), `<circle cx="84.6" cy="101.5" r="1" fill="#2a1416"/><circle cx="87.6" cy="101.5" r="1" fill="#2a1416"/>`);
  }
  if (kind === 'ronin') {
    P.pelvis.push(...[[70, 104], [80, 106], [90, 106], [98, 104]].map(([x, y]) => blob(`M${x},${y} L${x + 10},${y} L${x + 9},${y + 18} L${x + 1},${y + 18} Z`, '#c8a03a', { ink: '#4a3410', w: 1.2 })));
    P.chest.push(blob('M70,70 Q90,62 104,74 L102,104 Q88,110 74,104 Q66,88 70,70 Z', '#3e5c58', { ink: '#122220' }));
    P.chest.push(`<path d="M72,80 Q88,74 103,82 M72,90 Q88,84 103,92" fill="none" stroke="#1e3432" stroke-width="2"/><circle cx="86" cy="96" r="3" fill="${GOLD}" stroke="${GOLD_INK}" stroke-width="0.8"/>`);
    P.chest.push(blob('M62,74 L66,62 L72,70 L78,58 L84,68 L92,58 L96,68 L104,62 L104,78 Q84,84 62,80 Z', '#2e2c26', { ink: '#0e0e0a' }));
  }
  if (kind === 'fantassin') {
    // grand bouclier rond noir cerclé d'orange, porté par le bras arrière
    P.shield.push(blob('M76,104 a28,28 0 1,0 56,0 a28,28 0 1,0 -56,0 Z', '#2a2a30', { ink: '#0a0a0e' }));
    P.shield.push(`<circle cx="104" cy="104" r="25" fill="none" stroke="#e8901c" stroke-width="4"/><path d="M104,79 L104,129" stroke="#e8901c" stroke-width="5"/>`);
    P.shield.push(blob('M92,98 Q100,86 110,92 Q104,104 92,98 Z', '#14141a', { ink: '#000', w: 1, rim: false }), `<circle cx="104" cy="104" r="4" fill="#b8bcc4" stroke="#3a3c44" stroke-width="1"/>`);
  }
  // Grand bouclier rectangulaire du piquier, tenu devant lui
  if (kind === 'piquier') {
    P.shield.push(blob('M26,78 L60,72 L64,146 L30,152 Z', '#6a4424', { ink: '#2a1808' }));
    P.shield.push(blob('M31,83 L56,78.5 L59.5,141 L34.5,146 Z', '#7a8c26', { ink: '#262c08', flat: true, rim: false }));
    P.shield.push(blob('M46,92 L52,108 L60,112 L50,118 L50,132 L44,118 L34,116 L43,108 Z', GOLD, { ink: GOLD_INK, w: 1.2 }));
    for (const [x, y] of [[29, 81], [58, 76], [61, 143], [33, 149]] as [number, number][]) P.shield.push(`<circle cx="${x}" cy="${y}" r="1.6" fill="${GOLD}" stroke="${GOLD_INK}" stroke-width="0.7"/>`);
  }

  // Bras avant fin et arme
  if (kind === 'piquier') {
    // lance droite, tenue à la verticale
    P.armF.push(bone([[74, 84], [70, 96], [64, 102]], 4.2));
    P.armF.push(`<path d="M64,170 L64,20" stroke="#2e1e10" stroke-width="6.4" stroke-linecap="round"/><path d="M64,170 L64,20" stroke="#9a6a3a" stroke-width="3.6" stroke-linecap="round"/>`);
    P.armF.push(blob('M64,2 Q70,11 69,22 L64,26 L59,22 Q58,11 64,2 Z', '#e8eef2', { ink: '#3a4450' }));
    P.armF.push(blob('M59,23 L69,23 L68,28 L60,28 Z', GOLD, { ink: GOLD_INK, w: 1.1, rim: false }));
    P.armF.push(blob('M58,98 Q64,94 69,99 Q69,106 63,107 Q58,105 58,98 Z', BONE, { ink: BONE_INK, rim: false }));
  } else if (kind === 'eclaireur') {
    // arc tenu à bout de bras, flèche encochée pointée vers la gauche
    P.armF.push(bone([[74, 84], [62, 92], [48, 94]], 4.2));
    const bow = 'M44,44 Q20,94 44,144';
    P.armF.push(`<path d="${bow}" fill="none" stroke="#2a1a0a" stroke-width="7" stroke-linecap="round"/><path d="${bow}" fill="none" stroke="#a8743a" stroke-width="4" stroke-linecap="round"/>`);
    P.armF.push(`<path d="M44,44 L58,94 L44,144" fill="none" stroke="#e8e0cc" stroke-width="1.1"/>`);
    for (const y of [44, 144]) P.armF.push(`<circle cx="44" cy="${y}" r="3" fill="${GOLD}" stroke="${GOLD_INK}" stroke-width="1"/>`);
    P.armF.push(`<path d="M60,94 L8,94" stroke="#3a2a14" stroke-width="3.4" stroke-linecap="round"/><path d="M60,94 L8,94" stroke="#c8a060" stroke-width="1.6"/>`);
    P.armF.push(blob('M2,94 L12,88 L10,94 L12,100 Z', '#dfe6ea', { ink: '#3a4450', w: 1.2, rim: false }));
    P.armF.push(blob('M56,94 L64,89 L62,94 L64,99 Z', '#efe4c4', { ink: '#5a4a2a', w: 1, rim: false }));
    P.armF.push(blob('M30,88 Q36,84 40,89 Q40,98 34,99 Q29,96 30,88 Z', BONE, { ink: BONE_INK, rim: false }));
  } else if (kind === 'fantassin') {
    // épée droite à lame noire et poignée rouge, levée vers l'avant
    P.armF.push(bone([[74, 84], [64, 96], [54, 98]], 4.2));
    P.armF.push(blob('M50,92 L14,34 Q10,26 18,28 L58,88 Z', '#34363e', { ink: '#0e0f12' }));
    P.armF.push(`<path d="M16,30 L54,90" stroke="#dfe6ea" stroke-width="1.6" opacity="0.8"/>`);
    P.armF.push(blob('M44,90 L62,80 L64,86 L48,96 Z', '#5a5e68', { ink: '#16171a', w: 1.2, rim: false }), blob('M52,94 L62,110 L56,113 L47,97 Z', '#b02a1e', { ink: '#3e0a06', w: 1.2, rim: false }));
    P.armF.push(blob('M48,94 Q54,90 59,95 Q59,102 53,103 Q48,101 48,94 Z', BONE, { ink: BONE_INK, rim: false }));
  } else if (kind === 'primitif') {
    // poignard de pierre et de fer, manchette de fourrure
    P.armF.push(bone([[74, 84], [63, 95], [53, 98]], 4.2));
    P.armF.push(blob('M50,92 L6,66 L52,102 Z', '#c8ccd4', { ink: '#3a4048' }), `<path d="M8,67 L50,96" stroke="#fff" stroke-width="1.2" opacity="0.8"/>`);
    P.armF.push(blob('M46,92 L56,90 L58,104 L48,106 Z', '#7a4a28', { ink: '#2a1808', rim: false }));
    P.armF.push(blob('M56,88 L60,80 L64,88 L70,82 L70,92 L76,92 L70,100 L60,102 Z', '#5a3a1e', { ink: '#1e1208' }));
    P.armB.push(blob('M96,104 L98,96 L103,102 L108,96 L108,108 L100,112 Z', '#5a3a1e', { ink: '#1e1208' }));
  } else if (kind === 'ronin') {
    // grand couperet carré, fourrure au poignet
    P.armF.push(bone([[74, 84], [63, 95], [53, 98]], 5));
    P.armF.push(blob('M52,90 L6,80 L2,108 L52,106 Z', '#b8bcc4', { ink: '#2a2e34' }), `<path d="M4,104 L50,103" stroke="#f4f8fa" stroke-width="2.4"/><circle cx="16" cy="90" r="3" fill="#2a2e34"/>`);
    P.armF.push(blob('M48,90 L58,88 L60,106 L50,108 Z', '#3a3028', { ink: '#121010', rim: false }));
    P.armF.push(blob('M56,86 L60,78 L64,86 L70,80 L70,92 L76,94 L68,100 L58,100 Z', '#2e2c26', { ink: '#0e0e0a' }));
  } else {
    // cimeterre sombre qui s'évase vers la pointe (comme dans Dofus)
    P.armF.push(bone([[74, 84], [63, 95], [53, 98]], 4.2));
    P.armF.push(blob('M52,95 L20,86 Q6,82 3,92 Q7,106 26,106 L52,104 Z', '#2e3038', { ink: '#0e0f12' }));
    P.armF.push(`<path d="M5,94 Q9,104 26,104 L50,102" fill="none" stroke="#dfe6ea" stroke-width="2.6" stroke-linecap="round"/><path d="M20,88 L50,96" stroke="#5a5e68" stroke-width="1" opacity="0.8"/>`);
    P.armF.push(blob('M48,92 L56,90 L58,106 L50,108 Z', kind === 'sergent' ? GOLD : '#3a3028', { ink: kind === 'sergent' ? GOLD_INK : '#121010', rim: false }));
    P.armF.push(blob('M48,94 Q54,90 59,95 Q59,102 53,103 Q48,101 48,94 Z', BONE, { ink: BONE_INK, rim: false }));
    if (kind === 'sergent') {
      // épaulière rouge cerclée d'or sur l'épaule avant
      P.armF.push(blob('M62,86 Q62,74 74,73 Q86,74 86,86 Q74,92 62,86 Z', '#8a2620', { ink: '#2a0a08' }));
      P.armF.push(`<path d="M63,85 Q74,90.5 85,85" fill="none" stroke="${GOLD_INK}" stroke-width="3.6" stroke-linecap="round"/><path d="M63,85 Q74,90.5 85,85" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round"/>`);
      P.armF.push(`<circle cx="74" cy="80" r="2" fill="${GOLD}" stroke="${GOLD_INK}" stroke-width="0.7"/>`);
    }
  }

  // Tête : crâne allongé vers l'avant, mâchoire ouverte, orbites à lueur rouge
  const h = P.head;
  h.push(glowFilter(glow, 1.8));
  if (kind === 'eclaireur') h.push(blob('M62,3 Q100,2 108,34 Q110,58 94,74 L80,66 Q66,30 62,2 Z', '#2e3438', { ink: '#0e1012' }));
  // fond de la bouche ouverte, puis mâchoire inférieure qui pend
  h.push(`<path d="M38,58 L68,60 L68,70 L40,70 Z" fill="#2a1416"/>`);
  h.push(blob('M36,66 Q34,80 48,83 Q62,84 70,74 L68,66 Z', BONE, { ink: BONE_INK }));
  h.push(`<path d="M40,66 L67,67 L66,71 L42,71 Z" fill="#fffdf3" stroke="${BONE_INK}" stroke-width="1"/><path d="M46,66.4 L46,71 M52,66.6 L52,71 M58,66.8 L58,71 M63,67 L63,71" stroke="${BONE_INK}" stroke-width="0.8"/>`);
  // crâne allongé (la face vers la gauche)
  h.push(blob('M30,42 C28,24 44,13 64,13 C86,13 100,25 99,42 C98,53 91,59 82,61 L70,62 L40,61 C33,57 30,50 30,42 Z', '#f4ecd6', { ink: BONE_INK }));
  h.push(`<path d="M36,56 L68,58 L67,63 L38,62 Z" fill="#fffdf3" stroke="${BONE_INK}" stroke-width="1"/><path d="M42,56.4 L42,62 M48,56.8 L48,62.4 M54,57.2 L54,62.6 M60,57.6 L60,62.8" stroke="${BONE_INK}" stroke-width="0.8"/>`);
  // orbites de trois-quarts et lueur rouge
  h.push(`<path d="M35,35 Q37,27 47,29 L54,36 Q54,46 44,46 Q35,45 35,35 Z" fill="#2a1e22"/>`);
  h.push(`<path d="M61,34 Q66,28 73,31 Q75,42 66,44 Q60,42 61,34 Z" fill="#2a1e22"/>`);
  h.push(`<circle cx="44" cy="38" r="5" fill="#ff4a2c" filter="url(#${glow})" opacity="0.9"/><circle cx="67" cy="37" r="3.8" fill="#ff4a2c" filter="url(#${glow})" opacity="0.8"/>`);
  h.push(`<circle cx="44" cy="38" r="2.6" fill="#ffd0a0"/><circle cx="67" cy="37" r="2" fill="#ffd0a0"/>`);
  h.push(`<path d="M32,29 Q41,22 55,32 M59,31 Q68,24 78,29" fill="none" stroke="${BONE_INK}" stroke-width="2" stroke-linecap="round"/>`);
  h.push(`<path d="M50,47 L55,47 L52.5,53 Z" fill="#3a2a2a"/>`);
  h.push(`<path d="M84,17 L80,27 L85,31" fill="none" stroke="${BONE_INK}" stroke-width="1.3" opacity="0.7"/>`);
  h.push(`<ellipse cx="54" cy="19" rx="10" ry="4" fill="#fff" opacity="0.4" transform="rotate(-12 54 19)"/>`);
  // casques
  if (kind === 'piquier') {
    h.push(blob('M30,32 C29,11 46,2 66,2 C86,2 101,12 100,32 Q64,22 30,32 Z', '#a8b030', { ink: '#2e3208' }));
    h.push(`<path d="M31,31 Q64,21 99,31" fill="none" stroke="${GOLD_INK}" stroke-width="4.4" stroke-linecap="round"/><path d="M31,31 Q64,21 99,31" fill="none" stroke="${GOLD}" stroke-width="2.6" stroke-linecap="round"/>`);
    h.push(blob('M54,4 Q55,-6 62,-6 Q66,-2 64,4 Z', '#a8b030', { ink: '#2e3208', w: 1.2 }));
    h.push(blob('M68,4 Q70,-6 77,-5 Q80,0 77,6 Z', '#a8b030', { ink: '#2e3208', w: 1.2 }));
  }
  if (kind === 'eclaireur') {
    // capuche sombre rabattue sur le crâne, l'ombre mange le haut du visage
    h.push(blob('M26,42 C22,16 44,1 68,1 C92,1 106,16 104,42 Q96,28 70,26 Q44,26 26,42 Z', '#363c42', { ink: '#0e1012' }));
    h.push(`<path d="M30,36 Q48,26 70,26.5 Q92,27 102,38" fill="none" stroke="#12161a" stroke-width="3" opacity="0.6"/>`);
    h.push(`<path d="M38,12 Q52,5 70,5" fill="none" stroke="#6a7278" stroke-width="2.4" stroke-linecap="round" opacity="0.7"/>`);
  }
  if (kind === 'sergent') {
    h.push(blob('M30,32 C29,11 46,2 66,2 C86,2 101,12 100,32 Q64,22 30,32 Z', '#7a2620', { ink: '#2a0a08' }));
    h.push(`<path d="M31,31 Q64,21 99,31" fill="none" stroke="${GOLD_INK}" stroke-width="4.4" stroke-linecap="round"/><path d="M31,31 Q64,21 99,31" fill="none" stroke="${GOLD}" stroke-width="2.6" stroke-linecap="round"/>`);
    // tête de mort sur le casque
    h.push(blob('M54,16 Q54,10 60,10 Q66,10 66,16 Q66,20 63,21 L63,23 L57,23 L57,21 Q54,20 54,16 Z', '#f4ecd6', { ink: '#3a2a1a', w: 1, rim: false }));
    h.push(`<circle cx="58" cy="16" r="1.4" fill="#2a1416"/><circle cx="62.4" cy="16" r="1.4" fill="#2a1416"/>`);
    // plumet rouge en crête
    h.push(blob('M56,8 Q58,0.6 70,0.6 Q86,0.6 96,10 Q88,7 80,8.4 Q70,9.4 62,10.4 Z', '#e0302a', { ink: '#5a0e0c' }));
    h.push(`<path d="M62,6 Q74,3 90,8" fill="none" stroke="#ff8a7a" stroke-width="1.2" opacity="0.7"/>`);
  }

  if (kind === 'fantassin') {
    // bandeau blanc à rayure noire sur le crâne
    h.push(blob('M30,30 C34,16 50,10 66,10 C84,10 98,18 100,30 Q66,20 30,30 Z', '#f2efe6', { ink: '#5a5650' }));
    h.push(`<path d="M32,26 Q66,15 98,25" fill="none" stroke="#1a1a1e" stroke-width="4"/><path d="M96,24 Q108,28 112,40 M98,28 Q106,34 106,44" fill="none" stroke="#f2efe6" stroke-width="4" stroke-linecap="round"/>`);
  }
  if (kind === 'primitif') {
    // capuche de fourrure brune avec deux petites cornes d'os
    h.push(blob('M26,40 C22,14 44,0 68,0 C94,0 108,16 104,46 Q100,60 92,66 L86,58 Q90,30 68,24 Q42,24 30,46 Z', '#8a5a2e', { ink: '#2e1a08' }));
    h.push(`<path d="M34,26 l4,6 l3,-6 l4,6 l3,-6 M70,6 l4,6 l3,-6" fill="none" stroke="#5a3a1a" stroke-width="1.6"/>`);
    h.push(blob('M40,10 Q30,2 34,-6 Q42,0 46,8 Z', '#f0e6cc', { ink: '#5a4a2a', w: 1.2 }), blob('M88,8 Q96,-4 104,-2 Q98,6 94,12 Z', '#f0e6cc', { ink: '#5a4a2a', w: 1.2 }));
  }
  if (kind === 'ronin') {
    // casque vert sombre à grandes cornes recourbées
    h.push(blob('M28,36 C26,12 46,0 66,0 C88,0 104,12 102,36 Q66,24 28,36 Z', '#3e5c58', { ink: '#122220' }));
    h.push(`<path d="M30,34 Q66,22 100,34" fill="none" stroke="${GOLD_INK}" stroke-width="4.4" stroke-linecap="round"/><path d="M30,34 Q66,22 100,34" fill="none" stroke="${GOLD}" stroke-width="2.6" stroke-linecap="round"/>`);
    h.push(blob('M40,14 Q22,8 20,-10 Q30,0 46,6 Z', '#efe4c4', { ink: '#5a4a2a' }), blob('M88,12 Q108,6 110,-12 Q100,0 82,6 Z', '#efe4c4', { ink: '#5a4a2a' }));
  }

  // Furtif : le même Chafer, en fantôme turquoise translucide
  const ghostWrap = (s: string) => kind === 'furtif' ? `<g opacity="0.72"><g filter="url(#${pre}ghost)">${s}</g></g>` : s;
  const defs = kind === 'furtif'
    ? `<filter id="${pre}ghost"><feColorMatrix type="matrix" values="0.25 0.2 0.1 0 0.02  0.3 0.6 0.25 0 0.16  0.3 0.5 0.4 0 0.16  0 0 0 1 0"/></filter>` : '';
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

  // tête : visage gris visible sous un casque à cornes d'or, yeux verts, crocs
  const h = P.head;
  const hg = uid('hg');
  h.push(glowFilter(hg, 2));
  // visage large, mâchoire carrée
  h.push(blob('M36,40 C36,28 50,22 68,22 C86,22 100,28 100,42 C100,58 90,70 68,70 C46,70 36,58 36,40 Z', K_SKIN, { ink: K_SKIN_INK }));
  // orbites sombres et yeux verts lumineux
  h.push(`<path d="M42,44 Q50,38 60,42 Q58,50 50,51 Q43,50 42,44 Z M74,42 Q83,37 92,42 Q90,50 82,50 Q75,49 74,42 Z" fill="#26302a" opacity="0.75"/>`);
  h.push(`<ellipse cx="51" cy="45" rx="5.5" ry="3" fill="${K_GLOW}" filter="url(#${hg})"/><ellipse cx="83" cy="44.5" rx="5" ry="2.8" fill="${K_GLOW}" filter="url(#${hg})"/>`);
  h.push(`<ellipse cx="51" cy="45" rx="3" ry="1.6" fill="#f4ffe6"/><ellipse cx="83" cy="44.5" rx="2.6" ry="1.4" fill="#f4ffe6"/>`);
  h.push(`<path d="M40,38 L61,42 M73,41 L94,36" stroke="#1e2a22" stroke-width="2.6" stroke-linecap="round"/>`);
  // nez et bouche à crocs
  h.push(`<path d="M66,48 Q63,54 66,56 Q69,57 71,55" fill="none" stroke="${K_SKIN_INK}" stroke-width="1.2" stroke-linecap="round"/>`);
  h.push(`<path d="M52,61 Q68,66 84,60" fill="none" stroke="#1e2a22" stroke-width="2" stroke-linecap="round"/>`);
  h.push(`<path d="M56,61.6 l2,-5 l2,5.6 Z M76,61.6 l2,-5.4 l2,5 Z" fill="#f4ecd6" stroke="#3a3428" stroke-width="0.7"/>`);
  // casque (couvre le haut de la tête), bandeau d'or, cornes
  h.push(blob('M32,34 C30,12 48,2 68,2 C88,2 106,12 104,34 Q68,24 32,34 Z', '#6f6a62', { ink: '#26221c' }));
  h.push(`<path d="M68,4 L68,26" stroke="#26221c" stroke-width="1.2" opacity="0.45"/>`);
  h.push(`<path d="M33,33 Q68,23 103,33" fill="none" stroke="${GOLD_INK}" stroke-width="4.6" stroke-linecap="round"/><path d="M33,33 Q68,23 103,33" fill="none" stroke="${GOLD}" stroke-width="2.8" stroke-linecap="round"/>`);
  h.push(blob('M36,22 Q20,16 12,2 Q28,4 40,14 Z', GOLD, { ink: GOLD_INK }));
  h.push(blob('M100,20 Q114,12 120,-2 Q108,2 96,12 Z', GOLD, { ink: GOLD_INK }));
  h.push(`<ellipse cx="54" cy="12" rx="9" ry="3.6" fill="#fff" opacity="0.35" transform="rotate(-12 54 12)"/>`);

  // contour lumineux vert-jaune autour de tout le corps (comme dans Dofus)
  const og = uid('og');
  const defs = `<filter id="${og}" x="-20%" y="-20%" width="140%" height="140%">
    <feMorphology in="SourceAlpha" operator="dilate" radius="2.2" result="d"/>
    <feFlood flood-color="#d4ff5a" flood-opacity="0.85"/><feComposite in2="d" operator="in" result="c"/>
    <feGaussianBlur in="c" stdDeviation="1.6" result="g"/>
    <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  return assemble(P, part, (b2) => `<g filter="url(#${og})">${b2}</g>`, defs);

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

/* ======================================================================================== */
/* Vampires des Cryptes (même découpe que les Chafers)                                       */
/* ======================================================================================== */

/**
 * Vampire : grande capuche rouge pointue, longs cheveux blancs, visage blafard et fin, yeux rouges, crocs,
 * épaulière à pointes, longue cape noire doublée de rouge. Maître Vampire : massif, énorme bras blanc nu, gilet rouge, touches violettes.
 */
function vampireChibiSvg(kind: 'vampire' | 'maitreVampire', part?: ChaferPart): string {
  begin();
  const P = empty();
  const master = kind === 'maitreVampire';
  const SKIN = '#f4f0ee', SKIN_INK = '#5a4a56', CLOTH = '#24282a', RED = '#c0241e', LEG = master ? '#4a2a6a' : '#2e3a2c';
  const glow = uid('glow');
  // cape : extérieur noir, doublure rouge ; celle du Maître traîne au sol
  P.cape.push(master
    ? blob('M62,62 Q118,64 142,166 Q146,178 126,178 L44,178 Q30,176 40,168 Q58,150 58,70 Z', '#6a1210', { ink: '#240404' })
    : blob('M66,62 Q120,68 136,170 L118,164 L106,176 L92,166 L78,176 L62,170 Q62,120 64,70 Z', '#1e1a1c', { ink: '#050405' }));
  P.cape.push(blob(master ? 'M70,66 Q116,74 132,168 L90,172 Q96,120 70,74 Z' : 'M76,64 Q116,76 126,164 L110,158 Q104,110 78,72 Z', RED, { ink: '#4a0a08', rim: false }));
  // bras arrière
  P.armB.push(`<path d="M96,80 Q108,96 104,116" fill="none" stroke="#0a0c0a" stroke-width="${master ? 15 : 11}" stroke-linecap="round"/><path d="M96,80 Q108,96 104,116" fill="none" stroke="${CLOTH}" stroke-width="${master ? 12 : 8}" stroke-linecap="round"/>`);
  P.armB.push(blob('M98,114 Q106,110 110,118 L106,126 L100,122 Z', SKIN, { ink: SKIN_INK, rim: false }));
  // jambes et bottes pointues
  const leg = (arr: string[], hip: number, foot: number) => {
    arr.push(`<path d="M${hip},112 L${foot + 2},150" stroke="#0a0c0a" stroke-width="${master ? 15 : 13}" stroke-linecap="round"/><path d="M${hip},112 L${foot + 2},150" stroke="${LEG}" stroke-width="${master ? 12 : 10}" stroke-linecap="round"/>`);
    arr.push(blob(`M${foot - 8},144 L${foot + 10},144 L${foot + 12},172 Q${foot + 10},177 ${foot + 4},177 L${foot - 24},177 Q${foot - 28},173 ${foot - 18},169 L${foot - 10},164 Z`, '#2a1a32', { ink: '#0a060e' }));
    arr.push(`<path d="M${foot - 8},150 L${foot + 11},150" stroke="${RED}" stroke-width="2.4"/>`);
  };
  leg(P.legB, 94, 100);
  leg(P.legF, 80, 70);
  // basques de la tunique, ceinture
  P.pelvis.push(blob('M68,98 L104,98 L106,122 L96,116 L88,128 L80,116 L70,122 L66,116 Z', CLOTH, { ink: '#060806' }));
  P.pelvis.push(blob('M68,96 L104,96 L104,104 L68,104 Z', master ? '#5a2a7a' : '#3a2418', { ink: '#120a06', w: 1.2, rim: false }), `<rect x="83" y="95" width="7" height="10" rx="1.5" fill="${GOLD}" stroke="${GOLD_INK}" stroke-width="1"/>`);
  // torse
  P.chest.push(blob(master ? 'M58,66 Q88,52 112,66 L106,100 Q86,108 66,100 Q54,84 58,66 Z' : 'M66,68 Q88,58 106,70 L100,100 Q86,106 72,100 Q62,86 66,68 Z', CLOTH, { ink: '#060806' }));
  P.chest.push(master
    ? blob('M70,66 L102,66 L96,98 L76,98 Z', RED, { ink: '#4a0a08', w: 1.2 }) + `<path d="M86,68 L86,96 M78,74 L94,74 M78,84 L94,84" stroke="#4a0a08" stroke-width="1.2"/>`
    : blob('M76,68 L96,68 L86,94 Z', RED, { ink: '#4a0a08', w: 1.2, rim: false }));
  // épaulière à pointes argentées (épaule arrière)
  P.chest.push(blob('M92,64 L98,52 L102,62 L110,54 L110,68 Q102,74 92,72 Z', '#9a9ca6', { ink: '#26262e', w: 1.4 }));
  // bras avant
  if (master) {
    // énorme bras blanc nu, bracelet violet, griffes
    P.armF.push(blob('M80,64 Q58,56 46,76 Q40,94 54,100 Q72,98 80,82 Z', SKIN, { ink: SKIN_INK }));
    P.armF.push(blob('M56,82 Q32,76 20,94 Q20,114 40,114 Q58,110 62,94 Z', SKIN, { ink: SKIN_INK }));
    P.armF.push(`<path d="M60,72 Q66,80 62,88 M40,92 Q46,98 42,104" fill="none" stroke="#c8bcc4" stroke-width="2.4" stroke-linecap="round"/>`);
    P.armF.push(blob('M48,86 L58,84 L62,98 L52,102 Z', '#5a2a7a', { ink: '#1e0a2a', w: 1.3, rim: false }));
    P.armF.push(blob('M26,96 L12,90 L18,98 L8,102 L20,104 L14,112 L30,108 Z', SKIN, { ink: SKIN_INK, w: 1.3 }));
  } else {
    P.armF.push(`<path d="M74,76 Q60,88 46,92" fill="none" stroke="#0a0c0a" stroke-width="13" stroke-linecap="round"/><path d="M74,76 Q60,88 46,92" fill="none" stroke="${CLOTH}" stroke-width="10" stroke-linecap="round"/>`);
    P.armF.push(`<path d="M52,86 L44,96" stroke="${RED}" stroke-width="3"/>`);
    P.armF.push(blob('M46,86 Q36,84 32,92 Q34,102 44,100 Q50,96 46,86 Z', SKIN, { ink: SKIN_INK }));
    P.armF.push(`<path d="M34,90 L22,84 M33,94 L20,95 M35,98 L24,104" stroke="${SKIN_INK}" stroke-width="2.2" stroke-linecap="round"/>`);
  }
  // tête : capuche rouge haute et pointue, longs cheveux blancs, visage fin, oreille pointue, yeux rouges, crocs
  const h = P.head;
  h.push(glowFilter(glow, 1.6));
  h.push(blob('M50,68 Q38,30 62,10 Q76,-6 86,6 Q112,30 102,70 Q90,76 76,74 Q60,74 50,68 Z', RED, { ink: '#3e0806' }));
  h.push(`<path d="M52,70 Q48,34 66,16 M100,74 Q104,40 86,16" fill="none" stroke="#7a1210" stroke-width="2" opacity="0.7"/>`);
  h.push(blob('M70,12 Q96,10 100,40 Q102,64 96,84 L86,82 Q88,52 74,30 Z', '#e8e6ee', { ink: '#6a6874' }));
  h.push(`<path d="M84,30 Q92,52 90,78 M78,26 Q86,46 84,70" fill="none" stroke="#b8b6c4" stroke-width="1.4"/>`);
  h.push(blob('M40,36 C40,22 50,14 62,14 C76,14 84,24 84,38 C84,52 74,64 60,68 C48,64 40,50 40,36 Z', SKIN, { ink: SKIN_INK }));
  h.push(blob('M80,36 L100,20 L92,44 Z', SKIN, { ink: SKIN_INK, w: 1.3 }));
  h.push(blob('M36,32 C38,10 60,4 78,8 Q92,14 90,32 Q84,22 74,24 L68,32 L62,24 Q50,22 36,32 Z', '#f4f2f8', { ink: '#6a6874' }));
  h.push(`<path d="M44,38 L57,42 M66,40 L77,36" stroke="#1e1418" stroke-width="2.8" stroke-linecap="round"/>`);
  h.push(`<path d="M44,44 Q50,40 57,45 Q51,49 44,44 Z" fill="#1a0a0c"/><path d="M66,44 Q71,40 77,42 Q72,47 66,44 Z" fill="#1a0a0c"/>`);
  h.push(`<circle cx="51" cy="45" r="4.4" fill="#ff2222" filter="url(#${glow})" opacity="0.95"/><circle cx="51" cy="45" r="1.8" fill="#ffd0c0"/><circle cx="71.5" cy="43.5" r="1.5" fill="#ffd0c0"/>`);
  h.push(`<path d="M50,56 Q58,59 66,55" fill="none" stroke="#5a1a1e" stroke-width="2" stroke-linecap="round"/><path d="M53,56.6 L55,62 L57,57.4 M61,57.2 L63,62 L64.6,56.4" fill="#fff" stroke="#5a4a56" stroke-width="0.8"/>`);
  h.push(`<path d="M56,46 L54,52 L57,52" fill="none" stroke="#c8bcc4" stroke-width="1.2"/>`);
  return assemble(P, part);
}

/**
 * Bworks (Campement, Village, Donjon des Bworks), d'après les illustrations : grosses brutes voûtées, tête basse enfoncée entre d'énormes épaules,
 * bras épais bandés, jambes courtes et bottes de cuir. Bwork : casque à cornes, grande épaulière d'os à pointes, bloc de pierre ;
 * Mage : oreilles pointues, plume rouge et corne, livre rouge à la ceinture, bâton à tête enflammée ; Archer : touffe blonde, bandeau de fourrure,
 * crâne peint sur l'épaule, carquois, petit arc ; Bworkette (boss) : carré noir, plumes violettes, fleur orange, collier d'os, hachoir d'os sur l'épaule.
 */
function bworkChibiSvg(kind: 'bwork' | 'bworkMage' | 'bworkArcher' | 'bworkette', part?: ChaferPart): string {
  begin();
  const P = empty();
  const SKIN = kind === 'bworkette' ? '#8aa832' : '#7e9426', INK = '#222a08', BELLY = kind === 'bworkette' ? '#a6c040' : '#a2b432';
  const LEATHER = '#7a5030', DARK = '#4a2e16', LINK = '#26160a', BAND = '#e2d6b0';
  const bands = (x1: number, y1: number, x2: number, y2: number, n: number) =>
    Array.from({ length: n }, (_, i) => { const t = (i + 1) / (n + 1), x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t; return `<path d="M${x - 11},${y - 3} Q${x},${y + 4} ${x + 11},${y - 3}" fill="none" stroke="${BAND}" stroke-width="4.5" stroke-linecap="round"/><path d="M${x - 11},${y - 3} Q${x},${y + 4} ${x + 11},${y - 3}" fill="none" stroke="#6a5a3a" stroke-width="1" opacity="0.6"/>`; }).join('');
  // dos : carquois (Archer), hachoir d'os (Bworkette)
  if (kind === 'bworkArcher') {
    P.cape.push(blob('M96,34 L118,26 L128,92 L108,98 Z', LEATHER, { ink: LINK }));
    for (const [x, y] of [[100, 30], [108, 26], [116, 24]]) P.cape.push(`<path d="M${x},${y + 6} L${x - 12},${y - 12}" stroke="#5a3a1a" stroke-width="2.6"/>`, blob(`M${x - 12},${y - 12} l-10,-4 l12,0 l4,-6 Z`, '#ece2c4', { ink: '#5a4a2a', w: 1.1 }));
  }
  if (kind === 'bworkette') P.cape.push(`<path d="M104,64 L124,22" stroke="#6a4a24" stroke-width="7" stroke-linecap="round"/>`,
    blob('M112,30 Q124,4 144,10 Q150,30 136,46 Q124,48 112,30 Z', '#ece2c4', { ink: '#5a4a2a' }), `<circle cx="132" cy="24" r="5" fill="#3a2a1a"/>`);
  // bras arrière : énorme, bandé
  P.armB.push(blob('M98,48 Q128,50 130,80 Q132,104 120,114 Q108,116 104,102 Q104,80 92,66 Z', SKIN, { ink: INK, hl: [0.4, 0.2] }), bands(116, 66, 120, 110, 3));
  P.armB.push(blob('M106,104 Q122,100 128,112 Q126,124 112,124 Q102,120 106,104 Z', SKIN, { ink: INK }));
  // jambes courtes et grosses bottes
  const leg = (arr: string[], x: number) => {
    arr.push(blob(`M${x - 12},106 L${x + 12},106 L${x + 11},140 L${x - 11},140 Z`, SKIN, { ink: INK }));
    arr.push(bands(x, 112, x, 140, 1));
    arr.push(blob(`M${x - 20},136 Q${x},128 ${x + 15},136 L${x + 16},158 Q${x},166 ${x - 24},160 Q${x - 26},150 ${x - 20},136 Z`, LEATHER, { ink: LINK }));
    arr.push(`<path d="M${x - 20},146 Q${x - 2},140 ${x + 15},146" fill="none" stroke="${DARK}" stroke-width="2"/>`);
  };
  leg(P.legB, 100);
  leg(P.legF, 70);
  // pagne et grosse ceinture
  P.pelvis.push(blob('M50,92 L120,92 L122,120 L108,114 L98,126 L86,114 L74,126 L62,114 L48,120 Z', kind === 'bworkMage' ? '#7a1a1a' : LEATHER, { ink: LINK }));
  P.pelvis.push(blob('M48,88 L122,88 L122,100 L48,100 Z', DARK, { ink: LINK, w: 1.3, rim: false }), blob('M78,86 L92,86 L92,102 L78,102 Z', '#c8a040', { ink: '#5a4008', w: 1.2 }));
  if (kind === 'bworkMage') P.pelvis.push(blob('M100,94 L118,90 L122,116 L104,120 Z', '#a8201a', { ink: '#3a0806' }), `<path d="M104,98 L118,95" stroke="#e8d0a0" stroke-width="2"/>`);
  // torse massif, ventre clair
  P.chest.push(blob('M42,64 Q52,34 88,32 Q124,34 128,66 Q130,92 112,104 Q86,112 58,104 Q38,90 42,64 Z', SKIN, { ink: INK, hl: [0.3, 0.2] }));
  P.chest.push(blob('M60,70 Q84,62 108,70 Q112,92 98,102 Q82,106 66,100 Q56,88 60,70 Z', BELLY, { ink: shade(BELLY, -0.45), w: 1.2, rim: false }));
  if (kind === 'bworkette') P.chest.push(`<path d="M54,52 Q84,78 118,52" fill="none" stroke="#5a3a1a" stroke-width="2.4"/>` + [60, 70, 80, 90, 100, 110].map((x, i) => blob(`M${x},${56 + (i < 3 ? i * 4 : (5 - i) * 4)} l4,10 l4,-10 Z`, '#f2ead6', { ink: '#5a4a2a', w: 1, rim: false })).join('') + blob(ellipse(84, 72, 7, 7), '#c8c8d0', { ink: '#3a3a44', w: 1.2 }));
  else P.chest.push(`<path d="M50,52 L116,98" stroke="${LEATHER}" stroke-width="9"/><path d="M50,52 L116,98" stroke="${DARK}" stroke-width="2" stroke-dasharray="4 6"/>`);
  // épaulière (épaule arrière)
  if (kind === 'bwork') P.chest.push(blob('M88,30 Q118,18 136,40 Q142,62 124,70 Q100,68 88,50 Z', '#d6caa4', { ink: '#4a3a1e' }),
    blob('M104,28 L106,4 L116,26 Z M124,34 L144,20 L132,44 Z M134,52 L154,52 L136,62 Z', '#f2ead6', { ink: '#4a3a1e', w: 1.3 }),
    `<path d="M94,46 Q114,42 132,58" fill="none" stroke="#9a8a62" stroke-width="2"/>`);
  if (kind === 'bworkArcher') P.chest.push(blob(ellipse(112, 52, 14, 13), '#f2ead6', { ink: '#4a3a1e', w: 1.3, rim: false }), `<circle cx="107" cy="50" r="3.4" fill="${SKIN}"/><circle cx="117" cy="50" r="3.4" fill="${SKIN}"/><path d="M108,58 L116,58" stroke="${SKIN}" stroke-width="2"/>`);
  if (kind === 'bworkMage') P.chest.push(blob('M96,40 Q116,36 124,52 Q116,60 100,56 Z', '#a8201a', { ink: '#3a0806' }));
  // bras avant, poing et arme
  const fist = (x: number, y: number) => blob(ellipse(x, y, 12, 11), SKIN, { ink: INK });
  P.armF.push(blob('M76,52 Q50,50 40,72 Q34,92 46,100 Q62,96 70,80 Z', SKIN, { ink: INK, hl: [0.35, 0.2] }), bands(52, 66, 44, 96, 2));
  if (kind === 'bwork') P.armF.push(`<path d="M44,98 L34,116" stroke="${DARK}" stroke-width="7" stroke-linecap="round"/>`,
    blob('M8,104 L44,96 L52,128 Q34,142 12,136 Z', '#6a6c62', { ink: '#22231e' }), `<path d="M12,134 Q30,138 50,126" fill="none" stroke="#9a9c90" stroke-width="2.4"/><path d="M16,108 L42,102" stroke="#4a4c44" stroke-width="2"/>`, fist(44, 96));
  else if (kind === 'bworkMage') P.armF.push(`<path d="M34,160 L48,30" stroke="#3a1a08" stroke-width="9" stroke-linecap="round"/><path d="M34,160 L48,30" stroke="#b0602a" stroke-width="5" stroke-linecap="round"/>`,
    blob('M48,34 Q36,22 42,10 Q48,20 52,14 Q54,22 60,18 Q62,30 48,34 Z', '#ff8a1a', { ink: '#8a2a06', w: 1.3 }), blob('M48,32 Q44,24 48,18 Q50,24 54,22 Q54,30 48,32 Z', '#ffe070', { ink: '#c86a10', w: 1, rim: false }),
    `<path d="M40,72 L46,84" stroke="#e8e0c8" stroke-width="3"/>`, fist(44, 90));
  else if (kind === 'bworkArcher') P.armF.push(`<path d="M30,54 Q8,100 32,140" fill="none" stroke="#2a1606" stroke-width="7" stroke-linecap="round"/><path d="M30,54 Q8,100 32,140" fill="none" stroke="#8a5a2a" stroke-width="4" stroke-linecap="round"/>`,
    `<path d="M30,54 L32,140" stroke="#ece2c4" stroke-width="1.2"/>`, fist(22, 96));
  else P.armF.push(fist(64, 66));
  // tête : basse, mâchoire large, défenses, sourcil épais, petits yeux
  const h = P.head;
  if (kind === 'bworkette') h.push(blob('M34,46 Q30,14 62,10 Q92,8 96,40 Q96,58 90,68 Q86,48 76,40 Q58,42 44,52 Q40,58 34,46 Z', '#1e1424', { ink: '#08040a' }),
    blob('M70,14 Q76,2 90,-2 Q86,8 96,4 Q92,12 102,12 Q90,18 76,18 Z', '#5a2a7a', { ink: '#1e0a2a', w: 1.3 }));
  h.push(blob('M38,58 C36,36 50,26 66,26 C84,26 96,38 94,58 C94,74 82,84 66,84 C50,84 38,74 38,58 Z', SKIN, { ink: INK }));
  if (kind === 'bworkMage') h.push(blob('M88,46 L112,32 L98,58 Z', SKIN, { ink: INK, w: 1.3 }), blob('M36,48 L18,38 L34,60 Z', SKIN, { ink: INK, w: 1.3 }));
  h.push(`<path d="M40,50 Q52,42 66,48 M72,48 Q82,42 90,48" fill="none" stroke="${shade(SKIN, -0.55)}" stroke-width="5" stroke-linecap="round"/>`);
  h.push(`<ellipse cx="52" cy="55" rx="4.4" ry="3.6" fill="#fff6c8"/><ellipse cx="80" cy="55" rx="3.8" ry="3.2" fill="#fff6c8"/><circle cx="51" cy="55.5" r="2.4" fill="#1a1a0a"/><circle cx="79" cy="55.5" r="2.1" fill="#1a1a0a"/>`);
  h.push(blob('M42,66 Q66,62 90,66 Q90,80 66,84 Q44,82 42,66 Z', shade(SKIN, -0.1), { ink: INK, w: 1.4 }));
  h.push(blob('M48,70 l-2,-14 l8,12 Z', '#f6f0de', { ink: '#5a4a2a', w: 1.1 }), blob('M82,70 l3,-14 l5,13 Z', '#f6f0de', { ink: '#5a4a2a', w: 1.1 }));
  if (kind === 'bwork') h.push(blob('M36,46 Q42,20 66,18 Q92,18 98,44 Q68,34 36,46 Z', '#6a4426', { ink: LINK }), `<path d="M38,44 Q66,32 96,42" fill="none" stroke="${BAND}" stroke-width="5"/>`,
    blob('M44,30 Q26,22 24,4 Q36,14 50,22 Z', '#f2ead6', { ink: '#4a3a1e', w: 1.3 }), blob('M86,26 Q100,16 102,4 Q108,18 94,34 Z', '#f2ead6', { ink: '#4a3a1e', w: 1.3 }));
  if (kind === 'bworkMage') h.push(blob('M64,26 Q70,12 80,4 Q78,14 72,28 Z', '#f2ead6', { ink: '#4a3a1e', w: 1.2 }), blob('M74,10 L58,2 L66,12 L50,10 L70,18 Z', '#d8301e', { ink: '#5a0a06', w: 1.2 }));
  if (kind === 'bworkArcher') h.push(blob('M36,46 Q44,24 66,24 Q90,24 98,44 Q68,36 36,46 Z', '#8a6038', { ink: LINK }), `<path d="M38,42 Q66,30 96,40" fill="none" stroke="${BAND}" stroke-width="6"/>`,
    blob('M56,28 Q52,12 62,2 Q66,12 72,6 Q74,16 80,12 Q80,24 72,30 Z', '#f0e2b4', { ink: '#8a7a4a', w: 1.2 }));
  if (kind === 'bworkette') h.push(blob(ellipse(40, 40, 8, 8), '#ff7a1a', { ink: '#8a3a0a', w: 1.2 }), `<circle cx="40" cy="40" r="3" fill="#ffd84a"/>`, `<path d="M58,76 Q66,80 74,76" fill="none" stroke="#c8303a" stroke-width="2.4" stroke-linecap="round"/>`);
  return assemble(P, part);
}
