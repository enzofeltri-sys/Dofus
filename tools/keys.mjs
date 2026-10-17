// Teste l'étape 9c : une clé gratuite est dépensée en entrant dans un donjon déjà vaincu ; sans clé, l'entrée est bloquée.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
const ready = async () => {
  await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
  await p.waitForSelector('.camp:not([hidden]) .enter', { timeout: 20000 });
};
const put = (keys, resources) => p.evaluate(async ([keys, resources]) => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 9, wins: 6, bestRoom: 9, bestWinTime: 300, xp: 0, jobXp: 0, profile: { xp: pr.XP_TABLE[10], carac: {} },
    inventory: inv.emptyInventory(), resources, done: ['champs', 'paturages', 'foret', 'cimetiere', 'crypte'], area: 'crypte', keys }));
}, [keys, resources]);
const today = new Date();
const day = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
await p.goto('http://localhost:5173/');
await put({ free: 2, day }, {});
await p.reload();
await ready();
console.log('avant :', await p.evaluate(() => document.querySelector('.dj-key').textContent));
await p.click('.camp .enter');
await p.waitForTimeout(800);
console.log('après entrée :', await p.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('dofus-enzo-save')).keys)), '· zone', await p.evaluate(() => window.__game.area.name));
await put({ free: 0, day }, {});
await p.reload();
await ready();
console.log('sans clé :', await p.evaluate(() => document.querySelector('.dj-key').textContent), '· bouton désactivé', await p.evaluate(() => document.querySelector('.camp .enter').disabled));
await p.screenshot({ path: 'shots/keys_none.png' });
await put({ free: 0, day }, { 8545: 1 });
await p.reload();
await ready();
console.log('avec une Clef :', await p.evaluate(() => document.querySelector('.dj-key').textContent));
await p.click('.camp .enter');
await p.waitForTimeout(800);
console.log('Clefs restantes :', await p.evaluate(() => JSON.parse(localStorage.getItem('dofus-enzo-save')).resources['8545']));
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
