import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useParams, Link } from "react-router-dom";
import {
  getMovieDetails,
  getPosterUrl,
  getBackdropUrl,
} from "../utils/movieApi";
import { useFavorites } from "../context/useFavorites";
import MovieCard from "../components/MovieCard";
import SmartImage from "../components/SmartImage";

const CAST_SKELETON_IDS = Array.from(
  { length: 6 },
  (_, index) => `cast-skeleton-${index + 1}`,
);

export default function MovieDetailPage() {
  const { id } = useParams();
  return <MovieDetailContent key={id} id={id} />;
}

function MovieDetailContent({ id }) {
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  const [copyState, setCopyState] = useState("idle");
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    let ignore = false;

    async function loadMovie() {
      try {
        const data = await getMovieDetails(id);

        if (!ignore) {
          setMovie(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      }
    }

    loadMovie();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (!movie && !error) {
    return (
      <div className="detail-page detail-page-loading" aria-hidden="true">
        <div className="detail-content">
          <div className="detail-top detail-top-skeleton">
            <div className="skeleton-block detail-poster detail-poster-skeleton" />
            <div className="detail-info detail-info-skeleton">
              <div className="skeleton-block skeleton-line skeleton-line-heading" />
              <div className="skeleton-block skeleton-line skeleton-line-subheading" />
              <div className="detail-meta detail-meta-skeleton">
                <div className="skeleton-block skeleton-pill" />
                <div className="skeleton-block skeleton-pill" />
                <div className="skeleton-block skeleton-pill" />
              </div>
              <div className="detail-genres detail-genres-skeleton">
                <div className="skeleton-block skeleton-pill" />
                <div className="skeleton-block skeleton-pill" />
                <div className="skeleton-block skeleton-pill" />
              </div>
              <div className="skeleton-block skeleton-line skeleton-line-body" />
              <div className="skeleton-block skeleton-line skeleton-line-body" />
              <div className="skeleton-block skeleton-line skeleton-line-body short" />
              <div className="detail-actions detail-actions-skeleton">
                <div className="skeleton-block skeleton-button skeleton-button-large" />
                <div className="skeleton-block skeleton-button skeleton-button-large skeleton-button-secondary" />
              </div>
            </div>
          </div>
          <section className="detail-section detail-section-skeleton">
            <div className="skeleton-block skeleton-line skeleton-line-section" />
            <div className="cast-grid">
              {CAST_SKELETON_IDS.map((skeletonId) => (
                <div key={skeletonId} className="cast-card">
                  <div className="skeleton-block cast-photo" />
                  <div className="skeleton-block skeleton-line skeleton-line-cast" />
                  <div className="skeleton-block skeleton-line skeleton-line-cast short" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-box">
        <p>{error}</p>
      </div>
    );
  }

  if (!movie) return null;

  const fav = isFavorite(movie.id);
  const trailer = movie.videos?.results?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube",
  );
  const backdrop = getBackdropUrl(movie.backdrop_path);
  const directors =
    movie.credits?.crew?.filter((crew) => crew.job === "Director") ?? [];
  const cast = movie.credits?.cast?.slice(0, 8) ?? [];
  const similar = movie.similar?.results?.slice(0, 6) ?? [];
  const hours = Math.floor((movie.runtime ?? 0) / 60);
  const mins = (movie.runtime ?? 0) % 60;
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  const votes = movie.vote_count ? movie.vote_count.toLocaleString() : "N/A";

  async function handleCopyLink() {
    const shareUrl = globalThis.location?.href || `/movie/${movie.id}`;

    try {
      if (!globalThis.navigator?.clipboard?.writeText) {
        throw new Error("Clipboard API not available");
      }

      await globalThis.navigator.clipboard.writeText(shareUrl);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("failed");
      setTimeout(() => setCopyState("idle"), 2200);
    }
  }

  return (
    <div className="detail-page">
      {backdrop && (
        <div
          className="detail-backdrop"
          style={{ backgroundImage: `url(${backdrop})` }}
        />
      )}
      <div className="detail-content">
        <div className="detail-top">
          <SmartImage
            src={getPosterUrl(movie.poster_path, "w342")}
            fallbackSrc={getPosterUrl(null)}
            alt={movie.title}
            className="detail-poster"
            wrapperClassName="detail-poster-wrap"
            loading="eager"
          />
          <div className="detail-info">
            <h1 className="detail-title">{movie.title}</h1>
            {movie.tagline && (
              <p className="detail-tagline">"{movie.tagline}"</p>
            )}
            <div className="detail-meta">
              <span>Year: {movie.release_date?.slice(0, 4) ?? "N/A"}</span>
              {movie.runtime > 0 && (
                <span>
                  Runtime: {hours}h {mins}m
                </span>
              )}
              <span>Rating: {rating} / 10</span>
              <span>Votes: {votes}</span>
            </div>
            <div className="detail-genres">
              {(movie.genres ?? []).map((genre) => (
                <span key={genre.id} className="genre-badge">
                  {genre.name}
                </span>
              ))}
            </div>
            <p className="detail-overview">{movie.overview}</p>
            {directors.length > 0 && (
              <p className="detail-director">
                <strong>Director{directors.length > 1 ? "s" : ""}:</strong>{" "}
                {directors.map((director) => director.name).join(", ")}
              </p>
            )}
            <div className="detail-actions">
              <button
                className={`fav-btn large ${fav ? "fav-active" : ""}`}
                onClick={() => toggleFavorite(movie)}
              >
                {fav ? "Remove from Favorites" : "Add to Favorites"}
              </button>
              <button className="share-btn" onClick={handleCopyLink}>
                {copyState === "copied" ? "Link copied" : "Copy link"}
              </button>
              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trailer-btn"
                >
                  Watch Trailer
                </a>
              )}
            </div>
            {copyState === "failed" && (
              <p className="share-status">
                Could not copy automatically. Copy the URL from your browser
                bar.
              </p>
            )}
          </div>
        </div>

        {cast.length > 0 && (
          <section className="detail-section">
            <h2>Top Cast</h2>
            <div className="cast-grid">
              {cast.map((actor) => (
                <div key={actor.id} className="cast-card">
                  <SmartImage
                    src={getPosterUrl(actor.profile_path, "w185")}
                    fallbackSrc="/placeholders/cast.svg"
                    alt={actor.name}
                    className="cast-photo"
                    wrapperClassName="cast-photo-wrap"
                    loading="lazy"
                  />
                  <p className="cast-name">{actor.name}</p>
                  <p className="cast-character">
                    {actor.character || "Cast member"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {similar.length > 0 && (
          <section className="detail-section">
            <h2>Similar Movies</h2>
            <div className="movie-grid">
              {similar.map((item) => (
                <MovieCard key={item.id} movie={item} />
              ))}
            </div>
          </section>
        )}

        <Link to="/" className="back-link">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

MovieDetailContent.propTypes = {
  id: PropTypes.string.isRequired,
};
