"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Sparkles, Zap, Shield, Users, Bell, ArrowLeft, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

const freePlanFeatures = [
    { icon: Bell, key: "10 üyeye kadar grup" },
    { icon: Users, key: "Grup oluşturma" },
    { icon: Check, key: "E-posta bildirimleri" },
    { icon: Check, key: "Temel hatırlatıcılar" },
]

const premiumPlanFeatures = [
    { icon: Crown, key: "300 üyeye kadar grup" },
    { icon: Users, key: "Sınırsız grup oluşturma" },
    { icon: Bell, key: "SMS + WhatsApp bildirimleri" },
    { icon: Zap, key: "Öncelikli gönderim" },
    { icon: Shield, key: "Gelişmiş tekrar seçenekleri" },
    { icon: Sparkles, key: "Öncelikli destek" },
]

export default function PremiumPage() {
    const router = useRouter()
    const { t } = useLanguage()
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)

    const handleUpgrade = async () => {
        setIsLoading(true)
        // Simulated upgrade – wire to real payment when ready
        setTimeout(() => {
            setIsLoading(false)
            toast.success("Premium'a yükseltme talebi alındı! Yakında sizinle iletişime geçeceğiz.")
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30 py-12 px-4">
            {/* Back button */}
            <div className="max-w-5xl mx-auto mb-8">
                <Button
                    variant="ghost"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Geri Dön
                </Button>
            </div>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-5xl mx-auto text-center mb-14"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/40 dark:border-indigo-500/30 mb-6">
                    <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Premium Planlar</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Sınırları Kaldırın
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                    Premium'a geçin, gruplarınıza 300 üye ekleyin ve tüm gelişmiş özelliklere erişin.
                </p>
            </motion.div>

            {/* Cards */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Free Plan */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card className="h-full border-2 border-border/40 bg-background/80 backdrop-blur rounded-2xl shadow-md">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="text-xs font-semibold">Ücretsiz</Badge>
                                {user && !user.premium && (
                                    <Badge className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 border-green-300/40">
                                        Mevcut Planınız
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-end gap-1 mt-2">
                                <span className="text-4xl font-black text-foreground">₺0</span>
                                <span className="text-muted-foreground mb-1.5">/ay</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {freePlanFeatures.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                                        <f.icon className="h-3 w-3" />
                                    </div>
                                    {f.key}
                                </div>
                            ))}
                            <Button variant="outline" className="w-full mt-6 rounded-xl" disabled>
                                Mevcut Plan
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Premium Plan */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative"
                >
                    {/* Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20 scale-105" />

                    <Card className="relative h-full border-2 border-transparent bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/40 backdrop-blur rounded-2xl shadow-xl overflow-hidden"
                        style={{ borderImage: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899) 1" }}
                    >
                        {/* Badge */}
                        <div className="absolute top-4 right-4">
                            <Badge className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-md gap-1">
                                <Sparkles className="h-3 w-3" /> En Popüler
                            </Badge>
                        </div>

                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/30">
                                    <Crown className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <Badge className="text-xs font-semibold bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/40">
                                    Premium
                                </Badge>
                            </div>
                            <div className="flex items-end gap-1 mt-2">
                                <span className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">₺199</span>
                                <span className="text-muted-foreground mb-1.5">/ay</span>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {premiumPlanFeatures.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-foreground font-medium">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                                        <f.icon className="h-3 w-3 text-white" />
                                    </div>
                                    {f.key}
                                </div>
                            ))}

                            <div className="relative group mt-6">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-all duration-500" />
                                <Button
                                    className="relative w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl rounded-xl font-semibold h-11 transition-all duration-300 hover:scale-[1.01]"
                                    onClick={handleUpgrade}
                                    disabled={isLoading || user?.premium === true}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <motion.div
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                            İşleniyor...
                                        </span>
                                    ) : user?.premium ? (
                                        "Zaten Premium Kullanıcısınız ✓"
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Premium'a Yükselt
                                        </>
                                    )}
                                </Button>
                            </div>

                            <p className="text-xs text-center text-muted-foreground pt-2">
                                İstediğiniz zaman iptal edebilirsiniz. Kredi kartı şart değil.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
