// Teste la progression : camp (niveau, XP), fiche de caractéristiques, XP en combat, bilan avec montée de niveau.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text()); });
// sauvegarde « v1 » sans profil, juste sous le niveau 11 après migration : on vérifie la migration et la montée de niveau
await p.goto('http://localhost:5173/');
await p.evaluate(() => localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 1, runs: 3, wins: 1, bestRoom: 9, bestWinTime: 300, xp: 0, resources: {} })));
await p.reload();
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.waitForSelector('.camp:not([hidden]) .enter', { timeout: 20000 });
console.log('camp :', await p.evaluate(() => document.querySelector('.camp .lvl').textContent + ' · ' + document.querySelector('.camp-xp .txt').textContent));
await p.screenshot({ path: 'shots/prog_camp.png' });
// fiche : remise à zéro, puis 30 en Force, 10 en Vitalité, 1 en Sagesse (3 points)
await p.click('.sheet-btn');
await p.click('.sheet .reset');
for (let i = 0; i < 3; i++) await p.click('.sh-carac[data-id="force"] .add[data-n="10"]');
await p.click('.sh-carac[data-id="vitalite"] .add[data-n="10"]');
await p.click('.sh-carac[data-id="sagesse"] .add[data-n="1"]'); // 3 points pour 1 : il en reste 2
console.log('fiche :', await p.evaluate(() => [...document.querySelectorAll('.sh-carac')].map((e) => e.dataset.id + '=' + e.querySelector('b').textContent).join(' ') + ' | libres ' + document.querySelector('.sh-free b').textContent));
await p.screenshot({ path: 'shots/prog_sheet.png' });
await p.click('.sh-tabs .gr-tab:nth-child(3)');
await p.screenshot({ path: 'shots/prog_sheet_res.png' });
await p.click('.sheet .close');
console.log('badge :', await p.evaluate(() => document.querySelector('.sheet-btn .badge').hidden ? 'caché' : document.querySelector('.sheet-btn .badge').textContent));
await p.click('.camp .enter');
await p.waitForTimeout(600);
console.log('héros :', await p.evaluate(() => { const g = window.__game; return `niv ${g.hero.def.level} Force ${g.hero.def.stats.force} Vita ${g.hero.def.stats.vitalite} Sagesse ${g.hero.def.stats.sagesse} PV ${g.hero.maxHp}`; }));
// XP en combat : monstres à 1 PV au contact
await p.evaluate(() => { const g = window.__game; for (const m of g.monsters) { m.hp = 1; m.state = 'chase'; m.x = g.hero.x + 50; m.y = g.hero.y; } });
await p.waitForTimeout(700);
await p.screenshot({ path: 'shots/prog_xp.png' });
await p.waitForTimeout(1500);
console.log('XP de la salle :', await p.evaluate(() => window.__game.stats.xp));
// on donne assez d'XP pour monter de niveau, puis défaite
await p.evaluate(() => { const g = window.__game; g.stats.xp += 20000; g.run.slots = g.run.slots.map(() => null); g.run.passives = {}; g.hero.hp = 1; g.hero.invulnT = 0; });
await p.evaluate(() => { const g = window.__game; g.startRoom(1); for (const m of g.monsters) { m.state = 'chase'; m.cd = 0; m.hp = 99999; m.x = g.hero.x; m.y = g.hero.y - 30; } });
await p.waitForSelector('.summary:not([hidden])', { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(900);
console.log('bilan :', await p.evaluate(() => document.querySelector('.sum-xp').textContent.replace(/\s+/g, ' ')));
await p.screenshot({ path: 'shots/prog_summary.png' });
await p.click('.summary .back');
await p.waitForSelector('.camp:not([hidden])');
console.log('camp après :', await p.evaluate(() => document.querySelector('.camp .lvl').textContent + ' · badge ' + document.querySelector('.sheet-btn .badge').textContent));
await p.screenshot({ path: 'shots/prog_camp2.png' });
console.log('sauvegarde :', await p.evaluate(() => localStorage.getItem('dofus-enzo-save')));
console.log(errors.length ? errors.join('\n') : 'aucune erreur');
await b.close();
