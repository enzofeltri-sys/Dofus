import { clamp01, ease, lerp, type Rig } from './rig';

/**
 * Animations procédurales du Sacrieur et des Chafers.
 * Angles en convention « positif = vers l'avant » (voir Rig.fwd).
 */

export interface HeroAnim {
  t: number;
  moving: boolean;
  walkPh: number;
  /** Avancement du coup d'arme (0 → 1) ou null. */
  swing: number | null;
  /** Intensité du recul après un coup reçu (1 → 0). */
  hurt: number;
  /** Avancement de la chute (0 → 1) ou null si vivant. */
  dead: number | null;
}

const SWORD_IDLE = 0.9;

export function poseHero(r: Rig, a: HeroAnim, sword: { rotation: number }) {
  const w = a.moving ? Math.sin(a.walkPh) : 0;
  const bob = a.moving ? Math.abs(Math.sin(a.walkPh)) * 3 : 0;
  const breath = Math.sin(a.t * 2.6);

  r.pose('legB', { rot: w * 0.5 });
  r.pose('legF', { rot: -w * 0.5 });
  r.pose('armB', { rot: -w * 0.38 });

  let armF = 0.15 + w * 0.3;
  let lean = a.moving ? 0.06 : 0;
  // l'épée part de « pointée vers l'avant » (repos) et s'aligne sur le bras pendant le coup
  let swordRel = SWORD_IDLE;
  if (a.swing !== null) {
    const s = a.swing;
    if (s < 0.32) {
      const k = ease.out(s / 0.32);
      armF = lerp(0.15, -1.9, k); // bras levé au-dessus de l'épaule, visible
      swordRel = lerp(SWORD_IDLE, 2.7, k);
    } else if (s < 0.55) {
      armF = lerp(-1.9, 1.55, ease.inOut((s - 0.32) / 0.23));
      swordRel = 2.7;
    } else {
      const k = ease.inOut((s - 0.55) / 0.45);
      armF = lerp(1.55, 0.15, k);
      swordRel = lerp(2.7, SWORD_IDLE, k);
    }
    if (s > 0.3 && s < 0.75) lean += 0.12;
    r.pose('armB', { rot: -0.45 });
  }
  r.pose('armF', { rot: armF });
  r.pose('torso', { rot: lean * 0.5, dy: -bob * 0.3 + breath * 0.4 });
  r.pose('head', { rot: lean * 0.4 + breath * 0.01, dy: -bob * 0.4 + breath * 0.6 });
  sword.rotation = r.fwd(-swordRel);

  r.body.y = -bob;
  r.body.rotation = r.fwd(-0.28 * a.hurt);
  if (a.dead !== null) {
    const d = ease.out(clamp01(a.dead));
    r.body.rotation = r.fwd(-1.45 * d);
    r.body.y = lerp(0, -6, d);
  }
  r.flash(a.hurt);
}

export interface ChaferAnim {
  t: number;
  moving: boolean;
  walkPh: number;
  /** Préparation de l'attaque (0 → 1) ou null. */
  windup: number | null;
  /** Frappe qui vient d'avoir lieu (0 → 1) ou null. */
  strike: number | null;
  hurt: number;
  /** Apparition (0 → 1). */
  spawn: number;
  /** Secondes écoulées depuis la mort, ou null. */
  dead: number | null;
  hidden: boolean;
  /** Opacité de base de l'art (le Furtif est translucide). */
  baseAlpha: number;
  seed: number;
}

const CHAFER_GROUND: Record<string, number> = { head: 100, chest: 46, pelvis: 50, armF: 70, armB: 70, legF: 36, legB: 36, shield: 70, cape: 60 };

export function poseChafer(r: Rig, a: ChaferAnim, scale: number) {
  if (a.dead !== null) {
    // le squelette s'effondre en tas d'os : chaque morceau tombe au sol en tournant
    const k = ease.out(clamp01(a.dead / 0.55));
    let i = 0;
    for (const name of r.parts.keys()) {
      const rnd = Math.sin(a.seed * 12.9898 + i * 78.233) * 43758.5453;
      const f = rnd - Math.floor(rnd);
      const ground = (CHAFER_GROUND[name] ?? 50) * scale;
      r.pose(name, { rot: (f - 0.5) * 3.2 * k, dy: ground * k, dx: (f - 0.5) * 50 * k, alpha: 1 });
      i++;
    }
    r.body.y = 0;
    r.body.rotation = 0;
    r.body.scale.y = 1;
    r.root.alpha = a.baseAlpha * (a.dead < 1.6 ? 1 : Math.max(0.55, 1 - (a.dead - 1.6) * 0.6));
    r.flash(clamp01(1 - a.dead / 0.2));
    return;
  }

  const w = a.moving ? Math.sin(a.walkPh) : 0;
  const bob = a.moving ? Math.abs(Math.sin(a.walkPh)) * 2.5 : 0;
  const breath = Math.sin(a.t * 2.2 + a.seed);
  r.pose('legB', { rot: w * 0.45 });
  r.pose('legF', { rot: -w * 0.45 });
  r.pose('pelvis', {});
  r.pose('cape', { rot: -0.05 - (a.moving ? 0.12 : 0) + breath * 0.03 });

  let armF = 0.1 + w * 0.25;
  let lean = 0;
  if (a.windup !== null) {
    armF = lerp(0.1, -2.3, ease.out(a.windup));
    lean = -0.1 * a.windup;
  } else if (a.strike !== null) {
    const s = a.strike;
    armF = s < 0.35 ? lerp(-2.3, 1.3, ease.out(s / 0.35)) : lerp(1.3, 0.1, ease.inOut((s - 0.35) / 0.65));
    lean = 0.16 * (1 - s);
  }
  r.pose('armF', { rot: armF });
  r.pose('armB', { rot: -w * 0.3 + breath * 0.04 });
  r.pose('shield', { rot: -w * 0.3 + breath * 0.04 });
  r.pose('chest', { rot: lean * 0.6, dy: breath * 0.5 - bob * 0.2 });
  r.pose('head', { rot: lean * 0.5 + breath * 0.03, dy: breath * 0.7 - bob * 0.3 });

  // tremblement pendant la préparation
  r.body.x = a.windup !== null ? Math.sin(a.t * 70) * 1.2 : 0;
  r.body.y = -bob;
  r.body.rotation = r.fwd(lean * 0.4 - 0.22 * a.hurt);
  const sp = ease.out(clamp01(a.spawn));
  r.body.scale.y = 0.4 + 0.6 * sp;
  r.root.alpha = a.baseAlpha * sp * (a.hidden ? 0.16 : 1);
  r.flash(a.hurt);
}
