# État de la refonte — Cap Décision FT

Dernière mise à jour : 26 juillet 2026

## État actuel

La refonte React est restaurée et fonctionnelle. Les dix parcours principaux
passent le contrôle de rendu :

- accueil des missions ;
- assistant de mission ;
- déroulement d'une mission ;
- analyse de situation ;
- tableau de bord ;
- préparation d'entretien ;
- prescriptions ;
- centre de connaissances ;
- paramètres ;
- dossiers demandeurs.

La compilation de production est validée avec Vite.

## Correctifs intégrés au jalon

- correction du calcul d'employabilité qui provoquait une page blanche ;
- correction de la génération des étapes du plan d'action ;
- migration des grilles principales vers l'API MUI actuelle ;
- ajout d'un contrôle automatisé de rendu de toutes les routes.

## Commandes de vérification

Depuis le dossier `frontend` :

```bash
npm run check:routes
npm run build
```

## Point de reprise fonctionnel

La prochaine phase doit porter sur la validation interactive des parcours :

1. création et ouverture d'un dossier ;
2. saisie guidée dans l'assistant de mission ;
3. enregistrement et reprise d'une analyse ;
4. production du diagnostic, des recommandations, de la synthèse et de la MAP ;
5. passage vers les prescriptions et la préparation d'entretien ;
6. contrôle de la persistance locale et de l'historique.

## Points techniques encore ouverts

- ajouter des tests métier automatisés au frontend ;
- rétablir l'environnement de tests Python du backend ;
- découper le gros fichier JavaScript de production ;
- corriger progressivement les textes historiques présentant un mauvais encodage ;
- documenter les données fictives et les règles métier actives.
