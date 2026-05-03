"use client"

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { PremiumHeader } from "@/components/navigation/premium-header";
import { Toaster } from "@/components/ui/sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/error-boundary";
import OnboardingModal from "@/components/onboarding-modal";
import type { View } from "@/types";

// Helper function to determine current view based on pathname
const getCurrentViewFromPath = (pathname: string): View => {
  if (pathname.includes('/schedules')) return 'schedules';
  if (pathname.includes('/groups')) return 'groups';
  return 'dashboard'; // default
};

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const currentView = getCurrentViewFromPath(pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div suppressHydrationWarning className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Toaster position="top-center" richColors />
      <OnboardingModal />
      <div suppressHydrationWarning className="flex min-h-screen w-full flex-col bg-gradient-to-br from-background via-background to-accent/5">
        <PremiumHeader currentView={currentView} />
        <main className="flex flex-1 flex-col p-1 sm:p-2">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  );
}