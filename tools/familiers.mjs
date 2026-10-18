// Familiers (croissance par Super Croquettes) et Dofus (un seul exemplaire de chaque) dans l'inventaire.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
const ready = async () => { await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 }); await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 }); };
const toast = async () => { await p.waitForTimeout(150); return p.evaluate(() => document.querySelector('.toast').textContent); };
await p.goto('http://localhost:5173/');
await p.evaluate(() => localStorage.clear());
await p.reload(); await ready();
await p.evaluate(async () => {
  const inv = await import('/src/game/inventory.ts');
  const f = await import('/src/game/forge.ts');
  let i = inv.starterInventory();
  i = f.addNew(i, 7712, 2, Math.random); // Pioute vert (rareté ignorée)
  i = f.addNew(i, 7113, 0, Math.random); // Dofawa
  i = f.addNew(i, 7113, 0, Math.random); // un 2e Dofawa
  i = f.addNew(i, 30356, 0, Math.random); // Jyfus
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 5, wins: 2, bestRoom: 9, bestWinTime: 220, xp: 0, jobXp: 0, profile: { xp: 90000, carac: {} }, inventory: i, resources: { 20040: 25 } }));
});
await p.reload(); await ready();
await p.click('.nav-tab[data-sec="equip"]');
await p.waitForTimeout(500);
const s0 = await p.evaluate(() => JSON.parse(localStorage.getItem('dofus-enzo-save')).inventory.items);
const pet = s0.find((x) => x.id === 7712), dofs = s0.filter((x) => x.id === 7113);
console.log('familier :', pet.food, '% | rareté', pet.rarity ?? 0);
await p.click(`.inv-grid [data-uid="${pet.uid}"]`);
await p.waitForTimeout(400);
await p.screenshot({ path: 'shots/fam_fiche.png' });
await p.click('.d-feed');
console.log('nourrir :', await toast());
await p.click('.d-feedall');
console.log('tout donner :', await toast());
await p.click('.inv-detail:not(.inv-modal) .act');
await p.waitForTimeout(300);
await p.screenshot({ path: 'shots/fam_fiche_max.png' });
await p.click('.inv-detail:not(.inv-modal) .det-close');
for (const d of dofs) {
  await p.click(`.inv-grid [data-uid="${d.uid}"]`);
  await p.waitForTimeout(300);
  console.log('Dofawa :', await p.textContent('.inv-detail:not(.inv-modal) .act'));
  await p.click('.inv-detail:not(.inv-modal) .act');
  await p.waitForTimeout(200);
  await p.click('.inv-detail:not(.inv-modal) .det-close');
}
await p.evaluate(() => window.scrollTo(0, 0));
await p.screenshot({ path: 'shots/fam_doll.png' });
const s1 = await p.evaluate(() => JSON.parse(localStorage.getItem('dofus-enzo-save')));
console.log('portés :', JSON.stringify(s1.inventory.equipped), '| croquettes restantes :', s1.resources[20040]);
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
