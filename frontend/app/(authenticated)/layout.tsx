"use client"

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { PremiumHeader } from "@/components/navigation/premium-header";
import { Toaster } from "@/components/ui/sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { View } from "@/types";

// Helper function to determine current view based on pathname
const getCurrentViewFromPath = (pathname: string): View => {
  if (pathname.includes('/schedules')) return 'schedules';
  if (pathname.includes('/groups')) return 'groups';
  return 'dashboard'; // default
};

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const currentView = getCurrentViewFromPath(pathname);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-background via-background to-accent/5">
        <PremiumHeader currentView={currentView} />
        <main className="flex flex-1 flex-col p-1 sm:p-2">{children}</main>
      </div>
    </>
  );
}