/**
 * Sauvegarde locale (sur l'appareil). Tout ce qui doit survivre d'une partie à l'autre passe par ici :
 * records, niveau et caractéristiques, ressources, inventaire et équipement porté.
 *
 * Règle de mort (document de design §7.3) : on garde l'XP et les ressources ramassées pendant la partie,
 * on perd le butin du boss.
 */
import { addXp, defaultProfile, type Profile } from './progression';
import { isEquipment, ITEMS } from './data/items';
import { addItem, rollItem, starterInventory, type Inventory } from './inventory';

export interface SaveData {
  v: 3;
  runs: number;
  wins: number;
  /** Plus loin atteint (numéro de salle). */
  bestRoom: number;
  /** Victoire la plus rapide (s). */
  bestWinTime: number | null;
  /** XP totale gagnée en jeu (statistique) ; l'XP du personnage est dans `profile`. */
  xp: number;
  /** Ressources : identifiant DofusDB → quantité. */
  resources: Record<string, number>;
  /** Niveau (via l'XP) et caractéristiques du Sacrieur. */
  profile: Profile;
  /** Équipements possédés (avec leurs jets) et objets portés. */
  inventory: Inventory;
}

/** Ce qu'une partie rapporte. */
export interface Loot {
  xp: number;
  /** Objets ramassés (ressources et équipements) : identifiant DofusDB → quantité. */
  items: Record<string, number>;
}

export interface RunResult {
  won: boolean;
  room: number;
  time: number;
  kills: number;
  dealt: number;
  taken: number;
  healed: number;
  cards: string[];
  /** Ramassé pendant la partie : gardé même en cas de défaite. */
  loot: Loot;
  /** Butin du boss : seulement en cas de victoire. */
  bossLoot: Loot;
}

const KEY = 'dofus-enzo-save';

export const emptySave = (): SaveData => ({
  v: 3, runs: 0, wins: 0, bestRoom: 0, bestWinTime: null, xp: 0, resources: {}, profile: defaultProfile(), inventory: starterInventory(),
});

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySave();
    const d = JSON.parse(raw) as Partial<SaveData>;
    // version 1 : pas encore de profil ; versions 1 et 2 : pas d'inventaire → équipement de départ
    const base = emptySave();
    const profile = d.profile ? { xp: d.profile.xp ?? base.profile.xp, carac: { ...base.profile.carac, ...d.profile.carac } } : base.profile;
    const inventory = d.inventory?.items ? { ...d.inventory, items: d.inventory.items.filter((i) => ITEMS[i.id]) } : base.inventory;
    // les ressources inconnues (anciennes versions) sont ignorées
    const resources = Object.fromEntries(Object.entries(d.resources ?? {}).filter(([k]) => ITEMS[Number(k)]));
    return { ...base, ...d, profile, inventory, resources, v: 3 };
  } catch {
    return emptySave();
  }
}

export function storeSave(d: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* stockage indisponible (navigation privée) : la partie continue sans sauvegarde */
  }
}

/** Ajoute le butin : XP au profil, ressources au stock, équipements à l'inventaire (jets tirés ici). Renvoie les nouveaux objets. */
const addLoot = (d: SaveData, l: Loot, rnd: () => number): number[] => {
  d.xp += l.xp;
  d.profile = addXp(d.profile, l.xp);
  const fresh: number[] = [];
  for (const [k, n] of Object.entries(l.items)) {
    const id = Number(k);
    if (!ITEMS[id]) continue;
    if (!isEquipment(id)) {
      d.resources[k] = (d.resources[k] ?? 0) + n;
      continue;
    }
    for (let i = 0; i < n; i++) {
      d.inventory = addItem(d.inventory, id, rollItem(id, rnd));
      fresh.push(d.inventory.nextUid - 1);
    }
  }
  return fresh;
};

/** Applique le résultat d'une partie à la sauvegarde (sans l'écrire). `fresh` : uid des équipements obtenus. */
export function applyRun(d: SaveData, r: RunResult, rnd: () => number = Math.random): { save: SaveData; fresh: number[] } {
  const out: SaveData = { ...d, resources: { ...d.resources }, profile: { ...d.profile, carac: { ...d.profile.carac } } };
  out.runs++;
  out.bestRoom = Math.max(out.bestRoom, r.room);
  const fresh = addLoot(out, r.loot, rnd);
  if (r.won) {
    out.wins++;
    out.bestWinTime = out.bestWinTime === null ? r.time : Math.min(out.bestWinTime, r.time);
    fresh.push(...addLoot(out, r.bossLoot, rnd));
  }
  return { save: out, fresh };
}
