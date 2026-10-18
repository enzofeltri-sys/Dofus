import { canCraft, jobLevel, jobProgress, sortedRecipes, usable, type Workshop } from '../game/craft';
import type { Facets } from '../game/search';
import { fmtLine, isSpecial, item, SETS, statLabel } from '../game/data/items';
import {
  BOSS_RESOURCE, breakPreview, canBreak, FUSION_BOSS_COST, fusionPartners, fusionRule, MAX_RARITY, RARITIES, rangesFor, upgradeRolls,
} from '../game/forge';
import { instance, isWorn, itemLines } from '../game/inventory';
import { itemIconImg } from './item-icons';
import { fmCheck, fmLines, ownedRunes, puitsMax } from '../game/fm';

/** Atelier de l'Artisan tel qu'affiché au camp. */
export interface CraftView {
  level: number;
  into: number;
  need: number;
  rows: CraftRow[];
}
export interface CraftRow {
  id: number;
  icon: string;
  name: string;
  sub: string;
  ok: boolean;
  reason: string;
  max: number;
  ingredients: { icon: string; name: string; have: number; need: number; locked: boolean }[];
  /** Fourchettes de stats (équipement) et panoplie. */
  lines: string[];
  set: string;
  facets: Facets;
}

export function craftView(w: Workshop): CraftView {
  const p = jobProgress(w.jobXp);
  return {
    level: p.level, into: p.into, need: p.need,
    rows: sortedRecipes(w).map((r) => {
      const d = item(r.id), c = canCraft(w, r);
      const flags = new Set<string>([`id:${r.id}`, ...r.ingredients.map(([id]) => `ing:${id}`)]);
      if (c.ok) flags.add('craftable');
      const short = r.ingredients.filter(([id, q]) => usable(w, id) < q).length;
      if (!c.ok && short === 1 && jobLevel(w.jobXp) >= r.level) flags.add('missing1');
      return {
        id: r.id, icon: itemIconImg(r.id), name: d.name,
        sub: `${d.slot ? d.type : 'Ressource'} · niveau ${r.level}`,
        ok: c.ok, reason: c.ok ? '' : c.reason, max: c.max,
        ingredients: r.ingredients.map(([id, q]) => ({ icon: itemIconImg(id), name: item(id).name, have: w.resources[id] ?? 0, need: q, locked: !!w.locked?.includes(id) })),
        lines: d.effects.map(([pth, a, b]) => (a === b ? fmtLine(pth, a) : `${a >= 0 ? '+' : ''}${a} à ${b} ${statLabel(pth)}`)),
        set: d.set ? SETS[d.set]?.name ?? '' : '',
        facets: {
          name: d.name, level: r.level, slot: d.slot, set: d.set,
          stats: new Map(d.effects.map(([p, a, b]) => [p, Math.abs(b) >= Math.abs(a) ? b : a])),
          text: [d.slot ? d.type : 'Ressource intermédiaire', ...r.ingredients.map(([id]) => item(id).name)],
          flags, order: r.id,
        },
      };
    }),
  };
}

/* ---------- Fusion et brisage ---------- */

/** Un équipement possédé, vu depuis l'Atelier (onglets Fusion et Brisage). */
export interface ForgeRow {
  uid: number;
  icon: string;
  name: string;
  sub: string;
  rarity: number;
  worn: boolean;
  lock: boolean;
  fav: boolean;
  /** Fusion possible (≥ 2 partenaires) et rang visé. */
  fusable: boolean;
  next: string;
  /** Pourquoi la fusion n'est pas possible. */
  fuseWhy: string;
  breakable: boolean;
  breakWhy: string;
  facets: Facets;
}

export function forgeRows(w: Workshop): ForgeRow[] {
  const inv = w.inventory;
  return inv.items.map((it) => {
    const d = item(it.id), r = it.rarity ?? 0;
    const partners = fusionPartners(inv, it.uid).length;
    const rule = fusionRule(it);
    const fuseWhy = isSpecial(it.id) ? (d.slot === 'familier' ? 'Un familier ne se fusionne pas' : 'Un Dofus ne se fusionne pas')
      : r >= MAX_RARITY ? 'Déjà Mythique'
      : partners >= 2 ? ''
      : rule === 'same' ? `Il faut 2 autres ${d.name} ${RARITIES[r]}` : `Il faut 2 pièces ${RARITIES[r]} de la panoplie`;
    const br = canBreak(inv, it.uid);
    const flags = new Set<string>();
    if (!fuseWhy) flags.add('fusable');
    if (br.ok) flags.add('breakable');
    if (it.fav) flags.add('fav');
    if (it.lock) flags.add('lock');
    if (isWorn(inv, it.uid)) flags.add('worn');
    return {
      uid: it.uid, icon: itemIconImg(it.id), name: d.name, sub: `${RARITIES[r]} · ${d.type} · niveau ${d.level}`, rarity: r,
      worn: isWorn(inv, it.uid), lock: !!it.lock, fav: !!it.fav,
      fusable: !fuseWhy, next: r < MAX_RARITY ? RARITIES[r + 1] : '', fuseWhy,
      breakable: br.ok, breakWhy: br.ok ? '' : br.reason,
      facets: { name: d.name, level: d.level, slot: d.slot, set: d.set, stats: new Map(itemLines(it)), text: [d.type, RARITIES[r]], flags, order: it.uid, rarity: r },
    };
  });
}

export interface FusionView {
  uid: number;
  icon: string;
  name: string;
  from: string;
  to: string;
  toRank: number;
  rule: string;
  /** Lignes : actuel → fourchette du rang visé. */
  lines: string[];
  bonusNote: string;
  partners: { uid: number; icon: string; name: string; rarity: number; lines: string }[];
  cost: { icon: string; name: string; have: number; need: number; locked: boolean } | null;
}

export function fusionView(w: Workshop, uid: number): FusionView | null {
  const it = instance(w.inventory, uid);
  if (!it) return null;
  const d = item(it.id), r = it.rarity ?? 0;
  if (r >= MAX_RARITY) return null;
  const now = rangesFor(it.id, r), nxt = rangesFor(it.id, r + 1);
  const up = upgradeRolls(it.id, it.rolls, r, r + 1);
  const need = FUSION_BOSS_COST[r + 1];
  return {
    uid, icon: itemIconImg(it.id), name: d.name, from: RARITIES[r], to: RARITIES[r + 1], toRank: r + 1,
    rule: fusionRule(it) === 'same' ? `2 autres ${d.name} ${RARITIES[r]}` : `2 pièces ${RARITIES[r]} de la ${SETS[d.set!]?.name ?? 'panoplie'}`,
    lines: now.map(([p], i) => `${fmtLine(p, it.rolls[i] ?? 0)} → ${fmtLine(p, up[i] ?? 0)}${nxt[i][1] === nxt[i][2] ? '' : ` (${nxt[i][1]} à ${nxt[i][2]})`}`),
    bonusNote: r + 1 === 3 ? 'Gagne une ligne bonus légendaire (tirée au hasard).'
      : r + 1 === 4 ? 'Ligne bonus : ×1,5, ou 10 % de chances de devenir +1 PA ou +1 PM.' : '',
    partners: fusionPartners(w.inventory, uid).map((o) => ({
      uid: o.uid, icon: itemIconImg(o.id), name: item(o.id).name, rarity: o.rarity ?? 0,
      lines: itemLines(o).map(([p, v]) => fmtLine(p, v)).join(' · '),
    })),
    cost: need ? { icon: itemIconImg(BOSS_RESOURCE), name: item(BOSS_RESOURCE).name, have: w.resources[BOSS_RESOURCE] ?? 0, need, locked: !!w.locked?.includes(BOSS_RESOURCE) } : null,
  };
}

export interface BreakView {
  uid: number;
  icon: string;
  name: string;
  sub: string;
  rarity: number;
  runes: { icon: string; name: string; min: number; max: number }[];
  why: string;
}

export function breakView(w: Workshop, uid: number): BreakView | null {
  const it = instance(w.inventory, uid);
  if (!it) return null;
  const d = item(it.id), r = it.rarity ?? 0;
  const br = canBreak(w.inventory, uid);
  return {
    uid, icon: itemIconImg(it.id), name: d.name, sub: `${RARITIES[r]} · ${d.type} · niveau ${d.level}`, rarity: r,
    runes: [...breakPreview(it)].map(([id, [min, max]]) => ({ icon: itemIconImg(id), name: item(id).name, min, max }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    why: br.ok ? '' : br.reason,
  };
}

/* ---------- Forgemagie ---------- */

export interface FmRuneBtn {
  id: number;
  icon: string;
  name: string;
  value: number;
  count: number;
  ok: boolean;
  /** « 50 / 30 / 20 % » (critique / neutre / échec) ou la raison du refus. */
  odds: string;
}
export interface FmView {
  uid: number;
  icon: string;
  name: string;
  sub: string;
  rarity: number;
  puits: number;
  puitsMax: number;
  lines: { text: string; range: string; kind: 'base' | 'exo' | 'bonus'; over: boolean; runes: FmRuneBtn[] }[];
  /** Runes possédées pour une nouvelle ligne (exo). */
  exo: { label: string; runes: FmRuneBtn[] }[];
  exoWhy: string;
}

const pct = (x: number) => `${Math.round(x * 100)}`;
const runeBtn = (w: Workshop, uid: number, id: number, value: number, count: number): FmRuneBtn => {
  const c = fmCheck(w, uid, id);
  return {
    id, icon: itemIconImg(id), name: item(id).name, value, count, ok: c.ok,
    odds: c.ok ? `${pct(c.odds[0])} / ${pct(c.odds[1])} / ${pct(1 - c.odds[0] - c.odds[1])} %` : c.reason,
  };
};

export function fmView(w: Workshop, uid: number): FmView | null {
  const it = instance(w.inventory, uid);
  if (!it) return null;
  const d = item(it.id), r = it.rarity ?? 0;
  const owned = ownedRunes(w);
  const lines = fmLines(it);
  const onItem = new Set(lines.map((l) => l.path));
  return {
    uid, icon: itemIconImg(it.id), name: d.name, sub: `${RARITIES[r]} · ${d.type} · niveau ${d.level}`, rarity: r,
    puits: it.puits ?? 0, puitsMax: puitsMax(d.level, r),
    lines: lines.map((l) => ({
      text: fmtLine(l.path, l.value), kind: l.kind, over: l.kind === 'base' && l.value > l.max,
      range: l.kind === 'bonus' ? 'ligne de rareté' : l.kind === 'exo' ? `exo · ${l.cap} au plus` : l.max <= 0 ? 'malus' : `jet max ${l.max} · overmax ${l.cap}`,
      runes: l.kind === 'bonus' || l.max < 0 ? [] : (owned.get(l.path) ?? []).map(([id, v, n]) => runeBtn(w, uid, id, v, n)),
    })),
    exo: [...owned].filter(([p]) => !onItem.has(p)).map(([p, rs]) => ({ label: statLabel(p), runes: rs.map(([id, v, n]) => runeBtn(w, uid, id, v, n)) })),
    exoWhy: it.exo ? 'Une seule ligne exo par objet.' : '',
  };
}
