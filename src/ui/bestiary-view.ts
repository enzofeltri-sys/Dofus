import { CRITTER_SVG, type CritterKind } from '../art/champs-chibi';
import { TRACED_KINDS, tracedSvg } from '../art/traced';
import { chaferChibiSvg, kardoribChibiSvg, kardorimChibiSvg } from '../art/monsters-chibi';
import type { ChaferKind } from '../art/chafer';
import { allBeasts, BEAST_KINDS, beastKind, beastSheet, placesOf, tierReward, tierState, type BeastKind, type Bestiary } from '../game/bestiary';
import { item } from '../game/data/items';
import type { MonsterDef } from '../game/data/monsters';
import { itemIconImg } from './item-icons';

/** Dessin d'un monstre en image (data URI : les identifiants internes des SVG ne se mélangent pas). */
function beastSvg(d: MonsterDef): string {
  const a = d.art as string;
  // tous les monstres sont redessinés sur gabarit (décision d'Enzo du 29/10) ; les autres gardent leur dessin
  if (TRACED_KINDS.includes(a)) return tracedSvg(a);
  if (a === 'kardorim') return kardorimChibiSvg();
  if (a === 'kardorib') return kardoribChibiSvg();
  if (['debutant', 'furtif', 'piquier', 'sergent', 'eclaireur', 'fantassin', 'primitif', 'ronin', 'vampire', 'maitreVampire', 'bwork', 'bworkMage', 'bworkArcher', 'bworkette'].includes(a)) return chaferChibiSvg(a as ChaferKind);
  return CRITTER_SVG[a as CritterKind]();
}
const art = new Map<string, string>();
export const beastArt = (d: MonsterDef) => {
  if (!art.has(d.art)) art.set(d.art, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(beastSvg(d))}`);
  return art.get(d.art)!;
};

const ELEMS = ['Neutre', 'Terre', 'Feu', 'Eau', 'Air'];
const ROLL_EL: Record<string, string> = { neutre: 'Neutre', terre: 'Terre', feu: 'Feu', eau: 'Eau', air: 'Air' };

export interface BeastCard {
  id: string;
  name: string;
  kind: BeastKind;
  kindLabel: string;
  art: string;
  /** Déjà croisé (sinon : silhouette, nom caché). */
  known: boolean;
  seen: number;
  slain: number;
  levels: string;
  places: string[];
  /** Fiche (seulement pour un monstre connu). */
  sheet: { label: string; value: string }[];
  drops: { icon: string; name: string; pct: string }[];
  /** Paliers : victoires demandées, récompense, état. */
  tiers: { goal: number; text: string; state: 'claimed' | 'ready' | 'locked' }[];
  /** Dernier palier récupéré (étoile dorée). */
  star: boolean;
}

const pct = (x: number) => (x >= 0.1 ? `${Math.round(x * 100)} %` : x >= 0.01 ? `${(x * 100).toFixed(1)} %` : `${(x * 100).toFixed(2)} %`);

export function bestiaryView(b: Bestiary | undefined): BeastCard[] {
  return allBeasts().map((d) => {
    const s = beastSheet(d), rec = b?.[d.id], known = (rec?.seen ?? 0) > 0;
    const k = beastKind(d);
    const res = s.res.map((v, i) => (v ? `${ELEMS[i]} ${v > 0 ? '+' : ''}${v} %` : '')).filter(Boolean).join(' · ') || 'aucune';
    const atk = d.attack;
    const shape = atk.atTarget ? 'zone à distance' : atk.shape === 'line' ? 'en ligne' : atk.shape === 'cone' ? 'en éventail' : 'au contact';
    const extras = [
      d.charge ? 'charge en ligne' : '',
      d.summons ? `invoque ${d.summons.id === 'feuJoie' ? 'des Feux de Joie' : 'des alliés'}` : '',
      d.boss ? [d.boss.crackEvery ? 'accélère ses alliés' : '', 'invoque', d.boss.heal ? 'se soigne' : ''].filter(Boolean).join(', ') : '',
      d.selfHeal ? 'se soigne une fois' : '',
      d.behavior === 'stealth' ? 'devient invisible' : '',
    ].filter(Boolean).join(', ');
    return {
      id: d.id, name: d.name, kind: k, kindLabel: BEAST_KINDS[k], art: beastArt(d), known,
      seen: rec?.seen ?? 0, slain: rec?.slain ?? 0,
      levels: s.levels[0] === s.levels[1] ? `niveau ${s.levels[0]}` : `niveaux ${s.levels[0]}-${s.levels[1]}`,
      places: placesOf(d.id),
      sheet: known ? [
        { label: 'PV', value: s.hp[0] === s.hp[1] ? `${s.hp[0]}` : `${s.hp[0]} à ${s.hp[1]}` },
        { label: 'Attaque', value: `${ROLL_EL[atk.roll.element]} ${atk.roll.min}-${atk.roll.max}, ${shape}${extras ? ` · ${extras}` : ''}` },
        { label: 'Résistances', value: res },
        { label: 'XP', value: s.xp[0] === s.xp[1] ? `${s.xp[0]}` : `${s.xp[0]} à ${s.xp[1]}` },
      ] : [],
      drops: known ? s.drops.map(([id, c]) => ({ icon: itemIconImg(id), name: item(id).name, pct: pct(c) })) : [],
      tiers: (() => {
        const t = tierState(d, rec);
        return t.goals.map((goal, i) => ({ goal, text: tierReward(d, i).text, state: i < t.claimed ? 'claimed' as const : i < t.reached ? 'ready' as const : 'locked' as const }));
      })(),
      star: tierState(d, rec).claimed === tierState(d, rec).goals.length,
    };
  });
}
