import { CHAFER_H, CHAFER_PARTS, CHAFER_W, type ChaferPart } from './chafer';
import { cel, ellipse, gloss, line, shape, svg, tube } from './kit';

/**
 * Kardorim, boss de la Crypte, et son invocation le Kardorib (d'après les illustrations DofusDB).
 * Même découpe et mêmes pivots que les Chafers (tournés vers la GAUCHE) : ils réutilisent
 * leurs animations. Kardorim est affiché plus grand en jeu.
 */

const SKIN = '#8d9a8a';
const SKIN_INK = '#2e3a32';
const STONE = '#9a9384';
const STONE_INK = '#3a352c';
const GOLD = '#e0a31c';
const GOLD_INK = '#6a4808';
const GLOW = '#b6ff7a';
const BONE = '#ece0cc';
const BONE_INK = '#5a4632';

type Parts = Record<ChaferPart, string[]>;
const empty = (): Parts => ({ cape: [], armB: [], legB: [], pelvis: [], legF: [], chest: [], shield: [], armF: [], head: [] });

function assemble(P: Parts, defs: string, part?: ChaferPart): string {
  const body = part ? P[part].join('\n') : CHAFER_PARTS.map((k) => P[k].join('\n')).join('\n');
  return svg(CHAFER_W, CHAFER_H, defs, `<g transform="translate(0,12)">${body}</g>`);
}

/** Kardorim : colosse mort-vivant, casque à cornes d'or, bouclier de pierre, épée à lueur verte. */
export function kardorimSvg(part?: ChaferPart): string {
  const defs = [
    cel('kSkin', SKIN, 'diag'),
    cel('kStone', STONE, 'diag'),
    cel('kHelm', '#6f6a62', 'diag'),
    cel('kShorts', '#5a3a22', 'vert'),
    cel('kBoot', '#4a4038', 'diag'),
    cel('kGold', GOLD, 'diag'),
    cel('kCloth', '#3f7a52', 'horiz'),
    `<linearGradient id="kBlade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4fff0"/><stop offset=".55" stop-color="#cfe8d2"/><stop offset="1" stop-color="#7ea888"/></linearGradient>`,
    `<filter id="kGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.5"/></filter>`,
  ].join('');
  const P = empty();
  const skin = (pts: [number, number][], w: number) => tube(pts, w, 'url(#kSkin)', SKIN_INK);

  // Pan de tissu vert dans le dos.
  P.cape.push(shape('M90,66 Q112,86 116,128 L104,122 L96,134 L88,122 Q90,96 84,70 Z', 'url(#kCloth)', '#1a3a24'));

  // Bras arrière : massif, tient le bouclier.
  P.armB.push(skin([[98, 74], [108, 92], [106, 108]], 11));

  // Bouclier rond en pierre cerclé d'or, fissuré.
  P.shield.push(ellipse(114, 100, 25, 29, 'url(#kStone)', STONE_INK, 2.2));
  P.shield.push(ellipse(114, 100, 25, 29, 'none', GOLD, 3));
  P.shield.push(ellipse(114, 100, 17, 20, 'none', STONE_INK, 1.2));
  P.shield.push(line('M104,86 L112,98 L108,108 M118,92 L124,104 L120,116', STONE_INK, 1.6, 0.7));
  P.shield.push(ellipse(114, 100, 4.5, 5, 'url(#kGold)', GOLD_INK, 1.4));
  P.shield.push(gloss(104, 84, 7, 3, -30, 0.35));

  // Jambes trapues : peau grise, bottes sombres cerclées d'or.
  P.legB.push(skin([[94, 112], [100, 130], [100, 146]], 11));
  P.legB.push(shape('M86,144 Q100,136 116,144 L118,163 Q100,170 84,164 Z', 'url(#kBoot)', '#1c1612'));
  P.legB.push(line('M86,150 Q100,144 117,150', GOLD, 3));
  P.legF.push(skin([[78, 112], [70, 130], [68, 146]], 12));
  P.legF.push(shape('M50,144 Q66,135 84,144 L86,163 Q66,171 48,165 Z', 'url(#kBoot)', '#1c1612'));
  P.legF.push(line('M50,150 Q67,143 85,150', GOLD, 3));
  P.legF.push(gloss(60, 152, 6, 2, -10, 0.22));

  // Short brun et ceinture verte à boucle d'or.
  P.pelvis.push(shape('M64,100 L104,100 L108,124 L90,120 L86,128 L80,120 L62,124 Z', 'url(#kShorts)', '#24160c'));
  P.pelvis.push(shape('M62,98 Q84,92 106,98 L106,106 Q84,100 62,106 Z', 'url(#kCloth)', '#1a3a24', 1.6));
  P.pelvis.push(shape('M78,97 L88,96 L88,105 L78,106 Z', 'url(#kGold)', GOLD_INK, 1.4));

  // Torse massif, épaulières de pierre à pointes d'or.
  P.chest.push(shape('M58,74 C60,58 104,56 110,72 L106,102 Q84,110 64,102 Z', 'url(#kSkin)', SKIN_INK, 2));
  P.chest.push(line('M70,80 Q80,86 92,82 M72,92 Q82,96 94,92', SKIN_INK, 1.6, 0.6));
  P.chest.push(shape('M92,60 Q104,50 116,60 L118,76 Q104,82 92,76 Z', 'url(#kStone)', STONE_INK, 2));
  P.chest.push(shape('M104,54 L110,40 L114,56 Z', 'url(#kGold)', GOLD_INK, 1.4));
  P.chest.push(shape('M50,62 Q60,48 80,56 L80,76 Q62,84 50,74 Z', 'url(#kStone)', STONE_INK, 2.2));
  P.chest.push(shape('M58,54 L56,38 L66,52 Z', 'url(#kGold)', GOLD_INK, 1.4));
  P.chest.push(gloss(60, 60, 8, 3, -20, 0.4));

  // Bras avant tendu, grande épée à lueur verte.
  P.armF.push(skin([[74, 72], [60, 86], [48, 86]], 11));
  P.armF.push(`<path d="M44,84 L10,22 L22,14 L52,78 Z" fill="${GLOW}" opacity="0.55" filter="url(#kGlow)"/>`);
  P.armF.push(shape('M44,82 L12,24 L16,12 L26,16 L52,76 Z', 'url(#kBlade)', '#2a4a30', 2));
  P.armF.push(line('M24,20 L48,74', '#2a3a30', 3, 0.8));
  P.armF.push(line('M16,16 L42,74', '#ffffff', 1.6, 0.8));
  P.armF.push(shape('M34,82 L58,72 L61,78 L38,89 Z', 'url(#kGold)', GOLD_INK, 1.6));
  P.armF.push(tube([[48, 88], [54, 100]], 5, '#4a3020', '#1c120a', 1.4));
  P.armF.push(ellipse(48, 86, 7, 6, 'url(#kSkin)', SKIN_INK, 1.8));

  // Tête : casque à cornes d'or, visière sombre, yeux verts.
  P.head.push(shape('M40,50 Q42,66 58,68 Q72,68 76,56 Z', '#5f8a7a', SKIN_INK, 1.8));
  P.head.push(shape('M46,58 L70,58 L68,64 L50,64 Z', '#f6efdc', SKIN_INK, 1.2));
  P.head.push(shape('M36,40 C34,16 52,6 66,6 C84,6 96,18 92,42 L88,52 Q64,46 40,54 Z', 'url(#kHelm)', '#24221e', 2.2));
  P.head.push(shape('M40,40 Q64,34 88,40 L86,50 Q64,44 42,52 Z', '#1e1c1a', '#121110', 1.2));
  P.head.push(`<circle cx="52" cy="45" r="7" fill="${GLOW}" opacity="0.35"/><circle cx="52" cy="45" r="3" fill="${GLOW}"/><circle cx="74" cy="44" r="2.4" fill="${GLOW}"/>`);
  P.head.push(line('M64,8 L64,36', '#24221e', 2, 0.6));
  P.head.push(shape('M38,30 Q22,26 20,8 Q30,18 42,20 Z', 'url(#kGold)', GOLD_INK, 1.8));
  P.head.push(shape('M88,26 Q102,18 100,0 Q94,12 84,16 Z', 'url(#kGold)', GOLD_INK, 1.8));
  P.head.push(line('M38,38 Q64,28 90,36', GOLD, 2.6));
  P.head.push(gloss(52, 16, 9, 4, -15, 0.45));

  return assemble(P, defs, part);
}

/** Kardorib : chien squelette à cornes de bélier, invoqué par Kardorim. */
export function kardoribSvg(part?: ChaferPart): string {
  const defs = [cel('rBone', BONE, 'diag'), cel('rHorn', '#b88a5a', 'diag')].join('');
  const P = empty();
  const bone = (pts: [number, number][], w: number) => tube(pts, w, 'url(#rBone)', BONE_INK);

  // Pattes arrière et avant (le « bassin » porte la queue).
  P.legB.push(bone([[104, 104], [114, 124], [104, 146]], 6));
  P.legB.push(shape('M96,144 Q106,140 116,146 L114,154 Q104,156 94,152 Z', 'url(#rBone)', BONE_INK, 1.6));
  P.legF.push(bone([[62, 104], [56, 126], [58, 146]], 6));
  P.legF.push(shape('M46,144 Q58,139 66,146 L64,154 Q54,156 44,152 Z', 'url(#rBone)', BONE_INK, 1.6));
  P.pelvis.push(bone([[110, 96], [124, 84], [128, 66], [136, 56]], 4.5));
  P.pelvis.push(ellipse(108, 98, 10, 8, 'url(#rBone)', BONE_INK));

  // Colonne horizontale, côtes pendantes, épines dorsales.
  P.chest.push(bone([[58, 90], [80, 86], [108, 94]], 5));
  for (let i = 0; i < 4; i++) {
    const x = 66 + i * 10;
    P.chest.push(`<path d="M${x},${88} Q${x - 6},${104} ${x + 2},${112}" fill="none" stroke="${BONE_INK}" stroke-width="5" stroke-linecap="round"/>`);
    P.chest.push(`<path d="M${x},${88} Q${x - 6},${104} ${x + 2},${112}" fill="none" stroke="url(#rBone)" stroke-width="2.6" stroke-linecap="round"/>`);
    P.chest.push(shape(`M${x - 3},${86} L${x + 1},${72 - (i % 2) * 4} L${x + 5},${86} Z`, 'url(#rBone)', BONE_INK, 1.4));
  }

  // Crâne de bélier, cornes enroulées, crocs.
  P.head.push(shape('M28,88 Q26,74 40,70 Q56,68 62,80 Q62,94 50,100 L32,100 Q26,96 28,88 Z', 'url(#rBone)', BONE_INK));
  P.head.push(shape('M26,94 L48,96 L46,104 L30,104 Z', '#fffdf3', BONE_INK, 1.2));
  P.head.push(line('M32,96 L32,103 M37,96 L37,104 M42,96 L42,104', BONE_INK, 1));
  P.head.push(`<path d="M36,80 Q40,76 46,79 Q46,86 40,87 Q35,86 36,80 Z" fill="#2a1e22"/><circle cx="41" cy="82" r="2.2" fill="#ff5a3c"/>`);
  P.head.push(tube([[50, 74], [58, 62], [72, 62], [78, 74], [72, 84], [64, 80], [66, 74]], 6, 'url(#rHorn)', '#4a2e14'));
  P.head.push(gloss(40, 74, 6, 2.5, -15, 0.5));

  return assemble(P, defs, part);
}
