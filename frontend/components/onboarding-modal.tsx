"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Users, Coins, CalendarDays, Sparkles, ChevronRight, ChevronLeft, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OnboardingStep {
    icon: React.ElementType
    gradient: string
    title: string
    subtitle: string
    description: string
    visual: React.ReactNode
}

const STORAGE_KEY = "hatirlat_onboarding_done"

const steps: OnboardingStep[] = [
    {
        icon: Bell,
        gradient: "from-indigo-500 via-purple-500 to-pink-500",
        title: "Hatirlat.io'ya Hoş Geldiniz!",
        subtitle: "Akıllı Hatırlatıcı Platformu",
        description:
            "Kişisel veya grup hatırlatıcıları oluşturun, SMS, WhatsApp ve E-posta ile zamanında bildirim alın. Asla önemli bir şeyi kaçırma!",
        visual: (
            <div className="relative flex items-center justify-center h-36">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />
                <div className="relative flex gap-3">
                    {["SMS", "WhatsApp", "E-posta"].map((ch, i) => (
                        <motion.div
                            key={ch}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className="px-3 py-2 rounded-xl bg-white/80 dark:bg-white/10 shadow border border-white/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                        >
                            {ch}
                        </motion.div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        icon: Bell,
        gradient: "from-blue-500 to-indigo-600",
        title: "Hatırlatıcı Oluşturun",
        subtitle: "Kişisel & Grup",
        description:
            'Hatırlatıcılar sekmesine giderek "Yeni Ekle" butonuna basın. Başlık, tarih/saat, mesaj ve bildirim kanalını seçin. Tekrar seçeneğiyle günlük, haftalık hatırlatmalar kurabilirsiniz.',
        visual: (
            <div className="relative bg-accent/30 rounded-xl p-4 border border-border/50 space-y-2 text-left">
                <div className="h-2.5 w-1/2 rounded bg-indigo-400/40" />
                <div className="h-2 w-3/4 rounded bg-muted-foreground/20" />
                <div className="flex gap-2 mt-3">
                    {["✉️ E-posta", "📱 SMS"].map((c) => (
                        <span key={c} className="text-[11px] px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 font-medium">{c}</span>
                    ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 w-28 rounded bg-muted-foreground/20" />
                    <div className="h-4 w-16 rounded-full bg-indigo-500/20 border border-indigo-300/40" />
                </div>
            </div>
        ),
    },
    {
        icon: Users,
        gradient: "from-emerald-500 to-teal-600",
        title: "Gruplarla Çalışın",
        subtitle: "Ekibinize Gönderin",
        description:
            "Grup oluşturun, üyeleri ekleyin ve tüm gruba aynı anda hatırlatıcı gönderin. Davet linkiyle hızlıca sahaya koyabilirsiniz.",
        visual: (
            <div className="flex flex-col items-center gap-2">
                <div className="flex -space-x-2">
                    {["A", "B", "C", "D"].map((l, i) => (
                        <motion.div
                            key={l}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.1, type: "spring" }}
                            className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold border-2 border-background shadow"
                        >
                            {l}
                        </motion.div>
                    ))}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground border-2 border-background shadow font-medium"
                    >
                        +8
                    </motion.div>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Proje Ekibi · 12 üye</p>
            </div>
        ),
    },
    {
        icon: CalendarDays,
        gradient: "from-violet-500 to-purple-600",
        title: "Takvim Görünümü",
        subtitle: "Ay Bazında İzleyin",
        description:
            'Hatırlatıcılar sayfasında sağ üstteki takvim ikonuna tıklayarak aylık takvim görünümüne geçin. Hangi günde ne var, anında görün.',
        visual: (
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium">
                {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
                    <div key={d} className="text-muted-foreground py-0.5">{d}</div>
                ))}
                {Array.from({ length: 28 }, (_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "rounded-md py-1",
                            i === 13 ? "bg-violet-500 text-white font-bold" :
                                i === 7 || i === 19 ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300" :
                                    "text-muted-foreground"
                        )}
                    >
                        {i + 1}
                    </div>
                ))}
            </div>
        ),
    },
    {
        icon: Coins,
        gradient: "from-amber-500 to-orange-500",
        title: "Kredi Sistemi",
        subtitle: "SMS & WhatsApp için",
        description:
            "Her SMS veya WhatsApp bildirimi 1 kredi kullanır. E-posta bildirimleri ücretsizdir. Kredi satın almak için mobil uygulamamızı kullanın.",
        visual: (
            <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-300/40">
                    <Coins className="h-5 w-5 text-amber-500" />
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400">100</span>
                    <span className="text-sm text-amber-600/70 font-medium">kredi</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 text-center">
                    <p>✅ E-posta → <strong>Ücretsiz</strong></p>
                    <p>📱 SMS & WhatsApp → <strong>1 kredi / bildirim</strong></p>
                </div>
            </div>
        ),
    },
    {
        icon: Sparkles,
        gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
        title: "Premium Üyelik",
        subtitle: "Sınırsız Özelliklere Geçin",
        description:
            "Premium üyeler için sınırsız hatırlatıcı, gelişmiş tekrar seçenekleri ve öncelikli destek. Mobil uygulamamızdan kolayca yükseltebilirsiniz.",
        visual: (
            <div className="relative flex flex-col items-center gap-2">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-fuchsia-500/20 rounded-xl blur-lg" />
                <div className="relative flex flex-col items-center gap-1">
                    <Sparkles className="h-10 w-10 text-pink-500 animate-pulse" />
                    <span className="text-sm font-bold bg-gradient-to-r from-rose-500 to-fuchsia-500 bg-clip-text text-transparent">Premium Plan</span>
                    {["✓ Sınırsız hatırlatıcı", "✓ Gelişmiş tekrar", "✓ Öncelikli destek"].map((f) => (
                        <span key={f} className="text-xs text-muted-foreground">{f}</span>
                    ))}
                </div>
            </div>
        ),
    },
]

export default function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        const done = localStorage.getItem(STORAGE_KEY)
        if (!done) {
            // Small delay so the main page loads first
            const t = setTimeout(() => setIsOpen(true), 800)
            return () => clearTimeout(t)
        }
    }, [])

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, "1")
        setIsOpen(false)
    }

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((s) => s + 1)
        } else {
            handleClose()
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep((s) => s - 1)
    }

    const step = steps[currentStep]
    const Icon = step.icon
    const isLast = currentStep === steps.length - 1

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && handleClose()}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden border border-border/50"
                    >
                        {/* Gradient top strip */}
                        <div className={`h-1.5 w-full bg-gradient-to-r ${step.gradient}`} />

                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:bg-accent transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="px-6 py-8 space-y-6">
                            {/* Icon */}
                            <div className="flex justify-center">
                                <div className={`p-4 rounded-2xl bg-gradient-to-br ${step.gradient} shadow-lg`}>
                                    <Icon className="h-8 w-8 text-white" />
                                </div>
                            </div>

                            {/* Title */}
                            <div className="text-center space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{step.subtitle}</p>
                                <h2 className="text-xl font-bold text-foreground">{step.title}</h2>
                            </div>

                            {/* Visual */}
                            <div className="bg-accent/20 rounded-2xl p-4 border border-border/40">
                                {step.visual}
                            </div>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground text-center leading-relaxed">
                                {step.description}
                            </p>

                            {/* Progress dots */}
                            <div className="flex items-center justify-center gap-1.5">
                                {steps.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentStep(i)}
                                        className={cn(
                                            "h-1.5 rounded-full transition-all duration-300",
                                            i === currentStep
                                                ? `w-6 bg-gradient-to-r ${step.gradient}`
                                                : "w-1.5 bg-muted-foreground/30"
                                        )}
                                    />
                                ))}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                {currentStep > 0 && (
                                    <Button variant="outline" onClick={handlePrev} className="flex-1 rounded-xl">
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Geri
                                    </Button>
                                )}
                                <Button
                                    onClick={handleNext}
                                    className={`flex-1 rounded-xl bg-gradient-to-r ${step.gradient} text-white border-0 hover:opacity-90 transition-opacity`}
                                >
                                    {isLast ? (
                                        <>
                                            <Check className="h-4 w-4 mr-1" />
                                            Başlayalım!
                                        </>
                                    ) : (
                                        <>
                                            İleri
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Skip */}
                            {!isLast && (
                                <button
                                    onClick={handleClose}
                                    className="w-full text-xs text-muted-foreground text-center hover:text-foreground transition-colors"
                                >
                                    Rehberi atla
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
