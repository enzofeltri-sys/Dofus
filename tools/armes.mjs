// Fiche d'arme : dommages par élément (valeurs de Dofus et en jeu), PA, portée, critique — inventaire et Encyclopédie.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
const ready = async () => { await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 }); await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 }); };
await p.goto('http://localhost:5173/');
await p.evaluate(() => localStorage.clear());
await p.reload(); await ready();
await p.evaluate(async () => {
  const inv = await import('/src/game/inventory.ts');
  const f = await import('/src/game/forge.ts');
  const pr = await import('/src/game/progression.ts');
  let i = inv.starterInventory();
  i = f.addNew(i, 2416, 0, Math.random); // Marteau du Bouftou
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 5, wins: 2, bestRoom: 9, bestWinTime: 220, xp: 0, jobXp: 0, profile: { ...pr.defaultProfile(), xp: pr.XP_TABLE[25] }, inventory: i, resources: {} }));
});
await p.reload(); await ready();
await p.click('.nav-tab[data-sec="equip"]');
await p.waitForTimeout(400);
const uid = await p.evaluate(() => JSON.parse(localStorage.getItem('dofus-enzo-save')).inventory.items.find((x) => x.id === 2416).uid);
await p.click(`.inv-grid [data-uid="${uid}"]`);
await p.waitForTimeout(900);
console.log('inventaire :', (await p.textContent('.inv .inv-detail:not(.inv-modal) .det-weapon')).replace(/\s+/g, ' '));
await p.screenshot({ path: 'shots/arme_fiche.png' });
await p.click('.inv .inv-detail:not(.inv-modal) .det-close');
await p.click('.nav-tab[data-sec="bestiaire"]');
await p.waitForTimeout(400);
await p.click('.bestiary .sec-tab[data-panel="encyclo"]');
await p.waitForTimeout(600);
await p.fill('.encyclo .flt-q input', 'Épée de Boisaille');
await p.waitForTimeout(500);
await p.click('.encyclo .inv-grid [data-cat]');
await p.waitForTimeout(900);
console.log('Encyclopédie :', (await p.textContent('.encyclo .inv-detail:not(.inv-modal) .det-weapon')).replace(/\s+/g, ' '));
await p.screenshot({ path: 'shots/arme_encyclo.png' });
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
