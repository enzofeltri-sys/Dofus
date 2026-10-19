import { item } from './data/items';
import { RUNE_STAT, statWeight } from './forge';

/**
 * Kamas (choix d'Enzo : pour l'instant, ils ne servent qu'à la forgemagie).
 * DofusDB ne publie pas les kamas lâchés par les monstres : ces montants sont une adaptation, réglée pour qu'une partie
 * paie une dizaine de runes moyennes posées sur un objet de son niveau.
 */
export const KAMAS = {
  /** Kamas par niveau du monstre vaincu, plus une base (sinon les toutes premières cartes ne paient presque rien). */
  perLevel: 1,
  base: 3,
  elite: 5,
  boss: 20,
  /** Coût d'une rune : poids × (niveau de l'objet + 5) × ce facteur. */
  runeFactor: 1,
};

export type KamasSource = 'monster' | 'elite' | 'boss';
/** Kamas lâchés par un monstre (les invocations ne donnent rien). */
export const kamasFor = (level: number, src: KamasSource) =>
  Math.max(1, Math.round((level * KAMAS.perLevel + KAMAS.base) * (src === 'boss' ? KAMAS.boss : src === 'elite' ? KAMAS.elite : 1)));

/** Prix en kamas pour poser cette rune sur cet objet : la rune PA coûte bien plus que la rune Fo, un objet haut niveau plus qu'un petit. */
export function runeCost(runeId: number, itemId: number): number {
  const rs = RUNE_STAT.get(runeId);
  if (!rs) return 0;
  const [p, v] = rs;
  return Math.max(1, Math.round(v * statWeight(p) * (item(itemId).level + 5) * KAMAS.runeFactor));
}

/** Affichage : 12 345 K. */
export const fmtKamas = (n: number) => `${Math.floor(n).toLocaleString('fr-FR')} K`;
