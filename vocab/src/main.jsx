import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { VocabProvider } from "./context/VocabContext";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

function Root() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <VocabProvider>
            <App />
          </VocabProvider>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
