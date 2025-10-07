"use client"

import type React from "react"
import { useState, useMemo } from "react"
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
import { User, Users, Mail, MessageSquare, Phone, Play, Pause, Trash2, Pencil, PlusCircle, Bell } from "lucide-react"
import type { Reminder, View } from "@/types"
import EditReminderModal from "./edit-reminder-modal"
import CreateReminderModal from "./create-reminder-modal"

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
  const [filters, setFilters] = useState({ text: "", status: "all", type: "all", channel: "all" })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
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
    setSelectedReminder(reminder)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = (editedReminder: Reminder) => {
    onSave(editedReminder)
    setIsEditModalOpen(false)
    setSelectedReminder(null)
  }

  const confirmDelete = () => {
    if (deleteAlert.reminderId) {
      onDelete(deleteAlert.reminderId)
    }
    setDeleteAlert({ isOpen: false, reminderId: null })
  }

  const filteredReminders = useMemo(() => {
    return reminders.filter((r) => {
      const textMatch = r.title.toLowerCase().includes(filters.text.toLowerCase())
      const statusMatch = filters.status === "all" || r.status === filters.status
      const typeMatch = filters.type === "all" || r.type === filters.type
      const channelMatch = filters.channel === "all" || (r.channels || []).includes(filters.channel)
      return textMatch && statusMatch && typeMatch && channelMatch
    })
  }, [reminders, filters])

  return (
    <div className="space-y-4">
      {/* Compact Header with Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Header Card */}
        <Card className="lg:col-span-5 rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/20 shadow-md dark:shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Schedule Manager
                </h1>
                <p className="text-xs text-muted-foreground mt-1">Manage all your reminders</p>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                size="sm"
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-md rounded-full"
              >
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                New
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="lg:col-span-7 grid grid-cols-4 gap-3">
          <Card className="rounded-2xl border-2 border-indigo-200/60 dark:border-border/40 bg-gradient-to-br from-background to-indigo-50/30 dark:to-indigo-950/10 shadow-md dark:shadow-sm">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{filteredReminders.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-purple-200/60 dark:border-border/40 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/10 shadow-md dark:shadow-sm">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Scheduled</p>
                <p className="text-lg font-bold">{reminders.filter(r => r.status === "scheduled").length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-pink-200/60 dark:border-border/40 bg-gradient-to-br from-background to-pink-50/30 dark:to-pink-950/10 shadow-md dark:shadow-sm">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Sent</p>
                <p className="text-lg font-bold">{reminders.filter(r => r.status === "sent").length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-rose-200/60 dark:border-border/40 bg-gradient-to-br from-background to-rose-50/30 dark:to-rose-950/10 shadow-md dark:shadow-sm">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Paused</p>
                <p className="text-lg font-bold">{reminders.filter(r => r.status === "paused").length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters & Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-3 rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
          <CardHeader className="pb-3 px-4 pt-4">
            <h3 className="text-sm font-semibold">Filters</h3>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Search</label>
              <Input
                placeholder="Search by title..."
                value={filters.text}
                onChange={(e) => handleFilterChange("text", e.target.value)}
                className="rounded-xl h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
              <Select value={filters.status} onValueChange={(v) => handleFilterChange("status", v)}>
                <SelectTrigger className="rounded-xl h-9 text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
              <Select value={filters.type} onValueChange={(v) => handleFilterChange("type", v)}>
                <SelectTrigger className="rounded-xl h-9 text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Channel</label>
              <Select value={filters.channel} onValueChange={(v) => handleFilterChange("channel", v)}>
                <SelectTrigger className="rounded-xl h-9 text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ text: "", status: "all", type: "all", channel: "all" })}
              className="w-full rounded-xl h-9 text-xs mt-2"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>

        {/* Reminders List */}
        <Card className="lg:col-span-9 rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
          <CardHeader className="pb-3 px-4 pt-4 border-b border-border/40">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Reminders ({filteredReminders.length})
              </h3>
              <div className="text-xs text-muted-foreground">
                Showing {filteredReminders.length} of {reminders.length}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2.5">
              {filteredReminders.length > 0 ? (
                filteredReminders.map((reminder) => {
                  const TargetIcon = reminder.type === "group" ? Users : User
                  const isActionable = reminder.status === "scheduled" || reminder.status === "paused"
                  return (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-indigo-200/50 dark:border-border/40 bg-gradient-to-br from-background to-accent/10 p-3 hover:shadow-sm hover:border-indigo-200/70 dark:hover:border-border/60 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/40 dark:border-indigo-500/20 shrink-0">
                          <TargetIcon className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate text-sm">{reminder.title}</p>
                            <Badge
                              variant={reminder.status === "scheduled" ? "default" : "outline"}
                              className={`text-[10px] h-5 ${
                                reminder.status === "scheduled"
                                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0"
                                  : ""
                              }`}
                            >
                              {reminder.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground truncate">
                              {reminder.type === "group" ? reminder.group?.name : reminder.contact?.name}
                            </p>
                            <span className="text-xs text-muted-foreground">•</span>
                            <p className="text-xs text-muted-foreground">
                              {new Date(reminder.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <div className="flex gap-1 ml-1">
                              {(reminder.channels || []).slice(0, 3).map((channel) => {
                                const Icon = channelIcons[channel]
                                return Icon ? (
                                  <div
                                    key={channel}
                                    className="p-0.5 rounded bg-purple-500/10"
                                    title={channel}
                                  >
                                    <Icon className="h-2.5 w-2.5 text-purple-500" />
                                  </div>
                                ) : null
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleStatus(reminder.id)}
                          disabled={!isActionable}
                          title={reminder.status === "paused" ? "Resume" : "Pause"}
                          className="h-7 w-7 rounded-full hover:bg-accent"
                        >
                          {reminder.status === "paused" ? (
                            <Play className="h-3 w-3" />
                          ) : (
                            <Pause className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(reminder)}
                          title="Edit"
                          className="h-7 w-7 rounded-full hover:bg-accent"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteAlert({ isOpen: true, reminderId: reminder.id })}
                          className="h-7 w-7 rounded-full text-pink-500 hover:bg-pink-500/10 hover:text-pink-600"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto p-3 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 w-14 h-14 flex items-center justify-center mb-3">
                    <Bell className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold">No reminders found</p>
                  <p className="text-xs text-muted-foreground mt-1">Adjust filters or create a new reminder</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals and Dialogs */}
      {selectedReminder && (
        <EditReminderModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          reminder={selectedReminder}
          onSave={handleSaveEdit}
        />
      )}
      <CreateReminderModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSave={onSave} />

      <AlertDialog open={deleteAlert.isOpen} onOpenChange={(open) => setDeleteAlert({ ...deleteAlert, isOpen: open })}>
        <AlertDialogContent className="rounded-2xl border border-border/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This action cannot be undone. This reminder will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAlert({ isOpen: false, reminderId: null })} className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 rounded-full">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
