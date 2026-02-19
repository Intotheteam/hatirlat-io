"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Authenticated section error:", error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="mx-auto p-4 rounded-full bg-gradient-to-br from-orange-500/10 to-red-500/10 w-16 h-16 flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>

          <h2 className="text-xl font-bold mb-2">Sayfa yuklenemedi</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Bu sayfa yuklenirken bir hata olustu. Tekrar deneyebilir veya ana sayfaya donebilirsiniz.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-500/20 text-left">
              <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              onClick={reset}
              variant="outline"
              className="rounded-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tekrar Dene
            </Button>
            <Link href="/dashboard">
              <Button
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 rounded-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
