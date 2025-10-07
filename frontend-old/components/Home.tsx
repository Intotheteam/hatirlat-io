"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import Groups from "@/app/(dashboard)/groups/page";
import Schedules from "@/app/(dashboard)/schedules/page";
import Dashboard from "@/app/(dashboard)/dashboards/page";

export default function HomePage() {
  const [activePage, setActivePage] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
    setIsThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (isThemeLoaded) {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
  }, [isDarkMode, isThemeLoaded]);

  const handleToggleTheme = (mode: "light" | "dark") => {
    setIsDarkMode(mode === "dark");
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard isDarkMode={isDarkMode} />;
      case "schedules":
        return <Schedules isDarkMode={isDarkMode} />;
      case "groups":
        return <Groups isDarkMode={isDarkMode} />;
      default:
        return <Dashboard isDarkMode={isDarkMode} />;
    }
  };

  if (!isThemeLoaded) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header
        activePage={activePage}
        onNavigate={setActivePage}
        toggleTheme={handleToggleTheme}
        isDarkMode={isDarkMode}
      />
      <main className="p-6">{renderPage()}</main>
    </div>
  );
}
