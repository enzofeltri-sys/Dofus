// Sacrieur sur gabarit dans le jeu : marche, coups, à côté des monstres ; camp et Apparence. Captures dans shots/.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
await p.goto('http://localhost:5173/?salle=1');
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done') && window.__game, null, { timeout: 60000 });
await p.click('.overlay .btn').catch(() => {});
await p.evaluate(() => {
  const g = window.__game;
  g.hero.hp = g.hero.maxHp = 99999;
  g.hero.x = 300; g.hero.y = 700;
  for (const [i, m] of g.monsters.entries()) { m.x = 520 + (i % 2) * 120; m.y = 640 + i * 60; m.cd = 99; }
});
await p.waitForTimeout(800);
await p.screenshot({ path: 'shots/sacri_salle.png' });
await p.keyboard.down('d');
await p.waitForTimeout(260);
await p.screenshot({ path: 'shots/sacri_marche.png' });
await p.keyboard.up('d');
// coups : le héros frappe tout seul quand un monstre est à portée
await p.evaluate(() => { const g = window.__game; const m = g.monsters[0]; if (m) { m.x = g.hero.x + 70; m.y = g.hero.y; } });
for (let i = 0; i < 6; i++) {
  await p.waitForTimeout(110);
  await p.screenshot({ path: `shots/sacri_coup${i}.png` });
}
await p.goto('http://localhost:5173/');
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.click('.overlay .btn').catch(() => {});
await p.waitForTimeout(600);
await p.screenshot({ path: 'shots/sacri_camp.png' });
await p.evaluate(() => document.querySelector('.sec-tab[data-panel="look"]')?.click());
await p.waitForTimeout(500);
await p.screenshot({ path: 'shots/sacri_apparence.png' });
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
