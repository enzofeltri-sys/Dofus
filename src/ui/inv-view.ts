import { fmtLine, item, SETS, SLOT_NAME, SLOTS, statLabel, type SlotId } from '../game/data/items';
import { canEquip, compare, instance, isWorn, itemLines, setBonus, setCounts, type Inventory } from '../game/inventory';
import { itemIconImg } from './item-icons';

/** Inventaire tel qu'affiché au camp (construit depuis la sauvegarde). */
export interface InvView {
  slots: { slot: SlotId; name: string; uid: number | null; icon: string; locked: boolean }[];
  sets: { name: string; count: number; total: number; bonus: string[] }[];
  equipment: { uid: number; icon: string; name: string; level: number; worn: boolean; usable: boolean; fresh: boolean }[];
  resources: { id: number; icon: string; name: string; count: number }[];
}

export interface ItemDetail {
  icon: string;
  name: string;
  sub: string;
  lines: { text: string; range: string }[];
  set: { name: string; count: number; total: number; rows: { n: number; text: string; on: boolean }[] } | null;
  /** Écarts si on l'équipe (ou si on le retire). */
  diff: { text: string; up: boolean }[];
  diffTitle: string;
  action: { label: string; enabled: boolean; reason: string } | null;
  note: string;
}

/** Cases sans objet possible pour l'instant (pas encore de familiers, boucliers ni Dofus dans le jeu). */
const NOT_YET: SlotId[] = ['bouclier', 'familier', 'dofus1', 'dofus2', 'dofus3', 'dofus4', 'dofus5', 'dofus6'];

export function invView(inv: Inventory, resources: Record<string, number>, level: number, fresh: Set<number>): InvView {
  const counts = setCounts(inv);
  return {
    slots: SLOTS.map((slot) => {
      const uid = inv.equipped[slot] ?? null;
      const it = uid !== null ? instance(inv, uid) : undefined;
      return { slot, name: SLOT_NAME[slot], uid: it ? uid : null, icon: it ? itemIconImg(it.id) : '', locked: NOT_YET.includes(slot) };
    }),
    sets: [...counts].map(([id, n]) => ({
      name: SETS[id].name, count: n, total: SETS[id].items.length,
      bonus: setBonus(id, n).map(([p, v]) => fmtLine(p, v)),
    })),
    equipment: [...inv.items]
      .sort((a, b) => Number(isWorn(inv, b.uid)) - Number(isWorn(inv, a.uid)) || item(b.id).level - item(a.id).level || a.uid - b.uid)
      .map((it) => ({
        uid: it.uid, icon: itemIconImg(it.id), name: item(it.id).name, level: item(it.id).level,
        worn: isWorn(inv, it.uid), usable: level >= item(it.id).level, fresh: fresh.has(it.uid),
      })),
    resources: Object.entries(resources)
      .filter(([, n]) => n > 0)
      .map(([k, n]) => ({ id: Number(k), icon: itemIconImg(Number(k)), name: item(Number(k)).name, count: n }))
      .sort((a, b) => item(a.id).level - item(b.id).level || a.name.localeCompare(b.name)),
  };
}

/** Fiche d'un équipement possédé : jets, panoplie, comparaison, bouton. */
export function equipmentDetail(inv: Inventory, uid: number, level: number): ItemDetail {
  const it = instance(inv, uid)!;
  const d = item(it.id);
  const worn = isWorn(inv, uid);
  const lines = itemLines(it).map(([p, v], i) => {
    const [, a, b] = d.effects[i];
    return { text: fmtLine(p, v), range: a === b ? '' : `${a} à ${b}` };
  });
  let set: ItemDetail['set'] = null;
  if (d.set) {
    const s = SETS[d.set];
    const n = setCounts(inv).get(d.set) ?? 0;
    set = {
      name: s.name, count: n, total: s.items.length,
      rows: s.bonus.map((b, i) => ({ n: i + 1, text: b.map(([p, v]) => fmtLine(p, v)).join(', '), on: i + 1 === n })).filter((r) => r.text),
    };
  }
  const check = canEquip(inv, uid, level);
  return {
    icon: itemIconImg(it.id, 'big'),
    name: d.name,
    sub: `${d.type} · niveau ${d.level}`,
    lines, set,
    diff: compare(inv, uid, level).map(([p, v]) => ({ text: `${v > 0 ? '+' : ''}${v} ${statLabel(p)}`, up: v > 0 })),
    diffTitle: worn ? 'Si tu le retires' : 'Si tu l’équipes',
    action: worn
      ? { label: 'Retirer', enabled: true, reason: '' }
      : { label: 'Équiper', enabled: check.ok, reason: check.ok ? '' : check.reason },
    note: '',
  };
}

/** Fiche d'une ressource. */
export function resourceDetail(id: number, count: number): ItemDetail {
  const d = item(id);
  return {
    icon: itemIconImg(id, 'big'), name: d.name, sub: `${d.type} · niveau ${d.level} · ×${count}`,
    lines: [], set: null, diff: [], diffTitle: '', action: null,
    note: 'Ressource : elle servira à fabriquer de l’équipement avec le métier d’Artisan (étape 7).',
  };
}
