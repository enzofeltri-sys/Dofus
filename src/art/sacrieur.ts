import { ellipse, line, shape, svg, vgrad } from './kit';
import { CHIBI_FOOT, CHIBI_HAND, CHIBI_PIVOTS, sacriChibi, type ChibiPart, type SacriColors } from './sacrieur-chibi';

/**
 * Le Sacrieur du jeu : version Archero (chibi), choisie par Enzo (proposition A).
 * Reprend les codes du Sacrieur de Dofus ; couleurs réglables (peau, cheveux, 4 couleurs de vêtements).
 * Regarde vers la DROITE.
 */
export const SACRIEUR_W = 140;
export const SACRIEUR_H = 170;
export const SACRIEUR_FOOT: [number, number] = CHIBI_FOOT;
export const SACRIEUR_PIVOTS = CHIBI_PIVOTS;
/** Poing qui tient l'arme. */
export const SACRIEUR_HAND: [number, number] = CHIBI_HAND;
export const SACRIEUR_FACES_LEFT = false;
/** Cadrage du visage pour le médaillon (viewBox). */
export const SACRIEUR_FACE_BOX = '26 8 96 96';

export const sacrieurSvg = (part?: ChibiPart, colors?: SacriColors) => sacriChibi(part, colors);

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
