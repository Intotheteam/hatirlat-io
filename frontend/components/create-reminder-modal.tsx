"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Bell, Users, Mail, MessageSquare, Phone, UserIcon, Calendar, Clock, Repeat } from "lucide-react"
import type { Reminder, CustomRepeatConfig, Group } from "@/types"
import { apiService } from "@/services/api/apiService"
import { toast } from "sonner"

interface CreateReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (reminder: Omit<Reminder, "id">) => void
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

const initialFormData: Omit<Reminder, "id"> = {
  title: "",
  type: "personal",
  message: "",
  dateTime: "",
  status: "scheduled",
  contact: { name: "", phone: "", email: "" },
  group: { id: "", name: "" },
  channels: [],
  repeat: "none",
  customRepeat: {
    interval: 1,
    frequency: "week",
    daysOfWeek: [],
  },
}

export default function CreateReminderModal({ isOpen, onClose, onSave }: CreateReminderModalProps) {
  const [formData, setFormData] = useState<Omit<Reminder, "id">>(initialFormData)
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
  const [groupChoice, setGroupChoice] = useState<"select" | "create">("select")
  const [newGroupName, setNewGroupName] = useState("")

  useEffect(() => {
    if (isOpen && formData.type === "group") {
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
  }, [isOpen, formData.type])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [name]: value },
    }))
  }

  const handleTypeChange = (value: "personal" | "group") => {
    setFormData((prev) => ({ ...prev, type: value }))
  }

  const handleChannelChange = (channelId: string) => {
    setFormData((prev) => {
      const newChannels = prev.channels.includes(channelId)
        ? prev.channels.filter((c) => c !== channelId)
        : [...prev.channels, channelId]
      return { ...prev, channels: newChannels }
    })
  }

  const handleRepeatChange = (value: Reminder["repeat"]) => {
    setFormData((prev) => ({ ...prev, repeat: value }))
  }

  const handleCustomRepeatChange = (field: keyof CustomRepeatConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      customRepeat: {
        ...prev.customRepeat!,
        [field]: field === "interval" ? Number.parseInt(value, 10) || 1 : value,
      },
    }))
  }

  const handleGroupSelectChange = (groupId: string) => {
    const selectedGroup = groups.find((g) => g.id === groupId)
    if (selectedGroup) {
      setFormData((prev) => ({
        ...prev,
        group: { id: selectedGroup.id, name: selectedGroup.name },
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalData = { ...formData }
    if (formData.type === "group" && groupChoice === "create" && newGroupName) {
      finalData.group = { id: `new_${Date.now()}`, name: newGroupName }
    }
    onSave(finalData)
    setFormData(initialFormData)
    setNewGroupName("")
    setGroupChoice("select")
    onClose()
  }

  const showEmailField = useMemo(() => formData.channels.includes("email"), [formData.channels])
  const showPhoneField = useMemo(
    () => formData.channels.includes("sms") || formData.channels.includes("whatsapp"),
    [formData.channels],
  )

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] bg-gradient-to-br from-background via-background to-accent/5 rounded-2xl border-2 border-border/60 dark:border-border/40 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-border/40">
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-500/20">
              <Bell className="h-4 w-4 text-indigo-500" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
              Create New Reminder
            </span>
          </DialogTitle>
          <p className="text-[11px] text-muted-foreground mt-0.5 ml-[44px]">Set up a new reminder with your preferences</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-3">
          {/* Basic Information Section */}
          <div className="space-y-3.5">
            <div>
              <Label htmlFor="title" className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Bell className="h-3 w-3 text-indigo-500" />
                Reminder Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="rounded-xl h-9 border-border/60 dark:border-border/40 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors text-sm"
                placeholder="e.g., Team Meeting, Birthday Call"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <UserIcon className="h-3 w-3 text-purple-500" />
                Reminder Type
              </Label>
              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  type="button"
                  variant={formData.type === "personal" ? "default" : "outline"}
                  onClick={() => handleTypeChange("personal")}
                  className={`h-9 flex justify-center items-center gap-1.5 rounded-xl transition-all text-sm ${
                    formData.type === "personal"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-md"
                      : "border-border/60 dark:border-border/40 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20"
                  }`}
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span className="font-medium">Personal</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.type === "group" ? "default" : "outline"}
                  onClick={() => handleTypeChange("group")}
                  className={`h-9 flex justify-center items-center gap-1.5 rounded-xl transition-all text-sm ${
                    formData.type === "group"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md"
                      : "border-border/60 dark:border-border/40 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/20"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-medium">Group</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Notification Channels Section */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/20 border border-indigo-200/50 dark:border-border/40">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2.5">
              <MessageSquare className="h-3 w-3 text-pink-500" />
              Notification Channels
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {channelOptions.map(({ id, label, icon: Icon }) => (
                <label
                  key={id}
                  className={`flex flex-col items-center justify-center gap-1.5 p-2.5 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.channels.includes(id)
                      ? "border-indigo-500 dark:border-indigo-500 bg-gradient-to-br from-indigo-500/15 to-purple-500/15 dark:from-indigo-500/20 dark:to-purple-500/20 shadow-sm"
                      : "border-border/60 dark:border-border/40 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-accent/50"
                  }`}
                >
                  <Checkbox
                    id={`create-channel-${id}`}
                    checked={formData.channels.includes(id)}
                    onCheckedChange={() => handleChannelChange(id)}
                    className="hidden"
                  />
                  <Icon className={`h-4 w-4 ${formData.channels.includes(id) ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground"}`} />
                  <span className={`text-[11px] font-medium ${formData.channels.includes(id) ? "text-indigo-600 dark:text-indigo-400" : ""}`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Recipient Section */}
          {formData.type === "personal" ? (
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/50 dark:border-border/40 space-y-2.5">
              <Label className="text-xs font-semibold text-foreground">Contact Information</Label>
              <Input
                name="name"
                placeholder="Contact Name"
                value={formData.contact.name}
                onChange={handleContactChange}
                required
                className="rounded-xl h-9 border-border/60 dark:border-border/40 text-sm"
              />
              {showEmailField && (
                <Input
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.contact.email}
                  onChange={handleContactChange}
                  required
                  className="rounded-xl h-9 border-border/60 dark:border-border/40 text-sm"
                />
              )}
              {showPhoneField && (
                <Input
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.contact.phone}
                  onChange={handleContactChange}
                  required
                  className="rounded-xl h-9 border-border/60 dark:border-border/40 text-sm"
                />
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-border/40 space-y-3">
              <Label className="text-xs font-semibold text-foreground">Group Selection</Label>
              <RadioGroup
                value={groupChoice}
                onValueChange={(v) => setGroupChoice(v as "select" | "create")}
                className="flex gap-3"
              >
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem value="select" id="select-group" className="border-purple-500 h-4 w-4" />
                  <Label htmlFor="select-group" className="text-xs font-medium cursor-pointer">Select Existing</Label>
                </div>
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem value="create" id="create-group" className="border-pink-500 h-4 w-4" />
                  <Label htmlFor="create-group" className="text-xs font-medium cursor-pointer">Create New</Label>
                </div>
              </RadioGroup>

              {groupChoice === "select" ? (
                <Select
                  onValueChange={handleGroupSelectChange}
                  value={formData.group.id}
                  disabled={isLoadingGroups}
                >
                  <SelectTrigger className="rounded-xl h-9 border-border/60 dark:border-border/40 text-sm">
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
              ) : (
                <Input
                  id="new-group-name"
                  placeholder="e.g., Project Team, Family"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="rounded-xl h-9 border-border/60 dark:border-border/40 text-sm"
                />
              )}
            </div>
          )}

          {/* Message Section */}
          <div>
            <Label htmlFor="message" className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="h-3 w-3 text-indigo-500" />
              Message
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className="rounded-xl min-h-[85px] border-border/60 dark:border-border/40 focus:border-indigo-500 dark:focus:border-indigo-500 resize-none text-sm"
              placeholder="Enter the message to be sent with this reminder..."
              required
            />
          </div>

          {/* Schedule Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label htmlFor="datetime" className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Calendar className="h-3 w-3 text-purple-500" />
                Date & Time
              </Label>
              <Input
                id="datetime"
                name="dateTime"
                type="datetime-local"
                value={formData.dateTime}
                onChange={handleInputChange}
                className="rounded-xl h-9 border-border/60 dark:border-border/40 text-sm"
                required
              />
            </div>

            <div>
              <Label htmlFor="repeat" className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Repeat className="h-3 w-3 text-pink-500" />
                Repeat
              </Label>
              <Select value={formData.repeat} onValueChange={handleRepeatChange}>
                <SelectTrigger id="repeat" className="rounded-xl h-9 border-border/60 dark:border-border/40 text-sm">
                  <SelectValue placeholder="Select frequency" />
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
          </div>

          {/* Custom Repeat Section */}
          {formData.repeat === "custom" && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/50 dark:border-border/40 space-y-3">
              <Label className="text-xs font-semibold text-foreground">Custom Repeat Settings</Label>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Repeat every</span>
                <Input
                  type="number"
                  className="w-16 h-8 rounded-lg border-border/60 dark:border-border/40 text-sm"
                  value={formData.customRepeat?.interval || 1}
                  onChange={(e) => handleCustomRepeatChange("interval", e.target.value)}
                  min={1}
                />
                <Select
                  value={formData.customRepeat?.frequency || "week"}
                  onValueChange={(value: "day" | "week" | "month") => handleCustomRepeatChange("frequency", value)}
                >
                  <SelectTrigger className="w-28 h-8 rounded-lg border-border/60 dark:border-border/40 text-sm">
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
                  <Label className="text-[11px] font-medium text-muted-foreground mb-2 block">On days</Label>
                  <ToggleGroup
                    type="multiple"
                    variant="outline"
                    className="justify-start flex-wrap gap-1.5"
                    value={formData.customRepeat?.daysOfWeek || []}
                    onValueChange={(days) => handleCustomRepeatChange("daysOfWeek", days)}
                  >
                    {weekDays.map((day) => (
                      <ToggleGroupItem
                        key={day.value}
                        value={day.value}
                        className="h-8 px-2.5 rounded-lg data-[state=on]:bg-indigo-500 data-[state=on]:text-white text-xs"
                      >
                        {day.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              )}
            </div>
          )}
        </form>

        <DialogFooter className="gap-2 pt-3 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-full h-9 px-5 border-border/60 dark:border-border/40 hover:bg-accent text-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl rounded-full h-9 px-7 font-semibold transition-all text-sm"
          >
            Create Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
