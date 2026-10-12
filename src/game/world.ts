import { rng } from '../iso';
import { resolveHit } from './formulas';
import { startingHero, type HeroDef } from './data/hero';
import { CRYPT_POOL, MONSTERS, type MonsterDef } from './data/monsters';
import { obstacleCore, roomLayout, roomObstacles, type Obstacle, type PropPlacement } from './rooms';

/**
 * Monde de jeu : toute la logique du combat, indépendante de l'affichage.
 * Avance par pas fixes (STEP) et publie des événements que le rendu consomme.
 */

export const STEP = 1 / 60;
/** Écrasement vertical de la vue 3/4 : les distances au sol se calculent « à plat » (y / PERSP). */
export const PERSP = 0.62;
export const ROOM_W = 720;
export const FLOOR_TOP = 300;
export const TOTAL_ROOMS = 9;
export const GATE = { x: ROOM_W / 2, halfWidth: 70 };

export interface Vec { x: number; y: number }

/** Distance au sol, corrigée de la perspective. */
export const flatDist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, (ay - by) / PERSP);

export type MonsterState = 'spawn' | 'chase' | 'windup' | 'recover' | 'dead';

export interface Monster {
  uid: number;
  def: MonsterDef;
  x: number;
  y: number;
  hp: number;
  state: MonsterState;
  /** Temps écoulé dans l'état courant. */
  t: number;
  /** Délai avant la prochaine attaque. */
  cd: number;
  /** Direction d'attaque verrouillée pendant l'annonce (repère à plat, normalisée). */
  dir: Vec;
  facing: 1 | -1;
  knock: Vec;
  hurtT: number;
  /** Chafer Furtif : invisible (non ciblable par l'attaque automatique). */
  hidden: boolean;
  stealthT: number;
  moving: boolean;
}

export interface Hero {
  def: HeroDef;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  facing: 1 | -1;
  moving: boolean;
  alive: boolean;
  attackCd: number;
  /** Coup d'arme en cours. */
  swing: { t: number; dur: number; hit: boolean; dir: Vec } | null;
  hurtT: number;
  invulnT: number;
}

export type WorldEvent =
  | { type: 'swing'; dir: Vec }
  | { type: 'hit'; target: 'monster' | 'hero'; uid?: number; x: number; y: number; damage: number; crit: boolean }
  | { type: 'telegraph'; uid: number }
  | { type: 'strike'; uid: number }
  | { type: 'death'; uid: number; x: number; y: number }
  | { type: 'heal'; x: number; y: number; amount: number }
  | { type: 'roomCleared' }
  | { type: 'exit' }
  | { type: 'heroDied' }
  | { type: 'roomStart'; index: number };

export type Phase = 'fight' | 'cleared' | 'exiting' | 'dead';

export class World {
  hero: Hero;
  monsters: Monster[] = [];
  obstacles: Obstacle[] = [];
  layout: PropPlacement[] = [];
  roomIndex = 0;
  phase: Phase = 'fight';
  /** Ouverture de la grille de sortie (0 → 1). */
  gate = 0;
  /** Gel de l'image à l'impact (s). */
  hitstop = 0;
  bounds = { x0: 76, x1: ROOM_W - 76, y0: FLOOR_TOP + 24, y1: 1500 };
  private events: WorldEvent[] = [];
  private uid = 1;
  private rnd: () => number;

  constructor(private seed = 1) {
    this.rnd = rng(seed);
    const def = startingHero();
    this.hero = {
      def, x: ROOM_W / 2, y: 1300, hp: def.hp, maxHp: def.hp, facing: 1, moving: false, alive: true,
      attackCd: 0, swing: null, hurtT: 0, invulnT: 0,
    };
  }

  /** Le rendu indique jusqu'où le sol est visible au-dessus de la barre d'interface. */
  setPlayBottom(y: number) {
    this.bounds.y1 = y;
    this.hero.y = Math.min(this.hero.y, y);
  }

  drain(): WorldEvent[] {
    const e = this.events;
    this.events = [];
    return e;
  }

  /** Recommence le donjon depuis la première salle, PV pleins. */
  restart() {
    const def = startingHero();
    Object.assign(this.hero, { def, hp: def.hp, maxHp: def.hp, alive: true, swing: null, attackCd: 0, hurtT: 0, invulnT: 0 });
    this.startRoom(0);
  }

  startRoom(index: number) {
    this.roomIndex = index;
    this.phase = 'fight';
    this.gate = 0;
    this.rnd = rng(this.seed * 977 + index * 131);
    this.layout = roomLayout(index);
    this.obstacles = roomObstacles(this.layout);
    this.hero.x = ROOM_W / 2;
    this.hero.y = this.bounds.y1 - 30;
    this.hero.swing = null;
    this.monsters = [];
    const count = Math.min(7, 3 + Math.floor(index * 0.7));
    for (let i = 0; i < count; i++) {
      const id = CRYPT_POOL[Math.floor(this.rnd() * CRYPT_POOL.length)];
      const p = this.findSpawn();
      this.monsters.push(this.makeMonster(MONSTERS[id], p.x, p.y));
    }
    this.events.push({ type: 'roomStart', index });
  }

  private findSpawn(): Vec {
    for (let tries = 0; tries < 200; tries++) {
      const x = this.bounds.x0 + 30 + this.rnd() * (this.bounds.x1 - this.bounds.x0 - 60);
      const y = this.bounds.y0 + 90 + this.rnd() * Math.max(100, this.bounds.y1 - this.bounds.y0 - 420);
      if (this.obstacles.some((o) => flatDist(x, y, obstacleCore(o, x), o.y) < o.r + 50)) continue;
      if (this.monsters.some((m) => flatDist(x, y, m.x, m.y) < 110)) continue;
      if (flatDist(x, y, this.hero.x, this.hero.y) < 380) continue;
      return { x, y };
    }
    return { x: ROOM_W / 2, y: this.bounds.y0 + 120 };
  }

  private makeMonster(def: MonsterDef, x: number, y: number): Monster {
    return {
      uid: this.uid++, def, x, y, hp: def.hp, state: 'spawn', t: 0,
      cd: def.attack.cooldown[0] * (0.5 + this.rnd()), dir: { x: 0, y: 1 }, facing: -1,
      knock: { x: 0, y: 0 }, hurtT: 0, hidden: false, stealthT: this.rnd() * 3, moving: false,
    };
  }

  /* ------------------------------------------------------------------ */

  step(input: Vec) {
    if (this.hitstop > 0) {
      this.hitstop = Math.max(0, this.hitstop - STEP);
      return;
    }
    this.stepHero(input);
    for (const m of this.monsters) this.stepMonster(m);
    this.separate();

    if (this.phase === 'fight' && this.monsters.every((m) => m.state === 'dead')) {
      this.phase = 'cleared';
      this.events.push({ type: 'roomCleared' });
      // petit soin en fin de salle (10 % des PV max)
      const heal = Math.min(this.hero.maxHp - this.hero.hp, Math.round(this.hero.maxHp * 0.1));
      if (heal > 0 && this.hero.alive) {
        this.hero.hp += heal;
        this.events.push({ type: 'heal', x: this.hero.x, y: this.hero.y, amount: heal });
      }
    }
    if (this.phase === 'cleared') {
      this.gate = Math.min(1, this.gate + STEP / 0.9);
      const h = this.hero;
      if (this.gate >= 1 && h.alive && Math.abs(h.x - GATE.x) < GATE.halfWidth && h.y <= this.bounds.y0 + 6) {
        this.phase = 'exiting';
        this.events.push({ type: 'exit' });
      }
    }
  }

  private stepHero(input: Vec) {
    const h = this.hero;
    h.hurtT = Math.max(0, h.hurtT - STEP);
    h.invulnT = Math.max(0, h.invulnT - STEP);
    if (!h.alive || this.phase === 'exiting') {
      h.moving = false;
      return;
    }

    // Déplacement (la vitesse verticale est réduite par la perspective).
    let ix = input.x, iy = input.y;
    const m = Math.hypot(ix, iy);
    h.moving = m > 0.05;
    if (h.moving) {
      if (m > 1) { ix /= m; iy /= m; }
      let [nx, ny] = this.slideMove(h.x, h.y, ix * h.def.speed * STEP, iy * h.def.speed * STEP * 0.85, h.def.radius);
      // la grille ouverte laisse passer le joueur au fond de la salle
      const y0 = this.phase === 'cleared' && this.gate >= 1 && Math.abs(nx - GATE.x) < GATE.halfWidth ? this.bounds.y0 - 10 : this.bounds.y0;
      nx = Math.max(this.bounds.x0, Math.min(this.bounds.x1, nx));
      ny = Math.max(y0, Math.min(this.bounds.y1, ny));
      [nx, ny] = this.pushOut(nx, ny, h.def.radius);
      h.x = nx;
      h.y = ny;
      if (Math.abs(ix) > 0.15) h.facing = ix > 0 ? 1 : -1;
    }

    // Arme : attaque automatique, même en mouvement.
    const w = h.def.weapon;
    h.attackCd = Math.max(0, h.attackCd - STEP);
    if (h.swing) {
      h.swing.t += STEP;
      if (!h.swing.hit && h.swing.t >= h.swing.dur * w.impactAt) {
        h.swing.hit = true;
        this.weaponImpact(h.swing.dir);
      }
      if (h.swing.t >= h.swing.dur) h.swing = null;
    } else if (h.attackCd <= 0) {
      const target = this.nearestTarget(w.reach);
      if (target) {
        const dx = target.x - h.x, dy = (target.y - h.y) / PERSP, d = Math.hypot(dx, dy) || 1;
        const dir = { x: dx / d, y: dy / d };
        h.facing = dx >= 0 ? 1 : -1;
        h.swing = { t: 0, dur: Math.min(0.42, 0.8 / w.speed), hit: false, dir };
        h.attackCd = 1 / w.speed;
        this.events.push({ type: 'swing', dir });
      }
    }
  }

  private nearestTarget(reach: number): Monster | null {
    let best: Monster | null = null, bd = Infinity;
    for (const m of this.monsters) {
      if (m.state === 'dead' || m.state === 'spawn' || m.hidden) continue;
      const d = flatDist(m.x, m.y, this.hero.x, this.hero.y) - m.def.radius;
      if (d <= reach && d < bd) { bd = d; best = m; }
    }
    return best;
  }

  private weaponImpact(dir: Vec) {
    const h = this.hero, w = h.def.weapon;
    for (const m of this.monsters) {
      if (m.state === 'dead' || m.state === 'spawn') continue;
      const dx = m.x - h.x, dy = (m.y - h.y) / PERSP, d = Math.hypot(dx, dy);
      if (d - m.def.radius > w.reach + 6) continue;
      const ang = Math.acos(Math.max(-1, Math.min(1, (dx * dir.x + dy * dir.y) / (d || 1))));
      if (d > 30 && ang > w.arc) continue;
      const hit = resolveHit(w.roll, h.def.stats, m.def.stats, this.rnd);
      m.hp -= hit.damage;
      m.hurtT = 0.18;
      m.knock.x += (dx / (d || 1)) * 34;
      m.knock.y += (dy / (d || 1)) * 34;
      this.events.push({ type: 'hit', target: 'monster', uid: m.uid, x: m.x, y: m.y, damage: hit.damage, crit: hit.crit });
      this.hitstop = Math.max(this.hitstop, hit.crit ? 0.075 : 0.035);
      if (m.hp <= 0) {
        m.state = 'dead';
        m.t = 0;
        m.hidden = false;
        this.events.push({ type: 'death', uid: m.uid, x: m.x, y: m.y });
      } else if (m.state === 'windup' && hit.crit) {
        // un coup critique interrompt l'attaque en préparation
        m.state = 'recover';
        m.t = 0;
      }
    }
  }

  private stepMonster(m: Monster) {
    m.t += STEP;
    m.hurtT = Math.max(0, m.hurtT - STEP);
    if (m.state === 'dead') return;
    const h = this.hero, a = m.def.attack;

    // recul
    m.x += m.knock.x * STEP * 8;
    m.y += m.knock.y * PERSP * STEP * 8;
    m.knock.x *= 1 - STEP * 9;
    m.knock.y *= 1 - STEP * 9;

    if (m.state === 'spawn') {
      if (m.t >= 0.7) { m.state = 'chase'; m.t = 0; }
      return;
    }

    // Chafer Furtif : alterne visible / invisible
    if (m.def.behavior === 'stealth') {
      m.stealthT += STEP;
      const cycle = m.stealthT % 4.5;
      m.hidden = m.state === 'chase' && cycle > 2.6;
    }

    const dx = h.x - m.x, dy = (h.y - m.y) / PERSP, d = Math.hypot(dx, dy) || 1;
    if (Math.abs(dx) > 4 && m.state !== 'windup') m.facing = dx >= 0 ? 1 : -1;
    m.moving = false;

    if (m.state === 'chase') {
      m.cd -= STEP;
      if (h.alive) {
        let want = 0;
        if (m.def.behavior === 'lancer') {
          // le piquier garde ses distances
          if (d > a.trigger * 0.85) want = 1;
          else if (d < 120) want = -0.7;
        } else if (d > a.trigger * 0.8) want = 1;
        if (want !== 0) {
          const sp = m.def.speed * want * STEP;
          const [nx, ny] = this.slideMove(m.x, m.y, (dx / d) * sp, (dy / d) * sp * PERSP, m.def.radius);
          m.x = Math.max(this.bounds.x0, Math.min(this.bounds.x1, nx));
          m.y = Math.max(this.bounds.y0, Math.min(this.bounds.y1, ny));
          m.moving = true;
        }
        if (m.cd <= 0 && d <= a.trigger + 10) {
          m.state = 'windup';
          m.t = 0;
          m.dir = { x: dx / d, y: dy / d };
          m.hidden = false;
          this.events.push({ type: 'telegraph', uid: m.uid });
        }
      }
    } else if (m.state === 'windup') {
      if (m.t >= a.windup) {
        this.events.push({ type: 'strike', uid: m.uid });
        if (h.alive && h.invulnT <= 0 && this.inAttack(m)) this.hurtHero(m);
        // fente vers l'avant
        m.knock.x += m.dir.x * 40;
        m.knock.y += m.dir.y * 40;
        m.state = 'recover';
        m.t = 0;
      }
    } else if (m.state === 'recover') {
      if (m.t >= a.recover) {
        m.state = 'chase';
        m.t = 0;
        m.cd = a.cooldown[0] + this.rnd() * (a.cooldown[1] - a.cooldown[0]);
      }
    }
  }

  /** Le héros est-il dans la zone d'attaque annoncée du monstre ? (repère à plat) */
  inAttack(m: Monster): boolean {
    const a = m.def.attack, h = this.hero;
    const px = h.x - m.x, py = (h.y - m.y) / PERSP;
    const r = h.def.radius * 0.6;
    if (a.shape === 'circle') {
      const cx = m.dir.x * a.offset, cy = m.dir.y * a.offset;
      return Math.hypot(px - cx, py - cy) <= a.size + r;
    }
    const along = px * m.dir.x + py * m.dir.y;
    const side = Math.abs(px * m.dir.y - py * m.dir.x);
    if (a.shape === 'line') return along >= -r && along <= a.size + r && side <= a.spread + r;
    const d = Math.hypot(px, py);
    if (d > a.size + r) return false;
    if (d < 20) return true;
    return Math.acos(Math.max(-1, Math.min(1, along / d))) <= a.spread + 0.08;
  }

  private hurtHero(m: Monster) {
    const h = this.hero;
    const hit = resolveHit(m.def.attack.roll, m.def.stats, h.def.stats, this.rnd);
    h.hp = Math.max(0, h.hp - hit.damage);
    h.hurtT = 0.25;
    h.invulnT = 0.35;
    this.events.push({ type: 'hit', target: 'hero', x: h.x, y: h.y, damage: hit.damage, crit: hit.crit });
    if (h.hp <= 0) {
      h.alive = false;
      h.swing = null;
      this.phase = 'dead';
      this.events.push({ type: 'heroDied' });
    }
  }

  /**
   * Déplacement avec glissement : la part du mouvement qui rentre dans un obstacle est convertie
   * en mouvement le long de son bord (on contourne les colonnes au lieu de s'y coller).
   */
  private slideMove(x: number, y: number, vx: number, vy: number, r: number): [number, number] {
    let fx = vx, fy = vy / PERSP; // repère à plat
    for (const o of this.obstacles) {
      const ox = x + fx - obstacleCore(o, x + fx), oy = (y - o.y) / PERSP + fy, d = Math.hypot(ox, oy);
      if (d >= o.r + r + 0.5) continue;
      const nx0 = x - obstacleCore(o, x), ny0 = (y - o.y) / PERSP, n = Math.hypot(nx0, ny0) || 1;
      const ux = nx0 / n, uy = ny0 / n;
      const vn = fx * ux + fy * uy;
      if (vn >= 0) continue;
      const speed = Math.hypot(fx, fy);
      fx -= ux * vn;
      fy -= uy * vn;
      // de face : on part sur le côté le plus proche, à vitesse presque pleine
      if (Math.hypot(fx, fy) < speed * 0.35) {
        const side = x - o.x >= 0 ? 1 : -1;
        fx = -uy * side * speed * 0.9;
        fy = ux * side * speed * 0.9;
        if (fx * side < 0) { fx = -fx; fy = -fy; }
      }
    }
    return this.pushOut(x + fx, y + fy * PERSP, r);
  }

  /** Repousse un cercle hors des obstacles (glisse le long au lieu de bloquer). */
  private pushOut(x: number, y: number, r: number): [number, number] {
    for (const o of this.obstacles) {
      const cx = obstacleCore(o, x);
      // pile dans l'axe : léger décalage pour glisser d'un côté au lieu de rester bloqué
      const dx = Math.abs(x - cx) < 0.5 && o.hx === 0 ? (x >= cx ? 0.5 : -0.5) : x - cx;
      const dy = (y - o.y) / PERSP, d = Math.hypot(dx, dy), min = o.r + r;
      if (d < min && d > 0.001) {
        x = cx + (dx / d) * min;
        y = o.y + (dy / d) * min * PERSP;
      }
    }
    return [x, y];
  }

  /** Les monstres ne se superposent pas, ni au héros. */
  private separate() {
    const alive = this.monsters.filter((m) => m.state !== 'dead');
    for (let i = 0; i < alive.length; i++) {
      const a = alive[i];
      for (let j = i + 1; j < alive.length; j++) {
        const b = alive[j];
        const dx = a.x - b.x, dy = (a.y - b.y) / PERSP, d = Math.hypot(dx, dy), min = a.def.radius + b.def.radius;
        if (d < min && d > 0.001) {
          const push = (min - d) / 2;
          a.x += (dx / d) * push; a.y += (dy / d) * push * PERSP;
          b.x -= (dx / d) * push; b.y -= (dy / d) * push * PERSP;
        }
      }
      const h = this.hero;
      if (h.alive) {
        const dx = a.x - h.x, dy = (a.y - h.y) / PERSP, d = Math.hypot(dx, dy), min = a.def.radius + h.def.radius;
        if (d < min && d > 0.001) { a.x = h.x + (dx / d) * min; a.y = h.y + (dy / d) * min * PERSP; }
      }
    }
  }
}
