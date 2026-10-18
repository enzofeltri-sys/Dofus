import { isSpecial, item, type StatPath } from './data/items';
import { craftXp, jobLevel, type Workshop } from './craft';
import { rangesFor, RUNE_STAT, RUNES_BY_STAT, statWeight, type ForgeResult } from './forge';
import { instance, type ItemInstance } from './inventory';

/**
 * Forgemagie (étape 8b, §9.4) : on pose une rune sur un objet, une rune à la fois, comme dans Dofus.
 * - Succès critique : la stat monte, rien n'est perdu.
 * - Succès neutre : la stat monte, mais d'autres lignes perdent autant de poids que la rune (le puits paie d'abord).
 * - Échec critique : la stat ne monte pas, d'autres lignes perdent du poids… qui va dans le puits.
 * - Puits : réserve de poids qui protège des pertes suivantes ; plus l'objet est rare, plus son puits est grand.
 * - Overmax : une ligne peut dépasser son jet maximum, d'un peu (selon le niveau et la rareté), avec moins de chances.
 * - Exo : une seule ligne en plus par objet ; PA, PM et Portée possibles à tout niveau mais très rares (+1 au plus).
 * Ankama ne publie pas ses formules : ces chances sont une adaptation (à valider par Enzo).
 */

export type FmOutcome = 'sc' | 'sn' | 'ec';
export const FM_NAMES: Record<FmOutcome, string> = { sc: 'Succès critique', sn: 'Succès neutre', ec: 'Échec critique' };

/** Chances [succès critique, succès neutre] (le reste : échec critique). */
export const FM_ODDS = {
  /** Sous le jet maximum. */
  below: [0.5, 0.3],
  /** Au-delà du jet maximum (overmax). */
  over: [0.15, 0.25],
  /** Nouvelle ligne (exo) d'une stat ordinaire. */
  exo: [0.1, 0.15],
  /** Exo Portée. */
  exoPo: [0.02, 0.02],
  /** Exo PA ou PM : très rare, à tout niveau. */
  exoApm: [0.01, 0.01],
} as const;

/** Taille du puits (en poids) : (20 + 2 × niveau) × (1 + 50 % par rang de rareté). */
export const puitsMax = (level: number, rarity: number) => Math.round((20 + 2 * level) * (1 + 0.5 * rarity));
/** Overmax d'une ligne (en poids) : (5 + niveau / 5) × (1 + 25 % par rang) ; au moins 1 point. */
export const overmaxCap = (p: StatPath, level: number, rarity: number) =>
  Math.max(1, Math.floor(((5 + level / 5) * (1 + 0.25 * rarity)) / statWeight(p)));
const RARE_EXO: StatPath[] = ['pa', 'pm', 'portee'];
/** Valeur maximale d'une ligne exo. */
export const exoCap = (p: StatPath, level: number, rarity: number) => (RARE_EXO.includes(p) ? 1 : overmaxCap(p, level, rarity));

/** Une ligne de l'objet vue par la forgemagie. */
export interface FmLine {
  path: StatPath;
  value: number;
  /** Jet maximum (au rang de l'objet) ; 0 pour l'exo. */
  max: number;
  /** Plus haute valeur atteignable (jet max + overmax, ou plafond de l'exo). */
  cap: number;
  kind: 'base' | 'exo' | 'bonus';
}

export function fmLines(it: ItemInstance): FmLine[] {
  const d = item(it.id), r = it.rarity ?? 0;
  const lines: FmLine[] = rangesFor(it.id, r).map(([p, , max], i) => ({
    path: p, value: it.rolls[i] ?? 0, max, cap: max > 0 ? max + overmaxCap(p, d.level, r) : max, kind: 'base' as const,
  }));
  if (it.exo) lines.push({ path: it.exo[0], value: it.exo[1], max: 0, cap: exoCap(it.exo[0], d.level, r), kind: 'exo' });
  if (it.bonus) lines.push({ path: it.bonus[0], value: it.bonus[1], max: it.bonus[1], cap: it.bonus[1], kind: 'bonus' });
  return lines;
}

export type FmCheck =
  | { ok: true; odds: readonly [number, number]; target: 'below' | 'over' | 'exo'; value: number }
  | { ok: false; reason: string };

/** Peut-on poser cette rune, et avec quelles chances ? */
export function fmCheck(w: Workshop, uid: number, runeId: number): FmCheck {
  const it = instance(w.inventory, uid);
  const rs = RUNE_STAT.get(runeId);
  if (!it || !rs) return { ok: false, reason: 'Introuvable' };
  if (isSpecial(it.id)) return { ok: false, reason: 'Pas de forgemagie sur un familier ou un Dofus' };
  if ((w.resources[runeId] ?? 0) <= 0) return { ok: false, reason: 'Plus de rune' };
  const [p, v] = rs;
  const lines = fmLines(it);
  const line = lines.find((l) => l.path === p && l.kind !== 'bonus');
  if (line && line.kind === 'base' && line.max <= 0) return { ok: false, reason: 'Ligne négative' };
  if (!line) {
    if (lines.some((l) => l.path === p)) return { ok: false, reason: 'Ligne de rareté' };
    if (it.exo) return { ok: false, reason: 'Déjà une ligne exo' };
    const cap = exoCap(p, item(it.id).level, it.rarity ?? 0);
    if (v > cap) return { ok: false, reason: `Exo : ${cap} au plus` };
    return { ok: true, odds: p === 'pa' || p === 'pm' ? FM_ODDS.exoApm : p === 'portee' ? FM_ODDS.exoPo : FM_ODDS.exo, target: 'exo', value: v };
  }
  if (line.value + v > line.cap) return { ok: false, reason: 'Overmax maximal' };
  if (line.kind === 'exo') return { ok: true, odds: p === 'pa' || p === 'pm' ? FM_ODDS.exoApm : p === 'portee' ? FM_ODDS.exoPo : FM_ODDS.exo, target: 'exo', value: v };
  return line.value + v <= line.max ? { ok: true, odds: FM_ODDS.below, target: 'below', value: v } : { ok: true, odds: FM_ODDS.over, target: 'over', value: v };
}

export interface FmResult extends ForgeResult {
  outcome: FmOutcome | null;
  /** Ligne visée, gain, pertes [stat, points], poids payé par le puits, poids ajouté au puits. */
  path: StatPath | null;
  gain: number;
  lost: [StatPath, number][];
  fromPuits: number;
  toPuits: number;
}

/** Pose une rune. */
export function applyRune(w: Workshop, uid: number, runeId: number, rnd: () => number): FmResult {
  const levelBefore = jobLevel(w.jobXp);
  const none: FmResult = { workshop: w, outcome: null, path: null, gain: 0, lost: [], fromPuits: 0, toPuits: 0, xp: 0, levelBefore, levelAfter: levelBefore };
  const chk = fmCheck(w, uid, runeId);
  if (!chk.ok) return none;
  const it0 = instance(w.inventory, uid)!;
  const it: ItemInstance = { ...it0, rolls: [...it0.rolls], exo: it0.exo ? [...it0.exo] as [StatPath, number] : undefined };
  const d = item(it.id), r = it.rarity ?? 0;
  const [p] = RUNE_STAT.get(runeId)!;
  const weight = chk.value * statWeight(p);
  const x = rnd();
  const outcome: FmOutcome = x < chk.odds[0] ? 'sc' : x < chk.odds[0] + chk.odds[1] ? 'sn' : 'ec';
  // gain
  const baseIdx = d.effects.findIndex(([q]) => q === p);
  if (outcome !== 'ec') {
    if (chk.target === 'exo') it.exo = [p, (it.exo?.[1] ?? 0) + chk.value];
    else it.rolls[baseIdx] = (it.rolls[baseIdx] ?? 0) + chk.value;
  }
  // pertes : autant de poids que la rune, le puits paie d'abord
  let puits = it.puits ?? 0, fromPuits = 0, toPuits = 0;
  const lost = new Map<StatPath, number>();
  if (outcome !== 'sc') {
    let left = weight;
    fromPuits = Math.min(puits, left);
    puits -= fromPuits;
    left -= fromPuits;
    // points retirés un par un sur les autres lignes positives (jamais la ligne de rareté)
    const pool = () => [
      ...d.effects.map(([q], i) => ({ q, i })).filter(({ q, i }) => q !== p && (it.rolls[i] ?? 0) > 0 && statWeight(q) > 0),
      ...(it.exo && it.exo[0] !== p && it.exo[1] > 0 ? [{ q: it.exo[0], i: -1 }] : []),
    ];
    let removed = 0;
    for (let guard = 0; left > 1e-9 && guard < 2000; guard++) {
      const c = pool();
      if (!c.length) break;
      const { q, i } = c[Math.floor(rnd() * c.length)];
      if (i >= 0) it.rolls[i] -= 1;
      else it.exo = [it.exo![0], it.exo![1] - 1];
      left -= statWeight(q);
      removed += statWeight(q);
      lost.set(q, (lost.get(q) ?? 0) + 1);
    }
    if (it.exo && it.exo[1] <= 0) it.exo = undefined;
    // échec critique : le poids perdu va dans le puits
    if (outcome === 'ec') {
      const room = puitsMax(d.level, r) - puits;
      toPuits = Math.max(0, Math.min(room, Math.round(removed * 10) / 10));
      puits += toPuits;
    }
  }
  it.puits = Math.round(puits * 10) / 10 || undefined;
  if (!it.exo) delete it.exo;
  const inventory = { ...w.inventory, items: w.inventory.items.map((o) => (o.uid === uid ? it : o)) };
  const resources = { ...w.resources, [runeId]: (w.resources[runeId] ?? 0) - 1 };
  const xp = Math.max(1, Math.round(craftXp(d.level, levelBefore) / 10));
  const jobXp = w.jobXp + xp;
  return {
    workshop: { ...w, inventory, resources, jobXp }, outcome, path: p, gain: outcome === 'ec' ? 0 : chk.value,
    lost: [...lost], fromPuits: Math.round(fromPuits * 10) / 10, toPuits, xp, levelBefore, levelAfter: jobLevel(jobXp),
  };
}

/** Runes possédées utilisables sur cet objet : stat → [rune, valeur, quantité]. */
export function ownedRunes(w: Workshop): Map<StatPath, [number, number, number][]> {
  const out = new Map<StatPath, [number, number, number][]>();
  for (const [p, runes] of RUNES_BY_STAT) {
    const have = runes.map(([id, v]) => [id, v, w.resources[id] ?? 0] as [number, number, number]).filter(([, , n]) => n > 0);
    if (have.length) out.set(p, have.sort((a, b) => a[1] - b[1]));
  }
  return out;
}
