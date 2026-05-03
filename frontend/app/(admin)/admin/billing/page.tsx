"use client"

import { useEffect, useState, useCallback } from "react"
import {
  MessageSquare,
  Mail,
  Phone,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProviderStats {
  provider: string
  displayName: string
  channel: string
  totalRequests: number
  successCount: number
  failedCount: number
  disabledCount: number
  successRate: number
  totalCost: string
  currency: string
  avgDurationMs: number
}

interface DailyBillingStats {
  date: string
  provider: string
  count: number
  cost: string
}

interface BillingOverview {
  totalRequests: number
  totalSuccessful: number
  totalFailed: number
  totalCostTry: string
  totalCostUsd: string
  monthCostTry: string
  monthCostUsd: string
  providers: ProviderStats[]
  dailyStats: DailyBillingStats[]
}

interface IntegrationLog {
  id: number
  provider: string
  channel: string
  status: string
  costAmount: string
  costCurrency: string
  userId: number | null
  reminderId: number | null
  recipientMasked: string
  errorCode: string | null
  errorMessage: string | null
  durationMs: number | null
  providerMessageId: string | null
  createdAt: string
}

interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include" })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const json = await res.json()
  return (json.data ?? json) as T
}

// ─── Provider metadata ────────────────────────────────────────────────────────

const PROVIDER_META: Record<string, { color: string; bg: string; icon: React.ReactNode; flag?: string }> = {
  NETGSM:          { color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",   icon: <Phone className="h-5 w-5" />, flag: "🇹🇷" },
  TWILIO_SMS:      { color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20", icon: <Phone className="h-5 w-5" /> },
  TWILIO_WHATSAPP: { color: "text-green-400",   bg: "bg-green-500/10 border-green-500/20",  icon: <MessageSquare className="h-5 w-5" /> },
  SMTP:            { color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",  icon: <Mail className="h-5 w-5" /> },
}

const STATUS_COLORS: Record<string, string> = {
  SUCCESS:  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  FAILED:   "bg-red-500/20 text-red-400 border-red-500/30",
  DISABLED: "bg-zinc-600/40 text-zinc-400 border-zinc-600/30",
}

// ─── Chart helpers ────────────────────────────────────────────────────────────

function buildDailyChart(dailyStats: DailyBillingStats[]) {
  // Aggregate by date across providers
  const byDate = new Map<string, { count: number; cost: number }>()
  for (const s of dailyStats) {
    const prev = byDate.get(s.date) ?? { count: 0, cost: 0 }
    byDate.set(s.date, {
      count: prev.count + s.count,
      cost: prev.cost + parseFloat(s.cost || "0"),
    })
  }
  // Last 30 days, fill in zeros
  const result: { date: string; label: string; count: number; cost: number }[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    const val = byDate.get(key) ?? { count: 0, cost: 0 }
    result.push({ date: key, label, count: val.count, cost: val.cost })
  }
  return result
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [overview, setOverview] = useState<BillingOverview | null>(null)
  const [logs, setLogs] = useState<PagedResponse<IntegrationLog> | null>(null)
  const [loading, setLoading] = useState(true)
  const [logsLoading, setLogsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [filterProvider, setFilterProvider] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [tab, setTab] = useState<"overview" | "logs">("overview")

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiFetch<BillingOverview>("/api/admin/billing/overview")
      setOverview(data)
    } catch (e) {
      setError("Veriler yüklenemedi.")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLogs = useCallback(async (p = 0, provider = "", status = "") => {
    try {
      setLogsLoading(true)
      const params = new URLSearchParams({ page: String(p), size: "50" })
      if (provider) params.set("provider", provider)
      if (status) params.set("status", status)
      const data = await apiFetch<PagedResponse<IntegrationLog>>(`/api/admin/billing/logs?${params}`)
      setLogs(data)
    } catch (e) {
      setError("Loglar yüklenemedi.")
    } finally {
      setLogsLoading(false)
    }
  }, [])

  useEffect(() => { fetchOverview() }, [fetchOverview])
  useEffect(() => {
    if (tab === "logs") fetchLogs(page, filterProvider, filterStatus)
  }, [tab, page, filterProvider, filterStatus, fetchLogs])

  const chart = overview ? buildDailyChart(overview.dailyStats ?? []) : []
  const maxCount = Math.max(...chart.map(d => d.count), 1)

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Fatura & Entegrasyon Maliyeti</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Tüm API çağrıları, süreler ve maliyetler</p>
        </div>
        <button
          onClick={() => { fetchOverview(); if (tab === "logs") fetchLogs(page, filterProvider, filterStatus) }}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Yenile
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {overview && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard
            label="Toplam İstek"
            value={overview.totalRequests.toLocaleString()}
            sub={`${overview.totalSuccessful.toLocaleString()} başarılı`}
            icon={<TrendingUp className="h-4 w-4 text-blue-400" />}
            color="text-blue-400"
          />
          <SummaryCard
            label="Başarısız"
            value={overview.totalFailed.toLocaleString()}
            sub={overview.totalRequests > 0
              ? `${((overview.totalFailed / overview.totalRequests) * 100).toFixed(1)}% hata oranı`
              : "veri yok"}
            icon={<AlertCircle className="h-4 w-4 text-red-400" />}
            color="text-red-400"
          />
          <SummaryCard
            label="Bu Ay TRY"
            value={`₺${parseFloat(overview.monthCostTry).toFixed(4)}`}
            sub={`Toplam: ₺${parseFloat(overview.totalCostTry).toFixed(4)}`}
            icon={<DollarSign className="h-4 w-4 text-blue-400" />}
            color="text-blue-400"
          />
          <SummaryCard
            label="Bu Ay USD"
            value={`$${parseFloat(overview.monthCostUsd).toFixed(6)}`}
            sub={`Toplam: $${parseFloat(overview.totalCostUsd).toFixed(6)}`}
            icon={<DollarSign className="h-4 w-4 text-amber-400" />}
            color="text-amber-400"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-zinc-900 p-1 border border-zinc-800 w-fit">
        {(["overview", "logs"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t === "overview" ? "Genel Bakış" : "Detaylı Loglar"}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === "overview" && overview && (
        <div className="space-y-6">
          {/* Provider Cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overview.providers.map(p => {
              const meta = PROVIDER_META[p.provider] ?? { color: "text-zinc-400", bg: "bg-zinc-800 border-zinc-700", icon: <Phone className="h-5 w-5" /> }
              return (
                <div key={p.provider} className={`rounded-xl border p-4 space-y-3 ${meta.bg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={meta.color}>{meta.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-white leading-none">
                          {p.displayName} {meta.flag}
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">{p.channel}</div>
                      </div>
                    </div>
                    <div className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                      p.successRate >= 90 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                      p.successRate >= 60 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                      "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}>
                      {p.successRate.toFixed(1)}%
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-base font-bold text-white">{p.totalRequests.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-500">toplam</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-emerald-400">{p.successCount.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-500">başarılı</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-red-400">{p.failedCount.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-500">başarısız</div>
                    </div>
                  </div>

                  {/* Success rate bar */}
                  <div className="h-1.5 w-full rounded-full bg-zinc-800/60">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        p.successRate >= 90 ? "bg-emerald-500" :
                        p.successRate >= 60 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(p.successRate, 100)}%` }}
                    />
                  </div>

                  {/* Cost + avg duration */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <div>
                      <div className={`text-sm font-bold ${meta.color}`}>
                        {p.currency === "TRY" ? "₺" : "$"}{parseFloat(p.totalCost).toFixed(4)}
                      </div>
                      <div className="text-[10px] text-zinc-500">toplam maliyet ({p.currency})</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-zinc-300 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        {p.avgDurationMs > 0 ? `${Math.round(p.avgDurationMs)}ms` : "—"}
                      </div>
                      <div className="text-[10px] text-zinc-500">ort. süre</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 30-day chart */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Son 30 Gün — Günlük API İstekleri</h3>
            {chart.every(d => d.count === 0) ? (
              <div className="flex items-center justify-center h-32 text-sm text-zinc-600">
                Henüz veri yok. İlk bildirim gönderildiğinde burada görünecek.
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-end gap-1 h-32">
                  {chart.map((d, i) => (
                    <div key={d.date} className="group relative flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-blue-500/60 hover:bg-blue-500 transition-colors cursor-default"
                        style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? "3px" : "1px" }}
                      />
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                        <div className="rounded bg-zinc-700 px-2 py-1 text-[10px] whitespace-nowrap text-zinc-200 shadow-lg">
                          {d.date}: {d.count} istek
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* X-axis labels — show every 7th */}
                <div className="flex gap-1 mt-1">
                  {chart.map((d, i) => (
                    <div key={d.date} className="flex-1 text-center">
                      {i % 7 === 0 && (
                        <span className="text-[9px] text-zinc-600">{d.label}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Per-provider cost config notice */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
            <p className="text-xs text-zinc-500">
              Maliyet hesaplama: Netgsm SMS = <span className="text-zinc-300">₺0.08</span> / adet,
              Twilio SMS = <span className="text-zinc-300">$0.0079</span> / adet,
              Twilio WhatsApp = <span className="text-zinc-300">$0.005</span> / mesaj,
              SMTP = <span className="text-zinc-300">ücretsiz</span>.
              Özel fiyatlandırma için <span className="text-zinc-400">Sistem Ayarları</span>'ndan
              <code className="mx-1 rounded bg-zinc-800 px-1 text-[10px]">billing.*.cost_per_unit</code>
              anahtarlarını yapılandırın.
            </p>
          </div>
        </div>
      )}

      {/* LOGS TAB */}
      {tab === "logs" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={filterProvider}
              onChange={e => { setFilterProvider(e.target.value); setPage(0) }}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500"
            >
              <option value="">Tüm Sağlayıcılar</option>
              <option value="NETGSM">Netgsm SMS</option>
              <option value="TWILIO_SMS">Twilio SMS</option>
              <option value="TWILIO_WHATSAPP">Twilio WhatsApp</option>
              <option value="SMTP">SMTP E-posta</option>
            </select>
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(0) }}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500"
            >
              <option value="">Tüm Durumlar</option>
              <option value="SUCCESS">Başarılı</option>
              <option value="FAILED">Başarısız</option>
              <option value="DISABLED">Devre Dışı</option>
            </select>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            {logsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
              </div>
            ) : !logs || logs.content.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-sm text-zinc-600">
                Henüz log kaydı yok
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80">
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Sağlayıcı</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Kanal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Alıcı</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Maliyet</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Süre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Mesaj ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {logs.content.map(log => {
                    const meta = PROVIDER_META[log.provider] ?? { color: "text-zinc-400", bg: "", icon: null }
                    return (
                      <tr key={log.id} className="hover:bg-zinc-800/40 transition-colors group">
                        <td className="px-4 py-3">
                          <div className={`flex items-center gap-1.5 font-medium ${meta.color}`}>
                            {meta.icon}
                            <span className="text-xs">{log.provider}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400">{log.channel}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[log.status] ?? "bg-zinc-700 text-zinc-400 border-zinc-600"}`}>
                            {log.status === "SUCCESS" && <CheckCircle2 className="h-2.5 w-2.5" />}
                            {log.status === "FAILED" && <AlertCircle className="h-2.5 w-2.5" />}
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400 font-mono">{log.recipientMasked}</td>
                        <td className="px-4 py-3 text-right">
                          {log.costAmount && parseFloat(log.costAmount) > 0 ? (
                            <span className="text-xs font-mono text-zinc-300">
                              {log.costCurrency === "TRY" ? "₺" : "$"}
                              {parseFloat(log.costAmount).toFixed(6)}
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-zinc-500 font-mono">
                          {log.durationMs != null ? `${log.durationMs}ms` : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-zinc-500 max-w-[120px] truncate" title={log.providerMessageId ?? ""}>
                          {log.providerMessageId ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{log.createdAt}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {logs && logs.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {logs.totalElements.toLocaleString()} kayıt — Sayfa {logs.number + 1} / {logs.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Önceki
                </button>
                <button
                  disabled={page >= logs.totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Sonraki <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label, value, sub, icon, color,
}: {
  label: string; value: string; sub: string; icon: React.ReactNode; color: string
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">{label}</span>
        {icon}
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-zinc-600">{sub}</div>
    </div>
  )
}
