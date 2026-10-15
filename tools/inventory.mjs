// Teste l'étape 6 : inventaire au camp, fiche d'objet et comparaison, équiper, butin en jeu, butin au bilan.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text()); });
const ready = async () => {
  await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
  await p.waitForSelector('.camp:not([hidden]) .enter', { timeout: 20000 });
};
await p.goto('http://localhost:5173/');
await p.evaluate(() => localStorage.clear());
await p.reload();
await ready();
await p.screenshot({ path: 'shots/inv_camp.png' });
await p.click('.nav-tab[data-sec="equip"]');
await p.waitForTimeout(300);
await p.screenshot({ path: 'shots/inv_start.png' });
console.log('départ :', await p.evaluate(() => [...document.querySelectorAll('.inv-set')].map((e) => e.textContent.trim()).join(' | ')));
await p.click('.inv .sh-head .close');
// sauvegarde : niveau 12, panoplie Kardorim et Chapeau de l'Aventurier dans le sac, des ressources
await p.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('dofus-enzo-save') ?? 'null') ?? {};
  const g = window.__game;
  s.profile = s.profile ?? { xp: 0, carac: { vitalite: 0, sagesse: 0, force: 45, intelligence: 0, chance: 0, agilite: 0 } };
  s.profile.xp = 5000000; // niveau ≥ 12 quelle que soit la table
  // sauvegarde pas encore écrite : équipement de départ (uid 1 à 5, portés)
  const inv = s.inventory ?? { items: [[2473, 'cape'], [2475, 'anneau1'], [2476, 'bottes'], [2477, 'ceinture'], [2478, 'amulette']].map(([id], i) => ({ uid: i + 1, id, rolls: id === 2475 ? [2, 2, 2, 2] : [5, 5, 5, 5] })), equipped: { cape: 1, anneau1: 2, bottes: 3, ceinture: 4, amulette: 5 }, nextUid: 6 };
  s.inventory = inv;
  for (const [id, rolls] of [[16500, [14, 2]], [16501, [9, 8]], [16502, [13, 2]], [2474, [5, 5, 5, 5]]]) inv.items.push({ uid: inv.nextUid++, id, rolls });
  s.resources = { 310: 12, 16524: 7, 16663: 5, 16525: 1, 16513: 3 };
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 4, runs: 1, wins: 0, bestRoom: 3, bestWinTime: null, xp: 0, ...s }));
});
await p.reload();
await ready();
await p.click('.nav-tab[data-sec="equip"]');
await p.waitForTimeout(200);
await p.click('.inv-cell[data-uid="6"]');
await p.waitForTimeout(300);
console.log('fiche casque :', await p.evaluate(() => document.querySelector('.det-card').innerText.replace(/\n+/g, ' / ')));
await p.screenshot({ path: 'shots/inv_detail.png' });
await p.click('.det-card .act');
await p.click('.det-close');
for (const uid of [7, 8]) {
  await p.click(`.inv-cell[data-uid="${uid}"]`);
  await p.click('.det-card .act');
  await p.click('.det-close');
}
console.log('panoplies :', await p.evaluate(() => [...document.querySelectorAll('.inv-set')].map((e) => e.textContent.trim()).join(' | ')));
await p.screenshot({ path: 'shots/inv_kardorim.png' });
await p.click('.inv-tabs .gr-tab[data-t="1"]');
await p.screenshot({ path: 'shots/inv_res.png' });
await p.click('.inv .sh-head .close');
await p.click('.nav-tab[data-sec="perso"]');
console.log('fiche perso :', await p.evaluate(() => [...document.querySelectorAll('.sh-carac')].map((e) => e.dataset.id + '=' + e.querySelector('b').textContent).join(' ')));
await p.click('.sheet .close');
await p.click('.camp .enter');
await p.waitForTimeout(800);
console.log('héros :', await p.evaluate(() => { const s = window.__game.hero.def.stats; return `PV ${window.__game.hero.maxHp} Fo ${s.force} Cha ${s.chance} Vi ${s.vitalite}`; }));
// butin en jeu : monstres à 1 PV au contact, prospection énorme pour voir des drops
await p.evaluate(() => { const g = window.__game; g.hero.def.stats.prospection = 2000; for (const m of g.monsters) { m.hp = 1; m.state = 'chase'; m.x = g.hero.x + 50; m.y = g.hero.y; } });
await p.waitForTimeout(900);
await p.screenshot({ path: 'shots/inv_drops.png' });
await p.waitForTimeout(1500);
console.log('butin de la partie :', await p.evaluate(() => JSON.stringify(window.__game.stats.loot)));
await p.evaluate(() => { const g = window.__game; g.run.slots = g.run.slots.map(() => null); g.run.passives = {}; g.hero.hp = 1; g.hero.invulnT = 0; g.startRoom(1); for (const m of g.monsters) { m.state = 'chase'; m.cd = 0; m.hp = 99999; m.x = g.hero.x; m.y = g.hero.y - 30; } });
await p.waitForSelector('.summary:not([hidden])', { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(700);
console.log('bilan :', await p.evaluate(() => document.querySelectorAll('.sum-item').length + ' objets'));
await p.screenshot({ path: 'shots/inv_summary.png' });
await p.click('.summary .back');
await p.waitForSelector('.camp:not([hidden])');
console.log('badge inventaire :', await p.evaluate(() => { const bd = document.querySelector('.nav-tab[data-sec="equip"] .badge'); return bd.hidden ? 'caché' : bd.textContent; }));
console.log(errors.length ? errors.join('\n') : 'aucune erreur');
await b.close();
