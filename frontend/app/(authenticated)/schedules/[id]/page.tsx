"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { apiManager } from "@/services/api/apiManager"
import { toast } from "sonner"
import type { Reminder, CustomRepeatConfig, Group } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Badge } from "@/components/ui/badge"
import { Loader2, Bell, Users, Mail, MessageSquare, Phone, UserIcon, Calendar, Clock, Repeat, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react"

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

export default function EditReminderPage() {
    const { id } = useParams()
    const router = useRouter()
    const { t } = useLanguage()
    const { user } = useAuth()
    const isPremium = user?.premium ?? false

    const [formData, setFormData] = useState<Reminder | null>(null)
    const [groups, setGroups] = useState<Group[]>([])

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoadingGroups, setIsLoadingGroups] = useState(false)

    const [errors, setErrors] = useState<Record<string, string>>({})

    const [logs, setLogs] = useState<any[]>([])
    const [isLogsLoading, setIsLogsLoading] = useState(false)
    const [logsPage, setLogsPage] = useState(0)
    const [hasMoreLogs, setHasMoreLogs] = useState(true)

    useEffect(() => {
        if (id) {
            fetchReminderData(id as string)
            fetchLogs(id as string, 0)
        }
    }, [id])

    useEffect(() => {
        if (formData?.type === "group" && groups.length === 0) {
            fetchGroups()
        }
    }, [formData?.type])

    const fetchReminderData = async (reminderId: string) => {
        setIsLoading(true)
        try {
            const reminder = await apiManager.getReminder(reminderId)
            const initialChannels = reminder.channels || (reminder.channel ? [reminder.channel] : [])
            const initialRepeat = reminder.repeat || "none"
            const initialCustomRepeat = reminder.customRepeat || {
                interval: 1,
                frequency: "week",
                daysOfWeek: [],
            }
            setFormData({ ...reminder, channels: initialChannels, repeat: initialRepeat, customRepeat: initialCustomRepeat })
        } catch (error) {
            toast.error(t("modals.loading_failed"))
            router.push("/schedules")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchGroups = async () => {
        setIsLoadingGroups(true)
        try {
            const fetchedGroups = await apiManager.getGroups()
            setGroups(fetchedGroups)
        } catch (error) {
            toast.error(t("modals.groups_failed"))
        } finally {
            setIsLoadingGroups(false)
        }
    }

    const fetchLogs = async (reminderId: string, pageNum: number) => {
        setIsLogsLoading(true)
        try {
            const data = await apiManager.getReminderLogs(reminderId, pageNum, 20)
            const logData = Array.isArray(data) ? data : (data?.data || [])
            setLogs(logData)
            setHasMoreLogs(logData.length === 20)
        } catch {
            toast.error("Bildirim logları yüklenemedi.")
        } finally {
            setIsLogsLoading(false)
        }
    }

    // Helper functions
    const formatForDateTimeLocal = (dateString: string): string => {
        if (!dateString) return ""
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return ""
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const day = date.getDate().toString().padStart(2, "0")
        const hours = date.getHours().toString().padStart(2, "0")
        const minutes = date.getMinutes().toString().padStart(2, "0")
        return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    // Handlers
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
    }

    const handleTypeChange = (value: "personal" | "group") => {
        setFormData((prev) => (prev ? { ...prev, type: value } : null))
    }

    const handleChannelChange = (channelId: string) => {
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
        if (value === "hourly" && !isPremium) {
            toast.error(t("modals.premium_required") || "Bu özellik Premium üyelere özeldir")
            return
        }
        setFormData((prev) => (prev ? { ...prev, repeat: value } : null))
    }

    const handleCustomRepeatChange = (field: keyof CustomRepeatConfig, value: any) => {
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
        const selectedGroup = groups.find((g) => g.id === groupId)
        if (selectedGroup) {
            setFormData((prev) => (prev ? { ...prev, group: { id: selectedGroup.id, name: selectedGroup.name } } : null))
        }
    }

    const buildReminderPayload = (reminder: Reminder) => {
        let dateTime = reminder.dateTime || ""
        if (dateTime && !dateTime.match(/T\d{2}:\d{2}:\d{2}$/)) {
            dateTime = dateTime + ":00"
        }

        let endDate: string | null = null
        if (reminder.repeat !== "none" && reminder.endDate) {
            endDate = reminder.endDate
            if (!endDate.match(/T\d{2}:\d{2}:\d{2}$/)) {
                endDate = endDate + ":00"
            }
        }

        const payload: Record<string, unknown> = {
            title: reminder.title,
            type: reminder.type,
            message: reminder.message,
            dateTime,
            endDate,
            status: reminder.status,
            channels: reminder.channels,
            repeat: reminder.repeat,
            customRepeat: reminder.customRepeat ?? null,
        }

        if (reminder.type === "group") {
            payload.groupId = reminder.group?.id || null
            payload.contact = null
        } else {
            payload.contact = reminder.contact ?? null
            payload.groupId = null
        }
        return payload
    }

    const handleSave = async () => {
        if (!formData) return
        const newErrors: Record<string, string> = {}

        if (!formData.title?.trim()) newErrors.title = t("modals.validation_title")
        if (!formData.dateTime) newErrors.dateTime = t("modals.validation_datetime")
        if (!formData.message?.trim()) newErrors.message = t("modals.validation_message")
        if (!formData.channels || formData.channels.length === 0) newErrors.channels = t("modals.validation_channels")
        if (formData.repeat !== "none" && formData.endDate &&
            new Date(formData.endDate) <= new Date(formData.dateTime)) {
            newErrors.endDate = "Bitiş tarihi başlangıçtan sonra olmalıdır"
        }

        if (formData.type === "personal") {
            if (!formData.contact?.name?.trim()) newErrors.name = t("modals.validation_name")
            if (formData.channels?.includes("email") && !formData.contact?.email?.trim()) newErrors.email = t("modals.validation_email")
            if ((formData.channels?.includes("sms") || formData.channels?.includes("whatsapp")) && !formData.contact?.phone?.trim()) {
                newErrors.phone = t("modals.validation_phone")
            }
        } else {
            if (!formData.group || !formData.group.id) newErrors.group = t("modals.validation_group")
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            toast.error(t("modals.fix_errors"))
            return
        }

        setIsSaving(true)
        try {
            const payload = buildReminderPayload(formData)
            await apiManager.updateReminder(formData.id, payload as Partial<Reminder>)
            toast.success(t("common.saved_successfully") || "Hatırlatıcı başarıyla güncellendi.")
            router.push("/schedules")
        } catch (error) {
            toast.error(t("modals.save_failed") || "Kaydedilemedi.")
        } finally {
            setIsSaving(false)
        }
    }

    const showEmailField = useMemo(() => formData?.channels.includes("email"), [formData?.channels])
    const showPhoneField = useMemo(
        () => formData?.channels.includes("sms") || formData?.channels.includes("whatsapp"),
        [formData?.channels],
    )

    const formatDate = (d: string) => {
        if (!d) return ""
        return new Date(d).toLocaleDateString("tr-TR", {
            day: "numeric", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })
    }

    const channelIcon = (channel: string) => {
        switch (channel?.toUpperCase()) {
            case "EMAIL": return <Mail className="h-3.5 w-3.5" />
            case "SMS": return <Phone className="h-3.5 w-3.5" />
            case "WHATSAPP": return <MessageSquare className="h-3.5 w-3.5" />
            default: return <Bell className="h-3.5 w-3.5" />
        }
    }

    const channelLabel = (channel: string) => {
        switch (channel?.toUpperCase()) {
            case "EMAIL": return "E-posta"
            case "SMS": return "SMS"
            case "WHATSAPP": return "WhatsApp"
            default: return channel
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!formData) return null

    return (
        <div className="container mx-auto max-w-4xl py-6 px-4 space-y-6 pb-20">
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                <Button variant="ghost" size="icon" onClick={() => router.push("/schedules")} className="rounded-full shrink-0">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Bell className="h-6 w-6 text-primary" />
                        {t("common.edit") || "Hatırlatıcıyı Düzenle"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{t("modals.time_period_desc") || "Hatırlatıcının detaylarını, alıcılarını ve gönderim zamanlamasını aşağıdan değiştirebilirsiniz."}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

                {/* EDIT FORM (Left/Top) */}
                <div className="md:col-span-3 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <Card className="shadow-sm border-border/40 overflow-hidden rounded-2xl">
                        <CardHeader className="bg-muted/20 border-b border-border/40 px-6 py-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Bell className="h-4 w-4 text-primary" />
                                Ana Bilgiler
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Title */}
                            <div>
                                <Label htmlFor="title" className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                                    {t("modals.title_label")}
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={`rounded-xl h-10 transition-colors text-sm ${errors.title ? "border-destructive focus-visible:ring-destructive" : "border-border"}`}
                                    placeholder={t("modals.title_placeholder")}
                                />
                                {errors.title && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.title}</p>}
                            </div>

                            {/* Type Switcher */}
                            <div>
                                <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                                    {t("modals.type_label")}
                                </Label>
                                <div className="grid grid-cols-2 gap-2.5 bg-muted/30 p-1.5 rounded-xl border border-border/40">
                                    <Button
                                        type="button"
                                        variant={formData.type === "personal" ? "default" : "ghost"}
                                        onClick={() => handleTypeChange("personal")}
                                        className={`h-9 flex justify-center items-center gap-1.5 rounded-lg transition-all text-sm ${formData.type === "personal" ? "shadow-sm" : ""}`}
                                    >
                                        <UserIcon className="h-4 w-4" />
                                        <span className="font-medium">{t("dashboard.personal")}</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={formData.type === "group" ? "default" : "ghost"}
                                        onClick={() => handleTypeChange("group")}
                                        className={`h-9 flex justify-center items-center gap-1.5 rounded-lg transition-all text-sm ${formData.type === "group" ? "shadow-sm" : ""}`}
                                    >
                                        <Users className="h-4 w-4" />
                                        <span className="font-medium">{t("dashboard.group")}</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Recipient Section */}
                            {formData.type === "personal" ? (
                                <div className={`p-4 rounded-xl border space-y-3 shadow-sm ${errors.name || errors.email || errors.phone ? "border-destructive/50 bg-destructive/5" : "bg-card border-border/60"}`}>
                                    <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                        <UserIcon className="h-3.5 w-3.5 text-primary" />
                                        {t("modals.contact_info")}
                                    </Label>
                                    <div className="space-y-3 pt-1">
                                        <div>
                                            <Input
                                                name="name"
                                                placeholder={t("modals.contact_name_placeholder")}
                                                value={formData.contact?.name ?? ""}
                                                onChange={handleContactChange}
                                                className={`rounded-lg h-9 text-sm ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                            />
                                            {errors.name && <p className="text-xs text-destructive mt-1 font-medium">{errors.name}</p>}
                                        </div>
                                        {showEmailField && (
                                            <Input
                                                name="email"
                                                type="email"
                                                placeholder="eposta@ornek.com"
                                                value={formData.contact?.email ?? ""}
                                                onChange={handleContactChange}
                                                className={`rounded-lg h-9 text-sm ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                            />
                                        )}
                                        {showPhoneField && (
                                            <Input
                                                name="phone"
                                                type="tel"
                                                placeholder="+90 (555) 000-0000"
                                                value={formData.contact?.phone ?? ""}
                                                onChange={handleContactChange}
                                                className={`rounded-lg h-9 text-sm ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                            />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className={`p-4 rounded-xl border space-y-3 shadow-sm ${errors.group ? "border-destructive/50 bg-destructive/5" : "bg-card border-border/60"}`}>
                                    <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5 text-primary" />
                                        {t("modals.select_group")}
                                    </Label>
                                    <Select onValueChange={handleGroupSelectChange} value={formData.group?.id || ""} disabled={isLoadingGroups}>
                                        <SelectTrigger className={`rounded-lg h-9 text-sm mt-1 ${errors.group ? "border-destructive" : ""}`}>
                                            <SelectValue placeholder={isLoadingGroups ? t("modals.loading_groups") : t("modals.select_group_placeholder")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map((group) => (
                                                <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.group && <p className="text-xs text-destructive mt-1 font-medium">{errors.group}</p>}
                                </div>
                            )}

                            {/* Notification Channels */}
                            <div className="space-y-2.5">
                                <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                    {t("modals.channel_label")}
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {channelOptions.map(({ id, label, icon: Icon }) => (
                                        <label
                                            key={id}
                                            className={`flex flex-col items-center justify-center gap-1.5 p-3 border rounded-xl cursor-pointer transition-all ${formData.channels.includes(id as any)
                                                ? "border-primary bg-primary/5 shadow-sm text-primary"
                                                : errors.channels
                                                    ? "border-destructive/50 hover:border-destructive hover:bg-destructive/5 text-muted-foreground"
                                                    : "border-border hover:border-primary/50 hover:bg-accent/50 text-muted-foreground"
                                                }`}
                                        >
                                            <Checkbox
                                                checked={formData.channels.includes(id as any)}
                                                onCheckedChange={() => handleChannelChange(id)}
                                                className="hidden"
                                            />
                                            <Icon className="h-4 w-4" />
                                            <span className="text-xs font-medium">{label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.channels && <p className="text-xs text-destructive mt-1 font-medium">{errors.channels}</p>}
                            </div>

                            {/* Message */}
                            <div>
                                <Label htmlFor="message" className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                                    {t("modals.msg_label")}
                                </Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    className={`rounded-xl min-h-[100px] resize-none text-sm ${errors.message ? "border-destructive focus-visible:ring-destructive" : "border-border"}`}
                                    placeholder={t("modals.msg_placeholder")}
                                />
                                {errors.message && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.message}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="rounded-full h-11 px-8 font-semibold transition-all text-sm shadow-md min-w-[140px]"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {t("modals.save_changes_btn") || "Kaydet"}
                        </Button>
                    </div>
                </div>

                {/* RIGHT COLUMN (Schedule & Logs) */}
                <div className="md:col-span-2 space-y-5 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">

                    <Card className="shadow-sm border-border/40 overflow-hidden rounded-2xl">
                        <CardHeader className="bg-muted/20 border-b border-border/40 px-5 py-3.5">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                Zamanlama
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div>
                                <Label htmlFor="datetime" className="text-sm font-semibold text-foreground mb-1.5 block">
                                    {t("modals.datetime_label")}
                                </Label>
                                <Input
                                    id="datetime"
                                    name="dateTime"
                                    type="datetime-local"
                                    value={formatForDateTimeLocal(formData.dateTime)}
                                    onChange={handleInputChange}
                                    className={`rounded-lg h-9 text-sm flex-1 ${errors.dateTime ? "border-destructive" : ""}`}
                                />
                                {errors.dateTime && <p className="text-xs text-destructive mt-1 font-medium">{errors.dateTime}</p>}
                            </div>

                            <div>
                                <Label htmlFor="repeat" className="text-sm font-semibold text-foreground mb-1.5 block">
                                    {t("modals.repeat_label")}
                                </Label>
                                <Select value={formData.repeat} onValueChange={handleRepeatChange}>
                                    <SelectTrigger id="repeat" className="rounded-lg h-9 text-sm">
                                        <SelectValue placeholder={t("modals.select_frequency")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t("modals.frequency_none")}</SelectItem>
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

                            {formData.repeat !== "none" && (
                                <div>
                                    <Label htmlFor="endDate" className="text-sm font-semibold text-foreground mb-1.5 block">
                                        Bitiş Tarihi <span className="text-xs font-normal text-muted-foreground">(opsiyonel)</span>
                                    </Label>
                                    <Input
                                        id="endDate"
                                        name="endDate"
                                        type="datetime-local"
                                        value={formData.endDate ? formatForDateTimeLocal(formData.endDate) : ""}
                                        onChange={handleInputChange}
                                        min={formatForDateTimeLocal(formData.dateTime)}
                                        className={`rounded-lg h-9 text-sm flex-1 ${errors.endDate ? "border-destructive" : ""}`}
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Bu tarihten sonra tekrarlama durur. Boş bırakırsanız süresiz tekrar eder.
                                    </p>
                                    {errors.endDate && <p className="text-xs text-destructive mt-1 font-medium">{errors.endDate}</p>}
                                </div>
                            )}

                            {formData.repeat === "custom" && (
                                <div className="pt-2 border-t border-border/50 space-y-3 mt-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-muted-foreground">{t("modals.every")}</span>
                                        <Input
                                            type="number"
                                            className="w-16 h-9 rounded-lg text-sm bg-muted/20"
                                            value={formData.customRepeat?.interval || 1}
                                            onChange={(e) => handleCustomRepeatChange("interval", e.target.value)}
                                            min={1}
                                        />
                                        <Select
                                            value={formData.customRepeat?.frequency || "week"}
                                            onValueChange={(value: "day" | "week" | "month") => handleCustomRepeatChange("frequency", value)}
                                        >
                                            <SelectTrigger className="w-full h-9 rounded-lg text-sm bg-muted/20">
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
                                        <div className="pt-1">
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
                                                        className="h-8 px-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-[10px]"
                                                    >
                                                        {day.label}
                                                    </ToggleGroupItem>
                                                ))}
                                            </ToggleGroup>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-border/40 overflow-hidden rounded-2xl flex flex-col max-h-[450px]">
                        <CardHeader className="bg-muted/20 border-b border-border/40 px-5 py-3.5 shrink-0 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Bell className="h-4 w-4 text-primary" />
                                Bildirim Geçmişi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-y-auto w-full custom-scrollbar">
                            {isLogsLoading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Bell className="h-8 w-8 mb-2 opacity-20" />
                                    <p className="text-xs">Henüz kayıt yok.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/40">
                                    {logs.map((log) => (
                                        <div key={log.id} className="p-4 hover:bg-muted/20 transition-colors text-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {log.status === "SUCCESS" ? (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                                                    )}
                                                    <span className="font-medium text-foreground truncate max-w-[140px] text-xs" title={log.recipient}>
                                                        {log.recipient}
                                                    </span>
                                                </div>
                                                <Badge variant="outline" className="text-[10px] gap-1 px-1.5 font-normal bg-card">
                                                    {channelIcon(log.channel)}
                                                    {channelLabel(log.channel)}
                                                </Badge>
                                            </div>

                                            <p className="text-[10px] text-muted-foreground mb-2">
                                                {formatDate(log.sentAt)}
                                            </p>

                                            {log.errorMessage && (
                                                <p className="text-[10px] text-rose-500 mt-1">{log.errorMessage}</p>
                                            )}

                                            {(log.providerMessageId || log.status || log.providerResponse) && (
                                                <div className="mt-2.5 flex flex-col gap-1.5 text-[10px] text-muted-foreground bg-accent/30 py-2 px-2.5 rounded border border-border/40">
                                                    {log.providerMessageId && <div className="truncate"><span className="font-medium text-foreground/70">Ref:</span> {log.providerMessageId}</div>}
                                                    {log.status && <div className="truncate"><span className="font-medium text-foreground/70">Durum:</span> {log.status}</div>}
                                                    {log.providerErrorCode && <div className="truncate"><span className="font-medium text-rose-500">Hata:</span> {log.providerErrorCode}</div>}
                                                    {log.providerResponse && <div className="w-full truncate" title={log.providerResponse}><span className="font-medium text-foreground/70">Detay:</span> {log.providerResponse}</div>}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        {logs.length > 0 && (
                            <div className="p-2 border-t border-border/40 bg-muted/10 shrink-0 flex items-center justify-between">
                                <Button
                                    variant="ghost" size="sm" className="h-7 text-[10px] px-2"
                                    onClick={() => setLogsPage(p => Math.max(0, p - 1))}
                                    disabled={logsPage === 0 || isLogsLoading}
                                >
                                    <ChevronLeft className="h-3 w-3 mr-1" /> Önceki
                                </Button>
                                <span className="text-[10px] text-muted-foreground">Sayfa {logsPage + 1}</span>
                                <Button
                                    variant="ghost" size="sm" className="h-7 text-[10px] px-2"
                                    onClick={() => {
                                        setLogsPage(p => p + 1)
                                        fetchLogs(id as string, logsPage + 1)
                                    }}
                                    disabled={!hasMoreLogs || isLogsLoading}
                                >
                                    Sonraki <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}
