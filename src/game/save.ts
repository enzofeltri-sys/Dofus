/**
 * Sauvegarde locale (sur l'appareil). Tout ce qui doit survivre d'une partie à l'autre passe par ici :
 * records aujourd'hui ; XP, ressources, équipement aux étapes 5 et 6.
 *
 * Règle de mort (document de design §7.3) : on garde l'XP et les ressources ramassées pendant la partie,
 * on perd le butin du boss.
 */
export interface SaveData {
  v: 1;
  runs: number;
  wins: number;
  /** Plus loin atteint (numéro de salle). */
  bestRoom: number;
  /** Victoire la plus rapide (s). */
  bestWinTime: number | null;
  xp: number;
  resources: Record<string, number>;
}

/** Ce qu'une partie rapporte. */
export interface Loot {
  xp: number;
  resources: Record<string, number>;
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

export const emptySave = (): SaveData => ({ v: 1, runs: 0, wins: 0, bestRoom: 0, bestWinTime: null, xp: 0, resources: {} });

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySave();
    const d = JSON.parse(raw) as Partial<SaveData>;
    return { ...emptySave(), ...d, v: 1 };
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

const addLoot = (d: SaveData, l: Loot) => {
  d.xp += l.xp;
  for (const [k, n] of Object.entries(l.resources)) d.resources[k] = (d.resources[k] ?? 0) + n;
};

/** Applique le résultat d'une partie à la sauvegarde (sans l'écrire). */
export function applyRun(d: SaveData, r: RunResult): SaveData {
  const out: SaveData = { ...d, resources: { ...d.resources } };
  out.runs++;
  out.bestRoom = Math.max(out.bestRoom, r.room);
  addLoot(out, r.loot);
  if (r.won) {
    out.wins++;
    out.bestWinTime = out.bestWinTime === null ? r.time : Math.min(out.bestWinTime, r.time);
    addLoot(out, r.bossLoot);
  }
  return out;
}
