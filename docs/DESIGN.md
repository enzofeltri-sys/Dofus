# Dofus — version Enzo · Document de design

> Jeu de fan **privé** (jamais publié) : roguelike d'action dans l'univers de Dofus.
> Ce document est la référence. Chaque décision ici a été validée par Enzo ;
> toute modification passe par une nouvelle validation.

---

## 1. Vision

Un Dofus « version Enzo » : on retrouve l'univers, la direction artistique, les classes,
les stats, les donjons, les panoplies, le craft et la forgemagie de Dofus, mais dans un
**jeu d'action temps réel** façon Archero / Brotato, jouable sur **téléphone, iPad et PC**.

### Modes de jeu

| Mode | Statut | Résumé |
|---|---|---|
| **Histoire** | 🟢 en cours | Tous les donjons de Dofus, d'Incarnam au donjon le plus dur, en runs roguelike. Progression persistante (niveau, stuff, métier). |
| **Survie (façon Brotato)** | ⏸ plus tard | Mode à part, vagues en arène, boutique entre les vagues, **repart de zéro à chaque partie**. |

---

## 2. Technique

- **Jeu web** (TypeScript + moteur WebGL 2D type PixiJS/Phaser), **installable** sur l'écran d'accueil (PWA).
- Fonctionne sur téléphone, iPad et PC sans App Store.
- Sauvegarde locale + **export/import de sauvegarde** (code ou fichier) pour passer d'un appareil à l'autre.
  - ⚠️ Sur iOS, Safari peut effacer les données d'un site non installé après 7 jours sans visite → le jeu doit être **ajouté à l'écran d'accueil**.
- Testé à chaque étape dans un vrai navigateur (formats téléphone et PC), captures à l'appui.
- Hébergement privé à décider plus tard — **rien n'est publié sans l'accord d'Enzo**.
- Données de jeu (donjons, monstres, drops, sorts) issues de **DofusDB**, adaptées au temps réel.

---

## 3. Direction artistique

Objectif : **retrouver l'esprit et la DA de Dofus**, sans pixel art.

- **Téléphone en portrait, plein écran** (priorité absolue ; iPad et PC plus tard).
- **Vue de dessus 3/4 façon Archero** : la salle remplit toute la largeur de l'écran, aucune zone noire ou vide ; la caméra défile verticalement.
  - Profondeur (« un peu de 3D ») : mur du fond vu de face (arcades, sortie), murs latéraux avec face intérieure ombrée, objets en volume (dessus + face avant), ombres portées.
  - (Une vraie vue isométrique en losange laisserait du noir dans les coins d'un écran vertical : écartée.)
- **Tout est dessiné en vectoriel dans le code** (pas d'assets Dofus copiés, pas de générateur d'images).
- Signature visuelle Dofus :
  - contours épais, souples et **colorés** (plus foncés que la teinte, jamais noir pur) ;
  - personnages « chibi » (grosse tête), formes rondes, **ombre ovale au sol** ;
  - sols peints en dégradés doux, bordures d'herbe en touffes, arbres ronds ;
  - palette chaude et saturée.
- **Interface façon Dofus** : tons parchemin beige/brun, **cœur** (PV), **étoile bleue** (PA), **botte verte** (PM), barre de sorts en bas.
- Références visuelles : illustrations des monstres et **cartes réelles des donjons** (DofusDB), utilisées **uniquement comme modèle**, jamais intégrées au jeu.
  - Ex. Crypte de Kardorim : grès doré, colonnade d'arcades rouge-brun, piliers rouges peints de flammes, chapiteaux crème sculptés de crânes, mur ocre, braseros.
- Limite assumée : rendu « esprit Dofus », pas une copie conforme ni un niveau d'illustrateur professionnel.
- **Personnages vectoriels conservés** : un essai de Sacrieur dessiné par ComfyUI (image vers image depuis le rendu officiel, découpé et animé) a été écarté par Enzo ; on garde le Sacrieur vectoriel D2 et le même style pour tous les personnages.

---

### 3.x Personnage (validé par Enzo, octobre 2026)
- **Sacrieur « version Archero »** : un personnage chibi à nous (grosse tête ronde, petit corps trapu, gros poings, modelé brillant) qui reprend les codes du Sacrieur de Dofus (bandana-casque à pièce cousue, oreilles pointues, yeux blancs, peintures de guerre, cœur, bandages, pagne déchiqueté, pantalon effiloché, pieds nus à lanières).
- **Couleurs réglables** comme dans Dofus 3 : peau, cheveux, vêtements 1 à 4 (écran Apparence au camp, aléatoire, retour aux couleurs du jeu).
- Monstres de la Crypte dans le même style, fidèles à Dofus 3 sur tout le reste (validé par Enzo) : Chafers squelettes voûtés au crâne allongé et mâchoire ouverte, bottes sombres cerclées d'or ; Débutant crâne nu et cimeterre sombre ; Furtif identique en fantôme turquoise ; Piquier casque vert-jaune, grand bouclier rectangulaire et lance droite ; Sergent casque rouge à tête de mort et plumet, épaulière, cape ; Kardorim visage visible sous le casque à cornes d'or, contour lumineux vert ; Kardorib chien squelette à cornes de bélier.

## 4. Combat

### 4.1 Principe
- **Temps réel.** Le joueur ne fait qu'**une chose : se déplacer**.
- **Tout est automatique** : l'attaque de l'arme **et** les sorts.
- **On attaque en mouvement**, quelle que soit l'arme.
- La difficulté vient du **positionnement** : portée de l'arme (le corps à corps oblige au contact), attaques ennemies **annoncées au sol** à esquiver.

### 4.2 Contrôles
- Téléphone : joystick virtuel qui apparaît sous le pouce, n'importe où sur l'écran.
- PC : ZQSD / WASD / flèches.

### 4.3 L'arme = attaque de base
Chaque type d'arme a sa vitesse et sa forme d'attaque. Les stats viennent du jet de l'objet.

| Arme | Vitesse | Forme |
|---|---|---|
| Dague | Très rapide | Une cible, critiques élevés |
| Épée | Moyenne | Arc de cercle devant soi |
| Marteau | Lente | Zone autour de l'impact, gros dégâts |
| Hache | Lente | Cône, plusieurs cibles |
| Pelle | Moyenne | Ligne qui traverse |
| Bâton | Moyenne | Zone en croix |
| Arc / Baguette | Rapide | À distance |

### 4.4 Sorts automatiques
- **Emplacements** de sorts **ordonnés par priorité** (case 1 d'abord) : **4** au départ, **5** au niv 50, **6** au niv 100, **7** au niv 150, **8** au niv 200.
- **Les sorts se gagnent pendant le donjon** (validé) : on commence chaque donjon avec l'arme seule ; après chaque salle, **1 carte parmi 3** :
  nouveau sort (pris dans le grimoire, donc selon le niveau), amélioration d'un sort, bonus de stats, ou **passif** cumulable
  (Soif de sang, Sang neuf, Épines, Frénésie, Douleur exaltée, Peau de cuir ; 3 fois max chacun).
  Quand les cases sont pleines, un nouveau sort **remplace** celui qu'on choisit. Tout repart à zéro au donjon suivant.
- **Grimoire** (onglet du camp, fait) : les **22 sorts du Sacrieur de Dofus 3** (pas de variantes : c'était Dofus 2), niveau de déblocage réel, débloqués / à venir / pas encore dans le jeu. On marque des **favoris** (★) : ×2,5 de chances de sortir dans les cartes.
- **Sorts 15-30 (validés par Enzo)**, vraies valeurs DofusDB, puissance des sorts en temps réel comme les autres :
  - **Épée Vorace** (15) : toutes les 16 s, une épée volante (alliée) pendant 12 s ; elle vole vers le monstre le plus proche et lance Soif de Sang (vol de vie Neutre 8-10, 3 fois par tour), qui soigne le Sacrieur. Dans Dofus elle reste jusqu'à ce qu'on la tue : durée simplifiée.
  - **Ravage** (20) : bond sur un ennemi à 3-6 cases (jusqu'à 5 cases de déplacement) puis Terre 17-20 ; 2 fois par tour.
  - **Assaut** (25) : échange de place avec un ennemi au contact et Air 9-11, **seulement quand on est encerclé** (2 monstres au contact), pour ne pas faire perdre au joueur le contrôle de sa position ; 3 fois par tour.
  - **Transposition** (30) : sous 50 % de PV et au contact d'ennemis, échange de place avec l'ennemi le plus éloigné (2-7 cases, +4 en Souffrance 6) ; tous les 3 tours.
- **Sorts 35-50 (validés par Enzo)**, mêmes règles ; au **niveau 50, 5e case de sort** :
  - **Condensation** (35) : vise le groupe le plus serré à 5 cases ou moins, Eau 13-16 sur tous les monstres à 2 cases du centre, puis les attire de 2 cases vers le Sacrieur ; 2 fois par tour.
  - **Hostilité** (40) : Feu 9-11 et repousse de 2 cases ; contre un mur ou un obstacle, dommages de poussée (formule Dofus) pour les cases non parcourues ; 3 fois par tour.
  - **Couronne d'Épines** (45) : seulement au contact d'un ennemi ; bouclier de 8 % des PV max (+3 % par ennemi au contact en Souffrance 6) et, pendant 1 tour, les dommages de mêlée reçus sont renvoyés à l'attaquant ; tous les 3 tours.
  - **Transfusion** (50) : dommages Neutre égaux à 8 % des PV actuels du Sacrieur sur tous les ennemis à 3 cases ou moins (dans Dofus, le sort soigne les alliés : sans alliés ici, seule la partie dommages est gardée) ; 1 fois par tour.
  - Simulation (Donjon des Bouftous, niveau 40, Panoplie du Bouftou, 8 joueurs) : 5/8 vainqueurs avec les sorts 35-50, 7/8 sans, écarts dans le bruit de la simulation (un joueur de plus ou de moins selon les tirages) ; aucun des 4 sorts retiré seul ne change le résultat.
- **Traduction en temps réel** : 1 tour Dofus = **4 s** (6 PA rechargés par tour) ; « N lancers par tour » → au plus un lancer toutes les 4/N s ;
  « tous les N tours » → toutes les 4N s ; 1 case ≈ 60 px au sol ; vol de vie = 50 % des dégâts infligés ;
  **dégâts des sorts ×0,5** (on lance bien plus de sorts qu'en tour par tour, en plus de l'arme ; réglé après test d'Enzo).
- Chaque sort a une **fiche** : coût en PA, **cooldown**, **portée min–max**, élément, zone, **condition de lancement**.
- À chaque instant, le jeu lance le **premier sort de la liste** qui est prêt, dont les PA sont disponibles et qui a une cible valide.
- Exemples de conditions : « un ennemi est dans la portée », « PV > 50 % », « PV < 40 % », « ≥ 3 ennemis dans la zone ».

### 4.5 Ressources
- **PA = jauge** qui se recharge en continu. Chaque sort coûte des PA. Plus de PA = plus de sorts.
- **PM** = vitesse de déplacement.
- **Portée** = allonge la portée maximale des sorts et des armes à distance.

---

## 5. Classe de départ : le Sacrieur

Kit basé sur le **vrai Sacrieur actuel** (DofusDB), réinterprété en temps réel.

### 5.1 Mécanique de classe : la Souffrance
Dans Dofus, le Sacrieur gagne des **charges de Souffrance** quand il subit des dégâts, ce qui renforce certains sorts (ex. portée +4 d'Attirance/Transposition à Souffrance 6+).
En temps réel : **Souffrance = vie perdue** : 1 charge par tranche de 10 % de PV perdus (vie érodée comprise, 10 max), elle redescend seulement quand on se soigne (validé par Enzo) ; elle augmente les dégâts et active les bonus des sorts. Beaucoup de sorts **volent de la vie** ou **sacrifient des PV** → style risque/récompense, corps à corps.

### 5.2 Sorts et variantes (niveaux de déblocage réels)
Chaque ligne = un sort **ou** sa variante (on choisit l'un des deux, modifiable hors donjon).
Les sorts gagnent des **grades** automatiquement aux niveaux indiqués (ex. Absorption : niv 1 → 66 → 132).

| Sort (niveaux des grades) | ⇄ | Variante (niveaux des grades) |
|---|---|---|
| Absorption (1/66/132) — vol de vie Feu | ⇄ | Furie (95/162) — Air en zone, + dommages finaux |
| Supplice (1/68/134) — vol de vie Terre, CàC | ⇄ | Nervosité (105/172) — Eau en zone, + Critique |
| Stase (1/69/136) — vol de vie Eau | ⇄ | Douleur Cuisante (110/177) — Feu en zone, + Puissance |
| Hémorragie (1/67/133) — vol de vie Air, CàC | ⇄ | Décimation (100/167) — Terre, dommages subis + |
| Attirance (5/72/139) — attire la cible | ⇄ | Perfusion (115/182) — transfert de vie |
| Mutilation (10/77/144) — sacrifie PV → Puissance | ⇄ | Pacte de Sang (120/187) — Vitalité + Puissance |
| Épée Vorace (15/82/149) — invocation | ⇄ | Épée Dansante (125/192) — invocation |
| Ravage (20/87/154) — se rapproche, Terre | ⇄ | Fulgurance (130/197) — téléport, Air en zone |
| Assaut (25/92/159) — échange de place, Air | ⇄ | Aversion (135) — Feu, repousse en zone |
| Transposition (30/97/164) — échange de place | ⇄ | Fluctuation (140) — intaclable, + PM |
| Condensation (35/102/169) — Eau, attire en zone | ⇄ | Afflux (145) — attire au centre, Terre |
| Hostilité (40/107/174) — Feu, repousse | ⇄ | Projection (150) — téléport symétrique, Eau |
| Couronne d'Épines (45/112/179) — renvoi de dommages | ⇄ | Pilori (155) — bouclier, état |
| Transfusion (50/117/184) — Neutre selon vie | ⇄ | Liens du Sang (160) — rapprochement |
| Dissolution (55/122/189) — vol de vie Eau en zone | ⇄ | Carnage (165) — sacrifie PV, Air en zone |
| Désolation (60/127/194) — vol de vie Air, retrait PM | ⇄ | Déchaînement (170) — sacrifie PV, Eau en zone |
| Sacrifice (65/131/198) — intercepte les dégâts | ⇄ | Pénitence (175) — échange de place, état |
| Bain de Sang (70/137) — vol de vie Terre en zone | ⇄ | Immolation (180) — sacrifie PV, Feu en zone |
| Hécatombe (75/142) — vol de vie Feu en zone | ⇄ | Entaille (185) — sacrifie PV, Terre |
| Libation (80/147) — sacrifie PV puis soin | ⇄ | Châtiment (190) — Neutre selon vie, zone |
| Berserk (85/152) — sacrifie PV, état Berserk | ⇄ | Rituel de Jashin (195) — état + glyphe |
| Punition (90/157) — meilleur élément + vie érodée | ⇄ | Folie Sanguinaire (200) — vol de vie en zone |

Les effets propres au tour par tour (tacle, fuite, états de tour) seront **traduits** en équivalents temps réel au moment d'implémenter chaque sort.

### 5.3 Pas d'arbre de compétences
Profondeur de build = **stats** + **variantes de sorts** + **ordre de priorité** + **arme** + **panoplies**, plus les bonus temporaires de run.

---

## 6. Caractéristiques

| Stat | Effet |
|---|---|
| Vitalité | PV |
| Sagesse | % d'XP en plus |
| Force / Intelligence / Chance / Agilité | Dégâts Terre / Feu / Eau / Air |
| PA / PM / Portée | Voir §4.5 |
| Puissance, Dommages (fixes et par élément), Critique, Dommages critiques, Soins | Comme Dofus |
| Résistances % et fixes par élément | Comme Dofus |
| Prospection | Multiplie les chances de drop |

- **5 points de caractéristique par niveau**, niveau max **200**.
- **Paliers réels du Sacrieur** (DofusDB) :
  - Force / Intelligence / Chance / Agilité : 1 point = 1 jusqu'à 100, puis 2 points pour 1 jusqu'à 200, 3 pour 1 jusqu'à 300, 4 pour 1 au-delà ;
  - Vitalité : 1 point = 1 ;
  - Sagesse : 3 points pour 1.

### 6.1 Fiche complète et traduction en temps réel (étape 5)
Toutes les caractéristiques de la fiche Dofus existent ; celles qu'aucun sort, monstre ou objet n'utilise encore sont affichées et prêtes pour l'équipement (étape 6).

| Mécanique | Formule Dofus | En temps réel |
|---|---|---|
| Dommages | base × (100 + carac + Puissance) / 100 + Dommages + Dommages de l'élément (+ Dommages critiques) | Identique |
| Résistances | − fixes (− Résistance critique sur un critique), puis × (100 − %) ; plafond 50 %, faiblesse négative = plus de dégâts | Identique ; chiffre corail sur une faiblesse, grisé sur une résistance, « Faible Terre ! » la 1re fois |
| Dommages / résistances finaux | % mêlée ou distance, % arme ou sort | Identique (épée et sorts au CàC = mêlée) |
| Poussée | (niveau / 2 + Do Pou − Ré Pou + 32) × cases / 4 | Un monstre projeté par l'épée contre un mur ou un obstacle subit 1 case de poussée |
| Tacle / fuite | on garde (fuite + 2) / (2 × (tacle + 2)) de ses PM | Au contact, vitesse entre 40 % et 100 % selon le plus gros tacleur (poussière grise aux pieds) |
| Érosion | 10 % des dégâts subis réduisent les PV max | Identique, jusqu'à la fin de la salle (partie grisée de la barre de vie) |
| Initiative | carac + bonus, × PV / PV max | Le camp le plus rapide agit tout de suite, l'autre attend 0,8 s |
| Sagesse | + % d'XP | Identique ; aussi esquive et retrait PA/PM (Sagesse / 10) |
| Tacle, fuite (Agilité / 10), prospection (Chance / 10) | Dofus | Identique (prospection utilisée à l'étape 6) |
| Retrait / esquive PA-PM, Soins, Renvoi, Invocations | Dofus | Affichés ; Renvoi déjà actif sur les attaques de mêlée ; le reste s'activera avec les sorts et objets qui s'en servent |

---

## 7. Mode Histoire

### 7.1 Structure
- **Un run = un donjon** : **8 à 10 salles** selon le donjon (dernière salle = boss), un **mini-boss** au milieu.
- Entre deux salles : **choix d'1 carte parmi 3** (sort, amélioration de sort ou bonus de stats ; valable pour le run, voir §4.4).
- **Finir un donjon débloque le suivant.**

### 7.2 Persistance
| Gardé pour toujours | Temporaire (run) |
|---|---|
| Niveau, XP, points de caractéristique | Bonus choisis entre les salles |
| Équipement, inventaire, coffre | |
| Métier Artisan | |

### 7.3 Mort
On **garde l'XP et les ressources** ramassées, on **perd le butin du boss**.

### 7.4 Les donjons
**Tous les donjons de Dofus**, d'Incarnam jusqu'au plus dur : **126 donjons avec boss** (hors « Expéditions », qui sont des variantes de donjons existants). Liste complète en **annexe A**.
Ils seront ajoutés **par tranches de niveaux** ; le moteur étant commun, chaque donjon est un ensemble de **données** (monstres, comportements, drops, recettes).
Les 8 donjons saisonniers (Nowel, Halouine…) sont listés ; leur inclusion reste à décider.

### 7.5 Plus tard (idées validées sur le principe)
- **Challenges** de salle (Statue, Zombie…) → bonus de drop.
- **Idoles** = modificateurs de difficulté contre plus de butin / XP.

### 7.6 Difficulté et progression (validé)
La difficulté n'est **jamais ajustée au personnage** : les monstres ont leurs vraies stats Dofus (grades 1 à 5, plus forts au fond du donjon), le personnage a ses vrais points et son équipement. C'est l'écart entre les deux qui fait la difficulté.

- **Référence** : un personnage **du niveau du donjon, avec un stuff de son niveau**, trouve le donjon **difficile mais faisable**. (Calibrage actuel : Sacrieur niv 10 + stuff niv 10 dans la Crypte de Kardorim, niv 10.)
- **Calibrage validé (Crypte)** : 6 à 12 monstres par salle, PV des monstres ×1,8, Puissance des monstres +30 %, sorts ×0,3, améliorations +5 % / -5 %, Sacrieur à 340 de vitesse et 1,9 coup d'épée/s. « Si je me concentre, je le fais » (Enzo).
- **≈ 10 niveaux en dessous** ou stuff trop faible : **quasi impossible**.
- **Au-dessus** : de plus en plus facile → donjon de **farm**.
- **Boucle de jeu** : trop dur → on farme le donjon précédent (ressources, craft, FM, fusion, XP) → on revient plus fort → on farme celui-là, et ainsi de suite.
- **XP dégressive** quand le donjon est beaucoup plus bas que le personnage : pleine jusqu'à ≈ 10 niveaux d'écart, puis de moins en moins. **Les drops restent intacts** (on revient pour les ressources, pas pour l'XP).
- **Choix du donjon** : niveau recommandé + pastille de danger calculée sur le niveau **et** le stuff : vert (facile), or (à ton niveau), corail (dangereux), violet (hors de portée). On peut toujours tenter un donjon trop dur.

### 7.7 Courbe d'XP (exponentielle, très longue)
L'XP nécessaire par niveau suit une **courbe exponentielle** (+3 % de temps de jeu par niveau). Objectifs, en jouant des donjons de son niveau :

| Passage | Temps pour ce niveau | Temps total depuis le niv 1 |
|---|---|---|
| 10 → 11 | ≈ 4 min | ≈ 35 min |
| 49 → 50 | ≈ 13 min | ≈ 6 h |
| 99 → 100 | ≈ 1 h | ≈ 30 h |
| 149 → 150 | ≈ 4 h | ≈ 140 h |
| 199 → 200 | ≈ 18 h | **≈ 600 h** |

- L'XP gagnée vient des monstres (XP réelle de leur grade sur DofusDB, ×2,5 pour le mini-boss) et du boss, × bonus de Sagesse ; dégressive au-delà de 10 niveaux d'écart (−15 % par niveau de plus).
- Table : XP pour passer le niveau n = (XP gagnée par minute au niveau n) × (temps visé). Mesuré au niveau 10 : ≈ 3 500 XP/min, soit 14 000 XP pour passer 10 → 11 (≈ une Crypte complète, qui rapporte ≈ 15 000 XP). Au-delà, extrapolé (×(n/10)^1,6) en attendant les donjons suivants.
- Les temps sont des **cibles réglables** : on les corrigera en jouant.

---

## 8. Butin

### 8.1 Ressources
- Chaque monstre a **sa table de drop réelle** (DofusDB), avec ses %.
- Chaque boss lâche des ressources **correspondant aux monstres de son donjon**, « plus ou moins » (souplesse à haut niveau, comme dans Dofus).
- Les taux de Dofus sont calibrés pour le farm : on garde **les proportions entre objets**, avec un **multiplicateur global** réglé pour le rythme d'un run.
- **Prospection** multiplie les chances.

- **Butin de région (validé)** : dans Dofus, la plupart des ressources et des panoplies viennent des monstres du monde ouvert. Chaque donjon est rattaché à sa région réelle (Crypte de Kardorim → Incarnam) : en plus de leur table, ses monstres ont ≈ 10 % de chances de lâcher un objet du butin des monstres de la région de niveau ±10 (tiré selon leurs vrais taux, équipement plus rare). Tout ce qui existe dans le jeu tombe dans au moins un donjon.
- **Multiplicateurs (validés)** : ressources des monstres ×0,15, équipement des monstres ×0,05, boss aux taux réels (panoplie Kardorim 20 % par pièce), mini-boss ×3. La Prospection multiplie toutes les chances (100 = ×1).

### 8.2 Équipement
- L'équipement est **principalement fabriqué** (métier Artisan).
- Le boss a une **petite chance** de lâcher directement un objet de sa panoplie (éventuellement d'une rareté supérieure).
- **Jets aléatoires** dans des fourchettes, comme Dofus (ex. Force 10–15).
- **Bonus de panoplie** comme Dofus.

- **Niveau requis réel** (panoplie Kardorim : niveau 12). Icônes officielles des objets (DofusDB), dans un cadre au style du jeu.
- **Équipement de zone (validé par Enzo : « tout doit être droppable »)** : tous les vrais équipements de Dofus jusqu'au niveau 40 (armes comprises ; sauf ceux sans caractéristique et les objets de quête liés au personnage) tombent dans leur zone, selon leur niveau : **Incarnam 1-10, Astrub (Champs et Côte) 11-21, Astrub : les Bouftous 22-30, Amakna (Tofus, Cimetière, Scarafeuilles) 31-40**. Sur une carte, seulement les objets jusqu'au niveau de la carte + 2 (Champs d'Incarnam, niveau 3 : objets 1 à 5) ; en donjon, toute la tranche. Chance par monstre : **5 %, élite / archimonstre / coffre gardé 20 %, boss 50 %** (choix d'Enzo, avant 1 % : à Astrub on n'en voyait presque jamais — 0,06 à 0,15 objet par partie), un objet tiré au hasard ; la Prospection et les paliers du bestiaire comptent. Mesuré (bon joueur) : Champs d'Incarnam 1,1 objet par partie, Cité 1,3, Champs d'Astrub 0,9, Montagne des Craqueleurs 0,7, Donjon des Champs 1,8, Château du Wa Wabbit 1,4. 629 équipements au total. Il tombe avec des jets et une rareté au hasard comme le reste ; la fabrication reste le moyen d'avoir un objet précis.
- **Départ** : Panoplie du Jeune Aventurier sans le Chapeau (lâché par les Chafers : premier objectif) ; nombre de pièces ajusté par simulation pour garder le calibrage.

- **Fiche d'arme (demandé par Enzo)** : chaque ligne de dommages avec son élément (pastille de couleur), la valeur de Dofus et les **dommages réels en jeu avec les caractéristiques actuelles** du Sacrieur (même calcul qu'en combat, cible sans résistance ; critique entre parenthèses), puis PA, portée et critique — dans l'inventaire comme dans l'Encyclopédie.

### 8.2 bis Familiers et Dofus (validés par Enzo)
- **Familiers** : vrais familiers de Dofus avec leurs vrais bonus maximaux (DofusDB). Dans Dofus ils viennent de la boutique, d'œufs ou de quêtes : ici ils sont rattachés aux zones selon leurs monstres (choix) — Incarnam : Chienchien (Sagesse 20), Chachatte Rousse (Vitalité 15) ; Astrub : les 6 Pioutes ; Bouftous : Marcassin ; Tofus : Gwo Tofu Ventripotent, Tofoudre ; Scarafeuilles : Scarakiri, El Scarador ; Cimetière : Vampyrette, Fotome.
  - Obtention : l'élite d'une carte de la zone a **3 %** de chances d'en lâcher un, le boss du donjon **10 %** (Prospection comprise).
  - Croissance : un familier commence à **20 %** de son bonus et grandit en mangeant des **Super Croquettes** (vraie « Nourriture pour familier » de Dofus), qui tombent sur **tous les monstres (3 %)** — pas les ressources de fabrication (demandé par Enzo). +4 % par croquette : **20 croquettes** de 20 à 100 % (≈ 1 croquette par partie sur une carte). Boutons « Nourrir » et « Tout donner » sur la fiche du familier. Pas de rareté, de fusion, de brisage ni de forgemagie.
- **Dofus (demandé par Enzo : tous droppables, très très rares, comme dans Dofus Rétro)** : dans Dofus, ils ne tombent pas sur les monstres ; le boss qui lâche chacun est un **choix** (niveau du boss ≈ niveau du Dofus, zone et stats logiques), à **0,5 %** par victoire (Prospection comprise). Pour l'instant : Dofawa (niveau 6, +1 Vitalité) → Kardorim ; Jyfus (20, +20 Vitalité) → Tournesol Affamé ; Dofus Argenté (20, aucune caractéristique dans DofusDB) → Mob l'Éponge. Les suivants arriveront avec leurs donjons (ex. Dofus Cawotte → Wa Wabbit ; Émeraude, Kaliptus, Vulbis… au niveau 100). Un seul exemplaire de chaque Dofus porté, 6 cases.

### 8.3 Zones, cartes de farm et arbre des donjons (validé par Enzo, étape 9 — remplace l'ancienne règle)
- **Arbre de progression** : zones et donjons en branches ; un donjon vaincu débloque **uniquement sa branche** (ex. Donjon des Champs vaincu → Zone Bouftou + Donjon Bouftou, mais pas Mob l'Éponge). Écran : onglet « Donjons » de la barre du camp.
- **Zone** = **4 cartes de farm**, puis le **donjon** de la zone (débloqué quand les 4 cartes sont terminées).
- **Carte de farm** = **5 salles**, une élite ou un mini-boss à la fin. XP pleine, vraies tables de drop des monstres de la carte, une carte de bonus entre chaque salle. (Les anciens garde-fous — XP ×0,5, 1 carte sur 2, pas de mini-boss — sont abandonnés : les cartes sont le chemin normal. Farmer trop bas est déjà freiné par l'XP dégressive au-delà de 10 niveaux d'écart.)
- **Départ** : niveau 1, sans équipement, à mains nues, sur la 1re carte d'Incarnam (simulation : à mains nues, la Crypte est impossible au niveau 1).
- **Zone 1 — Incarnam** (vrais monstres DofusDB) :
  1. **Champs** : Tofu Chimérique (1-5), Pissenlit Miroitant (2-6), Rose Vaporeuse (2-6) ; élite Tournesol Nébuleux (3-7).
  2. **Pâturages** : Boufton Pâlichon (3-7), Boufton Orageux (3-7), Bouftou Nuageux (4-8) ; élite Bouftor Éthéré (5-9).
  3. **Forêt** : Chakrobat (4-8), Tigrimas (5-9) ; élite Ronronchon (6-10).
  4. **Cimetière** : Chafers (+ Chafer Éclaireur 6-10) ; élite Chafer Piquier ou Sergent.
  - **Donjon** : Crypte de Kardorim. (Lac, Mine et Route des âmes : cartes en plus ou expéditions plus tard.)
- **Fait (9c)** : au camp, la carte « Entrer » d'un donjon affiche les clés (gratuites du jour, ou Clef en stock) ; la clé est dépensée en entrant. Clef de la Crypte de Kardorim : vraie recette (3 × 16524 des Chafers + 5 × 1984 des chats de la Forêt ; métier Bricoleur dans Dofus, Artisan ici) ; elle ne tombe sur aucun monstre dans Dofus.
- **Fin d'Incarnam (validé par Enzo)** : pas de carte pour le Lac, la Mine et la Route des âmes ; leurs monstres (Plikplok, Petit Gloot, Grand Splatch ; Aminite ; Feux Vif, de Joie, Furieux, Follet — vraies fiches, sorts × 0,25 et butins DofusDB, dessins validés) **errent** : une salle normale sur 5 (20 %) remplace la moitié de ses monstres par un groupe errant. Champs : Feux et gelées ; Pâturages : gelées ; Forêt : Feux et Aminites ; Cimetière : Aminites. Plus de butin « de région » tiré au hasard : tous les monstres d'Incarnam sont dans le jeu avec leurs vraies tables.
- **Bestiaire (demandé par Enzo)** : onglet du camp ; tous les monstres du jeu (normaux, élites, archimonstres, boss), silhouette « ??? » tant qu'on ne l'a pas croisé ; fiche : lieux, PV, attaque, résistances, XP, butin avec les chances en jeu ; vus et vaincus comptés à chaque partie (même perdue).
- **Zone 2 — Astrub, branche A (validé par Enzo)** : débloquée par la Crypte. Vraies fiches DofusDB (grades, résistances, XP réelle), sorts des monstres × 0,25, vraies tables de drop.
  1. **Cité d'Astrub** (12) : les 6 Pious (11-15) ; élite Piou Rouge d'élite (création).
  2. **Souterrains d'Astrub** (13) : Tofu Malade, Arakne Malade, Araknosé, Arakmuté (11-15) ; élite Arakne Malade d'élite (création).
  3. **Champs d'Astrub** (17) : Tournesol Sauvage, Rose Démoniaque, Pissenlit Diabolique, Épouvanteur (16-20) ; élite Épouvanteur d'élite (création).
  4. **Prairies d'Astrub** (18) : Larves Bleue, Verte, Orange, Jaune (16-20) ; élite Larve Orange d'élite (création).
  - **Donjon** : Donjon des Champs (nom choisi par Enzo ; DofusDB l'appelle « Grange du Tournesol Affamé ») (7 salles, mini-boss Gardienne Champêtre d'élite en salle 4, boss Tournesol Affamé niveau 20 : 1 458 PV au grade 5, invoque Gardienne, Pissenlit, Rose ou Épouvanteur toutes les 12 s — 3 au plus —, se soigne de 17-26 PV toutes les 16 s). Cité → Souterrains et Champs d'Astrub → Prairies ; la Grange demande les 4. Ensuite : branche C (la Côte, Château Ensablé, en jeu) et branche B (Donjon des Bouftous, « Cour du Bouftou Royal » sur DofusDB).
  - **Clef des Champs** (clé du Donjon des Champs) : vraie recette **sans la Greuvette** (poisson de pêche, sans source dans le jeu ; retirée sur demande d'Enzo) : 2 Pétales de Rose Démoniaque, 2 Fleurs de Pissenlit Diabolique, 2 Pétales de Tournesol Sauvage, 2 Langues d'Épouvanteur, 2 Viandes Hachées, 3 Orties, 3 Blés.
  - **Décors d'après les vraies cartes** : cartes terrestres (pas de vide) — ciel de jour, collines, haies (Souterrains : murs de briques et tuyaux) ; les trous deviennent des étangs avec passerelles. Cité : place pavée, maisons aux toits bleus, étals, caisses ; Souterrains : dalles moussues, eaux sales, tuyaux de cuivre ; Champs d'Astrub : granges aux toits orange, blé, tournesols, meules ; Prairies : herbe, chemins de terre, arbres d'automne, clôtures ; Grange : arène en damier de planches entourée de blé.
  - **Archimonstres (demandé par Enzo)** : 1 % des monstres d'Astrub qui en ont un (15 archimonstres : 6 Pious, Arakne Malade, Tofu Malade, Pissenlit, Rose, Tournesol, 4 Larves) ; vraie fiche DofusDB (PV ×2, XP ×4 environ), taille ×1,15, **aura bleu azur** et nom au-dessus de la tête, annonce « Archimonstre : … ! », butin de leur vraie table avec le bonus des élites ; au Bestiaire.
  - **XP réelle** gardée : un monstre d'Astrub rapporte 1 200 à 2 100 XP au grade 1 (Incarnam : 50 à 160). Simulation (joueur moyen, sans équipement, Épée de Boisaille) : environ ½ à 1 niveau par partie ; première victoire Cité ≈ 1,5 partie (niveau 11), Souterrains ≈ 1,1 (13), Champs d'Astrub ≈ 1,9 (15), Prairies ≈ 1,6 (17), Donjon des Champs ≈ 3,3 parties (niveau 19, 7 joueurs sur 8 en 12 parties).
- **Zone 2 — Astrub, branche C : la Côte (validé par Enzo : « 2 cartes chemin, 2 cartes plage »)** : débloquée par le Donjon des Champs. Dans Dofus, seules les Calanques et le Château existent à ce niveau : les 2 cartes chemin sont des créations avec de vrais monstres.
  1. **Lisière des Champs** (16, création) : plantes des Champs d'Astrub, Larves Verte et Bleue ; élite Rose Démoniaque d'élite (création).
  2. **Sentier des Dunes** (17, création) : Larves Orange et Jaune, Pichons Orange et Bleu ; élite Pichon Bleu d'élite (création).
  3. **Calanques d'Astrub** (18) : Pichons Orange, Bleu, Blanc, Vert (16-20, vrais sorts × 0,25 : Sable Brûlant, Vaguelette, Bouffée d'Air, Reflux) ; élite Pichon Vert d'élite (création).
  4. **Plage du Château** (19, création à partir de la sous-zone du Château) : les 4 Pichons et le Pichon Kloune (Blag) ; élite Pichon Kloune d'élite (création).
  - **Donjon** : Château Ensablé (7 salles, mini-boss Pichon Kloune d'élite en salle 4, boss **Mob l'Éponge** niveau 20 : 756 PV au grade 5, Dégraissage vol de vie Eau 15-20, Régénération Spontanée 51-75 PV toutes les 8 s ; n'invoque pas, comme dans Dofus). Lisière → Dunes → Calanques et Plage ; le Château demande les 4.
  - **Archimonstres** : Pichtoire (Orange), Pichdourse (Bleu), Pichduitre (Blanc), Pichakoté (Vert), plus ceux des plantes et des Larves sur les cartes chemin.
  - **Clef du Château Ensablé** : vraie recette sans la Truite, la Sauge et l'Orge (pêche et récolte, sans source dans le jeu ; même règle que la Greuvette) : Serviettes de Plage, Nageoires de Compétition, Crème à bronzer, Conques Marines, Viande Faisandée.
  - **Décors d'après les vraies cartes** (Calanques, Château) : sable doré, oyats, coquillages géants roses et bleus, palmiers, rochers de grès ; Lisière : herbe et chemins de sable ; Dunes : sable, mares, palmiers au loin ; Calanques : mer turquoise au fond, rochers sur les côtés ; Plage : la mer borde les côtés ; Château : remparts et tours de sable à étoile et drapeau, arènes d'arches sous le ciel.
  - Simulation (joueur moyen, sans équipement, Épée de Boisaille) : cartes gagnées en 1,6 à 2,9 parties (niveaux 20-21) ; **Château ≈ 5 parties au niveau 21** (≈ 9 au niveau 19), plus dur que le Donjon des Champs (≈ 3) : on meurt surtout dans les salles 3 à 5 (les Pichons à distance), pas contre Mob l'Éponge.
- **Zone 2 — Astrub, branche B (validé par Enzo : « les maps doivent correspondre au donjon »)** : débloquée par le Donjon des Champs. Vraies fiches DofusDB (niveaux 22-30), sorts × 0,25, vraies tables de drop ; tailles comme Incarnam (Bouftons 0,9, Bouftou 1,25, Bouftou Noir 1,3, Chef de Guerre 1,4, Bouftou Royal 1,75).
  - Dans Dofus, les Bouftous ne vivent qu'à **Tainéla**, au **Coin des Bouftous** et au **Coin des Boos** (vérifié sur DofusDB) ; la 4e carte, **Abords de la Cour**, est une création (le Bouftou Noir, qui n'existe que dans le donjon, y apparaît déjà).
  1. **Tainéla** (22) : Bouftou, Boufton Blanc, Boufton Noir, Chef de Guerre Bouftou (charge « Fureur du Bouftou ») ; élite Chef de Guerre d'élite (création). Détours : Carrière et Égouts.
  2. **Coin des Bouftous** (23) : mêmes monstres ; prairie aux arbres d'automne, hutte de chaume, dalles de pierre, enclos ; élite Bouftou d'élite (création). Détour : Forêt d'Astrub.
  3. **Coin des Boos** (24) : mêmes monstres ; ferme au toit orange, tonneaux, enclos ; élite Boufton Noir d'élite (création). Détour : Forêt d'Astrub.
  4. **Abords de la Cour** (26, création) : + Bouftou Noir ; prairie au pied des murs aux tuiles bleues ; élite Bouftou Noir d'élite (création). Détour : Égouts.
  - **Donjon** : Donjon des Bouftous (7 salles, mini-boss Chef de Guerre d'élite en salle 4, boss **Bouftou Royal** niveau 30 : Morsure du Bouftou Royal Feu 31-46, Guérison Bouftou 51-75 PV toutes les 4 s ; n'invoque pas). Décor d'après la vraie Cour : cour fermée de bâtiments aux toits bleus, terre battue, étals, tonneaux, enclos à Bouftous (à la place des trous), cadre de feuillage d'automne sombre. Tainéla → Coin des Bouftous et Coin des Boos → Abords ; le donjon demande les 4.
  - **Détours (validé : « si c'est forêt c'est forêt »)** : la Forêt d'Astrub, la Carrière et les Égouts n'ont pas de carte ; 20 % des salles normales d'une carte deviennent un détour par l'une de ces zones : **décor de la zone et uniquement ses monstres** (Prespic, Sanglier, Écurouille, Milimulou ; Martoa, Sherpoa, Douzdoa, Pikdoa ; Arakne des Égouts, Scélérat, Milirat, Ramane), annonce « Détour par… », le bandeau affiche la zone. Jamais en 1re salle, en salle spéciale, d'élite ou de boss.
  - **Archimonstres** : Boudalf, Boulgourvil, Boufdégou, Bouflet (Bouftous) ; dans les détours : Milipatte, Preskapwal, Sangria (Forêt), Milipussien, Radoutable, Araknay (Égouts). La Carrière n'en a pas (comme dans Dofus).
  - **Clef de la Cour du Bouftou Royal** (clé du Donjon des Bouftous) : vraie recette, fabricable avec les ressources des Bouftous.
  - **Simulation** : sans équipement, le donjon est quasi impossible (les monstres 22-30 ont deux fois plus de PV que ceux de la Côte). Avec la **Panoplie du Bouftou** (vraies recettes, ressources des Bouftous) : cartes en 1,4 à 2 parties, Donjon des Bouftous ≈ 2,5 parties au niveau 30 (6 joueurs sur 8). Comme dans Dofus : on farme les Bouftous, on fabrique la panoplie, puis on fait le donjon.
- **Zone 3 — Amakna : Champ des Ingalsse → Donjon des Tofus (validé par Enzo : option A, « que des vraies zones »)** : débloquée par le Donjon des Bouftous. Dessins des 7 Tofus validés (tailles : Tofukaz 0,8, Tofu et Tofu Noir 0,85, Tofu Mutant 0,95, Tofoune 1,05, Tofu Ventripotent 1,35, Batofu 1,5). Vraies fiches DofusDB (niveaux 32-40), sorts de grade 1 × 0,25, vraies tables de drop.
  - **Champ des Ingalsse** (sous-zone 3, niveau 32, 5 salles) : Tofu, Tofu Noir, Tofoune, Tofukaz, Tofu Mutant ; élite Tofu Mutant d'élite (création) ; archimonstre Tofuldebeu l'Explosif (1 %). Décor d'après les vraies cartes : herbe vert vif, chemins de terre, arbres d'automne, grosses bottes de foin. Pas de détour : les zones voisines ont des monstres pas encore dessinés. Tofu d'Halouine (événement), Ambi Guman (quête), Arakne et Araknelle (niveau 2-20) laissés de côté.
  - **Sorts des Tofus** : Béco (Tofu, Air 13-18 à 1-2 cases), Béco Rosif (Tofu Noir, Eau 17-24), Provocation (Tofukaz, Air 21-25 ; Disparition groupée → invisible par moments), Bigle (Tofu Mutant, Feu 21-26) et Mutation Prolifique (se soigne de 15-20 % tous les 3 tours) ; **Tofoune** : Picota (soigne 11-15 PV l'allié proche le plus blessé, 1 fois par tour) et **Graine Empoisonnée** (pas de dommages directs ; pendant 5 tours, chaque PA dépensé par le Sacrieur coûte 1-2 PV Neutre, valeur réelle) ; **Tofu Ventripotent** (3 PM, n'attaque pas) : Bénédiction du Tofulailler (tous les 2 tours, les alliés à 3 cases gagnent +1 PA → attaques 1,2 fois plus fréquentes, et +25 PV, pendant 4 tours). Non repris : Tofulekan, érosion du Béco Rosif, Fougue Tofuesque, retrait de portée de Bigle, Invocation de Bomberfu (pas de dessin : à proposer).
  - **Donjon des Tofus** (sous-zone 201, niveau 40, 7 salles, mini-boss Tofu Noir d'élite en salle 4) : les 5 Tofus + le Tofu Ventripotent ; les versions « Agressives » ont la même fiche et le même dessin, elles ne sont pas en double. Boss **Batofu** niveau 40 (760-1 100 PV) : Béco de Batofu Air 17-26, Lancer de Tofu Fugace (Neutre 21-30 en ligne jusqu'à 10 cases, toutes les 8 s), Gotame (invoque un Tofu Noir toutes les 20 s, 2 au plus) ; Liberté et le Tofu Fugace invoqué non repris. Décor d'après les vraies cartes du Tofulailler : grange sombre en planches, bannières rouges, lampes suspendues, paille, caisses, tonneaux. **Clef du Donjon des Tofus** (vraie recette, ingrédients obtenables).
  - **Simulation** (joueur moyen, Panoplie du Bouftou complète avec le Marteau) : Champ des Ingalsse au niveau 32 : 8/8 en 3,4 parties ; Donjon des Tofus au niveau 40 : 4/8 en 2,8 parties (nombre de monstres par salle réglé comme le Donjon des Bouftous ; avec 6 à 11 monstres : 3/8). Avec l'Épée de Boisaille à la place du Marteau : 1/8. Monter du niveau 36 au 40 change peu.
- **Amakna, suite : Plaine et Donjon des Scarafeuilles + Bomberfu (validé par Enzo : dessins, tailles, Plaine en parallèle du Champ des Ingalsse, Bomberfu à valeur réelle)** : Enzo veut des donjons durs (« faut que ça soit dur »).
  - **Bomberfu** (0,7) : le Tofu Ventripotent l'invoque 1 fois par tour (2 au plus) ; il court vers le Sacrieur et explose (Détonation du poulailler, Feu 6-10 autour de lui, valeur réelle car une seule fois), puis meurt. Donjon des Tofus avec les Bomberfus : 2/8 en 4 parties (au lieu de 4/8).
  - **Plaine des Scarafeuilles** (sous-zone 170, niveau 36, 5 salles) : Scarafeuilles Rouge, Bleu, Vert, Blanc (vraies résistances : immunisé à un élément — plafonné à 50 % comme toutes les résistances —, faible à un autre à -50 %) ; un coup Neutre 4-5 à 1-2 cases (Scaraforce et Spirit Element) ; élite Scarafeuille Vert d'élite (création) ; 4 archimonstres (Scarouarze, Scarfayss, Scaramel, Scapé). Dragodindes sauvages (niveau 62-70) laissées de côté ; Scarinvoc (Flammèche, pas de dessin) et Elemental Dispersion non repris. Décor : prairie vert vif, larges chemins de terre, arbres d'automne, étals, rochers moussus. Simulation : 8/8 en 2,1 parties au niveau 36.
  - **Donjon des Scarafeuilles** (sous-zone 297, niveau 40, 7 salles, mini-boss Scarafeuille Noir d'élite) : + Scarafeuille Noir (invisible par moments, résiste au Neutre) et Scarafeuille Immature (Scarapoison Terre 10 à distance, Scarasoin : soigne un allié de 7 % de ses PV par tour). Boss **Scarabosse Doré** (1 600-2 400 PV, caractéristiques 280) : Picoti (vol de vie 11-15 par élément, 1 fois par tour ; 2 éléments puis 1 en alternance, choix d'Enzo — 4 à chaque coup dans Dofus), Premiers soins (17-26 PV tous les 3 tours), Naissance (5 Immatures d'un coup ; **une seule fois**, choix d'Enzo : on peut les tuer et il n'en refait pas — dans Dofus, tous les 5 tours). Décor : grotte-jungle sombre, lianes, puits de lumière, fleurs pâles, mousse.
  - **Équilibrage à décider** (simulation, joueur moyen, Panoplie du Bouftou complète, niveau 40) : avec les vraies valeurs, **aucun vainqueur** (ni un bon joueur, ni au niveau 50) ; les 6 salles seules : 5/8. Deux choses bloquent : les 5 Immatures soignent le boss de 7 % chacun toutes les 4 s, et Picoti fait ~170-230 par coup. Scarasoin sans soigner le boss + Picoti sur 2 éléments : 2/8 en 8 parties. **Retenu par Enzo : Naissance une seule fois** (vraies valeurs pour le reste) : 0/8 en simulation, y compris un bon joueur (le pilote automatique ne vise pas les Immatures en premier, un vrai joueur peut faire mieux) ; avec en plus Picoti sur 2 éléments : 1/8, sur 1 élément : 2/8. **Retenu par Enzo : Picoti « 2/1 »** — 2 éléments puis 1 en alternance, les éléments tournant (Eau+Terre, Air, Feu+Eau, Terre…) : 2/8 joueurs moyens en 8 parties, 2/8 bons joueurs en 4,5 parties (dur, comme voulu).
- **Amakna : le Cimetière → Cryptes → Donjon des Squelettes (validé par Enzo : dessins, vampires retravaillés, ordre des cartes)** : nouvelle zone, débloquée par le Donjon des Bouftous. Vraies fiches DofusDB (niveaux 25-40), sorts de grade 1 × 0,25, vraies tables de drop.
  - **Cimetière d'Amakna** (niveau 34, 5 salles, 3 victoires) : Chafer (Coup du Chafer, Terre au contact), Chafer Invisible (invisible par moments), Chafer Fantassin, Rib (Embrochement, Neutre, 3 fois par tour), Tofu Maléfique (Béco Maléfique, vol de vie Air), Kwoan (Frappe Gerbante, Neutre) ; élite Chafer Fantassin d'élite (création) ; 6 archimonstres. Décor : herbe verte, eau croupie turquoise, tombes, arbres d'automne, lanternes.
  - **Cryptes du Cimetière** (niveau 36, 5 salles, 3 victoires, après le Cimetière) : + Vampire (Vol de Vie, Eau) et Maître Vampire (Éventration, Neutre, 2 fois par tour) ; élite Maître Vampire d'élite (création) ; 7 archimonstres. Décor : dalles ocre sombre, murs de pierre, tombes, ossements.
  - **Donjon des Squelettes** (niveau 40, 7 salles, après les deux cartes) : Chafer, Rib, Chafer Invisible, Chafer Fantassin, Chafer Primitif (Curare, Eau, 3 fois par tour) ; mini-boss Chafer Primitif d'élite en salle 4. Boss **Chafer Rōnin** (680-1 000 PV, Force et Intelligence 200) : Bushido (vol de vie Terre 31-35 au contact, valeur réelle), Kikoha (Feu 19-23 en ligne de loin, toutes les 4 s), **Bunshin** : 4 illusions de lui-même toutes les 12 s (4 au plus) — elles ne frappent pas, meurent au premier coup et ne rapportent rien, comme dans Dofus. **Clef du Donjon des Squelettes** (vraie recette : 2 Os Invisibles du Chafer Invisible, 2 Os Surprise du Chafer Fantassin, 2 Côtes du Rib, 2 Viandes Minérales ; retirés car sans source dans le jeu : Mâchoire du Chafer Draugr — monstre absent —, Poisson-Chaton, Trèfle à 5 feuilles, Avoine).
  - Navigation : un objet ou la fontaine ne sont plus jamais posés à moins de la largeur du héros d'un trou (sinon une poche sans issue pouvait se former au bord d'un gouffre).
  - **Simulation** (Panoplie du Bouftou complète avec le Marteau) : Cimetière au niveau 34 : 5/8 en 2,6 parties ; Cryptes au niveau 36 : 4/8 en 3 parties. **Donjon des Squelettes au niveau 40, sur 20 parties : joueur moyen 0/8, bon joueur 4/8 en 15 parties** (Donjon des Tofus, mêmes conditions : 3/8 joueurs moyens en 9 parties). On meurt surtout en salles 2 à 4 (beaucoup de Chafers solides, mini-boss), rarement contre le Rōnin. Option chiffrée, **non appliquée** : moins de monstres par salle (4 à 8 au lieu de 5 à 10) → 2/8 joueurs moyens en 7,5 parties, 5/8 bons joueurs en 12 parties.
- **Maison Fantôme (validée par Enzo : dessins et tailles)** : donjon niveau 40 de la zone du Cimetière, ouvert après les Cryptes (il en partage les monstres). 7 salles : Tofu Maléfique, Vampire, Kwoan, **Gargrouille** (Gargouilli : Air au contact ; 50 % de résistance partout), **Boostache Prépubère** (Boorrade : Neutre au contact ; Timidité → invisible par moments ; Caresse Effrayante : soigne un allié de 21-30 PV toutes les 4 s, valeur réelle) ; mini-boss Gargrouille d'élite en salle 4 ; archimonstre Boostif l'Affamé. Décor d'après les vraies cartes : maison hantée sombre, lumière verte, caisses, tonneaux, ossements.
  - Boss **Boostache** (820-1 200 PV, caractéristiques 160, résiste au Neutre, à l'Eau et à l'Air), valeurs réelles : Le Dentiste (vol de vie Air 31-40 au contact, +30 % d'érosion), Frayeurs (toutes les 12 s : repousse de 3 cases et -2 PA), Esprit empêtrant (toutes les 12 s : un **Ashi-magari**, 150 PV, dont l'Enchevêtrement immobilise 1 tour = 4 s sans dommages), L'Enfer des Zombies (toutes les 4 s : relève le dernier allié mort avec toute sa vie ; il ne rapporte rien une 2e fois). **Clef de la Maison Fantôme** (vraie recette : 2 Cuirs de Gargrouille, 2 Œils de Kwoan, 2 Sangs de Vampire, 2 Ailes du Tofu Maléfique, 2 Viandes Minérales ; Poisson-Chaton, Trèfle à 5 feuilles et Avoine retirés, sans source dans le jeu). Le Boostache lâche sa vraie panoplie (Amulette, Anneau, Cape, Ceinture du Boostache).
  - Simulation (Panoplie du Bouftou complète, niveau 40, 20 parties) : joueur moyen 0/8, bon joueur 5/8 en 9 parties — la même difficulté que le Donjon des Squelettes (difficulté gardée, décision d'Enzo).
- **Niveaux 41-50 (validés par Enzo : « Oui on continue arbre + dj + sort + équipements », « C'est bon pour les bworks »)** : deux zones, vraies fiches DofusDB (niveaux 42-50), sorts de grade 1 × 0,25, vraies tables de drop, équipement de zone 41-50.
  - **Amakna : les Kwaks** (après le Donjon des Tofus) : **Montagne des Craqueleurs** (carte niveau 45, 3 victoires) : Kwaks et Kwakeres de Vent, de Flamme, de Glace et de Terre (Éventrement Feu 21-30 / Griffes Acérées Feu 26-35 au contact : dans Dofus tous les Kwaks frappent en Feu ; 75 % de résistance à leur élément, 100 % pour les Kwakeres, faibles à l'élément opposé), élite Kwakere de Flamme d'élite, 4 archimonstres (Kwakamole, Kwakwatique, Kwaké, Kwakolak). Le Cochon de Lait n'est pas repris. **Nid du Kwakwa** (donjon niveau 50) : Kwaks, Kwakeres, Bwaks (Bwakikui : Feu 9-13 à distance) ; mini-boss Kwakere de Terre d'élite. Familiers de la zone : les 4 Bwaks (Air, Eau, Feu, Terre). **Clef du Nid du Kwakwa** (12017).
  - Boss **Kwakwa** (1 100-1 600 PV, caractéristiques 300, 80 % de résistance partout, plafonnée à 50 %), valeurs réelles : Kwabolition (7-9 Feu, Eau, Terre et Air d'un coup au contact, toutes les 4 s), Kwakoukas Kwayal (Neutre 11-15 en ligne de loin et **repousse de 4 cases**, toutes les 6 s), Kwarmée Kwayal (invoque les 4 Bwaks d'un coup toutes les 20 s), Kwaristocratie (+2 PA → plus rapide 4 s toutes les 16 s). Non repris : Wakpot Kwayal, les +30 Puissance. Il lâche le **Dofus Cacao** (très rare, comme les autres Dofus).
  - **Amakna : les Bworks** (après la Maison Fantôme) : **Campement des Bworks** (carte niveau 44), **Village des Bworks** (carte niveau 47), **Donjon des Bworks** (niveau 50, après les deux cartes). Bwork (Éventration : Neutre 31-50 au contact, 2 fois par tour), Bwork Mage (Éclair en Série : Feu 5-9 à distance ; invoque un Tofu Maléfique tous les 6 tours), Bwork Archer (Flèche Trouveuse : Air 16-20 en ligne de loin) ; élites Bwork d'élite, Bwork Mage d'élite, mini-boss Bwork Archer d'élite ; archimonstres Bworkasse, Barchwork, Bwormage. **Clef du Donjon des Bworks** (8135).
  - Boss **Bworkette** (1 600-2 300 PV, Force 240, Intelligence 380, Agilité 140), valeurs réelles : Mot Croisé (Feu 15-18 à distance toutes les 2 s environ, et soin 15-18 toutes les 4 s), Charge (Terre 21-40 : elle fonce sur le héros toutes les 8 s), **Reconstitution Bwork** (se soigne de 50 % de ses PV max une fois entamée sous 60 % ; **une seule fois par combat, choix d'Enzo** — dans Dofus tous les 6 tours). Abolissement (Neutre 200) ne touche que les invocations : sans objet. Rage non reprise.
  - Décors d'après les vraies cartes : falaises beiges et herbe vive (Craqueleurs), dalles au-dessus d'une mer de nuages (Nid), herbe sèche ocre, roches claires, huttes et arbres morts (Campement, Village), souterrain sombre aux dalles ocre (Donjon des Bworks).
  - **Simulation** (8 joueurs, 20 parties) : Craqueleurs au niveau 45 (Panoplie du Bouftou) : joueur moyen 4/8, bon joueur 7/8 ; Campement au niveau 45 : 7/8 et 8/8 ; Village au niveau 47 : 7/8 et 5/8. Donjons au niveau 50 avec la **Panoplie du Kwak de Flammes** (niveau 42, fabriquée avec les ressources des Kwaks) : **Nid du Kwakwa : joueur moyen 2/8, bon joueur 5/8** (comme les donjons niveau 40). **Donjon des Bworks : 0/8 et 0/8** — les joueurs atteignent la Bworkette et meurent contre elle : c'est Reconstitution Bwork (valeur réelle) qui la rend imbattable. Options chiffrées : sans Reconstitution → 2/8 et 5/8 ; Reconstitution à 25 % → 0/8 et 2/8 ; Mot Croisé ralenti seul → 0/8. **Choix d'Enzo : Reconstitution une seule fois par combat → joueur moyen 1/8, bon joueur 4/8** (comme le Donjon des Squelettes).
- **Niveaux 51-60 : les Wabbits (validés par Enzo : dessins, « 2 donjons par tranche », Wabbits puis Clos des Blops)** : zone ouverte par le Nid du Kwakwa **ou** le Donjon des Bworks. Vraies fiches DofusDB (niveaux 40-60), sorts de grade 1 × 0,25, vraies tables de drop, équipement de zone 51-60.
  - **Île de la Cawotte** (carte niveau 52) : Wabbit (Fwappe : Terre au contact ; Fawandole : se soigne de 20 % tous les 2 tours), Black Wabbit (Wabeha : Air en ligne de loin), Tiwabbit, Black Tiwabbit (Petit Wabehameha : Feu en ligne), Tiwabbit Kiafin (Vent de panique : Neutre autour de lui) ; élite Wabbit d'élite. **Îlot de la Couronne** (carte niveau 55) : Wabbits, Black Wabbits, **Wo Wabbit** (Ventwoboom : Neutre au contact et repousse de 6 cases ; invoque des Tiwabbits), **Grand Pa Wabbit** (Cawotte Explosive : Feu à distance ; Cawotte Vitaminée : soigne un allié) ; élite Wo Wabbit d'élite. 7 archimonstres. Familier : Wabbit.
  - **Château du Wa Wabbit** (donjon niveau 60, après les deux cartes, **Clef du Château du Wa Wabbit** 14464) : tous les Wabbits, mini-boss Grand Pa Wabbit d'élite. Boss **Wa Wabbit** (2 600-3 300 PV, caractéristiques 210), valeurs réelles : WaWabehameha (Neutre 21-30 en ligne jusqu'à 11 cases, toutes les 4 s environ), Abwutissement (Eau 31-35 autour de lui, annoncé au sol, toutes les 12 s), **Awmuwe Woyale** (8 s toutes les 20 s : dommages subis × 0,7 et bouclier de 120 PV). Cawotte Woyale (invocation sans sort) et les retraits de Puissance non repris. Il lâche le **Dofus Cawotte** (très rare).
  - Décors d'après les vraies cartes : îlots d'herbe vive sur une mer turquoise, **carottes géantes**, arbres d'automne (Cawotte) ; **bannières orange** des Wabbits, rochers, cornes d'ivoire (Couronne) ; caverne aux dalles orange et murs rouges (Château).
  - **Sorts du Sacrieur** : **Dissolution** (niveau 55 : vol de vie Eau 16-19 sur un groupe, jusqu'à 5 cases ; la Fuite retirée n'a pas d'équivalent) et **Désolation** (niveau 60 : vol de vie Air 19-22 sur un groupe, jusqu'à 4 cases, ralentit les touchés 4 s = -3 PM).
- **Clés** : 3 clés génériques gratuites par jour, valables sur tout donjon déjà débloqué ; 1 clé = 1 entrée, perdue en cas de défaite ; clés en plus par drop ou par craft (clés **propres à un donjon**, vraies recettes de Dofus, ex. Clef de la Crypte de Kardorim, avec les ressources de la zone). **Tant qu'un donjon n'a jamais été vaincu, les tentatives sont gratuites** (validé : pas de blocage de la progression).
- **Difficulté** : jamais adaptée au joueur (§7.6) ; une zone trop haute reste très difficile, une zone trop basse devient du farm.

### 8.3 quater Retours d'Enzo (points 1 à 11, validés)
- **Sorts chacun leur tour** : parmi les sorts prêts, celui lancé il y a le plus longtemps part en premier (avant : toujours le 1er de la liste ; une Stase lancée 1 fois en 92 s → 10 fois).
- **Monstres solides** : on ne les pousse plus en marchant dedans, on les contourne ; leur contact fait de **petits dégâts** (10 % d'un de leurs coups, au plus toutes les 1,5 s par monstre) et repousse un peu le Sacrieur.
- **Poussée** : le recul d'un coup d'arme reste (sensation) mais ne fait plus de dommages de poussée ; seules les vraies poussées en font (Hostilité, Reflux…).
- **Menus** : Camp = personnage, niveau et XP en haut, gros bouton **JOUER** au centre, dernière partie (« Rejouer ») dessous ; 4 onglets en bas (Personnage, Équipement, Grimoire, Bestiaire) ; les records passent dans la fiche. JOUER → « Où aller ? » (zones, progression, cadenas) → une zone : ses cartes (terminée / disponible / verrouillée, bouton Jouer) puis son donjon (niveau, boss, clés, Entrer). Chaque branche est une zone : Incarnam ; Astrub : les Champs, la Côte, les Bouftous ; Amakna : les Tofus, les Scarafeuilles. Le camp, les zones, la fiche et l'inventaire tiennent sans défiler (390 × 844).
- **Progression** : dans les zones à une ou deux cartes (Champ des Ingalsse, Plaine des Scarafeuilles), une carte est terminée après **3 victoires** (« 1/3 »).
- **Équilibrage (choix d'Enzo : option A, on garde dur)** : les trois premiers changements rendent le début bien plus dur (Champs d'Incarnam au niveau 1 : 8/8 joueurs en 2 parties avant ; après : de 1 à 4 sur 8 en 4 à 7 parties). Pas de compensation.
- **Pause** (demande d'Enzo) : changer l'ordre des sorts en combat (toucher deux sorts), voir le butin et l'XP de la partie, quitter le combat (comme une défaite, à confirmer).

### 8.3 ter Salles variées (validé par Enzo : « les 3 me vont »)
- **Formes de salle** (îles d'Incarnam, tirées à chaque partie, sans doublon au milieu, parfois retournées) : plaine, pont de corde (bande de vide), île trouée, arène (coins dans le vide), couloir (île étroite), archipel (2 bandes, 2 ponts), gouffre (grand trou central). 1re salle simple (plaine, trous ou gouffre), salle de l'élite en plaine ou arène. Le vide est un obstacle : on le contourne ; les monstres passent par les ponts. Décors posés au hasard (jamais dans le vide ni sur les passages, pas trois fois le même objet).
- **Salles spéciales** : une seule porte, et chaque salle derrière est tirée au hasard (hors 1re salle, élite et boss) : embuscade 12 %, vagues 12 %, fontaine 10 %, **coffre 2 % (très rare, demandé par Enzo)**, sinon salle normale. Aussi dans la Crypte, qui garde ses murs. Choix entre plusieurs portes et carte à embranchements : non retenus (Enzo veut une seule porte).
  - **Embuscade** : salle vide 1,6 s, puis les monstres surgissent autour du héros, un par un (0,3 s d'écart).
  - **Coffre gardé** : un gardien (monstre de la carte, grade 5, PV et XP ×2) ; le coffre s'ouvre quand la salle est vidée : butin de 3 monstres de la carte comme une élite.
  - **Fontaine** : moins de monstres ; près de l'eau, +6 % des PV max par seconde, au plus 50 % par salle.
  - **Vagues** : tenir 20 s (2 monstres au départ, renfort toutes les 3 s, 4 en même temps au plus) ; à la fin les survivants s'enfuient (sans butin).
- **Pièges de carte** (pas dans les Champs, la salle de l'élite ni la Crypte), dégâts en part des PV max :
  - Pâturages : **troupeau** annoncé 1,3 s en bande sur la ligne du héros, puis traverse la salle (10 %, blesse aussi les monstres), toutes les 8-11 s.
  - Forêt : 3 **feux follets** qui explosent 0,8 s après qu'on s'en approche (8 %, rayon 90), réapparaissent 7 s plus tard.
  - Cimetière : **mains de squelette** sous le héros toutes les 5-7 s, annoncées 1 s (4 % et agrippé 1,1 s).
- Simulation (joueurs moyens) : Champs ≈ 3 parties, Pâturages ≈ 4, Forêt ≈ 1-2, Cimetière ≈ 1-2 (Épée de Boisaille, niveau 7). Les monstres qui restaient coincés derrière un obstacle le contournent désormais : la Crypte devient plus dure (≈ 25-35 % de victoires en 12 parties au niveau 10 avec l'Épée, contre ≈ 55 % avant) — Enzo garde cette difficulté.

### 8.3 bis Idées validées en stock (plus tard)
- **Boss Rush** : mini-jeu uniquement avec des boss de donjons ; 6 salles au plus, chacune avec 1 boss et ses sbires. **Décision d'Enzo : il commence avec les donjons de niveau 100** (pas de Boss Rush pour les tranches 1-40) ; à faire quand le jeu atteindra ce niveau.
- **Farm (validé par Enzo : « les 2 », vitesse ×4, expédition sans XP un peu sous le drop normal, plus un farm instantané limité par jour)** — bouton **Farm** sur chaque carte terminée (et « Farm auto » sur les donjons vaincus) :
  - **Farm auto** : le Sacrieur joue tout seul (le pilote des simulations), les parties s'enchaînent sur la même carte, cartes de bonus choisies automatiquement ; vitesse **×1, ×2, ×4** ; récompenses normales (XP, butin) ; s'arrête à la première défaite, faute de clé (donjon) ou avec **Stop** ; bandeau (parties, objets, XP) et bilan cumulé à la fin.
  - **Farm instantané** : le butin d'une partie complète de la carte, tout de suite, **sans XP** ; **5 par jour et par zone** (choix d'Enzo).
  - **Expédition** : le Sacrieur part farmer une carte, même téléphone fermé ; au retour, le butin des parties qu'il aurait faites (1 partie ≈ 4 s par monstre), **10 %** du butin d'une vraie partie (choix d'Enzo ; 80 % donnait 350 équipements en 8 h), **8 h comptées au plus**, **sans XP**, une expédition à la fois ; **bouton « Expédition » au camp** (choix de la carte terminée, puis durée et « Récupérer »). Mesuré à la Cité : 1 h ≈ 6 équipements et 23 ressources ; 8 h ≈ 43 équipements et 160 ressources.

- **Bestiaire, « Tout récupérer » (demandé par Enzo)** : un bouton en haut du Bestiaire récupère d'un coup tous les paliers prêts, de tous les monstres.

### 8.4 Raretés
**Commun → Rare → Épique → Légendaire → Mythique.**
- Chaque rang relève les fourchettes de stats (**≈ +15 % par rang**, modéré : le niveau de l'objet doit toujours compter plus que sa rareté).
- Légendaire et Mythique ajoutent **une ligne bonus** (effet spécial, ou PA/PM rare).

**Fait (étape 8a, validé par Enzo) :**
- Fourchettes ×1,15 par rang (arrondi, jamais en baisse ; les malus ne bougent pas). Couleur de cadre par rang.
- Ligne bonus Légendaire tirée au hasard selon le niveau de l'objet (Vitalité, Puissance, Sagesse, % Critique, Soins, Dommages, Initiative, Prospection, Tacle, Fuite, % Résistances, rarement Portée ou Invocation). Mythique : la ligne ×1,5, ou 10 % de chances de devenir +1 PA ou +1 PM (gardés rares, sans limite de niveau).
- Provenance : monstres 95 % Commun / 5 % Rare ; boss 85 % / 12 % Rare / 3 % Épique ; craft critique (Rare) 3 % + 0,2 % par niveau d'Artisan au-dessus de la recette, 20 % au plus.

---

### 8.5 Inventaire : recherche, Encyclopédie, favoris, verrou (validé)
- **Rangement (demandé par Enzo)** : l'Encyclopédie est rangée avec le **Bestiaire** (onglets Bestiaire | Encyclopédie, triée du plus bas niveau au plus haut) ; l'inventaire garde Équipements et Ressources. Sur la fiche d'un objet, la panoplie n'est plus qu'une ligne cliquable (« Panoplie du Jeune Aventurier 5/6 › ») qui ouvre la panoplie dans l'Encyclopédie.
- **Barre de recherche** dans l'Inventaire (Équipements, Ressources, Encyclopédie) et à l'Atelier :
  - sans accents ni majuscules, tous les mots doivent correspondre ;
  - nom, type, panoplie, ingrédients, monstres qui le lâchent ;
  - abréviations de joueur de Dofus (fo, ine, cha, agi, vi, sa, pa, pm, po, cc, do feu, ré terre…) ;
  - niveau (« 20 », « <15 », « 10-30 ») et valeur d'une stat (« agi>10 »).
- **Filtres** en menus : emplacement, stat (tri automatique par sa valeur, affichée sur chaque case), panoplie, niveau min / max, interrupteurs (favoris, verrouillés, équipable maintenant, nouveaux, portés, fabricable, il manque 1 ingrédient…). Gardés pendant la session.
- **Encyclopédie** : tout l'équipement du jeu (possédé ou non) et toutes les panoplies (stats totales au maximum + bonus complet), avec la provenance (fabrication, boss, monstre et chance réelle en jeu, butin de région).
- **Liens** : « Voir la panoplie », « Voir la recette », « Recettes qui l'utilisent » (Atelier filtré).
- **Favori** : toujours en tête des listes. **Verrou** : une ressource verrouillée n'est jamais utilisée par l'Atelier ; un équipement verrouillé sera protégé de la fusion et du brisage (étape 8).

## 9. Artisanat

### 9.1 Métier unique : Artisan
- Un seul métier, **niveaux 1 à 200**, qui fabrique **tous** les équipements.
- Les recettes se débloquent avec le niveau du métier ; chaque fabrication donne de l'XP de métier.
- Fabrication : surtout du **Commun**, avec une chance de **craft critique** (Rare) qui augmente avec le niveau d'Artisan.

**Fait à l'étape 7 :**
- **Vraies recettes de Dofus 3** (DofusDB) : 105 recettes, toutes faisables avec ce qui tombe dans le jeu (donjon + butin de région), y compris les **ressources intermédiaires** (Planche Agglomérée, Ferrite…). Panoplie de Kardorim fabricable ; 7 autres panoplies d'Incarnam ; Aventurier sauf l'Anneau (il demande des Graines de Sésame, introuvables pour l'instant).
- Pas encore d'armes, de potions, de nourriture ni de cosmétiques.
- **Niveau d'Artisan ≥ niveau de l'objet**.
- XP par fabrication : 20 + 10 × niveau de la recette, en baisse de 15 % par niveau au-delà de 10 niveaux d'écart. XP du niveau n → n+1 : ≈ 8 × n^1,5.
- **Atelier au camp** : onglets « Disponibles » et « Toutes les recettes », ingrédients possédés / requis, fourchettes de stats, bouton ×max.
- L'objet fabriqué est **Commun**, avec des jets aléatoires dans ses vraies fourchettes. Le craft critique arrive à l'étape 8.

### 9.2 Fusion (fait monter le **plafond** : la rareté)
- Commun → Rare : **3 objets identiques**.
- Au-delà : **1 objet + 2 objets de la même panoplie et du même rang**.
- Légendaire et Mythique : + **une ressource du boss**.

- **Fait (8a)** : hors panoplie, 3 identiques à chaque rang (validé). Légendaire : 3 Crânes de Kardorim, Mythique : 10 (ressource du boss de la région). Le jet garde sa qualité (même position dans la nouvelle fourchette, dépassement conservé) ; l'objet principal garde son uid et reste équipé. Objets portés ou verrouillés jamais sacrifiés. XP d'Artisan.

- **Simplifiée (choix d'Enzo)** : jusqu'à **Légendaire**, 3 objets du **même emplacement**, du **même niveau** (ajouté par Enzo) et du même rang (3 anneaux Communs niveau 25 → l'anneau choisi devient Rare) ; les 2 objets sacrifiés sont **choisis d'office** (les moins bons jets), jamais portés, verrouillés ou favoris. Vers **Mythique** seulement : l'ancienne règle (3 identiques hors panoplie, ou 1 objet + 2 pièces de sa panoplie). Raison : 130 à 290 objets différents par tranche de niveaux, il fallait ≈ 50 à 75 équipements obtenus pour réunir 3 objets identiques ; avec emplacement + niveau : ≈ 20 (simulation par tranche de niveaux).
- **Où (choix d'Enzo)** : la Fusion et le Brisage ne sont plus des onglets de l'Artisanat (qui garde Fabrication et Forgemagie) : ils se font depuis **Équipement**, soit par les boutons « Fusionner » et « Briser » de la fiche d'un objet, soit par les petits boutons « Fusion » et « Briser » au-dessus de la grille, puis en touchant directement les objets (ceux qui ne peuvent pas l'être sont grisés ; on peut en briser plusieurs d'un coup).

### 9.3 Brisage
Casser un objet → **runes** (Fo, Ine, Vi, PA…).
- **Fait (8a)** : les 95 vraies runes de Dofus 3 (DofusDB, trois tailles : simple, Pa, Ra) avec leurs icônes. Poids par point de stat de Dofus (Fo 1, Vi 0,2, Sa 3, PA 100, PM 90, PO 51, Do 20, Cri 10…). Poids rendu par ligne = (3 × valeur × poids × niveau / 200 + 1) × (1 + 10 % par rang), converti en grosses runes d'abord, le reste en chance d'une petite rune. Aperçu exact avant de confirmer ; objets portés ou verrouillés protégés.

- **Épurer et brisage automatique (choix d'Enzo)** : bouton « Épurer » dans Équipement : briser d'un coup tout l'équipement sous un niveau choisi ; case « Brisage auto » : chaque équipement obtenu (partie, farm, expédition) sous ce niveau est brisé en runes à l'arrivée. Le seuil reste toujours **au moins 15 niveaux sous le personnage** (donc à partir du niveau 17). Tous les emplacements ; jamais les objets portés, verrouillés, favoris, familiers et Dofus. Le bilan indique « Brisage auto : N objets → R runes ».

### 9.4 Forgemagie (personnalise **sous** le plafond)
- Vraies règles Dofus : runes, **puits**, réussite / échec neutre / échec critique, **exos**.
- **Plus l'objet est rare, plus son puits est grand.**
- **Fait (8b, chiffres à valider par Enzo — Ankama ne publie pas ses formules)** : onglet Forgemagie de l'Atelier, une rune à la fois.
  - Succès critique : la stat monte, rien n'est perdu. Succès neutre : la stat monte, d'autres lignes perdent autant de poids que la rune. Échec critique : rien ne monte, des lignes perdent ce poids… qui va dans le **puits**. Le puits paie les pertes suivantes avant les lignes. La ligne de rareté (Légendaire, Mythique) n'est jamais touchée.
  - Chances (critique / neutre / échec) : sous le jet max 50 / 30 / 20 % ; overmax 15 / 25 / 60 % ; exo 10 / 15 / 75 % ; exo Portée 2 / 2 / 96 % ; exo PA ou PM 1 / 1 / 98 % (à tout niveau, +1 au plus).
  - Puits maximum (poids) : (20 + 2 × niveau) × (1 + 50 % par rang). Overmax d'une ligne (poids) : (5 + niveau / 5) × (1 + 25 % par rang), au moins 1 point. Une seule ligne exo par objet, plafonnée comme l'overmax.
  - Chaque rune rapporte un peu d'XP d'Artisan ; briser un objet forgemagé rend aussi les runes de son exo.

### 9.4 bis Kamas (choix d'Enzo : pour l'instant seulement la forgemagie)
- Gagnés sur chaque monstre vaincu : niveau + 3 kamas ; élite et archimonstre ×5 ; boss ×20 (seulement en cas de victoire). Farm instantané : comme une partie ; expédition : au même rendement que le butin (10 %).
- **Chaque rune posée en forgemagie se paie** : poids de la rune × (niveau de l'objet + 5). Ex. objet niveau 8 : Rune Fo 13 K, Rune PA 1 300 K.
- Réglage (simulation, 40 parties par carte) : une partie paie ≈ **8 à 11 runes Pa** (poids 3) sur un objet de son niveau, des Champs (≈ 180 K) à la Couronne (≈ 1 800 K).
- DofusDB ne publie pas les kamas lâchés par les monstres : montants adaptés, pas officiels. Affichés au camp (à côté du niveau), dans la Forgemagie (solde et prix sous chaque rune) et dans le bilan.

### 9.5 Le dilemme
Un objet en double : **le briser** (runes de forgemagie) **ou le garder pour une fusion**.

---

## 10. Ordre de travail

Chaque étape est validée par Enzo avant de passer à la suivante.

1. ✅ **Test de style** : salle portrait de la Crypte de Kardorim, Sacrieur « D2 » (tenue officielle), Chafers, interface.
2. ✅ **Moteur de combat** (validé : Sacrieur niv 10 équipé, Chafers aux grades réels, sans soin entre les salles) : monde à pas fixe testé, formule de dégâts Dofus, arme automatique en arc,
   IA des 4 Chafers (contact, furtif, lancier, brute) avec attaques annoncées au sol, glissement autour des obstacles,
   salles enchaînées et grille de sortie, défaite / pause / fin de démo, personnages articulés
   (marche, coup, préparation, frappe, recul, chute, effondrement en tas d'os). Sorts verrouillés jusqu'à l'étape 3.
3. ✅ **Sorts et boss** (validé, avec passifs et écran épuré) : 6 sorts du Sacrieur niv 10 (données DofusDB traduites, 1 tour = 4 s, vol de vie), Souffrance, Mutilation et Coagulation, cartes entre les salles (sort, amélioration, bonus) avec ordre de priorité, boss Kardorim (Casse-crâne, Craquement d'Os, Appel de Kardorib).
4. ✅ **Structure d'un run** (validé) : mini-boss en salle 5 (Sergent Chafer d'élite : grade 5, PV ×2,5, charge annoncée ; une carte de plus), camp (écran d'accueil, records), bilan de fin de partie, sauvegarde locale, règle de mort préparée (XP et ressources gardées, butin du boss perdu).
5. ✅ **Stats, niveaux, répartition des points** (validé : Crypte finie en 3 min 33, niveau 11 en une partie) : fiche complète de Dofus (§6.1), vraies données DofusDB des monstres (résistances, tacle, esquive, XP), XP par monstre gardée même en cas de défaite, table d'XP (§7.7), 5 points par niveau avec les paliers du Sacrieur, écran Caractéristiques au camp (remise à zéro gratuite), XP et montée de niveau dans le bilan.
6. 🔶 **Drop (avec butin de région), inventaire, équipement, panoplies** (à valider en jeu) : vraies tables de la Crypte et butin d'Incarnam (34 objets, icônes officielles), jets aléatoires, niveau requis, bonus de panoplie, inventaire au camp (Sacrieur et ses cases, fiche d'objet avec comparaison), butin qui vole vers le Sacrieur, butin au bilan (celui du boss perdu en cas de défaite). Départ : Panoplie du Jeune Aventurier sans le Chapeau (simulation : difficulté équivalente au calibrage).
7. 🔶 **Artisan** (à valider en jeu) : atelier au camp, 105 vraies recettes, ressources intermédiaires, XP et niveaux de métier sauvegardés (§9.1).
8. 🔶 **Raretés, fusion, brisage** (livraison 8a, à valider en jeu) ; **forgemagie** (livraison 8b).
9. 🔶 **Zones, cartes de farm, arbre des donjons** (§8.3) : **9a fait** (à valider en jeu) — onglet Donjons (arbre d'Incarnam), cartes de 5 salles, carte des Champs (Tofu Chimérique, Pissenlit Miroitant, Rose Vaporeuse, élite Tournesol Nébuleux : vraies fiches et tables de drop DofusDB, dessins validés), décor de prairie d'Incarnam, sorts posés à distance (Pissenlit, Tournesol), départ niveau 1 à mains nues (sauvegarde v5 : tout le monde repart de zéro, couleurs gardées). Simulation : un niveau 1 à mains nues atteint la salle 3-4 dès la 1re partie et termine les Champs vers la 3e partie. ; **9b fait** (à valider en jeu) — Pâturages (Boufton Pâlichon, Boufton Orageux, Bouftou Nuageux, élite Bouftor Éthéré avec sa charge « Fureur du Bouftou »), Forêt (Chakrobat, Tigrimas, élite Ronronchon), Cimetière (Chafers Débutant, Furtif, Éclaireur, Piquier, élite Chafer Piquier d'élite — création) : vraies fiches, sorts (× 0,25) et tables de drop DofusDB, dessins validés ; décors d'après les vraies cartes (dallage et buissons rouges, cornes d'ivoire et pétales, tombes, arbres morts, lanternes et brume). Les Champs ouvrent les 3 cartes, la Crypte demande les 4. Ronronchon : Invocation de Feu de Joie (toutes les 20 s, 2 au plus) ; Tigrimas : Reconstitution Céleste (toute sa vie, une fois par combat, sous 30 %). Simulation (joueur moyen, sans équipement) : Pâturages ≈ 5 parties au niveau 4, Forêt 1-2 parties ; le Cimetière (vrais Chafers) est impossible à mains nues mais gagné dès la 1re-2e partie au niveau 7 avec l'Épée de Boisaille (fabriquée : 3 Plumes Chimériques des Tofus + 3 Bois de Frêne des chats de la Forêt). ; 9c clés.
10. ✅ 9c clés et 8b forgemagie (à valider en jeu) ; ensuite expédition hors ligne, Boss Rush (§8.3 bis).
10 bis. 🔶 **Astrub, branches A, B et C** (§8.3, à valider en jeu) : 12 cartes, Donjon des Champs, Château Ensablé, Donjon des Bouftous, archimonstres, bestiaire.
10 ter. 🔶 **Amakna : Champ des Ingalsse et Donjon des Tofus** (§8.3, à valider en jeu). 10 quater. 🔶 **Niveaux 41-50 : Kwaks (Craqueleurs, Nid du Kwakwa) et Bworks (Campement, Village, Donjon)** (§8.3, à valider en jeu ; Reconstitution Bwork une fois par combat). Ensuite (option A) : Donjon des Scarafeuilles, Donjon des Squelettes, Maison Fantôme, Cache de Kankreblath.
11. Donjons suivants par tranches de niveaux — **règle validée par Enzo : 2 donjons par tranche de 10 niveaux** (« ça laisse un choix, mais on va jusqu'au 200 rapidement »), chacun avec ses cartes de farm. Tranche 51-60 : Château du Wa Wabbit (Île de la Cawotte, Îlot de la Couronne) en premier ; le 2e et les paires suivantes sont des propositions, à valider tranche par tranche. Ancien libellé : Donjons suivants par tranches de niveaux, finitions, installation sur l'appareil.

Fait en plus (retours d'Enzo) : onglets du camp en bas (Caractéristiques + Apparence, Équipements = Inventaire + Artisanat, place pour Grimoire, Donjons…) ; recherche/filtres/Encyclopédie/favoris/verrou (§8.5) ; vraies armes de Dofus 3 (24 armes niveau 1 à 12, toutes fabricables ; cadence = 1,9 × 4 / PA, dommages × 0,56 ; icône officielle tenue en main ; mains nues 1 à 5 Neutre, valeur non confirmée par une source) ; drop d'équipement réduit (monstres ×0,02, région ÷10, boss moitié du taux réel) ; Souffrance +5 % de dégâts finaux par charge, halo visible.

---

## Annexe A — Les 126 donjons (source : DofusDB)

Triés par niveau recommandé. « Saisonnier » = événement (Nowel, Halouine…), inclusion à décider.

| # | Niv. | Donjon | Boss | Note |
|---|---|---|---|---|
| 1 | 10 | Crypte de Kardorim | Kardorim |  |
| 2 | 20 | Château Ensablé | Mob l'Éponge |  |
| 3 | 20 | Grange du Tournesol Affamé | Tournesol Affamé |  |
| 4 | 30 | Cour du Bouftou Royal | Bouftou Royal |  |
| 5 | 40 | Akadémie des Gobs | Directeur Grunob |  |
| 6 | 40 | Cache de Kankreblath | Kankreblath |  |
| 7 | 40 | Donjon des Scarafeuilles | Scarabosse Doré |  |
| 8 | 40 | Donjon des Squelettes | Chafer Rōnin |  |
| 9 | 40 | Donjon des Tofus | Batofu |  |
| 10 | 40 | Maison Fantôme | Boostache |  |
| 11 | 50 | Donjon de Nowel | Sapik | saisonnier |
| 12 | 50 | Donjon des Bworks | Bworkette |  |
| 13 | 50 | Donjon des Forgerons | Coffre des Forgerons |  |
| 14 | 50 | Donjon des Larves | Shin Larve |  |
| 15 | 50 | Grotte Hesque | Corailleur Magistral |  |
| 16 | 50 | Nid du Kwakwa | Kwakwa |  |
| 17 | 50 | Refuge sylvestre | Rakoopeur |  |
| 18 | 60 | Château du Wa Wabbit | Wa Wabbit |  |
| 19 | 60 | Clos des Blops | Blop Coco Royal, Blop Indigo Royal, Blop Reinette Royal, Blop Griotte Royal |  |
| 20 | 60 | Fonderie des Waddicts | Mawabouaino | saisonnier |
| 21 | 60 | Gelaxième Dimension | Gelée Royale Bleuet, Gelée Royale Citron, Gelée Royale Fraise, Gelée Royale Menthe |  |
| 22 | 60 | Village Kanniboul | Kanniboul Ebil |  |
| 23 | 70 | Cale de l'Arche d'Otomaï | Gourlo le Terrible |  |
| 24 | 70 | Laboratoire de Brumen Tinctorias | Nelween |  |
| 25 | 70 | Pitons Rocheux des Craqueleurs | Craqueleur Légendaire |  |
| 26 | 70 | Épreuve de Draegnerys | Draegnerys |  |
| 27 | 80 | Cimetière des Mastodontes | Mantiscore |  |
| 28 | 80 | Terrier du Wa Wabbit | Wa Wobot |  |
| 29 | 90 | Antre de la Reine Nyée | Reine Nyée |  |
| 30 | 90 | Bateau du Chouque | Le Chouque |  |
| 31 | 90 | Chapiteau des Magik Riktus | Choudini |  |
| 32 | 90 | Domaine Ancestral | Abraknyde Ancestral |  |
| 33 | 100 | Antre du Dragon Cochon | Dragon Cochon |  |
| 34 | 100 | Arbre de Moon | Moon |  |
| 35 | 100 | Caverne du Koulosse | Koulosse |  |
| 36 | 100 | Fabrique de Malléfisk | Malléfisk |  |
| 37 | 100 | Potager d'Halouine | Halouine | saisonnier |
| 38 | 100 | Repaire du Kharnozor | Kharnozor |  |
| 39 | 100 | Tanière du Meulou | Meulou |  |
| 40 | 100 | Théâtre de Dramak | Maître des Pantins |  |
| 41 | 110 | Bambusaie de Damadrya | Damadrya |  |
| 42 | 110 | Bibliothèque du Maître Corbac | Maître Corbac |  |
| 43 | 110 | Caverne de Nowel | Papa Nowel | saisonnier |
| 44 | 110 | Garde-manger du Rat Blanc | Rat Blanc |  |
| 45 | 110 | Goulet du Rasboul | Silf le Rasboul Majeur |  |
| 46 | 110 | Miausolée du Pounicheur | Pounicheur |  |
| 47 | 110 | Sousouricière du Rat Noir | Rat Noir |  |
| 48 | 120 | Antre de Crocabulia | Crocabulia |  |
| 49 | 120 | Antre du Blop Multicolore Royal | Blop Multicolore Royal |  |
| 50 | 120 | Centre du Labyrinthe du Minotoror | Minotoror |  |
| 51 | 120 | Mégalithe de Fraktale | Fraktale |  |
| 52 | 120 | Repaire de Skeunk | Skeunk |  |
| 53 | 120 | Serre du Royalmouth | Royalmouth |  |
| 54 | 120 | Tofulailler Royal | Tofu Royal |  |
| 55 | 130 | Atelier du Tanukouï San | Tanukouï San |  |
| 56 | 130 | Caverne d'El Piko | El Piko |  |
| 57 | 130 | Croquanterie | Croqueleur | saisonnier |
| 58 | 130 | Ring du Capitaine Ekarlatte | Capitaine Ekarlatte |  |
| 59 | 130 | Vallée de la Dame des eaux | Nagate |  |
| 60 | 130 | Volière de la Haute Truche | Haute Truche |  |
| 61 | 140 | Clairière du Chêne Mou | Chêne Mou |  |
| 62 | 140 | Dojo du Vent | Shihan, Hanshi |  |
| 63 | 140 | Excavation du Mansot Royal | Mansot Royal |  |
| 64 | 140 | Fabrique de foux d'artifice | Founoroshi |  |
| 65 | 140 | Laboratoire du Tynril | Tynril Ahuri, Tynril Consterné, Tynril Déconcerté, Tynril Perfide |  |
| 66 | 150 | Galerie du Phossile | Phossile |  |
| 67 | 150 | Repaire de Sphincter Cell | Sphincter Cell |  |
| 68 | 150 | Tertre du long sommeil | Hell Mina |  |
| 69 | 150 | Épave du Grolandais violent | Ben le Ripate |  |
| 70 | 160 | Canopée du Kimbo | Kimbo |  |
| 71 | 160 | Grotte de Kanigroula | Kanigroula |  |
| 72 | 160 | Hypogée de l'Obsidiantre | Obsidiantre |  |
| 73 | 160 | Plateau de Ush | Ush Galesh |  |
| 74 | 160 | Salle du Minotot | Minotot |  |
| 75 | 160 | Tombe du Shogun Tofugawa | Shogun Tofugawa |  |
| 76 | 170 | Boyau du Père Ver | Père Ver |  |
| 77 | 170 | Demeure des Esprits | Koumiho |  |
| 78 | 170 | Horologium de XLII | XLII |  |
| 79 | 170 | Poste de contrôle du Supervizœuf | Supervizœuf |  |
| 80 | 170 | Tanière Givrefoux | Tengu Givrefoux, Fuji Givrefoux Nourricière |  |
| 81 | 180 | Antre du Korriandre | Korriandre |  |
| 82 | 180 | Antre du Kralamoure Géant | Kralamoure Géant |  |
| 83 | 180 | Cave du Toxoliath | Toxoliath |  |
| 84 | 180 | Grotte du Bworker | Bworker |  |
| 85 | 180 | Maison du Papa Nowel | Père Fwetar | saisonnier |
| 86 | 180 | Temple du Grand Ougah | Ougah |  |
| 87 | 190 | Antichambre des Gloursons | Glourséleste |  |
| 88 | 190 | Bastion des Marteaux-Aigris | Barbéryl Clochecuivre |  |
| 89 | 190 | Camp du Comte Razof | Comte Razof |  |
| 90 | 190 | Cavernes du Kolosso | Kolosso, Professeur Xa |  |
| 91 | 190 | Donjon de la mine de Sakaï | Grolloum |  |
| 92 | 190 | Pyramide d'Ombre | Ombre |  |
| 93 | 200 | Aquadôme de Merkator | Merkator |  |
| 94 | 200 | Arbre de Mort | Corruption |  |
| 95 | 200 | Autel de la Déchireuse | Déchireuse |  |
| 96 | 200 | Bataille de l'Aurore Pourpre | L'Éternel Conflit |  |
| 97 | 200 | Belvédère d'Ilyzaelle | Ilyzaelle |  |
| 98 | 200 | Brasserie du roi Dazak | Dazak Martegel |  |
| 99 | 200 | Breuil du Vénérable | Vénérable Endormi |  |
| 100 | 200 | Chambre de Tal Kasha | Tal Kasha |  |
| 101 | 200 | Chambre des maléfices | Belladone |  |
| 102 | 200 | Donjon du Comte Harebourg | Comte Harebourg |  |
| 103 | 200 | Défi du Chalœil | Chalœil |  |
| 104 | 200 | Fers de la Tyrannie | Servitude |  |
| 105 | 200 | Forgefroide de Missiz Frizz | Missiz Frizz |  |
| 106 | 200 | Laboratoire de Nileza | Nileza |  |
| 107 | 200 | Manoir des Katrepat | Anerice la Shushess |  |
| 108 | 200 | Mémoire d'Orukam | Roi Imagami |  |
| 109 | 200 | Palais de Dantinéa | Dantinéa |  |
| 110 | 200 | Palais du roi Nidas | Roi Nidas |  |
| 111 | 200 | Rituel de Kabahal | Kabahal |  |
| 112 | 200 | Salons privés de Klime | Klime |  |
| 113 | 200 | Sanctuaire de Torkélonia | Torkélonia |  |
| 114 | 200 | Sentence de la Balance | Misère |  |
| 115 | 200 | Souvenir d'Imagiro | Reine Amirukam |  |
| 116 | 200 | Temple de Koutoulou | Larve de Koutoulou |  |
| 117 | 200 | Temple du dieu Kao | Prêtresse de Kao | saisonnier |
| 118 | 200 | Tempête de l'Eliocalypse | Guerre, Servitude, Misère, Corruption | saisonnier |
| 119 | 200 | Tour de Bethel | Bethel Akarna |  |
| 120 | 200 | Tour de Solar | Solar |  |
| 121 | 200 | Transporteur de Sylargh | Sylargh |  |
| 122 | 200 | Trône de Sang | Guerre |  |
| 123 | 200 | Trône de la Cour Sombre | Reine des Voleurs |  |
| 124 | 200 | Vaisseau du Capitaine Meno | Capitaine Meno |  |
| 125 | 200 | Ventre de la Baleine | Protozorreur |  |
| 126 | 200 | Œil de Vortex | Vortex |  |
