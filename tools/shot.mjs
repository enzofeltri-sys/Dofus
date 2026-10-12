// Capture d'écran d'une page du serveur de dev : node tools/shot.mjs <url> <fichier> [largeur] [hauteur] [attente ms]
import { chromium } from 'playwright-core';
const [url, out, w = '1280', h = '800', wait = '1200'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(+wait);
await page.screenshot({ path: out });
if (errors.length) console.log(errors.join('\n')); else console.log('no console errors');
await browser.close();
