"use client";

import { useEffect } from "react";
import type { UiTheme } from "@/lib/ui-theme";

function applyTheme(theme: UiTheme) {
  const root = document.documentElement;
  root.style.setProperty("--ui-canvas", theme.canvasColor);
  root.style.setProperty("--ui-ink", theme.inkColor);
  root.style.backgroundColor = theme.inkColor;
  document.body.style.backgroundColor = theme.inkColor;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.inkColor);
}

export function UiThemeProvider({ initialTheme }: { initialTheme: UiTheme }) {
  useEffect(() => {
    applyTheme(initialTheme);
    const update = (event: Event) => applyTheme((event as CustomEvent<UiTheme>).detail);
    const refresh = async () => {
      try {
        const response = await fetch("/api/settings/ui-theme", { cache: "no-store" });
        if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) return;
        const data: unknown = await response.json();
        if (typeof data === "object" && data !== null && "canvasColor" in data && "inkColor" in data) applyTheme(data as UiTheme);
      } catch {
        // A temporary network failure must not change the already-applied palette.
      }
    };
    window.addEventListener("barops-theme-updated", update);
    const interval = window.setInterval(() => { void refresh(); }, 30_000);
    return () => { window.removeEventListener("barops-theme-updated", update); window.clearInterval(interval); };
  }, [initialTheme]);
  return null;
}
