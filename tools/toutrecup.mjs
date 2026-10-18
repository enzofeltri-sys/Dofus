// Bestiaire : « Tout récupérer » récupère tous les paliers prêts de tous les monstres d'un coup.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
const ready = async () => { await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 }); await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 }); };
await p.goto('http://localhost:5173/');
await p.evaluate(() => localStorage.clear());
await p.reload(); await ready();
await p.evaluate(async () => {
  const inv = await import('/src/game/inventory.ts');
  const pr = await import('/src/game/progression.ts');
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 9, wins: 9, bestRoom: 9, bestWinTime: 200, xp: 0, resources: {}, profile: { ...pr.defaultProfile(), xp: pr.XP_TABLE[25] }, inventory: inv.starterInventory(), done: ['champs'], area: 'champs',
    bestiary: { bouftou: { seen: 260, slain: 230, claimed: 1 }, piouRouge: { seen: 120, slain: 110 }, tofu: { seen: 60, slain: 55 } } }));
});
await p.reload(); await ready();
await p.click('.nav-tab[data-sec="bestiaire"]');
await p.waitForTimeout(500);
console.log('bouton :', await p.textContent('.bs-all'));
await p.screenshot({ path: 'shots/bestiaire_tout.png' });
await p.click('.bs-all');
await p.waitForTimeout(200);
console.log('toast :', await p.evaluate(() => document.querySelector('.toast').textContent));
const s = await p.evaluate(() => JSON.parse(localStorage.getItem('dofus-enzo-save')));
console.log('paliers récupérés :', JSON.stringify(Object.fromEntries(Object.entries(s.bestiary).map(([k, v]) => [k, v.claimed ?? 0]))), '| bouton encore là :', !!(await p.$('.bs-all')));
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
