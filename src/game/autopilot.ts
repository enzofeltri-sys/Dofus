import { GATE, PERSP, type Monster, type Vec, type World } from './world';

/**
 * Pilote automatique « joueur correct » : esquive les attaques annoncées, reste au contact
 * du monstre le plus proche, puis file vers la sortie. Sert à la démo et aux simulations d'équilibrage.
 */
export function autopilotInput(game: World): Vec {
  const h = game.hero;
  if (game.phase === 'cleared') {
    const dx = GATE.x - h.x, dy = game.bounds.y0 - 20 - h.y, d = Math.hypot(dx, dy) || 1;
    return { x: dx / d, y: dy / d };
  }
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
  const dx = best.x - h.x, dy = (best.y - h.y) / PERSP, d = Math.hypot(dx, dy) || 1;
  if (d > 105) return { x: dx / d, y: dy / d };
  if (d < 70) return { x: -dx / d, y: -dy / d };
  return { x: (-dy / d) * 0.4, y: (dx / d) * 0.4 };
}
