"use client"

import { useEffect, useState } from "react"
import { adminDashboard, type DashboardStats } from "@/services/admin/adminService"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RefreshCw, Users, Bell, CalendarCheck, Layers, TrendingUp, TrendingDown, MessageSquare, Mail, Phone } from "lucide-react"
import { toast } from "sonner"

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  trend,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  sub?: string
  trend?: number
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <Icon className="h-4 w-4 text-zinc-500" />
      </div>
      <div className="mt-2 text-3xl font-bold">{value?.toLocaleString?.() ?? value}</div>
      {sub && <div className="mt-1 text-xs text-zinc-500">{sub}</div>}
      {trend !== undefined && (
        <div className={`mt-2 flex items-center gap-1 text-xs ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
          {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(trend)} son 7 günde
        </div>
      )}
    </div>
  )
}

function ChannelBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{label}</span>
        <span>{value.toLocaleString()} (%{pct})</span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-800">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const data = await adminDashboard.getStats()
      setStats(data)
    } catch (e: any) {
      toast.error("İstatistikler yüklenemedi: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRecalculate = async () => {
    try {
      setRecalculating(true)
      await adminDashboard.recalculate()
      toast.success("İstatistikler yeniden hesaplandı")
      await load()
    } catch (e: any) {
      toast.error("Hesaplama hatası: " + e.message)
    } finally {
      setRecalculating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const today = stats?.todayStats
  const totalChannelToday = (today?.smsCount ?? 0) + (today?.emailCount ?? 0) + (today?.whatsappCount ?? 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-zinc-400">Platform genel durumu</p>
        </div>
        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${recalculating ? "animate-spin" : ""}`} />
          Yeniden Hesapla
        </button>
      </div>

      {/* Ana Metrikler */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam Kullanıcı"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          sub={`${stats?.premiumUsers ?? 0} premium`}
          trend={stats?.userGrowth7d}
        />
        <StatCard
          label="Toplam Hatırlatıcı"
          value={stats?.totalReminders ?? 0}
          icon={CalendarCheck}
          sub={`${stats?.activeReminders ?? 0} aktif`}
          trend={stats?.reminderGrowth7d}
        />
        <StatCard
          label="Haftalık Bildirim"
          value={stats?.weeklyNotifications ?? 0}
          icon={Bell}
          sub={`${stats?.weeklyFailed ?? 0} başarısız`}
        />
        <StatCard
          label="Toplam Grup"
          value={stats?.totalGroups ?? 0}
          icon={Layers}
        />
      </div>

      {/* Bugün */}
      {today && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 font-semibold">Bugün</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-0.5">
              <div className="text-xs text-zinc-400">Yeni Kullanıcı</div>
              <div className="text-2xl font-bold">{today.newUsersToday}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xs text-zinc-400">Gönderilen</div>
              <div className="text-2xl font-bold text-green-400">{today.sentToday}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xs text-zinc-400">Başarısız</div>
              <div className="text-2xl font-bold text-red-400">{today.failedToday}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xs text-zinc-400">Harcanan Kredi</div>
              <div className="text-2xl font-bold">{today.creditsConsumedToday}</div>
            </div>
          </div>

          {/* Kanal dağılımı */}
          <div className="mt-5 space-y-3">
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Kanal Dağılımı</div>
            <ChannelBar label="SMS" value={today.smsCount} total={totalChannelToday} color="bg-blue-500" />
            <ChannelBar label="E-posta" value={today.emailCount} total={totalChannelToday} color="bg-emerald-500" />
            <ChannelBar label="WhatsApp" value={today.whatsappCount} total={totalChannelToday} color="bg-green-400" />
          </div>
        </div>
      )}

      {/* Son 7 Gün Tablosu */}
      {stats?.last7Days && stats.last7Days.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 font-semibold">Son 7 Gün</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
                  <th className="pb-3 pr-4">Tarih</th>
                  <th className="pb-3 pr-4">Toplam Kullanıcı</th>
                  <th className="pb-3 pr-4">Yeni Üye</th>
                  <th className="pb-3 pr-4 text-green-400">Gönderilen</th>
                  <th className="pb-3 text-red-400">Başarısız</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {stats.last7Days.map((d) => (
                  <tr key={d.date} className="hover:bg-zinc-800/50">
                    <td className="py-2.5 pr-4 text-zinc-300">{d.date}</td>
                    <td className="py-2.5 pr-4">{d.totalUsers.toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-blue-400">+{d.newUsersToday}</td>
                    <td className="py-2.5 pr-4 text-green-400">{d.sentToday}</td>
                    <td className="py-2.5 text-red-400">{d.failedToday}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
