import { svg } from './kit';
import type { PropArt } from './props';

/**
 * Décor des Champs d'Incarnam (même style que les monstres : formes rondes, contours colorés, couleurs pâles).
 * Buisson, rocher moussu et souche bloquent le passage ; les fleurs sont traversables.
 */

const rg = (id: string, a: string, b: string) => `<radialGradient id="${id}" cx="0.35" cy="0.3" r="0.9"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;

export function bush(): PropArt {
  const defs = rg('bushG', '#a6dc8e', '#4f8f4c');
  const ball = (x: number, y: number, r: number) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#bushG)" stroke="#2f5a2e" stroke-width="2.6"/>`;
  const flowers = [[30, 40], [62, 28], [86, 46], [50, 58], [74, 66]].map(([x, y], i) =>
    `<g transform="translate(${x},${y})">${[0, 1, 2, 3, 4].map((k) => `<circle cx="${(Math.cos(k * 1.256) * 3.4).toFixed(1)}" cy="${(Math.sin(k * 1.256) * 3.4).toFixed(1)}" r="3" fill="${i % 2 ? '#f6c6e6' : '#ffffff'}"/>`).join('')}<circle r="2" fill="#f2b23a"/></g>`).join('');
  const b = `<ellipse cx="58" cy="92" rx="52" ry="12" fill="#2a4a20" opacity="0.25"/>` +
    ball(30, 66, 26) + ball(86, 64, 26) + ball(58, 44, 32) + ball(58, 74, 26) +
    `<path d="M40,30 Q52,20 66,22" fill="none" stroke="#e8ffd8" stroke-width="4" stroke-linecap="round" opacity="0.6"/>` + flowers;
  return { svg: svg(116, 100, defs, b), foot: [58, 90] };
}

export function rock(): PropArt {
  const defs = rg('rockG', '#f0eee6', '#9c9a90') + rg('mossG', '#b6e69a', '#5f9e5c');
  const b = `<ellipse cx="48" cy="72" rx="44" ry="10" fill="#2a4a20" opacity="0.25"/>
    <path d="M8,66 Q4,40 22,24 Q40,8 62,14 Q86,20 90,46 Q94,66 80,72 Q48,80 8,66 Z" fill="url(#rockG)" stroke="#5a5850" stroke-width="2.8" stroke-linejoin="round"/>
    <path d="M26,30 Q40,18 56,20" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
    <path d="M60,40 L70,52 L64,62" fill="none" stroke="#7a786e" stroke-width="2" stroke-linecap="round"/>
    <path d="M30,20 Q44,8 62,14 Q76,18 82,30 Q66,24 52,30 Q38,34 30,20 Z" fill="url(#mossG)" stroke="#3f7a3a" stroke-width="2"/>`;
  return { svg: svg(96, 84, defs, b), foot: [48, 72] };
}

export function stump(): PropArt {
  const defs = rg('barkG', '#c49a6a', '#6e4a2a');
  const b = `<ellipse cx="44" cy="76" rx="40" ry="10" fill="#2a4a20" opacity="0.25"/>
    <path d="M12,70 L16,30 Q44,22 72,30 L76,70 Q86,76 76,78 Q44,84 12,78 Q2,76 12,70 Z" fill="url(#barkG)" stroke="#4a2e16" stroke-width="2.8" stroke-linejoin="round"/>
    <path d="M28,40 L26,70 M46,36 L47,74 M62,40 L64,70" stroke="#5a3a1c" stroke-width="2" opacity="0.6"/>
    <ellipse cx="44" cy="30" rx="28" ry="10" fill="#e8c890" stroke="#4a2e16" stroke-width="2.6"/>
    <ellipse cx="44" cy="30" rx="17" ry="6" fill="none" stroke="#b08850" stroke-width="1.8"/><ellipse cx="44" cy="30" rx="7" ry="2.6" fill="none" stroke="#b08850" stroke-width="1.6"/>
    <path d="M70,46 Q84,40 86,48 Q78,54 70,52 Z" fill="#8fcf74" stroke="#3f7a3a" stroke-width="1.6"/>`;
  return { svg: svg(92, 88, defs, b), foot: [44, 78] };
}

export function flowers(): PropArt {
  const f = (x: number, y: number, col: string, s = 1) =>
    `<path d="M${x},${y + 16 * s} Q${x - 2},${y + 8 * s} ${x},${y}" stroke="#4f8a48" stroke-width="2.2" fill="none"/>` +
    `<g transform="translate(${x},${y}) scale(${s})">${[0, 1, 2, 3, 4, 5].map((k) => `<ellipse cx="${(Math.cos(k * 1.047) * 5).toFixed(1)}" cy="${(Math.sin(k * 1.047) * 4).toFixed(1)}" rx="4.2" ry="3.2" fill="${col}" stroke="#8a8a9a" stroke-width="0.8"/>`).join('')}<circle r="2.6" fill="#f2b23a"/></g>`;
  const b = `<ellipse cx="34" cy="40" rx="30" ry="7" fill="#2a4a20" opacity="0.18"/>` +
    f(14, 18, '#ffffff') + f(32, 10, '#c8e6ff', 1.2) + f(50, 20, '#f6c6e6') + f(26, 26, '#ffe58a', 0.9) + f(44, 30, '#ffffff', 0.85);
  return { svg: svg(68, 48, '', b), foot: [34, 42] };
}
