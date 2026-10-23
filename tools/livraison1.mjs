// Refonte, livraison 1 : l'Atelier sans niveau d'Artisan, et le butin d'équipement = pièces des panoplies de la carte.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
p.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && errors.push('[console] ' + m.text()));
const ready = async () => {
  await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
  await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 });
};
await p.goto('http://localhost:5173/');
await ready();
await p.evaluate(async () => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  localStorage.setItem('dofus-enzo-save', JSON.stringify({
    v: 5, runs: 30, wins: 25, bestRoom: 9, bestWinTime: 220, xp: 0, jobXp: 0, profile: { xp: pr.XP_TABLE[23], carac: {} }, inventory: inv.starterInventory(),
    resources: { 16525: 5, 1519: 20 }, kamas: 500, done: ['champs', 'paturages', 'foret', 'cimetiere', 'crypte', 'cite', 'tainela', 'coinBouftous'], area: 'tainela',
  }));
});
await p.reload();
await ready();
// butin de 30 farms instantanés simulés aux Bouftous (même code que le jeu)
console.log('butin :', await p.evaluate(async () => {
  const f = await import('/src/game/farm.ts');
  const { AREAS } = await import('/src/game/data/areas.ts');
  const { ITEMS, SETS } = await import('/src/game/data/items.ts');
  const eq = {};
  for (let i = 0; i < 30; i++) for (const [k, n] of Object.entries(f.runLoot(AREAS.coinBouftous, 100, Math.random))) if (ITEMS[k].slot) eq[ITEMS[k].name + ' (' + (SETS[ITEMS[k].set]?.name ?? 'hors panoplie') + ')'] = (eq[ITEMS[k].name + ' (' + (SETS[ITEMS[k].set]?.name ?? 'hors panoplie') + ')'] ?? 0) + n;
  return Object.entries(eq).map(([k, n]) => `${n}× ${k}`).join(' | ');
}));
await p.click('.nav-tab[data-sec="equip"]');
await p.click('.inv .sec-tab[data-panel="atelier"]');
await p.waitForTimeout(500);
console.log('atelier :', await p.textContent('.atelier .sh-head'));
await p.screenshot({ path: 'shots/l1_atelier.png' });
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
