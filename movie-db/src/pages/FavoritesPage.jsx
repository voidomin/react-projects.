import { useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/useFavorites";
import MovieCard from "../components/MovieCard";

const FAVORITES_VIEW_MODE_KEY = "movie-db-favorites-view-mode";

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();
  const [viewMode, setViewMode] = useState(() => {
    const stored = localStorage.getItem(FAVORITES_VIEW_MODE_KEY);
    return stored === "compact" ? "compact" : "grid";
  });

  const savedLabel = favorites.length === 1 ? "movie saved" : "movies saved";

  function handleViewModeChange(nextMode) {
    setViewMode(nextMode);
    localStorage.setItem(FAVORITES_VIEW_MODE_KEY, nextMode);
  }

  return (
    <div className="favorites-page">
      <h1 className="section-title">My Favorites</h1>
      {favorites.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">No favorites yet</p>
          <p className="state-body">
            Save movies from the home feed to build your watchlist here.
          </p>
          <div className="empty-tips" aria-label="How to add favorites">
            <span>1. Open Home</span>
            <span>2. Pick a title</span>
            <span>3. Press Save</span>
          </div>
          <div className="state-actions center">
            <Link to="/" className="btn-primary">
              Browse Movies
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="favorites-toolbar">
            <p className="fav-count">
              {favorites.length} {savedLabel}
            </p>
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => handleViewModeChange("grid")}
              >
                Grid
              </button>
              <button
                className={`toggle-btn ${viewMode === "compact" ? "active" : ""}`}
                onClick={() => handleViewModeChange("compact")}
              >
                Compact
              </button>
            </div>
          </div>
          <div
            className={`movie-grid ${viewMode === "compact" ? "movie-grid-compact" : ""}`}
          >
            {favorites.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                compact={viewMode === "compact"}
                showQuickRemove
                onQuickRemove={removeFavorite}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
