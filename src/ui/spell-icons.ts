import type { PassiveId, SpellId } from '../game/data/spells';

/**
 * Icônes des sorts du Sacrieur, style « grimoire » (même trait que grimoire-icons.ts) :
 * pastille teintée selon l'élément, symbole à l'encre brune, petit reflet.
 */
const INK = '#3b2414';
const S = `stroke="${INK}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
const HI = (d: string) => `<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2" stroke-linecap="round"/>`;
const DROP = (x: number, y: number, s = 1) =>
  `<path d="M${x},${y - 7 * s}c${3 * s},${4 * s} ${5 * s},${6.5 * s} ${5 * s},${9 * s}a${5 * s},${5 * s} 0 0 1 ${-10 * s},0c0,${-2.5 * s} ${2 * s},${-5 * s} ${5 * s},${-9 * s}Z" fill="#c8303c" ${S}/>`;
const badge = (bg: string, rim: string, body: string) =>
  `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="42" height="42" rx="12" fill="${bg}"/><rect x="3" y="3" width="42" height="42" rx="12" fill="none" stroke="${rim}" stroke-width="2" opacity=".6"/>${body}</svg>`;

/** Couleur de l'élément (pastilles, effets). */
export const ELEMENT_COLOR: Record<string, number> = { terre: 0x9a6a2c, air: 0x6fb33a, feu: 0xe8664a, eau: 0x22a196, neutre: 0xb8a68a };

export const SPELL_ICONS: Record<SpellId, string> = {
  // Supplice (Terre) : poing serré qui fait couler le sang
  supplice: badge('#ead2a4', '#9a6a2c',
    `<path d="M13 21c0-4 3-6 6-6h9c4 0 7 3 7 7v6c0 6-4 10-10 10h-3c-5 0-9-4-9-9Z" fill="#c98f5a" ${S}/>` +
    `<path d="M19 15v7M25 15v7M31 16v7" ${S} fill="none"/><path d="M13 25h8" ${S}/>` + HI('M17 19c1-1.5 2-2 3.5-2') + DROP(37, 32, 0.8)),
  // Hémorragie (Air) : trois entailles et gouttes
  hemorragie: badge('#d7edbf', '#5d8c3a',
    `<path d="M12 33L30 13M18 37L36 17M26 38L38 25" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>` +
    `<path d="M12 33L30 13M18 37L36 17M26 38L38 25" stroke="#c8303c" stroke-width="2.6" stroke-linecap="round"/>` + DROP(14, 18, 0.7)),
  // Absorption (Feu) : flamme qui avale une goutte
  absorption: badge('#fbd6c6', '#e8664a',
    `<path d="M24 6c3 7 12 11 12 21a12 12 0 0 1-24 0c0-6 4-8 5-13 3 2 4 5 4 8 1-5 1-10 3-16Z" fill="#f08a4a" ${S}/>` +
    HI('M17 28c0-3 1.5-5 3-7') + DROP(25, 32, 0.75)),
  // Stase (Eau) : goutte d'eau figée en cristal
  stase: badge('#c9ede6', '#22a196',
    `<path d="M24 6c6 9 12 15 12 23a12 12 0 0 1-24 0c0-8 6-14 12-23Z" fill="#5cc9ba" ${S}/>` +
    `<path d="M24 20v16M17 25l14 6M31 25l-14 6" stroke="#eafffb" stroke-width="2.2" stroke-linecap="round"/>` + HI('M17 27c0-3 1.5-6 3.5-8')),
  // Attirance : crochet qui tire vers le lanceur
  attirance: badge('#e6d5f6', '#8b52c9',
    `<path d="M36 12c-9 0-14 5-14 12v6" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>` +
    `<path d="M36 12c-9 0-14 5-14 12v6" fill="none" stroke="#a77ad8" stroke-width="2.6" stroke-linecap="round"/>` +
    `<path d="M14 26l8 12 8-12Z" fill="#a77ad8" ${S}/><path d="M33 8l6 4-6 4Z" fill="#a77ad8" ${S}/>`),
  // Mutilation : dague qui fait couler le sang du lanceur
  mutilation: badge('#f5cdc4', '#b8432c',
    `<path d="M32 8l6 6-17 17-6-6Z" fill="#dfe6ec" ${S}/><path d="M13 23l12 12-3 3-12-12Z" fill="#e3a838" ${S}/>` +
    `<path d="M14 34l-5 5" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M14 34l-5 5" stroke="#8a5a2c" stroke-width="2.6" stroke-linecap="round"/>` +
    HI('M33 12L22 23') + DROP(34, 34, 0.75)),
  // Épée Vorace (Neutre) : épée volante à la lame rougie
  epeeVorace: badge('#ece4d4', '#8a7a5a',
    `<path d="M33 7l8 1 1 8-17 17-9-9Z" fill="#e4ecf2" ${S}/><path d="M18 27l9 9-3 3-9-9Z" fill="#b8432c" ${S}/>` +
    `<path d="M13 35l-5 5" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M13 35l-5 5" stroke="#8a5a2c" stroke-width="2.6" stroke-linecap="round"/>` +
    `<path d="M35 12L24 23" stroke="#c8303c" stroke-width="2.4" stroke-linecap="round"/>` + `<path d="M7 14c3-2 6-2 9 0M9 20c2-1 4-1 6 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`),
  // Ravage (Terre) : élan vers l'avant et impact au sol
  ravage: badge('#ead2a4', '#9a6a2c',
    `<path d="M8 30h14M10 22h10M12 38h8" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M24 34l8-20 8 20Z" fill="#c98f5a" ${S}/><path d="M22 38h20" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` + HI('M29 22l2-5')),
  // Assaut (Air) : deux flèches qui échangent leur place
  assaut: badge('#d7edbf', '#5d8c3a',
    `<path d="M10 18h22l-5-6M38 30H16l5 6" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M10 18h22l-5-6M38 30H16l5 6" fill="none" stroke="#8fd05a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`),
  // Transposition : deux silhouettes reliées par une boucle d'échange
  transposition: badge('#e6d5f6', '#8b52c9',
    `<circle cx="14" cy="16" r="5" fill="#a77ad8" ${S}/><path d="M8 30c0-5 3-8 6-8s6 3 6 8Z" fill="#a77ad8" ${S}/>` +
    `<circle cx="34" cy="20" r="5" fill="#e3a838" ${S}/><path d="M28 34c0-5 3-8 6-8s6 3 6 8Z" fill="#e3a838" ${S}/>` +
    `<path d="M18 9c6-4 12-3 16 3M30 38c-6 4-12 3-16-3" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="3 3"/>`),
  // Condensation (Eau) : tourbillon qui ramène les gouttes au centre
  condensation: badge('#c9ede6', '#22a196',
    `<path d="M24 24m-13 0a13 13 0 1 0 26 0a13 13 0 1 0-26 0" fill="none" stroke="${INK}" stroke-width="2.4" stroke-dasharray="5 4"/>` +
    `<path d="M24 24c0-5 6-6 7-2s-3 7-8 6-7-7-3-11" fill="none" stroke="#22a196" stroke-width="3.4" stroke-linecap="round"/>` +
    `<path d="M9 12l5 4M39 12l-5 4M9 38l5-4M39 38l-5-4" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`),
  // Hostilité (Feu) : poing de flamme qui repousse
  hostilite: badge('#fbd6c6', '#e8664a',
    `<path d="M10 24h16" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M10 24h16" stroke="#f08a4a" stroke-width="3.4" stroke-linecap="round"/>` +
    `<path d="M26 14l12 10-12 10Z" fill="#f08a4a" ${S}/><path d="M38 14v20M42 18v12" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`),
  // Couronne d'Épines : couronne de ronces
  couronne: badge('#e8dcc4', '#6a4a2a',
    `<path d="M10 30l4-14 6 8 4-12 4 12 6-8 4 14Z" fill="#8a6a3a" ${S}/><path d="M10 30h28v6H10Z" fill="#6a4a2a" ${S}/>` +
    `<path d="M14 16l-3-3M24 12V8M34 16l3-3" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>` + DROP(24, 40, 0.5)),
  // Transfusion (Neutre) : cœur qui éclate en onde
  transfusion: badge('#ece4d4', '#8a7a5a',
    `<circle cx="24" cy="25" r="16" fill="none" stroke="#b8a68a" stroke-width="2.4"/><circle cx="24" cy="25" r="11" fill="none" stroke="#b8a68a" stroke-width="2"/>` +
    `<path d="M24 32c-6-4-9-7-9-10a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3-3 6-9 10Z" fill="#c8303c" ${S}/>`),
  // Dissolution (Eau) : quatre gouttes en croix qui fondent vers le centre
  dissolution: badge('#c9ede6', '#22a196',
    `<path d="M24 24L13 13M24 24L35 13M24 24L13 35M24 24L35 35" stroke="#5cc9ba" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 3"/>` +
    [[13, 15], [35, 15], [13, 37], [35, 37]].map(([x, y]) => `<path d="M${x},${y - 6}c2.6,3.4 4.2,5.4 4.2,7.6a4.2,4.2 0 0 1-8.4,0c0-2.2 1.6-4.2 4.2-7.6Z" fill="#5cc9ba" ${S}/>`).join('') + DROP(24, 27, 0.8)),
  // Désolation (Air) : tourbillon de vent et gouttes de sang arrachées
  desolation: badge('#d7edbf', '#5d8c3a',
    `<path d="M10 20c8-6 22-6 28 0M12 27c7-4 17-4 22 0M16 34c5-3 11-3 14 0" fill="none" stroke="${INK}" stroke-width="5.4" stroke-linecap="round"/>` +
    `<path d="M10 20c8-6 22-6 28 0M12 27c7-4 17-4 22 0M16 34c5-3 11-3 14 0" fill="none" stroke="#8fd05a" stroke-width="2.4" stroke-linecap="round"/>` + DROP(36, 34, 0.7) + DROP(12, 36, 0.55)),
};

/** Icônes des passifs (pastille dorée : un passif est permanent pendant le donjon). */
const pbadge = (body: string) => badge('#f6e3b0', '#9a6a12', body);
export const PASSIVE_ICONS: Record<PassiveId, string> = {
  vampirisme: pbadge(`<path d="M12 14l4 9 4-9M28 14l4 9 4-9" fill="#fff6dc" ${S}/><path d="M8 13h32" ${S}/>` + DROP(24, 32, 0.9)),
  regeneration: pbadge(`<path d="M24 39C12 31 8 25 8 19c0-5 3.5-8 8-8 3.5 0 6 2 8 5 2-3 4.5-5 8-5 4.5 0 8 3 8 8 0 6-4 12-16 20Z" fill="#e8664a" ${S}/><path d="M24 16v14M17 23h14" stroke="#fff6dc" stroke-width="3.2" stroke-linecap="round"/>`),
  epines: pbadge(`<circle cx="24" cy="25" r="11" fill="#8a6a3c" ${S}/><path d="M24 8v6M24 36v6M7 25h6M35 25h6M12 13l4 4M32 33l4 4M36 13l-4 4M16 33l-4 4" ${S}/>` + HI('M19 21c1-2 2.5-3 4-3.5')),
  frenesie: pbadge(`<path d="M30 6h10v10L22 34l-8-8Z" fill="#d7e2ea" ${S}/><path d="M12 24l12 12-3 3-12-12Z" fill="#e3a838" ${S}/><path d="M6 14h8M4 20h8M8 8h8" stroke="#e8664a" stroke-width="2.6" stroke-linecap="round"/>`),
  douleur: pbadge(`<path d="M24 5c6 10 14 16 14 25a14 14 0 0 1-28 0C10 21 18 15 24 5Z" fill="#b8432c" ${S}/><path d="M19 22l5 4 4-7 3 9" fill="none" stroke="#ffd36a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`),
  endurance: pbadge(`<path d="M24 6l15 6v10c0 9-6 16-15 20C15 38 9 31 9 22V12Z" fill="#a0784a" ${S}/><path d="M24 11v26" stroke="#5a3a1a" stroke-width="2" stroke-dasharray="3 3"/>` + HI('M14 15v7')),
};
