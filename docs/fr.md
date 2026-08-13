---
title: PolyField Track — Manuel
description: Aide et manuel d'utilisation de PolyField Track — logiciel de visualisation et d'affichage des résultats pour les systèmes photo-finish FinishLynx et TimeTronics.
lang: fr
permalink: /fr/
---

# PolyField Track

Un logiciel de visualisation et d'affichage des résultats pour les systèmes photo-finish FinishLynx et TimeTronics. Fonctionne sous Windows et Mac en tant qu'application de bureau reliée à votre dossier de résultats photo-finish.

[Télécharger sur polyfield.co.uk](https://www.polyfield.co.uk)

* Sommaire
{:toc}

## Présentation

PolyField Track transforme vos résultats FinishLynx ou TimeTronics en affichages en direct dans toute votre enceinte. Une seule instance de bureau surveille votre dossier de résultats et sert une interface web que n'importe quel appareil du réseau peut ouvrir — tableaux d'affichage, borne libre-service pour les athlètes, tableau des vitesses, et plus encore.

Le logiciel garde l'**opérateur aux commandes** : les résultats n'apparaissent qu'une fois enregistrés, garantissant une validation positive avant l'affichage. Les enregistrements multiples sont pris en charge — vous pouvez ainsi afficher tôt les athlètes des courses de fond, ou révéler une course une fois les performances des trois premiers attribuées.

## Fonctionnement

- Vous exécutez **une seule instance** de l'application de bureau sur un ordinateur connecté à votre dossier de résultats photo-finish.
- L'application crée une interface web sur le **port 3000**. Tout appareil sur le même réseau l'ouvre dans un navigateur — aucune installation nécessaire sur les affichages.
- Chaque affichage s'enregistre lui-même et peut se voir attribuer une mise en page à montrer. Le nombre d'affichages n'est limité que par votre réseau et l'ordinateur hôte.
- L'opérateur pilote ce qui apparaît — résultats, superpositions (texte, économiseur d'écran, compte à rebours, records, vue de ligne) ou une mise en page personnalisée complète.

## Prise en main

### 1. Définir le dossier des résultats

C'est le dossier dans lequel FinishLynx ou TimeTronics enregistre les résultats (LIF, etc.). Cliquez sur le bouton rouge en haut à droite, **« Sélectionner le dossier résultats »**. Vous pourrez le modifier plus tard avec **« Changer de dossier »**.

![Définissez le dossier des résultats ou modifiez le chemin en haut à droite :]({{ '/assets/desktop.png' | relative_url }})

Une fois défini, l'interface web se construit et l'adresse d'accès s'affiche en haut de l'application de bureau (par ex. `http://track.local:3000` ou `http://<votre-IP>:3000`).

### 2. Ouvrir un affichage

Sur chaque appareil d'affichage, ouvrez un navigateur et allez à l'adresse indiquée, puis `/display`. Chaque écran qui se connecte reçoit automatiquement un numéro. Voir [Connexion des écrans](#connecting-screens) pour le raccourci par QR code.

> **Astuce** — laissez l'application de bureau sur son écran d'accueil et pilotez les affichages depuis là, ou depuis un second appareil via l'interface web. Vous gardez ainsi le contrôle des superpositions pendant que les résultats s'affichent automatiquement.

## Le panneau de contrôle de bureau

Le panneau de contrôle est le poste de l'opérateur. En haut, vous définissez le dossier des résultats et voyez l'adresse de connexion. Les commandes principales sont regroupées dans une rangée de boutons compacte (qui passe à une seconde ligne sur les fenêtres étroites) :

| Commande | Rôle |
|---|---|
| **Texte et économiseur d'écran** | Saisir un message à afficher sur tous les écrans, ou lier une image. Idéal pour les messages des sponsors, « réunion suspendue », etc. |
| **Économiseur d'écran** | Afficher une **image** liée ou une **mise en page enregistrée** sur la zone de l'économiseur d'écran. Si une source est déjà définie, une pression l'active/la désactive ; le bouton ⚙ rouvre les options. |
| **Vue de ligne** | Envoyer la dernière image photo-finish aux affichages. Grisé tant qu'aucune image JPG de photo-finish n'apparaît dans le dossier des résultats. |
| **Horloge** | Afficher l'horloge en marche en plein écran sur les écrans dotés d'un widget horloge. |
| **Records** | Afficher des cartes de célébration pour les athlètes signalés comme record. Préc. / Suiv. font défiler les athlètes signalés ou la sélection manuelle. |
| **Compte à rebours** | Décompte jusqu'à une heure cible. Saisissez l'heure et Démarrer ; il se masque à zéro. |
| **Constructeur de mise en page** | Ouvrir le concepteur de mise en page (voir ci-dessous). |
| **Parcourir les LIF** | Réafficher n'importe quel résultat précédent du dossier surveillé. |

## Superpositions

Les superpositions sont les éléments que vous affichez **par-dessus** (ou à la place) des résultats : texte, économiseur d'écran, vue de ligne, horloge, records et compte à rebours. Trois points importants sur leur fonctionnement :

- **Vous pouvez en activer plusieurs à la fois.** Par exemple un fond d'économiseur d'écran avec un compte à rebours et une bannière de texte par-dessus. Activer l'une ne désactive plus les autres.
- **Ce sont les widgets qui décident de ce qui s'affiche et où.** Chaque affichage ne montre que les superpositions contenues dans sa mise en page attribuée — différents écrans peuvent donc montrer différentes combinaisons depuis un seul poste de bureau.
- **Un nouveau résultat les efface toutes** et ramène chaque écran aux résultats — les résultats en direct restent donc toujours prioritaires.

### Économiseur d'écran (image ou mise en page)

Choisissez **Image** (une image liée — panneaux de sponsors, avis) ou **Mise en page** (n'importe quelle mise en page enregistrée affichée en prise totale de la zone de l'économiseur d'écran). Sélectionnez la source, puis appuyez sur **Afficher**. Une fois une source définie, le bouton Économiseur d'écran l'active directement.

### Compte à rebours

Décompte jusqu'à une **heure cible**, lue sur l'horloge propre à chaque écran. Saisissez l'heure (par ex. 15:40) et Démarrer. Dans le Constructeur de mise en page, vous pouvez définir la légende (par défaut « Next Event In: »), l'affichage ou non des secondes, ainsi que le texte, la police et la couleur. Il se masque à zéro et cède la place aux nouveaux résultats et aux autres superpositions.

### Records

Signalez le record d'un athlète dans FinishLynx (voir [configuration](#finishlynx-setup)), puis appuyez sur **Records** pour afficher une carte de célébration — athlète, catégorie, épreuve, club et temps. Préc. / Suiv. font défiler plusieurs athlètes signalés.
La sélection manuelle d'un athlète depuis un fichier LIF existant et son marquage comme record sont également possibles. Appuyez sur **Records** puis **Sélection manuelle** pour lancer le processus en 3 étapes. 1. Choisir la course. 2. Choisir la performance. 3. Choisir ou saisir le type de record.

![Sélection manuelle des records :]({{ '/assets/records.png' | relative_url }})

### Vue de ligne

Envoie la dernière image photo-finish aux affichages dotés d'un widget de vue de ligne. La commande Rotation (s) définit la fréquence d'alternance entre la photo et le résultat.

## Taille du texte et modes de rotation

La taille du texte des résultats par défaut se règle avec les boutons **+** et **−** (les widgets de mise en page ont leur propre Taille du texte dans le Constructeur de mise en page).

Le mode de rotation détermine l'affichage des résultats comptant plus de 8 concurrents :

| Mode | Comportement |
|---|---|
| **Défilement** | Les 3 premières lignes sont verrouillées ; les lignes 4 et suivantes défilent parmi les autres concurrents. |
| **Page** | Pagine : 1–8, puis 9–16, etc. à la rotation. |
| **Tout défiler** | Les 8 lignes défilent parmi les concurrents, sans position verrouillée. |

La vitesse de rotation des athlètes par défaut est de **5 secondes**.

## Parcourir et restaurer

**Parcourir les LIF** liste les résultats précédents du dossier surveillé afin de réafficher n'importe lequel — utile pour les séances photo ou pour réafficher une série antérieure. Ouvrir un ancien fichier dans FinishLynx ne perturbe *pas* l'affichage en direct ; seule une véritable modification d'un résultat le promeut.

## Connexion des écrans {#connecting-screens}

Ouvrez `http://<adresse>:3000/display` sur chaque écran ; un numéro lui est attribué automatiquement. La page **QR codes des écrans** (depuis le panneau Écrans, ou `/screens-overview`) affiche un code scannable pour chaque page d'affichage, afin de diriger rapidement un téléphone, une tablette ou un navigateur de TV vers la bonne page.

Dans le panneau **Écrans**, vous attribuez une mise en page enregistrée à chaque écran de façon indépendante et supprimez les écrans qui ne sont plus actifs. Le bureau dispose aussi d'un aperçu du tableau d'affichage intégré qui reproduit un véritable écran lorsque vous lui attribuez une mise en page.

## Le Constructeur de mise en page

Ouvrez le Constructeur de mise en page pour concevoir des tableaux d'affichage personnalisés à partir de widgets. Chaque mise en page possède un format d'image et un thème, et se construit en déposant des widgets sur une grille et en les positionnant.

- **Ajoutez des widgets** depuis la palette de gauche, regroupés par Épreuve en cours, Résultats, Superpositions et Informations.
- **Sélectionnez un widget** pour modifier ses **Propriétés** à droite — position et taille, colonnes, taille du texte, police, couleurs et options propres au widget.
- **Widgets superposés :** utilisez le navigateur **◀ Widgets ▶** en haut du panneau Propriétés pour parcourir la sélection de chaque widget, y compris ceux masqués derrière d'autres.
- **Attribuez** une mise en page à un écran (ou à l'aperçu du tableau d'affichage) depuis le panneau Écrans.

![Le Constructeur de mise en page — la palette de widgets à gauche, le canevas au centre et le panneau des propriétés (avec le navigateur de widgets) à droite]({{ '/assets/Layout-Builder.png' | relative_url }})

## Référence des widgets

| Widget | Affiche |
|---|---|
| Tableau de résultats | Le résultat en cours, avec colonnes, rotation et taille de texte configurables. |
| Multi-résultats | Une grille de plusieurs résultats (2×2 / 3×2), le plus récent ou en rotation. |
| Liste de départ | La liste de départ de l'épreuve en cours. |
| Horloge en marche / Temps arrêté | Horloge en direct ou figée. |
| Nom de l'épreuve / Vent | Nom et vent de l'épreuve en cours ou du résultat. |
| Texte personnalisé / Logo / Heure du jour | Texte statique, une image/un logo, ou l'heure. |
| Résultats RAZA / Concours | Points WPA de para-athlétisme, et résultats des concours PolyField. |
| Superpositions Texte / Économiseur / Vue de ligne / Horloge | La bannière de texte, l'image/mise en page de l'économiseur, la photo-finish et l'horloge plein écran (affichées quand l'opérateur déclenche la superposition correspondante). |
| Superposition Record | Cartes de célébration des records (éléments positionnables par glisser-déposer, taille par élément). |
| Superposition Compte à rebours | Décompte jusqu'à une heure cible avec une légende modifiable. |

## Thèmes, dossards et abréviations de clubs

Les **thèmes** définissent les couleurs par défaut de tous les affichages ; vous pouvez les créer, les dupliquer et les modifier. Les **dossards** peuvent être affichés ou masqués dans la vue des résultats. Les **abréviations de clubs** sont gérées de façon centralisée (modifiez la liste des clubs) et appliquées partout — ajoutez un nouveau club ou remplacez une abréviation intégrée, et les changements atteignent tous les affichages en quelques secondes.

## Vues web

Les vues web sont accessibles au mieux via l'interface web, à l'aide des informations d'accès en haut de l'application de bureau. Pages clés :

| Page | URL |
|---|---|
| Tableau d'affichage (mise en page activée) | `/scoreboard` |
| Écran d'affichage | `/display` |
| Vue multi-résultats | `/results` |
| Borne athlète | `/athlete` |
| Tableau des vitesses | `/speed` |
| Horloge en marche | `/clock` |
| Classements RAZA | `/raza` |
| QR codes des écrans | `/screens-overview` |

### Vue multi-résultats

Affiche les résultats dans une matrice 2×2 ou 3×2. Configurez-la pour montrer les derniers résultats ou faire défiler tous les résultats disponibles ; adaptez la taille du texte ; et utilisez le mode plein écran pour masquer la barre d'outils (tout mouvement de souris la fait réapparaître). Les résultats se paginent, la page en cours étant indiquée en haut. L'icône de recherche ouvre la borne athlète.

![Vue multi-résultats — une grille 2×2 de résultats avec la barre d'outils en bas]({{ '/assets/multi-result.png' | relative_url }})

### Borne athlète (libre-service)

Ouvrez `<ADRESSE-IP>:3000/athlete`. Un athlète recherche par nom ou numéro de dossard ; cliquer sur un nom affiche toutes ses performances dans le dossier de résultats en cours. Cliquer sur une carte de résultat l'affiche en plein écran pour les séances photo. **Réinitialiser** efface la recherche ; le bouton retour ramène au champ de recherche.

![La borne libre-service pour les athlètes — recherche par nom ou numéro de dossard]({{ '/assets/athlete-kiosk.png' | relative_url }})

## Configuration FinishLynx et TimeTronics {#finishlynx-setup}

- **Scripts de tableau d'affichage** — utilisez les scripts fournis `polyfield.lss` (et `polyfield-wind.lss`) pour que FinishLynx envoie l'horloge en marche et le vent à PolyField Track.
- **Records** — signalez le record d'un athlète dans le champ **User 3** de FinishLynx (par ex. `PB` ou `W50 WR`). Les codes de record sont développés en titres complets à partir de la liste des clubs.
- **Vue de ligne** — exportez vos images photo-finish (JPG) dans le dossier de résultats surveillé ; le bouton Vue de ligne s'active dès qu'elles apparaissent.
- **Résultats** — enregistrez votre LIF normalement ; PolyField n'affiche que les résultats enregistrés.

Pour la configuration pas à pas du tableau d'affichage FinishLynx, voir le **[guide des réglages du tableau d'affichage (PDF)]({{ '/assets/scoreboard-settings.pdf' | relative_url }})**.

## Réseau

- L'application est servie sur le **port 3000** et s'annonce sous le nom `track.local` sur le réseau, afin que les affichages puissent utiliser `http://track.local:3000` sans connaître l'adresse IP.
- Sur les ordinateurs dotés de plusieurs cartes réseau (fréquent sous Windows), sélectionnez la bonne carte réseau dans le panneau de connexion pour que la bonne adresse soit annoncée.
- Tous les appareils doivent être sur le même réseau que l'ordinateur hôte.

## Dépannage

| Symptôme | À vérifier |
|---|---|
| Le bouton Vue de ligne est grisé | Aucune image JPG de photo-finish dans le dossier surveillé pour l'instant — vérifiez le chemin d'export des images de FinishLynx. |
| Records n'affiche rien | L'athlète doit être signalé dans FinishLynx User 3 ou via la sélection manuelle, et la mise en page doit contenir un widget Superposition Record. |
| Un affichage indique « en attente de mise en page » | Attribuez une mise en page à cet écran dans le panneau Écrans. |
| Un ancien résultat est réapparu | Ouvrir un fichier dans FinishLynx ne le promeut plus ; seule une véritable modification le fait. Utilisez Parcourir les LIF pour réafficher volontairement d'anciens résultats. |
| Les affichages ne se connectent pas | Confirmez le même réseau, le port 3000 accessible et (PC multi-cartes) la bonne carte réseau sélectionnée. |

## Téléchargement et assistance

Téléchargez la dernière version sur [www.polyfield.co.uk](https://www.polyfield.co.uk) ou sur la [page des versions](https://github.com/KingstonPolyAC/PolyField-Track/releases). Assistance : [support@polyfield.co.uk](mailto:support@polyfield.co.uk).
