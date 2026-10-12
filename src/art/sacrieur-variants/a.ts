import { ellipse as kEllipse, eye, ink as kInk, line, shape as kShape, smoothPath, svg, tube as kTube, vgrad } from '../kit';

// Ce dessin garde son trait d'origine (contours épais et colorés), choisi par Enzo.
const W = 3;
const ink = (fill: string, k = -0.55) => kInk(fill, k);
const shape = (d: string, fill: string, outline = ink(fill), w = W) => kShape(d, fill, outline, w);
const ellipse = (cx: number, cy: number, rx: number, ry: number, fill: string, outline = ink(fill), w = W) => kEllipse(cx, cy, rx, ry, fill, outline, w);
const tube = (pts: [number, number][], width: number, fill: string, outline = ink(fill)) => kTube(pts, width, fill, outline, W);

/**
 * Le Sacrieur (mâle), couleurs par défaut de la classe (DofusDB) :
 * peau #e59b68, cheveux orangés, tissus olive / bordeaux / brun.
 * Berserker torse nu, couturé de cicatrices, bandeau rouge.
 * Point d'ancrage (pieds) : (70, 160).
 */
const SKIN = '#e59b68';
const SKIN_SH = '#c97c4c';
const HAIR = '#de6a26';
const HAIR_HI = '#f59a45';
const OLIVE = '#7e752a';
const BLOOD = '#852a34';
const LEATHER = '#76422c';
const SCAR = '#a3333a';

export const SACRIEUR_W = 140;
export const SACRIEUR_H = 170;
export const SACRIEUR_FOOT: [number, number] = [70, 160];
/** Poing qui tient l'arme (coordonnées du SVG). Ce dessin regarde vers la DROITE. */
export const SACRIEUR_HAND: [number, number] = [100, 123];
export const SACRIEUR_FACES_LEFT = false;

export function sacrieurSvg(): string {
  const defs = [
    vgrad('sk', '#f1b285', SKIN_SH),
    vgrad('hr', HAIR_HI, '#b84a16'),
    vgrad('ol', '#958a37', '#5f5820'),
    vgrad('bl', '#a33642', '#6a1f28'),
  ].join('');

  const backArm = tube([[48, 92], [38, 108], [40, 124]], 11, SKIN_SH, ink(SKIN));
  const backFist = ellipse(41, 126, 7, 6.5, SKIN_SH, ink(SKIN));

  // Jambes : pantalon olive puis bandes de cuir et pieds.
  const legs = [
    shape('M54,118 L50,145 Q58,149 66,145 L69,122 Z', 'url(#ol)', ink(OLIVE)),
    shape('M72,122 L75,145 Q83,149 91,145 L88,117 Z', 'url(#ol)', ink(OLIVE)),
    shape('M50,141 L49,154 Q58,158 66,154 L66,141 Q58,145 50,141 Z', LEATHER),
    shape('M75,141 L75,154 Q83,158 92,154 L91,141 Q83,145 75,141 Z', LEATHER),
    line('M51,146 Q58,149 65,146 M51,150 Q58,153 65,150', ink(LEATHER, -0.3), 1.5),
    line('M76,146 Q83,149 90,146 M76,150 Q83,153 90,150', ink(LEATHER, -0.3), 1.5),
    ellipse(56, 157, 10, 4.5, '#5a3020'),
    ellipse(85, 157, 10, 4.5, '#5a3020'),
  ].join('');

  // Torse en V, musclé, couvert de cicatrices recousues.
  const torso = [
    shape('M46,86 C50,74 90,74 95,86 L91,113 C86,124 55,124 50,113 Z', 'url(#sk)', ink(SKIN)),
    line('M56,93 Q63,100 70,95 Q77,100 85,93', ink(SKIN, -0.25), 2, 0.8),
    line('M64,104 L64,110 M76,104 L76,110 M70,102 L70,113', ink(SKIN, -0.25), 1.6, 0.55),
    // cicatrice principale + points de couture
    line('M56,108 L84,86', SCAR, 2.6),
    line('M60,101 L63,107 M66,97 L69,103 M72,92 L75,98 M78,88 L81,94', '#5c1418', 1.5),
    // tatouage tribal sur l'épaule
    line('M86,82 Q92,86 90,94 M88,84 Q86,90 89,96', BLOOD, 2, 0.9),
  ].join('');

  // Ceinture-écharpe bordeaux avec un pan qui pend.
  const sash = [
    shape('M48,111 Q70,121 93,111 L94,121 Q70,132 47,121 Z', 'url(#bl)', ink(BLOOD)),
    shape('M84,121 Q92,134 87,146 L80,144 Q83,133 77,124 Z', 'url(#bl)', ink(BLOOD)),
    ellipse(70, 121, 5, 4.5, '#d9a441', '#7a5418', 2),
  ].join('');

  const frontArm = tube([[93, 90], [104, 106], [100, 121]], 12, SKIN, ink(SKIN));
  const frontFist = ellipse(100, 123, 7.5, 7, SKIN, ink(SKIN));
  const wrist = shape('M93,114 L106,114 L105,119 L94,119 Z', LEATHER, ink(LEATHER), 2);

  // Tête : grosse, ronde, de trois quarts vers la droite.
  const headTails = shape('M40,44 Q26,36 15,44 Q25,47 17,58 Q30,54 41,53 Z', 'url(#bl)', ink(BLOOD));
  const head = [
    ellipse(42, 58, 6, 8, SKIN_SH, ink(SKIN)),
    shape(
      'M39,52 C38,30 56,22 72,23 C92,24 104,36 103,54 C102,70 94,82 76,84 C58,86 41,76 39,52 Z',
      'url(#sk)',
      ink(SKIN),
    ),
    // joues
    `<ellipse cx="92" cy="66" rx="6" ry="3.5" fill="#e8705a" opacity="0.35"/>`,
    eye(69, 57, 4.2, 5.8),
    eye(89, 56, 3.8, 5.5),
    // sourcils froncés (berserker)
    line('M60,46 L75,51', '#7a2d10', 4),
    line('M83,50 L96,45', '#7a2d10', 4),
    // nez
    line('M82,62 Q86,65 82,67', ink(SKIN, -0.3), 2),
    // rictus avec dents
    shape('M70,72 Q81,79 92,70 Q82,74 70,72 Z', '#fff7ee', ink(SKIN, -0.4), 2),
    line('M76,73.5 L76,76 M82,74 L82,76.5 M87,72.5 L87,75', ink(SKIN, -0.4), 1.1),
    // balafre recousue sur la joue
    line('M55,61 L62,72', SCAR, 2.2),
    line('M56,66 L60,64 M58,69 L62,67', '#5c1418', 1.3),
  ].join('');

  // Bandeau rouge + cheveux hérissés.
  const hair = shape(
    smoothPath([
      [38, 50], [34, 36], [26, 30], [40, 28], [38, 16], [52, 22], [56, 8], [66, 19], [76, 6], [82, 20], [96, 12], [94, 27], [108, 28], [100, 38], [104, 48],
    ]) + ' Q72,30 38,50 Z',
    'url(#hr)',
    ink(HAIR, -0.6),
  );
  const hairLines = line('M54,24 Q58,30 56,36 M74,18 Q76,26 72,32 M90,24 Q88,30 92,36', '#a8410f', 1.6, 0.8);
  const band = shape('M38,47 Q70,32 104,43 L104,51 Q70,40 39,55 Z', 'url(#bl)', ink(BLOOD));

  const body = [backArm, backFist, legs, torso, sash, frontArm, wrist, frontFist, headTails, head, hair, hairLines, band].join('\n');
  return svg(SACRIEUR_W, SACRIEUR_H, defs, body);
}

/** Épée grossière du Sacrieur. Poignée (point de prise) en (20, 74). */
export const SWORD_W = 40;
export const SWORD_H = 96;
export const SWORD_GRIP: [number, number] = [20, 74];

export function sacrieurSwordSvg(): string {
  const defs = vgrad('bladeG', '#eef3f7', '#9fb0bf');
  const body = [
    shape('M15,64 L13,22 Q14,8 22,2 Q29,10 28,24 L26,64 Z', 'url(#bladeG)', '#465565'),
    line('M20,60 L20,14', '#ffffff', 2, 0.7),
    // encoches de lame usée
    shape('M13,38 L17,41 L13,44 Z', '#8a9aa8', '#465565', 1.5),
    shape('M8,62 Q20,58 33,62 L32,68 Q20,65 9,68 Z', '#a8742e', '#4f3510'),
    shape('M16,68 L25,68 L25,86 L16,86 Z', LEATHER),
    line('M16,72 L25,74 M16,77 L25,79 M16,82 L25,84', '#3f2114', 1.5),
    ellipse(20.5, 89, 5, 4.5, '#a8742e', '#4f3510', 2),
  ].join('');
  return svg(SWORD_W, SWORD_H, defs, body);
}
