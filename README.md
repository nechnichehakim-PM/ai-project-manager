# PM Hub — Monorepo

Trois versions du site dans des sous-dossiers isolés.

## Structure

```
PM Project/
├── hub-v2/       ← version active (déployée sur Vercel)
├── hub-v1/       ← version intermédiaire (archivée)
├── prototype/    ← prototype original ai-pm (archivé)
├── vercel.json   ← pointe vers hub-v2
└── .gitignore    ← couvre dist/ et node_modules/ partout
```

## Site actif — hub-v2

### Build & déploiement

```bash
cd hub-v2
npm install
npm run build
```

Le dossier `hub-v2/dist/` contient le site à publier.

**Vercel** : Build command = `cd hub-v2 && npm install && npm run build`, Output = `hub-v2/dist`.

### Préview en local

```bash
cd hub-v2
npm run build
npx serve dist
```

**Important :** ne pas utiliser `-s` (single). Ouvrir http://localhost:3000.

### Sources

- `hub-v2/public/hub/` — pages HTML, JS, CSS
- `hub-v2/public/hub/themes/pmhub-theme.css` — design system
- `hub-v2/scripts/build-hub.js` — copie vers `dist/` et génère `index.html`

## Site archivé — hub-v1

Version intermédiaire, même structure que hub-v2. Build : `cd hub-v1 && npm run build`.

## Prototype — prototype/

Version originale mono-page. Ouvrir `prototype/index.html` directement dans le navigateur.
