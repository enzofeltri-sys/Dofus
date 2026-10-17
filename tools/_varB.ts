import { AREAS } from '../src/game/data/areas';
const v = process.argv.find((a) => a.startsWith('var='))!.slice(4);
if (v === 'elite3') AREAS.cour.elite = { ...AREAS.cour.elite!, grade: 3, adds: 3, addGrade: 2 };
if (v === 'moins') AREAS.cour.count = { base: 4, perRoom: 0.6, max: 8 };
if (v === 'noirx1') AREAS.cour.pool = ['bouftou', 'bouftonBlanc', 'bouftonNoir', 'chefBouftou', 'bouftouNoir'];
await import('./career');
