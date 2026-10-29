// Monstres redessinés sur gabarit, dans une vraie salle (taille et animation du jeu).
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
await p.goto('http://localhost:5173/?salle=1');
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done') && window.__game, null, { timeout: 60000 });
await p.evaluate(async () => {
  const g = window.__game;
  const { MONSTERS } = await import('/src/game/data/monsters.ts');
  const kinds = ['wobot', 'waWobot', 'blackWoWabbit', 'wobotKiafin', 'blancPaWabbit', 'tiwobot', 'scordionBleu', 'fennex', 'boulepique', 'leolhyene', 'ouroboulos', 'mantiscore'];
  // fiches provisoires (les vraies viendront avec la zone) : on prend un monstre existant et on change le dessin
  const base = MONSTERS.craqueleur;
  const area = { ...g.area, pool: kinds.map((k) => 'tmp_' + k), elite: undefined, boss: undefined };
  for (const k of kinds) MONSTERS['tmp_' + k] = { ...base, id: 'tmp_' + k, name: k, art: k, speed: 0, scale: ['waWobot', 'mantiscore'].includes(k) ? 1.6 : 1.1 };
  g.area = area;
  await window.__loadArea?.(area);
  g.plan[1] = { shape: 'plaine', mirror: false, special: null };
  await window.__room(1);
  g.monsters = [];
  kinds.forEach((k, i) => g.monsters.push(g.makeMonster(MONSTERS['tmp_' + k], 3, 90 + (i % 3) * 270, 420 + Math.floor(i / 3) * 230)));
  for (const m of g.monsters) { m.cd = 99; m.hidden = false; }
  g.hero.hp = g.hero.maxHp = 99999;
});
await p.click('.overlay .btn').catch(() => {});
await p.waitForTimeout(2500);
console.log('monstres :', await p.evaluate(() => window.__game.monsters.map((m) => m.def.art + ':' + m.state).join(', ')));
await p.screenshot({ path: 'shots/calque_salle.png' });
await p.waitForTimeout(400);
await p.screenshot({ path: 'shots/calque_salle2.png' });
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
