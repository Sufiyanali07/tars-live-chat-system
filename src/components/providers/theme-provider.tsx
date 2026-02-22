"use client";

import * as React from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: "class" | "data-theme";
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
};

const ThemeContext = React.createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | null>(null);

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = "tars-chat-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    return (localStorage.getItem(storageKey) as Theme) ?? defaultTheme;
  });

  const setTheme = React.useCallback(
    (value: Theme) => {
      setThemeState(value);
      if (typeof window === "undefined") return;
      localStorage.setItem(storageKey, value);
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      if (value === "system") {
        const system = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        root.classList.add(system);
      } else {
        root.classList.add(value);
      }
    },
    [storageKey]
  );

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    let resolved: "light" | "dark" = "light";
    if (theme === "system" && enableSystem) {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else if (theme === "dark" || theme === "light") {
      resolved = theme;
    }
    root.classList.add(resolved);
  }, [theme, enableSystem]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
