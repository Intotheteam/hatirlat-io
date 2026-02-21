"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard"
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
          <Card className="w-full max-w-md rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="mx-auto p-4 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 w-16 h-16 flex items-center justify-center mb-6">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>

              <h2 className="text-xl font-bold mb-2">Bir hata olustu</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Beklenmeyen bir hata meydana geldi. Sayfayi yenilemeyi deneyin veya ana sayfaya donun.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-500/20 text-left">
                  <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-500 cursor-pointer">Stack trace</summary>
                      <pre className="text-xs font-mono text-red-500/80 mt-1 overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="rounded-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tekrar Dene
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 rounded-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ana Sayfa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
