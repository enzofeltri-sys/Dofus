// Capture de l'écran Équipement tel qu'il est (sac rempli), pour la refonte demandée par Enzo.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const ready = async () => {
  await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
  await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 });
};
await p.goto('http://localhost:5173/');
await ready();
await p.evaluate(async () => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  const f = await import('/src/game/forge.ts');
  const { ITEMS } = await import('/src/game/data/items.ts');
  let i = inv.starterInventory();
  const pool = Object.values(ITEMS).filter((d) => d.slot && d.slot !== 'familier' && d.slot !== 'dofus' && d.level >= 10 && d.level <= 30 && d.effects.length);
  for (let k = 0; k < 40; k++) i = f.addNew(i, pool[(k * 37) % pool.length].id, k % 9 === 0 ? 1 : 0, Math.random);
  localStorage.setItem('dofus-enzo-save', JSON.stringify({
    v: 5, runs: 30, wins: 25, bestRoom: 9, bestWinTime: 220, xp: 0, jobXp: 3000, profile: { xp: pr.XP_TABLE[25], carac: {} }, inventory: i,
    resources: { 16525: 5, 1519: 20 }, kamas: 2500, done: ['champs', 'paturages', 'foret', 'cimetiere', 'crypte'], area: 'crypte',
  }));
});
await p.reload();
await ready();
await p.click('.nav-tab[data-sec="equip"]');
await p.waitForTimeout(600);
await p.screenshot({ path: 'shots/eqv_full.png', fullPage: true });
const h = await p.evaluate(() => document.querySelector('.inv')?.scrollHeight);
console.log('hauteur inventaire', h);
await b.close();
