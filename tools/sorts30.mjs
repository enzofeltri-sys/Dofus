// Sorts 15-30 du Sacrieur : Grimoire (favoris), puis une salle avec Épée Vorace, Ravage, Assaut, Transposition.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message + ' ' + (e.stack ?? '').split('\n').slice(1, 3).join(' | ')));
await p.goto('http://localhost:5173/');
await p.evaluate(async () => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 9, wins: 9, bestRoom: 9, bestWinTime: 200, xp: 0, resources: {}, profile: { ...pr.defaultProfile(), xp: pr.XP_TABLE[22] }, inventory: inv.starterInventory(), done: ['champs'], area: 'champs' }));
});
await p.reload();
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.waitForSelector('.camp:not([hidden]) .enter', { timeout: 20000 });
await p.click('.nav-tab:has-text("Grimoire")');
await p.waitForTimeout(500);
await p.click('.gm-fav[data-id="ravage"]');
await p.waitForTimeout(300);
await p.screenshot({ path: 'shots/grimoire.png', fullPage: false });
console.log('favoris :', await p.evaluate(() => JSON.parse(localStorage.getItem('dofus-enzo-save')).favSpells));
console.log('lignes :', await p.$$eval('.gm-row', (r) => r.map((x) => x.className.replace('gm-row ', '')).join(',')));
await p.click('.grimoire .close');
await p.click('.camp .enter');
await p.waitForTimeout(1500);
await p.evaluate(async () => {
  const g = window.__game;
  const { applyCard } = await import('/src/game/cards.ts');
  g.plan[1] = { shape: 'plaine', mirror: false, special: null };
  await window.__room(1);
  g.hero.maxHp = g.hero.hp = 600;
  for (const id of ['epeeVorace', 'ravage', 'assaut', 'transposition']) applyCard(g, { kind: 'spell', spell: id });
  // monstres rapprochés : un à 5 cases (Ravage), d'autres autour
  g.monsters.forEach((m, i) => { m.x = g.hero.x + [-80, 90, 0, 160][i % 4]; m.y = g.hero.y - [300, 240, 380, 160][i % 4]; m.hp = m.maxHp = 400; });
});
await p.waitForTimeout(1200);
await p.screenshot({ path: 'shots/sorts30_a.png' });
await p.waitForTimeout(2500);
await p.screenshot({ path: 'shots/sorts30_b.png' });
console.log('épées :', await p.evaluate(() => window.__game.swords.length), '| PV monstres :', await p.evaluate(() => window.__game.monsters.map((m) => m.hp).join(',')), '| sorts :', await p.evaluate(() => window.__game.run.slots.map((s) => s?.id).join(',')));
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
