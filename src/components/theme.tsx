"use client";

import { useEffect } from "react";

export type ThemeName = "dark" | "light";

export function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem("theme", theme);
  document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export function ThemeSync() {
  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
    }
  }, []);
  return null;
}
