import { ellipse, line, shape, svg, vgrad } from './kit';
import { H_OPTS, pivotsFor, variantH } from './sacrieur-variants/official-cartoon';

/**
 * Le Sacrieur du jeu : D2 affiné (« H » : traits fins, membres minces, buste et tête réduits), choisi par Enzo.
 * Silhouette cartoon, tenue officielle (bandana olive à pièce jaune, yeux blancs, peintures de guerre,
 * marque en cœur, avant-bras bandés de rouge et moufles, pagne jaune, pantalon olive effiloché,
 * tibias bandés, pieds nus). Regarde vers la DROITE.
 */
export const SACRIEUR_W = 140;
export const SACRIEUR_H = 170;
export const SACRIEUR_FOOT: [number, number] = [70, 160];
/** Pivots des morceaux articulés (les épaules suivent le buste affiné). */
export const SACRIEUR_PIVOTS = pivotsFor(H_OPTS);
/** Poing qui tient l'arme (coordonnées du SVG, haut du corps remonté de 14 px). */
export const SACRIEUR_HAND: [number, number] = [97 + SACRIEUR_PIVOTS.armF[0] - 93, 106];
export const SACRIEUR_FACES_LEFT = false;

export const sacrieurSvg = variantH;

/** Épée grossière du Sacrieur (verticale, pointe en haut). Poignée en SWORD_GRIP. */
export const SWORD_W = 40;
export const SWORD_H = 96;
export const SWORD_GRIP: [number, number] = [20, 74];

export function sacrieurSwordSvg(): string {
  const defs = vgrad('bladeG', '#eef3f7', '#9fb0bf');
  const body = [
    shape('M15,64 L13,22 Q14,8 22,2 Q29,10 28,24 L26,64 Z', 'url(#bladeG)', '#465565', 2.2),
    line('M20,60 L20,14', '#ffffff', 2, 0.7),
    shape('M13,38 L17,41 L13,44 Z', '#8a9aa8', '#465565', 1.4),
    shape('M8,62 Q20,58 33,62 L32,68 Q20,65 9,68 Z', '#a8742e', '#4f3510', 2.2),
    shape('M16,68 L25,68 L25,86 L16,86 Z', '#6a3a1a', '#2a1408', 2.2),
    line('M16,72 L25,74 M16,77 L25,79 M16,82 L25,84', '#2a1408', 1.3),
    ellipse(20.5, 89, 5, 4.5, '#a8742e', '#4f3510', 2),
  ].join('');
  return svg(SWORD_W, SWORD_H, defs, body);
}
