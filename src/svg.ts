import { ImageSource, Texture } from 'pixi.js';

/**
 * Rasterise un SVG (chaîne) en texture Pixi, à une résolution donnée.
 * Tout l'art du jeu est vectoriel : on le dessine en SVG puis on le rastérise
 * une fois au chargement, à la résolution de l'écran.
 */
export async function svgTexture(svg: string, resolution: number): Promise<Texture> {
  const vb = /viewBox="([\d.\s-]+)"/.exec(svg);
  if (!vb) throw new Error('SVG sans viewBox');
  const [, , w, h] = vb[1].trim().split(/\s+/).map(Number);

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(w * resolution);
    canvas.height = Math.ceil(h * resolution);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return new Texture({ source: new ImageSource({ resource: canvas, resolution }) });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Assombrit / éclaircit une couleur hex (#rrggbb) — pour les contours colorés façon Dofus. */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  if (amount < 0) {
    const k = 1 + amount;
    r = Math.round(r * k);
    g = Math.round(g * k);
    b = Math.round(b * k);
  } else {
    r = Math.round(r + (255 - r) * amount);
    g = Math.round(g + (255 - g) * amount);
    b = Math.round(b + (255 - b) * amount);
  }
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
