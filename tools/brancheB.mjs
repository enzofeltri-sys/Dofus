// Branche B : les 5 décors, un archimonstre Bouftou, le Donjon des Bouftous et le Bouftou Royal.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message + ' ' + (e.stack ?? '').split('\n').slice(1, 3).join(' | ')));
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push('[console] ' + m.text()); });
await p.goto('http://localhost:5173/');
await p.evaluate(async () => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 9, wins: 9, bestRoom: 9, bestWinTime: 200, xp: pr.XP_TABLE[12], resources: {}, profile: pr.defaultProfile(), inventory: inv.starterInventory(), done: ['champs', 'paturages', 'foret', 'cimetiere', 'crypte', 'cite', 'souterrains', 'champsAstrub', 'prairies', 'grange'], area: 'tainela' }));
});
await p.reload();
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.waitForSelector('.camp:not([hidden]) .enter', { timeout: 20000 });
// arbre des zones
const tab = await p.$('.nav-tab[data-tab="atlas"], .nav-tab:has-text("Donjons")');
if (tab) { await tab.click(); await p.waitForTimeout(600); await p.screenshot({ path: 'shots/brancheB_arbre.png' }); }
await p.goto('http://localhost:5173/');
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.waitForSelector('.camp:not([hidden]) .enter', { timeout: 20000 });
await p.click('.camp .enter');
await p.waitForTimeout(1500);
console.log('carte :', await p.evaluate(() => window.__game.area.name));
const shapes = { tainela: 'lac', foretAstrub: 'trous', carriere: 'archipel', egouts: 'pont', cour: 'arene' };
for (const [id, shape] of Object.entries(shapes)) {
  await p.evaluate(async ([id, shape]) => {
    const g = window.__game;
    g.area = (await import('/src/game/data/areas.ts')).AREAS[id];
    g.plan[1] = { shape, mirror: false, special: null };
    await window.__room(1);
    g.hero.hp = g.hero.maxHp = 99999;
    for (const m of g.monsters) m.cd = 99;
  }, [id, shape]);
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `shots/brancheB_${id}.png` });
  console.log(id, ':', await p.evaluate(() => [...new Set(window.__game.monsters.map((m) => m.def.name))].join(', ')));
}
// archimonstre au milieu des Pious
await p.evaluate(async () => {
  const g = window.__game;
  const { MONSTERS } = await import('/src/game/data/monsters.ts');
  g.area = (await import('/src/game/data/areas.ts')).AREAS.tainela;
  g.plan[1] = { shape: 'plaine', mirror: false, special: null };
  await window.__room(1);
  g.monsters = [];
  ['bouftou', 'archi2317', 'bouftonBlanc', 'chefBouftou'].forEach((id, i) => g.monsters.push(g.makeMonster(MONSTERS[id], 3, 180 + (i % 2) * 340, 600 + Math.floor(i / 2) * 260)));
  for (const m of g.monsters) m.cd = 99;
});
await p.waitForTimeout(2500);
await p.screenshot({ path: 'shots/brancheB_archi.png' });
// Grange : salle du boss
await p.evaluate(async () => {
  const g = window.__game;
  g.area = (await import('/src/game/data/areas.ts')).AREAS.cour;
  await window.__room(g.area.rooms - 1);
  g.hero.hp = g.hero.maxHp = 99999;
});
await p.waitForTimeout(9000);
console.log('Bouftous boss :', await p.evaluate(() => window.__game.monsters.map((m) => m.def.name).join(', ')));
await p.screenshot({ path: 'shots/brancheB_boss.png' });
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
