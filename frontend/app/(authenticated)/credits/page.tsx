"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { creditService } from "@/services/auth/creditService"
import { CreditTransaction } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Coins, ArrowUpRight, ArrowDownRight, History, Zap, Star } from "lucide-react"
import { toast } from "sonner"

const creditPackages = [
    { amount: 100, price: "₺50", icon: Coins, color: "from-blue-500 to-indigo-500" },
    { amount: 500, price: "₺200", icon: Zap, color: "from-amber-500 to-orange-500", popular: true },
    { amount: 1000, price: "₺350", icon: Star, color: "from-purple-500 to-pink-500" },
]

export default function CreditsPage() {
    const { user, updateCredits } = useAuth()
    const { t } = useLanguage()
    const [transactions, setTransactions] = useState<CreditTransaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isBuying, setIsBuying] = useState<number | null>(null)

    useEffect(() => { fetchHistory() }, [])

    const fetchHistory = async () => {
        try {
            const history = await creditService.getHistory()
            setTransactions(history)
        } catch {
            console.error("Failed to fetch history")
        } finally {
            setIsLoading(false)
        }
    }

    const handleBuyCredits = async (amount: number) => {
        // Disabled since mobile handles it
    }

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("tr-TR", {
            day: "numeric", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50/60 via-background to-orange-50/40 dark:from-amber-950/10 dark:via-background dark:to-orange-950/10 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-300/30 dark:border-amber-500/20 mb-4">
                        <Coins className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Kredi Yönetimi</span>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Bakiye:{" "}
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                            {user?.credits ?? 0} kredi
                        </span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2">Kredi satın alımları <b>sadece mobil uygulamamızdan</b> yapılmaktadır.</p>
                </motion.div>

                {/* Packages */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {creditPackages.map((pkg, i) => (
                        <motion.div
                            key={pkg.amount}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="relative group"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${pkg.color} rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-all duration-400`} />
                            <Card className={`relative border-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow
                ${pkg.popular ? "border-amber-300/60 dark:border-amber-500/40" : "border-border/60"}`}>
                                {pkg.popular && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs px-3">
                                            Popüler
                                        </Badge>
                                    </span>
                                )}
                                <CardContent className="pt-8 pb-6 flex flex-col items-center gap-3">
                                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${pkg.color} shadow-sm`}>
                                        <pkg.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-black text-foreground">{pkg.amount}</div>
                                        <div className="text-xs text-muted-foreground">kredi</div>
                                    </div>
                                    <div className="text-lg font-bold text-foreground">{pkg.price}</div>
                                    <button
                                        disabled
                                        className={`w-full py-2 rounded-xl text-xs font-semibold text-white shadow-sm
                      bg-gradient-to-r ${pkg.color} opacity-80 cursor-default
                      flex items-center justify-center gap-2`}
                                    >
                                        Mobil Uygulamadan Alın
                                    </button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Transaction History */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="border-border/60 rounded-2xl shadow-sm overflow-hidden">
                        <CardHeader className="px-6 py-4 border-b border-border/40">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <History className="h-4 w-4 text-muted-foreground" />
                                {t("credits.transaction_history")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : transactions.length > 0 ? (
                                <div className="divide-y divide-border/40">
                                    {transactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg
                          ${tx.transactionType === "ADD"
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"}`}>
                                                    {tx.transactionType === "ADD"
                                                        ? <ArrowUpRight className="h-4 w-4" />
                                                        : <ArrowDownRight className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{tx.description}</p>
                                                    <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                                                </div>
                                            </div>
                                            <span className={`font-semibold text-sm tabular-nums
                        ${tx.transactionType === "ADD"
                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                    : "text-rose-600 dark:text-rose-400"}`}>
                                                {tx.transactionType === "ADD" ? "+" : "-"}{tx.amount}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-3">
                                    <History className="h-10 w-10 opacity-20" />
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
