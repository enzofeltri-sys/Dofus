import { ColorMatrixFilter, Container, Sprite, type Texture } from 'pixi.js';

/**
 * Personnage articulé : un sprite par morceau (tête, torse, bras, jambes), chacun tournant
 * autour de son pivot (épaule, hanche, cou). Les poses sont calculées à chaque image
 * (animation procédurale) : marche, coup, préparation, recul, chute.
 *
 * Convention des angles de pose : positif = vers l'AVANT du personnage
 * (le signe est corrigé selon le sens dans lequel l'art est dessiné).
 */

export interface RigPart {
  name: string;
  tex: Texture;
  pivot: [number, number];
}

export interface PartPose {
  rot: number;
  dx: number;
  dy: number;
  alpha: number;
}

export class Rig {
  /** Retourné horizontalement selon l'orientation. */
  readonly root = new Container();
  /** Contient tous les morceaux ; sert au balancement global (chute, recul). */
  readonly body = new Container();
  /** Un conteneur par morceau (placé au pivot) ; l'image est dedans, les accessoires aussi. */
  readonly parts = new Map<string, Container>();
  private base = new Map<string, { x: number; y: number }>();
  private flashFilter = new ColorMatrixFilter();
  /** +1 si l'art regarde vers la droite, -1 s'il regarde vers la gauche. */
  private artDir: 1 | -1;

  constructor(parts: RigPart[], foot: [number, number], scale: number, artFacesLeft: boolean) {
    this.artDir = artFacesLeft ? -1 : 1;
    this.root.addChild(this.body);
    for (const p of parts) {
      const holder = new Container();
      const s = new Sprite(p.tex);
      s.anchor.set(p.pivot[0] / p.tex.width, p.pivot[1] / p.tex.height);
      holder.addChild(s);
      const x = (p.pivot[0] - foot[0]) * scale, y = (p.pivot[1] - foot[1]) * scale;
      holder.position.set(x, y);
      holder.scale.set(scale);
      this.base.set(p.name, { x, y });
      this.parts.set(p.name, holder);
      this.body.addChild(holder);
    }
  }

  /** Oriente le personnage vers la droite (1) ou la gauche (-1). */
  face(dir: 1 | -1) {
    this.root.scale.x = dir * this.artDir;
  }

  /** Angle de pose « vers l'avant » converti dans le repère de l'art. */
  fwd(a: number): number {
    // l'art tourné vers la droite : l'avant est une rotation négative (le bras part vers la droite)
    return this.artDir === 1 ? -a : a;
  }

  pose(name: string, p: Partial<PartPose>) {
    const s = this.parts.get(name);
    const b = this.base.get(name);
    if (!s || !b) return;
    s.rotation = this.fwd(p.rot ?? 0);
    s.position.set(b.x + (p.dx ?? 0) * this.artDir, b.y + (p.dy ?? 0));
    s.alpha = p.alpha ?? 1;
  }

  /** Éclat blanc quand le personnage est touché (k de 0 à 1). */
  flash(k: number) {
    if (k <= 0.01) {
      this.body.filters = [];
      return;
    }
    this.flashFilter.brightness(1 + k * 1.6, false);
    this.body.filters = [this.flashFilter];
  }
}

/** Petites courbes utiles aux animations. */
export const ease = {
  out: (t: number) => 1 - (1 - t) * (1 - t),
  inOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
};
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
