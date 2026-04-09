import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { searchMovies } from "../utils/movieApi";

const RECENT_SEARCHES_STORAGE_KEY = "movie-db-recent-searches";

function getMovieYear(movie) {
  if (!movie?.release_date) return "";
  return movie.release_date.slice(0, 4);
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Get recent searches from localStorage
  const getRecentSearches = useCallback(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      return stored ? JSON.parse(stored).slice(0, 3) : [];
    } catch {
      return [];
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Open palette with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
        setQuery("");
        setResults([]);
        setSelectedIndex(-1);
      }

      // If palette is open, handle navigation keys
      if (isOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          setIsOpen(false);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : prev,
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === "Enter" && selectedIndex >= 0) {
          e.preventDefault();
          const selected = results[selectedIndex];
          if (selected?.id) {
            navigate(`/movie/${selected.id}`);
            setIsOpen(false);
            setQuery("");
            setResults([]);
            setSelectedIndex(-1);
          }
        }
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, navigate]);

  // Auto-focus input when palette opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 0);
    }
  }, [isOpen]);

  // Debounced search API call
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await searchMovies(query);
        setResults(data.results || []);
        setSelectedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (e.target.closest(".command-palette-overlay")) {
        if (!e.target.closest(".command-palette-content")) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  const recentSearches = getRecentSearches();
  const displayResults = query.trim() ? results : [];
  const showRecent = !query.trim() && recentSearches.length > 0;

  return (
    <>
      {/* Command Palette Trigger Hint */}
      {!isOpen && (
        <button
          className="command-palette-trigger"
          onClick={() => setIsOpen(true)}
          type="button"
          aria-label="Open search palette"
        >
          <span className="command-palette-trigger-text">Search movies...</span>
          <kbd>⌘K</kbd>
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div className="command-palette-overlay">
          <div className="command-palette-content">
            {/* Search Input */}
            <div className="command-palette-input-wrap">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search movies, actors, directors..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="command-palette-input"
                autoComplete="off"
              />
              {isLoading && (
                <div className="command-palette-loading" aria-hidden="true" />
              )}
            </div>

            {/* Results or Recent Searches */}
            <div className="command-palette-results">
              {showRecent && (
                <>
                  <div className="command-palette-section-title">
                    Recent Searches
                  </div>
                  <div className="command-palette-list">
                    {recentSearches.map((search, index) => (
                      <button
                        key={search}
                        className={`command-palette-item recent-item ${index === selectedIndex ? "selected" : ""}`}
                        onClick={() => {
                          setQuery(search);
                          setSelectedIndex(-1);
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <span className="item-label">🕐</span>
                        <span className="item-text">{search}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {displayResults.length > 0 && (
                <>
                  <div className="command-palette-section-title">Movies</div>
                  <div className="command-palette-list">
                    {displayResults.slice(0, 8).map((movie, index) => (
                      <button
                        key={movie.id}
                        className={`command-palette-item ${index === selectedIndex ? "selected" : ""}`}
                        onClick={() => {
                          navigate(`/movie/${movie.id}`);
                          setIsOpen(false);
                          setQuery("");
                          setResults([]);
                          setSelectedIndex(-1);
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <img
                          src={movie.poster_path ?? ""}
                          alt={movie.title}
                          className="item-poster"
                        />
                        <div className="item-details">
                          <div className="item-title">{movie.title}</div>
                          <div className="item-year">{getMovieYear(movie)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {query.trim() && displayResults.length === 0 && !isLoading && (
                <div className="command-palette-empty">
                  <p>No movies found for "{query}"</p>
                  <p className="hint">Try a different search term</p>
                </div>
              )}

              {isLoading && displayResults.length === 0 && (
                <div className="command-palette-empty">
                  <p>Searching...</p>
                </div>
              )}
            </div>

            {/* Footer Hint */}
            <div className="command-palette-footer">
              <span>
                {selectedIndex >= 0 ? (
                  <>
                    Press <kbd>Enter</kbd> to select
                  </>
                ) : (
                  <>
                    Press <kbd>↑↓</kbd> to navigate, <kbd>Esc</kbd> to close
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
