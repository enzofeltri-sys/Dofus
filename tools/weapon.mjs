// Capture : le Sacrieur en combat avec une vraie arme de Dofus (icône officielle en main), puis à mains nues.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
p.on('console', (m) => m.type() === 'error' && errors.push('[console] ' + m.text()));
const ready = async () => {
  await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
  await p.waitForSelector('.camp:not([hidden]) .enter', { timeout: 20000 });
};
for (const [id, name] of [[30828, 'bounihimee'], [1942, 'arc'], [null, 'mains_nues']]) {
  await p.goto('http://localhost:5173/');
  await p.evaluate(async (id) => {
    const inv = await import('/src/game/inventory.ts');
    let i = inv.emptyInventory();
    if (id) { i = inv.addItem(i, id, []); i = inv.equip(i, 1, 200); }
    localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 4, runs: 1, wins: 0, bestRoom: 1, bestWinTime: null, xp: 0, jobXp: 0, resources: {}, profile: { xp: 0, carac: {} }, inventory: i }));
  }, id);
  await p.reload();
  await ready();
  await p.click('.camp .enter');
  await p.waitForTimeout(4500);
  await p.screenshot({ path: `shots/weapon_${name}.png` });
}
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
