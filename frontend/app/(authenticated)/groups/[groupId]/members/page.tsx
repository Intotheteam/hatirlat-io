"use client"

import { useRouter } from "next/navigation"
import ManageMembers from "@/components/manage-members"

export default function ManageMembersPage({ params }: { params: { groupId: string } }) {
  const router = useRouter()

  return (
    <ManageMembers 
      groupId={params.groupId} 
      groupName="" // Pass an empty string, the component will fetch the name
      onNavigate={(view) => {
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
      }} 
    />
  )
}
