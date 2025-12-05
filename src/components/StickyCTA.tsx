"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StickyCTAProps {
  onOpenDemo: () => void
  onOpenRegister: () => void
}

export function StickyCTA({ onOpenDemo, onOpenRegister }: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 500px
      const shouldShow = window.scrollY > 500
      setIsVisible(shouldShow && !isDismissed)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isDismissed])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto max-w-4xl rounded-2xl border border-yellow-500/50 bg-black/95 backdrop-blur-lg shadow-[0_-4px_40px_#ffd70033] overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
          {/* Content */}
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 shadow-[0_0_20px_#ffd70066]">
              <Sparkles className="size-5 text-black" />
            </div>
            <div>
              <p className="text-sm font-bold text-yellow-300">
                Ready to protect your crypto?
              </p>
              <p className="text-xs text-gray-400">
                Start your free trial today — no credit card required
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={onOpenDemo}
              variant="outline"
              className="h-9 rounded-full border-yellow-500/50 px-4 text-sm text-yellow-300 hover:bg-yellow-500/10 hover:text-yellow-200"
            >
              Live Demo
            </Button>
            <Button
              onClick={onOpenRegister}
              className="h-9 rounded-full bg-yellow-500 px-4 text-sm text-black font-semibold hover:bg-yellow-400 shadow-[0_0_20px_#ffd70066]"
            >
              Get Started
              <ArrowRight className="size-4 ml-1" />
            </Button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-full text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="h-0.5 w-full bg-gradient-to-r from-yellow-500/0 via-yellow-400 to-yellow-500/0 animate-pulse" />
      </div>
    </div>
  )
}
