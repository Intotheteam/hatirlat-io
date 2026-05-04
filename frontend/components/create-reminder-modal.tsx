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
import { Bell, Users, Mail, MessageSquare, Phone, UserIcon, Calendar, Clock, Repeat, Sparkles, Lock } from "lucide-react"
import type { Reminder, CustomRepeatConfig, Group, Channel } from "@/types"
import { apiService } from "@/services/api/apiService"
import { apiManager } from "@/services/api/apiManager"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"

interface CreateReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (reminder: Omit<Reminder, "id">) => void
  /** Current count of group reminders (to show limit warning) */
  groupReminderCount?: number
}

const channelOptions: { id: Channel; label: string; icon: any }[] = [
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
  endDate: "",
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

export default function CreateReminderModal({ isOpen, onClose, onSave, groupReminderCount = 0 }: CreateReminderModalProps) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const isPremium = user?.premium ?? false
  const freeGroupLimit = 3
  const [formData, setFormData] = useState<Omit<Reminder, "id">>(initialFormData)
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
  const [groupChoice, setGroupChoice] = useState<"select" | "create">("select")
  const [newGroupName, setNewGroupName] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (formData.type === "group") {
        const fetchGroups = async () => {
          try {
            setIsLoadingGroups(true)
            const fetchedGroups = await apiManager.getGroups()
            setGroups(fetchedGroups)
          } catch (error) {
            toast.error(t("modals.groups_failed"))
          } finally {
            setIsLoadingGroups(false)
          }
        }
        fetchGroups()
      }

      // Set default dateTime to current local time, zeroing out seconds for datetime-local
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const formattedDateTime = now.toISOString().slice(0, 16);
      setFormData(prev => ({ ...prev, dateTime: formattedDateTime }));
    }
  }, [isOpen, formData.type])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      contact: {
        name: prev.contact?.name || "",
        phone: prev.contact?.phone || "",
        email: prev.contact?.email || "",
        [name]: value || ""
      } as Reminder["contact"],
    }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
  }

  const handleTypeChange = (value: "personal" | "group") => {
    setFormData((prev) => ({ ...prev, type: value }))
  }

  const handleChannelChange = (channelId: string) => {
    setFormData((prev) => {
      const channel = channelId as Channel
      const newChannels = prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel]
      return { ...prev, channels: newChannels }
    })
    if (errors.channels) setErrors(prev => ({ ...prev, channels: "" }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Frontend validation
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Başlık zorunludur"
    if (!formData.dateTime) newErrors.dateTime = "Tarih ve saat zorunludur"
    if (!formData.message.trim()) newErrors.message = "Mesaj zorunludur"
    if (formData.repeat !== "none" && formData.endDate && formData.dateTime &&
        new Date(formData.endDate) <= new Date(formData.dateTime)) {
      newErrors.endDate = "Bitiş tarihi başlangıçtan sonra olmalıdır"
    }

    if (formData.channels.length === 0) {
      newErrors.channels = "En az bir bildirim kanalı seçilmelidir"
    }

    if (formData.type === "personal") {
      if (!formData.contact?.name?.trim()) newErrors.name = "Kişi adı zorunludur"
      if (formData.channels.includes("email") && !formData.contact?.email?.trim()) {
        newErrors.email = "E-posta kanalı için e-posta adresi zorunludur"
      }
      if ((formData.channels.includes("sms") || formData.channels.includes("whatsapp")) && !formData.contact?.phone?.trim()) {
        newErrors.phone = "SMS / WhatsApp için telefon zorunludur"
      }
    } else {
      if (groupChoice === "select" && (!formData.group || !formData.group.id)) {
        newErrors.group = "Lütfen listeden bir grup seçin"
      }
      if (groupChoice === "create" && !newGroupName.trim()) {
        newErrors.newGroupName = "Yeni grup adı zorunludur"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error(t("modals.fix_errors"))
      return
    }

    const finalData: Omit<Reminder, "id"> = { ...formData }

    // Normalize dateTime: backend expects "yyyy-MM-dd'T'HH:mm:ss" (with seconds)
    if (finalData.dateTime && !finalData.dateTime.match(/T\d{2}:\d{2}:\d{2}$/)) {
      finalData.dateTime = finalData.dateTime + ":00"
    }
    if (finalData.endDate && !finalData.endDate.match(/T\d{2}:\d{2}:\d{2}$/)) {
      finalData.endDate = finalData.endDate + ":00"
    }
    // Drop endDate when one-time
    if (formData.repeat === "none") {
      finalData.endDate = undefined
    }

    if (formData.type === "personal") {
      finalData.group = null
    } else {
      finalData.contact = null
      if (groupChoice === "create" && newGroupName.trim()) {
        // Create the group first, then use its real ID
        try {
          const createdGroup = await apiManager.createGroup({ name: newGroupName.trim() })
          finalData.group = { id: createdGroup.id, name: createdGroup.name }
        } catch {
          toast.error("Grup oluşturulamadı. Lütfen tekrar deneyin.")
          return
        }
      }
    }

    onSave(finalData)
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const formattedDateTime = now.toISOString().slice(0, 16);
    setFormData({ ...initialFormData, dateTime: formattedDateTime })
    setNewGroupName("")
    setGroupChoice("select")
    setErrors({})
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
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-foreground">
              {t("modals.create_title")}
            </span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1 ml-12">{t("modals.time_period_desc")}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-3">
          {/* Basic Information Section */}
          <div className="space-y-3.5">
            <div>
              <Label htmlFor="title" className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Bell className="h-3.5 w-3.5 text-primary" />
                {t("modals.title_label")}
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`rounded-xl h-10 transition-colors text-sm ${errors.title ? "border-destructive focus-visible:ring-destructive" : "border-border"}`}
                placeholder={t("modals.title_placeholder")}
                required
              />
              {errors.title && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.title}</p>}
            </div>

            <div>
              <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <UserIcon className="h-3.5 w-3.5 text-primary" />
                {t("modals.type_label")}
              </Label>
              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  type="button"
                  variant={formData.type === "personal" ? "default" : "outline"}
                  onClick={() => handleTypeChange("personal")}
                  className={`h-10 flex justify-center items-center gap-1.5 rounded-xl transition-all text-sm ${formData.type === "personal" ? "shadow-md" : "hover:bg-accent"
                    }`}
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="font-medium">{t("dashboard.personal")}</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.type === "group" ? "default" : "outline"}
                  onClick={() => handleTypeChange("group")}
                  className={`h-10 flex justify-center items-center gap-1.5 rounded-xl transition-all text-sm ${formData.type === "group" ? "shadow-md" : "hover:bg-accent"
                    }`}
                >
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{t("dashboard.group")}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Notification Channels Section */}
          <div className="p-4 rounded-xl bg-accent/20 border border-border">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-3">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              {t("modals.channel_label")}
            </Label>
            <div className="grid grid-cols-3 gap-2 border-0">
              {channelOptions.map(({ id, label, icon: Icon }) => (
                <label
                  key={id}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 border-2 rounded-xl cursor-pointer transition-all ${formData.channels.includes(id)
                    ? "border-primary bg-primary/5 shadow-sm"
                    : errors.channels
                      ? "border-destructive/50 hover:border-destructive hover:bg-destructive/5"
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                    }`}
                >
                  <Checkbox
                    id={`create-channel-${id}`}
                    checked={formData.channels.includes(id)}
                    onCheckedChange={() => handleChannelChange(id)}
                    className="hidden"
                  />
                  <Icon className={`h-4 w-4 ${formData.channels.includes(id) ? "text-primary" : errors.channels ? "text-destructive" : "text-muted-foreground"}`} />
                  <span className={`text-xs font-medium ${formData.channels.includes(id) ? "text-primary" : errors.channels ? "text-destructive" : ""}`}>{label}</span>
                </label>
              ))}
            </div>
            {errors.channels && <p className="text-xs text-destructive mt-2 font-medium">{errors.channels}</p>}
          </div>

          {/* Recipient Section */}
          {formData.type === "personal" ? (
            <div className={`p-4 rounded-xl border space-y-3 ${errors.name || errors.email || errors.phone ? "border-destructive/50 bg-destructive/5" : "bg-accent/20 border-border"}`}>
              <Label className="text-sm font-semibold text-foreground">{t("modals.contact_info")}</Label>
              <div>
                <Input
                  name="name"
                  placeholder={t("modals.contact_name_placeholder")}
                  value={formData.contact?.name || ""}
                  onChange={handleContactChange}
                  required
                  className={`rounded-xl h-10 text-sm ${errors.name ? "border-destructive focus-visible:ring-destructive" : "border-border"}`}
                />
                {errors.name && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.name}</p>}
              </div>

              {showEmailField && (
                <div>
                  <Input
                    name="email"
                    type="email"
                    placeholder="eposta@ornek.com"
                    value={formData.contact?.email || ""}
                    onChange={handleContactChange}
                    required
                    className={`rounded-xl h-10 text-sm ${errors.email ? "border-destructive focus-visible:ring-destructive" : "border-border"}`}
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
                    value={formData.contact?.phone || ""}
                    onChange={handleContactChange}
                    required
                    className={`rounded-xl h-10 text-sm ${errors.phone ? "border-destructive focus-visible:ring-destructive" : "border-border"}`}
                  />
                  {errors.phone && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.phone}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className={`p-4 rounded-xl border space-y-3 ${errors.group || errors.newGroupName ? "border-destructive/50 bg-destructive/5" : "bg-accent/20 border-border"}`}>
              <Label className="text-sm font-semibold text-foreground">{t("modals.select_group")}</Label>
              <RadioGroup
                value={groupChoice}
                onValueChange={(v) => setGroupChoice(v as "select" | "create")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="select" id="select-group" className="h-4 w-4" />
                  <Label htmlFor="select-group" className="text-sm font-medium cursor-pointer">{t("modals.select_existing_group")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="create" id="create-group" className="h-4 w-4" />
                  <Label htmlFor="create-group" className="text-sm font-medium cursor-pointer">{t("modals.create_new_group")}</Label>
                </div>
              </RadioGroup>

              {groupChoice === "select" ? (
                <div>
                  {!isLoadingGroups && groups.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-500/30 text-amber-700 dark:text-amber-400">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <p className="text-xs font-medium">Seçilebilecek bir grup yok. Önce grup oluşturun veya aşağıdan yeni grup adı girerek devam edin.</p>
                    </div>
                  ) : (
                    <div>
                      <Select
                        onValueChange={(val) => {
                          handleGroupSelectChange(val)
                          if (errors.group) setErrors(prev => ({ ...prev, group: "" }))
                        }}
                        value={formData.group?.id || ""}
                        disabled={isLoadingGroups}
                      >
                        <SelectTrigger className={`rounded-xl h-10 text-sm ${errors.group ? "border-destructive focus:ring-destructive" : "border-border"}`}>
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
                </div>
              ) : (
                <div>
                  <Input
                    id="new-group-name"
                    placeholder={t("modals.new_group_name_placeholder")}
                    value={newGroupName}
                    onChange={(e) => {
                      setNewGroupName(e.target.value)
                      if (errors.newGroupName) setErrors(prev => ({ ...prev, newGroupName: "" }))
                    }}
                    className={`rounded-xl h-10 text-sm ${errors.newGroupName ? "border-destructive focus-visible:ring-destructive" : "border-border"}`}
                  />
                  {errors.newGroupName && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.newGroupName}</p>}
                </div>
              )}
            </div>
          )}

          {/* Free tier group reminder limit warning */}
          {formData.type === "group" && !isPremium && (
            <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium ${groupReminderCount >= freeGroupLimit
                ? "bg-destructive/10 border-destructive/40 text-destructive"
                : "bg-amber-50 dark:bg-amber-950/20 border-amber-300/50 text-amber-700 dark:text-amber-400"
              }`}>
              {groupReminderCount >= freeGroupLimit ? (
                <>
                  <Lock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>Ücretsiz planda maksimum <strong>{freeGroupLimit}</strong> grup hatırlatıcısı oluşturabilirsiniz. Premium'a geçin.</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>Ücretsiz plan: <strong>{groupReminderCount}/{freeGroupLimit}</strong> grup hatırlatıcısı kullandınız. Saatlik tekrar ve sınırsız erişim için Premium'a geçin.</span>
                </>
              )}
            </div>
          )}

          {/* Message Section */}
          <div>
            <Label htmlFor="message" className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              {t("modals.msg_label")}
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className={`rounded-xl min-h-[90px] resize-none text-sm ${errors.message ? "border-destructive focus-visible:ring-destructive" : "border-border"}`}
              placeholder={t("modals.msg_placeholder")}
              required
            />
            {errors.message && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.message}</p>}
          </div>

          {/* Schedule Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="datetime" className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {t("modals.datetime_label")}
              </Label>
              <Input
                id="datetime"
                name="dateTime"
                type="datetime-local"
                value={formData.dateTime}
                onChange={handleInputChange}
                className={`rounded-xl h-10 text-sm ${errors.dateTime ? "border-destructive focus-visible:ring-destructive" : "border-border"}`}
                required
              />
              {errors.dateTime && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.dateTime}</p>}
            </div>

            <div>
              <Label htmlFor="repeat" className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Repeat className="h-3.5 w-3.5 text-primary" />
                {t("modals.repeat_label")}
              </Label>
              {/* Repeat frequency select with premium gates */}
              <Select value={formData.repeat} onValueChange={handleRepeatChange}>
                <SelectTrigger id="repeat" className="rounded-xl h-10 border-border text-sm">
                  <SelectValue placeholder={t("modals.select_frequency")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("modals.frequency_none")}</SelectItem>
                  {/* HOURLY — Premium only */}
                  <SelectItem
                    value="hourly"
                    disabled={!isPremium}
                    className={!isPremium ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <span className="flex items-center gap-1.5">
                      {t("modals.frequency_hourly")}
                      {!isPremium && (
                        <span className="ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                          PREMIUM
                        </span>
                      )}
                    </span>
                  </SelectItem>
                  <SelectItem value="daily">{t("modals.frequency_daily")}</SelectItem>
                  <SelectItem value="weekly">{t("modals.frequency_weekly")}</SelectItem>
                  <SelectItem value="custom">{t("modals.frequency_custom")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* End Date — only for recurring reminders */}
          {formData.repeat !== "none" && (
            <div>
              <Label htmlFor="endDate" className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Bitiş Tarihi <span className="text-xs font-normal text-muted-foreground">(opsiyonel)</span>
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={formData.endDate || ""}
                onChange={handleInputChange}
                min={formData.dateTime}
                className={`rounded-xl h-10 text-sm ${errors.endDate ? "border-destructive focus-visible:ring-destructive" : "border-border"}`}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Bu tarihten sonra tekrarlama durur. Boş bırakırsanız süresiz tekrar eder.
              </p>
              {errors.endDate && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.endDate}</p>}
            </div>
          )}

          {/* Custom Repeat Section */}
          {formData.repeat === "custom" && (
            <div className="p-4 rounded-xl bg-accent/20 border border-border space-y-3">
              <Label className="text-sm font-semibold text-foreground">{t("modals.custom_repeat_settings")}</Label>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground">{t("modals.every")}</span>
                <Input
                  type="number"
                  className="w-16 h-10 rounded-xl border-border text-sm"
                  value={formData.customRepeat?.interval || 1}
                  onChange={(e) => handleCustomRepeatChange("interval", e.target.value)}
                  min={1}
                />
                <Select
                  value={formData.customRepeat?.frequency || "week"}
                  onValueChange={(value: "day" | "week" | "month") => handleCustomRepeatChange("frequency", value)}
                >
                  <SelectTrigger className="w-28 h-10 rounded-xl border-border text-sm">
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
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">{t("modals.on_days")}</Label>
                  <ToggleGroup
                    type="multiple"
                    variant="outline"
                    className="justify-start flex-wrap gap-2"
                    value={formData.customRepeat?.daysOfWeek || []}
                    onValueChange={(days) => handleCustomRepeatChange("daysOfWeek", days)}
                  >
                    {weekDays.map((day) => (
                      <ToggleGroupItem
                        key={day.value}
                        value={day.value}
                        className="h-9 px-3 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-xs"
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

        <DialogFooter className="gap-2 pt-3 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-full h-10 px-6 hover:bg-accent text-sm font-medium"
          >
            {t("modals.cancel_btn")}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={formData.type === "group" && groupChoice === "select" && !isLoadingGroups && groups.length === 0}
            className="rounded-full h-10 px-8 font-semibold transition-all text-sm shadow-md"
          >
            {t("modals.create_btn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
