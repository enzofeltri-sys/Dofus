// Niveaux 41-50 : arbre (Kwaks, Bworks), décors des 5 cartes/donjons, monstres, Kwakwa (Kwarmée Kwayal) et Bworkette.
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
  const done = ['champs', 'paturages', 'foret', 'cimetiere', 'crypte', 'cite', 'souterrains', 'champsAstrub', 'prairies', 'grange', 'tainela', 'coinBouftous', 'coinBoos', 'abords', 'cour', 'ingalsse', 'tofus', 'cimetiereAmakna', 'cryptes', 'maisonFantome'];
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 9, wins: 9, bestRoom: 9, bestWinTime: 200, xp: 0, resources: {}, profile: { ...pr.defaultProfile(), xp: pr.XP_TABLE[44] }, inventory: inv.starterInventory(), done, area: 'craqueleurs' }));
});
await p.reload();
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 });
await p.click('.camp .play', { force: true });
await p.waitForTimeout(400);
await p.click('.atlas .back');
await p.waitForTimeout(300);
console.log('zones :', await p.$$eval('.zone-card', (e) => e.map((x) => x.querySelector('b').textContent + (x.disabled ? ' (fermée)' : '')).join(', ')));
await p.screenshot({ path: 'shots/n41_zones.png' });
for (const z of ['kwaks', 'bworks']) {
  await p.click(`.zone-card[data-zone="${z}"]`);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `shots/n41_zone_${z}.png` });
  await p.click('.atlas .back');
  await p.waitForTimeout(300);
}
await p.click('.zone-card[data-zone="kwaks"]');
await p.waitForTimeout(300);
await p.click('.map-row[data-id="craqueleurs"] .go');
await p.waitForTimeout(1500);
console.log('carte :', await p.evaluate(() => window.__game.area.name));
for (const [id, shape] of [['craqueleurs', 'plaine'], ['nidKwakwa', 'archipel'], ['campementBworks', 'plaine'], ['villageBworks', 'couloir'], ['donjonBworks', 'arene']]) {
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
  await p.screenshot({ path: `shots/n41_${id}_${shape}.png` });
  console.log(id, shape, ':', await p.evaluate(() => [...new Set(window.__game.monsters.map((m) => m.def.name))].join(', ')));
}
// tous les monstres côte à côte
for (const [name, ids] of [['kwaks', ['kwakVent', 'kwakFlamme', 'kwakGlace', 'kwakTerre', 'kwakereFlamme', 'kwakereElite', 'bwakTerre', 'archi2451', 'kwakwa']], ['bworks', ['bwork', 'bworkMage', 'bworkArcher', 'bworkElite', 'archi2416', 'archi2418', 'tofuMalefique', 'bworkArcherElite', 'bworkette']]]) {
  await p.evaluate(async (ids) => {
    const g = window.__game;
    const { MONSTERS } = await import('/src/game/data/monsters.ts');
    g.plan[1] = { shape: 'plaine', mirror: false, special: null };
    await window.__room(1);
    g.monsters = [];
    ids.forEach((id, i) => g.monsters.push(g.makeMonster(MONSTERS[id], 3, 120 + (i % 3) * 230, 480 + Math.floor(i / 3) * 210)));
    for (const m of g.monsters) { m.cd = 99; m.hidden = false; }
    g.hero.hp = g.hero.maxHp = 99999;
  }, ids);
  await p.waitForTimeout(3000);
  await p.screenshot({ path: `shots/n41_bestiaire_${name}.png` });
}
// Kwakwa : Kwarmée Kwayal (les 4 Bwaks)
for (const [id, wait] of [['nidKwakwa', "window.__game.monsters.filter((m) => m.def.id.startsWith('bwak')).length >= 4"], ['donjonBworks', 'window.__game.time > 12']]) {
  await p.evaluate(async (id) => {
    const g = window.__game;
    g.area = (await import('/src/game/data/areas.ts')).AREAS[id];
    await window.__room(g.area.rooms - 1);
    g.hero.hp = g.hero.maxHp = 99999;
    g.hero.def = { ...g.hero.def, weapon: { ...g.hero.def.weapon, reach: 0 } };
  }, id);
  await p.waitForFunction(wait, null, { timeout: 120000 });
  await p.waitForTimeout(800);
  console.log(id, 'boss :', await p.evaluate(() => window.__game.monsters.filter((m) => m.state !== 'dead').map((m) => m.def.name).join(', ')));
  await p.screenshot({ path: `shots/n41_boss_${id}.png` });
}
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
