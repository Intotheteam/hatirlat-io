"use client"

import { useEffect, useState, useCallback } from "react"
import { adminConfig, type SystemConfig } from "@/services/admin/adminService"
import { toast } from "sonner"
import { Eye, EyeOff, Save, AlertCircle } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldDef = {
  key: string
  label: string
  secret?: boolean
  placeholder?: string
  description?: string
  wide?: boolean
}

type ProviderDef = {
  id: string
  name: string
  subtitle: string
  badge: string
  borderColor: string
  bgColor: string
  requiresRestart: boolean
  enabledKey: string
  fields: FieldDef[]
}

// ─── Provider Definitions ─────────────────────────────────────────────────────

const PROVIDERS: ProviderDef[] = [
  {
    id: "iletimerkezi",
    name: "İleti Merkezi",
    subtitle: "Türk SMS sağlayıcısı (birincil) · toplusmsapi.com",
    badge: "SMS 🇹🇷",
    borderColor: "border-cyan-700/50",
    bgColor: "bg-cyan-950/20",
    requiresRestart: false,
    enabledKey: "integration.iletimerkezi.enabled",
    fields: [
      { key: "integration.iletimerkezi.key",      label: "API Key",         secret: true },
      { key: "integration.iletimerkezi.hash",     label: "API Hash",        secret: true },
      { key: "integration.iletimerkezi.sender",   label: "Gönderici Adı",  placeholder: "HATIRLAT" },
      { key: "integration.iletimerkezi.iys",      label: "IYS Kodu",       placeholder: "1",        description: "Ticari mesajlar için 1" },
      { key: "integration.iletimerkezi.iys_list", label: "IYS Listesi",    placeholder: "BIREYSEL", description: "BIREYSEL veya TACIR" },
    ],
  },
  {
    id: "netgsm",
    name: "Netgsm",
    subtitle: "Türk SMS sağlayıcısı (yedek) · netgsm.com.tr",
    badge: "SMS 🇹🇷",
    borderColor: "border-green-700/50",
    bgColor: "bg-green-950/20",
    requiresRestart: false,
    enabledKey: "integration.netgsm.enabled",
    fields: [
      { key: "integration.netgsm.usercode",  label: "Kullanıcı Kodu" },
      { key: "integration.netgsm.password",  label: "Şifre",              secret: true },
      { key: "integration.netgsm.msgheader", label: "Gönderici Başlığı", placeholder: "HATIRLAT" },
    ],
  },
  {
    id: "twilio",
    name: "Twilio",
    subtitle: "Uluslararası SMS ve WhatsApp · twilio.com",
    badge: "SMS + WhatsApp 🌍",
    borderColor: "border-red-700/50",
    bgColor: "bg-red-950/20",
    requiresRestart: true,
    enabledKey: "integration.twilio.sms_enabled",
    fields: [
      { key: "integration.twilio.account_sid",      label: "Account SID" },
      { key: "integration.twilio.auth_token",       label: "Auth Token",        secret: true },
      { key: "integration.twilio.from_phone",       label: "SMS Numarası",      placeholder: "+1xxxxxxxxxx" },
      { key: "integration.twilio.from_whatsapp",    label: "WhatsApp Numarası", placeholder: "whatsapp:+1xxx", wide: true },
      { key: "integration.twilio.sms_enabled",      label: "SMS Aktif",         placeholder: "false" },
      { key: "integration.twilio.whatsapp_enabled", label: "WhatsApp Aktif",    placeholder: "false" },
    ],
  },
  {
    id: "smtp",
    name: "E-posta (SMTP)",
    subtitle: "Bildirim e-postaları · Gmail veya özel SMTP",
    badge: "E-posta 📧",
    borderColor: "border-yellow-700/50",
    bgColor: "bg-yellow-950/20",
    requiresRestart: true,
    enabledKey: "integration.smtp.enabled",
    fields: [
      { key: "integration.smtp.host",     label: "SMTP Host",            placeholder: "smtp.gmail.com" },
      { key: "integration.smtp.port",     label: "Port",                 placeholder: "587" },
      { key: "integration.smtp.username", label: "Kullanıcı Adı",        placeholder: "you@gmail.com",       wide: true },
      { key: "integration.smtp.password", label: "Şifre / App Password", secret: true,                       wide: true },
      { key: "integration.smtp.from",     label: "Gönderici Adresi",     placeholder: "noreply@hatirlat.io", wide: true },
    ],
  },
]

// ─── ProviderCard ─────────────────────────────────────────────────────────────

function ProviderCard({
  provider,
  configMap,
  onSaved,
}: {
  provider: ProviderDef
  configMap: Record<string, SystemConfig>
  onSaved: () => void
}) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [show, setShow] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const init: Record<string, string> = {}
    provider.fields.forEach((f) => {
      const cfg = configMap[f.key]
      // For encrypted fields, show empty (user must retype to change)
      init[f.key] = cfg ? (cfg.encrypted ? "" : (cfg.configValue ?? "")) : ""
    })
    setValues(init)

    const enabledCfg = configMap[provider.enabledKey]
    setEnabled(enabledCfg?.configValue === "true")
  }, [configMap, provider])

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload: Array<{
        configKey: string
        configValue: string
        type: string
        encrypted: boolean
      }> = []

      // Enabled toggle
      payload.push({
        configKey: provider.enabledKey,
        configValue: String(enabled),
        type: "BOOLEAN",
        encrypted: false,
      })

      // Each credential field
      for (const field of provider.fields) {
        const val = values[field.key] ?? ""
        // Skip secret fields that are empty — user didn't change them
        if (field.secret && val === "") continue
        payload.push({
          configKey: field.key,
          configValue: val,
          type: "STRING",
          encrypted: !!field.secret,
        })
      }

      await adminConfig.bulkSet(payload)
      toast.success(`${provider.name} ayarları kaydedildi`)
      onSaved()
    } catch (e: any) {
      toast.error("Kayıt hatası: " + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`rounded-xl border ${provider.borderColor} ${provider.bgColor} p-5`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">{provider.name}</h3>
            <span className="rounded-full bg-zinc-800/70 px-2 py-0.5 text-xs text-zinc-300">
              {provider.badge}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">{provider.subtitle}</p>
        </div>

        {/* Enabled toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs text-zinc-400">{enabled ? "Aktif" : "Pasif"}</span>
          <button
            type="button"
            onClick={() => setEnabled((v) => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              enabled ? "bg-green-600" : "bg-zinc-700"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>
      </div>

      {/* Restart warning */}
      {provider.requiresRestart && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-800/30 bg-amber-950/40 px-3 py-2 mb-4 text-xs text-amber-300">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Değişiklikler aktif olmak için container yeniden başlatılmalıdır.
        </div>
      )}

      {/* Fields */}
      <div className="grid grid-cols-2 gap-3">
        {provider.fields.map((field) => (
          <div key={field.key} className={field.wide ? "col-span-2" : ""}>
            <label className="block text-xs text-zinc-400 mb-1">
              {field.label}
              {field.description && (
                <span className="ml-1 text-zinc-600">· {field.description}</span>
              )}
              {configMap[field.key] && (
                <span className="ml-2 text-green-600 text-[10px]">✓ kayıtlı</span>
              )}
            </label>
            <div className="relative">
              <input
                type={field.secret && !show[field.key] ? "password" : "text"}
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.key]: e.target.value }))
                }
                placeholder={
                  field.secret && configMap[field.key]?.encrypted
                    ? "••••••• (değiştirmek için yaz)"
                    : (field.placeholder ?? "")
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-mono outline-none focus:border-zinc-500 placeholder:text-zinc-600"
                style={{ paddingRight: field.secret ? "2rem" : undefined }}
              />
              {field.secret && (
                <button
                  type="button"
                  onClick={() =>
                    setShow((s) => ({ ...s, [field.key]: !s[field.key] }))
                  }
                  className="absolute right-2 top-2.5 text-zinc-500 hover:text-zinc-300"
                >
                  {show[field.key] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [configMap, setConfigMap] = useState<Record<string, SystemConfig>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const configs = await adminConfig.byPrefix("integration.")
      const map: Record<string, SystemConfig> = {}
      configs.forEach((c) => {
        map[c.configKey] = c
      })
      setConfigMap(map)
    } catch (e: any) {
      toast.error("Entegrasyon ayarları yüklenemedi: " + e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Entegrasyonlar</h1>
        <p className="text-sm text-zinc-400 mt-1">
          SMS, WhatsApp ve e-posta sağlayıcı kimlik bilgilerini buradan yönetebilirsiniz.
        </p>
      </div>

      <div className="space-y-4">
        {PROVIDERS.map((p) => (
          <ProviderCard
            key={p.id}
            provider={p}
            configMap={configMap}
            onSaved={load}
          />
        ))}
      </div>
    </div>
  )
}
