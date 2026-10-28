// Carte du monde (validée par Enzo) : régions, arbre d'une région, région fermée, continent.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push('[console] ' + m.text()); });
const ready = async () => {
  await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
  await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 });
};
await p.goto('http://localhost:5173/');
await ready();
const seed = async (done, level, area) => {
  await p.evaluate(async ([done, level, area]) => {
    const pr = await import('/src/game/progression.ts');
    const inv = await import('/src/game/inventory.ts');
    localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 9, wins: 9, bestRoom: 9, bestWinTime: 200, xp: 0, resources: {}, profile: { ...pr.defaultProfile(), xp: pr.XP_TABLE[level] }, inventory: inv.starterInventory(), done, area }));
  }, [done, level, area]);
  await p.reload();
  await ready();
};
const title = () => p.$eval('.atlas .sh-head .gr-h2', (e) => e.textContent);
const cards = () => p.$$eval('.atlas .zone-card', (e) => e.map((x) => x.querySelector('b').textContent + ' [' + [...x.querySelectorAll('small, em')].map((s) => s.textContent.trim()).join(' | ') + ']'));
// 1) avant la carte du monde
await seed(['champs', 'paturages', 'foret', 'cimetiere', 'crypte', 'cite'], 20, 'cite');
await p.click('.camp .play', { force: true });
await p.waitForTimeout(400);
await p.click('.atlas .back').catch(() => {});
await p.waitForTimeout(300);
console.log('avant :', await title(), '|', (await cards()).slice(-2).join(' ; '));
await p.screenshot({ path: 'shots/rg_avant.png' });
// 2) carte du monde, niveau 64, on joue à l'Arche
const done = ['champs', 'paturages', 'foret', 'cimetiere', 'crypte', 'cite', 'souterrains', 'champsAstrub', 'prairies', 'grange', 'tainela', 'coinBouftous', 'coinBoos', 'abords', 'cour', 'ingalsse', 'tofus', 'cimetiereAmakna', 'cryptes', 'maisonFantome', 'craqueleurs', 'nidKwakwa', 'cawotte', 'couronne', 'chateauWabbit', 'arche', 'caleArche'];
await seed(done, 64, 'arche');
await p.click('.camp .play', { force: true });
await p.waitForTimeout(400);
console.log('ouvert sur :', await title());
await p.screenshot({ path: 'shots/rg_otomai.png' });
console.log('étapes :', await p.$$eval('.atlas .map-row b, .atlas .dj-card .djc-name', (e) => e.map((x) => x.textContent).join(', ')));
await p.click('.atlas .back');
await p.waitForTimeout(300);
console.log('monde :', await title(), '\n  ' + (await cards()).join('\n  '));
await p.screenshot({ path: 'shots/rg_monde.png' });
await p.click('.zone-card[data-peek="frigost"]');
await p.waitForTimeout(200);
await p.$eval('.zone-card[data-peek="frigost"]', (e) => e.scrollIntoView());
await p.screenshot({ path: 'shots/rg_frigost.png' });
console.log('Frigost :', await p.$eval('.zone-card[data-peek="frigost"] .rg-peek', (e) => e.textContent));
await p.click('.zone-card[data-region="amakna"]');
await p.waitForTimeout(300);
console.log(await title(), ':', await p.$$eval('.atlas .map-row, .atlas .dj-card', (e) => e.map((x) => x.querySelector('b').textContent + (x.querySelector('em') ? ' (' + x.querySelector('em').textContent.trim() + ')' : '')).join(', ')));
await p.screenshot({ path: 'shots/rg_amakna.png' });
await p.click('.atlas .back');
await p.click('.zone-card[data-region="continent"]');
await p.waitForTimeout(300);
console.log(await title(), ':', (await cards()).length, 'zones');
await p.click('.zone-card[data-zone="kwaks"]');
await p.waitForTimeout(300);
console.log(await title());
await p.click('.atlas .back');
await p.waitForTimeout(200);
console.log('retour :', await title());
// jouer l'Arche depuis l'arbre de la région
await p.click('.atlas .back');
await p.click('.zone-card[data-region="otomai"]');
await p.click('.map-row[data-id="arche"] .go');
await p.waitForTimeout(1500);
console.log('partie :', await p.evaluate(() => window.__game.area.name));
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
