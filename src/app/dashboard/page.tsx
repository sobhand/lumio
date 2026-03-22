"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarPicker } from "@/components/Avatar";
import { ProgressRing } from "@/components/ProgressRing";

interface Child {
  id: string;
  name: string;
  age: number;
  ageGroup: string;
  avatar: string;
  points: number;
  streaks: { currentStreak: number; longestStreak: number }[];
  childHabits: { id: string; habit: { name: string; category: string } }[];
}

interface Insight {
  childId: string;
  childName: string;
  todayCompleted: number;
  todayTotal: number;
  todayRatio: number;
  weeklyCompletion: number;
  streak: number;
  strongestCategory: string | null;
  weakestCategory: string | null;
  wisdom: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, childrenRes, insightsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/children"),
        fetch("/api/insights"),
      ]);

      if (!userRes.ok) {
        router.push("/login");
        return;
      }

      const userData = await userRes.json();
      const childrenData = await childrenRes.json();
      const insightsData = await insightsRes.json();

      setUser(userData.user);
      setChildren(childrenData.children || []);
      setInsights(insightsData.insights || []);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-bounce-gentle">
          <span className="text-5xl">🌱</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent px-6 pt-6 pb-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-warm-gray">Welcome back,</p>
            <h1 className="text-xl font-bold text-foreground">{user?.name}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-warm-gray hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-card-bg"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6">
        {/* Quick Stats */}
        {insights.length > 0 && (
          <div className="bg-card-bg rounded-2xl p-4 shadow-sm mb-6 animate-fade-in">
            <h2 className="text-sm font-semibold text-warm-gray mb-3 uppercase tracking-wider">Today&apos;s Overview</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {insights.reduce((a, i) => a + i.todayCompleted, 0)}
                </p>
                <p className="text-xs text-warm-gray mt-0.5">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">
                  {insights.reduce((a, i) => a + i.todayTotal, 0)}
                </p>
                <p className="text-xs text-warm-gray mt-0.5">Total Habits</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">
                  {Math.max(...insights.map((i) => i.streak), 0)}
                </p>
                <p className="text-xs text-warm-gray mt-0.5">Best Streak</p>
              </div>
            </div>
          </div>
        )}

        {/* Wisdom */}
        {insights.length > 0 && insights[0].wisdom && (
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-4 mb-6 animate-fade-in">
            <p className="text-sm text-foreground/80 italic leading-relaxed">
              &ldquo;{insights[0].wisdom}&rdquo;
            </p>
          </div>
        )}

        {/* Children */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">My Children</h2>
          <button
            onClick={() => setShowAddChild(true)}
            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-xl shadow-md shadow-primary/20 hover:bg-primary-dark active:scale-95 transition-all"
          >
            +
          </button>
        </div>

        {children.length === 0 ? (
          <div className="bg-card-bg rounded-2xl p-8 text-center shadow-sm animate-fade-in">
            <span className="text-5xl mb-4 block">👋</span>
            <p className="text-foreground font-medium mb-1">No children yet</p>
            <p className="text-sm text-warm-gray mb-4">Add your first child to get started!</p>
            <button
              onClick={() => setShowAddChild(true)}
              className="px-6 py-3 rounded-xl bg-primary text-white font-medium shadow-md shadow-primary/20 hover:bg-primary-dark transition-all"
            >
              Add a Child
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {children.map((child, i) => {
              const insight = insights.find((ins) => ins.childId === child.id);
              const todayRatio = insight?.todayRatio || 0;
              const streak = child.streaks?.[0]?.currentStreak || 0;

              return (
                <button
                  key={child.id}
                  onClick={() => router.push(`/child/${child.id}`)}
                  className={`w-full bg-card-bg rounded-2xl p-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left animate-slide-up stagger-${i + 1}`}
                  style={{ opacity: 0, animationFillMode: "forwards" }}
                >
                  <div className="flex items-center gap-4">
                    <Avatar avatar={child.avatar} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground text-lg">{child.name}</h3>
                        <span className="text-xs bg-surface text-warm-gray px-2 py-0.5 rounded-full">
                          {child.age}y
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-warm-gray">
                          {child.childHabits?.length || 0} habits
                        </span>
                        {streak > 0 && (
                          <span className="text-xs text-accent font-medium">
                            {streak} day streak 🔥
                          </span>
                        )}
                      </div>
                    </div>
                    <ProgressRing progress={todayRatio} size={52} strokeWidth={4}>
                      <span className="text-xs font-bold text-primary">
                        {Math.round(todayRatio * 100)}%
                      </span>
                    </ProgressRing>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Per-child Insights */}
        {insights.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground mb-4">Insights</h2>
            <div className="space-y-3">
              {insights.map((insight) => (
                <div key={insight.childId} className="bg-card-bg rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{insight.childName}</h3>
                    <span className="text-xs text-warm-gray">
                      {Math.round(insight.weeklyCompletion * 100)}% this week
                    </span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                      style={{ width: `${insight.weeklyCompletion * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-warm-gray">
                      {insight.todayCompleted}/{insight.todayTotal} today
                    </span>
                    {insight.strongestCategory && (
                      <span className="text-xs text-success">
                        Strongest: {insight.strongestCategory}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Child Modal */}
      {showAddChild && (
        <AddChildModal
          onClose={() => setShowAddChild(false)}
          onAdded={() => {
            setShowAddChild(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function AddChildModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("6");
  const [avatar, setAvatar] = useState("sun");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, age: Number(age), avatar }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add child");
        return;
      }

      onAdded();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-background rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 pb-8 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Add a Child</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-warm-gray">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-danger/10 text-danger text-sm rounded-xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1.5 ml-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-card-bg border-2 border-transparent focus:border-primary focus:outline-none text-foreground shadow-sm"
              placeholder="Child's name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1.5 ml-1">
              Age
            </label>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 8 }, (_, i) => i + 3).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAge(String(a))}
                  className={`w-11 h-11 rounded-xl font-medium text-sm transition-all ${
                    age === String(a)
                      ? "bg-primary text-white shadow-md"
                      : "bg-card-bg text-foreground hover:bg-surface"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-2 ml-1">
              Avatar
            </label>
            <AvatarPicker selected={avatar} onSelect={setAvatar} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Child"}
          </button>
        </form>
      </div>
    </div>
  );
}
