"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  LayoutDashboard,
  Users,
  ScrollText,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Receipt,
  Plug,
  Shield,
} from "lucide-react"

const NAV = [
  { href: "/admin",                label: "Dashboard",        icon: LayoutDashboard },
  { href: "/admin/users",          label: "Kullanıcılar",     icon: Users },
  { href: "/admin/billing",        label: "Fatura & Maliyet", icon: Receipt },
  { href: "/admin/integrations",   label: "Entegrasyonlar",   icon: Plug },
  { href: "/admin/security",       label: "Güvenlik",         icon: Shield },
  { href: "/admin/audit-logs",     label: "Audit Logs",       icon: ScrollText },
  { href: "/admin/config",         label: "Sistem Ayarları",  icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login")
      } else if (user?.role !== "ADMIN") {
        router.replace("/dashboard")
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div suppressHydrationWarning className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div suppressHydrationWarning className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-zinc-800 bg-zinc-900">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-5">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          <span className="font-bold tracking-tight">Süper Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {active && <ChevronRight className="ml-auto h-3 w-3" />}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-zinc-800 p-3 space-y-1">
          <div className="px-3 py-2 text-xs text-zinc-500">
            <div className="font-medium text-zinc-300">{user.username}</div>
            <div>{user.email}</div>
          </div>
          <button
            onClick={() => { logout(); router.push("/login") }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
