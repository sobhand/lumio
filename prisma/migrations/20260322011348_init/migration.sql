-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT 'sun',
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "parentId" TEXT NOT NULL,
    CONSTRAINT "Child_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'daily',
    "difficulty" TEXT NOT NULL DEFAULT 'easy',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "ageGroup" TEXT,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ChildHabit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "childId" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChildHabit_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChildHabit_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HabitLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "points" INTEGER NOT NULL DEFAULT 0,
    "childId" TEXT NOT NULL,
    "childHabitId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HabitLog_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HabitLog_childHabitId_fkey" FOREIGN KEY ("childHabitId") REFERENCES "ChildHabit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Streak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastDate" TEXT,
    "childId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Streak_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "childId" TEXT NOT NULL,
    CONSTRAINT "Achievement_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ChildHabit_childId_habitId_key" ON "ChildHabit"("childId", "habitId");

-- CreateIndex
CREATE UNIQUE INDEX "HabitLog_childHabitId_date_key" ON "HabitLog"("childHabitId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_childId_key" ON "Streak"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_childId_type_key" ON "Achievement"("childId", "type");
