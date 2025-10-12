"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard"); // This will map to (authenticated)/dashboard/page.tsx
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return null; // This component will redirect, so no need to render anything
}