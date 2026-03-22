export interface HabitTemplate {
  name: string;
  category: string;
  difficulty: string;
  ageGroup: string | null; // null = all ages
}

export const habitTemplates: HabitTemplate[] = [
  // Hygiene
  { name: "Brush teeth (morning)", category: "hygiene", difficulty: "easy", ageGroup: null },
  { name: "Brush teeth (evening)", category: "hygiene", difficulty: "easy", ageGroup: null },
  { name: "Wash hands before meals", category: "hygiene", difficulty: "easy", ageGroup: "3-5" },
  { name: "Take a bath", category: "hygiene", difficulty: "easy", ageGroup: null },
  { name: "Comb hair", category: "hygiene", difficulty: "easy", ageGroup: "6-8" },

  // Responsibility
  { name: "Make my bed", category: "responsibility", difficulty: "easy", ageGroup: null },
  { name: "Put toys away", category: "responsibility", difficulty: "easy", ageGroup: "3-5" },
  { name: "Set the table", category: "responsibility", difficulty: "medium", ageGroup: "6-8" },
  { name: "Pack school bag", category: "responsibility", difficulty: "medium", ageGroup: "6-8" },
  { name: "Clean my room", category: "responsibility", difficulty: "medium", ageGroup: "9-10" },
  { name: "Help with dishes", category: "responsibility", difficulty: "medium", ageGroup: "9-10" },
  { name: "Prepare clothes for tomorrow", category: "responsibility", difficulty: "easy", ageGroup: "9-10" },

  // Kindness
  { name: "Say something kind to someone", category: "kindness", difficulty: "easy", ageGroup: null },
  { name: "Share with a friend", category: "kindness", difficulty: "easy", ageGroup: "3-5" },
  { name: "Help a family member", category: "kindness", difficulty: "medium", ageGroup: "6-8" },
  { name: "Write a thank-you note", category: "kindness", difficulty: "medium", ageGroup: "9-10" },
  { name: "Do something nice without being asked", category: "kindness", difficulty: "hard", ageGroup: "9-10" },

  // Study
  { name: "Read a book (15 min)", category: "study", difficulty: "easy", ageGroup: "3-5" },
  { name: "Read a book (20 min)", category: "study", difficulty: "medium", ageGroup: "6-8" },
  { name: "Read a book (30 min)", category: "study", difficulty: "medium", ageGroup: "9-10" },
  { name: "Practice writing", category: "study", difficulty: "medium", ageGroup: "6-8" },
  { name: "Do homework", category: "study", difficulty: "medium", ageGroup: "9-10" },
  { name: "Learn something new", category: "study", difficulty: "hard", ageGroup: "9-10" },

  // Prayer & Reflection
  { name: "Morning prayer", category: "prayer", difficulty: "easy", ageGroup: null },
  { name: "Evening prayer", category: "prayer", difficulty: "easy", ageGroup: null },
  { name: "Think of 3 things I'm grateful for", category: "prayer", difficulty: "easy", ageGroup: "6-8" },
  { name: "Quiet reflection time", category: "prayer", difficulty: "medium", ageGroup: "9-10" },

  // Service
  { name: "Help a friend at school", category: "service", difficulty: "easy", ageGroup: "6-8" },
  { name: "Do a chore without being asked", category: "service", difficulty: "medium", ageGroup: "9-10" },
  { name: "Water the plants", category: "service", difficulty: "easy", ageGroup: null },
  { name: "Feed the pet", category: "service", difficulty: "easy", ageGroup: "6-8" },
];

export function getSuggestedHabits(ageGroup: string): HabitTemplate[] {
  return habitTemplates.filter(
    (h) => h.ageGroup === null || h.ageGroup === ageGroup
  );
}

export const categories = [
  { id: "hygiene", label: "Hygiene", icon: "✨", color: "#60A5FA" },
  { id: "responsibility", label: "Responsibility", icon: "⭐", color: "#F59E0B" },
  { id: "kindness", label: "Kindness", icon: "💛", color: "#F472B6" },
  { id: "study", label: "Study", icon: "📖", color: "#34D399" },
  { id: "prayer", label: "Prayer", icon: "🕊️", color: "#A78BFA" },
  { id: "service", label: "Service", icon: "🤝", color: "#FB923C" },
];

export const difficultyPoints: Record<string, number> = {
  easy: 5,
  medium: 10,
  hard: 15,
};
