"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  PiggyBank,
  CloudSun,
  Repeat,
  Dumbbell,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // TEMP DATA – later this will come from your backend
  const groceries = ["Eggs", "Spinach", "Chicken", "Coffee"];
  const reminders = [
    { label: "Change AC filter", due: "In 5 days" },
    { label: "Change Brita filter", due: "Next week" },
    { label: "Trash night", due: "Tonight" },
  ];
  const workout = {
    day: "Upper Body",
    items: ["Bench Press", "Rows", "Shoulder Press", "Triceps", "Core"],
  };
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
          {/* Groceries */}
          <motion.div
            variants={containerVariants}
            className="md:col-span-2 md:row-span-2"
          >
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Grocery List</CardTitle>
                </div>
                <span className="text-xs text-muted-foreground">
                  Tap to check off (coming soon)
                </span>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <ul className="space-y-1">
                  {groceries.map((item) => (
                    <li
                      key={item}
                      className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm hover:bg-muted/80 transition-colors cursor-default md:cursor-pointer"
                    >
                      <span>{item}</span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Item
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weather */}
          <motion.div variants={containerVariants}>
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

          {/* Reminders */}
          <motion.div variants={containerVariants} className="md:row-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">Recurring Reminders</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <ul className="space-y-2">
                  {reminders.map((r) => (
                    <li
                      key={r.label}
                      className="rounded-md border border-border px-3 py-2 text-xs"
                    >
                      <div className="font-medium text-sm">{r.label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {r.due}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Workout */}
          <motion.div variants={containerVariants}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">Today&apos;s Workout</CardTitle>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {workout.day}
                </span>
              </CardHeader>
              <CardContent className="space-y-1">
                <ul className="text-xs space-y-1.5">
                  {workout.items.map((w) => (
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

          {/* Budget */}
          <motion.div variants={containerVariants}>
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
