import { svg } from './kit';
import type { PropArt } from './props';

/**
 * Décor des Champs d'Incarnam, d'après les cartes de Dofus 3 :
 * arbres au tronc sombre et tordu couverts de fleurs blanches et bleu pâle, blocs de grès gravés de symboles,
 * stèles gravées, touffes d'herbe dorée et fleurs jaunes. Arbre, bloc et stèle bloquent le passage.
 */

const STONE_INK = '#7a6440';
const lg = (id: string, a: string, b: string) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

/** Fleur à 5 pétales (blanche ou bleu pâle). */
const blossom5 = (x: number, y: number, r: number, col: string, ink: string) =>
  `<g transform="translate(${x},${y})">${[0, 1, 2, 3, 4].map((k) => {
    const a = k * 1.2566 - 1.57;
    return `<ellipse cx="${(Math.cos(a) * r * 0.62).toFixed(1)}" cy="${(Math.sin(a) * r * 0.62).toFixed(1)}" rx="${(r * 0.52).toFixed(1)}" ry="${(r * 0.4).toFixed(1)}" transform="rotate(${(a * 57.3 + 90).toFixed(0)},${(Math.cos(a) * r * 0.62).toFixed(1)},${(Math.sin(a) * r * 0.62).toFixed(1)})" fill="${col}" stroke="${ink}" stroke-width="0.9"/>`;
  }).join('')}<circle r="${(r * 0.22).toFixed(1)}" fill="#f2d24a"/></g>`;

export function blossomTree(): PropArt {
  const defs = lg('trunkG', '#5a4a52', '#2a2230');
  // tronc tordu (S), branches qui s'enroulent
  const trunk = `<path d="M64,150 Q50,128 62,108 Q76,88 58,70 Q46,58 54,40" fill="none" stroke="#1a141e" stroke-width="15" stroke-linecap="round"/>
    <path d="M64,150 Q50,128 62,108 Q76,88 58,70 Q46,58 54,40" fill="none" stroke="url(#trunkG)" stroke-width="10" stroke-linecap="round"/>
    <path d="M60,96 Q84,84 92,62 M58,72 Q34,66 26,50 M56,52 Q70,34 86,32" fill="none" stroke="#1a141e" stroke-width="7" stroke-linecap="round"/>
    <path d="M60,96 Q84,84 92,62 M58,72 Q34,66 26,50 M56,52 Q70,34 86,32" fill="none" stroke="#4a3e46" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M64,150 Q56,154 46,152 M64,150 Q74,156 84,152" stroke="#2a2230" stroke-width="6" stroke-linecap="round"/>`;
  const W = '#fbfbf6', B = '#bfe2f2', INK = '#8ea6b4';
  const clusters: [number, number, number][] = [[54, 30, 1.25], [86, 30, 1.15], [26, 46, 1.15], [96, 58, 1.05], [38, 64, 1], [70, 48, 1.2], [60, 14, 1]];
  let flowers = '';
  let k = 0;
  for (const [cx, cy, s] of clusters) {
    for (let i = 0; i < 14; i++) {
      const a = i * 2.4 + k, d = (i % 4) * 6.5 * s;
      flowers += blossom5(+(cx + Math.cos(a) * d).toFixed(1), +(cy + Math.sin(a) * d * 0.8).toFixed(1), 6.2 * s, (i + k) % 3 === 0 ? B : W, INK);
    }
    k++;
  }
  const b = `<ellipse cx="64" cy="150" rx="46" ry="11" fill="#6a4a10" opacity="0.28"/>${trunk}${flowers}`;
  return { svg: svg(124, 162, defs, b), foot: [64, 150] };
}

export function carvedStone(): PropArt {
  const defs = lg('csG', '#fbf0cc', '#c8b07a') + lg('csSide', '#d6c08a', '#a8925e');
  const b = `<ellipse cx="50" cy="74" rx="46" ry="10" fill="#6a4a10" opacity="0.28"/>
    <path d="M8,64 L10,30 Q12,20 24,18 L76,16 Q88,16 90,28 L92,62 Q92,72 80,74 L20,76 Q8,76 8,64 Z" fill="url(#csSide)" stroke="${STONE_INK}" stroke-width="2.8" stroke-linejoin="round"/>
    <path d="M10,30 Q12,20 24,18 L76,16 Q88,16 90,28 Q88,38 76,38 L24,40 Q12,40 10,30 Z" fill="url(#csG)" stroke="${STONE_INK}" stroke-width="2.6"/>
    <circle cx="30" cy="56" r="9" fill="none" stroke="#8a6a3a" stroke-width="2.6"/><path d="M30,47 v18 M24,52 h12" stroke="#8a6a3a" stroke-width="2"/>
    <path d="M48,50 h28 M48,58 h20 M48,66 h26" stroke="#8a6a3a" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M26,24 Q50,20 72,22" fill="none" stroke="#fffaf0" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`;
  return { svg: svg(100, 86, defs, b), foot: [50, 74] };
}

export function stele(): PropArt {
  const defs = lg('stG', '#fbf0cc', '#c4ac74');
  const b = `<ellipse cx="34" cy="122" rx="30" ry="8" fill="#6a4a10" opacity="0.28"/>
    <path d="M12,120 L10,30 Q10,10 34,8 Q58,10 58,30 L56,120 Q34,126 12,120 Z" fill="url(#stG)" stroke="${STONE_INK}" stroke-width="2.8" stroke-linejoin="round"/>
    <path d="M22,30 h24 v12 h-16 v10 h16 M22,66 q0,-10 12,-10 q10,0 10,8 q0,7 -7,7 q-6,0 -6,-5 M22,88 h24 M28,96 h12 v12 h-12 Z" fill="none" stroke="#8a6a3a" stroke-width="2.6"/>
    <path d="M18,22 Q30,14 44,16" fill="none" stroke="#fffaf0" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
    <path d="M8,118 Q20,108 30,118 Q38,110 48,118 Q56,110 62,120" fill="#e8b93a" stroke="#a8761e" stroke-width="1.6"/>`;
  return { svg: svg(68, 132, defs, b), foot: [34, 122] };
}

export function goldenFlowers(): PropArt {
  const tuft = (x: number, y: number, h: number) =>
    `<path d="M${x - 6},${y} q1,${-h * 0.6} -3,${-h} M${x},${y} q1,${-h * 0.8} 3,${-h * 1.2} M${x + 6},${y} q-1,${-h * 0.5} 4,${-h * 0.9}" fill="none" stroke="#a8761e" stroke-width="2.6" stroke-linecap="round"/>`;
  const f = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#ffe23a" stroke="#a8761e" stroke-width="1"/>`;
  const b = `<ellipse cx="34" cy="40" rx="30" ry="7" fill="#6a4a10" opacity="0.18"/>` +
    tuft(16, 38, 18) + tuft(34, 40, 24) + tuft(52, 38, 16) +
    [[18, 18], [26, 14], [34, 18], [40, 10], [48, 16], [30, 24], [44, 24], [22, 26]].map(([x, y]) => f(x, y)).join('') +
    blossom5(56, 26, 5, '#ffffff', '#c9c2a8');
  return { svg: svg(68, 48, '', b), foot: [34, 42] };
}
