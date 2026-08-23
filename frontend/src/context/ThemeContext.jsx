import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const THEME_STORAGE_KEY = "agentscout-theme";

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return stored || "system";
    } catch (e) {
      return "system";
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr) return attr;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      let activeTheme = theme;
      if (theme === "system") {
        activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      root.setAttribute("data-theme", activeTheme);
      setResolvedTheme(activeTheme);
    };

    applyTheme();

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      // Ignore storage errors
    }

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    if (["light", "dark", "system"].includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
