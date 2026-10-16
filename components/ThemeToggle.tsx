"use client";

import { useSyncExternalStore } from "react";
import { useI18n } from "./I18n";

type Mode = "system" | "light" | "dark";
const KEY = "esco-theme";
const NEXT: Record<Mode, Mode> = { system: "light", light: "dark", dark: "system" };
const listeners = new Set<() => void>();

function read(): Mode {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { m } = useI18n();
  const mode = useSyncExternalStore(
    (cb) => (listeners.add(cb), () => listeners.delete(cb)),
    read,
    () => "system" as Mode,
  );

  function cycle() {
    const next = NEXT[mode];
    try {
      if (next === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {}
    if (next === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", next);
    listeners.forEach((l) => l());
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium ${className}`}
      aria-label={`${m.nav.theme}: ${m.nav.themes[mode]}`}
    >
      <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
        <circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {mode !== "light" && <path d="M10 2.75a7.25 7.25 0 0 1 0 14.5z" fill="currentColor" />}
        {mode === "system" && <path d="M10 2.75v14.5" stroke="currentColor" strokeWidth="1.5" />}
      </svg>
      <span className="hidden sm:inline">{m.nav.themes[mode]}</span>
    </button>
  );
}
