// Lance le jeu en mode démo (pilote automatique), attend qu'il soit prêt, puis prend des captures
// aux instants demandés et affiche l'état du monde.
// node tools/play.mjs <prefixe> <t1,t2,...(s)> [largeur] [hauteur]
import { chromium } from 'playwright-core';
const [prefix, times = '2,4', w = '390', h = '844'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
const errors = [];
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text()); if (m.type() === 'warning') errors.push('[warn] ' + m.text()); });
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
await p.goto('http://localhost:5173/?demo');
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
let last = 0;
for (const t of times.split(',').map(Number)) {
  await p.waitForTimeout((t - last) * 1000);
  last = t;
  await p.screenshot({ path: `${prefix}_${t}.png` });
  console.log(t + 's', await p.evaluate(() => { const g = window.__game; return JSON.stringify({ room: g.roomIndex + 1, phase: g.phase, hp: g.hero.hp, mons: g.monsters.map((m) => m.def.art[0] + ':' + m.state).join(' ') }); }));
}
console.log(errors.length ? errors.join('\n') : 'aucune erreur console');
await b.close();
