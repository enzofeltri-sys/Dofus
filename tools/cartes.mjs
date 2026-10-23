// Cartes entre les salles : les bonus Intelligence, Chance, Agilité et Sagesse apparaissent (choix d'Enzo).
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text()); });
const seen = new Set();
let shot = false;
// premier choix de cartes de chaque partie, plusieurs parties (le tirage est aléatoire)
for (let run = 0; run < 10 && !shot; run++) {
  await p.goto('http://localhost:5173/');
  await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
  await p.waitForSelector('.camp:not([hidden]) .enter', { timeout: 20000 });
  await p.click('.camp .enter');
  await p.waitForTimeout(1200);
  for (let k = 0; k < 4; k++) {
    await p.evaluate(() => { const g = window.__game; g.hero.hp = g.hero.maxHp; for (const m of g.monsters) { m.hp = 0; m.state = 'dead'; m.t = 0; } });
    await p.waitForTimeout(1000);
  }
  await p.evaluate(() => { const g = window.__game; g.hero.x = 360; g.hero.y = g.bounds.y0 + 60; });
  await p.keyboard.down('ArrowUp');
  const ok = await p.waitForSelector('.picker:not([hidden]) .pk-card', { timeout: 20000 }).then(() => true).catch(() => false);
  await p.keyboard.up('ArrowUp');
  if (!ok) continue;
  const titles = await p.evaluate(() => [...document.querySelectorAll('.pk-card .pk-title')].map((e) => e.textContent));
  console.log(`partie ${run + 1} :`, titles.join(' | '));
  titles.forEach((t) => seen.add(t));
  if (titles.some((t) => /Intelligence|Chance|Agilité|Sagesse/.test(t))) {
    await p.screenshot({ path: 'shots/cartes_bonus.png' });
    shot = true;
  }
}
console.log('bonus vus :', [...seen].filter((t) => /\+\d/.test(t)).join(', '));
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
