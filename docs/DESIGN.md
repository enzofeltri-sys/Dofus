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
- **Grimoire** : 22 paires « sort ⇄ variante » du Sacrieur ; pour chaque paire on choisit l'un des deux hors donjon.
  On peut marquer des **favoris**, qui sortent plus souvent dans les cartes.
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
- **Départ** : Panoplie du Jeune Aventurier sans le Chapeau (lâché par les Chafers : premier objectif) ; nombre de pièces ajusté par simulation pour garder le calibrage.

### 8.3 Zones de farm (validé, étape 9)
Une zone par région (ex. Plaines d'Incarnam) : 5 salles en vagues avec les vrais monstres du monde ouvert. Garde-fous pour ne pas rendre le jeu facile :
1. Seulement le butin de la région (taux pleins) : jamais les ressources propres aux donjons ni les panoplies de boss.
2. XP ×0,5 par minute par rapport au donjon du même niveau.
3. 1 carte toutes les 2 salles, ni mini-boss ni boss.
4. Même règle de difficulté que les donjons (vraies stats, aucun ajustement au personnage).

### 8.4 Raretés
**Commun → Rare → Épique → Légendaire → Mythique.**
- Chaque rang relève les fourchettes de stats (**≈ +15 % par rang**, modéré : le niveau de l'objet doit toujours compter plus que sa rareté).
- Légendaire et Mythique ajoutent **une ligne bonus** (effet spécial, ou PA/PM rare).

---

### 8.5 Inventaire : recherche, Encyclopédie, favoris, verrou (validé)
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

### 9.3 Brisage
Casser un objet → **runes** (Fo, Ine, Vi, PA…).

### 9.4 Forgemagie (personnalise **sous** le plafond)
- Vraies règles Dofus : runes, **puits**, réussite / échec neutre / échec critique, **exos**.
- **Plus l'objet est rare, plus son puits est grand.**

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
8. Raretés, fusion, brisage, forgemagie.
9. Zones de farm (Plaines d'Incarnam d'abord : ≈ 6 familles de monstres à dessiner).
10. Donjons suivants par tranches de niveaux, finitions, installation sur l'appareil.

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
