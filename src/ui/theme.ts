import '@fontsource/lilita-one/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-800.css';
import './theme.css';

/**
 * Identité « grimoire d'aventurier » : génère les textures dessinées à la main
 * (grain et taches du papier) et les expose en variables CSS.
 * Tout est original : aucun asset de Dofus n'est utilisé.
 */

const uri = (svg: string) => `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;

/** Grain de papier très léger (bruit fractal), à poser par-dessus les fonds parchemin. */
function paperGrain(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="3"/><feColorMatrix values="0 0 0 0 .23  0 0 0 0 .14  0 0 0 0 .08  0 0 0 .55 0"/></filter><rect width="220" height="220" filter="url(#n)" opacity=".35"/></svg>`;
}

/** Fibres et taches discrètes du parchemin (grandes formes floues). */
function paperStains(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><filter id="b"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .38  0 0 0 0 .18  0 0 0 .9 -.35"/></filter><rect width="400" height="400" filter="url(#b)" opacity=".25"/></svg>`;
}

/**
 * Écran verrouillé (demandé par Enzo) : pas de zoom au pincement ni au double tap, sur toutes les pages.
 * Safari iOS ignore « user-scalable=no » : on bloque aussi ses gestes en JavaScript.
 */
export function lockZoom() {
  const stop = (e: Event) => e.preventDefault();
  for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, stop, { passive: false });
  document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  let last = 0;
  document.addEventListener('touchend', (e) => {
    const now = e.timeStamp;
    const t = e.target as HTMLElement | null;
    // double tap trop rapide = zoom de Safari : on l'annule (sauf dans les champs de saisie et sur les boutons, déjà protégés par
    // « touch-action: manipulation » — sinon deux touches rapides sur un bouton, comme deux runes en forgemagie, perdaient la 2e)
    if (now - last < 320 && !(t && t.closest('input, textarea, select, button, [role="button"]'))) e.preventDefault();
    last = now;
  }, { passive: false });
  document.addEventListener('dblclick', stop, { passive: false });
}

export function installTheme() {
  lockZoom();
  const root = document.documentElement.style;
  root.setProperty('--paper-grain', uri(paperGrain()));
  root.setProperty('--paper-stains', uri(paperStains()));
}
