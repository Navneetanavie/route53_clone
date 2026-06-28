"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { KeyboardShortcutsModal } from "@/components/ui/KeyboardShortcutsModal";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);

  const focusSearch = useCallback(() => {
    const input = document.querySelector<HTMLInputElement>("[data-search-input]");
    input?.focus();
  }, []);

  useKeyboardShortcuts({
    onFocusSearch: focusSearch,
    onShowHelp: () => setHelpOpen(true),
  });

  useEffect(() => {
    getSession()
      .then((session) => setUsername(session.username))
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner label="Checking session..." />
      </div>
    );
  }

  if (!username) return null;

  return (
    <div className="min-h-screen">
      <TopNav username={username} />
      <Sidebar />
      <main
        className="pt-12 pl-[var(--aws-sidebar-width)] min-h-screen"
        style={{ paddingLeft: "var(--aws-sidebar-width)" }}
      >
        <div className="p-6 max-w-[1400px]">{children}</div>
      </main>
      <KeyboardShortcutsModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
