"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface Reminder {
  id: number;
  title: string;
  channels: string[];
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  message: string;
  datetime: string;
  repeat: "None" | "Daily" | "Weekly" | "Monthly";
  reminder_type: "Personal" | "Group";
  group?: { id: number; name: string } | null;
}

interface EditSchedulesProps {
  reminderId: number;
  onClose: () => void;
  onUpdateReminder: (updatedReminder: Reminder) => void;
}

const EditSchedules: React.FC<EditSchedulesProps> = ({
  reminderId,
  onClose,
  onUpdateReminder,
}) => {
  const [loading, setLoading] = useState(true);
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [groupList, setGroupList] = useState<{ id: number; name: string }[]>(
    []
  );

  const [channels, setChannels] = useState({
    email: false,
    sms: false,
    whatsapp: false,
  });

  const [form, setForm] = useState({
    title: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    message: "",
    datetime: "",
    repeat: "None" as "None" | "Daily" | "Weekly" | "Monthly",
    reminder_type: "Personal" as "Personal" | "Group",
    group: null as number | null,
  });

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/reminders/${reminderId}/`)
      .then((res) => {
        const data = res.data;
        setReminder(data);
        setForm({
          title: data.title || "",
          contact_name: data.contact_name || "",
          contact_phone: data.contact_phone || "",
          contact_email: data.contact_email || "",
          message: data.message || "",
          datetime: data.datetime?.slice(0, 16) || "",
          repeat: data.repeat || "None",
          reminder_type: data.reminder_type || "Personal",
          group: data.group?.id || null,
        });

        setChannels({
          email: data.channels?.includes("email") || false,
          sms: data.channels?.includes("sms") || false,
          whatsapp: data.channels?.includes("whatsapp") || false,
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error("Hatırlatma verisi alınamadı:", err);
        alert("Veri alınırken bir hata oluştu.");
        setLoading(false);
      });

    axios.get("http://localhost:8000/api/groups/").then((res) => {
      setGroupList(res.data);
    });
  }, [reminderId]);

  const toggleChannel = (key: keyof typeof channels) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      title: form.title,
      message: form.message,
      datetime: form.datetime,
      repeat: form.repeat,
      reminder_type: form.reminder_type,
      channels: Object.entries(channels)
        .filter(([_, val]) => val)
        .map(([key]) => key),
      contact_name: form.contact_name,
      contact_phone: form.contact_phone,
      contact_email: form.contact_email,
    };

    if (form.reminder_type === "Group" && form.group) {
      payload.group = form.group;
    }

    try {
      const res = await axios.put(
        `http://localhost:8000/api/reminders/${reminderId}/`,
        payload
      );
      alert("Hatırlatma güncellendi!");
      onUpdateReminder(res.data);
      onClose();
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      alert("Güncelleme sırasında bir hata oluştu.");
    }
  };

  if (loading || !reminder) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full bg-gray-900 text-white p-6 rounded-md shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold mb-4">Edit Reminder</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Reminder Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block mb-1">Reminder Type</label>
            <div className="flex gap-3">
              {(["Personal", "Group"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange("reminder_type", type)}
                  className={`px-4 py-1 rounded-md border ${
                    form.reminder_type === type
                      ? "bg-green-700 border-green-500"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1">Notification Channels</label>
            <div className="flex gap-3">
              {(["email", "sms", "whatsapp"] as const).map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  className={`px-3 py-1 rounded-md border capitalize ${
                    channels[channel]
                      ? "bg-green-700 border-green-500"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  }`}
                >
                  {channel}
                </button>
              ))}
            </div>
          </div>
          {form.reminder_type === "Personal" && (
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={form.contact_name || ""}
                  readOnly
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-md w-full px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={form.contact_phone || ""}
                  readOnly
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-md w-full px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={form.contact_email || ""}
                  readOnly
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-md w-full px-3 py-2 focus:outline-none"
                />
              </div>
            </div>
          )}

          {form.reminder_type === "Group" && (
            <div>
              <label className="block mb-1">Select a group</label>
              <select
                value={form.group ?? ""}
                onChange={(e) => handleChange("group", Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
              >
                <option value="">Select a group</option>
                {groupList.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block mb-1">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md resize-none"
            />
          </div>

          <div>
            <label className="block mb-1">Date and Time</label>
            <input
              type="datetime-local"
              value={form.datetime}
              onChange={(e) => handleChange("datetime", e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block mb-1">Repeat</label>
            <select
              value={form.repeat}
              onChange={(e) =>
                handleChange("repeat", e.target.value as typeof form.repeat)
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
            >
              <option value="None">None</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700"
            >
              Update Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSchedules;
