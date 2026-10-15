// Teste la recherche : inventaire (texte, abréviations, stat, niveau), favoris / verrou, Encyclopédie, liens vers l'Atelier.
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
const shot = (name) => p.screenshot({ path: `shots/${name}.png` });
const type = async (sel, text) => {
  await p.fill(sel, '');
  await p.type(sel, text);
  await p.waitForTimeout(100);
};
const cells = () => p.evaluate(() => [...document.querySelectorAll('.inv-grid .inv-cell')].map((c) => c.dataset.uid ?? c.dataset.res ?? c.dataset.cat));
const count = () => p.evaluate(() => document.querySelector('.inv .flt-count').textContent);

await p.goto('http://localhost:5173/');
await p.evaluate(() => localStorage.clear());
await p.reload();
await ready();
// sauvegarde : équipement de départ + pièces de Kardorim + anneaux d'Incarnam, ressources
await p.evaluate(async () => {
  const inv = await import('/src/game/inventory.ts');
  let i = inv.starterInventory();
  for (const id of [16500, 16501, 16502, 787, 787, 852]) i = inv.addItem(i, id, inv.rollItem(id, Math.random));
  const s = { v: 3, runs: 5, wins: 2, bestRoom: 9, bestWinTime: 220, xp: 0, jobXp: 0, profile: { xp: 2000, carac: {} }, inventory: i,
    resources: { 310: 14, 16524: 11, 16663: 9, 16525: 5, 303: 22, 312: 12, 16512: 4 } };
  localStorage.setItem('dofus-enzo-save', JSON.stringify(s));
});
await p.reload();
await ready();
await p.click('.nav-tab[data-sec="equip"]');
await p.waitForTimeout(200);
console.log('équipements :', await count());

// texte + abréviation
await type('.inv .flt-q input', 'agi');
console.log('« agi » :', await count(), '| valeurs :', await p.evaluate(() => [...document.querySelectorAll('.inv-grid .fv')].map((e) => e.textContent).join(' ')));
await type('.inv .flt-q input', 'kardorim fo');
console.log('« kardorim fo » :', await count(), '| portés allumés :', await p.evaluate(() => document.querySelectorAll('.inv-slot.hit').length));
await type('.inv .flt-q input', 'fo>10');
console.log('« fo>10 » :', await count());
await type('.inv .flt-q input', '');
// menu : stat + niveau
await p.click('.inv .flt-toggle');
await p.selectOption('.inv [data-f="stat"]', 'chance');
console.log('stat Chance :', await count(), '| tri :', await p.evaluate(() => document.querySelector('.inv [data-f="sort"]').value), '| valeurs :', await p.evaluate(() => [...document.querySelectorAll('.inv-grid .fv')].map((e) => e.textContent).join(' ')));
await p.fill('.inv [data-f="max"]', '10');
await p.dispatchEvent('.inv [data-f="max"]', 'change');
console.log('Chance + niveau ≤ 10 :', await count());
await shot('search_inv');
await p.click('.inv .flt-clear');
console.log('après effacer :', await count());

// favori sur un objet → en tête
const last = (await cells()).at(-1);
await p.click(`.inv-grid .inv-cell[data-uid="${last}"]`);
await p.click('.inv-detail .mark.fav');
await p.click('.inv-detail .mark.lock');
await p.click('.inv-detail .det-close');
console.log('favori en tête :', (await cells())[0] === last, '| marques :', await p.evaluate(() => document.querySelectorAll('.inv-grid .mks svg').length));

// ressource verrouillée → Atelier
await p.click('.inv-tabs .gr-tab[data-t="1"]');
await p.click('.inv-grid .inv-cell[data-res="303"]');
await p.click('.inv-detail .mark.lock');
console.log('note :', await p.evaluate(() => document.querySelector('.det-note').textContent), '| provenance :', await p.evaluate(() => [...document.querySelectorAll('.det-src div')].map((d) => d.textContent).join(' / ')));
await shot('search_res');
await p.click('.inv-detail [data-go^="uses:"]');
await p.waitForTimeout(200);
console.log('atelier filtré :', await p.evaluate(() => document.querySelector('.atelier .flt-special').textContent.trim()), '|', await p.evaluate(() => [...document.querySelectorAll('.at-row')].map((r) => r.querySelector('b').textContent + ' → ' + (r.querySelector('.at-why')?.textContent ?? 'ok')).join(' ; ')));
await shot('search_atelier');
await p.click('.atelier .sh-head .close');

// Encyclopédie
await p.click('.inv-tabs .gr-tab[data-t="2"]');
console.log('encyclopédie objets :', await count());
await type('.inv .flt-q input', 'do terre');
console.log('« do terre » :', await count(), (await cells()).length);
await p.click('.inv-grid [data-mode="1"]');
await type('.inv .flt-q input', 'agi');
console.log('panoplies « agi » :', await count(), '|', await p.evaluate(() => [...document.querySelectorAll('.set-row')].map((r) => r.querySelector('.set-head').textContent.replace(/\s+/g, ' ').trim()).join(' ; ')));
await shot('search_sets');
await type('.inv .flt-q input', 'kardorim');
await p.click('.set-row .inv-cell[data-cat="16502"]');
console.log('fiche :', await p.evaluate(() => document.querySelector('.det-sub').textContent), '|', await p.evaluate(() => [...document.querySelectorAll('.det-src div')].map((d) => d.textContent).join(' / ')), '| liens :', await p.evaluate(() => [...document.querySelectorAll('.det-links button')].map((d) => d.textContent).join(', ')));
await shot('search_cat');
await p.click('.inv-detail .det-close');
await p.click('.inv .sh-head .close');

const save = await p.evaluate(() => JSON.parse(localStorage.getItem('dofus-enzo-save')));
console.log('sauvegarde : favoris', save.inventory.items.filter((i) => i.fav).length, '· verrous', save.inventory.items.filter((i) => i.lock).length, '· ressources verrouillées', JSON.stringify(save.resMarks.lock));
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
