# React Projects (Vite + React)

A multi-app repo (each app is a standalone Vite project) published together to GitHub Pages.

## Apps

- Landing page (root)
- `caffiend/` — coffee tracker (Firebase)
- `movie-db/` — movie discovery app (OMDB + RapidAPI)
- `pokedex/` — PokeAPI explorer
- `todo-app/` — task manager
- `vocab/` — vocab trainer

## Local development

Each app runs independently:

```bash
cd caffiend
npm install
npm run dev
```

Repeat for any other folder (e.g. `movie-db`, `pokedex`, `todo-app`, `vocab`).

## Deployment (GitHub Pages)

GitHub Pages is deployed via GitHub Actions using an artifact build (no committed build output).

- Workflow: `.github/workflows/deploy.yml`
- Output directory assembled in CI: `dist-pages/` (ignored by git)

One-time setup (repo settings):

1. Go to **Settings → Pages**
2. Set **Build and deployment → Source** to **GitHub Actions**

### Required secrets

These are used in CI during `npm run build`:

- Caffiend:
  - `VITE_FIREBASE_APIKEY`
  - `VITE_FIREBASE_AUTHDOMAIN`
  - `VITE_FIREBASE_PROJECTID`
  - `VITE_FIREBASE_STORAGEBUCKET`
  - `VITE_FIREBASE_MESSAGINGSENDERID`
  - `VITE_FIREBASE_APPID`
- Movie DB:
  - `VITE_OMDB_API_KEY`
  - `VITE_IMDB236_RAPIDAPI_KEY`
  - `VITE_MOVIESDB_RAPIDAPI_KEY`
