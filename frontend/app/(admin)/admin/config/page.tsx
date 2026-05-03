"use client"

import { useEffect, useState } from "react"
import { adminConfig, type SystemConfig } from "@/services/admin/adminService"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Plus, Trash2, ToggleLeft, ToggleRight, Lock, Globe, X, Save } from "lucide-react"
import { toast } from "sonner"

const CONFIG_TYPES = ["STRING", "INTEGER", "BOOLEAN", "SECRET", "JSON"]

const TYPE_COLORS: Record<string, string> = {
  STRING:  "bg-zinc-800 text-zinc-300",
  INTEGER: "bg-blue-900/40 text-blue-300",
  BOOLEAN: "bg-purple-900/40 text-purple-300",
  SECRET:  "bg-red-900/40 text-red-300",
  JSON:    "bg-yellow-900/40 text-yellow-300",
}

// ─── Yeni/Düzenle Modal ───────────────────────────────────────────────────────

function ConfigModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: SystemConfig
  onClose: () => void
  onSave: (data: any) => Promise<void>
}) {
  const [form, setForm] = useState({
    configKey:   initial?.configKey   ?? "",
    configValue: initial?.configValue ?? "",
    type:        initial?.type        ?? "STRING",
    encrypted:   initial?.encrypted   ?? false,
    active:      initial?.active      ?? true,
    description: initial?.description ?? "",
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.configKey.trim()) { toast.error("Anahtar boş olamaz"); return }
    try {
      setSaving(true)
      await onSave(form)
      onClose()
    } catch (e: any) {
      toast.error("Kayıt hatası: " + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">{initial ? "Konfigürasyonu Düzenle" : "Yeni Konfigürasyon"}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Anahtar *</label>
            <input
              value={form.configKey}
              onChange={(e) => setForm(f => ({ ...f, configKey: e.target.value }))}
              disabled={!!initial}
              placeholder="ornek.anahtar"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-500 disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Tip</label>
              <select
                value={form.type}
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              >
                {CONFIG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.encrypted}
                  onChange={(e) => setForm(f => ({ ...f, encrypted: e.target.checked }))}
                  className="accent-red-500"
                />
                <span className="text-sm text-zinc-300 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Şifreli
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))}
                  className="accent-green-500"
                />
                <span className="text-sm text-zinc-300">Aktif</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Değer</label>
            <textarea
              value={form.configValue}
              onChange={(e) => setForm(f => ({ ...f, configValue: e.target.value }))}
              rows={3}
              placeholder={form.encrypted ? "••••••••" : "değer"}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-500 resize-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Açıklama</label>
            <input
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Bu ayar ne işe yarar?"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-zinc-700 hover:bg-zinc-800">İptal</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminConfigPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState("")
  const [modal, setModal] = useState<{ open: boolean; config?: SystemConfig }>({ open: false })

  const load = async () => {
    try {
      setLoading(true)
      const data = await adminConfig.list()
      setConfigs(data)
    } catch (e: any) {
      toast.error("Konfigürasyonlar yüklenemedi: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSave = async (data: any) => {
    await adminConfig.set(data)
    toast.success("Konfigürasyon kaydedildi")
    await load()
  }

  const handleDelete = async (key: string) => {
    if (!confirm(`"${key}" silinsin mi?`)) return
    try {
      await adminConfig.delete(key)
      toast.success("Silindi")
      await load()
    } catch (e: any) {
      toast.error("Silme hatası: " + e.message)
    }
  }

  const handleToggleFeature = async (cfg: SystemConfig) => {
    const current = cfg.configValue === "true"
    try {
      await adminConfig.toggleFeature(cfg.configKey, !current)
      toast.success(`${cfg.configKey} ${!current ? "aktifleştirildi" : "devre dışı bırakıldı"}`)
      await load()
    } catch (e: any) {
      toast.error("Toggle hatası: " + e.message)
    }
  }

  const filtered = typeFilter
    ? configs.filter(c => c.type === typeFilter)
    : configs

  const types = [...new Set(configs.map(c => c.type))]

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sistem Ayarları</h1>
          <p className="text-sm text-zinc-400">{configs.length} konfigürasyon</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Yeni Ayar
        </button>
      </div>

      {/* Tip Filtreleri */}
      {types.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter("")}
            className={`rounded-full px-3 py-1 text-xs border transition-colors ${
              !typeFilter ? "border-zinc-500 bg-zinc-700 text-white" : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            Tümü ({configs.length})
          </button>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t === typeFilter ? "" : t)}
              className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                typeFilter === t ? "border-zinc-500 bg-zinc-700 text-white" : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {t} ({configs.filter(c => c.type === t).length})
            </button>
          ))}
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900">
              <tr className="text-left text-xs text-zinc-500">
                <th className="px-4 py-3">Anahtar</th>
                <th className="px-4 py-3">Değer</th>
                <th className="px-4 py-3">Tip</th>
                <th className="px-4 py-3 text-center">Durum</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-zinc-500">Kayıt bulunamadı</td></tr>
              ) : filtered.map((cfg) => (
                <tr key={cfg.configKey} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {cfg.encrypted && <Lock className="h-3 w-3 text-red-400 shrink-0" />}
                      <span className="font-mono text-sm text-zinc-200">{cfg.configKey}</span>
                    </div>
                    {cfg.description && (
                      <div className="text-xs text-zinc-500 mt-0.5">{cfg.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400 max-w-[200px] truncate">
                    {cfg.configValue || <span className="italic text-zinc-600">boş</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${TYPE_COLORS[cfg.type] ?? "bg-zinc-800 text-zinc-400"}`}>
                      {cfg.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {cfg.type === "BOOLEAN" ? (
                      <button
                        onClick={() => handleToggleFeature(cfg)}
                        title="Feature flag toggle"
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        {cfg.configValue === "true"
                          ? <ToggleRight className="h-5 w-5 text-green-400" />
                          : <ToggleLeft className="h-5 w-5" />}
                      </button>
                    ) : (
                      <span className={`inline-block h-2 w-2 rounded-full ${cfg.active ? "bg-green-500" : "bg-zinc-600"}`} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setModal({ open: true, config: cfg })}
                        className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs px-2"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(cfg.configKey)}
                        className="p-1.5 rounded hover:bg-red-900/40 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <ConfigModal
          initial={modal.config}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
