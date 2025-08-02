"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import SchedulesReminder from "../../../../components/schedulesModal/SchedulesReminder";
import {
  RiMailLine,
  RiMessage2Line,
  RiPauseFill,
  RiPlayFill,
  RiWhatsappLine,
} from "react-icons/ri";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import EditSchedules from "../../../../components/schedulesModal/EditSchedelus";

interface SchedulesProps {
  isDarkMode: boolean;
}

interface Group {
  id: number;
  name: string;
}

interface Reminder {
  id: number;
  title: string;
  recipient: string;
  date: string;
  status: "scheduled" | "sent" | "paused" | "failed";
  statusColor: string;
  type: "Personal" | "Group";
  channels: string[];
  is_active: boolean;
  contact_name?: string | null;
  group?: Group | null;
  group_name?: string;
}

const Schedules: React.FC<SchedulesProps> = ({ isDarkMode }) => {
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [channelFilter, setChannelFilter] = useState("All Channels");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const formatDate = (input: string | Date): string => {
    const dateObj = typeof input === "string" ? new Date(input) : input;
    if (isNaN(dateObj.getTime())) return "Geçersiz Tarih";

    return dateObj.toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/groups/");
      setGroups(res.data);
    } catch (err) {
      console.error("Gruplar alınamadı", err);
    }
  };

  const fetchReminders = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/reminders/");
      const data = res.data;

      const mappedReminders: Reminder[] = data.map((r: any) => {
        console.log("Group verisi nasıl geliyor?", r.group);
        const groupName =
          r.group && typeof r.group === "object"
            ? r.group.name
            : r.group_name ??
              (typeof r.group === "number"
                ? groups.find((g) => g.id === r.group)?.name
                : null);

        const recipient =
          r.reminder_type === "Group"
            ? groupName || "Grup Bilgisi Eksik"
            : r.contact_name || "Kişi Bilgisi Eksik";

        const status: Reminder["status"] =
          r.status || (r.is_active ? "scheduled" : "paused");

        const statusColor =
          status === "scheduled"
            ? "bg-blue-100 text-blue-800"
            : status === "sent"
            ? "bg-green-100 text-green-800"
            : status === "paused"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800";

        return {
          id: r.id,
          title: r.title,
          recipient,
          date: formatDate(r.datetime),
          status,
          statusColor,
          type: r.reminder_type,
          channels: r.channels || [],
          is_active: r.is_active,
          contact_name: r.contact_name,
          group: r.group,
        };
      });

      setReminders(mappedReminders);
    } catch (err) {
      console.error("Hatırlatmalar alınamadı", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (groups.length > 0) {
      fetchReminders();
    }
  }, [groups]);

  const togglePause = async (id: number) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/reminders/${id}/toggle_active/`
      );
      fetchReminders();
    } catch (err) {
      console.error("Durum değiştirilemedi", err);
    }
  };

  const handleAddReminder = (newReminder: any) => {
    const groupName =
      newReminder.group && typeof newReminder.group === "number"
        ? groups.find((g) => g.id === newReminder.group)?.name
        : newReminder.group?.name;

    const recipient =
      newReminder.reminder_type === "Group"
        ? groupName || "Grup Bilgisi Eksik"
        : newReminder.contact_name || "Kişi Bilgisi Eksik";

    const status: Reminder["status"] =
      newReminder.status || (newReminder.is_active ? "scheduled" : "paused");

    const statusColor =
      status === "scheduled"
        ? "bg-blue-100 text-blue-800"
        : status === "sent"
        ? "bg-green-100 text-green-800"
        : status === "paused"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

    const mappedReminder: Reminder = {
      id: newReminder.id,
      title: newReminder.title,
      recipient,
      date: formatDate(newReminder.datetime),
      status,
      statusColor,
      type: newReminder.reminder_type,
      channels: newReminder.channels || [],
      is_active: newReminder.is_active,
      contact_name: newReminder.contact_name,
      group: newReminder.group,
    };
    setReminders((prev) => [mappedReminder, ...prev]);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setShowEditForm(true);
  };

  const handleUpdateReminder = (updatedReminder: Reminder) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === updatedReminder.id ? updatedReminder : r))
    );
    setShowEditForm(false);
    setEditingReminder(null);
  };

  const handleDeleteReminder = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/reminders/${id}/`);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Silme işlemi başarısız:", error);
    }
  };

  const filteredReminders = reminders.filter((reminder) => {
    const lowerSearch = searchTerm.toLowerCase();

    const matchesSearch =
      reminder.title.toLowerCase().includes(lowerSearch) ||
      reminder.recipient.toLowerCase().includes(lowerSearch) ||
      reminder.status?.toLowerCase().includes(lowerSearch);

    const matchesStatus =
      statusFilter === "All Statuses" ||
      reminder.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesType =
      typeFilter === "All Types" ||
      reminder.type?.toLowerCase() === typeFilter.toLowerCase();

    const matchesChannel =
      channelFilter === "All Channels" ||
      reminder.channels
        .map((c) => c.toLowerCase())
        .includes(channelFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesType && matchesChannel;
  });

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
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Scheduled Reminders</h1>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                View, manage, and create your reminders.
              </p>
            </div>
            <button
              onClick={() => setShowReminderForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center space-x-2"
            >
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

          <div className="flex space-x-4 mb-6 flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search reminders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-[300px] md:w-[500px] px-4 py-2 rounded-md border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`appearance-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300"
              } border rounded-md px-4 py-2 pr-8 text-sm`}
            >
              <option>All Statuses</option>
              <option>scheduled</option>
              <option>sent</option>
              <option>paused</option>
              <option>failed</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`appearance-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300"
              } border rounded-md px-4 py-2 pr-8 text-sm`}
            >
              <option>All Types</option>
              <option>Personal</option>
              <option>Group</option>
            </select>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className={`appearance-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300"
              } border rounded-md px-4 py-2 pr-8 text-sm`}
            >
              <option>All Channels</option>
              <option>email</option>
              <option>sms</option>
              <option>whatsapp</option>
            </select>
          </div>

          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } rounded-lg shadow-sm max-h-[60vh] overflow-y-auto`}
          >
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReminders.length > 0 ? (
                filteredReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`p-6 flex items-center justify-between ${
                      isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-2">
                        {reminder.title}
                      </h3>
                      <div
                        className={`flex items-center space-x-4 text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <span>To: {reminder.recipient}</span>
                        <span>•</span>
                        <span>{reminder.date}</span>
                      </div>

                      <div className="flex mt-2 space-x-2 text-lg">
                        {reminder.channels.includes("email") && (
                          <RiMailLine title="Email" className="text-blue-400" />
                        )}
                        {reminder.channels.includes("sms") && (
                          <RiMessage2Line
                            title="SMS"
                            className="text-green-400"
                          />
                        )}
                        {reminder.channels.includes("whatsapp") && (
                          <RiWhatsappLine
                            title="WhatsApp"
                            className="text-green-600"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full ${reminder.statusColor}`}
                      >
                        {reminder.status === "sent" ? (
                          <>
                            <span>✅</span>
                            <span>sent</span>
                          </>
                        ) : reminder.status === "failed" ? (
                          <>
                            <span>❌</span>
                            <span>failed</span>
                          </>
                        ) : reminder.status === "paused" ||
                          !reminder.is_active ? (
                          <>
                            <span>⏸</span>
                            <span>paused</span>
                          </>
                        ) : (
                          <>
                            <span>⏳</span>
                            <span>scheduled</span>
                          </>
                        )}
                      </span>

                      <button
                        onClick={() => togglePause(reminder.id)}
                        className="text-yellow-500 hover:text-yellow-400"
                        title={
                          reminder.status === "paused" ? "Resume" : "Pause"
                        }
                      >
                        {reminder.status === "paused" || !reminder.is_active ? (
                          <RiPlayFill className="w-5 h-5" />
                        ) : (
                          <RiPauseFill className="w-5 h-5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleEditReminder(reminder)}
                        className="text-blue-500 hover:text-blue-400"
                        title="Edit"
                      >
                        <FiEdit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="text-red-500 hover:text-red-400"
                        title="Delete"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={`p-6 text-center ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  No reminders found.
                </div>
              )}
            </div>
          </div>

          <SchedulesReminder
            isOpen={showReminderForm}
            onClose={() => setShowReminderForm(false)}
            onAddReminder={handleAddReminder}
          />

          {showEditForm && editingReminder && editingReminder.id && (
            <EditSchedules
              reminderId={editingReminder.id}
              onClose={() => setShowEditForm(false)}
              onUpdateReminder={handleUpdateReminder}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Schedules;
