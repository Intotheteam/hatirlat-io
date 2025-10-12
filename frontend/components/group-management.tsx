"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Users, Plus, Link, Copy, UserPlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiManager } from "@/services/api/apiManager"
import type { View } from "@/types"

interface Group {
  id: string
  name: string
  description: string
  memberCount: number
  inviteLink: string
  createdAt: string
}

interface GroupManagementProps {
  onNavigate: (view: View, groupId?: string) => void
}

export default function GroupManagement({ onNavigate }: GroupManagementProps) {
  const [groups, setGroups] = useState<Group[]>([])
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
          title: "Error",
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
        memberCount: 1, // Creator
        inviteLink: "", // Will be set by the backend
        createdAt: new Date().toISOString().split("T")[0],
      })

      // Update the local state with the created group
      setGroups((prev) => [response, ...prev])
      setNewGroup({ name: "", description: "" })
      setShowCreateForm(false)

      toast({
        title: "Group Created",
        description: "Your group has been created successfully",
      })
    } catch (error) {
      console.error("Failed to create group:", error)
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyInviteLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast({
      title: "Link Copied",
      description: "Invite link copied to clipboard",
    })
  }

  const deleteGroup = async (groupId: string) => {
    try {
      // Call the actual API to delete group
      await apiManager.deleteGroup(groupId)

      // Update the local state to remove the group
      setGroups((prev) => prev.filter((g) => g.id !== groupId))
      
      toast({
        title: "Group Deleted",
        description: "Group has been deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete group:", error)
      toast({
        title: "Error",
        description: "Failed to delete group. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Compact Header with Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Header Card */}
        <Card className="lg:col-span-5 rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/20 shadow-md dark:shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Group Manager
                </h1>
                <p className="text-xs text-muted-foreground mt-1">Organize and manage your notification groups</p>
              </div>
              <Button
                onClick={() => setShowCreateForm(true)}
                size="sm"
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-md rounded-full"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="lg:col-span-7 grid grid-cols-3 gap-3">
          <Card className="rounded-2xl border-2 border-indigo-200/60 dark:border-border/40 bg-gradient-to-br from-background to-indigo-50/30 dark:to-indigo-950/10 shadow-md dark:shadow-sm">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Groups</p>
                <p className="text-lg font-bold">{groups.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-purple-200/60 dark:border-border/40 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/10 shadow-md dark:shadow-sm">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Members</p>
                <p className="text-lg font-bold">{groups.reduce((acc, g) => acc + g.memberCount, 0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-pink-200/60 dark:border-border/40 bg-gradient-to-br from-background to-pink-50/30 dark:to-pink-950/10 shadow-md dark:shadow-sm">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Avg Size</p>
                <p className="text-lg font-bold">
                  {groups.length > 0 ? Math.round(groups.reduce((acc, g) => acc + g.memberCount, 0) / groups.length) : 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Group Form */}
      {showCreateForm && (
        <Card className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              Create New Group
            </CardTitle>
            <CardDescription className="text-xs">
              Set up a new notification group for your contacts
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Group Name</label>
                <Input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Family, Work Team"
                  required
                  className="rounded-xl h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                <Input
                  type="text"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the group"
                  className="rounded-xl h-9 text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 rounded-full text-sm h-9"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Group"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-full text-sm h-9"
                >
                  Cancel
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
              <span className="text-sm text-muted-foreground">Loading groups...</span>
            </div>
          </div>
        ) : groups.length === 0 && !showCreateForm ? (
          <Card className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
            <CardContent className="text-center py-12">
              <div className="mx-auto p-3 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 w-14 h-14 flex items-center justify-center mb-3">
                <Users className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold mb-1">No Groups Yet</h3>
              <p className="text-xs text-muted-foreground mb-4">Create your first group to start inviting contacts</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-md rounded-full text-sm h-9"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Create First Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          groups.map((group) => (
            <Card key={group.id} className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm hover:shadow-lg dark:hover:shadow-md transition-all">
              <CardHeader className="pb-3 px-4 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-500/20 shrink-0">
                      <Users className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold truncate">{group.name}</CardTitle>
                      <CardDescription className="text-xs truncate mt-0.5">{group.description}</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteGroup(group.id)}
                    className="h-7 w-7 shrink-0 text-pink-500 hover:bg-pink-500/10 hover:text-pink-600 rounded-full"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {/* Stats */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{group.memberCount} members</span>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Invite Link */}
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/50 dark:border-border/20">
                  <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 mb-1.5">
                    <Link className="h-3 w-3" />
                    Invite Link
                  </label>
                  <div className="flex gap-1.5">
                    <Input
                      type="text"
                      value={group.inviteLink}
                      readOnly
                      className="text-xs h-7 rounded-lg bg-background/50"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyInviteLink(group.inviteLink)}
                      className="h-7 w-7 shrink-0 rounded-lg"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate("manage-members", group.id)}
                    className="flex-1 rounded-full h-8 text-xs"
                  >
                    <UserPlus className="h-3 w-3 mr-1.5" />
                    Members
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteLink(group.inviteLink)}
                    className="flex-1 rounded-full h-8 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1.5" />
                    Copy
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
