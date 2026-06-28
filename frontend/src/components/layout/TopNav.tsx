"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logout } from "@/lib/api/auth";
import { useTheme } from "@/components/layout/ThemeProvider";

interface TopNavProps {
  username?: string;
}

export function TopNav({ username }: TopNavProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-12 bg-[var(--aws-darker)] text-white flex items-center justify-between px-4 z-40 border-b border-black/20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[var(--aws-orange)] font-bold text-lg">aws</span>
          <span className="text-white/60">|</span>
          <span className="text-sm font-medium">Route 53</span>
        </div>
        <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/80">
          Global
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={toggleTheme}
          className="text-white/70 hover:text-white text-xs border border-white/20 px-2 py-0.5 rounded"
          title="Toggle dark mode"
        >
          {theme === "dark" ? "☀ Light" : "☾ Dark"}
        </button>
        <span className="text-white/70 hidden sm:inline">
          Account: 123456789012
        </span>
        {username && (
          <span className="text-white/90">{username}</span>
        )}
        <button
          onClick={handleLogout}
          className="text-[var(--aws-orange)] hover:underline text-sm"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
