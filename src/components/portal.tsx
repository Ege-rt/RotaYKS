"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children into document.body instead of in-place. Modals/overlays
 * must use this — otherwise a CSS `transform`/animation on any ancestor
 * (e.g. the `animate-fade-up` entrance animation used on page roots) creates
 * a containing block that silently traps `position: fixed` descendants
 * inside that ancestor's box instead of the real viewport, making the
 * overlay invisible while still mounted (e.g. a video keeps playing audio
 * with no visible player).
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
