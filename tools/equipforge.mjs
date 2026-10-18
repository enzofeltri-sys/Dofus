// Fusion et Brisage dans l'inventaire (choix d'Enzo) : boutons sur la fiche, barre Fusion / Briser et sélection directe.
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
const shot = (name) => p.screenshot({ path: `shots/${name}.png` });
const toast = async () => { await p.waitForTimeout(150); return p.evaluate(() => document.querySelector('.toast').textContent); };
const save = () => p.evaluate(() => JSON.parse(localStorage.getItem('dofus-enzo-save')));
await p.goto('http://localhost:5173/');
await p.evaluate(() => localStorage.clear());
await p.reload();
await ready();
await p.evaluate(async () => {
  const inv = await import('/src/game/inventory.ts');
  const f = await import('/src/game/forge.ts');
  let i = inv.starterInventory();
  for (let k = 0; k < 3; k++) i = f.addNew(i, 16500, 0, Math.random); // 3 Casques de Kardorim Communs → Rare
  i = f.addNew(i, 787, 0, Math.random); // Anneau Rexik
  i = f.addNew(i, 16501, 0, Math.random); // Cape de Kardorim
  const s = { v: 5, runs: 5, wins: 2, bestRoom: 9, bestWinTime: 220, xp: 0, jobXp: 0, profile: { xp: 9000, carac: {} }, inventory: i, resources: { 16525: 5, 310: 4 } };
  localStorage.setItem('dofus-enzo-save', JSON.stringify(s));
});
await p.reload();
await ready();
await p.click('.nav-tab[data-sec="equip"]');
await p.waitForTimeout(500);
await p.evaluate(() => document.querySelector('.inv-acts').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(300);
await shot('eqf_barre');
console.log('barre :', await p.textContent('.inv-acts'));
// 1) fiche d'un Casque : Fusionner / Briser
const uids = await p.evaluate(() => JSON.parse(localStorage.getItem('dofus-enzo-save')).inventory.items.filter((x) => x.id === 16500).map((x) => x.uid));
await p.click(`.inv-grid [data-uid="${uids[0]}"]`);
await p.waitForTimeout(400);
await shot('eqf_fiche');
console.log('fiche :', await p.textContent('.inv-detail:not(.inv-modal) .det-forge'));
await p.click('.d-fuse');
await p.waitForTimeout(400);
await shot('eqf_fusion');
await p.click('.inv-modal .fz-ok');
console.log('fusion :', await toast());
console.log('raretés des Casques :', (await save()).inventory.items.filter((x) => x.id === 16500).map((x) => x.rarity ?? 0).join(','));
await p.click('.inv-detail:not(.inv-modal) .det-close');
await p.waitForTimeout(300);
// 2) mode Briser : sélection directe de 2 objets
await p.click('.ia-break');
await p.waitForTimeout(300);
const ids = await p.evaluate(() => JSON.parse(localStorage.getItem('dofus-enzo-save')).inventory.items.filter((x) => x.id === 787 || x.id === 16501).map((x) => x.uid));
for (const u of ids) await p.click(`.inv-grid [data-uid="${u}"]`);
await p.waitForTimeout(300);
await p.evaluate(() => document.querySelector('.inv-acts').scrollIntoView({ block: 'center' }));
await shot('eqf_selection');
console.log('sélection :', await p.textContent('.inv-acts'), '| grisés :', await p.$$eval('.inv-grid .inv-cell.off', (e) => e.length));
await p.click('.ia-ok');
await p.waitForTimeout(400);
await shot('eqf_brisage');
await p.click('.inv-modal .br-ok');
console.log('brisage :', await toast());
const s = await save();
console.log('restants :', s.inventory.items.map((x) => x.id).join(','), '| runes :', Object.keys(s.resources).length);
// 3) Artisanat : plus que Fabrication et Forgemagie
await p.click('.inv .sec-tab[data-panel="atelier"]');
await p.waitForTimeout(500);
console.log('onglets Artisanat :', await p.$$eval('.at-tabs .gr-tab', (e) => e.map((x) => x.textContent).join(', ')));
await shot('eqf_artisanat');
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
