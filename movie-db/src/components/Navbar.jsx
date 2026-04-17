import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useFavorites } from "../context/useFavorites";
import CommandPalette from "./CommandPalette";

const THEME_STORAGE_KEY = "movie-db-theme";
const THEME_OPTIONS = ["dark", "light"];

function getInitialTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (THEME_OPTIONS.includes(storedTheme)) {
    return storedTheme;
  }
  return "dark"; // Default to cinematic dark
}

export default function Navbar() {
  const { favorites } = useFavorites();
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const nextThemeLabel = theme === "dark" ? "Light Mode" : "Dark Mode";

  function handleThemeToggle() {
    setTheme(prev => prev === "dark" ? "light" : "dark");
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
