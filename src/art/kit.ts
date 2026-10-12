import { shade } from '../svg';

/**
 * Petits outils de dessin SVG partagés par tous les personnages.
 * Style Dofus : contours épais, arrondis et COLORÉS (teinte assombrie, jamais noir pur).
 */

export const OUTLINE = 1.8;

/** Contour coloré dérivé de la couleur de remplissage. */
export const ink = (fill: string, k = -0.68) => shade(fill, k);

type Pt = [number, number];

/** Chemin lissé (Catmull-Rom → Bézier) passant par les points. */
export function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/**
 * Membre « tube » (bras, jambe, os) : un trait épais avec un contour coloré.
 * On dessine le trait de contour plus large, puis le trait de couleur par-dessus.
 */
export function tube(pts: Pt[], width: number, fill: string, outline = ink(fill)): string {
  const d = smoothPath(pts);
  return `<path d="${d}" fill="none" stroke="${outline}" stroke-width="${width + OUTLINE * 2}" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${d}" fill="none" stroke="${fill}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** Forme pleine avec contour coloré. */
export function shape(d: string, fill: string, outline = ink(fill), w = OUTLINE): string {
  return `<path d="${d}" fill="${fill}" stroke="${outline}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
}

export function ellipse(cx: number, cy: number, rx: number, ry: number, fill: string, outline = ink(fill), w = OUTLINE): string {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${outline}" stroke-width="${w}"/>`;
}

/** Trait simple (détails : muscles, fissures, coutures). */
export function line(d: string, color: string, w = 2, opacity = 1): string {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`;
}

/** Dégradé vertical (lumière en haut, ombre en bas) — le modelé doux de Dofus. */
export function vgrad(id: string, top: string, bottom: string): string {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`;
}

export function rgrad(id: string, inner: string, outer: string, cx = 0.4, cy = 0.35): string {
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="0.75"><stop offset="0" stop-color="${inner}"/><stop offset="1" stop-color="${outer}"/></radialGradient>`;
}

export function svg(w: number, h: number, defs: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${defs}</defs>${body}</svg>`;
}

/** Œil façon Dofus : ovale sombre + reflet blanc. */
export function eye(cx: number, cy: number, rx: number, ry: number, color = '#2a1a14'): string {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}"/>
<ellipse cx="${cx + rx * 0.3}" cy="${cy - ry * 0.4}" rx="${rx * 0.38}" ry="${ry * 0.3}" fill="#fff"/>`;
}

/**
 * Dégradé « modelé Dofus » : lumière en haut à gauche, teinte de base, puis une bande d'ombre
 * franche en bas à droite (effet cel-shading doux). À utiliser comme fill="url(#id)".
 */
export function cel(id: string, base: string, angle: 'diag' | 'vert' | 'horiz' = 'diag'): string {
  const [x2, y2] = angle === 'diag' ? [1, 1] : angle === 'vert' ? [0, 1] : [1, 0];
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">
    <stop offset="0" stop-color="${shade(base, 0.3)}"/>
    <stop offset="0.42" stop-color="${base}"/>
    <stop offset="0.56" stop-color="${shade(base, -0.2)}"/>
    <stop offset="1" stop-color="${shade(base, -0.34)}"/></linearGradient>`;
}

/** Reflet brillant (petite tache claire), typique du rendu Dofus. */
export function gloss(cx: number, cy: number, rx: number, ry: number, rot = -30, opacity = 0.55): string {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${opacity}" transform="rotate(${rot} ${cx} ${cy})"/>`;
}
