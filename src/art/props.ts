import { ellipse, ink, line, shape, svg, vgrad } from './kit';

/** Objets de décor posés au sol. Chaque SVG a son point d'ancrage au sol (pied de l'objet). */
export interface PropArt {
  svg: string;
  foot: [number, number];
}

const STONE = '#a49a86';

/** Pilier de pierre, chapiteau sculpté, base carrée. */
export function pillar(): PropArt {
  const defs = vgrad('pil', '#b9af9a', '#7a705f') + vgrad('pilD', '#8f8572', '#5b5345');
  const b = [
    // base
    shape('M14,236 L50,254 L86,236 L86,222 L50,240 L14,222 Z', 'url(#pilD)', ink(STONE)),
    shape('M14,222 L50,204 L86,222 L50,240 Z', 'url(#pil)', ink(STONE)),
    // fût
    shape('M26,222 L26,48 Q50,40 74,48 L74,222 Q50,232 26,222 Z', 'url(#pil)', ink(STONE)),
    `<path d="M58,50 L58,226" stroke="#6e6554" stroke-width="12" opacity="0.35"/>`,
    line('M36,58 L36,214', '#fff', 3, 0.22),
    line('M44,120 l6,10 l-4,8 l6,12', ink(STONE, -0.3), 1.6, 0.8),
    // chapiteau
    shape('M14,48 L50,30 L86,48 L86,58 L50,76 L14,58 Z', 'url(#pilD)', ink(STONE)),
    shape('M14,48 L50,30 L86,48 L50,66 Z', 'url(#pil)', ink(STONE)),
    `<path d="M14,48 L50,66 L86,48" fill="none" stroke="#fff" stroke-opacity="0.2" stroke-width="2"/>`,
    // lierre / mousse
    `<path d="M28,200 q8,-14 4,-30 q10,8 8,26 Z" fill="#5d7a3a" opacity="0.8"/>`,
  ].join('');
  return { svg: svg(100, 260, defs, b), foot: [50, 240] };
}

/** Sarcophage de pierre au couvercle sculpté. Orienté le long de l'axe x isométrique. */
export function sarcophagus(): PropArt {
  const defs = vgrad('sar', '#b3a891', '#7c725f') + vgrad('sarD', '#867c69', '#544c3f');
  const b = [
    // flanc gauche (face avant) et flanc droit
    shape('M10,78 L92,119 L92,141 L10,100 Z', 'url(#sarD)', ink(STONE)),
    shape('M92,119 L134,98 L134,120 L92,141 Z', '#6a6152', ink(STONE)),
    // couvercle
    shape('M10,78 L52,57 L134,98 L92,119 Z', 'url(#sar)', ink(STONE)),
    shape('M24,79 L52,65 L120,99 L92,113 Z', '#c2b8a0', ink(STONE, -0.4), 2),
    // gisant stylisé : crâne et mains croisées
    ellipse(48, 76, 9, 6, '#ece3cc', '#6e5f44', 2),
    `<ellipse cx="45" cy="76" rx="2" ry="1.6" fill="#3a2a2a"/><ellipse cx="51" cy="77" rx="2" ry="1.6" fill="#3a2a2a"/>`,
    line('M70,90 L84,86 M72,84 L82,94', '#6e5f44', 2.5),
    // fissures, mousse
    line('M30,92 l8,6 l-2,6', ink(STONE, -0.3), 1.6, 0.8),
    `<ellipse cx="112" cy="124" rx="14" ry="5" fill="#5d7a3a" opacity="0.6"/>`,
  ].join('');
  return { svg: svg(144, 150, defs, b), foot: [72, 124] };
}

/** Tas d'ossements. */
export function bones(): PropArt {
  const B = '#ece3cc', O = '#7a6648';
  const bone = (x1: number, y1: number, x2: number, y2: number) =>
    `<path d="M${x1},${y1} L${x2},${y2}" stroke="${O}" stroke-width="8" stroke-linecap="round"/>
     <path d="M${x1},${y1} L${x2},${y2}" stroke="${B}" stroke-width="4.5" stroke-linecap="round"/>
     <circle cx="${x1}" cy="${y1}" r="4" fill="${B}" stroke="${O}" stroke-width="1.6"/><circle cx="${x2}" cy="${y2}" r="4" fill="${B}" stroke="${O}" stroke-width="1.6"/>`;
  const b = [
    bone(14, 44, 46, 36),
    bone(30, 50, 58, 42),
    bone(40, 30, 70, 46),
    ellipse(30, 32, 11, 10, B, O, 2.5),
    `<ellipse cx="26" cy="32" rx="3" ry="3.4" fill="#2a2024"/><ellipse cx="34" cy="32" rx="3" ry="3.4" fill="#2a2024"/>`,
    `<rect x="24" y="38" width="12" height="5" rx="1.5" fill="${B}" stroke="${O}" stroke-width="1.5"/>`,
  ].join('');
  return { svg: svg(80, 58, '', b), foot: [40, 46] };
}

/** Bougies fondues (la flamme est animée à part). */
export function candles(): PropArt {
  const W = '#efe3c0', O = '#8a7a50';
  const c = (x: number, h: number) =>
    `<path d="M${x - 5},40 L${x - 5},${40 - h} Q${x},${36 - h} ${x + 5},${40 - h} L${x + 5},40 Z" fill="${W}" stroke="${O}" stroke-width="1.6"/>
     <path d="M${x - 5},${44 - h} q2,6 0,12" stroke="${W}" stroke-width="3" stroke-linecap="round"/>
     <path d="M${x},${38 - h} l0,-4" stroke="#3a2a1a" stroke-width="1.5"/>`;
  const b = [
    `<ellipse cx="28" cy="40" rx="24" ry="8" fill="${W}" stroke="${O}" stroke-width="1.6"/>`,
    c(16, 18),
    c(30, 28),
    c(42, 12),
  ].join('');
  return { svg: svg(56, 50, '', b), foot: [28, 40] };
}

/** Points d'accroche des flammes des bougies, relatifs au pied. */
export const CANDLE_FLAMES: [number, number][] = [
  [16 - 28, 40 - 18 - 8 - 40],
  [30 - 28, 40 - 28 - 8 - 40],
  [42 - 28, 40 - 12 - 8 - 40],
];

/** Gravats : pierres tombées. */
export function rubble(): PropArt {
  const b = [
    shape('M6,30 L18,20 L32,24 L34,34 L18,38 Z', '#8f8572', ink(STONE)),
    shape('M30,36 L40,28 L52,32 L50,40 L38,42 Z', '#a49a86', ink(STONE)),
    shape('M20,40 L26,36 L32,40 L26,44 Z', '#7a705f', ink(STONE), 2),
  ].join('');
  return { svg: svg(58, 48, '', b), foot: [28, 38] };
}

/** Os de Chafer (ressource lâchée au sol), petit objet brillant. */
export function lootBone(): PropArt {
  const B = '#f4ecd6', O = '#7a6648';
  const b = `<path d="M8,26 L34,12" stroke="${O}" stroke-width="9" stroke-linecap="round"/>
    <path d="M8,26 L34,12" stroke="${B}" stroke-width="5.5" stroke-linecap="round"/>
    <circle cx="6" cy="23" r="4.5" fill="${B}" stroke="${O}" stroke-width="1.8"/><circle cx="10" cy="30" r="4.5" fill="${B}" stroke="${O}" stroke-width="1.8"/>
    <circle cx="32" cy="8" r="4.5" fill="${B}" stroke="${O}" stroke-width="1.8"/><circle cx="37" cy="15" r="4.5" fill="${B}" stroke="${O}" stroke-width="1.8"/>`;
  return { svg: svg(44, 36, '', b), foot: [22, 30] };
}
