// Simulation d'équilibrage : joue le donjon entier (boss compris) sans affichage, avec plusieurs profils de joueur.
// npx vite-node tools/balance.ts [parties] [boss]   (« boss » : commence directement au boss, PV pleins)
import { autopilotInput } from '../src/game/autopilot';
import { applyCard, drawCards, type Card } from '../src/game/cards';
import { rng } from '../src/iso';
import { STEP, TOTAL_ROOMS, World, type Vec } from '../src/game/world';

type Policy = (w: World, t: number, mem: { lag: Vec; next: number }) => Vec;
const POLICIES: Record<string, Policy> = {
  immobile: () => ({ x: 0, y: 0 }),
  // joueur moyen : réagit avec 0,25 s de retard
  moyen: (w, t, mem) => {
    if (t >= mem.next) { mem.lag = autopilotInput(w); mem.next = t + 0.25; }
    return mem.lag;
  },
  bon: (w) => autopilotInput(w),
};

const runs = Number(process.argv[2] ?? 20);
const BOSS = TOTAL_ROOMS - 1;
const ONLY_BOSS = process.argv[3] === 'boss';
const NO_CARDS = process.argv.includes('sans-cartes');
/** Choix de carte d'un joueur raisonnable : nouveau sort > dégâts > Vitalité > le reste. */
const score = (c: Card) => (c.kind === 'spell' ? 3 : c.kind === 'upgrade' ? (c.up === 'dmg' ? 2 : 1.5) : c.stat === 'vitalite' ? 1.8 : 1);
const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN);
for (const [name, pol] of Object.entries(POLICIES)) {
  const reached: number[] = [], hpAtBoss: number[] = [], roomTimes: number[] = [], bossTimes: number[] = [];
  let wins = 0;
  for (let seed = 1; seed <= runs; seed++) {
    const w = new World(seed);
    w.setPlayBottom(1380);
    w.startRoom(ONLY_BOSS ? BOSS : 0);
    if (ONLY_BOSS) hpAtBoss.push(1);
    const mem = { lag: { x: 0, y: 0 }, next: 0 };
    const cardRnd = rng(seed * 31);
    let t = 0, roomStart = 0;
    while (t < 900) {
      const ev = (w.step(pol(w, t, mem)), w.drain());
      t += STEP;
      if (w.phase === 'dead') break;
      if (ev.some((e) => e.type === 'victory')) { wins++; bossTimes.push(t - roomStart); break; }
      if (w.phase === 'cleared' && name === 'immobile') break; // ne sortira jamais
      if (w.phase === 'exiting') {
        roomTimes.push(t - roomStart);
        if (!NO_CARDS) {
          const cards = drawCards(w, cardRnd);
          applyCard(w, cards.sort((a, b) => score(b) - score(a))[0]);
        }
        w.startRoom(w.roomIndex + 1);
        roomStart = t;
        if (w.roomIndex === BOSS) hpAtBoss.push(w.hero.hp / w.hero.maxHp);
      }
    }
    reached.push(w.roomIndex + 1);
  }
  const sorted = [...reached].sort((a, b) => a - b);
  console.log(
    `${name.padEnd(9)} boss atteint ${hpAtBoss.length}/${runs} (PV ${hpAtBoss.length ? Math.round(100 * avg(hpAtBoss)) + ' %' : '-'}) | boss vaincu ${wins}/${runs}` +
    ` | salle médiane ${sorted[Math.floor(runs / 2)]} | salle ${avg(roomTimes).toFixed(1)} s | boss ${bossTimes.length ? avg(bossTimes).toFixed(1) + ' s' : '-'}`,
  );
}
