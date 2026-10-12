import { cel, ellipse as kEllipse, gloss, ink as kInk, line, shape as kShape, smoothPath, svg, tube as kTube, vgrad } from './kit';

/**
 * Le Sacrieur (mâle), d'après l'illustration officielle de la classe (dofus.com) :
 * bandana olive noué avec une pièce jaune cousue, cheveux blond-orangé en épis, oreilles pointues,
 * yeux blancs sans pupille, peintures de guerre rouges, corps fin et athlétique,
 * marque rouge en cœur sur la poitrine, bras entièrement bandés de rayures rouges et moufles rouges,
 * pagne jaune déchiqueté avec nœud de cuir, pantalon olive ample et effiloché,
 * tibias bandés de rouge, pieds nus. De trois quarts, tourné vers la GAUCHE.
 */
const W = 2.2;
const ink = (fill: string, k = -0.62) => kInk(fill, k);
const shape = (d: string, fill: string, outline = ink(fill), w = W) => kShape(d, fill, outline, w);
const ellipse = (cx: number, cy: number, rx: number, ry: number, fill: string, outline = ink(fill), w = W) => kEllipse(cx, cy, rx, ry, fill, outline, w);

const SKIN = '#e8ac78';
const SKIN_INK = '#6a3a1c';
const HAIR = '#eba23a';
const CAP = '#6f7a2c';
const PATCH = '#e8c040';
const WRAP = '#9a2432';
const CLOTH = '#e6a02a';
const PANTS = '#7a8838';
const LEATHER = '#6a3a1a';

export const SACRIEUR_W = 150;
export const SACRIEUR_H = 200;
export const SACRIEUR_FOOT: [number, number] = [74, 190];
/** Poing qui tient l'arme (coordonnées du SVG). */
export const SACRIEUR_HAND: [number, number] = [38, 124];
export const SACRIEUR_FACES_LEFT = true;

type Pt = [number, number];

/** Membre bandé : tube rouge zébré de bandes couleur peau, perpendiculaires au membre. */
function wrapped(pts: Pt[], width: number, step = 9): string {
  const o: string[] = [kTube(pts, width, 'url(#wrap)', '#3a0a10', W)];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const ux = (x1 - x0) / len, uy = (y1 - y0) / len, nx = -uy, ny = ux;
    for (let t = step * 0.6; t < len - 2; t += step) {
      const cx = x0 + ux * t, cy = y0 + uy * t, h = width / 2 - 0.6;
      // bande légèrement inclinée, comme un bandage enroulé
      o.push(`<path d="M${(cx + nx * h - ux * 1.2).toFixed(1)},${(cy + ny * h - uy * 1.2).toFixed(1)} L${(cx - nx * h + ux * 1.2).toFixed(1)},${(cy - ny * h + uy * 1.2).toFixed(1)}" stroke="url(#sk)" stroke-width="3.8" stroke-linecap="butt" opacity="0.92"/>`);
    }
  }
  return o.join('');
}

export function sacrieurSvg(): string {
  const defs = [
    cel('sk', SKIN, 'diag'),
    cel('skB', '#cf8e5c', 'diag'),
    cel('hr', HAIR, 'diag'),
    cel('cap', CAP, 'diag'),
    cel('wrap', WRAP, 'diag'),
    cel('cloth', CLOTH, 'vert'),
    cel('pants', PANTS, 'horiz'),
    vgrad('mit', '#b8303e', '#7a1622'),
  ].join('');
  const p: string[] = [];

  // --- Arrière-plan : nœud du bandana, bras arrière, jambe arrière ---
  p.push(shape('M92,26 Q106,18 116,22 Q108,26 112,34 Q102,30 94,34 Z', 'url(#cap)', '#2a3008'));
  p.push(shape('M96,30 Q110,34 118,44 Q106,42 98,38 Z', 'url(#cap)', '#2a3008'));

  p.push(wrapped([[92, 76], [100, 98], [98, 118]], 10));
  p.push(ellipse(98, 123, 7, 7.5, 'url(#mit)', '#3a0a10'));

  // jambe arrière : pantalon ample effiloché, bandage rouge, pied nu
  p.push(shape('M78,122 L96,120 Q102,140 100,158 L104,166 L97,163 L94,168 L89,162 L84,166 Q84,142 78,122 Z', 'url(#pants)', '#2e3410'));
  p.push(wrapped([[93, 164], [94, 180]], 9, 6.5));
  p.push(shape('M88,180 Q96,178 104,183 Q106,188 100,188 L88,187 Z', 'url(#skB)', SKIN_INK));

  // --- Torse fin et athlétique ---
  p.push(shape('M54,74 C58,66 90,66 94,76 L90,98 Q88,110 84,116 L62,116 Q58,106 58,96 Z', 'url(#sk)', SKIN_INK));
  p.push(line('M60,84 Q68,90 76,86 Q82,90 88,84', '#b26a3c', 1.6, 0.8));
  p.push(line('M68,96 L68,104 M76,96 L76,106 M68,108 Q72,111 77,108', '#b26a3c', 1.3, 0.6));
  p.push(gloss(66, 76, 8, 3, -12, 0.35));
  // marque rouge en cœur (signature du Sacrieur)
  p.push(`<path d="M68,82 q-3,-4 -6,-1 q-2,4 6,9 q8,-5 6,-9 q-3,-3 -6,1 Z" fill="#b8243a" stroke="#5a0a14" stroke-width="1"/>`);

  // --- Pagne jaune déchiqueté + nœud de cuir ---
  p.push(shape('M56,110 Q74,104 92,110 L94,122 L88,120 L86,130 L80,123 L74,134 L70,123 L64,131 L62,121 L55,126 Z', 'url(#cloth)', '#6a4208'));
  p.push(`<circle cx="68" cy="116" r="1.6" fill="${LEATHER}"/><circle cx="84" cy="115" r="1.6" fill="${LEATHER}"/>`);
  p.push(shape('M70,112 Q76,108 80,114 Q76,119 70,116 Z', LEATHER, '#2a1408'));
  p.push(shape('M72,116 Q70,128 74,136 L78,134 Q75,126 77,117 Z', LEATHER, '#2a1408'));

  // --- Jambe avant ---
  p.push(shape('M58,122 L80,124 Q76,146 70,158 L74,166 L66,163 L62,169 L57,162 L50,166 Q52,142 58,122 Z', 'url(#pants)', '#2e3410'));
  p.push(line('M64,132 Q66,144 62,154', '#4a5420', 1.4, 0.7));
  p.push(`<g fill="#a8423a"><circle cx="70" cy="140" r="1.4"/><circle cx="66" cy="146" r="1.4"/><circle cx="62" cy="152" r="1.4"/></g>`);
  p.push(wrapped([[60, 164], [59, 181]], 9.5, 6.5));
  p.push(shape('M50,182 Q58,178 66,182 Q68,190 62,190 L48,189 Q46,184 50,182 Z', 'url(#sk)', SKIN_INK));
  p.push(line('M51,187 l0,2 M54,187 l0,2 M57,187 l0,2', SKIN_INK, 0.9));

  // --- Bras avant, bandé, moufle rouge qui tient l'arme ---
  p.push(wrapped([[58, 76], [48, 100], [40, 118]], 10.5));
  p.push(ellipse(SACRIEUR_HAND[0], SACRIEUR_HAND[1], 7.5, 8, 'url(#mit)', '#3a0a10'));
  p.push(gloss(35, 120, 2.6, 1.6, -30, 0.5));

  // --- Tête ---
  // oreille pointue (vers l'arrière)
  p.push(shape('M86,40 Q100,30 104,24 Q100,40 90,50 Z', 'url(#skB)', SKIN_INK));
  // mèches arrière (sous le bandana, derrière l'oreille)
  p.push(shape('M88,48 L100,54 L92,58 L98,66 L86,62 Z', 'url(#hr)', '#7a4408'));
  // visage : menton pointu vers l'avant-gauche
  p.push(shape('M50,40 C50,28 60,22 72,22 C84,22 92,30 90,44 C89,54 82,62 72,66 L60,68 C54,64 50,54 50,40 Z', 'url(#sk)', SKIN_INK));
  // yeux blancs sans pupille, en amande, regard dur
  p.push(`<path d="M54,42 Q60,36 67,40 Q61,46 54,42 Z" fill="#fff" stroke="${SKIN_INK}" stroke-width="1.4"/>`);
  p.push(`<path d="M73,40 Q78,35 83,38 Q79,43 73,40 Z" fill="#fff" stroke="${SKIN_INK}" stroke-width="1.4"/>`);
  p.push(line('M52,36 L67,38 M72,37 L84,33', '#5a2a0c', 3));
  // peintures de guerre rouges sur la joue
  p.push(line('M58,49 L66,47 M60,53 L67,51', '#b8243a', 2.4));
  p.push(line('M80,46 L85,45', '#b8243a', 2.2));
  // nez, bouche serrée
  p.push(line('M56,46 Q53,52 57,53', '#a85e30', 1.4));
  p.push(line('M58,60 Q63,58 68,59', SKIN_INK, 1.6));
  // mèches avant en épis
  p.push(shape('M50,32 L44,40 L50,38 L46,48 L54,40 Z', 'url(#hr)', '#7a4408'));
  p.push(shape('M76,12 L80,2 L84,12 L94,6 L92,16 Z', 'url(#hr)', '#7a4408'));

  // bandana olive + pièce jaune cousue
  p.push(shape(smoothPath([[48, 34], [50, 20], [62, 10], [78, 9], [92, 16], [96, 30]]) + ' Q72,24 48,34 Z', 'url(#cap)', '#2a3008'));
  p.push(line('M50,32 Q72,22 95,28', '#4a5418', 2, 0.8));
  p.push(ellipse(70, 18, 9, 6.5, PATCH, '#7a5a08', 1.6));
  p.push(`<g fill="${LEATHER}"><circle cx="63" cy="16" r="1.3"/><circle cx="67" cy="13" r="1.3"/><circle cx="74" cy="13" r="1.3"/><circle cx="78" cy="17" r="1.3"/><circle cx="74" cy="23" r="1.3"/><circle cx="66" cy="23" r="1.3"/></g>`);
  p.push(gloss(58, 14, 6, 2.4, -25, 0.4));

  return svg(SACRIEUR_W, SACRIEUR_H, defs, p.join('\n'));
}

/** Épée grossière du Sacrieur (verticale, pointe en haut). Poignée en SWORD_GRIP. */
export const SWORD_W = 40;
export const SWORD_H = 96;
export const SWORD_GRIP: [number, number] = [20, 74];

export function sacrieurSwordSvg(): string {
  const defs = vgrad('bladeG', '#eef3f7', '#9fb0bf');
  const body = [
    shape('M15,64 L13,22 Q14,8 22,2 Q29,10 28,24 L26,64 Z', 'url(#bladeG)', '#465565'),
    line('M20,60 L20,14', '#ffffff', 2, 0.7),
    shape('M13,38 L17,41 L13,44 Z', '#8a9aa8', '#465565', 1.5),
    shape('M8,62 Q20,58 33,62 L32,68 Q20,65 9,68 Z', '#a8742e', '#4f3510'),
    shape('M16,68 L25,68 L25,86 L16,86 Z', LEATHER),
    line('M16,72 L25,74 M16,77 L25,79 M16,82 L25,84', '#3f2114', 1.5),
    ellipse(20.5, 89, 5, 4.5, '#a8742e', '#4f3510', 2),
  ].join('');
  return svg(SWORD_W, SWORD_H, defs, body);
}
