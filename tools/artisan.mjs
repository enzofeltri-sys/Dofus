// Teste l'étape 7 : atelier de l'Artisan (recettes, ingrédients, fabrication, XP, objet dans l'inventaire).
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
const ready = async () => {
  await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
  await p.waitForSelector('.camp:not([hidden]) .enter', { timeout: 20000 });
};
await p.goto('http://localhost:5173/');
await p.evaluate(() => localStorage.clear());
await p.reload();
await ready();
// sauvegarde avec des ressources de la Crypte et d'Incarnam
await p.evaluate(() => {
  const s = { v: 5, runs: 5, wins: 2, bestRoom: 9, bestWinTime: 220, xp: 0, jobXp: 0,
    resources: { 310: 14, 16524: 11, 16663: 9, 16525: 5, 303: 22, 312: 12, 16513: 6, 16512: 4, 1984: 4, 421: 3 } };
  localStorage.setItem('dofus-enzo-save', JSON.stringify(s));
});
await p.reload();
await ready();
await p.screenshot({ path: 'shots/art_camp.png' });
await p.click('.nav-tab[data-sec="equip"]');
await p.click('.inv .sec-tab[data-panel="atelier"]');
await p.waitForTimeout(200);
console.log('disponibles :', await p.evaluate(() => document.querySelectorAll('.at-row').length));
await p.screenshot({ path: 'shots/art_list.png' });
// fabrique une Planche Agglomérée (×max) puis un objet
const plank = await p.$('.at-row[data-id="16489"] .mk:last-child');
if (plank) await plank.click();
await p.waitForTimeout(300);
console.log('après planches :', await p.evaluate(() => document.querySelector('.toast').textContent));
const first = await p.$('.at-row:not(.off) .at-ico');
await first.click();
await p.waitForTimeout(200);
// la capture d'écran prend plusieurs secondes ici : on fige le message pour la photo
await p.evaluate(() => { const t = document.querySelector('.toast'); t.style.animation = 'none'; new MutationObserver(() => { if (t.hidden) t.hidden = false; }).observe(t, { attributes: true }); });
await p.click('.at-row.open .mk');
await p.waitForTimeout(450);
await p.screenshot({ path: 'shots/art_toast.png' });
console.log('fabrication :', await p.evaluate(() => document.querySelector('.toast').textContent), '|', await p.evaluate(() => document.querySelector('.atelier .lvl').textContent));
await p.screenshot({ path: 'shots/art_done.png' });
await p.click('.atelier .sh-head .close');
await p.click('.nav-tab[data-sec="equip"]');
await p.waitForTimeout(200);
console.log('inventaire :', await p.evaluate(() => document.querySelectorAll('.inv-cell').length + ' objets, nouveaux : ' + document.querySelectorAll('.inv-cell.fresh').length));
await p.click('.inv-tabs .gr-tab[data-t="1"]');
await p.screenshot({ path: 'shots/art_inv.png' });
console.log('sauvegarde jobXp :', await p.evaluate(() => JSON.parse(localStorage.getItem('dofus-enzo-save')).jobXp));
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
