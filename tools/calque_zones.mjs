// Monstres redessinés sur gabarit, zone par zone (taille relative au Sacrieur, rendu en jeu).
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
await p.goto('http://localhost:5173/?salle=1');
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done') && window.__game, null, { timeout: 60000 });
await p.click('.overlay .btn').catch(() => {});
const shots = (process.argv[2] ?? 'champs:boss,crypte:boss,grange:boss,cour:boss,closBlops:boss,chateauWabbit:boss').split(',');
for (const s of shots) {
  const [id, which] = s.split(':');
  const info = await p.evaluate(async ([id, which]) => {
    const g = window.__game;
    const { AREAS } = await import('/src/game/data/areas.ts');
    const { MONSTERS } = await import('/src/game/data/monsters.ts');
    g.area = AREAS[id];
    await window.__loadArea?.(g.area);
    g.planRun?.();
    const room = which === 'boss' ? g.area.rooms - 1 : 1;
    await window.__room(room);
    // tous les monstres de la carte côte à côte, immobiles, devant le héros
    const ids = [...new Set([...g.area.pool, g.area.elite?.id, g.area.boss?.id].filter(Boolean))];
    g.monsters = ids.map((mid, i) => g.makeMonster(MONSTERS[mid], 3, 90 + (i % 3) * 270, 330 + Math.floor(i / 3) * 260));
    for (const m of g.monsters) { m.cd = 99; m.hidden = false; m.def = { ...m.def, speed: 0 }; }
    g.hero.hp = g.hero.maxHp = 99999;
    g.hero.y = 1100;
    return ids.join(', ');
  }, [id, which]);
  await p.waitForTimeout(2000);
  await p.screenshot({ path: `shots/calque_${id}.png` });
  console.log(id, ':', info);
}
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
