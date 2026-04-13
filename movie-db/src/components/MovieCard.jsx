import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { getPosterSources, prefetchMovieDetails } from "../utils/movieApi";
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

  function handlePrefetch() {
    prefetchMovieDetails(movie.id);
  }

  return (
    <motion.div
      className={`movie-card ${compact ? "compact" : ""}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onMouseEnter={handlePrefetch}
    >
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
              srcs={getPosterSources(movie)}
              alt={movie.title}
              className="card-poster"
              wrapperClassName="card-poster-image"
              loading="lazy"
            />
            <motion.div
              className="card-overlay"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              <p className="card-overview">
                {movie.overview || "No description available."}
              </p>
            </motion.div>
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
    </motion.div>
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
