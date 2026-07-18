# Règles Métier

## Objectif

Ce document décrit les règles métier utilisées par le moteur expert.

Chaque règle doit être :

- compréhensible ;
- documentée ;
- vérifiable ;
- versionnée.

Le moteur expert ne peut utiliser que des règles présentes dans ce document.

---

# Domaines couverts

Le logiciel devra progressivement intégrer les règles concernant :

- Loi Plein emploi
- RSA
- France Travail
- Orientation
- CEJ
- Formation
- PMSMP
- IAE
- RQTH
- Employeurs
- Contrat d'engagement
- Création d'entreprise
- Aides financières
- Prestations
- Partenaires

---

# Structure d'une règle

Chaque règle comportera :

## Identifiant

Exemple :

RSA-001

---

## Nom

Nom de la règle.

---

## Description

Explication de la règle.

---

## Conditions

Quand cette règle s'applique.

---

## Vérifications

Informations que le moteur doit contrôler.

---

## Résultat attendu

Recommandation proposée.

---

## Priorité

- Critique
- Haute
- Moyenne
- Faible

---

## Explication

Le moteur devra toujours expliquer pourquoi cette règle est utilisée.

---

## Version

Chaque règle sera versionnée.

---

## Source

Toujours indiquer :

- loi ;
- décret ;
- instruction ;
- guide métier ;
- doctrine France Travail ;
- autre source officielle.

---

# Principe

Aucune règle ne doit être inventée.

Toute règle doit être vérifiable.

Toute règle doit pouvoir être modifiée sans changer le code du logiciel.