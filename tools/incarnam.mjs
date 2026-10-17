// Teste l'étape 9b : cartes 2 à 4 d'Incarnam (Pâturages, Forêt, Cimetière) — arbre, première salle, salle de l'élite.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push('[console] ' + m.text()); });
const ready = async () => {
  await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
  await p.waitForSelector('.camp:not([hidden]) .enter', { timeout: 20000 });
};
// joueur niveau 6 qui vient de finir les Champs
await p.goto('http://localhost:5173/');
await p.evaluate(async () => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 4, wins: 1, bestRoom: 5, bestWinTime: 200, xp: pr.XP_TABLE[6], resources: {}, profile: pr.defaultProfile(), inventory: inv.starterInventory(), done: ['champs'], area: 'champs' }));
});
await p.reload();
await ready();
await p.click('.nav-tab[data-sec="donjons"]');
await p.waitForTimeout(200);
console.log('arbre :', await p.evaluate(() => [...document.querySelectorAll('.atlas-node')].map((n) => n.querySelector('b').textContent + ' [' + [...n.classList].filter((c) => ['done', 'open', 'locked', 'soon'].includes(c)) + ']').join(' → ')));
await p.screenshot({ path: 'shots/incarnam_atlas.png' });
await p.click('.atlas .sh-head .close');

for (const id of ['paturages', 'foret', 'cimetiere']) {
  await p.click('.nav-tab[data-sec="donjons"]');
  await p.click(`.atlas-node[data-id="${id}"]`);
  await p.waitForTimeout(200);
  if (await p.evaluate(() => !document.querySelector('.atlas')?.hidden)) await p.click('.atlas .sh-head .close');
  console.log(id, 'camp :', await p.evaluate(() => document.querySelector('.camp-dj').textContent.replace(/\s+/g, ' ').trim()));
  await p.click('.camp .enter');
  await p.waitForTimeout(4000);
  console.log('  salle 1 :', await p.evaluate(() => { const g = window.__game; return g.area.name + ' · ' + g.monsters.map((m) => `${m.def.name} niv ${m.level}`).join(', '); }));
  await p.screenshot({ path: `shots/incarnam_${id}_1.png` });
  await p.evaluate(() => window.__game.startRoom(4));
  await p.waitForTimeout(4000);
  console.log('  élite :', await p.evaluate(() => { const g = window.__game; return (g.elite?.def.name ?? '?') + ' · ' + g.monsters.map((m) => m.def.name).join(', '); }));
  await p.screenshot({ path: `shots/incarnam_${id}_elite.png` });
  // retour au camp (abandon)
  await p.evaluate(() => { const g = window.__game; g.hero.hp = 0; });
  await p.waitForSelector('.summary:not([hidden])', { timeout: 90000 });
  await p.click('.summary .back');
  await ready();
}
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
