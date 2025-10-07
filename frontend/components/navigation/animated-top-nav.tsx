"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  ListChecks, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { View } from "@/types";
import Link from "next/link";

interface AnimatedTopNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const navItems = [
  { view: "dashboard" as View, label: "Dashboard", icon: ListChecks },
  { view: "schedules" as View, label: "Schedules", icon: Bell },
  { view: "groups" as View, label: "Groups", icon: Users },
];

export function AnimatedTopNav({ currentView, onNavigate }: AnimatedTopNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (view: View) => {
    onNavigate(view);
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo section */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-green-500">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <Link href="#" onClick={() => handleNavigation("dashboard")}>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-green-500">
              Hatirlat.io
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                  key={item.view}
                  variant={currentView === item.view ? "secondary" : "ghost"}
                  className={`relative rounded-xl px-4 py-2 transition-all duration-300 ${
                    currentView === item.view 
                      ? "bg-gradient-to-r from-teal-500/20 to-green-500/20" 
                      : "hover:bg-secondary/50"
                  }`}
                  onClick={() => handleNavigation(item.view)}
                >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
                {currentView === item.view && (
                  <motion.div 
                    layoutId="activeIndicator" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-green-500"
                  />
                )}
              </Button>
            );
          })}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <div className="container py-4">
              <div className="grid gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.view}
                      variant={currentView === item.view ? "secondary" : "ghost"}
                      className={`w-full justify-start rounded-xl px-4 py-3 ${
                        currentView === item.view 
                          ? "bg-gradient-to-r from-teal-500/20 to-green-500/20" 
                          : "hover:bg-secondary/50"
                      }`}
                      onClick={() => handleNavigation(item.view)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <ThemeToggle />
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button variant="ghost" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}