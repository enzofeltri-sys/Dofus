import { Application, Assets, Container, Graphics, ImageSource, Sprite, Text, Texture } from 'pixi.js';
import { CHAFER_FOOT, CHAFER_PARTS, CHAFER_PIVOTS, type ChaferKind } from './art/chafer';
import { chaferChibiSvg as chaferSvg, kardoribChibiSvg as kardoribSvg, kardorimChibiSvg as kardorimSvg } from './art/monsters-chibi';
import { MONSTERS, type MonsterArt } from './game/data/monsters';
import { bones, boneBowl, brazier, BRAZIER_FIRE, candles, CANDLE_FLAMES, column, rubble, sarcophagus, type PropArt } from './art/props';
import { SACRIEUR_FOOT, SACRIEUR_HAND, SACRIEUR_PIVOTS, sacrieurSvg } from './art/sacrieur';
import { SACRI_PARTS } from './art/sacrieur-variants/official-cartoon';
import type { PropKind } from './game/rooms';
import { attackOffset, flatDist, FOUNTAIN_MAX, FOUNTAIN_REACH, GATE, HAZARD, PERSP, SPAWN_TIME, STEP, TOTAL_ROOMS, WAVES_TIME, World, type Monster, type WorldEvent } from './game/world';
import { poseChafer, poseCritter, poseHero, type ChaferAnim, type CritterFamily, type HeroAnim } from './render/anims';
import { BEASTS, CATS, CRITTER_FOOT, DOAS, PICHONS, SCARAS, TOFUS, FLAMES, GHOSTS, JELLIES, KWAKS, CRITTER_PIVOTS, CRITTER_SVG, partsOf, PIOUS, SHEEP, SPIDERS, wispSvg, type CritterKind } from './art/champs-chibi';
import { Rig } from './render/rig';
import { blossomTree, carvedStone, goldenFlowers, stele } from './art/champsProps';
import { champsGateSvg, champsRoomSvg } from './scene/champsRoom';
import { autumnTree, barn, barrels, bigShell, cityHouse, crates, fence, haystack, marketStall, mossRock, palmTree, pebbles, pipe, quarryBlock, sandRock, sandTower, sunflowers, thatchHut, giantCarrot, wabbitBanner } from './art/astrubProps';
import { boneHands, chest, darkBlock, deadTree, fountain, ivoryHorns, lanternPillar, redBush, tomb } from './art/incarnamProps';
import { cryptRoomSvg, EXIT, FLOOR_TOP, gateBarsSvg, GATE_BARS_H, GATE_BARS_W, LIGHTS, ROOM_H, ROOM_W } from './scene/cryptRoom';
import { svgTexture } from './svg';
import { autopilotInput } from './game/autopilot';
import { applyCard, cardInfo, drawCards, needsReplace, swapSlots, type StatBonus } from './game/cards';
import { applyRun, claimTier, loadSave, storeSave, type RunResult, type SaveData } from './game/save';
import { entryCost, FREE_KEYS_PER_DAY, payEntry } from './game/keys';
import { SPELLS } from './game/data/spells';
import { startingHero } from './game/data/hero';
import { invest, levelForXp, resetCarac, type CaracId } from './game/progression';
import { elementName, resLine, sheetView } from './ui/sheet-view';
import { equip, gearStats, isWorn, toggleMark, unequip } from './game/inventory';
import { catalogDetail, equipmentDetail, invView, resourceDetail } from './ui/inv-view';
import { fmtLine, item, statLabel, type SlotId } from './game/data/items';
import { allItemIconUrls, itemIconImg, itemIconUrl, weaponIconUrl } from './ui/item-icons';
import { craft, recipeFor } from './game/craft';
import { breakView, craftView, fmView, forgeRows, fusionView } from './ui/craft-view';
import { bestiaryView } from './ui/bestiary-view';
import { beastBonuses, claimable } from './game/bestiary';
import { applyRune, FM_NAMES } from './game/fm';
import { atlasView } from './ui/atlas-view';
import { AREAS, CHAMPS, isUnlocked, ZONES, type AreaDef } from './game/data/areas';
import { breakItem, fuse, RARITIES } from './game/forge';
import { feedPet, PET_FOOD } from './game/pets';
import { Hud, type SlotView } from './ui/hud';
import { ICONS } from './ui/grimoire-icons';
import { ELEMENT_COLOR, PASSIVE_ICONS, SPELL_ICONS } from './ui/spell-icons';
import { installTheme } from './ui/theme';
import { applyTest } from './game/testmode';
import { grimoireView } from './ui/grimoire-view';

/**
 * Étape 2 — moteur de combat : le monde de jeu (src/game) tourne à pas fixe,
 * ce fichier l'affiche (personnages articulés, décor, lumières, effets) et gère l'interface.
 */

const DEMO = new URLSearchParams(location.search).has('demo');

/** ?salle=9 : commence directement à une salle (tests). */
/** Le camp s'affiche au lancement, sauf en démo ou quand on vise directement une salle. */
const SHOW_CAMP = !DEMO && !new URLSearchParams(location.search).has('salle');
const START_ROOM = Math.max(0, Math.min(TOTAL_ROOMS - 1, (Number(new URLSearchParams(location.search).get('salle')) || 1) - 1));
const CHAR_SCALE = 0.8;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Aura bleu azur des archimonstres : halo plein, bien visible même sur un sol clair. */
function auraTexture(size = 128): Texture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, 'rgba(150,225,255,0.75)');
  grd.addColorStop(0.55, 'rgba(30,144,255,0.6)');
  grd.addColorStop(0.8, 'rgba(30,144,255,0.25)');
  grd.addColorStop(1, 'rgba(30,144,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return new Texture({ source: new ImageSource({ resource: c }) });
}

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

function vignetteTexture(w: number, h: number, color = '40,20,8', alpha = 0.5): Texture {
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(w / 2));
  c.height = Math.max(2, Math.round(h / 2));
  const g = c.getContext('2d')!;
  const r = Math.hypot(c.width, c.height) / 2;
  const grd = g.createRadialGradient(c.width / 2, c.height * 0.45, r * 0.45, c.width / 2, c.height * 0.45, r);
  grd.addColorStop(0, `rgba(${color},0)`);
  grd.addColorStop(1, `rgba(${color},${alpha})`);
  g.fillStyle = grd;
  g.fillRect(0, 0, c.width, c.height);
  return new Texture({ source: new ImageSource({ resource: c }) });
}

const PROP_ART: Record<PropKind, () => PropArt> = {
  column, sarcophagus, brazier, boneBowl, rubble, bones, candles, blossom: blossomTree, stone: carvedStone, stele, flowers: goldenFlowers,
  redbush: redBush, block: darkBlock, horns: ivoryHorns, tomb, deadtree: deadTree, lantern: lanternPillar, chest: () => chest(), fountain,
  autumnTree, fence, barn, haystack, house: cityHouse, stall: marketStall, crates, sunflowers, pipe,
  palm: palmTree, shell: () => bigShell(), shellBlue: () => bigShell('#7ab8f0', '#f8a8c8'), sandrock: sandRock, tower: sandTower, pebbles, mossrock: mossRock, quarry: quarryBlock, hut: thatchHut, barrels, carrot: giantCarrot, banner: wabbitBanner,
};

interface HeroView { rig: Rig; c: Container; sword: Container; anim: HeroAnim; deadT: number }
interface MonsterView { rig: Rig; c: Container; hpBar: Graphics; anim: ChaferAnim; height: number; aura?: Sprite[] }
interface Floater { t: Text; life: number; vy: number; x: number; y: number }
interface Fx { g: Graphics; life: number; max: number; draw: (g: Graphics, k: number) => void }
interface Particle { s: Sprite; vx: number; vy: number; life: number; max: number; a0: number; grav: number }

async function main() {
  installTheme();
  await Promise.all([document.fonts.load('20px "Lilita One"'), document.fonts.load('800 20px "Nunito"'), document.fonts.load('600 20px "Nunito"')]);

  const app = new Application();
  await app.init({ resizeTo: window, background: '#2a160c', antialias: true, resolution: Math.min(window.devicePixelRatio || 1, 3), autoDensity: true });
  document.getElementById('game')!.appendChild(app.canvas);
  const hud = new Hud(document.getElementById('hud')!);

  let zoom = window.innerWidth / ROOM_W;
  const RES = Math.min(3.2, Math.max(1, (window.devicePixelRatio || 1) * zoom * 1.1));
  const CR = RES * CHAR_SCALE;

  // ---------- Textures ----------
  let save = loadSave();
  hud.setHeroLook(save.appearance);
  const [sacriTex, gateTex, champsGateTex, ...chaferFlat] = await Promise.all([
    Promise.all(SACRI_PARTS.map((p) => svgTexture(sacrieurSvg(p, save.appearance), CR))),
    svgTexture(gateBarsSvg(), RES),
    svgTexture(champsGateSvg(), RES),
    ...(['debutant', 'furtif', 'piquier', 'sergent', 'eclaireur'] as ChaferKind[]).map((k) => Promise.all(CHAFER_PARTS.map((p) => svgTexture(chaferSvg(k, p), CR)))),
    Promise.all(CHAFER_PARTS.map((p) => svgTexture(kardorimSvg(p), CR * 1.55))),
    Promise.all(CHAFER_PARTS.map((p) => svgTexture(kardoribSvg(p), CR))),
  ]);
  const CRITTERS = Object.keys(CRITTER_SVG) as CritterKind[];
  // résolution de la texture selon la plus grande taille d'affichage du monstre (élites agrandies)
  const artScale = (k: MonsterArt) => Math.max(1, ...Object.values(MONSTERS).filter((d) => d.art === k).map((d) => d.scale ?? 1));
  const chaferTex = {
    debutant: chaferFlat[0], furtif: chaferFlat[1], piquier: chaferFlat[2], sergent: chaferFlat[3], eclaireur: chaferFlat[4], kardorim: chaferFlat[5], kardorib: chaferFlat[6],
  } as Record<MonsterArt, Texture[]>;
  /** Dessins des monstres d'une carte, préparés à l'entrée (pas tous au démarrage : il y en a beaucoup). */
  const loadArea = async (A: AreaDef) => {
    const ids = new Set([...A.pool, A.elite?.id, A.boss?.id, ...(A.archis ?? []), ...(A.wanderers ?? []).flatMap((w) => [...w.pool, ...(w.archis ?? [])])].filter(Boolean) as string[]);
    for (const id of [...ids]) {
      const d = MONSTERS[id], sm = d.boss?.summon;
      for (const x of [...[d.summons?.id ?? []].flat(), ...(Array.isArray(sm) ? sm : [sm])]) if (x) ids.add(x);
    }
    const arts = [...new Set([...ids].map((id) => MONSTERS[id].art))].filter((k) => !chaferTex[k]);
    await Promise.all(arts.map(async (k) => {
      chaferTex[k] = isCritter(k)
        ? await Promise.all(partsOf(k).map((p) => svgTexture(CRITTER_SVG[k](p), CR * artScale(k))))
        : await Promise.all(CHAFER_PARTS.map((p) => svgTexture(chaferSvg(k as ChaferKind, p), CR * artScale(k))));
    }));
  };
  const isCritter = (k: MonsterArt): k is CritterKind => (CRITTERS as string[]).includes(k);
  const familyOf = (k: CritterKind): CritterFamily =>
    k === 'tofu' || k === 'tofuMalade' || PICHONS.includes(k) || TOFUS.includes(k) || KWAKS.includes(k) ? 'tofu' : SHEEP.includes(k) || PIOUS.includes(k) || BEASTS.includes(k) || SCARAS.includes(k) || k === 'rib' ? 'sheep' : CATS.includes(k) ? 'cat' : JELLIES.includes(k) || GHOSTS.includes(k) || k === 'kwoan' ? 'jelly'
      : FLAMES.includes(k) ? 'flame' : k === 'aminite' || SPIDERS.includes(k) || DOAS.includes(k) ? 'shroom' : 'plant';
  const propTex = new Map<PropKind, { tex: Texture; art: PropArt }>();
  await Promise.all(
    (Object.keys(PROP_ART) as PropKind[]).map(async (k) => {
      const art = PROP_ART[k]();
      propTex.set(k, { tex: await svgTexture(art.svg, RES), art });
    }),
  );
  const glow = glowTexture();
  const auraTex = auraTexture();
  // salles spéciales et pièges de carte
  const [herdTex, herdTex2, wispTex, handsTex, chestOpenTex] = await Promise.all([
    svgTexture(CRITTER_SVG.palichon(), CR * 0.7), svgTexture(CRITTER_SVG.orageux(), CR * 0.7), svgTexture(wispSvg(), RES),
    svgTexture(boneHands().svg, RES), svgTexture(chest(true).svg, RES),
  ]);
  const handsFoot = boneHands().foot, chestFoot = chest(true).foot;

  // ---------- Calques ----------
  const world = new Container();
  app.stage.addChild(world);
  const bg = new Sprite();
  bg.tint = 0xe6d6c4;
  world.addChild(bg);
  const wallFx = new Container(); // flammes murales, grille
  world.addChild(wallFx);
  const ground = new Graphics(); // annonces d'attaque, auras
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
  const vignette = new Sprite();
  app.stage.addChild(vignette);
  const hurtVignette = new Sprite();
  hurtVignette.alpha = 0;
  app.stage.addChild(hurtVignette);
  const fade = new Graphics();
  app.stage.addChild(fade);
  let fadeA = 1;

  // ---------- Monde ----------
  /** Le Sacrieur tel que sauvegardé : niveau, caractéristiques, équipement porté. */
  /** Arme portée (objet DofusDB), null : mains nues. */
  const weaponOf = (inv: SaveData['inventory']) => {
    const uid = inv.equipped.arme;
    return uid !== undefined ? inv.items.find((i) => i.uid === uid)?.id ?? null : null;
  };
  const heroFromSave = () => startingHero(save.profile, gearStats(save.inventory), weaponOf(save.inventory));
  /** Carte ou donjon choisi au camp (s'il est débloqué ; sinon les Champs). */
  const areaOf = () => {
    const node = ZONES.flatMap((z) => z.nodes).find((n) => n.id === save.area);
    return node?.area && isUnlocked(node, save.done) ? node.area : CHAMPS;
  };
  /** Étapes débloquées déjà vues dans l'écran Donjons (pour la pastille). */
  let seenOpen = ZONES.flatMap((z) => z.nodes).filter((n) => isUnlocked(n, save.done)).length;
  const zoneHooks = {
    view: () => atlasView(save.done, areaOf().id, save.mapWins),
    choose(id: string) {
      save = { ...save, area: id };
      storeSave(save);
    },
    current: () => {
      const a = areaOf();
      return { kind: a.kind, name: a.name, level: a.level, sub: a.sub, key: keyInfo(a) };
    },
    info: (id: string) => ({ key: AREAS[id] ? keyInfo(AREAS[id]) : undefined }),
    enter() {
      const paid = payEntry(save, areaOf());
      if (!paid) return false;
      save = paid;
      storeSave(save);
      return true;
    },
    fresh: () => Math.max(0, ZONES.flatMap((z) => z.nodes).filter((n) => isUnlocked(n, save.done)).length - seenOpen),
    seen() {
      seenOpen = ZONES.flatMap((z) => z.nodes).filter((n) => isUnlocked(n, save.done)).length;
    },
  };
  /** Clés d'une carte ou d'un donjon : texte affiché et possibilité d'entrer. */
  function keyInfo(a: AreaDef) {
    const c = entryCost(save, a);
    const keyName = (id: number | null) => (id ? item(id).name : 'clé');
    const key = c.kind === 'open' ? undefined
      : c.kind === 'first' ? { text: 'Tentatives libres tant que le donjon n’est pas vaincu', ok: true }
      : c.kind === 'free' ? { text: `Clés gratuites aujourd’hui : ${c.left}/${FREE_KEYS_PER_DAY}`, ok: true }
      : c.kind === 'item' ? { text: `Plus de clé gratuite : 1 ${keyName(c.itemId)} (${c.left} en stock)`, ok: true }
      : { text: `Plus de clé : reviens demain ou fabrique une ${keyName(c.itemId)} (Atelier)`, ok: false };
    return key;
  }
  /** Bestiaire : monstres découverts déjà vus dans l'onglet (pour la pastille). */
  const knownBeasts = () => Object.values(save.bestiary ?? {}).filter((r) => r.seen > 0).length;
  let beastsShown = knownBeasts();
  const game = new World(Math.floor(Math.random() * 1e6), heroFromSave(), areaOf());
  game.beastBonus = beastBonuses(save.bestiary);
  // icônes des objets (butin qui vole vers le Sacrieur)
  await Assets.load(allItemIconUrls()).catch(() => {});
  hud.setLevel(game.hero.def.level);
  (window as unknown as { __game: World }).__game = game;
  // tests navigateur : aller directement à une salle (avec son décor)
  (window as unknown as { __room: (i: number) => Promise<void> }).__room = async (i: number) => {
    game.startRoom(i);
    await buildRoom(i);
  };
  const playBottom = () => Math.min(ROOM_H - 70, ROOM_H - hud.bottomInset() / zoom - 30);
  game.setPlayBottom(playBottom());

  // ---------- Effets ----------
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
  const fxs: Fx[] = [];
  const addFx = (max: number, draw: Fx['draw'], x = 0, y = 0) => {
    const g = new Graphics();
    g.position.set(x, y);
    fxLayer.addChild(g);
    fxs.push({ g, life: max, max, draw });
  };
  const timers: { t: number; fn: () => void }[] = [];
  const later = (t: number, fn: () => void) => timers.push({ t, fn });
  const floaters: Floater[] = [];
  const numberAt = (x: number, y: number, txt: string, color: string, big = false) => {
    const t = new Text({
      text: txt,
      style: {
        fontFamily: 'Lilita One', fontSize: big ? 40 : 31, fill: color, letterSpacing: 1,
        stroke: { color: '#3b2414', width: 7, join: 'round' },
        dropShadow: { color: '#000000', alpha: 0.5, blur: 2, distance: 2, angle: Math.PI / 2 },
      },
    });
    t.anchor.set(0.5);
    t.resolution = RES * 1.2;
    floatLayer.addChild(t);
    floaters.push({ t, life: 1, vy: -80, x: x + rand(-12, 12), y });
  };
  /** Butin : l'icône de l'objet saute du monstre puis vole jusqu'au Sacrieur. */
  const flyers: { s: Sprite; t: number; x0: number; y0: number; boss: boolean }[] = [];
  const flyLoot = (id: number, x: number, y: number, boss: boolean) => {
    const tex = Assets.get<Texture>(itemIconUrl(id));
    if (!tex) return;
    const s = new Sprite(tex);
    s.anchor.set(0.5);
    s.width = s.height = boss ? 64 : 44;
    floatLayer.addChild(s);
    flyers.push({ s, t: 0, x0: x + rand(-20, 20), y0: y - 40, boss });
  };

  /** Petit texte flottant (« Faible Terre ! », « +230 XP »). */
  const labelAt = (x: number, y: number, txt: string, color: string) => {
    const t = new Text({
      text: txt,
      style: { fontFamily: 'Lilita One', fontSize: 22, fill: color, letterSpacing: 0.5, stroke: { color: '#3b2414', width: 5, join: 'round' } },
    });
    t.anchor.set(0.5);
    t.resolution = RES * 1.2;
    floatLayer.addChild(t);
    floaters.push({ t, life: 1.2, vy: -55, x, y });
  };
  let shake = 0;
  let bossBarShown = false;

  // ---------- Décor de la salle (reconstruit à chaque salle) ----------
  type Glow = { s: Sprite; base: number; ph: number; spd: number };
  type Flame = { g: Graphics; x: number; y: number; s: number; ph: number };
  let roomGlows: Glow[] = [];
  let roomFlames: Flame[] = [];
  let roomProps: Container[] = [];
  /** Coffre de la salle (pour l'ouvrir), vues des pièges. */
  let chestSprite: Sprite | null = null;
  const hazardViews = new Map<number, Container>();
  // Épée Vorace : épée volante à la lame rougie, entourée d'une lueur de sang
  const swordTex = await svgTexture(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 110" width="40" height="110">
    <path d="M20,4 L28,20 L26,72 L14,72 L12,20 Z" fill="#e4ecf2" stroke="#3b2414" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M20,10 L20,70" stroke="#c8303c" stroke-width="3" stroke-linecap="round"/>
    <path d="M4,72 L36,72 L36,80 L4,80 Z" fill="#b8432c" stroke="#3b2414" stroke-width="2.4"/>
    <path d="M16,80 L24,80 L23,100 L17,100 Z" fill="#8a5a2c" stroke="#3b2414" stroke-width="2.2"/>
    <circle cx="20" cy="104" r="5" fill="#e3a838" stroke="#3b2414" stroke-width="2"/>
    <path d="M15,22 L15,64" stroke="#fff" stroke-width="2" opacity="0.6" stroke-linecap="round"/></svg>`, CR);
  const swordViews = new Map<number, Container>();
  let gateBars: Sprite;
  let gateGlow: Sprite;
  let dust: { s: Sprite; x: number; y: number; vx: number; vy: number; ph: number }[] = [];

  const addGlow = (x: number, y: number, color: number, scale: number, alpha: number, sy = 1) => {
    const s = new Sprite(glow);
    s.anchor.set(0.5);
    s.position.set(x, y);
    s.tint = color;
    s.scale.set(scale, scale * sy);
    s.alpha = alpha;
    lights.addChild(s);
    const g = { s, base: alpha, ph: Math.random() * 10, spd: rand(7, 11) };
    roomGlows.push(g);
    return g;
  };
  const addFlame = (parent: Container, x: number, y: number, s: number) => {
    const g = new Graphics();
    parent.addChild(g);
    roomFlames.push({ g, x, y, s, ph: Math.random() * 10 });
  };

  async function buildRoom(index: number) {
    // 1) la partie lente d'abord (la boucle d'affichage continue de tourner pendant ce temps)
    const theme = game.roomTheme;
    await loadArea(game.area);
    // les cartes d'Incarnam partagent la même île (herbe, falaises, ciel du vide) : seule la palette et le décor changent
    const champs = theme !== 'crypt';
    const newBg = await svgTexture(theme !== 'crypt' ? champsRoomSvg(2000 + index * 23, theme, game.shape) : cryptRoomSvg(1000 + index * 17), RES);
    // 2) puis remplacement synchrone de l'ancienne salle
    // nettoyage
    for (const g of roomGlows) g.s.destroy();
    for (const f of roomFlames) f.g.destroy();
    for (const c of roomProps) c.destroy({ children: true });
    for (const d of dust) d.s.destroy();
    wallFx.removeChildren();
    roomGlows = [];
    roomFlames = [];
    roomProps = [];
    chestSprite = null;
    for (const v of hazardViews.values()) v.destroy({ children: true });
    hazardViews.clear();
    for (const v of swordViews.values()) v.destroy({ children: true });
    swordViews.clear();
    dust = [];
    for (const v of monsterViews.values()) v.c.destroy({ children: true });
    monsterViews.clear();
    for (const p of particles.splice(0)) p.s.destroy();
    for (const f of fxs.splice(0)) f.g.destroy();
    for (const f of floaters.splice(0)) f.t.destroy();
    for (const f of flyers.splice(0)) f.s.destroy();

    const old = bg.texture;
    bg.texture = newBg;
    if (old && old !== Texture.EMPTY) old.destroy(true);

    bg.tint = champs ? 0xffffff : 0xe6d6c4;
    vignette.alpha = champs ? 0.45 : 1;
    if (!champs) for (const l of LIGHTS) {
      addFlame(wallFx, l.x, l.y, 1.0);
      addGlow(l.x, l.y - 6, 0xffa040, 2.2, 0.24);
      addGlow(l.x, l.y + 80, 0xff9030, 2.6, 0.06, 0.6);
    }
    gateGlow = addGlow(EXIT.x, EXIT.y, champs ? 0xc8f8ff : 0xffc060, 3.0, 0.2).s;
    addGlow(EXIT.x, EXIT.y + 120, champs ? 0xf0f8ff : 0xffb050, 3.2, 0.08, 0.5);
    gateBars = new Sprite(champs ? champsGateTex : gateTex);
    gateBars.anchor.set(0.5, 1);
    gateBars.position.set(GATE.x, FLOOR_TOP + 2);
    const gateMask = new Graphics().rect(GATE.x - 80, FLOOR_TOP - 200, 160, 202).fill(0xffffff);
    wallFx.addChild(gateMask, gateBars);
    gateBars.mask = gateMask;

    for (const p of game.layout) {
      const { tex, art } = propTex.get(p.kind)!;
      const sc = p.scale ?? 1;
      const s = new Sprite(tex);
      s.anchor.set(art.foot[0] / tex.width, art.foot[1] / tex.height);
      s.scale.set(sc);
      const c = new Container();
      c.addChild(s);
      c.position.set(p.x, p.y);
      c.zIndex = p.y;
      actors.addChild(c);
      roomProps.push(c);
      if (p.kind === 'lantern') addGlow(p.x, p.y - 104 * sc, 0xffd870, 1.5, 0.3);
      if (p.kind === 'chest') chestSprite = s;
      if (p.kind === 'fountain') addGlow(p.x, p.y - 30, 0x9ff0ff, 2.6, 0.35, 0.6);
      if (p.kind === 'brazier') {
        addFlame(c, BRAZIER_FIRE[0], BRAZIER_FIRE[1] + 30, 1.5);
        addGlow(p.x, p.y - 46, 0xffb040, 2.4, 0.3);
        addGlow(p.x, p.y + 10, 0xffa030, 3.4, 0.08, 0.55);
      } else if (p.kind === 'candles') {
        for (const [fx, fy] of CANDLE_FLAMES) addFlame(c, fx * sc, fy * sc, 0.5);
        addGlow(p.x, p.y - 26, 0xffb050, 1.3, 0.26);
      } else if (p.kind === 'sarcophagus') {
        addGlow(p.x, p.y - 30, 0x6dff8a, 3.2, 0.1, 0.6);
      }
    }
    for (let i = 0; i < 40; i++) {
      const s = new Sprite(glow);
      s.anchor.set(0.5);
      s.scale.set(rand(0.03, 0.07));
      s.tint = 0xfff1d0;
      s.blendMode = 'add';
      lights.addChild(s);
      dust.push({ s, x: rand(60, ROOM_W - 60), y: rand(200, ROOM_H), vx: rand(-6, 6), vy: rand(-10, -3), ph: rand(0, 10) });
    }
    for (const m of game.monsters) monsterViews.set(m.uid, makeMonsterView(m));
    hud.setArea(game.detour?.zone ?? game.area.name, game.area.boss ? 'Boss' : 'Élite');
    hud.setRooms(index + 1, game.area.rooms);
    heroView.anim.dead = null;
  }

  // ---------- Personnages ----------
  const shadowOf = (r: number) => new Graphics().ellipse(0, 0, r, r * PERSP * 0.6).fill({ color: 0x2a1404, alpha: 0.38 });

  const heroRig = new Rig(
    SACRI_PARTS.map((p, i) => ({ name: p, tex: sacriTex[i], pivot: SACRIEUR_PIVOTS[p] })),
    SACRIEUR_FOOT, CHAR_SCALE, false,
  );
  // arme tenue en main : l'icône officielle de l'arme équipée (rien à mains nues)
  const sword = new Container();
  const weaponSprite = new Sprite();
  weaponSprite.anchor.set(0.24, 0.78); // poignée : en bas à gauche de l'icône (arme dessinée en diagonale)
  weaponSprite.rotation = -Math.PI / 4; // diagonale → verticale, pointe en haut
  weaponSprite.scale.set(0.82);
  sword.addChild(weaponSprite);
  const armF = heroRig.parts.get('armF')!; // conteneur du bras : l'arme suit sa rotation
  sword.position.set(SACRIEUR_HAND[0] - SACRIEUR_PIVOTS.armF[0], SACRIEUR_HAND[1] - SACRIEUR_PIVOTS.armF[1]);
  armF.addChild(sword);
  let shownWeapon: number | null | undefined;
  async function refreshWeapon(itemId: number | null) {
    if (itemId === shownWeapon) return;
    shownWeapon = itemId;
    const url = itemId !== null ? weaponIconUrl(itemId) : '';
    sword.visible = !!url;
    if (url) weaponSprite.texture = await Assets.load<Texture>(url);
  }
  /** Couleurs changées au camp : on redessine les morceaux du Sacrieur. */
  let lookKey = JSON.stringify(save.appearance);
  async function refreshHeroLook() {
    const key = JSON.stringify(save.appearance);
    if (key === lookKey) return;
    lookKey = key;
    const tex = await Promise.all(SACRI_PARTS.map((p) => svgTexture(sacrieurSvg(p, save.appearance), CR)));
    SACRI_PARTS.forEach((p, i) => heroRig.setTexture(p, tex[i]));
  }
  const heroC = new Container();
  const heroAura = new Graphics();
  // vie (et Souffrance) au-dessus du Sacrieur, à la place de la grosse barre du bas
  const heroHp = new Graphics();
  const heroHpText = new Text({
    text: '',
    style: { fontFamily: 'Lilita One', fontSize: 28, fill: '#fffaf0', stroke: { color: '#3b2414', width: 6, join: 'round' } },
  });
  heroHpText.anchor.set(0.5, 1);
  heroHpText.resolution = RES * 1.2;
  /** Bonus de dégâts de la Souffrance, à droite des gouttes. */
  const souffText = new Text({
    text: '',
    style: { fontFamily: 'Lilita One', fontSize: 17, fill: '#ff8a7a', stroke: { color: '#3b1a12', width: 5, join: 'round' } },
  });
  souffText.anchor.set(0, 0.5);
  souffText.resolution = RES * 1.2;
  heroC.addChild(shadowOf(28 * CHAR_SCALE), heroAura, heroRig.root);
  // au premier plan (jamais cachée par un monstre), suit le héros
  const heroHpBox = new Container();
  heroHpBox.addChild(heroHp, heroHpText, souffText);
  floatLayer.addChild(heroHpBox);
  actors.addChild(heroC);
  const HP_Y = -180 * CHAR_SCALE;
  function drawHeroHp(hp: number, max: number, shield: number, souffrance: number, alive: boolean, eroded = 0, souffPct = 0) {
    heroHpBox.visible = alive;
    if (!alive) return;
    heroHpBox.position.set(heroView.c.x, heroView.c.y);
    // l'écran est réduit (≈ ×0,54 sur téléphone) : tailles prévues pour rester lisibles
    const W = 112, H = 15, R = 7.5, total = max + eroded, k = Math.max(0, hp) / total;
    const low = hp / max <= 0.3;
    heroHp.clear()
      .roundRect(-W / 2, HP_Y, W, H, R).fill({ color: 0x3b1a12 });
    // érosion : la fin de la barre est perdue jusqu'à la salle suivante
    if (eroded > 0) heroHp.roundRect(-W / 2 + W * (max / total), HP_Y + 2, W * (eroded / total), H - 4, 3).fill({ color: 0x8a7a6e, alpha: 0.75 });
    heroHp
      .roundRect(-W / 2, HP_Y, Math.max(H, W * k), H, R).fill({ color: low ? (Math.sin(performance.now() / 120) > 0 ? 0xff4a3a : 0xd8303c) : 0xe8664a })
      .roundRect(-W / 2 + 4, HP_Y + 2.5, Math.max(0, W * k - 8), 3.5, 2).fill({ color: 0xffffff, alpha: 0.35 })
      .roundRect(-W / 2, HP_Y, W, H, R).stroke({ width: 3, color: 0x3b2414 });
    if (shield > 0) heroHp.roundRect(-W / 2, HP_Y - 9, W * Math.min(1, shield / max), 7, 3.5).fill({ color: 0x8ddccf }).stroke({ width: 2, color: 0x1d5c55 });
    // Souffrance : 10 petites gouttes sous la barre
    if (souffrance > 0) for (let i = 0; i < 10; i++) {
      heroHp.roundRect(-W / 2 + 2 + i * 11.2, HP_Y + H + 4, 8, 8, 3).fill({ color: i < souffrance ? 0xb8202e : 0x3b1a12, alpha: i < souffrance ? 1 : 0.4 })
        .stroke({ width: 1.5, color: 0x3b2414, alpha: i < souffrance ? 1 : 0.4 });
    }
    souffText.visible = souffrance > 0;
    souffText.text = `+${souffPct} %`;
    souffText.position.set(W / 2 + 6, HP_Y + H + 8);
    heroHpText.text = String(Math.ceil(Math.max(0, hp)));
    heroHpText.position.set(0, HP_Y - (shield > 0 ? 10 : 1));
  }

  const heroView: HeroView = { rig: heroRig, c: heroC, sword, deadT: 0, anim: { t: 0, moving: false, walkPh: 0, swing: null, hurt: 0, dead: null } };

  const monsterViews = new Map<number, MonsterView>();
  function makeMonsterView(m: Monster): MonsterView {
    const kind = m.def.art;
    const rig = isCritter(kind)
      ? new Rig(partsOf(kind).map((p, i) => ({ name: p, tex: chaferTex[kind][i], pivot: CRITTER_PIVOTS[kind][p]! })), CRITTER_FOOT, CHAR_SCALE * (m.def.scale ?? 1), true)
      : new Rig(CHAFER_PARTS.map((p, i) => ({ name: p, tex: chaferTex[kind][i], pivot: CHAFER_PIVOTS[p] })), CHAFER_FOOT, CHAR_SCALE * (m.def.scale ?? 1), true);
    const c = new Container();
    const hpBar = new Graphics();
    const height = (isCritter(kind) ? 128 : 150) * CHAR_SCALE * (m.def.scale ?? 1);
    hpBar.position.set(0, -height);
    c.addChild(shadowOf(m.def.radius * 1.2));
    // archimonstre : aura bleu azur (choix d'Enzo), étincelles et nom au-dessus de la tête
    let aura: Sprite[] | undefined;
    if (m.def.archi) {
      aura = [0, 1].map((i) => {
        const s = new Sprite(i ? glow : auraTex);
        s.anchor.set(0.5);
        // halo bleu azur (mélange normal), cœur lumineux (additif)
        if (i) {
          s.tint = 0x9fe4ff;
          s.blendMode = 'add';
        }
        s.position.set(0, -height * 0.42);
        c.addChild(s);
        return s;
      });
      for (let i = 0; i < 6; i++) {
        const s = new Sprite(glow);
        s.anchor.set(0.5);
        s.tint = 0x6fd0ff;
        s.blendMode = 'add';
        c.addChild(s);
        aura.push(s);
      }
    }
    c.addChild(rig.root, hpBar);
    if (m.def.archi) {
      const t = new Text({
        text: m.def.name,
        style: { fontFamily: 'Lilita One', fontSize: 20, fill: '#bfeeff', letterSpacing: 0.5, stroke: { color: '#0a2a4a', width: 5, join: 'round' } },
      });
      t.anchor.set(0.5, 1);
      t.resolution = RES * 1.2;
      t.position.set(0, -height - 8);
      c.addChild(t);
    }
    actors.addChild(c);
    return {
      rig, c, hpBar, height, aura,
      anim: { t: 0, moving: false, walkPh: Math.random() * 6, windup: null, strike: null, hurt: 0, spawn: 0, dead: null, hidden: false, baseAlpha: 1, seed: m.uid },
    };
  }

  // ---------- Entrées ----------
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
    hud.root.classList.add('touched'); // le joystick fantôme n'est plus utile
    app.canvas.setPointerCapture(ev.pointerId);
  });
  app.canvas.addEventListener('pointermove', (ev) => {
    if (!input.active) return;
    let dx = ev.clientX - joyOrigin.x, dy = ev.clientY - joyOrigin.y;
    const d = Math.hypot(dx, dy);
    // direction calculée AVANT de borner le bouton (sinon la vitesse chutait hors du cercle)
    const ux = d > 0 ? dx / d : 0, uy = d > 0 ? dy / d : 0;
    if (d > JOY_R) {
      // le joystick suit le doigt : on peut changer de direction sans revenir au centre
      joyOrigin = { x: ev.clientX - ux * JOY_R, y: ev.clientY - uy * JOY_R };
      hud.joy.style.left = `${joyOrigin.x}px`;
      hud.joy.style.top = `${joyOrigin.y}px`;
      dx = ux * JOY_R;
      dy = uy * JOY_R;
    }
    hud.knob.style.transform = `translate(${dx}px, ${dy}px)`;
    const m = Math.min(1, d / (JOY_R * 0.6));
    input.x = d > 6 ? ux * m : 0;
    input.y = d > 6 ? uy * m : 0;
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

  /** Pilote automatique (?demo) : sert aux captures et aux essais automatiques. */
  const autopilot = () => autopilotInput(game);

  // ---------- Événements du monde ----------
  let paused = false;
  let busy = false; // transition ou écran en cours

  function handle(ev: WorldEvent) {
    switch (ev.type) {
      case 'swing': {
        const h = game.hero, w = h.def.weapon;
        const dir = ev.dir, tx = ev.x, ty = ev.y;
        later(Math.min(0.42, 0.8 / w.speed) * w.impactAt, () => {
          if (w.ranged) {
            // arme à distance : trait lumineux du Sacrieur à la cible
            const x0 = h.x, y0 = h.y - 60;
            addFx(0.16, (g, k) => {
              g.clear().moveTo(0, 0).lineTo((tx - x0) * (1 - k * 0.3), (ty - 70 - y0) * (1 - k * 0.3))
                .stroke({ width: 7 * k + 2, color: 0xffe9a0, alpha: k });
            }, x0, y0);
            return;
          }
          const ang = Math.atan2(dir.y * PERSP, dir.x);
          const bare = w.itemId === null;
          addFx(0.2, (g, k) => {
            g.clear();
            const r = bare ? 58 : 84;
            const a0 = ang - (bare ? 0.6 : 1.25), a1 = ang + (bare ? 0.5 : 1.1), head = a0 + (a1 - a0) * Math.min(1, (1 - k) * 2.4);
            for (let j = 0; j < 4; j++) g.arc(0, 0, r - j * 5, a0 + (head - a0) * (j * 0.18), head).stroke({ width: (bare ? 7 : 9) - j * 2, color: j < 2 ? 0xffffff : 0xffe9a0, alpha: k * (1 - j * 0.2) });
            g.scale.y = PERSP + 0.15;
          }, h.x, h.y - 34);
        });
        break;
      }
      case 'hit': {
        const y = ev.target === 'hero' ? ev.y - 130 * CHAR_SCALE : ev.y - 120 * CHAR_SCALE;
        // faiblesse : chiffre corail ; résistance : chiffre grisé ; poussée : violet
        const col = ev.poison ? '#8bd04a' : ev.target === 'hero' ? '#e8664a' : ev.push ? '#cdaaf2' : ev.crit ? '#f2c45c' : ev.eff === 'weak' ? '#ff9a5a' : ev.eff === 'resist' ? '#b9b0a0' : '#fffaf0';
        numberAt(ev.x, y, `-${ev.damage}`, col, ev.crit || ev.eff === 'weak');
        const mon = ev.uid !== undefined ? game.monsters.find((x) => x.uid === ev.uid) : undefined;
        if (ev.push) labelAt(ev.x, y - 40, 'Poussée !', '#cdaaf2');
        else if (mon && ev.eff && ev.element && !resSeen.has(`${mon.def.id}:${ev.element}`)) {
          resSeen.add(`${mon.def.id}:${ev.element}`);
          labelAt(ev.x, y - 40, ev.eff === 'weak' ? `Faible ${elementName(ev.element)} !` : `Résiste ${elementName(ev.element)}`, ev.eff === 'weak' ? '#ff9a5a' : '#d8cfbd');
        }
        for (let i = 0; i < (ev.crit ? 12 : 6); i++) emit(ev.x, ev.y - 50 * CHAR_SCALE, ev.crit ? 0xffd070 : 0xffffff, { vx: rand(-140, 140), vy: rand(-170, -40), life: 0.35, size: 0.08 });
        if (ev.target === 'hero') {
          shake = Math.max(shake, 8);
          hurtVignette.alpha = 0.85;
        } else if (ev.crit) shake = Math.max(shake, 6);
        else shake = Math.max(shake, 2.5);
        break;
      }
      case 'strike': {
        const m = game.monsters.find((x) => x.uid === ev.uid);
        if (m) for (let i = 0; i < 8; i++) emit(m.x + m.dir.x * 60, m.y + m.dir.y * 60 * PERSP, 0xc8b89a, { vx: rand(-80, 80), vy: rand(-90, -20), life: 0.4, size: 0.07, add: false, grav: 260 });
        shake = Math.max(shake, 2);
        break;
      }
      case 'death':
        for (let i = 0; i < 18; i++) emit(ev.x, ev.y - 40, 0xe8dcc0, { vx: rand(-150, 150), vy: rand(-210, -40), life: 0.6, size: 0.1, add: false, grav: 320 });
        break;
      case 'drop':
        ev.items.forEach((id, i) => later(0.1 + i * 0.12, () => flyLoot(id, ev.x, ev.y, ev.boss)));
        break;
      case 'xp':
        later(0.25, () => labelAt(ev.x, ev.y - 110 * CHAR_SCALE, `+${ev.amount} XP`, '#cdaaf2'));
        break;
      case 'initiative':
        hud.toast(ev.hero ? 'Initiative !' : 'L’ennemi a l’initiative', 900);
        break;
      case 'heal':
        numberAt(ev.x + 22, ev.y - 150 * CHAR_SCALE, `+${ev.amount}`, '#8bc25a');
        break;
      case 'roomCleared':
        hud.toast('Salle terminée !');
        break;
      case 'special':
        if (ev.special === 'coffre') later(1.0, () => hud.toast('Coffre gardé : bats son gardien !', 1800));
        else if (ev.special === 'fontaine') later(1.0, () => hud.toast('Fontaine : approche-toi pour te soigner', 1800));
        else if (ev.special === 'vagues') later(1.0, () => hud.toast(`Vagues : tiens ${WAVES_TIME} secondes !`, 1800));
        break;
      case 'wanderers':
        later(0.8, () => hud.toast(ev.name, 1500));
        break;
      case 'archi':
        later(0.4, () => hud.toast(`Archimonstre : ${ev.name} !`, 1800));
        break;
      case 'monsterHeal':
        // soins des boss annoncés ; ceux des monstres (Picota, Mutation Prolifique) : juste le chiffre
        if (game.monsters.find((x) => x.uid === ev.uid)?.def.boss) hud.toast(`${ev.spell ?? 'Reconstitution Céleste'} !`, 1200);
        numberAt(ev.x + 22, ev.y - 120 * CHAR_SCALE, `+${ev.amount}`, '#8bc25a');
        for (let i = 0; i < 16; i++) emit(ev.x, ev.y - 40, 0x9ff0ff, { vx: rand(-90, 90), vy: rand(-200, -60), life: 0.7, size: 0.08 });
        break;
      case 'bless': {
        // Bénédiction du Tofulailler : anneau doré au sol, étincelles sur les alliés
        addFx(0.7, (g, k) => {
          g.clear().ellipse(ev.x, ev.y, ev.radius * (1.1 - k * 0.5), ev.radius * PERSP * (1.1 - k * 0.5)).stroke({ width: 8 * k, color: 0xffd84a, alpha: k });
        });
        for (const o of game.monsters) if (o.blessT > 0 && o.state !== 'dead') for (let i = 0; i < 5; i++) emit(o.x, o.y - 50, 0xffe27a, { vx: rand(-60, 60), vy: rand(-160, -60), life: 0.6, size: 0.07 });
        break;
      }
      case 'explode':
        // Bomberfu : explosion de feu
        shake = Math.max(shake, 7);
        addFx(0.4, (g, k) => {
          g.clear().ellipse(ev.x, ev.y, ev.radius * (1.2 - k * 0.6), ev.radius * PERSP * (1.2 - k * 0.6)).fill({ color: 0xff8a2a, alpha: 0.35 * k }).stroke({ width: 8 * k, color: 0xffd060, alpha: k });
        });
        for (let i = 0; i < 22; i++) emit(ev.x, ev.y - 30, i % 2 ? 0xff7a1a : 0xffd060, { vx: rand(-220, 220), vy: rand(-260, -40), life: 0.45, size: 0.1, grav: 300 });
        break;
      case 'poisoned':
        numberAt(ev.x, ev.y - 160 * CHAR_SCALE, 'Empoisonné', '#8bd04a');
        for (let i = 0; i < 12; i++) emit(ev.x, ev.y - 50, 0x8bd04a, { vx: rand(-80, 80), vy: rand(-140, -40), life: 0.6, size: 0.08 });
        break;
      case 'ambush':
        hud.toast('Embuscade !', 1200);
        shake = Math.max(shake, 8);
        break;
      case 'chest':
        if (chestSprite) {
          chestSprite.texture = chestOpenTex;
          chestSprite.anchor.set(chestFoot[0] / chestOpenTex.width, chestFoot[1] / chestOpenTex.height);
        }
        hud.toast('Coffre ouvert !', 1400);
        for (let i = 0; i < 24; i++) emit(ev.x, ev.y - 40, 0xffd84a, { vx: rand(-160, 160), vy: rand(-260, -80), life: 0.7, size: 0.08, grav: 300 });
        ev.items.forEach((id, i) => later(0.3 + i * 0.14, () => flyLoot(id, ev.x, ev.y - 30, false)));
        break;
      case 'flee':
        for (let i = 0; i < 10; i++) emit(ev.x, ev.y - 40, 0xd8d0c0, { vx: rand(-90, 90), vy: rand(-140, -30), life: 0.5, size: 0.1, add: false });
        break;
      case 'wavesOver':
        hud.toast('Tenu ! Ils s’enfuient', 1400);
        break;
      case 'rooted':
        hud.toast('Agrippé !', 800);
        shake = Math.max(shake, 4);
        break;
      case 'hazard': {
        const z = game.hazards.find((q) => q.id === ev.id);
        if (ev.kind === 'herd' && ev.phase === 'warn') hud.toast('Troupeau !', 900);
        if (z && ev.kind === 'wisp' && ev.phase === 'strike') {
          shake = Math.max(shake, 5);
          for (let i = 0; i < 22; i++) emit(z.x, z.y - 40, 0x7ff0b0, { vx: rand(-220, 220), vy: rand(-220, 40), life: 0.5, size: 0.1 });
        }
        if (z && ev.kind === 'hands' && ev.phase === 'strike') for (let i = 0; i < 12; i++) emit(z.x, z.y - 6, 0x6a5a3a, { vx: rand(-120, 120), vy: rand(-160, -40), life: 0.5, size: 0.08, add: false, grav: 380 });
        break;
      }
      case 'wave':
        hud.toast('Renforts !', 1200);
        shake = Math.max(shake, 6);
        break;
      case 'exit':
        void nextRoom();
        break;
      case 'heroDied':
        busy = true;
        later(1.3, () => endRun(false));
        break;
      case 'roomStart':
        if (game.boss) {
          hud.setBoss(game.boss.def.name, game.boss.hp, game.boss.maxHp, resLine(game.boss.stats.resPct));
          later(1.0, () => hud.toast(`${game.boss!.def.name} !`, 1400));
        } else if (game.elite) {
          hud.setBoss(game.elite.def.name, game.elite.hp, game.elite.maxHp, resLine(game.elite.stats.resPct));
          later(1.0, () => hud.toast('Mini-boss !', 1400));
        } else hud.setBoss(null);
        break;
      case 'bossCrack': {
        // Craquement d'Os : onde verte au sol, le boss et ses alliés accélèrent
        shake = Math.max(shake, 7);
        addFx(0.6, (g, k) => {
          g.clear().ellipse(0, 0, ev.radius * (1 - k * 0.7), ev.radius * PERSP * (1 - k * 0.7)).stroke({ width: 10 * k, color: 0xb6ff7a, alpha: k });
        }, ev.x, ev.y);
        for (let i = 0; i < 16; i++) emit(ev.x, ev.y - 40, 0xe8dcc0, { vx: rand(-220, 220), vy: rand(-200, -60), life: 0.5, size: 0.09, add: false, grav: 380 });
        break;
      }
      case 'summon': {
        const s = game.monsters.find((x) => x.uid === ev.uid);
        if (s) for (let i = 0; i < 14; i++) emit(s.x, s.y - 30, 0xb6ff7a, { vx: rand(-120, 120), vy: rand(-180, -40), life: 0.5, size: 0.09 });
        break;
      }
      case 'victory':
        busy = true;
        hud.toast('Victoire !', 1600);
        later(1.8, () => endRun(true));
        break;
      case 'cast': {
        hud.flashCast(ev.slot);
        const sp = SPELLS[ev.spell];
        const col = ELEMENT_COLOR[sp.element ?? 'neutre'];
        const hx = ev.x, hy = ev.y - 70 * CHAR_SCALE, tx = ev.tx, ty = ev.ty - 60 * CHAR_SCALE;
        if (sp.kind.type === 'steal') {
          const melee = sp.range[1] <= 130;
          // trait de l'élément vers la cible, éclats à l'impact, puis gouttes de sang qui reviennent au Sacrieur
          if (!melee) {
            addFx(0.22, (g, k) => {
              g.clear().moveTo(hx, hy).lineTo(tx, ty).stroke({ width: 10 * k, color: col, alpha: 0.35 * k })
                .moveTo(hx, hy).lineTo(tx, ty).stroke({ width: 3.5 * k, color: 0xfff6dc, alpha: k });
            });
          } else {
            addFx(0.25, (g, k) => {
              g.clear().circle(tx, ty, 26 + 30 * (1 - k)).stroke({ width: 7 * k, color: col, alpha: k });
            });
          }
          for (let i = 0; i < 10; i++) emit(tx, ty, col, { vx: rand(-160, 160), vy: rand(-180, -30), life: 0.35, size: 0.09 });
          later(0.12, () => {
            for (let i = 0; i < 7; i++) {
              const t = 0.35 + i * 0.03;
              emit(tx + rand(-10, 10), ty + rand(-10, 10), 0xd8303c, { vx: (hx - tx) / t, vy: (hy - ty) / t - 60, life: t, size: 0.075, grav: 0 });
            }
          });
        } else if (sp.kind.type === 'mutilation') {
          addFx(0.45, (g, k) => {
            g.clear().ellipse(hx, ev.y, 70 * (1.2 - k), 70 * (1.2 - k) * PERSP).stroke({ width: 8 * k, color: 0xc8303c, alpha: k });
          });
        } else if (sp.kind.type === 'zone') {
          // Condensation : tourbillon d'eau qui se resserre sur le groupe
          const r = sp.kind.radius;
          addFx(0.5, (g, k) => {
            g.clear().ellipse(ev.tx, ev.ty, r * (0.3 + 0.9 * k), r * (0.3 + 0.9 * k) * PERSP).fill({ color: col, alpha: 0.18 * k })
              .stroke({ width: 7 * k, color: col, alpha: k });
          });
          for (let i = 0; i < 16; i++) emit(ev.tx + rand(-r, r), ev.ty - 20 + rand(-r, r) * PERSP, col, { vx: (hx - ev.tx) * 0.8, vy: (ev.y - ev.ty) * 0.8 - 40, life: 0.4, size: 0.08 });
        } else if (sp.kind.type === 'push') {
          // Hostilité : onde de feu qui part du Sacrieur vers la cible
          addFx(0.3, (g, k) => {
            const x = tx + (hx - tx) * k, y = ty + (hy - ty) * k;
            g.clear().moveTo(hx, hy).lineTo(x, y).stroke({ width: 16 * k, color: col, alpha: 0.4 * k })
              .circle(x, y, 18 + 20 * (1 - k)).stroke({ width: 5 * k, color: 0xffe0a0, alpha: k });
          });
          for (let i = 0; i < 12; i++) emit(tx, ty, col, { vx: (tx - hx) * 0.9 + rand(-60, 60), vy: (ty - hy) * 0.9 + rand(-80, 0), life: 0.35, size: 0.09 });
          shake = Math.max(shake, 4);
        } else if (sp.kind.type === 'thorns') {
          // Couronne d'Épines : couronne de pointes rouges autour du Sacrieur
          addFx(0.6, (g, k) => {
            g.clear();
            const r = 62 + 14 * (1 - k);
            for (let i = 0; i < 12; i++) {
              const a = (i / 12) * Math.PI * 2 + (1 - k) * 0.8;
              const [cx, cy] = [hx + Math.cos(a) * r, ev.y - 30 + Math.sin(a) * r * PERSP];
              const [px, py] = [hx + Math.cos(a) * (r + 22), ev.y - 30 + Math.sin(a) * (r + 22) * PERSP];
              g.moveTo(cx - Math.sin(a) * 7, cy + Math.cos(a) * 7 * PERSP).lineTo(px, py).lineTo(cx + Math.sin(a) * 7, cy - Math.cos(a) * 7 * PERSP);
            }
            g.fill({ color: 0xa8222e, alpha: k }).ellipse(hx, ev.y - 30, r, r * PERSP).stroke({ width: 4 * k, color: 0x8ddccf, alpha: k });
          });
          later(0.05, () => numberAt(game.hero.x, game.hero.y - 160 * CHAR_SCALE, `Bouclier ${game.hero.shield}`, '#8ddccf'));
        } else if (sp.kind.type === 'nova') {
          // Transfusion : onde de sang qui s'élargit autour du Sacrieur
          const r = sp.kind.radius;
          addFx(0.45, (g, k) => {
            const rr = r * (1.05 - k);
            g.clear().ellipse(hx, ev.y, rr, rr * PERSP).stroke({ width: 12 * k, color: 0xc8303c, alpha: k })
              .ellipse(hx, ev.y, rr * 0.8, rr * 0.8 * PERSP).stroke({ width: 4 * k, color: 0xffd6d6, alpha: k });
          });
          for (let i = 0; i < 18; i++) {
            const a = rand(0, Math.PI * 2);
            emit(hx, ev.y - 30, 0xd8303c, { vx: Math.cos(a) * 320, vy: Math.sin(a) * 320 * PERSP - 40, life: 0.4, size: 0.08 });
          }
          shake = Math.max(shake, 3);
        }
        break;
      }
      case 'dash': {
        // Ravage : traînée de terre de l'ancienne à la nouvelle position
        const y0 = ev.fy - 50 * CHAR_SCALE, y1 = ev.y - 50 * CHAR_SCALE;
        addFx(0.3, (g, k) => {
          g.clear().moveTo(ev.fx, y0).lineTo(ev.x, y1).stroke({ width: 26 * k, color: 0x9a6a2c, alpha: 0.35 * k })
            .moveTo(ev.fx, y0).lineTo(ev.x, y1).stroke({ width: 6 * k, color: 0xf4e2c0, alpha: k });
        });
        for (let i = 0; i < 14; i++) emit(ev.x, ev.y - 10, 0x9a6a2c, { vx: rand(-160, 160), vy: rand(-200, -40), life: 0.4, size: 0.09, add: false, grav: 400 });
        shake = Math.max(shake, 5);
        break;
      }
      case 'swap': {
        // Assaut, Transposition : deux éclairs aux deux places échangées
        for (const [x, y, c] of [[ev.ax, ev.ay, 0x8b52c9], [ev.bx, ev.by, 0xe3a838]] as const) {
          addFx(0.35, (g, k) => {
            g.clear().ellipse(x, y, 60 * (1.3 - k), 60 * (1.3 - k) * PERSP).stroke({ width: 7 * k, color: c, alpha: k });
          });
          for (let i = 0; i < 10; i++) emit(x, y - 40, c, { vx: rand(-120, 120), vy: rand(-180, -40), life: 0.35, size: 0.08 });
        }
        break;
      }
      case 'swordHit': {
        const y0 = ev.y - 50, y1 = ev.ty - 50 * CHAR_SCALE;
        addFx(0.18, (g, k) => g.clear().moveTo(ev.x, y0).lineTo(ev.tx, y1).stroke({ width: 5 * k, color: 0xc8303c, alpha: k }));
        for (let i = 0; i < 6; i++) emit(ev.tx, y1, 0xd8303c, { vx: rand(-100, 100), vy: rand(-140, -20), life: 0.3, size: 0.07 });
        break;
      }
      case 'pull': {
        // Attirance : traînée violette de l'ancienne à la nouvelle position
        const y0 = ev.fy - 60 * CHAR_SCALE, y1 = ev.y - 60 * CHAR_SCALE;
        addFx(0.35, (g, k) => {
          g.clear().moveTo(ev.fx, y0).lineTo(ev.x, y1).stroke({ width: 14 * k, color: 0x8b52c9, alpha: 0.35 * k })
            .moveTo(ev.fx, y0).lineTo(ev.x, y1).stroke({ width: 4 * k, color: 0xe4d2f6, alpha: k });
        });
        for (let i = 0; i < 12; i++) emit(ev.x, y1, 0xa77ad8, { vx: rand(-120, 120), vy: rand(-140, -20), life: 0.4, size: 0.08 });
        shake = Math.max(shake, 3);
        break;
      }
      case 'mutilation':
        numberAt(game.hero.x - 24, game.hero.y - 150 * CHAR_SCALE, `-${ev.sacrifice}`, '#b8432c');
        if (ev.stage > 1) hud.toast(`Mutilation ${ev.stage}`, 900);
        break;
      case 'coagulation':
        numberAt(game.hero.x, game.hero.y - 160 * CHAR_SCALE, `Bouclier ${ev.shield}`, '#8ddccf');
        break;
      case 'telegraph':
        break;
    }
  }

  async function transition(work: () => Promise<void>) {
    busy = true;
    // fondu au noir en un temps fixe (0,25 s), quelle que soit la vitesse de l'appareil
    const start = performance.now(), from = fadeA;
    await new Promise<void>((res) => {
      const step = () => {
        fadeA = Math.min(1, from + (performance.now() - start) / 250);
        if (fadeA >= 1) res();
        else requestAnimationFrame(step);
      };
      step();
    });
    await work();
    busy = false;
  }

  const STAT_ICON: Record<StatBonus, string> = { force: ICONS.force.svg, vitalite: ICONS.vie.svg, critique: ICONS.xp.svg, speed: ICONS.pm.svg };
  const slotViews = (): SlotView[] => game.run.slots.map((sl) => (sl ? { icon: SPELL_ICONS[sl.id], name: SPELLS[sl.id].name, pa: SPELLS[sl.id].pa } : null));

  const cardsTaken: string[] = [];

  const currentSheet = () => sheetView(save.profile, heroFromSave());
  /** Équipements obtenus depuis le lancement, pas encore regardés. */
  const freshItems = new Set<number>();
  const heroLevel = () => heroFromSave().level;
  const invHooks = {
    get: () => invView(save.inventory, save.resources, heroLevel(), freshItems, save.resMarks),
    detail: (uid: number) => equipmentDetail(save.inventory, uid, heroLevel(), save.resources[PET_FOOD] ?? 0, heroFromSave().stats),
    feed(uid: number, all: boolean) {
      const have = save.resources[PET_FOOD] ?? 0;
      const r = feedPet(save.inventory, uid, all ? have : Math.min(1, have));
      if (!r.eaten) return have ? 'Ton familier est déjà à son maximum' : 'Pas de Super Croquette';
      save = { ...save, inventory: r.inventory, resources: { ...save.resources, [PET_FOOD]: have - r.eaten } };
      storeSave(save);
      const it = save.inventory.items.find((i) => i.uid === uid)!;
      return `${item(it.id).name} a mangé ${r.eaten} Super Croquette${r.eaten > 1 ? 's' : ''} · croissance ${it.food} %`;
    },
    resource: (id: number) => resourceDetail(id, save.resources[id] ?? 0, { fav: save.resMarks.fav.includes(id), lock: save.resMarks.lock.includes(id) }),
    catalog: (id: number) => catalogDetail(save.inventory, id, heroFromSave().stats),
    mark(kind: 'uid' | 'res', id: number, mark: 'fav' | 'lock') {
      if (kind === 'uid') save = { ...save, inventory: toggleMark(save.inventory, id, mark) };
      else {
        const list = save.resMarks[mark];
        save = { ...save, resMarks: { ...save.resMarks, [mark]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] } };
      }
      storeSave(save);
    },
    toggle(uid: number) {
      const inv = save.inventory;
      if (isWorn(inv, uid)) {
        const slot = (Object.keys(inv.equipped) as SlotId[]).find((k) => inv.equipped[k] === uid)!;
        save = { ...save, inventory: unequip(inv, slot) };
      } else save = { ...save, inventory: equip(inv, uid, heroLevel()) };
      storeSave(save);
    },
    seen: (uid: number) => void freshItems.delete(uid),
  };
  const workshop = () => ({ resources: save.resources, inventory: save.inventory, jobXp: save.jobXp, locked: save.resMarks.lock });
  const setWorkshop = (w: { resources: Record<string, number>; inventory: SaveData['inventory']; jobXp: number }) => {
    save = { ...save, resources: w.resources, inventory: w.inventory, jobXp: w.jobXp };
    storeSave(save);
  };
  /** Camp : records, niveau, fiche de caractéristiques (les points se répartissent ici). */
  const openCamp = () => hud.camp(save, currentSheet, {
    invest(id, n) {
      save = { ...save, profile: invest(save.profile, id as CaracId, n) };
      storeSave(save);
    },
    reset() {
      save = { ...save, profile: resetCarac(save.profile) };
      storeSave(save);
    },
    test(p) {
      // mode test : on modifie la sauvegarde puis on recharge (tout l'écran repart de la nouvelle sauvegarde)
      storeSave(applyTest(save, p));
      location.reload();
    },
  }, invHooks, {
    get: () => save.appearance,
    set(c) {
      save = { ...save, appearance: c };
      storeSave(save);
    },
  }, {
    get: () => craftView({ resources: save.resources, inventory: save.inventory, jobXp: save.jobXp, locked: save.resMarks.lock }),
    craft(id, n) {
      const r = recipeFor(id);
      if (!r) return '';
      const res = craft({ resources: save.resources, inventory: save.inventory, jobXp: save.jobXp, locked: save.resMarks.lock }, r, n, Math.random);
      save = { ...save, resources: res.workshop.resources, inventory: res.workshop.inventory, jobXp: res.workshop.jobXp };
      for (const uid of res.made) freshItems.add(uid);
      storeSave(save);
      const name = item(id).name;
      const up = res.levelAfter > res.levelBefore ? ` · Artisan niveau ${res.levelAfter} !` : '';
      const crit = res.crits ? ` · craft critique ! ${res.crits > 1 ? `${res.crits} Rares` : 'Rare'}` : '';
      return `${res.count > 1 ? `${res.count} × ` : ''}${name}${crit} · +${res.xp} XP${up}`;
    },
    forge: () => forgeRows(workshop()),
    fusion: (uid: number) => fusionView(workshop(), uid),
    fuse(uid: number, partners: number[]) {
      const res = fuse(workshop(), uid, partners, Math.random);
      if (!res.item) return 'Fusion impossible';
      setWorkshop(res.workshop);
      const up = res.levelAfter > res.levelBefore ? ` · Artisan niveau ${res.levelAfter} !` : '';
      const bonus = res.item.bonus ? ` · ${fmtLine(...res.item.bonus)}` : '';
      return `${item(res.item.id).name} devient ${RARITIES[res.item.rarity ?? 0]} !${bonus} · +${res.xp} XP${up}`;
    },
    fm: (uid: number) => fmView(workshop(), uid),
    fmApply(uid: number, runeId: number) {
      const res = applyRune(workshop(), uid, runeId, Math.random);
      if (!res.outcome || !res.path) return { text: 'Impossible', outcome: null };
      setWorkshop(res.workshop);
      const lost = res.lost.map(([p, n]) => fmtLine(p, -n)).join(', ');
      const parts = [
        res.outcome === 'ec' ? `${statLabel(res.path)} ne monte pas` : fmtLine(res.path, res.gain),
        lost ? `perdu : ${lost}` : '',
        res.fromPuits ? `puits −${res.fromPuits}` : '',
        res.toPuits ? `puits +${res.toPuits}` : '',
      ].filter(Boolean);
      const up = res.levelAfter > res.levelBefore ? ` · Artisan niveau ${res.levelAfter} !` : '';
      return { text: `${FM_NAMES[res.outcome]} : ${parts.join(' · ')}${up}`, outcome: res.outcome };
    },
    breakInfo: (uid: number) => breakView(workshop(), uid),
    breakIt(uid: number) {
      const res = breakItem(workshop(), uid, Math.random);
      const n = Object.values(res.runes).reduce((a, b) => a + b, 0);
      setWorkshop(res.workshop);
      const up = res.levelAfter > res.levelBefore ? ` · Artisan niveau ${res.levelAfter} !` : '';
      return `${n} rune${n > 1 ? 's' : ''} : ${Object.entries(res.runes).map(([id, k]) => `${k} ${item(Number(id)).name}`).join(', ') || 'aucune'} · +${res.xp} XP${up}`;
    },
  }, zoneHooks, {
    get: () => bestiaryView(save.bestiary),
    fresh: () => Math.max(0, knownBeasts() - beastsShown) + claimable(save.bestiary),
    claim(id: string) {
      const next = claimTier(save, id);
      if (!next) return false;
      save = next;
      storeSave(save);
      return true;
    },
    seen() {
      beastsShown = knownBeasts();
    },
  }, {
    get: () => grimoireView(levelForXp(save.profile.xp), save.favSpells ?? []),
    fav(id) {
      const f = save.favSpells ?? [];
      save = { ...save, favSpells: f.includes(id) ? f.filter((x) => x !== id) : [...f, id] };
      storeSave(save);
    },
  }).then(refreshHeroLook);
  /** Première faiblesse / résistance vue sur un type de monstre : on l'écrit une fois. */
  const resSeen = new Set<string>();

  /** Fin de partie : bilan, sauvegarde, retour au camp, nouvelle partie. */
  async function endRun(won: boolean, quit = false) {
    const st = game.stats;
    const result: RunResult = {
      won, room: game.roomIndex + 1, time: st.time, kills: st.kills, dealt: st.dealt, taken: st.taken, healed: st.healed,
      cards: [...cardsTaken], loot: { xp: st.xp, items: { ...st.loot } }, bossLoot: { xp: 0, items: { ...st.bossLoot } }, area: game.area.id,
      seen: { ...st.seen }, slain: { ...st.slain },
    };
    const levelBefore = levelForXp(save.profile.xp);
    const openBefore = ZONES.flatMap((z) => z.nodes).filter((n) => isUnlocked(n, save.done)).map((n) => n.name);
    const applied = applyRun(save, result);
    save = applied.save;
    for (const uid of applied.fresh) freshItems.add(uid);
    // meilleure rareté obtenue par objet (tirée à l'arrivée dans l'inventaire)
    const best = new Map<number, number>();
    for (const it of save.inventory.items) if (applied.fresh.includes(it.uid)) best.set(it.id, Math.max(best.get(it.id) ?? 0, it.rarity ?? 0));
    const rares = save.inventory.items.filter((it) => applied.fresh.includes(it.uid) && (it.rarity ?? 0) > 0);
    const unlocked = ZONES.flatMap((z) => z.nodes).filter((n) => isUnlocked(n, save.done) && !openBefore.includes(n.name)).map((n) => n.name);
    const lootList = [
      ...Object.entries(st.loot).map(([k, n]) => ({ id: Number(k), count: n, boss: false })),
      ...Object.entries(st.bossLoot).map(([k, n]) => ({ id: Number(k), count: n, boss: true })),
    ]
      // équipement d'abord, puis par niveau
      .sort((a, b) => Number(b.boss) - Number(a.boss) || Number(item(b.id).slot !== null) - Number(item(a.id).slot !== null) || item(b.id).level - item(a.id).level)
      .map((l) => ({ icon: itemIconImg(l.id), name: item(l.id).name, count: l.count, boss: l.boss, lost: l.boss && !won, rarity: l.boss && !won ? 0 : best.get(l.id) ?? 0 }));
    storeSave(save);
    hud.setBoss(null);
    const t = Math.round(st.time);
    await hud.summary(won, [
      ['Salle atteinte', `${result.room} / ${game.area.rooms}`],
      ['Durée', `${Math.floor(t / 60)} min ${String(t % 60).padStart(2, '0')}`],
      ['Monstres vaincus', String(st.kills)],
      ['Dégâts infligés', String(st.dealt)],
      ['Dégâts subis', String(st.taken)],
      ['PV récupérés', String(st.healed)],
    ], result.cards, [unlocked.length ? `Débloqué : ${unlocked.join(', ')} (onglet Donjons).` : '', rares.length ? `Objets rares : ${rares.map((it) => `${item(it.id).name} (${RARITIES[it.rarity ?? 0]})`).join(', ')}.` : '', won ? '' : 'L’XP et le butin des monstres sont gardés, même en cas de défaite.'].filter(Boolean).join(' '),
    { gained: st.xp, before: levelBefore, view: currentSheet() }, lootList, quit);
    if (SHOW_CAMP) await openCamp();
    await transition(() => {
      game.restart(heroFromSave(), areaOf());
      game.beastBonus = beastBonuses(save.bestiary);
      hud.setLevel(game.hero.def.level);
      cardsTaken.length = 0;
      return buildRoom(0);
    });
    busy = false;
  }

  /** Entre deux salles : 1 carte parmi 3 (sort, amélioration, bonus), et l'ordre des sorts. */
  async function offerCards() {
    const cards = drawCards(game, Math.random, save.favSpells ?? []);
    let i = 0;
    if (DEMO) await new Promise((r) => setTimeout(r, 300));
    else {
      const views = cards.map((c) => {
        const info = cardInfo(game, c);
        return { ...info, kind: c.kind, icon: info.spell ? SPELL_ICONS[info.spell] : info.passive ? PASSIVE_ICONS[info.passive] : STAT_ICON[info.stat!] };
      });
      i = await hud.pickCard(views, slotViews(), (a, b) => {
        swapSlots(game, a, b);
        return slotViews();
      });
    }
    const card = cards[i];
    cardsTaken.push(cardInfo(game, card).title);
    let replace: number | undefined;
    if (needsReplace(game, card) && card.kind === 'spell') {
      replace = DEMO ? game.run.slots.length - 1 : await hud.chooseReplace(`Apprendre ${SPELLS[card.spell].name}`, slotViews());
    }
    applyCard(game, card, replace);
    hud.setSlots(slotViews());
  }

  async function nextRoom() {
    const next = game.roomIndex + 1;
    if (next >= game.area.rooms) return;
    busy = true;
    await offerCards();
    // le mini-boss rapporte une carte de plus
    if (game.roomIndex === game.area.elite?.room) await offerCards();
    await transition(() => {
      game.startRoom(next);
      return buildRoom(next);
    });
  }

  hud.pauseButton.addEventListener('click', async () => {
    if (paused || busy) return;
    paused = true;
    const st = game.stats;
    const loot = [...Object.entries(st.loot).map(([k, n]) => ({ id: Number(k), count: n, boss: false })), ...Object.entries(st.bossLoot).map(([k, n]) => ({ id: Number(k), count: n, boss: true }))]
      .sort((a, b) => Number(item(b.id).slot !== null) - Number(item(a.id).slot !== null) || item(b.id).level - item(a.id).level)
      .map((l) => ({ icon: itemIconImg(l.id), name: item(l.id).name, count: l.count, boss: l.boss }));
    const choice = await hud.pauseMenu(slotViews(), (a, b) => {
      swapSlots(game, a, b);
      hud.setSlots(slotViews());
      return slotViews();
    }, loot, st.xp);
    if (choice === 'quit') {
      busy = true;
      paused = false;
      await endRun(false, true);
      return;
    }
    paused = false;
  });

  // ---------- Caméra ----------
  let camY = 0;
  const camTarget = () => {
    const top = hud.topInset(), bottom = window.innerHeight - hud.bottomInset();
    const focus = top + (bottom - top) * 0.6;
    const y = focus - (game.hero.y - 50) * zoom;
    return Math.min(0, Math.max(window.innerHeight - ROOM_H * zoom, y));
  };

  // ---------- Premier affichage ----------
  game.startRoom(START_ROOM);
  await buildRoom(START_ROOM);
  camY = camTarget();
  document.getElementById('loading')?.classList.add('done');
  if (SHOW_CAMP) {
    void openCamp().then(async () => {
      // points répartis au camp : on reconstruit le Sacrieur avant d'entrer
      const before = game.area;
      game.restart(heroFromSave(), areaOf());
      game.beastBonus = beastBonuses(save.bestiary);
      hud.setLevel(game.hero.def.level);
      hud.setSlots(slotViews());
      // autre carte choisie au camp : décor, titre et monstres de la nouvelle carte
      if (game.area !== before) await buildRoom(0);
    });
  }

  let acc = 0;
  let time = 0;
  app.ticker.add((tk) => {
    const dt = Math.min(0.05, tk.deltaMS / 1000);
    time += dt;

    // Simulation à pas fixe
    if (!paused && !hud.overlayOpen) {
      let ix = input.x, iy = input.y;
      if (keys.has('arrowleft') || keys.has('q') || keys.has('a')) ix -= 1;
      if (keys.has('arrowright') || keys.has('d')) ix += 1;
      if (keys.has('arrowup') || keys.has('z') || keys.has('w')) iy -= 1;
      if (keys.has('arrowdown') || keys.has('s')) iy += 1;
      if (DEMO && !input.active && keys.size === 0) ({ x: ix, y: iy } = autopilot());
      acc += dt;
      while (acc >= STEP) {
        game.step({ x: ix, y: iy });
        acc -= STEP;
      }
      for (const ev of game.drain()) handle(ev);
      for (let i = timers.length - 1; i >= 0; i--) {
        timers[i].t -= dt;
        if (timers[i].t <= 0) {
          const t = timers.splice(i, 1)[0];
          t.fn();
        }
      }
    }
    const frozen = game.hitstop > 0;

    // Héros
    const h = game.hero;
    heroView.c.position.set(h.x, h.y);
    heroView.c.zIndex = h.y;
    heroView.rig.face(h.facing);
    const ha = heroView.anim;
    ha.t = time;
    ha.moving = h.moving;
    if (h.moving && !frozen) ha.walkPh += dt * 11;
    ha.swing = h.swing ? h.swing.t / h.swing.dur : null;
    ha.hurt = h.hurtT / 0.25;
    if (!h.alive) ha.dead = Math.min(1, (ha.dead ?? 0) + dt / 0.6);
    poseHero(heroView.rig, ha, heroView.sword);

    // Monstres + annonces au sol
    ground.clear();
    for (const m of game.monsters) {
      let v = monsterViews.get(m.uid);
      if (!v && !chaferTex[m.def.art]) continue; // dessins de la carte encore en préparation
      if (!v) monsterViews.set(m.uid, (v = makeMonsterView(m))); // renforts arrivés en cours de salle
      v.c.position.set(m.x, m.y);
      v.c.zIndex = m.state === 'dead' ? m.y - 60 : m.y; // les tas d'os passent derrière
      v.rig.face(m.facing);
      const a = v.anim;
      a.t = time;
      a.moving = m.moving;
      if (m.moving && !frozen) a.walkPh += dt * 9;
      a.windup = m.state === 'windup' ? m.t / m.atk.windup : null;
      a.strike = m.state === 'recover' && m.t < 0.35 ? m.t / 0.35 : null;
      a.hurt = m.hurtT / 0.18;
      a.spawn = m.state === 'spawn' ? m.t / SPAWN_TIME : 1;
      a.dead = m.state === 'dead' ? m.t : null;
      a.hidden = m.hidden;
      if (isCritter(m.def.art)) poseCritter(v.rig, a, familyOf(m.def.art));
      else poseChafer(v.rig, a, CHAR_SCALE * (m.def.scale ?? 1));
      v.hpBar.visible = m !== game.boss && m !== game.elite && m.state !== 'dead' && !m.hidden && m.hp < m.maxHp;
      if (v.hpBar.visible) {
        const w = 46;
        v.hpBar.clear().roundRect(-w / 2 - 2, -2, w + 4, 9, 4).fill({ color: 0x1a0e0a, alpha: 0.85 })
          .roundRect(-w / 2, 0, (w * Math.max(0, m.hp)) / m.maxHp, 5, 2.5).fill({ color: m.def.behavior === 'brute' ? 0xff8a2a : 0xe8343c });
      }
      if (m.state === 'windup') drawTelegraph(m, Math.min(1, m.t / m.atk.windup));
      if (v.aura) {
        const on = m.state !== 'dead', p = 0.5 + 0.5 * Math.sin(time * 3 + m.uid);
        const [halo, core, ...sparks] = v.aura;
        halo.scale.set((1.15 + p * 0.15) * (m.def.scale ?? 1), (1.35 + p * 0.15) * (m.def.scale ?? 1));
        halo.alpha = on ? 0.7 + p * 0.3 : 0;
        core.scale.set(0.9 * (m.def.scale ?? 1));
        core.alpha = on ? 0.35 + p * 0.2 : 0;
        sparks.forEach((s, i) => {
          const k = (time * 0.6 + i / sparks.length) % 1, a = i * 2.1 + m.uid;
          s.position.set(Math.cos(a) * 30 * (m.def.scale ?? 1), -10 - k * v.height * 1.1);
          s.scale.set(0.05 + 0.03 * Math.sin(k * Math.PI));
          s.alpha = on ? Math.sin(k * Math.PI) : 0;
        });
      }
    }

    // Grille de sortie
    const gate = game.gate;
    gateBars.y = FLOOR_TOP + 2 - gate * (GATE_BARS_H - 8);
    gateGlow.scale.set(3 + gate * 1.6);
    if (game.phase === 'cleared' && gate >= 1) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 4);
      ground.ellipse(GATE.x, game.bounds.y0 + 14, 64 + pulse * 6, 22 + pulse * 2).fill({ color: 0xffd27a, alpha: 0.18 + pulse * 0.12 });
    }
    void GATE_BARS_W;

    // Épées Vorace (alliées)
    const swordSeen = new Set<number>();
    for (const sw of game.swords) {
      swordSeen.add(sw.id);
      let v = swordViews.get(sw.id);
      if (!v) {
        v = new Container();
        const halo = new Sprite(glow);
        halo.anchor.set(0.5);
        halo.tint = 0xd8303c;
        halo.blendMode = 'add';
        halo.scale.set(0.9);
        halo.alpha = 0.55;
        halo.position.set(0, -60);
        const sp = new Sprite(swordTex);
        sp.anchor.set(0.5, 0.95);
        sp.scale.set(1 / CR * 1.2);
        sp.rotation = 0.5;
        v.addChild(shadowOf(14), halo, sp);
        actors.addChild(v);
        swordViews.set(sw.id, v);
      }
      v.position.set(sw.x, sw.y);
      v.zIndex = sw.y;
      const sp = v.children[2] as Sprite;
      sp.y = -24 - Math.sin(time * 5 + sw.id) * 6;
      sp.rotation = 0.5 + Math.sin(time * 3 + sw.id) * 0.15;
      v.alpha = Math.min(1, sw.life / 0.5);
    }
    for (const [id, v] of swordViews) if (!swordSeen.has(id)) { v.destroy({ children: true }); swordViews.delete(id); }

    // Pièges de carte
    const seen = new Set<number>();
    for (const z of game.hazards) {
      seen.add(z.id);
      let v = hazardViews.get(z.id);
      if (!v) {
        v = new Container();
        if (z.kind === 'herd') {
          // un petit troupeau de Bouftons, en file serrée
          for (let i = 0; i < 6; i++) {
            const sp = new Sprite(i % 2 ? herdTex2 : herdTex);
            sp.anchor.set(0.5, 0.95);
            sp.scale.set(z.dir * -0.55, 0.55);
            sp.position.set(-z.dir * (i * 46 + (i % 3) * 10), ((i * 37) % 70) - 35);
            v.addChild(sp);
          }
        } else if (z.kind === 'wisp') {
          const sp = new Sprite(wispTex);
          sp.anchor.set(0.5, 0.63);
          v.addChild(sp);
        } else {
          const sp = new Sprite(handsTex);
          sp.anchor.set(handsFoot[0] / handsTex.width, handsFoot[1] / handsTex.height);
          v.addChild(sp);
        }
        actors.addChild(v);
        hazardViews.set(z.id, v);
      }
      if (z.kind === 'herd') {
        const H = HAZARD.herd;
        if (z.state === 'windup') {
          const k = Math.min(1, z.t / H.windup);
          ground.rect(game.bounds.x0 - 20, z.y - H.half, game.bounds.x1 - game.bounds.x0 + 40, H.half * 2).fill({ color: 0xff5030, alpha: 0.22 + 0.2 * k }).stroke({ width: 4, color: 0xff5030, alpha: 0.85 });
          for (let i = 0; i < 5; i++) {
            const ax = game.bounds.x0 + ((i + 0.5) / 5) * (game.bounds.x1 - game.bounds.x0) + z.dir * ((time * 120) % 60);
            ground.poly([ax - z.dir * 18, z.y - 20, ax + z.dir * 14, z.y, ax - z.dir * 18, z.y + 20]).fill({ color: 0xfff0d0, alpha: 0.4 + 0.5 * k });
          }
        }
        v.visible = z.state === 'active';
        v.position.set(z.x, z.y + 20);
        v.zIndex = z.y + 20;
        if (z.state === 'active') v.children.forEach((c, i) => (c.y = ((i * 37) % 70) - 35 - Math.abs(Math.sin(time * 18 + i)) * 8));
        if (z.state === 'active' && Math.random() < 0.6) emit(z.x - z.dir * 30, z.y + 10, 0xd8c890, { vx: -z.dir * rand(60, 160), vy: rand(-60, -10), life: 0.5, size: 0.08, add: false });
      } else if (z.kind === 'wisp') {
        const W = HAZARD.wisp;
        v.visible = z.state !== 'gone';
        v.position.set(z.x, z.y - 46 + Math.sin(time * 3 + z.id) * 6);
        v.zIndex = z.y;
        const k = z.state === 'windup' ? Math.min(1, z.t / W.windup) : 0;
        v.scale.set(1 + k * 0.5 + (k > 0 ? Math.sin(time * 40) * 0.08 : 0));
        if (z.state === 'windup') {
          ground.ellipse(z.x, z.y, W.radius, W.radius * PERSP).fill({ color: 0x3fe0a0, alpha: 0.12 }).stroke({ width: 2.5, color: 0x3fe0a0, alpha: 0.7 });
          ground.ellipse(z.x, z.y, W.radius * k, W.radius * k * PERSP).fill({ color: 0x3fe0a0, alpha: 0.28 });
        } else if (z.state === 'idle') ground.ellipse(z.x, z.y, 18, 18 * PERSP).fill({ color: 0x2a6a4a, alpha: 0.25 });
      } else {
        const M = HAZARD.hands;
        v.position.set(z.x, z.y);
        v.zIndex = z.y + 8; // devant le héros qu'elles agrippent
        v.visible = z.state === 'active';
        if (z.state === 'windup') {
          const k = Math.min(1, z.t / M.windup);
          ground.ellipse(z.x, z.y, M.radius, M.radius * PERSP).fill({ color: 0x3a1a5a, alpha: 0.3 }).stroke({ width: 4, color: 0xb88aff, alpha: 0.9 });
          ground.ellipse(z.x, z.y, M.radius * k, M.radius * k * PERSP).fill({ color: 0x3a1a5a, alpha: 0.5 });
        } else if (z.state === 'active') {
          const k = Math.min(1, z.t / 0.15);
          v.scale.set(1.15, 1.15 * k);
          ground.ellipse(z.x, z.y, M.radius * 0.9, M.radius * 0.9 * PERSP).fill({ color: 0x1a1210, alpha: 0.45 });
        }
      }
    }
    for (const [id, v] of hazardViews) if (!seen.has(id)) {
      v.destroy({ children: true });
      hazardViews.delete(id);
    }
    // fontaine : léger halo au sol quand on s'y soigne
    const fo = game.fountain;
    if (fo) {
      const near = flatDist(h.x, h.y, fo.x, fo.y) < FOUNTAIN_REACH && fo.healed < h.maxHp * FOUNTAIN_MAX;
      ground.ellipse(fo.x, fo.y, FOUNTAIN_REACH, FOUNTAIN_REACH * PERSP).fill({ color: 0x9ff0ff, alpha: near ? 0.16 : 0.07 });
      if (near && h.hp < h.maxHp && Math.random() < 0.3) emit(h.x + rand(-20, 20), h.y - rand(10, 60), 0x9ff0ff, { vx: rand(-20, 20), vy: rand(-90, -40), life: 0.6, size: 0.06 });
    }

    // Flammes, halos, poussière
    for (const fl of roomFlames) {
      fl.ph += dt * 12;
      const s = fl.s * (1 + Math.sin(fl.ph) * 0.08 + Math.sin(fl.ph * 2.3) * 0.05);
      const { g, x, y } = fl;
      g.clear();
      g.moveTo(x, y - 30 * s).bezierCurveTo(x + 12 * s, y - 14 * s, x + 11 * s, y, x, y).bezierCurveTo(x - 11 * s, y, x - 12 * s, y - 14 * s, x, y - 30 * s).fill({ color: 0xff7a1a });
      g.moveTo(x, y - 20 * s).bezierCurveTo(x + 7 * s, y - 9 * s, x + 6 * s, y, x, y).bezierCurveTo(x - 6 * s, y, x - 7 * s, y - 9 * s, x, y - 20 * s).fill({ color: 0xffe07a });
    }
    for (const gl of roomGlows) gl.s.alpha = gl.base * (0.86 + 0.14 * Math.sin(time * gl.spd + gl.ph) * Math.sin(time * gl.spd * 0.37 + gl.ph));
    for (const d of dust) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.y < 150) d.y += ROOM_H - 200;
      d.s.position.set(d.x + Math.sin(time + d.ph) * 8, d.y);
      d.s.alpha = 0.25 + 0.25 * Math.sin(time * 1.5 + d.ph);
    }

    // Particules, effets, chiffres
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
    for (let i = flyers.length - 1; i >= 0; i--) {
      const f = flyers[i];
      f.t += dt;
      const hold = f.boss ? 1.4 : 0.45, fly = 0.45;
      if (f.t < hold) {
        // saut au-dessus du monstre
        const k = Math.min(1, f.t / 0.35);
        f.s.position.set(f.x0, f.y0 - Math.sin(k * Math.PI * 0.5) * 70);
      } else {
        const k = Math.min(1, (f.t - hold) / fly), e = k * k;
        const hx = game.hero.x, hy = game.hero.y - 80;
        f.s.position.set(f.x0 + (hx - f.x0) * e, f.y0 - 70 + (hy - f.y0 + 70) * e);
        f.s.alpha = 1 - k * 0.6;
        if (k >= 1) { f.s.destroy(); flyers.splice(i, 1); }
      }
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

    // Caméra, tremblement, fondu
    camY += (camTarget() - camY) * Math.min(1, dt * 6);
    shake = Math.max(0, shake - dt * 30);
    world.scale.set(zoom);
    world.position.set(rand(-shake, shake), camY + rand(-shake, shake));
    hurtVignette.alpha = Math.max(0, hurtVignette.alpha - dt * 2.5);
    if (!busy) fadeA = Math.max(0, fadeA - dt * 3);
    fade.clear().rect(0, 0, window.innerWidth, window.innerHeight).fill({ color: 0x0e0604, alpha: fadeA });

    drawHeroHp(h.hp, h.maxHp, h.shield, h.souffrance, h.alive, h.eroded, game.souffrancePct());
    void refreshWeapon(h.def.weapon.itemId);
    // taclé : poussière grise aux pieds quand un monstre au contact freine le Sacrieur
    if (h.alive && h.moving && h.tackled < 0.95 && Math.random() < 0.35) emit(h.x + rand(-18, 18), h.y - 6, 0x9a8f80, { vx: rand(-40, 40), vy: rand(-60, -20), life: 0.35, size: 0.06, add: false });
    const guard = game.guard && game.guard.state !== 'dead' ? game.guard : null;
    const big = game.boss ?? game.elite ?? guard;
    if (big && game.phase === 'fight') hud.setBoss(big === guard ? `${big.def.name} (gardien)` : big.def.name, big.hp, big.maxHp);
    else if (game.wavesT > 0 && game.phase === 'fight') hud.setBoss('Tiens bon !', Math.ceil(game.wavesT), WAVES_TIME, '');
    else if ((game.elite || game.guard || game.special === 'vagues') && bossBarShown) hud.setBoss(null);
    bossBarShown = !!(big && game.phase === 'fight') || (game.wavesT > 0 && game.phase === 'fight');
    hud.setPa(h.pa);
    hud.setSlots(slotViews());
    game.run.slots.forEach((sl, i) => {
      if (!sl) return;
      const sp = SPELLS[sl.id];
      hud.setCooldown(i, sl.cd / (sp.cooldown * (1 - sl.cdBonus)), h.pa < sp.pa);
    });
    // aura de Mutilation (rouge, plus forte à chaque palier) et bouclier de Coagulation (turquoise)
    heroAura.clear();
    if (h.mutStage > 0 && h.alive) {
      const k = 0.25 + 0.15 * h.mutStage + 0.08 * Math.sin(time * 9);
      heroAura.ellipse(0, 0, 46, 46 * PERSP).fill({ color: 0xc8303c, alpha: k * 0.5 }).stroke({ width: 3, color: 0xff6a5a, alpha: k });
    }
    // Souffrance : halo de sang qui grandit avec les charges, gouttes qui montent
    if (h.souffrance > 0 && h.alive) {
      const q = h.souffrance / 10, pulse = 0.5 + 0.5 * Math.sin(time * (4 + 6 * q));
      heroAura.ellipse(0, -2, 30 + 30 * q, (30 + 30 * q) * PERSP).fill({ color: 0x8a1020, alpha: 0.18 + 0.32 * q * (0.7 + 0.3 * pulse) })
        .stroke({ width: 2 + 3 * q, color: 0xff3a3a, alpha: 0.25 + 0.55 * q * pulse });
      if (Math.random() < 0.08 + 0.5 * q) emit(h.x + rand(-26, 26), h.y - rand(10, 70), 0xd8202e, { vx: rand(-15, 15), vy: rand(-90, -40), life: 0.5, size: 0.05 + 0.04 * q, add: true });
    }
    if (h.shield > 0 && h.alive) {
      heroAura.ellipse(0, -60 * CHAR_SCALE, 58, 78).stroke({ width: 4, color: 0x8ddccf, alpha: 0.55 + 0.2 * Math.sin(time * 6) });
    }
  });

  function drawTelegraph(m: Monster, k: number) {
    const a = m.atk, col = 0xff2a2a;
    const flat = (pts: number[]) => pts.map((v, i) => (i % 2 ? m.y + v * PERSP : m.x + v));
    const ang = Math.atan2(m.dir.y, m.dir.x);
    if (a.shape === 'circle') {
      const off = attackOffset(m);
      const cx = m.x + m.dir.x * off, cy = m.y + m.dir.y * off * PERSP;
      ground.ellipse(cx, cy, a.size, a.size * PERSP).fill({ color: col, alpha: 0.12 }).stroke({ width: 2.5, color: col, alpha: 0.6 });
      ground.ellipse(cx, cy, a.size * k, a.size * k * PERSP).fill({ color: col, alpha: 0.28 });
    } else if (a.shape === 'cone') {
      const cone = (R: number) => {
        const p = [0, 0];
        for (let j = 0; j <= 12; j++) {
          const t = ang - a.spread + (2 * a.spread * j) / 12;
          p.push(Math.cos(t) * R, Math.sin(t) * R);
        }
        return flat(p);
      };
      ground.poly(cone(a.size)).fill({ color: col, alpha: 0.12 }).stroke({ width: 2.5, color: col, alpha: 0.6 });
      ground.poly(cone(a.size * k)).fill({ color: col, alpha: 0.28 });
    } else {
      const W = a.spread, nx = -Math.sin(ang) * W, ny = Math.cos(ang) * W;
      const ln = (l: number) => flat([nx, ny, Math.cos(ang) * l + nx, Math.sin(ang) * l + ny, Math.cos(ang) * l - nx, Math.sin(ang) * l - ny, -nx, -ny]);
      ground.poly(ln(a.size)).fill({ color: col, alpha: 0.12 }).stroke({ width: 2.5, color: col, alpha: 0.6 });
      ground.poly(ln(a.size * k)).fill({ color: col, alpha: 0.28 });
    }
  }

  const fit = () => {
    zoom = window.innerWidth / ROOM_W;
    vignette.texture = vignetteTexture(window.innerWidth, window.innerHeight);
    vignette.width = window.innerWidth;
    vignette.height = window.innerHeight;
    hurtVignette.texture = vignetteTexture(window.innerWidth, window.innerHeight, '200,20,20', 0.6);
    hurtVignette.width = window.innerWidth;
    hurtVignette.height = window.innerHeight;
    game.setPlayBottom(playBottom());
    placeJoyIdle();
  };
  fit();
  addEventListener('resize', fit);
}

main();

