import { weaponDef } from '../game/data/hero';
import { baseStats, finalMultiplier, rawDamage, type Stats } from '../game/formulas';
import { fmtLine, isSpecial, ITEMS, item, SETS, SLOT_NAME, SLOTS, statLabel, type SlotId, type StatPath } from '../game/data/items';
import { canEquip, compare, instance, isWorn, itemLines, setBonus, setCounts, type Inventory } from '../game/inventory';
import type { Facets } from '../game/search';
import { sourcesOf, sourceText, usedIn } from '../game/sources';
import { RARITIES, rangesFor } from '../game/forge';
import { itemIconImg } from './item-icons';

/** Inventaire tel qu'affiché au camp (construit depuis la sauvegarde). */
export interface InvView {
  slots: { slot: SlotId; name: string; uid: number | null; icon: string; locked: boolean; rarity: number }[];
  sets: { name: string; count: number; total: number; bonus: string[] }[];
  equipment: { uid: number; icon: string; name: string; level: number; rarity: number; worn: boolean; usable: boolean; fresh: boolean; fav: boolean; lock: boolean; facets: Facets }[];
  resources: { id: number; icon: string; name: string; count: number; fav: boolean; lock: boolean; facets: Facets }[];
  /** Encyclopédie : tout l'équipement du jeu. */
  catalog: { id: number; icon: string; name: string; level: number; owned: number; facets: Facets }[];
  /** Encyclopédie : toutes les panoplies (stats = toutes les pièces au maximum + bonus complet). */
  allSets: { id: number; name: string; level: number; owned: number; total: number; pieces: { id: number; icon: string; owned: boolean }[]; bonus: string; facets: Facets }[];
}

/** Marques que l'on peut poser sur un objet ou une ressource. */
export type Mark = 'fav' | 'lock';
/** Lien vers un autre panneau (Atelier filtré, panoplie dans l'Encyclopédie…). */
export interface Link {
  label: string;
  /** « set:<id> », « uses:<id de ressource> », « recipe:<id d'objet> ». */
  go: string;
}

export interface ItemDetail {
  icon: string;
  name: string;
  /** Rang de rareté (couleur du nom et du cadre). */
  rarity: number;
  sub: string;
  lines: { text: string; range: string }[];
  set: { name: string; count: number; total: number; rows: { n: number; text: string; on: boolean }[] } | null;
  /** Écarts si on l'équipe (ou si on le retire). */
  diff: { text: string; up: boolean }[];
  diffTitle: string;
  action: { label: string; enabled: boolean; reason: string } | null;
  note: string;
  /** Où l'obtenir. */
  sources: string[];
  /** Favori / verrou (null : pas de marque possible). */
  marks: { fav: boolean; lock: boolean } | null;
  links: Link[];
  /** Familier ou Dofus : pas de fusion, de brisage ni de forgemagie. */
  special?: boolean;
  /** Arme : lignes de dommages (élément, valeurs de Dofus et en jeu), PA, portée, critique. */
  weapon?: { lines: { el: string; text: string; range: string }[]; info: string };
  /** Familier : croissance (%) et Super Croquettes en stock. */
  pet?: { pct: number; food: number };
}

/** Cases sans objet possible pour l'instant (familiers et Dofus sont arrivés). */
const NOT_YET: SlotId[] = [];

const EL_NAME: Record<string, string> = { neutre: 'Neutre', terre: 'Terre', feu: 'Feu', eau: 'Eau', air: 'Air' };
const span = (a: number, b: number) => (a === b ? `${a}` : `${a} à ${b}`);
/**
 * Fiche d'arme (demandé par Enzo) : dommages par élément — valeur de Dofus, et dommages réels en jeu avec les caractéristiques actuelles
 * du Sacrieur (même calcul qu'en combat, sur une cible sans résistance ; critique entre parenthèses) —, PA, portée, critique.
 */
export function weaponBlock(id: number, stats?: Stats): ItemDetail['weapon'] {
  const w = item(id).weapon;
  if (!w) return undefined;
  const def = weaponDef(id);
  const s = stats ?? baseStats();
  const mult = finalMultiplier({ melee: !def.ranged, source: 'arme' }, s, baseStats());
  const hit = (base: number, el: (typeof def.lines)[number]['element'], crit: boolean) => Math.floor(rawDamage(base, el, s, crit) * mult);
  return {
    lines: w.lines.map(([el, a, b, steal], i) => {
      const L = def.lines[i];
      return {
        el,
        text: `${steal ? 'Vol de vie' : 'Dommages'} ${EL_NAME[el]} ${span(a, b)}`,
        range: `en jeu ${span(hit(L.min, L.element, false), hit(L.max, L.element, false))} (critique ${span(hit(L.min + L.critBonus, L.element, true), hit(L.max + L.critBonus, L.element, true))})`,
      };
    }),
    info: `${w.pa} PA · portée ${w.minRange === w.range ? w.range : `${w.minRange} à ${w.range}`} · critique ${w.crit} %${w.critBonus ? ` (+${w.critBonus} dommages)` : ''}`,
  };
}

/** Haut de la fourchette (ou bas pour un malus). */
const top = (a: number, b: number) => (Math.abs(b) >= Math.abs(a) ? b : a);
const rangeStats = (id: number) => new Map(item(id).effects.map(([p, a, b]) => [p, top(a, b)] as [StatPath, number]));

export interface Marks {
  fav: number[];
  lock: number[];
}

export function invView(inv: Inventory, resources: Record<string, number>, level: number, fresh: Set<number>, resMarks: Marks = { fav: [], lock: [] }): InvView {
  const counts = setCounts(inv);
  const ownedIds = new Map<number, number>();
  for (const it of inv.items) ownedIds.set(it.id, (ownedIds.get(it.id) ?? 0) + 1);
  const equipIds = Object.values(ITEMS).filter((d) => d.slot).map((d) => d.id);
  return {
    slots: SLOTS.map((slot) => {
      const uid = inv.equipped[slot] ?? null;
      const it = uid !== null ? instance(inv, uid) : undefined;
      return { slot, name: SLOT_NAME[slot], uid: it ? uid : null, icon: it ? itemIconImg(it.id) : '', locked: NOT_YET.includes(slot), rarity: it?.rarity ?? 0 };
    }),
    sets: [...counts].map(([id, n]) => ({
      name: SETS[id].name, count: n, total: SETS[id].items.length,
      bonus: setBonus(id, n).map(([p, v]) => fmtLine(p, v)),
    })),
    equipment: inv.items.map((it) => {
      const d = item(it.id);
      const worn = isWorn(inv, it.uid), usable = level >= d.level, isNew = fresh.has(it.uid);
      const flags = new Set<string>();
      if (it.fav) flags.add('fav');
      if (it.lock) flags.add('lock');
      if (usable) flags.add('usable');
      if (isNew) flags.add('new');
      if (worn) flags.add('worn');
      return {
        uid: it.uid, icon: itemIconImg(it.id), name: d.name, level: d.level, rarity: it.rarity ?? 0, worn, usable, fresh: isNew, fav: !!it.fav, lock: !!it.lock,
        facets: { name: d.name, level: d.level, slot: d.slot, set: d.set, stats: new Map(itemLines(it)), text: [d.type, RARITIES[it.rarity ?? 0]], flags, order: it.uid, rarity: it.rarity ?? 0 },
      };
    }),
    resources: Object.entries(resources)
      .filter(([, n]) => n > 0)
      .map(([k, n]) => {
        const id = Number(k), d = item(id);
        const fav = resMarks.fav.includes(id), lock = resMarks.lock.includes(id);
        const flags = new Set<string>();
        if (fav) flags.add('fav');
        if (lock) flags.add('lock');
        if (usedIn(id).length) flags.add('used');
        return {
          id, icon: itemIconImg(id), name: d.name, count: n, fav, lock,
          facets: { name: d.name, level: d.level, slot: null, set: null, stats: new Map(), text: [d.type, sourceText(id)], flags, order: id },
        };
      }),
    catalog: equipIds.map((id) => {
      const d = item(id), owned = ownedIds.get(id) ?? 0, src = sourcesOf(id);
      const flags = new Set<string>();
      if (owned) flags.add('owned');
      if (level >= d.level) flags.add('usable');
      if (src.some((s) => s.kind === 'craft')) flags.add('craftable');
      if (src.some((s) => s.kind !== 'craft')) flags.add('drop');
      return {
        id, icon: itemIconImg(id), name: d.name, level: d.level, owned,
        facets: { name: d.name, level: d.level, slot: d.slot, set: d.set, stats: rangeStats(id), text: [d.type, sourceText(id)], flags, order: id },
      };
    }),
    allSets: Object.values(SETS).map((s) => {
      const stats = new Map<StatPath, number>();
      const add = (p: StatPath, v: number) => stats.set(p, (stats.get(p) ?? 0) + v);
      for (const id of s.items) if (ITEMS[id]) for (const [p, v] of rangeStats(id)) add(p, v);
      const full = s.bonus[s.items.length - 1] ?? [];
      for (const [p, v] of full) add(p, v);
      const pieces = s.items.filter((id) => ITEMS[id]).map((id) => ({ id, icon: itemIconImg(id), owned: ownedIds.has(id) }));
      const lv = Math.max(...pieces.map((p) => item(p.id).level));
      const owned = pieces.filter((p) => p.owned).length;
      const flags = new Set<string>();
      if (owned) flags.add('owned');
      if (owned === pieces.length) flags.add('complete');
      if (level >= lv) flags.add('usable');
      return {
        id: s.id, name: s.name, level: lv, owned, total: pieces.length, pieces,
        bonus: full.map(([p, v]) => fmtLine(p, v)).join(' · '),
        facets: { name: s.name, level: lv, slot: null, set: s.id, stats, text: ['panoplie', ...pieces.map((p) => `${item(p.id).name} ${item(p.id).type}`)], flags, order: s.id },
      };
    }),
  };
}

function setBlock(setId: number, count: number, label: string): ItemDetail['set'] {
  const s = SETS[setId];
  return {
    name: `${s.name} · ${count}/${s.items.length} ${label}`, count, total: s.items.length,
    rows: s.bonus.map((b, i) => ({ n: i + 1, text: b.map(([p, v]) => fmtLine(p, v)).join(', '), on: i + 1 === count })).filter((r) => r.text),
  };
}

/** Fiche d'un équipement possédé : jets, panoplie, comparaison, bouton. */
export function equipmentDetail(inv: Inventory, uid: number, level: number, food = 0, stats?: Stats): ItemDetail {
  const it = instance(inv, uid)!;
  const d = item(it.id);
  const worn = isWorn(inv, uid);
  const r = it.rarity ?? 0;
  const ranges = rangesFor(it.id, r);
  const lines = itemLines(it).map(([p, v], i) => {
    if (d.slot === 'familier') return { text: fmtLine(p, v), range: `max ${d.effects[i]?.[2] ?? v}` };
    if (!ranges[i]) return { text: fmtLine(p, v), range: r >= 4 ? 'ligne mythique' : 'ligne légendaire' };
    const [, a, b] = ranges[i];
    return { text: fmtLine(p, v), range: a === b ? '' : `${a} à ${b}` };
  });
  const check = canEquip(inv, uid, level);
  return {
    icon: itemIconImg(it.id, 'big'),
    name: d.name,
    rarity: r,
    sub: isSpecial(it.id) ? `${d.type} · niveau ${d.level}` : `${RARITIES[r]} · ${d.type} · niveau ${d.level}`,
    lines,
    set: d.set ? setBlock(d.set, setCounts(inv).get(d.set) ?? 0, 'portés') : null,
    special: isSpecial(it.id),
    weapon: weaponBlock(it.id, stats),
    pet: d.slot === 'familier' ? { pct: it.food ?? 100, food } : undefined,
    diff: compare(inv, uid, level).map(([p, v]) => ({ text: `${v > 0 ? '+' : ''}${v} ${statLabel(p)}`, up: v > 0 })),
    diffTitle: worn ? 'Si tu le retires' : 'Si tu l’équipes',
    action: worn
      ? { label: 'Retirer', enabled: true, reason: '' }
      : { label: 'Équiper', enabled: check.ok, reason: check.ok ? '' : check.reason },
    note: it.lock ? 'Verrouillé : il ne peut être ni brisé ni sacrifié dans une fusion.' : '',
    sources: [],
    marks: { fav: !!it.fav, lock: !!it.lock },
    links: d.set ? [{ label: 'Voir la panoplie', go: `set:${d.set}` }] : [],
  };
}

/** Fiche d'une ressource : provenance, recettes qui l'utilisent, favori / verrou. */
export function resourceDetail(id: number, count: number, marks: { fav: boolean; lock: boolean } = { fav: false, lock: false }): ItemDetail {
  const d = item(id);
  const uses = usedIn(id);
  return {
    icon: itemIconImg(id, 'big'), name: d.name, rarity: 0, sub: `${d.type} · niveau ${d.level} · ×${count}`,
    lines: [], set: null, diff: [], diffTitle: '', action: null,
    note: marks.lock
      ? 'Verrouillée : l’Atelier ne l’utilisera pas.'
      : uses.length ? `Sert à ${uses.length} recette${uses.length > 1 ? 's' : ''} de l’Atelier.` : 'Ne sert à aucune recette pour l’instant.',
    sources: sourcesOf(id).map((s) => s.text),
    marks,
    links: uses.length ? [{ label: 'Recettes qui l’utilisent', go: `uses:${id}` }] : [],
  };
}

/** Fiche Encyclopédie d'un équipement (possédé ou non) : fourchettes, panoplie complète, provenance. */
export function catalogDetail(inv: Inventory, id: number, stats?: Stats): ItemDetail {
  const d = item(id);
  const owned = inv.items.filter((i) => i.id === id).length;
  const src = sourcesOf(id);
  const links: Link[] = [];
  if (src.some((s) => s.kind === 'craft')) links.push({ label: 'Voir la recette', go: `recipe:${id}` });
  if (d.set) links.push({ label: 'Voir la panoplie', go: `set:${d.set}` });
  const own = d.set ? new Set(inv.items.map((i) => i.id)) : null;
  return {
    icon: itemIconImg(id, 'big'), name: d.name, rarity: 0, sub: `${d.type} · niveau ${d.level}${owned ? ` · possédé ×${owned}` : ' · pas encore obtenu'}`,
    lines: d.effects.map(([p, a, b]) => ({ text: a === b ? fmtLine(p, a) : `${a} à ${b} ${statLabel(p)}`, range: '' })),
    set: d.set && own ? setBlock(d.set, SETS[d.set].items.filter((i) => own.has(i)).length, 'possédées') : null,
    diff: [], diffTitle: '', action: null, note: '',
    sources: src.length ? src.map((s) => s.text) : ['Pas encore obtenable dans le jeu.'],
    weapon: weaponBlock(id, stats),
    marks: null,
    links,
  };
}
