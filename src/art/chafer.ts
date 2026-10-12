import { ellipse, ink, line, shape, svg, tube, vgrad, rgrad } from './kit';

/**
 * Chafers de la Crypte de Kardorim (d'après les illustrations DofusDB) :
 * squelettes à grosse tête, bottes sombres cerclées de jaune, cimeterre.
 * Point d'ancrage (pieds) : (60, 156).
 */
export const CHAFER_W = 130;
export const CHAFER_H = 166;
export const CHAFER_FOOT: [number, number] = [60, 156];

const BONE = '#efe6d2';
const BONE_SH = '#cdbf9f';
const BONE_INK = '#7a6648';
const GOLD = '#e0a31c';

export type ChaferKind = 'debutant' | 'furtif' | 'piquier' | 'sergent';

export function chaferSvg(kind: ChaferKind): string {
  const defs = [
    vgrad('bone', '#fbf6ea', BONE_SH),
    rgrad('skull', '#fffaf0', '#d6c8a8', 0.38, 0.3),
    vgrad('boot', '#66646d', '#36343b'),
    vgrad('blade', '#4a4e57', '#24262b'),
    vgrad('helmG', '#a7b04a', '#5f6a1f'),
    vgrad('helmR', '#8c3a32', '#4f1a17'),
    vgrad('cape', '#b0302c', '#6b1614'),
    vgrad('shield', '#7d8a2c', '#4a5418'),
  ].join('');

  const parts: string[] = [];

  // Cape (sergent) — derrière tout le reste.
  if (kind === 'sergent') {
    parts.push(shape('M44,84 Q30,110 26,134 Q40,128 46,138 Q52,126 60,132 L70,86 Z', 'url(#cape)', ink('#b0302c')));
  }

  // Bras arrière (os fin) + main.
  parts.push(tube([[46, 88], [38, 104], [42, 118]], 5, BONE_SH, BONE_INK));
  parts.push(ellipse(43, 120, 5, 4.5, BONE_SH, BONE_INK, 2.5));

  // Jambes (os) et grosses bottes cerclées d'or.
  parts.push(tube([[54, 112], [52, 128]], 5, BONE, BONE_INK));
  parts.push(tube([[66, 112], [69, 128]], 5, BONE, BONE_INK));
  parts.push(shape('M42,126 Q52,120 62,126 L63,140 Q52,146 40,141 Z', 'url(#boot)', '#222026'));
  parts.push(shape('M60,126 Q70,120 80,126 L82,140 Q71,146 59,141 Z', 'url(#boot)', '#222026'));
  parts.push(line('M42,131 Q52,127 62,131', GOLD, 3));
  parts.push(line('M60,131 Q70,127 80,131', GOLD, 3));
  parts.push(ellipse(51, 142, 11, 4.5, '#2f2d33', '#1a191d', 2));
  parts.push(ellipse(71, 142, 11, 4.5, '#2f2d33', '#1a191d', 2));

  // Bassin + colonne + cage thoracique.
  parts.push(shape('M48,106 Q60,100 72,106 L70,114 Q60,118 50,114 Z', 'url(#bone)', BONE_INK));
  parts.push(line('M60,80 L60,106', BONE_INK, 5));
  parts.push(line('M60,80 L60,106', BONE, 2.5));
  for (let i = 0; i < 4; i++) {
    const y = 85 + i * 5;
    const w = 14 - i * 1.5;
    parts.push(`<path d="M60,${y} Q${60 - w - 4},${y + 1} ${60 - w},${y + 6}" fill="none" stroke="${BONE_INK}" stroke-width="5" stroke-linecap="round"/>`);
    parts.push(`<path d="M60,${y} Q${60 - w - 4},${y + 1} ${60 - w},${y + 6}" fill="none" stroke="${BONE}" stroke-width="2.6" stroke-linecap="round"/>`);
    parts.push(`<path d="M60,${y} Q${60 + w + 4},${y + 1} ${60 + w},${y + 6}" fill="none" stroke="${BONE_INK}" stroke-width="5" stroke-linecap="round"/>`);
    parts.push(`<path d="M60,${y} Q${60 + w + 4},${y + 1} ${60 + w},${y + 6}" fill="none" stroke="${BONE}" stroke-width="2.6" stroke-linecap="round"/>`);
  }
  // Pagne usé
  parts.push(shape('M49,108 L71,108 L74,120 L66,117 L62,124 L57,117 L47,121 Z', '#6e5a3c', '#3a2c18', 2));

  // Bouclier du piquier (devant le bras arrière, derrière la tête).
  if (kind === 'piquier') {
    parts.push(shape('M22,84 L46,80 L48,132 L24,136 Z', 'url(#shield)', '#2f3510'));
    parts.push(shape('M28,96 L42,94 L36,118 Z', GOLD, '#7a5410', 2));
    parts.push(line('M24,88 L46,85', '#c9c9a0', 2, 0.5));
  }

  // Bras avant + arme.
  parts.push(tube([[74, 88], [84, 100], [92, 98]], 5, BONE, BONE_INK));
  if (kind === 'piquier') {
    // Lance verticale
    parts.push(line('M96,140 L96,14', '#3a2614', 6));
    parts.push(line('M96,140 L96,14', '#7a5434', 3));
    parts.push(shape('M96,2 L102,22 L96,28 L90,22 Z', '#e6ecef', '#4f5964', 2.5));
    parts.push(ellipse(96, 30, 3.5, 3, GOLD, '#7a5410', 1.5));
  } else {
    // Cimeterre : lame sombre au fil clair, courbée vers l'arrière.
    // Cimeterre large : dos droit, tranchant courbe, pointe évasée.
    parts.push(shape('M94,94 L100,62 Q104,46 112,40 Q128,44 124,62 Q116,70 112,80 Q106,90 102,98 Z', 'url(#blade)', '#16171a', 2.5));
    parts.push(line('M112,44 Q126,48 122,62 Q114,70 109,82', '#e9eef2', 2.4));
    parts.push(shape('M89,94 L99,92 L100,100 L90,102 Z', '#2e3036', '#16171a', 2));
  }
  parts.push(ellipse(93, 98, 5, 4.5, BONE, BONE_INK, 2.5));

  // Crâne : gros, rond, mâchoire dentue, orbites sombres aux lueurs rouges.
  parts.push(shape('M44,60 Q46,80 61,80 Q76,80 78,60 Z', 'url(#bone)', BONE_INK));
  parts.push(shape('M48,68 L74,68 L73,75 L49,75 Z', '#fffdf5', BONE_INK, 1.5));
  parts.push(line('M53,68 L53,75 M58,68 L58,75 M63,68 L63,75 M68,68 L68,75', BONE_INK, 1.2));
  parts.push(shape('M34,44 C34,22 48,12 62,12 C78,12 90,22 90,44 C90,58 82,66 62,66 C42,66 34,58 34,44 Z', 'url(#skull)', BONE_INK));
  // Orbites froncées (bord supérieur incliné vers le nez) + arcade sourcilière.
  parts.push(`<path d="M42,42 Q44,36 50,38 L60,44 Q60,56 51,56 Q42,55 42,42 Z" fill="#2b2025"/>`);
  parts.push(`<path d="M82,41 Q80,35 74,37 L64,43 Q64,55 73,55 Q82,54 82,41 Z" fill="#2b2025"/>`);
  parts.push(line('M40,38 Q46,32 61,42 M84,37 Q78,31 63,41', BONE_INK, 2.2, 0.9));
  parts.push(`<circle cx="53" cy="48" r="3" fill="#ff5a3c"/><circle cx="71" cy="47" r="2.8" fill="#ff5a3c"/>`);
  parts.push(`<circle cx="53" cy="48" r="6" fill="#ff5a3c" opacity="0.18"/><circle cx="71" cy="47" r="6" fill="#ff5a3c" opacity="0.18"/>`);
  parts.push(shape('M60,54 L64,54 L62,59 Z', '#3a2a2a', '#3a2a2a', 1));
  parts.push(line('M70,16 L66,26 L71,30', BONE_INK, 1.6, 0.8));

  // Casques.
  if (kind === 'piquier') {
    parts.push(shape('M32,40 C32,14 48,6 62,6 C78,6 92,14 92,40 Q62,30 32,40 Z', 'url(#helmG)', '#3a4210'));
    parts.push(line('M34,38 Q62,28 90,38', GOLD, 3));
    parts.push(ellipse(62, 6, 4, 3.5, GOLD, '#7a5410', 1.5));
  }
  if (kind === 'sergent') {
    parts.push(shape('M32,40 C32,14 48,6 62,6 C78,6 92,14 92,40 Q62,30 32,40 Z', 'url(#helmR)', '#2e0e0c'));
    parts.push(line('M34,38 Q62,28 90,38', GOLD, 3));
    // cimier rouge
    parts.push(shape('M54,8 Q52,-6 66,-8 Q76,-4 72,8 Z', '#d8322a', '#6b1210', 2.5));
    // crâne blanc décoratif sur le casque
    parts.push(ellipse(62, 22, 5, 4.5, '#f2ead8', '#6b5a40', 1.5));
  }

  let body = parts.join('\n');
  if (kind === 'furtif') {
    // Chafer Furtif : spectral, translucide, teinte cyan.
    body = `<g opacity="0.62"><g filter="url(#ghost)">${body}</g></g>`;
  }
  const ghost = `<filter id="ghost"><feColorMatrix type="matrix" values="0.55 0.15 0.15 0 0.05  0.25 0.85 0.25 0 0.12  0.3 0.35 0.9 0 0.15  0 0 0 1 0"/></filter>`;
  // viewBox décalé de 10px vers le haut pour laisser la place au cimier.
  return svg(CHAFER_W, CHAFER_H, defs + ghost, `<g transform="translate(0,10)">${body}</g>`);
}
