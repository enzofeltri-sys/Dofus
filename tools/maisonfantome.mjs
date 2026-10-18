// Maison Fantôme : décor, monstres (Gargrouille, Boostache Prépubère), Boostache, Ashi-magari et réanimation.
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
  const done = ['champs', 'paturages', 'foret', 'cimetiere', 'crypte', 'cite', 'souterrains', 'champsAstrub', 'prairies', 'grange', 'tainela', 'coinBouftous', 'coinBoos', 'abords', 'cour', 'cimetiereAmakna', 'cryptes'];
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 9, wins: 9, bestRoom: 9, bestWinTime: 200, xp: 0, resources: {}, profile: { ...pr.defaultProfile(), xp: pr.XP_TABLE[36] }, inventory: inv.starterInventory(), done, area: 'maisonFantome' }));
});
await p.reload();
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 });
await p.click('.camp .play', { force: true });
await p.waitForTimeout(400);
await p.click('.atlas .back');
await p.waitForTimeout(300);
await p.screenshot({ path: 'shots/fantome_zones.png' });
console.log('zones :', await p.$$eval('.zone-card', (e) => e.map((x) => x.querySelector('b').textContent + (x.disabled ? ' (fermée)' : '')).join(', ')));
await p.click('.zone-card[data-zone="squelettes"]');
await p.waitForTimeout(300);
await p.screenshot({ path: 'shots/fantome_zone.png' });
await p.screenshot({ path: 'shots/fantome_zone_avant.png' });
await p.click('.dj-card[data-id="maisonFantome"] .go');
await p.waitForTimeout(1500);
console.log('carte :', await p.evaluate(() => window.__game.area.name));
for (const [id, shape] of [['maisonFantome', 'plaine'], ['maisonFantome', 'couloir'], ['maisonFantome', 'arene']]) {
  await p.evaluate(async ([id, shape]) => {
    const g = window.__game;
    g.area = (await import('/src/game/data/areas.ts')).AREAS[id];
    g.plan[1] = { shape, mirror: false, special: null };
    await window.__room(1);
    g.hero.hp = g.hero.maxHp = 99999;
    for (const m of g.monsters) m.cd = 99;
  }, [id, shape]);
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `shots/fantome_${id}_${shape}.png` });
  console.log(id, shape, ':', await p.evaluate(() => [...new Set(window.__game.monsters.map((m) => m.def.name))].join(', ')));
}
// tous les monstres côte à côte (+ archimonstre, élites)
await p.evaluate(async () => {
  const g = window.__game;
  const { MONSTERS } = await import('/src/game/data/monsters.ts');
  g.area = (await import('/src/game/data/areas.ts')).AREAS.maisonFantome;
  g.plan[1] = { shape: 'plaine', mirror: false, special: null };
  await window.__room(1);
  g.monsters = [];
  ['gargrouille', 'gargrouilleElite', 'boostachePrepubere', 'archi2549', 'ashiMagari', 'tofuMalefique', 'vampire', 'kwoan', 'boostache'].forEach((id, i) => g.monsters.push(g.makeMonster(MONSTERS[id], 3, 120 + (i % 3) * 230, 480 + Math.floor(i / 3) * 210)));
  for (const m of g.monsters) { m.cd = 99; m.hidden = false; }
  g.hero.hp = g.hero.maxHp = 99999;
});
await p.waitForTimeout(3000);
await p.screenshot({ path: 'shots/fantome_bestiaire.png' });
// salle du Chafer Rōnin
await p.evaluate(async () => {
  const g = window.__game;
  g.area = (await import('/src/game/data/areas.ts')).AREAS.maisonFantome;
  await window.__room(g.area.rooms - 1);
  g.hero.hp = g.hero.maxHp = 99999;
  g.hero.def = { ...g.hero.def, weapon: { ...g.hero.def.weapon, reach: 0 } }; // pour laisser vivre les illusions
});
await p.waitForFunction(() => window.__game.monsters.some((m) => m.def.id === 'ashiMagari'), null, { timeout: 120000 });
await p.waitForTimeout(1500);
console.log('Boostache :', await p.evaluate(() => window.__game.monsters.map((m) => m.def.name + (m.state === 'dead' ? ' (mort)' : '')).join(', ')), '| t', await p.evaluate(() => window.__game.time));
await p.screenshot({ path: 'shots/fantome_boss.png' });
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
