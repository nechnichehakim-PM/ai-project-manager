# PM Hub

**Site unique** — Design « AI Project Manager » (dark tech, glassmorphism, Space Grotesk / Inter / JetBrains Mono).

- **Dashboard** (portefeuille projets, KPIs, wizard)
- **Planning Gantt**, **Kanban**, **RAID**, **Ressources**, **Reporting**, **Templates**, **Paramètres**
- **Assistant IA** (bouton flottant)

## Build & déploiement

```bash
npm install
npm run build
```

Le dossier `dist/` contient le site à publier. La page d’accueil est le dashboard (`index.html`).

**Netlify** : Build command = `npm run build`, Publish directory = `dist`.

## Préview en local

```bash
npm run build
npx serve dist
```

**Important :** ne pas utiliser l’option `-s` (single). Avec `-s`, toutes les URLs renvoient à `index.html` et la page **Dashboard projet** ne s’ouvre pas. Utiliser uniquement `npx serve dist`.

Puis ouvrir http://localhost:3000 et cliquer sur **« Dashboard projet »** (ou sur la carte) pour ouvrir le dashboard dédié au projet.

## Structure

- `public/hub/` — sources du site (HTML, thème, données)
- `public/hub/themes/pmhub-theme.css` — design system (couleurs, typo, cartes glass, nav, sidebar)
- `scripts/build-hub.js` — copie le hub vers `dist/` et génère `index.html` à la racine

*Dernière mise à jour : sidebar unifiée sur toutes les pages du hub.*
