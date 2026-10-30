import { svg } from './kit';
import { SACRI_COLORS, type SacriColors } from './sacrieur-chibi';
import { SACRI_SHAPES, SACRI_SLOTS, SACRI_TRACED_HAND, SACRI_TRACED_PIVOTS } from './sacrieur-traced.gen';

/**
 * Sacrieur redessiné sur gabarit du rendu officiel Dofus 3 (tools/gabarit_sacri.py), comme les monstres.
 * 7 morceaux animés ; chaque couleur suit un emplacement de l'écran Apparence (peau, cheveux, vêtements 1-4).
 * Regarde vers la DROITE.
 */
export const TRACED_SACRI_PARTS = ['cape', 'legB', 'legF', 'armB', 'torso', 'armF', 'head'] as const;
export type TracedSacriPart = (typeof TRACED_SACRI_PARTS)[number];
export const TRACED_SACRI_PIVOTS = SACRI_TRACED_PIVOTS as Record<TracedSacriPart, [number, number]>;
export const TRACED_SACRI_HAND = SACRI_TRACED_HAND;

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c: number[]) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const lum = (c: number[]) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
const ink = (h: string) => hex(rgb(h).map((v) => v * 0.45));

/** Nuance `p` de la couleur de base `base`, reportée sur la nouvelle couleur `nb` (même rapport de clarté). */
export function recolor(p: string, base: string, nb: string): string {
  if (base.toLowerCase() === nb.toLowerCase()) return p;
  const P = rgb(p), B = rgb(base), N = rgb(nb);
  const t = lum(P) / Math.max(1, lum(B));
  return hex(P.map((v, i) => v + t * (N[i] - B[i])));
}

function partBody(part: TracedSacriPart, col: SacriColors): string {
  return (SACRI_SHAPES[part] ?? []).map(([f, d]) => {
    const slot = SACRI_SLOTS[f] as keyof SacriColors | null;
    const fill = slot ? recolor(f, SACRI_COLORS[slot], col[slot]) : f;
    return `<path d="${d}" fill="${fill}" stroke="${ink(fill)}" stroke-width="0.5" stroke-linejoin="round"/>`;
  }).join('');
}

/** Un morceau, ou le personnage entier (sans `part`). */
export function sacriTracedSvg(part?: TracedSacriPart, colors: SacriColors = SACRI_COLORS): string {
  const body = part ? partBody(part, colors) : TRACED_SACRI_PARTS.map((p) => partBody(p, colors)).join('');
  return svg(140, 170, '', body);
}
