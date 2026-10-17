// Mesure : combien de fois chaque case de sort est lancée pendant une partie (point 1 d'Enzo).
import { autopilotInput } from '../src/game/autopilot';
import { applyCard } from '../src/game/cards';
import { AREAS } from '../src/game/data/areas';
import { startingHero } from '../src/game/data/hero';
import { SPELLS, type SpellId } from '../src/game/data/spells';
import { invest, pointsFree, XP_TABLE } from '../src/game/progression';
import { newProfile } from '../src/game/save';
import { STEP, World } from '../src/game/world';
const sets: [string, number, SpellId[]][] = [
  ['grange', 18, ['absorption', 'supplice', 'attirance', 'mutilation']],
  ['grange', 18, ['supplice', 'absorption', 'stase', 'attirance']],
  ['cour', 30, ['ravage', 'absorption', 'assaut', 'epeeVorace']],
];
for (const [zone, lv, spells] of sets) {
  const count = new Map<string, number>();
  let time = 0;
  for (let seed = 1; seed <= 6; seed++) {
    let prof = { ...newProfile(), xp: XP_TABLE[lv] };
    prof = invest(prof, 'force', pointsFree(prof));
    const w = new World(seed, { ...startingHero(prof, undefined, 44), hp: 99999 }, AREAS[zone]);
    w.setPlayBottom(1380);
    w.startRoom(1);
    spells.forEach((id) => applyCard(w, { kind: 'spell', spell: id }));
    w.drain();
    for (let t = 0; t < 40 && w.phase === 'fight'; t += STEP) {
      w.step(autopilotInput(w));
      time += STEP;
      for (const e of w.drain()) if (e.type === 'cast') count.set(e.spell, (count.get(e.spell) ?? 0) + 1);
    }
  }
  console.log(`${zone} niv ${lv} (${time.toFixed(0)} s de combat) : ` + spells.map((id, i) => `case ${i + 1} ${SPELLS[id].name} (${SPELLS[id].pa} PA, ${SPELLS[id].cooldown.toFixed(1)} s) = ${count.get(id) ?? 0}`).join(' | '));
}
