// Paramètres : réinitialisation demandée par Enzo (une fois, copie gardée), copies de sauvegarde, restauration, réinitialisation, import.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://localhost:5173' });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push('[console] ' + m.text()); });
const ready = async () => {
  await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
  await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 });
};
const level = () => p.$eval('.camp-name .lvl', (e) => e.textContent);
await p.goto('http://localhost:5173/');
await ready();
// la partie d'Enzo avant cette version : niveau 40, 6 étapes
await p.evaluate(async () => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  localStorage.clear();
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 30, wins: 12, bestRoom: 9, bestWinTime: 200, xp: 0, resources: {}, profile: { ...pr.defaultProfile(), xp: pr.XP_TABLE[40] }, inventory: inv.starterInventory(), done: ['champs', 'paturages', 'foret', 'cimetiere', 'crypte', 'cite'], area: 'cite' }));
});
await p.reload();
await ready();
await p.waitForSelector('.overlay:not([hidden])', { timeout: 5000 }).catch(() => {});
console.log('après la mise à jour :', await level(), '| message :', await p.$eval('.overlay', (e) => e.hidden ? '(aucun)' : e.textContent.trim()));
await p.screenshot({ path: 'shots/param_reset_auto.png' });
await p.click('.overlay .btn').catch(() => {});
await p.click('.camp-gear');
await p.waitForTimeout(300);
console.log('copies :', await p.$$eval('.st-row .st-info', (e) => e.map((x) => x.textContent.trim()).join(' | ')));
await p.screenshot({ path: 'shots/param_menu.png' });
await p.$eval('.st-about', (e) => e.scrollIntoView());
await p.screenshot({ path: 'shots/param_menu_bas.png' });
// restaurer l'ancienne partie
await p.click('.st-row .st-restore');
await p.waitForTimeout(200);
await p.screenshot({ path: 'shots/param_confirm.png' });
await Promise.all([p.waitForNavigation(), p.click('.st-row .st-yes')]);
await ready();
await p.waitForTimeout(600);
console.log('après restauration :', await level(), '| réinitialisée encore ?', await p.$eval('.overlay', (e) => e.hidden ? 'non' : e.textContent));
// copie manuelle, copier le texte, import refusé, puis réinitialisation
await p.click('.camp-gear');
await p.click('.st-new');
await p.waitForTimeout(150);
console.log('message :', await p.$eval('.st-msg', (e) => e.textContent), '| copies :', await p.$$eval('.st-row', (e) => e.length));
await p.click('.st-copy');
await p.waitForTimeout(200);
console.log('copier :', await p.$eval('.st-msg', (e) => e.textContent), '| presse-papiers JSON :', await p.evaluate(async () => { try { return !!JSON.parse(await navigator.clipboard.readText()).profile; } catch { return false; } }));
await p.fill('.st-text', 'pas une sauvegarde');
await p.click('.st-import');
await p.click('.st-yes[data-act="import"]');
await p.waitForTimeout(150);
console.log('import refusé :', await p.$eval('.st-msg', (e) => e.textContent));
await p.click('.st-reset');
await p.screenshot({ path: 'shots/param_reset_confirm.png' });
await Promise.all([p.waitForNavigation(), p.click('.st-yes[data-act="reset"]')]);
await ready();
await p.waitForTimeout(500);
console.log('après réinitialisation :', await level());
await p.click('.camp-gear');
console.log('copies :', await p.$$eval('.st-row .st-info b', (e) => e.map((x) => x.textContent).join(', ')));
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
