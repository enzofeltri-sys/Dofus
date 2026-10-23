// Refonte, livraison 2 : écran Panoplies (collection de la zone), fiche d'une pièce, Améliorer, Atelier « mon niveau ».
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
const shot = (n) => p.screenshot({ path: `shots/${n}.png` });
const toast = async () => { await p.waitForTimeout(150); return p.evaluate(() => document.querySelector('.toast').textContent); };
await p.goto('http://localhost:5173/');
await ready();
await p.evaluate(async () => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  const f = await import('/src/game/forge.ts');
  let i = inv.starterInventory();
  for (let k = 0; k < 3; k++) i = f.addNew(i, 2411, 0, Math.random); // 3 Coiffes du Bouftou
  for (const id of [2414, 2422, 2425]) i = f.addNew(i, id, 0, Math.random);
  localStorage.setItem('dofus-enzo-save', JSON.stringify({
    v: 5, runs: 30, wins: 25, bestRoom: 9, bestWinTime: 220, xp: 0, jobXp: 0, profile: { xp: pr.XP_TABLE[23], carac: {} }, inventory: i,
    resources: { 16525: 5, 1519: 20, 2302: 30, 2303: 30, 385: 10 }, kamas: 500,
    done: ['champs', 'paturages', 'foret', 'cimetiere', 'crypte', 'cite', 'souterrains', 'champsAstrub', 'prairies', 'grange', 'tainela', 'coinBouftous'], area: 'coinBouftous',
  }));
});
await p.reload();
await ready();
await p.click('.nav-tab[data-sec="equip"]');
await p.waitForTimeout(600);
console.log('onglets :', await p.$$eval('.sets:not([hidden]) .sec-tab', (e) => e.map((x) => x.textContent + (x.classList.contains('on') ? '*' : '')).join(' | ')));
console.log('zone :', await p.$eval('.st-zsel', (e) => e.selectedOptions[0].textContent), '| panoplies :', await p.$$eval('.st-set .st-h', (e) => e.map((x) => x.textContent.replace(/\s+/g, ' ').trim()).join(' ; ')));
console.log('prêtes :', await p.$eval('.st-ready', (e) => e.textContent.replace(/\s+/g, ' ').trim()));
await shot('pano_zone');
// pièce manquante
const miss = await p.$('.st-set .st-pc.miss');
await miss.click();
await p.waitForTimeout(300);
console.log('pièce manquante :', (await p.textContent('.st-modal .det-card')).replace(/\s+/g, ' ').trim().slice(0, 300));
await shot('pano_piece');
await p.click('.st-modal .md-close');
// améliorer la Coiffe
await p.click('.st-fzr');
await p.waitForTimeout(300);
await shot('pano_coiffe');
await p.click('.st-modal [data-fz]');
await p.waitForTimeout(300);
await shot('pano_fusion');
await p.click('.st-modal .fz-ok');
console.log('amélioration :', await toast());
await p.waitForTimeout(300);
console.log('après :', await p.$eval('.st-ready', (e) => e.textContent.trim() || '(plus rien de prêt)'));
// autre zone
await p.selectOption('.st-zsel', { index: 0 });
await p.waitForTimeout(300);
console.log('zone 1 :', await p.$$eval('.st-set .st-h', (e) => e.map((x) => x.textContent.replace(/\s+/g, ' ').trim()).join(' ; ')));
// Atelier
await p.click('.sets .sec-tab[data-panel="atelier"]');
await p.waitForTimeout(600);
console.log('atelier :', await p.$eval('.at-list .cat-mode', (e) => e.textContent), '| recettes :', await p.$$eval('.at-row', (e) => e.length), '| ▲ :', await p.$$eval('.at-better', (e) => e.length));
await shot('pano_atelier');
await p.fill('.at-flt input[type="search"], .at-flt input', 'kardorim');
await p.waitForTimeout(400);
console.log('recherche « kardorim » (tous niveaux) :', await p.$$eval('.at-row b', (e) => e.map((x) => x.textContent).slice(0, 4).join(' | ')));
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
