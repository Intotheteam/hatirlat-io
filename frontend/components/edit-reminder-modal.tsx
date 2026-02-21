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
import { useLanguage } from "@/contexts/LanguageContext"

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
  const { t } = useLanguage()
  const [formData, setFormData] = useState<Reminder | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
          const response = await apiService.get("/groups")
          setGroups((response as Group[]) || [])
        } catch (error) {
          toast.error(t("modals.groups_failed"))
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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return
    const { name, value } = e.target
    setFormData((prev) => (prev ? { ...prev, contact: { ...prev.contact, [name]: value } as Reminder["contact"] } : null))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
  }

  const handleTypeChange = (value: "personal" | "group") => {
    if (!formData) return
    setFormData((prev) => (prev ? { ...prev, type: value } : null))
  }

  const handleChannelChange = (channelId: string) => {
    if (!formData) return
    setFormData((prev) => {
      if (!prev) return null
      const channel = channelId as "email" | "sms" | "whatsapp"
      const newChannels = prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel]
      return { ...prev, channels: newChannels }
    })
    if (errors.channels) setErrors(prev => ({ ...prev, channels: "" }))
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
    if (errors.group) setErrors(prev => ({ ...prev, group: "" }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData) {
      const newErrors: Record<string, string> = {}

      if (!formData.title?.trim()) newErrors.title = t("modals.validation_title")
      if (!formData.dateTime) newErrors.dateTime = t("modals.validation_datetime")
      if (!formData.message?.trim()) newErrors.message = t("modals.validation_message")

      if (!formData.channels || formData.channels.length === 0) {
        newErrors.channels = t("modals.validation_channels")
      }

      if (formData.type === "personal") {
        if (!formData.contact?.name?.trim()) newErrors.name = t("modals.validation_name")
        if (formData.channels?.includes("email") && !formData.contact?.email?.trim()) {
          newErrors.email = t("modals.validation_email")
        }
        if ((formData.channels?.includes("sms") || formData.channels?.includes("whatsapp")) && !formData.contact?.phone?.trim()) {
          newErrors.phone = t("modals.validation_phone")
        }
      } else {
        if (!formData.group || !formData.group.id) {
          newErrors.group = t("modals.validation_group")
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        toast.error(t("modals.fix_errors"))
        return
      }

      const finalData = { ...formData }
      // Normalize dateTime: backend expects "yyyy-MM-dd'T'HH:mm:ss" (with seconds)
      if (finalData.dateTime && !finalData.dateTime.match(/T\d{2}:\d{2}:\d{2}$/)) {
        finalData.dateTime = finalData.dateTime + ":00"
      }
      onSave(finalData)
      setErrors({})
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
              {t("common.edit")}
            </span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-5 py-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">{t("modals.title_label")}</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`mt-2 rounded-xl ${errors.title ? "border-destructive focus-visible:ring-destructive" : ""}`}
              placeholder={t("modals.title_placeholder")}
            />
            {errors.title && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.title}</p>}
          </div>

          <div>
            <Label className="text-sm font-medium">{t("modals.type_label")}</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                type="button"
                variant={formData.type === "personal" ? "default" : "outline"}
                onClick={() => handleTypeChange("personal")}
                className={`flex justify-center items-center gap-2 rounded-xl ${formData.type === "personal"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
                  : ""
                  }`}
              >
                <UserIcon className="h-4 w-4" /> {t("dashboard.personal")}
              </Button>
              <Button
                type="button"
                variant={formData.type === "group" ? "default" : "outline"}
                onClick={() => handleTypeChange("group")}
                className={`flex justify-center items-center gap-2 rounded-xl ${formData.type === "group"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                  : ""
                  }`}
              >
                <Users className="h-4 w-4" /> {t("dashboard.group")}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">{t("modals.channel_label")}</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {channelOptions.map(({ id, label, icon: Icon }) => (
                <label
                  key={id}
                  className={`flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${formData.channels.includes(id as any)
                    ? "border-indigo-500 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 shadow-sm"
                    : errors.channels
                      ? "border-destructive/50 hover:border-destructive hover:bg-destructive/5"
                      : "border-border hover:border-indigo-300 hover:bg-accent/50"
                    }`}
                >
                  <Checkbox
                    id={`edit-channel-${id}`}
                    checked={formData.channels.includes(id as any)}
                    onCheckedChange={() => handleChannelChange(id)}
                    className="hidden"
                  />
                  <Icon className={`h-4 w-4 ${formData.channels.includes(id as any) ? "text-indigo-500" : errors.channels ? "text-destructive" : ""}`} />
                  <span className={`text-sm font-medium ${errors.channels && !formData.channels.includes(id as any) ? "text-destructive" : ""}`}>{label}</span>
                </label>
              ))}
            </div>
            {errors.channels && <p className="text-xs text-destructive mt-2 font-medium">{errors.channels}</p>}
          </div>

          {formData.type === "personal" ? (
            <div className={`grid gap-3 p-4 border rounded-xl ${errors.name || errors.email || errors.phone ? "border-destructive/50 bg-destructive/5" : "border-indigo-200/50 dark:border-border/40 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20"}`}>
              <Label className="text-sm font-medium">{t("modals.contact_info")}</Label>
              <div>
                <Input
                  name="name"
                  placeholder={t("modals.contact_name_placeholder")}
                  value={formData.contact?.name ?? ""}
                  onChange={handleContactChange}
                  required
                  className={`rounded-xl ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.name && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.name}</p>}
              </div>
              {showEmailField && (
                <div>
                  <Input
                    name="email"
                    type="email"
                    placeholder="eposta@ornek.com"
                    value={formData.contact?.email ?? ""}
                    onChange={handleContactChange}
                    required
                    className={`rounded-xl ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.email}</p>}
                </div>
              )}
              {showPhoneField && (
                <div>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="+90 (555) 000-0000"
                    value={formData.contact?.phone ?? ""}
                    onChange={handleContactChange}
                    required
                    className={`rounded-xl ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {errors.phone && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.phone}</p>}
                </div>
              )}
            </div>
          ) : (
            <div>
              <Label htmlFor="group-select" className="text-sm font-medium">{t("modals.select_group")}</Label>
              <Select
                onValueChange={handleGroupSelectChange}
                value={formData.group?.id || ""}
                disabled={isLoadingGroups}
              >
                <SelectTrigger id="group-select" className={`mt-2 rounded-xl ${errors.group ? "border-destructive focus:ring-destructive" : ""}`}>
                  <SelectValue placeholder={isLoadingGroups ? t("modals.loading_groups") : t("modals.select_group_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.group && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.group}</p>}
            </div>
          )}

          <div>
            <Label htmlFor="message" className="text-sm font-medium">{t("modals.msg_label")}</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className={`mt-2 rounded-xl min-h-[100px] ${errors.message ? "border-destructive focus-visible:ring-destructive" : ""}`}
              placeholder={t("modals.msg_placeholder")}
            />
            {errors.message && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.message}</p>}
          </div>

          <div>
            <Label htmlFor="datetime" className="text-sm font-medium">{t("modals.datetime_label")}</Label>
            <Input
              id="datetime"
              name="dateTime"
              type="datetime-local"
              value={formatForDateTimeLocal(formData.dateTime)}
              onChange={handleInputChange}
              className={`mt-2 rounded-xl ${errors.dateTime ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.dateTime && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.dateTime}</p>}
          </div>

          <div>
            <Label htmlFor="repeat" className="text-sm font-medium">{t("modals.repeat_label")}</Label>
            <Select value={formData.repeat} onValueChange={handleRepeatChange}>
              <SelectTrigger id="repeat" className="mt-2 rounded-xl">
                <SelectValue placeholder={t("modals.select_frequency")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("modals.frequency_none")}</SelectItem>
                <SelectItem value="hourly">{t("modals.frequency_hourly")}</SelectItem>
                <SelectItem value="daily">{t("modals.frequency_daily")}</SelectItem>
                <SelectItem value="weekly">{t("modals.frequency_weekly")}</SelectItem>
                <SelectItem value="custom">{t("modals.frequency_custom")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.repeat === "custom" && (
            <div className="grid gap-4 p-4 border border-purple-200/50 dark:border-border/40 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
              <div className="flex items-center gap-2">
                <span className="text-sm">{t("modals.every")}</span>
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
                    <SelectItem value="day">{t("modals.day")}</SelectItem>
                    <SelectItem value="week">{t("modals.week")}</SelectItem>
                    <SelectItem value="month">{t("modals.month")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.customRepeat?.frequency === "week" && (
                <div>
                  <Label className="text-sm">{t("modals.on_days")}</Label>
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
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg rounded-full"
            >
              {t("modals.save_changes_btn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
