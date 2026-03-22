import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { format, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  // Clean up
  await prisma.habitLog.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.childHabit.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.child.deleteMany();
  await prisma.user.deleteMany();

  // Create parent
  const hashedPassword = await bcrypt.hash("password123", 10);
  const parent = await prisma.user.create({
    data: {
      email: "parent@lumio.app",
      password: hashedPassword,
      name: "Sarah",
    },
  });

  console.log("Created parent:", parent.email);

  // Create children
  const amir = await prisma.child.create({
    data: {
      name: "Amir",
      age: 7,
      ageGroup: "6-8",
      avatar: "sun",
      points: 85,
      parentId: parent.id,
    },
  });

  const neda = await prisma.child.create({
    data: {
      name: "Neda",
      age: 4,
      ageGroup: "3-5",
      avatar: "butterfly",
      points: 45,
      parentId: parent.id,
    },
  });

  const dara = await prisma.child.create({
    data: {
      name: "Dara",
      age: 9,
      ageGroup: "9-10",
      avatar: "star",
      points: 120,
      parentId: parent.id,
    },
  });

  console.log("Created children:", amir.name, neda.name, dara.name);

  // Create habits
  const habits = await Promise.all([
    prisma.habit.create({ data: { name: "Brush teeth (morning)", category: "hygiene", difficulty: "easy", createdById: parent.id } }),
    prisma.habit.create({ data: { name: "Brush teeth (evening)", category: "hygiene", difficulty: "easy", createdById: parent.id } }),
    prisma.habit.create({ data: { name: "Make my bed", category: "responsibility", difficulty: "easy", createdById: parent.id } }),
    prisma.habit.create({ data: { name: "Say something kind", category: "kindness", difficulty: "easy", createdById: parent.id } }),
    prisma.habit.create({ data: { name: "Read a book (20 min)", category: "study", difficulty: "medium", createdById: parent.id } }),
    prisma.habit.create({ data: { name: "Morning prayer", category: "prayer", difficulty: "easy", createdById: parent.id } }),
    prisma.habit.create({ data: { name: "Help with dishes", category: "service", difficulty: "medium", createdById: parent.id } }),
    prisma.habit.create({ data: { name: "Put toys away", category: "responsibility", difficulty: "easy", createdById: parent.id } }),
    prisma.habit.create({ data: { name: "Share with a friend", category: "kindness", difficulty: "easy", createdById: parent.id } }),
    prisma.habit.create({ data: { name: "Do homework", category: "study", difficulty: "medium", createdById: parent.id } }),
    prisma.habit.create({ data: { name: "Clean my room", category: "responsibility", difficulty: "medium", createdById: parent.id } }),
    prisma.habit.create({ data: { name: "Quiet reflection time", category: "prayer", difficulty: "medium", createdById: parent.id } }),
  ]);

  // Assign habits to children
  // Amir (7): teeth, bed, kind, read, prayer
  const amirHabits = await Promise.all([
    prisma.childHabit.create({ data: { childId: amir.id, habitId: habits[0].id } }),
    prisma.childHabit.create({ data: { childId: amir.id, habitId: habits[1].id } }),
    prisma.childHabit.create({ data: { childId: amir.id, habitId: habits[2].id } }),
    prisma.childHabit.create({ data: { childId: amir.id, habitId: habits[3].id } }),
    prisma.childHabit.create({ data: { childId: amir.id, habitId: habits[4].id } }),
    prisma.childHabit.create({ data: { childId: amir.id, habitId: habits[5].id } }),
  ]);

  // Neda (4): teeth, toys, share, prayer
  const nedaHabits = await Promise.all([
    prisma.childHabit.create({ data: { childId: neda.id, habitId: habits[0].id } }),
    prisma.childHabit.create({ data: { childId: neda.id, habitId: habits[7].id } }),
    prisma.childHabit.create({ data: { childId: neda.id, habitId: habits[8].id } }),
    prisma.childHabit.create({ data: { childId: neda.id, habitId: habits[5].id } }),
  ]);

  // Dara (9): teeth x2, bed, homework, dishes, room, reflection
  const daraHabits = await Promise.all([
    prisma.childHabit.create({ data: { childId: dara.id, habitId: habits[0].id } }),
    prisma.childHabit.create({ data: { childId: dara.id, habitId: habits[1].id } }),
    prisma.childHabit.create({ data: { childId: dara.id, habitId: habits[2].id } }),
    prisma.childHabit.create({ data: { childId: dara.id, habitId: habits[9].id } }),
    prisma.childHabit.create({ data: { childId: dara.id, habitId: habits[6].id } }),
    prisma.childHabit.create({ data: { childId: dara.id, habitId: habits[10].id } }),
    prisma.childHabit.create({ data: { childId: dara.id, habitId: habits[11].id } }),
  ]);

  // Create habit logs for the past 7 days
  const today = new Date();

  for (let day = 6; day >= 0; day--) {
    const date = format(subDays(today, day), "yyyy-MM-dd");

    // Amir: pretty consistent (5/6 most days)
    for (let i = 0; i < amirHabits.length; i++) {
      const shouldComplete = day === 0 ? i < 3 : Math.random() > 0.2;
      if (shouldComplete) {
        await prisma.habitLog.create({
          data: {
            childId: amir.id,
            childHabitId: amirHabits[i].id,
            date,
            completed: true,
            completedAt: new Date(),
            points: 5,
          },
        });
      }
    }

    // Neda: good on some days (2-3/4)
    for (let i = 0; i < nedaHabits.length; i++) {
      const shouldComplete = day === 0 ? i < 2 : Math.random() > 0.35;
      if (shouldComplete) {
        await prisma.habitLog.create({
          data: {
            childId: neda.id,
            childHabitId: nedaHabits[i].id,
            date,
            completed: true,
            completedAt: new Date(),
            points: 5,
          },
        });
      }
    }

    // Dara: very consistent (6-7/7)
    for (let i = 0; i < daraHabits.length; i++) {
      const shouldComplete = day === 0 ? i < 4 : Math.random() > 0.1;
      if (shouldComplete) {
        await prisma.habitLog.create({
          data: {
            childId: dara.id,
            childHabitId: daraHabits[i].id,
            date,
            completed: true,
            completedAt: new Date(),
            points: i >= 3 ? 10 : 5,
          },
        });
      }
    }
  }

  // Create streaks
  await prisma.streak.create({
    data: { childId: amir.id, currentStreak: 4, longestStreak: 5, lastDate: format(subDays(today, 1), "yyyy-MM-dd") },
  });
  await prisma.streak.create({
    data: { childId: neda.id, currentStreak: 2, longestStreak: 3, lastDate: format(subDays(today, 1), "yyyy-MM-dd") },
  });
  await prisma.streak.create({
    data: { childId: dara.id, currentStreak: 6, longestStreak: 6, lastDate: format(subDays(today, 1), "yyyy-MM-dd") },
  });

  // Create achievements
  await prisma.achievement.createMany({
    data: [
      { childId: amir.id, type: "first_complete", title: "First Step" },
      { childId: amir.id, type: "full_day", title: "Perfect Day" },
      { childId: amir.id, type: "streak_3", title: "3-Day Streak" },
      { childId: neda.id, type: "first_complete", title: "First Step" },
      { childId: dara.id, type: "first_complete", title: "First Step" },
      { childId: dara.id, type: "full_day", title: "Perfect Day" },
      { childId: dara.id, type: "streak_3", title: "3-Day Streak" },
      { childId: dara.id, type: "points_100", title: "Century Club" },
    ],
  });

  console.log("Seed data created successfully!");
  console.log("\nLogin with:");
  console.log("  Email: parent@lumio.app");
  console.log("  Password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
