"""Génère src/game/data/monsters.astrub.ts (vraies fiches DofusDB d'Astrub, branche A).
Usage : python3 -I tools/gen_astrub.py <dossier des JSON DofusDB> (monstres m<id>.json)."""
import json, sys, os
D = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src/game/data/monsters.astrub.ts')

def rows(mid):
    m = json.load(open(f'{D}/m{mid}.json'))
    out = []
    for g in m['grades']:
        st = [g['strength'], g['intelligence'], g['chance'], g['agility'], g['wisdom']]
        res = [g.get(k, 0) for k in ['reductionNeutral', 'reductionEarth', 'reductionFire', 'reductionWater', 'reductionAir']]
        out.append([g['level'], g['lifePoints'], st, res, g.get('xp') or 0, g.get('tackleBonus', 0), g.get('paLostDodge', 0), g.get('mpLostDodge', 0)])
    # archimonstres : l'XP du dernier grade manque parfois (0) → on garde celle du premier
    for r in out:
        if r[4] == 0:
            r[4] = out[0][4]
    # Milimulou : DofusDB lui donne 10 grades (22-30 puis 82-90, autre version) → on garde les 5 premiers
    if not m.get('isMiniBoss') and len(out) > 5:
        out = out[:5]
    return m['name']['fr'], out

# id, dofusId, art, comportement, vitesse, rayon, échelle, attaque (TS), commentaire
M = [
  ('piouViolet', 236, 'piouViolet'), ('piouRouge', 489, 'piouRouge'), ('piouVert', 490, 'piouVert'),
  ('piouBleu', 491, 'piouBleu'), ('piouRose', 492, 'piouRose'), ('piouJaune', 493, 'piouJaune'),
]
PIOU_ATK = "{ shape: 'circle', trigger: 90, size: 54, spread: 0, offset: 48, windup: 0.36, recover: 0.22, cooldown: [0.9, 1.3], roll: roll('terre', 4, 5) }"
DEFS = []
def d(id, did, art, beh, speed, radius, scale, atk, note, extra=''):
    DEFS.append((id, did, art, beh, speed, radius, scale, atk, note, extra))
for id, did, art in M:
    d(id, did, art, 'melee', 150, 22, 0.85, PIOU_ATK, 'Picore : Terre 16-20 au corps à corps')
d('tofuMalade', 473, 'tofuMalade', 'melee', 210, 22, 1, "{ shape: 'circle', trigger: 100, size: 56, spread: 0, offset: 56, windup: 0.32, recover: 0.22, cooldown: [0.8, 1.2], roll: roll('air', 3, 4) }", 'Béco Morveux : Air 13-16, 1-2 cases ; 8 PM (très rapide)')
d('arakneMalade', 474, 'arakneMalade', 'melee', 165, 24, 0.9, "{ shape: 'circle', trigger: 95, size: 58, spread: 0, offset: 52, windup: 0.4, recover: 0.24, cooldown: [0.9, 1.3], roll: roll('terre', 3, 5) }", 'Frappe Morveuse : Terre 13-18 au corps à corps')
d('araknose', 4817, 'araknose', 'melee', 140, 24, 0.9, "{ shape: 'circle', trigger: 95, size: 58, spread: 0, offset: 52, windup: 0.38, recover: 0.24, cooldown: [0.8, 1.2], roll: roll('feu', 2, 3) }", 'Rejet Acide : Feu 7-12 au corps à corps')
d('arakmute', 4818, 'arakmute', 'caster', 75, 26, 1, "{ shape: 'circle', trigger: 330, size: 64, spread: 0, offset: 0, windup: 0.9, recover: 0.4, cooldown: [2.0, 2.8], roll: neutre(3, 4), atTarget: true }", 'Regard Effrayant : Neutre 11-14, 2-6 cases ; 2 PM (lent)')
d('tournesolSauvage', 48, 'tournesolSauvage', 'caster', 80, 26, 1.05, "{ shape: 'circle', trigger: 330, size: 70, spread: 0, offset: 0, windup: 0.95, recover: 0.4, cooldown: [2.0, 2.6], roll: roll('terre', 3, 5), atTarget: true }", 'Racine Pivotante : Terre 13-18, 1-5 cases')
d('roseDemo', 78, 'roseDemo', 'melee', 135, 24, 1.05, "{ shape: 'circle', trigger: 100, size: 60, spread: 0, offset: 54, windup: 0.42, recover: 0.25, cooldown: [0.9, 1.3], roll: roll('eau', 3, 4) }", 'Rose Épineuse : Eau 11-14 au corps à corps')
d('pissenlitDiabo', 79, 'pissenlitDiabo', 'lancer', 110, 26, 1.05, "{ shape: 'line', trigger: 230, size: 250, spread: 24, offset: 0, windup: 0.6, recover: 0.3, cooldown: [1.4, 1.9], roll: roll('feu', 5, 8) }", 'Herbe Sauvage : Feu 21-30, 0-5 cases en ligne')
d('epouvanteur', 4820, 'epouvanteur', 'lancer', 120, 26, 1.1, "{ shape: 'line', trigger: 200, size: 210, spread: 24, offset: 0, windup: 0.5, recover: 0.3, cooldown: [1.2, 1.6], roll: roll('air', 3, 4) }", 'Protection des Champs : Air 13-16, 1-4 cases en ligne')
d('larveBleue', 31, 'larveBleue', 'caster', 70, 24, 0.9, "{ shape: 'circle', trigger: 360, size: 60, spread: 0, offset: 0, windup: 0.85, recover: 0.4, cooldown: [1.9, 2.6], roll: roll('eau', 3, 4), atTarget: true }", 'Postillon Handicapant : Eau 13-16, 1-6 cases ; 2 PM')
d('larveVerte', 34, 'larveVerte', 'caster', 85, 24, 0.9, "{ shape: 'circle', trigger: 330, size: 60, spread: 0, offset: 0, windup: 0.85, recover: 0.4, cooldown: [1.9, 2.6], roll: roll('terre', 3, 4), atTarget: true }", 'Postillon Aveuglant : Terre 13-16, 1-5 cases')
d('larveOrange', 46, 'larveOrange', 'melee', 115, 24, 0.9, "{ shape: 'circle', trigger: 95, size: 58, spread: 0, offset: 52, windup: 0.42, recover: 0.25, cooldown: [0.9, 1.3], roll: roll('feu', 4, 5) }", 'Bave Collante : Feu 15-20 au corps à corps')
d('larveJaune', 5225, 'larveJaune', 'melee', 115, 24, 0.9, "{ shape: 'circle', trigger: 95, size: 58, spread: 0, offset: 52, windup: 0.42, recover: 0.25, cooldown: [0.9, 1.3], roll: roll('air', 4, 5) }", 'Bave Affaiblissante : Air 15-20 au corps à corps')
d('gardienne', 4821, 'gardienne', 'lancer', 110, 24, 1, "{ shape: 'line', trigger: 210, size: 220, spread: 22, offset: 0, windup: 0.55, recover: 0.3, cooldown: [1.3, 1.8], roll: roll('feu', 3, 4) }", 'Désherbant : vol de vie Feu 11-14, 1-5 cases en ligne')
# Branche C (validée par Enzo) : Pichons des Calanques et du Château Ensablé
d('pichonOrange', 920, 'pichonOrange', 'caster', 95, 22, 0.8, "{ shape: 'circle', trigger: 300, size: 62, spread: 0, offset: 0, windup: 0.85, recover: 0.4, cooldown: [1.8, 2.4], roll: roll('feu', 3, 4), atTarget: true }", 'Sable Brûlant : Feu 13-16, 1-5 cases')
d('pichonBleu', 921, 'pichonBleu', 'lancer', 110, 22, 0.8, "{ shape: 'line', trigger: 260, size: 280, spread: 22, offset: 0, windup: 0.6, recover: 0.3, cooldown: [1.4, 1.9], roll: roll('eau', 4, 5) }", 'Vaguelette : Eau 15-18, 1-8 cases en ligne')
d('pichonBlanc', 922, 'pichonBlanc', 'melee', 130, 24, 0.85, "{ shape: 'circle', trigger: 95, size: 58, spread: 0, offset: 52, windup: 0.4, recover: 0.24, cooldown: [0.9, 1.3], roll: roll('air', 4, 6) }", "Bouffée d'Air : Air 17-22 au corps à corps ; 4 PM")
d('pichonVert', 923, 'pichonVert', 'melee', 130, 22, 0.8, "{ shape: 'circle', trigger: 95, size: 58, spread: 0, offset: 52, windup: 0.4, recover: 0.24, cooldown: [0.9, 1.3], roll: roll('terre', 4, 6) }", 'Reflux : Terre 17-22 au corps à corps (repousse) ; 4 PM')
d('pichonKloune', 924, 'pichonKloune', 'caster', 120, 22, 0.8, "{ shape: 'circle', trigger: 190, size: 60, spread: 0, offset: 0, windup: 0.7, recover: 0.35, cooldown: [1.5, 2.0], roll: roll('feu', 5, 7), atTarget: true }", 'Blag : Terre, Air et Feu 7-10 chacun, 1-3 cases ; 4 PM')

# Branche B (validée par Enzo) : Tainéla, Forêt d'Astrub, Carrière, Égouts, Donjon des Bouftous
# charge annoncée en ligne (Fureur du Bouftou, Charge Forcée), comme le Bouftor d'Incarnam
CH = ", charge: { every: 8, dash: 260, attack: { shape: 'line', trigger: 360, size: 300, spread: 30, offset: 0, windup: 0.85, recover: 0.6, cooldown: [1.2, 1.6], roll: roll('terre', 4, 6) } }"
MEL = lambda el, a, b, sp=(0.9, 1.3): f"{{ shape: 'circle', trigger: 100, size: 60, spread: 0, offset: 54, windup: 0.42, recover: 0.25, cooldown: [{sp[0]}, {sp[1]}], roll: {'neutre(' if el == 'neutre' else f"roll('{el}', "}{a}, {b}) }}"
d('bouftou', 101, 'bouftou', 'melee', 150, 30, 1.25, MEL('feu', 5, 7), 'Morsure du Bouftou : Feu 21-30 au corps à corps ; 4 PM')
d('bouftonBlanc', 134, 'bouftonBlanc', 'melee', 125, 22, 0.9, MEL('air', 5, 6), 'Mâchouillage : Air 19-26 au corps à corps')
d('bouftonNoir', 149, 'bouftonNoir', 'melee', 125, 22, 0.9, MEL('eau', 5, 6), 'Mordillement : Eau 19-26 au corps à corps')
d('chefBouftou', 148, 'chefBouftou', 'brute', 140, 32, 1.4, MEL('neutre', 5, 7, (1.0, 1.4)), 'Morsure de Guerre : Neutre 21-30 au corps à corps ; Fureur du Bouftou : Terre 16-25, 1-4 cases en ligne, tous les 2 tours → charge', CH)
d('bouftouNoir', 4822, 'bouftouNoir', 'melee', 130, 32, 1.3, MEL('neutre', 4, 6), 'Morsure Obscure : Neutre 16-25 au corps à corps')
d('prespic', 103, 'prespic', 'lancer', 115, 22, 0.9, "{ shape: 'line', trigger: 290, size: 310, spread: 22, offset: 0, windup: 0.6, recover: 0.3, cooldown: [1.4, 1.9], roll: roll('feu', 5, 6) }", 'Moquerie : Feu 21-26, 1-8 cases en ligne')
d('sanglier', 104, 'sanglier', 'brute', 135, 30, 1.15, MEL('neutre', 3, 4, (1.0, 1.4)), 'Perce-vessie : Neutre 9-12 au corps à corps (repousse) ; Charge Forcée → charge', CH)
d('ecurouille', 4823, 'ecurouille', 'caster', 110, 22, 0.9, "{ shape: 'circle', trigger: 220, size: 58, spread: 0, offset: 0, windup: 0.7, recover: 0.35, cooldown: [1.5, 2.0], roll: neutre(3, 4), atTarget: true }", 'Taie de Gland : Neutre 11-16, 1-4 cases')
d('milimulou', 159, 'milimulou', 'melee', 150, 30, 1.2, MEL('terre', 5, 7), 'Déboyautage : Terre 21-30 au corps à corps ; 4 PM')
d('martoa', 5228, 'martoa', 'caster', 130, 22, 0.85, "{ shape: 'circle', trigger: 210, size: 60, spread: 0, offset: 0, windup: 0.7, recover: 0.35, cooldown: [1.5, 2.0], roll: roll('air', 5, 8), atTarget: true }", 'Marteau Branlant : Air 13-20 puis 9-12, 1-4 cases')
d('sherpoa', 5229, 'sherpoa', 'caster', 120, 22, 0.85, "{ shape: 'circle', trigger: 330, size: 62, spread: 0, offset: 0, windup: 0.85, recover: 0.4, cooldown: [1.8, 2.4], roll: roll('terre', 4, 6), atTarget: true }", 'Lancer de Caillou : Terre 17-24, 1-6 cases')
d('douzdoa', 5230, 'douzdoa', 'melee', 140, 22, 0.85, MEL('feu', 4, 6), 'Vissage : Feu 17-24 au corps à corps (repousse)')
d('pikdoa', 5231, 'pikdoa', 'caster', 130, 22, 0.85, "{ shape: 'circle', trigger: 210, size: 60, spread: 0, offset: 0, windup: 0.7, recover: 0.35, cooldown: [1.5, 2.0], roll: roll('eau', 4, 5), atTarget: true }", 'Piochage : Eau 15-20, 1-4 cases')
d('arakneEgouts', 255, 'arakneEgouts', 'melee', 165, 26, 0.95, MEL('terre', 4, 5, (0.8, 1.1)), 'Mandibules : Terre 15-17 au corps à corps (2 PA : deux fois par tour)')
d('scelerat', 465, 'scelerat', 'melee', 150, 24, 1, MEL('eau', 4, 5), 'Mordillage : Eau 16-18 au corps à corps')
d('milirat', 475, 'milirat', 'lancer', 115, 22, 0.9, "{ shape: 'line', trigger: 250, size: 270, spread: 22, offset: 0, windup: 0.55, recover: 0.3, cooldown: [1.3, 1.8], roll: roll('eau', 3, 4) }", 'Lancer de Lance : Eau 12-14, 1-6 cases en ligne')
d('ramane', 3205, 'ramane', 'caster', 105, 24, 0.95, "{ shape: 'circle', trigger: 300, size: 62, spread: 0, offset: 0, windup: 0.8, recover: 0.4, cooldown: [1.7, 2.3], roll: roll('terre', 3, 4), atTarget: true }", 'Roblochon ancestral : Terre 14-16, 1-5 cases')

# archimonstres : même dessin, mêmes sorts que leur monstre de base
ARCHI = [(2341, 'piouBleu'), (2342, 'piouJaune'), (2343, 'piouRose'), (2344, 'piouRouge'), (2345, 'piouVert'), (2347, 'piouViolet'),
         (2312, 'arakneMalade'), (2356, 'tofuMalade'), (2348, 'pissenlitDiabo'), (2352, 'roseDemo'), (2358, 'tournesolSauvage'),
         (2331, 'larveOrange'), (2332, 'larveVerte'), (2339, 'larveJaune'), (2574, 'larveBleue'),
         (2272, 'pichonVert'), (2338, 'pichonBleu'), (2340, 'pichonOrange'), (2346, 'pichonBlanc'),
         (2315, 'bouftonBlanc'), (2316, 'bouftonNoir'), (2317, 'bouftou'), (2324, 'chefBouftou'), (2333, 'milimulou'), (2349, 'prespic'), (2353, 'sanglier'),
         (2334, 'milirat'), (2350, 'scelerat'), (2393, 'arakneEgouts')]

L = ['// Généré par tools/gen_astrub.py depuis DofusDB : ne pas modifier à la main.',
     "import type { MonsterAttack, MonsterDef } from './monsters';",
     "import type { DamageRoll } from '../formulas';",
     '',
     "type Row = [number, number, [number, number, number, number, number], [number, number, number, number, number], number, number, number, number];",
     '',
     '/** Monstres d\'Astrub, branches A, B et C (Cité… Donjon des Champs ; Tainéla… Donjon des Bouftous ; Côte et Château Ensablé) : grades réels, sorts de grade 1 × 0,25. */',
     'export function astrubMonsters(rows: (r: Row[]) => MonsterDef[\'grades\'], roll: (e: DamageRoll[\'element\'], a: number, b: number) => DamageRoll, neutre: (a: number, b: number) => DamageRoll): Record<string, MonsterDef> {',
     '  const atk: Record<string, MonsterAttack> = {};',
     '  const out: Record<string, MonsterDef> = {};']
for id, did, art, beh, speed, radius, scale, atk, note, extra in DEFS:
    name, r = rows(did)
    L.append(f'  /** {name} ({did}) : niveaux {r[0][0]}-{r[-1][0]}. {note}. */')
    L.append(f'  atk.{id} = {atk};')
    L.append(f"  out.{id} = {{ id: '{id}', name: {json.dumps(name, ensure_ascii=False)}, dofusId: {did}, grades: rows({json.dumps(r)}), behavior: '{beh}', speed: {speed}, radius: {radius}, art: '{art}', scale: {scale}, attack: atk.{id}{extra} }};")
for did, base in ARCHI:
    name, r = rows(did)
    L.append(f'  /** Archimonstre {name} ({did}), version rare du monstre « {base} ». */')
    L.append(f"  out.archi{did} = {{ ...out.{base}, id: 'archi{did}', name: {json.dumps(name, ensure_ascii=False)}, dofusId: {did}, grades: rows({json.dumps(r)}), scale: (out.{base}.scale ?? 1) * 1.15, archi: {{ of: '{base}' }} }};")
L.append('  return out;')
L.append('}')
L.append('')
L.append('/** Archimonstre de chaque monstre de base. */')
L.append('export const ARCHI_OF: Record<string, string> = ' + json.dumps({base: f'archi{did}' for did, base in ARCHI}) + ';')
open(OUT, 'w').write('\n'.join(L) + '\n')
print(len(DEFS), 'monstres,', len(ARCHI), 'archimonstres →', OUT)
