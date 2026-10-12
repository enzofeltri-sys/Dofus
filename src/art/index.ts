import { chaferSvg } from './chafer';
import { kardoribSvg, kardorimSvg } from './kardorim';
import { sacrieurSvg, sacrieurSwordSvg } from './sacrieur';

/** Planche de personnages (outil de vérification visuelle). */
export const SHEET: Record<string, () => string> = {
  kardorim: () => kardorimSvg(),
  kardorib: () => kardoribSvg(),
  sacrieur: sacrieurSvg,
  epee: sacrieurSwordSvg,
  chaferDebutant: () => chaferSvg('debutant'),
  chaferFurtif: () => chaferSvg('furtif'),
  chaferPiquier: () => chaferSvg('piquier'),
  sergentChafer: () => chaferSvg('sergent'),
};
