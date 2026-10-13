import { rng } from '../iso';
import { resolveHit } from './formulas';
import { startingHero, type HeroDef } from './data/hero';
import { CRYPT_POOL, gradeStats, MONSTERS, type MonsterDef } from './data/monsters';
import type { Stats } from './formulas';
import { CAST_DELAY, MELEE, MUTILATION, PA_MAX, PA_REGEN, PASSIVES, slotsForLevel, SOUFFRANCE, SPELLS, SUPPLICE_MARK, TURN, type PassiveId, type SpellDef, type SpellId } from './data/spells';
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
/** Durée de l'apparition d'un monstre (s). */
export const SPAWN_TIME = 0.4;

export interface Vec { x: number; y: number }

/** Distance au sol, corrigée de la perspective. */
export const flatDist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, (ay - by) / PERSP);

/**
 * Grade des monstres selon la salle : grade 1-2 au début, 4-5 à la fin du donjon
 * (comme les groupes plus forts au fond d'un donjon de Dofus).
 */
export function roomGrade(index: number, r: number): number {
  const base = 1 + Math.floor((index * 4) / (TOTAL_ROOMS - 2));
  return Math.min(5, base + (r < 0.35 ? 1 : 0));
}

export type MonsterState = 'spawn' | 'chase' | 'windup' | 'recover' | 'dead';

export interface Monster {
  uid: number;
  def: MonsterDef;
  /** Grade Dofus (1 à 5) et ce qui en découle. */
  grade: number;
  level: number;
  maxHp: number;
  stats: Stats;
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
  /** Accélération (Craquement d'Os) restante. */
  hasteT: number;
  /** Boss : délais avant la prochaine accélération / invocation. */
  crackT: number;
  summonT: number;
  /** Invocation : uid de son invocateur (meurt avec lui, comme dans Dofus). */
  summoner: number | null;
  /** Effets des sorts du Sacrieur (durées restantes, s). */
  markT: number;
  weakT: number;
  critDownT: number;
}

/** Sort placé dans une case pendant le donjon (avec ses améliorations de run). */
export interface SpellSlot {
  id: SpellId;
  /** +x : dégâts multipliés par (1 + x). */
  dmgBonus: number;
  /** x : temps de recharge multiplié par (1 - x). */
  cdBonus: number;
  cd: number;
}

/** Ce que le Sacrieur a gagné pendant le donjon (cartes) ; remis à zéro au donjon suivant. */
export interface RunState {
  slots: (SpellSlot | null)[];
  force: number;
  vitalite: number;
  critique: number;
  speed: number;
  /** Passifs : nombre de cartes prises pour chacun. */
  passives: Partial<Record<PassiveId, number>>;
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
  /** PA disponibles (jauge qui se recharge). */
  pa: number;
  /** Délai avant le prochain sort. */
  castCd: number;
  souffrance: number;
  souffranceT: number;
  /** Mutilation : palier (0 = inactive) et délai avant le palier suivant. */
  mutStage: number;
  mutT: number;
  /** Bouclier (Coagulation) : PV absorbés et durée. */
  shield: number;
  shieldT: number;
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
  | { type: 'roomStart'; index: number }
  | { type: 'wave' }
  | { type: 'bossCrack'; uid: number; x: number; y: number; radius: number }
  | { type: 'summon'; uid: number; by: number }
  | { type: 'victory' }
  | { type: 'cast'; spell: SpellId; slot: number; x: number; y: number; tx: number; ty: number; uid?: number }
  | { type: 'pull'; uid: number; fx: number; fy: number; x: number; y: number }
  | { type: 'mutilation'; stage: number; sacrifice: number }
  | { type: 'coagulation'; shield: number };

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
  run: RunState;
  bounds = { x0: 76, x1: ROOM_W - 76, y0: FLOOR_TOP + 24, y1: 1500 };
  /** Deuxième vague : monstres en réserve, et temps écoulé dans la salle. */
  reserve: { def: MonsterDef; grade: number }[] = [];
  roomT = 0;
  /** Boss de la salle (salle finale), s'il y en a un. */
  boss: Monster | null = null;
  private pending: Monster[] = [];
  private events: WorldEvent[] = [];
  private uid = 1;
  private rnd: () => number;

  constructor(private seed = 1) {
    this.rnd = rng(seed);
    const def = startingHero();
    this.hero = {
      def, x: ROOM_W / 2, y: 1300, hp: def.hp, maxHp: def.hp, facing: 1, moving: false, alive: true,
      attackCd: 0, swing: null, hurtT: 0, invulnT: 0, ...freshCombat(),
    };
    this.run = freshRun(def.level);
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
    Object.assign(this.hero, { def, hp: def.hp, maxHp: def.hp, alive: true, swing: null, attackCd: 0, hurtT: 0, invulnT: 0, ...freshCombat() });
    this.run = freshRun(def.level);
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
    this.hero.y = this.bounds.y1 - 240; // au-dessus du joystick
    this.hero.swing = null;
    this.monsters = [];
    this.roomT = 0;
    this.boss = null;
    if (index === TOTAL_ROOMS - 1) {
      // salle du boss : Kardorim (grade 5) et deux Chafers aguerris
      this.reserve = [];
      this.boss = this.makeMonster(MONSTERS.kardorim, 5, ROOM_W / 2, this.bounds.y0 + 170);
      this.monsters.push(this.boss);
      for (let i = 0; i < 2; i++) {
        const p = this.findSpawn();
        this.monsters.push(this.makeMonster(MONSTERS[CRYPT_POOL[Math.floor(this.rnd() * CRYPT_POOL.length)]], 4, p.x, p.y));
      }
      this.events.push({ type: 'roomStart', index });
      return;
    }
    // 5 monstres en salle 1, jusqu'à 10 ; à partir de la salle 4, une partie arrive en deuxième vague
    const count = Math.min(10, 5 + Math.floor(index * 0.75));
    const defs = [...Array(count)].map(() => ({
      def: MONSTERS[CRYPT_POOL[Math.floor(this.rnd() * CRYPT_POOL.length)]],
      grade: roomGrade(index, this.rnd()),
    }));
    const second = index >= 3 ? Math.round(count * 0.4) : 0;
    this.reserve = defs.splice(defs.length - second, second);
    for (const { def, grade } of defs) {
      const p = this.findSpawn();
      this.monsters.push(this.makeMonster(def, grade, p.x, p.y));
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

  private makeMonster(def: MonsterDef, grade: number, x: number, y: number): Monster {
    const g = gradeStats(def, grade);
    return {
      uid: this.uid++, def, grade, level: g.level, maxHp: g.maxHp, stats: g.stats, x, y, hp: g.maxHp, state: 'spawn', t: 0,
      cd: def.attack.cooldown[0] * (0.5 + this.rnd()), dir: { x: 0, y: 1 }, facing: -1,
      knock: { x: 0, y: 0 }, hurtT: 0, hidden: false, stealthT: this.rnd() * 3, moving: false,
      hasteT: 0, crackT: def.boss?.crackEvery ?? 0, summonT: def.boss?.summonFirst ?? 0, summoner: null,
      markT: 0, weakT: 0, critDownT: 0,
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
    if (this.pending.length) {
      this.monsters.push(...this.pending);
      this.pending = [];
    }
    this.separate();
    this.roomT += STEP;

    // deuxième vague : quand il ne reste que 2 monstres, ou au bout de 10 s
    if (this.reserve.length && this.phase === 'fight') {
      const alive = this.monsters.filter((m) => m.state !== 'dead').length;
      if (alive <= 2 || this.roomT >= 10) {
        for (const { def, grade } of this.reserve) {
          const p = this.findSpawn();
          this.monsters.push(this.makeMonster(def, grade, p.x, p.y));
        }
        this.reserve = [];
        this.events.push({ type: 'wave' });
      }
    }

    if (this.phase === 'fight' && !this.reserve.length && this.monsters.every((m) => m.state === 'dead')) {
      this.phase = 'cleared';
      this.events.push({ type: this.boss ? 'victory' : 'roomCleared' });
    }
    // la grille de la salle du boss reste fermée : le donjon est fini
    if (this.phase === 'cleared' && !this.boss) {
      this.gate = Math.min(1, this.gate + STEP / 0.6);
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
      const speed = h.def.speed * (1 + this.run.speed);
      let [nx, ny] = this.slideMove(h.x, h.y, ix * speed * STEP, iy * speed * STEP * 0.85, h.def.radius);
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
        const ws = w.speed * (1 + this.passive('frenesie'));
        h.swing = { t: 0, dur: Math.min(0.42, 0.8 / ws), hit: false, dir };
        h.attackCd = 1 / ws;
        this.events.push({ type: 'swing', dir });
      }
    }

    this.stepSpells();
  }

  /** Caractéristiques du Sacrieur en combat : base + cartes + Souffrance + Mutilation. */
  heroStats(): Stats {
    const s = this.hero.def.stats, h = this.hero;
    return {
      ...s,
      force: s.force + this.run.force,
      critique: s.critique + this.run.critique,
      puissance: s.puissance + h.souffrance * (SOUFFRANCE.powerPerCharge + this.passive('douleur')) + h.mutStage * MUTILATION.power,
    };
  }

  /** Valeur cumulée d'un passif (0 si aucune carte prise). */
  passive(id: PassiveId): number {
    return (this.run.passives[id] ?? 0) * PASSIVES[id].per;
  }

  /** Recharge des PA, Souffrance, Mutilation, puis lancer automatique selon l'ordre des cases. */
  private stepSpells() {
    const h = this.hero;
    // Sang neuf : régénération continue
    const regen = this.passive('regeneration');
    if (regen > 0 && h.alive && this.phase === 'fight') h.hp = Math.min(h.maxHp, h.hp + h.maxHp * regen * STEP);
    h.pa = Math.min(PA_MAX, h.pa + PA_REGEN * STEP);
    h.castCd = Math.max(0, h.castCd - STEP);
    for (const sl of this.run.slots) if (sl) sl.cd = Math.max(0, sl.cd - STEP);
    // la Souffrance retombe d'une charge par tour sans coup reçu
    h.souffranceT += STEP;
    if (h.souffrance > 0 && h.souffranceT >= SOUFFRANCE.decayEvery) {
      h.souffrance--;
      h.souffranceT = 0;
    }
    // bouclier de Coagulation
    if (h.shieldT > 0) {
      h.shieldT -= STEP;
      if (h.shieldT <= 0) h.shield = 0;
    }
    // Mutilation : un palier de plus à chaque tour ; sous 40 % de PV, elle devient un bouclier
    if (h.mutStage > 0) {
      if (h.hp / h.maxHp < MUTILATION.stopBelow || this.phase !== 'fight') this.coagulation();
      else {
        h.mutT -= STEP;
        if (h.mutT <= 0 && h.mutStage < MUTILATION.maxStage) this.mutilate(h.mutStage + 1);
      }
    }
    if (this.phase !== 'fight' || h.castCd > 0) return;
    this.run.slots.some((sl, i) => {
      if (!sl || sl.cd > 0) return false;
      const sp = SPELLS[sl.id];
      if (h.pa < sp.pa) return false;
      if (!this.cast(sp, sl, i)) return false;
      h.pa -= sp.pa;
      sl.cd = sp.cooldown * (1 - sl.cdBonus);
      h.castCd = CAST_DELAY;
      return true;
    });
  }

  private targets(minD: number, maxD: number): Monster[] {
    const h = this.hero;
    return this.monsters
      .filter((m) => m.state !== 'dead' && m.state !== 'spawn' && !m.hidden)
      .map((m) => ({ m, d: flatDist(m.x, m.y, h.x, h.y) - m.def.radius }))
      .filter((o) => o.d >= minD && o.d <= maxD)
      .sort((a, b) => a.d - b.d)
      .map((o) => o.m);
  }

  /** Lance un sort s'il a une cible valide ; renvoie false sinon (on essaie la case suivante). */
  private cast(sp: SpellDef, sl: SpellSlot, slot: number): boolean {
    const h = this.hero, k = sp.kind;
    if (k.type === 'mutilation') {
      if (h.mutStage > 0 || h.hp / h.maxHp <= MUTILATION.startAbove || !this.targets(0, 9e9).length) return false;
      this.events.push({ type: 'cast', spell: sp.id, slot, x: h.x, y: h.y, tx: h.x, ty: h.y });
      this.mutilate(1);
      return true;
    }
    if (k.type === 'pull') {
      const bonus = h.souffrance >= SOUFFRANCE.pullBonusAt ? SOUFFRANCE.pullBonusCells * 60 : 0;
      const m = this.targets(Math.max(sp.range[0], MELEE + 20), sp.range[1] + bonus)[0];
      if (!m) return false;
      this.events.push({ type: 'cast', spell: sp.id, slot, x: h.x, y: h.y, tx: m.x, ty: m.y, uid: m.uid });
      const fx = m.x, fy = m.y;
      const dx = m.x - h.x, dy = (m.y - h.y) / PERSP, d = Math.hypot(dx, dy) || 1;
      const pull = (k.cells + (bonus ? 4 : 0)) * 60;
      const keep = Math.max(h.def.radius + m.def.radius + 10, d - pull);
      let nx = h.x + (dx / d) * keep, ny = h.y + (dy / d) * keep * PERSP;
      nx = Math.max(this.bounds.x0, Math.min(this.bounds.x1, nx));
      ny = Math.max(this.bounds.y0, Math.min(this.bounds.y1, ny));
      [m.x, m.y] = this.pushOut(nx, ny, m.def.radius);
      m.knock.x = m.knock.y = 0;
      this.events.push({ type: 'pull', uid: m.uid, fx, fy, x: m.x, y: m.y });
      return true;
    }
    const m = this.targets(sp.range[0], sp.range[1])[0];
    if (!m) return false;
    this.events.push({ type: 'cast', spell: sp.id, slot, x: h.x, y: h.y, tx: m.x, ty: m.y, uid: m.uid });
    const roll = { ...k.roll, min: Math.round(k.roll.min * (1 + sl.dmgBonus)), max: Math.round(k.roll.max * (1 + sl.dmgBonus)) };
    const hit = resolveHit(roll, this.heroStats(), m.stats, this.rnd);
    if (k.debuff === 'mark') m.markT = TURN;
    if (k.debuff === 'power') m.weakT = TURN;
    if (k.debuff === 'crit') m.critDownT = TURN;
    this.damageMonster(m, hit.damage, hit.crit);
    this.healHero(Math.floor(hit.damage * (0.5 + this.passive('vampirisme'))));
    return true;
  }

  private mutilate(stage: number) {
    const h = this.hero;
    const cost = Math.max(1, Math.round(h.hp * MUTILATION.sacrifice));
    h.hp = Math.max(1, h.hp - cost);
    h.mutStage = stage;
    h.mutT = TURN;
    this.events.push({ type: 'mutilation', stage, sacrifice: cost });
  }

  /** Coagulation : la Mutilation s'arrête et laisse un bouclier selon son palier. */
  private coagulation() {
    const h = this.hero;
    const pct = MUTILATION.shield[Math.min(h.mutStage, MUTILATION.shield.length) - 1];
    h.mutStage = 0;
    h.shield = Math.round((h.maxHp * pct) / 100);
    h.shieldT = TURN;
    this.events.push({ type: 'coagulation', shield: h.shield });
  }

  healHero(amount: number) {
    const h = this.hero;
    const heal = Math.min(amount, h.maxHp - h.hp);
    if (heal <= 0 || !h.alive) return;
    h.hp += heal;
    this.events.push({ type: 'heal', x: h.x, y: h.y, amount: heal });
  }

  private damageMonster(m: Monster, damage: number, crit: boolean) {
    m.hp -= damage;
    m.hurtT = 0.18;
    this.events.push({ type: 'hit', target: 'monster', uid: m.uid, x: m.x, y: m.y, damage, crit });
    if (m.hp <= 0) this.kill(m);
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
      const hit = resolveHit(w.roll, this.heroStats(), m.stats, this.rnd);
      // Supplice : frapper une cible marquée soigne de 20 % des dommages
      if (m.markT > 0) this.healHero(Math.floor(hit.damage * SUPPLICE_MARK));
      m.hp -= hit.damage;
      m.hurtT = 0.18;
      m.knock.x += (dx / (d || 1)) * 34;
      m.knock.y += (dy / (d || 1)) * 34;
      this.events.push({ type: 'hit', target: 'monster', uid: m.uid, x: m.x, y: m.y, damage: hit.damage, crit: hit.crit });
      this.hitstop = Math.max(this.hitstop, hit.crit ? 0.075 : 0.035);
      if (m.hp <= 0) {
        this.kill(m);
      } else if (m.state === 'windup' && hit.crit) {
        // un coup critique interrompt l'attaque en préparation
        m.state = 'recover';
        m.t = 0;
      }
    }
  }

  private kill(m: Monster) {
    m.state = 'dead';
    m.t = 0;
    m.hp = Math.min(m.hp, 0);
    m.hidden = false;
    this.events.push({ type: 'death', uid: m.uid, x: m.x, y: m.y });
    // les invocations disparaissent avec leur invocateur
    for (const s of this.monsters) if (s.summoner === m.uid && s.state !== 'dead') this.kill(s);
  }

  /** Sorts de boss (Craquement d'Os, Appel de Kardorib). */
  private stepBoss(m: Monster) {
    const b = m.def.boss!;
    m.crackT -= STEP;
    if (m.crackT <= 0) {
      m.crackT = b.crackEvery;
      for (const o of this.monsters) {
        if (o.state !== 'dead' && flatDist(o.x, o.y, m.x, m.y) <= b.crackRadius) o.hasteT = b.crackDuration;
      }
      this.events.push({ type: 'bossCrack', uid: m.uid, x: m.x, y: m.y, radius: b.crackRadius });
    }
    m.summonT -= STEP;
    if (m.summonT <= 0) {
      m.summonT = b.summonEvery;
      const alive = this.monsters.filter((o) => o.summoner === m.uid && o.state !== 'dead').length;
      if (alive < b.maxSummons) {
        const side = this.rnd() < 0.5 ? -1 : 1;
        const x = Math.max(this.bounds.x0 + 30, Math.min(this.bounds.x1 - 30, m.x + side * 90));
        const [sx, sy] = this.pushOut(x, m.y + 30, 26);
        const s = this.makeMonster(MONSTERS[b.summon], 1, sx, sy);
        s.summoner = m.uid;
        this.pending.push(s);
        this.events.push({ type: 'summon', uid: s.uid, by: m.uid });
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
      if (m.t >= SPAWN_TIME) { m.state = 'chase'; m.t = 0; }
      return;
    }

    m.hasteT = Math.max(0, m.hasteT - STEP);
    m.markT = Math.max(0, m.markT - STEP);
    m.weakT = Math.max(0, m.weakT - STEP);
    m.critDownT = Math.max(0, m.critDownT - STEP);
    if (m.def.boss && h.alive) this.stepBoss(m);

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
          const sp = m.def.speed * (m.hasteT > 0 ? m.def.boss?.haste ?? 1.6 : 1) * want * STEP;
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
    // Absorption (-50 Puissance) et Stase (-10 % Critique) affaiblissent la cible pendant un tour
    const st = m.weakT > 0 || m.critDownT > 0
      ? { ...m.stats, puissance: m.stats.puissance - (m.weakT > 0 ? 50 : 0), critique: m.stats.critique - (m.critDownT > 0 ? 10 : 0) }
      : m.stats;
    const hit = resolveHit(m.def.attack.roll, st, h.def.stats, this.rnd);
    const dmg = Math.round(hit.damage * (1 - this.passive('endurance')));
    const absorbed = Math.min(h.shield, dmg);
    h.shield -= absorbed;
    h.hp = Math.max(0, h.hp - (dmg - absorbed));
    // Épines : une partie des dégâts revient à l'attaquant
    const thorns = Math.floor(dmg * this.passive('epines'));
    if (thorns > 0 && m.state !== 'dead') this.damageMonster(m, thorns, false);
    h.souffrance = Math.min(SOUFFRANCE.max, h.souffrance + 1);
    h.souffranceT = 0;
    h.hurtT = 0.25;
    h.invulnT = 0.35;
    this.events.push({ type: 'hit', target: 'hero', x: h.x, y: h.y, damage: dmg, crit: hit.crit });
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

function freshCombat() {
  return { pa: PA_MAX, castCd: 0, souffrance: 0, souffranceT: 0, mutStage: 0, mutT: 0, shield: 0, shieldT: 0 };
}

function freshRun(level: number): RunState {
  return { slots: Array(slotsForLevel(level)).fill(null), force: 0, vitalite: 0, critique: 0, speed: 0, passives: {} };
}
