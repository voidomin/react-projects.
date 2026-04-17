import PropTypes from "prop-types";

const GENRES = [
  "Action", "Comedy", "Drama", "Horror", "Sci-Fi", 
  "Thriller", "Animation", "Documentary", "Mystery"
];

export default function GenreFilter({ activeGenre, onGenreChange }) {
  return (
    <div className="genre-filter-container">
      <div className="genre-scroll">
        <button 
          className={`genre-chip ${!activeGenre ? 'active' : ''}`}
          onClick={() => onGenreChange("")}
        >
          All Genres
        </button>
        {GENRES.map(genre => (
          <button 
            key={genre}
            className={`genre-chip ${activeGenre === genre ? 'active' : ''}`}
            onClick={() => onGenreChange(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
}

GenreFilter.propTypes = {
  activeGenre: PropTypes.string,
  onGenreChange: PropTypes.func.isRequired
};
