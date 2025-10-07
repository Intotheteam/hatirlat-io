"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function WelcomeCard() {
  const now = new Date();
  const hour = now.getHours();
  let greeting = "Good Morning";

  if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
  } else if (hour >= 17 || hour < 5) {
    greeting = "Good Evening";
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5">
        <CardContent className="p-0">
          <h1 className="text-2xl font-bold tracking-tight">{greeting}, welcome back!</h1>
          <p className="mt-1 text-muted-foreground">
            Here's what's happening with your reminders today.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}