"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { apiService } from "@/services/api/apiService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { User, Mail, Lock, Save, Loader2, Crown, Coins, ShieldCheck, Globe } from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: string
  username: string
  email: string
  role: string
  premium: boolean
  credits: number
  timezone?: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Profile form state
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [timezone, setTimezone] = useState("Europe/Istanbul")
  const [profileSaving, setProfileSaving] = useState(false)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await apiService.get<{ success: boolean; data: UserProfile }>("/api/profile")
      const data = (response as any).data
      setProfile(data)
      setUsername(data.username)
      setEmail(data.email || "")
      setTimezone(data.timezone || "Europe/Istanbul")
    } catch (error) {
      toast.error("Profil yüklenirken bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    try {
      const response = await apiService.put<{ success: boolean; data: UserProfile; message: string }>(
        "/api/profile",
        { username, email, timezone }
      )
      const data = (response as any).data
      setProfile(data)
      toast.success("Profil başarıyla güncellendi.")
    } catch (error: any) {
      toast.error(error.message || "Profil güncellenirken bir hata oluştu.")
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor.")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Yeni şifre en az 6 karakter olmalıdır.")
      return
    }
    setPasswordSaving(true)
    try {
      await apiService.put("/api/profile/password", { currentPassword, newPassword })
      toast.success("Şifre başarıyla değiştirildi.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast.error(error.message || "Şifre değiştirilirken bir hata oluştu.")
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const initials = profile?.username
    ? profile.username.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/20 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-5"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-40" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {initials}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{profile?.username}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-xs">
                <ShieldCheck className="h-3 w-3 mr-1" />
                {profile?.role}
              </Badge>
              {profile?.premium ? (
                <Badge className="text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
                  <Crown className="h-3 w-3 mr-1" /> Premium
                </Badge>
              ) : (
                <Link href="/premium">
                  <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent gap-1">
                    <Crown className="h-3 w-3" /> Ücretsiz – Yükselt
                  </Badge>
                </Link>
              )}
              <Badge variant="outline" className="text-xs gap-1">
                <Coins className="h-3 w-3 text-amber-500" />
                <span className="text-amber-600 font-bold">{profile?.credits ?? 0}</span> kredi
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Profile Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-2 border-border/40 rounded-2xl shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/10 border-b border-border/40 p-5">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/30">
                  <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                Profil Bilgileri
              </CardTitle>
              <CardDescription>Kullanıcı adınızı ve e-posta adresinizi güncelleyin.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username">Kullanıcı Adı</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 rounded-xl"
                      placeholder="Kullanıcı adınız"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-xl"
                      placeholder="e-posta@ornek.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Saat Dilimi
                  </Label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="Europe/Istanbul">🇹🇷 İstanbul (UTC+3)</option>
                    <option value="Europe/London">🇬🇧 Londra (UTC+0/+1)</option>
                    <option value="Europe/Berlin">🇩🇪 Berlin (UTC+1/+2)</option>
                    <option value="America/New_York">🇺🇸 New York (UTC-5/-4)</option>
                    <option value="America/Los_Angeles">🇺🇸 Los Angeles (UTC-8/-7)</option>
                    <option value="Asia/Dubai">🇦🇪 Dubai (UTC+4)</option>
                    <option value="Asia/Tokyo">🇯🇵 Tokyo (UTC+9)</option>
                    <option value="UTC">🌐 UTC (UTC+0)</option>
                  </select>
                </div>
                <div className="relative group w-full sm:w-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-all duration-300" />
                  <Button type="submit" disabled={profileSaving} className="relative w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow">
                    {profileSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Kaydet
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Password Change Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-2 border-border/40 rounded-2xl shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-rose-50/50 to-pink-50/30 dark:from-rose-950/20 dark:to-pink-950/10 border-b border-border/40 p-5">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-200/30">
                  <Lock className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                Şifre Değiştir
              </CardTitle>
              <CardDescription>Hesabınızı güvende tutmak için şifrenizi güncelleyin.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Mevcut şifreniz"
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    className="rounded-xl"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Yeni şifrenizi tekrar girin"
                    className="rounded-xl"
                    required
                  />
                </div>
                <Button type="submit" disabled={passwordSaving} variant="outline" className="w-full sm:w-auto rounded-xl border-2 border-rose-200/50 dark:border-rose-500/30 hover:bg-rose-50/50 dark:hover:bg-rose-950/20">
                  {passwordSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                  Şifreyi Değiştir
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
}
