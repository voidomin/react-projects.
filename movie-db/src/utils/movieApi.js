// Multi-provider movie API utility
// Supports IMDb236 (RapidAPI), MoviesDatabase (RapidAPI), and OMDb fallback.

const OMDB_BASE_URL = "https://www.omdbapi.com/";
const MOVIESDB_BASE_URL = "https://moviesdatabase.p.rapidapi.com";
const DEFAULT_MOVIESDB_HOST = "moviesdatabase.p.rapidapi.com";
const IMDB236_BASE_URL = "https://imdb236.p.rapidapi.com";
const DEFAULT_IMDB236_HOST = "imdb236.p.rapidapi.com";

const FALLBACK_POSTER = "./placeholders/poster.svg";

const FEATURED_RECENT_SEEDS = ["adventure", "drama", "thriller", "comedy"];
const FEATURED_FALLBACK_SEEDS = ["award", "festival", "indie", "story"];
const FEATURED_YEAR_WINDOW = 3;
const FEATURED_PAGE_SIZE = 18;
const FEATURED_POOL_LIMIT = 180;
const FEATURED_FRANCHISE_REPEAT_LIMIT = 2;
const PROVIDER_RATE_LIMIT_COOLDOWN_MS = 10 * 60 * 1000;
const PROVIDER_COOLDOWN_STORAGE_KEY = "movie-db-provider-cooldowns-v1";
const PROVIDER_OVERRIDE_STORAGE_KEY = "movie-db-provider-override-v1";

const PROVIDER = {
  AUTO: "auto",
  IMDB236: "imdb236",
  OMDB: "omdb",
  MOVIESDB: "moviesdb",
};

const inFlightRequestCache = new Map();
const providerCooldownUntil = readStoredProviderCooldowns() || {
  [PROVIDER.IMDB236]: 0,
  [PROVIDER.MOVIESDB]: 0,
  [PROVIDER.OMDB]: 0,
};

const movieDetailCache = new Map();
const MOVIE_DETAIL_CACHE_TTL_MS = 5 * 60 * 1000;

let lastProviderRuntimeStatus = {
  attemptedProviders: [],
  usedProvider: null,
  fallbackUsed: false,
  rateLimitedProviders: [],
  coolingDownProviders: [],
};

// --- Storage Utilities ---

function readStoredProviderCooldowns() {
  try {
    const raw = globalThis?.localStorage?.getItem(PROVIDER_COOLDOWN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      [PROVIDER.IMDB236]: Number(parsed?.[PROVIDER.IMDB236] || 0),
      [PROVIDER.MOVIESDB]: Number(parsed?.[PROVIDER.MOVIESDB] || 0),
      [PROVIDER.OMDB]: Number(parsed?.[PROVIDER.OMDB] || 0),
    };
  } catch {
    return null;
  }
}

function persistProviderCooldowns() {
  try {
    globalThis?.localStorage?.setItem(
      PROVIDER_COOLDOWN_STORAGE_KEY,
      JSON.stringify(providerCooldownUntil),
    );
  } catch { /* ignore */ }
}

function getCoolingDownProviders() {
  const now = Date.now();
  let changed = false;
  const coolingDown = Object.values(PROVIDER).filter((provider) => {
    if (provider === PROVIDER.AUTO) return false;
    const until = providerCooldownUntil[provider] || 0;
    if (until <= now) {
      if (until !== 0) {
        providerCooldownUntil[provider] = 0;
        changed = true;
      }
      return false;
    }
    return true;
  });
  if (changed) persistProviderCooldowns();
  return coolingDown;
}

function updateProviderRuntimeStatus(nextStatus) {
  lastProviderRuntimeStatus = {
    ...lastProviderRuntimeStatus,
    ...nextStatus,
    coolingDownProviders: getCoolingDownProviders(),
  };
}

function markProviderRateLimited(provider) {
  providerCooldownUntil[provider] = Date.now() + PROVIDER_RATE_LIMIT_COOLDOWN_MS;
  persistProviderCooldowns();
}

function isProviderCoolingDown(provider) {
  return getCoolingDownProviders().includes(provider);
}

// --- Request Manager ---

function withInFlightRequest(cacheKey, runner) {
  const existing = inFlightRequestCache.get(cacheKey);
  if (existing) return existing;

  const pending = Promise.resolve()
    .then(runner)
    .finally(() => {
      inFlightRequestCache.delete(cacheKey);
    });

  inFlightRequestCache.set(cacheKey, pending);
  return pending;
}

// --- API Configuration ---

function getProviderPreference() {
  try {
    const override = globalThis?.localStorage?.getItem(PROVIDER_OVERRIDE_STORAGE_KEY) || "";
    const normalizedOverride = String(override).toLowerCase();
    if (Object.values(PROVIDER).includes(normalizedOverride)) return normalizedOverride;
  } catch { /* ignore */ }

  const envProvider = (import.meta.env.VITE_MOVIE_PROVIDER || PROVIDER.AUTO).toLowerCase();
  return Object.values(PROVIDER).includes(envProvider) ? envProvider : PROVIDER.AUTO;
}

const getOmdbApiKey = () => import.meta.env.VITE_OMDB_API_KEY;
const getMoviesDbApiKey = () => import.meta.env.VITE_MOVIESDB_RAPIDAPI_KEY;
const getMoviesDbHost = () => import.meta.env.VITE_MOVIESDB_RAPIDAPI_HOST || DEFAULT_MOVIESDB_HOST;
const getImdb236ApiKey = () => import.meta.env.VITE_IMDB236_RAPIDAPI_KEY;
const getImdb236Host = () => import.meta.env.VITE_IMDB236_RAPIDAPI_HOST || DEFAULT_IMDB236_HOST;

const hasOmdbKey = () => Boolean(getOmdbApiKey());
const hasMoviesDbKey = () => Boolean(getMoviesDbApiKey());
const hasImdb236Key = () => Boolean(getImdb236ApiKey());

// --- Normalization Helpers ---

const parseRuntime = (r) => (!r || r === "N/A" ? 0 : Number(/\d+/.exec(String(r))?.[0] || 0));
const parseVotes = (v) => (!v || v === "N/A" ? 0 : Number(String(v).replaceAll(",", "")));
const splitList = (v) => (!v || v === "N/A" ? [] : String(v).split(",").map(s => s.trim()).filter(Boolean));

function getMovieYearValue(yearText) {
  if (!yearText || yearText === "N/A") return null;
  const match = /\d{4}/.exec(String(yearText));
  return match ? Number(match[0]) : null;
}

function extractImdbId(value) {
  if (!value) return "";
  const match = /tt\d+/i.exec(String(value));
  return match ? match[0] : String(value);
}

// --- Provider Resolvers ---

function normalizeOmdbSummary(movie) {
  const mediaType = String(movie.Type || "movie").toLowerCase();
  return {
    id: movie.imdbID,
    title: movie.Title,
    release_date: movie.Year && movie.Year !== "N/A" ? `${movie.Year}-01-01` : "",
    vote_average: null,
    poster_path: movie.Poster && movie.Poster !== "N/A" ? movie.Poster : null,
    overview: mediaType === "series" ? "TV Series" : "Movie",
    media_type: mediaType === "series" ? "tv" : "movie",
  };
}

function normalizeOmdbDetail(movie) {
  const directors = splitList(movie.Director);
  const actors = splitList(movie.Actors);
  const genres = splitList(movie.Genre);
  const mediaType = String(movie.Type || "movie").toLowerCase();

  return {
    id: movie.imdbID,
    title: movie.Title,
    release_date: movie.Year && movie.Year !== "N/A" ? `${movie.Year}-01-01` : "",
    vote_average: movie.imdbRating && movie.imdbRating !== "N/A" ? Number(movie.imdbRating) : null,
    vote_count: parseVotes(movie.imdbVotes),
    runtime: parseRuntime(movie.Runtime),
    poster_path: movie.Poster && movie.Poster !== "N/A" ? movie.Poster : null,
    backdrop_path: movie.Poster && movie.Poster !== "N/A" ? movie.Poster : null,
    overview: movie.Plot && movie.Plot !== "N/A" ? movie.Plot : "No description available.",
    tagline: "",
    media_type: mediaType === "series" ? "tv" : "movie",
    genres: genres.map((name, i) => ({ id: i + 1, name })),
    credits: {
      crew: directors.map(name => ({ job: "Director", name })),
      cast: actors.map((name, i) => ({ id: i + 1, name, character: "", profile_path: null })),
    },
    videos: { results: [] },
    similar: { results: [] },
  };
}

function normalizeMoviesDbSummary(item) {
  const id = extractImdbId(item?.id);
  const year = item?.releaseYear?.year;
  const typeText = item?.titleType?.text || "movie";
  return {
    id,
    title: item?.titleText?.text || "Untitled",
    release_date: year ? `${year}-01-01` : "",
    vote_average: typeof item?.ratingsSummary?.aggregateRating === "number" ? item.ratingsSummary.aggregateRating : null,
    poster_path: item?.primaryImage?.url || null,
    overview: item?.plot?.plotText?.plainText || "No description available.",
    media_type: String(typeText).toLowerCase() === "tvseries" ? "tv" : "movie",
  };
}

function normalizeImdb236Summary(item) {
  const id = extractImdbId(item?.id || item?.tconst);
  const titleType = String(item?.titleType || "movie").toLowerCase();
  return {
    id,
    title: item?.primaryTitle || "Untitled",
    release_date: item?.releaseDate || (item?.startYear ? `${item.startYear}-01-01` : ""),
    vote_average: Number.isFinite(Number(item?.averageRating)) ? Number(item?.averageRating) : null,
    poster_path: item?.primaryImage || null,
    overview: item?.description || item?.plot || "No description available.",
    media_type: titleType === "tvseries" ? "tv" : "movie",
  };
}

// --- Fetch Wrappers ---

async function fetchOmdb(params = {}) {
  const apiKey = getOmdbApiKey();
  if (!apiKey) throw new Error("Missing OMDb API key.");
  const url = new URL(OMDB_BASE_URL);
  url.searchParams.set("apikey", apiKey);
  Object.entries(params).forEach(([k, v]) => (v && url.searchParams.set(k, v)));
  const response = await fetch(url.toString());
  const data = await response.json();
  if (data.Response === "False") throw new Error(data.Error || "OMDb error.");
  return data;
}

async function fetchMoviesDb(path, params = {}) {
  const apiKey = getMoviesDbApiKey();
  if (!apiKey) throw new Error("Missing MoviesDatabase key.");
  const url = new URL(path, MOVIESDB_BASE_URL);
  Object.entries(params).forEach(([k, v]) => (v && url.searchParams.set(k, String(v))));
  const response = await fetch(url.toString(), {
    headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": getMoviesDbHost() },
  });
  if (response.status === 429) {
    markProviderRateLimited(PROVIDER.MOVIESDB);
    throw new Error("MoviesDatabase rate limit reached.");
  }
  return response.json();
}

async function fetchImdb236(path, params = {}) {
  const apiKey = getImdb236ApiKey();
  if (!apiKey) throw new Error("Missing IMDb236 key.");
  const url = new URL(path, IMDB236_BASE_URL);
  Object.entries(params).forEach(([k, v]) => (v && url.searchParams.set(k, String(v))));
  const response = await fetch(url.toString(), {
    headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": getImdb236Host() },
  });
  if (response.status === 429) {
    markProviderRateLimited(PROVIDER.IMDB236);
    throw new Error("IMDb236 rate limit reached.");
  }
  return response.json();
}

// --- Core API Logic with Smart Enrichment ---

async function enrichWithOmdbPoster(movie) {
  if (movie.poster_path || !movie.id) return movie;
  try {
    const data = await fetchOmdb({ i: movie.id });
    if (data.Poster && data.Poster !== "N/A") {
      movie.poster_path = data.Poster;
      if (!movie.vote_average && data.imdbRating && data.imdbRating !== "N/A") {
        movie.vote_average = Number(data.imdbRating);
      }
    }
  } catch { /* ignore enrichment error */ }
  return movie;
}

async function enrichResults(results) {
  // Free tier awareness: Parallel fetch with concurrency limit or just basic parallel for search page size (10-18)
  const enrichmentTasks = results.map(enrichWithOmdbPoster);
  return Promise.all(enrichmentTasks);
}

export async function getTrending(page = 1, mediaType = "all") {
  const provider = pickProviderForRequest();
  const runners = getProviderPriority(provider).map(p => ({
    provider: p,
    run: p === PROVIDER.OMDB ? () => omdbGetTrending(page, mediaType) : 
         p === PROVIDER.IMDB236 ? () => imdb236GetTrending(page, mediaType) :
         () => moviesDbGetTrending(page, mediaType)
  })).filter(r => hasProviderForMode(r.provider));

  const result = await runWithProviderFallback(runners);
  if (result.results && provider !== PROVIDER.OMDB) {
    result.results = await enrichResults(result.results);
  }
  return result;
}

export async function searchMovies(query, page = 1, mediaType = "all") {
  const provider = pickProviderForRequest();
  const runners = getProviderPriority(provider).map(p => ({
    provider: p,
    run: p === PROVIDER.OMDB ? () => omdbSearchMovies(query, page, mediaType) : 
         p === PROVIDER.IMDB236 ? () => imdb236SearchMovies(query, page, mediaType) :
         () => moviesDbSearchMovies(query, page, mediaType)
  })).filter(r => hasProviderForMode(r.provider));

  const result = await runWithProviderFallback(runners);
  if (result.results && provider !== PROVIDER.OMDB) {
    result.results = await enrichResults(result.results);
  }
  return result;
}

export async function getMovieDetails(id) {
  const provider = pickProviderForRequest();
  const runners = getProviderPriority(provider).map(p => ({
    provider: p,
    run: p === PROVIDER.OMDB ? () => omdbGetMovieDetails(id) : 
         p === PROVIDER.IMDB236 ? () => imdb236GetMovieDetails(id) :
         () => moviesDbGetMovieDetails(id)
  })).filter(r => hasProviderForMode(r.provider));

  return runWithProviderFallback(runners);
}

export async function prefetchMovieDetails(id) {
  if (movieDetailCache.has(id)) {
    const entry = movieDetailCache.get(id);
    if (Date.now() - entry.timestamp < MOVIE_DETAIL_CACHE_TTL_MS) {
      return entry.data;
    }
  }

  // Avoid redundant in-flight prefetches
  const cacheKey = `prefetch::${id}`;
  return withInFlightRequest(cacheKey, async () => {
    try {
      const data = await getMovieDetails(id);
      movieDetailCache.set(id, { data, timestamp: Date.now() });
      return data;
    } catch {
      return null;
    }
  });
}

// Override getMovieDetails to check cache first
const originalGetMovieDetails = getMovieDetails;
export async function getMovieDetailsCached(id) {
  if (movieDetailCache.has(id)) {
    const entry = movieDetailCache.get(id);
    if (Date.now() - entry.timestamp < MOVIE_DETAIL_CACHE_TTL_MS) {
      return entry.data;
    }
  }
  const data = await originalGetMovieDetails(id);
  movieDetailCache.set(id, { data, timestamp: Date.now() });
  return data;
}

// --- Internal Implementation Helpers ---

function pickProviderForRequest() {
  const pref = getProviderPreference();
  if (pref !== PROVIDER.AUTO) return pref;
  return PROVIDER.OMDB; // Always default to OMDb for reliable instant-load in India
}

function getProviderPriority(primary) {
  if (primary === PROVIDER.OMDB) return [PROVIDER.OMDB, PROVIDER.IMDB236, PROVIDER.MOVIESDB];
  if (primary === PROVIDER.IMDB236) return [PROVIDER.IMDB236, PROVIDER.OMDB, PROVIDER.MOVIESDB];
  return [PROVIDER.MOVIESDB, PROVIDER.IMDB236, PROVIDER.OMDB];
}

async function runWithProviderFallback(runners) {
  const errors = [];
  for (const r of runners) {
    if (isProviderCoolingDown(r.provider)) continue;
    try {
      const result = await r.run();
      updateProviderRuntimeStatus({ usedProvider: r.provider, fallbackUsed: errors.length > 0 });
      return result;
    } catch (e) {
      errors.push(e);
    }
  }
  throw new Error(errors.map(e => e.message).join(" | "));
}

function hasProviderForMode(p) {
  if (p === PROVIDER.OMDB) return hasOmdbKey();
  if (p === PROVIDER.IMDB236) return hasImdb236Key();
  return hasMoviesDbKey();
}

// OMDb trend hack (Improved with high-quality cinematic seeds)
async function omdbGetTrending(page, mediaType) {
  const seeds = ["Marvel", "Batman", "Interstellar", "Inception", "Series", "HBO", "Netflix"];
  const type = mediaType === "tv" ? "series" : mediaType === "movie" ? "movie" : undefined;
  
  const tasks = seeds.map(s => fetchOmdb({ s, type }));
  const responses = await Promise.allSettled(tasks);
  const candidates = [];
  responses.forEach(r => { if (r.status === "fulfilled") candidates.push(...(r.value.Search || [])); });
  
  // Sort by year to feel more "trending"
  const summaries = candidates.map(normalizeOmdbSummary).sort((a,b) => {
    const yearA = parseInt(a.release_date.slice(0,4)) || 0;
    const yearB = parseInt(b.release_date.slice(0,4)) || 0;
    return yearB - yearA;
  });
  
  const start = (page - 1) * FEATURED_PAGE_SIZE;
  return { results: summaries.slice(start, start + FEATURED_PAGE_SIZE), total_pages: 10 };
}

async function omdbSearchMovies(query, page, mediaType) {
  const type = mediaType === "tv" ? "series" : mediaType === "movie" ? "movie" : undefined;
  const data = await fetchOmdb({ s: query, type, page });
  return { results: (data.Search || []).map(normalizeOmdbSummary), total_pages: Math.ceil(Number(data.totalResults || 0) / 10) };
}

async function omdbGetMovieDetails(id) {
  const data = await fetchOmdb({ i: id, plot: "full" });
  return normalizeOmdbDetail(data);
}

// --- RapidAPI Implementations (Simplified) ---

async function imdb236GetTrending(page, mediaType) {
  const endpoint = mediaType === "tv" ? "/api/imdb/top250-tv" : "/api/imdb/top250-movies";
  const data = await fetchImdb236(endpoint);
  const results = (data.results || data).map(normalizeImdb236Summary);
  return { results: results.slice((page-1)*10, page*10), total_pages: 10 };
}

async function imdb236SearchMovies(query, page, mediaType) {
  const type = mediaType === "tv" ? "series" : undefined;
  const data = await fetchImdb236("/api/imdb/search", { query, type });
  const results = (data.results || data.titles || data).map(normalizeImdb236Summary);
  return { results: results.slice((page-1)*10, page*10), total_pages: Math.ceil(results.length/10) };
}

async function imdb236GetMovieDetails(id) {
  const data = await fetchImdb236(`/api/imdb/${extractImdbId(id)}`);
  return normalizeImdb236Detail(data);
}

async function moviesDbGetTrending(page, mediaType) {
  const titleType = mediaType === "tv" ? "tvSeries" : "movie";
  const data = await fetchMoviesDb("/titles", { titleType, limit: 10, page });
  return { results: (data.results || []).map(normalizeMoviesDbSummary), total_pages: 50 };
}

async function moviesDbSearchMovies(query, page, mediaType) {
  const titleType = mediaType === "tv" ? "tvSeries" : "movie";
  const data = await fetchMoviesDb(`/titles/search/title/${encodeURIComponent(query)}`, { titleType, page, limit: 10, exact: "false" });
  return { results: (data.results || []).map(normalizeMoviesDbSummary), total_pages: 50 };
}

async function moviesDbGetMovieDetails(id) {
  const nid = extractImdbId(id);
  const info = await fetchMoviesDb(`/titles/${nid}`, { info: "base_info" });
  return normalizeMovieDbDetail(info.results || info);
}

function normalizeMovieDbDetail(item) {
  const summary = normalizeMoviesDbSummary(item);
  const genres = item?.genres?.map(g => ({ id: g.id, name: g.name })) || [];
  return { ...summary, genres, credits: { cast: [] } };
}

function normalizeImdb236Detail(item) {
  const summary = normalizeImdb236Summary(item);
  const genres = (item?.genres || []).map((name, i) => ({ id: i + 1, name }));
  
  return {
    ...summary,
    genres,
    tagline: item?.tagline || "",
    runtime: item?.runtime || 0,
    vote_count: item?.voteCount || 0,
    credits: {
      crew: (item?.directors || []).map(name => ({ job: "Director", name })),
      cast: (item?.cast || []).map((name, i) => ({ id: i + 1, name, character: "", profile_path: null })),
    },
    videos: { results: [] },
    similar: { results: [] },
  };
}

// --- Secondary Exports ---

export const getPosterUrl = (p) => (p && String(p).startsWith("http") ? p : FALLBACK_POSTER);

/**
 * Returns an array of possible poster URLs in order of preference.
 * Helps SmartImage try multiple sources if one is broken.
 */
export const getPosterSources = (movie) => {
  const sources = [];
  if (movie.poster_path && String(movie.poster_path).startsWith("http")) {
    sources.push(movie.poster_path);
  }
  
  // If we have an ID but no poster or it's a relative path, we can't do much here 
  // without an API call, but we can't do async inside this sync helper.
  // In the real app, enrichResults already populates poster_path from OMDb if missing.
  
  sources.push("./placeholders/poster.svg");
  return [...new Set(sources)];
};

export const getBackdropUrl = (p) => (p && String(p).startsWith("http") ? p : null);
export function getProviderMode() { return getProviderPreference(); }
export function setProviderMode(m) { 
  if (Object.values(PROVIDER).includes(m)) globalThis?.localStorage?.setItem(PROVIDER_OVERRIDE_STORAGE_KEY, m);
  return getProviderPreference();
}
export function getProviderRuntimeStatus() { return { ...lastProviderRuntimeStatus, providerMode: getProviderPreference() }; }
