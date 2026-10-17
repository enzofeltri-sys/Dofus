import { CRYPT_POOL } from './monsters';

/**
 * Cartes de farm et donjons (document de design §8.3).
 * Une zone = 4 cartes de farm (5 salles, une élite à la fin), puis son donjon.
 */

export type Theme = 'crypt' | 'champs' | 'paturages' | 'foret' | 'cimetiere' | 'cite' | 'souterrains' | 'champsAstrub' | 'prairies' | 'grange';

export interface AreaDef {
  id: string;
  name: string;
  kind: 'map' | 'dungeon';
  /** Zone (branche de l'arbre). */
  zone: string;
  /** Niveau recommandé. */
  level: number;
  /** Description courte (camp, écran Donjons). */
  sub: string;
  rooms: number;
  /** Monstres des salles (tirés au hasard ; un nom répété = plus fréquent). */
  pool: string[];
  /** Monstres par salle : base + par salle, plafonnés. */
  count: { base: number; perRoom: number; max: number };
  /** À partir de cette salle, 40 % des monstres arrivent en deuxième vague. */
  waveFrom: number;
  /** Élite (mini-boss) : salle, monstre, grade, accompagnants. */
  elite?: { room: number; id: string; grade: number; adds: number; addGrade: number };
  boss?: { id: string; grade: number; adds: number };
  /** Archimonstres de la zone (1 % des monstres, plus forts, meilleur butin). */
  archis?: string[];
  /** Monstres errants possibles (rencontres) : nom affiché et monstres du groupe. */
  wanderers?: { name: string; pool: string[] }[];
  theme: Theme;
}

/** Monstres errants d'Incarnam : Lac, Mine et Route des âmes (pas de carte à eux, ils passent dans les autres). */
const LAC = { name: 'Des gelées du Lac !', pool: ['plikplok', 'gloot', 'gloot', 'splatch'] };
const MINE = { name: 'Des Aminites de la Mine !', pool: ['aminite'] };
const ROUTE = { name: 'Des Feux de la Route des âmes !', pool: ['feuVif', 'feuJoie', 'feuFurieux', 'feuFollet'] };

export const CRYPTE: AreaDef = {
  id: 'crypte', name: 'Crypte de Kardorim', kind: 'dungeon', zone: 'incarnam', level: 10,
  sub: '9 salles · mini-boss · Kardorim',
  rooms: 9, pool: CRYPT_POOL, count: { base: 6, perRoom: 0.85, max: 12 }, waveFrom: 2,
  elite: { room: 4, id: 'sergentElite', grade: 5, adds: 4, addGrade: 3 },
  boss: { id: 'kardorim', grade: 5, adds: 5 },
  theme: 'crypt',
};

export const CHAMPS: AreaDef = {
  id: 'champs', name: 'Champs d’Incarnam', kind: 'map', zone: 'incarnam', level: 3,
  sub: '5 salles · élite : Tournesol Nébuleux',
  rooms: 5, pool: ['tofu', 'tofu', 'pissenlit', 'rose'], count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'tournesol', grade: 3, adds: 3, addGrade: 2 },
  wanderers: [ROUTE, LAC],
  theme: 'champs',
};

export const PATURAGES: AreaDef = {
  id: 'paturages', name: 'Pâturages d’Incarnam', kind: 'map', zone: 'incarnam', level: 6,
  sub: '5 salles · élite : Bouftor Éthéré',
  rooms: 5, pool: ['palichon', 'orageux', 'palichon', 'orageux', 'nuageux'], count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'bouftor', grade: 3, adds: 3, addGrade: 2 },
  wanderers: [LAC],
  theme: 'paturages',
};

export const FORET: AreaDef = {
  id: 'foret', name: 'Forêt d’Incarnam', kind: 'map', zone: 'incarnam', level: 7,
  sub: '5 salles · élite : Ronronchon',
  rooms: 5, pool: ['chakrobat', 'chakrobat', 'tigrimas'], count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'ronronchon', grade: 3, adds: 3, addGrade: 2 },
  wanderers: [ROUTE, MINE],
  theme: 'foret',
};

export const CIMETIERE: AreaDef = {
  id: 'cimetiere', name: 'Cimetière d’Incarnam', kind: 'map', zone: 'incarnam', level: 8,
  sub: '5 salles · élite : Chafer Piquier',
  rooms: 5, pool: ['chaferDebutant', 'chaferDebutant', 'chaferFurtif', 'chaferEclaireur', 'chaferPiquier'], count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'piquierElite', grade: 3, adds: 3, addGrade: 2 },
  wanderers: [MINE],
  theme: 'cimetiere',
};

/* ---------- Astrub, branche A (d'après les vraies cartes et monstres de Dofus 3) ---------- */

export const CITE: AreaDef = {
  id: 'cite', name: 'Cité d’Astrub', kind: 'map', zone: 'astrub', level: 12,
  sub: '5 salles · élite : Piou Rouge d’élite',
  rooms: 5, pool: ['piouViolet', 'piouRouge', 'piouVert', 'piouBleu', 'piouRose', 'piouJaune'], count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'piouElite', grade: 3, adds: 3, addGrade: 2 },
  archis: ['archi2341', 'archi2342', 'archi2343', 'archi2344', 'archi2345', 'archi2347'],
  theme: 'cite',
};

export const SOUTERRAINS: AreaDef = {
  id: 'souterrains', name: 'Souterrains d’Astrub', kind: 'map', zone: 'astrub', level: 13,
  sub: '5 salles · élite : Arakne Malade d’élite',
  rooms: 5, pool: ['tofuMalade', 'tofuMalade', 'arakneMalade', 'araknose', 'arakmute'], count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'arakneElite', grade: 3, adds: 3, addGrade: 2 },
  archis: ['archi2312', 'archi2356'],
  theme: 'souterrains',
};

export const CHAMPS_ASTRUB: AreaDef = {
  id: 'champsAstrub', name: 'Champs d’Astrub', kind: 'map', zone: 'astrub', level: 17,
  sub: '5 salles · élite : Épouvanteur d’élite',
  rooms: 5, pool: ['tournesolSauvage', 'roseDemo', 'pissenlitDiabo', 'tournesolSauvage', 'epouvanteur'], count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'epouvanteurElite', grade: 3, adds: 3, addGrade: 2 },
  archis: ['archi2348', 'archi2352', 'archi2358'],
  theme: 'champsAstrub',
};

export const PRAIRIES: AreaDef = {
  id: 'prairies', name: 'Prairies d’Astrub', kind: 'map', zone: 'astrub', level: 18,
  sub: '5 salles · élite : Larve Orange d’élite',
  rooms: 5, pool: ['larveBleue', 'larveVerte', 'larveOrange', 'larveJaune'], count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'larveElite', grade: 3, adds: 3, addGrade: 2 },
  archis: ['archi2331', 'archi2332', 'archi2339', 'archi2574'],
  theme: 'prairies',
};

export const GRANGE: AreaDef = {
  id: 'grange', name: 'Donjon des Champs', kind: 'dungeon', zone: 'astrub', level: 20,
  sub: '7 salles · mini-boss · Tournesol Affamé',
  rooms: 7, pool: ['tournesolSauvage', 'roseDemo', 'pissenlitDiabo', 'epouvanteur', 'gardienne', 'gardienne'], count: { base: 5, perRoom: 0.8, max: 10 }, waveFrom: 2,
  elite: { room: 3, id: 'gardienneElite', grade: 5, adds: 4, addGrade: 3 },
  boss: { id: 'tournesolAffame', grade: 5, adds: 3 },
  theme: 'grange',
};

/** Une étape de l'arbre : une carte ou un donjon jouable, ou une case à venir. */
export interface TreeNode {
  id: string;
  name: string;
  level: number;
  kind: 'map' | 'dungeon';
  area?: AreaDef;
  /** Identifiants à terminer pour débloquer cette étape. */
  needs: string[];
  /** Pas encore dans le jeu. */
  soon?: boolean;
}

export interface Zone {
  id: string;
  name: string;
  nodes: TreeNode[];
}

/** Arbre des zones. Astrub (après la Crypte) : Cité → Souterrains, Champs d'Astrub → Prairies → Donjon des Champs (les 4 cartes). Incarnam : Champs → Pâturages, Forêt, Cimetière (dans l'ordre qu'on veut) → Crypte de Kardorim (les 4 cartes terminées). */
export const ZONES: Zone[] = [
  {
    id: 'incarnam', name: 'Incarnam',
    nodes: [
      { id: 'champs', name: 'Champs', level: 3, kind: 'map', area: CHAMPS, needs: [] },
      { id: 'paturages', name: 'Pâturages', level: 6, kind: 'map', area: PATURAGES, needs: ['champs'] },
      { id: 'foret', name: 'Forêt', level: 7, kind: 'map', area: FORET, needs: ['champs'] },
      { id: 'cimetiere', name: 'Cimetière', level: 8, kind: 'map', area: CIMETIERE, needs: ['champs'] },
      { id: 'crypte', name: 'Crypte de Kardorim', level: 10, kind: 'dungeon', area: CRYPTE, needs: ['champs', 'paturages', 'foret', 'cimetiere'] },
    ],
  },
  {
    id: 'astrub', name: 'Astrub',
    nodes: [
      { id: 'cite', name: 'Cité', level: 12, kind: 'map', area: CITE, needs: ['crypte'] },
      { id: 'souterrains', name: 'Souterrains', level: 13, kind: 'map', area: SOUTERRAINS, needs: ['cite'] },
      { id: 'champsAstrub', name: 'Champs d’Astrub', level: 17, kind: 'map', area: CHAMPS_ASTRUB, needs: ['cite'] },
      { id: 'prairies', name: 'Prairies', level: 18, kind: 'map', area: PRAIRIES, needs: ['champsAstrub'] },
      { id: 'grange', name: 'Donjon des Champs', level: 20, kind: 'dungeon', area: GRANGE, needs: ['cite', 'souterrains', 'champsAstrub', 'prairies'] },
      { id: 'cour', name: 'Donjon des Bouftous', level: 30, kind: 'dungeon', needs: ['grange'], soon: true },
      { id: 'chateau', name: 'Château Ensablé', level: 20, kind: 'dungeon', needs: ['grange'], soon: true },
    ],
  },
];

export const AREAS: Record<string, AreaDef> = {
  crypte: CRYPTE, champs: CHAMPS, paturages: PATURAGES, foret: FORET, cimetiere: CIMETIERE,
  cite: CITE, souterrains: SOUTERRAINS, champsAstrub: CHAMPS_ASTRUB, prairies: PRAIRIES, grange: GRANGE,
};

/** Étapes jouables et débloquées. */
export const isUnlocked = (n: TreeNode, done: string[]) => !n.soon && (done.includes(n.id) || n.needs.every((id) => done.includes(id)));
