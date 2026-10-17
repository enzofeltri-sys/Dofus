/**
 * Sauvegarde locale (sur l'appareil). Tout ce qui doit survivre d'une partie à l'autre passe par ici :
 * records, niveau et caractéristiques, ressources, inventaire et équipement porté.
 *
 * Règle de mort (document de design §7.3) : on garde l'XP et les ressources ramassées pendant la partie,
 * on perd le butin du boss.
 */
import { addXp, defaultProfile, emptyCarac, type Profile } from './progression';
import { isEquipment, ITEMS } from './data/items';
import { addItem, averageRolls, emptyInventory, equip, starterInventory, type Inventory } from './inventory';
import { addNew, rollRarity, type RaritySource } from './forge';
import { SACRI_COLORS, type SacriColors } from '../art/sacrieur-chibi';
import type { KeyState } from './keys';

export interface SaveData {
  v: 5;
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
  /** Couleurs du Sacrieur (peau, cheveux, 4 couleurs de vêtements). */
  appearance: SacriColors;
  /** XP totale du métier d'Artisan. */
  jobXp: number;
  /** Ressources marquées : favorites, verrouillées (l'atelier n'y touche pas). */
  resMarks: { fav: number[]; lock: number[] };
  /** Cartes et donjons terminés au moins une fois (arbre des zones). */
  done: string[];
  /** Carte ou donjon choisi au camp. */
  area: string;
  /** Clés gratuites du jour (donjons déjà vaincus). */
  keys?: KeyState;
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
  /** Carte ou donjon joué. */
  area?: string;
}

const KEY = 'dofus-enzo-save';

/** Départ validé par Enzo (étape 9a) : niveau 1, sans équipement, à mains nues, dans les Champs d'Incarnam. */
export const LEVEL1_START = true;
export const newProfile = (): Profile => ({ xp: 0, carac: emptyCarac() });

/** Bounihimée : vraie épée de Dofus 3 (niveau 1), réglée sur l'ancienne épée inventée. */
export const STARTER_WEAPON = 30828;
const withWeapon = (inv: Inventory): Inventory => {
  if (inv.equipped.arme !== undefined) return inv;
  const added = addItem(inv, STARTER_WEAPON, averageRolls(STARTER_WEAPON));
  return equip(added, added.nextUid - 1, 200);
};

export const emptySave = (): SaveData => ({
  v: 5, runs: 0, wins: 0, bestRoom: 0, bestWinTime: null, xp: 0, resources: {}, done: [], area: 'champs',
  profile: LEVEL1_START ? newProfile() : defaultProfile(),
  inventory: LEVEL1_START ? emptyInventory() : withWeapon(starterInventory()),
  appearance: { ...SACRI_COLORS }, jobXp: 0,
  resMarks: { fav: [], lock: [] },
});

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySave();
    const d = JSON.parse(raw) as Partial<SaveData> & { v?: number };
    const base = emptySave();
    // version 5 (étape 9a) : tout le monde repart niveau 1, à mains nues, dans les Champs ; seules les couleurs sont gardées
    if ((d.v ?? 1) < 5 && LEVEL1_START) return { ...base, appearance: { ...SACRI_COLORS, ...(d.appearance ?? {}) } };
    const old = (d.v ?? 1) < 4;
    const profile = d.profile ? { xp: d.profile.xp ?? base.profile.xp, carac: { ...base.profile.carac, ...d.profile.carac } } : base.profile;
    let inventory = d.inventory?.items ? { ...d.inventory, items: d.inventory.items.filter((i) => ITEMS[i.id]) } : base.inventory;
    // version 4 : l'épée inventée disparaît ; un personnage existant reçoit la Bounihimée (même puissance)
    if (old) inventory = withWeapon(inventory);
    // les ressources inconnues (anciennes versions) sont ignorées
    const resources = Object.fromEntries(Object.entries(d.resources ?? {}).filter(([k]) => ITEMS[Number(k)]));
    const appearance = { ...SACRI_COLORS, ...(d.appearance ?? {}) };
    const resMarks = { fav: d.resMarks?.fav ?? [], lock: d.resMarks?.lock ?? [] };
    return { ...base, ...d, profile, inventory, resources, appearance, resMarks, done: d.done ?? [], area: d.area ?? base.area, v: 5 };
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
const addLoot = (d: SaveData, l: Loot, rnd: () => number, src: RaritySource): number[] => {
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
      d.inventory = addNew(d.inventory, id, rollRarity(src, rnd), rnd);
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
  const fresh = addLoot(out, r.loot, rnd, 'monster');
  if (r.won) {
    out.wins++;
    if (r.area && !out.done.includes(r.area)) out.done = [...out.done, r.area];
    out.bestWinTime = out.bestWinTime === null ? r.time : Math.min(out.bestWinTime, r.time);
    fresh.push(...addLoot(out, r.bossLoot, rnd, 'boss'));
  }
  return { save: out, fresh };
}
