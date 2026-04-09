import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { getPosterUrl } from "../utils/movieApi";
import { useFavorites } from "../context/useFavorites";
import SmartImage from "./SmartImage";

function getRatingClass(rating) {
  if (rating >= 7) return "high";
  if (rating >= 5) return "mid";
  return "low";
}

export default function MovieCard({
  movie,
  compact = false,
  showQuickRemove = false,
  onQuickRemove,
}) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const fav = isFavorite(movie.id);

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";
  const hasRating =
    typeof movie.vote_average === "number" &&
    Number.isFinite(movie.vote_average);
  const rating = hasRating ? movie.vote_average.toFixed(1) : null;
  const typeLabel = movie.media_type === "tv" ? "TV Series" : "Movie";

  function handleQuickRemove(event) {
    event.stopPropagation();
    if (onQuickRemove) {
      onQuickRemove(movie.id);
    }
  }

  return (
    <div className={`movie-card ${compact ? "compact" : ""}`}>
      <div className="card-poster-shell">
        {showQuickRemove && (
          <button
            className="quick-remove-btn"
            onClick={handleQuickRemove}
            aria-label={`Remove ${movie.title} from favorites`}
            title="Remove from favorites"
          >
            Remove
          </button>
        )}
        <Link to={`/movie/${movie.id}`} className="movie-card-link">
          <div className="card-poster-wrapper">
            <SmartImage
              src={getPosterUrl(movie.poster_path)}
              fallbackSrc={getPosterUrl(null)}
              alt={movie.title}
              className="card-poster"
              wrapperClassName="card-poster-image"
              loading="lazy"
            />
            <div className="card-overlay">
              <p className="card-overview">
                {movie.overview || "No description available."}
              </p>
            </div>
          </div>
        </Link>
      </div>
      <div className="card-info">
        <Link to={`/movie/${movie.id}`} className="card-title">
          {movie.title}
        </Link>
        <div className="card-meta">
          <span className="card-year">{year}</span>
          {rating ? (
            <span className={`card-rating ${getRatingClass(Number(rating))}`}>
              {rating}/10
            </span>
          ) : (
            <span className="card-format">{typeLabel}</span>
          )}
        </div>
        <button
          className={`fav-btn ${fav ? "fav-active" : ""}`}
          onClick={() => toggleFavorite(movie)}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          title={fav ? "Remove from favorites" : "Add to favorites"}
        >
          {fav ? "♥ Saved" : "♡ Save"}
        </button>
      </div>
    </div>
  );
}

MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    release_date: PropTypes.string,
    vote_average: PropTypes.number,
    media_type: PropTypes.string,
    poster_path: PropTypes.string,
    overview: PropTypes.string,
  }).isRequired,
  compact: PropTypes.bool,
  showQuickRemove: PropTypes.bool,
  onQuickRemove: PropTypes.func,
};
