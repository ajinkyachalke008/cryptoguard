"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Monitor, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function InstallButton({ variant = "default", className = "" }: { variant?: "default" | "outline", className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already in standalone app mode
    if (typeof window !== "undefined") {
      const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
      setIsStandalone(isStandaloneMode)
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null)
      setIsStandalone(true)
      toast.success("CryptoGuard installed successfully!")
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isStandalone) {
      toast.success("CryptoGuard is already installed and running as a native app.")
      return
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === "accepted") {
          toast.success("Installing CryptoGuard to your device...")
        } else {
          toast.info("Installation dismissed.")
        }
        setDeferredPrompt(null)
      } catch (err) {
        console.error("Install prompt error:", err)
      }
      return
    }

    // If deferredPrompt hasn't captured yet, provide browser-specific guidance:
    const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.userAgent)
    const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isChrome = typeof navigator !== "undefined" && /Chrome/i.test(navigator.userAgent)

    if (isIOS) {
      toast.info("To install on iOS: Tap the Share button (⬆️) at bottom, then tap 'Add to Home Screen' (+)")
    } else if (isChrome) {
      toast.info("Look for the ( 📥 Install ) icon on the right side of Chrome's URL bar, or click Chrome Menu (⋮) > 'Save and share' > 'Install CryptoGuard'.", {
        duration: 6000
      })
    } else {
      toast.info("To install: Click your browser's menu (⋮) and select 'Install CryptoGuard' or 'Add to Home Screen'.", {
        duration: 6000
      })
    }
  }

  if (isStandalone) {
    return (
      <div className="flex flex-col gap-1 w-full">
        <Button 
          disabled
          variant="outline"
          className={`border-green-500/40 text-green-400 bg-green-500/10 ${className}`}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          App Installed
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <Button 
        onClick={handleInstallClick}
        className={`${variant === "default" ? "bg-yellow-500 text-black hover:bg-yellow-400 font-bold shadow-[0_0_15px_rgba(255,215,0,0.3)]" : "border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20 font-bold"} ${className}`}
      >
        <Monitor className="w-4 h-4 mr-2" />
        Install PC / Mobile App
      </Button>
      <p className="text-[10px] text-center text-gray-400 font-mono">PWA Native Standalone • No Store Required</p>
    </div>
  )
}
