import { flatDist, FOUNTAIN_REACH, GATE, HAZARD, PERSP, type Monster, type Vec, type World } from './world';

/**
 * Pilote automatique « joueur correct » : esquive les attaques annoncées, reste au contact
 * du monstre le plus proche, puis file vers la sortie. Sert à la démo et aux simulations d'équilibrage.
 */
export function autopilotInput(game: World): Vec {
  const h = game.hero;
  const toward = (tx: number, ty: number): Vec => {
    const p = game.navPoint(h.x, h.y, tx, ty);
    const dx = p.x - h.x, dy = p.y - h.y, d = Math.hypot(dx, dy) || 1;
    return { x: dx / d, y: dy / d };
  };
  if (game.phase === 'cleared') return toward(game.doors[0]?.x ?? GATE.x, game.bounds.y0 - 20);
  // pièges annoncés : on sort de la zone
  for (const z of game.hazards) {
    if (z.state !== 'windup' && !(z.kind === 'herd' && z.state === 'active')) continue;
    if (z.kind === 'herd' && Math.abs(h.y - z.y) < HAZARD.herd.half + 20) return { x: 0, y: h.y >= z.y ? 1 : -1 };
    const r = z.kind === 'wisp' ? HAZARD.wisp.radius : HAZARD.hands.radius;
    if (z.kind !== 'herd' && flatDist(h.x, h.y, z.x, z.y) < r + 20) {
      const ax = h.x - z.x, ay = (h.y - z.y) / PERSP, n = Math.hypot(ax, ay) || 1;
      return { x: ax / n, y: ay / n };
    }
  }
  // fontaine : on va s'y soigner quand on est bas
  const f = game.fountain;
  if (f && h.hp < h.maxHp * 0.55 && f.healed < h.maxHp * 0.5 && flatDist(h.x, h.y, f.x, f.y) > FOUNTAIN_REACH * 0.6) return toward(f.x, f.y + 40);
  let best: Monster | null = null, bd = Infinity;
  for (const m of game.monsters) {
    if (m.state === 'dead') continue;
    const d = Math.hypot(m.x - h.x, (m.y - h.y) / PERSP);
    // fuir une attaque annoncée
    if (m.state === 'windup' && game.inAttack(m)) {
      const ax = h.x - m.x, ay = (h.y - m.y) / PERSP;
      if (m.def.attack.shape === 'line') {
        // une ligne s'esquive par le côté
        const side = ax * m.dir.y - ay * m.dir.x >= 0 ? 1 : -1;
        return { x: m.dir.y * side, y: -m.dir.x * side };
      }
      const n = Math.hypot(ax, ay) || 1;
      return { x: ax / n, y: ay / n };
    }
    if (d < bd) { bd = d; best = m; }
  }
  if (!best) return { x: 0, y: 0 };
  if (bd > 105) {
    const p = game.navPoint(h.x, h.y, best.x, best.y);
    if (p.x !== best.x || p.y !== best.y) return toward(best.x, best.y);
  }
  const dx = best.x - h.x, dy = (best.y - h.y) / PERSP, d = Math.hypot(dx, dy) || 1;
  if (d > 105) return { x: dx / d, y: dy / d };
  if (d < 70) return { x: -dx / d, y: -dy / d };
  return { x: (-dy / d) * 0.4, y: (dx / d) * 0.4 };
}
