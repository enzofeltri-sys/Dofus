// Simulation d'équilibrage : joue le donjon sans affichage avec plusieurs profils de joueur.
// npx vite-node tools/balance.ts [parties]
import { autopilotInput } from '../src/game/autopilot';
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
const COMBAT_ROOMS = TOTAL_ROOMS - 1;
for (const [name, pol] of Object.entries(POLICIES)) {
  const reached: number[] = [], hpEnd: number[] = [], roomTimes: number[] = [];
  for (let seed = 1; seed <= runs; seed++) {
    const w = new World(seed);
    w.setPlayBottom(1380);
    w.startRoom(0);
    const mem = { lag: { x: 0, y: 0 }, next: 0 };
    let t = 0, roomStart = 0;
    while (t < 600) {
      w.step(pol(w, t, mem));
      t += STEP;
      w.drain();
      if (w.phase === 'dead') break;
      if (w.phase === 'cleared' && name === 'immobile') break; // ne sortira jamais
      if (w.phase === 'exiting') {
        roomTimes.push(t - roomStart);
        if (w.roomIndex + 1 >= COMBAT_ROOMS) break;
        w.startRoom(w.roomIndex + 1);
        roomStart = t;
      }
    }
    const done = w.phase === 'exiting' && w.roomIndex + 1 >= COMBAT_ROOMS;
    reached.push(done ? COMBAT_ROOMS + 1 : w.roomIndex + 1);
    if (done) hpEnd.push(w.hero.hp / w.hero.maxHp);
  }
  const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN);
  const sorted = [...reached].sort((a, b) => a - b);
  console.log(
    `${name.padEnd(9)} boss atteint ${hpEnd.length}/${runs} | salle atteinte médiane ${sorted[Math.floor(runs / 2)]} (min ${sorted[0]}) | ` +
    `PV en arrivant au boss ${hpEnd.length ? Math.round(100 * avg(hpEnd)) + ' %' : '-'} | durée moyenne d'une salle ${avg(roomTimes).toFixed(1)} s`,
  );
}
