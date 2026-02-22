"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Trash2, UserPlus, ArrowLeft, Copy, RefreshCw } from "lucide-react"
import type { Member } from "@/core/domain/entities/member"
import { MemberRepository } from "@/services/repositories/MemberRepository"
import { IMemberRepository } from "@/core/domain/repositories/IMemberRepository"
import { ApiError } from "@/services/api/apiError"
import { apiManager } from "@/services/api/apiManager"
import type { Group } from "@/types"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/LanguageContext"

interface ManageMembersProps {
  groupId: string
  groupName: string
  onNavigate: (view: string) => void
}

export default function ManageMembers({ groupId, groupName, onNavigate }: ManageMembersProps) {
  const { t } = useLanguage()
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [groupDetails, setGroupDetails] = useState<Group | null>(null)

  const memberRepository: IMemberRepository = useMemo(() => new MemberRepository(), [])

  const fetchMembers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedMembers = await memberRepository.getMembersByGroupId(groupId)
      setMembers(fetchedMembers)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : t("members.fetch_error")
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [groupId, memberRepository])

  const fetchGroupDetails = useCallback(async () => {
    try {
      const g = await apiManager.getGroupById(groupId)
      setGroupDetails(g)
    } catch (err) {
      console.error("Failed to fetch group details", err)
    }
  }, [groupId])

  useEffect(() => {
    fetchMembers()
    fetchGroupDetails()
  }, [fetchMembers, fetchGroupDetails])

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) {
      toast.warning(t("members.empty_email"))
      return
    }
    setIsInviting(true)
    try {
      const newMember = await memberRepository.addMemberToGroup(groupId, inviteEmail)
      setMembers((prev) => [...prev, newMember])
      setInviteEmail("")
      toast.success(t("members.invited_success", { email: newMember.email }))
      toast.success(t("members.invited_success", { email: newMember.email }))
    } catch (err: any) {
      let errorMessage = t("members.invite_error")

      if (err instanceof ApiError || (err && err.status)) {
        if (err.status === 403) {
          errorMessage = t("members.group_full")
        } else if (err.status === 429) {
          errorMessage = t("members.rate_limit_exceeded")
        } else {
          errorMessage = err.message
        }
      }
      toast.error(errorMessage)
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    const originalMembers = [...members]
    setMembers((prev) => prev.filter((m) => m.id !== memberId))
    try {
      await memberRepository.removeMemberFromGroup(groupId, memberId)
      toast.success(t("members.removed_success"))
    } catch (err) {
      setMembers(originalMembers)
      const errorMessage = err instanceof ApiError ? err.message : t("members.remove_error")
      toast.error(errorMessage)
    }
  }

  const handleToggleStatus = async (memberId: string) => {
    const memberToUpdate = members.find((m) => m.id === memberId)
    if (!memberToUpdate) return

    // Optimistic UI update
    const originalMembers = [...members]
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const newStatus = m.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
          return { ...m, status: newStatus }
        }
        return m
      })
    )

    try {
      await memberRepository.toggleMemberStatus(groupId, memberId)
      toast.success(t("members.status_updated_success"))
    } catch (err) {
      setMembers(originalMembers)
      const errorMessage = err instanceof ApiError ? err.message : t("members.status_error")
      toast.error(errorMessage)
    }
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://hatirlat.io"
  const inviteLink = `${baseUrl}/invite/${groupDetails?.inviteCode || groupId}`

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/20 shadow-md dark:shadow-sm">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onNavigate("groups")}
                className="h-9 w-9 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {groupName}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{t("members.subtitle")}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchMembers}
              disabled={isLoading}
              className="h-9 w-9 rounded-full"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Invite Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
          <CardHeader className="pb-3 px-4 pt-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <UserPlus className="h-4 w-4 text-primary" />
              </div>
              {t("members.invite_email")}
            </h3>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <form onSubmit={handleInviteMember} className="space-y-2">
              <Input
                type="email"
                placeholder="example@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={isInviting}
                className="rounded-xl h-9 text-sm"
              />
              <Button
                type="submit"
                disabled={isInviting || !inviteEmail}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0 rounded-full text-sm h-9"
              >
                {isInviting ? t("members.sending") : t("members.send_invite")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
          <CardHeader className="pb-3 px-4 pt-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-secondary/10 border border-secondary/20">
                <Copy className="h-4 w-4 text-secondary" />
              </div>
              {t("members.share_link")}
            </h3>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              <Input value={inviteLink} readOnly className="rounded-xl h-9 text-sm" />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink)
                  toast.success(t("members.link_copied"))
                }}
                className="w-full rounded-full text-sm h-9"
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                {t("members.copy_link")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
        <CardHeader className="pb-3 px-4 pt-4 border-b border-border/40">
          <h3 className="text-sm font-semibold">{t("members.members_count", { count: members.length })}</h3>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">{t("members.loading")}</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">{t("members.no_members")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-indigo-200/50 dark:border-border/40 bg-gradient-to-br from-background to-accent/10 hover:shadow-sm hover:border-indigo-200/70 dark:hover:border-border/60 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-9 w-9 border border-indigo-200/40 dark:border-indigo-500/20">
                      <AvatarImage src={`/placeholder-user.jpg`} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 text-sm">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={member.role === "ADMIN" ? "default" : "secondary"}
                      className={`text-xs h-5 ${member.role === "ADMIN"
                        ? "bg-primary text-primary-foreground border-0"
                        : ""
                        }`}
                    >
                      {member.role === "ADMIN" ? t("members.role_admin") : t("members.role_member")}
                    </Badge>
                    <div className="flex flex-col items-center justify-center gap-1 mx-2">
                      <span className={`text-[10px] font-medium uppercase tracking-wider ${member.status === "ACTIVE" ? "text-green-600 dark:text-green-400" : member.status === "PENDING" ? "text-amber-500" : "text-muted-foreground"}`}>
                        {member.status === "ACTIVE" ? t("members.status_active") : member.status === "PENDING" ? t("members.status_pending") : t("members.status_inactive")}
                      </span>
                      <Switch
                        checked={member.status === "ACTIVE"}
                        onCheckedChange={() => handleToggleStatus(member.id)}
                        aria-label="Toggle member status"
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-700 h-4 w-8 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-4"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                      className="h-7 w-7 rounded-full"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
