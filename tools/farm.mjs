// Farm : fenêtre d'une carte terminée (instantané, expédition), puis farm auto ×4 qui enchaîne les parties, bandeau, Stop.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message + ' ' + (e.stack ?? '').split('\n').slice(1, 3).join(' | ')));
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push('[console] ' + m.text()); });
const seed = async (extra = {}) => p.evaluate(async (extra) => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 9, wins: 9, bestRoom: 9, bestWinTime: 200, xp: 0, resources: {}, profile: { ...pr.defaultProfile(), xp: pr.XP_TABLE[30], carac: { vitalite: 2000, sagesse: 0, force: 3000, intelligence: 0, chance: 0, agilite: 0 } }, inventory: inv.starterInventory(), done: ['champs', 'paturages', 'foret', 'cimetiere', 'crypte', 'cite'], area: 'cite', ...extra }));
}, extra);
const boot = async () => {
  await p.reload();
  await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
  await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 });
};
const openFarm = async () => {
  await p.click('.camp .play', { force: true });
  await p.waitForTimeout(400);
  await p.click('.atlas .back');
  await p.waitForTimeout(200);
  await p.click('.zone-card[data-zone="astrub"]');
  await p.waitForTimeout(300);
  await p.click('.map-row[data-id="cite"] .farm');
  await p.waitForTimeout(300);
};
await p.goto('http://localhost:5173/');
await seed();
await boot();
await openFarm();
await p.screenshot({ path: 'shots/farm_menu.png' });
await p.click('.farm-modal .finst');
await p.waitForTimeout(300);
console.log('instantané :', await p.$$eval('.farm-loot .fl', (e) => e.length), 'objets différents |', await p.$eval('.farm-modal .finst', (e) => e.closest('section').querySelector('small').textContent));
await p.screenshot({ path: 'shots/farm_instant.png' });
await p.click('.farm-modal .fsend');
await p.waitForTimeout(200);
console.log('expédition :', await p.$eval('.farm-modal .fcollect', (e) => e.closest('section').querySelector('small').textContent));
// on recule le départ de 2 h, puis on recharge et on récupère
await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('dofus-enzo-save')); s.expedition.start -= 2 * 3600e3; localStorage.setItem('dofus-enzo-save', JSON.stringify(s)); });
await boot();
await openFarm();
console.log('après 2 h :', await p.$eval('.farm-modal .fcollect', (e) => e.closest('section').querySelector('small').textContent));
await p.click('.farm-modal .fcollect');
await p.waitForTimeout(300);
const rows = await p.$$eval('.farm-loot .fl', (e) => e.map((x) => +x.querySelector('b').textContent));
console.log('butin expédition 2 h :', rows.reduce((a, b) => a + b, 0), 'objets dont', await p.$$eval('.farm-loot .fl.eq', (e) => e.length), 'équipements différents');
await p.screenshot({ path: 'shots/farm_expedition.png' });
// farm auto ×4
await p.click('.farm-modal .fauto[data-sp="4"]');
await p.waitForSelector('.farm-bar', { timeout: 20000 });
console.log('bandeau :', await p.$eval('.farm-bar', (e) => e.textContent.replace(/\s+/g, ' ')));
for (let k = 0; k < 2; k++) { await p.waitForTimeout(8000); console.log('état', await p.evaluate(() => { const g = window.__game; return { phase: g.phase, salle: g.roomIndex, monstres: g.monsters.filter((m) => m.state !== 'dead').length, pv: Math.round(g.hero.hp), t: Math.round(g.stats.time), hx: Math.round(g.hero.x), hy: Math.round(g.hero.y) }; }), await p.$eval('.farm-bar', (e) => e.textContent.replace(/\s+/g, ' '))); }
await p.screenshot({ path: 'shots/farm_diag.png' });
await p.waitForFunction(() => /[2-9] parties/.test(document.querySelector('.farm-bar')?.textContent ?? ''), null, { timeout: 400000 });
console.log('après 2 parties :', await p.$eval('.farm-bar', (e) => e.textContent.replace(/\s+/g, ' ')));
await p.screenshot({ path: 'shots/farm_auto.png' });
await p.click('.farm-bar .fb-stop');
await p.waitForSelector('.summary:not([hidden])', { timeout: 20000 });
await p.waitForTimeout(500);
console.log('bilan :', await p.$eval('.summary .sum-loot', (e) => e.textContent.trim()));
console.log('bandeau retiré :', !(await p.$('.farm-bar')));
await p.screenshot({ path: 'shots/farm_stop.png' });
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
