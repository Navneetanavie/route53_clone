"use client";

import { useEffect } from "react";

interface KeyboardShortcutsProps {
  onFocusSearch: () => void;
  onShowHelp: () => void;
}

export function useKeyboardShortcuts({
  onFocusSearch,
  onShowHelp,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (e.key === "/" && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onFocusSearch();
      }

      if (e.key === "?" && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onShowHelp();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onFocusSearch, onShowHelp]);
}
