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

  const handleSaveReminder = async (reminderToSave: Reminder | Omit<Reminder, "id">) => {
    try {
      if ("id" in reminderToSave && reminderToSave.id) {
        await apiManager.updateReminder(reminderToSave.id, reminderToSave)
        toast.success("Hatırlatıcı güncellendi!")
      } else {
        await apiManager.createReminder(reminderToSave as Omit<Reminder, "id">)
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