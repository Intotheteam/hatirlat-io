"use client"

import type React from "react"
import { useState, useMemo } from "react"
import CalendarView from "@/components/calendar-view"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { User, Users, Mail, MessageSquare, Phone, Play, Pause, Trash2, Pencil, PlusCircle, Bell, LayoutList, CalendarDays, CalendarPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Reminder, View, CustomRepeatConfig, Channel } from "@/types"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import CreateReminderModal from "./create-reminder-modal"
import { apiManager } from "@/services/api/apiManager"

import { useLanguage } from "@/contexts/LanguageContext"

interface ScheduleListProps {
  reminders: Reminder[]
  onNavigate: (view: View) => void
  onSave: (reminder: Reminder | Omit<Reminder, "id">) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
}

const channelIcons: { [key: string]: React.ElementType } = {
  email: Mail,
  sms: Phone,
  whatsapp: MessageSquare,
}

export default function ScheduleList({ reminders, onNavigate, onSave, onDelete, onToggleStatus }: ScheduleListProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [filters, setFilters] = useState({ text: "", status: "all", type: "all", channel: "all" })
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
  const [deleteAlert, setDeleteAlert] = useState<{ isOpen: boolean; reminderId: string | null }>({
    isOpen: false,
    reminderId: null,
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleEditClick = (reminder: Reminder) => {
    router.push(`/schedules/${reminder.id}`)
  }

  const confirmDelete = () => {
    if (deleteAlert.reminderId) {
      onDelete(deleteAlert.reminderId)
    }
    setDeleteAlert({ isOpen: false, reminderId: null })
  }

  const filteredReminders = useMemo(() => {
    return reminders.filter((reminder) => {
      if (filters.text && !reminder.title.toLowerCase().includes(filters.text.toLowerCase())) return false
      if (filters.status !== "all" && reminder.status !== filters.status) return false
      if (filters.type !== "all" && reminder.type !== filters.type) return false
      if (filters.channel !== "all" && !reminder.channels?.includes(filters.channel as Channel)) return false
      return true
    })
  }, [reminders, filters])

  return (
    <div className="space-y-4">
      {/* Compact Header with Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Header Card */}
        <Card className="lg:col-span-5 rounded-xl border bg-card text-card-foreground shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h1 className="text-xl font-bold tracking-tight">
                  {t("schedule_list.title")}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">{t("schedule_list.subtitle")}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center rounded-lg border border-border/60 overflow-hidden">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 transition-colors ${viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                      }`}
                    title="Liste Görünümü"
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={`p-1.5 transition-colors ${viewMode === "calendar"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                      }`}
                    title="Takvim Görünümü"
                  >
                    <CalendarDays className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  size="sm"
                  className="rounded-full shadow-sm"
                >
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  {t("dashboard.create_new")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="lg:col-span-7 grid grid-cols-4 gap-3">
          <Card className="rounded-xl border bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">{t("schedule_list.total")}</p>
                <p className="text-2xl font-bold">{filteredReminders.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">{t("schedule_list.scheduled")}</p>
                <p className="text-2xl font-bold">{reminders.filter(r => r.status === "scheduled").length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">{t("schedule_list.sent")}</p>
                <p className="text-2xl font-bold">{reminders.filter(r => r.status === "sent").length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">{t("schedule_list.paused")}</p>
                <p className="text-2xl font-bold">{reminders.filter(r => r.status === "paused").length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters & Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-3 rounded-xl border bg-card shadow-sm">
          <CardHeader className="pb-3 px-4 pt-4">
            <h3 className="text-sm font-semibold text-foreground">{t("schedule_list.filters")}</h3>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("schedule_list.search")}</label>
              <Input
                placeholder={t("schedule_list.search_placeholder")}
                value={filters.text}
                onChange={(e) => handleFilterChange("text", e.target.value)}
                className="rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("schedule_list.status")}</label>
              <Select value={filters.status} onValueChange={(v) => handleFilterChange("status", v)}>
                <SelectTrigger className="rounded-lg text-sm">
                  <SelectValue placeholder={t("schedule_list.status_all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("schedule_list.status_all")}</SelectItem>
                  <SelectItem value="scheduled">{t("schedule_list.status_scheduled")}</SelectItem>
                  <SelectItem value="sent">{t("schedule_list.status_sent")}</SelectItem>
                  <SelectItem value="paused">{t("schedule_list.status_paused")}</SelectItem>
                  <SelectItem value="failed">{t("schedule_list.failed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("schedule_list.type")}</label>
              <Select value={filters.type} onValueChange={(v) => handleFilterChange("type", v)}>
                <SelectTrigger className="rounded-lg text-sm">
                  <SelectValue placeholder={t("schedule_list.type_all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("schedule_list.type_all")}</SelectItem>
                  <SelectItem value="personal">{t("schedule_list.personal_type")}</SelectItem>
                  <SelectItem value="group">{t("schedule_list.group_type")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("schedule_list.channel")}</label>
              <Select value={filters.channel} onValueChange={(v) => handleFilterChange("channel", v)}>
                <SelectTrigger className="rounded-lg text-sm">
                  <SelectValue placeholder={t("schedule_list.channel_all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("schedule_list.channel_all")}</SelectItem>
                  <SelectItem value="email">{t("schedule_list.channel_email")}</SelectItem>
                  <SelectItem value="sms">{t("schedule_list.channel_sms")}</SelectItem>
                  <SelectItem value="whatsapp">{t("schedule_list.channel_whatsapp")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ text: "", status: "all", type: "all", channel: "all" })}
              className="w-full rounded-lg h-9 text-sm mt-2"
            >
              {t("schedule_list.clear_filters")}
            </Button>
          </CardContent>
        </Card>

        {/* Reminders List OR Calendar View */}
        {viewMode === "calendar" ? (
          <div className="lg:col-span-9">
            <CalendarView
              reminders={filteredReminders}
              onCreateWithDate={() => setIsCreateModalOpen(true)}
            />
          </div>
        ) : (
          <Card className="lg:col-span-9 rounded-xl border bg-card shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">
                  {t("schedule_list.reminders_count", { count: filteredReminders.length })}
                </h3>
                <div className="text-sm text-muted-foreground">
                  {t("schedule_list.showing_text", { total: reminders.length, filtered: filteredReminders.length })}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3">
                {filteredReminders.length > 0 ? (
                  filteredReminders.map((reminder) => {
                    const TargetIcon = reminder.type === "group" ? Users : User
                    const isActionable = reminder.status === "scheduled" || reminder.status === "paused"
                    return (
                      <div
                        key={reminder.id}
                        className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 hover:shadow-sm transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                            <TargetIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-base truncate">{reminder.title}</p>
                              <Badge
                                variant={reminder.status === "scheduled" ? "default" : "outline"}
                                className="text-xs font-medium"
                              >
                                {reminder.status === "scheduled" ? t("schedule_list.status_scheduled") : (reminder.status === "paused" ? t("schedule_list.status_paused") : (reminder.status === "sent" ? t("schedule_list.status_sent") : reminder.status))}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <p className="text-sm text-muted-foreground truncate">
                                {reminder.type === "group" ? reminder.group?.name : reminder.contact?.name}
                              </p>
                              <span className="text-sm text-muted-foreground">•</span>
                              <p className="text-sm text-muted-foreground">
                                {new Date(reminder.dateTime).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <div className="flex gap-1.5 ml-2">
                                {(reminder.channels || []).slice(0, 3).map((channel) => {
                                  const Icon = channelIcons[channel]
                                  return Icon ? (
                                    <div
                                      key={channel}
                                      className="p-1 rounded bg-accent text-muted-foreground"
                                      title={channel}
                                    >
                                      <Icon className="h-3 w-3" />
                                    </div>
                                  ) : null
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onToggleStatus(reminder.id)}
                            disabled={!isActionable}
                            title={reminder.status === "paused" ? t("schedule_list.play_title") : t("schedule_list.pause_title")}
                            className="h-8 w-8 rounded-full hover:bg-accent"
                          >
                            {reminder.status === "paused" ? (
                              <Play className="h-4 w-4" />
                            ) : (
                              <Pause className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              try {
                                await apiManager.downloadReminderIcs(reminder.id, `${reminder.title || "reminder"}.ics`)
                              } catch (e) {
                                toast.error("Takvime eklenemedi")
                              }
                            }}
                            title="Takvime ekle (.ics)"
                            className="h-8 w-8 rounded-full hover:bg-accent"
                          >
                            <CalendarPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(reminder)}
                            title={t("common.edit")}
                            className="h-8 w-8 rounded-full hover:bg-accent"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => setDeleteAlert({ isOpen: true, reminderId: reminder.id })}
                            className="h-8 w-8 rounded-full"
                            title={t("common.delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-16">
                    <div className="mx-auto p-4 rounded-full bg-accent/50 w-16 h-16 flex items-center justify-center mb-4">
                      <Bell className="h-8 w-8 text-muted-foreground" />
                    </div>
                    {reminders.length === 0 ? (
                      <>
                        <p className="text-base font-semibold text-foreground">{t("dashboard.no_reminders_title")}</p>
                        <p className="text-sm text-muted-foreground mt-1 mb-6">{t("dashboard.no_reminders_desc")}</p>
                        <Button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="rounded-full shadow-sm"
                        >
                          <PlusCircle className="mr-1.5 h-4 w-4" />
                          {t("schedule_list.first_reminder")}
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-base font-semibold text-foreground">{t("schedule_list.no_reminders")}</p>
                        <p className="text-sm text-muted-foreground mt-1">{t("schedule_list.no_reminders_desc")}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals and Dialogs */}

      <CreateReminderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={onSave}
        groupReminderCount={reminders.filter(r => r.type === "group").length}
      />


      <AlertDialog open={deleteAlert.isOpen} onOpenChange={(open) => setDeleteAlert({ ...deleteAlert, isOpen: open })}>
        <AlertDialogContent className="rounded-xl border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">{t("schedule_list.delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {t("schedule_list.delete_confirm_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAlert({ isOpen: false, reminderId: null })} className="rounded-full">
              {t("schedule_list.delete_cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full">
              {t("schedule_list.delete_confirm_btn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
