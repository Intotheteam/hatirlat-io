"use client"

import { useEffect, useState } from "react"
import { adminAuditLogs, type AuditLog, type PagedResponse } from "@/services/admin/adminService"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ChevronLeft, ChevronRight, Filter, RefreshCw } from "lucide-react"
import { toast } from "sonner"

const ACTION_COLORS: Record<string, string> = {
  BAN:           "bg-red-900/40 text-red-300 border-red-800",
  UNBAN:         "bg-green-900/40 text-green-300 border-green-800",
  DELETE:        "bg-red-900/60 text-red-200 border-red-700",
  CONFIG_CHANGE: "bg-blue-900/40 text-blue-300 border-blue-800",
  FEATURE_FLAG:  "bg-purple-900/40 text-purple-300 border-purple-800",
  LOGIN:         "bg-zinc-800 text-zinc-300 border-zinc-700",
}

function ActionBadge({ action }: { action: string }) {
  const cls = ACTION_COLORS[action] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {action}
    </span>
  )
}

function JsonDetails({ raw }: { raw: string }) {
  try {
    const obj = JSON.parse(raw)
    return (
      <pre className="max-w-xs text-xs text-zinc-400 whitespace-pre-wrap break-all">
        {JSON.stringify(obj, null, 2)}
      </pre>
    )
  } catch {
    return <span className="text-xs text-zinc-400">{raw}</span>
  }
}

export default function AdminAuditLogsPage() {
  const [data, setData] = useState<PagedResponse<AuditLog> | null>(null)
  const [recent, setRecent] = useState<AuditLog[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState("")
  const [actionStats, setActionStats] = useState<Record<string, number>>({})
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = async (p: number, action?: string) => {
    try {
      setLoading(true)
      if (action) {
        const res = await adminAuditLogs.byAction(action, p)
        setData(res)
      } else {
        const [res, stats] = await Promise.all([
          adminAuditLogs.list(p),
          adminAuditLogs.actionStats(),
        ])
        setData(res)
        setActionStats(stats ?? {})
      }
      setPage(p)
    } catch (e: any) {
      toast.error("Loglar yüklenemedi: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(0) }, [])

  const handleFilterChange = (action: string) => {
    setActionFilter(action)
    load(0, action || undefined)
  }

  const handleRefresh = () => load(page, actionFilter || undefined)

  const rows = data?.content ?? []

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-sm text-zinc-400">
            {data ? `Toplam ${data.totalElements.toLocaleString()} kayıt` : ""}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
        >
          <RefreshCw className="h-4 w-4" />
          Yenile
        </button>
      </div>

      {/* Aksiyon İstatistikleri + Filtre */}
      {Object.keys(actionStats).length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange("")}
            className={`rounded-full px-3 py-1 text-xs border transition-colors ${
              !actionFilter
                ? "border-zinc-500 bg-zinc-700 text-white"
                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            Tümü
          </button>
          {Object.entries(actionStats).map(([action, count]) => (
            <button
              key={action}
              onClick={() => handleFilterChange(action === actionFilter ? "" : action)}
              className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                actionFilter === action
                  ? "border-zinc-500 bg-zinc-700 text-white"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {action} <span className="ml-1 opacity-60">({count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Tablo */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900">
              <tr className="text-left text-xs text-zinc-500">
                <th className="px-4 py-3">Zaman</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Aksiyon</th>
                <th className="px-4 py-3">Hedef</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {rows.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-zinc-500">Log bulunamadı</td></tr>
              ) : rows.map((log) => (
                <>
                  <tr
                    key={log.id}
                    className="hover:bg-zinc-900/50 cursor-pointer"
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  >
                    <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-200">{log.adminUsername}</td>
                    <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {log.targetEntity}{log.targetId ? ` #${log.targetId}` : ""}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 font-mono">{log.ipAddress}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {log.details ? "▼ detay" : "-"}
                    </td>
                  </tr>
                  {expanded === log.id && log.details && (
                    <tr key={`${log.id}-detail`} className="bg-zinc-900">
                      <td colSpan={6} className="px-6 py-3 border-t border-zinc-800">
                        <JsonDetails raw={log.details} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>Sayfa {page + 1} / {data.totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => load(page - 1, actionFilter || undefined)}
              disabled={page === 0}
              className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => load(page + 1, actionFilter || undefined)}
              disabled={page >= data.totalPages - 1}
              className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
