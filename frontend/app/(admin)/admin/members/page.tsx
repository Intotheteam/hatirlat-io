"use client"

import { useEffect, useState, useCallback } from "react"
import {
  adminMemberService,
  PagedMembers,
  AdminMemberRecord,
} from "@/services/admin/adminMemberService"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  UserCheck, ChevronLeft, ChevronRight, Search, X,
  Mail, Phone, Users, Clock, Activity, CheckCircle2, AlertCircle,
} from "lucide-react"
import { toast } from "sonner"

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string | null }) {
  if (status === "ACTIVE") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/50 px-2 py-0.5 text-xs text-emerald-300 border border-emerald-800">
      <CheckCircle2 className="h-3 w-3" /> Aktif
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/50 px-2 py-0.5 text-xs text-amber-300 border border-amber-800">
      <AlertCircle className="h-3 w-3" /> Beklemede
    </span>
  )
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string | null }) {
  if (role === "ADMIN") return (
    <span className="inline-flex rounded-full bg-red-900/50 px-2 py-0.5 text-xs text-red-300 border border-red-800">Admin</span>
  )
  return (
    <span className="inline-flex rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 border border-zinc-700">Üye</span>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ member, onClose }: { member: AdminMemberRecord; onClose: () => void }) {
  function fmtDate(s?: string | null) {
    if (!s) return "—"
    return new Date(s).toLocaleString("tr-TR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-900/60 text-indigo-300 font-bold text-lg">
              {member.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <div className="font-semibold text-white">{member.name}</div>
              <div className="text-xs text-zinc-500">ID: {member.id}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={member.status} />
            <RoleBadge role={member.role} />
            <button onClick={onClose} className="ml-2 p-1.5 rounded hover:bg-zinc-800 text-zinc-400">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                <Mail className="h-3 w-3" /> E-posta
              </p>
              <p className="text-sm text-zinc-200">{member.email || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                <Phone className="h-3 w-3" /> Telefon
              </p>
              <p className="text-sm text-zinc-200">{member.phone || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                <Clock className="h-3 w-3" /> Katılım Tarihi
              </p>
              <p className="text-sm text-zinc-200">{fmtDate(member.joinedAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                <Activity className="h-3 w-3" /> Son Aktivite
              </p>
              <p className="text-sm text-zinc-200">{fmtDate(member.lastActivity)}</p>
            </div>
          </div>

          {/* Groups */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide flex items-center gap-1">
              <Users className="h-3 w-3" /> Üye Olduğu Gruplar ({member.groups?.length || 0})
            </p>
            {member.groups && member.groups.length > 0 ? (
              <div className="space-y-2">
                {member.groups.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between rounded-lg bg-indigo-900/20 border border-indigo-800/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-indigo-200">{g.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                      {g.ownerUsername && (
                        <span className="flex items-center gap-1">
                          <span className="text-zinc-600">Oluşturan:</span>
                          <span className="text-zinc-300 font-medium">{g.ownerUsername}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{g.memberCount} üye</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 italic">Henüz bir gruba üye değil.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminMembersPage() {
  const [data, setData] = useState<PagedMembers | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<AdminMemberRecord | null>(null)

  const loadPage = useCallback(async (p: number) => {
    try {
      setLoading(true)
      const res = await adminMemberService.list(p, 20)
      setData(res)
      setPage(p)
    } catch (e: any) {
      toast.error("Üyeler yüklenemedi: " + e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPage(0) }, [loadPage])

  function fmtDate(s?: string | null) {
    if (!s) return "—"
    return new Date(s).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })
  }

  const filtered = (data?.content ?? []).filter((m) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.includes(q) ||
      m.groups?.some((g) => g.name.toLowerCase().includes(q))
    )
  })

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-indigo-400" />
          Grup Üyeleri
        </h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          {data
            ? `Toplam ${data.totalElements.toLocaleString()} üye — login olmayan, davete katılan kişiler`
            : "Yükleniyor..."}
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İsim, e-posta, telefon veya grup..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-9 pr-3 py-2 text-sm outline-none focus:border-zinc-500 placeholder:text-zinc-600"
          />
        </div>
        {query && (
          <button
            onClick={() => setQuery("")}
            className="px-3 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-400"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900">
              <tr className="text-left text-xs text-zinc-500 uppercase tracking-wide">
                <th className="px-4 py-3">Ad Soyad</th>
                <th className="px-4 py-3">İletişim</th>
                <th className="px-4 py-3">Gruplar</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Katılım</th>
                <th className="px-4 py-3">Son Aktivite</th>
                <th className="px-4 py-3 text-right">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500">
                    {query ? "Arama sonucu bulunamadı." : "Henüz hiçbir gruba üye eklenmemiş."}
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-zinc-900/50 transition-colors cursor-pointer"
                    onClick={() => setSelected(m)}
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-900/60 text-indigo-300 text-xs font-bold">
                          {m.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-medium text-white">{m.name || "—"}</div>
                          <div className="text-xs text-zinc-600">#{m.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-zinc-400 text-xs">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span>{m.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-400 text-xs mt-0.5">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span>{m.phone || "—"}</span>
                      </div>
                    </td>

                    {/* Groups */}
                    <td className="px-4 py-3">
                      {m.groups && m.groups.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {m.groups.slice(0, 2).map((g) => (
                            <span
                              key={g.id}
                              className="inline-flex items-center gap-1 rounded bg-indigo-900/40 border border-indigo-800/50 px-1.5 py-0.5 text-[10px] text-indigo-300"
                            >
                              {g.name}
                            </span>
                          ))}
                          {m.groups.length > 2 && (
                            <span className="text-[10px] text-zinc-500">+{m.groups.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                      {fmtDate(m.joinedAt)}
                    </td>

                    {/* Last Activity */}
                    <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                      {fmtDate(m.lastActivity)}
                    </td>

                    {/* Detail */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(m) }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        Detay
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && !query && (
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

      {/* Detail Modal */}
      {selected && (
        <DetailModal member={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
