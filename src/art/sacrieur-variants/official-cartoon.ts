import { gloss, ink as kInk, line, shape as kShape, smoothPath, svg, vgrad } from '../kit';
import { shade } from '../../svg';

/**
 * Propositions D et E (version finie) : silhouette cartoon, tenue officielle du Sacrieur.
 * Trait uniforme, membres effilés, bandages enroulés en diagonale, ombres douces.
 * Regarde vers la DROITE. Pieds en (70, 160).
 */
const W = 2.2; // épaisseur unique du contour extérieur
const D = 1.3; // épaisseur des détails intérieurs
const ink = (fill: string, k = -0.62) => kInk(fill, k);
const shape = (d: string, fill: string, outline = ink(fill), w = W) => kShape(d, fill, outline, w);

type Pt = [number, number];
interface Opts {
  skin: string;
  hair: string;
  whiteEyes: boolean;
  snarl: boolean;
  arm: number; // largeur des bras à l'épaule
  armStyle?: 'full' | 'slim' | 'forearm' | 'bands' | 'spiral';
}

const WRAP = '#a3283a';
const WRAP_INK = '#4a0c16';
const CAP = '#6f7a2c';
const CAP_INK = '#2e3410';
const CLOTH = '#e8a42c';
const PANTS = '#7a8838';

/** Contour d'un membre effilé (largeur w0 à la racine, w1 à l'extrémité). */
function taper(pts: Pt[], w0: number, w1: number): string {
  const n = pts.length;
  const L: Pt[] = [], R: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
    const nx = -dy / m, ny = dx / m, h = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
    L.push([pts[i][0] + nx * h, pts[i][1] + ny * h]);
    R.push([pts[i][0] - nx * h, pts[i][1] - ny * h]);
  }
  const r = smoothPath([...R].reverse()).replace(/^M/, ' L');
  // départ arrondi (épaule) : demi-cercle de R[0] à L[0]
  const h0 = w0 / 2;
  return `${smoothPath(L)}${r} A${h0},${h0} 0 0 0 ${L[0][0].toFixed(1)},${L[0][1].toFixed(1)} Z`;
}

let uid = 0;
/** Membre bandé : rouge, bandes claires enroulées en diagonale (découpées dans la forme), contour net. */
function bandaged(pts: Pt[], w0: number, w1: number, skin: string, step = 7, slant = 5): string {
  const id = `cl${uid++}`;
  const d = taper(pts, w0, w1);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs) - 12, x1 = Math.max(...xs) + 12, y0 = Math.min(...ys) - 12, y1 = Math.max(...ys) + 12;
  const stripes: string[] = [];
  for (let y = y0; y < y1; y += step) stripes.push(`M${x0},${y} L${x1},${y + slant}`);
  return [
    `<clipPath id="${id}"><path d="${d}"/></clipPath>`,
    `<path d="${d}" fill="url(#wrap)"/>`,
    `<g clip-path="url(#${id})"><path d="${stripes.join(' ')}" stroke="${shade(skin, -0.12)}" stroke-width="2.6" opacity="0.9"/>
       <path d="${stripes.join(' ')}" transform="translate(0,1.3)" stroke="${WRAP_INK}" stroke-width="0.8" opacity="0.5"/>
       <path d="${d}" fill="url(#limbShade)"/></g>`,
    `<path d="${d}" fill="none" stroke="${WRAP_INK}" stroke-width="${W}" stroke-linejoin="round"/>`,
  ].join('');
}

/** Membre générique : base (peau ou bandage), bandes optionnelles découpées dans la forme, contour net. */
function limb(pts: Pt[], w0: number, w1: number, base: string, inkC: string, stripes?: { color: string; step: number; width: number; slant: number; from?: number }): string {
  const id = `cl${uid++}`;
  const d = taper(pts, w0, w1);
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  const x0 = Math.min(...xs) - 12, x1 = Math.max(...xs) + 12, y1 = Math.max(...ys) + 12;
  const y0 = stripes?.from ?? Math.min(...ys) - 12;
  const lines: string[] = [];
  if (stripes) for (let y = y0; y < y1; y += stripes.step) lines.push(`M${x0},${y} L${x1},${y + stripes.slant}`);
  return [
    `<clipPath id="${id}"><path d="${d}"/></clipPath>`,
    `<path d="${d}" fill="${base}"/>`,
    `<g clip-path="url(#${id})">${stripes ? `<path d="${lines.join(' ')}" stroke="${stripes.color}" stroke-width="${stripes.width}"/>` : ''}<path d="${d}" fill="url(#limbShade)"/></g>`,
    `<path d="${d}" fill="none" stroke="${inkC}" stroke-width="${W}" stroke-linejoin="round"/>`,
  ].join('');
}

/** Moufle rouge avec pouce. */
function mitten(cx: number, cy: number, flip = 1, sc = 1): string {
  return `<g transform="translate(${cx},${cy}) scale(${sc}) translate(${-cx},${-cy})">` + [
    shape(`M${cx - 7},${cy - 5} Q${cx - 8},${cy + 8} ${cx},${cy + 8} Q${cx + 8},${cy + 8} ${cx + 7},${cy - 4} Q${cx},${cy - 9} ${cx - 7},${cy - 5} Z`, 'url(#mit)', WRAP_INK),
    shape(`M${cx + 5 * flip},${cy - 2} q${5 * flip},-1 ${5 * flip},4 q${-1 * flip},4 ${-5 * flip},2 Z`, 'url(#mit)', WRAP_INK, 1.6),
    gloss(cx - 3, cy - 3, 2.6, 1.5, -30, 0.55),
  ].join('') + '</g>';
}

/** Bras selon le style choisi (propositions D1 à D4). */
function arm(o: Opts, skin: string, skInk: string, side: 'back' | 'front'): string {
  const st = o.armStyle ?? 'full';
  const back = side === 'back';
  if (st === 'full') {
    return back
      ? bandaged([[47, 88], [41, 96], [38, 106], [40, 119]], o.arm - 1, o.arm - 4, skin) + mitten(40, 123, -1)
      : bandaged([[89, 90], [98, 95], [103, 105], [100, 118]], o.arm + 1, o.arm - 3, skin) + mitten(100, 122, 1);
  }
  // bras plus fins, plus près du corps, légèrement pliés
  const pts: Pt[] = back ? [[46, 88], [42, 98], [41, 108], [43, 118]] : [[94, 87], [99, 97], [100, 107], [97, 117]];
  const w0 = 12.5, w1 = 9.5;
  const fist = back ? mitten(43, 121, -1, 0.82) : mitten(97, 120, 1, 0.82);
  const SKIN_FILL = 'url(#skArm)';
  if (st === 'slim') return bandaged(pts, w0, w1, skin, 6, 4) + fist;
  if (st === 'forearm') {
    // peau jusqu'au coude, puis avant-bras bandé
    return limb(pts, w0, w1, SKIN_FILL, skInk) +
      bandaged(pts.slice(2) as Pt[], w1 + 1.5, w1, skin, 5, 3) + fist;
  }
  if (st === 'bands') {
    // peau avec quelques larges bandes rouges
    return limb(pts, w0, w1, SKIN_FILL, skInk, { color: '#a3283a', step: 9, width: 4.2, slant: 3 }) + fist;
  }
  // spiral : peau, fines bandes rouges enroulées en diagonale
  return limb(pts, w0, w1, SKIN_FILL, skInk, { color: '#a3283a', step: 5.5, width: 2, slant: 5 }) + fist;
}

function build(o: Opts): string {
  uid = 0;
  const SKIN = o.skin;
  const SK_INK = ink(SKIN, -0.6);
  const defs = [
    vgrad('sk', shade(SKIN, 0.18), shade(SKIN, -0.08)),
    vgrad('hr', shade(o.hair, 0.2), shade(o.hair, -0.25)),
    vgrad('cap', shade(CAP, 0.18), shade(CAP, -0.2)),
    vgrad('wrap', shade(WRAP, 0.12), shade(WRAP, -0.15)),
    vgrad('cloth', shade(CLOTH, 0.15), shade(CLOTH, -0.2)),
    vgrad('pants', shade(PANTS, 0.12), shade(PANTS, -0.22)),
    vgrad('mit', '#c63a46', '#7e1824'),
    `<linearGradient id="skArm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(SKIN, 0.12)}"/><stop offset="1" stop-color="${shade(SKIN, -0.12)}"/></linearGradient>`,
    `<linearGradient id="limbShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0.18"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.28"/></linearGradient>`,
  ].join('');

  const p: string[] = [];

  /* ---------- Jambes ---------- */
  const leg = (hipX: number, footX: number, dir: number) => {
    const hemY = 140;
    // bandage du tibia + pied nu
    p.push(bandaged([[footX, hemY - 8], [footX, 153]], 10, 9, SKIN, 5.5, 3));
    // pantalon ample, ourlet effiloché qui s'évase
    p.push(shape(`M${hipX - 9},104 Q${hipX - 12},${hemY - 14} ${footX - 11},${hemY} L${footX - 7},${hemY + 4} L${footX - 3},${hemY - 1} L${footX + 1},${hemY + 5} L${footX + 5},${hemY} L${footX + 9},${hemY + 3} L${footX + 11},${hemY - 2} Q${hipX + 12},${hemY - 18} ${hipX + 9},106 Z`, 'url(#pants)', CAP_INK));
    p.push(line(`M${hipX + dir * 2},112 Q${hipX + dir * 4},124 ${footX + dir * 3},136`, shade(PANTS, -0.4), D, 0.6));
    p.push(shape(`M${footX - 9},152 Q${footX},148 ${footX + 11},152 Q${footX + 13},158 ${footX + 6},158 L${footX - 8},158 Q${footX - 11},155 ${footX - 9},152 Z`, 'url(#sk)', SK_INK));
    p.push(line(`M${footX + 4},155 l0,2.4 M${footX + 7.5},154.5 l0,2.4`, SK_INK, 0.9, 0.8));
  };
  leg(60, 56, -1);
  leg(81, 85, 1);
  p.push(`<g fill="#a8423a" opacity="0.85"><circle cx="59" cy="120" r="1.2"/><circle cx="57.5" cy="125.5" r="1.2"/><circle cx="56.5" cy="131" r="1.2"/></g>`);

  /* ---------- Haut du corps (remonté : jambes plus longues) ---------- */
  const up: string[] = [];
  // bras arrière
  up.push(arm(o, SKIN, SK_INK, 'back'));
  // torse
  up.push(shape('M43,86 C47,73 93,73 98,86 L92,112 C86,122 56,122 50,112 Z', 'url(#sk)', SK_INK));
  up.push(`<path d="M86,80 Q98,84 98,86 L92,112 C89,118 84,120 79,121 Q88,104 86,80 Z" fill="${shade(SKIN, -0.35)}" opacity="0.35"/>`);
  up.push(line('M56,93 Q63,99 70,95 Q77,99 85,93', SK_INK, D, 0.45));
  up.push(line('M66,103 L66,109 M75,103 L75,109', SK_INK, D, 0.35));
  up.push(gloss(55, 82, 9, 3, -12, 0.3));
  up.push(`<path d="M74,86 q-3.5,-5 -7,-1 q-2,5 7,10 q9,-5 7,-10 q-3.5,-4 -7,1 Z" fill="#b8243a" stroke="#5a0a14" stroke-width="${D}"/>`);
  // pagne jaune + nœud de cuir
  up.push(shape('M47,109 Q70,116 94,109 L95,120 L90,118 L88,126 L82,119 L76,128 L71,119 L64,127 L61,118 L54,123 L47,119 Z', 'url(#cloth)', '#6a4208'));
  up.push(line('M49,112 Q70,119 92,112', '#fff2c0', 1.4, 0.5));
  up.push(shape('M66,112 Q72,108 77,114 Q72,119 66,116 Z', '#6a3a1a', '#2a1408', 1.8));
  up.push(shape('M68,116 Q66,127 69,135 L73,134 Q71,126 73,117 Z', '#6a3a1a', '#2a1408', 1.8));
  // bras avant (tient l'arme)
  up.push(arm(o, SKIN, SK_INK, 'front'));

  /* ---------- Tête ---------- */
  const h: string[] = [];
  // nœud du bandana (pans flottants vers l'arrière)
  h.push(shape('M42,44 Q30,36 18,39 Q27,43 20,51 Q31,50 42,51 Z', 'url(#cap)', CAP_INK));
  h.push(shape('M42,50 Q32,54 24,64 Q36,62 44,56 Z', 'url(#cap)', CAP_INK));
  // mèche arrière qui s'échappe
  h.push(shape('M44,36 Q36,30 33,22 Q43,26 48,32 Z', 'url(#hr)', ink(o.hair, -0.6)));
  // oreille pointue (côté arrière)
  h.push(shape('M46,56 Q34,52 24,46 Q32,60 45,67 Z', 'url(#sk)', SK_INK));
  h.push(line('M42,58 Q35,55 30,52', SK_INK, D, 0.5));
  // visage
  h.push(shape('M39,50 C38,30 56,22 72,23 C92,24 104,36 103,52 C103,64 99,74 92,80 L80,86 C64,88 45,78 39,50 Z', 'url(#sk)', SK_INK));
  h.push(`<path d="M44,62 C48,76 62,86 80,86 C66,84 52,76 47,60 Z" fill="${shade(SKIN, -0.35)}" opacity="0.3"/>`);
  // yeux
  h.push(`<path d="M62,57 Q69,50 77,55 Q70,61 62,57 Z" fill="#fff" stroke="#4a2410" stroke-width="${D}"/>`);
  h.push(`<path d="M84,55 Q89,49 96,53 Q90,58 84,55 Z" fill="#fff" stroke="#4a2410" stroke-width="${D}"/>`);
  if (!o.whiteEyes) {
    h.push(`<circle cx="70.5" cy="56" r="2.6" fill="#2a120a"/><circle cx="71.2" cy="55.2" r="0.8" fill="#fff"/><circle cx="90.3" cy="54" r="2.3" fill="#2a120a"/>`);
  }
  h.push(line('M58,49 L77,54', '#4a1a06', 3.6));
  h.push(line('M82,53 L98,47', '#4a1a06', 3.6));
  // peintures de guerre
  h.push(line('M64,64 L74,63 M66,67.5 L73,67', '#b8243a', 2.2, 0.95));
  h.push(line('M89,61 L97,59.5', '#b8243a', 2, 0.95));
  // nez + bouche
  h.push(line('M83,62 Q86.5,65 83,67', SK_INK, D, 0.7));
  if (o.snarl) {
    h.push(shape('M70,71 Q81,81 93,70 Q82,75 70,71 Z', '#4a1410', SK_INK, 1.6));
    h.push(shape('M72,72 Q81,77 91,71 L90,73.2 Q81,78 73,74 Z', '#fff7ee', SK_INK, 0.9));
    h.push(`<path d="M76,73.6 l1.5,3.6 l1.5,-3.3 Z M87,72.6 l1.3,3.3 l1.3,-3.5 Z" fill="#fff7ee" stroke="#4a2410" stroke-width="0.7"/>`);
  } else {
    h.push(line('M72,73 Q81,70.5 91,72.5', '#4a2410', 1.8));
  }
  // mèches avant qui dépassent du bandana
  h.push(shape('M97,43 Q106,46 109,54 Q103,52 99,51 Q104,57 103,63 Q97,57 94,52 Z', 'url(#hr)', ink(o.hair, -0.6)));
  h.push(shape('M60,27 Q60,19 66,14 Q66,21 70,25 Z', 'url(#hr)', ink(o.hair, -0.6)));
  // bandana : épouse le crâne, pli, pièce jaune cousue
  h.push(shape('M38,51 C36,33 52,21 72,21 C92,21 104,33 104,47 C94,40 62,38 38,51 Z', 'url(#cap)', CAP_INK));
  h.push(line('M42,45 Q72,32 101,42', shade(CAP, -0.35), D, 0.8));
  h.push(line('M50,30 Q66,24 84,26', '#fff', 2.2, 0.25));
  h.push(`<ellipse cx="76" cy="31" rx="8.5" ry="5.6" fill="#e8c040" stroke="#7a5a08" stroke-width="1.4" transform="rotate(-6 76 31)"/>`);
  h.push(`<ellipse cx="76" cy="31" rx="6.2" ry="3.6" fill="none" stroke="#6a3a1a" stroke-width="1.3" stroke-dasharray="1.6 1.8" transform="rotate(-6 76 31)"/>`);

  const head = `<g transform="translate(70,84) scale(0.86) translate(-70,-84)">${h.join('\n')}</g>`;
  p.push(`<g transform="translate(0,-14)">${up.join('\n')}\n${head}</g>`);
  return svg(140, 170, defs, p.join('\n'));
}

/** D : fidèle à la tenue officielle — yeux blancs, bouche fermée, cheveux blond-orangé. */
export const variantD = () => build({ skin: '#e8ac78', hair: '#eba23a', whiteEyes: true, snarl: false, arm: 13 });
/** E : même tenue, plus « berserker » — pupilles, rictus, cheveux roux, bras plus épais. */
export const variantE = () => build({ skin: '#e59b68', hair: '#d9662a', whiteEyes: false, snarl: true, arm: 15 });

const D_BASE: Opts = { skin: '#e8ac78', hair: '#eba23a', whiteEyes: true, snarl: false, arm: 13 };
export const variantD1 = () => build({ ...D_BASE, armStyle: 'slim' });
export const variantD2 = () => build({ ...D_BASE, armStyle: 'forearm' });
export const variantD3 = () => build({ ...D_BASE, armStyle: 'bands' });
export const variantD4 = () => build({ ...D_BASE, armStyle: 'spiral' });
