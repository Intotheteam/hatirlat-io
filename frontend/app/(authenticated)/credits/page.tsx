"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { creditService } from "@/services/auth/creditService"
import { CreditTransaction } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Coins, ArrowUpRight, ArrowDownRight, History } from "lucide-react"
import { toast } from "sonner"

export default function CreditsPage() {
    const { user, updateCredits } = useAuth()
    const { t } = useLanguage()
    const [transactions, setTransactions] = useState<CreditTransaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isBuying, setIsBuying] = useState(false)

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
        setIsBuying(true)
        try {
            await creditService.addCredits(amount)

            if (user) {
                updateCredits((user.credits || 0) + amount)
            }

            toast.success(t("credits.buy_success", { amount }))
            fetchHistory() // Refresh history after purchase
        } catch (error) {
            toast.error(t("credits.buy_error"))
        } finally {
            setIsBuying(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">{t("credits.title")}</h1>
                    <p className="text-muted-foreground mt-2">{t("credits.subtitle")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Current Balance Card */}
                    <Card className="col-span-1 border-amber-200/50 dark:border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Coins className="h-5 w-5 text-amber-500" />
                                {t("credits.balance")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                                {user?.credits || 0}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Buy Packages */}
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Paket Satın Al</CardTitle>
                            <CardDescription>Hesabınıza anında kredi yükleyin</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Button
                                variant="outline"
                                className="h-24 flex flex-col gap-2 border-2 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
                                onClick={() => handleBuyCredits(100)}
                                disabled={isBuying}
                            >
                                <div className="text-2xl font-bold">100</div>
                                <div className="text-sm text-muted-foreground">₺50.00</div>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-24 flex flex-col gap-2 border-2 border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 relative overflow-hidden"
                                onClick={() => handleBuyCredits(500)}
                                disabled={isBuying}
                            >
                                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">POPÜLER</div>
                                <div className="text-2xl font-bold">500</div>
                                <div className="text-sm text-muted-foreground">₺200.00</div>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-24 flex flex-col gap-2 border-2 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
                                onClick={() => handleBuyCredits(1000)}
                                disabled={isBuying}
                            >
                                <div className="text-2xl font-bold">1000</div>
                                <div className="text-sm text-muted-foreground">₺350.00</div>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Transaction History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            {t("credits.transaction_history")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : transactions.length > 0 ? (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t("credits.date")}</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t("credits.type")}</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t("credits.amount")}</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t("credits.description")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <td className="p-4 align-middle">{formatDate(tx.createdAt)}</td>
                                                <td className="p-4 align-middle">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${tx.transactionType === 'ADD'
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                        }`}>
                                                        {tx.transactionType === 'ADD' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                                        {tx.transactionType === 'ADD' ? t("credits.type_add") : t("credits.type_deduct")}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle font-medium">
                                                    <span className={tx.transactionType === 'ADD' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                                                        {tx.transactionType === 'ADD' ? '+' : '-'}{tx.amount}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground">{tx.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>{t("credits.no_history")}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
