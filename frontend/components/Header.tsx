"use client"

import type React from "react"

import { Bell, ListChecks, Users, Settings, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import type { View } from "@/types"

interface HeaderProps {
  currentView: View
  onNavigate: (view: View) => void
  showNavigation: boolean
}

const navButtons: { view: View; label: string; icon: React.ElementType }[] = [
  { view: "dashboard", label: "Dashboard", icon: ListChecks },
  { view: "schedules", label: "Schedules", icon: Bell },
  { view: "groups", label: "Groups", icon: Users },
]

export function Header({ currentView, onNavigate, showNavigation }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/40 bg-primary text-primary-foreground">
      <div className="container grid h-16 max-w-screen-2xl grid-cols-3 items-center">
        {/* Left Section: Logo */}
        <div className="flex items-center justify-start">
          <a href="#" onClick={() => onNavigate("dashboard")} className="flex items-center space-x-2">
            <Bell className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Hatirlat.io</span>
          </a>
        </div>

        {/* Center Section: Navigation */}
        <div className="flex items-center justify-center">
          {showNavigation && (
            <nav className="hidden items-center space-x-1 md:flex">
              {navButtons.map(({ view, label, icon: Icon }) => (
                <Button
                  key={view}
                  variant="ghost"
                  onClick={() => onNavigate(view)}
                  className={`h-16 rounded-none border-b-4 px-4 text-base font-semibold transition-all duration-300 hover:bg-primary/20 ${
                    currentView === view
                      ? "border-secondary text-secondary-foreground"
                      : "border-transparent text-primary-foreground/70 hover:text-primary-foreground"
                  }`}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {label}
                </Button>
              ))}
            </nav>
          )}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center justify-end space-x-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Log Out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
