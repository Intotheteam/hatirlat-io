"use client"
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark"

  return (
    <div className="relative group">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500 rounded-full blur-md opacity-0 group-hover:opacity-20 transition-all duration-500"></div>

      <div className="relative flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-br from-background to-accent/5 border border-border/60 dark:border-border/40 group-hover:border-border/80 dark:group-hover:border-border/60 transition-all duration-300 shadow-sm group-hover:shadow-md">
        {/* Sun Icon */}
        <div className={`relative p-1 rounded-lg transition-all duration-300 ${
          !isDark
            ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/40 dark:border-amber-500/30"
            : "group-hover:bg-accent/50"
        }`}>
          <Sun className={`h-4 w-4 transition-all duration-300 ${
            !isDark
              ? "text-amber-600 dark:text-amber-400 scale-110"
              : "text-muted-foreground group-hover:scale-110"
          }`} />
        </div>

        {/* Enhanced Switch */}
        <Switch
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-indigo-500 data-[state=checked]:to-purple-500 data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-amber-500 data-[state=unchecked]:to-orange-500 shadow-md"
        />

        {/* Moon Icon */}
        <div className={`relative p-1 rounded-lg transition-all duration-300 ${
          isDark
            ? "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/40 dark:border-indigo-500/30"
            : "group-hover:bg-accent/50"
        }`}>
          <Moon className={`h-4 w-4 transition-all duration-300 ${
            isDark
              ? "text-indigo-600 dark:text-indigo-400 scale-110"
              : "text-muted-foreground group-hover:scale-110"
          }`} />
        </div>
      </div>
    </div>
  )
}
