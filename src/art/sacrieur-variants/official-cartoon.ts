import { cel, ellipse as kEllipse, gloss, ink as kInk, line, shape as kShape, smoothPath, svg, tube as kTube, vgrad } from '../kit';

/**
 * Propositions D et E : la silhouette cartoon du « juste milieu » (C),
 * habillée avec la tenue officielle du Sacrieur (bandana olive à pièce jaune,
 * bras bandés de rouge et moufles, pagne jaune, pantalon olive effiloché, tibias bandés, pieds nus).
 * Regarde vers la DROITE. Pieds en (70, 160).
 */
const W = 2.4;
const ink = (fill: string, k = -0.62) => kInk(fill, k);
const shape = (d: string, fill: string, outline = ink(fill), w = W) => kShape(d, fill, outline, w);
const ellipse = (cx: number, cy: number, rx: number, ry: number, fill: string, outline = ink(fill), w = W) => kEllipse(cx, cy, rx, ry, fill, outline, w);

type Pt = [number, number];
interface Opts {
  skin: string;
  hair: string;
  whiteEyes: boolean;
  snarl: boolean;
  armW: number;
}

function wrapped(pts: Pt[], width: number, step = 8): string {
  const o: string[] = [kTube(pts, width, 'url(#wrap)', '#3a0a10', W)];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const ux = (x1 - x0) / len, uy = (y1 - y0) / len, nx = -uy, ny = ux;
    for (let t = step * 0.6; t < len - 2; t += step) {
      const cx = x0 + ux * t, cy = y0 + uy * t, h = width / 2 - 0.5;
      o.push(`<path d="M${(cx + nx * h - ux * 1.5).toFixed(1)},${(cy + ny * h - uy * 1.5).toFixed(1)} L${(cx - nx * h + ux * 1.5).toFixed(1)},${(cy - ny * h + uy * 1.5).toFixed(1)}" stroke="url(#skS)" stroke-width="3.4"/>`);
    }
  }
  return o.join('');
}

function build(o: Opts): string {
  const SKIN = o.skin;
  const defs = [
    cel('sk', SKIN, 'diag'),
    cel('skS', SKIN, 'horiz'),
    cel('hr', o.hair, 'diag'),
    cel('cap', '#6f7a2c', 'diag'),
    cel('wrap', '#9a2432', 'diag'),
    cel('cloth', '#e6a02a', 'vert'),
    cel('ol', '#7a8838', 'horiz'),
    vgrad('mit', '#c0343f', '#7a1622'),
  ].join('');
  const SK_INK = ink(SKIN);

  const backArm = wrapped([[45, 90], [36, 108], [40, 123]], o.armW - 1);
  const backFist = ellipse(41, 126, 7.5, 7, 'url(#mit)', '#3a0a10');

  // Jambes : pantalon olive ample à l'ourlet effiloché, tibias bandés, pieds nus.
  const legs = [
    shape('M54,108 L49,140 L53,144 L56,140 L60,145 L64,140 L67,143 L69,112 Z', 'url(#ol)', '#2e3410'),
    shape('M72,112 L74,140 L78,144 L81,139 L85,145 L88,139 L92,143 L88,107 Z', 'url(#ol)', '#2e3410'),
    `<g fill="#a8423a"><circle cx="61" cy="122" r="1.3"/><circle cx="59" cy="128" r="1.3"/><circle cx="58" cy="134" r="1.3"/></g>`,
    wrapped([[57, 141], [57, 153]], 10, 5.5),
    wrapped([[83, 141], [83, 153]], 10, 5.5),
    shape('M47,153 Q57,150 66,154 Q67,159 61,159 L48,158 Q45,156 47,153 Z', 'url(#sk)', SK_INK),
    shape('M76,153 Q86,150 95,154 Q96,159 90,159 L77,158 Q74,156 76,153 Z', 'url(#sk)', SK_INK),
    line('M50,157 l0,1.5 M53,157 l0,1.5 M90,157 l0,1.5 M93,157 l0,1.5', SK_INK, 0.9),
  ].join('');

  // Torse en V musclé, marque rouge en cœur.
  const torso = [
    shape('M42,86 C46,72 94,72 99,86 L92,113 C86,124 55,124 50,113 Z', 'url(#sk)', SK_INK),
    line('M46,84 Q56,78 66,82', '#fff', 2, 0.25),
    line('M56,93 Q63,100 70,95 Q77,100 85,93', ink(SKIN, -0.25), 2, 0.8),
    line('M64,104 L64,110 M76,104 L76,110 M70,102 L70,113', ink(SKIN, -0.25), 1.6, 0.55),
    `<path d="M76,86 q-3.5,-5 -7,-1 q-2,5 7,10 q9,-5 7,-10 q-3.5,-4 -7,1 Z" fill="#b8243a" stroke="#5a0a14" stroke-width="1.2"/>`,
  ].join('');

  // Pagne jaune déchiqueté + nœud de cuir.
  const sash = [
    shape('M47,110 Q70,118 94,110 L95,122 L89,120 L87,128 L81,121 L75,130 L70,121 L63,129 L60,120 L53,125 L47,121 Z', 'url(#cloth)', '#6a4208'),
    shape('M66,114 Q72,110 76,116 Q72,121 66,118 Z', '#6a3a1a', '#2a1408', 1.8),
    shape('M68,118 Q66,130 70,138 L74,136 Q71,128 73,119 Z', '#6a3a1a', '#2a1408', 1.8),
  ].join('');

  const frontArm = wrapped([[95, 88], [106, 106], [100, 120]], o.armW);
  const frontFist = ellipse(100, 123, 8, 7.5, 'url(#mit)', '#3a0a10');

  // Tête : oreille pointue vers l'arrière (à gauche), bandana olive, mèches qui dépassent.
  const ear = shape('M44,56 Q30,46 24,38 Q32,56 42,64 Z', 'url(#sk)', SK_INK);
  const hairBack = shape('M40,48 L28,52 L36,56 L26,64 L40,62 L36,70 L46,64 Z', 'url(#hr)', ink(o.hair, -0.6));
  const capTails = shape('M40,42 Q26,34 16,40 Q26,44 18,54 Q30,50 41,50 Z', 'url(#cap)', '#2a3008');
  const head = [
    shape('M39,50 C38,30 56,22 72,23 C92,24 104,36 103,52 C103,64 99,74 92,80 L80,86 C64,88 45,78 39,50 Z', 'url(#sk)', SK_INK),
    o.whiteEyes
      ? `<path d="M62,57 Q69,50 77,55 Q70,61 62,57 Z" fill="#fff" stroke="#5a2a14" stroke-width="1.4"/><path d="M84,55 Q89,49 96,53 Q90,58 84,55 Z" fill="#fff" stroke="#5a2a14" stroke-width="1.4"/>`
      : `<path d="M62,57 Q69,50 77,55 Q70,61 62,57 Z" fill="#fff" stroke="#5a2a14" stroke-width="1.4"/><circle cx="70.5" cy="56" r="2.7" fill="#2a120a"/><circle cx="71.3" cy="55.1" r="0.9" fill="#fff"/><path d="M84,55 Q89,49 96,53 Q90,58 84,55 Z" fill="#fff" stroke="#5a2a14" stroke-width="1.4"/><circle cx="90.3" cy="54" r="2.4" fill="#2a120a"/>`,
    line('M57,48 L77,54', '#5a1e08', 5),
    line('M82,53 L99,46', '#5a1e08', 5),
    line('M63,64 L74,63 M65,67 L73,66.5', '#b8243a', 2.4, 0.95),
    line('M88,61 L97,59', '#b8243a', 2.2, 0.95),
    line('M82,62 Q86,65 82,67', ink(SKIN, -0.3), 2),
    o.snarl
      ? [
          shape('M69,71 Q81,82 94,69 Q82,75 69,71 Z', '#4a1410', ink(SKIN, -0.5), 2),
          shape('M71,72 Q81,77 92,70.5 L91,73 Q81,78 72,74 Z', '#fff7ee', ink(SKIN, -0.5), 1),
          `<path d="M75,73.5 l1.6,4 l1.6,-3.6 Z M87,72.5 l1.4,3.6 l1.4,-3.8 Z" fill="#fff7ee" stroke="#5a2a14" stroke-width="0.8"/>`,
        ].join('')
      : line('M72,73 Q81,70 91,72', '#5a2a14', 2),
  ].join('');
  // mèches en épis qui dépassent devant et au-dessus du bandana
  const hairFront = [
    shape('M96,40 L108,44 L100,48 L106,56 L96,52 Z', 'url(#hr)', ink(o.hair, -0.6)),
    shape(smoothPath([[52, 26], [48, 10], [60, 20], [64, 4], [72, 18], [84, 6], [84, 20], [98, 14], [92, 28]]) + ' Z', 'url(#hr)', ink(o.hair, -0.6)),
  ].join('');
  const cap = [
    shape(smoothPath([[37, 50], [40, 32], [54, 20], [72, 17], [92, 21], [104, 36], [104, 46]]) + ' Q72,34 37,50 Z', 'url(#cap)', '#2a3008'),
    line('M40,47 Q72,32 103,44', '#4a5418', 2, 0.8),
    ellipse(70, 28, 10, 7, '#e8c040', '#7a5a08', 1.6),
    `<g fill="#6a3a1a"><circle cx="62" cy="26" r="1.4"/><circle cx="66" cy="22.5" r="1.4"/><circle cx="74" cy="22.5" r="1.4"/><circle cx="78" cy="27" r="1.4"/><circle cx="74" cy="33" r="1.4"/><circle cx="65" cy="33" r="1.4"/></g>`,
  ].join('');
  const shine = [gloss(52, 28, 8, 3, -25, 0.4), gloss(54, 82, 8, 3, -15, 0.35)].join('');

  const headGroup = `<g transform="translate(70,84) scale(0.85) translate(-70,-84)">${[ear, hairBack, capTails, head, hairFront, cap, shine].join('\n')}</g>`;
  const upper = `<g transform="translate(0,-10)">${[backArm, backFist, torso, sash, frontArm, frontFist, headGroup].join('\n')}</g>`;
  return svg(140, 170, defs, [legs, upper].join('\n'));
}

/** D : fidèle à la tenue officielle — yeux blancs, bouche fermée, cheveux blond-orangé. */
export const variantD = () => build({ skin: '#e8ac78', hair: '#eba23a', whiteEyes: true, snarl: false, armW: 12 });
/** E : même tenue, plus « berserker » — pupilles, rictus, crinière rousse, bras plus épais. */
export const variantE = () => build({ skin: '#e59b68', hair: '#d9662a', whiteEyes: false, snarl: true, armW: 14 });
