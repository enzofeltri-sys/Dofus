import { PASSIVES, SPELLS, spellsForLevel, type PassiveId, type SpellId } from './data/spells';
import type { World } from './world';

/**
 * Cartes proposées entre deux salles (1 au choix parmi 3) : nouveau sort, amélioration d'un sort,
 * ou bonus de caractéristique. Tout est valable pour le donjon en cours seulement.
 */
export type StatBonus = 'force' | 'vitalite' | 'critique' | 'speed';
export type Card =
  | { kind: 'spell'; spell: SpellId }
  | { kind: 'upgrade'; spell: SpellId; up: 'dmg' | 'cd' }
  | { kind: 'stat'; stat: StatBonus }
  | { kind: 'passive'; passive: PassiveId };

export const STAT_BONUS: Record<StatBonus, { value: number; title: string; text: string }> = {
  force: { value: 15, title: 'Force +15', text: 'Plus de dégâts Terre et Neutre : épée, Supplice.' },
  vitalite: { value: 20, title: 'Vitalité +20', text: '+20 PV max, et tu récupères 20 PV tout de suite.' },
  critique: { value: 5, title: 'Critique +5 %', text: 'Plus de coups critiques, pour l’épée comme pour les sorts.' },
  speed: { value: 0.08, title: 'Vitesse +8 %', text: 'Tu te déplaces plus vite, pour mieux esquiver.' },
};
export const UPGRADE = { dmg: 0.2, cd: 0.2, cdMax: 0.4 };

const key = (c: Card) => JSON.stringify(c);

/** Tire 3 cartes différentes. Tant qu'il reste une case vide, au moins un nouveau sort est proposé. */
export function drawCards(w: World, rnd: () => number, favorites: SpellId[] = []): Card[] {
  const owned = w.run.slots.filter((s) => s !== null).map((s) => s!.id);
  const free = w.run.slots.some((s) => s === null);
  const newSpells = spellsForLevel(w.hero.def.level).map((s) => s.id).filter((id) => !owned.includes(id));
  const spellCards: Card[] = newSpells.map((spell) => ({ kind: 'spell', spell }));
  const upCards: Card[] = owned.flatMap((spell) => {
    const sl = w.run.slots.find((s) => s?.id === spell)!;
    const c: Card[] = [{ kind: 'upgrade', spell, up: 'dmg' }];
    if (sl.cdBonus < UPGRADE.cdMax - 1e-6) c.push({ kind: 'upgrade', spell, up: 'cd' });
    return c;
  });
  const statCards: Card[] = (Object.keys(STAT_BONUS) as StatBonus[]).map((stat) => ({ kind: 'stat', stat }));
  const passiveCards: Card[] = (Object.keys(PASSIVES) as PassiveId[])
    .filter((p) => (w.run.passives[p] ?? 0) < PASSIVES[p].max)
    .map((passive) => ({ kind: 'passive', passive }));

  const weight = (c: Card) => {
    if (c.kind === 'spell') return (free ? 3 : 0.8) * (favorites.includes(c.spell) ? 2.5 : 1);
    if (c.kind === 'upgrade') return 1.4 * (favorites.includes(c.spell) ? 1.6 : 1);
    if (c.kind === 'passive') return 0.9;
    return 0.8;
  };
  const pick = (pool: Card[], taken: Card[]): Card | null => {
    const left = pool.filter((c) => !taken.some((t) => key(t) === key(c)));
    const total = left.reduce((a, c) => a + weight(c), 0);
    let r = rnd() * total;
    for (const c of left) if ((r -= weight(c)) <= 0) return c;
    return left[left.length - 1] ?? null;
  };

  const out: Card[] = [];
  if (free && spellCards.length) out.push(pick(spellCards, out)!);
  const all = [...spellCards, ...upCards, ...statCards, ...passiveCards];
  while (out.length < 3) {
    const c = pick(all, out);
    if (!c) break;
    out.push(c);
  }
  return out;
}

/** Une carte « nouveau sort » demande une case à remplacer si toutes sont prises. */
export const needsReplace = (w: World, c: Card) => c.kind === 'spell' && !w.run.slots.some((s) => s === null);

export function applyCard(w: World, c: Card, replaceSlot?: number) {
  const run = w.run;
  if (c.kind === 'spell') {
    const i = run.slots.findIndex((s) => s === null);
    const at = i >= 0 ? i : (replaceSlot ?? run.slots.length - 1);
    run.slots[at] = { id: c.spell, dmgBonus: 0, cdBonus: 0, cd: 0 };
  } else if (c.kind === 'upgrade') {
    const sl = run.slots.find((s) => s?.id === c.spell);
    if (!sl) return;
    if (c.up === 'dmg') sl.dmgBonus += UPGRADE.dmg;
    else sl.cdBonus = Math.min(UPGRADE.cdMax, sl.cdBonus + UPGRADE.cd);
  } else if (c.kind === 'passive') {
    run.passives[c.passive] = (run.passives[c.passive] ?? 0) + 1;
  } else {
    const v = STAT_BONUS[c.stat].value;
    run[c.stat] += v;
    if (c.stat === 'vitalite') {
      w.hero.maxHp += v;
      w.healHero(v);
    }
  }
}

/** Échange deux cases (ordre de priorité). */
export function swapSlots(w: World, a: number, b: number) {
  const s = w.run.slots;
  [s[a], s[b]] = [s[b], s[a]];
}

/** Textes d'une carte pour l'écran de choix. */
export function cardInfo(w: World, c: Card): { tag: string; title: string; text: string; spell?: SpellId; stat?: StatBonus; passive?: PassiveId } {
  if (c.kind === 'spell') return { tag: 'Nouveau sort', title: SPELLS[c.spell].name, text: SPELLS[c.spell].text, spell: c.spell };
  if (c.kind === 'upgrade') {
    const sl = w.run.slots.find((s) => s?.id === c.spell);
    const name = SPELLS[c.spell].name;
    return c.up === 'dmg'
      ? { tag: 'Amélioration', title: `${name} : dégâts +20 %`, text: `Total : +${Math.round(((sl?.dmgBonus ?? 0) + UPGRADE.dmg) * 100)} % de dégâts pour ce donjon.`, spell: c.spell }
      : { tag: 'Amélioration', title: `${name} : recharge -20 %`, text: `Se relance plus souvent (jusqu’à -40 %).`, spell: c.spell };
  }
  if (c.kind === 'passive') {
    const p = PASSIVES[c.passive], n = w.run.passives[c.passive] ?? 0;
    return { tag: n ? `Passif · ${n + 1}/${p.max}` : 'Passif', title: p.name, text: p.text, passive: c.passive };
  }
  const b = STAT_BONUS[c.stat];
  return { tag: 'Bonus', title: b.title, text: b.text, stat: c.stat };
}
