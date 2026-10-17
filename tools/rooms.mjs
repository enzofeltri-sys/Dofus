// Teste la variété des salles : chaque forme, chaque salle spéciale et chaque piège de carte (captures dans shots/rooms_*).
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push('[console] ' + m.text()); });
await p.goto('http://localhost:5173/');
await p.evaluate(async () => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 4, wins: 4, bestRoom: 5, bestWinTime: 200, xp: pr.XP_TABLE[8], resources: {}, profile: pr.defaultProfile(), inventory: inv.starterInventory(), done: ['champs', 'paturages', 'foret', 'cimetiere'], area: 'champs' }));
});
await p.reload();
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.waitForSelector('.camp:not([hidden]) .enter', { timeout: 20000 });
await p.click('.camp .enter');
await p.waitForTimeout(1500);
// [carte, forme, sens, spéciale, attente (s), nom de la capture]
const cases = [
  ['champs', 'pont', false, null, 1.5, 'pont'],
  ['paturages', 'archipel', true, null, 1.5, 'archipel'],
  ['foret', 'trous', false, null, 1.5, 'trous'],
  ['cimetiere', 'couloir', false, null, 1.5, 'couloir'],
  ['champs', 'arene', false, null, 1.5, 'arene'],
  ['paturages', 'lac', false, null, 1.5, 'lac'],
  ['foret', 'plaine', false, 'coffre', 1.5, 'coffre'],
  ['cimetiere', 'trous', true, 'fontaine', 1.5, 'fontaine'],
  ['champs', 'plaine', false, 'embuscade', 3.5, 'embuscade'],
  ['paturages', 'plaine', false, 'vagues', 3, 'vagues'],
  ['crypte', 'plaine', true, 'coffre', 1.5, 'crypte_coffre'],
];
for (const [area, shape, mirror, special, wait, name] of cases) {
  const info = await p.evaluate(async ([area, shape, mirror, special]) => {
    const g = window.__game;
    const A = (await import('/src/game/data/areas.ts')).AREAS[area];
    g.area = A;
    g.plan[1] = { shape, mirror, special };
    await window.__room(1);
    return `${g.area.name} · ${g.shape.name} · ${g.special ?? '-'} · objets ${g.layout.map((l) => l.kind).join(',')} · monstres ${g.monsters.length} (+${g.reserve.length})`;
  }, [area, shape, mirror, special]);
  console.log(name, ':', info);
  await p.waitForTimeout(wait * 1000);
  await p.screenshot({ path: `shots/rooms_${name}.png` });
}
// pièges : on attend qu'ils se déclenchent (le héros ne bouge pas)
for (const [area, name] of [['paturages', 'troupeau'], ['foret', 'feux'], ['cimetiere', 'mains']]) {
  await p.evaluate(async (area) => {
    const g = window.__game;
    g.area = (await import('/src/game/data/areas.ts')).AREAS[area];
    g.plan[1] = { shape: 'plaine', mirror: false, special: null };
    await window.__room(1);
    for (const m of g.monsters) m.cd = 99;
    g.hero.hp = g.hero.maxHp = 9999;
    if (area === 'foret') { const z = g.hazards[0]; if (z) { g.hero.x = z.x; g.hero.y = z.y + 40; } }
  }, area);
  const t0 = Date.now();
  await p.waitForFunction(() => window.__game.hazards.some((z) => z.state === 'windup' || (z.kind === 'herd' && z.state === 'active')), null, { timeout: 60000 }).catch(() => {});
  console.log(name, ': piège annoncé après', ((Date.now() - t0) / 1000).toFixed(1), 's', await p.evaluate(() => JSON.stringify(window.__game.hazards.map((z) => [z.kind, z.state]))));
  await p.screenshot({ path: `shots/rooms_${name}_annonce.png` });
  await p.waitForFunction(() => window.__game.hazards.some((z) => z.state === 'active' || z.state === 'gone'), null, { timeout: 30000 }).catch(() => {});
  await p.screenshot({ path: `shots/rooms_${name}_coup.png` });
}
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
