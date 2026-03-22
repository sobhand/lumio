"use client";

import { getCharacterState } from "@/lib/character";

const moodEmoji: Record<string, string> = {
  happy: "😊",
  encouraging: "🌟",
  celebrating: "🎉",
  gentle: "🤗",
  proud: "😄",
};

const moodGradient: Record<string, string> = {
  happy: "from-amber-50 to-orange-50",
  encouraging: "from-purple-50 to-indigo-50",
  celebrating: "from-yellow-50 to-amber-50",
  gentle: "from-rose-50 to-pink-50",
  proud: "from-green-50 to-emerald-50",
};

export function CharacterGuide({
  ageGroup,
  completionRatio,
  streak,
  totalHabits,
  completedHabits,
}: {
  ageGroup: string;
  completionRatio: number;
  streak: number;
  totalHabits: number;
  completedHabits: number;
}) {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const state = getCharacterState({
    ageGroup,
    completionRatio,
    streak,
    timeOfDay: timeOfDay as "morning" | "afternoon" | "evening",
    totalHabits,
    completedHabits,
  });

  return (
    <div
      className={`bg-gradient-to-br ${moodGradient[state.mood]} rounded-3xl p-5 relative overflow-hidden animate-fade-in`}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/20 -mr-8 -mt-8" />
      <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/15 -ml-6 -mb-6" />

      <div className="relative flex items-start gap-4">
        {/* Character */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center shadow-sm animate-bounce-gentle">
            <span className="text-3xl">{moodEmoji[state.mood]}</span>
          </div>
          <p className="text-center text-xs font-medium text-primary mt-1.5 tracking-wide">
            Nuri
          </p>
        </div>

        {/* Message bubble */}
        <div className="flex-1 min-w-0">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl rounded-tl-sm p-4 shadow-sm">
            <p className="text-sm leading-relaxed text-foreground/90">
              {state.message}
            </p>
          </div>
        </div>
      </div>

      {/* Celebration effects */}
      {state.mood === "celebrating" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {["🌟", "✨", "💫", "⭐"].map((emoji, i) => (
            <span
              key={i}
              className="absolute animate-confetti text-lg"
              style={{
                left: `${20 + i * 20}%`,
                top: `${60 + Math.random() * 20}%`,
                animationDelay: `${i * 0.15}s`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
