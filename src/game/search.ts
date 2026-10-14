import { ELEMENTS } from './formulas';
import { ITEMS, SETS, statLabel, type ItemSlot, type StatPath } from './data/items';

/**
 * Recherche et filtres de l'inventaire, de l'Encyclopédie et de l'Atelier.
 * - texte libre sans accents ni majuscules, tous les mots doivent correspondre ;
 * - abréviations de joueur de Dofus pour les stats (« fo », « ine », « pa », « do feu », « ré terre »…) ;
 * - niveau : « 20 », « <15 », « >=10 », « 10-30 », « niv<20 » ;
 * - valeur d'une stat : « agi>10 », « vi>=50 », « pa=1 ».
 */

export const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, ' ').replace(/\s+/g, ' ').trim();

/* ---------- Abréviations des stats ---------- */

const EL_NAMES: Record<string, string> = { neutre: 'neutre', terre: 'terre', feu: 'feu', eau: 'eau', air: 'air' };
const ALIAS = new Map<string, StatPath[]>();
const alias = (paths: StatPath[], ...keys: string[]) => {
  for (const k of keys) ALIAS.set(norm(k), [...(ALIAS.get(norm(k)) ?? []), ...paths]);
};
alias(['vitalite'], 'vi', 'vita', 'vitalite', 'pv', 'vie');
alias(['sagesse'], 'sa', 'sag', 'sagesse');
alias(['force'], 'fo', 'force');
alias(['intelligence'], 'ine', 'int', 'intel', 'intelligence');
alias(['chance'], 'cha', 'chance');
alias(['agilite'], 'agi', 'agilite');
alias(['pa'], 'pa');
alias(['pm'], 'pm');
alias(['portee'], 'po', 'portee');
alias(['invocations'], 'invo', 'invoc', 'invocation', 'invocations');
alias(['initiative'], 'ini', 'init', 'initiative');
alias(['prospection'], 'pp', 'prospe', 'prospection');
alias(['puissance'], 'puissance', 'puiss');
alias(['dommages'], 'do', 'dmg', 'dommages', 'degats');
alias(['critique'], 'cc', 'crit', 'critique', 'coup critique');
alias(['dommagesCritiques'], 'do crit', 'dommages critiques');
alias(['soins'], 'so', 'soin', 'soins');
alias(['dommagesPoussee'], 'do pou', 'dommages poussee');
alias(['resPoussee'], 're pou', 'resistance poussee');
alias(['resCrit'], 're crit', 'resistance critiques');
alias(['tacle'], 'tacle');
alias(['fuite'], 'fuite');
alias(['retraitPA'], 'ret pa', 'retrait pa');
alias(['retraitPM'], 'ret pm', 'retrait pm');
alias(['esquivePA'], 'esq pa', 'esquive pa');
alias(['esquivePM'], 'esq pm', 'esquive pm');
alias(['renvoi'], 'renvoi');
alias(['erosion'], 'erosion');
for (const e of ELEMENTS) {
  const n = EL_NAMES[e];
  alias([`dommagesElem.${e}`], `do ${n}`, `dmg ${n}`, `dommages ${n}`);
  alias([`resPct.${e}`, `resFixe.${e}`, `res.${e}`], `re ${n}`, `res ${n}`, `resistance ${n}`);
  alias([`resPct.${e}`], `re% ${n}`, `%re ${n}`, `% re ${n}`, `% resistance ${n}`);
}
/** Clés d'alias les plus longues d'abord (« do feu » avant « do »). */
const MAX_WORDS = 3;

/** Toutes les stats présentes sur au moins un objet du jeu (pour le menu « Stat »). */
export const STAT_OPTIONS: { path: StatPath; label: string }[] = (() => {
  const s = new Set<StatPath>();
  for (const it of Object.values(ITEMS)) for (const [p] of it.effects) s.add(p);
  return [...s].map((path) => ({ path, label: statLabel(path) })).sort((a, b) => a.label.localeCompare(b.label, 'fr'));
})();

/* ---------- Requête ---------- */

type Op = '>' | '>=' | '<' | '<=' | '=';
export interface Query {
  /** Chaque groupe : l'objet doit avoir au moins une de ces stats (valeur > 0). */
  stats: StatPath[][];
  /** Comparaisons sur une stat (« agi>10 »). */
  cmp: { paths: StatPath[]; op: Op; v: number }[];
  /** Mots à trouver dans le texte. */
  text: string[];
  min: number | null;
  max: number | null;
}

const test = (a: number, op: Op, b: number) =>
  op === '>' ? a > b : op === '>=' ? a >= b : op === '<' ? a < b : op === '<=' ? a <= b : a === b;

export function parseQuery(q: string): Query {
  const out: Query = { stats: [], cmp: [], text: [], min: null, max: null };
  // « agi > 10 » → « agi>10 » ; « niv 20 » → « niv20 »
  const words = norm(q)
    .replace(/\s*(>=|<=|>|<|=)\s*/g, '$1')
    .replace(/\b(niv|niveau|lvl|lv)\s+(?=\d)/g, '$1')
    .split(' ')
    .filter(Boolean);
  const lvl = (op: Op, v: number) => {
    if (op === '>' || op === '>=') out.min = Math.max(out.min ?? 0, op === '>' ? v + 1 : v);
    else if (op === '<' || op === '<=') out.max = Math.min(out.max ?? Infinity, op === '<' ? v - 1 : v);
    else out.min = out.max = v;
  };
  for (let i = 0; i < words.length; ) {
    // stat en plusieurs mots
    let used = 0;
    for (let n = Math.min(MAX_WORDS, words.length - i); n >= 1 && !used; n--) {
      const key = words.slice(i, i + n).join(' ');
      const paths = ALIAS.get(key);
      if (paths) {
        out.stats.push(paths);
        used = n;
      }
    }
    if (used) {
      i += used;
      continue;
    }
    const w = words[i++];
    let m: RegExpMatchArray | null;
    if ((m = w.match(/^(?:niv|niveau|lvl|lv)?(\d+)-(\d+)$/))) {
      lvl('>=', Number(m[1]));
      lvl('<=', Number(m[2]));
    } else if ((m = w.match(/^(?:niv|niveau|lvl|lv)?(>=|<=|>|<|=)?(\d+)$/))) {
      lvl((m[1] as Op) ?? '=', Number(m[2]));
    } else if ((m = w.match(/^([a-z%]+)(>=|<=|>|<|=)(-?\d+)$/)) && ALIAS.has(m[1])) {
      out.cmp.push({ paths: ALIAS.get(m[1])!, op: m[2] as Op, v: Number(m[3]) });
    } else out.text.push(w);
  }
  return out;
}

/* ---------- Ce que l'on sait d'une ligne (objet, ressource, recette, panoplie) ---------- */

export interface Facets {
  name: string;
  level: number;
  slot: ItemSlot | null;
  set: number | null;
  /** Stat → valeur (jets réels si possédé, haut de la fourchette sinon). */
  stats: Map<StatPath, number>;
  /** Texte en plus pour la recherche (type, panoplie, ingrédients, provenance…). */
  text: string[];
  /** Interrupteurs : fav, lock, usable, new, worn, owned, craftable, missing1… */
  flags: Set<string>;
  /** Ordre d'arrivée (tri « récents »). */
  order: number;
}

export type SortKey = 'level' | 'levelAsc' | 'name' | 'stat' | 'new';
export interface Filters {
  q: string;
  slot: ItemSlot | '';
  stat: StatPath;
  set: number;
  min: number | null;
  max: number | null;
  only: string[];
  sort: SortKey;
}
export const emptyFilters = (): Filters => ({ q: '', slot: '', stat: '', set: 0, min: null, max: null, only: [], sort: 'level' });
/** Nombre de filtres actifs (hors texte et tri). */
export const activeCount = (f: Filters) =>
  Number(!!f.slot) + Number(!!f.stat) + Number(!!f.set) + Number(f.min !== null) + Number(f.max !== null) + f.only.length;

const haystack = new WeakMap<Facets, string>();
function hay(f: Facets): string {
  let h = haystack.get(f);
  if (h === undefined) {
    h = norm([f.name, ...f.text, f.set ? SETS[f.set]?.name ?? '' : '', ...[...f.stats.keys()].map(statLabel)].join(' | '));
    haystack.set(f, h);
  }
  return h;
}

const has = (f: Facets, paths: StatPath[]) => paths.some((p) => (f.stats.get(p) ?? 0) > 0);
const best = (f: Facets, paths: StatPath[]) => Math.max(...paths.map((p) => f.stats.get(p) ?? 0));

export function matches(f: Facets, q: Query, flt: Filters): boolean {
  if (flt.slot && f.slot !== flt.slot) return false;
  if (flt.set && f.set !== flt.set) return false;
  if (flt.stat && !has(f, [flt.stat])) return false;
  const min = Math.max(flt.min ?? -Infinity, q.min ?? -Infinity);
  const max = Math.min(flt.max ?? Infinity, q.max ?? Infinity);
  if (f.level < min || f.level > max) return false;
  if (flt.only.some((k) => !f.flags.has(k))) return false;
  if (q.stats.some((g) => !has(f, g))) return false;
  if (q.cmp.some((c) => !test(best(f, c.paths), c.op, c.v))) return false;
  const h = hay(f);
  return q.text.every((w) => h.includes(w));
}

/** La stat à mettre en avant (menu « Stat », sinon la première stat tapée). */
export function focusStat(flt: Filters, q: Query = parseQuery(flt.q)): StatPath[] {
  if (flt.stat) return [flt.stat];
  return q.cmp[0]?.paths ?? q.stats[0] ?? [];
}

/** Valeur de la stat mise en avant (null si aucune). */
export function focusValue(f: Facets, paths: StatPath[]): number | null {
  if (!paths.length) return null;
  const v = best(f, paths);
  return v || null;
}

/** Filtre et trie. Les favoris passent toujours en premier. */
export function applyFilters<T extends { facets: Facets }>(rows: T[], flt: Filters): T[] {
  const q = parseQuery(flt.q);
  const focus = focusStat(flt, q);
  const key = (r: T) => r.facets;
  const by: Record<SortKey, (a: Facets, b: Facets) => number> = {
    level: (a, b) => b.level - a.level,
    levelAsc: (a, b) => a.level - b.level,
    name: () => 0,
    stat: (a, b) => (focus.length ? best(b, focus) - best(a, focus) : b.level - a.level),
    new: (a, b) => b.order - a.order,
  };
  return rows
    .filter((r) => matches(key(r), q, flt))
    .sort((ra, rb) => {
      const a = key(ra), b = key(rb);
      return Number(b.flags.has('fav')) - Number(a.flags.has('fav')) || by[flt.sort](a, b) || a.name.localeCompare(b.name, 'fr') || a.order - b.order;
    });
}
