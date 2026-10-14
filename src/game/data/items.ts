import { baseStats, ELEMENTS, type Element, type Stats } from '../formulas';
import { ITEM_DATA, SET_DATA } from './items.gen';

/**
 * Objets (ressources et équipement) et panoplies, données réelles de DofusDB (tools/fetch_items.py).
 */

/** Type d'emplacement d'un objet (un anneau peut aller dans les deux cases d'anneau). */
export type ItemSlot = 'amulette' | 'arme' | 'anneau' | 'ceinture' | 'bottes' | 'bouclier' | 'chapeau' | 'cape';
/** Une case d'équipement du personnage (comme dans Dofus). */
export type SlotId =
  | 'amulette' | 'chapeau' | 'cape' | 'ceinture' | 'bottes' | 'anneau1' | 'anneau2' | 'arme' | 'bouclier' | 'familier'
  | 'dofus1' | 'dofus2' | 'dofus3' | 'dofus4' | 'dofus5' | 'dofus6';
export const SLOTS: SlotId[] = [
  'amulette', 'chapeau', 'cape', 'ceinture', 'bottes', 'anneau1', 'anneau2', 'arme', 'bouclier', 'familier',
  'dofus1', 'dofus2', 'dofus3', 'dofus4', 'dofus5', 'dofus6',
];
export const SLOT_NAME: Record<SlotId, string> = {
  amulette: 'Amulette', chapeau: 'Chapeau', cape: 'Cape', ceinture: 'Ceinture', bottes: 'Bottes', anneau1: 'Anneau', anneau2: 'Anneau',
  arme: 'Arme', bouclier: 'Bouclier', familier: 'Familier', dofus1: 'Dofus', dofus2: 'Dofus', dofus3: 'Dofus', dofus4: 'Dofus', dofus5: 'Dofus', dofus6: 'Dofus',
};

/** Chemin d'une ligne de stat : champ simple (« force ») ou par élément (« resPct.terre »). */
export type StatPath = string;

export interface ItemData {
  id: number;
  name: string;
  level: number;
  type: string;
  /** null = ressource. */
  slot: ItemSlot | null;
  icon: number;
  set: number | null;
  /** Lignes de stats : chemin, jet min, jet max. */
  effects: [StatPath, number, number][];
}

export interface ItemSetData {
  id: number;
  name: string;
  items: number[];
  /** bonus[n - 1] = bonus avec n objets de la panoplie portés. */
  bonus: [StatPath, number][][];
}

export const ITEMS: Record<number, ItemData> = ITEM_DATA;
export const SETS: Record<number, ItemSetData> = SET_DATA;

export const item = (id: number): ItemData => {
  const it = ITEMS[id];
  if (!it) throw new Error(`objet inconnu : ${id}`);
  return it;
};
export const isEquipment = (id: number) => ITEMS[id]?.slot != null;

/** Cases où un objet peut aller. */
export function slotsFor(s: ItemSlot): SlotId[] {
  return s === 'anneau' ? ['anneau1', 'anneau2'] : [s as SlotId];
}

/** Ajoute une ligne de stat à une fiche partielle. */
export function addLine(out: Partial<Stats>, path: StatPath, v: number) {
  const [k, el] = path.split('.') as [keyof Stats, Element | undefined];
  if (el) {
    const rec = ((out[k] as Record<Element, number> | undefined) ?? Object.fromEntries(ELEMENTS.map((e) => [e, 0]))) as Record<Element, number>;
    rec[el] += v;
    (out as Record<string, unknown>)[k] = rec;
  } else (out as Record<string, number>)[k] = ((out[k] as number | undefined) ?? 0) + v;
}

/** Libellé d'une ligne de stat pour l'affichage (« Force », « Dommages Terre », « Résistance Feu (%) »…). */
const LABEL: Record<string, string> = {
  vitalite: 'Vitalité', sagesse: 'Sagesse', force: 'Force', intelligence: 'Intelligence', chance: 'Chance', agilite: 'Agilité',
  pa: 'PA', pm: 'PM', portee: 'Portée', invocations: 'Invocation', initiative: 'Initiative', prospection: 'Prospection',
  puissance: 'Puissance', dommages: 'Dommages', critique: '% Critique', dommagesCritiques: 'Dommages Critiques', soins: 'Soins',
  dommagesPoussee: 'Dommages Poussée', renvoi: 'Renvoi', pctMelee: '% Dommages mêlée', pctDistance: '% Dommages distance',
  pctArme: '% Dommages d’arme', pctSort: '% Dommages aux sorts', resCrit: 'Résistance Critiques', resPoussee: 'Résistance Poussée',
  resMelee: '% Résistance mêlée', resDistance: '% Résistance distance', tacle: 'Tacle', fuite: 'Fuite',
  retraitPA: 'Retrait PA', retraitPM: 'Retrait PM', esquivePA: 'Esquive PA', esquivePM: 'Esquive PM', erosion: '% Érosion',
};
const EL: Record<Element, string> = { neutre: 'Neutre', terre: 'Terre', feu: 'Feu', eau: 'Eau', air: 'Air' };
export function statLabel(path: StatPath): string {
  const [k, el] = path.split('.') as [string, Element | undefined];
  if (!el) return LABEL[k] ?? k;
  if (k === 'dommagesElem') return `Dommages ${EL[el]}`;
  if (k === 'resPct') return `% Résistance ${EL[el]}`;
  return `Résistance ${EL[el]}`;
}
export const fmtLine = (path: StatPath, v: number) => `${v >= 0 ? '+' : ''}${v} ${statLabel(path)}`;

/** Fiche vide (tous les bonus à 0, érosion comprise). */
export const zeroStats = (): Stats => ({ ...baseStats(), erosion: 0 });
