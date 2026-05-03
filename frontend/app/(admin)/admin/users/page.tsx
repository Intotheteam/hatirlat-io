"use client"

import { useEffect, useState, useCallback } from "react"
import { adminUsers, type AdminUser, type PagedResponse } from "@/services/admin/adminService"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Search, Ban, CheckCircle, Trash2, ChevronLeft, ChevronRight,
  Shield, ShieldOff, User, Crown, AlertTriangle, X,
} from "lucide-react"
import { toast } from "sonner"

// ─── Ban Modal ────────────────────────────────────────────────────────────────

function BanModal({
  user,
  onClose,
  onConfirm,
}: {
  user: AdminUser
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState("")
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold">Kullanıcıyı Banla</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-4">
          <strong className="text-white">{user.username}</strong> ({user.email}) kullanıcısı banlanacak.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ban sebebi (isteğe bağlı)"
          rows={3}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-red-500 resize-none"
        />
        <div className="mt-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-zinc-700 hover:bg-zinc-800">İptal</button>
          <button
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 font-medium"
          >
            Banla
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ user, onClose, onConfirm }: { user: AdminUser; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold">Kullanıcıyı Sil</h2>
        </div>
        <p className="text-sm text-zinc-400">
          <strong className="text-white">{user.username}</strong> kalıcı olarak silinecek. Bu işlem geri alınamaz.
        </p>
        <div className="mt-5 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-zinc-700 hover:bg-zinc-800">İptal</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 font-medium">Sil</button>
        </div>
      </div>
    </div>
  )
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  if (role === "ADMIN") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-900/50 px-2 py-0.5 text-xs text-red-300 border border-red-800">
      <Shield className="h-3 w-3" /> Admin
    </span>
  )
  if (role === "PREMIUM_USER") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-900/50 px-2 py-0.5 text-xs text-yellow-300 border border-yellow-800">
      <Crown className="h-3 w-3" /> Premium
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 border border-zinc-700">
      <User className="h-3 w-3" /> Üye
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [data, setData] = useState<PagedResponse<AdminUser> | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<AdminUser[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  const loadPage = useCallback(async (p: number) => {
    try {
      setLoading(true)
      const res = await adminUsers.list(p)
      setData(res)
      setPage(p)
    } catch (e: any) {
      toast.error("Kullanıcılar yüklenemedi: " + e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPage(0) }, [loadPage])

  const handleSearch = async () => {
    if (!query.trim()) { setSearchResults(null); return }
    try {
      setSearching(true)
      const res = await adminUsers.search(query.trim())
      setSearchResults(res)
    } catch (e: any) {
      toast.error("Arama hatası: " + e.message)
    } finally {
      setSearching(false)
    }
  }

  const handleBan = async (reason: string) => {
    if (!banTarget) return
    try {
      await adminUsers.ban(banTarget.id, reason)
      toast.success(`${banTarget.username} banlandı`)
      setBanTarget(null)
      searchResults ? handleSearch() : loadPage(page)
    } catch (e: any) {
      toast.error("Ban işlemi başarısız: " + e.message)
    }
  }

  const handleUnban = async (user: AdminUser) => {
    try {
      await adminUsers.unban(user.id)
      toast.success(`${user.username} banı kaldırıldı`)
      searchResults ? handleSearch() : loadPage(page)
    } catch (e: any) {
      toast.error("Unban işlemi başarısız: " + e.message)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await adminUsers.delete(deleteTarget.id)
      toast.success(`${deleteTarget.username} silindi`)
      setDeleteTarget(null)
      setSearchResults(null)
      loadPage(page)
    } catch (e: any) {
      toast.error("Silme işlemi başarısız: " + e.message)
    }
  }

  const displayedUsers = searchResults ?? data?.content ?? []

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
        <p className="text-sm text-zinc-400">
          {data ? `Toplam ${data.totalElements.toLocaleString()} kullanıcı` : ""}
        </p>
      </div>

      {/* Arama */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (!e.target.value.trim()) setSearchResults(null)
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Kullanıcı adı veya e-posta..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-9 pr-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching}
          className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm font-medium disabled:opacity-50"
        >
          {searching ? "Aranıyor..." : "Ara"}
        </button>
        {searchResults && (
          <button
            onClick={() => { setSearchResults(null); setQuery("") }}
            className="px-3 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tablo */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900">
              <tr className="text-left text-xs text-zinc-500">
                <th className="px-4 py-3">Kullanıcı</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3 text-center">Hatırlatıcı</th>
                <th className="px-4 py-3 text-center">Bildirim</th>
                <th className="px-4 py-3">Kayıt</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {displayedUsers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-zinc-500">Kullanıcı bulunamadı</td></tr>
              ) : displayedUsers.map((u) => (
                <tr key={u.id} className={`hover:bg-zinc-900/50 transition-colors ${u.banned ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{u.username}</div>
                    <div className="text-xs text-zinc-500">{u.email}</div>
                    {u.banned && (
                      <div className="text-xs text-red-400 mt-0.5 flex items-center gap-1">
                        <Ban className="h-3 w-3" /> {u.banReason || "Banlandı"}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-zinc-300">{u.totalReminders}</span>
                    <span className="text-zinc-600 text-xs"> / {u.activeReminders} aktif</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-zinc-300">{u.totalNotifications}</span>
                    {u.failedNotifications > 0 && (
                      <span className="text-red-400 text-xs"> ({u.failedNotifications} hata)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {u.banned ? (
                        <button
                          onClick={() => handleUnban(u)}
                          title="Banı Kaldır"
                          className="p-1.5 rounded hover:bg-green-900/40 text-green-400"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setBanTarget(u)}
                          title="Banla"
                          className="p-1.5 rounded hover:bg-red-900/40 text-red-400"
                        >
                          <ShieldOff className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(u)}
                        title="Sil"
                        className="p-1.5 rounded hover:bg-red-900/40 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination (sadece arama yokken) */}
      {!searchResults && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>Sayfa {page + 1} / {data.totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => loadPage(page - 1)}
              disabled={page === 0}
              className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => loadPage(page + 1)}
              disabled={page >= data.totalPages - 1}
              className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modaller */}
      {banTarget && (
        <BanModal user={banTarget} onClose={() => setBanTarget(null)} onConfirm={handleBan} />
      )}
      {deleteTarget && (
        <DeleteModal user={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      )}
    </div>
  )
}
