import { ellipse, ink, line, shape, svg, tube, vgrad, rgrad } from './kit';

/**
 * Kardorim, boss de la crypte (d'après l'illustration DofusDB) :
 * colosse en armure, casque à cornes, grand bouclier rond, épée à lueur verte.
 * Point d'ancrage (pieds) : (85, 182).
 */
export const KARDORIM_W = 180;
export const KARDORIM_H = 192;
export const KARDORIM_FOOT: [number, number] = [85, 182];

const SKIN = '#9aa592'; // peau grise-verte de mort-vivant
const METAL = '#b8ab8a';
const GOLD = '#d9a62a';
const CLOTH = '#3f5a3a';
const GLOW = '#9dff6a';

export function kardorimSvg(): string {
  const defs = [
    vgrad('kSkin', '#b6c0ad', '#76826e'),
    vgrad('kMetal', '#d9cfb2', '#8a7d5e'),
    vgrad('kCloth', '#557a4e', '#2c4028'),
    vgrad('kBoot', '#5a5560', '#2e2b33'),
    rgrad('kShield', '#e4d9b8', '#9c8d68', 0.4, 0.35),
    `<linearGradient id="kBlade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9ffd8"/><stop offset="0.5" stop-color="${GLOW}"/><stop offset="1" stop-color="#4fbf2a"/></linearGradient>`,
    `<filter id="kGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>`,
  ].join('');

  const p: string[] = [];

  // Épée (derrière, tenue haute) avec halo vert.
  p.push(`<path d="M128,112 L150,26 L162,30 L142,116 Z" fill="${GLOW}" opacity="0.55" filter="url(#kGlow)"/>`);
  p.push(shape('M130,110 L150,28 Q158,22 162,32 L142,114 Z', 'url(#kBlade)', '#2f7a18', 2.5));
  p.push(line('M140,106 L156,34', '#ffffff', 2, 0.8));
  p.push(shape('M122,110 L150,118 L148,126 L120,118 Z', GOLD, ink(GOLD)));
  p.push(shape('M130,120 L140,123 L136,140 L126,137 Z', '#4a3020', '#24160c', 2));

  // Jambes massives + bottes.
  p.push(tube([[70, 140], [66, 162]], 14, SKIN, ink(SKIN)));
  p.push(tube([[100, 140], [104, 162]], 14, SKIN, ink(SKIN)));
  p.push(shape('M50,158 Q66,150 82,158 L83,176 Q66,184 48,178 Z', 'url(#kBoot)', '#1d1b21'));
  p.push(shape('M90,158 Q106,150 122,158 L124,176 Q106,184 88,178 Z', 'url(#kBoot)', '#1d1b21'));
  p.push(line('M50,164 Q66,158 82,164 M90,164 Q106,158 122,164', GOLD, 3.5));

  // Pagne vert.
  p.push(shape('M56,124 L114,124 L120,150 L102,144 L92,156 L80,144 L64,152 L52,146 Z', 'url(#kCloth)', ink(CLOTH)));

  // Bras arrière (bouclier porté devant, à gauche).
  p.push(tube([[56, 92], [44, 112], [50, 124]], 14, '#86917e', ink(SKIN)));

  // Torse cuirassé.
  p.push(shape('M50,90 C54,74 116,74 122,90 L116,128 C104,136 66,136 56,128 Z', 'url(#kSkin)', ink(SKIN)));
  p.push(shape('M60,92 C66,84 106,84 112,92 L108,120 C98,126 74,126 64,120 Z', 'url(#kMetal)', ink(METAL)));
  p.push(line('M86,88 L86,122', ink(METAL, -0.3), 2));
  p.push(line('M66,104 Q86,110 106,104', ink(METAL, -0.3), 2));
  p.push(shape('M74,124 L98,124 L98,132 L74,132 Z', GOLD, ink(GOLD), 2));
  p.push(ellipse(86, 128, 5, 4, '#7a1a14', '#3a0a08', 2));

  // Épaulières.
  p.push(shape('M40,86 Q46,70 66,76 L64,96 Q50,100 40,86 Z', 'url(#kMetal)', ink(METAL)));
  p.push(shape('M132,86 Q126,70 106,76 L108,96 Q122,100 132,86 Z', 'url(#kMetal)', ink(METAL)));
  p.push(`<circle cx="52" cy="84" r="2.5" fill="${GOLD}"/><circle cx="120" cy="84" r="2.5" fill="${GOLD}"/>`);

  // Bras avant tenant l'épée.
  p.push(tube([[118, 94], [128, 110], [132, 120]], 14, SKIN, ink(SKIN)));
  p.push(ellipse(133, 121, 9, 8, SKIN, ink(SKIN)));

  // Tête : visage gris-vert, yeux verts luisants, mâchoire carrée.
  p.push(shape('M60,52 C60,32 112,32 112,52 C112,72 100,80 86,80 C72,80 60,72 60,52 Z', 'url(#kSkin)', ink(SKIN)));
  p.push(`<path d="M68,54 L80,58 L78,63 L69,61 Z" fill="#1d2a18"/><path d="M104,54 L92,58 L94,63 L103,61 Z" fill="#1d2a18"/>`);
  p.push(`<circle cx="75" cy="59" r="2.6" fill="${GLOW}"/><circle cx="97" cy="59" r="2.6" fill="${GLOW}"/>`);
  p.push(`<circle cx="75" cy="59" r="7" fill="${GLOW}" opacity="0.25"/><circle cx="97" cy="59" r="7" fill="${GLOW}" opacity="0.25"/>`);
  p.push(shape('M74,70 L98,70 L96,76 L76,76 Z', '#f2ecd8', ink(SKIN, -0.4), 1.5));
  p.push(line('M80,70 L80,76 M86,70 L86,76 M92,70 L92,76', ink(SKIN, -0.4), 1.1));

  // Casque à cornes + nasal.
  p.push(shape('M56,50 C56,22 116,22 116,50 Q86,40 56,50 Z', 'url(#kMetal)', ink(METAL)));
  p.push(shape('M83,38 L89,38 L88,62 L84,62 Z', 'url(#kMetal)', ink(METAL), 2));
  p.push(line('M58,48 Q86,38 114,48', GOLD, 3.5));
  p.push(shape('M60,38 Q40,34 36,14 Q48,22 64,30 Z', '#f1e6c4', '#7a6a44'));
  p.push(shape('M112,38 Q132,34 136,14 Q124,22 108,30 Z', '#f1e6c4', '#7a6a44'));

  // Grand bouclier rond, devant le bras arrière.
  p.push(ellipse(44, 116, 26, 30, 'url(#kShield)', '#5e5134', 3.5));
  p.push(`<ellipse cx="44" cy="116" rx="19" ry="22" fill="none" stroke="${GOLD}" stroke-width="3"/>`);
  p.push(shape('M44,100 L52,116 L44,132 L36,116 Z', '#7a1a14', '#3a0a08', 2));
  p.push(line('M30,98 Q36,92 44,92', '#ffffff', 2.5, 0.5));

  return svg(KARDORIM_W, KARDORIM_H, defs, `<g transform="translate(0,4)">${p.join('\n')}</g>`);
}
