import '@fontsource/baloo-2/700.css';
import '@fontsource/baloo-2/800.css';
import { Application, Container, Graphics, Sprite, Text, Texture, ImageSource } from 'pixi.js';
import { chaferSvg, CHAFER_FOOT, CHAFER_W, CHAFER_H, type ChaferKind } from './art/chafer';
import { bones, candles, CANDLE_FLAMES, lootBone, pillar, rubble, sarcophagus, type PropArt } from './art/props';
import { sacrieurSvg, sacrieurSwordSvg, SACRIEUR_FOOT, SACRIEUR_W, SACRIEUR_H, SWORD_GRIP, SWORD_W, SWORD_H } from './art/sacrieur';
import { TILE_H, TILE_W, toScreen } from './iso';
import { cryptRoomSvg, ORIGIN, ROOM_N, TORCHES } from './scene/cryptRoom';
import { svgTexture } from './svg';
import { Hud, SPELL_BAR } from './ui/hud';

/**
 * TEST DE STYLE — une salle de la Crypte de Kardorim.
 * But : valider la direction artistique (personnages, décor, lumière, interface)
 * sur téléphone en portrait. Le combat est une démonstration, pas encore le vrai moteur.
 */

const params = new URLSearchParams(location.search);
const DEMO = params.has('demo');
const CHAR_SCALE = 0.78;

const fromScreen = (sx: number, sy: number) => ({
  x: (sx / (TILE_W / 2) + sy / (TILE_H / 2)) / 2,
  y: (sy / (TILE_H / 2) - sx / (TILE_W / 2)) / 2,
});
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

/** Texture « halo » : dégradé radial blanc → transparent, teinté à l'usage. */
function glowTexture(size = 128): Texture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return new Texture({ source: new ImageSource({ resource: c }) });
}

/** Voile de vignettage (bords sombres de la crypte), en espace écran. */
function vignetteTexture(w: number, h: number): Texture {
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(w / 2));
  c.height = Math.max(2, Math.round(h / 2));
  const g = c.getContext('2d')!;
  const r = Math.hypot(c.width, c.height) / 2;
  const grd = g.createRadialGradient(c.width / 2, c.height * 0.48, r * 0.35, c.width / 2, c.height * 0.48, r);
  grd.addColorStop(0, 'rgba(10,6,14,0)');
  grd.addColorStop(1, 'rgba(10,6,14,0.78)');
  g.fillStyle = grd;
  g.fillRect(0, 0, c.width, c.height);
  return new Texture({ source: new ImageSource({ resource: c }) });
}

interface Actor {
  c: Container;
  body: Sprite;
  flash: Sprite;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  kind: ChaferKind | 'sacrieur' | 'kardorim';
  flashT: number;
  phase: number;
  hpBar?: Graphics;
  // IA de démonstration
  atkT: number;
  tele?: { t: number; dur: number; dx: number; dy: number; shape: 'circle' | 'cone' | 'line' };
  knock: { x: number; y: number };
  dead: number;
  alpha: number;
}

interface Floater { t: Text; life: number; vy: number; x: number; y: number }
interface Fx { g: Graphics; life: number; max: number; draw: (g: Graphics, k: number) => void }
interface Particle { s: Sprite; vx: number; vy: number; life: number; max: number; grow: number; a0: number }

async function main() {
  await Promise.all([document.fonts.load('800 20px "Baloo 2"'), document.fonts.load('700 20px "Baloo 2"')]);

  const app = new Application();
  await app.init({
    resizeTo: window,
    background: '#120e14',
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 3),
    autoDensity: true,
  });
  document.getElementById('game')!.appendChild(app.canvas);
  const hud = new Hud(document.getElementById('hud')!);

  // ---- Zoom : en portrait, ~4,6 cases de large à l'écran (cadrage Archero). ----
  const computeZoom = () => Math.min(1.25, Math.max(0.6, window.innerWidth / (TILE_W * 4.6)));
  let zoom = computeZoom();
  const RES = Math.min(3.2, Math.max(1, (window.devicePixelRatio || 1) * zoom * 1.1));

  // ---- Chargement de l'art vectoriel ----
  const [roomTex, sacriTex, swordTex, lootTex, ...rest] = await Promise.all([
    svgTexture(cryptRoomSvg(), RES),
    svgTexture(sacrieurSvg(), RES * CHAR_SCALE),
    svgTexture(sacrieurSwordSvg(), RES * CHAR_SCALE),
    svgTexture(lootBone().svg, RES),
    ...(['debutant', 'furtif', 'piquier', 'sergent'] as ChaferKind[]).map((k) => svgTexture(chaferSvg(k), RES * CHAR_SCALE)),
  ]);
  const chaferTex: Record<ChaferKind, Texture> = { debutant: rest[0], furtif: rest[1], piquier: rest[2], sergent: rest[3] };
  const glow = glowTexture();

  // ---- Scène ----
  const world = new Container();
  app.stage.addChild(world);
  const bg = new Sprite(roomTex);
  bg.position.set(-ORIGIN.x, -ORIGIN.y);
  bg.tint = 0xcfc6d6; // ambiance froide et sombre de la crypte
  world.addChild(bg);
  const ground = new Graphics(); // auras, télégraphes
  world.addChild(ground);
  const actors = new Container();
  actors.sortableChildren = true;
  world.addChild(actors);
  const fxLayer = new Container();
  world.addChild(fxLayer);
  const lights = new Container();
  lights.blendMode = 'add';
  world.addChild(lights);
  const floatLayer = new Container();
  world.addChild(floatLayer);

  const vignette = new Sprite(vignetteTexture(window.innerWidth, window.innerHeight));
  app.stage.addChild(vignette);

  const place = (o: Container, x: number, y: number) => {
    const p = toScreen(x, y);
    o.position.set(p.x, p.y);
    o.zIndex = p.y;
  };

  // ---- Décor posé ----
  const colliders: { x: number; y: number; r: number }[] = [];
  const flames: { g: Graphics; x: number; y: number; s: number; ph: number }[] = [];
  const glows: { s: Sprite; base: number; ph: number; spd: number }[] = [];

  const addGlow = (sx: number, sy: number, color: number, scale: number, alpha: number) => {
    const s = new Sprite(glow);
    s.anchor.set(0.5);
    s.position.set(sx, sy);
    s.tint = color;
    s.scale.set(scale);
    s.alpha = alpha;
    lights.addChild(s);
    glows.push({ s, base: alpha, ph: Math.random() * 10, spd: rand(7, 11) });
    return s;
  };

  async function addProp(art: PropArt, x: number, y: number, r: number, scale = 1) {
    const tex = await svgTexture(art.svg, RES * scale);
    const s = new Sprite(tex);
    s.anchor.set(art.foot[0] / tex.width / scale, art.foot[1] / tex.height / scale);
    s.scale.set(scale);
    s.tint = 0xe2dae6;
    const c = new Container();
    c.addChild(s);
    place(c, x, y);
    actors.addChild(c);
    if (r > 0) colliders.push({ x, y, r });
    return c;
  }

  await Promise.all([
    addProp(pillar(), 4.2, 2.3, 0.55, 0.9),
    addProp(pillar(), 7.8, 2.3, 0.55, 0.9),
    addProp(sarcophagus(), 1.9, 6.4, 0.95),
    addProp(bones(), 8.9, 7.6, 0),
    addProp(bones(), 1.4, 3.2, 0),
    addProp(rubble(), 6.8, 9.8, 0),
    addProp(rubble(), 9.6, 1.6, 0),
  ]);
  for (const [cx, cy] of [[3.0, 4.6], [9.6, 4.2]] as const) {
    const c = await addProp(candles(), cx, cy, 0, 0.9);
    for (const [fx, fy] of CANDLE_FLAMES) {
      const g = new Graphics();
      c.addChild(g);
      flames.push({ g, x: fx * 0.9, y: fy * 0.9, s: 0.55, ph: Math.random() * 10 });
    }
    const p = toScreen(cx, cy);
    addGlow(p.x, p.y - 30, 0xffb050, 2.2, 0.5);
  }
  // Torches murales : flamme + grand halo chaud.
  for (const t of TORCHES) {
    const sx = t.x - ORIGIN.x, sy = t.y - ORIGIN.y;
    const g = new Graphics();
    g.position.set(sx, sy);
    lights.parent!.addChildAt(g, lights.parent!.getChildIndex(lights));
    flames.push({ g, x: 0, y: 0, s: 1.15, ph: Math.random() * 10 });
    addGlow(sx, sy, 0xff9a3a, 4.2, 0.32);
    addGlow(sx, sy - 4, 0xffd890, 1.1, 0.35); // cœur de la flamme
    addGlow(sx, sy + 120, 0xff8a2a, 3.6, 0.12); // lumière portée au sol
  }
  // Lueur spectrale verte autour du sarcophage.
  const sarcoP = toScreen(1.9, 6.4);
  const ghostGlow = addGlow(sarcoP.x, sarcoP.y - 20, 0x6dff8a, 3.4, 0.16);
  // Lumière de la porte (sortie).
  const doorP = toScreen(6, 0);
  addGlow(doorP.x, doorP.y - 60, 0xffd27a, 3.6, 0.18);

  // ---- Personnages ----
  const mkActor = (tex: Texture, foot: [number, number], w: number, h: number, kind: Actor['kind'], x: number, y: number, hp: number): Actor => {
    const c = new Container();
    const shadow = new Graphics().ellipse(0, 0, 34 * CHAR_SCALE * (kind === 'sacrieur' ? 1.05 : 1), 13 * CHAR_SCALE).fill({ color: 0x000000, alpha: 0.35 });
    c.addChild(shadow);
    const body = new Sprite(tex);
    body.anchor.set(foot[0] / w, foot[1] / h);
    body.scale.set(CHAR_SCALE);
    c.addChild(body);
    const flash = new Sprite(tex);
    flash.anchor.copyFrom(body.anchor);
    flash.scale.set(CHAR_SCALE);
    flash.blendMode = 'add';
    flash.alpha = 0;
    c.addChild(flash);
    const a: Actor = { c, body, flash, x, y, hp, maxHp: hp, kind, flashT: 0, phase: Math.random() * 10, atkT: rand(1, 3), knock: { x: 0, y: 0 }, dead: 0, alpha: 1 };
    if (kind !== 'sacrieur') {
      a.hpBar = new Graphics();
      a.hpBar.position.set(0, -h * CHAR_SCALE * 0.98);
      c.addChild(a.hpBar);
    }
    place(c, x, y);
    actors.addChild(c);
    return a;
  };

  const player = mkActor(sacriTex, SACRIEUR_FOOT, SACRIEUR_W, SACRIEUR_H, 'sacrieur', 5.6, 6.2, 180);
  player.hp = 148;
  const sword = new Sprite(swordTex);
  sword.anchor.set(SWORD_GRIP[0] / SWORD_W, SWORD_GRIP[1] / SWORD_H);
  sword.scale.set(CHAR_SCALE);
  const HAND = { x: (100 - SACRIEUR_FOOT[0]) * CHAR_SCALE, y: (123 - SACRIEUR_FOOT[1]) * CHAR_SCALE };
  sword.position.set(HAND.x, HAND.y);
  sword.rotation = 0.5;
  player.c.addChildAt(sword, 1);

  const spawnSpots: [ChaferKind, number, number][] = [
    ['debutant', 6.6, 4.4],
    ['furtif', 3.6, 7.6],
    ['piquier', 8.3, 6.0],
    ['sergent', 5.0, 8.9],
  ];
  const enemies: Actor[] = spawnSpots.map(([k, x, y]) =>
    mkActor(chaferTex[k], CHAFER_FOOT, CHAFER_W, CHAFER_H, k, x, y, k === 'sergent' ? 70 : 46),
  );
  enemies[0].hp = 30;
  enemies[3].hp = 52;

  // Butin au sol.
  const loots: { s: Sprite; x: number; y: number; t: number }[] = [];
  const dropLoot = (x: number, y: number) => {
    const s = new Sprite(lootTex);
    s.anchor.set(0.5, 0.8);
    const c = new Container();
    c.addChild(s);
    place(c, x, y);
    actors.addChild(c);
    const gl = addGlow(c.x, c.y - 6, 0xfff0a0, 0.9, 0.5);
    loots.push({ s, x, y, t: 0 });
    void gl;
  };
  dropLoot(7.3, 8.1);

  // ---- Particules (poussière, braises, sang) ----
  const particles: Particle[] = [];
  const emit = (sx: number, sy: number, color: number, o: Partial<{ vx: number; vy: number; life: number; size: number; grow: number; alpha: number; add: boolean }> = {}) => {
    const s = new Sprite(glow);
    s.anchor.set(0.5);
    s.position.set(sx, sy);
    s.tint = color;
    const size = o.size ?? 0.12;
    s.scale.set(size);
    s.alpha = o.alpha ?? 1;
    if (o.add !== false) s.blendMode = 'add';
    fxLayer.addChild(s);
    particles.push({ s, vx: o.vx ?? 0, vy: o.vy ?? 0, life: o.life ?? 1, max: o.life ?? 1, grow: o.grow ?? 0, a0: o.alpha ?? 1 });
  };
  // poussière flottante permanente
  const dust: { s: Sprite; x: number; y: number; vx: number; vy: number; ph: number }[] = [];
  for (let i = 0; i < 46; i++) {
    const p = toScreen(rand(0, ROOM_N), rand(0, ROOM_N));
    const s = new Sprite(glow);
    s.anchor.set(0.5);
    s.scale.set(rand(0.03, 0.07));
    s.tint = 0xfff1d0;
    s.blendMode = 'add';
    lights.addChild(s);
    dust.push({ s, x: p.x, y: p.y - rand(20, 160), vx: rand(-6, 6), vy: rand(-8, -2), ph: rand(0, 10) });
  }

  // ---- Effets ----
  const fxs: Fx[] = [];
  const addFx = (max: number, draw: Fx['draw'], x = 0, y = 0) => {
    const g = new Graphics();
    g.position.set(x, y);
    fxLayer.addChild(g);
    fxs.push({ g, life: max, max, draw });
  };

  const floaters: Floater[] = [];
  const numberAt = (x: number, y: number, txt: string, color: string, big = false) => {
    const t = new Text({
      text: txt,
      style: {
        fontFamily: 'Baloo 2',
        fontWeight: '800',
        fontSize: big ? 40 : 30,
        fill: color,
        stroke: { color: '#2a0806', width: 6, join: 'round' },
        dropShadow: { color: '#000000', alpha: 0.5, blur: 2, distance: 2, angle: Math.PI / 2 },
      },
    });
    t.anchor.set(0.5);
    t.resolution = RES * 1.2;
    floatLayer.addChild(t);
    floaters.push({ t, life: 1.0, vy: -70, x: x + rand(-14, 14), y });
  };

  let shake = 0;
  const playerSpell = { power: 0, powerT: 0 };
  let suffering = 3;
  let sufferDecay = 0;

  const hitEnemy = (e: Actor, base: number, opts: { crit?: boolean; knock?: number } = {}) => {
    const crit = opts.crit ?? Math.random() < 0.15;
    const dmg = Math.round(base * (1 + playerSpell.power / 100) * (1 + suffering * 0.04) * (crit ? 1.5 : 1));
    e.hp -= dmg;
    e.flashT = 0.16;
    const dx = e.x - player.x, dy = e.y - player.y, d = Math.hypot(dx, dy) || 1;
    const k = opts.knock ?? 0.22;
    e.knock.x += (dx / d) * k;
    e.knock.y += (dy / d) * k;
    const p = toScreen(e.x, e.y);
    numberAt(p.x, p.y - 110 * CHAR_SCALE, `-${dmg}`, crit ? '#ffb02e' : '#ff4a3d', crit);
    for (let i = 0; i < 6; i++) emit(p.x, p.y - 60 * CHAR_SCALE, crit ? 0xffd070 : 0xffffff, { vx: rand(-120, 120), vy: rand(-160, -40), life: 0.35, size: 0.08 });
    if (crit) shake = Math.max(shake, 6);
    if (e.hp <= 0) killEnemy(e);
  };

  const killEnemy = (e: Actor) => {
    e.dead = 0.001;
    const p = toScreen(e.x, e.y);
    for (let i = 0; i < 16; i++) emit(p.x, p.y - 50, 0xe8dcc0, { vx: rand(-140, 140), vy: rand(-200, -40), life: 0.6, size: 0.1, add: false });
    dropLoot(e.x + 0.3, e.y + 0.2);
  };

  // ---- Entrées : joystick tactile (n'importe où dans la moitié basse) + clavier ----
  const input = { x: 0, y: 0, active: false, lastT: 0 };
  let joyOrigin = { x: 0, y: 0 };
  const JOY_R = 50;
  const placeJoyIdle = () => {
    const y = window.innerHeight - hud.bottomInset() - 90;
    hud.joy.style.left = `${window.innerWidth / 2}px`;
    hud.joy.style.top = `${y}px`;
    hud.placeHint(y - 92);
    hud.knob.style.transform = '';
  };
  placeJoyIdle();
  app.canvas.addEventListener('pointerdown', (ev) => {
    input.active = true;
    joyOrigin = { x: ev.clientX, y: ev.clientY };
    hud.joy.classList.add('on');
    hud.joy.classList.remove('idle');
    hud.joy.style.left = `${ev.clientX}px`;
    hud.joy.style.top = `${ev.clientY}px`;
    hud.hint.style.opacity = '0';
    app.canvas.setPointerCapture(ev.pointerId);
  });
  app.canvas.addEventListener('pointermove', (ev) => {
    if (!input.active) return;
    let dx = ev.clientX - joyOrigin.x, dy = ev.clientY - joyOrigin.y;
    const d = Math.hypot(dx, dy);
    if (d > JOY_R) { dx = (dx / d) * JOY_R; dy = (dy / d) * JOY_R; }
    hud.knob.style.transform = `translate(${dx}px, ${dy}px)`;
    const m = Math.min(1, d / (JOY_R * 0.6));
    input.x = d > 6 ? (dx / Math.hypot(dx, dy)) * m : 0;
    input.y = d > 6 ? (dy / Math.hypot(dx, dy)) * m : 0;
  });
  const release = () => {
    input.active = false;
    input.x = input.y = 0;
    hud.joy.classList.remove('on');
    hud.joy.classList.add('idle');
    placeJoyIdle();
  };
  app.canvas.addEventListener('pointerup', release);
  app.canvas.addEventListener('pointercancel', release);
  const keys = new Set<string>();
  addEventListener('keydown', (e) => keys.add(e.key.toLowerCase()));
  addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

  // ---- Combat de démonstration ----
  let pa = 6;
  const PA_MAX = 6;
  let weaponT = 0.4;
  let swingT = 0;
  let facing = 1;
  const cds = [0, 1.2, 2.4, 6];
  const CD = [2.6, 3.2, 5.5, 14];
  let time = 0;

  const nearest = (maxD: number, minD = 0) => {
    let best: Actor | null = null, bd = Infinity;
    for (const e of enemies) {
      if (e.dead) continue;
      const d = dist(e, player);
      if (d >= minD && d <= maxD && d < bd) { bd = d; best = e; }
    }
    return best;
  };

  const castSpells = () => {
    for (let i = 0; i < SPELL_BAR.length; i++) {
      if (cds[i] > 0 || pa < SPELL_BAR[i].cost) continue;
      const pp = toScreen(player.x, player.y);
      if (i === 0) {
        // Supplice : vol de vie Terre au corps à corps — pics de terre sous la cible.
        const t = nearest(1.7);
        if (!t) continue;
        const tp = toScreen(t.x, t.y);
        // Pics de pierre qui jaillissent du sol en couronne autour de la cible.
        const spikes = [...Array(7)].map((_, j) => ({ a: (j / 7) * Math.PI * 2 + rand(-0.2, 0.2), h: rand(26, 40) }))
          .sort((p, q) => Math.sin(p.a) - Math.sin(q.a)); // ceux du fond d'abord
        addFx(0.5, (g, k) => {
          g.clear();
          const rise = Math.min(1, (1 - k) * 4);
          const fade = k > 0.3 ? 1 : k / 0.3;
          g.ellipse(0, 0, 50, 24).fill({ color: 0x3e2410, alpha: 0.35 * fade });
          for (const sp of spikes) {
            const ox = Math.cos(sp.a) * 42, oy = Math.sin(sp.a) * 20;
            const h = sp.h * rise * fade;
            g.poly([ox - 8, oy, ox - 1, oy - h, ox + 8, oy]).fill({ color: 0x9a6a36 }).stroke({ width: 2.5, color: 0x3e2410, join: 'round' });
            g.poly([ox - 1, oy - h, ox + 8, oy, ox + 2, oy]).fill({ color: 0x6e4620 });
          }
        }, tp.x, tp.y);
        for (let j = 0; j < 10; j++) emit(tp.x + rand(-40, 40), tp.y + rand(-10, 10), 0x8a6a46, { vy: rand(-140, -60), vx: rand(-40, 40), life: 0.5, size: 0.07, add: false });
        hitEnemy(t, rand(15, 20));
        heal(5);
      } else if (i === 1) {
        // Absorption : orbe de sang qui part vers la cible, vol de vie Feu.
        const t = nearest(6.2, 1);
        if (!t) continue;
        const start = { x: pp.x, y: pp.y - 80 * CHAR_SCALE };
        const target = t;
        addFx(0.42, (g, k) => {
          const tp = toScreen(target.x, target.y);
          const u = 1 - k;
          const x = start.x + (tp.x - start.x) * u, y = start.y + (tp.y - 70 * CHAR_SCALE - start.y) * u - Math.sin(u * Math.PI) * 40;
          g.clear().circle(x, y, 9).fill({ color: 0xff3a2a }).circle(x - 2, y - 3, 3.5).fill({ color: 0xffd0a0 });
          emit(x, y, 0xff5030, { life: 0.3, size: 0.16, vx: rand(-20, 20), vy: rand(-20, 20) });
          if (k <= 0.03 && !target.dead) {
            hitEnemy(target, rand(18, 24), { knock: 0.1 });
            heal(9);
          }
        });
      } else if (i === 2) {
        // Attirance : chaîne qui ramène un ennemi éloigné.
        const t = nearest(8, 2.2);
        if (!t) continue;
        const target = t;
        const from = { x: target.x, y: target.y };
        const dx = player.x - from.x, dy = player.y - from.y, d = Math.hypot(dx, dy);
        const to = { x: from.x + (dx / d) * (d - 1.1), y: from.y + (dy / d) * (d - 1.1) };
        addFx(0.4, (g, k) => {
          const u = 1 - k;
          const e = u < 0.4 ? 0 : (u - 0.4) / 0.6;
          target.x = from.x + (to.x - from.x) * e * e;
          target.y = from.y + (to.y - from.y) * e * e;
          const a = toScreen(player.x, player.y), b = toScreen(target.x, target.y);
          const reach = u < 0.4 ? u / 0.4 : 1;
          const bx = a.x + (b.x - a.x) * reach, by = a.y - 60 + (b.y - 60 - (a.y - 60)) * reach;
          g.clear().moveTo(a.x, a.y - 60).lineTo(bx, by).stroke({ width: 5, color: 0x3a4450 }).moveTo(a.x, a.y - 60).lineTo(bx, by).stroke({ width: 2, color: 0xd8e2ea });
          g.circle(bx, by, 6).fill({ color: 0xc4202a });
        });
        const tp = toScreen(target.x, target.y);
        numberAt(tp.x, tp.y - 120 * CHAR_SCALE, 'Attiré !', '#d8e2ea');
      } else if (i === 3) {
        // Mutilation : sacrifie de la vie, gagne de la Puissance (aura rouge).
        if (player.hp < 60) continue;
        player.hp -= 12;
        playerSpell.power = 40;
        playerSpell.powerT = 6;
        numberAt(pp.x, pp.y - 150 * CHAR_SCALE, '-12', '#ff4a3d');
        numberAt(pp.x, pp.y - 185 * CHAR_SCALE, '+40 Puissance', '#ffb02e');
        addFx(0.6, (g, k) => {
          g.clear().ellipse(0, 0, 90 * (1 - k) + 20, 40 * (1 - k) + 10).stroke({ width: 8 * k, color: 0xff2a3a, alpha: k });
        }, pp.x, pp.y);
        for (let j = 0; j < 18; j++) emit(pp.x + rand(-30, 30), pp.y - rand(20, 110), 0xff2030, { vy: rand(-120, -40), life: 0.7, size: 0.09 });
        suffering = Math.min(10, suffering + 2);
      }
      pa -= SPELL_BAR[i].cost;
      cds[i] = CD[i];
      hud.flashCast(i);
      return; // un sort à la fois
    }
  };

  const heal = (n: number) => {
    const real = Math.min(n, player.maxHp - player.hp);
    if (real <= 0) return;
    player.hp += real;
    const p = toScreen(player.x, player.y);
    numberAt(p.x + 20, p.y - 150 * CHAR_SCALE, `+${real}`, '#5ee86a');
  };

  const hurtPlayer = (n: number) => {
    player.hp = Math.max(25, player.hp - n); // test de style : on ne meurt pas
    player.flashT = 0.2;
    suffering = Math.min(10, suffering + 1);
    sufferDecay = 0;
    const p = toScreen(player.x, player.y);
    numberAt(p.x - 18, p.y - 150 * CHAR_SCALE, `-${n}`, '#ff4a3d');
    shake = Math.max(shake, 7);
  };

  // ---- Boucle ----
  let cam = { x: 0, y: 0 };
  const camTarget = () => {
    const p = toScreen(player.x, player.y);
    // le point de vue est centré dans la zone utile (entre le haut et la barre du bas)
    const top = hud.topInset(), bottom = window.innerHeight - hud.bottomInset();
    const cy = (top + bottom) / 2 + 30;
    return { x: window.innerWidth / 2 - p.x * zoom, y: cy - (p.y - 50) * zoom };
  };
  cam = camTarget();

  app.ticker.add((tk) => {
    const dt = Math.min(0.05, tk.deltaMS / 1000);
    time += dt;

    // Déplacement
    let ix = input.x, iy = input.y;
    if (keys.has('arrowleft') || keys.has('q') || keys.has('a')) ix -= 1;
    if (keys.has('arrowright') || keys.has('d')) ix += 1;
    if (keys.has('arrowup') || keys.has('z') || keys.has('w')) iy -= 1;
    if (keys.has('arrowdown') || keys.has('s')) iy += 1;
    if (DEMO && !input.active && keys.size === 0) {
      // pilote automatique pour les captures : petit tour autour du centre
      const tx = 5.4 + Math.cos(time * 0.5) * 1.6, ty = 6.0 + Math.sin(time * 0.5) * 1.3;
      const s = toScreen(tx - player.x, ty - player.y);
      const m = Math.hypot(s.x, s.y);
      if (m > 4) { ix = (s.x / m) * 0.7; iy = (s.y / m) * 0.7; }
    }
    const im = Math.hypot(ix, iy);
    const moving = im > 0.05;
    if (moving) {
      if (im > 1) { ix /= im; iy /= im; }
      const SPEED = 230; // px écran / s
      const w = fromScreen(ix * SPEED * dt, iy * SPEED * dt * 0.75);
      let nx = player.x + w.x, ny = player.y + w.y;
      nx = Math.max(0.55, Math.min(ROOM_N - 0.45, nx));
      ny = Math.max(0.55, Math.min(ROOM_N - 0.45, ny));
      for (const c of colliders) {
        const dx = nx - c.x, dy = ny - c.y, d = Math.hypot(dx, dy), r = c.r + 0.3;
        if (d < r) { nx = c.x + (dx / d) * r; ny = c.y + (dy / d) * r; }
      }
      player.x = nx; player.y = ny;
      if (Math.abs(ix) > 0.15) facing = ix > 0 ? 1 : -1;
    }

    // PA, cooldowns, Souffrance
    pa = Math.min(PA_MAX, pa + dt * 1.7);
    for (let i = 0; i < cds.length; i++) { cds[i] = Math.max(0, cds[i] - dt); hud.setCooldown(i, cds[i] / CD[i]); }
    sufferDecay += dt;
    if (sufferDecay > 2.5 && suffering > 0) { suffering--; sufferDecay = 0; }
    if (playerSpell.powerT > 0) { playerSpell.powerT -= dt; if (playerSpell.powerT <= 0) playerSpell.power = 0; }
    castSpells();

    // Arme : attaque automatique (même en mouvement)
    weaponT -= dt;
    const target = nearest(1.6);
    if (target) facing = toScreen(target.x - player.x, target.y - player.y).x >= 0 ? 1 : -1;
    if (weaponT <= 0 && target) {
      weaponT = 0.72;
      swingT = 0.24;
      const pp = toScreen(player.x, player.y), tp = toScreen(target.x, target.y);
      const ang = Math.atan2(tp.y - pp.y, tp.x - pp.x);
      addFx(0.2, (g, k) => {
        g.clear();
        const r = 70 * CHAR_SCALE + 26;
        const a0 = ang - 1.3, a1 = ang + 1.1;
        const head = a0 + (a1 - a0) * Math.min(1, (1 - k) * 2.2);
        for (let j = 0; j < 4; j++) {
          g.arc(0, 0, r - j * 5, a0 + (head - a0) * (j * 0.18), head).stroke({ width: 9 - j * 2, color: j < 2 ? 0xffffff : 0xffe9a0, alpha: k * (1 - j * 0.2) });
        }
      }, pp.x, pp.y - 60 * CHAR_SCALE);
      hitEnemy(target, rand(14, 20));
    }
    swingT = Math.max(0, swingT - dt);
    const sw = swingT > 0 ? 1 - swingT / 0.24 : 0;
    sword.rotation = swingT > 0 ? -1.9 + sw * 3.2 : 0.45 + Math.sin(time * 2.2) * 0.05;

    // Ennemis : approche + attaques télégraphiées au sol
    ground.clear();
    for (const e of enemies) {
      if (e.dead) {
        e.dead += dt;
        e.alpha = Math.max(0, 1 - e.dead * 1.6);
        if (e.dead > 3.2) {
          // réapparition (la démo tourne en boucle)
          const [, sx, sy] = spawnSpots[enemies.indexOf(e)];
          e.x = sx; e.y = sy; e.hp = e.maxHp; e.dead = 0; e.alpha = 0; e.tele = undefined;
        }
        continue;
      }
      e.alpha = Math.min(1, e.alpha + dt * 2);
      e.x += e.knock.x * dt * 8; e.y += e.knock.y * dt * 8;
      e.knock.x *= 1 - dt * 8; e.knock.y *= 1 - dt * 8;
      const d = dist(e, player);
      const reach = e.kind === 'piquier' ? 2.0 : 1.15;
      if (!e.tele) {
        if (d > reach * 0.9) {
          const sp = e.kind === 'furtif' ? 1.3 : 0.85;
          e.x += ((player.x - e.x) / d) * sp * dt;
          e.y += ((player.y - e.y) / d) * sp * dt;
        }
        e.atkT -= dt;
        if (e.atkT <= 0 && d < reach + 0.4) {
          const shape = e.kind === 'sergent' ? 'cone' : e.kind === 'piquier' ? 'line' : 'circle';
          e.tele = { t: 0, dur: e.kind === 'sergent' ? 1.0 : 0.8, dx: (player.x - e.x) / d, dy: (player.y - e.y) / d, shape };
        }
      } else {
        const tl = e.tele;
        tl.t += dt;
        const k = Math.min(1, tl.t / tl.dur);
        const ep = toScreen(e.x, e.y);
        const dir = toScreen(tl.dx, tl.dy);
        const ang = Math.atan2(dir.y, dir.x);
        // zone d'attaque : rouge translucide qui se remplit (lecture claire, esprit « zone de sort » Dofus)
        const col = 0xff2a2a;
        if (tl.shape === 'circle') {
          const cx = ep.x + dir.x * 0.9, cy = ep.y + dir.y * 0.9;
          ground.ellipse(cx, cy, 70, 35).fill({ color: col, alpha: 0.12 }).stroke({ width: 2.5, color: col, alpha: 0.55 });
          ground.ellipse(cx, cy, 70 * k, 35 * k).fill({ color: col, alpha: 0.28 });
        } else if (tl.shape === 'cone') {
          const R = 150;
          const pts = (rr: number) => {
            const arr = [ep.x, ep.y];
            for (let j = 0; j <= 10; j++) {
              const a = ang - 0.7 + (1.4 * j) / 10;
              arr.push(ep.x + Math.cos(a) * rr, ep.y + Math.sin(a) * rr * 0.5 + Math.sin(ang) * rr * 0.25);
            }
            return arr;
          };
          ground.poly(pts(R)).fill({ color: col, alpha: 0.12 }).stroke({ width: 2.5, color: col, alpha: 0.55 });
          ground.poly(pts(R * k)).fill({ color: col, alpha: 0.28 });
        } else {
          const L = 190, W = 22;
          const nx = -Math.sin(ang) * W, ny = Math.cos(ang) * W * 0.5;
          const line = (l: number) => [ep.x + nx, ep.y + ny, ep.x + Math.cos(ang) * l + nx, ep.y + Math.sin(ang) * l + ny, ep.x + Math.cos(ang) * l - nx, ep.y + Math.sin(ang) * l - ny, ep.x - nx, ep.y - ny];
          ground.poly(line(L)).fill({ color: col, alpha: 0.12 }).stroke({ width: 2.5, color: col, alpha: 0.55 });
          ground.poly(line(L * k)).fill({ color: col, alpha: 0.28 });
        }
        if (k >= 1) {
          // frappe !
          const hitR = tl.shape === 'cone' ? 1.6 : tl.shape === 'line' ? 2.1 : 1.25;
          const toP = { x: player.x - e.x, y: player.y - e.y };
          const along = toP.x * tl.dx + toP.y * tl.dy;
          const inside = dist(e, player) < hitR && along > -0.2 && (tl.shape !== 'line' || Math.abs(toP.x * tl.dy - toP.y * tl.dx) < 0.45);
          e.knock.x += tl.dx * 0.5; e.knock.y += tl.dy * 0.5; // fente vers l'avant
          if (inside) hurtPlayer(e.kind === 'sergent' ? 14 : 9);
          e.tele = undefined;
          e.atkT = rand(2.2, 3.5);
        }
      }
      // Chafer Furtif : clignote (invisible par moments)
      if (e.kind === 'furtif') e.alpha *= 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(time * 1.7 + e.phase));
      // séparation entre ennemis
      for (const o of enemies) {
        if (o === e || o.dead) continue;
        const dx = e.x - o.x, dy = e.y - o.y, dd = Math.hypot(dx, dy);
        if (dd < 0.8 && dd > 0.001) { e.x += (dx / dd) * (0.8 - dd) * 0.5; e.y += (dy / dd) * (0.8 - dd) * 0.5; }
      }
      e.x = Math.max(0.6, Math.min(ROOM_N - 0.5, e.x));
      e.y = Math.max(0.6, Math.min(ROOM_N - 0.5, e.y));
    }

    // Aura de Souffrance sous le Sacrieur
    {
      const pp = toScreen(player.x, player.y);
      const pulse = 0.5 + 0.5 * Math.sin(time * 5);
      const k = suffering / 10;
      if (k > 0) {
        ground.ellipse(pp.x, pp.y, 46 + pulse * 6, 20 + pulse * 3).stroke({ width: 3, color: 0xff3040, alpha: 0.25 + k * 0.5 });
        ground.ellipse(pp.x, pp.y, 40, 17).fill({ color: 0xc01020, alpha: 0.08 + k * 0.18 });
        if (Math.random() < k * 0.5) emit(pp.x + rand(-30, 30), pp.y - rand(0, 20), 0xff2a3a, { vy: rand(-90, -40), life: 0.8, size: 0.06 });
      }
      if (playerSpell.power > 0) ground.ellipse(pp.x, pp.y, 54, 23).stroke({ width: 2, color: 0xffb02e, alpha: 0.6 });
    }

    // Placement et animation des acteurs
    for (const a of [player, ...enemies]) {
      place(a.c, a.x, a.y);
      a.phase += dt;
      const isMoving = a === player ? moving : !a.tele && !a.dead;
      const bob = isMoving ? Math.abs(Math.sin(a.phase * 9)) * 5 : 0;
      const breath = Math.sin(a.phase * 2.6) * 0.022;
      const f = a === player ? facing : (player.x - a.x) - (player.y - a.y) >= 0 ? 1 : -1;
      const sx = CHAR_SCALE * (1 - breath * 0.6) * f;
      const sy = CHAR_SCALE * (1 + breath);
      a.body.scale.set(sx, sy);
      a.flash.scale.set(sx, sy);
      a.body.y = a.flash.y = -bob;
      if (a.tele) {
        // préparation de l'attaque : recul + tremblement
        a.body.x = a.flash.x = Math.sin(time * 60) * 1.5;
      } else a.body.x = a.flash.x = 0;
      a.flashT = Math.max(0, a.flashT - dt);
      a.flash.alpha = a.flashT > 0 ? 0.85 : 0;
      a.c.alpha = a.alpha;
      if (a.hpBar) {
        const w = 54;
        a.hpBar.clear().roundRect(-w / 2 - 2, -2, w + 4, 9, 4).fill({ color: 0x1a0e0a, alpha: 0.85 })
          .roundRect(-w / 2, 0, (w * Math.max(0, a.hp)) / a.maxHp, 5, 2.5).fill({ color: a.kind === 'sergent' ? 0xff8a2a : 0xe8343c });
        a.hpBar.visible = !a.dead;
      }
    }
    sword.scale.set(CHAR_SCALE * facing, CHAR_SCALE);
    sword.x = HAND.x * facing;
    sword.rotation *= facing;

    // Butin : flotte et scintille
    for (const l of loots) {
      l.t += dt;
      l.s.y = -6 - Math.sin(l.t * 3) * 4;
      if (Math.random() < 0.04) {
        const p = toScreen(l.x, l.y);
        emit(p.x + rand(-14, 14), p.y - rand(10, 30), 0xfff0a0, { vy: -30, life: 0.6, size: 0.07 });
      }
    }

    // Flammes
    for (const fl of flames) {
      fl.ph += dt * 12;
      const s = fl.s * (1 + Math.sin(fl.ph) * 0.08 + Math.sin(fl.ph * 2.3) * 0.05);
      const g = fl.g;
      g.clear();
      const x = fl.x, y = fl.y;
      g.moveTo(x, y - 30 * s).bezierCurveTo(x + 12 * s, y - 14 * s, x + 11 * s, y, x, y).bezierCurveTo(x - 11 * s, y, x - 12 * s, y - 14 * s, x, y - 30 * s).fill({ color: 0xff7a1a });
      g.moveTo(x, y - 20 * s).bezierCurveTo(x + 7 * s, y - 9 * s, x + 6 * s, y, x, y).bezierCurveTo(x - 6 * s, y, x - 7 * s, y - 9 * s, x, y - 20 * s).fill({ color: 0xffe07a });
    }
    for (const gl of glows) gl.s.alpha = gl.base * (0.86 + 0.14 * Math.sin(time * gl.spd + gl.ph) * Math.sin(time * gl.spd * 0.37 + gl.ph));
    ghostGlow.alpha = 0.12 + 0.08 * Math.sin(time * 1.3);
    for (const d of dust) {
      d.x += d.vx * dt; d.y += d.vy * dt;
      d.s.position.set(d.x + Math.sin(time + d.ph) * 8, d.y);
      d.s.alpha = 0.25 + 0.25 * Math.sin(time * 1.5 + d.ph);
      if (d.vy < 0 && d.y < -ORIGIN.y + 60) d.y += 300;
    }
    if (Math.random() < dt * 1.2) {
      // feux follets verts du sarcophage
      emit(sarcoP.x + rand(-50, 50), sarcoP.y - rand(10, 40), 0x7dff9a, { vy: rand(-40, -20), vx: rand(-10, 10), life: 2.2, size: 0.13, alpha: 0.5 });
    }

    // Particules et effets
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.s.x += p.vx * dt; p.s.y += p.vy * dt;
      p.vy += 160 * dt * (p.s.blendMode === 'add' ? 0.2 : 1);
      p.s.alpha = p.a0 * Math.max(0, p.life / p.max);
      if (p.life <= 0) { p.s.destroy(); particles.splice(i, 1); }
    }
    for (let i = fxs.length - 1; i >= 0; i--) {
      const f = fxs[i];
      f.life -= dt;
      f.draw(f.g, Math.max(0, f.life / f.max));
      if (f.life <= 0) { f.g.destroy(); fxs.splice(i, 1); }
    }
    for (let i = floaters.length - 1; i >= 0; i--) {
      const f = floaters[i];
      f.life -= dt * 1.1;
      f.y += f.vy * dt;
      f.vy *= 1 - dt * 2.5;
      const pop = f.life > 0.85 ? 1 + (f.life - 0.85) * 3 : 1;
      f.t.position.set(f.x, f.y);
      f.t.scale.set(pop);
      f.t.alpha = Math.min(1, f.life * 2.5);
      if (f.life <= 0) { f.t.destroy(); floaters.splice(i, 1); }
    }

    // Caméra (suit le Sacrieur en douceur) + tremblement
    const ct = camTarget();
    cam.x += (ct.x - cam.x) * Math.min(1, dt * 6);
    cam.y += (ct.y - cam.y) * Math.min(1, dt * 6);
    shake = Math.max(0, shake - dt * 30);
    world.scale.set(zoom);
    world.position.set(cam.x + rand(-shake, shake), cam.y + rand(-shake, shake));

    hud.setHp(player.hp, player.maxHp);
    hud.setPa(pa);
    hud.setSuffering(suffering);
  });

  addEventListener('resize', () => {
    zoom = computeZoom();
    vignette.texture = vignetteTexture(window.innerWidth, window.innerHeight);
    vignette.width = window.innerWidth;
    vignette.height = window.innerHeight;
    placeJoyIdle();
  });
  vignette.width = window.innerWidth;
  vignette.height = window.innerHeight;
}

main();
