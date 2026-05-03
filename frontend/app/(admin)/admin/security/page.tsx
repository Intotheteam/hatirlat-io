"use client"

import { useEffect, useState, useCallback } from "react"
import { adminConfig } from "@/services/admin/adminService"
import { toast } from "sonner"
import { Shield, Plus, Trash2, AlertTriangle, CheckCircle2, Wifi } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

const WHITELIST_KEY = "admin.ip.whitelist"

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SecurityPage() {
  const [myIp, setMyIp] = useState<string>("")
  const [ips, setIps] = useState<string[]>([])
  const [newIp, setNewIp] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [whitelistEnabled, setWhitelistEnabled] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [myIpRes, configs] = await Promise.all([
        adminConfig.myIp(),
        adminConfig.byPrefix("admin.ip."),
      ])

      setMyIp(myIpRes ?? "")

      const whitelistCfg = configs.find((c) => c.configKey === WHITELIST_KEY)
      if (whitelistCfg?.configValue) {
        const list = whitelistCfg.configValue
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        setIps(list)
        setWhitelistEnabled(list.length > 0)
      } else {
        setIps([])
        setWhitelistEnabled(false)
      }
    } catch (e: any) {
      toast.error("Yüklenemedi: " + e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const addIp = () => {
    const ip = newIp.trim()
    if (!ip) return
    if (ips.includes(ip)) {
      toast.error("Bu IP zaten listede var")
      return
    }
    setIps((prev) => [...prev, ip])
    setNewIp("")
  }

  const removeIp = (ip: string) => {
    setIps((prev) => prev.filter((x) => x !== ip))
  }

  const addMyIp = () => {
    if (!myIp) return
    if (ips.includes(myIp)) {
      toast.info("Mevcut IP'niz zaten listede")
      return
    }
    setIps((prev) => [...prev, myIp])
  }

  const save = async () => {
    try {
      setSaving(true)
      const value = ips.join(",")
      await adminConfig.set({
        configKey: WHITELIST_KEY,
        configValue: value,
        type: "STRING",
        encrypted: false,
        description: "Admin paneli IP erişim listesi (virgülle ayrılmış). Boş bırakılırsa kısıtlama uygulanmaz.",
      })
      toast.success("IP listesi kaydedildi")
      await load()
    } catch (e: any) {
      toast.error("Kayıt hatası: " + e.message)
    } finally {
      setSaving(false)
    }
  }

  const myIpInList = myIp && ips.includes(myIp)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold">Güvenlik</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Admin paneline erişim kısıtlamaları</p>
        </div>
      </div>

      {/* Current IP card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wifi className="h-4 w-4 text-zinc-400" />
          <div>
            <p className="text-xs text-zinc-500">Mevcut IP adresiniz</p>
            <p className="font-mono text-sm text-white">{myIp || "—"}</p>
          </div>
        </div>
        {myIp && (
          <button
            onClick={addMyIp}
            disabled={!!myIpInList}
            className={`text-xs rounded-lg px-3 py-1.5 transition-colors ${
              myIpInList
                ? "bg-zinc-800 text-zinc-500 cursor-default"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {myIpInList ? "✓ Listede" : "Listeye Ekle"}
          </button>
        )}
      </div>

      {/* IP Whitelist section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">IP Erişim Listesi</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Liste boşsa kısıtlama uygulanmaz — tüm IP'ler erişebilir.
            </p>
          </div>
          <span
            className={`text-xs rounded-full px-2.5 py-1 border font-medium ${
              ips.length > 0
                ? "bg-green-950/50 text-green-400 border-green-700/40"
                : "bg-zinc-800 text-zinc-400 border-zinc-700"
            }`}
          >
            {ips.length > 0 ? `${ips.length} IP kısıtlı` : "Kısıtlama yok"}
          </span>
        </div>

        {/* Warning if own IP not in list */}
        {ips.length > 0 && !myIpInList && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-700/40 bg-amber-950/30 px-3 py-2.5 text-xs text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              <strong>Dikkat:</strong> Kendi IP'niz ({myIp}) listede değil. Kaydetmeniz halinde admin paneline
              erişiminiz kesilecek. Önce &quot;Listeye Ekle&quot; butonuna basın.
            </span>
          </div>
        )}

        {/* IP List */}
        {ips.length > 0 ? (
          <ul className="space-y-2">
            {ips.map((ip) => (
              <li
                key={ip}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-zinc-200">{ip}</span>
                  {ip === myIp && (
                    <span className="text-[10px] text-green-500 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Mevcut IP
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeIp(ip)}
                  className="text-zinc-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center py-4 text-sm text-zinc-600">
            Henüz IP eklenmedi — tüm IP'ler erişebilir
          </p>
        )}

        {/* Add IP */}
        <div className="flex gap-2">
          <input
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addIp()}
            placeholder="IP adresi ekle (ör: 178.105.69.5)"
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-mono outline-none focus:border-zinc-500 placeholder:text-zinc-600"
          />
          <button
            onClick={addIp}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ekle
          </button>
        </div>

        {/* Save */}
        <div className="pt-1 flex justify-end">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-5 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Shield className="h-4 w-4" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      {/* Info box */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-xs text-zinc-500 space-y-1.5">
        <p className="font-medium text-zinc-400">Nasıl çalışır?</p>
        <p>• Liste boş bırakılırsa kısıtlama yoktur — tüm IP'lerden erişilebilir.</p>
        <p>• En az bir IP eklendiğinde, yalnızca listede olan IP'ler <code className="text-zinc-300">/api/admin/**</code> endpoint'lerine erişebilir.</p>
        <p>• Değişiklikler anında aktif olur, yeniden başlatma gerekmez.</p>
        <p>• Nginx üzerinden erişimde X-Real-IP veya X-Forwarded-For başlığı kullanılır.</p>
      </div>
    </div>
  )
}
