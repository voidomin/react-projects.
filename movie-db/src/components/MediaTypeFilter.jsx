import PropTypes from "prop-types";
import "./MediaTypeFilter.css";

export default function MediaTypeFilter({
  mediaType,
  onMediaTypeChange,
  availableTypes = ["all", "movie", "tv"],
}) {
  const getLabel = (type) => {
    const labels = {
      all: "All",
      movie: "Movies",
      tv: "TV Shows",
    };
    return labels[type] || type;
  };

  return (
    <div className="media-type-filter">
      <label htmlFor="media-type-select" className="filter-label">
        Content Type:
      </label>
      <select
        id="media-type-select"
        value={mediaType}
        onChange={(e) => onMediaTypeChange(e.target.value)}
        className="media-type-select"
      >
        {availableTypes.includes("all") && (
          <option value="all">All Content</option>
        )}
        {availableTypes.includes("movie") && (
          <option value="movie">Movies Only</option>
        )}
        {availableTypes.includes("tv") && (
          <option value="tv">TV Shows Only</option>
        )}
      </select>

      <div className="media-type-buttons">
        {availableTypes.includes("all") && (
          <button
            onClick={() => onMediaTypeChange("all")}
            className={`media-btn ${mediaType === "all" ? "active" : ""}`}
            aria-pressed={mediaType === "all"}
            title="Show all content types"
          >
            {getLabel("all")}
          </button>
        )}
        {availableTypes.includes("movie") && (
          <button
            onClick={() => onMediaTypeChange("movie")}
            className={`media-btn ${mediaType === "movie" ? "active" : ""}`}
            aria-pressed={mediaType === "movie"}
            title="Show movies only"
          >
            {getLabel("movie")}
          </button>
        )}
        {availableTypes.includes("tv") && (
          <button
            onClick={() => onMediaTypeChange("tv")}
            className={`media-btn ${mediaType === "tv" ? "active" : ""}`}
            aria-pressed={mediaType === "tv"}
            title="Show TV shows only"
          >
            {getLabel("tv")}
          </button>
        )}
      </div>
    </div>
  );
}

MediaTypeFilter.propTypes = {
  mediaType: PropTypes.oneOf(["all", "movie", "tv"]).isRequired,
  onMediaTypeChange: PropTypes.func.isRequired,
  availableTypes: PropTypes.arrayOf(PropTypes.string),
};
