"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Home,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  User,
  Coins
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { UpgradeButton } from "./upgrade-button";
import type { View } from "@/types";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PremiumHeaderProps {
  currentView: View;
  onNavigate?: (view: View) => void;
}

const navItems = [
  { view: "dashboard" as View, labelKey: "dashboard", icon: Home, path: "/dashboard" },
  { view: "schedules" as View, labelKey: "schedules", icon: Calendar, path: "/schedules" },
  { view: "groups" as View, labelKey: "groups", icon: Users, path: "/groups" },
];

export function PremiumHeader({ currentView, onNavigate }: PremiumHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleNavigation = (view: View) => {
    if (onNavigate) {
      onNavigate(view);
    } else {
      // Default behavior: navigate to the corresponding route
      switch (view) {
        case "dashboard":
          router.push("/dashboard");
          break;
        case "schedules":
          router.push("/schedules");
          break;
        case "groups":
          router.push("/groups");
          break;
        default:
          router.push("/dashboard");
      }
    }
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section - Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative">
                {/* Animated gradient glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 group-hover:blur-xl transition-all duration-500 animate-pulse"></div>

                {/* Icon container with enhanced styling */}
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 border border-white/20">
                  <div className="relative">
                    <Bell className="h-5 w-5 text-white drop-shadow-md" />
                    {/* Small notification dot */}
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform"></div>
                  </div>
                </div>

                {/* Decorative ring */}
                <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ padding: '2px' }}></div>
              </div>

              <div className="flex flex-col gap-0.5">
                {/* Main logo text with enhanced gradient */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-300">
                    Hatirlat.io
                  </span>
                  {/* Premium badge */}
                  <div className="hidden sm:flex items-center px-1.5 py-0.5 rounded-md bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/30 dark:border-indigo-500/30">
                    <Sparkles className="h-2.5 w-2.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>

                {/* Tagline with icon */}
                <div className="flex items-center gap-1 hidden sm:flex">
                  <div className="w-1 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  <span className="text-xs text-muted-foreground font-medium tracking-wide">{t("header.smart_reminders")}</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <div key={item.view} className="relative group">
                  <Link href={item.path}>
                    <Button
                      variant="ghost"
                      className={`px-6 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive
                        ? "text-foreground font-semibold shadow-md bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30 border border-indigo-200/40 dark:border-indigo-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:border hover:border-border/40"
                        }`}
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default click behavior since we're using Link
                        handleNavigation(item.view);
                      }}
                    >
                      {/* Animated background for active state */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
                      )}

                      {/* Icon with enhanced styling */}
                      <div className={`relative p-1 rounded-lg mr-2 inline-flex ${isActive
                        ? "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/30 dark:border-indigo-500/30"
                        : "group-hover:bg-accent/50"
                        }`}>
                        <Icon className={`h-4 w-4 transition-transform duration-300 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""
                          } group-hover:scale-110`} />
                      </div>

                      <span className="relative z-10">{t(`header.${item.labelKey}`)}</span>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300"></div>
                    </Button>
                  </Link>

                  {/* Enhanced active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-[1px] left-4 right-4 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 blur-sm opacity-50"></div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.username ? getInitials(user.username) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <Link href="/profile">
                  <DropdownMenuItem asChild>
                    <div className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t("header.profile")}</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
                <Link href="/profile">
                  <DropdownMenuItem asChild>
                    <div className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t("header.settings")}</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("header.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>



            {/* Credits Display */}
            <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/30 dark:border-amber-500/30 gap-1.5 cursor-pointer hover:bg-amber-500/20 transition-colors" onClick={() => router.push('/credits')}>
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {user?.credits || 0}
              </span>
            </div>

            {/* Upgrade Button */}
            {!user?.premium && (
              <div className="hidden md:block">
                <UpgradeButton />
              </div>
            )}

            {/* Enhanced Mobile Menu Button */}
            <div className="relative group lg:hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-all duration-300"></div>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:border hover:border-border/40 transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <div className="p-1 rounded-lg group-hover:bg-accent/50 transition-all">
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  ) : (
                    <Menu className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden pb-4 border-t border-border/40 mt-2 bg-gradient-to-b from-background to-accent/5 z-50"
            >
              <div className="flex flex-col gap-2 pt-4">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.view;
                  return (
                    <motion.div
                      key={item.view}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                    >
                      <Link href={item.path} onClick={() => handleNavigation(item.view)}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={`w-full justify-start rounded-xl transition-all duration-300 ${isActive
                            ? "bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30 border-2 border-indigo-200/40 dark:border-indigo-500/30 shadow-md font-semibold"
                            : "hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:border hover:border-border/40"
                            }`}
                        >
                          {/* Icon container */}
                          <div className={`p-1.5 rounded-lg mr-3 ${isActive
                            ? "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/30 dark:border-indigo-500/30"
                            : "group-hover:bg-accent/50"
                            }`}>
                            <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""
                              } group-hover:scale-110 transition-transform`} />
                          </div>
                          {t(`header.${item.labelKey}`)}

                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg"></div>
                          )}
                        </Button>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Enhanced action buttons section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 space-y-2"
                >
                  {/* Enhanced Upgrade Button */}
                  {!user?.premium && (
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-all duration-300 animate-pulse"></div>
                      <Button
                        variant="default"
                        className="relative w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl rounded-xl font-semibold border border-white/20"
                      >
                        <div className="p-1 rounded-lg bg-white/10 mr-2 inline-flex">
                          <Sparkles className="h-4 w-4 animate-pulse" />
                        </div>
                        {t("header.upgrade_premium")}
                      </Button>
                    </div>
                  )}

                  {/* Enhanced Settings & Logout buttons */}
                  <div className="flex gap-2">
                    <Link href="/dashboard" className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-2 border-border/60 dark:border-border/40 hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:border-indigo-200/40 dark:hover:border-indigo-500/30 transition-all"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigation("dashboard");
                        }}
                      >
                        <div className="p-1 rounded-lg group-hover:bg-accent/50 mr-2 inline-flex">
                          <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                        </div>
                        {t("header.settings")}
                      </Button>
                    </Link>
                    <div className="relative group flex-1">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-2 border-border/60 dark:border-border/40 hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:border-pink-200/40 dark:hover:border-pink-500/30 transition-all"
                        onClick={handleLogout}
                      >
                        <div className="p-1 rounded-lg group-hover:bg-accent/50 mr-2 inline-flex">
                          <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        {t("header.logout")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}