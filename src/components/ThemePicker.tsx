"use client";

import { applyTheme, type ThemeName } from "@/components/theme";
import { useEffect, useState } from "react";

const OPTIONS: { id: ThemeName; title: string; hint: string }[] = [
  { id: "dark", title: "Тёмная", hint: "Тёмный фон, как сейчас по умолчанию" },
  { id: "light", title: "Светлая", hint: "Светлый фон и контрастный текст" },
];

export function ThemePicker() {
  const [theme, setTheme] = useState<ThemeName>("dark");

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  const select = (next: ThemeName) => {
    applyTheme(next);
    setTheme(next);
  };

  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {OPTIONS.map((option) => {
        const selected = theme === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => select(option.id)}
            className={`rounded-2xl border-2 px-4 py-4 text-left transition ${
              selected ? "border-sky-400 bg-input" : "border-line hover:border-muted-2"
            }`}
          >
            <p className="text-base font-semibold text-fg">{option.title}</p>
            <p className="mt-1 text-sm text-muted">{option.hint}</p>
          </button>
        );
      })}
    </div>
  );
}
