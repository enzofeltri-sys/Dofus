// Teste l'étape 8a : raretés, fusion (identiques, panoplie, Légendaire avec Crânes), brisage en runes.
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
// le toast est figé pour la photo (les captures prennent plusieurs secondes ici)
const toast = async () => {
  await p.waitForTimeout(150);
  return p.evaluate(() => document.querySelector('.toast').textContent);
};
const save = () => p.evaluate(() => JSON.parse(localStorage.getItem('dofus-enzo-save')));
const rar = (s, id) => s.inventory.items.filter((i) => i.id === id).map((i) => i.rarity ?? 0);

await p.goto('http://localhost:5173/');
await p.evaluate(() => localStorage.clear());
await p.reload();
await ready();
await p.evaluate(async () => {
  const inv = await import('/src/game/inventory.ts');
  const f = await import('/src/game/forge.ts');
  let i = inv.starterInventory();
  for (let k = 0; k < 3; k++) i = f.addNew(i, 16500, 0, Math.random); // 3 Casques Communs → Rare
  for (const id of [16500, 16501, 16502]) i = f.addNew(i, id, 1, Math.random); // panoplie Rare → Épique
  for (const id of [16500, 16501, 16502]) i = f.addNew(i, id, 2, Math.random); // panoplie Épique → Légendaire (Crânes)
  i = f.addNew(i, 787, 0, Math.random); // Anneau Rexik à briser
  i = f.addNew(i, 16501, 4, Math.random); // une Cape Mythique pour voir le rendu
  const s = { v: 3, runs: 5, wins: 2, bestRoom: 9, bestWinTime: 220, xp: 0, jobXp: 0, profile: { xp: 9000, carac: {} }, inventory: i,
    resources: { 16525: 5, 310: 4 } };
  localStorage.setItem('dofus-enzo-save', JSON.stringify(s));
});
await p.reload();
await ready();
await p.evaluate(() => {
  const t = document.querySelector('.toast');
  t.style.animation = 'none';
  new MutationObserver(() => { if (t.hidden && t.textContent) t.hidden = false; }).observe(t, { attributes: true });
});
await p.click('.nav-tab[data-sec="equip"]');
await p.click('.inv .sec-tab[data-panel="atelier"]');
await p.click('.at-tabs .gr-tab[data-t="1"]');
await p.waitForTimeout(150);
console.log('fusion — lignes :', await p.evaluate(() => document.querySelectorAll('.at-row.fg').length), '· possibles :', await p.evaluate(() => document.querySelectorAll('.at-row.fg .fz-go').length));
await shot('forge_fusion_list');

// 1) Casque Commun → Rare (3 identiques)
let s0 = await save();
const casqueC = s0.inventory.items.find((i) => i.id === 16500 && !(i.rarity ?? 0));
await p.click(`.at-row.fg[data-uid="${casqueC.uid}"] .fz-go`);
await p.waitForTimeout(150);
console.log('fenêtre :', await p.evaluate(() => document.querySelector('.at-modal .det-sub').textContent), '· choisis :', await p.evaluate(() => document.querySelectorAll('.fz-partners .sel').length));
await shot('forge_fusion_modal');
await p.click('.at-modal .fz-ok');
console.log('→', await toast());
let s1 = await save();
console.log('Casques :', JSON.stringify(rar(s1, 16500)), '· jobXp', s1.jobXp);

// 2) Panoplie Épique → Légendaire (+3 Crânes)
const capeE = s1.inventory.items.find((i) => i.id === 16501 && i.rarity === 2);
await p.click(`.at-row.fg[data-uid="${capeE.uid}"] .fz-go`);
await p.waitForTimeout(150);
console.log('coût :', await p.evaluate(() => document.querySelector('.fz-cost').textContent.trim()), '· règle :', await p.evaluate(() => document.querySelector('.at-modal .det-src .gr-label').textContent));
await shot('forge_fusion_leg');
await p.click('.at-modal .fz-ok');
console.log('→', await toast());
let s2 = await save();
const leg = s2.inventory.items.find((i) => i.uid === capeE.uid);
console.log('Cape :', leg.rarity, JSON.stringify(leg.bonus), '· Crânes restants', s2.resources[16525]);

// 3) Brisage de l'Anneau Rexik
await p.click('.at-tabs .gr-tab[data-t="2"]');
await p.waitForTimeout(150);
const rexik = s2.inventory.items.find((i) => i.id === 787);
await p.click(`.at-row.fg[data-uid="${rexik.uid}"] .br-go`);
await p.waitForTimeout(150);
console.log('aperçu :', await p.evaluate(() => [...document.querySelectorAll('.br-rune')].map((r) => r.textContent.trim()).join(' / ')));
await shot('forge_break');
await p.click('.at-modal .br-ok');
console.log('→', await toast());
const s3 = await save();
console.log('runes en stock :', JSON.stringify(Object.fromEntries(Object.entries(s3.resources).filter(([k]) => ![16525, 310].includes(Number(k))))), '· Rexik restant :', s3.inventory.items.some((i) => i.id === 787));
// les objets portés sont protégés
console.log('portés brisables :', await p.evaluate(() => [...document.querySelectorAll('.at-row.fg')].filter((r) => r.textContent.includes('porté') && r.querySelector('.br-go')).length));
await p.click('.at-tabs .gr-tab[data-t="3"]');
await p.click('.atelier .sh-head .close');

// inventaire : cadres de rareté, fiche Légendaire
await p.evaluate(() => { document.querySelector('.toast').hidden = true; document.querySelector('.toast').textContent = ''; });
await p.click('.nav-tab[data-sec="equip"]');
await p.waitForTimeout(200);
await p.evaluate(() => document.querySelector('.inv-tabs').scrollIntoView());
await shot('forge_inv');
await p.click(`.inv-grid .inv-cell[data-uid="${capeE.uid}"]`);
console.log('fiche :', await p.evaluate(() => document.querySelector('.inv-detail .det-sub').textContent), '|', await p.evaluate(() => [...document.querySelectorAll('.inv-detail .det-lines > div')].map((d) => d.textContent.trim()).join(' / ')));
await shot('forge_detail');
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
