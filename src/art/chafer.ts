import { cel, ellipse, gloss, line, shape, svg, tube } from './kit';

/**
 * Chafers de la Crypte de Kardorim, d'après les illustrations DofusDB :
 * squelette élancé et voûté, de trois quarts tourné vers la GAUCHE,
 * crâne allongé à mâchoire saillante, grosses bottes sombres cerclées d'or,
 * genouillères rondes, cimeterre large tendu vers l'avant.
 * Point d'ancrage (pieds) : CHAFER_FOOT.
 */
export const CHAFER_W = 160;
export const CHAFER_H = 186;
export const CHAFER_FOOT: [number, number] = [84, 177];

const BONE = '#ece2c8';
const BONE_INK = '#4a3a26';
const GOLD = '#e0a31c';

export type ChaferKind = 'debutant' | 'furtif' | 'piquier' | 'sergent';

const bone = (pts: [number, number][], w: number) => tube(pts, w, 'url(#bone)', BONE_INK);

export function chaferSvg(kind: ChaferKind): string {
  const defs = [
    cel('bone', BONE, 'diag'),
    cel('skull', '#f2e9d2', 'diag'),
    cel('boot', '#4e4c56', 'diag'),
    cel('iron', '#8a8894', 'diag'),
    cel('blade', '#5a5e68', 'horiz'),
    cel('helmG', '#8e9a3a', 'diag'),
    cel('helmR', '#8c2e26', 'diag'),
    cel('cape', '#a82a26', 'horiz'),
    cel('shield', '#6e7c26', 'diag'),
    cel('rag', '#7a6442', 'vert'),
  ].join('');

  const p: string[] = [];

  // Cape du sergent (derrière tout).
  if (kind === 'sergent') {
    p.push(shape('M96,70 Q120,98 128,150 L114,142 L106,156 L96,140 L84,150 Q86,110 80,76 Z', 'url(#cape)', '#3e0c0a'));
  }

  // Bras arrière (droit, derrière le corps) — pend le long du flanc.
  p.push(bone([[98, 76], [108, 96], [104, 114]], 5));
  p.push(ellipse(104, 117, 5, 4.5, 'url(#bone)', BONE_INK, 1.6));

  // Jambe arrière : fémur, genouillère, tibia, botte.
  p.push(bone([[94, 112], [102, 130], [100, 146]], 5.5));
  p.push(ellipse(102, 131, 6.5, 6, 'url(#iron)', '#26242c', 1.6));
  p.push(shape('M90,146 Q100,138 112,146 L114,162 Q100,168 88,163 Z', 'url(#boot)', '#1c1a20'));
  p.push(line('M90,151 Q101,146 113,151', GOLD, 3));

  // Bassin + pagne effiloché.
  p.push(shape('M74,104 Q86,98 98,104 L96,114 Q86,118 76,114 Z', 'url(#bone)', BONE_INK));
  p.push(shape('M72,106 L100,106 L102,120 L94,116 L90,126 L84,116 L76,124 L70,118 Z', 'url(#rag)', '#2e2210'));

  // Jambe avant.
  p.push(bone([[80, 112], [70, 130], [66, 146]], 5.5));
  p.push(ellipse(70, 131, 7, 6.5, 'url(#iron)', '#26242c', 1.6));
  p.push(gloss(68, 129, 2.4, 1.6, -30, 0.7));
  p.push(shape('M52,146 Q64,137 78,146 L80,163 Q64,170 50,164 Z', 'url(#boot)', '#1c1a20'));
  p.push(line('M52,151 Q65,145 79,151', GOLD, 3));
  p.push(gloss(60, 152, 5, 2, -10, 0.25));

  // Colonne vertébrale voûtée + cage thoracique de trois quarts.
  p.push(tube([[70, 56], [80, 70], [88, 86], [88, 104]], 3.5, 'url(#bone)', BONE_INK));
  for (let i = 0; i < 4; i++) {
    const y = 72 + i * 7.5;
    const cx = 84 + i * 1.2;
    const w = 15 - i * 2;
    const rib = `M${cx},${y} Q${cx - w - 4},${y - 1} ${cx - w + 1},${y + 7}`;
    const ribB = `M${cx},${y} Q${cx + w * 0.7 + 3},${y} ${cx + w * 0.6},${y + 6}`;
    for (const d of [ribB, rib]) {
      p.push(`<path d="${d}" fill="none" stroke="${BONE_INK}" stroke-width="5" stroke-linecap="round"/>`);
      p.push(`<path d="${d}" fill="none" stroke="url(#bone)" stroke-width="2.4" stroke-linecap="round"/>`);
    }
  }

  // Bouclier du piquier, porté par le bras arrière.
  if (kind === 'piquier') {
    p.push(shape('M98,74 L124,70 L128,128 L102,134 Z', 'url(#shield)', '#262c0a'));
    p.push(shape('M106,86 L120,84 L114,110 Z', GOLD, '#6a4808', 1.6));
    p.push(line('M100,78 L124,74', '#e8e8b8', 1.6, 0.6));
  }

  // Bras avant (gauche) tendu vers l'avant, tenant l'arme.
  p.push(bone([[74, 74], [60, 88], [46, 86]], 5));
  if (kind === 'piquier') {
    // Lance tenue en avant, pointe vers le haut à gauche.
    p.push(line('M70,124 L18,22', '#2e1e10', 6));
    p.push(line('M70,124 L18,22', '#7a5434', 3));
    p.push(shape('M12,8 L24,22 L20,30 L10,22 Z', '#e6ecef', '#3a4450', 1.8));
    p.push(ellipse(21, 30, 3.5, 3, GOLD, '#6a4808', 1.4));
  } else {
    // Cimeterre large : lame sombre au fil clair, courbée, pointe évasée.
    p.push(shape('M44,84 L30,74 Q12,64 4,70 Q2,84 18,90 Q30,92 44,90 Z', 'url(#blade)', '#16171a', 1.8));
    p.push(line('M6,72 Q4,84 18,88 Q30,90 42,89', '#eef2f4', 2.2));
    p.push(shape('M42,80 L50,78 L52,94 L44,96 Z', '#2e3036', '#121316', 1.6));
  }
  p.push(ellipse(46, 87, 5, 4.5, 'url(#bone)', BONE_INK, 1.6));

  // Crâne allongé, mâchoire saillante vers l'avant-gauche.
  p.push(shape('M44,52 Q42,66 56,70 Q68,72 74,62 L72,54 Z', 'url(#skull)', BONE_INK));
  p.push(shape('M48,60 L70,62 L69,67 L50,66 Z', '#fffdf3', BONE_INK, 1.2));
  p.push(line('M53,60.5 L53,66 M58,61 L58,66.5 M63,61.5 L63,66.5', BONE_INK, 1));
  p.push(shape('M40,40 C38,22 52,12 66,13 C82,14 92,26 88,42 C86,52 78,58 66,58 C52,58 42,52 40,40 Z', 'url(#skull)', BONE_INK));
  // orbites (l'avant grande, l'arrière étroite : trois quarts) + lueur rouge
  p.push(`<path d="M44,36 Q46,30 54,32 L60,38 Q60,48 51,48 Q44,47 44,36 Z" fill="#2a1e22"/>`);
  p.push(`<path d="M68,36 Q72,31 78,34 Q80,44 72,46 Q67,44 68,36 Z" fill="#2a1e22"/>`);
  p.push(`<circle cx="52" cy="40" r="2.8" fill="#ff5a3c"/><circle cx="73" cy="39.5" r="2.2" fill="#ff5a3c"/>`);
  p.push(`<circle cx="52" cy="40" r="6" fill="#ff5a3c" opacity="0.2"/>`);
  p.push(line('M42,32 Q48,26 62,36 M66,34 Q74,27 84,32', BONE_INK, 1.8, 0.85));
  p.push(shape('M58,47 L62,47 L60,52 Z', '#3a2a2a', '#3a2a2a', 1));
  p.push(line('M76,17 L72,26 L77,30', BONE_INK, 1.4, 0.7));
  p.push(gloss(56, 20, 8, 4, -18, 0.5));

  // Casques.
  if (kind === 'piquier') {
    p.push(shape('M36,34 C36,12 52,4 66,4 C84,4 94,14 92,34 Q64,24 36,34 Z', 'url(#helmG)', '#262c08'));
    p.push(line('M38,32 Q64,22 90,32', GOLD, 2.6));
    p.push(ellipse(64, 4, 3.6, 3.2, GOLD, '#6a4808', 1.4));
    p.push(gloss(52, 14, 8, 3.5, -15, 0.45));
  }
  if (kind === 'sergent') {
    p.push(shape('M36,34 C36,12 52,4 66,4 C84,4 94,14 92,34 Q64,24 36,34 Z', 'url(#helmR)', '#2a0a08'));
    p.push(line('M38,32 Q64,22 90,32', GOLD, 2.6));
    p.push(shape('M58,6 Q54,-8 68,-12 Q80,-8 74,6 Z', '#d8322a', '#5a0e0c', 1.8));
    p.push(ellipse(64, 18, 5, 4.5, '#f2ead8', '#5a4a30', 1.4));
    p.push(gloss(50, 14, 7, 3, -15, 0.45));
  }

  let body = p.join('\n');
  const ghost = `<filter id="ghost"><feColorMatrix type="matrix" values="0.55 0.15 0.15 0 0.05  0.25 0.85 0.25 0 0.12  0.3 0.35 0.9 0 0.15  0 0 0 1 0"/></filter>`;
  if (kind === 'furtif') body = `<g opacity="0.62"><g filter="url(#ghost)">${body}</g></g>`;
  return svg(CHAFER_W, CHAFER_H, defs + ghost, `<g transform="translate(0,12)">${body}</g>`);
}
