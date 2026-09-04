"use client";

import { useEffect, useState } from "react";

export type AccentId = "violet" | "blue" | "emerald" | "rose" | "amber";

export const ACCENTS: { id: AccentId; label: string; swatch: string }[] = [
  { id: "violet", label: "Menekşe", swatch: "#7C4DFF" },
  { id: "blue", label: "Mavi", swatch: "#3B6EFF" },
  { id: "emerald", label: "Zümrüt", swatch: "#1FB06A" },
  { id: "rose", label: "Gül", swatch: "#FF4571" },
  { id: "amber", label: "Amber", swatch: "#FF9012" },
];

const STORAGE_KEY = "accent";

// Kept in sync with the inline flash-prevention script in layout.tsx.
export function applyAccent(id: AccentId) {
  if (id === "violet") {
    document.documentElement.removeAttribute("data-accent");
  } else {
    document.documentElement.setAttribute("data-accent", id);
  }
}

export function useAccent() {
  const [accent, setAccentState] = useState<AccentId>("violet");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as AccentId | null;
    if (stored && ACCENTS.some((a) => a.id === stored)) {
      setAccentState(stored);
    }
    setMounted(true);
  }, []);

  function setAccent(id: AccentId) {
    setAccentState(id);
    localStorage.setItem(STORAGE_KEY, id);
    applyAccent(id);
  }

  return { accent, setAccent, mounted };
}
