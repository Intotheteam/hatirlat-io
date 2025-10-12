"use client"

import { useRouter } from "next/navigation"
import PremiumDashboard from "@/components/dashboard/premium-dashboard"
import type { View } from "@/types"

export default function DashboardPage() {
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

  return <PremiumDashboard onNavigate={handleNavigate} />
}