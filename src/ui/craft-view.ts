import { canCraft, jobLevel, jobProgress, sortedRecipes, usable, type Workshop } from '../game/craft';
import type { Facets } from '../game/search';
import { fmtLine, item, SETS, statLabel } from '../game/data/items';
import { itemIconImg } from './item-icons';

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
