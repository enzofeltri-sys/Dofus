import { svg } from './kit';
import { TRACED_SHAPES } from './traced.gen';

/**
 * Monstres redessinés sur gabarit (décision d'Enzo du 29/10 : calque permis, jeu strictement privé, jeu léger) :
 * les formes viennent de tools/gabarit.py (illustration DofusDB retournée, lissée et simplifiée, ~25 Ko par monstre).
 * Un seul morceau (« body ») animé en entier : il sautille, se penche pour frapper, s'écrase quand il est touché.
 * Ombre au sol dans « back », petits détails ajoutés à la main dans « face ».
 */
export const TRACED_KINDS = Object.keys(TRACED_SHAPES);

/** Contour : la couleur de la forme, assombrie. */
const ink = (h: string) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * 0.45).toString(16).padStart(2, '0')).join('');

/** Détails trop fins pour le gabarit (moustaches…). */
const EXTRAS: Record<string, string> = {
  fennex: '<path d="M44,112 l-22,-6 M44,115 l-22,1 M45,118 l-19,7 M58,111 l18,-9 M59,115 l19,-2" stroke="#e8e0d0" stroke-width="0.7" stroke-linecap="round" opacity="0.9"/>',
};

export function tracedSvg(kind: string, part?: string): string {
  const shapes = TRACED_SHAPES[kind] ?? [];
  const back = '<ellipse cx="70" cy="150" rx="34" ry="6" fill="#1a1208" opacity="0.26"/>';
  const body = shapes.map(([f, d]) => `<path d="${d}" fill="${f}" stroke="${ink(f)}" stroke-width="0.5" stroke-linejoin="round"/>`).join('');
  const face = EXTRAS[kind] ?? '';
  const parts: Record<string, string> = { back, body, face };
  return svg(140, 160, '', part ? parts[part] ?? '' : back + body + face);
}
