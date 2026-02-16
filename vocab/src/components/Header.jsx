import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../context/ThemeContext";
import Preferences from "./Preferences";

export default function Header({ onChangeTab, activeTab }) {
  const { mode, toggleMode } = useTheme();
  const [prefsOpen, setPrefsOpen] = useState(false);

  return (
    <header className="header container">
      <h1 className="text-3xl md:text-4xl font-bold text-amber-50">Vocab</h1>
      <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
        <div className="tabs w-full md:w-auto">
          <button
            onClick={() => onChangeTab("manage")}
            aria-pressed={activeTab === "manage"}
            className={activeTab === "manage" ? "bg-amber-700" : ""}
          >
            Manage
          </button>
          <button
            onClick={() => onChangeTab("flashcards")}
            aria-pressed={activeTab === "flashcards"}
            className={activeTab === "flashcards" ? "bg-amber-700" : ""}
          >
            Flashcards
          </button>
          <button
            onClick={() => onChangeTab("review")}
            aria-pressed={activeTab === "review"}
            className={activeTab === "review" ? "bg-amber-700" : ""}
          >
            Review
          </button>
          <button
            onClick={() => onChangeTab("stats")}
            aria-pressed={activeTab === "stats"}
            className={activeTab === "stats" ? "bg-amber-700" : ""}
          >
            Stats
          </button>
        </div>

        <div className="flex gap-2 md:gap-3 w-full md:w-auto">
          <button
            className="btn flex-1 md:flex-none"
            onClick={() => setPrefsOpen(true)}
          >
            Prefs
          </button>
          <button
            className="btn-accent flex-1 md:flex-none"
            onClick={toggleMode}
          >
            {mode === "dark" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      {prefsOpen && <Preferences onClose={() => setPrefsOpen(false)} />}
    </header>
  );
}

Header.propTypes = {
  onChangeTab: PropTypes.func.isRequired,
  activeTab: PropTypes.oneOf(["manage", "flashcards", "review", "stats"])
    .isRequired,
};
