"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Bell, Users, MoreHorizontal, Edit, Trash2, CheckCircle, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import EditReminderModal from "./edit-reminder-modal"
import { useState } from "react"
import type { View } from "@/app/page"

interface RemindersDashboardProps {
  onNavigate: (view: View, groupId?: string) => void
}

export default function RemindersDashboard({ onNavigate }: RemindersDashboardProps) {
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  // Dummy data for demonstration
  const reminders = [
    { id: "1", title: "Team Meeting", time: "10:00 AM", type: "Group", status: "active" },
    { id: "2", title: "Doctor's Appointment", time: "2:30 PM", type: "Personal", status: "completed" },
    { id: "3", title: "Submit Project Proposal", time: "4:00 PM", type: "Personal", status: "active" },
  ]

  const stats = [
    { title: "Total Reminders", value: "12", icon: Bell, view: "scheduled" as View },
    { title: "Active", value: "8", icon: Clock, view: "scheduled" as View },
    { title: "Completed", value: "4", icon: CheckCircle, view: "scheduled" as View },
    { title: "Groups", value: "3", icon: Users, view: "groups" as View },
  ]

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Welcome back, here's your summary.</p>
          </div>
          <Button onClick={() => onNavigate("schedule")}>
            <Plus className="mr-2 h-4 w-4" />
            New Reminder
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="cursor-pointer hover:bg-accent transition-colors"
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
          <h2 className="text-2xl font-semibold">Today's Reminders</h2>
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <Card key={reminder.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      reminder.status === "active" ? "bg-teal-100 dark:bg-teal-900/20" : "bg-secondary/10"
                    }`}
                  >
                    {reminder.status === "active" ? (
                      <Clock className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{reminder.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {reminder.time} - {reminder.type}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setEditModalOpen(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Card>
            ))}
          </div>
        </div>
      </div>
      {isEditModalOpen && (
        <EditReminderModal
          reminder={{
            id: "1",
            title: "Team Meeting",
            message: "Discuss Q3 goals.",
            type: "group",
            status: "scheduled",
            dateTime: new Date().toISOString(),
            contact: { name: "", phone: "", email: "" },
            group: { id: "2", name: "Work Team" },
            channels: ["email"],
            repeat: "none",
          }}
          onClose={() => setEditModalOpen(false)}
          onSave={() => setEditModalOpen(false)}
        />
      )}
    </>
  )
}
