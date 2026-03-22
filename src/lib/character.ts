// Nuri - the friendly guide character

export interface CharacterState {
  mood: "happy" | "encouraging" | "celebrating" | "gentle" | "proud";
  message: string;
}

export function getCharacterState(context: {
  ageGroup: string;
  completionRatio: number;
  streak: number;
  timeOfDay: "morning" | "afternoon" | "evening";
  totalHabits: number;
  completedHabits: number;
}): CharacterState {
  const { ageGroup, completionRatio, streak, timeOfDay, totalHabits, completedHabits } = context;

  // All habits done
  if (completionRatio === 1 && totalHabits > 0) {
    return {
      mood: "celebrating",
      message: getCelebrationMessage(ageGroup, streak),
    };
  }

  // More than half done
  if (completionRatio >= 0.5) {
    return {
      mood: "proud",
      message: getProudMessage(ageGroup, completedHabits, totalHabits),
    };
  }

  // Just starting the day
  if (completedHabits === 0 && totalHabits > 0) {
    return {
      mood: "encouraging",
      message: getGreeting(ageGroup, timeOfDay, totalHabits),
    };
  }

  // Some progress
  if (completionRatio > 0) {
    return {
      mood: "happy",
      message: getProgressMessage(ageGroup, completedHabits, totalHabits),
    };
  }

  // No habits assigned
  return {
    mood: "gentle",
    message: getNoHabitsMessage(ageGroup),
  };
}

function getGreeting(ageGroup: string, timeOfDay: string, totalHabits: number): string {
  const greetings: Record<string, string[]> = {
    "3-5": [
      `Good ${timeOfDay}! You have ${totalHabits} fun missions today!`,
      `Hello, little explorer! Ready for today's adventure?`,
      `Hi there! Let's make today amazing together!`,
    ],
    "6-8": [
      `Good ${timeOfDay}! You have ${totalHabits} missions waiting for you today.`,
      `Welcome back! Today is full of possibilities.`,
      `Ready to grow stronger today? Let's start your missions!`,
    ],
    "9-10": [
      `Good ${timeOfDay}! ${totalHabits} missions are ready when you are.`,
      `Welcome back! Each day is a chance to build something great.`,
      `Your missions are set. Let's make today count!`,
    ],
  };

  const msgs = greetings[ageGroup] || greetings["6-8"];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

function getCelebrationMessage(ageGroup: string, streak: number): string {
  if (streak >= 7) {
    return "Incredible! A whole week of growth. You're becoming truly remarkable!";
  }
  if (streak >= 3) {
    return "Amazing streak! Your dedication is shining through!";
  }

  const msgs: Record<string, string[]> = {
    "3-5": [
      "You did ALL your missions! You're a superstar!",
      "Hooray! Every single one done! I'm so proud!",
    ],
    "6-8": [
      "All missions complete! You should feel really proud today!",
      "Every single mission done! That takes real character!",
    ],
    "9-10": [
      "Perfect day! Your discipline and effort are truly inspiring.",
      "All complete! This is what building strong character looks like.",
    ],
  };

  const m = msgs[ageGroup] || msgs["6-8"];
  return m[Math.floor(Math.random() * m.length)];
}

function getProudMessage(ageGroup: string, completed: number, total: number): string {
  const msgs: Record<string, string[]> = {
    "3-5": [
      `Wow, ${completed} missions done! Keep going!`,
      `You're doing so great! Just a few more to go!`,
    ],
    "6-8": [
      `${completed} out of ${total} — you're making great progress!`,
      `More than halfway there! Your effort is paying off!`,
    ],
    "9-10": [
      `${completed}/${total} complete. You're showing real commitment!`,
      `Great progress! Keep that momentum going!`,
    ],
  };

  const m = msgs[ageGroup] || msgs["6-8"];
  return m[Math.floor(Math.random() * m.length)];
}

function getProgressMessage(ageGroup: string, completed: number, total: number): string {
  const remaining = total - completed;
  const msgs: Record<string, string[]> = {
    "3-5": [
      `Great start! ${remaining} more missions to go!`,
      `You started! That's the hardest part!`,
    ],
    "6-8": [
      `Good start! ${remaining} missions left. You've got this!`,
      `Every mission you complete makes you stronger. Keep going!`,
    ],
    "9-10": [
      `${completed} down, ${remaining} to go. Stay focused!`,
      `You've started your journey today. Each step matters.`,
    ],
  };

  const m = msgs[ageGroup] || msgs["6-8"];
  return m[Math.floor(Math.random() * m.length)];
}

function getNoHabitsMessage(ageGroup: string): string {
  const msgs: Record<string, string> = {
    "3-5": "Ask a grown-up to give you some fun missions!",
    "6-8": "No missions yet! Ask your parent to set some up for you.",
    "9-10": "No missions assigned yet. Talk to your parent to get started!",
  };
  return msgs[ageGroup] || msgs["6-8"];
}
