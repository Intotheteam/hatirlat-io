"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trash2, UserPlus, ArrowLeft, Copy, RefreshCw } from "lucide-react"
import type { Member } from "@/core/domain/entities/member"
import { MemberRepository } from "@/services/repositories/MemberRepository"
import type { IMemberRepository } from "@/core/domain/repositories/IMemberRepository"
import { ApiError } from "@/services/api/apiError"
import { toast } from "sonner"

interface ManageMembersProps {
  groupId: string
  groupName: string
  onNavigate: (view: string) => void
}

export default function ManageMembers({ groupId, groupName, onNavigate }: ManageMembersProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)

  const memberRepository: IMemberRepository = useMemo(() => new MemberRepository(), [])

  const fetchMembers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedMembers = await memberRepository.getMembersByGroupId(groupId)
      setMembers(fetchedMembers)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Üyeler yüklenirken bir hata oluştu."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [groupId, memberRepository])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) {
      toast.warning("Lütfen bir e-posta adresi girin.")
      return
    }
    setIsInviting(true)
    try {
      const newMember = await memberRepository.addMemberToGroup(groupId, inviteEmail)
      setMembers((prev) => [...prev, newMember])
      setInviteEmail("")
      toast.success(`${newMember.email} başarıyla davet edildi.`)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Üye davet edilirken bir hata oluştu."
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
      toast.success("Üye başarıyla gruptan çıkarıldı.")
    } catch (err) {
      setMembers(originalMembers)
      const errorMessage = err instanceof ApiError ? err.message : "Üye çıkarılırken bir hata oluştu."
      toast.error(errorMessage)
    }
  }

  const inviteLink = `https://hatirlat.io/invite/${groupId}`

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
                <CardTitle className="text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {groupName}
                </CardTitle>
                <p className="text-xs text-muted-foreground">Manage and invite members</p>
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
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20">
                <UserPlus className="h-4 w-4 text-indigo-500" />
              </div>
              Invite via Email
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
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 rounded-full text-sm h-9"
              >
                {isInviting ? "Sending..." : "Send Invite"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
          <CardHeader className="pb-3 px-4 pt-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20">
                <Copy className="h-4 w-4 text-purple-500" />
              </div>
              Share Invite Link
            </h3>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              <Input value={inviteLink} readOnly className="rounded-xl h-9 text-sm" />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink)
                  toast.success("Link copied!")
                }}
                className="w-full rounded-full text-sm h-9"
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
        <CardHeader className="pb-3 px-4 pt-4 border-b border-border/40">
          <h3 className="text-sm font-semibold">Members ({members.length})</h3>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Loading members...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No members in this group yet.</p>
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
                      variant={member.role === "Admin" ? "default" : "secondary"}
                      className={`text-[10px] h-5 ${
                        member.role === "Admin"
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0"
                          : ""
                      }`}
                    >
                      {member.role}
                    </Badge>
                    <Badge
                      variant={member.status === "Active" ? "default" : "outline"}
                      className={`text-[10px] h-5 ${
                        member.status === "Active"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
                          : ""
                      }`}
                    >
                      {member.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                      className="h-7 w-7 rounded-full text-pink-500 hover:bg-pink-500/10 hover:text-pink-600"
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
