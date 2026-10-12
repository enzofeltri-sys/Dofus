import { cel, ellipse, gloss, line, shape, svg, tube } from './kit';

/**
 * Le Sacrieur (mâle), de trois quarts tourné vers la GAUCHE comme les personnages Dofus.
 * Proportions Dofus (tête ≈ 1/3 de la hauteur), torse puissant, crinière sauvage,
 * tatouages tribaux rouges, cicatrices recousues, pantalon ample, pieds bandés.
 * Couleurs par défaut de la classe (DofusDB) : peau #e59b68, tissus olive / bordeaux / brun.
 */
const SKIN = '#e59b68';
const SKIN_INK = '#5e2e14';
const HAIR = '#a8401c';
const PANTS = '#6a5e28';
const BLOOD = '#852a34';
const LEATHER = '#76422c';
const TATTOO = '#9a1c26';

export const SACRIEUR_W = 150;
export const SACRIEUR_H = 182;
export const SACRIEUR_FOOT: [number, number] = [76, 172];
/** Poing qui tient l'arme (coordonnées du SVG). */
export const SACRIEUR_HAND: [number, number] = [36, 110];

export function sacrieurSvg(): string {
  const defs = [
    cel('sk', SKIN, 'diag'),
    cel('skB', '#c97a4c', 'diag'),
    cel('hr', HAIR, 'diag'),
    cel('pt', PANTS, 'horiz'),
    cel('bl', BLOOD, 'vert'),
    cel('lt', LEATHER, 'vert'),
  ].join('');

  const p: string[] = [];

  // Crinière arrière (derrière la tête et la nuque).
  p.push(shape('M70,14 C88,8 104,16 108,30 L116,34 L108,40 L114,50 L104,52 L106,64 L96,60 L94,72 L84,62 Z', 'url(#hr)', '#3e1206'));

  // Bras arrière (gauche du personnage, côté droit de l'image).
  p.push(tube([[96, 80], [108, 98], [104, 116]], 13, 'url(#skB)', SKIN_INK));
  p.push(ellipse(104, 119, 7.5, 7, 'url(#skB)', SKIN_INK));
  p.push(line('M100,88 Q106,92 104,100 M103,86 Q110,94 107,102', TATTOO, 1.8, 0.8));

  // Jambe arrière : pantalon ample, bandes, pied nu.
  p.push(shape('M80,112 L100,110 Q106,132 102,150 L88,152 Q86,132 80,112 Z', 'url(#pt)', '#2a2408'));
  p.push(shape('M88,146 L102,145 L103,160 L89,161 Z', 'url(#lt)', '#2e160c'));
  p.push(line('M89,150 L102,149 M89,155 L103,154', '#3a1c0e', 1.3));
  p.push(ellipse(100, 166, 11, 5, 'url(#skB)', SKIN_INK));

  // Torse de trois quarts, musclé.
  p.push(shape('M50,82 C52,70 92,68 99,78 L95,108 C89,118 62,120 56,110 Z', 'url(#sk)', SKIN_INK));
  p.push(line('M56,88 Q66,97 77,90 Q84,95 92,88', '#a8582e', 1.8, 0.8));
  p.push(line('M66,100 L66,108 M75,100 L75,110', '#a8582e', 1.4, 0.6));
  p.push(gloss(62, 80, 9, 4, -15, 0.35));
  // tatouage tribal sur le flanc et la poitrine
  p.push(line('M86,82 Q94,88 90,98 Q86,104 90,110 M82,86 Q86,92 83,98', TATTOO, 2, 0.85));
  // grande cicatrice recousue
  p.push(line('M58,104 L82,84', '#b0343c', 2.4));
  p.push(line('M61,98 L65,103 M66,94 L70,99 M71,90 L75,95 M76,86 L80,91', '#4a0c10', 1.2));

  // Ceinture-écharpe et pan qui pend devant.
  p.push(shape('M54,106 Q76,116 97,106 L98,116 Q76,126 53,116 Z', 'url(#bl)', '#3a0c12'));
  p.push(ellipse(74, 116, 5, 4.5, '#d9a441', '#6a4410', 1.4));

  // Jambe avant.
  p.push(shape('M56,114 L82,116 Q80,136 72,152 L54,152 Q52,132 56,114 Z', 'url(#pt)', '#2a2408'));
  p.push(line('M64,120 Q66,134 62,148', '#4a4214', 1.4, 0.7));
  p.push(shape('M53,146 L72,146 L72,160 L53,161 Z', 'url(#lt)', '#2e160c'));
  p.push(line('M53,150 L72,150 M53,155 L72,155', '#3a1c0e', 1.3));
  p.push(ellipse(58, 167, 13, 5.5, 'url(#sk)', SKIN_INK));
  p.push(shape('M58,118 Q50,132 54,146 L62,144 Q60,132 66,120 Z', 'url(#bl)', '#3a0c12'));

  // Bras avant (droit du personnage) tendu vers l'avant, tient l'arme.
  p.push(tube([[54, 82], [42, 98], [36, 108]], 14, 'url(#sk)', SKIN_INK));
  p.push(line('M50,88 Q44,92 44,100 M47,86 Q40,92 40,98', TATTOO, 1.8, 0.85));
  p.push(shape('M30,102 L42,100 L44,108 L32,110 Z', 'url(#lt)', '#2e160c', 1.4));
  p.push(ellipse(SACRIEUR_HAND[0], SACRIEUR_HAND[1] + 2, 8, 7.5, 'url(#sk)', SKIN_INK));

  // Tête : menton en avant, oreille vers l'arrière.
  p.push(ellipse(92, 48, 5.5, 7.5, 'url(#skB)', SKIN_INK));
  p.push(shape('M46,46 C44,26 58,16 72,17 C88,18 96,30 94,46 C93,58 86,66 74,68 L60,70 C52,68 47,58 46,46 Z', 'url(#sk)', SKIN_INK));
  p.push(gloss(60, 26, 9, 4, -20, 0.35));
  // yeux en amande, regard furieux
  p.push(`<path d="M50,44 Q56,39 63,43 Q57,48 50,44 Z" fill="#fff" stroke="${SKIN_INK}" stroke-width="1.2"/>`);
  p.push(`<circle cx="56.5" cy="43.6" r="2.5" fill="#2a120a"/><circle cx="57.3" cy="42.8" r="0.8" fill="#fff"/>`);
  p.push(`<path d="M70,42 Q75,38 80,42 Q75,46 70,42 Z" fill="#fff" stroke="${SKIN_INK}" stroke-width="1.2"/>`);
  p.push(`<circle cx="74.6" cy="42.2" r="2.2" fill="#2a120a"/>`);
  p.push(line('M47,36 L64,40 M69,39 L82,34', '#3e1206', 3.4));
  p.push(line('M51,50 Q48,54 52,56', '#a8582e', 1.6));
  // rictus : dents serrées et canine
  p.push(shape('M50,60 Q58,65 68,59 Q60,63 50,60 Z', '#fffaf0', SKIN_INK, 1.4));
  p.push(`<path d="M54,61 l1.5,3.5 l1.5,-3" fill="#fffaf0" stroke="${SKIN_INK}" stroke-width="0.8"/>`);
  p.push(line('M58,61.6 L58,63.6 M62,61.4 L62,63.4', SKIN_INK, 0.9));
  // marques tribales sur le visage + balafre
  p.push(line('M64,50 Q70,52 72,58 M80,48 Q84,52 84,58', TATTOO, 1.8, 0.85));
  p.push(line('M82,26 L88,36', '#b0343c', 2));
  p.push(line('M83,30 L86,29 M85,33 L88,32', '#4a0c10', 1));

  // Mèches avant hérissées + bandeau rouge noué.
  p.push(shape('M44,36 L40,22 L50,26 L50,12 L60,20 L66,6 L72,18 L82,8 L84,22 L96,16 L92,30 Q72,22 44,36 Z', 'url(#hr)', '#3e1206'));
  p.push(line('M56,22 Q58,26 56,30 M72,16 Q74,22 70,26', '#6a1e0a', 1.4, 0.8));
  p.push(shape('M44,34 Q70,24 94,30 L94,36 Q70,30 45,40 Z', 'url(#bl)', '#3a0c12'));
  p.push(shape('M94,32 Q108,26 118,34 Q108,36 114,46 Q104,40 95,37 Z', 'url(#bl)', '#3a0c12'));

  return svg(SACRIEUR_W, SACRIEUR_H, defs, p.join('\n'));
}

/** Épée grossière du Sacrieur (verticale, pointe en haut). Poignée en SWORD_GRIP. */
export const SWORD_W = 40;
export const SWORD_H = 96;
export const SWORD_GRIP: [number, number] = [20, 74];

export function sacrieurSwordSvg(): string {
  const defs = cel('bladeG', '#c4d0da', 'horiz') + cel('guardG', '#b07a30', 'vert');
  const b = [
    shape('M15,64 L13,22 Q14,8 22,2 Q29,10 28,24 L26,64 Z', 'url(#bladeG)', '#2e3a46'),
    line('M17,58 L17,16', '#ffffff', 1.6, 0.8),
    shape('M13,38 L17,41 L13,44 Z', '#7a8a98', '#2e3a46', 1.2),
    shape('M8,62 Q20,58 33,62 L32,68 Q20,65 9,68 Z', 'url(#guardG)', '#4a300c'),
    shape('M16,68 L25,68 L25,86 L16,86 Z', LEATHER, '#2e160c'),
    line('M16,72 L25,74 M16,77 L25,79 M16,82 L25,84', '#2e160c', 1.2),
    ellipse(20.5, 89, 5, 4.5, 'url(#guardG)', '#4a300c', 1.6),
  ].join('');
  return svg(SWORD_W, SWORD_H, defs, b);
}
