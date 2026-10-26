// Niveaux 61-70 : arbre (Craqueleurs), décors des Plaines Rocheuses et des Pitons Rocheux, monstres, Kirboule, Craqueleur Légendaire.
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
  const done = ['champs', 'paturages', 'foret', 'cimetiere', 'crypte', 'cite', 'souterrains', 'champsAstrub', 'prairies', 'grange', 'tainela', 'coinBouftous', 'coinBoos', 'abords', 'cour', 'ingalsse', 'tofus', 'cimetiereAmakna', 'cryptes', 'maisonFantome', 'craqueleurs', 'nidKwakwa', 'lacCania', 'closBlops'];
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 9, wins: 9, bestRoom: 9, bestWinTime: 200, xp: 0, resources: {}, profile: { ...pr.defaultProfile(), xp: pr.XP_TABLE[64] }, inventory: inv.starterInventory(), done, area: 'closBlops' }));
});
await p.reload();
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 });
await p.click('.camp .play', { force: true });
await p.waitForTimeout(400);
await p.click('.atlas .back');
await p.waitForTimeout(300);
console.log('zones :', await p.$$eval('.zone-card', (e) => e.map((x) => x.querySelector('b').textContent + (x.disabled ? ' (fermée)' : '')).join(', ')));
await p.click('.zone-card[data-zone="craqueleursZone"]');
await p.waitForTimeout(300);
await p.screenshot({ path: 'shots/craq_zone.png' });
await p.click('.map-row[data-id="plainesRocheuses"] .go');
await p.waitForTimeout(1500);
console.log('carte :', await p.evaluate(() => window.__game.area.name));
for (const [id, shape] of [['plainesRocheuses', 'plaine'], ['plainesRocheuses', 'lac'], ['pitonsRocheux', 'archipel'], ['pitonsRocheux', 'plaine']]) {
  await p.evaluate(async ([id, shape]) => {
    const g = window.__game;
    g.area = (await import('/src/game/data/areas.ts')).AREAS[id];
    await window.__loadArea?.(g.area);
    g.plan[1] = { shape, mirror: false, special: null };
    await window.__room(1);
    g.hero.hp = g.hero.maxHp = 99999;
    for (const m of g.monsters) m.cd = 99;
  }, [id, shape]);
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `shots/craq_${id}_${shape}.png` });
  console.log(id, shape, ':', await p.evaluate(() => [...new Set(window.__game.monsters.map((m) => m.def.name))].join(', ')));
}
// tous les monstres côte à côte
await p.evaluate(async () => {
  const g = window.__game;
  const { MONSTERS } = await import('/src/game/data/monsters.ts');
  g.plan[1] = { shape: 'plaine', mirror: false, special: null };
  await window.__room(1);
  g.monsters = [];
  ['craqueleur', 'craqueleurPlaines', 'craqueboule', 'craquelope', 'elementerre', 'craquelourd', 'kirboule', 'archi2436', 'craquelourdElite']
    .forEach((id, i) => g.monsters.push(g.makeMonster(MONSTERS[id], 3, 120 + (i % 3) * 230, 470 + Math.floor(i / 3) * 230)));
  for (const m of g.monsters) { m.cd = 99; m.hidden = false; }
  g.hero.hp = g.hero.maxHp = 99999;
});
await p.waitForTimeout(3000);
await p.screenshot({ path: 'shots/craq_bestiaire.png' });
// mini-boss puis boss
for (const room of [3, 6]) {
  await p.evaluate(async (room) => {
    const g = window.__game;
    g.area = (await import('/src/game/data/areas.ts')).AREAS.pitonsRocheux;
    await window.__loadArea?.(g.area);
    g.planRun();
    await window.__room(room);
    g.hero.hp = g.hero.maxHp = 99999;
  }, room);
  await p.waitForTimeout(room === 6 ? 16000 : 3000);
  console.log('salle', room, ':', await p.evaluate(() => window.__game.monsters.filter((m) => m.state !== 'dead').map((m) => m.def.name).join(', ')), '| PA :', await p.evaluate(() => window.__game.hero.pa.toFixed(1)));
  await p.screenshot({ path: `shots/craq_salle${room}.png` });
}
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
