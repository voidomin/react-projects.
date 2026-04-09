import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useFavorites } from "../context/useFavorites";
import CommandPalette from "./CommandPalette";

const THEME_STORAGE_KEY = "movie-db-theme";
const THEME_OPTIONS = ["sand", "sage", "cocoa"];

function getInitialTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (THEME_OPTIONS.includes(storedTheme)) {
    return storedTheme;
  }
  return "sand";
}

export default function Navbar() {
  const { favorites } = useFavorites();
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const nextThemeLabel = useMemo(() => {
    if (theme === "sand") return "Sage";
    if (theme === "sage") return "Cocoa";
    return "Sand";
  }, [theme]);

  function handleThemeToggle() {
    setTheme((prev) => {
      const currentIndex = THEME_OPTIONS.indexOf(prev);
      const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
      return THEME_OPTIONS[nextIndex];
    });
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <span>MovieDB</span>
      </Link>
      <div className="navbar-actions">
        <button
          type="button"
          className="theme-toggle"
          onClick={handleThemeToggle}
          aria-label={`Switch theme. Next theme ${nextThemeLabel}`}
          title={`Theme: ${theme}. Next: ${nextThemeLabel}`}
        >
          Theme
        </button>
        <CommandPalette />
        <nav className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Favorites
            {favorites.length > 0 && (
              <span className="fav-badge">{favorites.length}</span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
