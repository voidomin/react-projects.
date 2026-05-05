# React + Vite Movie Discovery App

This is a standalone movie and TV discovery app in the multi-project repo. It can be run and improved on its own without touching the other apps.

## Features

### 🎬 Content Discovery

- **Movies & TV Shows**: Browse and search both movies and TV series
- **Media Type Filtering**: Filter by Movies Only, TV Shows Only, or All Content
- **User Preferences**: Your content type choice is saved locally
- **Infinite Scroll**: Automatically load more content as you scroll
- **Smart Caching**: Pages are cached with 2-minute TTL for fast navigation

### 🧭 Navigation & Search

- **Fast Search**: Real-time search with debouncing
- **Recent Searches**: Quick access to recent search terms
- **Sorting Options**: Sort by relevance, year, or title
- **Year Range Filter**: Filter results by release year

### 💾 Features

- **Favorites**: Save your favorite movies and shows
- **Share Links**: Generate and share direct links to content
- **Lazy Loading**: Images load on-demand for faster performance
- **Error Recovery**: Graceful error handling with recovery options

### 🎨 UI/UX

- **Dark Mode**: Professional dark interface
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Smooth Animations**: Polished transitions and interactions
- **Skeleton Loading**: Skeleton screens while content loads
- **Command Palette**: Quick navigation with keyboard shortcuts (⌘K or Ctrl+K)

## API Provider Setup

This app supports three movie data providers with automatic fallback:

- `imdb236` (IMDb236 on RapidAPI) — Recommended (best data quality)
- `moviesdb` (MoviesDatabase on RapidAPI) — Secondary fallback
- `omdb` (OMDb) — Tertiary fallback

### Configuration

Create a `.env` file in `movie-db/` and add one or more API keys:

```env
VITE_MOVIE_PROVIDER=auto
VITE_IMDB236_RAPIDAPI_KEY=your_rapidapi_key
VITE_IMDB236_RAPIDAPI_HOST=imdb236.p.rapidapi.com
VITE_MOVIESDB_RAPIDAPI_KEY=your_rapidapi_key
VITE_MOVIESDB_RAPIDAPI_HOST=moviesdatabase.p.rapidapi.com
VITE_OMDB_API_KEY=your_omdb_key
```

### Provider Modes

- `auto`: Use IMDb236 if key present → MoviesDatabase if key present → OMDb
- `imdb236`: Force IMDb236 as primary
- `moviesdb`: Force MoviesDatabase as primary
- `omdb`: Force OMDb as primary

**Priority Chain**: If the primary provider fails, the app automatically tries secondary and tertiary providers.

### Media Type Support

All providers now support searching and filtering by media type:

- Movies
- TV Series
- Both (All Content)

The app automatically detects content type and displays appropriate labels.

## For More Details

See [FEATURE_TV_SHOWS.md](./FEATURE_TV_SHOWS.md) for complete TV show support implementation details.
