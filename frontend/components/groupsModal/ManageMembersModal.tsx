"use client";

import { useState, useEffect } from "react";
import { X, Copy, RefreshCcw } from "lucide-react";

interface Member {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Member";
  status: "Active" | "Pending";
}

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteLink: string;
  groupJoinCode: string;
}

const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
  isOpen,
  onClose,
  inviteLink,
  groupJoinCode,
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8000/api/groups/${groupJoinCode}/members/`
        );
        if (!res.ok) throw new Error("Üyeler getirilemedi");
        const data = await res.json();
        setMembers(data);
      } catch (error) {
        console.error(error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [isOpen, groupJoinCode]);

  const handleInvite = async () => {
    if (!inviteEmail) {
      alert("Lütfen bir e-posta adresi girin.");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:8000/api/groups/${groupJoinCode}/invite/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: inviteEmail }),
        }
      );
      if (!res.ok) throw new Error("Davet gönderilemedi");
      alert("Davet e-postası gönderildi");
      setInviteEmail("");
    } catch (error) {
      alert("Davet gönderilirken hata oluştu");
      console.error(error);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Davet bağlantısı kopyalandı!");
  };

  const handleDeleteMember = async (memberId: number) => {
    if (!confirm("Bu üyeyi silmek istediğinize emin misiniz?")) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken") || "";

      const res = await fetch(
        `http://localhost:8000/api/groups/${groupJoinCode}/members/${memberId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        console.error("Silme isteği başarısız:", res.status, res.statusText);
        throw new Error("Üye silinemedi");
      }

      const refreshRes = await fetch(
        `http://localhost:8000/api/groups/${groupJoinCode}/members/`
      );
      if (!refreshRes.ok) throw new Error("Üyeler yenilenemedi");
      const data = await refreshRes.json();
      setMembers(data);

      alert("Üye başarıyla silindi");
    } catch (error) {
      alert("Üye silinirken hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateMember = async (memberId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken") || "";

      const res = await fetch(
        `http://localhost:8000/api/groups/${groupJoinCode}/members/${memberId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Üye durumu güncellenemedi");

      const refreshRes = await fetch(
        `http://localhost:8000/api/groups/${groupJoinCode}/members/`
      );
      if (!refreshRes.ok) throw new Error("Üyeler yenilenemedi");
      const data = await refreshRes.json();
      setMembers(data);
      alert("Üye durumu Active olarak güncellendi.");
    } catch (error) {
      alert("Üye durumu güncellenirken hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 text-white w-full max-w-2xl rounded-lg p-6 border border-gray-700 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-400"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-6">
          Grup üyelerini yönetin ve yenilerini davet edin.
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">
              E-posta ile davet gönderin:
            </label>
            <div className="flex">
              <input
                type="email"
                placeholder="ornek@eposta.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 px-3 py-2 rounded-l-md bg-gray-800 border border-gray-600 text-white"
              />
              <button
                onClick={handleInvite}
                className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-r-md"
              >
                🤵
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">
              Veya davet bağlantısını paylaşın:
            </label>
            <div className="flex">
              <input
                readOnly
                value={inviteLink}
                className="flex-1 px-3 py-2 rounded-l-md bg-gray-800 border border-gray-600 text-white"
              />
              <button
                onClick={handleCopy}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-r-md"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">
              Grup Üyeleri ({members.length})
            </h3>
            <button
              onClick={() => {
                setLoading(true);
                fetch(
                  `http://localhost:8000/api/groups/${groupJoinCode}/members/`
                )
                  .then((res) => res.json())
                  .then((data) => setMembers(data))
                  .catch(() => setMembers([]))
                  .finally(() => setLoading(false));
              }}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCcw size={16} />
            </button>
          </div>

          {loading ? (
            <p>Yükleniyor...</p>
          ) : (
            <div className="border border-gray-700 rounded-md overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-left sticky top-0">
                  <tr>
                    <th className="py-2 px-4">Üyeler</th>
                    <th className="py-2 px-4">Rol</th>
                    <th className="py-2 px-4">Durum</th>
                    <th className="py-2 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-4 text-gray-400"
                      >
                        Üye bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => (
                      <tr
                        key={member.id}
                        className="border-t border-gray-700 hover:bg-gray-800 transition"
                      >
                        <td className="py-2 px-4 flex items-center gap-2">
                          {member.status === "Pending" && (
                            <button
                              onClick={() => handleActivateMember(member.id)}
                              title="Üyeyi aktif yap"
                              className="text-green-400 hover:text-green-600"
                            >
                              ✔️
                            </button>
                          )}
                          <div>
                            <p className="font-medium text-white">
                              {member.name}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {member.email}
                            </p>
                          </div>
                        </td>

                        <td className="py-2 px-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              member.role === "Admin"
                                ? "bg-cyan-600 text-white"
                                : "bg-green-700 text-white"
                            }`}
                          >
                            {member.role}
                          </span>
                        </td>

                        <td className="py-2 px-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              member.status === "Active"
                                ? "bg-green-600 text-white"
                                : "bg-yellow-600 text-white"
                            }`}
                          >
                            {member.status === "Active" ? "Active" : "Pending"}
                          </span>
                        </td>

                        <td className="py-2 px-4 text-right">
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Üyeyi sil"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageMembersModal;
