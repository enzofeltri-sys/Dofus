import { ellipse, line, shape, svg, vgrad } from './kit';
import { shade } from '../svg';

/**
 * Objets de décor en vue 3/4 (face du dessus + face avant → volume),
 * tons grès et crème des cartes de la crypte. Chaque SVG a son point d'ancrage au sol.
 */
export interface PropArt {
  svg: string;
  foot: [number, number];
}

const CREAM_INK = '#6e5a36';
const FLAME = '#e0782c';

/** Colonne libre : base cubique, fût rouge peint de flammes, chapiteau-crâne. */
export function column(): PropArt {
  const defs =
    `<linearGradient id="colShaft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4e160c"/><stop offset="0.16" stop-color="#a8442c"/><stop offset="0.3" stop-color="#d0684a"/><stop offset="0.42" stop-color="#a03c26"/><stop offset="0.75" stop-color="#6a2214"/><stop offset="1" stop-color="#3a0c06"/></linearGradient>` +
    vgrad('colTop', '#fbf0d0', '#e0cc9a') + vgrad('colFront', '#d8c492', '#a8925e') +
    `<radialGradient id="socket" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="#2a1a0c"/><stop offset="1" stop-color="#6a5430"/></radialGradient>`;
  const b = [
    // base : dessus + face avant
    shape('M8,214 L92,214 L92,240 L8,240 Z', 'url(#colFront)', CREAM_INK),
    shape('M8,214 L20,198 L80,198 L92,214 Z', 'url(#colTop)', CREAM_INK),
    // fût
    shape('M26,206 L26,66 L74,66 L74,206 Q50,214 26,206 Z', 'url(#colShaft)', '#3a120a'),
    `<path d="M40,196 q-12,-30 4,-64 q-2,30 12,36 q4,-22 -2,-42 q18,28 4,70 Z" fill="${FLAME}" opacity="0.9"/>`,
    `<path d="M46,188 q-5,-16 3,-34 q0,16 7,22 Z" fill="#ffc06a"/>`,
    line('M32,74 L32,198', '#fff', 3, 0.18),
    // chapiteau sculpté d'un crâne en relief + tablette en volume
    shape('M14,66 L18,34 L82,34 L86,66 Z', 'url(#colFront)', CREAM_INK),
    shape('M34,50 C34,38 66,38 66,50 C66,56 61,59 59,64 L41,64 C39,59 34,56 34,50 Z', '#efe2bc', CREAM_INK, 1.6),
    `<ellipse cx="43" cy="50" rx="5" ry="4.6" fill="url(#socket)"/><ellipse cx="57" cy="50" rx="5" ry="4.6" fill="url(#socket)"/>`,
    `<path d="M48,58 l2,-4.5 l2,4.5 Z" fill="#4a3618"/>`,
    line('M42,64 L42,60 M47,64 L47,60 M52,64 L52,60 M57,64 L57,60', CREAM_INK, 1.3),
    `<ellipse cx="42" cy="41" rx="5" ry="2" fill="#fff" opacity="0.55"/>`,
    shape('M8,34 L92,34 L92,26 L8,26 Z', '#c9b484', CREAM_INK),
    shape('M8,26 L92,26 L84,12 L16,12 Z', 'url(#colTop)', CREAM_INK),
    `<rect x="70" y="36" width="14" height="28" fill="#000" opacity="0.12"/>`,
  ].join('');
  return { svg: svg(100, 246, defs, b), foot: [50, 232] };
}

/** Sarcophage en grès : couvercle sculpté (dessus) + flanc avant orné. */
export function sarcophagus(): PropArt {
  const defs = vgrad('sTop', '#f6e8bc', '#d8c28c') + vgrad('sFront', '#cdb683', '#9c8452');
  const b = [
    // flanc avant
    shape('M10,70 L190,70 L186,128 L14,128 Z', 'url(#sFront)', CREAM_INK),
    shape('M30,84 L170,84 L168,116 L32,116 Z', shade('#cdb683', -0.08), CREAM_INK, 2),
    ellipse(100, 100, 12, 10, '#efe4c4', CREAM_INK, 2),
    `<ellipse cx="96" cy="99" rx="2.6" ry="3" fill="#3a2a22"/><ellipse cx="104" cy="99" rx="2.6" ry="3" fill="#3a2a22"/>`,
    line('M58,92 L80,108 M58,108 L80,92 M120,92 L142,108 M120,108 L142,92', CREAM_INK, 3),
    // couvercle (dessus), bombé
    shape('M6,70 L22,18 L178,18 L194,70 Z', 'url(#sTop)', CREAM_INK),
    shape('M34,60 L44,28 L156,28 L166,60 Z', '#f2e2b4', CREAM_INK, 2),
    // gisant : crâne + bras croisés
    ellipse(60, 44, 13, 11, '#efe4c4', CREAM_INK, 2),
    `<ellipse cx="56" cy="43" rx="3" ry="3.4" fill="#3a2a22"/><ellipse cx="64" cy="43" rx="3" ry="3.4" fill="#3a2a22"/>`,
    line('M92,36 L118,54 M92,54 L118,36', CREAM_INK, 4),
    line('M128,44 L150,44', CREAM_INK, 4),
    line('M24,24 L176,24', '#fff8dc', 2, 0.8),
    `<rect x="160" y="72" width="26" height="54" fill="#000" opacity="0.1"/>`,
    `<ellipse cx="172" cy="128" rx="18" ry="5" fill="#5d7a3a" opacity="0.5"/>`,
  ].join('');
  return { svg: svg(200, 136, defs, b), foot: [100, 128] };
}

/** Brasero de pierre (le feu est animé à part, au point FIRE). */
export function brazier(): PropArt {
  const defs = vgrad('bTop', '#fbf0d0', '#e0cc9a') + vgrad('bFront', '#d8c492', '#a8925e');
  const b = [
    shape('M8,44 L80,44 L80,96 L8,96 Z', 'url(#bFront)', CREAM_INK),
    shape('M8,44 L18,26 L70,26 L80,44 Z', 'url(#bTop)', CREAM_INK),
    ellipse(44, 34, 24, 8, '#3a2014', '#22120a', 2.5),
    ellipse(44, 33, 18, 5, '#ffb040', '#c06010', 1.5),
    line('M20,60 L68,60 M20,78 L68,78', CREAM_INK, 2, 0.6),
    `<rect x="62" y="46" width="16" height="48" fill="#000" opacity="0.12"/>`,
  ].join('');
  return { svg: svg(88, 104, defs, b), foot: [44, 96] };
}
export const BRAZIER_FIRE: [number, number] = [0, -64];

/** Tas d'ossements. */
export function bones(): PropArt {
  const B = '#efe4c4', O = '#7a6648';
  const bone = (x1: number, y1: number, x2: number, y2: number) =>
    `<path d="M${x1},${y1} L${x2},${y2}" stroke="${O}" stroke-width="8" stroke-linecap="round"/>
     <path d="M${x1},${y1} L${x2},${y2}" stroke="${B}" stroke-width="4.5" stroke-linecap="round"/>
     <circle cx="${x1}" cy="${y1}" r="4" fill="${B}" stroke="${O}" stroke-width="1.6"/><circle cx="${x2}" cy="${y2}" r="4" fill="${B}" stroke="${O}" stroke-width="1.6"/>`;
  const b = [
    `<ellipse cx="40" cy="46" rx="34" ry="8" fill="#000" opacity="0.18"/>`,
    bone(14, 44, 46, 36),
    bone(30, 50, 58, 42),
    bone(40, 30, 70, 46),
    ellipse(30, 32, 11, 10, B, O, 2.5),
    `<ellipse cx="26" cy="32" rx="3" ry="3.4" fill="#2a2024"/><ellipse cx="34" cy="32" rx="3" ry="3.4" fill="#2a2024"/>`,
    `<rect x="24" y="38" width="12" height="5" rx="1.5" fill="${B}" stroke="${O}" stroke-width="1.5"/>`,
  ].join('');
  return { svg: svg(80, 58, '', b), foot: [40, 46] };
}

/** Coupe sombre remplie d'os (vue sur les cartes). */
export function boneBowl(): PropArt {
  const B = '#efe4c4', O = '#7a6648';
  const b = [
    shape('M8,30 Q10,62 44,64 Q78,62 80,30 Z', '#3a3430', '#1e1a16'),
    ellipse(44, 30, 36, 12, '#2a2420', '#1e1a16', 3),
    `<path d="M24,32 L60,24" stroke="${O}" stroke-width="8" stroke-linecap="round"/><path d="M24,32 L60,24" stroke="${B}" stroke-width="4.5" stroke-linecap="round"/>`,
    ellipse(52, 30, 9, 8, B, O, 2),
    `<ellipse cx="49" cy="30" rx="2.4" ry="2.8" fill="#2a2024"/><ellipse cx="55" cy="30" rx="2.4" ry="2.8" fill="#2a2024"/>`,
    line('M16,46 Q44,56 72,46', '#5a5048', 2, 0.7),
  ].join('');
  return { svg: svg(88, 70, '', b), foot: [44, 62] };
}

/** Bougies fondues (flammes animées à part). */
export function candles(): PropArt {
  const W = '#efe3c0', O = '#8a7a50';
  const c = (x: number, h: number) =>
    `<path d="M${x - 5},40 L${x - 5},${40 - h} Q${x},${36 - h} ${x + 5},${40 - h} L${x + 5},40 Z" fill="${W}" stroke="${O}" stroke-width="1.6"/>
     <path d="M${x - 5},${44 - h} q2,6 0,12" stroke="${W}" stroke-width="2.2" stroke-linecap="round"/>
     <path d="M${x},${38 - h} l0,-4" stroke="#3a2a1a" stroke-width="1.5"/>`;
  const b = [`<ellipse cx="28" cy="40" rx="24" ry="8" fill="${W}" stroke="${O}" stroke-width="1.6"/>`, c(16, 18), c(30, 28), c(42, 12)].join('');
  return { svg: svg(56, 50, '', b), foot: [28, 40] };
}

/** Points d'accroche des flammes des bougies, relatifs au pied. */
export const CANDLE_FLAMES: [number, number][] = [
  [16 - 28, 40 - 18 - 8 - 40],
  [30 - 28, 40 - 28 - 8 - 40],
  [42 - 28, 40 - 12 - 8 - 40],
];

/** Blocs de pierre écroulés (volume). */
export function rubble(): PropArt {
  const defs = vgrad('rTop', '#fbf0d0', '#e0cc9a') + vgrad('rFront', '#d0bc88', '#a08a58');
  const blk = (x: number, y: number, w: number, h: number, d: number) =>
    shape(`M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h} Z`, 'url(#rFront)', CREAM_INK, 2.5) +
    shape(`M${x},${y} L${x + d * 0.4},${y - d} L${x + w - d * 0.2},${y - d} L${x + w},${y} Z`, 'url(#rTop)', CREAM_INK, 2.5);
  const b = [blk(6, 40, 46, 22, 14), blk(44, 50, 34, 18, 10), blk(24, 20, 30, 18, 10)].join('');
  return { svg: svg(84, 74, defs, b), foot: [42, 66] };
}

/** Os de Chafer (ressource lâchée au sol). */
export function lootBone(): PropArt {
  const B = '#f4ecd6', O = '#7a6648';
  const b = `<path d="M8,26 L34,12" stroke="${O}" stroke-width="9" stroke-linecap="round"/>
    <path d="M8,26 L34,12" stroke="${B}" stroke-width="5.5" stroke-linecap="round"/>
    <circle cx="6" cy="23" r="4.5" fill="${B}" stroke="${O}" stroke-width="1.8"/><circle cx="10" cy="30" r="4.5" fill="${B}" stroke="${O}" stroke-width="1.8"/>
    <circle cx="32" cy="8" r="4.5" fill="${B}" stroke="${O}" stroke-width="1.8"/><circle cx="37" cy="15" r="4.5" fill="${B}" stroke="${O}" stroke-width="1.8"/>`;
  return { svg: svg(44, 36, '', b), foot: [22, 30] };
}

