import { CRYPT_POOL } from './monsters';

/**
 * Cartes de farm et donjons (document de design §8.3).
 * Une zone = 4 cartes de farm (5 salles, une élite à la fin), puis son donjon.
 */

export type Theme = 'crypt' | 'champs' | 'paturages' | 'foret' | 'cimetiere' | 'cite' | 'souterrains' | 'champsAstrub' | 'prairies' | 'grange'
  | 'lisiere' | 'dunes' | 'calanques' | 'plage' | 'chateau'
  | 'tainela' | 'foretAstrub' | 'carriere' | 'egouts' | 'cour' | 'coinBouftous' | 'coinBoos' | 'abords'
  | 'ingalsse' | 'tofus' | 'plaineScara' | 'scaraDonjon' | 'cimetiereAmakna' | 'cryptes' | 'squelettes' | 'maisonFantome';

/**
 * Groupe errant. Sans décor : il remplace la moitié des monstres d'une salle (Incarnam).
 * Avec un décor (`theme`) : détour, toute la salle devient cette zone (décor et monstres), validé par Enzo : « si c'est forêt c'est forêt ».
 */
export interface WanderGroup { name: string; pool: string[]; theme?: Theme; archis?: string[]; /** Nom de la zone affiché pendant le détour. */ zone?: string }

export interface AreaDef {
  id: string;
  name: string;
  kind: 'map' | 'dungeon';
  /** Zone (branche de l'arbre). */
  zone: string;
  /** Victoires nécessaires pour terminer la carte (validé par Enzo : 3 dans les zones à une ou deux cartes) ; 1 par défaut. */
  winsNeeded?: number;
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
  wanderers?: WanderGroup[];
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

/* ---------- Côte d'Astrub, branche C (validée par Enzo : 2 cartes chemin, 2 cartes plage, puis le Château Ensablé) ---------- */

export const LISIERE: AreaDef = {
  id: 'lisiere', name: 'Lisière des Champs', kind: 'map', zone: 'astrub', level: 16,
  sub: '5 salles · élite : Rose Démoniaque d’élite',
  rooms: 5, pool: ['tournesolSauvage', 'roseDemo', 'pissenlitDiabo', 'larveVerte', 'larveBleue'], count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'roseElite', grade: 3, adds: 3, addGrade: 2 },
  archis: ['archi2352', 'archi2358', 'archi2348', 'archi2332', 'archi2574'],
  theme: 'lisiere',
};

export const DUNES: AreaDef = {
  id: 'dunes', name: 'Sentier des Dunes', kind: 'map', zone: 'astrub', level: 17,
  sub: '5 salles · élite : Pichon Bleu d’élite',
  rooms: 5, pool: ['larveOrange', 'larveJaune', 'pichonOrange', 'pichonBleu'], count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'pichonBleuElite', grade: 3, adds: 3, addGrade: 2 },
  archis: ['archi2331', 'archi2339', 'archi2340', 'archi2338'],
  theme: 'dunes',
};

export const CALANQUES: AreaDef = {
  id: 'calanques', name: 'Calanques d’Astrub', kind: 'map', zone: 'astrub', level: 18,
  sub: '5 salles · élite : Pichon Vert d’élite',
  rooms: 5, pool: ['pichonOrange', 'pichonBleu', 'pichonBlanc', 'pichonVert'], count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'pichonVertElite', grade: 3, adds: 3, addGrade: 2 },
  archis: ['archi2340', 'archi2338', 'archi2346', 'archi2272'],
  theme: 'calanques',
};

export const PLAGE: AreaDef = {
  id: 'plage', name: 'Plage du Château', kind: 'map', zone: 'astrub', level: 19,
  sub: '5 salles · élite : Pichon Kloune d’élite',
  rooms: 5, pool: ['pichonOrange', 'pichonBleu', 'pichonBlanc', 'pichonVert', 'pichonKloune'], count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'klouneElite', grade: 3, adds: 3, addGrade: 2 },
  archis: ['archi2340', 'archi2338', 'archi2346', 'archi2272'],
  theme: 'plage',
};

export const CHATEAU: AreaDef = {
  id: 'chateau', name: 'Château Ensablé', kind: 'dungeon', zone: 'astrub', level: 20,
  sub: '7 salles · mini-boss · Mob l’Éponge',
  rooms: 7, pool: ['pichonOrange', 'pichonBleu', 'pichonBlanc', 'pichonVert', 'pichonKloune'], count: { base: 5, perRoom: 0.8, max: 10 }, waveFrom: 2,
  elite: { room: 3, id: 'klouneElite', grade: 5, adds: 4, addGrade: 3 },
  boss: { id: 'mobEponge', grade: 5, adds: 3 },
  theme: 'chateau',
};

/* ---------- Astrub, branche B (validée par Enzo) : les zones des Bouftous → Donjon des Bouftous ---------- */
/* Dans Dofus, les Bouftous vivent à Tainéla, au Coin des Bouftous et au Coin des Boos ; les Abords de la Cour sont une création.
   La Forêt d'Astrub, la Carrière et les Égouts n'ont pas de carte : ce sont des détours (20 % des salles), avec leur décor et leurs monstres. */

const D_FORET: WanderGroup = { name: 'Détour par la Forêt d’Astrub !', zone: 'Forêt d’Astrub', pool: ['prespic', 'sanglier', 'ecurouille', 'milimulou'], theme: 'foretAstrub', archis: ['archi2333', 'archi2349', 'archi2353'] };
const D_CARRIERE: WanderGroup = { name: 'Détour par la Carrière d’Astrub !', zone: 'Carrière d’Astrub', pool: ['martoa', 'sherpoa', 'douzdoa', 'pikdoa'], theme: 'carriere' };
const D_EGOUTS: WanderGroup = { name: 'Détour par les Égouts d’Astrub !', zone: 'Égouts d’Astrub', pool: ['arakneEgouts', 'scelerat', 'milirat', 'ramane'], theme: 'egouts', archis: ['archi2393', 'archi2350', 'archi2334'] };
const BOUFTOUS = ['bouftou', 'bouftou', 'bouftonBlanc', 'bouftonNoir', 'chefBouftou'];
const BOUFTOU_ARCHIS = ['archi2315', 'archi2316', 'archi2317', 'archi2324'];

export const TAINELA: AreaDef = {
  id: 'tainela', name: 'Tainéla', kind: 'map', zone: 'astrub', level: 22,
  sub: '5 salles · élite : Chef de Guerre Bouftou d’élite',
  rooms: 5, pool: BOUFTOUS, count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'chefElite', grade: 3, adds: 3, addGrade: 2 },
  archis: BOUFTOU_ARCHIS, wanderers: [D_CARRIERE, D_EGOUTS],
  theme: 'tainela',
};

export const COIN_BOUFTOUS: AreaDef = {
  id: 'coinBouftous', name: 'Coin des Bouftous', kind: 'map', zone: 'astrub', level: 23,
  sub: '5 salles · élite : Bouftou d’élite',
  rooms: 5, pool: BOUFTOUS, count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'bouftouElite', grade: 3, adds: 3, addGrade: 2 },
  archis: BOUFTOU_ARCHIS, wanderers: [D_FORET],
  theme: 'coinBouftous',
};

export const COIN_BOOS: AreaDef = {
  id: 'coinBoos', name: 'Coin des Boos', kind: 'map', zone: 'astrub', level: 24,
  sub: '5 salles · élite : Boufton Noir d’élite',
  rooms: 5, pool: BOUFTOUS, count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'bouftonNoirElite', grade: 3, adds: 3, addGrade: 2 },
  archis: BOUFTOU_ARCHIS, wanderers: [D_FORET],
  theme: 'coinBoos',
};

export const ABORDS: AreaDef = {
  id: 'abords', name: 'Abords de la Cour', kind: 'map', zone: 'astrub', level: 26,
  sub: '5 salles · élite : Bouftou Noir d’élite',
  rooms: 5, pool: ['bouftou', 'bouftonBlanc', 'bouftonNoir', 'chefBouftou', 'bouftouNoir'], count: { base: 4, perRoom: 0.8, max: 8 }, waveFrom: 2,
  elite: { room: 4, id: 'bouftouNoirElite', grade: 3, adds: 3, addGrade: 2 },
  archis: BOUFTOU_ARCHIS, wanderers: [D_EGOUTS],
  theme: 'abords',
};

export const COUR: AreaDef = {
  id: 'cour', name: 'Donjon des Bouftous', kind: 'dungeon', zone: 'astrub', level: 30,
  sub: '7 salles · mini-boss · Bouftou Royal',
  rooms: 7, pool: ['bouftou', 'bouftonBlanc', 'bouftonNoir', 'chefBouftou', 'bouftouNoir', 'bouftouNoir'], count: { base: 5, perRoom: 0.8, max: 10 }, waveFrom: 2,
  elite: { room: 3, id: 'chefElite', grade: 5, adds: 4, addGrade: 3 },
  boss: { id: 'bouftouRoyal', grade: 5, adds: 3 },
  archis: BOUFTOU_ARCHIS,
  theme: 'cour',
};

/* ---------- Amakna (validé par Enzo, option A) : Champ des Ingalsse → Donjon des Tofus ---------- */
/* Vraies zones de Dofus : Champ des Ingalsse (sous-zone 3, niveau 30) et Donjon des Tofus (sous-zone 201, niveau 40).
   Pas de détour : les zones voisines ont des monstres pas encore dessinés. */
const TOFUS = ['tofuJaune', 'tofuJaune', 'tofuNoir', 'tofoune', 'tofukaz', 'tofuMutant'];

export const INGALSSE: AreaDef = {
  id: 'ingalsse', name: 'Champ des Ingalsse', kind: 'map', zone: 'amakna', level: 32, winsNeeded: 3,
  sub: '5 salles · élite : Tofu Mutant d’élite · 3 victoires',
  rooms: 5, pool: TOFUS, count: { base: 5, perRoom: 0.8, max: 9 }, waveFrom: 2,
  elite: { room: 4, id: 'tofuMutantElite', grade: 3, adds: 3, addGrade: 2 },
  archis: ['archi2355'],
  theme: 'ingalsse',
};

export const TOFULAILLER: AreaDef = {
  id: 'tofus', name: 'Donjon des Tofus', kind: 'dungeon', zone: 'amakna', level: 40,
  sub: '7 salles · mini-boss · Batofu',
  rooms: 7, pool: [...TOFUS, 'tofuVentripotent'], count: { base: 5, perRoom: 0.8, max: 10 }, waveFrom: 2,
  elite: { room: 3, id: 'tofuNoirElite', grade: 5, adds: 4, addGrade: 3 },
  boss: { id: 'batofu', grade: 5, adds: 3 },
  archis: ['archi2355'],
  theme: 'tofus',
};

/* Plaine des Scarafeuilles (sous-zone 170, niveau 30) → Donjon des Scarafeuilles (sous-zone 297, niveau 40), validés par Enzo :
   en parallèle du Champ des Ingalsse, après le Donjon des Bouftous. Les Dragodindes sauvages (niveau 62-70) sont laissées de côté. */
const SCARAS = ['scaraRouge', 'scaraBleu', 'scaraVert', 'scaraBlanc'];
const SCARA_ARCHIS = ['archi2280', 'archi2281', 'archi2282', 'archi2283'];

export const PLAINE_SCARA: AreaDef = {
  id: 'plaineScara', name: 'Plaine des Scarafeuilles', kind: 'map', zone: 'amakna', level: 36, winsNeeded: 3,
  sub: '5 salles · élite : Scarafeuille Vert d’élite · 3 victoires',
  rooms: 5, pool: SCARAS, count: { base: 5, perRoom: 0.8, max: 9 }, waveFrom: 2,
  elite: { room: 4, id: 'scaraVertElite', grade: 3, adds: 3, addGrade: 2 },
  archis: SCARA_ARCHIS,
  theme: 'plaineScara',
};

export const SCARA_DONJON: AreaDef = {
  id: 'scaraDonjon', name: 'Donjon des Scarafeuilles', kind: 'dungeon', zone: 'amakna', level: 40,
  sub: '7 salles · mini-boss · Scarabosse Doré',
  rooms: 7, pool: [...SCARAS, 'scaraNoir', 'scaraImmature'], count: { base: 5, perRoom: 0.8, max: 10 }, waveFrom: 2,
  elite: { room: 3, id: 'scaraNoirElite', grade: 5, adds: 4, addGrade: 3 },
  boss: { id: 'scarabosse', grade: 5, adds: 3 },
  archis: SCARA_ARCHIS,
  theme: 'scaraDonjon',
};

/* Cimetière (sous-zone 6) et Cryptes du Cimetière (7) → Donjon des Squelettes (516), validés par Enzo : après le Donjon des Bouftous.
   Laissés de côté : Roub' Ignolles (quête), Sousouris (niveau 1), Noeul (20-24), Chafers Lancier, Archer et d'Élite (42-50), Jorbak et Vampire Dupyr (boss 150+). */
export const CIMETIERE_AMAKNA: AreaDef = {
  id: 'cimetiereAmakna', name: 'Cimetière d’Amakna', kind: 'map', zone: 'amakna', level: 34, winsNeeded: 3,
  sub: '5 salles · élite : Chafer Fantassin d’élite · 3 victoires',
  rooms: 5, pool: ['chafer', 'chafer', 'rib', 'chaferInvisible', 'tofuMalefique', 'kwoan', 'chaferFantassin'], count: { base: 5, perRoom: 0.8, max: 9 }, waveFrom: 2,
  elite: { room: 4, id: 'fantassinElite', grade: 3, adds: 3, addGrade: 2 },
  archis: ['archi2319', 'archi2276', 'archi2321', 'archi2357', 'archi2522', 'archi2421'],
  theme: 'cimetiereAmakna',
};

export const CRYPTES: AreaDef = {
  id: 'cryptes', name: 'Cryptes du Cimetière', kind: 'map', zone: 'amakna', level: 36, winsNeeded: 3,
  sub: '5 salles · élite : Maître Vampire d’élite · 3 victoires',
  rooms: 5, pool: ['chafer', 'rib', 'tofuMalefique', 'kwoan', 'chaferFantassin', 'vampire', 'vampire', 'maitreVampire'], count: { base: 5, perRoom: 0.8, max: 9 }, waveFrom: 2,
  elite: { room: 4, id: 'maitreVampireElite', grade: 3, adds: 3, addGrade: 2 },
  archis: ['archi2319', 'archi2276', 'archi2357', 'archi2522', 'archi2421', 'archi2302', 'archi2532'],
  theme: 'cryptes',
};

export const SQUELETTES: AreaDef = {
  id: 'squelettes', name: 'Donjon des Squelettes', kind: 'dungeon', zone: 'amakna', level: 40,
  sub: '7 salles · mini-boss · Chafer Rōnin',
  rooms: 7, pool: ['chafer', 'rib', 'chaferInvisible', 'chaferFantassin', 'chaferPrimitif', 'chaferPrimitif'], count: { base: 5, perRoom: 0.8, max: 10 }, waveFrom: 2,
  elite: { room: 3, id: 'primitifElite', grade: 5, adds: 4, addGrade: 3 },
  boss: { id: 'ronin', grade: 5, adds: 3 },
  archis: ['archi2319', 'archi2276', 'archi2321', 'archi2421'],
  theme: 'squelettes',
};

/** Maison Fantôme (validée par Enzo) : donjon niveau 40, après les Cryptes ; boss Boostache. */
export const MAISON_FANTOME: AreaDef = {
  id: 'maisonFantome', name: 'Maison Fantôme', kind: 'dungeon', zone: 'amakna', level: 40,
  sub: '7 salles · mini-boss · Boostache',
  rooms: 7, pool: ['tofuMalefique', 'vampire', 'kwoan', 'gargrouille', 'boostachePrepubere', 'boostachePrepubere'], count: { base: 5, perRoom: 0.8, max: 10 }, waveFrom: 2,
  elite: { room: 3, id: 'gargrouilleElite', grade: 5, adds: 4, addGrade: 3 },
  boss: { id: 'boostache', grade: 5, adds: 3 },
  archis: ['archi2357', 'archi2302', 'archi2522', 'archi2549'],
  theme: 'maisonFantome',
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

/** Arbre des zones (une zone = ses cartes de farm puis son donjon ; validé par Enzo). Astrub (après la Crypte) : Cité → Souterrains, Champs d'Astrub → Prairies → Donjon des Champs (les 4 cartes). Incarnam : Champs → Pâturages, Forêt, Cimetière (dans l'ordre qu'on veut) → Crypte de Kardorim (les 4 cartes terminées). */
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
    id: 'astrub', name: 'Astrub : les Champs',
    nodes: [
      { id: 'cite', name: 'Cité', level: 12, kind: 'map', area: CITE, needs: ['crypte'] },
      { id: 'souterrains', name: 'Souterrains', level: 13, kind: 'map', area: SOUTERRAINS, needs: ['cite'] },
      { id: 'champsAstrub', name: 'Champs d’Astrub', level: 17, kind: 'map', area: CHAMPS_ASTRUB, needs: ['cite'] },
      { id: 'prairies', name: 'Prairies', level: 18, kind: 'map', area: PRAIRIES, needs: ['champsAstrub'] },
      { id: 'grange', name: 'Donjon des Champs', level: 20, kind: 'dungeon', area: GRANGE, needs: ['cite', 'souterrains', 'champsAstrub', 'prairies'] },
    ],
  },
  {
    id: 'cote', name: 'Astrub : la Côte',
    nodes: [
      { id: 'lisiere', name: 'Lisière des Champs', level: 16, kind: 'map', area: LISIERE, needs: ['grange'] },
      { id: 'dunes', name: 'Sentier des Dunes', level: 17, kind: 'map', area: DUNES, needs: ['lisiere'] },
      { id: 'calanques', name: 'Calanques', level: 18, kind: 'map', area: CALANQUES, needs: ['dunes'] },
      { id: 'plage', name: 'Plage du Château', level: 19, kind: 'map', area: PLAGE, needs: ['dunes'] },
      { id: 'chateau', name: 'Château Ensablé', level: 20, kind: 'dungeon', area: CHATEAU, needs: ['lisiere', 'dunes', 'calanques', 'plage'] },
    ],
  },
  {
    id: 'bouftous', name: 'Astrub : les Bouftous',
    nodes: [
      { id: 'tainela', name: 'Tainéla', level: 22, kind: 'map', area: TAINELA, needs: ['grange'] },
      { id: 'coinBouftous', name: 'Coin des Bouftous', level: 23, kind: 'map', area: COIN_BOUFTOUS, needs: ['tainela'] },
      { id: 'coinBoos', name: 'Coin des Boos', level: 24, kind: 'map', area: COIN_BOOS, needs: ['tainela'] },
      { id: 'abords', name: 'Abords de la Cour', level: 26, kind: 'map', area: ABORDS, needs: ['coinBouftous', 'coinBoos'] },
      { id: 'cour', name: 'Donjon des Bouftous', level: 30, kind: 'dungeon', area: COUR, needs: ['tainela', 'coinBouftous', 'coinBoos', 'abords'] },
    ],
  },
  {
    id: 'amakna', name: 'Amakna : les Tofus',
    nodes: [
      { id: 'ingalsse', name: 'Champ des Ingalsse', level: 32, kind: 'map', area: INGALSSE, needs: ['cour'] },
      { id: 'tofus', name: 'Donjon des Tofus', level: 40, kind: 'dungeon', area: TOFULAILLER, needs: ['ingalsse'] },
    ],
  },
  {
    id: 'squelettes', name: 'Amakna : le Cimetière',
    nodes: [
      { id: 'cimetiereAmakna', name: 'Cimetière d’Amakna', level: 34, kind: 'map', area: CIMETIERE_AMAKNA, needs: ['cour'] },
      { id: 'cryptes', name: 'Cryptes du Cimetière', level: 36, kind: 'map', area: CRYPTES, needs: ['cimetiereAmakna'] },
      { id: 'squelettes', name: 'Donjon des Squelettes', level: 40, kind: 'dungeon', area: SQUELETTES, needs: ['cimetiereAmakna', 'cryptes'] },
      { id: 'maisonFantome', name: 'Maison Fantôme', level: 40, kind: 'dungeon', area: MAISON_FANTOME, needs: ['cryptes'] },
    ],
  },
  {
    id: 'scarafeuilles', name: 'Amakna : les Scarafeuilles',
    nodes: [
      { id: 'plaineScara', name: 'Plaine des Scarafeuilles', level: 36, kind: 'map', area: PLAINE_SCARA, needs: ['cour'] },
      { id: 'scaraDonjon', name: 'Donjon des Scarafeuilles', level: 40, kind: 'dungeon', area: SCARA_DONJON, needs: ['plaineScara'] },
    ],
  },
];

export const AREAS: Record<string, AreaDef> = {
  crypte: CRYPTE, champs: CHAMPS, paturages: PATURAGES, foret: FORET, cimetiere: CIMETIERE,
  cite: CITE, souterrains: SOUTERRAINS, champsAstrub: CHAMPS_ASTRUB, prairies: PRAIRIES, grange: GRANGE,
  lisiere: LISIERE, dunes: DUNES, calanques: CALANQUES, plage: PLAGE, chateau: CHATEAU,
  tainela: TAINELA, coinBouftous: COIN_BOUFTOUS, coinBoos: COIN_BOOS, abords: ABORDS, cour: COUR,
  ingalsse: INGALSSE, tofus: TOFULAILLER, plaineScara: PLAINE_SCARA, scaraDonjon: SCARA_DONJON,
  cimetiereAmakna: CIMETIERE_AMAKNA, cryptes: CRYPTES, squelettes: SQUELETTES, maisonFantome: MAISON_FANTOME,
};

/** Étapes jouables et débloquées. */
export const isUnlocked = (n: TreeNode, done: string[]) => !n.soon && (done.includes(n.id) || n.needs.every((id) => done.includes(id)));

/** Équipement de zone (validé par Enzo) : tranche de niveaux des équipements qui tombent dans chaque zone. */
export const ZONE_TIERS: Record<string, [number, number]> = {
  incarnam: [1, 10], astrub: [11, 21], cote: [11, 21], bouftous: [22, 30], amakna: [31, 40], squelettes: [31, 40], scarafeuilles: [31, 40],
};

/** Zone de l'arbre qui contient cette carte ou ce donjon. */
export const zoneIdOf = (areaId: string): string | null => ZONES.find((z) => z.nodes.some((n) => n.area?.id === areaId))?.id ?? null;

/** Niveaux de l'équipement de zone d'une carte : sa tranche, jusqu'au niveau de la carte + 2 (toute la tranche en donjon). */
export function zoneEquipRange(areaId: string): { lo: number; hi: number; zone: string } | null {
  for (const z of ZONES) {
    const n = z.nodes.find((x) => x.area?.id === areaId);
    const t = ZONE_TIERS[z.id];
    if (!n || !t) continue;
    return { lo: t[0], hi: n.kind === 'dungeon' ? t[1] : Math.max(t[0], Math.min(t[1], n.level + 2)), zone: z.name };
  }
  return null;
}
