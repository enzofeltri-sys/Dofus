// Teste l'étape 8b (forgemagie : runes, puits, overmax, exo) et 9c (clés de donjon au camp).
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
const save = () => p.evaluate(() => JSON.parse(localStorage.getItem('dofus-enzo-save')));

await p.goto('http://localhost:5173/');
await p.evaluate(async () => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  const f = await import('/src/game/forge.ts');
  let i = inv.emptyInventory();
  i = f.addNew(i, 2473, 0, Math.random); // Cape de l'Aventurier
  i = f.addNew(i, 2474, 3, Math.random); // Chapeau Légendaire (grand puits)
  localStorage.setItem('dofus-enzo-save', JSON.stringify({
    v: 5, runs: 9, wins: 6, bestRoom: 9, bestWinTime: 300, xp: 0, jobXp: 400, profile: { xp: pr.XP_TABLE[10], carac: {} }, inventory: i,
    resources: { 1519: 30, 1545: 6, 1549: 6, 1557: 3, 1548: 4, 1554: 2, 16524: 3, 1984: 5 },
    done: ['champs', 'paturages', 'foret', 'cimetiere', 'crypte'], area: 'crypte', keys: { free: 1, day: '2000-01-01' },
  }));
});
await p.reload();
await ready();
console.log('camp (clés) :', await p.evaluate(() => document.querySelector('.camp-dj').textContent.replace(/\s+/g, ' ').trim()));
await p.screenshot({ path: 'shots/keys_camp.png' });

// forgemagie
await p.click('.nav-tab[data-sec="equip"]');
await p.click('.inv .sec-tab[data-panel="atelier"]');
await p.click('.at-tabs .gr-tab[data-t="3"]');
await p.waitForTimeout(200);
console.log('forgemagie — objets :', await p.evaluate(() => document.querySelectorAll('.at-row.fm').length));
await p.screenshot({ path: 'shots/fm_list.png' });
const cape = (await save()).inventory.items.find((x) => x.id === 2473);
await p.click(`.at-row.fm[data-uid="${cape.uid}"]`);
await p.waitForTimeout(200);
console.log('fenêtre :', await p.evaluate(() => [...document.querySelectorAll('.fm-line')].map((l) => l.querySelector('b').textContent + ' (' + (l.querySelector('small')?.textContent ?? '') + ')').join(' | ')));
await p.screenshot({ path: 'shots/fm_modal.png' });
for (let k = 0; k < 8; k++) {
  await p.click('.fm-rune[data-rune="1519"]:not([disabled])').catch(() => {});
  await p.waitForTimeout(80);
}
console.log('résultat :', await p.evaluate(() => document.querySelector('.fm-last')?.textContent), '· puits', await p.evaluate(() => document.querySelector('.fm-puits b').textContent));
const after = (await save()).inventory.items.find((x) => x.id === 2473);
console.log('cape :', JSON.stringify(after.rolls), 'puits', after.puits ?? 0, 'exo', JSON.stringify(after.exo ?? null), '· runes Fo restantes', (await save()).resources['1519']);
await p.screenshot({ path: 'shots/fm_after.png' });
await p.click('.at-modal .md-close');

// clé fabriquée : la Clef de la Crypte apparaît dans l'atelier
await p.click('.at-tabs .gr-tab[data-t="0"]');
await p.waitForTimeout(150);
console.log('clef fabricable :', await p.evaluate(() => [...document.querySelectorAll('.at-row')].some((r) => r.textContent.includes('Clef de la Crypte'))));
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
