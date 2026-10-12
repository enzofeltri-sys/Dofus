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

export function installTheme() {
  const root = document.documentElement.style;
  root.setProperty('--paper-grain', uri(paperGrain()));
  root.setProperty('--paper-stains', uri(paperStains()));
}
