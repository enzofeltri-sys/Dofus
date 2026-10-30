// Capture d'une page HTML locale : node tools/_shot.mjs <page.html> <capture.png> [largeur]
import { chromium } from 'playwright-core';
const [src, out, w] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: +(w ?? 1180), height: 900 } });
await p.goto('file://' + src);
await p.screenshot({ path: out, fullPage: true });
await b.close();
