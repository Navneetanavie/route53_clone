"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/lib/api/auth";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success("Signed in successfully");
      router.push("/hosted-zones");
    } catch {
      toast.error("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--aws-bg)] flex flex-col">
      <header className="h-12 bg-[var(--aws-darker)] flex items-center px-6">
        <span className="text-[var(--aws-orange)] font-bold text-lg">aws</span>
        <span className="text-white/60 mx-2">|</span>
        <span className="text-white text-sm">Sign in</span>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white border border-[var(--aws-border)] rounded shadow-sm w-full max-w-md p-8">
          <h1 className="text-xl font-bold mb-1">Sign in</h1>
          <p className="text-sm text-[var(--aws-text-secondary)] mb-6">
            IAM user sign-in (mock authentication)
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                className="w-full px-3 py-2 text-sm border border-[var(--aws-border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--aws-blue)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin"
                autoComplete="current-password"
                className="w-full px-3 py-2 text-sm border border-[var(--aws-border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--aws-blue)]"
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-2"
            >
              Sign in
            </Button>
          </form>
          <p className="text-xs text-[var(--aws-text-secondary)] mt-4 text-center">
            Demo credentials: admin / admin
          </p>
        </div>
      </div>
    </div>
  );
}
