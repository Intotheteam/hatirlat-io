"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import {
  Coins, Loader2, CheckCircle2, XCircle, Clock, AlertCircle, Filter, ChevronLeft, ChevronRight,
} from "lucide-react"
import {
  adminTopupService, TopUpRequestRecord, TopUpStatus, PagedTopUp,
} from "@/services/topup/topupService"

const STATUS_FILTERS: Array<{ value: "" | TopUpStatus; label: string }> = [
  { value: "",         label: "Tümü" },
  { value: "PENDING",  label: "Bekleyen" },
  { value: "PAID",     label: "Ödendi" },
  { value: "APPROVED", label: "Onaylanan" },
  { value: "REJECTED", label: "Reddedilen" },
]

const STATUS_PILL: Record<TopUpStatus, string> = {
  PENDING:  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300",
  PAID:     "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300",
  REJECTED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300",
  FAILED:   "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300",
}

export default function AdminTopUpPage() {
  const [page, setPage] = useState<PagedTopUp | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<number | null>(null)
  const [pageNo, setPageNo] = useState(0)
  const [size] = useState(20)
  const [statusFilter, setStatusFilter] = useState<"" | TopUpStatus>("")
  const [pendingCount, setPendingCount] = useState<number>(0)

  // Modal state
  const [selected, setSelected] = useState<TopUpRequestRecord | null>(null)
  const [reviewMode, setReviewMode] = useState<"approve" | "reject" | null>(null)
  const [adminNote, setAdminNote] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [gatewayResponse, setGatewayResponse] = useState("")

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [data, count] = await Promise.all([
        adminTopupService.list(pageNo, size, statusFilter || undefined),
        adminTopupService.pendingCount().catch(() => ({ count: 0 })),
      ])
      setPage(data)
      setPendingCount(count?.count ?? 0)
    } catch (e: any) {
      toast.error(e.message || "Yüklenemedi")
    } finally {
      setLoading(false)
    }
  }, [pageNo, size, statusFilter])

  useEffect(() => { load() }, [load])

  function openReview(req: TopUpRequestRecord, mode: "approve" | "reject") {
    setSelected(req); setReviewMode(mode)
    setAdminNote(req.adminNote ?? "")
    setRejectionReason("")
    setGatewayResponse(req.gatewayResponse ?? "")
  }

  function closeReview() {
    setSelected(null); setReviewMode(null)
    setAdminNote(""); setRejectionReason(""); setGatewayResponse("")
  }

  async function submitReview() {
    if (!selected || !reviewMode) return
    try {
      setActing(selected.id)
      if (reviewMode === "approve") {
        await adminTopupService.approve(selected.id, {
          adminNote: adminNote || undefined,
          gatewayResponse: gatewayResponse || undefined,
        })
        toast.success(`${selected.amount} kredi yüklendi (${selected.username})`)
      } else {
        if (!rejectionReason.trim()) {
          toast.error("Reddetme sebebi zorunlu")
          setActing(null)
          return
        }
        await adminTopupService.reject(selected.id, {
          rejectionReason,
          adminNote: adminNote || undefined,
          gatewayResponse: gatewayResponse || undefined,
        })
        toast.success("Talep reddedildi")
      }
      closeReview()
      await load()
    } catch (e: any) {
      toast.error(e.message || "İşlem başarısız")
    } finally {
      setActing(null)
    }
  }

  function fmtDate(s?: string | null) {
    if (!s) return "—"
    return new Date(s).toLocaleString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Coins className="h-6 w-6 text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold">Kredi Yükleme Talepleri</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Kullanıcı taleplerini onaylayın veya reddedin.
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {pendingCount} bekleyen talep
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as any); setPageNo(0) }}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100"
          >
            {STATUS_FILTERS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : !page || page.content.length === 0 ? (
        <div className="text-center py-24 text-zinc-500 text-sm">Talep bulunamadı.</div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3 text-left">Kullanıcı</th>
                <th className="px-4 py-3 text-left">Miktar</th>
                <th className="px-4 py-3 text-left">Ödeme</th>
                <th className="px-4 py-3 text-left">Durum</th>
                <th className="px-4 py-3 text-left">Tarih</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {page.content.map(r => (
                <tr key={r.id} className="hover:bg-zinc-800/40">
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium">{r.username}</div>
                    <div className="text-xs text-zinc-500">{r.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-bold">{r.amount} kredi</div>
                    {r.amountTry && <div className="text-xs text-zinc-500">₺{r.amountTry}</div>}
                  </td>
                  <td className="px-4 py-3 align-top text-xs">
                    <div>{r.paymentMethod ?? "—"}</div>
                    {r.paymentReference && <div className="text-zinc-500 truncate max-w-[180px]">Ref: {r.paymentReference}</div>}
                    <div className={`inline-flex items-center gap-1 mt-1 ${r.paymentDone ? "text-emerald-400" : "text-zinc-500"}`}>
                      {r.paymentDone ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {r.paymentDone ? "Ödendi" : "Bekliyor"}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_PILL[r.status]}`}>
                      {r.status}
                    </span>
                    {r.rejectionReason && (
                      <div className="text-[11px] text-red-400 mt-1 max-w-[200px]">Red: {r.rejectionReason}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-zinc-400">
                    <div>İstek: {fmtDate(r.requestedAt)}</div>
                    {r.approvedAt && <div className="mt-1">İncelendi: {fmtDate(r.approvedAt)}</div>}
                    {r.reviewedBy && <div className="text-zinc-500">{r.reviewedBy}</div>}
                  </td>
                  <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                    {r.status === "PENDING" || r.status === "PAID" ? (
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openReview(r, "approve")}
                          disabled={acting === r.id}
                          className="text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 transition disabled:opacity-50"
                        >
                          Onayla
                        </button>
                        <button
                          onClick={() => openReview(r, "reject")}
                          disabled={acting === r.id}
                          className="text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 transition disabled:opacity-50"
                        >
                          Reddet
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600">{r.status === "APPROVED" ? "✓ Onaylandı" : "—"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 text-xs text-zinc-400">
            <span>Toplam {page.totalElements} kayıt</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPageNo(p => Math.max(0, p - 1))}
                disabled={page.number <= 0}
                className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>Sayfa {page.number + 1} / {Math.max(page.totalPages, 1)}</span>
              <button
                onClick={() => setPageNo(p => p + 1)}
                disabled={page.number >= page.totalPages - 1}
                className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selected && reviewMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <div className="flex items-center gap-2">
              {reviewMode === "approve"
                ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                : <XCircle className="h-5 w-5 text-red-400" />}
              <h3 className="font-semibold">
                {reviewMode === "approve" ? "Talebi Onayla" : "Talebi Reddet"}
              </h3>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm space-y-1">
              <div><span className="text-zinc-500">Kullanıcı:</span> <b>{selected.username}</b> ({selected.userEmail})</div>
              <div><span className="text-zinc-500">Miktar:</span> <b>{selected.amount} kredi</b> {selected.amountTry && <>(₺{selected.amountTry})</>}</div>
              <div><span className="text-zinc-500">Ödeme:</span> {selected.paymentMethod ?? "—"} {selected.paymentReference && <>• {selected.paymentReference}</>}</div>
            </div>

            {reviewMode === "reject" && (
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1 block">Reddetme Sebebi *</label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  placeholder="Örn: Ödeme dekontu doğrulanamadı"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1 block">Admin Notu (opsiyonel)</label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                placeholder="İç not / kullanıcıya açıklama"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1 block">Gateway Yanıtı / Dekont (opsiyonel JSON)</label>
              <textarea
                value={gatewayResponse}
                onChange={e => setGatewayResponse(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-mono"
                placeholder={'{"transactionId":"...","status":"OK"}'}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={closeReview}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 transition"
              >
                İptal
              </button>
              <button
                onClick={submitReview}
                disabled={acting !== null}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${
                  reviewMode === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {acting !== null && <Loader2 className="inline h-4 w-4 animate-spin mr-1" />}
                {reviewMode === "approve" ? "Onayla & Krediyi Yükle" : "Reddet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
