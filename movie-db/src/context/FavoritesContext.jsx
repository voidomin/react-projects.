import { useCallback, useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import FavoritesContext from "./favoritesContextValue";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("movie-db-favorites")) ?? [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("movie-db-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = useCallback((movie) => {
    setFavorites((prev) => {
      if (prev.some((m) => m.id === movie.id)) return prev;
      return [...prev, movie];
    });
  }, []);

  const removeFavorite = useCallback((movieId) => {
    setFavorites((prev) => prev.filter((m) => m.id !== movieId));
  }, []);

  const isFavorite = useCallback(
    (movieId) => {
      return favorites.some((m) => m.id === movieId);
    },
    [favorites],
  );

  const toggleFavorite = useCallback(
    (movie) => {
      if (isFavorite(movie.id)) {
        removeFavorite(movie.id);
      } else {
        addFavorite(movie);
      }
    },
    [addFavorite, isFavorite, removeFavorite],
  );

  const value = useMemo(
    () => ({ favorites, toggleFavorite, isFavorite, removeFavorite }),
    [favorites, isFavorite, removeFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

FavoritesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
