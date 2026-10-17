import { ZONES } from './data/areas';
import { addItem, averageRolls, equip } from './inventory';
import { LEVEL_MAX, XP_TABLE } from './progression';
import type { SaveData } from './save';

/**
 * Mode test (demandé par Enzo) : régler le niveau, débloquer les zones, ou se préparer directement pour le Donjon des Bouftous.
 * Modifie la vraie sauvegarde : l'écran demande confirmation avant.
 */
export type TestPreset = { kind: 'niveau'; level: number } | { kind: 'zones' } | { kind: 'bouftous' };

/** Panoplie du Bouftou (sans le Marteau) et l'Épée de Boisaille : l'équipement de la simulation du Donjon des Bouftous. */
export const BOUFTOU_GEAR = [2411, 2414, 2419, 2422, 2425, 2428, 18666, 44];

const allSteps = (except: string[] = []) => ZONES.flatMap((z) => z.nodes).filter((n) => !n.soon && !except.includes(n.id)).map((n) => n.id);

export function applyTest(save: SaveData, p: TestPreset): SaveData {
  if (p.kind === 'niveau') {
    const lv = Math.max(1, Math.min(LEVEL_MAX, Math.round(p.level)));
    return { ...save, profile: { ...save.profile, xp: XP_TABLE[lv] ?? 0 } };
  }
  if (p.kind === 'zones') return { ...save, done: [...new Set([...save.done, ...allSteps()])] };
  // prêt pour le Donjon des Bouftous : niveau 30, tout fait jusqu'aux Abords de la Cour, panoplie portée
  // le niveau 30 au moins (l'XP ne redescend pas) ; les points se répartissent ensuite à la main
  let s: SaveData = { ...save, profile: { ...save.profile, xp: Math.max(save.profile.xp, XP_TABLE[30]) } };
  s = { ...s, done: [...new Set([...s.done, ...allSteps(['cour'])])], area: 'cour' };
  let inv = s.inventory;
  for (const id of BOUFTOU_GEAR) {
    inv = addItem(inv, id, averageRolls(id));
    inv = equip(inv, inv.nextUid - 1, 200);
  }
  return { ...s, inventory: inv };
}
