// Simulation d'une « carrière » : un nouveau Sacrieur (niveau 1, sans équipement) enchaîne les Cryptes.
// L'XP est gardée même en cas de défaite ; tous les points vont en Force. Sans équipement (sauf `arme=<id>`).
// npx vite-node tools/career.ts [joueurs] [parties max] [arme=<id>] [joueur=moyen|bon]
import { autopilotInput } from '../src/game/autopilot';
import { applyCard, drawCards, type Card } from '../src/game/cards';
import { startingHero } from '../src/game/data/hero';
import { addXp, invest, levelForXp, pointsFree, type Profile } from '../src/game/progression';
import { newProfile } from '../src/game/save';
import { rng } from '../src/iso';
import { STEP, World, type Vec } from '../src/game/world';
import { AREAS } from '../src/game/data/areas';

const players = Number(process.argv[2] ?? 10);
const maxRuns = Number(process.argv[3] ?? 40);
const weaponArg = process.argv.find((a) => a.startsWith('arme='));
const weapon = weaponArg ? Number(weaponArg.slice(5)) : null;
const good = process.argv.includes('joueur=bon');
const areaArg = process.argv.find((a) => a.startsWith('zone='));
const area = AREAS[areaArg ? areaArg.slice(5) : 'crypte'];
const TOTAL_ROOMS = area.rooms;
const score = (c: Card) => (c.kind === 'spell' ? 3 : c.kind === 'upgrade' ? (c.up === 'dmg' ? 2 : 1.5) : c.stat === 'vitalite' ? 1.8 : 1);

const firstWin: number[] = [];
const byRun = new Map<number, { room: number[]; level: number[]; min: number[] }>();
for (let p = 1; p <= players; p++) {
  let prof: Profile = newProfile();
  let won = false;
  for (let r = 1; r <= maxRuns && !won; r++) {
    prof = invest(prof, 'force', pointsFree(prof));
    const w = new World(p * 1000 + r, startingHero(prof, {}, weapon), area);
    w.setPlayBottom(1380);
    w.startRoom(0);
    const mem = { lag: { x: 0, y: 0 } as Vec, next: 0 };
    const cardRnd = rng(p * 77 + r);
    let t = 0;
    while (t < 1200) {
      let input: Vec;
      if (good) input = autopilotInput(w);
      else {
        if (t >= mem.next) { mem.lag = autopilotInput(w); mem.next = t + 0.25; }
        input = mem.lag;
      }
      w.step(input);
      const ev = w.drain();
      t += STEP;
      if (w.phase === 'dead') break;
      if (ev.some((e) => e.type === 'victory')) { won = true; break; }
      if (w.phase === 'exiting') {
        const cards = drawCards(w, cardRnd);
        applyCard(w, cards.sort((a, b) => score(b) - score(a))[0]);
        w.startRoom(w.roomIndex + 1);
      }
    }
    const row = byRun.get(r) ?? { room: [], level: [], min: [] };
    row.room.push(won ? TOTAL_ROOMS + 1 : w.roomIndex + 1);
    row.level.push(levelForXp(prof.xp));
    row.min.push(t / 60);
    byRun.set(r, row);
    prof = addXp(prof, w.stats.xp);
    if (won) firstWin.push(r);
  }
}
const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
console.log(`${area.name} — ${players} joueurs ${good ? 'bons' : 'moyens'}, ${weapon ? `arme ${weapon}` : 'mains nues'}, sans équipement`);
console.log(`partie | niveau au départ | salle atteinte (${TOTAL_ROOMS + 1} = victoire) | durée`);
for (const [r, row] of byRun) {
  if (r > 12 && r % 4) continue;
  console.log(`${String(r).padStart(6)} | ${avg(row.level).toFixed(1).padStart(16)} | ${avg(row.room).toFixed(1).padStart(30)} | ${avg(row.min).toFixed(1)} min  (${row.room.length} joueurs)`);
}
console.log('première victoire :', firstWin.length ? `${firstWin.length}/${players} joueurs, partie n° ${avg(firstWin).toFixed(1)} en moyenne` : 'aucune');
