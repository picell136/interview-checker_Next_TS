"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export function BurgerMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-fg transition hover:bg-card"
        aria-label="Меню"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex h-3.5 w-4 flex-col justify-between" aria-hidden>
          <span className="block h-0.5 rounded-full bg-fg" />
          <span className="block h-0.5 rounded-full bg-fg" />
          <span className="block h-0.5 rounded-full bg-fg" />
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute left-0 z-30 mt-2 w-48 overflow-hidden rounded-2xl border border-line bg-card py-1 shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
        >
          <Link
            href="/results"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-fg transition hover:bg-input"
            onClick={() => setOpen(false)}
          >
            Результаты
          </Link>
          <Link
            href="/settings"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-fg transition hover:bg-input"
            onClick={() => setOpen(false)}
          >
            Настройки
          </Link>
        </div>
      ) : null}
    </div>
  );
}
