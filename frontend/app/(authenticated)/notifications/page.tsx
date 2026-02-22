"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { apiService } from "@/services/api/apiService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Bell, CheckCircle2, XCircle, Loader2, ChevronLeft, ChevronRight, Mail, Phone, MessageSquare
} from "lucide-react"
import { toast } from "sonner"

interface NotificationLog {
    id: string
    reminderId: string
    reminderTitle: string
    channel: string
    recipient: string
    status: string
    errorMessage: string | null
    sentAt: string
}

const channelIcon = (channel: string) => {
    switch (channel?.toUpperCase()) {
        case "EMAIL": return <Mail className="h-3.5 w-3.5" />
        case "SMS": return <Phone className="h-3.5 w-3.5" />
        case "WHATSAPP": return <MessageSquare className="h-3.5 w-3.5" />
        default: return <Bell className="h-3.5 w-3.5" />
    }
}

const channelLabel = (channel: string) => {
    switch (channel?.toUpperCase()) {
        case "EMAIL": return "E-posta"
        case "SMS": return "SMS"
        case "WHATSAPP": return "WhatsApp"
        default: return channel
    }
}

const PAGE_SIZE = 20

export default function NotificationLogsPage() {
    const { t } = useLanguage()
    const [logs, setLogs] = useState<NotificationLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => { fetchLogs(page) }, [page])

    const fetchLogs = async (p: number) => {
        setIsLoading(true)
        try {
            const res = await apiService.get<{ success: boolean; data: NotificationLog[] }>(
                `/api/notification-logs?page=${p}&size=${PAGE_SIZE}`
            )
            const data = (res as any).data ?? []
            setLogs(data)
            setHasMore(data.length === PAGE_SIZE)
        } catch {
            toast.error("Bildirim geçmişi yüklenemedi.")
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("tr-TR", {
            day: "numeric", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })

    return (
        <div className="container mx-auto max-w-4xl py-8 px-4 space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Bell className="h-6 w-6 text-indigo-500" /> Bildirim Geçmişi
                </h1>
                <p className="text-muted-foreground mt-1">Gönderilen tüm bildirimlerin teslim kaydı</p>
            </div>

            {/* Log List */}
            <Card className="border-border/60 rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="px-6 py-4 border-b border-border/40">
                    <CardTitle className="text-base">Teslim Kayıtları</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
                            <Bell className="h-12 w-12 opacity-20" />
                            <p className="text-sm">Henüz bildirim kaydı yok.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/40">
                            {logs.map((log, i) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="flex items-start justify-between px-6 py-4 hover:bg-muted/30 transition-colors gap-4"
                                >
                                    {/* Left */}
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${log.status === "SUCCESS"
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                            }`}>
                                            {log.status === "SUCCESS"
                                                ? <CheckCircle2 className="h-4 w-4" />
                                                : <XCircle className="h-4 w-4" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{log.reminderTitle || "—"}</p>
                                            <p className="text-xs text-muted-foreground truncate">{log.recipient}</p>
                                            {log.errorMessage && (
                                                <p className="text-xs text-rose-500 mt-0.5 truncate">{log.errorMessage}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">{formatDate(log.sentAt)}</p>
                                        </div>
                                    </div>

                                    {/* Right */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Badge variant="outline" className="text-xs gap-1">
                                            {channelIcon(log.channel)}
                                            {channelLabel(log.channel)}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${log.status === "SUCCESS"
                                                    ? "border-emerald-200/60 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                                                    : "border-rose-200/60 text-rose-600 dark:text-rose-400 bg-rose-500/5"
                                                }`}
                                        >
                                            {log.status === "SUCCESS" ? "Teslim Edildi" : "Başarısız"}
                                        </Badge>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {!isLoading && logs.length > 0 && (
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline" size="sm" className="gap-1.5 rounded-xl"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        <ChevronLeft className="h-4 w-4" /> Önceki
                    </Button>
                    <span className="text-sm text-muted-foreground">Sayfa {page + 1}</span>
                    <Button
                        variant="outline" size="sm" className="gap-1.5 rounded-xl"
                        onClick={() => setPage(p => p + 1)}
                        disabled={!hasMore}
                    >
                        Sonraki <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}
