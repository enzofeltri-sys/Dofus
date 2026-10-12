/**
 * Icônes de sorts et de stats, façon Dofus : vignette peinte, cadre arrondi,
 * couleur de l'élément en fond, symbole clair au centre.
 */

const frame = (id: string, c1: string, c2: string, glyph: string) => `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="${id}" cx="0.35" cy="0.3" r="0.9"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
  <rect x="3" y="3" width="58" height="58" rx="12" fill="url(#${id})"/>
  ${glyph}
  <rect x="3" y="3" width="58" height="58" rx="12" fill="none" stroke="#fff" stroke-opacity="0.25" stroke-width="2"/>
</svg>`;

/** Absorption — vol de vie Feu : goutte de sang dans une flamme. */
export const ICON_ABSORPTION = frame(
  'iAbs', '#ff9b4a', '#9e2a12',
  `<path d="M32,10 C40,22 48,28 46,40 C44,52 20,52 18,40 C16,30 26,24 32,10 Z" fill="#ffd36a" stroke="#7a2a08" stroke-width="3" stroke-linejoin="round"/>
   <path d="M32,26 C36,32 40,36 39,41 C38,47 26,47 25,41 C24,36 28,32 32,26 Z" fill="#c4202a" stroke="#5a0a10" stroke-width="2.5"/>`,
);

/** Supplice — vol de vie Terre au corps à corps : poing épineux. */
export const ICON_SUPPLICE = frame(
  'iSup', '#c9a46a', '#5e3f18',
  `<path d="M20,30 Q20,20 30,20 L42,20 Q48,20 48,28 L48,40 Q48,48 40,48 L28,48 Q20,48 20,40 Z" fill="#f0c89a" stroke="#5a3010" stroke-width="3"/>
   <path d="M28,20 L28,30 M35,20 L35,30 M42,20 L42,30" stroke="#5a3010" stroke-width="2.5"/>
   <path d="M24,16 L28,22 M34,12 L35,20 M44,14 L42,21 M52,24 L47,27" stroke="#c4202a" stroke-width="3.5" stroke-linecap="round"/>`,
);

/** Attirance — attire la cible : crochet et chaîne. */
export const ICON_ATTIRANCE = frame(
  'iAtt', '#b8c2cc', '#3d4a58',
  `<path d="M14,20 L30,30" stroke="#e9eef2" stroke-width="5" stroke-dasharray="6 4" stroke-linecap="round"/>
   <path d="M30,30 Q42,24 46,34 Q50,46 38,48 Q30,48 30,40" fill="none" stroke="#f4f7fa" stroke-width="6" stroke-linecap="round"/>
   <path d="M30,40 L24,36 M30,40 L34,34" stroke="#f4f7fa" stroke-width="5" stroke-linecap="round"/>
   <path d="M14,20 L30,30" stroke="#c4202a" stroke-width="2" stroke-linecap="round" opacity="0.6"/>`,
);

/** Mutilation — sacrifie de la vie contre de la Puissance : lame et goutte. */
export const ICON_MUTILATION = frame(
  'iMut', '#e0505a', '#4a0a14',
  `<path d="M16,48 L42,16 L48,22 L22,52 Z" fill="#eef3f7" stroke="#3a4450" stroke-width="2.5" stroke-linejoin="round"/>
   <path d="M14,46 L22,54" stroke="#7a4a20" stroke-width="6" stroke-linecap="round"/>
   <path d="M44,34 C47,40 50,43 50,47 C50,52 40,52 40,47 C40,43 42,40 44,34 Z" fill="#ff3a44" stroke="#5a0a10" stroke-width="2.5"/>`,
);

/** Symbole du Sacrieur (portrait). */
export const ICON_SACRIEUR = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="pS" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#e2574e"/><stop offset="1" stop-color="#5a1218"/></radialGradient></defs>
  <circle cx="32" cy="32" r="30" fill="url(#pS)"/>
  <path d="M32,8 C36,20 44,26 44,36 C44,46 38,50 32,50 C26,50 20,46 20,36 C20,26 28,20 32,8 Z" fill="#f4ece0" opacity="0.92"/>
  <path d="M14,44 Q20,40 22,50 M50,44 Q44,40 42,50 M24,54 Q32,48 40,54" stroke="#f4ece0" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.92"/>
  <ellipse cx="37" cy="30" rx="3" ry="5" fill="#fff" opacity="0.8"/>
</svg>`;

/** Cœur (PV), étoile (PA), botte (PM) — les icônes emblématiques de l'interface Dofus. */
export const ICON_HEART = `
<svg viewBox="0 0 64 60" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="hG" cx="0.35" cy="0.3" r="0.9"><stop offset="0" stop-color="#ff7a7a"/><stop offset="1" stop-color="#a3121c"/></radialGradient></defs>
  <path d="M32,56 C10,40 3,30 3,18 C3,8 11,2 19,2 C25,2 30,6 32,11 C34,6 39,2 45,2 C53,2 61,8 61,18 C61,30 54,40 32,56 Z" fill="url(#hG)" stroke="#5a0a10" stroke-width="3.5" stroke-linejoin="round"/>
  <ellipse cx="19" cy="15" rx="7" ry="5" fill="#fff" opacity="0.45" transform="rotate(-25 19 15)"/>
</svg>`;

export const ICON_STAR = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="sG" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#9fe0ff"/><stop offset="1" stop-color="#1f5fb8"/></radialGradient></defs>
  <path d="M32,3 L40,22 L61,24 L45,38 L50,59 L32,48 L14,59 L19,38 L3,24 L24,22 Z" fill="url(#sG)" stroke="#0e2a5a" stroke-width="3.5" stroke-linejoin="round"/>
  <ellipse cx="26" cy="22" rx="6" ry="4" fill="#fff" opacity="0.5"/>
</svg>`;

export const ICON_BLOOD = `
<svg viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
  <path d="M20,3 C27,16 36,24 36,34 C36,44 28,49 20,49 C12,49 4,44 4,34 C4,24 13,16 20,3 Z" fill="#d42a36" stroke="#4a060c" stroke-width="3"/>
  <ellipse cx="14" cy="31" rx="3.5" ry="6" fill="#fff" opacity="0.45"/>
</svg>`;

export const ICON_PAUSE = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/></svg>`;
