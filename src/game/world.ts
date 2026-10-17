import { rng } from '../iso';
import { erosionLoss, escapeChance, escapeOf, initiativeOf, prospectionOf, pushDamage, resolveHit, tackleOf, type Element, type HitContext } from './formulas';
import { xpGain } from './progression';
import { rollDrops } from './loot';
import { startingHero, type HeroDef } from './data/hero';
import { gradeStats, MONSTERS, type MonsterAttack, type MonsterDef } from './data/monsters';
import { CRYPTE, type AreaDef } from './data/areas';
import type { Stats } from './formulas';
import { CAST_DELAY, CELL, MELEE, SPELL_POWER, MUTILATION, PA_MAX, PA_REGEN, PASSIVES, slotsForLevel, SOUFFRANCE, SPELLS, SUPPLICE_MARK, TURN, type PassiveId, type SpellDef, type SpellId } from './data/spells';
import { islandLayout, mirrorLayout, obstacleCore, roomLayout, roomObstacles, type Obstacle, type PropPlacement } from './rooms';
import { ELITE_SHAPES, FIRST_SHAPES, MID_SHAPES, roomShape, type RoomShape, type ShapeId } from './shapes';

/**
 * Monde de jeu : toute la logique du combat, indépendante de l'affichage.
 * Avance par pas fixes (STEP) et publie des événements que le rendu consomme.
 */

export const STEP = 1 / 60;
/** Écrasement vertical de la vue 3/4 : les distances au sol se calculent « à plat » (y / PERSP). */
export const PERSP = 0.62;
export const ROOM_W = 720;
export const FLOOR_TOP = 300;
/** Salles de la Crypte de Kardorim (référence des tests et de l'équilibrage). */
export const TOTAL_ROOMS = 9;
export const GATE = { x: ROOM_W / 2, halfWidth: 70 };
/** Durée de l'apparition d'un monstre (s). */
export const SPAWN_TIME = 0.4;
/** Initiative perdue : délai avant la première action (s). */
export const INITIATIVE_DELAY = 0.8;
/** Tacle : distance de contact en plus des rayons (px) et vitesse minimale quand on est taclé. */
export const TACKLE_REACH = 16;
export const TACKLE_MIN = 0.4;
/** Poussée : fenêtre après un coup d'épée (s) et recul minimal pour compter comme une poussée. */
export const PUSH_WINDOW = 0.3;
export const PUSH_MIN_KNOCK = 12;
/** Une attaque de monstre déclenchée à moins de cette distance est une attaque de mêlée. */
export const MONSTER_MELEE = 160;
const WEAPON_HIT: HitContext = { melee: true, source: 'arme' };

export interface Vec { x: number; y: number }

/** Distance au sol, corrigée de la perspective. */
export const flatDist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, (ay - by) / PERSP);

/**
 * Grade des monstres selon la salle : grade 1-2 au début, 4-5 à la fin du donjon
 * (comme les groupes plus forts au fond d'un donjon de Dofus).
 */
export function roomGrade(index: number, r: number, rooms = TOTAL_ROOMS): number {
  const base = 1 + Math.floor((index * 4) / Math.max(1, rooms - 2));
  return Math.min(5, base + (r < 0.35 ? 1 : 0));
}

/** Centre d'une attaque en cercle devant le monstre (sort à distance : là où était le héros). */
export const attackOffset = (m: { atk: MonsterAttack; aim: number }) => (m.atk.atTarget ? m.aim : m.atk.offset);

/** Salles spéciales (création) : embuscade, coffre gardé, fontaine de soin, vagues à tenir. */
export type Special = 'embuscade' | 'coffre' | 'fontaine' | 'vagues';
export const SPECIAL_NAMES: Record<Special, string> = { embuscade: 'Embuscade', coffre: 'Coffre gardé', fontaine: 'Fontaine', vagues: 'Vagues' };
/** Durée à tenir dans une salle de vagues (s), soin de la fontaine (part des PV max par seconde, et au plus par salle). */
/** Chances qu'une salle soit spéciale (le reste : salle normale). Le coffre est très rare. */
export const SPECIAL_ODDS: [Special, number][] = [['embuscade', 0.12], ['vagues', 0.12], ['fontaine', 0.1], ['coffre', 0.02]];
export const WAVES_TIME = 20;
/** Chance qu'une salle normale accueille des monstres errants (Lac, Mine, Route des âmes). */
export const WANDER_CHANCE = 0.2;
/** Vagues : monstres au départ, au plus en même temps, et délai entre deux renforts (s). */
export const WAVES = { start: 2, maxAlive: 4, every: 3 };
export const FOUNTAIN_RATE = 0.06;
export const FOUNTAIN_MAX = 0.5;
export const FOUNTAIN_REACH = 125;

/** Plan d'une partie : forme, sens et éventuelle salle spéciale de chaque salle (tiré au début de chaque partie). */
export interface RoomPlan {
  shape: ShapeId;
  mirror: boolean;
  special: Special | null;
}

/**
 * Pièges de carte (création) : troupeau qui traverse (Pâturages), feux follets qui explosent (Forêt),
 * mains de squelette qui agrippent (Cimetière). Dégâts en part des PV max du héros.
 */
export type HazardKind = 'herd' | 'wisp' | 'hands';
export interface Hazard {
  id: number;
  kind: HazardKind;
  x: number;
  y: number;
  state: 'idle' | 'windup' | 'active' | 'gone';
  t: number;
  /** Sens du troupeau. */
  dir: 1 | -1;
  /** Déjà touchés par ce piège (héros = 0, monstres = uid). */
  hit: number[];
}
export const HAZARD = {
  herd: { every: [8, 11], windup: 1.3, speed: 900, half: 46, damage: 0.1 },
  wisp: { count: 3, trigger: 95, windup: 0.8, radius: 90, damage: 0.08, respawn: 7 },
  hands: { every: [5, 7], windup: 1.0, radius: 58, damage: 0.04, root: 1.1, life: 0.6 },
} as const;

export type MonsterState = 'spawn' | 'chase' | 'windup' | 'recover' | 'dead';

export interface Monster {
  uid: number;
  def: MonsterDef;
  /** Grade Dofus (1 à 5) et ce qui en découle. */
  grade: number;
  level: number;
  maxHp: number;
  /** XP rapportée (grade DofusDB). */
  xp: number;
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
  /** Sort posé à distance : distance de la zone devant le monstre (fixée au début de l'annonce). */
  aim: number;
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
  /** Attaque en cours (normale ou charge) et délai avant la prochaine charge. */
  atk: MonsterAttack;
  chargeT: number;
  /** Soin unique déjà utilisé ; délai avant le prochain soin périodique (boss). */
  healed: boolean;
  healT?: number;
  /** Bloqué contre un obstacle : temps passé sans avancer, puis contournement par un côté pendant `detourT`. */
  stuckT: number;
  detourT: number;
  detourSide: 1 | -1;
  /** Effets des sorts du Sacrieur (durées restantes, s). */
  markT: number;
  weakT: number;
  critDownT: number;
  /** Fenêtre après un coup d'épée : heurter un obstacle pendant le recul inflige des dommages de poussée. */
  pushT: number;
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
  swing: { t: number; dur: number; hit: boolean; dir: Vec; target: number } | null;
  hurtT: number;
  invulnT: number;
  /** PA disponibles (jauge qui se recharge). */
  pa: number;
  /** Délai avant le prochain sort. */
  castCd: number;
  /** Souffrance : 1 charge par tranche de 10 % de PV perdus (vie érodée comprise). */
  souffrance: number;
  /** Mutilation : palier (0 = inactive) et délai avant le palier suivant. */
  mutStage: number;
  mutT: number;
  /** Bouclier (Coagulation) : PV absorbés et durée. */
  shield: number;
  shieldT: number;
  /** PV max perdus par érosion dans la salle (rendus à la salle suivante). */
  eroded: number;
  /** Ralenti par le tacle d'un monstre au contact (0 = libre, pour l'affichage). */
  tackled: number;
  /** Agrippé (mains du Cimetière) : immobile tant que > 0. */
  rootT: number;
}

export type WorldEvent =
  | { type: 'swing'; dir: Vec; ranged: boolean; x: number; y: number }
  | { type: 'hit'; target: 'monster' | 'hero'; uid?: number; x: number; y: number; damage: number; crit: boolean; element?: Element; eff?: 'weak' | 'resist'; push?: boolean }
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
  | { type: 'coagulation'; shield: number }
  | { type: 'initiative'; hero: boolean }
  | { type: 'xp'; amount: number; x: number; y: number }
  | { type: 'drop'; items: number[]; x: number; y: number; boss: boolean }
  | { type: 'special'; special: Special }
  | { type: 'ambush' }
  | { type: 'chest'; items: number[]; x: number; y: number }
  | { type: 'flee'; uid: number; x: number; y: number }
  | { type: 'hazard'; id: number; kind: HazardKind; phase: 'warn' | 'strike' }
  | { type: 'rooted' }
  | { type: 'wavesOver' }
  | { type: 'monsterHeal'; uid: number; x: number; y: number; amount: number; spell?: string }
  | { type: 'wanderers'; name: string };

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
  /** Statistiques de la partie (bilan de fin). */
  stats = freshStats();
  bounds = { x0: 76, x1: ROOM_W - 76, y0: FLOOR_TOP + 24, y1: 1500 };
  /** Deuxième vague : monstres en réserve, et temps écoulé dans la salle. */
  reserve: { def: MonsterDef; grade: number }[] = [];
  roomT = 0;
  /** Boss de la salle (salle finale), s'il y en a un. */
  boss: Monster | null = null;
  /** Mini-boss (salle du milieu), s'il y en a un. */
  elite: Monster | null = null;
  /** Plan de la partie, forme et salle spéciale de la salle en cours. */
  plan: RoomPlan[] = [];
  shape: RoomShape = roomShape('plaine');
  special: Special | null = null;
  /** Gardien du coffre, position du coffre (ouvert ou non), fontaine et soin déjà rendu. */
  guard: Monster | null = null;
  chest: { x: number; y: number; open: boolean } | null = null;
  fountain: { x: number; y: number; healed: number; acc: number } | null = null;
  /** Salle de vagues : temps restant à tenir. */
  wavesT = 0;
  private waveSpawnT = 0;
  private ambush = false;
  hazards: Hazard[] = [];
  private hazardT = 0;
  private hazardUid = 1;
  /** Dernière salle de la carte ou du donjon. */
  get lastRoom() {
    return this.roomIndex >= this.area.rooms - 1;
  }
  private pending: Monster[] = [];
  private events: WorldEvent[] = [];
  private uid = 1;
  private rnd: () => number;
  /** Tirages du butin (séparés : le butin ne change pas le déroulé du combat). */
  private lootRnd: () => number;

  constructor(private seed = 1, def: HeroDef = startingHero(), public area: AreaDef = CRYPTE) {
    this.rnd = rng(seed);
    this.lootRnd = rng(seed * 7919 + 17);
    this.hero = {
      def, x: ROOM_W / 2, y: 1300, hp: def.hp, maxHp: def.hp, facing: 1, moving: false, alive: true,
      attackCd: 0, swing: null, hurtT: 0, invulnT: 0, ...freshCombat(),
    };
    this.run = freshRun(def.level);
    this.planRun();
  }

  /** Tire le plan de la partie : formes des salles (sans répétition), sens, salles spéciales. */
  private planRun() {
    const r = rng(this.seed * 31 + 7);
    const A = this.area, island = A.theme !== 'crypt';
    const shuffle = <T>(a: T[]) => {
      const b = [...a];
      for (let i = b.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [b[i], b[j]] = [b[j], b[i]];
      }
      return b;
    };
    const pick = <T>(a: T[]) => a[Math.floor(r() * a.length)];
    const fixed = (i: number) => (A.elite && i === A.elite.room) || (A.boss && i === A.rooms - 1);
    const mids = shuffle(MID_SHAPES);
    // chaque salle (hors première, élite et boss) est tirée au hasard : souvent normale, parfois spéciale, très rarement un coffre
    const special = (i: number): Special | null => {
      if (i === 0 || fixed(i)) return null;
      let x = r();
      for (const [kind, pct] of SPECIAL_ODDS) {
        if (x < pct) return kind;
        x -= pct;
      }
      return null;
    };
    let k = 0;
    this.plan = [...Array(A.rooms)].map((_, i) => ({
      shape: !island ? 'plaine' : i === 0 ? pick(FIRST_SHAPES) : fixed(i) ? pick(ELITE_SHAPES) : mids[k++ % mids.length],
      mirror: r() < 0.5,
      special: special(i),
    }));
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

  /** Recommence le donjon depuis la première salle, PV pleins (avec le Sacrieur du profil à jour). */
  restart(def: HeroDef = this.hero.def, area: AreaDef = this.area) {
    this.area = area;
    Object.assign(this.hero, { def, hp: def.hp, maxHp: def.hp, alive: true, swing: null, attackCd: 0, hurtT: 0, invulnT: 0, ...freshCombat() });
    this.run = freshRun(def.level);
    this.stats = freshStats();
    // nouvelle partie : autres monstres, autres salles
    this.seed = (this.seed * 48271 + 11) % 2147483647;
    this.planRun();
    this.startRoom(0);
  }

  startRoom(index: number) {
    this.roomIndex = index;
    this.phase = 'fight';
    this.gate = 0;
    this.rnd = rng(this.seed * 977 + index * 131);
    const plan = this.plan[index] ?? { shape: 'plaine', mirror: false, special: null };
    const theme = this.area.theme;
    this.shape = roomShape(plan.shape, plan.mirror);
    this.bounds.x0 = 76 + this.shape.margin;
    this.bounds.x1 = ROOM_W - 76 - this.shape.margin;
    this.special = plan.special;
    this.hero.x = ROOM_W / 2;
    this.hero.y = this.bounds.y1 - 240; // au-dessus du joystick
    this.hero.swing = null;
    this.hero.rootT = 0;
    this.guard = null;
    this.chest = null;
    this.fountain = null;
    this.wavesT = 0;
    this.ambush = false;
    this.hazards = [];
    this.hazardT = 4;
    // objets de la salle spéciale, posés là où il y a de la place
    const extra: PropPlacement[] = [];
    if (this.special === 'coffre') {
      const c = this.freeSpot(plan.mirror ? this.bounds.x1 - 80 : this.bounds.x0 + 80, this.bounds.y0 + 190, 40);
      this.chest = { ...c, open: false };
      extra.push({ kind: 'chest', x: c.x, y: c.y });
    } else if (this.special === 'fontaine') {
      const c = this.freeSpot(ROOM_W / 2 + (plan.mirror ? 90 : -90), (this.bounds.y0 + this.bounds.y1) / 2, 60);
      this.fountain = { ...c, healed: 0, acc: 0 };
      extra.push({ kind: 'fountain', x: c.x, y: c.y });
    }
    if (theme !== 'crypt') {
      const keep = [{ x: this.hero.x, y: this.hero.y, r: 150 }];
      for (const b of this.shape.bands) for (const sd of [-1, 1]) keep.push({ x: b.gapX, y: b.y + sd * (b.half + 40), r: 90 });
      const blockers = this.shape.id === 'couloir' || this.shape.id === 'archipel' ? 2 : this.shape.id === 'pont' ? 3 : 4;
      this.layout = islandLayout(theme, { ...this.bounds, holes: this.shape.holes, keep }, this.rnd, blockers, extra);
    } else {
      // Crypte : une des dispositions, au hasard et parfois retournée ; les objets spéciaux remplacent ce qui les gêne
      const base = roomLayout(Math.floor(this.rnd() * 4), theme);
      const l = plan.mirror ? mirrorLayout(base) : base;
      this.layout = [...l.filter((p) => extra.every((e) => flatDist(p.x, p.y, e.x, e.y) > 170)), ...extra];
    }
    this.obstacles = [...roomObstacles(this.layout), ...this.shape.holes];
    // l'érosion dure le temps d'un combat
    this.hero.maxHp += this.hero.eroded;
    this.hero.eroded = 0;
    this.monsters = [];
    this.roomT = 0;
    this.boss = null;
    this.elite = null;
    const A = this.area;
    const pick = () => MONSTERS[A.pool[Math.floor(this.rnd() * A.pool.length)]];
    if (A.elite && index === A.elite.room) {
      // salle de l'élite (mini-boss) et ses accompagnants
      this.reserve = [];
      this.elite = this.makeMonster(MONSTERS[A.elite.id], A.elite.grade, ROOM_W / 2, this.bounds.y0 + 200);
      this.monsters.push(this.elite);
      for (let i = 0; i < A.elite.adds; i++) {
        const p = this.findSpawn();
        this.monsters.push(this.makeMonster(pick(), A.elite.addGrade, p.x, p.y));
      }
      this.rollInitiative();
      this.events.push({ type: 'roomStart', index });
      return;
    }
    if (A.boss && index === A.rooms - 1) {
      // salle du boss (grade 5) et ses monstres aguerris
      this.reserve = [];
      this.boss = this.makeMonster(MONSTERS[A.boss.id], A.boss.grade, ROOM_W / 2, this.bounds.y0 + 170);
      this.monsters.push(this.boss);
      for (let i = 0; i < A.boss.adds; i++) {
        const p = this.findSpawn();
        this.monsters.push(this.makeMonster(pick(), 4 + (i % 2), p.x, p.y));
      }
      this.rollInitiative();
      this.events.push({ type: 'roomStart', index });
      return;
    }
    // monstres de plus en plus nombreux ; à partir de `waveFrom`, une partie arrive en deuxième vague
    const count = Math.min(A.count.max, A.count.base + Math.floor(index * A.count.perRoom));
    const roll = () => ({ def: pick(), grade: roomGrade(index, this.rnd(), A.rooms) });
    if (this.special === 'embuscade') {
      // la salle a l'air vide… puis tout le monde surgit autour du héros
      this.reserve = [...Array(count)].map(roll);
      this.ambush = true;
    } else if (this.special === 'vagues') {
      this.reserve = [];
      this.wavesT = WAVES_TIME;
      this.waveSpawnT = WAVES.every;
      for (let i = 0; i < WAVES.start; i++) this.spawnRoll(roll());
    } else {
      const n = this.special === 'fontaine' ? Math.max(2, count - 2) : this.special === 'coffre' ? Math.max(2, count - 2) : count;
      const defs = [...Array(n)].map(roll);
      const second = index >= A.waveFrom && this.special !== 'fontaine' ? Math.round(n * 0.4) : 0;
      this.reserve = defs.splice(defs.length - second, second);
      // rencontre : un petit groupe venu d'une autre zone d'Incarnam remplace une partie des monstres
      const W = A.wanderers;
      if (W?.length && !this.special && this.rnd() < WANDER_CHANCE) {
        const grp = W[Math.floor(this.rnd() * W.length)];
        const n = Math.max(2, Math.ceil(defs.length / 2));
        defs.splice(0, n, ...[...Array(n)].map(() => ({ def: MONSTERS[grp.pool[Math.floor(this.rnd() * grp.pool.length)]], grade: roomGrade(index, this.rnd(), A.rooms) })));
        this.events.push({ type: 'wanderers', name: grp.name });
      }
      for (const d of defs) this.spawnRoll(d);
      if (this.chest) {
        // gardien du coffre : un monstre de la carte au grade 5, deux fois plus résistant
        const g = this.makeMonster(pick(), 5, this.chest.x + (this.chest.x < ROOM_W / 2 ? 90 : -90), this.chest.y + 60);
        g.maxHp *= 2;
        g.hp = g.maxHp;
        g.xp *= 2;
        this.guard = g;
        this.monsters.push(g);
      }
    }
    if (this.special) this.events.push({ type: 'special', special: this.special });
    if (theme !== 'crypt') this.initHazards();
    this.rollInitiative();
    this.events.push({ type: 'roomStart', index });
  }

  /**
   * Initiative (Dofus) : le camp qui a la plus haute initiative agit en premier.
   * Temps réel : le gagnant attaque tout de suite, le perdant attend un moment avant sa première action.
   */
  private rollInitiative() {
    const h = this.hero;
    const mine = initiativeOf(this.heroStats(), h.hp, h.maxHp);
    const theirs = Math.max(0, ...this.monsters.map((m) => initiativeOf(m.stats)));
    const first = mine >= theirs;
    if (first) for (const m of this.monsters) m.cd += INITIATIVE_DELAY;
    else h.castCd = Math.max(h.castCd, INITIATIVE_DELAY);
    this.events.push({ type: 'initiative', hero: first });
  }

  private spawnRoll({ def, grade }: { def: MonsterDef; grade: number }) {
    const p = this.findSpawn();
    this.monsters.push(this.makeMonster(def, grade, p.x, p.y));
  }

  /** Point libre (hors du vide et des obstacles) le plus proche de (x, y). */
  freeSpot(x: number, y: number, r: number): Vec {
    for (let k = 0; k < 400; k++) {
      const a = k * 2.4, d = k * 3;
      const px = Math.max(this.bounds.x0 + r, Math.min(this.bounds.x1 - r, x + Math.cos(a) * d));
      const py = Math.max(this.bounds.y0 + 80, Math.min(this.bounds.y1 - 300, y + Math.sin(a) * d * PERSP));
      if (this.shape.holes.every((o) => flatDist(px, py, obstacleCore(o, px), o.y) > o.r + r + 20)) return { x: Math.round(px), y: Math.round(py) };
    }
    return { x, y };
  }

  /** Apparition autour du héros (embuscade), hors du vide et des obstacles. */
  private findSpawnAround(cx: number, cy: number): Vec {
    for (let tries = 0; tries < 200; tries++) {
      const a = this.rnd() * Math.PI * 2, d = 260 + this.rnd() * 110;
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * PERSP;
      if (x < this.bounds.x0 + 20 || x > this.bounds.x1 - 20 || y < this.bounds.y0 + 30 || y > this.bounds.y1 - 20) continue;
      if (this.obstacles.some((o) => flatDist(x, y, obstacleCore(o, x), o.y) < o.r + 40)) continue;
      if (this.monsters.some((m) => m.state !== 'dead' && flatDist(x, y, m.x, m.y) < 90)) continue;
      return { x, y };
    }
    return this.findSpawn();
  }

  /**
   * Navigation : point vers lequel marcher pour aller de (x, y) à (tx, ty).
   * Si une bande de vide les sépare, on passe par son pont (entrée, puis traversée).
   */
  navPoint(x: number, y: number, tx: number, ty: number): Vec {
    let best: RoomShape['bands'][number] | null = null, bd = Infinity;
    for (const b of this.shape.bands) {
      const inBand = Math.abs(y - b.y) < b.half + 12;
      if (inBand && Math.abs(ty - b.y) < b.half + 12) continue;
      if (!inBand && Math.sign(y - b.y) === Math.sign(ty - b.y)) continue;
      if (Math.abs(y - b.y) < bd) { bd = Math.abs(y - b.y); best = b; }
    }
    if (!best) return { x: tx, y: ty };
    const side = Math.sign(ty - best.y) || 1;
    const inBand = Math.abs(y - best.y) < best.half + 12;
    if (inBand || Math.abs(x - best.gapX) < best.gapHalf * 0.5) return { x: best.gapX, y: best.y + side * (best.half + 40) };
    return { x: best.gapX, y: best.y - side * (best.half + 26) };
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
    this.stats.seen[def.id] = (this.stats.seen[def.id] ?? 0) + 1;
    return {
      uid: this.uid++, def, grade, level: g.level, maxHp: g.maxHp, xp: g.xp, stats: g.stats, x, y, hp: g.maxHp, state: 'spawn', t: 0,
      cd: def.attack.cooldown[0] * (0.5 + this.rnd()), dir: { x: 0, y: 1 }, aim: 0, facing: -1,
      knock: { x: 0, y: 0 }, hurtT: 0, hidden: false, stealthT: this.rnd() * 3, moving: false,
      hasteT: 0, crackT: def.boss?.crackEvery ?? 0, summonT: def.boss?.summonFirst ?? def.summons?.first ?? 0, summoner: null, healed: false,
      markT: 0, weakT: 0, critDownT: 0, pushT: 0, atk: def.attack, chargeT: def.charge ? def.charge.every * 0.5 : 0, stuckT: 0, detourT: 0, detourSide: this.rnd() < 0.5 ? 1 : -1,
    };
  }

  /* ------------------------------------------------------------------ */

  step(input: Vec) {
    if (this.hitstop > 0) {
      this.hitstop = Math.max(0, this.hitstop - STEP);
      return;
    }
    if (this.phase === 'fight') this.stats.time += STEP;
    this.stepHero(input);
    for (const m of this.monsters) this.stepMonster(m);
    if (this.pending.length) {
      this.monsters.push(...this.pending);
      this.pending = [];
    }
    this.separate();
    this.roomT += STEP;

    this.stepSpecial();
    this.stepHazards();
    // embuscade : les monstres surgissent tout autour du héros
    if (this.ambush && this.phase === 'fight' && this.roomT >= 1.6) {
      this.ambush = false;
      // ils surgissent les uns après les autres (0,3 s d'écart), pour laisser le temps de réagir
      this.reserve.forEach(({ def, grade }, i) => {
        const p = this.findSpawnAround(this.hero.x, this.hero.y);
        const m = this.makeMonster(def, grade, p.x, p.y);
        m.t = -0.3 * i;
        this.monsters.push(m);
      });
      this.reserve = [];
      this.events.push({ type: 'ambush' });
    }
    // deuxième vague : quand il ne reste que 2 monstres, ou au bout de 10 s
    if (this.reserve.length && !this.ambush && this.phase === 'fight') {
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

    if (this.phase === 'fight' && !this.reserve.length && this.wavesT <= 0 && this.monsters.every((m) => m.state === 'dead')) {
      this.phase = 'cleared';
      this.openChest();
      this.events.push({ type: this.lastRoom ? 'victory' : 'roomCleared' });
    }
    // la grille de la dernière salle reste fermée : la carte ou le donjon est fini
    if (this.phase === 'cleared' && !this.lastRoom) {
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
    h.moving = m > 0.05 && h.rootT <= 0;
    h.tackled = 1;
    if (h.moving) {
      if (m > 1) { ix /= m; iy /= m; }
      h.tackled = this.tackleFactor();
      const speed = h.def.speed * (1 + this.run.speed) * h.tackled;
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
        this.weaponImpact(h.swing.dir, h.swing.target);
      }
      if (h.swing.t >= h.swing.dur) h.swing = null;
    } else if (h.attackCd <= 0) {
      const target = this.nearestTarget(w.reach);
      if (target) {
        const dx = target.x - h.x, dy = (target.y - h.y) / PERSP, d = Math.hypot(dx, dy) || 1;
        const dir = { x: dx / d, y: dy / d };
        h.facing = dx >= 0 ? 1 : -1;
        const ws = w.speed * (1 + this.passive('frenesie'));
        h.swing = { t: 0, dur: Math.min(0.42, 0.8 / ws), hit: false, dir, target: target.uid };
        h.attackCd = 1 / ws;
        this.events.push({ type: 'swing', dir, ranged: w.ranged, x: target.x, y: target.y });
      }
    }

    this.stepSpells();
  }

  /**
   * Tacle (Dofus) : au contact d'un monstre, on garde (fuite + 2) / (2 × (tacle + 2)) de ses PM.
   * Temps réel : la vitesse tombe entre 40 % (tacle écrasant) et 100 % (fuite suffisante), selon le plus gros tacleur au contact.
   */
  tackleFactor(): number {
    const h = this.hero;
    let worst = 1;
    const fuite = escapeOf(this.heroStats());
    for (const m of this.monsters) {
      if (m.state === 'dead' || m.state === 'spawn' || m.hidden) continue;
      if (flatDist(m.x, m.y, h.x, h.y) > m.def.radius + h.def.radius + TACKLE_REACH) continue;
      worst = Math.min(worst, TACKLE_MIN + (1 - TACKLE_MIN) * escapeChance(fuite, tackleOf(m.stats)));
    }
    return worst;
  }

  /** Caractéristiques du Sacrieur en combat : base + cartes + Souffrance + Mutilation. */
  heroStats(): Stats {
    const s = this.hero.def.stats, h = this.hero;
    return {
      ...s,
      force: s.force + this.run.force,
      critique: s.critique + this.run.critique,
      puissance: s.puissance + h.mutStage * MUTILATION.power,
      // Souffrance : dégâts finaux des armes et des sorts
      pctArme: s.pctArme + this.souffrancePct(),
      pctSort: s.pctSort + this.souffrancePct(),
    };
  }

  /** Bonus de dégâts finaux (%) donné par la Souffrance. */
  souffrancePct(): number {
    return this.hero.souffrance * (SOUFFRANCE.pctPerCharge + this.passive('douleur'));
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
    h.souffrance = souffranceFor(h.hp, h.maxHp + h.eroded);
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
    const ranged = sp.range[1] > MELEE;
    const m = this.targets(sp.range[0], sp.range[1] + (ranged ? this.heroStats().portee * CELL : 0))[0];
    if (!m) return false;
    this.events.push({ type: 'cast', spell: sp.id, slot, x: h.x, y: h.y, tx: m.x, ty: m.y, uid: m.uid });
    const mult = SPELL_POWER * (1 + sl.dmgBonus);
    const roll = { ...k.roll, min: Math.max(1, Math.round(k.roll.min * mult)), max: Math.max(1, Math.round(k.roll.max * mult)), critBonus: Math.round(k.roll.critBonus * mult) };
    const hit = resolveHit(roll, this.heroStats(), m.stats, this.rnd, { melee: !ranged, source: 'sort' });
    if (k.debuff === 'mark') m.markT = TURN;
    if (k.debuff === 'power') m.weakT = TURN;
    if (k.debuff === 'crit') m.critDownT = TURN;
    this.damageMonster(m, hit.damage, hit.crit, roll.element);
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
    this.stats.healed += heal;
    this.events.push({ type: 'heal', x: h.x, y: h.y, amount: heal });
  }

  private damageMonster(m: Monster, damage: number, crit: boolean, element?: Element, push = false) {
    m.hp -= damage;
    this.stats.dealt += damage;
    m.hurtT = 0.18;
    this.events.push({ type: 'hit', target: 'monster', uid: m.uid, x: m.x, y: m.y, damage, crit, element, eff: element && resEffect(m.stats, element), push });
    if (m.hp <= 0) this.kill(m);
    else this.checkSelfHeal(m);
  }

  /** Reconstitution Céleste (Tigrimas) : une seule fois, toute sa vie revient quand il passe sous le seuil. */
  private checkSelfHeal(m: Monster) {
    if (!m.def.selfHeal || m.healed || m.hp >= m.maxHp * m.def.selfHeal.below) return;
    m.healed = true;
    this.events.push({ type: 'monsterHeal', uid: m.uid, x: m.x, y: m.y, amount: m.maxHp - m.hp });
    m.hp = m.maxHp;
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

  private weaponImpact(dir: Vec, targetUid: number) {
    const h = this.hero, w = h.def.weapon;
    for (const m of this.monsters) {
      if (m.state === 'dead' || m.state === 'spawn') continue;
      const dx = m.x - h.x, dy = (m.y - h.y) / PERSP, d = Math.hypot(dx, dy);
      if (w.ranged) {
        // arme à distance : seulement la cible visée, si elle est encore à portée
        if (m.uid !== targetUid || d - m.def.radius > w.reach + 30) continue;
      } else {
        if (d - m.def.radius > w.reach + 6) continue;
        const ang = Math.acos(Math.max(-1, Math.min(1, (dx * dir.x + dy * dir.y) / (d || 1))));
        if (d > 30 && ang > w.arc) continue;
      }
      // chaque ligne de l'arme est un jet (élément propre) ; vol de vie : soigne de la moitié
      const st = this.heroStats();
      const crit = this.rnd() * 100 < w.lines[0].critBase + st.critique;
      let damage = 0;
      for (const line of w.lines) {
        const dmg = resolveHit({ ...line, critBase: crit ? 1e6 : -1e6 }, st, m.stats, this.rnd, WEAPON_HIT).damage;
        damage += dmg;
        if (line.steal) this.healHero(Math.floor(dmg / 2));
      }
      // Supplice : frapper une cible marquée soigne de 20 % des dommages
      if (m.markT > 0) this.healHero(Math.floor(damage * SUPPLICE_MARK));
      m.hp -= damage;
      this.stats.dealt += damage;
      m.hurtT = 0.18;
      const kb = w.ranged ? 14 : 34;
      m.knock.x += (dx / (d || 1)) * kb;
      m.knock.y += (dy / (d || 1)) * kb;
      m.pushT = PUSH_WINDOW;
      const el = w.lines[0].element;
      this.events.push({ type: 'hit', target: 'monster', uid: m.uid, x: m.x, y: m.y, damage, crit, element: el, eff: resEffect(m.stats, el) });
      this.hitstop = Math.max(this.hitstop, crit ? 0.075 : 0.035);
      if (m.hp <= 0) {
        this.kill(m);
      } else if (this.checkSelfHeal(m), m.state === 'windup' && crit) {
        // un coup critique interrompt l'attaque en préparation
        m.state = 'recover';
        m.t = 0;
      }
    }
  }

  private kill(m: Monster) {
    this.stats.kills++;
    this.stats.slain[m.def.id] = (this.stats.slain[m.def.id] ?? 0) + 1;
    const xp = xpGain(m.xp, m.level, this.hero.def.level, this.heroStats().sagesse);
    if (xp > 0) {
      this.stats.xp += xp;
      this.events.push({ type: 'xp', amount: xp, x: m.x, y: m.y });
    }
    // butin : les invocations ne lâchent rien ; celui du boss n'est gagné qu'en cas de victoire
    if (m.summoner === null) {
      const boss = m === this.boss;
      const items = rollDrops({ dofusId: m.def.dofusId, boss, elite: m === this.elite, prospection: prospectionOf(this.heroStats()) }, this.lootRnd);
      const bag = boss ? this.stats.bossLoot : this.stats.loot;
      for (const id of items) bag[id] = (bag[id] ?? 0) + 1;
      if (items.length) this.events.push({ type: 'drop', items, x: m.x, y: m.y, boss });
    }
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
    if (b.heal) {
      m.healT = (m.healT ?? b.heal.every) - STEP;
      if (m.healT <= 0 && m.hp < m.maxHp) {
        m.healT = b.heal.every;
        const amount = Math.min(m.maxHp - m.hp, b.heal.min + Math.floor(this.rnd() * (b.heal.max - b.heal.min + 1)));
        m.hp += amount;
        this.events.push({ type: 'monsterHeal', uid: m.uid, x: m.x, y: m.y, amount, spell: 'Soin Feuillu' });
      }
    }
    if (b.crackEvery > 0) m.crackT -= STEP;
    if (b.crackEvery > 0 && m.crackT <= 0) {
      m.crackT = b.crackEvery;
      for (const o of this.monsters) {
        if (o.state !== 'dead' && flatDist(o.x, o.y, m.x, m.y) <= b.crackRadius) o.hasteT = b.crackDuration;
      }
      this.events.push({ type: 'bossCrack', uid: m.uid, x: m.x, y: m.y, radius: b.crackRadius });
    }
    this.stepSummon(m, { every: b.summonEvery, id: b.summon, max: b.maxSummons });
  }

  /** Invocation à intervalle régulier, à côté de l'invocateur. */
  private stepSummon(m: Monster, k: { every: number; id: string | string[]; max: number }) {
    m.summonT -= STEP;
    if (m.summonT > 0) return;
    m.summonT = k.every;
    const alive = this.monsters.filter((o) => o.summoner === m.uid && o.state !== 'dead').length;
    if (alive >= k.max) return;
    const side = this.rnd() < 0.5 ? -1 : 1;
    const x = Math.max(this.bounds.x0 + 30, Math.min(this.bounds.x1 - 30, m.x + side * 90));
    const [sx, sy] = this.pushOut(x, m.y + 30, 26);
    const id = Array.isArray(k.id) ? k.id[Math.floor(this.rnd() * k.id.length)] : k.id;
    const s = this.makeMonster(MONSTERS[id], 1, sx, sy);
    s.summoner = m.uid;
    this.pending.push(s);
    this.events.push({ type: 'summon', uid: s.uid, by: m.uid });
  }

  private stepMonster(m: Monster) {
    m.t += STEP;
    m.hurtT = Math.max(0, m.hurtT - STEP);
    if (m.state === 'dead') return;
    const h = this.hero;
    let a = m.atk;

    // recul ; heurter un mur ou un obstacle juste après un coup d'épée = dommages de poussée
    const kn = Math.hypot(m.knock.x, m.knock.y);
    if (kn > 0.5) {
      const rx = m.x + m.knock.x * STEP * 8, ry = m.y + m.knock.y * PERSP * STEP * 8;
      const [nx, ny] = this.pushOut(Math.max(this.bounds.x0, Math.min(this.bounds.x1, rx)), Math.max(this.bounds.y0, Math.min(this.bounds.y1, ry)), m.def.radius);
      if (m.pushT > 0 && kn > PUSH_MIN_KNOCK && Math.hypot(nx - rx, (ny - ry) / PERSP) > 0.5) {
        m.pushT = 0;
        m.knock.x = m.knock.y = 0;
        this.damageMonster(m, pushDamage(this.hero.def.level, this.heroStats(), m.stats, 1), false, undefined, true);
        if ((m.state as MonsterState) === 'dead') return;
      }
      [m.x, m.y] = [nx, ny];
    }
    m.knock.x *= 1 - STEP * 9;
    m.knock.y *= 1 - STEP * 9;
    m.pushT = Math.max(0, m.pushT - STEP);

    if (m.state === 'spawn') {
      if (m.t >= SPAWN_TIME) { m.state = 'chase'; m.t = 0; }
      return;
    }

    m.hasteT = Math.max(0, m.hasteT - STEP);
    m.markT = Math.max(0, m.markT - STEP);
    m.weakT = Math.max(0, m.weakT - STEP);
    m.critDownT = Math.max(0, m.critDownT - STEP);
    if (m.def.boss && h.alive) this.stepBoss(m);
    if (m.def.summons && h.alive) this.stepSummon(m, m.def.summons);

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
      if (m.def.charge) m.chargeT -= STEP;
      if (h.alive) {
        // monstre d'élite : charge quand le héros est à moyenne distance
        const ch = m.def.charge;
        if (ch && m.chargeT <= 0 && d > 170 && d <= ch.attack.trigger) {
          m.atk = a = ch.attack;
          m.chargeT = ch.every;
          m.cd = 0;
        }
        let want = 0;
        if (m.def.behavior === 'lancer') {
          // le piquier garde ses distances
          if (d > a.trigger * 0.85) want = 1;
          else if (d < 120) want = -0.7;
        } else if (m.def.behavior === 'caster') {
          // les plantes lancent de loin et reculent si on s'approche
          if (d > a.trigger * 0.85) want = 1;
          else if (d < 170) want = -0.6;
        } else if (d > a.trigger * 0.8) want = 1;
        if (want !== 0) {
          const sp = m.def.speed * (m.hasteT > 0 ? m.def.boss?.haste ?? 1.6 : 1) * want * STEP;
          // de l'autre côté du vide : on passe par le pont
          const nav = want > 0 ? this.navPoint(m.x, m.y, h.x, h.y) : h;
          let ndx = nav.x - m.x, ndy = (nav.y - m.y) / PERSP;
          const nd = Math.hypot(ndx, ndy) || 1;
          ndx /= nd;
          ndy /= nd;
          // bloqué contre un obstacle : on le contourne franchement par un côté
          if (m.detourT > 0) {
            m.detourT -= STEP;
            [ndx, ndy] = [ndx * 0.35 - ndy * m.detourSide, ndy * 0.35 + ndx * m.detourSide];
            const n = Math.hypot(ndx, ndy) || 1;
            ndx /= n;
            ndy /= n;
          }
          const [nx, ny] = this.slideMove(m.x, m.y, ndx * sp, ndy * sp * PERSP, m.def.radius);
          const moved = flatDist(nx, ny, m.x, m.y);
          if (want > 0 && moved < Math.abs(sp) * 0.25) m.stuckT += STEP;
          else m.stuckT = Math.max(0, m.stuckT - STEP * 2);
          if (m.stuckT > 0.35 && m.detourT <= 0) {
            m.detourT = 0.7;
            m.stuckT = 0;
            m.detourSide = m.detourSide === 1 ? -1 : 1;
          }
          m.x = Math.max(this.bounds.x0, Math.min(this.bounds.x1, nx));
          m.y = Math.max(this.bounds.y0, Math.min(this.bounds.y1, ny));
          m.moving = true;
        }
        if (m.cd <= 0 && d <= a.trigger + 10) {
          m.state = 'windup';
          m.t = 0;
          m.dir = { x: dx / d, y: dy / d };
          m.aim = Math.min(d, a.trigger);
          m.hidden = false;
          this.events.push({ type: 'telegraph', uid: m.uid });
        }
      }
    } else if (m.state === 'windup') {
      if (m.t >= a.windup) {
        this.events.push({ type: 'strike', uid: m.uid });
        if (h.alive && h.invulnT <= 0 && this.inAttack(m)) this.hurtHero(m);
        // fente vers l'avant (la charge traverse toute la ligne)
        const lunge = a.atTarget ? 0 : m.def.charge && a === m.def.charge.attack ? m.def.charge.dash : 40;
        m.knock.x += m.dir.x * lunge;
        m.knock.y += m.dir.y * lunge;
        m.state = 'recover';
        m.t = 0;
      }
    } else if (m.state === 'recover') {
      if (m.t >= a.recover) {
        m.state = 'chase';
        m.t = 0;
        m.cd = a.cooldown[0] + this.rnd() * (a.cooldown[1] - a.cooldown[0]);
        m.atk = m.def.attack;
      }
    }
  }

  /** Le héros est-il dans la zone d'attaque annoncée du monstre ? (repère à plat) */
  inAttack(m: Monster): boolean {
    const a = m.atk, h = this.hero;
    const px = h.x - m.x, py = (h.y - m.y) / PERSP;
    const r = h.def.radius * 0.6;
    if (a.shape === 'circle') {
      const off = attackOffset(m);
      const cx = m.dir.x * off, cy = m.dir.y * off;
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
    const melee = m.atk.trigger <= MONSTER_MELEE;
    const mine = this.heroStats();
    const hit = resolveHit(m.atk.roll, st, mine, this.rnd, { melee, source: 'sort' });
    const dmg = Math.round(hit.damage * (1 - this.passive('endurance')));
    const absorbed = Math.min(h.shield, dmg);
    h.shield -= absorbed;
    h.hp = Math.max(0, h.hp - (dmg - absorbed));
    this.stats.taken += dmg - absorbed;
    // érosion : une part des dommages subis réduit les PV max jusqu'à la fin de la salle
    const eroded = Math.min(erosionLoss(dmg - absorbed, mine), h.maxHp - 1);
    h.maxHp -= eroded;
    h.eroded += eroded;
    h.hp = Math.min(h.hp, h.maxHp);
    // renvoi de dommages : sur les attaques de mêlée
    if (melee && mine.renvoi > 0 && m.state !== 'dead') this.damageMonster(m, mine.renvoi, false);
    // Épines : une partie des dégâts revient à l'attaquant
    const thorns = Math.floor(dmg * this.passive('epines'));
    if (thorns > 0 && m.state !== 'dead') this.damageMonster(m, thorns, false);
    h.souffrance = souffranceFor(h.hp, h.maxHp + h.eroded);
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

  /** Vagues (minuteur, renforts continus), fontaine (soin à proximité). */
  private stepSpecial() {
    if (this.phase !== 'fight') return;
    const h = this.hero;
    if (this.wavesT > 0) {
      this.wavesT = Math.max(0, this.wavesT - STEP);
      this.waveSpawnT -= STEP;
      const alive = this.monsters.filter((m) => m.state !== 'dead').length;
      if (this.wavesT > 0 && this.waveSpawnT <= 0 && alive < WAVES.maxAlive) {
        const A = this.area;
        this.spawnRoll({ def: MONSTERS[A.pool[Math.floor(this.rnd() * A.pool.length)]], grade: roomGrade(this.roomIndex, this.rnd(), A.rooms) });
        this.waveSpawnT = WAVES.every;
      }
      if (this.wavesT <= 0) {
        // temps tenu : les derniers monstres s'enfuient (sans butin)
        for (const m of this.monsters) if (m.state !== 'dead') {
          m.state = 'dead';
          m.t = 0;
          m.hidden = false;
          this.events.push({ type: 'flee', uid: m.uid, x: m.x, y: m.y });
        }
        this.events.push({ type: 'wavesOver' });
      }
    }
    const f = this.fountain;
    if (f && h.alive && h.hp < h.maxHp && f.healed < h.maxHp * FOUNTAIN_MAX && flatDist(h.x, h.y, f.x, f.y) < FOUNTAIN_REACH) {
      f.acc += h.maxHp * FOUNTAIN_RATE * STEP;
      if (f.acc >= 1 && (this.roomT % 0.5 < STEP || f.acc >= h.maxHp * 0.03)) {
        const amount = Math.min(Math.floor(f.acc), h.maxHp - h.hp, Math.ceil(h.maxHp * FOUNTAIN_MAX - f.healed));
        f.acc -= amount;
        f.healed += amount;
        h.hp += amount;
        h.souffrance = souffranceFor(h.hp, h.maxHp + h.eroded);
        if (amount > 0) this.events.push({ type: 'heal', x: h.x, y: h.y, amount });
      }
    }
  }

  /** Coffre gardé : s'ouvre quand la salle est vidée ; butin de 3 monstres de la carte (comme une élite). */
  private openChest() {
    const c = this.chest;
    if (!c || c.open) return;
    c.open = true;
    const items: number[] = [];
    for (let i = 0; i < 3; i++) {
      const def = MONSTERS[this.area.pool[Math.floor(this.lootRnd() * this.area.pool.length)]];
      items.push(...rollDrops({ dofusId: def.dofusId, boss: false, elite: true, prospection: prospectionOf(this.heroStats()) }, this.lootRnd));
    }
    for (const id of items) this.stats.loot[id] = (this.stats.loot[id] ?? 0) + 1;
    this.events.push({ type: 'chest', items, x: c.x, y: c.y });
  }

  /** Pièges de la carte (pas dans la salle de l'élite ni dans le donjon). */
  private initHazards() {
    const t = this.area.theme;
    if (this.elite || this.boss) return;
    if (t === 'foret') {
      for (let i = 0; i < HAZARD.wisp.count; i++) {
        const p = this.freeSpot(this.bounds.x0 + 60 + this.rnd() * (this.bounds.x1 - this.bounds.x0 - 120), this.bounds.y0 + 150 + this.rnd() * 560, 40);
        this.hazards.push({ id: this.hazardUid++, kind: 'wisp', x: p.x, y: p.y, state: 'idle', t: 0, dir: 1, hit: [] });
      }
    }
  }

  private stepHazards() {
    const t = this.area.theme, h = this.hero;
    if (h.rootT > 0) h.rootT = Math.max(0, h.rootT - STEP);
    // salle vidée : les pièges annoncés s'éteignent (un troupeau déjà lancé finit sa course)
    if (this.phase !== 'fight') this.hazards = this.hazards.filter((z) => z.kind === 'herd' && z.state === 'active');
    if (!this.hazards.length && (this.phase !== 'fight' || t === 'crypt' || t === 'champs')) return;
    this.hazardT -= STEP;
    const span = (e: readonly [number, number] | readonly number[]) => e[0] + this.rnd() * (e[1] - e[0]);
    if (this.phase === 'fight' && h.alive && this.hazardT <= 0 && !this.elite && !this.boss) {
      if (t === 'paturages') {
        const dir: 1 | -1 = this.rnd() < 0.5 ? 1 : -1;
        const y = Math.max(this.bounds.y0 + 60, Math.min(this.bounds.y1 - 40, h.y + (this.rnd() - 0.5) * 60));
        this.hazards.push({ id: this.hazardUid++, kind: 'herd', x: dir > 0 ? -90 : ROOM_W + 90, y, state: 'windup', t: 0, dir, hit: [] });
        this.events.push({ type: 'hazard', id: this.hazardUid - 1, kind: 'herd', phase: 'warn' });
        this.hazardT = span(HAZARD.herd.every);
      } else if (t === 'cimetiere') {
        this.hazards.push({ id: this.hazardUid++, kind: 'hands', x: h.x, y: h.y, state: 'windup', t: 0, dir: 1, hit: [] });
        this.events.push({ type: 'hazard', id: this.hazardUid - 1, kind: 'hands', phase: 'warn' });
        this.hazardT = span(HAZARD.hands.every);
      } else this.hazardT = 5;
    }
    for (const z of this.hazards) {
      z.t += STEP;
      if (z.kind === 'herd') {
        const H = HAZARD.herd;
        if (z.state === 'windup' && z.t >= H.windup) { z.state = 'active'; z.t = 0; this.events.push({ type: 'hazard', id: z.id, kind: z.kind, phase: 'strike' }); }
        if (z.state === 'active') {
          z.x += z.dir * H.speed * STEP;
          if (h.alive && !z.hit.includes(0) && Math.abs(h.y - z.y) < H.half && Math.abs(h.x - z.x) < 50) {
            z.hit.push(0);
            if (h.invulnT <= 0) {
              this.hazardHurt(H.damage);
              h.y += Math.sign(h.y - z.y || 1) * 30;
            }
          }
          for (const m of this.monsters) {
            if (m.state === 'dead' || m.state === 'spawn' || z.hit.includes(m.uid) || Math.abs(m.y - z.y) >= H.half || Math.abs(m.x - z.x) >= 50) continue;
            z.hit.push(m.uid);
            this.damageMonster(m, Math.round(m.maxHp * 0.15), false);
          }
          if (z.x < -200 || z.x > ROOM_W + 200) z.state = 'gone';
        }
      } else if (z.kind === 'wisp') {
        const W = HAZARD.wisp;
        if (z.state === 'idle' && this.phase === 'fight' && h.alive && flatDist(h.x, h.y, z.x, z.y) < W.trigger) {
          z.state = 'windup'; z.t = 0;
          this.events.push({ type: 'hazard', id: z.id, kind: z.kind, phase: 'warn' });
        } else if (z.state === 'windup' && z.t >= W.windup) {
          z.state = 'gone'; z.t = 0;
          this.events.push({ type: 'hazard', id: z.id, kind: z.kind, phase: 'strike' });
          if (h.alive && h.invulnT <= 0 && flatDist(h.x, h.y, z.x, z.y) < W.radius) this.hazardHurt(W.damage);
        } else if (z.state === 'gone' && z.t >= W.respawn && this.phase === 'fight') {
          const p = this.freeSpot(this.bounds.x0 + 60 + this.rnd() * (this.bounds.x1 - this.bounds.x0 - 120), this.bounds.y0 + 150 + this.rnd() * 560, 40);
          Object.assign(z, { x: p.x, y: p.y, state: 'idle', t: 0 });
        }
      } else {
        const M = HAZARD.hands;
        if (z.state === 'windup' && z.t >= M.windup) {
          z.state = 'active'; z.t = 0;
          this.events.push({ type: 'hazard', id: z.id, kind: z.kind, phase: 'strike' });
          if (h.alive && h.invulnT <= 0 && flatDist(h.x, h.y, z.x, z.y) < M.radius) {
            this.hazardHurt(M.damage);
            h.rootT = M.root;
            this.events.push({ type: 'rooted' });
          }
        } else if (z.state === 'active' && z.t >= M.life) z.state = 'gone';
      }
    }
    this.hazards = this.hazards.filter((z) => z.state !== 'gone' || z.kind === 'wisp');
  }

  /** Dégâts d'un piège : part des PV max (le bouclier absorbe ; pas de résistance). */
  private hazardHurt(frac: number) {
    const h = this.hero;
    const dmg = Math.max(1, Math.round((h.maxHp + h.eroded) * frac));
    const absorbed = Math.min(h.shield, dmg);
    h.shield -= absorbed;
    h.hp = Math.max(0, h.hp - (dmg - absorbed));
    this.stats.taken += dmg - absorbed;
    h.souffrance = souffranceFor(h.hp, h.maxHp + h.eroded);
    h.hurtT = 0.25;
    h.invulnT = 0.35;
    this.events.push({ type: 'hit', target: 'hero', x: h.x, y: h.y, damage: dmg, crit: false });
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
  return { pa: PA_MAX, castCd: 0, souffrance: 0, mutStage: 0, mutT: 0, shield: 0, shieldT: 0, eroded: 0, tackled: 1, rootT: 0 };
}

/** Charges de Souffrance : 1 par tranche de 10 % de PV perdus, sur les PV max avant érosion. */
export function souffranceFor(hp: number, fullHp: number): number {
  const lost = 1 - Math.max(0, hp) / Math.max(1, fullHp);
  return Math.max(0, Math.min(SOUFFRANCE.max, Math.floor(lost * 10 + 1e-9)));
}

/** Le coup touche-t-il une faiblesse (résistance négative) ou une résistance de la cible ? */
export function resEffect(s: Stats, el: Element): 'weak' | 'resist' | undefined {
  const r = s.resPct[el];
  return r < 0 ? 'weak' : r > 0 ? 'resist' : undefined;
}

function freshRun(level: number): RunState {
  return { slots: Array(slotsForLevel(level)).fill(null), force: 0, vitalite: 0, critique: 0, speed: 0, passives: {} };
}

function freshStats() {
  return {
    kills: 0, dealt: 0, taken: 0, healed: 0, time: 0, xp: 0, loot: {} as Record<number, number>, bossLoot: {} as Record<number, number>,
    /** Bestiaire : monstres croisés et vaincus pendant la partie (par fiche). */
    seen: {} as Record<string, number>, slain: {} as Record<string, number>,
  };
}
