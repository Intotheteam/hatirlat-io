"use client"

import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function UpgradeButton() {
  return (
    <div className="relative group">
      {/* Animated gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-40 group-hover:opacity-70 group-hover:blur-xl transition-all duration-500 animate-pulse"></div>

      {/* Enhanced sparkle decorations */}
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity"></div>
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity delay-75"></div>

      <Button
        variant="default"
        size="sm"
        className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-full font-semibold overflow-hidden"
      >
        {/* Premium border overlay */}
        <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>

        {/* Icon container with glow */}
        <div className="relative p-1.5 rounded-lg bg-white/10 mr-2 inline-flex">
          <div className="absolute inset-0 bg-white/20 rounded-lg blur-sm animate-pulse"></div>
          <Sparkles className="relative h-3.5 w-3.5 animate-pulse" />
        </div>

        <span className="relative z-10">Upgrade</span>

        {/* Animated shine effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        {/* Subtle inner glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-transparent"></div>
      </Button>
    </div>
  )
}
