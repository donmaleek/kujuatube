import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import { AuthProvider } from "./context/AuthContext.js";
import { PlayerProvider } from "./context/PlayerContext.js";
import { ThemeProvider } from "./context/ThemeContext.js";
import "./styles/globals.css";

createRoot(document.getElementById("root")).render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(
      ErrorBoundary,
      null,
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(
          AuthProvider,
          null,
          React.createElement(PlayerProvider, null, React.createElement(App))
        )
      )
    )
  )
);
