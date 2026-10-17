import { GRIMOIRE } from '../game/data/grimoire.gen';
import { SPELLS, type SpellId } from '../game/data/spells';
import { ICONS } from './grimoire-icons';
import { SPELL_ICONS } from './spell-icons';

/** Ligne du Grimoire : un sort du Sacrieur, son niveau réel, et s'il est débloqué, à venir (niveau) ou pas encore dans le jeu. */
export interface GrimoireRow {
  id: SpellId | null;
  name: string;
  level: number;
  pa: number;
  text: string;
  icon: string;
  state: 'ok' | 'locked' | 'later';
  fav: boolean;
}

export function grimoireView(level: number, favs: SpellId[]): GrimoireRow[] {
  return GRIMOIRE.map((g) => {
    const sp = g.id ? SPELLS[g.id] : null;
    return {
      id: g.id, name: g.name, level: g.level, pa: g.pa,
      // sorts du jeu : ce qu'ils font en temps réel ; les autres : la description de Dofus
      text: sp ? sp.text : g.text,
      icon: g.id ? SPELL_ICONS[g.id] : ICONS.pa.svg,
      state: !sp ? 'later' : level >= g.level ? 'ok' : 'locked',
      fav: !!g.id && favs.includes(g.id),
    };
  });
}
