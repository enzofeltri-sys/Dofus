import { dodgePaOf, dodgePmOf, ELEMENTS, escapeOf, initiativeOf, prospectionOf, retraitPaOf, retraitPmOf, tackleOf, type Element } from '../game/formulas';
import type { HeroDef } from '../game/data/hero';
import { CARACS, levelProgress, pointCost, pointsFree, type CaracId, type Profile } from '../game/progression';
import { ICONS } from './grimoire-icons';

/** Fiche de caractéristiques telle qu'affichée au camp. */
export interface SheetView {
  level: number;
  xpInto: number;
  xpNeed: number;
  free: number;
  caracs: { id: CaracId; name: string; icon: string; total: number; invested: number; gear: number; cost: number; canAdd: boolean }[];
  tabs: { title: string; rows: [string, string][] }[];
}

const CARAC_NAME: Record<CaracId, string> = {
  vitalite: 'Vitalité', sagesse: 'Sagesse', force: 'Force', intelligence: 'Intelligence', chance: 'Chance', agilite: 'Agilité',
};
const CARAC_ICON: Record<CaracId, string> = {
  vitalite: ICONS.vie.svg, sagesse: ICONS.sagesse.svg, force: ICONS.force.svg,
  intelligence: ICONS.intelligence.svg, chance: ICONS.chance.svg, agilite: ICONS.agilite.svg,
};
const EL_NAME: Record<Element, string> = { neutre: 'Neutre', terre: 'Terre', feu: 'Feu', eau: 'Eau', air: 'Air' };

const pct = (v: number) => `${v} %`;
const signed = (v: number) => (v > 0 ? `+${v}` : String(v));

export function sheetView(profile: Profile, hero: HeroDef): SheetView {
  const s = hero.stats;
  const p = levelProgress(profile.xp);
  const free = pointsFree(profile);
  const caracs = CARACS.map((id) => {
    const invested = profile.carac[id], total = s[id], cost = pointCost(id, invested);
    return { id, name: CARAC_NAME[id], icon: CARAC_ICON[id], total, invested, gear: total - invested, cost, canAdd: cost <= free };
  });
  const elementRows = (rec: Record<Element, number>, f: (v: number) => string): [string, string][] => ELEMENTS.map((el) => [EL_NAME[el], f(rec[el])]);
  return {
    level: p.level, xpInto: p.into, xpNeed: p.need, free, caracs,
    tabs: [
      {
        title: 'Général',
        rows: [
          ['Points de vie', String(hero.hp)],
          ['PA', String(s.pa)],
          ['PM', String(s.pm)],
          ['Portée', signed(s.portee)],
          ['Invocations', String(s.invocations)],
          ['Initiative', String(initiativeOf(s))],
          ['Prospection', String(prospectionOf(s))],
          ['Bonus d’XP (Sagesse)', `+${Math.max(0, s.sagesse)} %`],
          ['Érosion', pct(s.erosion)],
        ],
      },
      {
        title: 'Dommages',
        rows: [
          ['Puissance', String(s.puissance)],
          ['Dommages', String(s.dommages)],
          ...ELEMENTS.map((el): [string, string] => [`Dommages ${EL_NAME[el]}`, String(s.dommagesElem[el])]),
          ['Critique', pct(s.critique)],
          ['Dommages critiques', String(s.dommagesCritiques)],
          ['Dommages de poussée', String(s.dommagesPoussee)],
          ['Soins', String(s.soins)],
          ['Renvoi de dommages', String(s.renvoi)],
          ['Dommages mêlée', pct(s.pctMelee)],
          ['Dommages distance', pct(s.pctDistance)],
          ['Dommages d’arme', pct(s.pctArme)],
          ['Dommages aux sorts', pct(s.pctSort)],
        ],
      },
      {
        title: 'Résistances',
        rows: [
          ...elementRows(s.resPct, pct),
          ...ELEMENTS.map((el): [string, string] => [`${EL_NAME[el]} (fixe)`, String(s.resFixe[el])]),
          ['Résistance critique', String(s.resCrit)],
          ['Résistance poussée', String(s.resPoussee)],
          ['Résistance mêlée', pct(s.resMelee)],
          ['Résistance distance', pct(s.resDistance)],
        ],
      },
      {
        title: 'Combat',
        rows: [
          ['Tacle', String(tackleOf(s))],
          ['Fuite', String(escapeOf(s))],
          ['Esquive PA', String(dodgePaOf(s))],
          ['Esquive PM', String(dodgePmOf(s))],
          ['Retrait PA', String(retraitPaOf(s))],
          ['Retrait PM', String(retraitPmOf(s))],
        ],
      },
    ],
  };
}

/** Faiblesses et résistances d'un monstre, pour la barre du boss : « Faible : Terre, Eau · Résiste : Feu, Neutre, Air ». */
export function resLine(rec: Record<Element, number>): string {
  const weak = ELEMENTS.filter((el) => rec[el] < 0).sort((a, b) => rec[a] - rec[b]).map((el) => EL_NAME[el]);
  const strong = ELEMENTS.filter((el) => rec[el] > 0).sort((a, b) => rec[b] - rec[a]).map((el) => EL_NAME[el]);
  return [weak.length ? `Faible : ${weak.join(', ')}` : '', strong.length ? `Résiste : ${strong.join(', ')}` : ''].filter(Boolean).join(' · ');
}

export const elementName = (el: Element) => EL_NAME[el];
