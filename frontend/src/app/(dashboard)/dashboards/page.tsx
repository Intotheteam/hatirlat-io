"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, isToday } from "date-fns";

interface DashboardProps {
  isDarkMode: boolean;
}

interface Group {
  id: number;
  name: string;
}

interface Reminder {
  id: number;
  title: string;
  is_active: boolean;
  status: string;
  datetime: string;
  reminder_type: "Personal" | "Group";
}

export default function Dashboard({ isDarkMode }: DashboardProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const fetchReminders = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/reminders/");
      setReminders(res.data);
    } catch (err) {
      console.error("Reminders couldn't be fetched", err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/groups/");
      setGroups(res.data);
    } catch (err) {
      console.error("Groups couldn't be fetched", err);
    }
  };

  useEffect(() => {
    fetchReminders();
    fetchGroups();
  }, []);

  const deleteReminder = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/reminders/${id}/`);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      setMenuOpenId(null);
    } catch (err) {
      console.error("Reminder silinemedi:", err);
      alert("Reminder silinemedi.");
    }
  };

  const handleEdit = (reminder: Reminder) => {
    console.log("Edit tıklandı:", reminder);
    setMenuOpenId(null);
  };

  const totalReminders = reminders.length;
  const activeReminders = reminders.filter((r) => r.is_active).length;
  const completedReminders = reminders.filter(
    (r) => r.status === "sent"
  ).length;
  const groupCount = groups.length;

  const todayReminders = reminders.filter((r) => isToday(new Date(r.datetime)));

  const renderStatus = (reminder: Reminder) => {
    if (reminder.status === "sent") {
      return <span className="text-green-500 text-xl">✅</span>;
    } else if (reminder.is_active) {
      return <span className="text-green-400 text-xl">🟢</span>;
    } else {
      return <span className="text-red-500 text-xl">❌</span>;
    }
  };

  const stats = [
    {
      label: "Total Reminders",
      value: totalReminders,
      icon: "M15 17h5l-5 5-5-5h5v-12",
    },
    { label: "Active", value: activeReminders, color: "blue" },
    { label: "Completed", value: completedReminders, color: "green" },
    {
      label: "Groups",
      value: groupCount,
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
    },
  ];

  return (
    <div
      className={
        isDarkMode
          ? "min-h-screen bg-gray-900 text-white"
          : "min-h-screen bg-gray-50 text-gray-900"
      }
    >
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                Welcome back, here's your summary.
              </p>
            </div>
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center space-x-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>New Reminder</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((card, idx) => (
              <div
                key={idx}
                className={
                  isDarkMode
                    ? "bg-gray-800 text-white rounded-lg shadow-sm p-6"
                    : "bg-white rounded-lg shadow-sm p-6"
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">
                      {card.label}
                    </p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                  {"icon" in card ? (
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={card.icon}
                      />
                    </svg>
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full bg-${card.color}-100 flex items-center justify-center`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-${card.color}-500`}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div
            className={`rounded-lg shadow-sm p-6 ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Today's Reminders</h2>
            {todayReminders.length > 0 ? (
              <ul className="divide-y divide-gray-600">
                {todayReminders.map((reminder) => (
                  <li
                    key={reminder.id}
                    className="flex items-center justify-between py-3 relative"
                  >
                    <div className="mr-4">{renderStatus(reminder)}</div>

                    <div className="flex-1">
                      <p className="font-medium">
                        🕙 {format(new Date(reminder.datetime), "hh:mm a")} –{" "}
                        {reminder.title}
                      </p>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        📌 Type: {reminder.reminder_type}
                      </p>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setMenuOpenId((prev) =>
                            prev === reminder.id ? null : reminder.id
                          )
                        }
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v.01M12 12v.01M12 18v.01"
                          />
                        </svg>
                      </button>

                      {menuOpenId === reminder.id && (
                        <div className="absolute right-0 mt-2 w-28 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
                          <button
                            onClick={() => handleEdit(reminder)}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteReminder(reminder.id)}
                            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">
                Bugün için hatırlatma yok.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
