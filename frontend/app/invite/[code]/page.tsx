"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Check, Shield, Loader2, Bell, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Link from "next/link"

interface GroupInfo {
  id: string
  name: string
  description: string
  memberCount: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export default function InvitePage() {
  const params = useParams()
  const code = params.code as string

  const [step, setStep] = useState<"loading" | "consent" | "success" | "error">("loading")
  const [groupData, setGroupData] = useState<GroupInfo | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [consentGiven, setConsentGiven] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    validateInviteCode()
  }, [code])

  const validateInviteCode = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/invite/${code}`)
      const data = await response.json()

      if (data.success && data.data) {
        setGroupData({
          id: data.data.id,
          name: data.data.name,
          description: data.data.description || "",
          memberCount: data.data.memberCount || 0,
        })
        setStep("consent")
      } else {
        setErrorMessage(data.message || "Geçersiz davet kodu")
        setStep("error")
      }
    } catch (error) {
      setErrorMessage("Davet kodu doğrulanamadı")
      setStep("error")
    }
  }

  const handleSubmitConsent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!consentGiven) {
      toast.error("Gruba katılmak için onay vermeniz gerekiyor.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/invite/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: phoneNumber }),
      })
      const data = await response.json()

      if (data.success) {
        setStep("success")
        toast.success("Gruba başarıyla katıldınız!")
      } else {
        toast.error(data.message || "Gruba katılırken bir hata oluştu.")
      }
    } catch (error) {
      toast.error("Gruba katılırken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
        />
      </div>
    )
  }

  if (step === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/10 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="w-full max-w-md border-2 border-rose-200/40 rounded-2xl shadow-xl text-center">
            <CardContent className="py-12 px-8">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                <Shield className="h-8 w-8 text-rose-500" />
              </div>
              <h2 className="text-2xl font-bold text-rose-600 mb-2">Geçersiz Davet</h2>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              <Link href="/login">
                <Button className="rounded-xl">Giriş Yap</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="w-full max-w-md border-2 border-emerald-200/40 rounded-2xl shadow-xl text-center">
            <CardContent className="py-12 px-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <Check className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Hoş Geldiniz!</h2>
              <p className="text-muted-foreground mb-6">
                <span className="font-semibold text-foreground">&quot;{groupData?.name}&quot;</span> grubuna başarıyla katıldınız. Artık bu grubun bildirimlerini alacaksınız.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
                <Users className="h-4 w-4" />
                <span>{(groupData?.memberCount || 0) + 1} üye</span>
              </div>
              <Link href="/login">
                <Button className="rounded-xl w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0">
                  Giriş Yap <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/40 mb-4">
            <Bell className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Hatirlat.io</span>
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Davet Edildiniz!
          </h1>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">&quot;{groupData?.name}&quot;</span> grubuna katılmak için bilgilerinizi doldurun.
          </p>
        </motion.div>

        {/* Group Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-indigo-200/40 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/30 dark:to-purple-950/20 rounded-2xl shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md flex-shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground truncate">{groupData?.name}</h2>
                {groupData?.description && (
                  <p className="text-sm text-muted-foreground truncate">{groupData.description}</p>
                )}
              </div>
              <Badge variant="outline" className="flex-shrink-0">
                {groupData?.memberCount ?? 0} üye
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* Join Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-border/40 rounded-2xl shadow-md">
            <CardHeader className="p-5 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-purple-500" /> Bilgilerinizi Girin
              </CardTitle>
              <CardDescription>Bildirim almak için bilgilerinizi ve onayınızı verin.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSubmitConsent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Ad Soyad *</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınız ve soyadınız"
                    className="rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">E-posta</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Telefon Numarası</label>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+90 555 123 4567"
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground mt-1">SMS veya WhatsApp bildirimleri için kullanılacak.</p>
                </div>

                <div className="bg-muted/50 rounded-xl p-4">
                  <h4 className="font-medium text-sm mb-2">Gizlilik & KVKK</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Bilgileriniz yalnızca grup bildirimleri için kullanılacaktır.</li>
                    <li>• İstediğiniz zaman gruptan çıkabilirsiniz.</li>
                    <li>• Verileriniz GDPR/KVKK kapsamında korunmaktadır.</li>
                  </ul>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent"
                    checked={consentGiven}
                    onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                    className="mt-0.5"
                  />
                  <label htmlFor="consent" className="text-sm leading-relaxed text-muted-foreground cursor-pointer">
                    Bu gruptan SMS, e-posta veya WhatsApp bildirimleri almayı kabul ediyorum. Onayımı istediğim zaman geri çekebilirim.
                  </label>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-all duration-300" />
                  <Button
                    type="submit"
                    className="relative w-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow font-semibold"
                    disabled={isLoading || !consentGiven}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Katılıyor...</>
                    ) : (
                      <>Gruba Katıl <ArrowRight className="h-4 w-4 ml-2" /></>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
