import { FileQuestion, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <Card className="w-full max-w-md rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="mx-auto p-4 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 w-16 h-16 flex items-center justify-center mb-6">
            <FileQuestion className="h-8 w-8 text-indigo-400" />
          </div>

          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            404
          </h2>
          <h3 className="text-lg font-semibold mb-2">Sayfa bulunamadi</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Aradiginiz sayfa mevcut degil veya tasindi.
          </p>

          <div className="flex gap-3 justify-center">
            <Link href="/">
              <Button
                variant="outline"
                className="rounded-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri Don
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 rounded-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Ana Sayfa
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
