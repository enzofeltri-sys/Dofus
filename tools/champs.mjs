// Teste l'étape 9a : nouveau joueur (niveau 1, mains nues) au camp, écran Donjons, combat dans les Champs d'Incarnam.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
p.on('console', (m) => m.type() === 'error' && errors.push('[console] ' + m.text()));
const ready = async () => {
  await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
  await p.waitForSelector('.camp:not([hidden]) .enter', { timeout: 20000 });
};
await p.goto('http://localhost:5173/');
await p.evaluate(() => localStorage.clear());
await p.reload();
await ready();
console.log('camp :', await p.evaluate(() => document.querySelector('.camp .lvl').textContent + ' · ' + document.querySelector('.camp-dj').textContent.replace(/\s+/g, ' ').trim()));
await p.screenshot({ path: 'shots/champs_camp.png' });
await p.click('.nav-tab[data-sec="donjons"]');
await p.waitForTimeout(200);
console.log('arbre :', await p.evaluate(() => [...document.querySelectorAll('.atlas-node')].map((n) => n.querySelector('b').textContent + ' [' + [...n.classList].filter((c) => ['done', 'open', 'locked', 'soon'].includes(c)) + ']').join(' → ')));
await p.screenshot({ path: 'shots/champs_atlas.png' });
await p.click('.atlas .sh-head .close');
await p.click('.camp .enter');
await p.waitForTimeout(3500);
console.log('combat :', await p.evaluate(() => { const g = window.__game; return { zone: g.area.name, salle: g.roomIndex + 1, monstres: g.monsters.map((m) => m.def.name).join(', '), arme: g.hero.def.weapon.name, niveau: g.hero.def.level, pv: g.hero.hp }; }));
await p.screenshot({ path: 'shots/champs_fight.png' });
// fin de carte : on saute à la salle de l'élite
await p.evaluate(() => { const g = window.__game; g.startRoom(4); });
await p.waitForTimeout(2500);
console.log('élite :', await p.evaluate(() => { const g = window.__game; return g.elite?.def.name + ' grade ' + g.elite?.grade + ' · ' + document.querySelector('.plaque').textContent.replace(/\s+/g, ' ').trim(); }));
await p.screenshot({ path: 'shots/champs_elite.png' });
// victoire : on achève l'élite et ses accompagnants
await p.evaluate(() => { const g = window.__game; for (const m of g.monsters) { m.hp = 0; m.state = 'dead'; m.t = 0; } g.reserve = []; });
await p.waitForTimeout(3000);
console.log('erreurs :', errors.join(' | '));
console.log('état :', await p.evaluate(() => { const g = window.__game; return { phase: g.phase, pv: g.hero.hp, vivants: g.monsters.filter((m) => m.state !== 'dead').length, overlays: [...document.querySelectorAll('.summary,.overlay,.picker')].map((e) => e.className + ':' + e.hidden).join(' ') }; }));
await p.waitForSelector('.summary:not([hidden])', { timeout: 90000 });
console.log('bilan :', await p.evaluate(() => document.querySelector('.summary h2').textContent + ' — ' + document.querySelector('.sum-sub').textContent + ' | ' + document.querySelector('.sum-loot').textContent));
await p.screenshot({ path: 'shots/champs_victory.png' });
await p.click('.summary .back');
await p.waitForTimeout(400);
console.log('sauvegarde :', await p.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('dofus-enzo-save')).done)), '| pastille Donjons :', await p.evaluate(() => document.querySelector('.nav-tab[data-sec="donjons"] .badge').textContent));
await p.click('.nav-tab[data-sec="donjons"]');
await p.click('.atlas-node[data-id="crypte"]');
await p.waitForTimeout(300);
console.log('camp :', await p.evaluate(() => document.querySelector('.camp-dj').textContent.replace(/\s+/g, ' ').trim()));
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
