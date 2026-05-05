"use client"

import { Cake, Receipt, Calendar, Briefcase, Pill, Sparkles } from "lucide-react"
import type { Channel } from "@/types"

export interface ReminderTemplate {
  id: string
  label: string
  icon: any
  title: string
  message: string
  channels: Channel[]
  repeat: "none" | "daily" | "weekly" | "monthly" | "custom"
}

export const REMINDER_TEMPLATES: ReminderTemplate[] = [
  {
    id: "birthday",
    label: "Doğum Günü",
    icon: Cake,
    title: "Doğum Günü",
    message: "Mutlu yıllar! 🎉 Sağlık, mutluluk ve başarı dolu bir yıl dileriz.",
    channels: ["sms", "whatsapp"],
    repeat: "none",
  },
  {
    id: "bill",
    label: "Fatura Ödeme",
    icon: Receipt,
    title: "Fatura Ödeme Hatırlatıcısı",
    message: "Faturanızın son ödeme tarihi yaklaşıyor. Lütfen ödemenizi yapmayı unutmayın.",
    channels: ["email", "sms"],
    repeat: "monthly",
  },
  {
    id: "appointment",
    label: "Randevu",
    icon: Calendar,
    title: "Randevu Hatırlatıcısı",
    message: "Randevunuz yaklaşıyor. Lütfen zamanında hazır olun.",
    channels: ["sms", "whatsapp"],
    repeat: "none",
  },
  {
    id: "meeting",
    label: "Toplantı",
    icon: Briefcase,
    title: "Toplantı Hatırlatıcısı",
    message: "Yaklaşan toplantınız için hatırlatma. Gündem ve katılımcıları gözden geçirmeyi unutmayın.",
    channels: ["email"],
    repeat: "none",
  },
  {
    id: "medication",
    label: "İlaç",
    icon: Pill,
    title: "İlaç Hatırlatıcısı",
    message: "İlacınızı almayı unutmayın. Sağlığınız için düzenli kullanım önemlidir.",
    channels: ["sms", "whatsapp"],
    repeat: "daily",
  },
  {
    id: "custom",
    label: "Özel",
    icon: Sparkles,
    title: "",
    message: "",
    channels: [],
    repeat: "none",
  },
]
