"use client"

import React, { useState, useMemo } from "react"
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isSameMonth,
    addMonths,
    subMonths,
    getDay,
    isToday,
} from "date-fns"
import { tr } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Bell, Users, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Reminder } from "@/types"
import { useRouter } from "next/navigation"

interface CalendarViewProps {
    reminders: Reminder[]
    onCreateWithDate?: (date: Date) => void
}

const STATUS_COLORS: Record<string, string> = {
    scheduled: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-500/30",
    paused: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-500/30",
    sent: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-500/30",
    failed: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200/50 dark:border-rose-500/30",
}

const DAY_NAMES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]

export default function CalendarView({ reminders, onCreateWithDate }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const router = useRouter()

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Monday-first offset: getDay returns 0=Sun, so shift
    const startOffset = (getDay(monthStart) + 6) % 7

    // Map reminders by date string for quick lookup
    const remindersByDate = useMemo(() => {
        const map = new Map<string, Reminder[]>()
        reminders.forEach((r) => {
            const key = format(new Date(r.dateTime), "yyyy-MM-dd")
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(r)
        })
        return map
    }, [reminders])

    const handlePrevMonth = () => setCurrentMonth((m) => subMonths(m, 1))
    const handleNextMonth = () => setCurrentMonth((m) => addMonths(m, 1))
    const handleToday = () => setCurrentMonth(new Date())

    return (
        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-gradient-to-r from-background to-accent/5">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-base font-semibold capitalize">
                        {format(currentMonth, "MMMM yyyy", { locale: tr })}
                    </h2>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg text-xs h-8" onClick={handleToday}>
                    Bugün
                </Button>
            </div>

            {/* Day Name Headers */}
            <div className="grid grid-cols-7 border-b border-border/40">
                {DAY_NAMES.map((day) => (
                    <div
                        key={day}
                        className="py-2 text-center text-xs font-semibold text-muted-foreground tracking-wide"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7">
                {/* Leading empty cells */}
                {Array.from({ length: startOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border/30 bg-accent/20 p-1" />
                ))}

                {daysInMonth.map((day, idx) => {
                    const key = format(day, "yyyy-MM-dd")
                    const dayReminders = remindersByDate.get(key) || []
                    const isCurrentDay = isToday(day)
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const colIndex = (startOffset + idx) % 7
                    const isLastCol = colIndex === 6

                    return (
                        <div
                            key={key}
                            className={cn(
                                "min-h-[100px] p-1.5 border-b border-r border-border/30 relative group transition-colors",
                                !isLastCol && "border-r",
                                isCurrentDay && "bg-indigo-50/60 dark:bg-indigo-950/20",
                                !isCurrentMonth && "opacity-50",
                                onCreateWithDate && "cursor-pointer hover:bg-accent/30"
                            )}
                            onClick={() => onCreateWithDate && onCreateWithDate(day)}
                        >
                            {/* Day Number */}
                            <div className="flex items-center justify-end mb-1">
                                <span
                                    className={cn(
                                        "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                                        isCurrentDay
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {format(day, "d")}
                                </span>
                            </div>

                            {/* Reminder Badges */}
                            <div className="space-y-0.5 overflow-hidden">
                                {dayReminders.slice(0, 3).map((reminder) => {
                                    const statusColor = STATUS_COLORS[reminder.status] || STATUS_COLORS.scheduled
                                    const Icon = reminder.type === "group" ? Users : User
                                    return (
                                        <button
                                            key={reminder.id}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                router.push(`/schedules/${reminder.id}`)
                                            }}
                                            className={cn(
                                                "w-full text-left text-[10px] font-medium px-1.5 py-0.5 rounded-md border flex items-center gap-1 truncate transition-opacity hover:opacity-75",
                                                statusColor
                                            )}
                                        >
                                            <Icon className="h-2.5 w-2.5 shrink-0" />
                                            <span className="truncate">{reminder.title}</span>
                                        </button>
                                    )
                                })}

                                {dayReminders.length > 3 && (
                                    <div className="text-[10px] text-muted-foreground pl-1 font-medium">
                                        +{dayReminders.length - 3} daha
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}

                {/* Trailing empty cells to complete the last row */}
                {Array.from({
                    length: (7 - ((startOffset + daysInMonth.length) % 7)) % 7
                }).map((_, i) => (
                    <div key={`trailing-${i}`} className="min-h-[100px] border-b border-r border-border/30 bg-accent/20 p-1" />
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-5 py-3 border-t border-border/40 bg-gradient-to-r from-background to-accent/5 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium">Durum:</span>
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                    <div key={status} className="flex items-center gap-1.5">
                        <div className={cn("w-2.5 h-2.5 rounded-sm border", color)} />
                        <span className="text-xs text-muted-foreground capitalize">{
                            status === "scheduled" ? "Planlandı" :
                                status === "paused" ? "Duraklatıldı" :
                                    status === "sent" ? "Tamamlandı" :
                                        "Başarısız"
                        }</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
