"use client"

import { useEffect } from "react"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App boundary error caught:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <NavBar />
      <main className="flex-1 flex items-center justify-center p-6 my-12">
        <div className="max-w-md w-full rounded-2xl border border-yellow-500/40 bg-black/80 backdrop-blur-xl p-8 text-center shadow-[0_0_40px_#ffd70033]">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
            Analysis Paused
          </h2>
          <p className="mt-2 text-sm text-gray-400 leading-relaxed">
            A temporary rendering glitch occurred during data processing. You can reload the section or return home.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => reset()}
              className="w-full sm:w-auto bg-yellow-500 text-black font-semibold hover:bg-yellow-400 shadow-[0_0_20px_#ffd70066]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="w-full sm:w-auto border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
