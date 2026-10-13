import type { SpellId } from '../game/data/spells';

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
};
