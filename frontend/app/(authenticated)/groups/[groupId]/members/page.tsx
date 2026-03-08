"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import ManageMembers from "@/components/manage-members"

export default function ManageMembersPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params)
  const router = useRouter()

  return (
    <ManageMembers
      groupId={groupId}
      groupName="" // Pass an empty string, the component will fetch the name
      onNavigate={(view) => {
        switch (view) {
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
      }}
    />
  )
}
