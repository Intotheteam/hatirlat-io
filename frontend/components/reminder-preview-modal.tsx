"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, Mail, MessageSquare, Phone } from "lucide-react"
import { apiManager } from "@/services/api/apiManager"

interface PreviewItem {
  recipientName: string
  recipientType: string
  recipientStatus?: string | null
  channel: "EMAIL" | "SMS" | "WHATSAPP"
  target: string | null
  subject: string
  message: string
  warning?: string | null
}

interface PreviewData {
  reminderId: string
  reminderTitle: string
  recipientCount: number
  channelCount: number
  deliveryCount: number
  skippedCount: number
  items: PreviewItem[]
}

interface Props {
  reminderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const channelIcon = (ch: string) => {
  if (ch === "EMAIL") return <Mail className="h-3.5 w-3.5" />
  if (ch === "SMS") return <MessageSquare className="h-3.5 w-3.5" />
  return <Phone className="h-3.5 w-3.5" />
}

export default function ReminderPreviewModal({ reminderId, open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PreviewData | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !reminderId) return
    let cancelled = false
    setLoading(true)
    setErr(null)
    setData(null)
    apiManager
      .previewReminder(reminderId)
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((e: any) => {
        if (!cancelled) setErr(e?.message || "Önizleme alınamadı")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, reminderId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gönderim Önizleme</DialogTitle>
          <DialogDescription>
            Hatırlatma şu anda gönderilse her alıcıya hangi kanaldan ne ulaşacak?
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Hesaplanıyor...
          </div>
        )}

        {err && <div className="py-6 text-sm text-rose-500">{err}</div>}

        {data && !loading && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{data.recipientCount} alıcı</Badge>
              <Badge variant="secondary">{data.channelCount} kanal</Badge>
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                {data.deliveryCount} gönderim
              </Badge>
              {data.skippedCount > 0 && (
                <Badge variant="destructive">{data.skippedCount} atlanacak</Badge>
              )}
            </div>

            {data.items.length === 0 && (
              <p className="text-sm text-muted-foreground">Gönderim oluşmaz (kanal/alıcı yok).</p>
            )}

            <div className="space-y-3">
              {data.items.map((it, i) => {
                const skipped = !!it.warning && (it.warning.includes("atlanacak") || it.warning.includes("INACTIVE"))
                return (
                  <div
                    key={i}
                    className={`rounded-lg border p-3 ${skipped ? "border-rose-500/30 bg-rose-500/5" : "border-border"}`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{it.recipientName}</span>
                        <Badge variant="outline" className="text-[10px]">{it.recipientType}</Badge>
                        {it.recipientStatus && (
                          <Badge variant="outline" className="text-[10px]">{it.recipientStatus}</Badge>
                        )}
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1 text-[10px]">
                        {channelIcon(it.channel)} {it.channel}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Hedef: <code className="font-mono">{it.target || "—"}</code>
                    </div>
                    <div className="mt-2 rounded bg-muted/40 p-2">
                      <div className="text-xs font-semibold">{it.subject}</div>
                      <div className="text-xs whitespace-pre-wrap mt-1">{it.message || <em>(boş mesaj)</em>}</div>
                    </div>
                    {it.warning && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{it.warning}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
