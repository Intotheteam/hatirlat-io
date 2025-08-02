"use client";

import { useEffect, useState } from "react";
import ManageMembersModal from "../../../../components/groupsModal/ManageMembersModal";

interface Group {
  id: number;
  name: string;
  description: string;
  members: number;
  created_at: string;
  join_code: string;
}

interface GroupsProps {
  isDarkMode: boolean;
}

const Groups: React.FC<GroupsProps> = ({ isDarkMode }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/groups/");
        if (!res.ok) throw new Error("Gruplar alınamadı");
        const data = await res.json();
        setGroups(data);
      } catch (err) {
        console.error("Hata:", err);
      }
    };

    fetchGroups();
  }, []);

  const handleCopyLink = (code: string) => {
    const link = `http://localhost:3000/invite/${code}`;
    navigator.clipboard.writeText(link);
    alert("Link kopyalandı!");
  };

  const handleCreateGroup = async () => {
    const res = await fetch("http://localhost:8000/api/groups/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: groupName,
        description: groupDesc,
      }),
    });

    if (!res.ok) {
      alert("Grup oluşturulamadı.");
      return;
    }

    const data = await res.json();
    const newGroup = {
      ...data,
      members: 0,
    };
    setGroups([newGroup, ...groups]);
    setGroupName("");
    setGroupDesc("");
    setShowForm(false);
  };

  const handleDeleteGroup = async (id: number) => {
    if (!confirm("Bu grubu silmek istediğinizden emin misiniz?")) return;

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("Lütfen giriş yapınız.");
        return;
      }

      const res = await fetch(`http://localhost:8000/api/groups/${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let errorMessage = "Silme işlemi başarısız.";
        try {
          const errorData = await res.json();
          if (errorData && typeof errorData === "object") {
            if ("detail" in errorData && typeof errorData.detail === "string") {
              errorMessage = errorData.detail;
            } else if (
              "message" in errorData &&
              typeof errorData.message === "string"
            ) {
              errorMessage = errorData.message;
            }
          }
        } catch {}
        throw new Error(errorMessage);
      }

      setGroups((prev) => prev.filter((group) => group.id !== id));
      alert("Grup başarıyla silindi.");
    } catch (error) {
      let message = "Grup silinirken hata oluştu.";
      if (error) {
        if (typeof error === "string") {
          message = error;
        } else if (typeof error === "object") {
          if ("message" in error && typeof error.message === "string") {
            message = error.message;
          } else if ("detail" in error && typeof error.detail === "string") {
            message = error.detail;
          }
        }
      }
      alert(message);

      console.error(error);
    }
  };

  return (
    <div
      className={
        isDarkMode
          ? "min-h-screen bg-gray-900 text-white"
          : "min-h-screen bg-gray-50 text-gray-900"
      }
    >
      <main className="px-4 sm:px-6 lg:px-16 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Group Management</h1>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                Create and manage notification groups
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-all"
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
              <span>New Group</span>
            </button>
          </div>

          {showForm && (
            <div
              className={`mb-6 p-6 rounded-lg shadow-sm ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white"
              }`}
            >
              <h2 className="text-xl font-semibold mb-2">Create New Group</h2>
              <p
                className={
                  isDarkMode ? "text-gray-300 mb-4" : "text-gray-600 mb-4"
                }
              >
                Set up a new notification group for your contacts
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g., Family, Work Team"
                    className={`w-full rounded-md px-4 py-2 text-sm outline-none ${
                      isDarkMode
                        ? "bg-gray-700 text-white border border-gray-600"
                        : "bg-white border border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={groupDesc}
                    onChange={(e) => setGroupDesc(e.target.value)}
                    placeholder="Brief description of the group"
                    rows={3}
                    className={`w-full rounded-md px-4 py-2 text-sm outline-none ${
                      isDarkMode
                        ? "bg-gray-700 text-white border border-gray-600"
                        : "bg-white border border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateGroup}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Create Group
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className={`px-4 py-2 rounded-md ${
                      isDarkMode
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className={`rounded-lg shadow-sm p-6 ${
                  isDarkMode ? "bg-gray-800 text-white" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-xl font-semibold">{group.name}</h3>
                      <p
                        className={
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Created {group.created_at.slice(0, 10)}
                    </span>

                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      title="Delete group"
                      aria-label="Delete group"
                      className={`mt-1 px-3 py-1 rounded-md text-red-600 hover:bg-red-100 border border-red-600 ${
                        isDarkMode ? "bg-gray-900" : "bg-white"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="text-sm mb-4">{group.members} members</div>

                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span>Invite Link</span>
                  </div>
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <input
                      type="text"
                      readOnly
                      value={`http://localhost:3000/invite/${group.join_code}`}
                      className={`flex-1 px-4 py-2 text-sm outline-none ${
                        isDarkMode
                          ? "bg-gray-700 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                    <button
                      onClick={() => handleCopyLink(group.join_code)}
                      className={`p-[10px] transition-all ${
                        isDarkMode
                          ? "bg-black hover:bg-gray-800 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      }`}
                      title="Copy invite link"
                      aria-label="Copy invite link"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 16h8M8 12h8m-8-4h8M12 20h9M3 8v10a2 2 0 002 2h10"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setActiveGroupId(group.id)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Manage Members
                  </button>

                  <button
                    onClick={() => handleCopyLink(group.join_code)}
                    title="Copy invite link"
                    aria-label="Copy invite link"
                    className={`px-3 py-2 border rounded-md text-sm font-medium flex items-center ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16h8M8 12h8m-8-4h8M12 20h9M3 8v10a2 2 0 002 2h10"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {activeGroupId !== null && (
        <ManageMembersModal
          isOpen={true}
          onClose={() => setActiveGroupId(null)}
          inviteLink={`http://localhost:3000/invite/${
            groups.find((group) => group.id === activeGroupId)?.join_code || ""
          }`}
          groupJoinCode={
            groups.find((group) => group.id === activeGroupId)?.join_code || ""
          }
        />
      )}
    </div>
  );
};

export default Groups;
