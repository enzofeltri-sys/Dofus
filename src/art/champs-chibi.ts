import { svg } from './kit';
import { shade } from '../svg';

/**
 * Monstres des Champs d'Incarnam « version Archero » (versions « chimériques » de Dofus 3 : pâles, éthérées, lumineuses).
 * Ils regardent vers la GAUCHE, comme les Chafers. Cadre 140 × 160, pieds en (70, 152).
 * - Tofu Chimérique : boule bleu pâle, crête en piques, gros yeux, petites ailes, pattes fines et pieds verts.
 * - Pissenlit Miroitant : aigrette de duvet translucide, grands yeux tristes cernés, sur une tige à deux pieds.
 * - Rose Vaporeuse : rose cyan en pétales superposés, sourcils froncés, feuilles, tige à deux pieds.
 * - Tournesol Nébuleux (élite) : pétales blancs, cœur sombre brillant qui grimace, tige à deux pieds.
 */

export const CRITTER_W = 140;
export const CRITTER_H = 160;
export const CRITTER_FOOT: [number, number] = [70, 152];

export type CritterKind = 'tofu' | 'pissenlit' | 'rose' | 'tournesol' | 'palichon' | 'orageux' | 'nuageux' | 'bouftor' | 'chakrobat' | 'tigrimas' | 'ronronchon'
  | 'plikplok' | 'gloot' | 'splatch' | 'aminite' | 'feuVif' | 'feuJoie' | 'feuFurieux' | 'feuFollet'
  | 'piouViolet' | 'piouRouge' | 'piouVert' | 'piouBleu' | 'piouRose' | 'piouJaune' | 'tofuMalade' | 'arakneMalade' | 'araknose' | 'arakmute'
  | 'tournesolSauvage' | 'roseDemo' | 'pissenlitDiabo' | 'epouvanteur' | 'gardienne' | 'tournesolAffame' | 'larveBleue' | 'larveVerte' | 'larveOrange' | 'larveJaune'
  | 'bouftou' | 'bouftonBlanc' | 'bouftonNoir' | 'bouftouNoir' | 'chefBouftou' | 'bouftouRoyal' | 'prespic' | 'sanglier' | 'ecurouille'
  | 'martoa' | 'sherpoa' | 'douzdoa' | 'pikdoa' | 'arakneEgouts' | 'milimulou' | 'milirat' | 'ramane' | 'scelerat' | 'mobEponge'
  | 'pichonOrange' | 'pichonBleu' | 'pichonBlanc' | 'pichonVert' | 'pichonKloune'
  | 'tofuJaune' | 'tofuNoir' | 'tofoune' | 'tofukaz' | 'tofuMutant' | 'tofuVentripotent' | 'batofu' | 'bomberfu' | 'tofuMalefique' | 'rib' | 'kwoan'
  | 'scaraRouge' | 'scaraBleu' | 'scaraVert' | 'scaraBlanc' | 'scaraNoir' | 'scaraImmature' | 'scarabosse'
  | 'boostache' | 'boostachePrepubere' | 'gargrouille' | 'ashimagari'
  | 'kwakVent' | 'kwakereVent' | 'bwakVent' | 'kwakFlamme' | 'kwakereFlamme' | 'bwakFlamme' | 'kwakGlace' | 'kwakereGlace' | 'bwakGlace' | 'kwakTerre' | 'kwakereTerre' | 'bwakTerre' | 'kwakwa'
  | 'wabbit' | 'blackWabbit' | 'tiwabbit' | 'blackTiwabbit' | 'tiwabbitKiafin' | 'woWabbit' | 'grandPaWabbit' | 'waWabbit'
  | 'blopCoco' | 'blopIndigo' | 'blopGriotte' | 'blopReinette' | 'gloutoblop' | 'blopignon' | 'tronkoblop'
  | 'blopCocoRoyal' | 'blopIndigoRoyal' | 'blopGriotteRoyal' | 'blopReinetteRoyal'
  | 'craqueleur' | 'craqueleurLegendaire' | 'craquelourd' | 'craqueleurPlaines' | 'kirboule' | 'craqueboule' | 'craquelope' | 'elementerre'
  | 'sparo' | 'barbroussa' | 'leFlib' | 'gourlo' | 'tonneauPirate' | 'boomba' | 'nakunbra' | 'canondorf'
  | 'blackWoWabbit' | 'blancPaWabbit' | 'wobot' | 'waWobot' | 'wobotKiafin' | 'tiwobot'
  | 'scordionBleu' | 'fennex' | 'boulepique' | 'leolhyene' | 'ouroboulos' | 'mantiscore';
export const TOFU_PARTS = ['wingB', 'legB', 'legF', 'body', 'crest', 'wingF'] as const;
export const PLANT_PARTS = ['legB', 'legF', 'stem', 'leafB', 'leafF', 'head'] as const;
export const SHEEP_PARTS = ['tail', 'legB', 'body', 'legF', 'head', 'horn'] as const;
export const CAT_PARTS = ['tail', 'legB', 'body', 'legF', 'head', 'wisp'] as const;
/** Gelées du Lac et Feux de la Route des âmes : flaque (ou halo), corps, visage. */
export const JELLY_PARTS = ['back', 'body', 'face'] as const;
/** Aminite (Mine) : pieds, corps, chapeau. */
export const SHROOM_PARTS = ['legB', 'legF', 'body', 'head'] as const;
export type CritterPart = (typeof TOFU_PARTS)[number] | (typeof PLANT_PARTS)[number] | (typeof SHEEP_PARTS)[number] | (typeof CAT_PARTS)[number] | (typeof JELLY_PARTS)[number];
export const SHEEP: CritterKind[] = ['palichon', 'orageux', 'nuageux', 'bouftor'];
export const CATS: CritterKind[] = ['chakrobat', 'tigrimas', 'ronronchon'];
export const JELLIES: CritterKind[] = ['plikplok', 'gloot', 'splatch', 'larveBleue', 'larveVerte', 'larveOrange', 'larveJaune'];
export const PIOUS: CritterKind[] = ['piouViolet', 'piouRouge', 'piouVert', 'piouBleu', 'piouRose', 'piouJaune'];
export const SPIDERS: CritterKind[] = ['arakneMalade', 'araknose', 'arakmute', 'arakneEgouts'];
/** Quadrupèdes d'Astrub (corps de mouton : Bouftous, Prespic, Sanglier, Écurouille). */
export const BEASTS: CritterKind[] = ['bouftou', 'bouftonBlanc', 'bouftonNoir', 'bouftouNoir', 'chefBouftou', 'bouftouRoyal', 'prespic', 'sanglier', 'ecurouille', 'milimulou'];
export const DOAS: CritterKind[] = ['martoa', 'sherpoa', 'douzdoa', 'pikdoa'];
export const PICHONS: CritterKind[] = ['pichonOrange', 'pichonBleu', 'pichonBlanc', 'pichonVert', 'pichonKloune'];
/** Bipèdes (jambes, corps, bras, tête : pièces des plantes). */
export const BIPEDS: CritterKind[] = ['milirat', 'ramane', 'scelerat', 'mobEponge'];
/** Wabbits (Île de la Cawotte, Château du Wa Wabbit) : lapins bipèdes accroupis (pièces des plantes : jambes, corps, bras, tête). */
export const WABBITS: CritterKind[] = ['wabbit', 'blackWabbit', 'tiwabbit', 'blackTiwabbit', 'tiwabbitKiafin', 'woWabbit', 'grandPaWabbit', 'waWabbit', 'blackWoWabbit', 'blancPaWabbit'];
export const FLAMES: CritterKind[] = ['feuVif', 'feuJoie', 'feuFurieux', 'feuFollet'];
/** Maison Fantôme : fantômes et Gargrouille (rig flottant : halo, corps, visage). */
/** Kwaks, Kwakeres, Bwaks (Montagne des Craqueleurs, Nid du Kwakwa) et le Kwakwa : oiseaux élémentaires. */
export const KWAKS: CritterKind[] = ['kwakVent', 'kwakereVent', 'bwakVent', 'kwakFlamme', 'kwakereFlamme', 'bwakFlamme', 'kwakGlace', 'kwakereGlace', 'bwakGlace', 'kwakTerre', 'kwakereTerre', 'bwakTerre', 'kwakwa'];
export const GHOSTS: CritterKind[] = ['boostache', 'boostachePrepubere', 'gargrouille', 'ashimagari'];
/** Blops (Lac de Cania, Clos des Blops) : gelées translucides à fleur (rig des gelées : flaque, corps, visage). */
export const BLOPS: CritterKind[] = ['blopCoco', 'blopIndigo', 'blopGriotte', 'blopReinette', 'gloutoblop', 'blopignon', 'tronkoblop', 'blopCocoRoyal', 'blopIndigoRoyal', 'blopGriotteRoyal', 'blopReinetteRoyal'];
/** Craqueleurs (Plaines Rocheuses, Pitons Rocheux) : golems de pierre bipèdes (pièces des plantes) ; l'Élémenterre est une carapace (rig des gelées). */
export const CRAQS: CritterKind[] = ['craqueleur', 'craqueleurLegendaire', 'craquelourd', 'craqueleurPlaines', 'kirboule', 'craqueboule', 'craquelope', 'elementerre'];
/** Pirates (Arche d'Otomaï, Cale) : bipèdes (pièces des plantes) ; le Tonneau Pirate est un objet (rig des gelées). */
export const PIRATES: CritterKind[] = ['sparo', 'barbroussa', 'leFlib', 'gourlo', 'tonneauPirate', 'boomba', 'nakunbra', 'canondorf'];
/** Terrier du Wa Wabbit : Wobots (bipèdes ; le Tiwobot sur ressort : rig des gelées). */
export const WOBOTS: CritterKind[] = ['wobot', 'waWobot', 'wobotKiafin', 'tiwobot'];
/** Saharach : quadrupèdes (corps de mouton) ; Boulépique et Ouroboulos, vers (rig des gelées). */
export const DESERTS: CritterKind[] = ['scordionBleu', 'fennex', 'boulepique', 'leolhyene', 'ouroboulos', 'mantiscore'];
export const partsOf = (k: CritterKind): readonly CritterPart[] =>
  (k === 'tofu' || k === 'tofuMalade' || PICHONS.includes(k) || TOFUS.includes(k) || KWAKS.includes(k) ? TOFU_PARTS : SHEEP.includes(k) || PIOUS.includes(k) || BEASTS.includes(k) || SCARAS.includes(k) || k === 'rib' || ['scordionBleu', 'fennex', 'leolhyene'].includes(k) ? SHEEP_PARTS : CATS.includes(k) ? CAT_PARTS
    : JELLIES.includes(k) || FLAMES.includes(k) || GHOSTS.includes(k) || BLOPS.includes(k) || k === 'kwoan' || k === 'elementerre' || k === 'tonneauPirate' || k === 'tiwobot' || k === 'boulepique' || k === 'ouroboulos' ? JELLY_PARTS : k === 'aminite' || SPIDERS.includes(k) || DOAS.includes(k) ? SHROOM_PARTS : PLANT_PARTS);
const BIRD_PIVOTS: Partial<Record<CritterPart, [number, number]>> = { tail: [94, 112], legB: [78, 134], body: [70, 140], legF: [62, 134], head: [58, 104], horn: [58, 80] };
const SPIDER_PIVOTS: Partial<Record<CritterPart, [number, number]>> = { legB: [86, 116], legF: [56, 118], body: [70, 140], head: [70, 100] };
const PLANT_PIVOTS: Partial<Record<CritterPart, [number, number]>> = { legB: [70, 130], legF: [70, 130], stem: [70, 132], leafB: [76, 112], leafF: [64, 114], head: [70, 96] };
const JELLY_PIVOTS: Partial<Record<CritterPart, [number, number]>> = { back: [70, 144], body: [70, 146], face: [70, 146] };
const FLAME_PIVOTS: Partial<Record<CritterPart, [number, number]>> = { back: [70, 150], body: [70, 120], face: [70, 120] };
const SHEEP_PIVOTS: Partial<Record<CritterPart, [number, number]>> = { tail: [116, 98], legB: [104, 136], body: [80, 132], legF: [66, 138], head: [60, 110], horn: [60, 94] };

/** Pivots (rotation des morceaux) : hanches, base de la tige, attache de la tête… */
export const CRITTER_PIVOTS = {
  tofu: { wingB: [104, 92], legB: [80, 128], legF: [62, 128], body: [72, 128], crest: [70, 62], wingF: [80, 114] },
  pissenlit: { legB: [70, 130], legF: [70, 130], stem: [70, 132], leafB: [72, 120], leafF: [68, 122], head: [70, 108] },
  rose: { legB: [70, 130], legF: [70, 130], stem: [70, 132], leafB: [74, 112], leafF: [66, 114], head: [70, 102] },
  tournesol: { legB: [70, 130], legF: [70, 130], stem: [70, 132], leafB: [74, 116], leafF: [66, 118], head: [70, 98] },
  palichon: SHEEP_PIVOTS, orageux: SHEEP_PIVOTS, nuageux: SHEEP_PIVOTS, bouftor: SHEEP_PIVOTS,
  chakrobat: { tail: [86, 126], legB: [80, 78], body: [70, 148], legF: [64, 140], head: [66, 70], wisp: [58, 82] },
  tigrimas: { tail: [106, 84], legB: [102, 110], body: [70, 150], legF: [80, 112], head: [68, 88], wisp: [70, 138] },
  ronronchon: { tail: [118, 108], legB: [104, 146], body: [80, 150], legF: [60, 146], head: [58, 104], wisp: [24, 92] },
  plikplok: JELLY_PIVOTS, gloot: JELLY_PIVOTS, splatch: JELLY_PIVOTS,
  feuVif: FLAME_PIVOTS, feuJoie: FLAME_PIVOTS, feuFurieux: FLAME_PIVOTS, feuFollet: FLAME_PIVOTS,
  aminite: { legB: [78, 140], legF: [62, 140], body: [70, 146], head: [70, 92] },
  ...Object.fromEntries(['piouViolet', 'piouRouge', 'piouVert', 'piouBleu', 'piouRose', 'piouJaune'].map((k) => [k, BIRD_PIVOTS])),
  tofuMalade: { wingB: [104, 92], legB: [80, 128], legF: [62, 128], body: [72, 128], crest: [70, 62], wingF: [80, 114] },
  ...Object.fromEntries(['arakneMalade', 'araknose', 'arakmute'].map((k) => [k, SPIDER_PIVOTS])),
  ...Object.fromEntries(['larveBleue', 'larveVerte', 'larveOrange', 'larveJaune'].map((k) => [k, JELLY_PIVOTS])),
  tournesolSauvage: PLANT_PIVOTS, roseDemo: PLANT_PIVOTS, pissenlitDiabo: PLANT_PIVOTS, gardienne: PLANT_PIVOTS,
  epouvanteur: { legB: [70, 150], legF: [70, 150], stem: [70, 150], leafB: [86, 92], leafF: [54, 92], head: [70, 70] },
  tournesolAffame: { legB: [70, 130], legF: [70, 130], stem: [70, 132], leafB: [86, 104], leafF: [54, 104], head: [70, 80] },
  ...Object.fromEntries(['bouftou', 'bouftonBlanc', 'bouftonNoir', 'bouftouNoir', 'chefBouftou', 'bouftouRoyal', 'prespic', 'sanglier'].map((k) => [k, SHEEP_PIVOTS])),
  ecurouille: { tail: [92, 130], legB: [88, 136], body: [68, 140], legF: [56, 140], head: [58, 104], horn: [62, 76] },
  ...Object.fromEntries(['martoa', 'sherpoa', 'douzdoa', 'pikdoa'].map((k) => [k, { legB: [80, 124], legF: [62, 126], body: [70, 146], head: [70, 104] }])),
  arakneEgouts: SPIDER_PIVOTS,
  milimulou: { tail: [110, 112], legB: [96, 122], body: [80, 132], legF: [64, 96], head: [56, 86], horn: [58, 74] },
  ...Object.fromEntries(['milirat', 'ramane', 'scelerat', 'mobEponge'].map((k) => [k, { legB: [80, 118], legF: [62, 118], stem: [70, 142], leafB: [92, 84], leafF: [52, 86], head: [68, 82] }])),
  ...Object.fromEntries(['pichonOrange', 'pichonBleu', 'pichonBlanc', 'pichonVert', 'pichonKloune'].map((k) => [k, { wingB: [94, 98], legB: [102, 106], legF: [68, 122], body: [72, 132], crest: [74, 84], wingF: [74, 112] }])),
  ...Object.fromEntries(BLOPS.map((k) => [k, k === 'tronkoblop' ? { back: [70, 150], body: [70, 150], face: [70, 60] } : JELLY_PIVOTS])),
  ...Object.fromEntries(['craqueleur', 'craqueleurLegendaire', 'craquelourd'].map((k) => [k, { legB: [92, 118], legF: [62, 120], stem: [72, 146], leafB: [104, 60], leafF: [56, 58], head: [58, 80] }])),
  craqueleurPlaines: { legB: [98, 116], legF: [70, 118], stem: [78, 146], leafB: [106, 82], leafF: [56, 92], head: [60, 84] },
  kirboule: { legB: [98, 116], legF: [70, 118], stem: [78, 146], leafB: [106, 82], leafF: [56, 92], head: [60, 84] },
  craqueboule: { legB: [82, 124], legF: [58, 124], stem: [72, 140], leafB: [92, 100], leafF: [48, 100], head: [70, 96] },
  craquelope: { legB: [82, 118], legF: [60, 120], stem: [70, 140], leafB: [92, 76], leafF: [52, 86], head: [68, 78] },
  elementerre: JELLY_PIVOTS,
  sparo: { legB: [82, 132], legF: [60, 132], stem: [70, 146], leafB: [100, 104], leafF: [44, 100], head: [68, 84] },
  barbroussa: { legB: [80, 122], legF: [64, 122], stem: [72, 140], leafB: [90, 96], leafF: [56, 96], head: [72, 90] },
  leFlib: { legB: [84, 136], legF: [58, 136], stem: [72, 146], leafB: [100, 100], leafF: [48, 100], head: [66, 96] },
  gourlo: { legB: [88, 120], legF: [60, 120], stem: [72, 140], leafB: [92, 70], leafF: [46, 82], head: [70, 84] },
  tonneauPirate: JELLY_PIVOTS,
  wobot: { legB: [86, 120], legF: [58, 120], stem: [72, 140], leafB: [98, 90], leafF: [50, 90], head: [66, 82] },
  waWobot: { legB: [86, 120], legF: [58, 120], stem: [72, 140], leafB: [98, 90], leafF: [44, 92], head: [70, 62] },
  wobotKiafin: { legB: [82, 118], legF: [60, 118], stem: [72, 140], leafB: [92, 104], leafF: [50, 100], head: [70, 86] },
  tiwobot: { back: [70, 146], body: [70, 146], face: [70, 100] },
  scordionBleu: { tail: [100, 120], legB: [96, 128], body: [74, 136], legF: [62, 130], head: [50, 120], horn: [40, 120] },
  fennex: { tail: [96, 112], legB: [92, 124], body: [80, 132], legF: [70, 126], head: [60, 108], horn: [56, 88] },
  leolhyene: SHEEP_PIVOTS,
  mantiscore: { legB: [84, 124], legF: [62, 124], stem: [72, 146], leafB: [96, 102], leafF: [56, 100], head: [66, 96] },
  boulepique: JELLY_PIVOTS, ouroboulos: { back: [70, 146], body: [70, 146], face: [66, 68] },
  boomba: { legB: [80, 116], legF: [62, 116], stem: [72, 140], leafB: [84, 86], leafF: [60, 88], head: [66, 78] },
  nakunbra: { legB: [80, 116], legF: [62, 116], stem: [72, 140], leafB: [84, 86], leafF: [60, 88], head: [66, 78] },
  canondorf: { legB: [92, 138], legF: [52, 140], stem: [70, 140], leafB: [106, 94], leafF: [88, 100], head: [96, 96] },
  ...Object.fromEntries(WABBITS.map((k) => [k, { legB: [84, 122], legF: [62, 122], stem: [72, 140], leafB: [94, 100], leafF: [54, 102], head: [66, 96] }])),
  ...Object.fromEntries(KWAKS.map((k) => [k, { wingB: [100, 98], legB: [86, 128], legF: [68, 128], body: [78, 128], crest: [62, 84], wingF: [80, 104] }])),
  ...Object.fromEntries(['tofuJaune', 'tofuNoir', 'tofoune', 'tofukaz', 'tofuMutant', 'tofuVentripotent', 'batofu', 'bomberfu', 'tofuMalefique'].map((k) => [k, { wingB: [104, 92], legB: [86, 146], legF: [58, 146], body: [74, 140], crest: [72, 64], wingF: [82, 112] }])),
  ...Object.fromEntries(['scaraRouge', 'scaraBleu', 'scaraVert', 'scaraBlanc', 'scaraNoir', 'scaraImmature', 'scarabosse'].map((k) => [k, { tail: [90, 92], legB: [96, 126], body: [80, 130], legF: [64, 128], head: [56, 110], horn: [54, 90] }])),
  rib: SHEEP_PIVOTS, kwoan: { back: [70, 150], body: [70, 110], face: [70, 110] },
  boostache: { back: [70, 150], body: [70, 104], face: [70, 104] }, boostachePrepubere: { back: [70, 150], body: [70, 104], face: [70, 104] },
  gargrouille: { back: [70, 150], body: [70, 146], face: [70, 146] }, ashimagari: { back: [70, 150], body: [70, 96], face: [70, 96] },
} as Record<CritterKind, Partial<Record<CritterPart, [number, number]>>>;

type Parts = Partial<Record<CritterPart, string[]>>;
const LW = 1.8;
let n = 0;
let pre = 'cc';
let builds = 0;
const uid = (p: string) => `${pre}${p}${n++}`;
function begin() {
  n = 0;
  pre = `cc${(builds++).toString(36)}`;
}
const push = (P: Parts, k: CritterPart, ...s: string[]) => (P[k] ??= []).push(...s);

interface BlobOpts { ink?: string; w?: number; hl?: [number, number]; alpha?: number; rim?: boolean }
/** Forme ronde et brillante (lumière en haut à gauche). */
function blob(d: string, base: string, o: BlobOpts = {}): string {
  const g = uid('g'), c = uid('c');
  const ink = o.ink ?? shade(base, -0.62);
  const [hx, hy] = o.hl ?? [0.34, 0.28];
  return [
    `<radialGradient id="${g}" cx="${hx}" cy="${hy}" r="0.95"><stop offset="0" stop-color="${shade(base, 0.45)}"/><stop offset="0.45" stop-color="${base}"/><stop offset="1" stop-color="${shade(base, -0.22)}"/></radialGradient>`,
    `<clipPath id="${c}"><path d="${d}"/></clipPath>`,
    `<path d="${d}" fill="url(#${g})" ${o.alpha !== undefined ? `fill-opacity="${o.alpha}"` : ''}/>`,
    o.rim === false ? '' : `<path d="${d}" fill="none" stroke="#fff" stroke-width="3.2" opacity="0.28" clip-path="url(#${c})" transform="translate(1.8,1.6)"/>`,
    `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${o.w ?? LW}" stroke-linejoin="round" stroke-linecap="round"/>`,
  ].join('');
}
const circle = (cx: number, cy: number, r: number) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0 Z`;

/** Tube coloré (tige, patte) avec contour. */
function tube(d: string, w: number, col: string, ink = shade(col, -0.6)): string {
  return `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${w + LW * 2}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w * 0.28}" stroke-linecap="round" opacity="0.3" transform="translate(-${w * 0.2},-${w * 0.15})"/>`;
}

/** Halo éthéré (Incarnam) derrière une forme. */
const halo = (id: string, cx: number, cy: number, r: number, col: string) =>
  `<radialGradient id="${id}"><stop offset="0.55" stop-color="${col}" stop-opacity="0.45"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;

/** Petite étincelle à 4 branches. */
const spark = (x: number, y: number, s: number, op = 0.9) =>
  `<path d="M${x},${y - s} Q${x + s * 0.18},${y - s * 0.18} ${x + s},${y} Q${x + s * 0.18},${y + s * 0.18} ${x},${y + s} Q${x - s * 0.18},${y + s * 0.18} ${x - s},${y} Q${x - s * 0.18},${y - s * 0.18} ${x},${y - s} Z" fill="#fff" opacity="${op}"/>`;

/**
 * Œil chibi : blanc, iris, pupille et deux reflets (regard vers la gauche).
 * `lid` : paupière (0 = aucune, > 0 = fâché : trait épais incliné ; < 0 = triste : trait incliné dans l'autre sens).
 */
function eyeChibi(cx: number, cy: number, rx: number, ry: number, iris: string, o: { lid?: number; ring?: string; skin?: string; look?: [number, number] } = {}): string {
  const [lx, ly] = o.look ?? [-0.32, 0.12];
  const ix = cx + lx * rx, iy = cy + ly * ry;
  const out = [
    o.ring ? `<path d="${ellipse(cx, cy, rx + 4, ry + 4)}" fill="${o.ring}" opacity="0.45"/>` : '',
    `<path d="${ellipse(cx, cy, rx, ry)}" fill="#fdfdf8" stroke="#24323a" stroke-width="${LW}"/>`,
    `<ellipse cx="${ix}" cy="${iy}" rx="${rx * 0.52}" ry="${ry * 0.56}" fill="${iris}"/>`,
    `<ellipse cx="${ix}" cy="${iy + ry * 0.05}" rx="${rx * 0.28}" ry="${ry * 0.32}" fill="#101418"/>`,
    `<circle cx="${ix - rx * 0.16}" cy="${iy - ry * 0.2}" r="${Math.max(1.6, rx * 0.17)}" fill="#fff"/>`,
    `<circle cx="${ix + rx * 0.16}" cy="${iy + ry * 0.18}" r="${Math.max(0.9, rx * 0.08)}" fill="#fff" opacity="0.8"/>`,
  ];
  if (o.lid) {
    // paupière découpée dans l'œil (couleur de la peau), bord incliné : fâché (> 0, bord qui descend vers le nez) ou triste (< 0)
    const clip = uid('e');
    const y0 = cy - ry * 0.35, dy = ry * 0.32 * Math.sign(o.lid);
    out.push(`<clipPath id="${clip}"><path d="${ellipse(cx, cy, rx, ry)}"/></clipPath>`);
    out.push(`<path d="M${cx - rx - 2},${y0 - dy} L${cx + rx + 2},${y0 + dy} L${cx + rx + 2},${cy - ry - 2} L${cx - rx - 2},${cy - ry - 2} Z" fill="${o.skin ?? '#9fd2ee'}" clip-path="url(#${clip})"/>`);
    out.push(`<path d="M${cx - rx * 0.92},${y0 - dy * 0.92} L${cx + rx * 0.92},${y0 + dy * 0.92}" stroke="#24323a" stroke-width="3" stroke-linecap="round"/>`);
    out.push(`<path d="${ellipse(cx, cy, rx, ry)}" fill="none" stroke="#24323a" stroke-width="${LW}"/>`);
  }
  return out.join('');
}

/** Pied-racine : tige qui se termine en petit pied pointu (comme les plantes de Dofus). */
function rootLeg(x0: number, y0: number, x1: number, y1: number, toe: number, col: string): string {
  const mx = (x0 + x1) / 2 + (x1 > x0 ? 2 : -2);
  return tube(`M${x0},${y0} Q${mx},${(y0 + y1) / 2} ${x1},${y1}`, 6.5, col) +
    blob(`M${x1 - 5},${y1 - 3} Q${x1 + toe * 0.5},${y1 - 6} ${x1 + toe},${y1 + 1} Q${x1 + toe * 0.4},${y1 + 5} ${x1 - 5},${y1 + 4} Q${x1 - 8},${y1} ${x1 - 5},${y1 - 3} Z`, col);
}

function assemble(kind: CritterKind, P: Parts, part?: CritterPart, defs = ''): string {
  const body = part ? (P[part] ?? []).join('') : partsOf(kind).map((k) => (P[k] ?? []).join('')).join('');
  return svg(CRITTER_W, CRITTER_H, defs, body);
}

/* ---------------------------------------------------------------------------------------- */

const STEM = '#5f7684';

export function tofuSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const BLUE = '#9fd2ee', FOOT = '#8be3a4';
  push(P, 'wingB', blob(ellipse(108, 90, 13, 10), BLUE));
  push(P, 'legB', tube('M80,126 Q83,138 84,146', 3.4, '#6b8fa3'), blob(ellipse(88, 148, 11, 6), FOOT));
  push(P, 'legF', tube('M62,126 Q60,138 58,146', 3.4, '#6b8fa3'), blob(ellipse(54, 148, 12, 6.5), FOOT));
  // corps : boule bleu pâle translucide, halo éthéré
  push(P, 'body', halo(uid('h'), 74, 96, 54, '#c9ecff'));
  push(P, 'body', blob(circle(74, 98, 38), BLUE, { hl: [0.3, 0.22] }));
  push(P, 'body', `<path d="M48,82 Q56,68 72,64" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.55"/>`);
  // yeux énormes, tournés vers la gauche ; le plus proche déborde du corps
  push(P, 'body', eyeChibi(68, 94, 11.5, 15, '#3f7f62'), eyeChibi(46, 96, 13.5, 17, '#3f7f62'));
  push(P, 'body', spark(96, 78, 4.5, 0.85), spark(102, 112, 3, 0.6));
  // crête en piques
  push(P, 'crest', blob('M64,64 Q56,42 58,24 Q68,40 72,62 Z', BLUE), blob('M72,63 Q78,38 90,26 Q86,46 80,64 Z', BLUE), blob('M58,68 Q46,56 44,44 Q56,52 64,64 Z', BLUE));
  push(P, 'wingF', blob('M74,112 Q64,116 62,126 Q74,132 86,122 Q84,112 74,112 Z', BLUE));
  return assemble('tofu', P, part);
}

export function pissenlitSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  push(P, 'legB', rootLeg(71, 126, 82, 146, -12, STEM));
  push(P, 'legF', rootLeg(69, 126, 58, 147, -14, STEM));
  push(P, 'stem', tube('M70,134 Q66,120 70,104', 7, STEM));
  push(P, 'leafB', blob('M72,122 Q86,112 92,118 Q84,126 72,124 Z', '#7fa7a0'));
  push(P, 'leafF', blob('M68,124 Q52,118 46,124 Q56,132 68,127 Z', '#7fa7a0'));
  // aigrette : sphère de duvet translucide au bord pelucheux
  const h = uid('h');
  const fuzz = Array.from({ length: 46 }, (_, i) => {
    const a = (i / 46) * Math.PI * 2, r0 = 40, r1 = 45 + (i % 3) * 1.5;
    return `M${70 + Math.cos(a) * r0},${66 + Math.sin(a) * r0} L${70 + Math.cos(a) * r1},${66 + Math.sin(a) * r1}`;
  }).join(' ');
  push(P, 'head',
    halo(h, 70, 66, 58, '#e8fbff'),
    `<path d="${fuzz}" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity="0.9"/>`,
    blob(circle(70, 66, 41), '#eaf8f6', { alpha: 0.82, ink: '#9fc4c4', hl: [0.3, 0.25] }),
    `<path d="M40,52 Q50,32 72,28" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.75"/>`,
    // visage : grands yeux tristes cernés de sombre, petite bouche en accent circonflexe
    eyeChibi(78, 70, 11, 12.5, '#5b4a38', { ring: '#3e4a52', skin: '#dcefee', lid: -1, look: [-0.25, 0.3] }),
    eyeChibi(52, 71, 12, 13.5, '#5b4a38', { ring: '#3e4a52', skin: '#dcefee', lid: -1, look: [-0.25, 0.3] }),
    `<path d="M58,92 Q63,86 68,92" fill="none" stroke="#24323a" stroke-width="2.6" stroke-linecap="round"/>`,
    spark(98, 50, 4.5), spark(44, 96, 3, 0.7),
  );
  return assemble('pissenlit', P, part);
}

export function roseSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const PET = '#c8eef0', PET2 = '#a6e2e6';
  push(P, 'legB', rootLeg(71, 126, 83, 146, -12, STEM));
  push(P, 'legF', rootLeg(69, 126, 57, 147, -14, STEM));
  push(P, 'stem', tube('M70,134 Q74,118 70,100', 7, STEM));
  // épines
  push(P, 'stem', `<path d="M72,122 L78,119 L73,117 Z M68,112 L62,110 L67,107 Z" fill="${STEM}" stroke="${shade(STEM, -0.6)}" stroke-width="1"/>`);
  push(P, 'leafB', blob('M74,110 Q98,96 108,104 Q96,118 74,114 Z', '#a8d9cf'), `<path d="M78,111 Q92,106 104,104" stroke="#6a9a92" stroke-width="1.2" fill="none"/>`);
  push(P, 'leafF', blob('M66,112 Q40,100 30,108 Q44,122 66,116 Z', '#a8d9cf'), `<path d="M62,113 Q46,108 34,108" stroke="#6a9a92" stroke-width="1.2" fill="none"/>`);
  // bouton de rose : pétales extérieurs, puis intérieurs, spirale au sommet
  push(P, 'head',
    halo(uid('h'), 70, 70, 56, '#d8fbff'),
    blob('M30,74 Q26,50 44,40 Q52,62 44,92 Q32,88 30,74 Z', PET2),
    blob('M110,74 Q114,50 96,40 Q88,62 96,92 Q108,88 110,74 Z', PET2),
    blob('M36,64 Q32,46 44,36 Q50,26 62,30 Q70,20 80,28 Q94,26 98,38 Q110,48 104,66 Q108,84 94,94 Q84,104 70,100 Q54,104 46,94 Q32,84 36,64 Z', PET),
    blob('M46,42 Q56,24 72,32 Q86,22 96,40 Q84,34 72,40 Q58,32 46,42 Z', '#e6fbfb'),
    `<path d="M44,40 Q52,50 48,62 M96,40 Q88,50 92,62" fill="none" stroke="#7cbcc4" stroke-width="1.6" opacity="0.8"/>`,
    `<path d="M62,38 Q70,30 78,36 Q74,44 66,42 Q64,38 70,37" fill="none" stroke="#5a9aa2" stroke-width="2" stroke-linecap="round"/>`,
    `<path d="M40,66 Q46,92 70,98 M100,66 Q94,92 70,98" fill="none" stroke="#7cbcc4" stroke-width="1.6" opacity="0.8"/>`,
    // yeux fâchés (sourcils en V), regard vers la gauche
    eyeChibi(80, 66, 10, 12, '#2e6f74', { skin: '#bfe9ec', lid: 1, look: [-0.35, 0.18] }),
    eyeChibi(55, 67, 11, 13, '#2e6f74', { skin: '#bfe9ec', lid: 1, look: [-0.35, 0.18] }),
    `<path d="M58,86 Q66,82 74,86" fill="none" stroke="#24323a" stroke-width="2.6" stroke-linecap="round"/>`,
    spark(100, 44, 4), spark(38, 90, 3, 0.7),
  );
  return assemble('rose', P, part);
}

export function tournesolSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  push(P, 'legB', rootLeg(71, 126, 84, 146, -12, STEM));
  push(P, 'legF', rootLeg(69, 126, 56, 147, -14, STEM));
  push(P, 'stem', tube('M70,134 Q66,116 70,96', 8, STEM));
  push(P, 'leafB', blob('M74,114 Q98,102 106,110 Q96,122 74,118 Z', '#9cc7bd'));
  push(P, 'leafF', blob('M66,116 Q42,106 34,114 Q46,126 66,120 Z', '#9cc7bd'));
  // pétales blancs en couronne autour d'un cœur sombre et brillant
  const cx = 70, cy = 62;
  const petals = Array.from({ length: 13 }, (_, i) => {
    const a = (i / 13) * Math.PI * 2 - Math.PI / 2;
    const tip = [cx + Math.cos(a) * 54, cy + Math.sin(a) * 54];
    const l = [cx + Math.cos(a - 0.2) * 24, cy + Math.sin(a - 0.2) * 24];
    const r = [cx + Math.cos(a + 0.2) * 24, cy + Math.sin(a + 0.2) * 24];
    const cl = [cx + Math.cos(a - 0.17) * 46, cy + Math.sin(a - 0.17) * 46];
    const cr = [cx + Math.cos(a + 0.17) * 46, cy + Math.sin(a + 0.17) * 46];
    return blob(`M${l[0]},${l[1]} Q${cl[0]},${cl[1]} ${tip[0]},${tip[1]} Q${cr[0]},${cr[1]} ${r[0]},${r[1]} Z`, '#f4fbfb', { ink: '#8fb2b6', w: 1.4, rim: false });
  }).join('');
  push(P, 'head',
    halo(uid('h'), cx, cy, 64, '#e6fbff'),
    petals,
    blob(circle(cx - 2, cy + 2, 25), '#2e3a40', { ink: '#0e1418', hl: [0.32, 0.26] }),
    `<path d="M${cx - 18},${cy - 10} Q${cx - 8},${cy - 22} ${cx + 8},${cy - 18}" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity="0.5"/>`,
    // yeux plissés de rage, cernés de rose
    eyeChibi(cx + 6, cy - 2, 7.5, 9, '#7a2a3a', { ring: '#c2667a', skin: '#2e3a40', lid: 1, look: [-0.3, 0.2] }),
    eyeChibi(cx - 14, cy - 1, 8.5, 10, '#7a2a3a', { ring: '#c2667a', skin: '#2e3a40', lid: 1, look: [-0.3, 0.2] }),
    // grimace : dents serrées
    `<path d="M${cx - 20},${cy + 13} Q${cx - 6},${cy + 9} ${cx + 8},${cy + 13} L${cx + 7},${cy + 19} Q${cx - 6},${cy + 16} ${cx - 19},${cy + 19} Z" fill="#f4f4ee" stroke="#0e1418" stroke-width="1.6" stroke-linejoin="round"/>`,
    `<path d="M${cx - 14},${cy + 12} L${cx - 14},${cy + 18} M${cx - 8},${cy + 11} L${cx - 8},${cy + 17} M${cx - 2},${cy + 11} L${cx - 2},${cy + 17} M${cx + 4},${cy + 12} L${cx + 4},${cy + 18}" stroke="#0e1418" stroke-width="1.2"/>`,
    spark(cx + 34, cy - 30, 4.5), spark(cx - 40, cy + 26, 3, 0.7),
  );
  return assemble('tournesol', P, part);
}

/* ---------------------------------------------------------------------------------------- */
/* Pâturages d'Incarnam : Bouftous « chimériques » (moutons-nuages)                          */
/* ---------------------------------------------------------------------------------------- */

interface SheepStyle {
  fleece: string;
  face: string;
  hoof: string;
  iris: string;
  ear: string;
  /** Couleur du nez ; `false` = pas de nez. */
  nose?: string | false;
  sleepy?: boolean;
  horn: 'small' | 'ram';
  hornCol: string;
  crystals?: boolean;
}
const SHEEP_STYLE: Record<string, SheepStyle> = {
  palichon: { fleece: '#f2f7f6', face: '#a9bcb4', hoof: '#8ff0b4', iris: '#6a7a3a', ear: '#93aaa2', horn: 'small', hornCol: '#8fa49c' },
  orageux: { fleece: '#7f978b', face: '#1f2a25', hoof: '#eef8f4', iris: '#3a4a3a', ear: '#2a3630', horn: 'small', hornCol: '#f2f6f4' },
  nuageux: { fleece: '#f4f8f8', face: '#cfe2dc', hoof: '#8ff0b4', iris: '#2a5a7a', ear: '#b4cac4', nose: false, horn: 'small', hornCol: '#e6eeec' },
  bouftor: { fleece: '#eef7fb', face: '#c4d8dc', hoof: '#8ff0b4', iris: '#7a6a2a', ear: '#a8c6d0', nose: false, sleepy: true, horn: 'ram', hornCol: '#5e6662', crystals: true },
};

/** Toison en nuage : boules qui se chevauchent, contour commun (on trace tous les contours, puis tous les remplissages). */
function fleece(balls: [number, number, number][], col: string): string {
  const g = uid('fl');
  const ink = shade(col, -0.55);
  return `<radialGradient id="${g}" cx="0.35" cy="0.25" r="1"><stop offset="0" stop-color="${shade(col, 0.5)}"/><stop offset="0.55" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, -0.2)}"/></radialGradient>` +
    balls.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + LW}" fill="${ink}"/>`).join('') +
    balls.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${g})"/>`).join('') +
    balls.slice(0, 4).map(([x, y, r]) => `<path d="M${x - r * 0.55},${y - r * 0.35} q${r * 0.35},${-r * 0.4} ${r * 0.8},${-r * 0.2}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`).join('');
}

function sheepSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const S = SHEEP_STYLE[kind];
  const P: Parts = {};
  // pattes très courtes : seuls les sabots dépassent de la toison
  const leg = (x: number, y0: number) => tube(`M${x},${y0} L${x - 1},${y0 + 7}`, 8, shade(S.fleece, -0.15)) + blob(ellipse(x - 1, y0 + 10, 5.5, 3.5), S.hoof, { w: 1.4, rim: false });
  // queue (cristal pour le Bouftor)
  push(P, 'tail', S.crystals
    ? blob('M114,96 L130,74 L124,92 L138,86 L126,100 Z', '#bfe6f6', { ink: '#5a8aa0' }) + tube('M112,100 Q122,96 126,88', 3, '#7aa4b4')
    : blob(circle(118, 98, 9), S.fleece));
  push(P, 'legB', leg(96, 136), leg(112, 134));
  push(P, 'legF', leg(58, 138), leg(74, 140));
  // corps : toison
  const balls: [number, number, number][] = [[80, 98, 32], [102, 92, 22], [60, 92, 22], [84, 74, 22], [106, 110, 20], [62, 114, 20], [86, 118, 22], [70, 76, 16]];
  push(P, 'body', halo(uid('h'), 82, 98, 62, '#e4f6ff'), fleece(balls, S.fleece));
  if (S.crystals) {
    for (const [x, y, a, l] of [[96, 58, 0.2, 16], [114, 92, 1.2, 14], [110, 120, 2.2, 11]] as const) {
      const tx = x + Math.sin(a) * l, ty = y - Math.cos(a) * l;
      push(P, 'body', blob(`M${x - 5},${y} L${f(tx)},${f(ty)} L${x + 5},${y + 2} Z`, '#c8ecfa', { ink: '#5a8aa0', w: 1.4 }));
    }
  }
  push(P, 'body', spark(104, 70, 4), spark(66, 122, 3, 0.6));
  // tête : visage, oreille, œil, museau
  push(P, 'head',
    blob(ellipse(46, 108, 20, 19), S.face),
    fleece([[48, 88, 14], [62, 92, 12], [40, 96, 9]], S.fleece),
    blob('M62,102 Q74,96 76,106 Q68,112 62,108 Z', S.ear),
    eyeChibi(42, 108, 9.5, 11.5, S.iris, { look: [-0.4, 0.15], ...(S.sleepy ? { lid: -1, skin: S.face } : {}) }),
    S.nose === false ? '' : S.nose ? blob(ellipse(29, 117, 8, 6), S.nose) : `<ellipse cx="29" cy="117" rx="5" ry="3.5" fill="${shade(S.face, -0.5)}"/>`,
    `<path d="M32,124 Q38,128 44,124" fill="none" stroke="${shade(S.face, -0.6)}" stroke-width="2" stroke-linecap="round"/>`,
  );
  // cornes
  if (S.horn === 'ram') {
    // grosses cornes de bélier en pierre gravée
    // corne en spirale (pierre gravée) enroulée sur le côté de la tête
    const spiral = 'M56,98 C44,70 70,48 92,60 C114,72 108,104 86,110 C70,114 64,98 72,90 C78,84 88,88 86,96';
    const back = 'M66,90 C66,70 84,58 100,64 C110,68 112,80 106,86';
    // plus petite (réduite autour de l'attache de la tête)
    push(P, 'horn', `<g transform="translate(60,96) scale(0.62) translate(-60,-96)">` +
      tube(back, 14, shade(S.hornCol, -0.25), '#1e2220') +
      tube(spiral, 19, S.hornCol, '#1e2220') +
      `<path d="M58,76 l7,5 M76,58 l2,8 M98,64 l-4,7 M106,88 l-8,0 M94,106 l-4,-6" stroke="#c8d0cc" stroke-width="2.4" stroke-linecap="round"/>` +
      `<path d="M62,70 Q72,56 88,56" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.35"/></g>`);
  } else {
    push(P, 'horn', blob('M48,82 Q46,70 54,66 Q60,70 56,82 Z', S.hornCol));
  }
  return assemble(kind, P, part);
}
const f = (n: number) => n.toFixed(1);

/* ---------------------------------------------------------------------------------------- */
/* Forêt d'Incarnam : chats fantômes (Dofus 3) — silhouette d'un seul tenant, blanc en haut,   */
/* cyan en bas, contour fin ; petits yeux, moustaches vertes ; feux follets lumineux à yeux.   */
/* ---------------------------------------------------------------------------------------- */

const CAT_INK = '#5b8ca4';
const WHISKER = '#4fdc95';

/** Capsule (segment aux bouts ronds) de (x1,y1) à (x2,y2), rayon r. */
function capsule(x1: number, y1: number, x2: number, y2: number, r: number): string {
  const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * r, ny = Math.cos(a) * r;
  return `M${f(x1 + nx)},${f(y1 + ny)} L${f(x2 + nx)},${f(y2 + ny)} A${r},${r} 0 0,0 ${f(x2 - nx)},${f(y2 - ny)} L${f(x1 - nx)},${f(y1 - ny)} A${r},${r} 0 0,0 ${f(x1 + nx)},${f(y1 + ny)} Z`;
}

/** Silhouette fusionnée : tous les contours, puis tous les remplissages (même dégradé vertical), puis un reflet. */
function catBody(shapes: string[], top: number, bottom: number, hl: string[] = []): string {
  const g = uid('cg');
  return `<linearGradient id="${g}" gradientUnits="userSpaceOnUse" x1="0" y1="${top}" x2="0" y2="${bottom}"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#e6f5fb"/><stop offset="1" stop-color="#a6d8ec"/></linearGradient>` +
    shapes.map((d) => `<path d="${d}" fill="none" stroke="${CAT_INK}" stroke-width="3.2" stroke-linejoin="round"/>`).join('') +
    shapes.map((d) => `<path d="${d}" fill="url(#${g})" stroke="url(#${g})" stroke-width="0.6" stroke-linejoin="round"/>`).join('') +
    hl.map((d) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity="0.85"/>`).join('');
}

/** Feu follet : boule lumineuse (cœur blanc), petite flamme au-dessus, deux yeux ronds. */
function glowOrb(x: number, y: number, r: number, col: string, look = -0.3): string {
  const g = uid('og'), h = uid('oh');
  const flame = `M${x - r * 0.8},${y - r * 0.4} Q${x - r * 0.6},${y - r * 1.5} ${x + r * 0.15},${y - r * 2.1} Q${x},${y - r * 1.3} ${x + r * 0.75},${y - r * 0.9} Q${x + r},${y - r * 0.5} ${x + r * 0.8},${y - r * 0.2} Z`;
  const eye = (ex: number, s: number) => `<ellipse cx="${f(ex)}" cy="${f(y + r * 0.12)}" rx="${f(s)}" ry="${f(s * 1.15)}" fill="#fff" stroke="#1d2a30" stroke-width="1.1"/><circle cx="${f(ex + look * s)}" cy="${f(y + r * 0.18)}" r="${f(s * 0.5)}" fill="#1d2a30"/>`;
  return `<radialGradient id="${h}"><stop offset="0.35" stop-color="${col}" stop-opacity="0.6"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${g}" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="${shade(col, 0.55)}"/><stop offset="1" stop-color="${col}"/></radialGradient>` +
    `<circle cx="${x}" cy="${y - r * 0.3}" r="${r * 2.3}" fill="url(#${h})"/>` +
    `<path d="${flame}" fill="${shade(col, 0.3)}" stroke="${shade(col, -0.35)}" stroke-width="1"/>` +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${g})" stroke="${shade(col, -0.35)}" stroke-width="1"/>` +
    eye(x - r * 0.38, r * 0.27) + eye(x + r * 0.3, r * 0.23);
}

const ear = (x0: number, y0: number, tx: number, ty: number, x1: number, y1: number) => `M${x0},${y0} Q${tx - 3},${ty + 8} ${tx},${ty} Q${tx + 5},${ty + 9} ${x1},${y1} Z`;
const whiskers = (x: number, y: number, dir = -1) =>
  `<path d="M${x},${y} l${dir * 15},-6 M${x},${y + 3} l${dir * 17},0 M${x},${y + 6} l${dir * 14},6" stroke="${WHISKER}" stroke-width="1.5" stroke-linecap="round"/>`;
/** Queue effilée qui se termine en pointe cyan. */
const catTail = (d: string, w: number) => {
  const g = uid('tg');
  return `<linearGradient id="${g}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e6f5fb"/><stop offset="1" stop-color="#8fcde6"/></linearGradient>` +
    `<path d="${d}" fill="none" stroke="${CAT_INK}" stroke-width="${w + 3.2}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#${g})" stroke-width="${w}" stroke-linecap="round"/>`;
};
const DARK = '#1d2a30';

function catSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  // Un seul bloc (tête et corps confondus, sans cou) : oreilles et visage posés en haut du bloc.
  if (kind === 'chakrobat') {
    // longue « chaussette » dressée, ventre rond en bas, bras tendus vers le feu follet bleu, bouche grande ouverte
    push(P, 'tail', catTail('M86,126 Q106,134 98,148 Q94,156 108,154', 5));
    push(P, 'legB', catBody([capsule(80, 78, 80, 30, 4.5), ellipse(80, 28, 5.5, 4.5)], 24, 90));
    push(P, 'body', catBody([
      ear(57, 56, 52, 38, 64, 48), ear(70, 48, 82, 38, 82, 58),
      'M56,64 C54,52 60,46 68,46 C78,46 84,54 82,66 C80,84 82,98 88,110 C96,126 90,146 72,148 C54,150 48,134 54,116 C58,102 58,82 56,64 Z',
      ellipse(62, 148, 7, 4.5), ellipse(81, 147, 7, 4.5),
    ], 40, 150, ['M60,56 Q64,50 70,50', 'M62,118 Q64,110 72,108']));
    push(P, 'head',
      `<path d="M57,57 q3,-3 6,0 M69,56 q3,-3 6,0" fill="none" stroke="${DARK}" stroke-width="2.2" stroke-linecap="round"/>`,
      `<path d="M55,63 Q56,82 66,82 Q76,81 77,63 Q66,68 55,63 Z" fill="#a8202e" stroke="${DARK}" stroke-width="1.4"/><path d="M59,77 Q66,73 73,77 Q66,83 59,77 Z" fill="#ea6f7c"/>`,
      `<path d="M58,64.5 l2,3 l2,-2.6 Z M69,65 l2,3 l2,-3.2 Z" fill="#fff"/>`,
      whiskers(54, 66), whiskers(84, 64, 1));
    push(P, 'legF', '');
    push(P, 'wisp', glowOrb(64, 26, 10, '#7fd3ff'), catBody([capsule(52, 90, 47, 32, 4.5), ellipse(47, 30, 5.5, 4.5)], 24, 90));
  } else if (kind === 'tigrimas') {
    // boule en équilibre sur son feu follet vert (patte avant posée dessus), patte arrière lancée, queue dressée en crochet
    push(P, 'tail', catTail('M106,84 Q122,60 114,40 Q108,22 124,14', 7));
    push(P, 'legB', catBody([capsule(102, 110, 118, 120, 5.5), ellipse(120, 121, 6.5, 5)], 104, 126));
    push(P, 'body', glowOrb(70, 138, 12, '#3fe0a0'), catBody([
      ear(50, 80, 40, 48, 64, 68), ear(70, 66, 86, 40, 92, 74),
      ellipse(80, 94, 32, 30),
    ], 44, 124, ['M58,72 Q66,64 78,64', 'M98,106 Q104,100 106,92']));
    push(P, 'legF', catBody([capsule(80, 112, 72, 124, 6), ellipse(71, 126, 7.5, 5)], 108, 130));
    push(P, 'head',
      `<path d="M54,78 Q58,74 63,77 Q58,80 54,78 Z M70,75 Q74,71 79,74 Q74,78 70,75 Z" fill="${DARK}"/>`,
      `<path d="M53,73 L63,75 M70,71 L80,70" stroke="${DARK}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<path d="M52,86 Q55,100 68,99 Q80,97 84,84 Q68,90 52,86 Z" fill="#a8202e" stroke="${DARK}" stroke-width="1.4"/><path d="M59,95 Q68,91 77,94 Q69,99 59,95 Z" fill="#ea6f7c"/>`,
      `<path d="M56,87.4 l2.2,4 l2.2,-3.3 Z M75,87.4 l2.2,4 l2.2,-4.3 Z" fill="#fff"/>`,
      whiskers(50, 84), whiskers(92, 80, 1));
  } else {
    // grosse boule affalée, l'air blasé ; sa queue monte et devient un esprit bleu à yeux au-dessus de lui
    push(P, 'tail', catTail('M118,108 Q140,84 128,52 Q118,28 96,38', 10), glowOrb(90, 44, 12, '#86d8ff', -0.1));
    push(P, 'legB', catBody([ellipse(104, 148, 10, 5)], 142, 154));
    push(P, 'body', catBody([
      ear(42, 98, 38, 70, 58, 86), ear(64, 84, 74, 64, 84, 88),
      ellipse(80, 116, 45, 34),
    ], 64, 150, ['M48,92 Q58,84 72,84', 'M108,96 Q118,104 120,116']));
    push(P, 'legF', catBody([ellipse(50, 146, 10, 5.5), ellipse(72, 150, 10, 5)], 140, 155));
    push(P, 'head',
      `<path d="M44,100 L55,99 Q54,105 49.5,105 Q45,104.5 44,100 Z M62,98 L72,98 Q71,104 67,104 Q63,103.5 62,98 Z" fill="${DARK}"/>`,
      `<path d="M43,99.5 L56,98.5 M61,97.8 L73,97.8" stroke="${DARK}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<path d="M52,113 Q57,109 62,113" fill="none" stroke="${DARK}" stroke-width="2" stroke-linecap="round"/>`,
      whiskers(42, 106), whiskers(80, 104, 1));
    push(P, 'wisp', glowOrb(24, 92, 7, '#3fe0a0'), glowOrb(128, 140, 7, '#b4f05a'));
  }
  return assemble(kind, P, part);
}

/* ---------------------------------------------------------------------------------------- */
/* Lac d'Incarnam : gelées bleues translucides (Plikplok, Petit Gloot, Grand Splatch)         */
/* ---------------------------------------------------------------------------------------- */

const JELLY = '#3fb0d8';
const JELLY_INK = '#1a5a7a';

/** Corps de gelée : dégradé bleu, transparence, gros reflet et petit reflet rose pâle. */
function jellyBody(d: string, hl: [number, number, number, number]): string {
  const g = uid('jg');
  const [hx, hy, hrx, hry] = hl;
  return `<radialGradient id="${g}" cx="0.38" cy="0.3" r="0.85"><stop offset="0" stop-color="#bff0ff"/><stop offset="0.45" stop-color="${JELLY}"/><stop offset="1" stop-color="#1f7aa8"/></radialGradient>` +
    `<path d="${d}" fill="url(#${g})" fill-opacity="0.92" stroke="${JELLY_INK}" stroke-width="${LW}" stroke-linejoin="round"/>` +
    `<ellipse cx="${hx}" cy="${hy}" rx="${hrx}" ry="${hry}" fill="#ffffff" opacity="0.55" transform="rotate(-20 ${hx} ${hy})"/>` +
    `<ellipse cx="${hx + hrx * 0.4}" cy="${hy - hry * 0.4}" rx="${hrx * 0.35}" ry="${hry * 0.35}" fill="#ffe4f0" opacity="0.8"/>`;
}
/** Flaque et gouttelettes autour de la gelée. */
const puddle = (rx: number, drops: [number, number, number][]) =>
  `<ellipse cx="70" cy="144" rx="${rx}" ry="${rx * 0.2}" fill="${JELLY}" opacity="0.35" stroke="${JELLY_INK}" stroke-width="1" stroke-opacity="0.4"/>` +
  drops.map(([x, y, r]) => blob(ellipse(x, y, r, r * 0.7), JELLY, { ink: JELLY_INK, w: 1.2, rim: false })).join('');
const jellyEye = (cx: number, cy: number, r: number, look = -0.3) =>
  `<circle cx="${cx}" cy="${cy}" r="${r + 2.5}" fill="${JELLY_INK}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fdfdf8"/>` +
  `<circle cx="${cx + look * r}" cy="${cy + r * 0.1}" r="${r * 0.42}" fill="#101418"/><circle cx="${cx + look * r - r * 0.18}" cy="${cy - r * 0.12}" r="${r * 0.14}" fill="#fff"/>`;

function jellySvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  if (kind === 'plikplok') {
    // dôme mou qui éclabousse : grands yeux, bouche ouverte aux dents de lapin
    push(P, 'back', puddle(56, [[16, 140, 6], [124, 136, 7], [112, 148, 5], [26, 150, 4]]));
    push(P, 'body', jellyBody('M28,142 C22,104 44,74 72,74 C102,74 122,102 116,142 Q72,152 28,142 Z', [52, 92, 13, 8]));
    push(P, 'face', jellyEye(54, 106, 10), jellyEye(80, 104, 9),
      `<path d="M50,122 Q66,140 84,122 Q66,128 50,122 Z" fill="#8a1e2a" stroke="${JELLY_INK}" stroke-width="1.4"/>`,
      `<path d="M60,123.5 h6 v6 h-6 Z M67,124 h6 v5.5 h-6 Z" fill="#fff" stroke="${JELLY_INK}" stroke-width="0.8"/>`);
  } else if (kind === 'gloot') {
    // boule de gel penchée, deux yeux énormes cerclés
    push(P, 'back', puddle(50, [[22, 146, 4]]));
    push(P, 'body', jellyBody('M26,134 C18,104 40,80 74,80 C106,80 124,100 118,128 C114,146 92,148 70,148 C44,148 30,146 26,134 Z', [48, 96, 14, 8]));
    push(P, 'face', jellyEye(56, 112, 15, -0.2), jellyEye(92, 104, 11.5, -0.2));
  } else {
    // grande goutte dressée, l'air grognon
    push(P, 'back', puddle(54, [[18, 144, 7], [120, 140, 8], [108, 152, 5], [34, 152, 4], [52, 118, 3]]));
    push(P, 'body', jellyBody('M36,144 C32,112 30,74 46,52 C58,36 88,36 100,52 C114,74 112,112 108,144 Q72,152 36,144 Z', [56, 58, 9, 13]));
    push(P, 'face',
      `<path d="M50,86 q7,-6 14,0 M76,84 q7,-6 14,0" fill="none" stroke="${JELLY_INK}" stroke-width="2.6" stroke-linecap="round"/>`,
      `<path d="M48,78 L62,82 M92,76 L78,80" stroke="${JELLY_INK}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<path d="M60,104 Q70,98 80,104" fill="none" stroke="${JELLY_INK}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<ellipse cx="48" cy="94" rx="6" ry="3" fill="#8fd8f8" opacity="0.8"/><ellipse cx="92" cy="92" rx="6" ry="3" fill="#8fd8f8" opacity="0.8"/>`);
  }
  return assemble(kind, P, part);
}

/* ---------------------------------------------------------------------------------------- */
/* Route des âmes : Feux (flammes lumineuses à cœur blanc et petits yeux)                     */
/* ---------------------------------------------------------------------------------------- */

const FLAME_COL: Record<string, string> = { feuVif: '#3fe0a0', feuJoie: '#b8f05a', feuFurieux: '#38c8d0', feuFollet: '#a8eef8' };

function flameSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const col = FLAME_COL[kind];
  const ink = shade(col, -0.45);
  const g = uid('fg');
  // forme : goutte à pointe recourbée (Vif, Joie), flamme à trois langues (Furieux), goutte à pointe détachée (Follet)
  const d = kind === 'feuFurieux'
    ? 'M44,118 C40,96 46,78 54,70 C54,84 60,88 62,82 C62,62 72,48 80,34 C84,56 92,64 96,70 C98,64 100,60 104,56 C108,80 106,100 100,118 C94,136 80,142 72,142 C56,142 46,132 44,118 Z'
    : 'M42,116 C42,96 56,82 66,68 C74,58 74,48 70,40 C88,50 92,64 90,78 C100,90 104,104 100,118 C96,136 82,144 70,144 C54,144 42,132 42,116 Z';
  push(P, 'back', halo(uid('h'), 72, 112, 58, col), `<ellipse cx="72" cy="156" rx="22" ry="5" fill="#2a2a20" opacity="0.25"/>`);
  push(P, 'body',
    `<radialGradient id="${g}" cx="0.45" cy="0.7" r="0.8"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="${shade(col, 0.55)}"/><stop offset="1" stop-color="${col}"/></radialGradient>`,
    `<path d="${d}" fill="url(#${g})" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round"/>`,
    `<ellipse cx="70" cy="118" rx="20" ry="17" fill="#ffffff" opacity="0.85"/>`,
    `<path d="M54,112 Q70,100 86,112" fill="none" stroke="${shade(col, 0.4)}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>`,
    kind === 'feuFollet' ? `<path d="M74,28 Q84,16 78,4 Q90,14 84,30 Q80,36 74,28 Z" fill="${col}" stroke="${ink}" stroke-width="1.2"/>` : '');
  const eye = (cx: number, r: number) => `<ellipse cx="${cx}" cy="126" rx="${r}" ry="${r * 1.1}" fill="#fff" stroke="#1d3a40" stroke-width="1.6"/><circle cx="${cx - r * 0.3}" cy="127" r="${r * 0.45}" fill="#101418"/>`;
  push(P, 'face', eye(62, 6.5), eye(80, 5.5),
    kind === 'feuFurieux' ? `<path d="M54,116 L68,121 M88,114 L76,120" stroke="#1d3a40" stroke-width="2.6" stroke-linecap="round"/>` : '');
  return assemble(kind, P, part);
}

/* ---------------------------------------------------------------------------------------- */
/* Mine d'Incarnam : Aminite (champignon au grand chapeau vert tacheté)                        */
/* ---------------------------------------------------------------------------------------- */

function aminiteSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const WHITE = '#eef8f8', CAP = '#4fd884';
  push(P, 'legB', blob(ellipse(80, 144, 9, 5), WHITE, { ink: '#5a7a7a' }));
  push(P, 'legF', blob(ellipse(60, 146, 10, 5.5), WHITE, { ink: '#5a7a7a' }));
  push(P, 'body', halo(uid('h'), 70, 110, 52, '#e8fff0'),
    blob('M48,118 C46,96 56,84 70,84 C86,84 96,98 94,118 C92,136 82,144 70,144 C56,144 50,134 48,118 Z', WHITE, { ink: '#5a7a7a' }),
    blob(ellipse(84, 124, 5, 4), '#7fd8a8', { rim: false, w: 1 }), blob(ellipse(58, 132, 4, 3), '#7fd8a8', { rim: false, w: 1 }), blob(ellipse(88, 106, 3, 2.5), '#7fd8a8', { rim: false, w: 1 }),
    eyeChibi(60, 100, 5.5, 6.5, '#2fae6a', { look: [-0.3, 0.2] }), eyeChibi(76, 100, 5, 6, '#2fae6a', { look: [-0.3, 0.2] }));
  const cap = 'M12,78 C14,50 40,22 70,20 C100,22 126,50 128,78 C112,88 92,90 70,90 C48,90 28,88 12,78 Z';
  push(P, 'head',
    blob(cap, CAP, { ink: '#1f6a3a', hl: [0.4, 0.15] }),
    `<path d="M70,22 L70,88 M48,26 Q40,56 34,86 M92,26 Q100,56 106,86 M28,42 Q22,62 20,82 M112,42 Q118,62 120,82" fill="none" stroke="#bff8d0" stroke-width="1.6" opacity="0.7"/>`,
    `<path d="M14,78 Q40,92 70,92 Q100,92 126,78 L124,84 Q100,98 70,98 Q40,98 16,84 Z" fill="#2fb868" stroke="#1f6a3a" stroke-width="1.6"/>`,
    ...[[44, 44, 9, 6], [96, 50, 8, 6], [70, 34, 6, 4], [30, 64, 6, 5], [108, 70, 6, 4]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#2f9a6a" opacity="0.8"/>`),
    `<ellipse cx="60" cy="30" rx="16" ry="6" fill="#ffffff" opacity="0.55"/>`);
  return assemble('aminite', P, part);
}

/* ======================================================================================== */
/* Astrub, branche A : Pious, Souterrains, Champs d'Astrub, Larves, Grange du Tournesol Affamé */
/* ======================================================================================== */

/** Pious : petit oiseau rond, bec orange ; la queue change selon la couleur (comme dans Dofus). */
const PIOU: Record<string, { c: string; tail: 'peacock' | 'flame' | 'leaf' | 'club'; flower?: boolean }> = {
  piouViolet: { c: '#c03aa0', tail: 'peacock' }, piouRouge: { c: '#d8342c', tail: 'flame' }, piouVert: { c: '#6ab82c', tail: 'leaf' },
  piouBleu: { c: '#3a5ab0', tail: 'club' }, piouRose: { c: '#e88ad0', tail: 'leaf', flower: true }, piouJaune: { c: '#f0d23a', tail: 'leaf' },
};

function piouSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const { c, tail, flower } = PIOU[kind];
  const ink = shade(c, -0.55);
  // queue
  if (tail === 'leaf') {
    push(P, 'tail', blob('M92,116 C104,84 112,48 124,16 C134,40 130,78 104,118 Z', shade(c, -0.05), { ink }),
      `<path d="M94,114 C108,82 116,50 124,20" fill="none" stroke="${shade(c, 0.4)}" stroke-width="2"/>`,
      `<path d="M106,84 l12,-4 M110,68 l12,-6 M114,52 l10,-6 M102,100 l12,-2" stroke="${ink}" stroke-width="1.2" opacity="0.6"/>`);
  } else if (tail === 'club') {
    push(P, 'tail', tube('M94,114 Q104,70 112,34', 9, shade(c, -0.1), ink), blob(ellipse(114, 26, 12, 16), c, { ink }), `<ellipse cx="114" cy="24" rx="5" ry="7" fill="#9ab0e8" opacity="0.7"/>`);
  } else if (tail === 'flame') {
    push(P, 'tail', blob('M92,118 C96,80 92,50 100,14 C108,40 112,52 116,30 C122,60 124,84 106,120 Z', c, { ink }),
      blob('M98,112 C100,86 100,64 106,44 C110,64 112,84 104,114 Z', '#ff8a5a', { ink, w: 1, rim: false }));
  } else {
    for (const [x2, y2] of [[100, 24], [114, 30], [126, 44], [132, 62], [88, 30]] as [number, number][]) {
      push(P, 'tail', `<path d="M94,112 Q${(94 + x2) / 2 + 6},${(112 + y2) / 2} ${x2},${y2}" fill="none" stroke="#4a5a8a" stroke-width="2"/>`,
        blob(ellipse(x2, y2, 7, 10), shade(c, -0.25), { ink }), `<ellipse cx="${x2}" cy="${y2}" rx="3.5" ry="5" fill="#d8b0f0"/><circle cx="${x2}" cy="${y2}" r="1.8" fill="#3a1a4a"/>`);
    }
  }
  // pattes orange fines, doigts
  const leg = (x: number) => tube(`M${x},128 L${x - 1},144`, 3.6, '#f0a030') + `<path d="M${x - 8},147 L${x - 1},144 L${x + 5},148 M${x - 1},144 L${x - 2},149" stroke="#a86010" stroke-width="2.6" stroke-linecap="round"/>`;
  push(P, 'legB', leg(80));
  push(P, 'legF', leg(62));
  // corps rond, ventre plus clair, aile
  push(P, 'body', blob(ellipse(74, 112, 27, 23), c, { ink }), blob(ellipse(64, 118, 14, 11), shade(c, 0.4), { ink, w: 1, rim: false }),
    blob('M80,104 Q100,104 102,118 Q92,124 80,118 Z', shade(c, -0.15), { ink, w: 1.4 }));
  // tête : ronde, joue, bec, œil rieur
  push(P, 'head', blob(ellipse(60, 88, 21, 19), c, { ink }),
    `<ellipse cx="54" cy="96" rx="6" ry="4" fill="${shade(c, 0.45)}" opacity="0.9"/>`,
    blob('M42,88 L28,93 L42,98 Z', '#f0a030', { ink: '#8a5010', w: 1.4, rim: false }),
    `<path d="M48,82 q4,-4 8,0" fill="none" stroke="#1d1a20" stroke-width="2.4" stroke-linecap="round"/>`,
    eyeChibi(66, 82, 5, 6, '#1d1a20', { look: [-0.3, 0] }));
  push(P, 'horn', ...[[-10, 0], [-3, -4], [4, -1]].map(([dx, dy]) => blob(`M${56 + dx},72 L${58 + dx},${58 + dy} L${62 + dx},70 Z`, c, { ink, w: 1.4, rim: false })),
    flower ? blob(circle(72, 66, 6), '#e83a4a', { ink: '#7a1020', w: 1.2 }) + `<circle cx="72" cy="66" r="2.4" fill="#ffd84a"/>` : '');
  return assemble(kind, P, part);
}

/** Tofu Malade : tofu beige ébouriffé, rapiécé, l'air hagard. */
function tofuMaladeSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const C = '#d8c49a';
  push(P, 'wingB', blob(ellipse(108, 92, 12, 9), C));
  push(P, 'legB', tube('M80,126 Q83,138 84,146', 3.4, '#8a6a3a'), blob(ellipse(88, 148, 11, 6), '#9a5a2a'));
  push(P, 'legF', tube('M62,126 Q60,138 58,146', 3.4, '#8a6a3a'), blob(ellipse(54, 148, 12, 6.5), '#9a5a2a'));
  push(P, 'body', blob(circle(74, 98, 36), C, { hl: [0.3, 0.22] }),
    blob(circle(100, 112, 9), '#b89a6a', { w: 1.2, rim: false }), blob(circle(46, 74, 7), '#b89a6a', { w: 1.2, rim: false }),
    `<path d="M95,105 l10,14 M103,106 l-6,13" stroke="#7a5a2a" stroke-width="1.2"/>`,
    eyeChibi(66, 94, 10, 12, '#4a3a20', { lid: -1, skin: C }), eyeChibi(46, 96, 11.5, 13.5, '#4a3a20', { lid: -1, skin: C }),
    `<path d="M48,116 Q56,112 64,117" fill="none" stroke="#5a3a1a" stroke-width="2" stroke-linecap="round"/>`);
  push(P, 'crest', `<path d="M58,64 L50,34 M64,62 L64,28 M70,62 L78,30 M76,64 L92,40 M54,66 L36,48 M66,62 L58,22" stroke="#c8a85a" stroke-width="2.4" stroke-linecap="round"/><path d="M60,62 L56,40 M72,62 L84,36" stroke="#8a6a2a" stroke-width="1.6"/>`);
  push(P, 'wingF', blob(ellipse(84, 114, 11, 8), shade(C, -0.08)));
  return assemble('tofuMalade', P, part);
}

/** Araknes des Souterrains : corps poilu anguleux, pattes épaisses ; Arakmuté : boule sombre couverte d'yeux. */
function spiderSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const muted = kind === 'arakmute';
  const C = kind === 'arakneMalade' ? '#7a9a8a' : kind === 'araknose' ? '#5aa030' : kind === 'arakneEgouts' ? '#4a4a60' : '#3e3e22';
  const ink = shade(C, -0.6);
  const LEG = muted ? '#1e1e16' : '#8a7a8a';
  const leg = (d: string) => (muted ? tube(d, 3, LEG, '#000') : tube(d, 7, LEG));
  push(P, 'legB', leg(muted ? 'M92,112 Q120,96 126,150' : 'M90,116 Q116,104 120,140'), leg(muted ? 'M84,118 Q104,124 108,154' : 'M84,122 Q100,128 100,148'));
  push(P, 'legF', leg(muted ? 'M50,112 Q20,96 14,150' : 'M52,116 Q26,104 22,140'), leg(muted ? 'M58,118 Q38,124 34,154' : 'M58,122 Q42,128 40,148'));
  const body = muted
    ? 'M30,90 L40,66 L56,58 L72,50 L92,58 L106,70 L112,90 L106,110 L90,122 L54,122 L38,112 Z'
    : 'M26,104 L34,74 L52,70 L60,50 L74,66 L90,56 L96,74 L112,80 L114,106 L100,124 L44,126 Z';
  push(P, 'body', blob(body, C, { ink }),
    ...[[40, 86], [58, 66], [88, 70], [104, 96], [90, 116]].map(([x, y]) => `<path d="M${x},${y} l${x < 70 ? -6 : 6},-6" stroke="${shade(C, 0.35)}" stroke-width="2" stroke-linecap="round"/>`));
  if (kind === 'arakneEgouts') push(P, 'head', eyeChibi(52, 98, 9, 8, '#e8c81a', { lid: 1, skin: C, look: [-0.2, 0.1] }), eyeChibi(78, 96, 8.5, 7.5, '#e8c81a', { lid: 1, skin: C, look: [-0.2, 0.1] }),
    `<path d="M58,112 L60,122 L64,113 Z M70,112 L72,122 L76,113 Z" fill="#fffaf0" stroke="${ink}" stroke-width="1.2"/>`, `<path d="M64,98 l2,6 l3,-5" fill="#c81a1a"/>`);
  else if (kind === 'arakneMalade') push(P, 'head', eyeChibi(52, 98, 9, 8, '#8a1a1a', { lid: 1, skin: C, ring: '#c84a3a' }), eyeChibi(76, 96, 8, 7, '#8a1a1a', { lid: 1, skin: C, ring: '#c84a3a' }),
    `<path d="M54,114 L58,120 L62,114 L66,120 L70,114" fill="#fff" stroke="${ink}" stroke-width="1.2"/>`, `<circle cx="88" cy="82" r="3" fill="#b84a3a" opacity="0.7"/><circle cx="96" cy="88" r="2" fill="#b84a3a" opacity="0.7"/>`);
  else if (kind === 'araknose') push(P, 'head',
    `<ellipse cx="52" cy="94" rx="12" ry="15" fill="#fdfdf8" stroke="#a82a1a" stroke-width="3"/><ellipse cx="80" cy="92" rx="11" ry="14" fill="#fdfdf8" stroke="#a82a1a" stroke-width="3"/>`,
    `<ellipse cx="50" cy="95" rx="2.6" ry="9" fill="#101418"/><ellipse cx="78" cy="93" rx="2.4" ry="8" fill="#101418"/>`,
    `<path d="M56,116 L60,128 L64,116 Z M70,116 L74,128 L78,116 Z" fill="#fffaf0" stroke="${ink}" stroke-width="1.2"/>`);
  else push(P, 'head', ...[[46, 82, 9], [74, 76, 7], [96, 90, 10], [60, 104, 6], [84, 110, 5], [40, 106, 5]].map(([x, y, r]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#f4ecd0" stroke="#101010" stroke-width="1.6"/><circle cx="${x - r * 0.3}" cy="${y + r * 0.1}" r="${r * 0.45}" fill="#101418"/>`));
  return assemble(kind, P, part);
}

/** Plantes des Champs d'Astrub et de la Grange (deux pieds-racines, tige, feuilles-bras, tête). */
function astrubPlantSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const G = '#3a9a3a';
  const legs = (col = G) => {
    push(P, 'legB', rootLeg(74, 128, 80, 144, 12, col));
    push(P, 'legF', rootLeg(66, 128, 60, 146, -12, col));
  };
  if (kind === 'tournesolSauvage' || kind === 'tournesolAffame') {
    const boss = kind === 'tournesolAffame';
    legs(boss ? '#2a8a3a' : G);
    push(P, 'stem', tube('M70,132 Q66,116 70,100', boss ? 12 : 8, boss ? '#2a8a3a' : G));
    push(P, 'leafB', blob('M76,112 Q100,98 112,112 Q96,122 76,114 Z', '#5ab84a'));
    push(P, 'leafF', boss
      ? blob('M62,112 Q34,96 22,128 L30,124 L26,140 L36,130 L38,144 Q50,120 62,116 Z', '#4aa83a', { ink: '#1a4a1a' })
      : blob('M64,114 Q40,100 28,114 Q44,124 64,116 Z', '#5ab84a'));
    // pétales larges en deux couronnes, comme les tournesols de Dofus
    const petals = [0, 1].map((ring) => [...Array(13)].map((_, i) => {
      const a = ((i + ring * 0.5) / 13) * 360, r = ring ? 30 : 34;
      return `<ellipse cx="68" cy="${80 - r}" rx="${ring ? 9 : 10}" ry="${ring ? 17 : 19}" transform="rotate(${a.toFixed(0)} 68 80)" fill="${ring ? '#f8d23a' : '#f0b81c'}" stroke="#a87010" stroke-width="1.6"/>`;
    }).join('')).join('');
    push(P, 'head', petals, blob(circle(68, 80, 22), boss ? '#a8301c' : '#7a4a1a', { ink: '#3a1a08' }));
    if (boss) push(P, 'head',
      `<path d="M50,58 L56,40 L62,56 L70,34 L78,56 L86,40 L90,58 Z" fill="#e83a1a" stroke="#5a1008" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="M50,74 L60,70 M78,70 L88,74" stroke="#f8e8a0" stroke-width="3" stroke-linecap="round"/>`,
      eyeChibi(60, 76, 5, 5.5, '#101010', { lid: 1, skin: '#a8301c' }), eyeChibi(78, 76, 5, 5.5, '#101010', { lid: 1, skin: '#a8301c' }),
      `<path d="M50,86 Q68,108 88,86 Q68,94 50,86 Z" fill="#2a0a08" stroke="#3a1a08" stroke-width="1.4"/><path d="M53,87 l3,5 l3,-4 l3,5 l3,-4 l3,5 l3,-4 l3,5 l3,-4 l3,5 l3,-5" fill="#fffaf0" stroke="#3a1a08" stroke-width="0.8"/>`);
    else push(P, 'head', eyeChibi(60, 74, 6, 7, '#101010'), eyeChibi(76, 72, 5.5, 6.5, '#101010'),
      `<path d="M54,84 Q66,100 82,84 Q66,90 54,84 Z" fill="#5a1a10" stroke="#3a1a08" stroke-width="1.4"/><path d="M60,86 Q68,90 76,86" fill="#e85a4a"/>`);
  } else if (kind === 'roseDemo') {
    legs();
    push(P, 'stem', tube('M70,132 Q64,116 70,100', 7, G));
    push(P, 'leafB', blob('M76,110 Q98,96 108,106 L114,98 L112,112 Q96,120 76,114 Z', '#4aa83a'), `<path d="M108,104 l8,-6 M100,100 l6,-8" stroke="#e8e0c0" stroke-width="2.4"/>`);
    push(P, 'leafF', blob('M64,112 Q40,98 30,110 L22,104 L26,118 Q44,124 64,116 Z', '#4aa83a'), `<path d="M30,110 l-10,-4 M38,104 l-6,-8" stroke="#e8e0c0" stroke-width="2.4"/>`);
    push(P, 'head', blob('M42,84 C40,58 56,46 72,48 C92,50 102,64 98,84 C92,100 80,104 70,104 C56,104 44,98 42,84 Z', '#d8401c', { ink: '#5a1008' }),
      `<path d="M52,64 Q70,52 88,64 Q78,60 70,66 Q62,58 56,70 M58,80 Q70,70 84,78 M48,86 Q60,94 72,88" fill="none" stroke="#7a1408" stroke-width="2" stroke-linecap="round"/>`,
      blob('M60,40 Q70,30 84,40 Q76,46 70,44 Q66,48 60,40 Z', '#f0782c', { ink: '#5a1008', w: 1.2 }),
      eyeChibi(60, 84, 7, 8.5, '#101010'), eyeChibi(80, 82, 6.5, 8, '#101010'));
  } else if (kind === 'pissenlitDiabo') {
    legs();
    push(P, 'stem', tube('M70,132 Q66,122 70,112', 7, G));
    push(P, 'leafB', blob('M76,118 Q94,110 102,120 Q90,126 76,122 Z', '#5ab84a'));
    push(P, 'leafF', blob('M64,118 Q46,110 38,120 Q50,126 64,122 Z', '#5ab84a'));
    push(P, 'head', blob(circle(70, 70, 40), '#f4ecd0', { ink: '#8a7a50', hl: [0.35, 0.3] }),
      ...[...Array(26)].map((_, i) => {
        const a = i * 2.4, r = 10 + (i % 5) * 6;
        return `<path d="M${f(70 + Math.cos(a) * r)},${f(70 + Math.sin(a) * r)} l${f(Math.cos(a + 1) * 6)},${f(Math.sin(a + 1) * 6)}" stroke="#a89a6a" stroke-width="1.4" stroke-linecap="round"/>`;
      }),
      `<ellipse cx="58" cy="78" rx="9" ry="11" fill="#fff" stroke="#101010" stroke-width="2.4"/><ellipse cx="82" cy="76" rx="8" ry="10" fill="#fff" stroke="#101010" stroke-width="2.4"/>`,
      `<circle cx="56" cy="80" r="3" fill="#101010"/><circle cx="80" cy="78" r="2.8" fill="#101010"/>`);
  } else if (kind === 'epouvanteur') {
    push(P, 'legF', tube('M70,150 L70,104', 6, '#7a5a30', '#3a2410'));
    push(P, 'legB', '');
    push(P, 'stem', blob('M52,100 Q70,94 88,100 L92,130 L84,124 L80,134 L72,126 L64,134 L58,124 L50,130 Z', '#d8c8a0', { ink: '#6a5a3a' }),
      `<circle cx="72" cy="112" r="8" fill="none" stroke="#c8301c" stroke-width="2"/><circle cx="72" cy="112" r="3" fill="#c8301c"/><path d="M60,104 h4 M80,120 h5" stroke="#6a5a3a" stroke-width="1.4"/>`);
    push(P, 'leafB', tube('M70,98 L108,92', 5, '#7a5a30', '#3a2410'), `<path d="M108,92 l6,-4 M108,92 l7,2 M108,92 l4,6" stroke="#c8a85a" stroke-width="2" stroke-linecap="round"/>`);
    push(P, 'leafF', tube('M70,98 L34,92', 5, '#7a5a30', '#3a2410'),
      blob('M34,92 L22,52 Q20,44 28,46 L34,58 L38,90 Z', '#6a6a72', { ink: '#2a2a30' }), blob('M28,94 L42,90 L42,96 L28,100 Z', '#8a5a2a', { ink: '#3a2410', w: 1.2, rim: false }));
    push(P, 'head', blob('M50,70 C48,52 60,44 70,44 C82,44 92,52 90,70 C88,84 80,90 70,90 C60,90 52,84 50,70 Z', '#e0d0a8', { ink: '#6a5a3a' }),
      `<circle cx="61" cy="66" r="7" fill="none" stroke="#c8301c" stroke-width="2"/><circle cx="61" cy="66" r="2.6" fill="#c8301c"/><circle cx="79" cy="66" r="7" fill="none" stroke="#c8301c" stroke-width="2"/><circle cx="79" cy="66" r="2.6" fill="#c8301c"/>`,
      `<path d="M62,80 Q70,86 78,80" fill="none" stroke="#c8301c" stroke-width="2" stroke-linecap="round"/>`,
      `<path d="M56,46 L54,24 M62,44 L62,20 M70,44 L72,18 M78,44 L82,22 M84,48 L90,28" stroke="#e8b83a" stroke-width="3.4" stroke-linecap="round"/>`,
      `<path d="M46,48 Q70,40 94,48" fill="none" stroke="#a8781a" stroke-width="4" stroke-linecap="round"/>`);
  } else {
    // Gardienne Champêtre : tige recourbée, bourgeon de feuilles fermé
    push(P, 'legB', blob(ellipse(78, 148, 10, 4), '#2a6a2a', { rim: false }));
    push(P, 'legF', blob(ellipse(62, 148, 10, 4), '#2a6a2a', { rim: false }));
    push(P, 'stem', tube('M70,148 Q78,120 70,96 Q62,76 64,62', 8, '#4aa83a'));
    push(P, 'leafB', blob('M72,108 Q92,100 98,110 Q86,116 74,112 Z', '#6ac84a'));
    push(P, 'leafF', blob('M68,124 Q48,118 42,128 Q54,134 68,128 Z', '#6ac84a'));
    push(P, 'head', blob('M40,50 C40,26 60,14 76,18 C94,22 100,40 92,56 C84,70 64,74 52,68 C44,64 40,58 40,50 Z', '#7ad84a', { ink: '#2a6a1a' }),
      blob('M50,52 C48,34 62,24 74,28 C66,36 64,48 70,62 C60,64 52,60 50,52 Z', '#4aa83a', { ink: '#2a6a1a', w: 1.4 }),
      blob('M76,30 C90,32 94,46 86,58 C80,52 76,42 76,30 Z', '#5ab83a', { ink: '#2a6a1a', w: 1.4 }),
      `<path d="M48,56 Q60,46 76,50" fill="none" stroke="#bff0a0" stroke-width="2" opacity="0.7"/>`);
  }
  return assemble(kind, P, part);
}

/** Larves des Prairies : chenilles brillantes en anneaux ; piquants (Bleue), cornes et taches (Verte), antennes lumineuses (Orange, Jaune). */
const LARVE: Record<string, { c: string; deco: 'spikes' | 'horns' | 'glow' | 'spiral' }> = {
  larveBleue: { c: '#2a8ad8', deco: 'spikes' }, larveVerte: { c: '#4ab83a', deco: 'horns' }, larveOrange: { c: '#f0901c', deco: 'glow' }, larveJaune: { c: '#f8c81c', deco: 'spiral' },
};

function larveSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const { c, deco } = LARVE[kind];
  const ink = shade(c, -0.55);
  const segs: [number, number, number][] = [[112, 124, 16], [94, 118, 20], [74, 114, 23]];
  push(P, 'back', `<ellipse cx="78" cy="146" rx="52" ry="8" fill="#2a2a20" opacity="0.2"/>`,
    ...segs.map(([x, y, r]) => blob(ellipse(x, y, r, r * 0.95), c, { ink, hl: [0.4, 0.25] })),
    ...segs.map(([x, y, r]) => blob(ellipse(x + 2, y + r * 0.85, r * 0.45, r * 0.25), shade(c, -0.3), { ink, w: 1.2, rim: false })));
  if (deco === 'spikes') push(P, 'back', ...segs.map(([x, y, r]) => blob(`M${x - 5},${y - r + 3} L${x + 2},${y - r - 14} L${x + 6},${y - r + 4} Z`, shade(c, -0.3), { ink, w: 1.4 })));
  if (deco === 'horns') push(P, 'back', ...segs.map(([x, y, r]) => blob(circle(x + 4, y - r * 0.2, r * 0.22), '#c8301c', { ink: '#5a1008', w: 1.2, rim: false })));
  if (deco === 'spiral') push(P, 'back', ...segs.slice(0, 2).map(([x, y, r]) => `<path d="M${x},${y} m-${r * 0.4},0 a${r * 0.4},${r * 0.4} 0 1,1 ${r * 0.8},0 a${r * 0.25},${r * 0.25} 0 1,1 -${r * 0.5},0" fill="none" stroke="#c84a1a" stroke-width="2.6"/>`));
  push(P, 'body', blob(ellipse(48, 112, 26, 25), c, { ink, hl: [0.35, 0.25] }));
  if (deco === 'glow' || deco === 'spiral') push(P, 'body', ...[[44, 88, -0.3], [62, 86, 0.3]].map(([x, y, a]) =>
    tube(`M${x},${y + 4} Q${x + a * 20},${y - 14} ${x + a * 14},${y - 26}`, 3, shade(c, -0.2), ink) + halo(uid('h'), x + a * 14, y - 30, 12, '#fff6a0') + blob(ellipse(x + a * 14, y - 30, 6, 7), '#fff6b0', { ink: '#c8a830', w: 1.2, rim: false })));
  if (deco === 'horns') push(P, 'body', blob('M54,90 L60,70 L64,92 Z', '#e8781c', { ink: '#6a3008', w: 1.4 }));
  if (deco === 'spikes') push(P, 'body', blob('M50,90 L58,66 L64,92 Z', shade(c, -0.3), { ink, w: 1.4 }));
  push(P, 'face', blob(ellipse(30, 118, 9, 9), '#f8c81c', { ink: '#8a6010', w: 1.4, rim: false }),
    `<circle cx="38" cy="108" r="9" fill="#fdfdf8" stroke="${ink}" stroke-width="1.8"/><circle cx="35" cy="109" r="4.2" fill="#101418"/><circle cx="33.5" cy="107" r="1.4" fill="#fff"/>`);
  return assemble(kind, P, part);
}

/* ---------------------------------------------------------------------------------------- */
/* Astrub, branches B et C : Bouftous, Forêt d'Astrub, Doa de la Carrière, Égouts, Pichons      */
/* ---------------------------------------------------------------------------------------- */

/** Bouftous d'Astrub (Tainéla et Donjon des Bouftous) : toison sans halo, l'air bougon, cornes enroulées. */
interface BouftouStyle { fleece: string; face: string; hoof: string; iris: string; horn: 'curl' | 'up' | 'stone'; hornCol: string; small?: boolean; stripes?: boolean; crown?: boolean; tuft?: boolean }
const BOUFTOU: Record<string, BouftouStyle> = {
  bouftou: { fleece: '#f4ecc8', face: '#d8ccb0', hoof: '#3a5a7a', iris: '#4a3a1a', horn: 'curl', hornCol: '#5a7a9a' },
  bouftonBlanc: { fleece: '#fdfdf8', face: '#ece6d8', hoof: '#3a5a7a', iris: '#2a3a5a', horn: 'curl', hornCol: '#7a9aba', small: true },
  bouftonNoir: { fleece: '#6e4a2c', face: '#2e221a', hoof: '#2a3a5a', iris: '#c8a030', horn: 'curl', hornCol: '#e8dcb0', small: true },
  bouftouNoir: { fleece: '#3e4e60', face: '#4a1e22', hoof: '#2a4a6a', iris: '#d8c040', horn: 'up', hornCol: '#5a8ab0' },
  chefBouftou: { fleece: '#f2e8c4', face: '#d4c8a8', hoof: '#3a5a7a', iris: '#4a3a1a', horn: 'stone', hornCol: '#8a96a0', tuft: true },
  bouftouRoyal: { fleece: '#f6eecc', face: '#d8ccb0', hoof: '#3a5a7a', iris: '#4a2a1a', horn: 'stone', hornCol: '#7a8894', stripes: true, crown: true, tuft: true },
};

function bouftouSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const S = BOUFTOU[kind];
  const P: Parts = {};
  const leg = (x: number, y0: number) => tube(`M${x},${y0} L${x - 1},${y0 + 7}`, 8, shade(S.fleece, -0.2)) + blob(ellipse(x - 1, y0 + 10, 6, 3.8), S.hoof, { w: 1.4, rim: false });
  push(P, 'tail', blob(circle(118, 100, 9), S.fleece));
  push(P, 'legB', leg(96, 136), leg(112, 134));
  push(P, 'legF', leg(58, 138), leg(74, 140));
  const balls: [number, number, number][] = [[80, 98, 32], [102, 92, 22], [60, 92, 22], [84, 74, 22], [106, 110, 20], [62, 114, 20], [86, 118, 22], [70, 76, 16]];
  push(P, 'body', fleece(balls, S.fleece));
  // toison hirsute (Chef de Guerre, Bouftou Royal) : mèches pointues en bas
  if (S.tuft) push(P, 'body', ...[[58, 130, -0.5], [76, 138, 0], [96, 136, 0.3], [116, 122, 0.8]].map(([x, y, a]) =>
    blob(`M${x - 7},${y - 6} L${f(x + Math.sin(a) * 14)},${f(y + 10)} L${x + 7},${y - 4} Z`, S.fleece, { w: 1.4, rim: false })));
  // tête : visage, frange de toison, oreille, œil bougon, museau
  push(P, 'head',
    blob(ellipse(46, 108, 20, 19), S.face),
    fleece([[48, 88, 14], [62, 92, 12], [40, 96, 9]], S.fleece),
    blob('M62,102 Q74,96 76,106 Q68,112 62,108 Z', shade(S.face, -0.1)),
    eyeChibi(42, 108, 9.5, 11.5, S.iris, { look: [-0.4, 0.15], lid: 1, skin: S.face }),
    `<ellipse cx="29" cy="118" rx="4.5" ry="3" fill="${shade(S.face, -0.55)}"/>`,
    `<path d="M32,125 Q38,122 44,126" fill="none" stroke="${shade(S.face, -0.6)}" stroke-width="2" stroke-linecap="round"/>`,
  );
  const leaves: [number, number, number, string][] = [[44, 76, -0.4, '#8ac83a'], [52, 72, 0, '#6aa82a'], [58, 76, 0.4, '#a8d84a']];
  const top: string[] = [];
  if (S.tuft) top.push(...leaves.map(([x, y, a, c]) =>
    blob(`M${x},${y + 6} Q${f(x + Math.sin(a) * 10 - 4)},${f(y - 10)} ${f(x + Math.sin(a) * 14)},${f(y - 18)} Q${f(x + Math.sin(a) * 10 + 5)},${f(y - 8)} ${x + 3},${y + 6} Z`, c, { ink: '#2a4a10', w: 1.4 })));
  if (S.crown) top.push(
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * Math.PI * 2; return blob(ellipse(+f(54 + Math.cos(a) * 11), +f(74 + Math.sin(a) * 8), 6, 4.5), i % 2 ? '#e8501a' : '#f0a020', { w: 1.2, rim: false }); }),
    blob(ellipse(54, 74, 8, 6), '#f8d84a', { ink: '#8a5a10', w: 1.4 }), blob('M40,80 Q32,70 38,62 Q44,70 42,80 Z', '#5aa82a', { ink: '#2a4a10', w: 1.2 }));
  if (S.horn === 'up') {
    // Bouftou Noir : grandes cornes bleues dressées
    push(P, 'horn', blob('M48,92 C40,72 44,54 56,42 C54,58 58,74 60,92 Z', S.hornCol), blob('M64,92 C66,70 76,56 92,50 C84,64 78,78 74,96 Z', shade(S.hornCol, -0.12)),
      `<path d="M50,84 Q48,66 54,52 M68,86 Q72,70 84,58" fill="none" stroke="#fff" stroke-width="2.4" opacity="0.4" stroke-linecap="round"/>`);
  } else {
    const spiral = 'M56,98 C44,70 70,48 92,60 C114,72 108,104 86,110 C70,114 64,98 72,90 C78,84 88,88 86,96';
    const s = S.horn === 'stone' ? 0.72 : S.small ? 0.36 : 0.44;
    const ink = S.horn === 'stone' ? '#2a2e30' : shade(S.hornCol, -0.6);
    push(P, 'horn', `<g transform="translate(60,96) scale(${s}) translate(-60,-96)">` + tube(spiral, 19, S.hornCol, ink) +
      (S.stripes ? `<path d="M60,74 l10,4 M82,58 l2,10 M104,74 l-9,4 M100,100 l-8,-4" stroke="#e8601a" stroke-width="6" stroke-linecap="round"/>` : '') +
      (S.horn === 'stone' ? `<path d="M58,76 l7,5 M98,64 l-4,7 M94,106 l-4,-6" stroke="#c8d0cc" stroke-width="2.4" stroke-linecap="round"/>` : '') +
      `<path d="M62,70 Q72,56 88,56" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.35"/></g>`);
  }
  // touffe et couronne par-dessus les cornes
  push(P, 'horn', ...top);
  return assemble(kind, P, part);
}

/** Bord hérissé (fourrure, piquants) : étoile irrégulière autour d'une ellipse. */
function spiky(cx: number, cy: number, rx: number, ry: number, n: number, out: number, a0 = 0, a1 = Math.PI * 2): string {
  const pts: string[] = [];
  const full = a1 - a0 >= Math.PI * 2 - 0.01;
  for (let i = 0; i <= n * 2; i++) {
    const a = a0 + ((a1 - a0) * i) / (n * 2), k = i % 2 ? 1 + out : 1;
    pts.push(`${f(cx + Math.cos(a) * rx * k)},${f(cy + Math.sin(a) * ry * k)}`);
  }
  return `M${pts.join(' L')}${full ? ' Z' : ` L${cx},${cy} Z`}`;
}

/** Forêt d'Astrub : Prespic (hérisson aux piquants orange), Sanglier (défenses, crinière), Écurouille (énorme queue). */
function forestBeastSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  if (kind === 'prespic') {
    // petit corps beige, masque brun de raton, énorme crinière de flammes orange rabattue vers l'arrière
    const B = '#d8c8a0', D = '#5a3a24', O = '#f08a1a', ink = '#8a3a08';
    const flame = (x: number, y: number, l: number, a: number, c: string) => {
      const tx = x + Math.cos(a) * l, ty = y + Math.sin(a) * l, nx = -Math.sin(a) * l * 0.28, ny = Math.cos(a) * l * 0.28;
      return blob(`M${f(x - nx)},${f(y - ny)} Q${f(x + (tx - x) * 0.5 - nx * 0.6)},${f(y + (ty - y) * 0.5 - ny * 0.6 - 4)} ${f(tx)},${f(ty)} Q${f(x + (tx - x) * 0.45 + nx * 0.4)},${f(y + (ty - y) * 0.45 + ny * 0.4)} ${f(x + nx)},${f(y + ny)} Z`, c, { ink, w: 1.5 });
    };
    push(P, 'tail', flame(100, 122, 24, -0.2, O), flame(98, 128, 20, 0.35, '#e8701a'));
    const leg = (x: number, y: number) => blob(ellipse(x, y, 9, 11), D) + blob(ellipse(x - 3, y + 9, 9, 4.5), shade(D, -0.2), { w: 1.2, rim: false });
    push(P, 'legB', leg(90, 136));
    push(P, 'legF', leg(62, 138));
    push(P, 'body', blob(ellipse(76, 116, 28, 26), B, { hl: [0.35, 0.25] }), blob(ellipse(66, 124, 13, 15), '#efe4c8', { w: 1.2, rim: false }),
      blob('M52,116 Q40,124 44,136 Q52,138 58,128 Z', D, { w: 1.4 }));
    push(P, 'head', blob(ellipse(50, 100, 24, 20), B),
      blob('M28,98 Q40,90 56,94 Q66,96 70,104 Q58,110 46,106 Q34,108 28,98 Z', D, { w: 1.2, rim: false }),
      eyeChibi(44, 100, 6.5, 7.5, '#3a2010', { lid: 1, skin: D, look: [-0.45, 0.1] }), eyeChibi(60, 101, 5.5, 7, '#3a2010', { lid: 1, skin: D, look: [-0.45, 0.1] }),
      blob(ellipse(27, 104, 5, 4), '#141010', { w: 1, rim: false }),
      `<path d="M32,112 Q38,116 44,112" fill="none" stroke="${D}" stroke-width="1.8" stroke-linecap="round"/>`);
    // crinière : trois rangées de flammes, du front jusqu'au dos
    const rows: [number, number, number, number, string][] = [
      [96, 104, 34, -0.15, '#e8701a'], [92, 92, 36, -0.4, '#e8701a'], [84, 82, 38, -0.7, O], [72, 76, 36, -1.0, O], [60, 76, 32, -1.3, O],
      [86, 96, 28, -0.3, '#ffa83a'], [76, 86, 28, -0.75, '#ffa83a'], [64, 82, 24, -1.1, '#ffb84a'], [50, 82, 22, -1.5, O], [42, 86, 18, -1.9, '#ffa83a']];
    push(P, 'horn', ...rows.map(([x, y, l, a, c]) => flame(x, y, l, a, c)));
  } else if (kind === 'sanglier') {
    const B = '#6a4a32';
    push(P, 'tail', tube('M116,104 Q128,100 124,112 Q120,120 128,122', 3, B));
    const leg = (x: number, y: number) => tube(`M${x},${y} L${x},${y + 10}`, 9, B) + blob(ellipse(x - 1, y + 12, 6, 3.5), '#2a1a10', { w: 1.2, rim: false });
    push(P, 'legB', leg(98, 130), leg(112, 128));
    push(P, 'legF', leg(62, 132), leg(78, 134));
    push(P, 'body', blob(spiky(82, 86, 30, 14, 8, 0.6, Math.PI * 1.05, Math.PI * 1.95), '#3a2a1a', { w: 1.4 }),
      blob('M50,96 Q64,80 90,80 Q118,82 122,104 Q124,126 100,134 L62,136 Q44,128 50,96 Z', B, { hl: [0.4, 0.2] }),
      `<path d="M70,90 l4,10 M88,88 l2,10 M104,92 l-1,10" stroke="${shade(B, 0.35)}" stroke-width="2" stroke-linecap="round"/>`);
    push(P, 'head', blob('M60,94 Q40,88 26,104 Q16,114 20,124 Q30,134 48,130 Q64,126 66,112 Z', shade(B, 0.08)),
      blob(ellipse(20, 118, 9, 9), '#a8786a', { ink: '#4a2a1a' }), `<ellipse cx="17" cy="116" rx="2" ry="3" fill="#3a1a10"/><ellipse cx="23" cy="117" rx="2" ry="3" fill="#3a1a10"/>`,
      eyeChibi(42, 106, 6, 7, '#a81a10', { lid: 1, skin: shade(B, 0.08), look: [-0.4, 0.1] }),
      blob('M56,92 Q66,80 70,92 Q64,96 56,92 Z', shade(B, -0.1)));
    push(P, 'horn', blob('M30,124 Q22,118 24,104 Q30,114 36,120 Z', '#fbf4e0', { ink: '#6a5a40', w: 1.4 }), blob('M40,128 Q34,124 36,112 Q42,120 46,124 Z', '#fbf4e0', { ink: '#6a5a40', w: 1.4 }));
  } else if (kind === 'milimulou') {
    // loup-garou voûté : fourrure brune en mèches, longs bras griffus, crâne d'os pour visage, deux cornes
    const B = '#8a4a24', C = '#e8d8b0', ink = '#3a1a08';
    const tufts = (cx: number, cy: number, rx: number, ry: number, n: number, c: string) => blob(spiky(cx, cy, rx, ry, n, 0.32), c, { ink, hl: [0.35, 0.2] });
    push(P, 'tail', tufts(118, 112, 14, 18, 7, B));
    push(P, 'legB', blob('M96,118 Q112,124 108,140 L100,140 Q98,130 90,128 Z', B, { ink }), blob(ellipse(104, 145, 11, 5), C, { ink, w: 1.4 }),
      `<path d="M95,147 l-3,4 M101,149 l-1,4 M107,148 l1,4" stroke="${ink}" stroke-width="1.8" stroke-linecap="round"/>`);
    push(P, 'body', tufts(84, 98, 34, 30, 11, B), tufts(92, 82, 20, 16, 7, shade(B, 0.12)), blob(ellipse(72, 112, 16, 13), '#c8844a', { ink, w: 1.2, rim: false }));
    push(P, 'legF', blob('M64,92 Q42,100 40,128 L50,130 Q54,110 70,104 Z', B, { ink }), blob(ellipse(44, 136, 10, 7), C, { ink, w: 1.4 }),
      `<path d="M36,138 l-4,6 M42,141 l-1,7 M49,141 l2,6" stroke="${C}" stroke-width="3" stroke-linecap="round"/><path d="M36,138 l-4,6 M42,141 l-1,7 M49,141 l2,6" stroke="${ink}" stroke-width="1" stroke-linecap="round"/>`,
      blob('M78,124 Q72,136 76,146 L86,146 Q88,134 92,126 Z', B, { ink }), blob(ellipse(80, 148, 10, 4.5), C, { ink, w: 1.4 }));
    push(P, 'head', tufts(50, 84, 20, 16, 8, B),
      blob('M50,74 Q34,72 22,82 Q18,92 26,98 Q36,102 50,98 Q60,92 58,80 Z', C, { ink: '#5a4a30' }),
      `<ellipse cx="42" cy="82" rx="5" ry="5.5" fill="#2a1a10"/><circle cx="41" cy="81" r="1.6" fill="#f8d84a"/>`,
      blob(ellipse(20, 86, 4, 3.5), '#2a1a10', { w: 1, rim: false }),
      `<path d="M22,94 L26,100 L29,94 L32,100 L35,94 L38,100 L41,94" fill="#fff" stroke="#5a4a30" stroke-width="1.2"/>`);
    push(P, 'horn', blob('M54,72 Q50,46 58,28 Q62,50 62,72 Z', C, { ink: '#5a4a30', w: 1.4 }), blob('M62,74 Q66,52 80,40 Q74,58 70,76 Z', shade(C, -0.08), { ink: '#5a4a30', w: 1.4 }));
  } else {
    // Écurouille : assise, énorme queue enroulée, grandes oreilles
    const O = '#f08a2a';
    push(P, 'tail', blob('M92,132 Q128,128 130,92 Q132,50 104,36 Q78,26 72,48 Q70,62 88,62 Q104,60 104,78 Q104,100 84,112 Z', O, { hl: [0.5, 0.3] }),
      `<path d="M86,52 Q96,46 102,58 Q108,76 98,96" fill="none" stroke="${shade(O, -0.3)}" stroke-width="2.4" stroke-linecap="round"/>`);
    push(P, 'legB', blob(ellipse(88, 136, 16, 13), O), blob(ellipse(78, 148, 12, 4), shade(O, -0.15), { w: 1.2, rim: false }));
    push(P, 'body', blob(ellipse(68, 120, 24, 26), O), blob(ellipse(62, 126, 13, 18), '#fbe4c4', { w: 1.2, rim: false }));
    push(P, 'legF', blob(ellipse(52, 146, 10, 4.5), shade(O, -0.15), { w: 1.2, rim: false }), tube('M60,114 Q50,122 48,128', 6, O), blob(circle(47, 130, 5.5), '#a8682a', { w: 1.2 }));
    push(P, 'head', blob(ellipse(54, 86, 22, 19), O), blob(ellipse(40, 94, 12, 9), '#fbe4c4', { w: 1.2, rim: false }),
      blob(ellipse(30, 92, 4, 3), '#3a1a10', { w: 1, rim: false }), eyeChibi(48, 84, 6.5, 8, '#3a2010', { lid: 1, skin: O, look: [-0.4, 0.15] }),
      `<path d="M34,100 Q38,103 42,100" fill="none" stroke="#5a2a10" stroke-width="1.6" stroke-linecap="round"/>`);
    push(P, 'horn', blob('M56,72 Q52,46 64,38 Q70,56 66,74 Z', O), blob('M58,70 Q58,52 63,46 Q66,58 64,70 Z', '#fbd0a4', { w: 1, rim: false }),
      blob('M68,74 Q74,50 88,46 Q86,64 76,78 Z', shade(O, -0.08)));
  }
  return assemble(kind, P, part);
}

/** Doa de la Carrière : boule de poils noirs à un gros œil jaune, pattes d'oiseau, chacun son outil. */
function doaSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const FUR = '#221c1a';
  const legs = (x: number, y: number) => tube(`M${x},${y} L${x - 2},${y + 22}`, 3, '#d8c08a', '#5a4a2a') +
    `<path d="M${x - 2},${y + 22} l-8,4 M${x - 2},${y + 22} l-1,6 M${x - 2},${y + 22} l6,4" stroke="#5a4a2a" stroke-width="2.6" stroke-linecap="round"/>`;
  push(P, 'legB', legs(80, 122));
  push(P, 'legF', legs(62, 124));
  const ball = (cx: number, cy: number, r: number) => blob(spiky(cx, cy, r, r * 0.95, 16, 0.22), FUR, { ink: '#000', hl: [0.35, 0.25] }) +
    `<path d="M${cx - r * 0.5},${cy - r * 0.55} q${r * 0.3},-${r * 0.25} ${r * 0.6},-${r * 0.1}" fill="none" stroke="#6a5a50" stroke-width="2" stroke-linecap="round"/>`;
  const eye = (cx: number, cy: number, r: number) => `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 1.12}" fill="#f8b81c" stroke="#5a3008" stroke-width="2"/>` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.62}" ry="${r * 0.7}" fill="#f8d84a"/><ellipse cx="${cx - r * 0.1}" cy="${cy}" rx="${r * 0.18}" ry="${r * 0.62}" fill="#101010"/><circle cx="${cx - r * 0.35}" cy="${cy - r * 0.4}" r="${r * 0.2}" fill="#fff"/>`;
  const horns = (cx: number, cy: number, r: number) => blob(`M${cx - r * 0.7},${cy - r * 0.6} Q${cx - r * 1.1},${cy - r * 1.4} ${cx - r * 0.5},${cy - r * 1.5} Q${cx - r * 0.6},${cy - r} ${cx - r * 0.35},${cy - r * 0.8} Z`, '#c8b080', { ink: '#4a3a1a', w: 1.2, rim: false }) +
    blob(`M${cx + r * 0.5},${cy - r * 0.7} Q${cx + r * 0.9},${cy - r * 1.5} ${cx + r * 1.2},${cy - r * 1.3} Q${cx + r * 0.9},${cy - r} ${cx + r * 0.75},${cy - r * 0.55} Z`, '#c8b080', { ink: '#4a3a1a', w: 1.2, rim: false });
  if (kind === 'sherpoa') push(P, 'body', blob('M74,74 L118,70 L122,124 L80,128 Z', '#8a5a2a', { ink: '#3a2010' }),
    `<path d="M76,92 L120,88 M78,110 L121,106" stroke="#3a2010" stroke-width="3"/>`, ...[[86, 66, 10], [100, 62, 12], [114, 68, 9], [94, 54, 8]].map(([x, y, r]) => blob(circle(x, y, r), '#d8d0b8', { ink: '#6a6050', w: 1.4 })));
  if (kind === 'douzdoa') {
    push(P, 'body', ball(70, 112, 20), blob('M48,118 L36,150 L58,124 Z', '#9a9ea4', { ink: '#3a3e44', w: 1.4 }), `<path d="M44,124 l8,4 M41,133 l7,3 M38,142 l6,2" stroke="#3a3e44" stroke-width="1.6"/>`);
    push(P, 'head', eye(64, 112, 9), ball(72, 76, 16), eye(68, 76, 7), horns(72, 76, 16));
  } else {
    push(P, 'body', ball(70, 102, 27));
    push(P, 'head', eye(64, 100, 12), horns(70, 102, 27));
  }
  if (kind === 'martoa') push(P, 'head', blob('M42,84 Q44,62 70,60 Q96,62 98,84 Q70,78 42,84 Z', '#7a7a3a', { ink: '#2a2a10' }),
    blob('M58,66 L82,66 L82,78 L58,78 Z', '#a8acb0', { ink: '#3a3e44', w: 1.4 }), `<circle cx="62" cy="72" r="1.8" fill="#3a3e44"/><circle cx="78" cy="72" r="1.8" fill="#3a3e44"/>`);
  if (kind === 'martoa') push(P, 'body', tube('M96,110 L110,138', 4, '#8a5a2a'), blob('M100,136 L120,132 L122,146 L102,150 Z', '#b8bcc0', { ink: '#3a3e44', w: 1.4 }));
  if (kind === 'pikdoa') push(P, 'head', tube('M92,140 L106,40', 4.5, '#8a5a2a'), blob('M74,52 Q104,26 136,52 Q106,40 100,48 Q92,42 74,52 Z', '#4ad8d0', { ink: '#1a5a5a' }),
    `<path d="M84,46 Q104,34 124,46" fill="none" stroke="#c8fff8" stroke-width="2" opacity="0.7"/>`);
  return assemble(kind, P, part);
}

/** Bipèdes (Forêt d'Astrub, Égouts, Château Ensablé) : jambes, corps, deux bras, tête. */
function bipedSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  if (kind === 'milirat' || kind === 'ramane') {
    // rats des Égouts, voûtés et grosse tête : Milirat (capuche à grandes oreilles, armure orange, lance),
    // Ramane (crête violette, crâne de bête sur la tête, bâton à spirale)
    const mil = kind === 'milirat';
    const G = mil ? '#7a7a62' : '#6a5a50', Belly = mil ? '#c8c0a0' : '#ece0c8', ink = '#2a2418';
    push(P, 'legB', tube('M80,124 Q86,136 84,146', 7, G, ink), blob(ellipse(82, 148, 9, 4.5), mil ? '#5a4a3a' : '#8a2ab8', { ink, w: 1.4, rim: false }));
    push(P, 'legF', tube('M62,124 Q58,136 58,146', 7, G, ink), blob(ellipse(54, 148, 9, 4.5), mil ? '#5a4a3a' : '#8a2ab8', { ink, w: 1.4, rim: false }));
    push(P, 'leafB', tube('M92,124 Q118,130 122,114 Q124,104 116,100', 3.2, mil ? '#8a6a5a' : '#8a2ab8', ink));
    push(P, 'stem', blob(ellipse(74, 112, 22, 20), G, { ink }), blob(ellipse(66, 118, 12, 12), Belly, { w: 1.2, rim: false }));
    if (mil) push(P, 'stem', blob('M54,98 Q74,90 94,100 L96,114 Q74,106 52,114 Z', '#d0702a', { ink: '#5a2a0a' }), blob('M56,112 Q74,106 94,114 L92,124 Q74,118 58,126 Z', '#b85a20', { ink: '#5a2a0a' }),
      blob(ellipse(88, 100, 10, 8), '#d0702a', { ink: '#5a2a0a', w: 1.4 }));
    // tête : grosse, voûtée vers l'avant
    push(P, 'head', blob('M74,80 Q76,58 56,54 Q36,54 30,70 Q24,82 36,90 Q52,96 66,92 Q74,88 74,80 Z', G, { ink }),
      blob('M36,72 Q22,74 16,82 Q24,88 36,86 Z', shade(G, 0.1), { ink, w: 1.4 }), blob(ellipse(16, 82, 3.5, 3), '#1a1010', { w: 1, rim: false }));
    if (mil) {
      // capuche à grandes oreilles pointues, visage pâle masqué
      push(P, 'head', blob('M38,72 Q46,62 58,64 Q64,74 58,84 Q46,90 38,84 Z', '#efe6d0', { ink, w: 1.4 }),
        `<path d="M40,70 Q50,66 60,70 L60,76 Q50,72 40,76 Z" fill="#1a1a14"/><circle cx="50" cy="73" r="2.6" fill="#e8c81a"/>`,
        blob('M34,70 Q38,46 62,44 Q84,46 82,72 Q74,62 56,60 Q42,60 34,70 Z', '#8a8a6a', { ink }),
        blob('M50,48 L30,6 L64,44 Z', '#8a8a6a', { ink, w: 1.6 }), blob('M68,48 L80,8 L82,52 Z', '#3a3a2a', { ink, w: 1.6 }), blob('M50,46 L36,18 L58,44 Z', '#c8b8a0', { ink, w: 1, rim: false }));
      push(P, 'leafF', tube('M56,104 Q46,112 44,118', 6, G, ink), blob(circle(44, 120, 5), '#5a4a3a', { ink, w: 1.2 }),
        tube('M96,108 L18,134', 3.4, '#8a5a2a', ink), blob('M22,130 L0,142 L16,124 Z', '#d0d4d8', { ink: '#3a3e44', w: 1.4 }));
    } else {
      push(P, 'head', blob(spiky(64, 50, 22, 14, 7, 1.0, Math.PI * 0.95, Math.PI * 2.1), '#8a2ab8', { ink: '#3a0a5a', w: 1.4 }),
        eyeChibi(46, 74, 7, 8, '#c8b81a', { look: [-0.4, 0.1] }),
        // crâne de bête posé sur la tête : orbites, cornes
        blob('M44,62 Q46,44 64,42 Q80,44 80,58 Q76,70 62,70 Q52,70 44,62 Z', '#f0e4a8', { ink: '#5a4a20' }),
        `<ellipse cx="58" cy="54" rx="4.5" ry="5" fill="#2a1a10"/><ellipse cx="70" cy="54" rx="4" ry="5" fill="#2a1a10"/><path d="M60,64 l2,4 l2,-4 l2,4" stroke="#5a4a20" stroke-width="1.2" fill="none"/>`,
        blob('M46,52 Q36,40 40,30 Q46,40 52,46 Z', '#f0e4a8', { ink: '#5a4a20', w: 1.2 }), blob('M78,50 Q90,40 88,30 Q82,40 76,46 Z', '#f0e4a8', { ink: '#5a4a20', w: 1.2 }));
      push(P, 'leafF', tube('M56,104 Q48,108 42,108', 6, G, ink), tube('M40,148 L44,34', 4, '#8a5a2a', ink), blob(circle(44, 28, 11), '#9a6a3a', { ink: '#4a2a10' }),
        `<path d="M44,28 m-6,0 a6,6 0 1,1 12,0 a3.5,3.5 0 1,1 -7,0" fill="none" stroke="#4a2a10" stroke-width="1.8"/>`, blob(circle(42, 108, 5), G, { ink, w: 1.2 }));
    }
  } else if (kind === 'scelerat') {
    // Scélérat Strubien : petit corps kaki voûté, casque vert pâle à long bec pointé vers le bas,
    // grand œil jaune dans une orbite vert sombre, deux ailes en lames vers l'arrière, queue de métal en anneaux
    const K = '#9a9468', ink = '#2e3424', M = '#8a9aa4';
    const foot = (x: number, y: number) => blob(`M${x + 6},${y - 4} L${x - 16},${y + 2} L${x + 6},${y + 4} Z`, M, { ink: '#3a4650', w: 1.4 });
    push(P, 'legB', tube('M82,126 Q86,136 84,142', 7, K, ink), foot(86, 146));
    push(P, 'legF', tube('M66,128 Q62,138 62,142', 7, K, ink), foot(64, 147));
    push(P, 'leafB', ...[0, 1, 2, 3, 4].map((i) => blob(ellipse(98 + i * 8, 124 + i * 4, 6 - i * 0.6, 5 - i * 0.5), i % 2 ? shade(M, -0.1) : M, { ink: '#3a4650', w: 1.3, rim: false })),
      blob('M134,138 L146,146 L132,144 Z', M, { ink: '#3a4650', w: 1.2, rim: false }));
    push(P, 'stem', blob('M54,100 Q58,86 78,86 Q102,90 102,114 Q102,136 78,138 Q54,136 52,118 Z', K, { ink }),
      blob(ellipse(68, 116, 11, 13), '#c8c49a', { ink, w: 1.2, rim: false }), blob(circle(92, 96, 4), '#d8e07a', { ink, w: 1.2, rim: false }));
    push(P, 'leafF', tube('M62,100 Q54,110 60,118', 6, K, ink), blob(circle(62, 120, 4.5), shade(K, -0.1), { ink, w: 1.2, rim: false }),
      `<path d="M66,112 l4,4 l-4,4 Z" fill="#6a2a1a"/>`);
    // tête basse posée sur le corps (voûté, sans cou)
    push(P, 'head', '<g transform="translate(6,18)">',
      // larges ailes membraneuses rabattues vers l'arrière
      blob('M58,44 Q94,14 136,22 Q130,40 104,52 Q86,60 68,62 Z', '#b4b49a', { ink: '#3a4032' }),
      blob('M62,60 Q98,52 134,70 Q118,82 94,80 Q78,78 66,74 Z', '#949684', { ink: '#3a4032' }),
      `<path d="M74,46 Q100,30 124,26 M80,54 Q102,44 128,36 M76,66 Q102,64 124,72" fill="none" stroke="#6a6a54" stroke-width="1.6" opacity="0.6"/>`,
      // casque et bec
      blob('M34,66 Q30,40 54,36 Q80,36 82,60 Q82,80 62,86 Q42,88 34,66 Z', '#d8e8b8', { ink }),
      blob('M44,40 Q60,30 76,42 Q70,48 58,46 Q48,46 44,40 Z', '#2e5a3a', { ink, w: 1.4, rim: false }),
      blob('M36,72 Q34,88 22,104 Q18,110 16,116 Q26,108 42,86 Q46,80 46,74 Z', '#c8dca8', { ink }),
      blob('M22,104 L14,120 L26,108 Z', '#b8c4cc', { ink: '#3a4650', w: 1.3 }),
      ...[[66, 44, 3], [72, 50, 2.4], [62, 40, 2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#e8f0c8" stroke="${ink}" stroke-width="0.8"/>`),
      // orbite sombre et grand œil jaune
      blob(ellipse(56, 64, 15, 14), '#22442e', { ink, w: 1.6, rim: false }),
      `<ellipse cx="53" cy="66" rx="9" ry="8.5" fill="#e8f04a" stroke="#6a8a1a" stroke-width="1.4"/><ellipse cx="50" cy="66" rx="2.4" ry="6" fill="#101410"/><circle cx="55" cy="62" r="2.2" fill="#fff"/>`,
      `<path d="M42,56 Q54,50 68,56" fill="none" stroke="#22442e" stroke-width="4" stroke-linecap="round"/>`, '</g>');
  } else {
    // Mob l'Éponge : éponge jaune carrée, culotte brune, seau et pelle
    const Y = '#f4e04a';
    push(P, 'legB', tube('M80,118 L80,140', 3.5, Y, '#8a7a10'), blob('M74,138 L86,138 L86,144 Z', '#fff', { ink: '#5a5a5a', w: 1, rim: false }), blob(ellipse(78, 147, 8, 4), '#1a1a1a', { w: 1, rim: false }));
    push(P, 'legF', tube('M62,118 L62,140', 3.5, Y, '#8a7a10'), blob('M56,138 L68,138 L68,144 Z', '#fff', { ink: '#5a5a5a', w: 1, rim: false }), blob(ellipse(58, 148, 8, 4), '#1a1a1a', { w: 1, rim: false }));
    push(P, 'stem', blob('M48,104 L96,102 L96,122 L48,124 Z', '#8a5a2a', { ink: '#3a2010' }));
    push(P, 'leafB', tube('M96,80 Q112,86 116,100', 3.2, Y, '#8a7a10'), tube('M116,98 L124,72', 3, '#d8a020'), blob('M118,74 L132,70 L126,54 L114,60 Z', '#e8401a', { ink: '#6a1a08', w: 1.4 }));
    push(P, 'leafF', tube('M48,82 Q34,92 30,104', 3.2, Y, '#8a7a10'),
      blob('M18,104 L42,104 L40,128 L20,128 Z', '#e8401a', { ink: '#6a1a08' }), `<path d="M18,104 Q30,90 42,104" fill="none" stroke="#5a5a5a" stroke-width="1.6"/><ellipse cx="30" cy="106" rx="10" ry="2.5" fill="#6ac8f0"/>`);
    push(P, 'head', blob('M44,40 Q70,34 98,40 Q102,70 98,104 L46,106 Q40,72 44,40 Z', Y, { ink: '#8a7a10', hl: [0.3, 0.2] }),
      ...[[52, 50, 4], [88, 48, 5], [92, 86, 4], [50, 92, 5], [74, 96, 3]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="#b8a020" opacity="0.7"/>`),
      `<circle cx="58" cy="62" r="10" fill="#fff" stroke="#3a3a3a" stroke-width="1.6"/><circle cx="78" cy="62" r="10" fill="#fff" stroke="#3a3a3a" stroke-width="1.6"/>`,
      `<circle cx="55" cy="64" r="4.5" fill="#3a9ad8"/><circle cx="75" cy="64" r="4.5" fill="#3a9ad8"/><circle cx="55" cy="64" r="2.2" fill="#101010"/><circle cx="75" cy="64" r="2.2" fill="#101010"/>`,
      `<path d="M54,80 Q68,92 84,80" fill="#8a2a1a" stroke="#3a3a3a" stroke-width="1.6"/><rect x="62" y="80" width="5" height="6" fill="#fff" stroke="#3a3a3a" stroke-width="0.8"/><rect x="69" y="80" width="5" height="6" fill="#fff" stroke="#3a3a3a" stroke-width="0.8"/>`,
      blob(ellipse(68, 72, 4, 6), '#f0d040', { ink: '#8a7a10', w: 1.2, rim: false }));
  }
  return assemble(kind, P, part);
}

/** Pichons des Calanques et du Château Ensablé : poissons ronds aux grands yeux, nageoires battantes, queue. */
const PICHON: Record<string, { c: string; fin: string; kind: 'spiky' | 'sword' | 'squid' | 'angler' | 'kloune' }> = {
  pichonOrange: { c: '#e8501a', fin: '#f8a83a', kind: 'spiky' },
  pichonBleu: { c: '#2a8ad8', fin: '#5ac0f0', kind: 'sword' },
  pichonBlanc: { c: '#efe6d4', fin: '#d8ccb4', kind: 'squid' },
  pichonVert: { c: '#2a9a6a', fin: '#4ac88a', kind: 'angler' },
  pichonKloune: { c: '#b8401a', fin: '#f0d8a0', kind: 'kloune' },
};

function pichonSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const S = PICHON[kind];
  const ink = shade(S.c, -0.6);
  push(P, 'wingB', blob('M90,96 Q108,80 116,92 Q106,100 96,106 Z', shade(S.fin, -0.1), { ink }));
  push(P, 'legB', S.kind === 'squid' ? blob('M100,104 Q126,92 132,104 Q126,116 100,112 Z', S.fin, { ink })
    : blob('M100,104 L128,84 Q122,104 130,124 Z', S.fin, { ink }), `<path d="M108,104 L124,94 M108,106 L126,116" stroke="${ink}" stroke-width="1.2" opacity="0.6"/>`);
  push(P, 'legF', S.kind === 'squid' ? ['M56,122 Q50,138 40,142', 'M68,126 Q66,142 58,148', 'M80,124 Q84,140 80,148'].map((d) => tube(d, 6, S.fin, ink)).join('') : '');
  // corps
  const body = S.kind === 'sword' ? ellipse(76, 104, 30, 24) : S.kind === 'squid' ? 'M42,104 Q40,72 74,66 Q106,64 106,100 Q104,126 72,128 Q46,128 42,104 Z' : ellipse(74, 104, 33, 28);
  push(P, 'body', blob(body, S.c, { ink, hl: [0.35, 0.22] }));
  if (S.kind === 'kloune') push(P, 'body', blob('M70,78 Q86,74 94,86 Q84,92 74,90 Z', S.fin, { ink, w: 1.2, rim: false }), blob('M86,112 Q100,108 104,118 Q94,124 86,120 Z', S.fin, { ink, w: 1.2, rim: false }));
  if (S.kind === 'angler') push(P, 'body', ...[[84, 92], [96, 108], [70, 120], [88, 120]].map(([x, y]) => halo(uid('h'), x, y, 7, '#c8ff6a') + `<circle cx="${x}" cy="${y}" r="3" fill="#e8ff8a"/>`));
  if (S.kind === 'squid') push(P, 'body', `<ellipse cx="80" cy="70" rx="5" ry="2.5" fill="${ink}"/>`);
  if (S.kind === 'sword') push(P, 'body', blob('M50,100 L6,108 L50,110 Z', shade(S.c, 0.25), { ink, w: 1.4 }));
  push(P, 'body', S.kind === 'squid' ? '' : `<path d="M60,84 Q66,104 60,124" fill="none" stroke="${ink}" stroke-width="1.4" opacity="0.5"/>`);
  // yeux, bouche
  const big = S.kind === 'kloune' ? 1.25 : 1;
  push(P, 'body', eyeChibi(54, 96, 10 * big, 11 * big, '#3a2a1a', { look: [-0.35, 0.1], ...(S.kind === 'spiky' || S.kind === 'sword' ? { lid: 1, skin: S.c } : {}) }));
  if (S.kind === 'kloune' || S.kind === 'spiky') push(P, 'body', blob('M40,112 Q32,108 30,116 Q32,124 42,120 Q46,116 40,112 Z', S.kind === 'kloune' ? '#f0a83a' : '#f8c84a', { ink, w: 1.4 }));
  else if (S.kind === 'angler') push(P, 'body', `<path d="M40,108 Q50,122 64,114" fill="#1a3a2a" stroke="${ink}" stroke-width="1.6"/><path d="M44,110 l3,5 l3,-4 l3,5 l3,-4" fill="none" stroke="#fff" stroke-width="1.4"/>`);
  else push(P, 'body', `<path d="M44,114 Q50,118 56,114" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`);
  // nageoire du dos (ou leurre du Pichon Vert)
  push(P, 'crest', S.kind === 'angler'
    ? tube('M70,78 Q66,48 46,46 Q34,48 34,60', 3, shade(S.c, -0.2), ink) + halo(uid('h'), 34, 64, 13, '#c8ff6a') + blob(circle(34, 64, 6), '#e8ff8a', { ink: '#5a8a1a', w: 1.2, rim: false })
    : S.kind === 'squid' ? '' : S.kind === 'sword' ? blob('M60,84 Q66,40 92,34 Q90,60 100,86 Z', S.fin, { ink }) + `<path d="M70,80 L76,46 M82,82 L86,42 M92,84 L92,48" stroke="${ink}" stroke-width="1.4" opacity="0.6"/>`
      : blob(spiky(76, 80, 22, 14, 6, 1.1, Math.PI * 1.05, Math.PI * 1.95), S.fin, { ink, w: 1.4 }));
  push(P, 'wingF', blob('M76,112 Q86,126 70,132 Q66,122 70,112 Z', S.fin, { ink }));
  return assemble(kind, P, part);
}

/* ---- Tofus d'Amakna (Champ des Ingalsse, Donjon des Tofus) : d'après les illustrations DofusDB ---- */
export const TOFUS: CritterKind[] = ['tofuJaune', 'tofuNoir', 'tofoune', 'tofukaz', 'tofuMutant', 'tofuVentripotent', 'batofu', 'bomberfu', 'tofuMalefique'];
const TOFU_A: Record<string, { c: string; feet: string; kind: 'plain' | 'noir' | 'oune' | 'kaz' | 'mutant' | 'ventre' | 'bat' | 'bomb' | 'male' }> = {
  tofuJaune: { c: '#f6e264', feet: '#f09a2a', kind: 'plain' },
  tofuNoir: { c: '#4a3a32', feet: '#f09a2a', kind: 'noir' },
  tofoune: { c: '#f2b52c', feet: '#e8862a', kind: 'oune' },
  tofukaz: { c: '#f6c43c', feet: '#f09a2a', kind: 'kaz' },
  tofuMutant: { c: '#f4dc58', feet: '#c88a3a', kind: 'mutant' },
  tofuVentripotent: { c: '#f4d850', feet: '#d8902a', kind: 'ventre' },
  batofu: { c: '#3e4c6e', feet: '#9a9a8a', kind: 'bat' },
  bomberfu: { c: '#eadcac', feet: '#c8962a', kind: 'bomb' },
  tofuMalefique: { c: '#ece0bc', feet: '#e88a2a', kind: 'male' },
};
/** Bord duveteux : cercle « en dents » très fines (plumes des Tofus). */
const fuzz = (cx: number, cy: number, rx: number, ry: number) => spiky(cx, cy, rx, ry, 46, 0.035);

function amaknaTofuSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const S = TOFU_A[kind];
  const ink = shade(S.c, S.kind === 'noir' || S.kind === 'bat' ? -0.7 : -0.62);
  const big = S.kind === 'ventre' ? 1.22 : S.kind === 'oune' ? 1.1 : 1;
  const cx = 74, r = 36 * big, cy = 140 - r * 0.94;
  const footY = 146;
  // aile arrière (Batofu : grande aile de chauve-souris), mèche (Tofukaz), tête morte (Tofu Mutant)
  if (S.kind === 'bat') push(P, 'wingB', blob(`M${cx + 20},${cy - 10} Q${cx + 40},${cy - 46} ${cx + 64},${cy - 58} Q${cx + 56},${cy - 42} ${cx + 62},${cy - 34} Q${cx + 50},${cy - 34} ${cx + 52},${cy - 22} Q${cx + 40},${cy - 24} ${cx + 34},${cy - 4} Z`, '#262c40', { ink: '#0e1018' }),
    blob(`M${cx - 18},${cy - 18} Q${cx - 40},${cy - 50} ${cx - 66},${cy - 56} Q${cx - 56},${cy - 42} ${cx - 64},${cy - 32} Q${cx - 50},${cy - 32} ${cx - 54},${cy - 20} Q${cx - 42},${cy - 22} ${cx - 34},${cy - 6} Z`, '#2c3450', { ink: '#0e1018' }));
  else if (S.kind === 'kaz' || S.kind === 'bomb') push(P, 'wingB', tube('M104,112 Q120,118 126,108 Q134,96 128,86 Q122,78 130,70', 4.5, '#8a5a32', '#3a2414'),
    `<path d="M130,70 l2,-4 M130,70 l4,-1" stroke="#3a2414" stroke-width="1.2"/>`, spark(131, 67, 6, 1), `<circle cx="131" cy="67" r="3" fill="#ffb03a"/>`);
  else if (S.kind === 'mutant') push(P, 'wingB', blob('M112,72 L106,50 L116,66 L124,48 L124,70 Z', S.c, { ink, w: 1.2 }), blob(fuzz(112, 94, 25, 23), shade(S.c, -0.06), { ink }),
    `<path d="M110,84 l8,8 M118,84 l-8,8" stroke="#3a2a14" stroke-width="2.6" stroke-linecap="round"/>`,
    blob('M118,104 Q128,106 128,118 Q124,126 116,120 Q114,110 118,104 Z', '#e88a8a', { ink: '#8a3a3a', w: 1.2 }));
  else push(P, 'wingB', blob(ellipse(cx + r * 0.88, cy - 8, 11, 8), S.kind === 'male' ? '#24404e' : shade(S.c, -0.08), { ink }));
  // pattes : de gros pieds ronds directement sous le corps
  push(P, 'legB', blob(ellipse(cx + 14, footY, 12, 6.5), S.feet, { ink: shade(S.feet, -0.55) }));
  push(P, 'legF', blob(ellipse(cx - 16, footY + 1, 13, 7), S.feet, { ink: shade(S.feet, -0.55) }));
  // corps duveteux
  push(P, 'body', blob(fuzz(cx, cy, r, r * (S.kind === 'oune' || S.kind === 'ventre' ? 0.98 : 0.94)), S.c, { ink, hl: [0.3, 0.22] }));
  if (S.kind === 'ventre' || S.kind === 'oune') {
    push(P, 'body', blob(ellipse(cx - 6, cy + r * 0.32, r * 0.62, r * 0.5), S.kind === 'ventre' ? '#f8f0b8' : '#f8e2a0', { ink: shade(S.c, -0.35), w: 1.2, rim: false }));
    for (const [x, y] of [[-14, 0.3], [-2, 0.26], [10, 0.32], [-8, 0.48], [4, 0.5]] as const)
      push(P, 'body', `<path d="M${cx + x - 5},${cy + r * y} q5,6 10,0" fill="none" stroke="${shade(S.c, -0.3)}" stroke-width="1.6" stroke-linecap="round"/>`);
  }
  // visage (regard vers la gauche)
  const ex = cx - r * 0.42, ey = cy - r * 0.12;
  if (S.kind === 'ventre') {
    // yeux plissés de colère, veine rouge sur le crâne
    push(P, 'body', `<path d="M${ex - 12},${ey - 6} q8,-8 16,0 M${ex + 12},${ey - 4} q7,-7 14,0" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`,
      `<path d="M${ex - 14},${ey - 14} l12,4 M${ex + 22},${ey - 13} l-10,5" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<path d="M${cx + 4},${cy - r * 0.78} l5,6 l-6,3 m10,-11 l1,8 m5,-4 l-6,4" fill="none" stroke="#d8302a" stroke-width="2.4" stroke-linecap="round"/>`,
      `<path d="M${ex - 6},${ey + 14} q8,-5 16,0" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`);
  } else if (S.kind === 'oune') {
    push(P, 'body', eyeChibi(ex + 2, ey, 11, 13, '#1a1a1a', { look: [-0.3, 0.1] }), eyeChibi(ex + 24, ey + 1, 9, 11, '#1a1a1a', { look: [-0.3, 0.1] }),
      `<path d="M${ex - 10},${ey - 12} l-5,-5 M${ex - 6},${ey - 14} l-3,-6 M${ex + 18},${ey - 11} l-2,-6 M${ex + 22},${ey - 12} l1,-6" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>`,
      `<ellipse cx="${ex - 6}" cy="${ey + 18}" rx="7" ry="4" fill="#f07a5a" opacity="0.55"/><ellipse cx="${ex + 28}" cy="${ey + 18}" rx="6" ry="4" fill="#f07a5a" opacity="0.55"/>`,
      blob(`M${ex + 4},${ey + 16} Q${ex + 12},${ey + 14} ${ex + 14},${ey + 20} Q${ex + 8},${ey + 26} ${ex + 2},${ey + 22} Z`, '#e8602a', { ink: '#7a2a10', w: 1.2 }),
      // ailes croisées sur le ventre
      blob(`M${cx - 22},${cy + 22} Q${cx - 6},${cy + 14} ${cx + 4},${cy + 26} Q${cx - 10},${cy + 34} ${cx - 22},${cy + 22} Z`, shade(S.c, 0.12), { ink }),
      blob(`M${cx + 18},${cy + 20} Q${cx + 2},${cy + 14} ${cx - 6},${cy + 28} Q${cx + 8},${cy + 34} ${cx + 18},${cy + 20} Z`, shade(S.c, 0.05), { ink }));
  } else {
    const lid = S.kind === 'noir' || S.kind === 'kaz' || S.kind === 'bat' ? 1 : 0;
    const iris = S.kind === 'mutant' ? '#2a7ad8' : '#1a1a1a';
    if (S.kind === 'male') {
      // Tofu Maléfique : un crâne de Tofu, grande orbite sombre et œil vert luisant, rangée de dents, fissures
      push(P, 'body', blob(ellipse(ex + 6, ey, 20, 18), '#4a3e28', { ink: '#1a140a', rim: false }),
        halo(uid('h'), ex + 4, ey + 1, 18, '#c8ff40'), blob(ellipse(ex + 4, ey + 1, 12, 12), '#c8ee38', { ink: '#4a6a10', w: 1.4 }),
        `<ellipse cx="${ex}" cy="${ey + 2}" rx="5" ry="6" fill="#1a2008"/><circle cx="${ex + 7}" cy="${ey - 4}" r="2.4" fill="#fff"/>`,
        blob(ellipse(ex + 30, ey - 2, 7, 8), '#4a3e28', { ink: '#1a140a', w: 1.2, rim: false }), `<circle cx="${ex + 30}" cy="${ey - 1}" r="3" fill="#c8ee38"/>`,
        `<path d="M${ex - 10},${ey + 24} L${ex + 20},${ey + 26}" stroke="#3a2e1a" stroke-width="1.6"/>` + [0, 6, 12, 18].map((d) => `<rect x="${ex - 9 + d}" y="${ey + 20}" width="5" height="7" rx="1" fill="#fffaea" stroke="#3a2e1a" stroke-width="1"/>`).join(''),
        `<path d="M${cx + 14},${cy - 20} l6,8 l-3,6 M${cx + 20},${cy + 6} l8,4" fill="none" stroke="#8a7a52" stroke-width="1.4"/>`);
    } else if (S.kind === 'bomb') {
      // Bomberfu : yeux en croix cousus, un « 6 » sur la joue (compte à rebours)
      push(P, 'body', ...[[ex, ey, 9], [ex + 24, ey - 1, 7]].map(([x, y, r]) => `<path d="M${x - r},${y - r} L${x + r},${y + r} M${x + r},${y - r} L${x - r},${y + r}" stroke="#4a3418" stroke-width="4" stroke-linecap="round"/>`),
        `<text x="${ex + 2}" y="${ey + 34}" font-family="sans-serif" font-weight="700" font-size="14" fill="#6a4a20">6</text>`);
    } else push(P, 'body', eyeChibi(ex, ey, 13, 15.5, iris, { look: [-0.36, 0.12], ...(lid ? { lid, skin: S.c } : {}) }),
      eyeChibi(ex + 24, ey - 1, 9.5, 12, iris, { look: [-0.36, 0.12], ...(lid ? { lid, skin: S.c } : {}) }));
    // petit bec (et langue du Tofu Noir, dents du Mutant)
    if (S.kind !== 'male') push(P, 'body', blob(`M${ex - 4},${ey + 18} L${ex - 16},${ey + 22} L${ex - 3},${ey + 26} Z`, S.kind === 'bat' ? '#c8c0a0' : '#f0a43a', { ink: '#6a3a10', w: 1.3 }));
    if (S.kind === 'noir') push(P, 'body', blob(`M${ex - 10},${ey + 25} Q${ex - 14},${ey + 34} ${ex - 6},${ey + 34} Q${ex - 2},${ey + 30} ${ex - 4},${ey + 25} Z`, '#a03a7a', { ink: '#4a1030', w: 1.2 }));
    if (S.kind === 'mutant') push(P, 'body', `<rect x="${ex - 6}" y="${ey + 24}" width="5" height="7" fill="#fff" stroke="#3a2a14" stroke-width="1"/><rect x="${ex - 1}" y="${ey + 24}" width="5" height="6" fill="#fff" stroke="#3a2a14" stroke-width="1"/>`,
      `<path d="M${cx + 10},${cy + 16} l6,4 M${cx + 13},${cy + 14} l-2,8" stroke="#8a5a1a" stroke-width="1.4"/>`);
    if (S.kind === 'noir' || S.kind === 'bat') push(P, 'body', `<path d="M${ex - 14},${ey - 18} l12,5 M${ex + 16},${ey - 18} l12,3" stroke="${shade(S.c, -0.75)}" stroke-width="2.6" stroke-linecap="round"/>`);
  }
  // crête : deux grandes plumes en oreilles de lapin (+ toupet de la Tofoune avec son petit Tofu, plumes en bataille du Mutant, oreilles du Batofu)
  const top = cy - r * 0.9;
  if (S.kind === 'oune') {
    push(P, 'crest', blob(spiky(cx - 4, top - 4, 20, 13, 7, 0.75, Math.PI * 0.95, Math.PI * 2.05), '#e8541a', { ink: '#7a2a0a' }),
      blob(fuzz(cx - 2, top - 16, 9, 8), '#f6e264', { ink: '#8a6a1a', w: 1.3 }), eyeChibi(cx - 6, top - 17, 3, 3.6, '#1a1a1a'),
      blob(`M${cx},${top - 24} L${cx - 2},${top - 33} L${cx + 4},${top - 25} Z`, '#f6e264', { ink: '#8a6a1a', w: 1 }),
      blob(ellipse(cx - 6, top - 7, 4, 2.4), '#f09a2a', { ink: '#6a3a10', w: 1 }), blob(ellipse(cx + 4, top - 7, 4, 2.4), '#f09a2a', { ink: '#6a3a10', w: 1 }));
  } else if (S.kind === 'bat') {
    push(P, 'crest', blob(`M${cx - 18},${top + 8} L${cx - 22},${top - 22} L${cx - 4},${top + 2} Z`, S.c, { ink }), blob(`M${cx + 4},${top + 2} L${cx + 14},${top - 24} L${cx + 18},${top + 8} Z`, S.c, { ink }));
  } else if (S.kind === 'mutant') {
    push(P, 'crest', ...[[-20, -16, -30], [-8, -30, -34], [4, -8, -38], [14, 10, -30], [22, 24, -18]].map(([x, tx, ty]) =>
      blob(`M${cx + x - 5},${top + 6} L${cx + tx},${top + ty} L${cx + x + 5},${top + 6} Z`, S.c, { ink, w: 1.3 })));
  } else if (S.kind === 'male') {
    // piques sombres bleu-vert
    push(P, 'crest', ...[[-18, -26, -28], [-4, -10, -42], [10, 16, -34]].map(([x, tx, ty]) =>
      blob(`M${cx + x - 7},${top + 8} L${cx + tx},${top + ty} L${cx + x + 7},${top + 8} Z`, '#2e4a5a', { ink: '#0e1a22', w: 1.4 })));
  } else if (S.kind !== 'ventre') {
    const col = S.kind === 'noir' ? '#3a2c26' : S.c;
    push(P, 'crest', blob(`M${cx - 10},${top + 6} Q${cx - 18},${top - 18} ${cx - 8},${top - 34} Q${cx - 2},${top - 14} ${cx + 2},${top + 4} Z`, col, { ink }),
      blob(`M${cx},${top + 4} Q${cx + 6},${top - 22} ${cx + 22},${top - 30} Q${cx + 16},${top - 10} ${cx + 10},${top + 8} Z`, col, { ink }),
      blob(`M${cx - 16},${top + 10} Q${cx - 28},${top} ${cx - 30},${top - 8} Q${cx - 18},${top - 4} ${cx - 10},${top + 6} Z`, col, { ink, w: 1.4 }));
  } else {
    push(P, 'crest', blob(`M${cx - 6},${top + 8} Q${cx - 10},${top - 6} ${cx - 2},${top - 14} Q${cx + 2},${top - 2} ${cx + 4},${top + 8} Z`, S.c, { ink, w: 1.4 }));
  }
  // aile avant
  if (S.kind !== 'oune') push(P, 'wingF', blob(`M${cx + 6},${cy + 12} Q${cx + 24},${cy + 10} ${cx + 26},${cy + 24} Q${cx + 14},${cy + 32} ${cx + 4},${cy + 24} Z`, S.kind === 'male' ? '#2e4a5a' : shade(S.c, 0.1), { ink: S.kind === 'male' ? '#0e1a22' : ink }));
  return assemble(kind, P, part);
}

/* ---- Scarafeuilles (Plaine et Donjon des Scarafeuilles) : d'après les illustrations DofusDB ---- */
export const SCARAS: CritterKind[] = ['scaraRouge', 'scaraBleu', 'scaraVert', 'scaraBlanc', 'scaraNoir', 'scaraImmature', 'scarabosse'];
const SCARA: Record<string, { c: string; wing: string; kind: 'adult' | 'young' | 'boss' }> = {
  scaraRouge: { c: '#e2401c', wing: '#f8a050', kind: 'adult' },
  scaraBleu: { c: '#2a9ac8', wing: '#a8e4f8', kind: 'adult' },
  scaraVert: { c: '#9aa82a', wing: '#d8e070', kind: 'adult' },
  scaraBlanc: { c: '#e8e4c4', wing: '#f4f4d8', kind: 'adult' },
  scaraNoir: { c: '#2e4040', wing: '#a8d8c8', kind: 'adult' },
  scaraImmature: { c: '#e8a038', wing: '#98d050', kind: 'young' },
  scarabosse: { c: '#f2b818', wing: '#ffffff', kind: 'boss' },
};

/** Scarafeuille : carapace bombée en plaques, grandes ailes-feuilles translucides, antenne en épi, six pattes brunes. Regarde à gauche. */
function scaraSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const S = SCARA[kind];
  const ink = shade(S.c, -0.65), BROWN = '#7a4a24', FOOT = '#f4e8d0';
  const leg = (x0: number, y0: number, x1: number, y1: number) =>
    tube(`M${x0},${y0} Q${(x0 + x1) / 2},${y0 + 2} ${x1},${y1}`, 11, BROWN) +
    blob(`M${x1 - 9},${y1 + 2} Q${x1 - 8},${y1 + 8} ${x1 - 4},${y1 + 7} Q${x1},${y1 + 9} ${x1 + 4},${y1 + 7} Q${x1 + 8},${y1 + 8} ${x1 + 9},${y1 + 2} Z`, FOOT, { ink: '#6a5a40', w: 1.3 });
  const knee = (x: number, y: number) => blob(`M${x - 9},${y + 4} Q${x - 8},${y - 8} ${x + 2},${y - 8} Q${x + 10},${y - 6} ${x + 9},${y + 4} Q${x},${y + 8} ${x - 9},${y + 4} Z`, S.c, { ink, w: 1.4 });
  if (S.kind === 'young') {
    // Scarafeuille Immature : carapace orange rayée, une pousse sur le dos, gros yeux verts devant
    push(P, 'legB', leg(98, 128, 108, 144), leg(84, 132, 88, 148));
    push(P, 'body', blob('M30,124 Q30,82 74,78 Q118,78 122,120 Q112,138 74,138 Q40,138 30,124 Z', S.c, { ink, hl: [0.4, 0.2] }),
      ...[[52, 86, 60, 132], [72, 80, 78, 136], [92, 82, 98, 132]].map(([a, b, c, d]) => `<path d="M${a},${b} Q${a + 10},${(b + d) / 2} ${c},${d}" fill="none" stroke="${shade(S.c, -0.35)}" stroke-width="6" opacity="0.55"/>`),
      `<path d="M30,124 Q74,146 122,120" fill="none" stroke="${ink}" stroke-width="2"/>`);
    push(P, 'legF', leg(54, 130, 46, 146), leg(70, 134, 66, 150));
    push(P, 'head', blob(ellipse(34, 124, 15, 13), '#f0f4d8', { ink: '#4a6a2a' }), blob(ellipse(56, 132, 13, 11), '#f0f4d8', { ink: '#4a6a2a' }),
      `<circle cx="30" cy="124" r="5" fill="#5a9a2a"/><circle cx="52" cy="132" r="4.5" fill="#5a9a2a"/><circle cx="28" cy="122" r="1.8" fill="#fff"/>`,
      blob('M40,108 Q50,100 60,110 Q50,116 40,108 Z', S.wing, { ink: '#3a6a1a', w: 1.3 }));
    push(P, 'horn', tube('M84,82 Q78,56 92,40', 8, '#e4ecc0', '#7a8a4a'), blob('M92,40 Q80,16 56,22 Q62,40 92,40 Z', S.wing, { ink: '#3a6a1a' }),
      blob('M92,40 Q112,22 130,32 Q116,46 92,40 Z', S.wing, { ink: '#3a6a1a' }));
    return assemble(kind, P, part);
  }
  const boss = S.kind === 'boss';
  // ailes-feuilles translucides dressées sur le dos, petite feuille turquoise
  push(P, 'tail', blob('M86,90 Q98,40 128,22 Q122,56 100,94 Z', S.wing, { ink: shade(S.wing, -0.45), alpha: boss ? 0.45 : 0.75 }),
    blob('M74,88 Q70,40 92,14 Q100,50 86,92 Z', S.wing, { ink: shade(S.wing, -0.45), alpha: boss ? 0.45 : 0.8 }),
    `<path d="M86,90 Q100,58 124,28 M76,88 Q78,52 90,20" fill="none" stroke="${shade(S.wing, -0.4)}" stroke-width="1.2" opacity="0.7"/>`,
    blob('M100,96 Q118,84 128,90 Q116,100 100,98 Z', '#78c8b0', { ink: '#2a6a5a', w: 1.2 }));
  push(P, 'legB', leg(102, 118, 112, 138), knee(108, 128), leg(88, 124, 92, 142), knee(92, 133));
  // carapace en plaques, ventre brun
  push(P, 'body', blob('M44,124 Q46,128 112,128 Q124,122 120,110 Q110,128 50,122 Z', BROWN),
    blob('M42,116 Q40,80 78,74 Q116,72 122,108 Q118,124 82,126 Q50,128 42,116 Z', S.c, { ink, hl: [0.4, 0.18] }),
    `<path d="M80,75 Q84,100 82,126 M60,80 Q66,100 62,124 M100,78 Q104,100 104,122" fill="none" stroke="${ink}" stroke-width="1.8" opacity="0.6"/>`,
    `<path d="M62,86 L70,80 L78,88 Z M88,82 L98,80 L100,90 Z" fill="${shade(S.c, 0.45)}" opacity="0.7"/>`);
  push(P, 'legF', leg(58, 122, 48, 140), knee(50, 131), leg(74, 126, 70, 144), knee(70, 135));
  // tête-casque, gros œil fâché, mandibule
  push(P, 'head', blob('M26,112 Q24,90 46,88 Q64,88 64,108 Q62,124 44,126 Q28,124 26,112 Z', S.c, { ink }),
    blob(ellipse(44, 96, 9, 6), shade(S.c, 0.5), { ink, w: 1.2, rim: false }),
    eyeChibi(36, 110, 8.5, 10, '#14181a', { lid: 1, skin: S.c, look: [-0.3, 0.1] }),
    blob('M24,118 Q16,120 18,128 Q24,126 30,124 Z', BROWN, { w: 1.3 }));
  if (boss) push(P, 'head', halo(uid('h'), 18, 112, 26, '#fff4c0'), `<path d="M10,96 L20,112 L6,110 L18,124 L4,128" fill="none" stroke="#fff8d8" stroke-width="3" stroke-linecap="round" opacity="0.85"/>`);
  // antenne en épi de blé
  push(P, 'horn', tube('M52,90 Q54,66 64,50', 2.6, '#8a5a2a', '#3a2410'), blob('M64,50 Q58,36 66,24 Q74,36 68,50 Z', '#e8a028', { ink: '#7a4a10', w: 1.3 }),
    `<path d="M63,46 l5,-3 M62,40 l6,-3 M63,34 l5,-3" stroke="#7a4a10" stroke-width="1"/>`);
  return assemble(kind, P, part);
}

/* ---- Cimetière et Cryptes d'Amakna : Rib (squelette de bête cornue) et Kwoan (crâne flottant) ---- */
const RIB_BONE = '#efe2cc', RIB_INK = '#5a4632';
const ribBone = (d: string, w: number) => tube(d, w, RIB_BONE, RIB_INK);

/** Rib : squelette de quadrupède voûté, piques d'os sur l'échine, crâne bas aux dents serrées, grosses cornes brunes enroulées. Regarde à gauche. */
function ribSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  push(P, 'tail', ribBone('M108,100 Q122,96 128,84 Q132,74 140,70', 4.5), ...[[118, 97], [126, 88], [132, 78]].map(([x, y]) => blob(ellipse(x, y, 4, 3.4), RIB_BONE, { ink: RIB_INK, w: 1.2, rim: false })));
  const leg = (x0: number, y0: number, kx: number, ky: number, x1: number, y1: number) =>
    ribBone(`M${x0},${y0} L${kx},${ky} L${x1},${y1}`, 5) + blob(ellipse(kx, ky, 5, 4.5), RIB_BONE, { ink: RIB_INK, w: 1.2, rim: false }) +
    blob(`M${x1 - 8},${y1 + 2} Q${x1 - 6},${y1 - 6} ${x1 + 2},${y1 - 4} Q${x1 + 8},${y1} ${x1 + 6},${y1 + 4} Z`, RIB_BONE, { ink: RIB_INK, w: 1.3 });
  push(P, 'legB', leg(104, 106, 112, 126, 108, 146), leg(96, 108, 98, 128, 94, 148));
  // échine voûtée, piques, cage thoracique pendante, bassin
  push(P, 'body', blob('M96,98 Q110,94 114,104 Q108,114 96,112 Q90,106 96,98 Z', RIB_BONE, { ink: RIB_INK }),
    ribBone('M110,102 Q96,84 76,88 Q64,92 58,104', 6),
    ...[[100, 92], [90, 88], [80, 88], [70, 92]].map(([x, y]) => blob(`M${x - 4},${y} L${x + 2},${y - 14} L${x + 4},${y + 1} Z`, RIB_BONE, { ink: RIB_INK, w: 1.2 })),
    ...[[94, 92], [86, 90], [78, 91], [70, 95]].map(([x, y], i) => `<path d="M${x},${y} Q${x - 10},${y + 10} ${x - 6},${y + 24 - i * 2}" fill="none" stroke="${RIB_INK}" stroke-width="5.4" stroke-linecap="round"/><path d="M${x},${y} Q${x - 10},${y + 10} ${x - 6},${y + 24 - i * 2}" fill="none" stroke="${RIB_BONE}" stroke-width="3" stroke-linecap="round"/>`));
  push(P, 'legF', leg(66, 104, 58, 124, 54, 144), leg(74, 106, 72, 126, 70, 146));
  // crâne bas, orbites sombres, dents
  push(P, 'head', blob('M30,118 Q26,100 40,94 Q58,88 68,100 Q72,114 62,124 Q50,132 36,128 Z', RIB_BONE, { ink: RIB_INK }),
    `<path d="M30,120 L58,124" stroke="${RIB_INK}" stroke-width="1.6"/>` + [0, 6, 12, 18, 24].map((d) => `<path d="M${32 + d},119 l2,6 l2,-6" fill="#fffaea" stroke="${RIB_INK}" stroke-width="1"/>`).join(''),
    blob(ellipse(44, 106, 7, 6), '#2a1e14', { ink: '#120a04', w: 1, rim: false }), `<circle cx="43" cy="106" r="2.2" fill="#ff6a3a"/>`,
    blob(ellipse(30, 112, 3, 2.4), '#2a1e14', { w: 0.8, rim: false }));
  // cornes brunes enroulées
  push(P, 'horn', blob('M54,98 Q50,74 70,70 Q88,70 86,88 Q84,100 72,98 Q64,96 66,88 Q70,82 76,86', '#8a5a34', { ink: '#3a2210' }),
    `<path d="M58,92 Q56,78 70,76 M64,96 Q62,84 72,80" fill="none" stroke="#5a3a1e" stroke-width="1.6"/>`);
  return assemble('rib', P, part);
}

/** Kwoan : crâne flottant, une grande orbite à l'œil vert, mâchoire ouverte sur une langue rose, fissures. */
function kwoanSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  push(P, 'back', `<ellipse cx="70" cy="150" rx="26" ry="6" fill="#000" opacity="0.18"/>`, halo(uid('h'), 70, 86, 52, '#d8ff8a'));
  push(P, 'body', blob('M32,74 C28,44 52,28 76,30 C102,32 116,52 110,80 C106,96 96,104 84,106 L48,106 C38,100 34,88 32,74 Z', '#efe2bc', { ink: '#5a4a2a' }),
    blob('M40,98 L92,100 Q94,118 82,128 Q66,136 50,128 Q40,118 40,98 Z', '#e6d8b0', { ink: '#5a4a2a' }),
    `<path d="M88,40 l-6,12 l6,6 M100,70 l8,-6" fill="none" stroke="#8a7a52" stroke-width="1.6"/>`);
  push(P, 'face', blob('M46,106 L86,104 Q84,120 66,122 Q50,120 46,106 Z', '#4a1a1e', { ink: '#1a0608', rim: false }),
    blob('M52,108 Q66,104 78,110 Q76,124 64,126 Q54,122 52,108 Z', '#e8707a', { ink: '#8a2a34', w: 1.3 }),
    [0, 7, 14, 21, 28].map((d) => `<path d="M${48 + d},104 l3,6 l3,-6" fill="#fffaea" stroke="#5a4a2a" stroke-width="0.9"/>`).join(''),
    blob(ellipse(54, 68, 18, 17), '#4a3e28', { ink: '#1a140a', rim: false }), halo(uid('h'), 54, 68, 18, '#c8ff40'),
    blob(ellipse(54, 68, 11, 11), '#b8e030', { ink: '#4a6a10', w: 1.3 }), `<circle cx="50" cy="70" r="4.6" fill="#1a2008"/><circle cx="57" cy="64" r="2.2" fill="#fff"/>`,
    blob(ellipse(88, 64, 7, 9), '#4a3e28', { ink: '#1a140a', w: 1.2, rim: false }), `<circle cx="88" cy="66" r="2.6" fill="#b8e030"/>`,
    `<path d="M70,82 l-4,8 l6,0 Z" fill="#3a2e1a"/>`);
  return assemble('kwoan', P, part);
}


/** Boostache (boss) et Boostache Prépubère : fantômes flottants, queue en volute ; le Boostache a une grosse moustache, des yeux jaunes et une flammèche verte. */
function ghostSvg(kind: 'boostache' | 'boostachePrepubere', part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const big = kind === 'boostache';
  const base = big ? '#f4f6ec' : '#f8ddd2', ink = big ? '#4a5a48' : '#8a5a50';
  push(P, 'back', `<ellipse cx="70" cy="150" rx="22" ry="5" fill="#000" opacity="0.16"/>`, halo(uid('h'), 70, 92, 58, big ? '#b8ff9a' : '#ffd8c8'));
  push(P, 'body',
    blob('M34,86 C30,52 50,30 72,30 C98,30 112,52 110,80 C108,100 100,112 108,124 C112,132 100,138 92,130 C88,138 76,140 70,132 C62,140 50,136 50,126 C40,122 36,104 34,86 Z', base, { ink }),
    blob('M36,92 Q22,96 20,108 Q30,112 40,104 Z', base, { ink, w: 1.4 }), blob('M106,90 Q120,92 124,104 Q114,108 104,100 Z', base, { ink, w: 1.4 }),
    `<path d="M48,44 Q60,34 76,36" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`);
  if (big) {
    push(P, 'face',
      // flammèche verte sur le crâne
      blob('M74,30 Q66,18 74,6 Q76,16 84,20 Q86,28 74,30 Z', '#7aef6a', { ink: '#2a7a2a', w: 1.3 }), halo(uid('h'), 76, 20, 14, '#9aff8a'),
      // yeux jaunes, sourcils froncés
      blob(ellipse(56, 66, 9, 8), '#fff6b0', { ink: '#3a3a1a', w: 1.4 }), blob(ellipse(86, 66, 9, 8), '#fff6b0', { ink: '#3a3a1a', w: 1.4 }),
      `<circle cx="58" cy="67" r="3.4" fill="#2a2a10"/><circle cx="84" cy="67" r="3.4" fill="#2a2a10"/>`,
      `<path d="M44,54 L66,60 M98,54 L76,60" stroke="#3a4a38" stroke-width="3.4" stroke-linecap="round"/>`,
      // grosse moustache en volutes
      blob('M70,80 C60,74 46,74 40,84 C36,92 44,98 50,92 C46,90 46,84 52,84 C58,84 64,88 70,86 C76,88 82,84 88,84 C94,84 94,90 90,92 C96,98 104,92 100,84 C94,74 80,74 70,80 Z', '#ffffff', { ink: '#5a6a58', w: 1.5 }),
      `<path d="M62,96 Q70,100 78,96" fill="none" stroke="#3a4a38" stroke-width="2.2" stroke-linecap="round"/>`);
  } else {
    push(P, 'face',
      `<circle cx="58" cy="70" r="4" fill="#3a2420"/><circle cx="82" cy="70" r="4" fill="#3a2420"/><circle cx="59.4" cy="68.6" r="1.4" fill="#fff"/><circle cx="83.4" cy="68.6" r="1.4" fill="#fff"/>`,
      `<ellipse cx="50" cy="80" rx="6" ry="3.4" fill="#ff9a9a" opacity="0.6"/><ellipse cx="90" cy="80" rx="6" ry="3.4" fill="#ff9a9a" opacity="0.6"/>`,
      // un début de moustache (prépubère) et une petite bouche boudeuse
      `<path d="M62,82 q4,-3 8,0 q4,-3 8,0" fill="none" stroke="#c89a8a" stroke-width="2" stroke-linecap="round"/>`,
      `<path d="M64,90 Q70,86 76,90" fill="none" stroke="#5a3028" stroke-width="2.2" stroke-linecap="round"/>`);
  }
  return assemble(kind, P, part);
}

/** Gargrouille : petite créature encapuchonnée en cape brune, masque d'os à cornes, bâton à crâne et lanterne. */
function gargrouilleSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  push(P, 'back', `<ellipse cx="70" cy="150" rx="28" ry="6" fill="#000" opacity="0.2"/>`,
    // bâton (derrière) : crâne au sommet, lanterne accrochée
    `<path d="M100,148 L106,22" stroke="#3a2a18" stroke-width="6" stroke-linecap="round"/><path d="M100,148 L106,22" stroke="#7a5a34" stroke-width="3" stroke-linecap="round"/>`,
    blob(ellipse(106, 20, 9, 8), '#ece2c4', { ink: '#5a4a2a', w: 1.4 }), `<circle cx="103" cy="19" r="2" fill="#2a1a10"/><circle cx="109" cy="19" r="2" fill="#2a1a10"/>`,
    `<path d="M106,30 Q120,30 122,40" fill="none" stroke="#2a2a2a" stroke-width="2"/>`, halo(uid('h'), 122, 54, 18, '#ffe88a'),
    blob('M114,42 L130,42 L132,64 L112,64 Z', '#ffe27a', { ink: '#3a3020', w: 1.6 }), `<path d="M112,42 L132,42 M122,42 L122,64 M111,64 L133,64" stroke="#3a3020" stroke-width="2.2"/>`);
  push(P, 'body',
    // cape brune voûtée, ourlet effiloché, pieds griffus
    blob('M40,140 C34,112 36,82 50,66 C62,54 84,54 94,68 C106,84 108,112 102,140 L94,134 L88,142 L80,134 L72,142 L64,134 L56,142 L48,134 Z', '#7a4a2a', { ink: '#2e1a0c' }),
    `<path d="M54,80 Q60,110 56,136 M86,80 Q84,110 90,136" fill="none" stroke="#5a3418" stroke-width="2.4" opacity="0.8"/>`,
    blob('M52,140 l-6,8 l8,-2 l4,4 l4,-8 Z', '#a8946a', { ink: '#3a2a12', w: 1.2 }), blob('M84,140 l-2,8 l6,-2 l6,4 l0,-8 Z', '#a8946a', { ink: '#3a2a12', w: 1.2 }),
    // main sur le bâton
    blob(ellipse(98, 100, 7, 6), '#a8946a', { ink: '#3a2a12', w: 1.3 }));
  push(P, 'face',
    // capuche et masque d'os à cornes
    blob('M42,76 C40,50 54,36 70,36 C88,36 100,50 98,76 C90,70 50,70 42,76 Z', '#6a3e22', { ink: '#2e1a0c' }),
    blob('M50,72 C50,56 60,50 70,50 C82,50 90,58 90,72 C88,86 78,92 70,92 C60,92 52,86 50,72 Z', '#ece2c4', { ink: '#5a4a2a' }),
    blob('M54,56 C44,48 40,36 46,28 C48,38 54,44 62,50 Z', '#d8ccaa', { ink: '#5a4a2a', w: 1.4 }), blob('M86,56 C96,48 100,36 94,28 C92,38 86,44 78,50 Z', '#d8ccaa', { ink: '#5a4a2a', w: 1.4 }),
    blob(ellipse(62, 70, 6, 7), '#2a1a10', { ink: '#1a0e06', w: 1.2, rim: false }), blob(ellipse(80, 70, 6, 7), '#2a1a10', { ink: '#1a0e06', w: 1.2, rim: false }),
    `<circle cx="62" cy="71" r="2.4" fill="#ffd84a"/><circle cx="80" cy="71" r="2.4" fill="#ffd84a"/>`,
    `<path d="M62,84 l2,4 l2,-4 l2,4 l2,-4 l2,4 l2,-4 l2,4" fill="none" stroke="#5a4a2a" stroke-width="1.4"/>`);
  return assemble('gargrouille', P, part);
}


/** Ashi-magari (invocation du Boostache) : petite silhouette pâle, bras écartés, dans une bulle d'esprit verte. */
function ashimagariSvg(part?: CritterPart): string {
  begin();
  const P: Parts = {};
  push(P, 'back', `<ellipse cx="70" cy="150" rx="18" ry="4" fill="#000" opacity="0.15"/>`, halo(uid('h'), 70, 92, 50, '#a8ff9a'),
    `<circle cx="70" cy="92" r="40" fill="#c8ffc0" opacity="0.28" stroke="#7ad87a" stroke-width="2"/>`);
  push(P, 'body',
    blob('M62,82 L52,72 Q48,68 52,66 L66,76 L74,76 L88,66 Q92,68 88,72 L78,82 L78,100 L86,118 Q86,122 82,120 L72,104 L68,104 L58,120 Q54,122 54,118 L62,100 Z', '#f4e2b0', { ink: '#8a6a3a', w: 1.4 }));
  push(P, 'face', blob(ellipse(70, 64, 12, 12), '#f4e2b0', { ink: '#8a6a3a', w: 1.4 }),
    `<circle cx="66" cy="64" r="1.8" fill="#4a3a20"/><circle cx="74" cy="64" r="1.8" fill="#4a3a20"/><path d="M67,70 Q70,68 73,70" fill="none" stroke="#4a3a20" stroke-width="1.4"/>`);
  return assemble('ashimagari', P, part);
}


const KWAK_PAL: Record<string, { body: string; back: string; beak: string; spot: string }> = {
  Vent: { body: '#f4eee0', back: '#c4a0e4', beak: '#f2c63a', spot: '#d878d8' },
  Flamme: { body: '#f2a636', back: '#8a5628', beak: '#f8e040', spot: '#e8862a' },
  Glace: { body: '#acd4f6', back: '#5a7cbc', beak: '#9c8ccc', spot: '#c8e2ff' },
  Terre: { body: '#92c83c', back: '#5a8a26', beak: '#ec9a3a', spot: '#8a5a2a' },
  Kwakwa: { body: '#f6f2ea', back: '#5a3a22', beak: '#dcb440', spot: '#f0a030' },
};
function kwakSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const bwak = kind.startsWith('bwak'), boss = kind === 'kwakwa', kwakere = kind.startsWith('kwakere');
  const C = KWAK_PAL[boss ? 'Kwakwa' : kind.replace(/^(kwakere|kwak|bwak)/, '')];
  const ink = shade(C.back, -0.6);
  const legs = (arr: Parts, k: CritterPart, x: number, y0: number) => push(arr, k,
    `<path d="M${x},${y0} L${x - 2},146" stroke="#3a2410" stroke-width="5" stroke-linecap="round"/><path d="M${x},${y0} L${x - 2},146" stroke="#f0a83a" stroke-width="3" stroke-linecap="round"/>`,
    `<path d="M${x - 2},146 l-9,2 M${x - 2},146 l-3,4 M${x - 2},146 l6,2" stroke="#3a2410" stroke-width="2.6" stroke-linecap="round"/><path d="M${x - 2},146 l-9,2 M${x - 2},146 l-3,4 M${x - 2},146 l6,2" stroke="#f8e2c0" stroke-width="1.2" stroke-linecap="round"/>`);
  if (bwak) {
    // Bwak : boule de plumes, grosses plumes dressées, queue en éventail, gros œil, bec en coin
    push(P, 'wingB', blob('M96,100 Q132,70 138,40 Q120,56 112,60 Q124,40 122,24 Q104,52 92,82 Z', C.back, { ink }));
    legs(P, 'legB', 86, 128); legs(P, 'legF', 66, 128);
    push(P, 'body', blob(fuzz(76, 104, 34, 30), C.body, { ink, hl: [0.3, 0.22] }), blob(ellipse(70, 116, 20, 14), shade(C.body, 0.18), { ink: shade(C.body, -0.3), w: 1, rim: false }));
    push(P, 'crest', blob('M70,76 Q62,50 68,36 Q76,52 78,74 Z', C.back, { ink }), blob('M80,76 Q82,48 92,38 Q94,58 86,78 Z', C.back, { ink }),
      eyeChibi(60, 94, 14, 15, '#1a1a1a', { look: [-0.4, 0.1] }), `<path d="M46,80 Q58,74 72,80" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`,
      blob('M48,104 L22,112 L48,120 Q56,112 48,104 Z', C.beak, { ink: shade(C.beak, -0.55) }), `<path d="M24,112 L50,112" stroke="${shade(C.beak, -0.55)}" stroke-width="1.4"/>`);
    push(P, 'wingF', blob('M86,104 Q100,108 98,126 Q88,128 80,118 Z', shade(C.body, -0.08), { ink }));
    return assemble(kind, P, part);
  }
  // Kwak / Kwakere / Kwakwa : grand oiseau penché en avant, bec crochu, antenne(s) à ocelle, plumes de queue
  push(P, 'wingB', blob('M96,90 Q126,82 134,62 Q130,84 136,92 Q126,100 112,108 Z', C.back, { ink }), blob('M100,96 Q124,98 132,112 Q114,114 98,108 Z', shade(C.back, -0.1), { ink }));
  legs(P, 'legB', 88, 120); legs(P, 'legF', 70, 120);
  push(P, 'body', blob('M54,98 Q56,74 82,72 Q108,72 112,96 Q110,122 84,124 Q60,124 54,98 Z', C.back, { ink, hl: [0.3, 0.22] }),
    blob('M54,98 Q58,82 72,80 Q82,96 78,122 Q60,122 54,98 Z', C.body, { ink, w: 1.3, rim: false }));
  const antennas = boss ? [[-30, 0], [-18, -6], [-6, -10], [6, -10], [18, -6], [30, 0]] : kwakere ? [[-14, 0], [0, -6], [14, 0]] : [[-4, -4]];
  push(P, 'crest', ...antennas.map(([dx, dy]) => {
    const tx = 56 + dx, ty = 18 + dy + Math.abs(dx) * 0.4;
    return `<path d="M60,58 Q${(60 + tx) / 2 - 4},${(58 + ty) / 2} ${tx},${ty}" fill="none" stroke="#2a1a0a" stroke-width="2.2"/>` + blob(ellipse(tx, ty - 5, 4.5, 6.5), C.spot, { ink: shade(C.spot, -0.55), w: 1.2 }) + `<circle cx="${tx}" cy="${ty - 5}" r="1.8" fill="#fff"/>`;
  }),
    blob(`M64,62 L${kwakere || boss ? 92 : 86},46 L76,66 L${kwakere || boss ? 96 : 88},62 L74,74 Z`, C.back, { ink }),
    boss ? blob('M44,80 Q58,92 78,84 Q74,98 58,98 Q44,94 44,80 Z', '#ffffff', { ink: '#5a4a3a', w: 1.3 }) : '',
    blob(ellipse(58, 72, 18, 16), C.body, { ink }),
    blob('M44,62 Q30,58 22,70 Q16,82 24,94 Q26,84 34,80 Q44,80 48,74 Z', C.beak, { ink: shade(C.beak, -0.55) }),
    `<path d="M24,94 Q30,86 40,80" fill="none" stroke="${shade(C.beak, -0.55)}" stroke-width="1.6"/>`,
    eyeChibi(56, 68, 7.5, 8.5, '#1a1a1a', { look: [-0.4, 0.1], lid: kwakere || boss ? 1 : 0, skin: C.body }));
  push(P, 'wingF', blob('M80,90 Q98,92 102,110 Q90,114 78,104 Z', shade(C.back, 0.08), { ink }));
  return assemble(kind, P, part);
}


/**
 * Wabbits (d'après les illustrations DofusDB) : lapins accroupis tournés vers la gauche, longues oreilles pointues, dents de lapin.
 * Wabbit crème aux peintures vertes ; Black Wabbit bleu nuit au bandana rouge ; Tiwabbits ronds (brun, noir au bandana, bleu au bâton-carotte) ;
 * Wo Wabbit gros et crème, cible verte sur le ventre ; Grand Pa Wabbit vieux, grande barbe et bâton à gemme ; Wa Wabbit : énorme couronne-coussin orange.
 */
const WAB: Record<string, { fur: string; belly: string; tip: string; ink: string }> = {
  wabbit: { fur: '#efd9a0', belly: '#f8ecc8', tip: '#c8a05a', ink: '#5a4220' },
  blackWabbit: { fur: '#2e4a50', belly: '#46666a', tip: '#efd9a0', ink: '#101e22' },
  tiwabbit: { fur: '#b8621e', belly: '#d8843a', tip: '#7a3a10', ink: '#3a1a06' },
  blackTiwabbit: { fur: '#22383c', belly: '#34504e', tip: '#efd9a0', ink: '#0c1618' },
  tiwabbitKiafin: { fur: '#7ac8e8', belly: '#b0e2f4', tip: '#4a98c0', ink: '#1a4a60' },
  woWabbit: { fur: '#efd9a0', belly: '#f8ecc8', tip: '#c8a05a', ink: '#5a4220' },
  grandPaWabbit: { fur: '#2e4a50', belly: '#46666a', tip: '#efd9a0', ink: '#101e22' },
  waWabbit: { fur: '#3a4648', belly: '#56666a', tip: '#efd9a0', ink: '#141c1e' },
  blackWoWabbit: { fur: '#2e4a50', belly: '#46666a', tip: '#efd9a0', ink: '#101e22' },
  blancPaWabbit: { fur: '#f2eee4', belly: '#fffdf6', tip: '#f08a2a', ink: '#6a5a4a' },
};

function wabbitSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const C = WAB[kind], ink = C.ink;
  const round = kind === 'tiwabbit' || kind === 'blackTiwabbit' || kind === 'tiwabbitKiafin';
  const foot = (x: number, y: number, w = 12) => blob(`M${x + w * 0.6},${y - 4} Q${x - w},${y - 6} ${x - w},${y + 1} Q${x - w * 0.4},${y + 5} ${x + w * 0.6},${y + 4} Z`, kind === 'wabbit' || kind === 'woWabbit' ? C.belly : C.tip, { ink, w: 1.5 });
  const fist = (x: number, y: number, r = 5.5) => blob(circle(x, y, r), C.fur, { ink, w: 1.4 });
  const teeth = (x: number, y: number, s = 1) => `<path d="M${x},${y} h${9 * s} v${8 * s} h${-9 * s} Z" fill="#fffdf2" stroke="${ink}" stroke-width="1.3"/><path d="M${x + 4.5 * s},${y} v${8 * s}" stroke="${ink}" stroke-width="1"/>`;
  const earPath = (x0: number, y0: number, tx: number, ty: number, x1: number, y1: number) => `M${x0},${y0} Q${tx - 8},${(y0 + ty) / 2} ${tx},${ty} Q${tx + 8},${(y1 + ty) / 2} ${x1},${y1} Z`;
  const ear = (x0: number, y0: number, tx: number, ty: number, x1: number, y1: number) => {
    const c = uid('k');
    const d = earPath(x0, y0, tx, ty, x1, y1);
    return `<clipPath id="${c}"><path d="${d}"/></clipPath>` + blob(d, C.fur, { ink }) +
      `<path d="M${tx - 20},${ty - 4} L${tx + 20},${ty - 4} L${tx + 20},${ty + (y0 - ty) * 0.32} L${tx - 20},${ty + (y0 - ty) * 0.42} Z" fill="${C.tip}" clip-path="url(#${c})"/>` +
      `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${LW}" stroke-linejoin="round"/>`;
  };
  const bandana = (y: number, x0: number, x1: number, h = 10) => blob(`M${x0},${y} Q${(x0 + x1) / 2},${y - 5} ${x1},${y - 2} L${x1},${y + h - 2} Q${(x0 + x1) / 2},${y + h - 6} ${x0},${y + h} Z`, '#d8261e', { ink: '#5a0a08', w: 1.5 }) +
    blob(`M${x1 - 2},${y} Q${x1 + 18},${y - 14} ${x1 + 34},${y - 10} Q${x1 + 22},${y - 2} ${x1 + 30},${y + 6} Q${x1 + 14},${y + 4} ${x1 - 2},${y + h - 2} Z`, '#c01e18', { ink: '#5a0a08', w: 1.5 });

  if (round) {
    // Tiwabbits : petite boule sur pattes courtes, oreilles en triangles
    push(P, 'legB', tube('M82,136 L86,144', 6, C.fur, ink), foot(90, 148, 9));
    push(P, 'legF', tube('M60,136 L58,144', 6, C.fur, ink), foot(58, 148, 9));
    push(P, 'leafB', tube('M98,112 Q108,118 104,126', 5, C.fur, ink), fist(104, 128, 4.5));
    if (kind === 'tiwabbitKiafin') push(P, 'leafB', tube('M104,128 Q112,70 128,26', 3.2, '#7a5a3a', '#2a1a0a'), `<path d="M128,28 Q134,48 132,66" fill="none" stroke="#5a4a3a" stroke-width="1.4"/>`,
      blob('M124,66 Q134,62 140,70 Q140,92 132,110 Q124,92 124,66 Z', '#f08a1a', { ink: '#6a3008' }), `<path d="M128,76 l6,2 M127,86 l7,1 M128,96 l5,1" stroke="#b85a10" stroke-width="1.4"/>`,
      blob('M130,66 Q124,52 128,44 Q132,54 132,64 Z', '#5ab83a', { ink: '#1a5a10', w: 1.2 }), blob('M131,66 Q138,52 140,48 Q138,60 134,66 Z', '#4aa02a', { ink: '#1a5a10', w: 1.2 }));
    push(P, 'stem', blob(spiky(104, 128, 7, 7, 8, 0.3), '#fffdf2', { ink, w: 1.2 }), blob(ellipse(72, 112, 34, 32), C.fur, { ink, hl: [0.3, 0.22] }), blob(ellipse(64, 124, 18, 14), C.belly, { ink, w: 1.1, rim: false }));
    push(P, 'head',
      ear(52, 88, kind === 'tiwabbit' ? 46 : 50, kind === 'tiwabbit' ? 56 : 62, 66, 84), ear(78, 84, kind === 'tiwabbit' ? 90 : 88, kind === 'tiwabbit' ? 50 : 58, 96, 92));
    if (kind === 'tiwabbit') push(P, 'head', `<circle cx="52" cy="102" r="4.5" fill="#1a0e06"/><circle cx="70" cy="100" r="4" fill="#1a0e06"/><circle cx="51" cy="100" r="1.4" fill="#fff"/><circle cx="69" cy="98" r="1.3" fill="#fff"/>`,
      blob(ellipse(56, 110, 4.5, 3), '#5a2a0a', { w: 1, rim: false }), teeth(51, 114, 1.1),
      `<path d="M40,108 l-12,-3 M40,112 l-12,2 M72,108 l12,-3 M72,112 l12,2" stroke="${ink}" stroke-width="1.2" stroke-linecap="round"/>`);
    else if (kind === 'blackTiwabbit') push(P, 'head', bandana(94, 40, 98, 14),
      `<path d="M46,102 L58,104 M64,103 L76,100" stroke="#f8e04a" stroke-width="3" stroke-linecap="round"/>`, teeth(52, 116, 1.1));
    else push(P, 'head', eyeChibi(52, 98, 6, 7, '#1a1a1a', { look: [-0.3, 0.2] }), eyeChibi(68, 96, 5.5, 6.5, '#1a1a1a', { look: [-0.3, 0.2] }),
      blob('M44,110 Q58,104 70,110 Q70,128 56,130 Q44,126 44,110 Z', '#3a0a0a', { ink, w: 1.4, rim: false }), blob(ellipse(57, 124, 8, 4), '#e8505a', { w: 0, rim: false }), teeth(52, 108, 0.9));
    push(P, 'leafF', tube('M48,114 Q38,122 42,130', 5, C.fur, ink), fist(42, 131, 4.5));
    return assemble(kind, P, part);
  }

  const fat = kind === 'woWabbit' || kind === 'blackWoWabbit', old = kind === 'grandPaWabbit' || kind === 'blancPaWabbit', king = kind === 'waWabbit';
  // jambes accroupies
  push(P, 'legB', tube('M86,124 Q100,132 92,144', 9, C.fur, ink), foot(96, 148));
  push(P, 'legF', tube('M60,126 Q50,134 56,144', 9, C.fur, ink), foot(56, 148));
  // bras arrière
  push(P, 'leafB', tube('M96,102 Q110,110 104,122', 6.5, C.fur, ink), fist(104, 124));
  // queue en houppe et corps
  const tail = king ? blob('M96,124 Q132,128 134,104 Q136,90 124,92 Q128,108 112,114 Q102,116 96,118 Z', C.tip, { ink }) : blob(spiky(104, 122, 9, 9, 9, 0.35), '#fffdf2', { ink, w: 1.3 });
  push(P, 'stem', tail);
  if (kind === 'blackWoWabbit') push(P, 'stem', blob(ellipse(72, 112, 32, 28), C.fur, { ink, hl: [0.3, 0.2] }),
    blob(ellipse(66, 118, 17, 15), C.belly, { ink, w: 1.2, rim: false }), `<path d="M58,118 q0,-8 8,-8 q8,0 8,8 q0,6 -6,6 q-5,0 -5,-4 q0,-3 3,-3" fill="none" stroke="${C.tip}" stroke-width="2.6" stroke-linecap="round"/>`);
  else if (fat) push(P, 'stem', blob(ellipse(72, 112, 32, 28), C.fur, { ink, hl: [0.3, 0.2] }),
    blob(ellipse(66, 116, 17, 16), '#9aa83a', { ink: '#3a4a10' }), blob(ellipse(66, 116, 11, 10), '#d8dc8a', { ink: '#3a4a10', w: 1.2, rim: false }), blob(ellipse(66, 116, 5, 4.5), '#7a8a2a', { ink: '#3a4a10', w: 1, rim: false }));
  else push(P, 'stem', blob(ellipse(74, 112, 24, 22), C.fur, { ink, hl: [0.3, 0.2] }), blob(ellipse(66, 116, 12, 13), C.belly, { ink, w: 1.1, rim: false }));
  if (kind === 'wabbit') push(P, 'stem', blob('M50,118 Q74,126 98,116 L98,126 Q74,138 52,130 Z', '#7a8a2a', { ink: '#2a3208' }), blob('M60,128 L66,142 L72,128 Z', '#6a7a22', { ink: '#2a3208', w: 1.2 }));
  if (kind === 'blackWabbit') push(P, 'stem', `<path d="M58,104 l8,4 M62,110 l8,4" stroke="${C.tip}" stroke-width="3" stroke-linecap="round"/>`);
  // tête
  const hx = 62, hy = fat ? 74 : 80;
  const head: string[] = [];
  if (!king) head.push(ear(hx - 10, hy - 14, hx - 18, hy - 66, hx + 2, hy - 18), ear(hx + 6, hy - 18, fat ? hx + 34 : hx + 16, fat ? hy - 52 : hy - 70, hx + 20, hy - 12));
  head.push(blob(ellipse(hx, hy, fat ? 22 : 21, fat ? 19 : 18), C.fur, { ink, hl: [0.3, 0.22] }), blob(ellipse(hx - 9, hy + 7, 11, 8), C.belly, { ink, w: 1.1, rim: false }));
  if (fat) head.push(`<path d="M${hx - 16},${hy - 3} l6,-4 l6,4 M${hx - 2},${hy - 4} l6,-4 l6,4" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    blob(ellipse(hx + 12, hy + 2, 6, 5), '#9aa83a', { ink: '#3a4a10', w: 1.2, rim: false }));
  else if (king) head.push(`<ellipse cx="${hx - 14}" cy="${hy - 2}" rx="5" ry="4" fill="#f8e04a" stroke="${ink}" stroke-width="1.4"/><ellipse cx="${hx + 2}" cy="${hy - 3}" rx="4.5" ry="3.6" fill="#f8e04a" stroke="${ink}" stroke-width="1.4"/>`,
    `<path d="M${hx - 22},${hy - 9} L${hx - 8},${hy - 6} M${hx - 3},${hy - 7} L${hx + 9},${hy - 9}" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`);
  else head.push(eyeChibi(hx - 13, hy - 2, 6, 6.5, old ? '#3a7a8a' : '#3a2a10', { lid: old ? -1 : 1, skin: C.fur, look: [-0.3, 0.15] }),
    eyeChibi(hx + 3, hy - 3, 5, 6, old ? '#3a7a8a' : '#3a2a10', { lid: old ? -1 : 1, skin: C.fur, look: [-0.3, 0.15] }));
  head.push(blob(ellipse(hx - 19, hy + 5, 3.5, 2.6), '#e87a8a', { ink, w: 1, rim: false }));
  if (old || king) {
    // grande barbe blanche
    head.push(blob(`M${hx - 26},${hy + 6} Q${hx - 30},${hy + 30} ${hx - 14},${hy + 44} Q${hx - 6},${hy + 34} ${hx},${hy + 46} Q${hx + 6},${hy + 32} ${hx + 16},${hy + 38} Q${hx + 22},${hy + 20} ${hx + 18},${hy + 6} Q${hx - 4},${hy + 14} ${hx - 26},${hy + 6} Z`, '#f6f2ea', { ink: '#6a6a66' }),
      `<path d="M${hx - 18},${hy + 16} q2,10 -2,20 M${hx - 4},${hy + 18} q2,10 0,22 M${hx + 8},${hy + 16} q2,8 0,16" fill="none" stroke="#b8b4ac" stroke-width="1.4"/>`);
    head.push(`<path d="M${hx - 26},${hy - 10} Q${hx - 16},${hy - 16} ${hx - 6},${hy - 10} M${hx},${hy - 11} Q${hx + 8},${hy - 16} ${hx + 16},${hy - 10}" fill="none" stroke="#f6f2ea" stroke-width="3.4" stroke-linecap="round"/>`);
  } else head.push(teeth(hx - 23, hy + 9, fat ? 1.2 : 1));
  if (kind === 'wabbit') head.push(`<path d="M${hx + 6},${hy + 4} l9,-3 M${hx + 6},${hy + 9} l9,-3" stroke="#6a8a2a" stroke-width="3" stroke-linecap="round"/>`);
  if (kind === 'blackWabbit') head.push(bandana(hy - 14, hx - 20, hx + 18, 9));
  // Black Wo Wabbit : bandeau rouge sur les yeux ; Blanc Pa Wabbit : capuche orange à feuilles
  if (kind === 'blackWoWabbit') head.push(bandana(hy - 9, hx - 24, hx + 20, 11));
  if (kind === 'blancPaWabbit') head.push(blob(`M${hx - 24},${hy - 4} Q${hx - 26},${hy - 28} ${hx},${hy - 30} Q${hx + 24},${hy - 28} ${hx + 22},${hy - 2} Q${hx},${hy - 12} ${hx - 24},${hy - 4} Z`, '#f08a2a', { ink: '#6a2a06' }),
    blob(`M${hx - 4},${hy - 28} Q${hx - 16},${hy - 42} ${hx - 6},${hy - 46} Q${hx},${hy - 38} ${hx - 2},${hy - 28} Z`, '#7ab83a', { ink: '#2a5a10', w: 1.2 }), blob(`M${hx + 2},${hy - 28} Q${hx + 14},${hy - 44} ${hx + 20},${hy - 38} Q${hx + 12},${hy - 32} ${hx + 4},${hy - 26} Z`, '#8ac83a', { ink: '#2a5a10', w: 1.2 }));
  if (king) {
    // couronne-coussin : dôme orange et crème à quartiers, anneau d'or, emblème en V
    const cy = hy - 22;
    const dome = `M${hx - 42},${cy + 6} Q${hx - 44},${cy - 22} ${hx + 4},${cy - 26} Q${hx + 52},${cy - 22} ${hx + 50},${cy + 6} Q${hx + 4},${cy + 16} ${hx - 42},${cy + 6} Z`, dc = uid('d');
    head.push(blob(ellipse(hx + 4, cy + 6, 48, 10), '#d8a020', { ink: '#5a3a08' }), blob(dome, '#f08a2a', { ink: '#6a2a06' }),
      `<clipPath id="${dc}"><path d="${dome}"/></clipPath><g clip-path="url(#${dc})" fill="#fbeccc" opacity="0.95">` +
      [[-30, -14], [4, 6], [36, 26]].map(([a, b]) => `<path d="M${hx + 4},${cy - 30} L${hx + a},${cy + 16} L${hx + b},${cy + 16} Z"/>`).join('') + '</g>',
      `<path d="${dome}" fill="none" stroke="#6a2a06" stroke-width="${LW}"/>`,
      blob(ellipse(hx + 4, cy + 8, 48, 7), '#f0c43a', { ink: '#5a3a08', w: 1.6 }),
      blob(`M${hx - 2},${cy - 24} L${hx - 8},${cy - 40} L${hx + 2},${cy - 32} L${hx + 6},${cy - 42} L${hx + 10},${cy - 32} L${hx + 18},${cy - 40} L${hx + 12},${cy - 24} Z`, '#f0c43a', { ink: '#5a3a08', w: 1.4 }),
      blob(circle(hx + 44, cy + 8, 7), '#f0c43a', { ink: '#5a3a08', w: 1.3 }));
  }
  push(P, 'head', ...head);
  // bras avant (et bâton du Grand Pa Wabbit)
  push(P, 'leafF', tube('M56,102 Q44,110 46,120', 6.5, C.fur, ink), fist(45, 122));
  if (kind === 'blancPaWabbit') push(P, 'leafF', tube('M42,148 L40,30', 3.4, '#8a6a4a', '#2a1a0a'), blob(ellipse(40, 30, 6, 4), '#5a3a1e', { ink: '#2a1a0a', w: 1.2 }),
    blob('M40,28 Q30,18 36,6 Q38,14 42,10 Q48,16 40,28 Z', '#f8a020', { ink: '#8a3a08', w: 1.3 }), blob('M40,26 Q36,18 39,12 Q42,18 43,16 Q44,22 40,26 Z', '#f8e070', { ink: '#8a3a08', w: 0.8, rim: false }), fist(41, 120));
  else if (old) push(P, 'leafF', tube('M42,148 L40,30', 3.4, '#8a6a4a', '#2a1a0a'),
    blob('M40,32 Q30,22 34,10 Q40,4 46,10 Q50,22 40,32 Z', '#c8ccd4', { ink: '#3a4250', w: 1.4 }),
    blob(ellipse(40, 18, 5, 7), '#2a8ae8', { ink: '#0a2a5a', w: 1.2 }), spark(38, 15, 3), fist(41, 120));
  return assemble(kind, P, part);
}


/**
 * Blops (d'après les illustrations DofusDB) : gelées translucides en forme de goutte, fleur posée sur la tête, petits yeux sur le côté.
 * Coco jaune-vert, Indigo turquoise, Griotte rouge, Reinette vert menthe ; les Royaux portent une couronne de feuilles et un dôme à boule d'or.
 * Gloutoblop : deux gelées l'une sur l'autre ; Blopignon : gelée en champignon ; Tronkoblop : tronc fin couronné de petites gelées.
 */
const BLOP_PAL: Record<string, { top: string; bot: string; ink: string }> = {
  Coco: { top: '#f4f8b8', bot: '#e8d040', ink: '#8aa010' },
  Indigo: { top: '#d4f4f4', bot: '#1e8a88', ink: '#0e5a5a' },
  Griotte: { top: '#fbd8d0', bot: '#e02a10', ink: '#9a1a08' },
  Reinette: { top: '#d8f8e4', bot: '#2aa858', ink: '#106a30' },
};

function blopGel(d: string, C: { top: string; bot: string; ink: string }, hl: [number, number, number, number]): string {
  const g = uid('bg');
  const [hx, hy, hrx, hry] = hl;
  return `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.top}"/><stop offset="0.55" stop-color="${C.top}"/><stop offset="1" stop-color="${C.bot}"/></linearGradient>` +
    `<path d="${d}" fill="url(#${g})" fill-opacity="0.9" stroke="${C.ink}" stroke-width="${LW}" stroke-linejoin="round"/>` +
    `<ellipse cx="${hx}" cy="${hy}" rx="${hrx}" ry="${hry}" fill="#ffffff" opacity="0.6" transform="rotate(-20 ${hx} ${hy})"/>` +
    `<circle cx="${hx + hrx * 2.6}" cy="${hy + hry * 3.4}" r="${hrx * 0.55}" fill="#ffffff" opacity="0.35"/>`;
}
/** Fleur de nénuphar posée sur la tête des Blops : pétales clairs, cœur jaune, feuilles. */
const blopFlower = (x: number, y: number, s: number, petal: string, leaf: string) =>
  `<g transform="translate(${x},${y}) scale(${s})">` +
  blob('M-16,4 L-8,-6 L0,2 L8,-6 L16,4 Q0,10 -16,4 Z', leaf, { ink: '#3a5a10', w: 1.3, rim: false }) +
  [-10, 0, 10].map((a) => blob(`M${a - 5},2 Q${a},-16 ${a + 5},2 Z`, petal, { ink: '#8a6a3a', w: 1.2, rim: false })).join('') +
  blob(circle(0, -2, 5.5), '#f8c838', { ink: '#8a5a10', w: 1.2 }) + '</g>';
/** Couronne des Blops Royaux : feuilles en éventail, dôme orange et violet, boule d'or, anneau doré. */
const blopCrown = (x: number, y: number) =>
  [-30, -20, -10, 0, 10, 20, 30].map((dx) => blob(`M${x + dx - 7},${y + 2} Q${x + dx * 1.35},${y - 26 - (30 - Math.abs(dx)) * 0.35} ${x + dx + 7},${y + 2} Z`, Math.abs(dx) % 20 ? '#5aa82a' : '#7ac83a', { ink: '#1e4a10', w: 1.3, rim: false })).join('') +
  blob(`M${x - 22},${y - 2} Q${x},${y - 34} ${x + 22},${y - 2} Z`, '#f0901a', { ink: '#6a3008', w: 1.4 }) +
  blob(`M${x - 22},${y - 2} Q${x - 18},${y - 22} ${x - 6},${y - 26} Q${x - 8},${y - 10} ${x - 10},${y - 2} Z`, '#7a6ad8', { ink: '#2a1a6a', w: 1.2, rim: false }) +
  blob(`M${x + 22},${y - 2} Q${x + 18},${y - 22} ${x + 6},${y - 26} Q${x + 8},${y - 10} ${x + 10},${y - 2} Z`, '#7a6ad8', { ink: '#2a1a6a', w: 1.2, rim: false }) +
  blob(circle(x, y - 32, 6), '#f8d040', { ink: '#8a5a10', w: 1.3 }) +
  blob(ellipse(x, y + 2, 34, 6), '#f0c43a', { ink: '#6a4a08', w: 1.5 });
const blopEye = (cx: number, cy: number, r: number, ink: string) =>
  `<circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="${ink}" opacity="0.5"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" opacity="0.9"/>` +
  `<circle cx="${cx - r * 0.25}" cy="${cy + r * 0.15}" r="${r * 0.42}" fill="#101418"/><circle cx="${cx - r * 0.4}" cy="${cy - r * 0.1}" r="${r * 0.15}" fill="#fff"/>`;

function blopSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const royal = kind.endsWith('Royal');
  const col = kind === 'gloutoblop' ? 'Indigo' : kind === 'blopignon' ? 'Reinette' : (kind.replace(/^blop/, '').replace(/Royal$/, '') || 'Coco');
  const C = BLOP_PAL[col] ?? BLOP_PAL.Coco;
  const shadow = (rx: number) => `<ellipse cx="70" cy="146" rx="${rx}" ry="${rx * 0.2}" fill="#1a2a20" opacity="0.28"/>`;
  if (kind === 'tronkoblop') {
    // tronc fin et noueux, couronné de trois petites gelées (rouge, verte, bleue) et d'une fleur
    push(P, 'back', shadow(22), blob('M60,148 L56,140 L66,142 L70,134 L74,142 L84,140 L80,148 Z', '#4a6a1a', { ink: '#1e3008', w: 1.2, rim: false }));
    push(P, 'body', tube('M70,146 Q64,110 72,84 Q76,66 70,52', 8, '#8a6a3a', '#3a2410'),
      `<path d="M68,120 l6,-4 M70,96 l-6,-3 M72,74 l5,-3" stroke="#3a2410" stroke-width="1.6"/>`);
    push(P, 'face', blopGel(ellipse(56, 46, 12, 10), BLOP_PAL.Griotte, [52, 42, 3, 2]), blopGel(ellipse(84, 44, 12, 10), BLOP_PAL.Reinette, [80, 40, 3, 2]),
      blopGel(ellipse(70, 54, 12, 9), BLOP_PAL.Indigo, [66, 50, 3, 2]), blopFlower(70, 34, 0.8, '#f8f0e0', '#c8a040'), blopEye(64, 54, 3, BLOP_PAL.Indigo.ink), blopEye(74, 54, 3, BLOP_PAL.Indigo.ink));
    return assemble(kind, P, part);
  }
  if (kind === 'blopignon') {
    // champignon de gelée : grand chapeau menthe, petit pied turquoise avec deux yeux, fleur et caillou
    push(P, 'back', shadow(40));
    push(P, 'body', blopGel('M52,146 Q48,124 56,112 L86,112 Q94,124 90,146 Q70,152 52,146 Z', BLOP_PAL.Indigo, [62, 120, 5, 3]),
      blopGel('M20,112 Q16,66 70,60 Q124,66 120,112 Q96,104 70,106 Q44,104 20,112 Z', C, [48, 74, 12, 6]));
    push(P, 'face', blopEye(70, 130, 3.4, BLOP_PAL.Indigo.ink), blopEye(80, 130, 3.4, BLOP_PAL.Indigo.ink),
      blob('M28,84 L44,78 L40,94 Z', '#c8a878', { ink: '#5a4020', w: 1.3 }), blopFlower(74, 62, 1.1, '#e8f0ff', '#c8a878'));
    return assemble(kind, P, part);
  }
  if (kind === 'gloutoblop') {
    // deux gelées turquoise l'une sur l'autre, la plus petite penchée, fleurs collées dessus
    push(P, 'back', shadow(50));
    push(P, 'body', blopGel('M22,118 Q20,82 62,80 Q112,80 118,114 Q120,148 70,148 Q24,148 22,118 Z', C, [44, 94, 12, 7]),
      blopGel('M26,72 Q30,44 62,42 Q92,44 96,66 Q92,86 62,88 Q32,88 26,72 Z', C, [42, 54, 9, 5]));
    push(P, 'face', `<path d="M44,64 q6,-3 12,0 M66,62 q6,-3 12,0" fill="none" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<ellipse cx="46" cy="72" rx="5" ry="2.6" fill="#f0a0a8" opacity="0.6"/>`,
      blopFlower(60, 42, 0.8, '#e8f0ff', '#c8a878'), blopFlower(40, 112, 0.7, '#f8f0c8', '#5aa82a'), blopFlower(96, 130, 0.6, '#f8d0a0', '#c8a040'));
    return assemble(kind, P, part);
  }
  // Blop et Blop Royal : goutte (plus large et plus basse pour les Royaux)
  push(P, 'back', shadow(royal ? 50 : 42));
  push(P, 'body', royal
    ? blopGel('M22,140 Q16,108 30,92 Q46,80 70,80 Q94,80 110,92 Q124,108 118,140 Q70,152 22,140 Z', C, [42, 98, 11, 6])
    : blopGel('M28,140 Q20,104 36,72 Q50,48 70,48 Q90,48 104,72 Q120,104 112,140 Q70,152 28,140 Z', C, [46, 72, 10, 7]));
  if (royal) push(P, 'face', `<path d="M42,110 q6,-3 12,0" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/><path d="M64,108 q6,-4 12,0" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/>`,
    `<ellipse cx="44" cy="120" rx="6" ry="3" fill="#f0a0a8" opacity="0.65"/><ellipse cx="80" cy="118" rx="5" ry="2.6" fill="#f0a0a8" opacity="0.5"/>`, blopCrown(70, 84));
  else push(P, 'face', blopEye(46, 80, 6, C.ink), blopEye(62, 78, 5, C.ink),
    `<ellipse cx="48" cy="96" rx="6" ry="3" fill="#f0a0a8" opacity="0.6"/>`,
    blopFlower(70, 50, 1.45, col === 'Griotte' ? '#c8d0f8' : '#f8f0e0', col === 'Indigo' ? '#5aa82a' : '#e8902a'));
  return assemble(kind, P, part);
}

/**
 * Craqueleurs (Plaines Rocheuses, Pitons Rocheux ; d'après les illustrations DofusDB, retournées pour regarder à gauche) :
 * golems de pierres taillées à facettes, mousse verte dans les creux.
 * - Craqueleur : golem gris-kaki voûté, bras énormes jusqu'au sol, petite tête basse au bec orange. Le Légendaire : le même, plus moussu.
 * - Craquelourd : golem doré en haut, vert olive en bas, cristaux sur les épaules.
 * - Craqueleur des Plaines : bête dorée accroupie hérissée d'éclats ; Kirboule l'Érodé (même illustration DofusDB) : gris, éclats usés.
 * - Craqueboule : petit, grosse tête ronde à pousse en vrille, gros yeux, bec orange.
 * - Craquelope : cyclope jaune pâle à pousse verte, un bras levé en bloc.
 * - Élémenterre : carapace de plaques beiges en pointe, visage cube noir à deux gros yeux.
 */
/** Pierre à facettes : bandes en diagonale claire / pleine / sombre (lumière en haut à gauche). */
function stone(pts: string, col: string, ink: string, w = LW): string {
  const g = uid('st');
  return `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(col, 0.32)}"/><stop offset="0.36" stop-color="${shade(col, 0.32)}"/>` +
    `<stop offset="0.36" stop-color="${col}"/><stop offset="0.72" stop-color="${col}"/><stop offset="0.72" stop-color="${shade(col, -0.2)}"/><stop offset="1" stop-color="${shade(col, -0.2)}"/></linearGradient>` +
    `<polygon points="${pts}" fill="url(#${g})" stroke="${ink}" stroke-width="${w}" stroke-linejoin="round"/>`;
}
/** Éclat pointu (pique de pierre ou cristal) : base en (x, y), pointe à la distance len dans la direction a (degrés). */
function shard(x: number, y: number, len: number, a: number, wd: number, col: string, ink: string): string {
  const r = (a * Math.PI) / 180, px = -Math.sin(r), py = Math.cos(r);
  return stone(`${f(x + px * wd)},${f(y + py * wd)} ${f(x + Math.cos(r) * len)},${f(y + Math.sin(r) * len)} ${f(x - px * wd)},${f(y - py * wd)}`, col, ink, 1.3);
}
/** Plaque de mousse dans un creux de pierre. */
const moss = (x: number, y: number, s = 1) =>
  `<g stroke="#3a6a14" stroke-width="0.9"><ellipse cx="${x - 4 * s}" cy="${y + 1 * s}" rx="${5 * s}" ry="${2.6 * s}" fill="#5a9a22"/>` +
  `<ellipse cx="${x + 3 * s}" cy="${y - 0.5 * s}" rx="${4.4 * s}" ry="${2.4 * s}" fill="#7ab82a"/><ellipse cx="${x}" cy="${y + 2.6 * s}" rx="${3 * s}" ry="${1.6 * s}" fill="#8ac83a"/></g>` +
  `<circle cx="${x + 2 * s}" cy="${y - 1 * s}" r="${1.1 * s}" fill="#c8e86a"/><circle cx="${x - 5 * s}" cy="${y}" r="${0.9 * s}" fill="#b8e05a"/>`;
/** Pousse en vrille (Craqueboule, Craquelope). */
const sprout = (x: number, y: number, h: number, col: string) => {
  const d = `M${x},${y} Q${x - 4},${y - h * 0.6} ${x + 2},${y - h} Q${x + 10},${y - h - 6} ${x + 10},${y - h + 4} Q${x + 8},${y - h + 8} ${x + 4},${y - h + 4}`;
  return `<path d="${d}" fill="none" stroke="#2e5a10" stroke-width="5.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`;
};
/** Petit œil rond sous un sourcil de pierre (tilt : sens du froncement). */
const angryEye = (cx: number, cy: number, r: number, ink: string, tilt = 1) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fdfbe8" stroke="${ink}" stroke-width="1.2"/><circle cx="${cx - r * 0.3}" cy="${cy + r * 0.15}" r="${r * 0.5}" fill="#141410"/>` +
  `<path d="M${cx - r - 2},${cy - r + 1 - tilt * 2} L${cx + r + 2},${cy - r + 1 + tilt * 2}" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;

const CRAQ: Record<string, { rock: string; low: string; ink: string; moss: number }> = {
  craqueleur: { rock: '#b8b48e', low: '#a6a27c', ink: '#45432a', moss: 1 },
  craqueleurLegendaire: { rock: '#b0b48a', low: '#9ea678', ink: '#3e4428', moss: 2 },
  craquelourd: { rock: '#d8c058', low: '#6e7a2e', ink: '#3a3a10', moss: 1 },
  craqueleurPlaines: { rock: '#cbb862', low: '#9a8a3a', ink: '#4a3e10', moss: 0 },
  kirboule: { rock: '#aaa48a', low: '#857e62', ink: '#3a3626', moss: 1 },
  craqueboule: { rock: '#aeae90', low: '#8a9070', ink: '#383a28', moss: 1 },
  craquelope: { rock: '#dccb7c', low: '#b8a250', ink: '#4a4014', moss: 0 },
  elementerre: { rock: '#d2b896', low: '#a8906e', ink: '#4a3a28', moss: 0 },
};

function craqSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const C = CRAQ[kind], ink = C.ink, R = C.rock, L = C.low;
  const shadow = (rx: number) => `<ellipse cx="70" cy="150" rx="${rx}" ry="${rx * 0.18}" fill="#1a1a10" opacity="0.28"/>`;

  if (kind === 'elementerre') {
    // carapace de plaques en pointe, visage cube noir à deux gros yeux, cailloux autour
    push(P, 'back', shadow(46), stone('22,146 30,138 38,146', L, ink, 1.2), stone('104,148 112,140 120,148', L, ink, 1.2));
    push(P, 'body', stone('30,140 26,104 40,84 56,96 52,140', R, ink), stone('110,140 116,106 102,82 86,96 90,140', L, ink),
      stone('48,92 66,8 82,54 92,92 70,100', R, ink), stone('40,84 54,66 66,74 58,98', shade(R, 0.08), ink), stone('86,96 92,70 104,82 100,100', R, ink));
    push(P, 'face', stone('40,100 92,96 100,132 46,140', '#2a2a2e', '#0a0a0e'),
      `<circle cx="56" cy="116" r="11" fill="#fdfdf6" stroke="#0a0a0e" stroke-width="1.4"/><circle cx="83" cy="113" r="10" fill="#fdfdf6" stroke="#0a0a0e" stroke-width="1.4"/>`,
      `<circle cx="52" cy="118" r="5.4" fill="#0e0e10"/><circle cx="79" cy="115" r="5" fill="#0e0e10"/><circle cx="50" cy="116" r="1.6" fill="#fff"/><circle cx="77" cy="113" r="1.5" fill="#fff"/>`,
      stone('36,138 50,132 62,142 44,148', R, ink, 1.4), stone('82,140 96,130 106,140 94,148', L, ink, 1.4));
    return assemble(kind, P, part);
  }

  if (kind === 'craqueleurPlaines' || kind === 'kirboule') {
    // bête accroupie sur ses quatre membres, dos hérissé d'éclats (usés pour Kirboule)
    const k = kind === 'kirboule' ? 0.55 : 1;
    push(P, 'legB', stone('92,116 108,112 112,136 106,150 90,150 88,132', L, ink), shard(108, 132, 12 * k + 4, -20, 4, R, ink));
    push(P, 'legF', stone('64,118 80,118 80,138 76,150 60,150 58,134', L, ink));
    push(P, 'leafB', stone('96,78 116,82 124,108 118,128 104,124 98,100', L, ink), stone('104,124 124,122 128,140 122,150 102,150 100,138', R, ink), shard(120, 96, 14 * k + 4, -10, 4, R, ink));
    push(P, 'stem', ...[[-150, 60, 52], [-120, 72, 46], [-95, 86, 44], [-70, 100, 52], [-40, 108, 66], [-15, 110, 86]].map(([a, x, y]) => shard(x, y, 30 * k + 8, a, 7, R, ink)),
      stone('44,92 60,58 90,48 112,62 116,96 100,122 62,124', R, ink), stone('58,100 92,96 100,120 64,122', L, ink),
      shard(82, 70, 16 * k + 6, -100, 5, shade(R, 0.1), ink), shard(96, 84, 14 * k + 6, -60, 5, shade(R, 0.1), ink));
    if (kind === 'kirboule') push(P, 'stem', moss(74, 60, 1.1), moss(104, 98, 0.9));
    push(P, 'head', shard(46, 70, 22 * k + 6, -110, 6, R, ink), shard(58, 66, 20 * k + 6, -70, 6, R, ink), shard(34, 82, 16 * k + 6, -160, 5, R, ink),
      stone('22,90 32,72 56,66 70,80 66,104 44,112 26,106', R, ink), stone('22,96 44,100 46,112 28,108', L, ink, 1.4),
      angryEye(36, 86, 4.2, ink, 1.3), angryEye(52, 84, 3.8, ink, -1.3), `<path d="M26,100 l6,-3 l5,4 l6,-3" fill="none" stroke="${ink}" stroke-width="1.6"/>`);
    push(P, 'leafF', stone('48,90 66,92 70,116 60,128 46,124 42,104', L, ink), stone('30,124 58,120 64,138 58,150 34,150 28,138', R, ink), shard(40, 128, 12 * k + 4, -150, 4, R, ink));
    return assemble(kind, P, part);
  }

  if (kind === 'craqueboule') {
    // petit : grosse tête ronde de pierre à pousse en vrille, gros yeux ronds, bec orange ; corps et pattes en blocs
    push(P, 'legB', stone('76,124 90,124 92,142 96,150 76,150 74,138', L, ink));
    push(P, 'legF', stone('52,124 66,124 66,142 64,150 46,150 48,138', L, ink));
    push(P, 'leafB', stone('88,98 104,100 108,120 96,124 88,114', L, ink));
    push(P, 'stem', stone('50,96 92,94 94,124 52,128', R, ink), moss(72, 108, 0.9));
    push(P, 'head', sprout(72, 40, 26, '#a8d83a'), stone('34,62 50,40 86,36 104,56 104,82 88,98 54,100 36,88', R, ink), stone('36,84 52,94 46,100 34,92', L, ink, 1.4),
      eyeChibi(52, 70, 11, 12, '#1a1a14', { look: [-0.3, 0.1] }), eyeChibi(76, 68, 9, 10.5, '#1a1a14', { look: [-0.3, 0.1] }),
      stone('34,82 48,80 44,90', '#f08a1a', '#6a3008', 1.4));
    push(P, 'leafF', stone('40,100 56,100 54,120 40,122 36,112', R, ink));
    return assemble(kind, P, part);
  }

  if (kind === 'craquelope') {
    // cyclope : corps mince jaune pâle, un grand œil, pousse verte ; bras arrière levé en gros bloc, bras avant en bloc
    push(P, 'legB', stone('76,118 90,118 92,142 96,150 78,150 74,136', L, ink));
    push(P, 'legF', stone('54,120 68,120 68,142 64,150 48,150 50,136', L, ink));
    push(P, 'leafB', stone('88,72 98,66 104,78 96,84', L, ink), stone('92,44 118,36 128,58 118,78 98,74 90,58', R, ink));
    push(P, 'stem', stone('52,76 88,72 92,122 54,124 48,100', R, ink), stone('52,108 90,104 92,122 54,124', L, ink, 1.4));
    push(P, 'head', sprout(70, 52, 30, '#a8d83a'), stone('46,58 62,46 86,50 92,72 76,84 52,80', R, ink),
      eyeChibi(64, 64, 10, 11, '#3a2a10', { look: [-0.35, 0.05] }));
    push(P, 'leafF', stone('44,84 58,82 56,98 46,100', L, ink), stone('22,92 50,88 54,112 40,122 20,114', R, ink));
    return assemble(kind, P, part);
  }

  // Craqueleur, Craqueleur Légendaire, Craquelourd : golem voûté, bras énormes jusqu'au sol, petite tête basse devant
  const lourd = kind === 'craquelourd', legend = kind === 'craqueleurLegendaire';
  push(P, 'legB', stone('84,118 100,116 104,140 102,150 84,150 80,136', L, ink));
  push(P, 'legF', stone('56,120 72,120 74,140 72,150 52,150 50,136', L, ink));
  push(P, 'leafB', stone('92,58 118,52 128,78 122,104 102,104 94,84', R, ink), stone('104,100 124,100 128,124 116,130 104,126', L, ink),
    stone('100,124 126,122 132,140 126,150 104,150 98,140', R, ink), moss(112, 64, C.moss > 1 ? 1.2 : 0.9));
  if (lourd) push(P, 'leafB', shard(112, 56, 26, -80, 7, '#e8d060', ink), shard(122, 66, 20, -40, 6, '#e8d060', ink));
  push(P, 'stem', stone('40,72 52,46 82,34 108,42 116,68 108,100 90,124 58,124 40,104', R, ink), stone('52,96 92,92 96,118 84,126 58,124', L, ink),
    stone('62,52 84,44 98,58 88,72 66,70', shade(R, 0.1), ink, 1.4), moss(92, 50), moss(70, 110, 0.8));
  if (lourd) push(P, 'stem', shard(78, 40, 30, -95, 8, '#e8d060', ink), shard(96, 44, 24, -60, 7, '#e8d060', ink), shard(64, 44, 22, -125, 6, '#e8d060', ink));
  if (legend) push(P, 'stem', moss(52, 66, 1.2), moss(104, 84, 1.1), moss(80, 64, 0.9));
  push(P, 'head', stone('28,80 38,66 60,62 68,78 64,98 44,104 28,96', R, ink), stone('30,72 40,64 62,62 64,72 34,76', shade(R, -0.12), ink, 1.4),
    angryEye(40, 80, 3.6, ink, 1), angryEye(54, 78, 3.4, ink, -1), stone('30,88 42,86 40,96 30,94', '#f08a1a', '#6a3008', 1.4));
  if (legend) push(P, 'head', moss(54, 64, 1));
  push(P, 'leafF', stone('42,56 68,52 74,80 66,100 46,100 38,80', R, ink), stone('38,96 62,96 62,120 50,126 36,120', L, ink),
    stone('24,120 54,118 60,138 54,150 30,150 22,138', R, ink), moss(56, 62, C.moss > 1 ? 1.2 : 0.9));
  if (lourd) push(P, 'leafF', shard(54, 54, 22, -100, 6, '#e8d060', ink));
  if (legend) push(P, 'leafF', moss(40, 132, 1));
  return assemble(kind, P, part);
}


/**
 * Pirates de l'Arche d'Otomaï et de la Cale (d'après les illustrations DofusDB, retournées pour regarder à gauche) :
 * - Sparo : pirate enfoncé dans un tonneau vert cerclé de fer, transpercé de lames et de flèches, bandana rouge, lunettes rondes.
 * - Barbroussa : énorme tricorne gris à tête de mort qui cache la tête (deux yeux rouges), maillot rayé, ceinture rouge, deux sabres.
 * - Le Flib : grande crinière orange en pointes, long nez, assis dans une caisse de bois, une longue lame dans le dos.
 * - Gourlo le Terrible : capitaine au visage vert, casque à cornes, long manteau rouge et or, jambe de bois, canon sur l'épaule.
 * - Tonneau Pirate (invocation de Gourlo ; DofusDB lui donne l'illustration de Sparo) : le tonneau seul.
 * - Boomba, Nakunbra, Canondorf : squelettes pirates (bombe et bandana rouge ; grand sabre et bandana blanc ; canon sur roues).
 */
const BONE = '#f2ead2', BONE_INK = '#5a4a30';

function pirateSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const ink = '#2a1c12';
  const boot = (x: number, y: number) => blob(`M${x + 7},${y - 9} L${x + 7},${y + 3} L${x - 13},${y + 3} Q${x - 14},${y - 4} ${x - 5},${y - 5} L${x - 5},${y - 9} Z`, '#6a3e1e', { ink, w: 1.5 });
  const pegLeg = (x: number, y0: number, y1: number) => tube(`M${x},${y0} L${x - 2},${y1}`, 5, '#a8743a', ink);
  const bone = (d: string, w = 4.6) => tube(d, w, BONE, BONE_INK);
  const hand = (x: number, y: number, col = BONE) => blob(circle(x, y, 4.6), col, { ink: col === BONE ? BONE_INK : ink, w: 1.3 });
  const sabre = (x: number, y: number, len: number, a: number) => {
    const r = (a * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
    const tx = x + c * len, ty = y + s * len, nx = -s, ny = c;
    return blob(`M${f(x + nx * 3)},${f(y + ny * 3)} Q${f(x + c * len * 0.6 + nx * 10)},${f(y + s * len * 0.6 + ny * 10)} ${f(tx)},${f(ty)} Q${f(x + c * len * 0.5 - nx * 2)},${f(y + s * len * 0.5 - ny * 2)} ${f(x - nx * 3)},${f(y - ny * 3)} Z`, '#dfe4ea', { ink: '#3a4048', w: 1.4 }) +
      blob(`M${f(x + nx * 7)},${f(y + ny * 7)} L${f(x - nx * 7)},${f(y - ny * 7)} L${f(x - c * 4 - nx * 5)},${f(y - s * 4 - ny * 5)} L${f(x - c * 4 + nx * 5)},${f(y - s * 4 + ny * 5)} Z`, '#e8b83a', { ink: '#6a4a08', w: 1.2, rim: false }) +
      tube(`M${f(x - c * 4)},${f(y - s * 4)} L${f(x - c * 13)},${f(y - s * 13)}`, 3.4, '#5a3a1e', ink);
  };
  /** Crâne de squelette pirate (orbites, nez, dents), bandana noué derrière (à droite). */
  const skull = (cx: number, cy: number, r: number, band: string | null, eyes = '#1a1010') =>
    blob(`M${cx - r},${cy} Q${cx - r},${cy - r * 1.05} ${cx},${cy - r * 1.05} Q${cx + r},${cy - r * 1.05} ${cx + r},${cy} Q${cx + r * 0.9},${cy + r * 0.7} ${cx + r * 0.4},${cy + r * 0.85} L${cx - r * 0.5},${cy + r * 0.85} Q${cx - r * 0.95},${cy + r * 0.6} ${cx - r},${cy} Z`, BONE, { ink: BONE_INK }) +
    `<ellipse cx="${cx - r * 0.42}" cy="${cy}" rx="${r * 0.26}" ry="${r * 0.3}" fill="${eyes}"/><ellipse cx="${cx + r * 0.18}" cy="${cy - r * 0.04}" rx="${r * 0.24}" ry="${r * 0.3}" fill="${eyes}"/>` +
    `<circle cx="${cx - r * 0.45}" cy="${cy - r * 0.05}" r="${r * 0.08}" fill="#ff6a4a"/><circle cx="${cx + r * 0.15}" cy="${cy - r * 0.08}" r="${r * 0.08}" fill="#ff6a4a"/>` +
    `<path d="M${cx - r * 0.2},${cy + r * 0.32} l${r * 0.1},-${r * 0.16} l${r * 0.1},${r * 0.16}" fill="none" stroke="${BONE_INK}" stroke-width="1.4"/>` +
    `<path d="M${cx - r * 0.55},${cy + r * 0.62} h${r * 0.9} M${cx - r * 0.35},${cy + r * 0.5} v${r * 0.3} M${cx - r * 0.1},${cy + r * 0.5} v${r * 0.3} M${cx + r * 0.15},${cy + r * 0.5} v${r * 0.3}" stroke="${BONE_INK}" stroke-width="1.2"/>` +
    (band ? blob(`M${cx - r * 1.04},${cy - r * 0.2} Q${cx - r * 0.9},${cy - r * 1.3} ${cx},${cy - r * 1.3} Q${cx + r * 1.0},${cy - r * 1.3} ${cx + r * 1.06},${cy - r * 0.3} Q${cx},${cy - r * 0.62} ${cx - r * 1.04},${cy - r * 0.2} Z`, band, { ink: shade(band, -0.6), w: 1.4 }) +
      blob(`M${cx + r * 0.9},${cy - r * 0.5} Q${cx + r * 1.7},${cy - r * 1.1} ${cx + r * 2.1},${cy - r * 0.5} Q${cx + r * 1.6},${cy - r * 0.3} ${cx + r * 1.9},${cy + r * 0.2} Q${cx + r * 1.3},${cy} ${cx + r * 0.95},${cy - r * 0.2} Z`, shade(band, -0.08), { ink: shade(band, -0.6), w: 1.3 }) : '');
  const ribs = (x: number, y: number) => `<path d="M${x - 9},${y} q9,-4 18,0 M${x - 9},${y + 6} q9,-4 18,0 M${x - 8},${y + 12} q8,-3 16,0" fill="none" stroke="${BONE_INK}" stroke-width="2"/>` + tube(`M${x},${y - 6} L${x},${y + 16}`, 3, BONE, BONE_INK);
  const bomb = (x: number, y: number, r: number, mark = false) =>
    blob(circle(x, y, r), '#2a2a30', { ink: '#0a0a0e', w: 1.5 }) + `<path d="M${x + r * 0.4},${y - r * 0.9} q4,-8 10,-6" fill="none" stroke="#8a6a3a" stroke-width="2.2"/>` + spark(x + r * 0.4 + 10, y - r * 0.9 - 6, 4) +
    (mark ? `<circle cx="${x}" cy="${y - 1}" r="${r * 0.38}" fill="${BONE}"/><circle cx="${x - r * 0.14}" cy="${y - 2}" r="${r * 0.1}" fill="#2a2a30"/><circle cx="${x + r * 0.14}" cy="${y - 2}" r="${r * 0.1}" fill="#2a2a30"/>` : '');
  /** Tonneau vert cerclé de fer (Sparo, Tonneau Pirate). */
  const barrel = (cx: number, cy: number, rx: number, ry: number) => {
    const c = uid('k');
    const d = `M${cx - rx * 0.86},${cy - ry} Q${cx - rx * 1.12},${cy} ${cx - rx * 0.86},${cy + ry} L${cx + rx * 0.86},${cy + ry} Q${cx + rx * 1.12},${cy} ${cx + rx * 0.86},${cy - ry} Z`;
    return `<clipPath id="${c}"><path d="${d}"/></clipPath>` + blob(d, '#7a8a3a', { ink }) +
      `<g clip-path="url(#${c})" stroke="#4a5a1e" stroke-width="1.4">${[-0.55, -0.2, 0.15, 0.5].map((k) => `<path d="M${cx + rx * k},${cy - ry} Q${cx + rx * k * 1.25},${cy} ${cx + rx * k},${cy + ry}"/>`).join('')}</g>` +
      [-0.62, 0.62].map((k) => `<path d="M${cx - rx * 1.02},${cy + ry * k} Q${cx},${cy + ry * k + 4} ${cx + rx * 1.02},${cy + ry * k}" fill="none" stroke="#3a3e44" stroke-width="5" clip-path="url(#${c})"/><path d="M${cx - rx * 1.02},${cy + ry * k - 1.5} Q${cx},${cy + ry * k + 2.5} ${cx + rx * 1.02},${cy + ry * k - 1.5}" fill="none" stroke="#a8b0b8" stroke-width="1.6" clip-path="url(#${c})"/>`).join('') +
      blob(ellipse(cx, cy - ry, rx * 0.86, ry * 0.16), '#5a6a2a', { ink, w: 1.4, rim: false });
  };
  const arrow = (x0: number, y0: number, x1: number, y1: number) => tube(`M${x0},${y0} L${x1},${y1}`, 2, '#8a5a2a', ink) +
    blob(`M${x1},${y1} l${x1 > x0 ? -6 : 6},-4 l0,8 Z`, '#c8ccd2', { ink: '#3a4048', w: 1, rim: false }) + `<path d="M${x0},${y0} l${x1 > x0 ? 6 : -6},-4 M${x0},${y0} l${x1 > x0 ? 6 : -6},4" stroke="#e8e0c8" stroke-width="2.4"/>`;

  if (kind === 'tonneauPirate') {
    push(P, 'back', `<ellipse cx="70" cy="146" rx="30" ry="6" fill="#1a1208" opacity="0.28"/>`);
    push(P, 'body', barrel(70, 110, 32, 36));
    push(P, 'face', `<circle cx="70" cy="110" r="10" fill="${BONE}" stroke="${BONE_INK}" stroke-width="1.4"/><circle cx="66.5" cy="108" r="2.6" fill="#2a2a30"/><circle cx="73.5" cy="108" r="2.6" fill="#2a2a30"/>` +
      `<path d="M58,124 L82,98 M58,98 L82,124" stroke="${BONE}" stroke-width="3.4" stroke-linecap="round"/><path d="M58,124 L82,98 M58,98 L82,124" stroke="${BONE_INK}" stroke-width="1" stroke-linecap="round" opacity="0.6"/>`);
    return assemble(kind, P, part);
  }

  if (kind === 'sparo') {
    push(P, 'legB', tube('M80,132 L82,142', 6, '#d8b088', ink), boot(86, 148));
    push(P, 'legF', tube('M60,132 L58,142', 6, '#d8b088', ink), boot(60, 148));
    push(P, 'leafB', arrow(118, 92, 96, 102), tube('M100,104 Q110,108 112,116', 4.6, '#e8c0a0', ink), hand(112, 118, '#e8c0a0'));
    push(P, 'stem', barrel(70, 106, 34, 32), sabre(98, 82, 50, 145), arrow(24, 120, 48, 112), sabre(58, 126, 30, 120));
    push(P, 'head', blob(ellipse(68, 70, 18, 16), '#f0c8a0', { ink }),
      `<circle cx="58" cy="70" r="6" fill="#fff" fill-opacity="0.5" stroke="#3a3a3a" stroke-width="1.8"/><circle cx="72" cy="69" r="5.5" fill="#fff" fill-opacity="0.5" stroke="#3a3a3a" stroke-width="1.8"/><path d="M64,70 h2" stroke="#3a3a3a" stroke-width="1.8"/>`,
      `<circle cx="57" cy="71" r="1.8" fill="#1a1010"/><circle cx="71" cy="70" r="1.8" fill="#1a1010"/>`, blob('M50,78 Q52,82 58,82', '#f0c8a0', { ink, w: 1.4, rim: false }),
      blob('M50,66 Q50,48 70,48 Q88,50 86,66 Q70,58 50,66 Z', '#d8301e', { ink: '#5a0a08', w: 1.5 }), blob('M84,58 Q98,52 102,58 Q96,62 100,68 Q90,66 84,64 Z', '#c0281a', { ink: '#5a0a08', w: 1.3 }),
      `<circle cx="66" cy="54" r="2.4" fill="#fff"/><circle cx="74" cy="56" r="2" fill="#fff"/>`);
    push(P, 'leafF', tube('M44,100 Q34,104 32,112', 4.6, '#e8c0a0', ink), hand(32, 114, '#e8c0a0'), sabre(32, 114, 26, 200));
    return assemble(kind, P, part);
  }

  if (kind === 'barbroussa') {
    push(P, 'legB', tube('M80,124 L84,140', 5, '#efe0c8', ink), boot(88, 148));
    push(P, 'legF', tube('M64,124 L60,140', 5, '#efe0c8', ink), boot(62, 148));
    push(P, 'leafB', tube('M90,96 Q104,104 108,116', 4.2, '#efe0c8', ink), hand(108, 118, '#efe0c8'), sabre(108, 118, 34, -20));
    push(P, 'stem', (() => {
      const c = uid('k');
      const d = 'M56,88 Q72,82 90,88 L92,118 Q72,124 54,118 Z';
      return `<clipPath id="${c}"><path d="${d}"/></clipPath>` + blob(d, '#f4f4f8', { ink }) +
        `<g clip-path="url(#${c})">${[92, 100, 108].map((y) => `<rect x="50" y="${y}" width="48" height="4" fill="#3a8ae0"/>`).join('')}</g>` +
        blob('M54,110 Q72,116 92,110 L92,120 Q72,126 54,120 Z', '#d8301e', { ink: '#5a0a08', w: 1.4 });
    })());
    push(P, 'head', blob('M52,90 Q50,78 60,76 Q74,74 84,78 Q92,82 90,92 Q72,96 52,90 Z', '#2a2a30', { ink }),
      `<circle cx="62" cy="86" r="4" fill="#ff3a2a"/><circle cx="76" cy="85" r="4" fill="#ff3a2a"/><circle cx="62" cy="86" r="1.6" fill="#ffd0c0"/><circle cx="76" cy="85" r="1.6" fill="#ffd0c0"/>`,
      blob('M14,72 Q30,64 50,66 Q56,36 72,34 Q92,34 98,62 Q114,58 128,70 Q118,74 104,76 Q72,86 30,78 Q20,78 14,72 Z', '#5a5e66', { ink: '#1a1c20' }),
      blob('M50,66 Q56,40 72,38 Q90,38 96,62 Q74,56 50,66 Z', '#6a6e78', { ink: '#1a1c20', w: 1.4 }),
      `<circle cx="73" cy="52" r="6" fill="${BONE}"/><circle cx="71" cy="51" r="1.6" fill="#2a2a30"/><circle cx="75.5" cy="51" r="1.6" fill="#2a2a30"/><path d="M64,62 L82,52 M64,52 L82,62" stroke="${BONE}" stroke-width="2.6" stroke-linecap="round"/>`);
    push(P, 'leafF', tube('M56,96 Q44,104 40,114', 4.2, '#efe0c8', ink), hand(40, 116, '#efe0c8'), sabre(40, 116, 34, 160));
    return assemble(kind, P, part);
  }

  if (kind === 'leFlib') {
    push(P, 'legB', tube('M84,136 L88,144', 5, '#e8c8a0', ink), blob(ellipse(90, 148, 8, 4), '#e8c8a0', { ink, w: 1.3 }));
    push(P, 'legF', tube('M58,136 L54,144', 5, '#e8c8a0', ink), blob(ellipse(50, 148, 8, 4), '#e8c8a0', { ink, w: 1.3 }));
    push(P, 'leafB', `<path d="M98,24 L104,104" stroke="#3a4048" stroke-width="7" stroke-linecap="round"/><path d="M98,24 L104,104" stroke="#d8dde4" stroke-width="4.4" stroke-linecap="round"/>`,
      blob('M96,98 L112,96 L112,102 L96,104 Z', '#e8b83a', { ink: '#6a4a08', w: 1.2, rim: false }));
    push(P, 'stem', stone('40,100 100,96 104,140 44,142', '#c8904a', '#4a2a10'),
      `<path d="M42,112 L102,108 M42,126 L103,122" stroke="#7a4a1e" stroke-width="2"/><path d="M58,100 L60,142 M84,98 L86,140" stroke="#7a4a1e" stroke-width="1.6"/>`);
    push(P, 'head', blob(spiky(70, 66, 30, 30, 9, 0.75, Math.PI * 0.85, Math.PI * 2.35), '#f0901a', { ink: '#7a3a08', w: 1.5 }),
      blob(spiky(76, 62, 22, 22, 7, 0.6, Math.PI * 1.0, Math.PI * 2.2), '#f8b030', { ink: '#7a3a08', w: 1.2, rim: false }),
      blob('M50,72 Q52,58 66,58 Q80,60 80,76 Q78,94 62,98 Q50,96 50,72 Z', '#f0d0a8', { ink }),
      blob('M52,74 Q38,80 34,90 Q44,90 54,84 Z', '#f0d0a8', { ink, w: 1.4 }),
      `<ellipse cx="58" cy="70" rx="3" ry="3.6" fill="#fff" stroke="${ink}" stroke-width="1"/><ellipse cx="68" cy="70" rx="3" ry="3.6" fill="#fff" stroke="${ink}" stroke-width="1"/><circle cx="59" cy="71" r="1.5" fill="#1a1010"/><circle cx="67" cy="71" r="1.5" fill="#1a1010"/>`,
      `<path d="M54,64 l8,2 M64,66 l8,-2" stroke="#7a3a08" stroke-width="2.4" stroke-linecap="round"/><path d="M52,90 q6,3 12,0" fill="none" stroke="${ink}" stroke-width="1.6"/>`);
    push(P, 'leafF', tube('M48,100 Q40,104 40,110', 5, '#f0d0a8', ink), hand(40, 112, '#f0d0a8'));
    return assemble(kind, P, part);
  }

  if (kind === 'gourlo') {
    push(P, 'legB', pegLeg(88, 120, 148), blob(ellipse(86, 149, 5, 2.4), '#8a5a2a', { ink, w: 1.1, rim: false }));
    push(P, 'legF', tube('M60,120 L56,138', 9, '#4a5a2a', ink), boot(56, 148));
    push(P, 'leafB', `<g transform="rotate(-38 92 64)">` + blob('M70,52 L142,52 Q146,64 142,76 L70,76 Q64,64 70,52 Z', '#3a3e46', { ink: '#0e1014' }) +
      blob(ellipse(142, 64, 6, 13), '#1a1c20', { ink: '#0e1014', w: 1.4 }) + `<path d="M82,52 v24 M126,52 v24" stroke="#c8a040" stroke-width="3"/></g>`);
    push(P, 'stem', blob('M44,74 Q70,64 100,74 L108,128 Q72,138 38,128 Z', '#c8281e', { ink: '#4a0a08' }),
      blob('M58,76 Q72,72 86,76 L88,120 Q72,124 56,120 Z', '#5a6a2a', { ink }),
      `<path d="M44,74 L38,128 M100,74 L108,128" stroke="#f0c43a" stroke-width="4"/><path d="M56,100 h32" stroke="#3a2410" stroke-width="5"/><rect x="68" y="96" width="9" height="8" rx="1.5" fill="#f0c43a" stroke="#6a4a08"/>`);
    push(P, 'head', blob('M46,62 Q46,38 70,38 Q92,40 92,62 Q90,82 70,86 Q50,84 46,62 Z', '#7aa83a', { ink: '#1e3a08' }),
      blob('M48,70 Q56,94 72,92 Q86,90 90,72 Q78,82 70,80 Q58,80 48,70 Z', '#3a2410', { ink, w: 1.4 }),
      `<ellipse cx="58" cy="60" rx="4" ry="3.4" fill="#fff"/><ellipse cx="72" cy="60" rx="4" ry="3.4" fill="#fff"/><circle cx="57" cy="61" r="2" fill="#1a1010"/><circle cx="71" cy="61" r="2" fill="#1a1010"/>`,
      `<path d="M52,54 l10,3 M66,57 l10,-3" stroke="#1e3a08" stroke-width="2.6" stroke-linecap="round"/><path d="M60,72 l3,4 l3,-4 l3,4" fill="#fff" stroke="${ink}" stroke-width="1"/>`,
      blob('M42,50 Q44,26 70,24 Q96,26 96,50 Q70,42 42,50 Z', '#2a2a30', { ink: '#0a0a0e' }),
      blob('M46,40 Q30,32 28,14 Q40,26 50,32 Z', BONE, { ink: BONE_INK, w: 1.3 }), blob('M92,40 Q108,32 110,14 Q98,26 88,32 Z', BONE, { ink: BONE_INK, w: 1.3 }),
      `<circle cx="70" cy="36" r="5" fill="${BONE}"/><circle cx="68" cy="35" r="1.3" fill="#2a2a30"/><circle cx="72" cy="35" r="1.3" fill="#2a2a30"/>`);
    push(P, 'leafF', tube('M46,82 Q34,96 36,108', 8, '#c8281e', '#4a0a08'), blob(circle(36, 112, 6.5), '#7aa83a', { ink: '#1e3a08', w: 1.4 }), `<path d="M30,104 h12" stroke="#f0c43a" stroke-width="3"/>`);
    return assemble(kind, P, part);
  }

  if (kind === 'canondorf') {
    // squelette derrière un canon noir sur roues (bouche vers la gauche), boulet-tête de mort levé
    push(P, 'legB', blob(circle(92, 138, 13), '#a8743a', { ink }), `<circle cx="92" cy="138" r="4" fill="#5a3a1e"/><path d="M92,126 v24 M80,138 h24" stroke="#5a3a1e" stroke-width="2"/>`);
    push(P, 'legF', blob(circle(52, 140, 12), '#a8743a', { ink }), `<circle cx="52" cy="140" r="4" fill="#5a3a1e"/><path d="M52,129 v22 M41,140 h22" stroke="#5a3a1e" stroke-width="2"/>`);
    push(P, 'head', skull(96, 70, 15, '#d8301e'), ribs(96, 96));
    push(P, 'leafB', bone('M106,94 Q118,82 116,66'), hand(116, 62), bomb(118, 50, 11, true));
    push(P, 'stem', blob('M28,104 Q24,92 36,90 L100,98 Q118,104 114,120 Q110,132 96,132 L36,126 Q24,124 28,104 Z', '#2a2c32', { ink: '#0a0a0e' }),
      blob(ellipse(30, 108, 8, 16), '#1a1c20', { ink: '#0a0a0e', w: 1.6 }), blob(ellipse(30, 108, 4.5, 10), '#050506', { w: 0, rim: false }),
      `<path d="M50,92 v34 M84,96 v34" stroke="#c8a040" stroke-width="3"/>`,
      `<circle cx="68" cy="110" r="8" fill="${BONE}"/><circle cx="65.5" cy="108.5" r="2" fill="#2a2c32"/><circle cx="70.5" cy="108.5" r="2" fill="#2a2c32"/><path d="M58,122 L78,100 M58,100 L78,122" stroke="${BONE}" stroke-width="2.6" stroke-linecap="round" opacity="0.9"/>`);
    push(P, 'leafF', bone('M88,100 Q78,108 80,116', 4), hand(80, 118));
    return assemble(kind, P, part);
  }

  // Boomba (bombe, bandana rouge, gilet jaune) et Nakunbra (grand sabre, bandana blanc, jambe de bois)
  const naku = kind === 'nakunbra';
  push(P, 'legB', bone('M80,118 L84,138'), boot(88, 148));
  push(P, 'legF', naku ? pegLeg(62, 118, 148) : bone('M62,118 L58,138'), naku ? '' : boot(62, 148));
  push(P, 'leafB', bone(naku ? 'M84,86 Q98,92 102,102' : 'M84,86 Q98,96 98,108'), hand(naku ? 102 : 98, naku ? 104 : 110));
  push(P, 'stem', ribs(72, 92), naku ? '' : blob('M58,84 Q72,80 86,84 L86,104 L76,108 L76,90 L68,90 L68,108 L58,104 Z', '#e8b83a', { ink: '#6a4a08', w: 1.4 }),
    blob('M58,108 Q72,112 86,108 L86,118 Q72,122 58,118 Z', '#d8301e', { ink: '#5a0a08', w: 1.4 }), blob('M84,112 L94,128 L86,128 Z', '#c0281a', { ink: '#5a0a08', w: 1.2, rim: false }));
  push(P, 'head', skull(64, 62, 17, naku ? '#f0ece4' : '#d8301e'));
  if (naku) push(P, 'leafF', bone('M60,88 Q48,92 42,84'), hand(40, 82), sabre(40, 82, 62, 220));
  else push(P, 'leafF', bone('M60,88 Q46,96 42,106'), hand(42, 108), bomb(36, 116, 11));
  return assemble(kind, P, part);
}


/**
 * Niveaux 71-80 (d'après les illustrations DofusDB, retournées pour regarder à gauche).
 * Terrier du Wa Wabbit : Wobots (machines de laiton en forme de Wabbit) — Wobot (oreilles-antennes à fourches, masse à pointes),
 * Wa Wobot (chaudière orange à hublot où l'on voit le vieux Wa Wabbit, couvercle vert), Wobot Kiafin (marcheur avec un Tiwabbit Kiafin
 * dans la cabine, lampe en col de cygne), Tiwobot (boule orange sur ressort, tête de Tiwabbit).
 * Cimetière des Mastodontes (Saharach) : Scordion Bleu (scorpion beige et noir), Fennex (fennec aux immenses oreilles), Léolhyène
 * (fauve tacheté à crinière de flammes), Mantiscore (fauve rouge à queue de scorpion), Boulépique (ver à boule d'épines),
 * Ouroboulos (ver des sables dressé).
 */
const BRASS = '#c8a050', BRASS_INK = '#4a3010';
const rivets = (pts: [number, number][]) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#f0d890" stroke="${BRASS_INK}" stroke-width="0.8"/>`).join('');
const mace = (x: number, y: number, r: number) => blob(spiky(x, y, r, r, 8, 0.45), '#5a4a3a', { ink: '#1a1208', w: 1.3 }) + blob(circle(x, y, r * 0.75), '#6a5a48', { ink: '#1a1208', w: 1.2 });
const mechLeg = (x0: number, y0: number, x1: number, y1: number) => tube(`M${x0},${y0} L${x1},${y1}`, 6, BRASS, BRASS_INK) + blob(circle(x0, y0, 4.5), '#8a6a30', { ink: BRASS_INK, w: 1.2 }) +
  blob(`M${x1 - 12},${y1 + 4} L${x1 - 6},${y1 - 4} L${x1 + 8},${y1 - 4} L${x1 + 10},${y1 + 4} Z`, '#8a6a30', { ink: BRASS_INK, w: 1.3 });

function wobotSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  if (kind === 'tiwobot') {
    // boule orange sur un ressort, tête de Tiwabbit marron dedans
    push(P, 'back', `<ellipse cx="70" cy="148" rx="26" ry="5" fill="#1a1208" opacity="0.28"/>`, blob(ellipse(70, 144, 22, 7), '#d88a2a', { ink: '#5a2a06' }));
    push(P, 'body', `<path d="M58,140 ${[0, 1, 2, 3, 4].map((i) => `Q70,${134 - i * 8} 82,${132 - i * 8} Q70,${128 - i * 8} 58,${128 - i * 8}`).join(' ')}" fill="none" stroke="#3a3e44" stroke-width="5"/><path d="M58,140 ${[0, 1, 2, 3, 4].map((i) => `Q70,${134 - i * 8} 82,${132 - i * 8} Q70,${128 - i * 8} 58,${128 - i * 8}`).join(' ')}" fill="none" stroke="#c8ccd2" stroke-width="2.4"/>`,
      blob(ellipse(70, 98, 22, 6), '#5a3a1e', { ink: '#2a1a08' }));
    push(P, 'face', blob('M42,80 Q42,56 70,54 Q98,56 98,80 Q98,96 70,98 Q42,96 42,80 Z', '#f0901a', { ink: '#5a2a06' }), blob(ellipse(70, 62, 26, 7), '#c8761a', { ink: '#5a2a06', w: 1.3, rim: false }),
      blob('M52,60 L46,34 L62,52 Z', '#9a5a2a', { ink: '#3a1a08', w: 1.4 }), blob('M78,52 L92,32 L90,58 Z', '#9a5a2a', { ink: '#3a1a08', w: 1.4 }),
      blob(ellipse(68, 62, 16, 12), '#9a5a2a', { ink: '#3a1a08' }), eyeChibi(62, 60, 4.5, 5, '#1a1008', { look: [-0.3, 0.1] }), eyeChibi(74, 59, 4, 4.6, '#1a1008', { look: [-0.3, 0.1] }));
    return assemble(kind, P, part);
  }
  if (kind === 'wobotKiafin') {
    push(P, 'legB', mechLeg(82, 118, 90, 146));
    push(P, 'legF', mechLeg(60, 118, 54, 146));
    push(P, 'leafB', tube('M92,104 Q112,60 96,28 Q88,16 70,18', 4.5, '#7a5a3a', '#2a1a0a'), blob('M50,14 Q70,4 90,14 Q86,26 70,28 Q54,26 50,14 Z', '#c8762a', { ink: '#4a2a08' }), blob(ellipse(70, 14, 16, 4.5), '#f8c838', { ink: '#8a5a10', w: 1.2, rim: false }));
    push(P, 'stem', blob('M48,96 Q48,86 58,84 L86,84 Q94,86 94,96 L90,120 L52,120 Z', BRASS, { ink: BRASS_INK }), blob(ellipse(71, 86, 24, 6), '#6a5a3a', { ink: BRASS_INK, w: 1.3 }),
      rivets([[56, 100], [86, 100], [56, 112], [86, 112]]));
    push(P, 'head', blob(ellipse(70, 74, 15, 13), '#7ac8e8', { ink: '#1a4a60' }), blob('M60,64 L52,40 L66,58 Z', '#7ac8e8', { ink: '#1a4a60', w: 1.3 }), blob('M74,60 L84,38 L82,62 Z', '#7ac8e8', { ink: '#1a4a60', w: 1.3 }),
      eyeChibi(64, 72, 4, 4.6, '#1a1a1a', { look: [-0.3, 0.2] }), eyeChibi(74, 71, 3.6, 4.2, '#1a1a1a', { look: [-0.3, 0.2] }), `<path d="M60,80 q5,3 10,0" fill="none" stroke="#1a4a60" stroke-width="1.6"/>`);
    push(P, 'leafF', blob(ellipse(46, 102, 8, 7), '#c8d8a0', { ink: '#3a4a20', w: 1.3 }), tube('M50,100 L40,104', 4, BRASS, BRASS_INK));
    return assemble(kind, P, part);
  }
  const wa = kind === 'waWobot';
  push(P, 'legB', mechLeg(86, 120, 94, 146));
  push(P, 'legF', mechLeg(58, 120, 52, 146));
  push(P, 'leafB', tube('M98,90 Q114,98 112,112', 6, BRASS, BRASS_INK), blob(`M106,110 L120,112 L118,124 L106,122 Z`, '#8a6a30', { ink: BRASS_INK, w: 1.3 }));
  if (wa) {
    push(P, 'stem', blob('M38,98 Q36,62 70,58 Q104,62 104,98 Q102,128 70,130 Q38,128 38,98 Z', '#e8781e', { ink: '#5a2406' }),
      blob(ellipse(62, 96, 20, 20), '#3a3e44', { ink: '#141618' }), blob(ellipse(62, 96, 16, 16), '#dfeef4', { ink: '#141618', w: 1.2, alpha: 0.9 }),
      // le vieux Wa Wabbit derrière le hublot
      blob(ellipse(62, 98, 10, 9), '#56666a', { ink: '#141c1e', w: 1.2, rim: false }), `<path d="M54,104 Q62,116 70,104 Q62,108 54,104 Z" fill="#f6f2ea" stroke="#6a6a66" stroke-width="1"/>`,
      `<circle cx="58" cy="96" r="1.8" fill="#f8e04a"/><circle cx="65" cy="96" r="1.6" fill="#f8e04a"/>`, `<path d="M50,84 Q58,80 66,84" fill="none" stroke="#fff" stroke-width="2.4" opacity="0.7"/>`,
      rivets([[44, 80], [96, 80], [44, 116], [96, 116], [86, 98]]));
    push(P, 'head', blob('M42,62 Q44,46 70,44 Q96,46 98,62 Q70,70 42,62 Z', '#8ab83a', { ink: '#2a4a10' }),
      blob(spiky(70, 36, 12, 8, 6, 0.5), '#9ac83a', { ink: '#2a4a10', w: 1.3 }), blob(circle(70, 34, 5), '#c8d84a', { ink: '#2a4a10', w: 1.2 }));
    push(P, 'leafF', tube('M44,92 Q30,98 30,112', 6, BRASS, BRASS_INK), tube('M30,112 L24,124', 2.5, '#3a3e44', '#141618'), mace(22, 130, 9));
    return assemble(kind, P, part);
  }
  // Wobot : corps de laiton, tête de Wabbit en métal à lunettes, oreilles-antennes à fourches
  push(P, 'stem', blob('M48,90 Q50,80 60,80 L88,80 Q96,82 96,92 L92,122 L52,122 Z', BRASS, { ink: BRASS_INK }), blob('M56,96 L88,96 L86,112 L58,112 Z', '#8a6a30', { ink: BRASS_INK, w: 1.3, rim: false }),
    `<circle cx="72" cy="104" r="4" fill="#d82a1e" stroke="#4a0a08" stroke-width="1.2"/>`, rivets([[54, 86], [90, 86], [56, 118], [88, 118]]));
  push(P, 'head', tube('M60,58 L52,14', 2.4, '#5a5e66', '#1a1c20'), tube('M76,56 L84,12', 2.4, '#5a5e66', '#1a1c20'),
    `<path d="M48,16 l4,-8 l4,8 M80,14 l4,-8 l4,8" fill="none" stroke="#1a1c20" stroke-width="2"/>`,
    blob('M48,70 Q46,54 66,52 Q86,54 86,70 Q84,82 66,84 Q48,82 48,70 Z', '#a8844a', { ink: BRASS_INK }),
    `<circle cx="58" cy="68" r="6" fill="#dff4ff" stroke="#3a2a10" stroke-width="2"/><circle cx="72" cy="67" r="5.5" fill="#dff4ff" stroke="#3a2a10" stroke-width="2"/><circle cx="57" cy="69" r="2.2" fill="#1a1a1a"/><circle cx="71" cy="68" r="2" fill="#1a1a1a"/>`,
    `<path d="M50,78 h12" stroke="${BRASS_INK}" stroke-width="2"/>`, rivets([[80, 62], [80, 74]]));
  push(P, 'leafF', tube('M50,90 Q36,96 36,110', 6, BRASS, BRASS_INK), tube('M36,110 L30,122', 2.5, '#3a3e44', '#141618'), mace(28, 128, 9));
  return assemble(kind, P, part);
}

const DESERT: Record<string, { body: string; dark: string; ink: string }> = {
  scordionBleu: { body: '#e0b868', dark: '#2a2a34', ink: '#3a2a10' },
  fennex: { body: '#d8a868', dark: '#6a4a2a', ink: '#3a2410' },
  leolhyene: { body: '#f0a83a', dark: '#a8601a', ink: '#4a2408' },
  mantiscore: { body: '#c0502a', dark: '#6a2412', ink: '#2a0a04' },
  boulepique: { body: '#8a7a4a', dark: '#4a3e22', ink: '#2a2010' },
  ouroboulos: { body: '#e0c890', dark: '#b89a5a', ink: '#4a3a1a' },
};

function desertSvg(kind: CritterKind, part?: CritterPart): string {
  begin();
  const P: Parts = {};
  const C = DESERT[kind], ink = C.ink;
  const seg = (x: number, y: number, r: number, col = C.body) => blob(ellipse(x, y, r, r * 0.86), col, { ink, w: 1.4 });
  const paw = (x: number, y: number) => blob(ellipse(x, y, 7, 4), C.body, { ink, w: 1.3 });
  if (kind === 'mantiscore') {
    // d'après la grande illustration du guide du donjon : petit guerrier en armure rouge (dessous bleu nuit), casque à deux cornes beiges,
    // yeux jaunes ; une immense pince en bouclier devant lui ; queue de scorpion en anneaux qui passe au-dessus de lui et finit en tête à bec noir
    const R = '#d0502a', RD = '#8a2a14', NAVY = '#2e3a4a', BEIGE = '#e8cf9a', ik = '#2a0a04';
    const spot = (x: number, y: number, r = 2.4) => `<ellipse cx="${x}" cy="${y}" rx="${r * 1.3}" ry="${r}" fill="${BEIGE}" stroke="${ik}" stroke-width="0.8"/>`;
    push(P, 'legB', tube('M84,124 L88,140', 8, NAVY, ik), blob('M80,138 L96,136 L98,148 L78,150 Z', R, { ink: ik, w: 1.4 }));
    push(P, 'legF', tube('M62,124 L58,140', 8, NAVY, ik), blob('M50,138 L66,136 L68,148 L48,150 Z', R, { ink: ik, w: 1.4 }), spot(58, 143, 2));
    push(P, 'stem', ...[[96, 104, 10], [108, 88, 11], [116, 70, 12], [114, 50, 13]].map(([x, y, r]) => blob(ellipse(x, y, r, r * 0.9), R, { ink: ik, w: 1.4 }) +
      `<path d="M${x - r * 0.4},${y - r * 0.2} q${r * 0.4},${-r * 0.5} ${r * 0.7},0" fill="none" stroke="${RD}" stroke-width="2"/>` + spot(x + r * 0.7, y - r * 0.5, 1.8)),
      blob('M118,36 Q114,18 90,16 Q66,16 62,30 Q60,42 72,48 Q96,52 112,48 Q120,44 118,36 Z', '#e0702a', { ink: ik }),
      blob('M66,30 Q44,26 26,38 Q46,40 70,44 Z', '#141418', { ink: '#000', w: 1.4 }), `<path d="M30,38 Q48,40 66,40" stroke="#5a5a66" stroke-width="1.2" fill="none"/>`,
      `<path d="M80,26 q8,-8 16,0 M88,34 q8,-6 14,2" fill="none" stroke="${RD}" stroke-width="2.6" stroke-linecap="round"/>`, blob(ellipse(84, 20, 6, 2.6), '#f8b040', { ink: ik, w: 0.8, rim: false }),
      blob('M74,44 L70,52 L80,48 Z', BEIGE, { ink: ik, w: 1 }), blob('M106,48 L112,56 L114,46 Z', BEIGE, { ink: ik, w: 1 }),
      blob('M56,98 Q58,86 72,86 Q90,86 92,100 L90,120 Q74,126 58,120 Z', NAVY, { ink: ik }),
      blob('M54,96 Q60,84 74,84 Q92,86 94,98 L88,104 Q74,98 60,104 Z', R, { ink: ik }), blob('M58,108 L88,108 L86,122 Q72,126 60,122 Z', R, { ink: ik, w: 1.4 }),
      blob('M88,92 L98,82 L96,96 Z', BEIGE, { ink: ik, w: 1.1 }), spot(66, 114), spot(80, 116, 2));
    push(P, 'leafB', tube('M94,102 Q104,108 104,118', 5, NAVY, ik), blob('M100,114 Q114,110 118,122 L108,122 L114,130 Q102,134 98,124 Z', R, { ink: ik, w: 1.4 }));
    push(P, 'head', blob('M46,96 Q44,78 60,74 Q78,72 82,88 Q82,100 72,104 L54,104 Q46,102 46,96 Z', R, { ink: ik }),
      blob('M50,80 Q42,66 50,58 Q54,70 58,76 Z', BEIGE, { ink: ik, w: 1.2 }), blob('M70,74 Q74,58 86,56 Q82,68 78,78 Z', BEIGE, { ink: ik, w: 1.2 }),
      blob('M48,92 L80,90 L78,102 L50,104 Z', '#141418', { ink: '#000', w: 1.2, rim: false }), `<path d="M50,100 l4,-4 l4,4 l4,-4 l4,4 l4,-4 l4,4" fill="none" stroke="#6a7a8a" stroke-width="1.2"/>`,
      `<circle cx="56" cy="93" r="3" fill="#ffe24a"/><circle cx="68" cy="92" r="2.8" fill="#ffe24a"/><circle cx="56" cy="93" r="5" fill="#ffe24a" opacity="0.3"/><circle cx="68" cy="92" r="4.6" fill="#ffe24a" opacity="0.3"/>`);
    push(P, 'leafF', tube('M58,100 Q44,106 40,114', 5, NAVY, ik),
      blob('M24,150 L20,104 Q20,92 28,90 L32,100 L34,84 L44,98 L42,112 L46,150 Z', R, { ink: ik }), blob('M26,96 L30,88 L32,98 Z', RD, { ink: ik, w: 1, rim: false }),
      `<path d="M28,108 L38,108" stroke="${RD}" stroke-width="2"/>`, spot(30, 122), spot(38, 136), spot(32, 144, 2));
    return assemble(kind, P, part);
  }
  if (kind === 'boulepique') {
    // ver brun à segments, boule d'épines au bout de la queue (derrière, à droite)
    push(P, 'back', `<ellipse cx="70" cy="148" rx="44" ry="7" fill="#1a1208" opacity="0.28"/>`, blob(spiky(108, 72, 16, 16, 9, 0.55), '#a8986a', { ink, w: 1.4 }), blob(circle(108, 72, 13), '#c8b88a', { ink, w: 1.3 }));
    push(P, 'body', ...[[104, 96, 9], [100, 114, 11], [90, 128, 13], [74, 136, 14], [56, 134, 15]].map(([x, y, r]) => seg(x, y, r, C.body) + `<path d="M${x - r * 0.5},${y - r * 0.7} l${r * 0.3},${-r * 0.5}" stroke="${C.dark}" stroke-width="3" stroke-linecap="round"/>`));
    push(P, 'face', blob('M24,116 Q22,96 42,92 Q60,92 62,112 Q60,130 42,132 Q26,130 24,116 Z', C.body, { ink }), blob(spiky(46, 98, 16, 8, 5, 0.6, Math.PI * 1.05, Math.PI * 1.95), C.dark, { ink, w: 1.2 }),
      `<circle cx="34" cy="110" r="3.4" fill="#f8c838"/><circle cx="33.5" cy="110" r="1.6" fill="#1a1008"/>`, `<path d="M26,122 q8,4 14,0" fill="none" stroke="${ink}" stroke-width="1.6"/>`);
    return assemble(kind, P, part);
  }
  if (kind === 'ouroboulos') {
    // ver des sables dressé, anneaux beiges, petits yeux bleus
    push(P, 'back', `<ellipse cx="70" cy="148" rx="24" ry="5" fill="#1a1208" opacity="0.28"/>`, blob('M76,146 Q100,146 104,136 Q92,140 80,138 Z', C.dark, { ink, w: 1.3 }));
    push(P, 'body', ...[[72, 136, 13], [70, 120, 12], [68, 104, 12], [66, 88, 11], [64, 72, 11]].map(([x, y, r]) => seg(x, y, r, C.body) + `<path d="M${x - r},${y + 2} q${r},5 ${r * 2},0" fill="none" stroke="${C.dark}" stroke-width="2"/>`));
    push(P, 'face', blob('M48,56 Q48,34 64,32 Q80,34 80,54 Q78,66 64,68 Q50,66 48,56 Z', C.body, { ink }), blob('M52,40 Q64,26 78,40 Q70,36 64,36 Q58,36 52,40 Z', C.dark, { ink, w: 1.2, rim: false }),
      `<ellipse cx="57" cy="50" rx="3.6" ry="4.2" fill="#fff" stroke="${ink}" stroke-width="1"/><ellipse cx="68" cy="49" rx="3.2" ry="4" fill="#fff" stroke="${ink}" stroke-width="1"/><circle cx="56.5" cy="51" r="2" fill="#3a8ae0"/><circle cx="67.5" cy="50" r="1.8" fill="#3a8ae0"/>`);
    return assemble(kind, P, part);
  }
  if (kind === 'scordionBleu') {
    push(P, 'tail', ...[[100, 120, 8], [110, 104, 7.5], [112, 86, 7], [106, 70, 6.5], [94, 60, 6]].map(([x, y, r], i) => seg(x, y, r, i % 2 ? C.body : C.dark)),
      blob('M80,56 Q72,60 74,70 Q82,72 90,62 Q90,52 80,56 Z', C.body, { ink }), blob('M74,66 L64,74 L76,72 Z', C.dark, { ink, w: 1.1, rim: false }));
    push(P, 'legB', ...[86, 96, 104].map((x) => tube(`M${x},126 L${x + 10},144`, 3, C.dark, ink)));
    push(P, 'body', blob('M44,124 Q46,106 70,104 Q98,106 104,124 Q96,138 70,138 Q48,138 44,124 Z', C.body, { ink }), `<path d="M60,106 l-2,30 M74,104 l0,34 M88,106 l2,30" stroke="${C.dark}" stroke-width="3"/>`);
    push(P, 'legF', ...[52, 62, 72].map((x) => tube(`M${x},128 L${x - 10},146`, 3, C.dark, ink)));
    push(P, 'head', blob('M30,122 Q30,110 44,110 Q54,112 54,124 Q50,132 40,132 Q30,130 30,122 Z', C.body, { ink }), `<circle cx="38" cy="118" r="2" fill="#1a1a1a"/><circle cx="44" cy="117" r="1.8" fill="#1a1a1a"/>`);
    push(P, 'horn', tube('M36,118 Q20,108 18,96', 4, C.dark, ink), blob('M8,94 Q8,80 22,84 Q30,90 24,98 L16,96 Z', C.body, { ink }), blob('M8,94 L16,96 L14,102 Z', C.dark, { ink, w: 1.1 }),
      tube('M40,126 Q24,132 16,124', 4, C.dark, ink), blob('M4,122 Q6,110 18,116 Q24,124 18,130 L12,126 Z', C.body, { ink }));
    return assemble(kind, P, part);
  }
  // Fennex, Léolhyène : quadrupèdes
  const fen = kind === 'fennex', leo = kind === 'leolhyene';
  if (fen) push(P, 'tail', tube('M96,112 Q120,104 118,80', 7, C.body, ink), `<path d="M108,108 l6,-4 M116,96 l7,-1 M118,86 l6,1" stroke="${C.dark}" stroke-width="5" stroke-linecap="round"/>`, blob(ellipse(118, 76, 6, 8), '#f8f0e0', { ink, w: 1.3 }));
  if (leo) push(P, 'tail', tube('M98,112 Q118,112 120,96', 5, C.body, ink), blob(spiky(120, 90, 7, 9, 5, 0.6), '#f8d040', { ink, w: 1.2 }));
  const legC = fen ? 3 : 7;
  push(P, 'legB', tube('M88,124 L94,146', legC, C.body, ink), paw(96, 148), tube('M98,122 L106,146', legC, shade(C.body, -0.12), ink), paw(108, 148));
  push(P, 'body', blob(fen ? ellipse(80, 118, 20, 14) : 'M50,118 Q52,96 80,96 Q108,98 108,118 Q106,134 80,134 Q54,134 50,118 Z', C.body, { ink, hl: [0.3, 0.2] }));
  if (leo) push(P, 'body', ...[[70, 108], [84, 104], [94, 116], [76, 122], [62, 120]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="2.8" fill="${C.dark}"/>`));
  push(P, 'legF', tube(`M${fen ? 68 : 62},124 L${fen ? 62 : 56},146`, legC, C.body, ink), paw(fen ? 58 : 52, 148), tube(`M${fen ? 74 : 72},126 L${fen ? 72 : 68},146`, legC, shade(C.body, -0.08), ink), paw(fen ? 68 : 64, 148));
  if (fen) {
    push(P, 'head', blob('M42,104 Q40,86 56,84 Q70,86 70,102 Q68,114 56,116 Q44,114 42,104 Z', C.body, { ink }), blob('M38,108 Q32,106 30,102 Q38,100 44,104 Z', C.body, { ink, w: 1.2 }),
      eyeChibi(50, 98, 6, 7, '#1a1008', { look: [-0.3, 0.1] }), eyeChibi(62, 97, 5, 6.5, '#1a1008', { look: [-0.3, 0.1] }), `<circle cx="30" cy="102" r="1.8" fill="#1a1008"/>`,
      `<path d="M36,104 l-16,-4 M36,107 l-16,2 M38,110 l-14,6" stroke="#e8e0d0" stroke-width="0.9"/>`);
    push(P, 'horn', blob('M48,90 Q28,64 34,40 Q50,58 58,84 Z', C.body, { ink }), blob('M46,86 Q34,66 37,50 Q48,64 54,82 Z', '#f0d0b0', { ink, w: 1, rim: false }),
      blob('M62,86 Q78,58 98,48 Q92,74 70,92 Z', C.body, { ink }), blob('M66,86 Q80,64 92,56 Q88,72 72,88 Z', '#f0d0b0', { ink, w: 1, rim: false }));
    return assemble(kind, P, part);
  }
  push(P, 'head', blob('M30,104 Q28,84 48,80 Q66,80 68,98 Q66,116 48,118 Q32,116 30,104 Z', C.body, { ink }), blob('M28,108 Q20,108 18,102 Q24,96 34,100 Z', shade(C.body, 0.1), { ink, w: 1.3 }),
    `<path d="M36,92 l8,3 M50,94 l8,-3" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="40" cy="98" rx="3.4" ry="3" fill="#f8e870" stroke="${ink}"/><ellipse cx="54" cy="97" rx="3" ry="2.8" fill="#f8e870" stroke="${ink}"/>`,
    `<path d="M20,108 l4,4 l4,-4 l4,4" fill="#fff" stroke="${ink}" stroke-width="1.1"/>`);
  if (leo) push(P, 'body', blob(spiky(54, 92, 26, 24, 9, 0.55, Math.PI * 0.6, Math.PI * 2.0), '#f8b020', { ink: '#8a3a08', w: 1.3 }), blob(spiky(56, 90, 18, 16, 7, 0.45, Math.PI * 0.7, Math.PI * 1.9), '#f8e050', { ink: '#8a3a08', w: 1, rim: false }));
  return assemble(kind, P, part);
}


export const CRITTER_SVG = {
  tofu: tofuSvg, pissenlit: pissenlitSvg, rose: roseSvg, tournesol: tournesolSvg,
  plikplok: (p) => jellySvg('plikplok', p), gloot: (p) => jellySvg('gloot', p), splatch: (p) => jellySvg('splatch', p),
  feuVif: (p) => flameSvg('feuVif', p), feuJoie: (p) => flameSvg('feuJoie', p), feuFurieux: (p) => flameSvg('feuFurieux', p), feuFollet: (p) => flameSvg('feuFollet', p),
  aminite: (p) => aminiteSvg(p),
  ...(Object.fromEntries(Object.keys(PIOU).map((k) => [k, (p?: CritterPart) => piouSvg(k as CritterKind, p)])) as Record<string, (p?: CritterPart) => string>),
  tofuMalade: (p) => tofuMaladeSvg(p),
  arakneMalade: (p) => spiderSvg('arakneMalade', p), araknose: (p) => spiderSvg('araknose', p), arakmute: (p) => spiderSvg('arakmute', p), arakneEgouts: (p) => spiderSvg('arakneEgouts', p),
  ...(Object.fromEntries(Object.keys(BOUFTOU).map((k) => [k, (p?: CritterPart) => bouftouSvg(k as CritterKind, p)])) as Record<string, (p?: CritterPart) => string>),
  prespic: (p) => forestBeastSvg('prespic', p), sanglier: (p) => forestBeastSvg('sanglier', p), ecurouille: (p) => forestBeastSvg('ecurouille', p), milimulou: (p) => forestBeastSvg('milimulou', p),
  ...(Object.fromEntries(DOAS.map((k) => [k, (p?: CritterPart) => doaSvg(k, p)])) as Record<string, (p?: CritterPart) => string>),
  ...(Object.fromEntries(BIPEDS.map((k) => [k, (p?: CritterPart) => bipedSvg(k, p)])) as Record<string, (p?: CritterPart) => string>),
  ...(Object.fromEntries(PICHONS.map((k) => [k, (p?: CritterPart) => pichonSvg(k, p)])) as Record<string, (p?: CritterPart) => string>),
  tournesolSauvage: (p) => astrubPlantSvg('tournesolSauvage', p), roseDemo: (p) => astrubPlantSvg('roseDemo', p), pissenlitDiabo: (p) => astrubPlantSvg('pissenlitDiabo', p),
  epouvanteur: (p) => astrubPlantSvg('epouvanteur', p), gardienne: (p) => astrubPlantSvg('gardienne', p), tournesolAffame: (p) => astrubPlantSvg('tournesolAffame', p),
  ...(Object.fromEntries(Object.keys(LARVE).map((k) => [k, (p?: CritterPart) => larveSvg(k as CritterKind, p)])) as Record<string, (p?: CritterPart) => string>),
  chakrobat: (p) => catSvg('chakrobat', p), tigrimas: (p) => catSvg('tigrimas', p), ronronchon: (p) => catSvg('ronronchon', p),
  rib: (p) => ribSvg(p), kwoan: (p) => kwoanSvg(p),
  boostache: (p) => ghostSvg('boostache', p), boostachePrepubere: (p) => ghostSvg('boostachePrepubere', p), gargrouille: (p) => gargrouilleSvg(p), ashimagari: (p) => ashimagariSvg(p),
  ...(Object.fromEntries(KWAKS.map((k) => [k, (p?: CritterPart) => kwakSvg(k, p)])) as Record<string, (p?: CritterPart) => string>),
  ...(Object.fromEntries(WABBITS.map((k) => [k, (p?: CritterPart) => wabbitSvg(k, p)])) as Record<string, (p?: CritterPart) => string>),
  ...(Object.fromEntries(BLOPS.map((k) => [k, (p?: CritterPart) => blopSvg(k, p)])) as Record<string, (p?: CritterPart) => string>),
  ...(Object.fromEntries(CRAQS.map((k) => [k, (p?: CritterPart) => craqSvg(k, p)])) as Record<string, (p?: CritterPart) => string>),
  ...(Object.fromEntries(PIRATES.map((k) => [k, (p?: CritterPart) => pirateSvg(k, p)])) as Record<string, (p?: CritterPart) => string>),
  ...(Object.fromEntries(WOBOTS.map((k) => [k, (p?: CritterPart) => wobotSvg(k, p)])) as Record<string, (p?: CritterPart) => string>),
  ...(Object.fromEntries(DESERTS.map((k) => [k, (p?: CritterPart) => desertSvg(k, p)])) as Record<string, (p?: CritterPart) => string>),
  ...(Object.fromEntries(SCARAS.map((k) => [k, (p?: CritterPart) => scaraSvg(k, p)])) as Record<string, (p?: CritterPart) => string>),
  ...(Object.fromEntries(TOFUS.map((k) => [k, (p?: CritterPart) => amaknaTofuSvg(k, p)])) as Record<string, (p?: CritterPart) => string>),
  palichon: (p) => sheepSvg('palichon', p), orageux: (p) => sheepSvg('orageux', p), nuageux: (p) => sheepSvg('nuageux', p), bouftor: (p) => sheepSvg('bouftor', p),
} as Record<CritterKind, (part?: CritterPart) => string>;

/** Feu follet seul (piège de la Forêt) : cadre 60 × 70, centre en (30, 44). */
export function wispSvg(col = '#7ff0b0'): string {
  begin();
  return svg(60, 70, '', glowOrb(30, 44, 13, col));
}
