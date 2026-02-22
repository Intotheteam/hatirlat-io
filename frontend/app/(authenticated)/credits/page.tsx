"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { creditService } from "@/services/auth/creditService"
import { CreditTransaction } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Loader2, Coins, ArrowUpRight, ArrowDownRight,
    History, ArrowLeft, Zap, Star, Sparkles
} from "lucide-react"
import { toast } from "sonner"

const creditPackages = [
    {
        amount: 100,
        price: "₺50",
        label: "Başlangıç",
        icon: Coins,
        popular: false,
        gradient: "from-blue-500/10 to-indigo-500/10",
        border: "border-blue-200/30 dark:border-blue-500/20",
        glow: "from-blue-500 to-indigo-500",
    },
    {
        amount: 500,
        price: "₺200",
        label: "Popüler",
        icon: Zap,
        popular: true,
        gradient: "from-amber-500/15 to-orange-500/15",
        border: "border-amber-300/50 dark:border-amber-500/40",
        glow: "from-amber-500 to-orange-500",
    },
    {
        amount: 1000,
        price: "₺350",
        label: "Pro",
        icon: Star,
        popular: false,
        gradient: "from-purple-500/10 to-pink-500/10",
        border: "border-purple-200/30 dark:border-purple-500/20",
        glow: "from-purple-500 to-pink-500",
    },
]

export default function CreditsPage() {
    const router = useRouter()
    const { user, updateCredits } = useAuth()
    const { t } = useLanguage()
    const [transactions, setTransactions] = useState<CreditTransaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isBuying, setIsBuying] = useState<number | null>(null)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const history = await creditService.getHistory()
            setTransactions(history)
        } catch (error) {
            console.error("Failed to fetch transaction history", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleBuyCredits = async (amount: number) => {
        setIsBuying(amount)
        try {
            await creditService.addCredits(amount)
            if (user) updateCredits((user.credits || 0) + amount)
            toast.success(t("credits.buy_success", { amount }))
            fetchHistory()
        } catch (error) {
            toast.error(t("credits.buy_error"))
        } finally {
            setIsBuying(null)
        }
    }

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("tr-TR", {
            day: "numeric", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/40 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/10 py-12 px-4">

            {/* Back */}
            <div className="max-w-5xl mx-auto mb-8">
                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    Geri Dön
                </Button>
            </div>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-5xl mx-auto text-center mb-14"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/40 dark:border-amber-500/30 mb-6">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Kredi Yönetimi</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-4">
                    Kredilerinizi Yönetin
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                    Bildirim göndermek için kredi kullanırsınız. İstediğiniz paketi seçerek hemen yükleyin.
                </p>
            </motion.div>

            <div className="max-w-5xl mx-auto space-y-8">

                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 rounded-2xl blur-xl opacity-20 scale-105" />
                        <Card className="relative border-2 border-amber-200/40 dark:border-amber-500/30 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-yellow-50/50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/20 backdrop-blur rounded-2xl shadow-xl overflow-hidden">
                            <CardContent className="p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl blur-lg opacity-40" />
                                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                                        <Coins className="h-10 w-10 text-white" />
                                    </div>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">{t("credits.balance")}</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-6xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                            {user?.credits || 0}
                                        </span>
                                        <span className="text-xl text-muted-foreground mb-2">kredi</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Her SMS / WhatsApp bildirimi için 1 kredi kullanılır.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Packages */}
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" /> Kredi Paketleri
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {creditPackages.map((pkg, i) => (
                            <motion.div
                                key={pkg.amount}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="relative group"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${pkg.glow} rounded-2xl blur-lg opacity-0 group-hover:opacity-25 transition-all duration-500`} />
                                <Card className={`relative h-full border-2 ${pkg.border} bg-gradient-to-br ${pkg.gradient} dark:bg-background/50 backdrop-blur rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}>
                                    {pkg.popular && (
                                        <div className="absolute top-3 right-3">
                                            <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 text-xs shadow">
                                                <Zap className="h-3 w-3 mr-1" /> Popüler
                                            </Badge>
                                        </div>
                                    )}
                                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${pkg.glow} shadow-md`}>
                                            <pkg.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-black text-foreground">{pkg.amount}</div>
                                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">kredi</div>
                                        </div>
                                        <div className="text-xl font-bold text-foreground">{pkg.price}</div>
                                        <button
                                            onClick={() => handleBuyCredits(pkg.amount)}
                                            disabled={isBuying !== null}
                                            className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-md transition-all duration-300 bg-gradient-to-r ${pkg.glow} hover:opacity-90 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                                        >
                                            {isBuying === pkg.amount ? (
                                                <><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor...</>
                                            ) : (
                                                <>Satın Al</>
                                            )}
                                        </button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Transaction History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card className="border-2 border-border/40 bg-background/80 backdrop-blur rounded-2xl shadow-md overflow-hidden">
                        <CardHeader className="p-6 border-b border-border/40 bg-gradient-to-r from-muted/30 to-muted/10">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/30">
                                    <History className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                {t("credits.transaction_history")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="flex justify-center py-16">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-lg" />
                                        <Loader2 className="relative h-10 w-10 animate-spin text-amber-500" />
                                    </div>
                                </div>
                            ) : transactions.length > 0 ? (
                                <div className="divide-y divide-border/40">
                                    {transactions.map((tx, i) => (
                                        <motion.div
                                            key={tx.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-xl ${tx.transactionType === "ADD"
                                                    ? "bg-emerald-500/10 border border-emerald-200/30 dark:border-emerald-500/20"
                                                    : "bg-rose-500/10 border border-rose-200/30 dark:border-rose-500/20"}`}>
                                                    {tx.transactionType === "ADD"
                                                        ? <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                        : <ArrowDownRight className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{tx.description}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(tx.createdAt)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className={`text-xs font-semibold ${tx.transactionType === "ADD"
                                                    ? "border-emerald-200/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                                                    : "border-rose-200/50 text-rose-600 dark:text-rose-400 bg-rose-500/5"}`}>
                                                    {tx.transactionType === "ADD" ? t("credits.type_add") : t("credits.type_deduct")}
                                                </Badge>
                                                <span className={`text-base font-bold tabular-nums ${tx.transactionType === "ADD"
                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                    : "text-rose-600 dark:text-rose-400"}`}>
                                                    {tx.transactionType === "ADD" ? "+" : "-"}{tx.amount}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-muted rounded-full blur-lg opacity-40" />
                                        <History className="relative h-14 w-14 opacity-20" />
                                    </div>
                                    <p className="text-sm">{t("credits.no_history")}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

            </div>
        </div>
    )
}
