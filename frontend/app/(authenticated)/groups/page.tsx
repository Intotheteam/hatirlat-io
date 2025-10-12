"use client"

import { useRouter } from "next/navigation"
import GroupManagement from "@/components/group-management"
import type { View } from "@/types"

export default function GroupsPage() {
  const router = useRouter()

  const handleNavigate = (view: View, groupId?: string) => {
    if (view === "manage-members" && groupId) {
      router.push(`/groups/${groupId}/members`)
    } else {
      switch(view) {
        case "dashboard":
          router.push("/dashboard");
          break;
        case "schedules":
          router.push("/schedules");
          break;
        case "groups":
          router.push("/groups");
          break;
        default:
          router.push("/dashboard");
      }
    }
  }

  return <GroupManagement onNavigate={handleNavigate} />
}