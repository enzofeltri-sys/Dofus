// Niveaux 51-60, deuxième donjon : arbre (Blops), décors du Lac de Cania et du Clos des Blops, monstres, salle des 4 portes, Blop Royal.
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
  const done = ['champs', 'paturages', 'foret', 'cimetiere', 'crypte', 'cite', 'souterrains', 'champsAstrub', 'prairies', 'grange', 'tainela', 'coinBouftous', 'coinBoos', 'abords', 'cour', 'ingalsse', 'tofus', 'cimetiereAmakna', 'cryptes', 'maisonFantome', 'craqueleurs', 'nidKwakwa', 'lacCania'];
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 9, wins: 9, bestRoom: 9, bestWinTime: 200, xp: 0, resources: {}, profile: { ...pr.defaultProfile(), xp: pr.XP_TABLE[56] }, inventory: inv.starterInventory(), done, area: 'lacCania' }));
});
await p.reload();
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 });
await p.click('.camp .play', { force: true });
await p.waitForTimeout(400);
await p.click('.atlas .back');
await p.waitForTimeout(300);
console.log('zones :', await p.$$eval('.zone-card', (e) => e.map((x) => x.querySelector('b').textContent + (x.disabled ? ' (fermée)' : '')).join(', ')));
await p.screenshot({ path: 'shots/blop_zones.png' });
for (const z of ['blops']) {
  await p.click(`.zone-card[data-zone="${z}"]`);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `shots/blop_zone_${z}.png` });
  await p.click('.atlas .back');
  await p.waitForTimeout(300);
}
await p.click('.zone-card[data-zone="blops"]');
await p.waitForTimeout(300);
await p.click('.map-row[data-id="lacCania"] .go');
await p.waitForTimeout(1500);
console.log('carte :', await p.evaluate(() => window.__game.area.name));
for (const [id, shape] of [['lacCania', 'lac'], ['lacCania', 'plaine'], ['closBlops', 'arene'], ['closBlops', 'plaine']]) {
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
  await p.screenshot({ path: `shots/blop_${id}_${shape}.png` });
  console.log(id, shape, ':', await p.evaluate(() => [...new Set(window.__game.monsters.map((m) => m.def.name))].join(', ')));
}
// tous les monstres côte à côte
for (const [name, ids] of [['blops', ['blopCoco', 'blopGriotte', 'blopIndigo', 'blopReinette', 'gloutoblop', 'blopignon', 'tronkoblop', 'biblopCoco', 'archi2404']], ['royaux', ['blopCocoRoyal', 'blopGriotteRoyal', 'blopIndigoRoyal', 'blopReinetteRoyal']]]) {
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
  await p.screenshot({ path: `shots/blop_bestiaire_${name}.png` });
}
// salle des 4 portes, puis la porte Indigo
await p.evaluate(async () => {
  const g = window.__game;
  g.area = (await import('/src/game/data/areas.ts')).AREAS.closBlops;
  await window.__loadArea?.(g.area);
  g.planRun();
  await window.__room(g.area.rooms - 2);
  g.hero.hp = g.hero.maxHp = 99999;
});
for (let k = 0; k < 40; k++) {
  const ok = await p.evaluate(() => { const g = window.__game; for (const m of g.monsters) { m.hp = 0; m.state = 'dead'; } return g.phase === 'cleared'; });
  if (ok) break;
  await p.waitForTimeout(300);
}
await p.waitForTimeout(1500);
console.log('portes :', await p.evaluate(() => window.__game.doors.map((d) => d.id + '@' + Math.round(d.x)).join(', ')), '| message :', await p.evaluate(() => document.querySelector('.toast')?.textContent));
await p.screenshot({ path: 'shots/blop_portes.png' });
await p.evaluate(() => { const g = window.__game; g.hero.x = g.doors[2].x; g.hero.y = g.bounds.y0 + 4; });
await p.keyboard.down('ArrowUp');
await p.waitForFunction(() => window.__game.bossPick, null, { timeout: 20000 }).catch(() => {});
await p.keyboard.up('ArrowUp');
console.log('porte prise :', await p.evaluate(() => window.__game.bossPick));
await p.evaluate(async () => {
  const g = window.__game;
  await window.__room(g.area.rooms - 1);
  g.hero.hp = g.hero.maxHp = 99999;
  g.hero.def = { ...g.hero.def, weapon: { ...g.hero.def.weapon, reach: 0 } };
});
await p.waitForFunction(() => window.__game.monsters.some((m) => m.def.id.startsWith('biblop')), null, { timeout: 60000 }).catch(() => {});
await p.waitForTimeout(800);
console.log('boss :', await p.evaluate(() => window.__game.monsters.filter((m) => m.state !== 'dead').map((m) => m.def.name).join(', ')), '| Blotection :', await p.evaluate(() => (window.__game.boss?.wardT ?? 0) > 0));
await p.screenshot({ path: 'shots/blop_boss.png' });
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
