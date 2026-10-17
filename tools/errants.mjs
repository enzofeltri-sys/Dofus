// Teste la fin d'Incarnam : monstres errants (Lac, Mine, Route des âmes) en jeu, Feux de Joie du Ronronchon.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push('[console] ' + m.text()); });
await p.goto('http://localhost:5173/');
await p.evaluate(async () => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 4, wins: 4, bestRoom: 5, bestWinTime: 200, xp: pr.XP_TABLE[8], resources: {}, profile: pr.defaultProfile(), inventory: inv.starterInventory(), done: ['champs', 'paturages', 'foret', 'cimetiere'], area: 'champs' }));
});
await p.reload();
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.waitForSelector('.camp:not([hidden]) .enter', { timeout: 20000 });
await p.click('.camp .enter');
await p.waitForTimeout(1500);
// les 8 monstres errants dans une salle des Champs
await p.evaluate(async () => {
  const g = window.__game;
  const { MONSTERS } = await import('/src/game/data/monsters.ts');
  g.plan[1] = { shape: 'plaine', mirror: false, special: null };
  await window.__room(1);
  g.monsters = [];
  const ids = ['plikplok', 'gloot', 'splatch', 'aminite', 'feuVif', 'feuJoie', 'feuFurieux', 'feuFollet'];
  ids.forEach((id, i) => g.monsters.push(g.makeMonster(MONSTERS[id], 3, 150 + (i % 4) * 140, 520 + Math.floor(i / 4) * 260)));
  for (const m of g.monsters) m.cd = 99;
});
await p.waitForTimeout(3000);
await p.screenshot({ path: 'shots/errants_salle.png' });
// Ronronchon : ses Feux de Joie
await p.evaluate(async () => {
  const g = window.__game;
  g.area = (await import('/src/game/data/areas.ts')).AREAS.foret;
  await window.__room(4);
  g.hero.hp = g.hero.maxHp = 9999;
});
await p.waitForFunction(() => window.__game.monsters.some((m) => m.def.id === 'feuJoie'), null, { timeout: 120000 }).catch(() => {});
await p.waitForTimeout(1500);
console.log('Ronronchon :', await p.evaluate(() => window.__game.monsters.map((m) => m.def.name).join(', ')));
await p.screenshot({ path: 'shots/errants_ronronchon.png' });
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
