"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

interface SchedulesReminderProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReminder: (reminder: any) => void;
  reminderToEdit?: any;
}

interface Group {
  id: number;
  name: string;
  join_code: string;
}

const SchedulesReminder: React.FC<SchedulesReminderProps> = ({
  isOpen,
  onClose,
  onAddReminder,
}) => {
  const [title, setTitle] = useState("");
  const [reminderType, setReminderType] = useState<"Personal" | "Group">(
    "Personal"
  );
  const [channels, setChannels] = useState({
    email: false,
    sms: false,
    whatsapp: false,
  });
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [message, setMessage] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [repeat, setRepeat] = useState<"None" | "Daily" | "Weekly" | "Monthly">(
    "None"
  );
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const [groupTab, setGroupTab] = useState<"select" | "create">("select");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupJoinCode, setNewGroupJoinCode] = useState("");

  useEffect(() => {
    if (reminderType === "Group") {
      axios
        .get("http://localhost:8000/api/groups/")
        .then((res) => {
          setGroups(res.data);
        })
        .catch((err) => console.error("Grup verileri alınamadı:", err));
    }
  }, [reminderType]);

  if (!isOpen) return null;

  const toggleChannel = (channel: keyof typeof channels) => {
    setChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  const resetForm = () => {
    setTitle("");
    setReminderType("Personal");
    setChannels({ email: false, sms: false, whatsapp: false });
    setContactName("");
    setContactPhone("");
    setContactEmail("");
    setMessage("");
    setDateTime("");
    setRepeat("None");
    setSelectedGroupId(null);
    setGroupTab("select");
    setNewGroupName("");
    setNewGroupJoinCode("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("selectedGroupId:", selectedGroupId, "groups:", groups);

    e.preventDefault();

    const data: any = {
      title,
      reminder_type: reminderType,
      channels: Object.keys(channels).filter(
        (key) => channels[key as keyof typeof channels]
      ),
      message,
      datetime: dateTime,
      repeat,
    };

    if (reminderType === "Personal") {
      data.contact_name = contactName;
      if (channels.sms || channels.whatsapp) data.contact_phone = contactPhone;
      if (channels.email) data.contact_email = contactEmail;
    } else if (reminderType === "Group") {
      if (groupTab === "select") {
        if (!selectedGroupId) {
          alert("Lütfen bir grup seçiniz.");
          return;
        }
        const selectedGroup = groups.find((g) => g.id === selectedGroupId);
        if (!selectedGroup) {
          alert("Seçilen grup bulunamadı.");
          return;
        }
        data.group_id = selectedGroupId;
      } else if (groupTab === "create") {
        if (!newGroupName || !newGroupJoinCode) {
          alert("Lütfen grup adı ve join kodunu doldurunuz.");
          return;
        }
        data.new_group = {
          name: newGroupName,
          join_code: newGroupJoinCode,
        };

        data.group = selectedGroupId;
      }
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/reminders/",
        data
      );
      alert("Hatırlatma başarıyla kaydedildi!");
      onAddReminder({
        ...response.data,
        recipient:
          reminderType === "Personal"
            ? contactName
            : groupTab === "select"
            ? groups.find((g) => g.id === selectedGroupId)?.name
            : newGroupName,
        group_name:
          reminderType === "Group"
            ? groupTab === "select"
              ? groups.find((g) => g.id === selectedGroupId)?.name
              : newGroupName
            : null,
        date: new Date(dateTime),
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error("Reminder kaydedilirken hata:", error);
      alert("Hatırlatma kaydedilemedi. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full max-h-[80vh] overflow-y-auto bg-gray-900 text-white p-6 rounded-md shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold mb-6">Create New Reminder</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Reminder Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Reminder Type</label>
            <div className="flex gap-4">
              {(["Personal", "Group"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setReminderType(type)}
                  className={`px-4 py-2 rounded-md border font-medium select-none ${
                    reminderType === type
                      ? "border-green-500 bg-green-700"
                      : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1">Notification Channel(s)</label>
            <div className="flex gap-4">
              {(["email", "sms", "whatsapp"] as (keyof typeof channels)[]).map(
                (channel) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleChannel(channel)}
                    className={`px-3 py-1 rounded-md border font-medium select-none capitalize ${
                      channels[channel]
                        ? "border-green-500 bg-green-700"
                        : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                    }`}
                  >
                    {channel}
                  </button>
                )
              )}
            </div>
          </div>

          {reminderType === "Personal" ? (
            <div>
              <label className="block mb-1">Contact Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Contact Name"
                className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500"
              />
            </div>
          ) : (
            <div>
              <div className="mb-2 flex gap-4 border-b border-gray-700">
                <button
                  type="button"
                  onClick={() => setGroupTab("select")}
                  className={`pb-2 px-4 border-b-2 font-medium select-none ${
                    groupTab === "select"
                      ? "border-green-500 text-green-400"
                      : "border-transparent text-gray-400 hover:text-green-400"
                  }`}
                >
                  Select Existing Group
                </button>
                <button
                  type="button"
                  onClick={() => setGroupTab("create")}
                  className={`pb-2 px-4 border-b-2 font-medium select-none ${
                    groupTab === "create"
                      ? "border-green-500 text-green-400"
                      : "border-transparent text-gray-400 hover:text-green-400"
                  }`}
                >
                  Create New Group
                </button>
              </div>

              {groupTab === "select" ? (
                <div>
                  <label className="block mb-1">Select a group</label>
                  <select
                    value={selectedGroupId || ""}
                    onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1">Group Name</label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Enter new group name"
                      className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Join Code</label>
                    <input
                      type="text"
                      value={newGroupJoinCode}
                      onChange={(e) => setNewGroupJoinCode(e.target.value)}
                      placeholder="Enter join code"
                      className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {reminderType === "Personal" &&
            (channels.sms || channels.whatsapp) && (
              <div>
                <label className="block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="05xx xxx xx xx"
                  className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500"
                />
              </div>
            )}

          {reminderType === "Personal" && channels.email && (
            <div>
              <label className="block mb-1">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message here"
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block mb-1">Date and Time</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500"
              required
            />
            <small className="text-gray-400">gg.aa.yyyy --:--</small>
          </div>

          <div>
            <label className="block mb-1">Repeat</label>
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value as any)}
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500"
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
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700"
            >
              Save Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchedulesReminder;
