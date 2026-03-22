"use client";

import { useState } from "react";
import { categories } from "@/lib/habits-templates";

interface DailyHabit {
  childHabitId: string;
  habitId: string;
  name: string;
  category: string;
  difficulty: string;
  completed: boolean;
}

export function HabitCard({
  habit,
  onToggle,
  isChildView = false,
}: {
  habit: DailyHabit;
  onToggle: (childHabitId: string, completed: boolean) => Promise<void>;
  isChildView?: boolean;
}) {
  const [isToggling, setIsToggling] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const category = categories.find((c) => c.id === habit.category);
  const difficultyStars = habit.difficulty === "hard" ? 3 : habit.difficulty === "medium" ? 2 : 1;

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      const newState = !habit.completed;
      await onToggle(habit.childHabitId, newState);
      if (newState) {
        setJustCompleted(true);
        setTimeout(() => setJustCompleted(false), 1000);
      }
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`w-full text-left rounded-2xl p-4 transition-all duration-300 ${
        habit.completed
          ? "bg-success/10 border-2 border-success/30"
          : "bg-card-bg border-2 border-transparent shadow-sm hover:shadow-md active:scale-[0.98]"
      } ${justCompleted ? "animate-scale-in" : ""} ${
        isChildView ? "p-5" : ""
      }`}
    >
      <div className="flex items-center gap-3.5">
        {/* Checkbox */}
        <div
          className={`flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isChildView ? "w-14 h-14" : "w-11 h-11"
          } ${
            habit.completed
              ? "bg-success text-white shadow-md"
              : "bg-surface border-2 border-warm-gray/20"
          }`}
        >
          {habit.completed ? (
            <svg className={`${isChildView ? "w-7 h-7" : "w-5 h-5"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className={`${isChildView ? "text-2xl" : "text-lg"}`}>
              {category?.icon || "⭐"}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`font-medium ${isChildView ? "text-base" : "text-sm"} ${
              habit.completed ? "text-success line-through opacity-70" : "text-foreground"
            }`}
          >
            {habit.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${category?.color}20`,
                color: category?.color,
              }}
            >
              {category?.label}
            </span>
            <span className="text-xs text-warm-gray">
              {"⭐".repeat(difficultyStars)}
            </span>
          </div>
        </div>

        {/* Points indicator */}
        {habit.completed && (
          <div className="flex-shrink-0 text-success font-bold text-sm animate-scale-in">
            +{habit.difficulty === "hard" ? 15 : habit.difficulty === "medium" ? 10 : 5}
          </div>
        )}
      </div>
    </button>
  );
}
