import { fmtLine, item, SETS, statLabel } from '../game/data/items';
import { RARITIES } from '../game/forge';
import { recipeFor, canCraft, usable, type Workshop } from '../game/craft';
import { betterThanWorn, dropAreasOf, openZones, ownedOf, zoneOfArea, zoneSets } from '../game/collection';
import { itemLines, setCounts } from '../game/inventory';
import { ZONE_EQUIP_CHANCE } from '../game/loot';
import { itemIconImg } from './item-icons';

/** Écran Panoplies (refonte validée par Enzo) : la collection de la zone choisie. */
export interface SetPieceView {
  id: number;
  icon: string;
  name: string;
  owned: number;
  rarity: number;
  worn: boolean;
  /** 3 exemplaires identiques : peut monter de rang. */
  fusable: boolean;
}
export interface SetCardView {
  id: number;
  name: string;
  level: number;
  have: number;
  total: number;
  pieces: SetPieceView[];
  /** Bonus actuel (pièces portées) et bonus de la panoplie complète. */
  bonusNow: string;
  bonusFull: string;
  /** Plus haute que le personnage : un objectif. */
  goal: boolean;
}
export interface SetsView {
  zones: { id: string; name: string }[];
  zone: string;
  sets: SetCardView[];
  /** Pièces prêtes à monter de rang (texte du bandeau). */
  ready: { id: number; name: string; next: string }[];
}

const bonusText = (s: number, n: number) => (n > 0 ? (SETS[s].bonus[n - 1] ?? []).map(([p, v]) => fmtLine(p, v)).join(' · ') : '');

export function setsView(w: Workshop, done: string[], area: string, heroLevel: number, zone?: string): SetsView {
  const zones = openZones(done, heroLevel).map((z) => ({ id: z.id, name: z.name }));
  const z = zone && zones.some((x) => x.id === zone) ? zone : zones.some((x) => x.id === zoneOfArea(area)) ? zoneOfArea(area) : zones[0]?.id ?? '';
  const worn = setCounts(w.inventory);
  const ready: SetsView['ready'] = [];
  const sets = zoneSets(z).map((s): SetCardView => {
    const pieces = s.pieces.map((id): SetPieceView => {
      const o = ownedOf(w.inventory, id);
      if (o.fusable !== null) ready.push({ id, name: item(id).name, next: RARITIES[Math.min(RARITIES.length - 1, (w.inventory.items.find((x) => x.uid === o.fusable)?.rarity ?? 0) + 1)] });
      return { id, icon: itemIconImg(id), name: item(id).name, owned: o.count, rarity: o.rarity, worn: o.worn, fusable: o.fusable !== null };
    });
    const n = worn.get(s.id) ?? 0;
    return {
      id: s.id, name: s.name, level: s.level, have: pieces.filter((p) => p.owned).length, total: pieces.length, pieces,
      bonusNow: n >= 2 ? `Porté ${n} : ${bonusText(s.id, n)}` : '', bonusFull: bonusText(s.id, s.pieces.length), goal: s.level > heroLevel,
    };
  });
  return { zones, zone: z, sets, ready };
}

/** Fiche d'une pièce (possédée ou non) vue depuis la collection. */
export interface PieceView {
  id: number;
  icon: string;
  name: string;
  sub: string;
  lines: string[];
  /** Exemplaires possédés. */
  owned: { uid: number; rarity: number; text: string; worn: boolean; fusable: boolean }[];
  /** Où elle tombe. */
  sources: string[];
  recipe: { ings: { icon: string; name: string; have: number; need: number }[]; ok: boolean; reason: string } | null;
  /** Comparée à ce qui est porté (jets moyens si pas possédée). */
  compare: 'up' | 'down' | 'same' | null;
}

const pct = (v: number) => `${Math.round(v * 100)} %`;

export function pieceView(w: Workshop, id: number, weights: Record<string, number>): PieceView {
  const d = item(id);
  const mine = w.inventory.items.filter((o) => o.id === id).sort((a, b) => (b.rarity ?? 0) - (a.rarity ?? 0));
  const areas = dropAreasOf(id);
  const sources = areas.length
    ? [`${areas.map((a) => a.name).join(', ')}`, `${pct(ZONE_EQUIP_CHANCE.monster)} par monstre, ${pct(ZONE_EQUIP_CHANCE.monster * ZONE_EQUIP_CHANCE.elite)} par élite, ${pct(ZONE_EQUIP_CHANCE.boss)} par boss (une pièce au hasard des panoplies de la carte)`]
    : ['Ne tombe pas : à fabriquer'];
  const r = recipeFor(id);
  const c = r ? canCraft(w, r) : null;
  const best = mine[0];
  return {
    id, icon: itemIconImg(id), name: d.name,
    sub: `${mine.length ? `${mine.length} exemplaire${mine.length > 1 ? 's' : ''}` : 'Pas encore obtenue'} · ${d.type} · niveau ${d.level}`,
    lines: d.effects.map(([p, a, b]) => (a === b ? fmtLine(p, b) : `${a >= 0 ? '+' : ''}${a} à ${b} ${statLabel(p)}`)),
    owned: mine.map((o) => ({
      uid: o.uid, rarity: o.rarity ?? 0, worn: Object.values(w.inventory.equipped).includes(o.uid),
      text: `${RARITIES[o.rarity ?? 0]} · ${itemLines(o).slice(0, 3).map(([p, v]) => fmtLine(p, v)).join(' · ')}`,
      fusable: ownedOf(w.inventory, id).fusable === o.uid,
    })),
    sources,
    recipe: r && c ? { ings: r.ingredients.map(([i, n]) => ({ icon: itemIconImg(i), name: item(i).name, have: usable(w, i), need: n })), ok: c.ok, reason: c.ok ? '' : c.reason } : null,
    compare: best ? (Object.values(w.inventory.equipped).includes(best.uid) ? null : betterThanWorn(w.inventory, id, weights, best.rolls)) : betterThanWorn(w.inventory, id, weights),
  };
}
