"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Users, Plus, Link, Copy, UserPlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiManager } from "@/services/api/apiManager"
import { useLanguage } from "@/contexts/LanguageContext"
import type { View } from "@/types"

interface GroupData {
  id: string
  name: string
  description?: string
  memberCount?: number
  createdAt?: string
  inviteCode?: string
}

function getInviteLink(inviteCode: string): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://hatirlat.io"
  return `${baseUrl}/invite/${inviteCode}`
}

interface GroupManagementProps {
  onNavigate: (view: View, groupId?: string) => void
}

export default function GroupManagement({ onNavigate }: GroupManagementProps) {
  const { t } = useLanguage()
  const [groups, setGroups] = useState<GroupData[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(true)
  const { toast } = useToast()

  // Fetch groups when component mounts
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const fetchedGroups = await apiManager.getGroups()
        setGroups(fetchedGroups)
      } catch (error) {
        console.error("Failed to fetch groups:", error)
        toast({
          title: t("common.error"),
          description: "Failed to load groups. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingGroups(false)
      }
    }

    fetchGroups()
  }, [])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: "", description: "" })
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Call the actual API to create group
      const response = await apiManager.createGroup({
        name: newGroup.name,
        description: newGroup.description,
      })

      // Update the local state with the created group
      setGroups((prev) => [response, ...prev])
      setNewGroup({ name: "", description: "" })
      setShowCreateForm(false)

      toast({
        title: t("common.success"),
        description: "Grup başarıyla oluşturuldu",
      })
    } catch (error) {
      console.error("Failed to create group:", error)
      toast({
        title: t("common.error"),
        description: "Grup oluşturulamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyInviteLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast({
      title: t("manage_groups.copied"),
      description: "Davet bağlantısı panoya kopyalandı",
    })
  }

  const deleteGroup = async (groupId: string) => {
    try {
      // Call the actual API to delete group
      await apiManager.deleteGroup(groupId)

      // Update the local state to remove the group
      setGroups((prev) => prev.filter((g) => g.id !== groupId))

      toast({
        title: t("common.success"),
        description: "Grup başarıyla silindi",
      })
    } catch (error) {
      console.error("Failed to delete group:", error)
      toast({
        title: t("common.error"),
        description: "Grup silinemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Compact Header with Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Header Card */}
        <Card className="lg:col-span-5 rounded-xl border bg-card text-card-foreground shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-xl font-bold tracking-tight">
                  {t("manage_groups.title")}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">{t("manage_groups.subtitle")}</p>
              </div>
              <Button
                onClick={() => setShowCreateForm(true)}
                size="sm"
                className="rounded-full shadow-sm"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                {t("dashboard.create_new")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="lg:col-span-7 grid grid-cols-3 gap-3">
          <Card className="rounded-xl border bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">{t("manage_groups.total_groups")}</p>
                <p className="text-2xl font-bold">{groups.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">{t("manage_groups.total_members")}</p>
                <p className="text-2xl font-bold">{groups.reduce((acc, g) => acc + (g.memberCount || 0), 0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">{t("manage_groups.avg_members")}</p>
                <p className="text-2xl font-bold">
                  {groups.length > 0 ? Math.round(groups.reduce((acc, g) => acc + (g.memberCount || 0), 0) / groups.length) : 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Group Form */}
      {showCreateForm && (
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardHeader className="pb-3 px-4 pt-4 border-b">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t("manage_groups.create_group")}
            </CardTitle>
            <CardDescription className="text-sm">
              Kişileriniz için yeni bir bildirim grubu ayarlayın
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pt-4 pb-5">
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("manage_groups.group_name")}</label>
                <Input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={t("manage_groups.group_name_placeholder")}
                  required
                  className="rounded-lg h-10 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("manage_groups.description")}</label>
                <Input
                  type="text"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder={t("manage_groups.description_placeholder")}
                  className="rounded-lg h-10 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="rounded-full shadow-sm text-sm h-10 px-6"
                  disabled={isLoading}
                >
                  {isLoading ? t("common.loading") : t("manage_groups.submit_create")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-full text-sm h-10 px-6"
                >
                  {t("manage_groups.back")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoadingGroups ? (
          <div className="col-span-full flex justify-center items-center py-10">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
              <span className="text-sm text-muted-foreground">{t("common.loading")}</span>
            </div>
          </div>
        ) : groups.length === 0 && !showCreateForm ? (
          <Card className="col-span-full rounded-xl border bg-card shadow-sm">
            <CardContent className="text-center py-16">
              <div className="mx-auto p-4 rounded-full bg-accent/50 w-16 h-16 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1 text-foreground">{t("manage_groups.no_groups")}</h3>
              <p className="text-sm text-muted-foreground mb-2 max-w-sm mx-auto">
                {t("manage_groups.no_groups_desc")}
              </p>
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground mb-6 mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-foreground">1</span>
                  <span>{t("manage_groups.step_1")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-foreground">2</span>
                  <span>{t("manage_groups.step_2")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-foreground">3</span>
                  <span>{t("manage_groups.step_3")}</span>
                </div>
              </div>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="rounded-full shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                {t("manage_groups.first_group")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          groups.map((group) => (
            <Card key={group.id} className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-3 px-5 pt-5 border-b">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold truncate">{group.name}</CardTitle>
                      <CardDescription className="text-sm truncate mt-1">{group.description}</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteGroup(group.id)}
                    className="h-8 w-8 shrink-0 rounded-full"
                    title={t("manage_groups.delete_group")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4 pt-4">
                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{group.memberCount} {t("manage_groups.members")}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(group.createdAt || new Date()).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Invite Link */}
                <div className="p-3 rounded-lg bg-accent/20 border border-border">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Link className="h-3.5 w-3.5" />
                    {t("manage_groups.invite_link")}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={getInviteLink(group.inviteCode || group.id)}
                      readOnly
                      className="text-sm h-9 rounded-lg bg-background"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyInviteLink(getInviteLink(group.inviteCode || group.id))}
                      className="h-9 w-9 shrink-0 rounded-lg"
                      title={t("manage_groups.copy")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate("manage-members", group.id)}
                    className="flex-1 rounded-lg h-9 text-sm font-medium"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t("manage_groups.manage_members")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteLink(getInviteLink(group.inviteCode || group.id))}
                    className="flex-1 rounded-lg h-9 text-sm font-medium"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {t("manage_groups.copy")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
