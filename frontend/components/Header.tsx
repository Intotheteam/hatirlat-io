"use client";

import React, { useState } from "react";
import { Sun, Moon, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  activePage: string;
  onNavigate: (page: string) => void;
  toggleTheme: (mode: "light" | "dark") => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  toggleTheme,
  isDarkMode,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const linkClasses = (page: string) =>
    `flex items-center space-x-2 cursor-pointer border-b-2 ${
      activePage === page
        ? "text-white border-green-400"
        : "text-white/70 hover:text-white/90 border-transparent"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");

    router.replace("/login");
  };

  return (
    <header className="bg-teal-500 text-white px-6 py-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-5 5-5-5h5v-12"
            />
          </svg>
          <span className="text-xl font-semibold">Hatirlat.io</span>
        </div>

        <nav className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
          <div
            className={linkClasses("dashboard")}
            onClick={() => onNavigate("dashboard")}
          >
            <span>Dashboard</span>
          </div>
          <div
            className={linkClasses("schedules")}
            onClick={() => onNavigate("schedules")}
          >
            <span>Schedules</span>
          </div>
          <div
            className={linkClasses("groups")}
            onClick={() => onNavigate("groups")}
          >
            <span>Groups</span>
          </div>
        </nav>

        <div className="flex items-center space-x-2 relative">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-md"
            >
              {isDarkMode ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-50">
                <div
                  onClick={() => {
                    toggleTheme("light");
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <Sun className="w-4 h-4" />
                  <span>Light Mode</span>
                </div>
                <div
                  onClick={() => {
                    toggleTheme("dark");
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-white hover:bg-white/10 rounded-md"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
