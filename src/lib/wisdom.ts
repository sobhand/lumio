// Wisdom messages inspired by Bahá'í principles, expressed in universal language

export const childWisdom = {
  encouragement: [
    "Each small effort helps you grow stronger inside.",
    "Kindness is something you practice every day.",
    "You are becoming braver with every step you take.",
    "Your heart grows bigger when you help others.",
    "Every good choice you make lights up the world a little more.",
    "Being truthful makes your spirit shine.",
    "You are planting seeds of goodness that will bloom.",
    "The best adventures start with small, brave steps.",
    "Your kindness today makes tomorrow brighter for everyone.",
    "Even when things are hard, your effort matters so much.",
  ],
  completion: [
    "You did it! Every completed mission makes you stronger.",
    "Wonderful! You showed real responsibility today.",
    "Your effort today is a gift to yourself and others.",
    "Look at you growing! Each habit builds your character.",
    "That took courage and discipline. Be proud of yourself!",
  ],
  missed: [
    "Tomorrow is a new beginning. You can always try again.",
    "Even the strongest trees need rest sometimes.",
    "What matters most is that you keep trying.",
    "Every day is a fresh chance to grow.",
    "Be gentle with yourself. Progress isn't always a straight line.",
  ],
  streak: [
    "Your consistency is building something beautiful inside you.",
    "Day after day, you're proving how strong you are!",
    "This streak shows the power of your determination.",
    "You're on a journey of growth, and it shows!",
    "Steady effort creates lasting strength.",
  ],
};

export const parentWisdom = {
  encouragement: [
    "Children learn through repetition more than instruction.",
    "Gentle consistency builds lasting habits.",
    "Consistency is more powerful than intensity at this age.",
    "Your patience today shapes their character tomorrow.",
    "The goal is progress, not perfection.",
    "Celebrate effort, not just results.",
    "Small daily victories lead to lasting transformation.",
  ],
  insight: [
    "Try reducing the number of habits to increase success.",
    "Recognize effort, not just completion.",
    "Children thrive when they feel seen and encouraged.",
    "Routine creates security; security enables growth.",
    "Morning habits tend to have higher completion rates.",
    "Praise specific actions rather than general qualities.",
  ],
  milestone: [
    "Your child's growing streak reflects your steady guidance.",
    "This progress didn't happen by accident — your involvement matters.",
    "Watching your child build character is one of life's greatest gifts.",
    "Your gentle persistence is creating something beautiful.",
  ],
};

export function getChildMessage(context: {
  ageGroup: string;
  completionRatio: number;
  streak: number;
  timeOfDay: "morning" | "afternoon" | "evening";
}): string {
  const { completionRatio, streak } = context;

  if (streak >= 3) {
    return pickRandom(childWisdom.streak);
  }
  if (completionRatio >= 0.8) {
    return pickRandom(childWisdom.completion);
  }
  if (completionRatio < 0.3 && completionRatio > 0) {
    return pickRandom(childWisdom.missed);
  }
  return pickRandom(childWisdom.encouragement);
}

export function getParentMessage(context: {
  completionRatio: number;
  streak: number;
  childCount: number;
}): string {
  const { completionRatio, streak } = context;

  if (streak >= 3) {
    return pickRandom(parentWisdom.milestone);
  }
  if (completionRatio < 0.5) {
    return pickRandom(parentWisdom.insight);
  }
  return pickRandom(parentWisdom.encouragement);
}

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}
