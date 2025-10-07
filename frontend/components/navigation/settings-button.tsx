"use client"

import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SettingsButton() {
  return (
    <div className="relative group">
      {/* Gradient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-all duration-500"></div>

      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-xl hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:border hover:border-border/60 dark:hover:border-border/40 transition-all duration-300 hover:shadow-md"
      >
        {/* Icon container with enhanced styling */}
        <div className="relative p-1.5 rounded-lg group-hover:bg-gradient-to-br group-hover:from-indigo-50/50 group-hover:to-purple-50/50 dark:group-hover:from-indigo-950/20 dark:group-hover:to-purple-950/20 group-hover:border group-hover:border-indigo-200/40 dark:group-hover:border-indigo-500/30 transition-all duration-300">
          <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
        </div>

        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
      </Button>
    </div>
  )
}
