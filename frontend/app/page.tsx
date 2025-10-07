"use client"

import { useState, useEffect, useCallback } from "react"
import { PremiumHeader } from "@/components/navigation/premium-header"
import PremiumDashboard from "@/components/dashboard/premium-dashboard"
import GroupManagement from "@/components/group-management"
import ManageMembers from "@/components/manage-members"
import ScheduleList from "@/components/schedule-list"
import type { Reminder, View } from "@/types"
import { apiService } from "@/services/api/apiService"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function HomePage() {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchReminders = useCallback(async () => {
    setIsLoading(true)
    try {
      const fetchedReminders = await apiService.get<Reminder[]>("/reminders")
      setReminders(fetchedReminders || [])
    } catch (error) {
      console.error("Failed to fetch reminders:", error)
      toast.error("Hatırlatıcılar yüklenemedi.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReminders()
  }, [fetchReminders])

  const handleSaveReminder = async (reminderToSave: Reminder | Omit<Reminder, "id">) => {
    try {
      if ("id" in reminderToSave && reminderToSave.id) {
        await apiService.put(`/reminders/${reminderToSave.id}`, reminderToSave)
        toast.success("Hatırlatıcı güncellendi!")
      } else {
        await apiService.post("/reminders", reminderToSave)
        toast.success("Hatırlatıcı oluşturuldu!")
      }
      await fetchReminders()
    } catch (error) {
      console.error("Failed to save reminder:", error)
      toast.error("Hatırlatıcı kaydedilemedi.")
    }
  }

  const handleDeleteReminder = async (id: string) => {
    try {
      await apiService.delete(`/reminders/${id}`)
      toast.success("Hatırlatıcı silindi.")
      setReminders((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      console.error("Failed to delete reminder:", error)
      toast.error("Hatırlatıcı silinemedi.")
    }
  }

  const handleToggleReminderStatus = async (id: string) => {
    const reminder = reminders.find((r) => r.id === id)
    if (!reminder) return

    const newStatus = reminder.status === "paused" ? "scheduled" : "paused"
    try {
      await apiService.put(`/reminders/${id}`, { ...reminder, status: newStatus })
      toast.success(`Hatırlatıcı durumu güncellendi: ${newStatus}`)
      await fetchReminders()
    } catch (error) {
      console.error("Failed to toggle reminder status:", error)
      toast.error("Durum güncellenemedi.")
    }
  }

  const handleNavigate = (view: View, groupId?: string) => {
    setCurrentView(view)
    if (groupId) {
      setSelectedGroupId(groupId)
    }
  }

  const renderContent = () => {
    if (isLoading && (currentView === "schedules" || currentView === "dashboard")) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    switch (currentView) {
      case "dashboard":
        return <PremiumDashboard onNavigate={handleNavigate} />
      case "groups":
        return <GroupManagement onNavigate={handleNavigate} />
      case "manage-members":
        return <ManageMembers groupId={selectedGroupId} onNavigate={handleNavigate} />
      case "schedules":
        return (
          <ScheduleList
            reminders={reminders}
            onNavigate={handleNavigate}
            onSave={handleSaveReminder}
            onDelete={handleDeleteReminder}
            onToggleStatus={handleToggleReminderStatus}
          />
        )
      default:
        return <PremiumDashboard onNavigate={handleNavigate} />
    }
  }

  const showNavigation = currentView !== "manage-members"

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-background via-background to-accent/5">
        <PremiumHeader currentView={currentView} onNavigate={handleNavigate} />
        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:gap-6 md:p-8 pt-20">{renderContent()}</main>
      </div>
    </>
  )
}
