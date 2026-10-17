// Teste le bestiaire : silhouettes, monstres découverts, fiche, filtres par catégorie.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
p.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && errors.push('[console] ' + m.text()));
const ready = async () => {
  await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
  await p.waitForSelector('.camp:not([hidden]) .enter', { timeout: 20000 });
};
await p.goto('http://localhost:5173/');
await p.evaluate(async () => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  const bestiary = { tofu: { seen: 40, slain: 38 }, pissenlit: { seen: 12, slain: 12 }, tournesol: { seen: 3, slain: 2 }, chaferDebutant: { seen: 20, slain: 20 }, kardorim: { seen: 2, slain: 1 }, gloot: { seen: 3, slain: 3 }, ronronchon: { seen: 1, slain: 1 } };
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 9, wins: 6, bestRoom: 9, bestWinTime: 300, xp: 0, jobXp: 0, profile: { xp: pr.XP_TABLE[10], carac: {} },
    inventory: inv.emptyInventory(), resources: {}, done: ['champs'], area: 'champs', bestiary }));
});
await p.reload();
await ready();
await p.click('.nav-tab[data-sec="bestiaire"]');
await p.waitForTimeout(300);
console.log('bestiaire :', await p.evaluate(() => document.querySelector('.bs-count').textContent), '·', await p.evaluate(() => [...document.querySelectorAll('.bs-kinds .flt-chip')].map((c) => c.textContent.trim()).join(' | ')));
await p.screenshot({ path: 'shots/bestiaire.png' });
await p.click('.bs-card[data-id="tournesol"]');
await p.waitForTimeout(200);
console.log('fiche :', await p.evaluate(() => document.querySelector('.bs-detail').textContent.replace(/\s+/g, ' ').trim().slice(0, 300)));
await p.evaluate(() => document.querySelector('.bs-detail').scrollIntoView());
await p.screenshot({ path: 'shots/bestiaire_fiche.png' });
await p.click('.bs-kinds [data-k="boss"]');
await p.waitForTimeout(200);
console.log('boss :', await p.evaluate(() => [...document.querySelectorAll('.bs-card b')].map((x) => x.textContent).join(', ')));
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
