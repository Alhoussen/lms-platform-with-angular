# 📚 LMS Platform - Plateforme d'Apprentissage en Ligne

Ce projet est une plateforme LMS (Learning Management System) développée avec **Angular 21**, démontrant l'utilisation des dernières fonctionnalités du framework comme les **Signals**, les **Standalone Components**, le **SSR** (Server-Side Rendering) et le **Lazy Loading**.

![Version Angular](https://img.shields.io/badge/Angular-21.0.0-dd0031.svg)
![State Management](https://img.shields.io/badge/State-Signals-blue.svg)

## Fonctionnalités

### Espace Étudiant
*   **Catalogue de Cours** : Exploration des cours par cartes interactives avec filtres par catégorie.
*   **Lecture de Cours** :
    *   Lecteur vidéo intégré avec support des chapitres et leçons.
    *   Suivi de la progression en temps réel (barre de progression, indicateurs visuels).
    *   Marquage manuel des leçons comme "Terminées".
*   **Quiz Interactifs** : QCM de fin de chapitre avec feedback immédiat.
*   **Tableau de Bord** :
    *   Vue d'ensemble de la progression.
    *   **Génération de Certificat PDF** 🏆 (téléchargeable une fois le cours complété à 100%).

### Espace Instructeur
*   **Gestion Complète (CRUD)** : Création, modification et suppression de cours.
*   **Éditeur de Contenu** : Interface intuitive pour ajouter/supprimer des chapitres et des leçons.
*   **Création de Quiz** : Interface dédiée pour créer des QCMs rattachés aux chapitres.

### Sécurité & Architecture
*   **Authentification Simulée** : Gestion des rôles (Étudiant / Instructeur) avec persistance (localStorage).
*   **Guards** : Protection des routes (`/instructor` accessible uniquement aux instructeurs).
*   **Architecture Modulaire** :
    *   `core/` : Services singletons, Guards, Modèles.
    *   `features/` : Composants métiers (Lazy loaded).
    *   `shared/` : Composants réutilisables.

## Stack Technique

*   **Framework** : Angular 21 (Standalone Components)
*   **Gestion d'État** : Angular Signals (Pas de NgRx ou libraries externes, pur Angular)
*   **Styles** : SCSS avec variables CSS natives pour un design system cohérent.
*   **Backend** : `json-server` (Mock API REST complète).
*   **PDF** : `jspdf` pour la génération de certificats client-side.

## Installation et Lancement

1.  **Installer les dépendances** :
    ```bash
    npm install
    ```

2.  **Lancer le Mock Backend** (dans un terminal séparé) :
    Les données sont stockées dans `db.json`.
    ```bash
    npm run json-server
    ```

3.  **Lancer l'application Angular** :
    ```bash
    npm start
    ```
    L'application sera accessible sur `http://localhost:4200`.

## Structure du Projet

```
src/
├── app/
│   ├── core/               # Services globaux, Guards, Interceptors
│   │   ├── auth.service.ts # Gestion Auth & Rôles
│   │   ├── quiz.service.ts # Logique Quiz
│   │   ├── certificate.service.ts # Génération PDF
│   │   └── ...
│   ├── features/           # Modules fonctionnels (Lazy Loaded)
│   │   ├── courses/        # Catalogue, Détail, Lecteur Vidéo
│   │   ├── dashboard/      # Dashboard Étudiant
│   │   └── instructor/     # Dashboard Instructeur
│   └── app.routes.ts       # Routing principal
├── styles.scss             # Design System global
└── db.json                 # Base de données Mock (JSON Server)
```

