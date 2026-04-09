import PropTypes from "prop-types";

export default function SearchBar({ value, onChange, onSubmit, onClear }) {
  function handleSubmit(event) {
    event.preventDefault();
    onSubmit();
  }

  function handleClear() {
    onClear();
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <input
        type="search"
        className="search-input"
        placeholder="Search movies..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Search movies"
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          className="search-clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          Clear
        </button>
      )}
      <button type="submit" className="search-btn" aria-label="Submit search">
        Search
      </button>
    </form>
  );
}

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};
