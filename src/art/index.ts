import { chaferSvg } from './chafer';
import { kardorimSvg } from './kardorim';
import { sacrieurSvg, sacrieurSwordSvg } from './sacrieur';

/** Planche de personnages (outil de vérification visuelle). */
export const SHEET: Record<string, () => string> = {
  kardorim: kardorimSvg,
  sacrieur: sacrieurSvg,
  epee: sacrieurSwordSvg,
  chaferDebutant: () => chaferSvg('debutant'),
  chaferFurtif: () => chaferSvg('furtif'),
  chaferPiquier: () => chaferSvg('piquier'),
  sergentChafer: () => chaferSvg('sergent'),
};
