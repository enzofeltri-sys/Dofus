/**
 * Icônes « grimoire » : dessins originaux, trait d'encre brune arrondi, aplats colorés et petit reflet.
 * Format 48×48. Couleurs reprises de la charte (theme.css).
 */

const INK = '#3b2414';
const S = `stroke="${INK}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
const HI = (d: string) => `<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2.2" stroke-linecap="round"/>`;
const svg = (body: string) => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const ICONS: Record<string, { label: string; svg: string }> = {
  vie: { label: 'Vie', svg: svg(`<path d="M24 41C10 32 5 25 5 17c0-6 4.5-10 10-10 4 0 7 2.5 9 6 2-3.5 5-6 9-6 5.5 0 10 4 10 10 0 8-5 15-19 24Z" fill="#e8664a" ${S}/>${HI('M12 14c1-2.5 3-3.5 5-3.5')}`) },
  pa: { label: 'PA', svg: svg(`<path d="M24 4l5.5 11.5 12.5 1.6-9.2 8.7 2.4 12.5L24 32.2l-11.2 6.1 2.4-12.5L6 17.1l12.5-1.6Z" fill="#22a196" ${S}/>${HI('M18 18.5l3-6')}`) },
  pm: { label: 'PM', svg: svg(`<path d="M15 6h11l1 18c6 1 13 4 14 10 .5 3-1.5 6-5 6H10c-2 0-3.5-1.5-3.5-3.5L9 24c1-6 4-9 6-10Z" fill="#5d8c3a" ${S}/><path d="M9 33h31" ${S} fill="none"/>${HI('M16 10v8')}`) },
  xp: { label: 'Expérience', svg: svg(`<path d="M24 5c3 8 9 10 17 11-6 5-8 10-6 18-5-3-8-3-11-3s-6 0-11 3c2-8 0-13-6-18 8-1 14-3 17-11Z" fill="#e3a838" ${S}/>${HI('M19 15c1.5-2 3-4 4-6')}`) },
  souffrance: { label: 'Souffrance', svg: svg(`<path d="M24 4c6 10 14 16 14 25a14 14 0 0 1-28 0C10 20 18 14 24 4Z" fill="#b8432c" ${S}/>${HI('M16 28c0-3 1.5-6 3.5-8')}`) },
  force: { label: 'Force', svg: svg(`<path d="M5 40l11-20 6 8 7-14 14 26Z" fill="#8a6a3c" ${S}/><path d="M24 22l5-8 4 7" fill="#5d8c3a" ${S}/>${HI('M14 26l3-5')}`) },
  intelligence: { label: 'Intelligence', svg: svg(`<path d="M24 4c2 8 12 12 12 23 0 8-5.5 14-12 14S12 35 12 27c0-6 4-8 5-14 3 3 4 6 4 9 2-5 2-11 3-18Z" fill="#e8664a" ${S}/><path d="M24 26c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9Z" fill="#e3a838" ${S}/>`) },
  chance: { label: 'Chance', svg: svg(`<path d="M24 5c7 10 13 16 13 24a13 13 0 0 1-26 0c0-8 6-14 13-24Z" fill="#22a196" ${S}/>${HI('M17 28c0-3 1.5-6 3.5-8')}<circle cx="29" cy="33" r="2.4" fill="#8ddccf"/>`) },
  agilite: { label: 'Agilité', svg: svg(`<path d="M9 39C14 22 26 10 41 7c-1 10-8 22-25 27Z" fill="#8bc25a" ${S}/><path d="M9 39l16-17M20 33l-4-4M26 27l-5-3M31 21l-5-2" fill="none" ${S}/>`) },
  sagesse: { label: 'Sagesse', svg: svg(`<path d="M8 10c6-2 11-1 16 3 5-4 10-5 16-3v28c-6-2-11-1-16 3-5-4-10-5-16-3Z" fill="#8b52c9" ${S}/><path d="M24 13v28" ${S}/><path d="M12 17c3-.5 6 0 8 1.5M12 23c3-.5 6 0 8 1.5M28 18.5c2-1.5 5-2 8-1.5" fill="none" stroke="#cdaaf2" stroke-width="2" stroke-linecap="round"/>`) },
  prospection: { label: 'Prospection', svg: svg(`<circle cx="20" cy="20" r="12" fill="#fff6dc" ${S}/><path d="M29 29l11 11" ${S}/><path d="M15 23l4-8 6 3 1 7-6 3Z" fill="#e3a838" ${S}/>`) },
  kamas: { label: 'Kamas', svg: svg(`<ellipse cx="20" cy="31" rx="13" ry="7" fill="#e3a838" ${S}/><ellipse cx="20" cy="27" rx="13" ry="7" fill="#f2c45c" ${S}/><ellipse cx="29" cy="18" rx="12" ry="7" fill="#f2c45c" ${S}/><path d="M25 18h8" ${S}/>`) },
  sac: { label: 'Inventaire', svg: svg(`<path d="M10 20c0-6 6-9 14-9s14 3 14 9l2 16c0 4-3 6-6 6H14c-3 0-6-2-6-6Z" fill="#b9864a" ${S}/><path d="M17 12c0-4 3-6 7-6s7 2 7 6" fill="none" ${S}/><path d="M14 24h20v6H14Z" fill="#8a5a2c" ${S}/><circle cx="24" cy="27" r="2.4" fill="#e3a838" ${S}/>`) },
  artisan: { label: 'Artisan', svg: svg(`<path d="M7 33h26l-3 5H12Z" fill="#6b6a72" ${S}/><path d="M11 27h22c4 0 7 2 8 6H7c0-3 2-6 4-6Z" fill="#8c8b94" ${S}/><path d="M28 6l9 6-4 5-9-6Z" fill="#8a6a3c" ${S}/><path d="M30 14L20 26" ${S}/>`) },
  forgemagie: { label: 'Forgemagie', svg: svg(`<path d="M24 4l14 8v16L24 44 10 28V12Z" fill="#8b52c9" ${S}/><path d="M24 12v20M17 19l14 6M31 19l-14 6" fill="none" stroke="#f4e7ff" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="22" r="3" fill="#fff6dc"/>`) },
  carte: { label: 'Donjons', svg: svg(`<path d="M6 11l11-4 14 4 11-4v30l-11 4-14-4-11 4Z" fill="#f2e2b4" ${S}/><path d="M17 7v30M31 11v30" ${S}/><path d="M10 28c4-2 6 2 10 0s4-6 8-5" fill="none" stroke="#e8664a" stroke-width="2.4" stroke-dasharray="3 3" stroke-linecap="round"/><path d="M33 19l4 4M37 19l-4 4" stroke="#b8432c" stroke-width="2.6" stroke-linecap="round"/>`) },
  reglages: { label: 'Réglages', svg: svg(`<path d="M24 6l3 5 6-1 1 6 5 3-3 5 3 5-5 3-1 6-6-1-3 5-3-5-6 1-1-6-5-3 3-5-3-5 5-3 1-6 6 1Z" fill="#a49372" ${S}/><circle cx="24" cy="24" r="6" fill="#f7eed6" ${S}/>`) },
  /* objets d'aventure (cases d'inventaire) */
  epee: { label: 'Épée', svg: svg(`<path d="M30 6h10v10L22 34l-8-8Z" fill="#d7e2ea" ${S}/><path d="M12 24l12 12-3 3-12-12Z" fill="#e3a838" ${S}/><path d="M12 36l-5 5" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M12 36l-5 5" stroke="#8a5a2c" stroke-width="2.6" stroke-linecap="round"/>${HI('M33 10l-12 12')}`) },
  anneau: { label: 'Anneau', svg: svg(`<circle cx="24" cy="29" r="12" fill="none" stroke="${INK}" stroke-width="8"/><circle cx="24" cy="29" r="12" fill="none" stroke="#e3a838" stroke-width="3.6"/><path d="M18 10l6-5 6 5-6 8Z" fill="#22a196" ${S}/>`) },
  coiffe: { label: 'Coiffe', svg: svg(`<path d="M7 30c0-12 8-20 17-20s17 8 17 20c-6-3-28-3-34 0Z" fill="#6f8a32" ${S}/><ellipse cx="24" cy="20" rx="6" ry="4" fill="#e3a838" ${S}/><path d="M7 30c-2 3-3 6-1 9 3-2 4-5 5-7" fill="#6f8a32" ${S}/>`) },
  os: { label: 'Os de Chafer', svg: svg(`<path d="M14 30l14-14" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M14 30l14-14" stroke="#f3ead2" stroke-width="5.5" stroke-linecap="round"/><circle cx="11" cy="29" r="4.5" fill="#f3ead2" ${S}/><circle cx="15" cy="34" r="4.5" fill="#f3ead2" ${S}/><circle cx="29" cy="13" r="4.5" fill="#f3ead2" ${S}/><circle cx="34" cy="18" r="4.5" fill="#f3ead2" ${S}/>`) },
  rune: { label: 'Rune de Force', svg: svg(`<path d="M24 6c9 0 14 6 14 14 0 10-7 20-14 22-7-2-14-12-14-22 0-8 5-14 14-14Z" fill="#a49372" ${S}/><path d="M18 30l6-14 6 14M20.5 25h7" fill="none" stroke="#5d2e92" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`) },
};
