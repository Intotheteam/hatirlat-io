"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  ListChecks, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Calendar,
  Home,
  User
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { View } from "@/types";
import Link from "next/link";

interface AnimatedSidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const navItems = [
  { view: "dashboard" as View, label: "Dashboard", icon: Home },
  { view: "schedules" as View, label: "Schedules", icon: Calendar },
  { view: "groups" as View, label: "Groups", icon: Users },
];

export function AnimatedSidebar({ currentView, onNavigate }: AnimatedSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (view: View) => {
    onNavigate(view);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  // Desktop sidebar variant
  const desktopSidebar = (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: 280 }}
      exit={{ width: 0 }}
      className="hidden lg:flex fixed left-0 top-0 h-screen w-72 flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50"
    >
      <div className="flex h-16 items-center border-b px-6">
        <Link href="#" className="flex items-center gap-2" onClick={() => handleNavigation("dashboard")}>
          <div className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-green-500">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-green-500">
            Hatirlat.io
          </span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.view}
                variant={currentView === item.view ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                  currentView === item.view 
                    ? "bg-gradient-to-r from-teal-500/20 to-green-500/20 border-l-4 border-teal-500" 
                    : "hover:bg-secondary/50"
                }`}
                onClick={() => handleNavigation(item.view)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {currentView === item.view && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="ml-auto h-2 w-2 rounded-full bg-teal-500"
                  />
                )}
              </Button>
            );
          })}
        </nav>
      </div>
      
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  // Mobile sidebar variant
  const mobileSidebar = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={toggleSidebar}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background p-4 lg:hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <Link href="#" className="flex items-center gap-2" onClick={() => handleNavigation("dashboard")}>
                <div className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-green-500">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <span className="text-lg font-bold">Hatirlat.io</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.view}
                    variant={currentView === item.view ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 rounded-xl px-4 py-3 mb-2 ${
                      currentView === item.view 
                        ? "bg-gradient-to-r from-teal-500/20 to-green-500/20" 
                        : "hover:bg-secondary/50"
                    }`}
                    onClick={() => handleNavigation(item.view)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>
            
            <div className="mt-auto pt-8 border-t">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <Button variant="ghost" size="icon">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {desktopSidebar}
      
      {/* Mobile Sidebar */}
      {mobileSidebar}
      
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full items-center justify-between px-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-green-500">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-bold">Hatirlat.io</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      {/* Desktop Header Space */}
      <div className="h-16 lg:hidden"></div>
      <div className="h-16 lg:ml-72"></div>
    </>
  );
}