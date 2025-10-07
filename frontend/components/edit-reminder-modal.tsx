"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Bell, Users, Mail, MessageSquare, Phone, UserIcon } from "lucide-react"
import type { Reminder, CustomRepeatConfig, Group } from "@/types"
import { apiService } from "@/services/api/apiService"
import { toast } from "sonner"

interface EditReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (reminder: Reminder) => void
  reminder: Reminder | null
}

const channelOptions = [
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "SMS", icon: Phone },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
]

const weekDays = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
]

// Helper function to format date string for datetime-local input
const formatForDateTimeLocal = (dateString: string): string => {
  if (!dateString) {
    return ""
  }
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    // Return empty string if date is invalid
    return ""
  }

  // Get local date components
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function EditReminderModal({ isOpen, onClose, onSave, reminder }: EditReminderModalProps) {
  const [formData, setFormData] = useState<Reminder | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)

  useEffect(() => {
    if (reminder) {
      const initialChannels = reminder.channels || (reminder.channel ? [reminder.channel] : [])
      const initialRepeat = reminder.repeat || "none"
      const initialCustomRepeat = reminder.customRepeat || {
        interval: 1,
        frequency: "week",
        daysOfWeek: [],
      }
      setFormData({ ...reminder, channels: initialChannels, repeat: initialRepeat, customRepeat: initialCustomRepeat })
    }
  }, [reminder])

  useEffect(() => {
    if (isOpen && formData?.type === "group") {
      const fetchGroups = async () => {
        setIsLoadingGroups(true)
        try {
          const fetchedGroups = await apiService.get<Group[]>("/groups")
          setGroups(fetchedGroups || [])
        } catch (error) {
          toast.error("Gruplar yüklenemedi.")
        } finally {
          setIsLoadingGroups(false)
        }
      }
      fetchGroups()
    }
  }, [isOpen, formData?.type])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return
    const { name, value } = e.target
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return
    const { name, value } = e.target
    setFormData((prev) => (prev ? { ...prev, contact: { ...prev.contact, [name]: value } } : null))
  }

  const handleTypeChange = (value: "personal" | "group") => {
    if (!formData) return
    setFormData((prev) => (prev ? { ...prev, type: value } : null))
  }

  const handleChannelChange = (channelId: string) => {
    if (!formData) return
    setFormData((prev) => {
      if (!prev) return null
      const newChannels = prev.channels.includes(channelId)
        ? prev.channels.filter((c) => c !== channelId)
        : [...prev.channels, channelId]
      return { ...prev, channels: newChannels }
    })
  }

  const handleRepeatChange = (value: Reminder["repeat"]) => {
    if (!formData) return
    setFormData((prev) => (prev ? { ...prev, repeat: value } : null))
  }

  const handleCustomRepeatChange = (field: keyof CustomRepeatConfig, value: any) => {
    if (!formData) return
    setFormData((prev) => {
      if (!prev) return null
      return {
        ...prev,
        customRepeat: {
          ...prev.customRepeat!,
          [field]: field === "interval" ? Number.parseInt(value, 10) || 1 : value,
        },
      }
    })
  }

  const handleGroupSelectChange = (groupId: string) => {
    if (!formData) return
    const selectedGroup = groups.find((g) => g.id === groupId)
    if (selectedGroup) {
      setFormData((prev) => (prev ? { ...prev, group: { id: selectedGroup.id, name: selectedGroup.name } } : null))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData) {
      onSave(formData)
    }
    onClose()
  }

  const showEmailField = useMemo(() => formData?.channels.includes("email"), [formData?.channels])
  const showPhoneField = useMemo(
    () => formData?.channels.includes("sms") || formData?.channels.includes("whatsapp"),
    [formData?.channels],
  )

  if (!isOpen || !formData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] bg-gradient-to-br from-background to-accent/5 rounded-2xl border-2 border-border/60 dark:border-border/40 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-500/20">
              <Bell className="h-5 w-5 text-indigo-500" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Edit Reminder
            </span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-5 py-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">Reminder Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-2 rounded-xl"
              placeholder="Enter reminder title"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Reminder Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                type="button"
                variant={formData.type === "personal" ? "default" : "outline"}
                onClick={() => handleTypeChange("personal")}
                className={`flex justify-center items-center gap-2 rounded-xl ${
                  formData.type === "personal"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
                    : ""
                }`}
              >
                <UserIcon className="h-4 w-4" /> Personal
              </Button>
              <Button
                type="button"
                variant={formData.type === "group" ? "default" : "outline"}
                onClick={() => handleTypeChange("group")}
                className={`flex justify-center items-center gap-2 rounded-xl ${
                  formData.type === "group"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                    : ""
                }`}
              >
                <Users className="h-4 w-4" /> Group
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Notification Channel(s)</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {channelOptions.map(({ id, label, icon: Icon }) => (
                <label
                  key={id}
                  className={`flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
                    formData.channels.includes(id)
                      ? "border-indigo-500 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 shadow-sm"
                      : "border-border hover:border-indigo-300 hover:bg-accent/50"
                  }`}
                >
                  <Checkbox
                    id={`edit-channel-${id}`}
                    checked={formData.channels.includes(id)}
                    onCheckedChange={() => handleChannelChange(id)}
                    className="hidden"
                  />
                  <Icon className={`h-4 w-4 ${formData.channels.includes(id) ? "text-indigo-500" : ""}`} />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.type === "personal" ? (
            <div className="grid gap-3 p-4 border border-indigo-200/50 dark:border-border/40 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
              <Label className="text-sm font-medium">Contact Information</Label>
              <Input
                name="name"
                placeholder="Contact Name"
                value={formData.contact.name}
                onChange={handleContactChange}
                required
                className="rounded-xl"
              />
              {showEmailField && (
                <Input
                  name="email"
                  type="email"
                  placeholder="Contact Email"
                  value={formData.contact.email}
                  onChange={handleContactChange}
                  required
                  className="rounded-xl"
                />
              )}
              {showPhoneField && (
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Contact Phone"
                  value={formData.contact.phone}
                  onChange={handleContactChange}
                  required
                  className="rounded-xl"
                />
              )}
            </div>
          ) : (
            <div>
              <Label htmlFor="group-select" className="text-sm font-medium">Group</Label>
              <Select
                onValueChange={handleGroupSelectChange}
                value={formData.group?.id || ""}
                disabled={isLoadingGroups}
              >
                <SelectTrigger id="group-select" className="mt-2 rounded-xl">
                  <SelectValue placeholder={isLoadingGroups ? "Loading groups..." : "Select a group"} />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="message" className="text-sm font-medium">Message</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className="mt-2 rounded-xl min-h-[100px]"
              placeholder="Enter your reminder message"
            />
          </div>

          <div>
            <Label htmlFor="datetime" className="text-sm font-medium">Date and Time</Label>
            <Input
              id="datetime"
              name="dateTime"
              type="datetime-local"
              value={formatForDateTimeLocal(formData.dateTime)}
              onChange={handleInputChange}
              className="mt-2 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="repeat" className="text-sm font-medium">Repeat</Label>
            <Select value={formData.repeat} onValueChange={handleRepeatChange}>
              <SelectTrigger id="repeat" className="mt-2 rounded-xl">
                <SelectValue placeholder="Select repeat frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.repeat === "custom" && (
            <div className="grid gap-4 p-4 border border-purple-200/50 dark:border-border/40 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
              <div className="flex items-center gap-2">
                <span className="text-sm">Repeat every</span>
                <Input
                  type="number"
                  className="w-16"
                  value={formData.customRepeat?.interval || 1}
                  onChange={(e) => handleCustomRepeatChange("interval", e.target.value)}
                  min={1}
                />
                <Select
                  value={formData.customRepeat?.frequency || "week"}
                  onValueChange={(value: "day" | "week" | "month") => handleCustomRepeatChange("frequency", value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day(s)</SelectItem>
                    <SelectItem value="week">Week(s)</SelectItem>
                    <SelectItem value="month">Month(s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.customRepeat?.frequency === "week" && (
                <div>
                  <Label className="text-sm">On days</Label>
                  <ToggleGroup
                    type="multiple"
                    variant="outline"
                    className="mt-2 justify-start flex-wrap gap-1"
                    value={formData.customRepeat?.daysOfWeek || []}
                    onValueChange={(days) => handleCustomRepeatChange("daysOfWeek", days)}
                  >
                    {weekDays.map((day) => (
                      <ToggleGroupItem key={day.value} value={day.value} className="h-8 px-2.5">
                        {day.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-full">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg rounded-full"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
