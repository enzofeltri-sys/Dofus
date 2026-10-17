import { svg } from './kit';
import type { PropArt } from './props';

/**
 * Décor d'Astrub, d'après les cartes de Dofus 3 : arbres d'automne, clôtures, granges aux toits orange, meules de foin,
 * maisons de la Cité aux toits bleus, étals de marché, caisses, tournesols, tuyaux des Souterrains.
 */

const lg = (id: string, a: string, b: string, h = false) => `<linearGradient id="${id}" x1="0" y1="0" x2="${h ? 1 : 0}" y2="${h ? 0 : 1}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const shadow = (cx: number, cy: number, rx: number, ry: number, op = 0.28) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#2a3a10" opacity="${op}"/>`;
const INK = '#3a2410';

/** Arbre d'automne : tronc brun, feuillage en boules vertes et orange. */
export function autumnTree(): PropArt {
  const balls: [number, number, number, string][] = [
    [50, 64, 26, '#7ab83a'], [80, 56, 28, '#e8902a'], [66, 38, 24, '#9ac83a'], [38, 44, 18, '#d86a20'], [92, 80, 18, '#7ab83a'], [56, 84, 18, '#c8a02a'],
  ];
  const b = shadow(64, 150, 40, 9) +
    `<path d="M60,150 Q56,120 62,96 M62,110 Q76,98 84,88 M60,104 Q46,96 40,82" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>` +
    `<path d="M60,150 Q56,120 62,96 M62,110 Q76,98 84,88 M60,104 Q46,96 40,82" fill="none" stroke="#8a5a2a" stroke-width="7" stroke-linecap="round"/>` +
    balls.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 2.4}" fill="#2a3a10"/>`).join('') +
    balls.map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.4}" fill="#ffffff" opacity="0.22"/>`).join('');
  return { svg: svg(128, 160, '', b), foot: [62, 150] };
}

/** Clôture de bois (petit obstacle). */
export function fence(): PropArt {
  const b = shadow(60, 64, 54, 7, 0.2) +
    [14, 60, 106].map((x) => `<rect x="${x - 5}" y="22" width="10" height="44" rx="2" fill="#a8743e" stroke="${INK}" stroke-width="2.4"/>`).join('') +
    [32, 48].map((y) => `<rect x="6" y="${y}" width="108" height="8" rx="2" fill="#c08a4a" stroke="${INK}" stroke-width="2.2"/>`).join('');
  return { svg: svg(120, 72, '', b), foot: [60, 64] };
}

/** Grange des Champs d'Astrub : toit orange arrondi, murs de planches, porte. */
export function barn(): PropArt {
  const defs = lg('brRoof', '#f0884a', '#b84a1c') + lg('brWall', '#c88a4a', '#8a5a2a');
  const b = shadow(90, 178, 86, 14) +
    `<path d="M18,176 L18,96 L162,96 L162,176 Z" fill="url(#brWall)" stroke="${INK}" stroke-width="3"/>` +
    [40, 62, 84, 106, 128, 150].map((x) => `<path d="M${x},98 V174" stroke="#6a4020" stroke-width="1.6" opacity="0.6"/>`).join('') +
    `<path d="M66,176 L66,128 Q90,112 114,128 L114,176 Z" fill="#5a3418" stroke="${INK}" stroke-width="2.6"/><path d="M90,124 V176 M68,150 H112" stroke="#3a2010" stroke-width="2"/>` +
    `<path d="M6,104 Q10,30 90,22 Q170,30 174,104 Q150,92 90,92 Q30,92 6,104 Z" fill="url(#brRoof)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
    [40, 64, 90, 116, 140].map((x) => `<path d="M${x},${x === 90 ? 26 : 34} Q${x + (x - 90) * 0.1},70 ${x + (x - 90) * 0.18},96" fill="none" stroke="#a83a10" stroke-width="2.2" opacity="0.7"/>`).join('') +
    `<path d="M40,46 Q70,30 110,32" fill="none" stroke="#ffd0a0" stroke-width="4" stroke-linecap="round" opacity="0.6"/>` +
    `<circle cx="90" cy="62" r="11" fill="#f8e8b0" stroke="${INK}" stroke-width="2.4"/><path d="M90,52 V72 M80,62 H100" stroke="${INK}" stroke-width="2"/>`;
  return { svg: svg(180, 190, defs, b), foot: [90, 176] };
}

/** Meule de foin dorée. */
export function haystack(): PropArt {
  const b = shadow(50, 74, 46, 9) +
    `<path d="M8,72 Q6,30 50,16 Q94,30 92,72 Q50,82 8,72 Z" fill="#e8c04a" stroke="#8a6010" stroke-width="2.8" stroke-linejoin="round"/>` +
    [[20, 60, 30, 34], [36, 66, 44, 26], [54, 68, 60, 24], [70, 62, 76, 32], [46, 46, 50, 22]].map(([a, b2, c, d]) => `<path d="M${a},${b2} L${c},${d}" stroke="#b88a20" stroke-width="2" stroke-linecap="round"/>`).join('') +
    `<path d="M24,40 Q40,26 58,24" fill="none" stroke="#fff4c0" stroke-width="3.4" stroke-linecap="round" opacity="0.6"/>`;
  return { svg: svg(100, 84, '', b), foot: [50, 74] };
}

/** Maison de la Cité d'Astrub : toit bleu arrondi, colombages, fenêtre ronde. */
export function cityHouse(): PropArt {
  const defs = lg('chRoof', '#5a8ac0', '#2a4a7a') + lg('chWall', '#f4e8c8', '#c8b088');
  const b = shadow(90, 182, 88, 14) +
    `<path d="M22,180 L22,92 L158,92 L158,180 Z" fill="url(#chWall)" stroke="${INK}" stroke-width="3"/>` +
    `<path d="M22,120 H158 M22,150 H158 M60,92 V180 M120,92 V180" stroke="#8a6030" stroke-width="5"/>` +
    `<path d="M76,180 L76,138 Q90,126 104,138 L104,180 Z" fill="#3a5a8a" stroke="${INK}" stroke-width="2.6"/>` +
    `<circle cx="40" cy="106" r="10" fill="#bfe0f8" stroke="${INK}" stroke-width="2.4"/><circle cx="140" cy="106" r="10" fill="#bfe0f8" stroke="${INK}" stroke-width="2.4"/>` +
    `<path d="M8,100 Q8,26 90,18 Q172,26 172,100 Q150,86 90,86 Q30,86 8,100 Z" fill="url(#chRoof)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
    [36, 60, 90, 120, 144].map((x) => `<path d="M${x},${x === 90 ? 22 : 30} Q${x + (x - 90) * 0.1},66 ${x + (x - 90) * 0.16},88" fill="none" stroke="#1a3050" stroke-width="2" opacity="0.6"/>`).join('') +
    `<path d="M40,42 Q66,28 104,28" fill="none" stroke="#c8e0ff" stroke-width="4" stroke-linecap="round" opacity="0.6"/>` +
    `<path d="M120,30 L120,6 L136,6 L136,40" fill="#a86a3a" stroke="${INK}" stroke-width="2.4"/>`;
  return { svg: svg(180, 194, defs, b), foot: [90, 180] };
}

/** Étal de marché de la Cité : toile rayée, comptoir, cagettes. */
export function marketStall(): PropArt {
  const b = shadow(60, 104, 56, 9) +
    `<path d="M14,104 V40 M106,104 V40" stroke="${INK}" stroke-width="6"/><path d="M14,104 V40 M106,104 V40" stroke="#a8743e" stroke-width="3"/>` +
    `<path d="M10,72 H110 V100 H10 Z" fill="#c08a4a" stroke="${INK}" stroke-width="2.6"/>` +
    [[22, '#e84a3a'], [44, '#f0c83a'], [66, '#7ab83a'], [88, '#e8902a']].map(([x, c]) => `<rect x="${x}" y="62" width="16" height="12" rx="3" fill="${c}" stroke="${INK}" stroke-width="1.6"/>`).join('') +
    `<path d="M4,44 Q60,22 116,44 L110,52 Q60,34 10,52 Z" fill="#e8e0c8" stroke="${INK}" stroke-width="2.4"/>` +
    [16, 38, 60, 82, 104].map((x) => `<path d="M${x},${x === 60 ? 32 : 38} L${x},50" stroke="#d8342c" stroke-width="7" opacity="0.85"/>`).join('');
  return { svg: svg(120, 112, '', b), foot: [60, 104] };
}

/** Pile de caisses. */
export function crates(): PropArt {
  const box = (x: number, y: number, s: number) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="2" fill="#c8904a" stroke="${INK}" stroke-width="2.4"/><path d="M${x},${y} L${x + s},${y + s} M${x + s},${y} L${x},${y + s}" stroke="#8a5a2a" stroke-width="2"/><rect x="${x}" y="${y}" width="${s}" height="${s}" rx="2" fill="none" stroke="#e8b878" stroke-width="1.2" opacity="0.5"/>`;
  const b = shadow(46, 82, 42, 8) + box(6, 44, 38) + box(46, 50, 32) + box(24, 10, 34);
  return { svg: svg(92, 90, '', b), foot: [46, 82] };
}

/** Bouquet de tournesols (traversable). */
export function sunflowers(): PropArt {
  const flower = (x: number, y: number, s: number) => `<path d="M${x},${y + 30 * s} Q${x - 2},${y + 14 * s} ${x},${y}" fill="none" stroke="#3a8a2a" stroke-width="${3 * s}"/>` +
    [...Array(10)].map((_, i) => `<ellipse cx="${x}" cy="${y - 8 * s}" rx="${3.5 * s}" ry="${8 * s}" transform="rotate(${i * 36} ${x} ${y})" fill="#f8c81c" stroke="#a87010" stroke-width="1"/>`).join('') +
    `<circle cx="${x}" cy="${y}" r="${6 * s}" fill="#6a3a14"/>`;
  const b = shadow(40, 70, 34, 6, 0.18) + flower(22, 36, 0.9) + flower(52, 26, 1.1) + flower(40, 46, 0.8);
  return { svg: svg(80, 78, '', b), foot: [40, 70] };
}

/** Tuyau de cuivre des Souterrains (obstacle). */
export function pipe(): PropArt {
  const b = shadow(40, 132, 34, 8) +
    `<rect x="24" y="20" width="32" height="112" rx="6" fill="#b8783a" stroke="${INK}" stroke-width="3"/>` +
    `<rect x="18" y="36" width="44" height="12" rx="4" fill="#8a5a2a" stroke="${INK}" stroke-width="2.4"/><rect x="18" y="96" width="44" height="12" rx="4" fill="#8a5a2a" stroke="${INK}" stroke-width="2.4"/>` +
    `<path d="M32,24 V128" stroke="#f0b878" stroke-width="4" opacity="0.5"/>` +
    `<path d="M56,66 Q76,66 76,86 V132" fill="none" stroke="${INK}" stroke-width="14"/><path d="M56,66 Q76,66 76,86 V132" fill="none" stroke="#a8683a" stroke-width="9"/>` +
    `<circle cx="40" cy="78" r="9" fill="#6a8a3a" stroke="${INK}" stroke-width="2"/><path d="M40,70 V86 M32,78 H48" stroke="#2a3a10" stroke-width="2"/>`;
  return { svg: svg(92, 140, '', b), foot: [40, 132] };
}
