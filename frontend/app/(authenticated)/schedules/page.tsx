"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import ScheduleList from "@/components/schedule-list"
import type { Reminder, View } from "@/types"
import { apiManager } from "@/services/api/apiManager"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function SchedulesPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchReminders = useCallback(async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const fetchedReminders = await apiManager.getReminders()
      setReminders(fetchedReminders || [])
    } catch (error: any) {
      console.error("Failed to fetch reminders:", error)
      toast.error("Hatırlatıcılar yüklenemedi.")
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      fetchReminders()
    }
  }, [isAuthenticated, fetchReminders])

  const buildReminderPayload = (reminder: Reminder | Omit<Reminder, "id">) => {
    // Normalize dateTime: backend expects "yyyy-MM-dd'T'HH:mm:ss" (with seconds)
    let dateTime = reminder.dateTime || ""
    if (dateTime && !dateTime.match(/T\d{2}:\d{2}:\d{2}$/)) {
      dateTime = dateTime + ":00"
    }

    const payload: Record<string, unknown> = {
      title: reminder.title,
      type: reminder.type,
      message: reminder.message,
      dateTime,
      status: reminder.status,
      channels: reminder.channels,
      repeat: reminder.repeat,
      customRepeat: reminder.customRepeat ?? null,
    }

    if (reminder.type === "group") {
      // Pass groupId for existing group selection
      payload.groupId = reminder.group?.id || null
      payload.contact = null
    } else {
      payload.contact = reminder.contact ?? null
      payload.groupId = null
    }

    return payload
  }

  const handleSaveReminder = async (reminderToSave: Reminder | Omit<Reminder, "id">) => {
    try {
      const payload = buildReminderPayload(reminderToSave)
      if ("id" in reminderToSave && reminderToSave.id) {
        await apiManager.updateReminder(reminderToSave.id, payload as Partial<Reminder>)
        toast.success("Hatırlatıcı güncellendi!")
      } else {
        await apiManager.createReminder(payload as Omit<Reminder, "id">)
        toast.success("Hatırlatıcı oluşturuldu!")
      }
      await fetchReminders()
    } catch (error: any) {
      console.error("Failed to save reminder:", error)
      toast.error("Hatırlatıcı kaydedilemedi.")
    }
  }

  const handleDeleteReminder = async (id: string) => {
    try {
      await apiManager.deleteReminder(id)
      toast.success("Hatırlatıcı silindi.")
      setReminders((prev) => prev.filter((r) => r.id !== id))
    } catch (error: any) {
      console.error("Failed to delete reminder:", error)
      toast.error("Hatırlatıcı silinemedi.")
    }
  }

  const handleToggleReminderStatus = async (id: string) => {
    const reminder = reminders.find((r) => r.id === id)
    if (!reminder) return

    const newStatus = reminder.status === "paused" ? "scheduled" : "paused"
    try {
      await apiManager.updateReminderStatus(id, newStatus)
      toast.success(`Hatırlatıcı durumu güncellendi: ${newStatus}`)
      await fetchReminders()
    } catch (error: any) {
      console.error("Failed to toggle reminder status:", error)
      toast.error("Durum güncellenemedi.")
    }
  }

  const handleNavigate = (view: View) => {
    switch(view) {
      case "dashboard":
        router.push("/dashboard");
        break;
      case "schedules":
        router.push("/schedules");
        break;
      case "groups":
        router.push("/groups");
        break;
      default:
        router.push("/dashboard");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <ScheduleList
      reminders={reminders}
      onNavigate={handleNavigate}
      onSave={handleSaveReminder}
      onDelete={handleDeleteReminder}
      onToggleStatus={handleToggleReminderStatus}
    />
  )
}