"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Bell, Users, MoreHorizontal, Edit, Trash2, CheckCircle, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/LanguageContext"
import type { View } from "@/types"

interface RemindersDashboardProps {
  onNavigate: (view: View, groupId?: string) => void
}

export default function RemindersDashboard({ onNavigate }: RemindersDashboardProps) {
  const { t } = useLanguage()

  const reminders = [
    { id: "1", title: "Ekip Toplantısı", time: "10:00", type: t("dashboard.group"), status: "active" },
    { id: "2", title: "Doktor Randevusu", time: "14:30", type: t("dashboard.personal"), status: "completed" },
    { id: "3", title: "Proje Sunumu Teslimi", time: "16:00", type: t("dashboard.personal"), status: "active" },
  ]

  const stats = [
    { title: t("dashboard.total_reminders"), value: "12", icon: Bell, view: "scheduled" as View },
    { title: t("dashboard.scheduled"), value: "8", icon: Clock, view: "scheduled" as View },
    { title: t("dashboard.sent"), value: "4", icon: CheckCircle, view: "scheduled" as View },
    { title: t("header.groups"), value: "3", icon: Users, view: "groups" as View },
  ]

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("dashboard.title")}</h1>
            <p className="mt-1 text-muted-foreground">{t("dashboard.welcome")}</p>
          </div>
          <Button onClick={() => onNavigate("schedule-form")} className="rounded-full shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            {t("dashboard.create_new")}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="cursor-pointer hover:bg-accent/50 transition-colors rounded-xl shadow-sm"
              onClick={() => onNavigate(stat.view)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("dashboard.todays_reminders")}</h2>
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <Card key={reminder.id} className="flex items-center justify-between p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${reminder.status === "active" ? "bg-primary/10 border border-primary/20" : "bg-muted border border-border"
                      }`}
                  >
                    {reminder.status === "active" ? (
                      <Clock className="h-5 w-5 text-primary" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-base">{reminder.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm text-muted-foreground">{reminder.time}</p>
                      <span className="text-sm text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">{reminder.type}</p>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-accent">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Seçenekler</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onSelect={() => onNavigate("schedules")} className="rounded-lg cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      {t("common.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive rounded-lg cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("common.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
