import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
import { Application, Container, Graphics, ImageSource, Sprite, Text, Texture } from 'pixi.js';
import { chaferSvg, CHAFER_FOOT, CHAFER_H, CHAFER_W, type ChaferKind } from './art/chafer';
import { bones, boneBowl, brazier, BRAZIER_FIRE, candles, CANDLE_FLAMES, column, lootBone, rubble, sarcophagus, type PropArt } from './art/props';
import { sacrieurSvg, sacrieurSwordSvg, SACRIEUR_FACES_LEFT, SACRIEUR_FOOT, SACRIEUR_H, SACRIEUR_HAND, SACRIEUR_W, SWORD_GRIP, SWORD_H, SWORD_W } from './art/sacrieur';
import { BOUNDS, cryptRoomSvg, EXIT, LIGHTS, ROOM_H, ROOM_W } from './scene/cryptRoom';
import { svgTexture } from './svg';
import { Hud, SPELL_BAR } from './ui/hud';

/**
 * TEST DE STYLE — une salle de la Crypte de Kardorim, portrait plein écran, vue 3/4.
 * But : valider la direction artistique (personnages, décor, lumière, interface).
 * Le combat est une démonstration, pas encore le vrai moteur.
 */

const DEMO = new URLSearchParams(location.search).has('demo');
const CHAR_SCALE = 0.8;
/** Écrasement des formes au sol (cercles vus en 3/4). */
const PERSP = 0.62;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
type P = { x: number; y: number };
const dist = (a: P, b: P) => Math.hypot(a.x - b.x, (a.y - b.y) / PERSP);

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

/** Vignettage chaud et léger (assombrit les bords sans aller au noir). */
function vignetteTexture(w: number, h: number): Texture {
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(w / 2));
  c.height = Math.max(2, Math.round(h / 2));
  const g = c.getContext('2d')!;
  const r = Math.hypot(c.width, c.height) / 2;
  const grd = g.createRadialGradient(c.width / 2, c.height * 0.45, r * 0.45, c.width / 2, c.height * 0.45, r);
  grd.addColorStop(0, 'rgba(40,20,8,0)');
  grd.addColorStop(1, 'rgba(40,20,8,0.5)');
  g.fillStyle = grd;
  g.fillRect(0, 0, c.width, c.height);
  return new Texture({ source: new ImageSource({ resource: c }) });
}

interface Actor {
  c: Container;
  /** Calque retourné horizontalement selon l'orientation. */
  rig: Container;
  /** Sens dans lequel l'art est dessiné. */
  facesLeft: boolean;
  body: Sprite;
  flash: Sprite;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  kind: ChaferKind | 'sacrieur';
  flashT: number;
  phase: number;
  hpBar?: Graphics;
  atkT: number;
  tele?: { t: number; dur: number; dx: number; dy: number; shape: 'circle' | 'cone' | 'line' };
  knock: P;
  dead: number;
  alpha: number;
}
interface Floater { t: Text; life: number; vy: number; x: number; y: number }
interface Fx { g: Graphics; life: number; max: number; draw: (g: Graphics, k: number) => void }
interface Particle { s: Sprite; vx: number; vy: number; life: number; max: number; a0: number; grav: number }

async function main() {
  await Promise.all([document.fonts.load('800 20px "Baloo 2"'), document.fonts.load('700 20px "Baloo 2"')]);

  const app = new Application();
  await app.init({ resizeTo: window, background: '#2a160c', antialias: true, resolution: Math.min(window.devicePixelRatio || 1, 3), autoDensity: true });
  document.getElementById('game')!.appendChild(app.canvas);
  const hud = new Hud(document.getElementById('hud')!);

  // La salle remplit toute la largeur de l'écran.
  let zoom = window.innerWidth / ROOM_W;
  const RES = Math.min(3.2, Math.max(1, (window.devicePixelRatio || 1) * zoom * 1.1));

  const [roomTex, sacriTex, swordTex, lootTex, ...rest] = await Promise.all([
    svgTexture(cryptRoomSvg(), RES),
    svgTexture(sacrieurSvg(), RES * CHAR_SCALE),
    svgTexture(sacrieurSwordSvg(), RES * CHAR_SCALE),
    svgTexture(lootBone().svg, RES),
    ...(['debutant', 'furtif', 'piquier', 'sergent'] as ChaferKind[]).map((k) => svgTexture(chaferSvg(k), RES * CHAR_SCALE)),
  ]);
  const chaferTex: Record<ChaferKind, Texture> = { debutant: rest[0], furtif: rest[1], piquier: rest[2], sergent: rest[3] };
  const glow = glowTexture();

  // ---- Calques ----
  const world = new Container();
  app.stage.addChild(world);
  const roomSprite = new Sprite(roomTex);
  roomSprite.tint = 0xe6d6c4; // pénombre chaude de la crypte
  world.addChild(roomSprite);
  const ground = new Graphics();
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
    o.position.set(x, y);
    o.zIndex = y;
  };

  // ---- Lumières ----
  const glows: { s: Sprite; base: number; ph: number; spd: number }[] = [];
  const addGlow = (x: number, y: number, color: number, scale: number, alpha: number, sy = 1) => {
    const s = new Sprite(glow);
    s.anchor.set(0.5);
    s.position.set(x, y);
    s.tint = color;
    s.scale.set(scale, scale * sy);
    s.alpha = alpha;
    lights.addChild(s);
    glows.push({ s, base: alpha, ph: Math.random() * 10, spd: rand(7, 11) });
    return s;
  };
  const flames: { g: Graphics; x: number; y: number; s: number; ph: number }[] = [];
  const addFlame = (parent: Container, x: number, y: number, s: number) => {
    const g = new Graphics();
    parent.addChild(g);
    flames.push({ g, x, y, s, ph: Math.random() * 10 });
  };
  const wallFlames = new Container();
  world.addChildAt(wallFlames, world.getChildIndex(ground));
  for (const l of LIGHTS) {
    addFlame(wallFlames, l.x, l.y, 1.0);
    addGlow(l.x, l.y - 6, 0xffa040, 2.2, 0.24);
    addGlow(l.x, l.y + 80, 0xff9030, 2.6, 0.06, 0.6);
  }
  addGlow(EXIT.x, EXIT.y, 0xffc060, 3.0, 0.2);
  addGlow(EXIT.x, EXIT.y + 120, 0xffb050, 3.2, 0.08, 0.5);

  // ---- Décor posé (volumes, triés en profondeur avec les personnages) ----
  const colliders: { x: number; y: number; r: number }[] = [];
  async function addProp(art: PropArt, x: number, y: number, r: number, scale = 1) {
    const tex = await svgTexture(art.svg, RES * scale);
    const s = new Sprite(tex);
    s.anchor.set(art.foot[0] / tex.width / scale, art.foot[1] / tex.height / scale);
    s.scale.set(scale);
    const c = new Container();
    c.addChild(s);
    place(c, x, y);
    actors.addChild(c);
    if (r > 0) colliders.push({ x, y, r });
    return c;
  }
  const [col1, col2] = await Promise.all([addProp(column(), 186, 700, 46), addProp(column(), 534, 700, 46)]);
  void col1; void col2;
  await Promise.all([
    addProp(sarcophagus(), 360, 1010, 0),
    addProp(bones(), 128, 930, 0),
    addProp(bones(), 560, 1360, 0),
    addProp(boneBowl(), 600, 880, 36),
    addProp(rubble(), 200, 1420, 40),
    addProp(rubble(), 610, 470, 36, 0.8),
  ]);
  colliders.push({ x: 290, y: 1000, r: 56 }, { x: 360, y: 1000, r: 56 }, { x: 430, y: 1000, r: 56 });
  for (const [bx, by] of [[150, 1200], [570, 1200]] as const) {
    const c = await addProp(brazier(), bx, by, 42);
    addFlame(c, BRAZIER_FIRE[0], BRAZIER_FIRE[1] + 30, 1.5);
    addGlow(bx, by - 46, 0xffb040, 2.4, 0.3);
    addGlow(bx, by + 10, 0xffa030, 3.4, 0.08, 0.55);
  }
  for (const [cx, cy] of [[118, 560], [606, 600]] as const) {
    const c = await addProp(candles(), cx, cy, 0, 0.9);
    for (const [fx, fy] of CANDLE_FLAMES) addFlame(c, fx * 0.9, fy * 0.9, 0.5);
    addGlow(cx, cy - 26, 0xffb050, 1.3, 0.26);
  }
  const sarcoGlow = addGlow(360, 980, 0x6dff8a, 3.2, 0.12, 0.6);

  // ---- Personnages ----
  const mkActor = (tex: Texture, foot: [number, number], w: number, h: number, kind: Actor['kind'], x: number, y: number, hp: number): Actor => {
    const c = new Container();
    c.addChild(new Graphics().ellipse(0, 0, 32 * CHAR_SCALE, 32 * CHAR_SCALE * PERSP * 0.6).fill({ color: 0x2a1404, alpha: 0.38 }));
    const rig = new Container();
    c.addChild(rig);
    const body = new Sprite(tex);
    body.anchor.set(foot[0] / w, foot[1] / h);
    body.scale.set(CHAR_SCALE);
    rig.addChild(body);
    const flash = new Sprite(tex);
    flash.anchor.copyFrom(body.anchor);
    flash.scale.set(CHAR_SCALE);
    flash.blendMode = 'add';
    flash.alpha = 0;
    rig.addChild(flash);
    const a: Actor = { c, rig, facesLeft: kind !== 'sacrieur' || SACRIEUR_FACES_LEFT, body, flash, x, y, hp, maxHp: hp, kind, flashT: 0, phase: Math.random() * 10, atkT: rand(1, 3), knock: { x: 0, y: 0 }, dead: 0, alpha: 1 };
    if (kind !== 'sacrieur') {
      a.hpBar = new Graphics();
      a.hpBar.position.set(0, -h * CHAR_SCALE * 0.98);
      c.addChild(a.hpBar);
    }
    place(c, x, y);
    actors.addChild(c);
    return a;
  };

  const player = mkActor(sacriTex, SACRIEUR_FOOT, SACRIEUR_W, SACRIEUR_H, 'sacrieur', 360, 1290, 180);
  player.hp = 148;
  const sword = new Sprite(swordTex);
  sword.anchor.set(SWORD_GRIP[0] / SWORD_W, SWORD_GRIP[1] / SWORD_H);
  sword.scale.set(CHAR_SCALE);
  const HAND = { x: (SACRIEUR_HAND[0] - SACRIEUR_FOOT[0]) * CHAR_SCALE, y: (SACRIEUR_HAND[1] - SACRIEUR_FOOT[1]) * CHAR_SCALE };
  sword.position.set(HAND.x, HAND.y);
  player.rig.addChildAt(sword, SACRIEUR_FACES_LEFT ? 0 : 1);

  const spawnSpots: [ChaferKind, number, number][] = [
    ['debutant', 300, 1120],
    ['furtif', 470, 860],
    ['piquier', 560, 1080],
    ['sergent', 190, 1060],
  ];
  const enemies: Actor[] = spawnSpots.map(([k, x, y]) => mkActor(chaferTex[k], CHAFER_FOOT, CHAFER_W, CHAFER_H, k, x, y, k === 'sergent' ? 70 : 46));
  enemies[0].hp = 30;
  enemies[3].hp = 52;

  // ---- Butin ----
  const loots: { s: Sprite; x: number; y: number; t: number }[] = [];
  const dropLoot = (x: number, y: number) => {
    const s = new Sprite(lootTex);
    s.anchor.set(0.5, 0.8);
    const c = new Container();
    c.addChild(s);
    place(c, x, y);
    actors.addChild(c);
    addGlow(x, y - 8, 0xfff0a0, 0.8, 0.5);
    loots.push({ s, x, y, t: 0 });
  };
  dropLoot(450, 1230);

  // ---- Particules ----
  const particles: Particle[] = [];
  const emit = (x: number, y: number, color: number, o: Partial<{ vx: number; vy: number; life: number; size: number; alpha: number; add: boolean; grav: number }> = {}) => {
    const s = new Sprite(glow);
    s.anchor.set(0.5);
    s.position.set(x, y);
    s.tint = color;
    s.scale.set(o.size ?? 0.12);
    s.alpha = o.alpha ?? 1;
    if (o.add !== false) s.blendMode = 'add';
    fxLayer.addChild(s);
    particles.push({ s, vx: o.vx ?? 0, vy: o.vy ?? 0, life: o.life ?? 1, max: o.life ?? 1, a0: o.alpha ?? 1, grav: o.grav ?? 60 });
  };
  const dust: { s: Sprite; x: number; y: number; vx: number; vy: number; ph: number }[] = [];
  for (let i = 0; i < 50; i++) {
    const s = new Sprite(glow);
    s.anchor.set(0.5);
    s.scale.set(rand(0.03, 0.07));
    s.tint = 0xfff1d0;
    s.blendMode = 'add';
    lights.addChild(s);
    dust.push({ s, x: rand(60, ROOM_W - 60), y: rand(200, ROOM_H), vx: rand(-6, 6), vy: rand(-10, -3), ph: rand(0, 10) });
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
        fontFamily: 'Baloo 2', fontWeight: '800', fontSize: big ? 38 : 30, fill: color,
        stroke: { color: '#2a0806', width: 6, join: 'round' },
        dropShadow: { color: '#000000', alpha: 0.5, blur: 2, distance: 2, angle: Math.PI / 2 },
      },
    });
    t.anchor.set(0.5);
    t.resolution = RES * 1.2;
    floatLayer.addChild(t);
    floaters.push({ t, life: 1, vy: -80, x: x + rand(-12, 12), y });
  };

  let shake = 0;
  const buff = { power: 0, t: 0 };
  let suffering = 3;
  let sufferDecay = 0;
  const HEAD = 120 * CHAR_SCALE;

  const hitEnemy = (e: Actor, base: number, o: { crit?: boolean; knock?: number } = {}) => {
    const crit = o.crit ?? Math.random() < 0.15;
    const dmg = Math.round(base * (1 + buff.power / 100) * (1 + suffering * 0.04) * (crit ? 1.5 : 1));
    e.hp -= dmg;
    e.flashT = 0.16;
    const dx = e.x - player.x, dy = e.y - player.y, d = Math.hypot(dx, dy) || 1;
    const k = o.knock ?? 26;
    e.knock.x += (dx / d) * k;
    e.knock.y += (dy / d) * k;
    numberAt(e.x, e.y - HEAD, `-${dmg}`, crit ? '#ffb02e' : '#ff4a3d', crit);
    for (let i = 0; i < 6; i++) emit(e.x, e.y - 50 * CHAR_SCALE, crit ? 0xffd070 : 0xffffff, { vx: rand(-120, 120), vy: rand(-160, -40), life: 0.35, size: 0.08 });
    if (crit) shake = Math.max(shake, 6);
    if (e.hp <= 0) {
      e.dead = 0.001;
      for (let i = 0; i < 16; i++) emit(e.x, e.y - 40, 0xe8dcc0, { vx: rand(-140, 140), vy: rand(-200, -40), life: 0.6, size: 0.1, add: false, grav: 300 });
      dropLoot(e.x + 20, e.y + 10);
    }
  };
  const heal = (n: number) => {
    const real = Math.min(n, player.maxHp - player.hp);
    if (real <= 0) return;
    player.hp += real;
    numberAt(player.x + 22, player.y - HEAD - 30, `+${real}`, '#5ee86a');
  };
  const hurtPlayer = (n: number) => {
    player.hp = Math.max(25, player.hp - n); // test de style : on ne meurt pas
    player.flashT = 0.2;
    suffering = Math.min(10, suffering + 1);
    sufferDecay = 0;
    numberAt(player.x - 20, player.y - HEAD - 30, `-${n}`, '#ff4a3d');
    shake = Math.max(shake, 7);
  };

  // ---- Entrées ----
  const input = { x: 0, y: 0, active: false };
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
    input.x = d > 6 ? (dx / d) * m : 0;
    input.y = d > 6 ? (dy / d) * m : 0;
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
  let weaponT = 0.4, swingT = 0, facing = 1, time = 0;
  const cds = [0, 1.2, 2.4, 6];
  const CD = [2.6, 3.2, 5.5, 14];
  const MELEE = 120;

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
      if (i === 0) {
        // Supplice : pics de pierre en couronne sous la cible (vol de vie Terre)
        const t = nearest(MELEE + 20);
        if (!t) continue;
        const spikes = [...Array(7)].map((_, j) => ({ a: (j / 7) * Math.PI * 2 + rand(-0.2, 0.2), h: rand(24, 38) })).sort((p, q) => Math.sin(p.a) - Math.sin(q.a));
        addFx(0.5, (g, k) => {
          g.clear();
          const rise = Math.min(1, (1 - k) * 4), fade = k > 0.3 ? 1 : k / 0.3;
          g.ellipse(0, 0, 46, 46 * PERSP).fill({ color: 0x3e2410, alpha: 0.35 * fade });
          for (const sp of spikes) {
            const ox = Math.cos(sp.a) * 40, oy = Math.sin(sp.a) * 40 * PERSP, h = sp.h * rise * fade;
            g.poly([ox - 8, oy, ox - 1, oy - h, ox + 8, oy]).fill({ color: 0xb8925a }).stroke({ width: 2.5, color: 0x4e3418, join: 'round' });
            g.poly([ox - 1, oy - h, ox + 8, oy, ox + 2, oy]).fill({ color: 0x8a6a3a });
          }
        }, t.x, t.y);
        for (let j = 0; j < 10; j++) emit(t.x + rand(-40, 40), t.y + rand(-10, 10), 0xa08050, { vy: rand(-140, -60), vx: rand(-40, 40), life: 0.5, size: 0.07, add: false, grav: 300 });
        hitEnemy(t, rand(15, 20));
        heal(5);
      } else if (i === 1) {
        // Absorption : orbe de sang lancée sur la cible (vol de vie Feu)
        const target = nearest(520, 140);
        if (!target) continue;
        const start = { x: player.x, y: player.y - 80 * CHAR_SCALE };
        addFx(0.42, (g, k) => {
          const u = 1 - k;
          const x = start.x + (target.x - start.x) * u, y = start.y + (target.y - 70 * CHAR_SCALE - start.y) * u - Math.sin(u * Math.PI) * 50;
          g.clear().circle(x, y, 9).fill({ color: 0xff3a2a }).circle(x - 2, y - 3, 3.5).fill({ color: 0xffd0a0 });
          emit(x, y, 0xff5030, { life: 0.3, size: 0.16, vx: rand(-20, 20), vy: rand(-20, 20), grav: 0 });
          if (k <= 0.03 && !target.dead) { hitEnemy(target, rand(18, 24), { knock: 10 }); heal(9); }
        });
      } else if (i === 2) {
        // Attirance : chaîne qui ramène un ennemi éloigné
        const target = nearest(620, 220);
        if (!target) continue;
        const from = { x: target.x, y: target.y };
        const dx = player.x - from.x, dy = player.y - from.y, d = Math.hypot(dx, dy);
        const to = { x: from.x + (dx / d) * (d - 100), y: from.y + (dy / d) * (d - 100) };
        addFx(0.4, (g, k) => {
          const u = 1 - k, e = u < 0.4 ? 0 : (u - 0.4) / 0.6;
          target.x = from.x + (to.x - from.x) * e * e;
          target.y = from.y + (to.y - from.y) * e * e;
          const reach = u < 0.4 ? u / 0.4 : 1;
          const ax = player.x, ay = player.y - 50, bx = ax + (target.x - ax) * reach, by = ay + (target.y - 50 - ay) * reach;
          g.clear().moveTo(ax, ay).lineTo(bx, by).stroke({ width: 5, color: 0x3a4450 }).moveTo(ax, ay).lineTo(bx, by).stroke({ width: 2, color: 0xd8e2ea });
          g.circle(bx, by, 6).fill({ color: 0xc4202a });
        });
        numberAt(target.x, target.y - HEAD - 10, 'Attiré !', '#e8eef2');
      } else if (i === 3) {
        // Mutilation : sacrifie de la vie contre de la Puissance
        if (player.hp < 60) continue;
        player.hp -= 12;
        buff.power = 40;
        buff.t = 6;
        numberAt(player.x, player.y - HEAD - 30, '-12', '#ff4a3d');
        numberAt(player.x, player.y - HEAD - 66, '+40 Puissance', '#ffb02e');
        addFx(0.6, (g, k) => { g.clear().ellipse(0, 0, 90 * (1 - k) + 20, (90 * (1 - k) + 20) * PERSP).stroke({ width: 8 * k, color: 0xff2a3a, alpha: k }); }, player.x, player.y);
        for (let j = 0; j < 18; j++) emit(player.x + rand(-30, 30), player.y - rand(20, 100), 0xff2030, { vy: rand(-120, -40), life: 0.7, size: 0.09 });
        suffering = Math.min(10, suffering + 2);
      }
      pa -= SPELL_BAR[i].cost;
      cds[i] = CD[i];
      hud.flashCast(i);
      return;
    }
  };

  // ---- Caméra : largeur fixe, défilement vertical ----
  let camY = 0;
  const camTarget = () => {
    const top = hud.topInset(), bottom = window.innerHeight - hud.bottomInset();
    const focus = top + (bottom - top) * 0.6;
    const y = focus - (player.y - 50) * zoom;
    return Math.min(0, Math.max(window.innerHeight - ROOM_H * zoom, y));
  };
  camY = camTarget();
  /** Limite basse jouable : le joueur ne descend pas sous la barre d'interface. */
  const playY1 = () => Math.min(BOUNDS.y1, ROOM_H - hud.bottomInset() / zoom - 30);

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
      const tx = 360 + Math.cos(time * 0.55) * 150, ty = 1150 + Math.sin(time * 0.55) * 110;
      const dx = tx - player.x, dy = ty - player.y, m = Math.hypot(dx, dy);
      if (m > 6) { ix = (dx / m) * 0.7; iy = (dy / m) * 0.7; }
    }
    const im = Math.hypot(ix, iy);
    const moving = im > 0.05;
    if (moving) {
      if (im > 1) { ix /= im; iy /= im; }
      const SPEED = 320;
      let nx = player.x + ix * SPEED * dt, ny = player.y + iy * SPEED * dt * 0.85;
      nx = Math.max(BOUNDS.x0, Math.min(BOUNDS.x1, nx));
      ny = Math.max(BOUNDS.y0, Math.min(playY1(), ny));
      for (const c of colliders) {
        const dx = nx - c.x, dy = (ny - c.y) / PERSP, d = Math.hypot(dx, dy), r = c.r + 22;
        if (d < r && d > 0.001) { nx = c.x + (dx / d) * r; ny = c.y + (dy / d) * r * PERSP; }
      }
      player.x = nx;
      player.y = ny;
      if (Math.abs(ix) > 0.15) facing = ix > 0 ? 1 : -1;
    }

    // PA, cooldowns, Souffrance, sorts
    pa = Math.min(PA_MAX, pa + dt * 1.7);
    for (let i = 0; i < cds.length; i++) { cds[i] = Math.max(0, cds[i] - dt); hud.setCooldown(i, cds[i] / CD[i]); }
    sufferDecay += dt;
    if (sufferDecay > 2.5 && suffering > 0) { suffering--; sufferDecay = 0; }
    if (buff.t > 0) { buff.t -= dt; if (buff.t <= 0) buff.power = 0; }
    castSpells();

    // Arme : attaque automatique, même en mouvement
    weaponT -= dt;
    const target = nearest(MELEE);
    if (target) facing = target.x >= player.x ? 1 : -1;
    if (weaponT <= 0 && target) {
      weaponT = 0.72;
      swingT = 0.24;
      const ang = Math.atan2((target.y - player.y) / PERSP, target.x - player.x);
      addFx(0.2, (g, k) => {
        g.clear();
        const r = 76;
        const a0 = ang - 1.3, a1 = ang + 1.1, head = a0 + (a1 - a0) * Math.min(1, (1 - k) * 2.2);
        for (let j = 0; j < 4; j++) g.arc(0, 0, r - j * 5, a0 + (head - a0) * (j * 0.18), head).stroke({ width: 9 - j * 2, color: j < 2 ? 0xffffff : 0xffe9a0, alpha: k * (1 - j * 0.2) });
        g.scale.y = PERSP + 0.15;
      }, player.x, player.y - 34);
      hitEnemy(target, rand(14, 20));
    }
    swingT = Math.max(0, swingT - dt);
    const sw = swingT > 0 ? 1 - swingT / 0.24 : 0;
    // dans le repère de l'art : la pointe part vers l'avant du personnage
    const fwd = SACRIEUR_FACES_LEFT ? -1 : 1;
    sword.rotation = fwd * (swingT > 0 ? -1.9 + sw * 3.2 : 0.45 + Math.sin(time * 2.2) * 0.05);

    // Ennemis
    ground.clear();
    for (const e of enemies) {
      if (e.dead) {
        e.dead += dt;
        e.alpha = Math.max(0, 1 - e.dead * 1.6);
        if (e.dead > 3.2) {
          const [, sx, sy] = spawnSpots[enemies.indexOf(e)];
          Object.assign(e, { x: sx, y: sy, hp: e.maxHp, dead: 0, alpha: 0, tele: undefined });
        }
        continue;
      }
      e.alpha = Math.min(1, e.alpha + dt * 2);
      e.x += e.knock.x * dt * 8;
      e.y += e.knock.y * dt * 8;
      e.knock.x *= 1 - dt * 8;
      e.knock.y *= 1 - dt * 8;
      const d = dist(e, player);
      const reach = e.kind === 'piquier' ? 190 : 104;
      if (!e.tele) {
        if (d > reach * 0.9) {
          const sp = e.kind === 'furtif' ? 120 : 80;
          const dx = player.x - e.x, dy = player.y - e.y, m = Math.hypot(dx, dy);
          e.x += (dx / m) * sp * dt;
          e.y += (dy / m) * sp * dt;
        }
        e.atkT -= dt;
        if (e.atkT <= 0 && d < reach + 40) {
          const dx = player.x - e.x, dy = (player.y - e.y) / PERSP, m = Math.hypot(dx, dy);
          e.tele = { t: 0, dur: e.kind === 'sergent' ? 1.0 : 0.8, dx: dx / m, dy: dy / m, shape: e.kind === 'sergent' ? 'cone' : e.kind === 'piquier' ? 'line' : 'circle' };
        }
      } else {
        const tl = e.tele;
        tl.t += dt;
        const k = Math.min(1, tl.t / tl.dur);
        const ang = Math.atan2(tl.dy, tl.dx);
        const col = 0xff2a2a;
        // zones d'attaque au sol (repère « plat », écrasé par PERSP)
        const flat = (pts: number[]) => pts.map((v, i) => (i % 2 ? e.y + v * PERSP : e.x + v));
        if (tl.shape === 'circle') {
          const cx = tl.dx * 70, cy = tl.dy * 70, R = 72;
          ground.ellipse(e.x + cx, e.y + cy * PERSP, R, R * PERSP).fill({ color: col, alpha: 0.12 }).stroke({ width: 2.5, color: col, alpha: 0.6 });
          ground.ellipse(e.x + cx, e.y + cy * PERSP, R * k, R * k * PERSP).fill({ color: col, alpha: 0.28 });
        } else if (tl.shape === 'cone') {
          const cone = (R: number) => { const a = [0, 0]; for (let j = 0; j <= 12; j++) { const t = ang - 0.75 + (1.5 * j) / 12; a.push(Math.cos(t) * R, Math.sin(t) * R); } return flat(a); };
          ground.poly(cone(170)).fill({ color: col, alpha: 0.12 }).stroke({ width: 2.5, color: col, alpha: 0.6 });
          ground.poly(cone(170 * k)).fill({ color: col, alpha: 0.28 });
        } else {
          const W = 26, nx = -Math.sin(ang) * W, ny = Math.cos(ang) * W;
          const ln = (l: number) => flat([nx, ny, Math.cos(ang) * l + nx, Math.sin(ang) * l + ny, Math.cos(ang) * l - nx, Math.sin(ang) * l - ny, -nx, -ny]);
          ground.poly(ln(210)).fill({ color: col, alpha: 0.12 }).stroke({ width: 2.5, color: col, alpha: 0.6 });
          ground.poly(ln(210 * k)).fill({ color: col, alpha: 0.28 });
        }
        if (k >= 1) {
          const hitR = tl.shape === 'cone' ? 175 : tl.shape === 'line' ? 215 : 150;
          const px = player.x - e.x, py = (player.y - e.y) / PERSP;
          const along = px * tl.dx + py * tl.dy;
          const side = Math.abs(px * tl.dy - py * tl.dx);
          const inside = Math.hypot(px, py) < hitR && along > -20 && (tl.shape !== 'line' || side < 40) && (tl.shape !== 'cone' || side < along * 0.95 + 10);
          e.knock.x += tl.dx * 50;
          e.knock.y += tl.dy * 50 * PERSP;
          if (inside) hurtPlayer(e.kind === 'sergent' ? 14 : 9);
          e.tele = undefined;
          e.atkT = rand(2.2, 3.5);
        }
      }
      if (e.kind === 'furtif') e.alpha *= 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(time * 1.7 + e.phase));
      for (const o of enemies) {
        if (o === e || o.dead) continue;
        const dx = e.x - o.x, dy = e.y - o.y, dd = Math.hypot(dx, dy);
        if (dd < 80 && dd > 0.001) { e.x += (dx / dd) * (80 - dd) * 0.5; e.y += (dy / dd) * (80 - dd) * 0.5; }
      }
      for (const c of colliders) {
        const dx = e.x - c.x, dy = (e.y - c.y) / PERSP, dd = Math.hypot(dx, dy), r = c.r + 22;
        if (dd < r && dd > 0.001) { e.x = c.x + (dx / dd) * r; e.y = c.y + (dy / dd) * r * PERSP; }
      }
      e.x = Math.max(BOUNDS.x0, Math.min(BOUNDS.x1, e.x));
      e.y = Math.max(BOUNDS.y0, Math.min(playY1(), e.y));
    }

    // Aura de Souffrance
    {
      const pulse = 0.5 + 0.5 * Math.sin(time * 5), k = suffering / 10;
      if (k > 0) {
        const R = 44 + pulse * 6;
        ground.ellipse(player.x, player.y, R, R * PERSP).stroke({ width: 3, color: 0xff3040, alpha: 0.25 + k * 0.5 });
        ground.ellipse(player.x, player.y, 40, 40 * PERSP).fill({ color: 0xc01020, alpha: 0.08 + k * 0.18 });
        if (Math.random() < k * 0.5) emit(player.x + rand(-30, 30), player.y - rand(0, 20), 0xff2a3a, { vy: rand(-90, -40), life: 0.8, size: 0.06 });
      }
      if (buff.power > 0) ground.ellipse(player.x, player.y, 54, 54 * PERSP).stroke({ width: 2, color: 0xffb02e, alpha: 0.7 });
    }

    // Acteurs
    for (const a of [player, ...enemies]) {
      place(a.c, a.x, a.y);
      a.phase += dt;
      const isMoving = a === player ? moving : !a.tele && !a.dead;
      const bob = isMoving ? Math.abs(Math.sin(a.phase * 9)) * 5 : 0;
      const breath = Math.sin(a.phase * 2.6) * 0.022;
      const f = a === player ? facing : player.x >= a.x ? 1 : -1;
      const sx = CHAR_SCALE * (1 - breath * 0.6), sy = CHAR_SCALE * (1 + breath);
      a.rig.scale.x = a.facesLeft ? -f : f;
      a.body.scale.set(sx, sy);
      a.flash.scale.set(sx, sy);
      a.body.y = a.flash.y = -bob;
      a.body.x = a.flash.x = a.tele ? Math.sin(time * 60) * 1.5 : 0;
      a.flashT = Math.max(0, a.flashT - dt);
      a.flash.alpha = a.flashT > 0 ? 0.85 : 0;
      a.c.alpha = a.alpha;
      if (a.hpBar) {
        const w = 50;
        a.hpBar.clear().roundRect(-w / 2 - 2, -2, w + 4, 9, 4).fill({ color: 0x1a0e0a, alpha: 0.85 })
          .roundRect(-w / 2, 0, (w * Math.max(0, a.hp)) / a.maxHp, 5, 2.5).fill({ color: a.kind === 'sergent' ? 0xff8a2a : 0xe8343c });
        a.hpBar.visible = !a.dead;
      }
    }
    sword.y = HAND.y - (moving ? Math.abs(Math.sin(player.phase * 9)) * 5 : 0);

    // Butin
    for (const l of loots) {
      l.t += dt;
      l.s.y = -6 - Math.sin(l.t * 3) * 4;
      if (Math.random() < 0.04) emit(l.x + rand(-14, 14), l.y - rand(10, 30), 0xfff0a0, { vy: -30, life: 0.6, size: 0.07, grav: 0 });
    }

    // Flammes, halos, poussière, feux follets
    for (const fl of flames) {
      fl.ph += dt * 12;
      const s = fl.s * (1 + Math.sin(fl.ph) * 0.08 + Math.sin(fl.ph * 2.3) * 0.05);
      const { g, x, y } = fl;
      g.clear();
      g.moveTo(x, y - 30 * s).bezierCurveTo(x + 12 * s, y - 14 * s, x + 11 * s, y, x, y).bezierCurveTo(x - 11 * s, y, x - 12 * s, y - 14 * s, x, y - 30 * s).fill({ color: 0xff7a1a });
      g.moveTo(x, y - 20 * s).bezierCurveTo(x + 7 * s, y - 9 * s, x + 6 * s, y, x, y).bezierCurveTo(x - 6 * s, y, x - 7 * s, y - 9 * s, x, y - 20 * s).fill({ color: 0xffe07a });
    }
    for (const gl of glows) gl.s.alpha = gl.base * (0.86 + 0.14 * Math.sin(time * gl.spd + gl.ph) * Math.sin(time * gl.spd * 0.37 + gl.ph));
    sarcoGlow.alpha = 0.1 + 0.07 * Math.sin(time * 1.3);
    for (const d of dust) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.y < 150) d.y += ROOM_H - 200;
      d.s.position.set(d.x + Math.sin(time + d.ph) * 8, d.y);
      d.s.alpha = 0.25 + 0.25 * Math.sin(time * 1.5 + d.ph);
    }
    if (Math.random() < dt * 1.4) emit(360 + rand(-90, 90), 990 - rand(10, 40), 0x7dff9a, { vy: rand(-40, -20), vx: rand(-10, 10), life: 2.2, size: 0.13, alpha: 0.5, grav: 0 });

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.s.x += p.vx * dt;
      p.s.y += p.vy * dt;
      p.vy += p.grav * dt;
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
      f.t.position.set(f.x, f.y);
      f.t.scale.set(f.life > 0.85 ? 1 + (f.life - 0.85) * 3 : 1);
      f.t.alpha = Math.min(1, f.life * 2.5);
      if (f.life <= 0) { f.t.destroy(); floaters.splice(i, 1); }
    }

    // Caméra
    camY += (camTarget() - camY) * Math.min(1, dt * 6);
    shake = Math.max(0, shake - dt * 30);
    world.scale.set(zoom);
    world.position.set(rand(-shake, shake), camY + rand(-shake, shake));

    hud.setHp(player.hp, player.maxHp);
    hud.setPa(pa);
    hud.setSuffering(suffering);
  });

  const fitVignette = () => {
    vignette.texture = vignetteTexture(window.innerWidth, window.innerHeight);
    vignette.width = window.innerWidth;
    vignette.height = window.innerHeight;
  };
  fitVignette();
  addEventListener('resize', () => {
    zoom = window.innerWidth / ROOM_W;
    fitVignette();
    placeJoyIdle();
  });
}

main();
