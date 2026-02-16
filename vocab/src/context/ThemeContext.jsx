import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const PALETTES = {
  modern: {
    name: "Modern Purple",
    light: {
      "--bg": "#f5f3f8",
      "--card": "#faf9fc",
      "--text": "#0b1020",
      "--muted": "#6b7280",
      "--accent": "#8b5cf6",
      "--accent-2": "#7c3aed",
    },
    dark: {
      "--bg": "#120b1f",
      "--card": "#1a0f26",
      "--text": "#e9e6f6",
      "--muted": "#9aa4b2",
      "--accent": "#d6b3ff",
      "--accent-2": "#c084fc",
    },
  },
  forest: {
    name: "Forest Green",
    light: {
      "--bg": "#f3fbf6",
      "--card": "#faf9f7",
      "--text": "#052018",
      "--muted": "#4b5563",
      "--accent": "#16a34a",
      "--accent-2": "#059669",
    },
    dark: {
      "--bg": "#07120b",
      "--card": "#0b1a12",
      "--text": "#e6f6ed",
      "--muted": "#93a6a1",
      "--accent": "#7ee787",
      "--accent-2": "#34d399",
    },
  },
  amber: {
    name: "Warm Amber",
    light: {
      "--bg": "#e9e5db",
      "--card": "#f3eee5",
      "--text": "#1f2937",
      "--muted": "#6b7280",
      "--accent": "#16a34a",
      "--accent-2": "#059669",
    },
    dark: {
      "--bg": "#1a1a2e",
      "--card": "#16213e",
      "--text": "#f5e6d3",
      "--muted": "#a89476",
      "--accent": "#f6ad55",
      "--accent-2": "#fb923c",
    },
  },
};

const STORAGE_KEY = "vocab_theme_v1";

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("dark");
  const [palette, setPalette] = useState("amber");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.mode) setMode(data.mode);
        if (data.palette) setPalette(data.palette);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    applyTheme(palette, mode);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ palette, mode }));
  }, [palette, mode]);

  function applyTheme(name, m) {
    const p = PALETTES[name] || PALETTES.modern;
    const vars = m === "dark" ? p.dark : p.light;
    Object.entries(vars).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v),
    );
    document.documentElement.setAttribute("data-theme", m);
  }

  function toggleMode() {
    setMode((m) => (m === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider
      value={{ mode, toggleMode, palette, setPalette, palettes: PALETTES }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
