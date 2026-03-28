# Hub Unified — État du projet

> Dernière mise à jour : 25 mars 2026

---

## Résumé

PM Hub (~30 pages gestion de projet) et DelHub (18 pages delivery/business) fusionnés en **un seul site** dans `hub-unified/public/app/`. Le rôle de l'utilisateur détermine ce qu'il voit (sidebar, pages, couleurs). Les données sont en localStorage (mode démo). hub-v2/ et hub-v3/ restent intacts comme backup.

---

## Rôles et couleurs

| Rôle | Couleur | Code | Page par défaut |
|---|---|---|---|
| GOD | Gold | `#F59E0B` | pm-hub.html |
| CDP (pm) | Indigo | `#818CF8` | pm-hub.html |
| Delivery | Teal | `#2DD4BF` | delhub-dashboard.html |
| Business | Rose | `#F43F5E` | delhub-contracts.html |
| Sales | Orange | `#F97316` | delhub-crm.html |
| Head | Violet | `#A855F7` | pm-hub.html |

---

## Architecture

```
hub-unified/
  public/app/
    themes/hub-theme.css        ← thème unifié avec variables par rôle
    hub-login.html              ← login unique + 6 boutons mode démo
    hub-data.js                 ← PMHUB + DELHUB + rôles + PAGE_ACCESS
    hub-sidebar.js              ← sidebar unifiée filtrée par rôle + switch GOD
    hub-supabase.js             ← auth Supabase + sync cloud + auth guard
    hub-nav-context.js          ← navigation tabs unifiées
    hub-theme-toggle.js         ← dark/light toggle
    hub-mini-chat.js            ← mini-chat IA flottant
    hub-ai-widget.js            ← widget IA réutilisable (3 onglets)
    hub-ai.html                 ← centre IA unifié (page dédiée)
    pm-hub.html                 ← 12 pages PM
    pm-hub-portfolio.html
    pm-hub-executive.html
    pm-hub-transverse.html
    pm-hub-project.html
    pm-hub-gantt.html
    pm-hub-kanban.html
    pm-hub-raid.html
    pm-hub-budget.html
    pm-hub-resources.html
    pm-hub-governance.html
    pm-hub-report.html
    delhub-dashboard.html       ← 14 pages Del
    delhub-exec.html
    delhub-reports.html
    delhub-crm.html
    delhub-proposals.html
    delhub-forecast.html
    delhub-contracts.html
    delhub-pnl.html
    delhub-portfolio.html
    delhub-pipeline.html
    delhub-sla.html
    delhub-capacity.html
    delhub-releases.html
    delhub-incidents.html
    ...                         ← + stubs, pages AI PM, settings, etc.
  scripts/build.js              ← copie public/app → dist/
  package.json
```

---

## Fonctionnalités livrées

### 1. Login unifié (`hub-login.html`)
- Connexion / Inscription via Supabase Auth
- Sélecteur de rôle à l'inscription
- **6 boutons "Mode Démo"** pour tester chaque rôle sans compte

### 2. Sidebar dynamique (`hub-sidebar.js`)
- 10 sections filtrées par rôle (Admin, Portefeuille, Projet, Outils PM, Pilotage, Commercial, Business, Delivery, Outils, Paramètres)
- Sélecteur de rôle GOD (chips colorés pour switcher la vue)
- Déconnexion compatible Supabase + mode démo
- Projet actif affiché (pages PM)

### 3. Auth Guard (`hub-supabase.js`)
- Vérification rôle vs PAGE_ACCESS au chargement de chaque page
- Toast rouge "Accès refusé" + redirect si pas autorisé
- Timeout Supabase CDN 3s → bascule automatique en mode démo
- Mode démo : profil localStorage, pas besoin de Supabase

### 4. Thème par rôle (`themes/hub-theme.css`)
- `html[data-role="god"]` → gold
- `html[data-role="pm"]` → indigo
- `html[data-role="delivery"]` → teal
- `html[data-role="business"]` → rose
- `html[data-role="sales"]` → orange
- `html[data-role="head"]` → violet

### 5. Widget IA contextuel (`hub-ai-widget.js`) — 26 pages
Chaque page a un widget IA en bas avec 3 onglets :
- **Prédictions** : analyse prédictive basée sur les données de la page
- **Analyse** : question libre sur les données
- **Import Document** : upload PDF/TXT/CSV → extraction IA → import dans l'app

Pages PM (12) : dashboard, portfolio, executive, transverse, project, gantt, kanban, raid, budget, resources, governance, report

Pages Del (14) : dashboard, exec, reports, crm, proposals, forecast, contracts, pnl, portfolio, pipeline, sla, capacity, releases, incidents

### 6. Matrice d'accès (PAGE_ACCESS)
Définie dans `hub-data.js`. Chaque page a un objet `{ role: 'CRUD'|'READ' }`. GOD a accès CRUD partout.

---

## Comment tester

```bash
cd hub-unified
npx serve public/app -p 3000
```

Ouvrir http://localhost:3000/hub-login.html → cliquer sur un rôle démo.

---

## Build

```bash
cd hub-unified
node scripts/build.js
# → 71 fichiers copiés dans dist/
```

---

## Phases complétées

- [x] Phase 1 : Création hub-unified/ + copie pages
- [x] Phase 2 : 7 fichiers infrastructure unifiés
- [x] Phase 3 : MAJ références dans toutes les pages
- [x] Phase 4 : Auth guard + mode démo + toast accès refusé
- [x] Phase 5 : Build (71 fichiers)

---

## Prochaines étapes

### BDD Supabase
- Créer les tables relationnelles (projects, tasks, raids, budgets, contracts, opportunities, incidents, engagements, pnl, releases, capacity, proposals, profiles)
- Supabase RLS (Row Level Security) par rôle et par utilisateur
- Migrer PMHUB/DELHUB de localStorage vers appels Supabase
- Isolation des données : CDP_A ne voit pas les projets de CDP_B

### Hébergement Vercel
- Configurer `vercel.json`
- Déployer `dist/`
- Variables d'environnement Supabase
- Domaine custom

---

## Infos techniques

- **Supabase** : `fznbkseaycjgmnxgrhiq.supabase.co`
- **Table existante** : `pmhub_data` (clé/valeur JSON blob)
- **Stack** : HTML/CSS/JS vanilla, pas de framework, pas de bundler
- **Données** : `const PMHUB` (projets) + `const DELHUB` (delivery/business) dans hub-data.js

---

*Abdelhakim Nechniche — PMP® · PRINCE2 7th*
