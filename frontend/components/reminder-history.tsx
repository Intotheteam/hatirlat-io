"use client"

import { useState } from "react"
import { Clock, CheckCircle, XCircle, MessageSquare, Mail, Phone, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReminderHistoryItem {
  id: string
  title: string
  message: string
  scheduledTime: string
  sentTime?: string
  status: "sent" | "failed" | "pending"
  channel: "sms" | "email" | "whatsapp"
  recipient: string
}

export default function ReminderHistory() {
  const [filter, setFilter] = useState<"all" | "sent" | "failed" | "pending">("all")

  // Mock data
  const [reminders] = useState<ReminderHistoryItem[]>([
    {
      id: "1",
      title: "Doctor Appointment",
      message: "Don't forget your appointment with Dr. Smith at 2 PM",
      scheduledTime: "2024-01-20T14:00:00",
      sentTime: "2024-01-20T13:45:00",
      status: "sent",
      channel: "sms",
      recipient: "+90 555 123 4567",
    },
    {
      id: "2",
      title: "Meeting Reminder",
      message: "Team meeting in conference room A",
      scheduledTime: "2024-01-19T10:00:00",
      sentTime: "2024-01-19T09:45:00",
      status: "sent",
      channel: "email",
      recipient: "john@example.com",
    },
    {
      id: "3",
      title: "Medication",
      message: "Time to take your evening medication",
      scheduledTime: "2024-01-18T20:00:00",
      status: "failed",
      channel: "whatsapp",
      recipient: "+90 555 987 6543",
    },
    {
      id: "4",
      title: "Bill Payment",
      message: "Your electricity bill is due tomorrow",
      scheduledTime: "2024-01-25T09:00:00",
      status: "pending",
      channel: "sms",
      recipient: "+90 555 123 4567",
    },
    {
      id: "5",
      title: "Birthday Reminder",
      message: "It's Sarah's birthday today!",
      scheduledTime: "2024-01-17T08:00:00",
      sentTime: "2024-01-17T08:00:00",
      status: "sent",
      channel: "whatsapp",
      recipient: "+90 555 456 7890",
    },
  ])

  const filteredReminders = reminders.filter((reminder) => filter === "all" || reminder.status === filter)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "sms":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusCounts = () => {
    return {
      total: reminders.length,
      sent: reminders.filter((r) => r.status === "sent").length,
      failed: reminders.filter((r) => r.status === "failed").length,
      pending: reminders.filter((r) => r.status === "pending").length,
    }
  }

  const counts = getStatusCounts()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reminder History</h2>
          <p className="text-gray-600 dark:text-gray-300">Track your sent and scheduled notifications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
              <SelectItem value="all" className="dark:text-white">
                All
              </SelectItem>
              <SelectItem value="sent" className="dark:text-white">
                Sent
              </SelectItem>
              <SelectItem value="failed" className="dark:text-white">
                Failed
              </SelectItem>
              <SelectItem value="pending" className="dark:text-white">
                Pending
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{counts.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{counts.sent}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Sent</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{counts.failed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Failed</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{counts.pending}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {filteredReminders.map((reminder) => (
          <Card key={reminder.id} className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(reminder.status)}
                    <h3 className="font-semibold text-gray-900 dark:text-white">{reminder.title}</h3>
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                      {getChannelIcon(reminder.channel)}
                      <span className="text-xs uppercase">{reminder.channel}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-3">{reminder.message}</p>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 dark:text-gray-400 space-y-1 sm:space-y-0">
                    <div>
                      <span className="font-medium">Scheduled:</span> {formatDateTime(reminder.scheduledTime)}
                    </div>
                    {reminder.sentTime && (
                      <div>
                        <span className="font-medium">Sent:</span> {formatDateTime(reminder.sentTime)}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">To:</span> {reminder.recipient}
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      reminder.status === "sent"
                        ? "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400"
                        : reminder.status === "failed"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    }`}
                  >
                    {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReminders.length === 0 && (
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Reminders Found</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {filter === "all" ? "You haven't created any reminders yet" : `No ${filter} reminders found`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
