"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, BellOff, AlertCircle } from "lucide-react"

interface PeekData {
  name: string
  email: string
  alreadyUnsubscribed: boolean
}

export default function UnsubscribePage() {
  const params = useParams()
  const token = params.token as string

  const [step, setStep] = useState<"loading" | "confirm" | "done" | "error">("loading")
  const [data, setData] = useState<PeekData | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let aborted = false
    ;(async () => {
      try {
        const res = await fetch(`/api/public/unsubscribe/${token}`)
        const json = await res.json()
        if (aborted) return
        if (json.success && json.data) {
          setData(json.data)
          if (json.data.alreadyUnsubscribed) setStep("done")
          else setStep("confirm")
        } else {
          setErrorMsg(json.message || "Geçersiz link")
          setStep("error")
        }
      } catch {
        if (!aborted) {
          setErrorMsg("Bağlantı hatası")
          setStep("error")
        }
      }
    })()
    return () => {
      aborted = true
    }
  }, [token])

  const confirm = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/public/unsubscribe/${token}`, { method: "POST" })
      const json = await res.json()
      if (json.success) setStep("done")
      else {
        setErrorMsg(json.message || "İşlem başarısız")
        setStep("error")
      }
    } catch {
      setErrorMsg("İşlem tamamlanamadı")
      setStep("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="w-full max-w-md rounded-2xl shadow-xl">
          <CardContent className="py-12 px-8 text-center">
            {step === "loading" && (
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-muted-foreground" />
            )}

            {step === "confirm" && (
              <>
                <BellOff className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Abonelikten Çık</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {data?.name || "Bu kişi"} ({data?.email || "—"}) artık hatırlatma bildirimi
                  almak istemiyor musunuz? Bu işlem tüm gruplardan çıkarılmasına yol açacaktır.
                </p>
                <Button
                  onClick={confirm}
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 text-white"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Aboneliği iptal et
                </Button>
              </>
            )}

            {step === "done" && (
              <>
                <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Tamamlandı</h2>
                <p className="text-sm text-muted-foreground">
                  Bildirim aboneliğiniz iptal edildi. Bu pencereyi kapatabilirsiniz.
                </p>
              </>
            )}

            {step === "error" && (
              <>
                <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Hata</h2>
                <p className="text-sm text-muted-foreground">{errorMsg}</p>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
