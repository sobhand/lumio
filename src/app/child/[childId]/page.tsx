"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { CharacterGuide } from "@/components/CharacterGuide";
import { HabitCard } from "@/components/HabitCard";
import { ProgressRing } from "@/components/ProgressRing";
import { format } from "date-fns";
import { WeeklyChart } from "@/components/WeeklyChart";

interface DailyHabit {
  childHabitId: string;
  habitId: string;
  name: string;
  category: string;
  difficulty: string;
  completed: boolean;
}

interface ChildData {
  id: string;
  name: string;
  age: number;
  ageGroup: string;
  avatar: string;
  points: number;
  streaks: { currentStreak: number; longestStreak: number }[];
  achievements: { type: string; title: string; earnedAt: string }[];
}

export default function ChildPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.childId as string;

  const [child, setChild] = useState<ChildData | null>(null);
  const [habits, setHabits] = useState<DailyHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"missions" | "progress" | "habits">("missions");

  const today = format(new Date(), "yyyy-MM-dd");

  const fetchData = useCallback(async () => {
    try {
      const [childRes, trackingRes] = await Promise.all([
        fetch(`/api/children/${childId}`),
        fetch(`/api/tracking?childId=${childId}&date=${today}`),
      ]);

      if (!childRes.ok) {
        router.push("/dashboard");
        return;
      }

      const childData = await childRes.json();
      const trackingData = await trackingRes.json();

      setChild(childData.child);
      setHabits(trackingData.habits || []);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [childId, today, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggle = async (childHabitId: string, completed: boolean) => {
    // Optimistic update
    setHabits((prev) =>
      prev.map((h) =>
        h.childHabitId === childHabitId ? { ...h, completed } : h
      )
    );

    try {
      await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childHabitId, date: today, completed }),
      });
      // Refresh to get updated points/streaks
      const childRes = await fetch(`/api/children/${childId}`);
      const childData = await childRes.json();
      setChild(childData.child);
    } catch {
      // Revert
      setHabits((prev) =>
        prev.map((h) =>
          h.childHabitId === childHabitId ? { ...h, completed: !completed } : h
        )
      );
    }
  };

  if (loading || !child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-bounce-gentle">
          <span className="text-5xl">🌱</span>
        </div>
      </div>
    );
  }

  const completedCount = habits.filter((h) => h.completed).length;
  const totalCount = habits.length;
  const ratio = totalCount > 0 ? completedCount / totalCount : 0;
  const streak = child.streaks?.[0]?.currentStreak || 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/8 to-transparent px-6 pt-5 pb-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-warm-gray hover:text-foreground transition-colors mb-4 flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-4">
            <Avatar avatar={child.avatar} size="lg" />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{child.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  Age {child.age}
                </span>
                <span className="text-xs text-accent font-medium">
                  {child.points} pts
                </span>
                {streak > 0 && (
                  <span className="text-xs text-success font-medium">
                    {streak} day streak 🔥
                  </span>
                )}
              </div>
            </div>
            <ProgressRing progress={ratio} size={56} strokeWidth={4}>
              <span className="text-xs font-bold text-primary">
                {completedCount}/{totalCount}
              </span>
            </ProgressRing>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-lg mx-auto px-6 mb-4">
        <div className="flex gap-1 bg-surface rounded-2xl p-1">
          {(["missions", "progress", "habits"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-card-bg text-foreground shadow-sm"
                  : "text-warm-gray hover:text-foreground"
              }`}
            >
              {tab === "missions" ? "Missions" : tab === "progress" ? "Progress" : "Manage"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6">
        {activeTab === "missions" && (
          <MissionsView
            child={child}
            habits={habits}
            ratio={ratio}
            streak={streak}
            completedCount={completedCount}
            onToggle={handleToggle}
          />
        )}
        {activeTab === "progress" && (
          <ProgressView childId={childId} child={child} />
        )}
        {activeTab === "habits" && (
          <HabitsManageView
            childId={childId}
            ageGroup={child.ageGroup}
            onUpdate={fetchData}
          />
        )}
      </div>
    </div>
  );
}

function MissionsView({
  child,
  habits,
  ratio,
  streak,
  completedCount,
  onToggle,
}: {
  child: ChildData;
  habits: DailyHabit[];
  ratio: number;
  streak: number;
  completedCount: number;
  onToggle: (childHabitId: string, completed: boolean) => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      {/* Character Guide */}
      <CharacterGuide
        ageGroup={child.ageGroup}
        completionRatio={ratio}
        streak={streak}
        totalHabits={habits.length}
        completedHabits={completedCount}
      />

      {/* Progress bar */}
      {habits.length > 0 && (
        <div className="bg-card-bg rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Today&apos;s Progress</span>
            <span className="text-sm text-primary font-bold">{Math.round(ratio * 100)}%</span>
          </div>
          <div className="h-3 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-700 ease-out"
              style={{ width: `${ratio * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Habit Cards */}
      {habits.length > 0 ? (
        <div className="space-y-2.5">
          {habits.map((habit, i) => (
            <div key={habit.childHabitId} className={`animate-slide-up stagger-${Math.min(i + 1, 6)}`} style={{ opacity: 0, animationFillMode: "forwards" }}>
              <HabitCard
                habit={habit}
                onToggle={onToggle}
                isChildView={child.ageGroup === "3-5"}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card-bg rounded-2xl p-8 text-center shadow-sm">
          <span className="text-4xl mb-3 block">📋</span>
          <p className="text-foreground font-medium mb-1">No habits yet</p>
          <p className="text-sm text-warm-gray">Switch to the Manage tab to add habits!</p>
        </div>
      )}
    </div>
  );
}

function ProgressView({ childId, child }: { childId: string; child: ChildData }) {
  const [progress, setProgress] = useState<{
    points: number;
    streak: { currentStreak: number; longestStreak: number };
    achievements: { type: string; title: string; earnedAt: string }[];
    today: { completed: number; total: number; ratio: number };
    weekly: { completion: number; breakdown: { date: string; completed: number; total: number }[] };
  } | null>(null);

  useEffect(() => {
    fetch(`/api/progress?childId=${childId}`)
      .then((r) => r.json())
      .then(setProgress);
  }, [childId]);

  if (!progress) {
    return <div className="text-center py-8 text-warm-gray">Loading...</div>;
  }

  const achievementIcons: Record<string, string> = {
    first_complete: "🌱",
    full_day: "🌟",
    streak_3: "🔥",
    streak_7: "💪",
    streak_14: "🏆",
    streak_30: "👑",
    points_100: "💎",
    points_500: "🌈",
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card-bg rounded-2xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-primary">{child.points}</p>
          <p className="text-xs text-warm-gray mt-1">Total Points</p>
        </div>
        <div className="bg-card-bg rounded-2xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-accent">
            {progress.streak.currentStreak}
          </p>
          <p className="text-xs text-warm-gray mt-1">Day Streak</p>
        </div>
        <div className="bg-card-bg rounded-2xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-success">
            {Math.round(progress.weekly.completion * 100)}%
          </p>
          <p className="text-xs text-warm-gray mt-1">Weekly Rate</p>
        </div>
        <div className="bg-card-bg rounded-2xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-foreground">
            {progress.streak.longestStreak}
          </p>
          <p className="text-xs text-warm-gray mt-1">Best Streak</p>
        </div>
      </div>

      {/* Weekly Chart */}
      {progress.weekly.breakdown.length > 0 && (
        <div className="bg-card-bg rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">This Week</h3>
          <WeeklyChart data={progress.weekly.breakdown} />
        </div>
      )}

      {/* Achievements */}
      <div className="bg-card-bg rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">Achievements</h3>
        {progress.achievements.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {progress.achievements.map((a) => (
              <div
                key={a.type}
                className="bg-surface rounded-xl p-3 text-center"
              >
                <span className="text-2xl">{achievementIcons[a.type] || "⭐"}</span>
                <p className="text-xs font-medium text-foreground mt-1">{a.title}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-warm-gray text-center py-4">
            Complete habits to earn achievements!
          </p>
        )}
      </div>
    </div>
  );
}

function HabitsManageView({
  childId,
  ageGroup,
  onUpdate,
}: {
  childId: string;
  ageGroup: string;
  onUpdate: () => void;
}) {
  const [habits, setHabits] = useState<
    { id: string; name: string; category: string; difficulty: string; childHabitId: string }[]
  >([]);
  const [templates, setTemplates] = useState<
    { name: string; category: string; difficulty: string }[]
  >([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", category: "hygiene", difficulty: "easy" });
  const [loading, setLoading] = useState(false);

  const categoryList = [
    { id: "hygiene", label: "Hygiene", icon: "✨" },
    { id: "responsibility", label: "Responsibility", icon: "⭐" },
    { id: "kindness", label: "Kindness", icon: "💛" },
    { id: "study", label: "Study", icon: "📖" },
    { id: "prayer", label: "Prayer", icon: "🕊️" },
    { id: "service", label: "Service", icon: "🤝" },
  ];

  useEffect(() => {
    fetch(`/api/habits?childId=${childId}`)
      .then((r) => r.json())
      .then((d) => setHabits(d.habits || []));
    fetch(`/api/habits/templates?ageGroup=${ageGroup}`)
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates || []));
  }, [childId, ageGroup]);

  const addHabit = async (name: string, category: string, difficulty: string) => {
    setLoading(true);
    try {
      await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, difficulty, childIds: [childId] }),
      });
      // Refresh
      const res = await fetch(`/api/habits?childId=${childId}`);
      const data = await res.json();
      setHabits(data.habits || []);
      setShowAdd(false);
      setShowTemplates(false);
      setNewHabit({ name: "", category: "hygiene", difficulty: "easy" });
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const deleteHabit = async (habitId: string) => {
    await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    onUpdate();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Current habits */}
      <div className="bg-card-bg rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Active Habits</h3>
          <span className="text-xs text-warm-gray">{habits.length} habits</span>
        </div>

        {habits.length > 0 ? (
          <div className="space-y-2">
            {habits.map((habit) => (
              <div
                key={habit.childHabitId}
                className="flex items-center justify-between py-2 px-3 bg-surface rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{habit.name}</p>
                  <p className="text-xs text-warm-gray capitalize">{habit.category}</p>
                </div>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center text-sm hover:bg-danger/20 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-warm-gray text-center py-4">No habits assigned yet</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => { setShowAdd(true); setShowTemplates(false); }}
          className="py-3.5 rounded-2xl bg-primary text-white font-medium text-sm shadow-md shadow-primary/20 hover:bg-primary-dark active:scale-[0.98] transition-all"
        >
          + Custom Habit
        </button>
        <button
          onClick={() => { setShowTemplates(!showTemplates); setShowAdd(false); }}
          className="py-3.5 rounded-2xl bg-accent text-white font-medium text-sm shadow-md shadow-accent/20 hover:bg-accent/90 active:scale-[0.98] transition-all"
        >
          📋 Suggestions
        </button>
      </div>

      {/* Add custom habit form */}
      {showAdd && (
        <div className="bg-card-bg rounded-2xl p-4 shadow-sm animate-scale-in">
          <h3 className="text-sm font-semibold text-foreground mb-3">New Custom Habit</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newHabit.name}
              onChange={(e) => setNewHabit((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-surface border-2 border-transparent focus:border-primary focus:outline-none text-sm"
              placeholder="Habit name"
            />
            <div>
              <label className="block text-xs font-medium text-warm-gray mb-1.5">Category</label>
              <div className="flex flex-wrap gap-2">
                {categoryList.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setNewHabit((p) => ({ ...p, category: c.id }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      newHabit.category === c.id
                        ? "bg-primary text-white"
                        : "bg-surface text-foreground hover:bg-primary/10"
                    }`}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-gray mb-1.5">Difficulty</label>
              <div className="flex gap-2">
                {["easy", "medium", "hard"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setNewHabit((p) => ({ ...p, difficulty: d }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                      newHabit.difficulty === d
                        ? "bg-primary text-white"
                        : "bg-surface text-foreground hover:bg-primary/10"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => addHabit(newHabit.name, newHabit.category, newHabit.difficulty)}
              disabled={!newHabit.name || loading}
              className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm disabled:opacity-50 shadow-md shadow-primary/20 transition-all"
            >
              {loading ? "Adding..." : "Add Habit"}
            </button>
          </div>
        </div>
      )}

      {/* Templates / Suggestions */}
      {showTemplates && (
        <div className="bg-card-bg rounded-2xl p-4 shadow-sm animate-scale-in">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Suggested for ages {ageGroup}
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {templates.map((t, i) => {
              const isAdded = habits.some((h) => h.name === t.name);
              return (
                <button
                  key={i}
                  onClick={() => !isAdded && addHabit(t.name, t.category, t.difficulty)}
                  disabled={isAdded || loading}
                  className={`w-full text-left flex items-center justify-between py-2.5 px-3 rounded-xl text-sm transition-all ${
                    isAdded
                      ? "bg-success/10 text-success"
                      : "bg-surface hover:bg-primary/5 text-foreground"
                  }`}
                >
                  <div>
                    <span className="font-medium">{t.name}</span>
                    <span className="text-xs text-warm-gray ml-2 capitalize">{t.category}</span>
                  </div>
                  {isAdded ? (
                    <span className="text-xs">Added</span>
                  ) : (
                    <span className="text-primary text-lg">+</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
