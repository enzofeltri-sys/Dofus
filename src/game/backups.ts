import { levelForXp } from './progression';
import { freezeSaves, rawSave, SAVE_KEY } from './save';

/**
 * Paramètres (demande d'Enzo) : copies de sauvegarde gardées dans le téléphone, restauration, import/export, réinitialisation.
 * Les copies sont le texte JSON de la sauvegarde, rangées à part (clé `dofus-enzo-backups`), de la plus récente à la plus ancienne.
 */
const KEY = 'dofus-enzo-backups';
/** Réinitialisation demandée par Enzo (26/10) : faite une seule fois au premier lancement de cette version, après une copie. */
export const RESET_ID = 'reset-2026-10-26';
const RESET_KEY = 'dofus-enzo-reset';

export type BackupKind = 'auto' | 'manuelle' | 'avant-reset' | 'avant-restauration' | 'avant-import';
export const BACKUP_LABEL: Record<BackupKind, string> = {
  auto: 'Copie automatique',
  manuelle: 'Copie manuelle',
  'avant-reset': 'Avant réinitialisation',
  'avant-restauration': 'Avant restauration',
  'avant-import': 'Avant import',
};
export interface Backup {
  at: number;
  kind: BackupKind;
  /** Résumé affiché : niveau, étapes terminées, parties. */
  level: number;
  done: number;
  runs: number;
  raw: string;
}
/** Copies gardées : 10 au plus (les automatiques, une par jour, passent en premier à la poubelle). */
export const MAX_BACKUPS = 10;
const AUTO_EVERY = 20 * 3600 * 1000;

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const store = (): Store | null => {
  try {
    return localStorage;
  } catch {
    return null;
  }
};

export function listBackups(): Backup[] {
  try {
    const l = JSON.parse(store()?.getItem(KEY) ?? '[]') as Backup[];
    return Array.isArray(l) ? l : [];
  } catch {
    return [];
  }
}

function writeBackups(l: Backup[]): boolean {
  const s = store();
  if (!s) return false;
  // stockage plein : on retire les plus anciennes (automatiques d'abord) jusqu'à ce que ça passe
  for (let list = l; list.length; ) {
    try {
      s.setItem(KEY, JSON.stringify(list));
      return true;
    } catch {
      const i = list.map((b) => b.kind).lastIndexOf('auto');
      list = list.filter((_, k) => k !== (i >= 0 ? i : list.length - 1));
    }
  }
  return false;
}

/** Résumé d'une sauvegarde (texte JSON) ; null si ce n'est pas une sauvegarde du jeu. */
export function summarize(raw: string): { level: number; done: number; runs: number } | null {
  try {
    const d = JSON.parse(raw);
    if (!d || typeof d !== 'object' || !d.profile || typeof d.profile.xp !== 'number') return null;
    return { level: levelForXp(d.profile.xp), done: Array.isArray(d.done) ? d.done.length : 0, runs: d.runs ?? 0 };
  } catch {
    return null;
  }
}

/** Copie de la sauvegarde actuelle. Rien si pas de sauvegarde. */
export function makeBackup(kind: BackupKind, now = Date.now()): Backup | null {
  const raw = rawSave();
  const sum = raw ? summarize(raw) : null;
  if (!sum) return null;
  const b: Backup = { at: now, kind, ...sum, raw };
  let l = [b, ...listBackups()];
  while (l.length > MAX_BACKUPS) {
    const i = l.map((x) => x.kind).lastIndexOf('auto');
    l = l.filter((_, k) => k !== (i > 0 ? i : l.length - 1));
  }
  return writeBackups(l) ? b : null;
}

/** Copie automatique au lancement, au plus une toutes les 20 h. */
export function autoBackup(now = Date.now()): Backup | null {
  const last = listBackups().find((b) => b.kind === 'auto');
  if (last && now - last.at < AUTO_EVERY) return null;
  return makeBackup('auto', now);
}

export function deleteBackup(at: number) {
  writeBackups(listBackups().filter((b) => b.at !== at));
}

/** Remplace la sauvegarde (copie de l'actuelle d'abord) ; le jeu doit ensuite être rechargé. */
function replaceSave(raw: string | null, kind: BackupKind): boolean {
  const s = store();
  if (!s) return false;
  makeBackup(kind);
  if (raw === null) s.removeItem(SAVE_KEY);
  else s.setItem(SAVE_KEY, raw);
  // la partie en cours ne doit plus écrire par-dessus avant le rechargement
  freezeSaves();
  return true;
}

export function restoreBackup(at: number): boolean {
  const b = listBackups().find((x) => x.at === at);
  return !!b && replaceSave(b.raw, 'avant-restauration');
}

/** Importe une sauvegarde collée ou chargée depuis un fichier ; message d'erreur si le texte n'en est pas une. */
export function importSave(raw: string): true | string {
  const txt = raw.trim();
  if (!summarize(txt)) return 'Ce texte n’est pas une sauvegarde du jeu.';
  return replaceSave(txt, 'avant-import') || 'Stockage indisponible sur ce téléphone.';
}

/** Réinitialisation complète : copie « avant réinitialisation », puis partie neuve (les copies sont gardées). */
export function resetGame(): boolean {
  return replaceSave(null, 'avant-reset');
}

/** La réinitialisation demandée par Enzo, une seule fois ; true si elle vient d'être faite. */
export function pendingReset(): boolean {
  const s = store();
  if (!s) return false;
  try {
    if (s.getItem(RESET_KEY) === RESET_ID) return false;
    s.setItem(RESET_KEY, RESET_ID);
    // un tout nouveau joueur n'a rien à réinitialiser (pas de message)
    if (!rawSave()) return false;
    makeBackup('avant-reset');
    s.removeItem(SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Taille occupée par la sauvegarde et les copies (Ko). */
export function storageKb(): { save: number; backups: number } {
  const s = store();
  const len = (k: string) => (s?.getItem(k) ?? '').length;
  return { save: Math.round(len(SAVE_KEY) / 1024), backups: Math.round(len(KEY) / 1024) };
}
