// Teste les enchaînements d'écrans : salle vidée → grille → salle suivante ; défaite → recommencer.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text()); });
await p.goto('http://localhost:5173/');
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
const state = () => p.evaluate(() => { const g = window.__game; return { room: g.roomIndex + 1, phase: g.phase, gate: +g.gate.toFixed(2), hp: g.hero.hp }; });

// 1) vider la salle
await p.evaluate(() => { for (const m of window.__game.monsters) { m.hp = 0; m.state = 'dead'; m.t = 0; } });
await p.waitForTimeout(2500);
console.log('après nettoyage', JSON.stringify(await state()));
await p.screenshot({ path: 'shots/flow_cleared.png' });
// 2) marcher vers la grille (clavier)
await p.evaluate(() => { const g = window.__game; g.hero.x = 360; g.hero.y = g.bounds.y0 + 60; });
await p.keyboard.down('ArrowUp');
await p.waitForFunction(() => window.__game.roomIndex === 1, null, { timeout: 20000 }).catch(() => {});
await p.keyboard.up('ArrowUp');
await p.waitForTimeout(2500);
console.log('salle suivante', JSON.stringify(await state()));
await p.screenshot({ path: 'shots/flow_room2.png' });
// 3) défaite
await p.evaluate(() => { const g = window.__game; g.hero.hp = 1; g.hero.invulnT = 0; for (const m of g.monsters) { m.state = 'chase'; m.cd = 0; m.hp = 99999; m.x = g.hero.x; m.y = g.hero.y - 30; } });
await p.waitForFunction(() => window.__game.phase === 'dead', null, { timeout: 60000 }).catch(() => {});
await p.waitForSelector('.overlay:not([hidden])', { timeout: 30000 }).catch(() => {});
console.log('défaite', JSON.stringify(await state()), 'écran:', await p.evaluate(() => document.querySelector('.overlay h2')?.textContent));
await p.screenshot({ path: 'shots/flow_dead.png' });
await p.click('.overlay .btn');
await p.waitForTimeout(3000);
console.log('recommencé', JSON.stringify(await state()));
// 4) pause
await p.click('.pause');
await p.waitForTimeout(500);
console.log('pause:', await p.evaluate(() => document.querySelector('.overlay h2')?.textContent));
console.log(errors.length ? errors.join('\n') : 'aucune erreur console');
await b.close();
