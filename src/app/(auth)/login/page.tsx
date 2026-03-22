"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("Network error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-background to-surface">
      {/* Logo */}
      <div className="mb-10 text-center animate-fade-in">
        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
          <span className="text-4xl">🌱</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Lumio</h1>
        <p className="text-warm-gray mt-1 text-sm">Growing good habits together</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 animate-slide-up">
        {error && (
          <div className="bg-danger/10 text-danger text-sm rounded-xl px-4 py-3 text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1.5 ml-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-card-bg border-2 border-transparent focus:border-primary focus:outline-none text-foreground placeholder:text-warm-gray/50 shadow-sm transition-all"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1.5 ml-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-card-bg border-2 border-transparent focus:border-primary focus:outline-none text-foreground placeholder:text-warm-gray/50 shadow-sm transition-all"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-primary text-white font-semibold text-base shadow-lg shadow-primary/25 hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-warm-gray pt-2">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
