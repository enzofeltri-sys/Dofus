// Maquette (proposition à Enzo) : nouvel écran Équipement — fusions prêtes en tête, liste par emplacement avec « mieux / moins bien ».
// Rendue avec les vraies icônes et polices du jeu ; rien n'est branché.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1240, height: 900 }, deviceScaleFactor: 2 });
await p.goto('http://localhost:5173/');
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.evaluate(async () => {
  const { ITEMS, fmtLine } = await import('/src/game/data/items.ts');
  const { itemIconUrl } = await import('/src/ui/item-icons.ts');
  const ic = (id, s = 40) => `<img src="${itemIconUrl(id)}" style="width:${s}px;height:${s}px;object-fit:contain">`;
  const all = Object.values(ITEMS).filter((d) => d.effects.length);
  const pick = (slot, lv) => all.filter((d) => d.slot === slot && d.level === lv);
  // trouve un niveau avec 3 anneaux
  const lv = [26, 25, 27, 24, 28, 22, 30].find((l) => pick('anneau', l).length >= 3);
  const rings = pick('anneau', lv).slice(0, 3);
  const others = all.filter((d) => d.slot === 'anneau' && d.level >= 18 && d.level <= 32 && d.level !== lv).slice(0, 3);
  const worn = { chapeau: all.find((d) => d.slot === 'chapeau' && d.level >= 20 && d.level <= 30), cape: all.find((d) => d.slot === 'cape' && d.level >= 20 && d.level <= 30), amulette: all.find((d) => d.slot === 'amulette' && d.level >= 20 && d.level <= 30), anneau: others[2], anneau2: null, ceinture: all.find((d) => d.slot === 'ceinture' && d.level >= 15 && d.level <= 30), bottes: all.find((d) => d.slot === 'bottes' && d.level >= 15 && d.level <= 30), arme: all.find((d) => d.slot === 'arme' && d.level >= 15 && d.level <= 30), bouclier: null, familier: null };
  const stats = (d, n = 2) => d.effects.filter(([, a, b]) => b > 0).slice(0, n).map(([p, a, b]) => fmtLine(p, b)).join(' · ');
  const RAR = ['#8a7a5a', '#2f9a8a', '#7a4ec0', '#d08a1a', '#c0402a'];
  const row = (d, r, tag, sel = false) => `<div class="mq-row ${sel ? 'sel' : ''}">
      <span class="mq-ic" style="box-shadow: inset 0 0 0 2.5px ${RAR[r]}">${ic(d.id, 38)}</span>
      <div class="mq-txt"><b>${d.name}</b><small><span style="color:${RAR[r]};font-weight:800">${['Commun', 'Rare', 'Épique'][r]}</span> · niv. ${d.level} · ${stats(d)}</small></div>
      ${tag}</div>`;
  const up = (t) => `<span class="mq-tag up">▲ ${t}</span>`, down = (t) => `<span class="mq-tag down">▼ ${t}</span>`, worn1 = '<span class="mq-tag worn">Porté</span>';
  const slots = ['chapeau', 'cape', 'amulette', 'anneau', 'anneau2', 'ceinture', 'bottes', 'arme', 'bouclier', 'familier'];
  const NAMES = { chapeau: 'Chapeau', cape: 'Cape', amulette: 'Amulette', anneau: 'Anneau', anneau2: 'Anneau', ceinture: 'Ceinture', bottes: 'Bottes', arme: 'Arme', bouclier: 'Bouclier', familier: 'Familier' };
  const strip = slots.map((s) => `<div class="mq-slot ${s === 'anneau2' ? 'on' : ''} ${worn[s] ? 'full' : ''}">${worn[s] ? ic(worn[s].id, 34) : `<span>${NAMES[s]}</span>`}${s === 'anneau2' ? '<i class="mq-dot">3</i>' : ''}</div>`).join('');
  const chips = ['Tout', 'Chapeau', 'Cape', 'Amulette', 'Anneau', 'Ceinture', 'Bottes', 'Arme'].map((c) => `<span class="mq-chip ${c === 'Anneau' ? 'on' : ''}">${c}${c === 'Anneau' ? ' 6' : ''}</span>`).join('');
  const phone = (title, body) => `<div class="mq-phone"><div class="mq-cap">${title}</div><div class="mq-screen">${body}</div></div>`;

  const s1 = `
    <div class="mq-head"><h2>Équipement</h2><span class="mq-k">2 500 K</span><span class="mq-x">Fermer</span></div>
    <div class="mq-tabs"><span class="on">Équipement</span><span>Ressources</span><span>Artisanat</span></div>
    <div class="mq-strip">${strip}</div>
    <div class="mq-dofus">Dofus 0 / 6 ›   ·   Panoplies (1) ›</div>
    <div class="mq-fz"><div class="mq-fzt">✦ Fusions prêtes</div>
      <div class="mq-fzr"><span class="mq-tri">${rings.map((d) => ic(d.id, 26)).join('')}</span><div><b>3 anneaux niv. ${lv}</b><small>Commun → <span style="color:${RAR[1]};font-weight:800">Rare</span> · garde le meilleur</small></div><span class="mq-btn magic">Fusionner</span></div>
    </div>
    <div class="mq-chips">${chips}</div>
    <div class="mq-sort">Trier : <b>meilleur d'abord</b> ▾ <span class="mq-purge">Épurer le sac</span></div>
    ${row(rings[0], 0, up('Mieux'), true)}
    ${row(rings[1], 0, up('Mieux'))}
    ${row(others[2], 0, worn1)}
    ${row(others[0], 1, down('Moins bien'))}
    ${row(rings[2], 0, down('Moins bien'))}
    ${row(others[1], 0, down('Moins bien'))}`;

  const d = rings[0], w = others[2];
  const cmp = d.effects.filter(([, , bb]) => bb > 0).slice(0, 4).map(([pp, , bb]) => {
    const old = w.effects.find(([q]) => q === pp)?.[2] ?? 0;
    const diff = bb - old;
    return `<div class="mq-cmp"><span>${fmtLine(pp, bb)}</span><b class="${diff > 0 ? 'g' : diff < 0 ? 'r' : ''}">${diff > 0 ? '+' : ''}${diff || '='}</b></div>`;
  }).join('') + w.effects.filter(([q, , bb]) => bb > 0 && !d.effects.some(([x]) => x === q)).slice(0, 2).map(([pp, , bb]) => `<div class="mq-cmp"><span class="lost">${fmtLine(pp, bb)}</span><b class="r">−${bb}</b></div>`).join('');
  const s2 = `
    <div class="mq-dim"></div>
    <div class="mq-sheet">
      <div class="mq-grab"></div>
      <div class="mq-sh-head"><span class="mq-ic big">${ic(d.id, 56)}</span><div><h3>${d.name}</h3><small>Commun · Anneau · niveau ${d.level}</small></div><span class="mq-star">☆</span><span class="mq-star">🔒</span></div>
      <div class="mq-vs">Comparé à ton anneau porté : <b>${w.name}</b></div>
      ${cmp}
      <div class="mq-verdict up">▲ Mieux dans l'ensemble</div>
      <div class="mq-big">Équiper</div>
      <div class="mq-acts">
        <div class="mq-act magic"><b>Fusionner</b><small>2 anneaux niv. ${lv} prêts ✓</small></div>
        <div class="mq-act blue"><b>Forgemagie</b><small>runes · kamas</small></div>
        <div class="mq-act coral"><b>Briser</b><small>≈ 4 runes</small></div>
      </div>
      <div class="mq-note">Tout en un seul endroit : plus de mode « Fusion » ou « Briser » à activer.</div>
    </div>`;
  const s3 = `
    <div class="mq-head"><h2>Fusion</h2><span class="mq-x">Annuler</span></div>
    <div class="mq-fbig">
      <div class="mq-fcol">${rings.map((dd, i) => `<div class="mq-fc ${i === 0 ? 'keep' : ''}">${ic(dd.id, 44)}<small>${i === 0 ? 'gardé' : 'sacrifié'}</small></div>`).join('<span class="mq-plus">+</span>')}</div>
      <div class="mq-arrow">▼</div>
      <div class="mq-fres">${ic(rings[0].id, 64)}<div><b>${rings[0].name}</b><small style="color:${RAR[1]};font-weight:800">Rare</small></div></div>
      <div class="mq-cmp"><span>${fmtLine(d.effects[0][0], d.effects[0][2])}</span><b class="g">→ ${Math.round(d.effects[0][2] * 1.15)}</b></div>
      <div class="mq-cmp"><span>${d.effects[1] ? fmtLine(d.effects[1][0], d.effects[1][2]) : ''}</span><b class="g">${d.effects[1] ? `→ ${Math.round(d.effects[1][2] * 1.15)}` : ''}</b></div>
      <div class="mq-note">Le jeu garde l’anneau aux meilleurs jets et sacrifie les 2 autres (jamais un objet porté, favori ou verrouillé). « Changer » pour choisir à la main.</div>
      <div class="mq-big magic">Fusionner</div>
      <div class="mq-link">Changer les objets</div>
    </div>`;
  document.body.innerHTML = `<style>
    body{margin:0;background:#3a2414;font-family:var(--f-body);color:#3b2414}
    .mq-wrap{display:flex;gap:26px;padding:22px;align-items:flex-start}
    .mq-phone{width:375px}.mq-cap{color:#f3e6c8;font-family:var(--f-display);font-size:19px;margin:0 0 8px 4px}
    .mq-screen{position:relative;height:780px;overflow:hidden;border-radius:26px;background:#f1e4c6;padding:14px;box-sizing:border-box;box-shadow:0 0 0 4px #1d120a}
    .mq-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}.mq-head h2{font-family:var(--f-display);font-size:26px;margin:0;flex:1}
    .mq-k{background:#f6dc8c;border-radius:20px;padding:3px 10px;font-weight:800;box-shadow:inset 0 0 0 2px #3b2414;font-size:13px}
    .mq-x{border-radius:12px;padding:5px 12px;font-family:var(--f-display);box-shadow:inset 0 0 0 2.5px #3b2414;background:#fbf3e0}
    .mq-tabs{display:flex;background:#d9c8a2;border-radius:14px;padding:3px;margin-bottom:10px}.mq-tabs span{flex:1;text-align:center;padding:7px 0;font-family:var(--f-display);font-size:15px;color:#6b5236}.mq-tabs .on{background:#fbf3e0;border-radius:11px;color:#3b2414;box-shadow:inset 0 0 0 2px #3b2414}
    .mq-strip{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.mq-slot{position:relative;height:52px;border-radius:12px;background:#e6d5b0;display:grid;place-items:center;box-shadow:inset 0 0 0 2px rgba(59,36,20,.25)}.mq-slot span{font-size:10px;color:#8a7458}.mq-slot.full{background:#fbf3e0}.mq-slot.on{box-shadow:inset 0 0 0 3px #2f9a8a}
    .mq-dot{position:absolute;top:-6px;right:-6px;background:#c0502a;color:#fff;font-style:normal;font-size:11px;font-weight:800;border-radius:10px;padding:1px 6px}
    .mq-dofus{font-size:12px;color:#6b5236;margin:7px 2px 9px;font-weight:700}
    .mq-fz{background:#fff4cf;border-radius:14px;padding:8px 10px;box-shadow:inset 0 0 0 2px #d9a93a;margin-bottom:9px}.mq-fzt{font-family:var(--f-display);font-size:15px;color:#7a4ec0;margin-bottom:4px}
    .mq-fzr{display:flex;align-items:center;gap:8px}.mq-fzr div{flex:1;display:flex;flex-direction:column}.mq-fzr small{font-size:11px}.mq-tri{display:flex}.mq-tri img{margin-right:-8px}
    .mq-btn{border-radius:11px;padding:6px 10px;font-family:var(--f-display);color:#fff;font-size:14px}.magic{background:#7a4ec0}
    .mq-chips{display:flex;gap:6px;overflow:hidden;margin-bottom:7px}.mq-chip{white-space:nowrap;padding:5px 10px;border-radius:14px;background:#e6d5b0;font-size:12px;font-weight:700}.mq-chip.on{background:#3b2414;color:#fbf3e0}
    .mq-sort{font-size:12px;margin:0 2px 6px;display:flex;align-items:center;gap:4px}.mq-purge{margin-left:auto;padding:3px 9px;border-radius:10px;box-shadow:inset 0 0 0 2px #3b2414;font-weight:800;background:#fbf3e0}
    .mq-row{display:flex;align-items:center;gap:9px;background:#fbf3e0;border-radius:12px;padding:6px 8px;margin-bottom:5px}.mq-row.sel{box-shadow:inset 0 0 0 2.5px #3b2414}
    .mq-ic{width:46px;height:46px;border-radius:10px;display:grid;place-items:center;background:#f3e6c8;flex:none}.mq-ic.big{width:66px;height:66px}
    .mq-txt{flex:1;min-width:0;display:flex;flex-direction:column}.mq-txt b{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mq-txt small{font-size:11px;color:#6b5236;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mq-tag{font-size:11px;font-weight:800;border-radius:9px;padding:3px 7px;white-space:nowrap}.mq-tag.up{background:#d5efc0;color:#2c7a1a}.mq-tag.down{background:#eadfca;color:#8a7458}.mq-tag.worn{background:#3b2414;color:#fbf3e0}
    .mq-dim{position:absolute;inset:0;background:rgba(30,18,8,.45)}
    .mq-sheet{position:absolute;left:0;right:0;bottom:0;background:#fbf3e0;border-radius:24px 24px 0 0;padding:10px 16px 18px;box-shadow:0 -4px 0 #d9a93a}
    .mq-grab{width:46px;height:5px;border-radius:3px;background:#c9b48c;margin:0 auto 10px}
    .mq-sh-head{display:flex;align-items:center;gap:10px}.mq-sh-head div{flex:1}.mq-sh-head h3{margin:0;font-family:var(--f-display);font-size:20px}.mq-sh-head small{color:#6b5236}.mq-star{font-size:20px}
    .mq-vs{font-size:12px;margin:10px 0 4px;color:#6b5236}
    .mq-cmp{display:flex;justify-content:space-between;padding:5px 2px;border-bottom:1px dashed #d9c8a2;font-size:15px;font-weight:700}.mq-cmp .g{color:#2c7a1a}.mq-cmp .r{color:#c0402a}.mq-cmp .lost{color:#a08a6a;text-decoration:line-through}
    .mq-verdict{margin:8px 0;text-align:center;font-weight:800;border-radius:10px;padding:5px}.mq-verdict.up{background:#d5efc0;color:#2c7a1a}
    .mq-big{background:#2f9a8a;color:#fff;text-align:center;font-family:var(--f-display);font-size:21px;border-radius:14px;padding:11px;box-shadow:inset 0 0 0 2.5px #3b2414;margin:6px 0}.mq-big.magic{background:#7a4ec0}
    .mq-acts{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.mq-act{border-radius:12px;padding:7px 4px;text-align:center;color:#fff;display:flex;flex-direction:column}.mq-act b{font-family:var(--f-display);font-size:14px;font-weight:400}.mq-act small{font-size:10px;opacity:.9}.blue{background:#3a8ac0}.coral{background:#c0502a}
    .mq-note{font-size:11.5px;color:#6b5236;margin-top:8px;line-height:1.35}
    .mq-fbig{display:flex;flex-direction:column;align-items:stretch;gap:6px;margin-top:20px}.mq-fcol{display:flex;justify-content:center;align-items:center;gap:6px}
    .mq-fc{width:78px;height:86px;border-radius:14px;background:#fbf3e0;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:inset 0 0 0 2px rgba(59,36,20,.25)}.mq-fc.keep{box-shadow:inset 0 0 0 3px #2f9a8a}.mq-fc small{font-size:11px;font-weight:800;color:#6b5236}
    .mq-plus{font-family:var(--f-display);font-size:22px}.mq-arrow{text-align:center;font-size:22px;color:#7a4ec0}
    .mq-fres{display:flex;align-items:center;gap:12px;justify-content:center;background:#fbf3e0;border-radius:16px;padding:10px;box-shadow:inset 0 0 0 3px #2f9a8a}.mq-fres div{display:flex;flex-direction:column}.mq-fres b{font-family:var(--f-display);font-size:18px;font-weight:400}
    .mq-link{text-align:center;font-weight:800;text-decoration:underline;font-size:13px}
  </style><div class="mq-wrap">${phone('1 · Écran Équipement', s1)}${phone('2 · Fiche d’un objet', s1 + s2)}${phone('3 · Fusion en un geste', s3)}</div>`;
});
await p.waitForTimeout(800);
await p.screenshot({ path: 'docs/maquette-equipement.png', clip: { x: 0, y: 0, width: 1240, height: 860 } });
await b.close();
