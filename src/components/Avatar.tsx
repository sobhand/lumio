"use client";

const avatarMap: Record<string, { emoji: string; bg: string }> = {
  sun: { emoji: "🌞", bg: "bg-amber-100" },
  star: { emoji: "⭐", bg: "bg-yellow-100" },
  moon: { emoji: "🌙", bg: "bg-indigo-100" },
  flower: { emoji: "🌸", bg: "bg-pink-100" },
  tree: { emoji: "🌳", bg: "bg-green-100" },
  bird: { emoji: "🐦", bg: "bg-sky-100" },
  butterfly: { emoji: "🦋", bg: "bg-purple-100" },
  rainbow: { emoji: "🌈", bg: "bg-rose-100" },
  ocean: { emoji: "🌊", bg: "bg-cyan-100" },
  mountain: { emoji: "🏔️", bg: "bg-slate-100" },
};

export const avatarOptions = Object.keys(avatarMap);

export function Avatar({
  avatar,
  size = "md",
  className = "",
}: {
  avatar: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const { emoji, bg } = avatarMap[avatar] || avatarMap.sun;
  const sizeClasses = {
    sm: "w-8 h-8 text-base",
    md: "w-12 h-12 text-xl",
    lg: "w-16 h-16 text-3xl",
    xl: "w-24 h-24 text-5xl",
  };

  return (
    <div
      className={`${bg} ${sizeClasses[size]} rounded-full flex items-center justify-center ${className}`}
    >
      {emoji}
    </div>
  );
}

export function AvatarPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (avatar: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {avatarOptions.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
            selected === key
              ? "ring-3 ring-primary scale-110 shadow-lg"
              : "hover:scale-105 bg-white/60"
          } ${avatarMap[key].bg}`}
        >
          {avatarMap[key].emoji}
        </button>
      ))}
    </div>
  );
}
