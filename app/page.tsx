"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  PiggyBank,
  CloudSun,
  Repeat,
  Dumbbell,
  X,
} from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

type GroceryItem = {
  id: number;
  name: string;
  done: boolean;
  category: string;
};

type Reminder = {
  label: string;
  lastDone: string; // ISO date string
  intervalDays: number;
};

const GROCERY_CATEGORIES = ["Produce", "Protein", "Dairy", "Pantry", "Other"];

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysBetween(start: Date, end: Date) {
  const startMidnight = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const endMidnight = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  );
  return Math.floor(
    (endMidnight.getTime() - startMidnight.getTime()) / MS_PER_DAY
  );
}

const GROCERY_STORAGE_KEY = "homehub-groceries";

export default function Home() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // 🔹 Grocery list state
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([
    { id: 1, name: "Eggs", done: false, category: "Dairy" },
    { id: 2, name: "Spinach", done: false, category: "Produce" },
    { id: 3, name: "Chicken", done: false, category: "Protein" },
    { id: 4, name: "Coffee", done: false, category: "Pantry" },
  ]);
  const [newGrocery, setNewGrocery] = useState("");
  const [newGroceryCategory, setNewGroceryCategory] = useState("Produce");

  // ✅ Load groceries from localStorage on first mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(GROCERY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GroceryItem[];
        if (Array.isArray(parsed)) {
          setGroceryItems(parsed);
        }
      }
    } catch {
      // ignore parse errors and keep defaults
    }
  }, []);

  // ✅ Save groceries to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        GROCERY_STORAGE_KEY,
        JSON.stringify(groceryItems)
      );
    } catch {
      // ignore write errors
    }
  }, [groceryItems]);

  // 🔹 Workout plan for the week (0 = Sunday)
  const weeklyWorkout = [
    { name: "Rest / Walk", items: ["Light walk", "Stretching"] }, // Sunday
    {
      name: "Upper Body",
      items: ["Bench Press", "Rows", "Shoulder Press", "Triceps", "Core"],
    }, // Monday
    {
      name: "Lower Body",
      items: ["Squats", "RDLs", "Leg Press", "Lunges", "Calves"],
    }, // Tuesday
    {
      name: "Cardio + Core",
      items: ["Stairmaster / Treadmill", "Planks", "Leg Raises"],
    }, // Wednesday
    {
      name: "Upper Body (Push)",
      items: ["Incline Press", "Shoulder Press", "Dips", "Triceps"],
    }, // Thursday
    {
      name: "Upper Body (Pull)",
      items: ["Pull-ups / Lat Pulldown", "Rows", "Biceps", "Rear Delts"],
    }, // Friday
    {
      name: "Legs + Light Cardio",
      items: ["Leg Press", "Romanian Deadlifts", "Bike / Walk"],
    }, // Saturday
  ];

  const todayWorkout = weeklyWorkout[today.getDay()];

  // 🔹 Recurring reminders
  const reminders: Reminder[] = [
    {
      label: "Change AC filter",
      lastDone: "2025-10-01",
      intervalDays: 90,
    },
    {
      label: "Change Brita filter",
      lastDone: "2025-11-15",
      intervalDays: 60,
    },
    {
      label: "Change toothbrushes",
      lastDone: "2025-10-20",
      intervalDays: 90,
    },
    {
      label: "Trash night",
      lastDone: "2025-12-07",
      intervalDays: 7,
    },
  ];

  // 🔹 Budget (still simple / static for now)
  const budget = {
    weekSpend: 120,
    weekLimit: 200,
  };

  const weather = {
    temp: "78°F",
    condition: "Partly cloudy",
    location: "Your Area",
  };

  const budgetPercent = Math.min(
    100,
    Math.round((budget.weekSpend / budget.weekLimit) * 100)
  );

  // 🔹 Grocery handlers
  function handleAddGrocery(e: FormEvent) {
    e.preventDefault();
    const trimmed = newGrocery.trim();
    if (!trimmed) return;

    setGroceryItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: trimmed,
        done: false,
        category: newGroceryCategory || "Other",
      },
    ]);
    setNewGrocery("");
  }

  function toggleGrocery(id: number) {
    setGroceryItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  }

  function removeGrocery(id: number) {
    setGroceryItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCompletedGroceries() {
    setGroceryItems((prev) => prev.filter((item) => !item.done));
  }

  const remainingCount = groceryItems.filter((g) => !g.done).length;

  // 🔹 Reminder status helpers
  function getReminderStatus(reminder: Reminder) {
    const last = new Date(reminder.lastDone);
    const elapsed = daysBetween(last, today);
    const daysLeft = reminder.intervalDays - elapsed;

    if (daysLeft <= 0) {
      return {
        label: "Overdue",
        description: `Due ${Math.abs(daysLeft)} day${
          Math.abs(daysLeft) === 1 ? "" : "s"
        } ago`,
        borderClass: "border-red-500/70",
        chipClass: "bg-red-500/10 text-red-500",
      };
    }

    if (daysLeft <= 7) {
      return {
        label: "Soon",
        description: `Due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
        borderClass: "border-yellow-500/70",
        chipClass: "bg-yellow-500/10 text-yellow-500",
      };
    }

    return {
      label: "Good",
      description: `Due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
      borderClass: "border-emerald-500/60",
      chipClass: "bg-emerald-500/10 text-emerald-500",
    };
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Home Hub
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Hey, you two 👋
            </h1>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        {/* Grid */}
        <motion.div
          className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-3"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.05 }}
        >
          {/* 🧺 Groceries */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 md:row-span-2"
          >
            <Card className="flex h-full flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Grocery List</CardTitle>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>
                    {remainingCount === 0
                      ? "All caught up ✨"
                      : `${remainingCount} item${
                          remainingCount === 1 ? "" : "s"
                        } left`}
                  </span>
                  {groceryItems.some((g) => g.done) && (
                    <button
                      type="button"
                      onClick={clearCompletedGroceries}
                      className="rounded-full border border-border bg-background px-2 py-1 text-[10px] font-medium hover:bg-muted transition-colors"
                    >
                      Clear completed
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                {/* Add form */}
                <form
                  onSubmit={handleAddGrocery}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                  <Input
                    value={newGrocery}
                    onChange={(e) => setNewGrocery(e.target.value)}
                    placeholder="Add an item (e.g. Greek yogurt)"
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newGroceryCategory}
                      onChange={(e) => setNewGroceryCategory(e.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {GROCERY_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </form>

                {/* List */}
                <div className="flex-1 overflow-y-auto rounded-md border border-border/50 bg-muted/40 p-2">
                  <AnimatePresence initial={false}>
                    {groceryItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="mb-1 last:mb-0"
                      >
                        <div
                          onClick={() => toggleGrocery(item.id)}
                          className="flex cursor-pointer items-center justify-between rounded-md bg-background/60 px-3 py-2 text-sm hover:bg-background transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-4 w-4 rounded-full border ${
                                item.done
                                  ? "border-emerald-500 bg-emerald-500/90"
                                  : "border-muted-foreground/40 bg-transparent"
                              }`}
                            />
                            <div className="flex flex-col">
                              <span
                                className={
                                  item.done
                                    ? "text-muted-foreground line-through"
                                    : ""
                                }
                              >
                                {item.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {item.category}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGrocery(item.id);
                            }}
                            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            aria-label="Remove item"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {groceryItems.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      Nothing here yet. Add your first item above 👆
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ☀️ Weather */}
          <motion.div variants={cardVariants}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CloudSun className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">Weather</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-semibold">{weather.temp}</div>
                <div className="text-sm text-muted-foreground">
                  {weather.condition}
                </div>
                <div className="text-xs text-muted-foreground">
                  {weather.location}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🔁 Reminders */}
          <motion.div variants={cardVariants} className="md:row-span-2">
            <Card className="flex h-full flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">Recurring Reminders</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <ul className="space-y-2 text-xs">
                  {reminders.map((r) => {
                    const status = getReminderStatus(r);
                    return (
                      <li
                        key={r.label}
                        className={`rounded-md border px-3 py-2 ${status.borderClass}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-sm font-medium">
                              {r.label}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {status.description}
                            </div>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-medium ${status.chipClass}`}
                          >
                            {status.label}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🏋️ Workout */}
          <motion.div variants={cardVariants}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">Today&apos;s Workout</CardTitle>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {todayWorkout.name}
                </span>
              </CardHeader>
              <CardContent className="space-y-1">
                <ul className="space-y-1.5 text-xs">
                  {todayWorkout.items.map((w) => (
                    <li
                      key={w}
                      className="rounded-md bg-muted px-2 py-1.5 text-[11px]"
                    >
                      {w}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* 💸 Budget */}
          <motion.div variants={cardVariants}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">This Week&apos;s Budget</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className="font-semibold">
                    ${budget.weekSpend} / ${budget.weekLimit}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${
                      budgetPercent > 90
                        ? "bg-red-500"
                        : budgetPercent > 70
                        ? "bg-yellow-500"
                        : "bg-emerald-500"
                    } transition-all`}
                    style={{ width: `${budgetPercent}%` }}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {budgetPercent <= 100
                    ? `${budgetPercent}% of your weekly limit`
                    : `Over budget by ${budgetPercent - 100}%`}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
