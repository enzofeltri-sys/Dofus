/**
 * Projection isométrique 2:1 (comme Dofus).
 * Le monde est en « cases » (unités flottantes, déplacement libre) ;
 * une case fait TILE_W × TILE_H pixels à l'écran.
 */
export const TILE_W = 96;
export const TILE_H = 48;

export function toScreen(x: number, y: number): { x: number; y: number } {
  return { x: (x - y) * (TILE_W / 2), y: (x + y) * (TILE_H / 2) };
}

/** Générateur pseudo-aléatoire déterministe (le décor est identique à chaque chargement). */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
