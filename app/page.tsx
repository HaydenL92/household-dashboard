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
  id: number;
  label: string;
  last_done: string; // matches API field
  interval_days: number;
};

type BudgetState = {
  week_spend: number;
  week_limit: number;
};

const GROCERY_CATEGORIES = ["Produce", "Protein", "Dairy", "Pantry", "Other"];

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: 1,
    label: "Change AC filter",
    last_done: "2025-10-01",
    interval_days: 90,
  },
  {
    id: 2,
    label: "Change Brita filter",
    last_done: "2025-11-15",
    interval_days: 60,
  },
  {
    id: 3,
    label: "Change toothbrushes",
    last_done: "2025-10-20",
    interval_days: 90,
  },
  {
    id: 4,
    label: "Trash night",
    last_done: "2025-12-07",
    interval_days: 7,
  },
];

const API_BASE = "http://localhost:8001";

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

export default function Home() {
  const today = new Date();
  const todayDateString = today.toISOString().slice(0, 10);
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // ===== GROCERY STATE (backend) =====
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [loadingGroceries, setLoadingGroceries] = useState(true);
  const [newGrocery, setNewGrocery] = useState("");
  const [newGroceryCategory, setNewGroceryCategory] = useState("Produce");

  // ===== REMINDERS (backend) =====
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [newReminderLabel, setNewReminderLabel] = useState("");
  const [newReminderInterval, setNewReminderInterval] = useState(30);

  // ===== BUDGET (backend) =====
  const [budget, setBudget] = useState<BudgetState | null>(null);
  const [loadingBudget, setLoadingBudget] = useState(true);

  // ===== SETTINGS / WEATHER LOCATION (backend) =====
  const [weatherLocation, setWeatherLocation] = useState("Your Area");
  const [savingWeatherLocation, setSavingWeatherLocation] = useState(false);

  // ===== Workout plan for the week (0 = Sunday) =====
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

  // Weather data is still placeholder for now,
  // but uses the backend-stored weatherLocation.
  const weather = {
    temp: "78°F",
    condition: "Partly cloudy",
    location: weatherLocation || "Your Area",
  };

  const budgetPercent =
    budget && budget.week_limit > 0
      ? Math.min(
          100,
          Math.round((budget.week_spend / budget.week_limit) * 100)
        )
      : 0;

  // ===== LOAD FROM BACKEND: groceries =====
  useEffect(() => {
    async function loadGroceries() {
      try {
        const res = await fetch(`${API_BASE}/groceries`);
        if (!res.ok) throw new Error("Failed to load groceries");
        const data = await res.json();
        setGroceryItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingGroceries(false);
      }
    }

    loadGroceries();
  }, []);

  // ===== LOAD FROM BACKEND: reminders (and seed defaults if empty) =====
  useEffect(() => {
    async function loadReminders() {
      try {
        const res = await fetch(`${API_BASE}/reminders`);
        if (!res.ok) throw new Error("Failed to load reminders");
        let data: Reminder[] = await res.json();

        // If DB is empty, seed with defaults once
        if (data.length === 0) {
          const seeded: Reminder[] = [];
          for (const r of DEFAULT_REMINDERS) {
            const createRes = await fetch(`${API_BASE}/reminders`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                label: r.label,
                last_done: r.last_done,
                interval_days: r.interval_days,
              }),
            });
            if (createRes.ok) {
              const created = await createRes.json();
              seeded.push(created);
            }
          }
          data = seeded;
        }

        setReminders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingReminders(false);
      }
    }

    loadReminders();
  }, []);

  // ===== LOAD FROM BACKEND: budget =====
  useEffect(() => {
    async function loadBudget() {
      try {
        const res = await fetch(`${API_BASE}/budget`);
        if (!res.ok) throw new Error("Failed to load budget");
        const data = await res.json();
        setBudget({
          week_spend: data.week_spend,
          week_limit: data.week_limit,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBudget(false);
      }
    }

    loadBudget();
  }, []);

  // ===== LOAD FROM BACKEND: settings (weather location) =====
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`${API_BASE}/settings`);
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        setWeatherLocation(data.weather_location || "Your Area");
      } catch (err) {
        console.error(err);
        setWeatherLocation("Your Area");
      }
    }

    loadSettings();
  }, []);

  // ===== Grocery handlers (backend) =====
  async function handleAddGrocery(e: FormEvent) {
    e.preventDefault();

    const trimmed = newGrocery.trim();
    if (!trimmed) return;

    try {
      const res = await fetch(`${API_BASE}/groceries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          category: newGroceryCategory,
          done: false,
        }),
      });

      if (!res.ok) throw new Error("Failed to add grocery");

      const created = await res.json();
      setGroceryItems((prev) => [...prev, created]);
      setNewGrocery("");
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleGrocery(id: number) {
    const item = groceryItems.find((g) => g.id === id);
    if (!item) return;

    try {
      const res = await fetch(`${API_BASE}/groceries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !item.done }),
      });

      if (!res.ok) throw new Error("Failed to update grocery");

      const updated = await res.json();
      setGroceryItems((prev) =>
        prev.map((g) => (g.id === id ? updated : g))
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function removeGrocery(id: number) {
    try {
      const res = await fetch(`${API_BASE}/groceries/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete grocery");

      setGroceryItems((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  async function clearCompletedGroceries() {
    const completed = groceryItems.filter((g) => g.done);
    for (const item of completed) {
      await removeGrocery(item.id);
    }
  }

  const remainingCount = groceryItems.filter((g) => !g.done).length;

  // ===== Reminder helpers (backend) =====
  function getReminderStatus(reminder: Reminder) {
    const last = new Date(reminder.last_done);
    const elapsed = daysBetween(last, today);
    const daysLeft = reminder.interval_days - elapsed;

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

  async function handleAddReminder(e: FormEvent) {
    e.preventDefault();
    const trimmed = newReminderLabel.trim();
    if (!trimmed || newReminderInterval <= 0) return;

    try {
      const res = await fetch(`${API_BASE}/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: trimmed,
          last_done: todayDateString,
          interval_days: newReminderInterval,
        }),
      });

      if (!res.ok) throw new Error("Failed to add reminder");

      const created = await res.json();
      setReminders((prev) => [...prev, created]);

      setNewReminderLabel("");
      setNewReminderInterval(30);
    } catch (err) {
      console.error(err);
    }
  }

  async function markReminderDoneToday(id: number) {
    try {
      const res = await fetch(`${API_BASE}/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ last_done: todayDateString }),
      });

      if (!res.ok) throw new Error("Failed to update reminder");

      const updated = await res.json();
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function removeReminder(id: number) {
    try {
      const res = await fetch(`${API_BASE}/reminders/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete reminder");

      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  // ===== Budget handlers (backend) =====
  async function updateBudgetField(
    field: keyof BudgetState,
    value: string
  ) {
    if (!budget) return;
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;

    const updated: BudgetState = {
      ...budget,
      [field]: numeric,
    };

    // Optimistic update
    setBudget(updated);

    try {
      const res = await fetch(`${API_BASE}/budget`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: numeric }),
      });

      if (!res.ok) throw new Error("Failed to update budget");
      const data = await res.json();
      setBudget({
        week_spend: data.week_spend,
        week_limit: data.week_limit,
      });
    } catch (err) {
      console.error(err);
    }
  }

  // ===== Weather location handlers (backend) =====
  async function saveWeatherLocation() {
    try {
      setSavingWeatherLocation(true);
      const res = await fetch(`${API_BASE}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weather_location: weatherLocation }),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      // We could read response, but we already have the value locally
    } catch (err) {
      console.error(err);
    } finally {
      setSavingWeatherLocation(false);
    }
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
                  {loadingGroceries && (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      Loading groceries…
                    </p>
                  )}
                  {!loadingGroceries && (
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
                                void removeGrocery(item.id);
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
                  )}
                  {!loadingGroceries && groceryItems.length === 0 && (
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
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CloudSun className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm">Weather</CardTitle>
                  </div>
                  {savingWeatherLocation && (
                    <span className="text-[10px] text-muted-foreground">
                      Saving…
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="text-3xl font-semibold">{weather.temp}</div>
                  <div className="text-sm text-muted-foreground">
                    {weather.condition}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {weather.location}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">
                    Location (city or ZIP – backend uses this)
                  </label>
                  <Input
                    value={weatherLocation}
                    onChange={(e) => setWeatherLocation(e.target.value)}
                    onBlur={saveWeatherLocation}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur();
                      }
                    }}
                    placeholder="e.g. Houston, TX"
                    className="text-xs"
                  />
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
              <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
                <div className="flex-1 space-y-2 overflow-y-auto text-xs">
                  {loadingReminders && (
                    <p className="text-[11px] text-muted-foreground">
                      Loading reminders…
                    </p>
                  )}
                  {!loadingReminders && reminders.length === 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      No reminders yet. Add one below 👇
                    </p>
                  )}
                  {!loadingReminders &&
                    reminders.map((r) => {
                      const status = getReminderStatus(r);
                      return (
                        <div
                          key={r.id}
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
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={`rounded-full px-2 py-1 text-[10px] font-medium ${status.chipClass}`}
                              >
                                {status.label}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => void markReminderDoneToday(r.id)}
                                  className="rounded-full border border-border bg-background px-2 py-1 text-[10px] hover:bg-muted transition-colors"
                                >
                                  Done today
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void removeReminder(r.id)}
                                  className="rounded-full px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                {/* Add reminder form */}
                <form
                  onSubmit={handleAddReminder}
                  className="mt-1 space-y-2 border-t border-border pt-2 text-[11px]"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Add reminder</span>
                    <Input
                      value={newReminderLabel}
                      onChange={(e) => setNewReminderLabel(e.target.value)}
                      placeholder="e.g. Wash bedding"
                      className="text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-muted-foreground">
                        Every
                      </span>
                      <Input
                        type="number"
                        min={1}
                        value={newReminderInterval}
                        onChange={(e) =>
                          setNewReminderInterval(
                            Number(e.target.value) || 1
                          )
                        }
                        className="h-8 w-16 text-xs"
                      />
                      <span className="text-[11px] text-muted-foreground">
                        days
                      </span>
                    </div>
                    <button
                      type="submit"
                      className="ml-auto rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </form>
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
              <CardContent className="space-y-3">
                {loadingBudget && (
                  <p className="text-xs text-muted-foreground">
                    Loading budget…
                  </p>
                )}
                {!loadingBudget && (
                  <>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-baseline justify-between">
                        <span className="text-muted-foreground">Spent</span>
                        <span className="font-semibold">
                          ${budget?.week_spend.toFixed(2) ?? "0.00"} / $
                          {budget?.week_limit.toFixed(2) ?? "0.00"}
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
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="space-y-1">
                        <span className="text-muted-foreground">
                          Adjust weekly limit
                        </span>
                        <Input
                          type="number"
                          min={0}
                          value={budget?.week_limit ?? ""}
                          onChange={(e) =>
                            updateBudgetField("week_limit", e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground">
                          Update spent this week
                        </span>
                        <Input
                          type="number"
                          min={0}
                          value={budget?.week_spend ?? ""}
                          onChange={(e) =>
                            updateBudgetField("week_spend", e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
