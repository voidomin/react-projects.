import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getTrending,
  searchMovies,
  getProviderRuntimeStatus,
  getProviderMode,
  setProviderMode as applyProviderMode,
} from "../utils/movieApi";
import SearchBar from "../components/SearchBar";
import MovieCard from "../components/MovieCard";
import Hero from "../components/Hero";
import GenreFilter from "../components/GenreFilter";

const HOME_SKELETON_COUNT = 10;
const RECENT_SEARCHES_STORAGE_KEY = "movie-db-recent-searches";
const HOME_FEED_CACHE_STORAGE_KEY = "movie-db-home-feed-cache-v1";
const HOME_FEED_CACHE_TTL_MS = 2 * 60 * 1000;
const MAX_RECENT_SEARCHES = 6;
const USER_MEDIA_TYPE_PREFERENCE_KEY = "movie-db-media-type-preference";
const HOME_SKELETON_IDS = Array.from(
  { length: HOME_SKELETON_COUNT },
  (_, index) => `home-skeleton-${index + 1}`,
);

function getMovieYear(movie) {
  if (!movie.release_date) return null;
  const year = Number(movie.release_date.slice(0, 4));
  return Number.isFinite(year) ? year : null;
}

function buildFeedCacheKey(
  searchQuery,
  pageNum,
  mediaType = "all",
  providerMode = "auto",
) {
  return `${searchQuery || "featured"}::${mediaType}::${providerMode}::${pageNum}`;
}

function readFeedCacheEntry(cacheKey) {
  try {
    const raw = localStorage.getItem(HOME_FEED_CACHE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const entry = parsed?.[cacheKey];
    if (!entry || !Array.isArray(entry.results)) return null;
    return entry;
  } catch {
    return null;
  }
}

function writeFeedCacheEntry(cacheKey, value) {
  try {
    const raw = localStorage.getItem(HOME_FEED_CACHE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[cacheKey] = value;
    localStorage.setItem(HOME_FEED_CACHE_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore cache write failures.
  }
}

function mergeUniqueMovies(previousMovies, nextMovies) {
  const seen = new Set(previousMovies.map((movie) => movie.id));
  const merged = [...previousMovies];

  nextMovies.forEach((movie) => {
    if (!seen.has(movie.id)) {
      seen.add(movie.id);
      merged.push(movie);
    }
  });

  return merged;
}

function providerLabel(provider) {
  if (provider === "imdb236") return "IMDb236";
  if (provider === "moviesdb") return "MoviesDatabase";
  if (provider === "omdb") return "OMDb";
  return provider || "Unknown";
}

function buildProviderNotice(status) {
  if (!status?.usedProvider && (!status?.coolingDownProviders || status.coolingDownProviders.length === 0)) {
    return null;
  }

  const used = providerLabel(status.usedProvider);
  const rateLimited = (status.rateLimitedProviders || []).map(providerLabel);
  const coolingDown = (status.coolingDownProviders || []).map(providerLabel);

  const segments = [];
  if (status.usedProvider) {
    segments.push(
      status.fallbackUsed
        ? `Using fallback provider: ${used}`
        : `Using provider: ${used}`,
    );
  }
  if (rateLimited.length > 0) {
    segments.push(`Rate limited: ${rateLimited.join(", ")}`);
  }
  if (coolingDown.length > 0) {
    segments.push(`Cooling down: ${coolingDown.join(", ")}`);
  }

  return {
    tone:
      status.fallbackUsed || rateLimited.length > 0 || coolingDown.length > 0
        ? "warning"
        : "info",
    message: segments.join(" | "),
  };
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [movies, setMovies] = useState([]);
  const [searchText, setSearchText] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState("relevance");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeGenre, setActiveGenre] = useState("");
  const [mediaType, setMediaType] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_MEDIA_TYPE_PREFERENCE_KEY);
      return saved === "tv" || saved === "movie" ? saved : "all";
    } catch {
      return "all";
    }
  });
  const [providerMode, setProviderMode] = useState(() => getProviderMode());
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed.filter((value) => typeof value === "string")
        : [];
    } catch {
      return [];
    }
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [providerNotice, setProviderNotice] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const loadMoreTriggerRef = useRef(null);

  const availableTypes = useMemo(() => {
    const types = new Set(movies.map((movie) => movie.media_type || "movie"));
    return ["all", ...Array.from(types).sort((a, b) => a.localeCompare(b))];
  }, [movies]);

  const hasActiveFilters =
    typeFilter !== "all" || yearFrom !== "" || yearTo !== "" || activeGenre !== "";
  const canLoadMore = !loading && !error && page < totalPages;

  const featuredMovie = useMemo(() => {
    return movies.length > 0 ? movies[0] : null;
  }, [movies]);

  const displayedMovies = useMemo(() => {
    const filteredMovies = movies.filter((movie) => {
      const movieType = movie.media_type || "movie";
      const movieOverview = (movie.overview || "").toLowerCase();
      const movieTitle = (movie.title || "").toLowerCase();

      if (typeFilter !== "all" && movieType !== typeFilter) {
        return false;
      }

      if (activeGenre && 
          !movieOverview.includes(activeGenre.toLowerCase()) && 
          !movieTitle.includes(activeGenre.toLowerCase())) {
        return false;
      }
      const movieYear = getMovieYear(movie);

      if (typeFilter !== "all" && movieType !== typeFilter) {
        return false;
      }

      if (
        yearFrom !== "" &&
        (movieYear === null || movieYear < Number(yearFrom))
      ) {
        return false;
      }

      if (yearTo !== "" && (movieYear === null || movieYear > Number(yearTo))) {
        return false;
      }

      return true;
    });

    const workingMovies = [...filteredMovies];

    if (sortBy === "relevance") {
      if (query) {
        return workingMovies;
      }

      return workingMovies.sort((a, b) => {
        const yearA = getMovieYear(a) ?? -1;
        const yearB = getMovieYear(b) ?? -1;
        return yearB - yearA;
      });
    }

    if (sortBy === "year-desc") {
      return workingMovies.sort((a, b) => {
        const yearA = getMovieYear(a) ?? -1;
        const yearB = getMovieYear(b) ?? -1;
        return yearB - yearA;
      });
    }

    if (sortBy === "year-asc") {
      return workingMovies.sort((a, b) => {
        const yearA = getMovieYear(a) ?? 9999;
        const yearB = getMovieYear(b) ?? 9999;
        return yearA - yearB;
      });
    }

    if (sortBy === "title-desc") {
      return workingMovies.sort((a, b) => b.title.localeCompare(a.title));
    }

    return workingMovies.sort((a, b) => a.title.localeCompare(b.title));
  }, [movies, query, sortBy, typeFilter, yearFrom, yearTo]);

  const fetchMovies = useCallback(
    async (searchQuery, pageNum) => {
      const cacheKey = buildFeedCacheKey(
        searchQuery,
        pageNum,
        mediaType,
        providerMode,
      );
      const cachedEntry = readFeedCacheEntry(cacheKey);
      const now = Date.now();
      const isFreshCache =
        Boolean(cachedEntry?.timestamp) &&
        now - cachedEntry.timestamp <= HOME_FEED_CACHE_TTL_MS;

      if (cachedEntry && pageNum === 1) {
        setMovies(cachedEntry.results);
        setTotalPages(cachedEntry.total_pages ?? 1);
        setError(null);
      }

      if (cachedEntry && pageNum > 1 && isFreshCache) {
        setMovies((prev) => mergeUniqueMovies(prev, cachedEntry.results));
        setTotalPages(cachedEntry.total_pages ?? 1);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        let data;
        if (searchQuery) {
          data = await searchMovies(searchQuery, pageNum, mediaType);
        } else {
          data = await getTrending(pageNum, mediaType);
        }

        const normalizedResults = data.results ?? [];
        if (pageNum === 1) {
          setMovies(normalizedResults);
        } else {
          setMovies((prev) => mergeUniqueMovies(prev, normalizedResults));
        }
        setTotalPages(data.total_pages ?? 1);

        setProviderNotice(buildProviderNotice(getProviderRuntimeStatus()));

        writeFeedCacheEntry(cacheKey, {
          timestamp: now,
          total_pages: data.total_pages ?? 1,
          results: normalizedResults,
        });
      } catch (err) {
        setError(err.message);
        setProviderNotice(buildProviderNotice(getProviderRuntimeStatus()));
      } finally {
        setLoading(false);
      }
    },
    [mediaType, providerMode],
  );

  const addRecentSearch = useCallback((term) => {
    const normalized = term.trim();
    if (!normalized) return;

    setRecentSearches((prev) => {
      const deduped = prev.filter(
        (item) => item.toLowerCase() !== normalized.toLowerCase(),
      );
      const next = [normalized, ...deduped].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    setPage(1);
    fetchMovies(query, 1);
  }, [query, mediaType, providerMode, fetchMovies]);

  // Handle URL param changes (e.g. from genre click)
  useEffect(() => {
    const fromUrl = searchParams.get("query");
    if (fromUrl !== null && fromUrl !== query) {
      setSearchText(fromUrl);
      setQuery(fromUrl);
    }
  }, [searchParams, query]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      const trimmed = searchText.trim();
      setQuery((prev) => (prev === trimmed ? prev : trimmed));

      if (trimmed) {
        addRecentSearch(trimmed);
        setSearchParams({ query: trimmed });
      } else {
        setSearchParams({});
      }
    }, 450);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchText, addRecentSearch, setSearchParams]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = document.documentElement.scrollTop || document.body.scrollTop;
      setShowScrollTop(scrolled > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleMediaTypeChange(newMediaType) {
    setMediaType(newMediaType);
    // Avoid conflict with the secondary type filter when switching source mode.
    setTypeFilter("all");
    try {
      localStorage.setItem(USER_MEDIA_TYPE_PREFERENCE_KEY, newMediaType);
    } catch {
      // Ignore localStorage errors
    }
  }

  function handleProviderModeChange(event) {
    const nextMode = event.target.value;
    const appliedMode = applyProviderMode(nextMode);
    setProviderMode(appliedMode);
    setPage(1);
  }

  useEffect(() => {
    if (!availableTypes.includes(typeFilter)) {
      setTypeFilter("all");
    }
  }, [availableTypes, typeFilter]);

  function handleSearchInputChange(value) {
    setSearchText(value);
  }

  function handleSearchSubmit() {
    const trimmed = searchText.trim();
    setSearchText(trimmed);
    setQuery(trimmed);
    if (trimmed) {
      addRecentSearch(trimmed);
      setSearchParams({ query: trimmed });
    } else {
      setSearchParams({});
    }
  }

  function handleSelectRecentSearch(term) {
    setSearchText(term);
    setQuery(term);
    addRecentSearch(term);
    setSearchParams({ query: term });
  }

  function handleClearRecentSearches() {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
  }

  function handleRetry() {
    setPage(1);
    fetchMovies(query, 1);
  }

  function handleClearSearch() {
    setSearchText("");
    setQuery("");
    setSearchParams({});
  }

  function handleResetFilters() {
    setTypeFilter("all");
    setActiveGenre("");
    setYearFrom("");
    setYearTo("");
  }

  function loadMore() {
    if (loading || page >= totalPages) return;
    const next = page + 1;
    setPage(next);
    fetchMovies(query, next);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;
    if (!trigger || !canLoadMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "300px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [canLoadMore, loadMore]);

  let emptyStateMessage = "We could not load featured picks right now.";

  if (query && !hasActiveFilters) {
    emptyStateMessage = `No titles matched "${query}". Try fewer words or a different movie name.`;
  }

  if (hasActiveFilters) {
    emptyStateMessage =
      "No titles match the current filters. Try widening the year range or changing type.";
  }

  return (
    <div className="home-page">
      {!query && <Hero movie={featuredMovie} />}

      <section className="main-section">
        {!query && (
          <GenreFilter 
            activeGenre={activeGenre} 
            onGenreChange={setActiveGenre} 
          />
        )}

        <div className="section-header">
          <div className="section-info">
            <h2>{query ? `Results for "${query}"` : "Trending Now"}</h2>
            <p>{displayedMovies.length} titles available</p>
          </div>
          
          <div className="toolbar-controls">
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevance">Trending</option>
              <option value="year-desc">Newest First</option>
              <option value="year-asc">Oldest First</option>
              <option value="title-asc">A-Z</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="error-box">
            <p className="state-title">Something went wrong</p>
            <p className="state-body">{error}</p>
            <button className="btn-primary" onClick={handleRetry} style={{ marginTop: '1rem' }}>
              Try Again
            </button>
          </div>
        )}

        {!error && (
          <>
            <AnimatePresence mode="popLayout">
              {loading && movies.length === 0 ? (
                <div className="movie-grid" aria-hidden="true">
                  {HOME_SKELETON_IDS.map((id) => (
                    <div key={id} className="movie-card movie-card-skeleton">
                      <div className="skeleton-block skeleton-poster" />
                    </div>
                  ))}
                </div>
              ) : displayedMovies.length === 0 && !loading ? (
                <div className="empty-state">
                  <p className="state-body">{emptyStateMessage}</p>
                  <button className="btn-primary" onClick={handleResetFilters} style={{ marginTop: '1rem' }}>
                    Reset Discovery
                  </button>
                </div>
              ) : (
                <motion.div 
                  key="grid"
                  className="movie-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {displayedMovies.map((movie, index) => (
                    <MovieCard key={`${movie.id}-${index}`} movie={movie} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {loading && movies.length > 0 && (
              <div className="spinner">Loading more...</div>
            )}
            
            {canLoadMore && (
              <div ref={loadMoreTriggerRef} style={{ height: '100px' }} />
            )}
          </>
        )}
      </section>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="scroll-top-btn"
            onClick={scrollToTop}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
