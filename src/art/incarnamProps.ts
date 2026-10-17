import { svg } from './kit';
import type { PropArt } from './props';

/**
 * Décor des cartes 2 à 4 d'Incarnam, d'après les cartes de Dofus 3 :
 * Pâturages (buissons rouges, blocs de pierre sombre sur dallage), Forêt (grandes cornes d'ivoire plantées dans l'herbe),
 * Cimetière (tombes, arbres morts, piliers-lanternes).
 */

const lg = (id: string, a: string, b: string) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const shadow = (cx: number, cy: number, rx: number, ry: number, op = 0.28) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#3a2a10" opacity="${op}"/>`;

/** Buisson rouge des Pâturages : boules de feuillage rouge vif, quelques reflets. */
export function redBush(): PropArt {
  const balls: [number, number, number][] = [[30, 46, 16], [52, 40, 19], [72, 48, 15], [42, 58, 14], [62, 60, 14]];
  const b = shadow(50, 70, 40, 9) +
    balls.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 2.4}" fill="#5a0e0a"/>`).join('') +
    balls.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#rbG)"/>`).join('') +
    balls.slice(0, 3).map(([x, y, r]) => `<path d="M${x - r * 0.5},${y - r * 0.3} q${r * 0.3},${-r * 0.4} ${r * 0.75},${-r * 0.25}" fill="none" stroke="#ffb4a0" stroke-width="2.6" stroke-linecap="round" opacity="0.7"/>`).join('') +
    `<path d="M40,70 l2,-8 M58,70 l-1,-7" stroke="#5a3a1a" stroke-width="3" stroke-linecap="round"/>`;
  return { svg: svg(100, 80, `<radialGradient id="rbG" cx="0.35" cy="0.3" r="0.9"><stop offset="0" stop-color="#ff6a4a"/><stop offset="0.5" stop-color="#d8261c"/><stop offset="1" stop-color="#8a1410"/></radialGradient>`, b), foot: [50, 70] };
}

/** Bloc de pierre sombre posé sur le dallage (Pâturages). */
export function darkBlock(): PropArt {
  const defs = lg('dbTop', '#8a8470', '#5e5a4a') + lg('dbSide', '#5a5646', '#3a382e');
  const b = shadow(46, 70, 42, 10) +
    `<path d="M10,58 L10,34 L46,24 L82,34 L82,58 L46,70 Z" fill="url(#dbSide)" stroke="#24221c" stroke-width="2.6" stroke-linejoin="round"/>` +
    `<path d="M10,34 L46,24 L82,34 L46,44 Z" fill="url(#dbTop)" stroke="#24221c" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<path d="M46,44 L46,70" stroke="#24221c" stroke-width="2"/><path d="M18,36 L44,29" stroke="#c8c2a8" stroke-width="2.4" stroke-linecap="round" opacity="0.5"/>`;
  return { svg: svg(92, 80, defs, b), foot: [46, 68] };
}

/** Grandes cornes d'ivoire plantées dans l'herbe (Forêt). */
export function ivoryHorns(): PropArt {
  const horn = (d: string) => `<path d="${d}" fill="url(#ivG)" stroke="#8a7448" stroke-width="2.6" stroke-linejoin="round"/>`;
  const b = shadow(60, 126, 50, 11) +
    horn('M30,126 Q22,84 40,48 Q50,30 42,10 Q64,30 58,62 Q50,96 52,126 Z') +
    horn('M66,126 Q72,92 92,70 Q108,52 112,30 Q122,62 102,84 Q84,104 84,126 Z') +
    horn('M48,126 Q46,104 58,88 Q66,78 64,64 Q78,80 70,100 Q64,114 66,126 Z') +
    `<path d="M40,108 Q36,80 48,56 M76,110 Q86,90 100,76" fill="none" stroke="#fffaf0" stroke-width="3" stroke-linecap="round" opacity="0.6"/>` +
    `<path d="M26,126 q4,-12 -2,-20 M40,126 q2,-14 8,-18 M86,126 q-2,-12 4,-18 M98,126 q2,-10 -2,-16" fill="none" stroke="#c8962a" stroke-width="2.6" stroke-linecap="round"/>`;
  return { svg: svg(124, 136, lg('ivG', '#fffbea', '#d8c89a'), b), foot: [60, 126] };
}

/** Tombe du Cimetière : stèle arrondie fissurée, dalle au sol. */
export function tomb(): PropArt {
  const defs = lg('tbG', '#a8a494', '#6a6658') + lg('tbSlab', '#8a8676', '#5a5648');
  const b = shadow(44, 104, 40, 9) +
    `<path d="M8,104 L14,86 L76,86 L82,104 Z" fill="url(#tbSlab)" stroke="#2a2822" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<path d="M20,90 L20,34 Q20,12 44,12 Q68,12 68,34 L68,90 Z" fill="url(#tbG)" stroke="#2a2822" stroke-width="2.8" stroke-linejoin="round"/>` +
    `<path d="M44,28 v30 M34,40 h20" stroke="#3a382e" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M58,20 l-6,12 l5,6 l-4,10" fill="none" stroke="#3a382e" stroke-width="1.6"/>` +
    `<path d="M26,30 Q30,18 42,17" fill="none" stroke="#e8e4d4" stroke-width="2.6" stroke-linecap="round" opacity="0.5"/>` +
    `<path d="M12,104 q4,-10 10,-4 q4,-8 10,0 M60,104 q4,-9 9,-3 q4,-7 9,1" fill="#6a6a34" stroke="#3a3a1a" stroke-width="1.4"/>`;
  return { svg: svg(88, 112, defs, b), foot: [44, 102] };
}

/** Arbre mort du Cimetière : tronc tordu sombre, branches nues. */
export function deadTree(): PropArt {
  const d = 'M58,160 Q50,128 60,104 Q70,80 56,58 M60,104 Q84,92 92,66 Q96,52 108,46 M58,78 Q36,70 28,50 Q24,40 14,36 M56,58 Q60,40 74,30 M92,66 Q104,70 112,64 M28,50 Q36,42 34,30';
  const b = shadow(60, 160, 34, 8) +
    `<path d="${d}" fill="none" stroke="#1a1612" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="#5a4a3a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M56,150 Q50,126 58,106" fill="none" stroke="#8a7a62" stroke-width="2.4" stroke-linecap="round" opacity="0.6"/>` +
    `<path d="M58,160 Q46,164 38,160 M58,160 Q70,166 80,160" stroke="#2a221a" stroke-width="6" stroke-linecap="round"/>`;
  return { svg: svg(120, 170, '', b), foot: [60, 160] };
}

/** Pilier-lanterne du Cimetière : colonne de pierre, petit toit, flamme pâle. */
export function lanternPillar(): PropArt {
  const defs = lg('lpG', '#a8a090', '#6a6458') + `<radialGradient id="lpL"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.5" stop-color="#ffd870" stop-opacity="0.8"/><stop offset="1" stop-color="#ffb040" stop-opacity="0"/></radialGradient>`;
  const b = shadow(30, 150, 26, 7) +
    `<path d="M10,150 L12,138 L48,138 L50,150 Z" fill="url(#lpG)" stroke="#2a2822" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<rect x="17" y="58" width="26" height="82" fill="url(#lpG)" stroke="#2a2822" stroke-width="2.6"/>` +
    `<path d="M17,84 h26 M17,110 h26" stroke="#2a2822" stroke-width="1.6"/>` +
    `<rect x="13" y="30" width="34" height="28" fill="#4a463c" stroke="#2a2822" stroke-width="2.6"/>` +
    `<circle cx="30" cy="44" r="22" fill="url(#lpL)"/><rect x="20" y="35" width="20" height="18" rx="2" fill="#ffe89a" stroke="#2a2822" stroke-width="2"/>` +
    `<path d="M30,48 q-5,-6 0,-11 q5,5 0,11 Z" fill="#ff9a30"/>` +
    `<path d="M8,32 L30,14 L52,32 Z" fill="#5a5448" stroke="#2a2822" stroke-width="2.6" stroke-linejoin="round"/>` +
    `<path d="M21,62 v70" stroke="#e8e4d4" stroke-width="2.4" opacity="0.4"/>`;
  return { svg: svg(60, 160, defs, b), foot: [30, 148] };
}

/** Coffre gardé (salle spéciale) : bois cerclé d'or ; `open` : couvercle relevé, butin qui brille. */
export function chest(open = false): PropArt {
  const defs = lg('chW', '#b8743a', '#6a3a16') + lg('chL', '#c8844a', '#7a4420') + `<radialGradient id="chGlow"><stop offset="0" stop-color="#fff6c0"/><stop offset="0.5" stop-color="#ffd84a" stop-opacity="0.7"/><stop offset="1" stop-color="#ffb020" stop-opacity="0"/></radialGradient>`;
  const box = `<path d="M10,84 L10,52 L90,52 L90,84 Q50,92 10,84 Z" fill="url(#chW)" stroke="#2a1606" stroke-width="2.8" stroke-linejoin="round"/>` +
    `<path d="M10,62 L90,62 M10,76 L90,76" stroke="#4a2a10" stroke-width="1.4" opacity="0.7"/>` +
    `<path d="M24,52 L24,88 M76,52 L76,88" stroke="#6a4808" stroke-width="7"/><path d="M24,52 L24,88 M76,52 L76,88" stroke="#f0b42a" stroke-width="4"/>`;
  const lid = open
    ? `<path d="M12,52 L18,18 Q50,8 82,18 L88,52 Z" fill="url(#chL)" stroke="#2a1606" stroke-width="2.8" stroke-linejoin="round"/><path d="M26,50 L30,16 M74,50 L70,16" stroke="#f0b42a" stroke-width="4"/>` +
      `<circle cx="50" cy="52" r="34" fill="url(#chGlow)"/><path d="M26,54 Q50,40 74,54" fill="#ffd84a" stroke="#a87010" stroke-width="2"/>` +
      `<circle cx="38" cy="50" r="5" fill="#ffe46a" stroke="#a87010" stroke-width="1.4"/><circle cx="58" cy="47" r="5" fill="#ffe46a" stroke="#a87010" stroke-width="1.4"/><path d="M48,44 l6,-8 l6,8 l-6,6 Z" fill="#7fe0ff" stroke="#2a6a8a" stroke-width="1.4"/>`
    : `<path d="M8,54 Q8,26 50,24 Q92,26 92,54 Z" fill="url(#chL)" stroke="#2a1606" stroke-width="2.8" stroke-linejoin="round"/>` +
      `<path d="M24,54 Q24,30 26,28 M76,54 Q76,30 74,28" stroke="#6a4808" stroke-width="7" fill="none"/><path d="M24,54 Q24,30 26,28 M76,54 Q76,30 74,28" stroke="#f0b42a" stroke-width="4" fill="none"/>` +
      `<rect x="42" y="46" width="16" height="16" rx="3" fill="#f0b42a" stroke="#6a4808" stroke-width="2"/><circle cx="50" cy="53" r="2.4" fill="#2a1606"/>` +
      `<path d="M18,40 Q34,30 50,30" fill="none" stroke="#f4c890" stroke-width="2.6" stroke-linecap="round" opacity="0.6"/>`;
  const b = shadow(50, 88, 46, 9) + (open ? lid + box : box + lid);
  return { svg: svg(100, 100, defs, b), foot: [50, 86] };
}

/** Fontaine d'Incarnam (salle spéciale) : vasque de grès, eau lumineuse, petit jet. */
export function fountain(): PropArt {
  const defs = lg('ftS', '#fbf0cc', '#c4ac74') + `<radialGradient id="ftW" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stop-color="#ffffff"/><stop offset="0.4" stop-color="#9ff0ff"/><stop offset="1" stop-color="#3fb8d8"/></radialGradient>`;
  const b = shadow(80, 104, 76, 16) +
    `<path d="M8,74 Q8,104 80,106 Q152,104 152,74 L148,66 Q80,84 12,66 Z" fill="url(#ftS)" stroke="#7a6440" stroke-width="2.8" stroke-linejoin="round"/>` +
    `<ellipse cx="80" cy="66" rx="70" ry="20" fill="#d6c08a" stroke="#7a6440" stroke-width="2.8"/>` +
    `<ellipse cx="80" cy="67" rx="60" ry="15" fill="url(#ftW)"/>` +
    `<path d="M76,64 L76,30 Q80,24 84,30 L84,64 Z" fill="url(#ftS)" stroke="#7a6440" stroke-width="2.4"/>` +
    `<path d="M80,28 Q70,8 58,30 M80,28 Q90,8 102,30" fill="none" stroke="#bff6ff" stroke-width="3" stroke-linecap="round" opacity="0.9"/>` +
    `<path d="M40,64 Q60,58 72,62 M90,72 Q108,70 120,66" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="0.7"/>` +
    `<path d="M24,84 h14 v8 h-10 M120,84 h14 v8 h-10" fill="none" stroke="#8a6a3a" stroke-width="2.2"/>`;
  return { svg: svg(160, 114, defs, b), foot: [80, 96] };
}

/** Mains de squelette qui sortent de terre (piège du Cimetière). Pied en (50, 78). */
export function boneHands(): PropArt {
  const BONE = '#efe6cf', INK = '#4a3a26';
  const hand = (x: number, lean: number) => {
    const fingers = [-12, -5, 2, 9].map((dx, i) => `<path d="M${x + dx * 0.6},${40} L${x + dx + lean},${14 + Math.abs(i - 1.5) * 4} L${x + dx * 1.2 + lean * 1.3},${4 + Math.abs(i - 1.5) * 5}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M${x + dx * 0.6},${40} L${x + dx + lean},${14 + Math.abs(i - 1.5) * 4} L${x + dx * 1.2 + lean * 1.3},${4 + Math.abs(i - 1.5) * 5}" fill="none" stroke="${BONE}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
    return `<path d="M${x - 2},78 L${x},40" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M${x - 2},78 L${x},40" stroke="${BONE}" stroke-width="7.5" stroke-linecap="round"/>` +
      `<ellipse cx="${x}" cy="40" rx="11" ry="8" fill="${BONE}" stroke="${INK}" stroke-width="2.4"/>` + fingers +
      `<path d="M${x - 14},34 Q${x - 22},26 ${x - 20},18" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M${x - 14},34 Q${x - 22},26 ${x - 20},18" fill="none" stroke="${BONE}" stroke-width="3.6" stroke-linecap="round"/>`;
  };
  const b = `<ellipse cx="50" cy="78" rx="44" ry="10" fill="#2a2018" opacity="0.6"/>` + hand(30, -4) + hand(70, 5) +
    `<path d="M10,80 q10,-8 20,-2 q10,-6 18,0 q12,-7 22,0 q10,-6 20,2" fill="#5a4e2a" stroke="#2a2214" stroke-width="2"/>`;
  return { svg: svg(100, 90, '', b), foot: [50, 80] };
}
