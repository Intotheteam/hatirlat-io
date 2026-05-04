"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Coins, Loader2, Send, CheckCircle2, Clock, XCircle, AlertCircle, ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { topupService, TopUpRequestRecord, TopUpStatus } from "@/services/topup/topupService"

const PACKAGES = [
  { credits: 100, priceTry: 50 },
  { credits: 500, priceTry: 200 },
  { credits: 1000, priceTry: 350 },
  { credits: 5000, priceTry: 1500 },
]

const STATUS_META: Record<TopUpStatus, { label: string; color: string; Icon: any }> = {
  PENDING:  { label: "Beklemede",       color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50", Icon: Clock },
  PAID:     { label: "Ödeme Yapıldı",   color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/50", Icon: AlertCircle },
  APPROVED: { label: "Onaylandı",       color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50", Icon: CheckCircle2 },
  REJECTED: { label: "Reddedildi",      color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800/50", Icon: XCircle },
  FAILED:   { label: "Başarısız",       color: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700", Icon: XCircle },
}

export default function TopUpPage() {
  const [list, setList] = useState<TopUpRequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [credits, setCredits] = useState<number>(100)
  const [priceTry, setPriceTry] = useState<number>(50)
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER")
  const [paymentReference, setPaymentReference] = useState("")
  const [paymentDone, setPaymentDone] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const data = await topupService.mine()
      setList(data ?? [])
    } catch (e: any) {
      toast.error(e.message || "Yüklenemedi")
    } finally {
      setLoading(false)
    }
  }

  function selectPackage(c: number, p: number) {
    setCredits(c); setPriceTry(p)
  }

  async function submit() {
    if (credits <= 0) { toast.error("Geçerli bir kredi miktarı girin"); return }
    try {
      setSubmitting(true)
      await topupService.create({
        amount: credits,
        amountTry: priceTry,
        currency: "TRY",
        paymentMethod,
        paymentReference: paymentReference || undefined,
        paymentDone,
      })
      toast.success("Talebiniz alındı, admin onayı bekleniyor")
      setPaymentReference("")
      setPaymentDone(false)
      await load()
    } catch (e: any) {
      toast.error(e.message || "Gönderilemedi")
    } finally {
      setSubmitting(false)
    }
  }

  async function markPaid(id: number) {
    const ref = window.prompt("Ödeme referansı / dekont no (opsiyonel):") || ""
    try {
      await topupService.markPaid(id, ref)
      toast.success("Ödeme bilgisi kaydedildi")
      await load()
    } catch (e: any) {
      toast.error(e.message || "Güncellenemedi")
    }
  }

  function fmtDate(s?: string | null) {
    if (!s) return "—"
    return new Date(s).toLocaleString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/60 via-background to-orange-50/40 dark:from-amber-950/10 dark:via-background dark:to-orange-950/10 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex items-center gap-3">
          <Link href="/credits" className="p-2 rounded-lg hover:bg-muted transition">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-300/30 mb-1.5">
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">Kredi Yükleme Talebi</span>
            </div>
            <h1 className="text-2xl font-bold">Kredi Yükle</h1>
            <p className="text-sm text-muted-foreground">Kredi paketi seçin, ödeme yapın ve admin onayını bekleyin.</p>
          </div>
        </div>

        {/* New request form */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h2 className="font-semibold">Yeni Talep</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PACKAGES.map(p => (
              <button
                key={p.credits}
                onClick={() => selectPackage(p.credits, p.priceTry)}
                className={`rounded-lg border p-3 text-left transition ${
                  credits === p.credits
                    ? "border-amber-500 ring-2 ring-amber-300/30 bg-amber-50/50 dark:bg-amber-950/20"
                    : "border-border hover:border-amber-400"
                }`}
              >
                <div className="text-lg font-bold">{p.credits} kredi</div>
                <div className="text-xs text-muted-foreground">₺{p.priceTry}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Kredi Miktarı</label>
              <input
                type="number"
                value={credits}
                onChange={e => setCredits(Number(e.target.value || 0))}
                min={1}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tutar (TRY)</label>
              <input
                type="number"
                value={priceTry}
                onChange={e => setPriceTry(Number(e.target.value || 0))}
                min={0}
                step="0.01"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Ödeme Yöntemi</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="BANK_TRANSFER">Banka Havalesi / EFT</option>
                <option value="CREDIT_CARD">Kredi Kartı</option>
                <option value="OTHER">Diğer</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Ödeme Referansı (opsiyonel)</label>
              <input
                type="text"
                value={paymentReference}
                onChange={e => setPaymentReference(e.target.value)}
                placeholder="Dekont no, transaction ID, vb."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={paymentDone}
              onChange={e => setPaymentDone(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Ödemeyi yaptım
          </label>

          <div className="flex justify-end">
            <button
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Talebi Gönder
            </button>
          </div>
        </div>

        {/* Past requests */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Geçmiş Taleplerim</h2>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : list.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-8">Henüz talep oluşturmadınız.</p>
          ) : (
            <div className="divide-y divide-border">
              {list.map(req => {
                const meta = STATUS_META[req.status] ?? STATUS_META.PENDING
                const Icon = meta.Icon
                return (
                  <div key={req.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold">{req.amount} kredi</span>
                          {req.amountTry && (
                            <span className="text-xs text-muted-foreground">₺{req.amountTry}</span>
                          )}
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
                            <Icon className="h-3 w-3" />
                            {meta.label}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {fmtDate(req.requestedAt)}
                          {req.paymentMethod && <> • {req.paymentMethod}</>}
                          {req.paymentReference && <> • Ref: {req.paymentReference}</>}
                        </div>
                        {req.status === "REJECTED" && req.rejectionReason && (
                          <p className="text-xs text-red-600 dark:text-red-400">Red sebebi: {req.rejectionReason}</p>
                        )}
                        {req.adminNote && (
                          <p className="text-xs text-muted-foreground italic">Admin notu: {req.adminNote}</p>
                        )}
                        {req.approvedAt && (
                          <p className="text-[11px] text-muted-foreground">
                            {req.status === "APPROVED" ? "Onaylandı" : "İncelendi"}: {fmtDate(req.approvedAt)}
                            {req.reviewedBy && ` (${req.reviewedBy})`}
                          </p>
                        )}
                      </div>

                      {(req.status === "PENDING" || (req.status === "PAID" && !req.paymentDone)) && !req.paymentDone && (
                        <button
                          onClick={() => markPaid(req.id)}
                          className="text-xs rounded-lg border border-border px-3 py-1.5 hover:bg-muted transition"
                        >
                          Ödedim
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
